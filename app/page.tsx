"use client";

import katex from "katex";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CARD_INDEX } from "../constants/cards";

const KATEX_OPTS = { throwOnError: false } as const;

function renderKatexHtml(tex: string, displayMode: boolean) {
  return katex.renderToString(tex, { ...KATEX_OPTS, displayMode });
}

/** Reusable class strings — change layout / chrome in one place */
const spread = {
  main: "flex min-h-screen flex-col px-4 py-6 transition-[background,color] duration-300 sm:px-6 sm:py-8 lg:box-border lg:min-h-0 lg:h-[100dvh] lg:overflow-hidden lg:px-6 lg:py-6",
  shell: "mx-auto flex w-full min-h-0 max-w-7xl flex-1 flex-col gap-5 max-lg:min-h-0 lg:min-h-0 lg:max-h-full lg:flex-row",
  rail:
    "spread-outer w-full shrink-0 rounded-2xl border p-5 supports-[backdrop-filter]:backdrop-blur-sm lg:w-[20rem] lg:max-w-[20rem] lg:supports-[backdrop-filter]:backdrop-blur-md transition-colors duration-300",
  canvas:
    "spread-outer w-full min-w-0 overflow-x-hidden rounded-2xl border px-4 py-6 supports-[backdrop-filter]:backdrop-blur-sm lg:supports-[backdrop-filter]:backdrop-blur-md transition-colors duration-300 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain",
  worldCard:
    "spread-inner spread-panel spread-panel-fade w-full max-w-md rounded-xl border p-3 transition-colors duration-300",
  worldLabel: "spread-world-label mb-3 text-center text-xs font-medium tracking-[0.12em]",
  title: "spread-title whitespace-nowrap text-xl font-semibold tracking-wide sm:text-2xl",
  modalOverlay: "fixed inset-0 flex items-center justify-center bg-black/90 p-4",
  modalZHelp: "z-[60]",
  modalZCard: "z-[70]",
  modalSheet: "spread-outer w-full max-w-md rounded-2xl border p-4",
  modalSheetWide: "spread-outer w-full max-w-2xl rounded-2xl border p-4",
  helpIcon: "spread-btn-ghost inline-flex h-5 w-5 items-center justify-center rounded-full p-0 text-[11px] leading-none",
  modalClose: "spread-btn-ghost rounded-full px-2 py-1 text-xs",
  floatWrap: "fixed bottom-4 right-4 z-50 flex flex-wrap items-stretch justify-end gap-3 lg:hidden",
  floatNext:
    "spread-float-next min-h-[52px] min-w-[9rem] rounded-full px-5 py-3 text-sm font-semibold supports-[backdrop-filter]:backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-40",
  floatReset:
    "spread-float-reset min-h-[52px] min-w-[9rem] rounded-full px-5 py-3 text-sm font-semibold supports-[backdrop-filter]:backdrop-blur-sm transition",
  controlGrid: "mt-3 grid w-full grid-cols-2 gap-2",
  drawBtn: "spread-btn-go min-w-0 max-w-full rounded-full px-2 py-2 text-center text-xs font-medium backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-40",
  resetBtn: "spread-btn-ghost min-w-0 max-w-full rounded-full px-2 py-2 text-center text-xs font-medium transition",
  modalHeader: "flex items-start justify-between gap-4"
} as const;

type Card = {
  id: string;
  name: string;
  image: string;
  note?: string;
};

type Layer = {
  key: string;
  title: string;
  meaning: string;
  drawCount: number;
  pool: Card[];
  triad: [string, string, string];
};

const ACES: Card[] = [
  { id: "ace-wands", name: "Ace of Wands", image: "/images/ace-of-wands.png" },
  { id: "ace-cups", name: "Ace of Cups", image: "/images/ace-of-cups.png" },
  { id: "ace-swords", name: "Ace of Swords", image: "/images/ace-of-swords.png" },
  { id: "ace-disks", name: "Ace of Disks", image: "/images/ace-of-disks.png" }
];

const PRINCESSES: Card[] = [
  { id: "princess-wands", name: "Princess of Wands", image: "/images/princess-of-wands.png" },
  { id: "princess-cups", name: "Princess of Cups", image: "/images/princess-of-cups.png" },
  { id: "princess-swords", name: "Princess of Swords", image: "/images/princess-of-swords.png" },
  { id: "princess-disks", name: "Princess of Disks", image: "/images/princess-of-disks.png" }
];

const AGENTS: Card[] = [
  "wands",
  "cups",
  "swords",
  "disks"
].flatMap((suit) => [
  { id: `knight-${suit}`, name: `Knight of ${cap(suit)}`, image: `/images/knight-of-${suit}.png` },
  { id: `queen-${suit}`, name: `Queen of ${cap(suit)}`, image: `/images/queen-of-${suit}.png` },
  { id: `prince-${suit}`, name: `Prince of ${cap(suit)}`, image: `/images/prince-of-${suit}.png` }
]);

const DESTINY: Card[] = [
  { id: "aries-emperor", name: "Aries · IV · The Emperor", image: "/images/the-emperor.png" },
  { id: "taurus-hierophant", name: "Taurus · V · The Hierophant", image: "/images/the-hierophant.png" },
  { id: "gemini-lovers", name: "Gemini · VI · The Lovers", image: "/images/the-lovers.png" },
  { id: "cancer-chariot", name: "Cancer · VII · The Chariot", image: "/images/the-chariot.png" },
  { id: "leo-lust", name: "Leo · XI · Lust", image: "/images/lust.png" },
  { id: "virgo-hermit", name: "Virgo · IX · The Hermit", image: "/images/the-hermit.png" },
  { id: "libra-adjustment", name: "Libra · VIII · Adjustment", image: "/images/adjustment.png" },
  { id: "scorpio-death", name: "Scorpio · XIII · Death", image: "/images/death.png" },
  { id: "sagittarius-art", name: "Sagittarius · XIV · Art", image: "/images/art.png" },
  { id: "capricorn-devil", name: "Capricorn · XV · The Devil", image: "/images/the-devil.png" },
  { id: "aquarius-star", name: "Aquarius · XVII · The Star", image: "/images/the-star.png" },
  { id: "pisces-moon", name: "Pisces · XVIII · The Moon", image: "/images/the-moon.png" }
];

const EVENTS: Card[] = [2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((num) =>
  ["wands", "cups", "swords", "disks"].map((suit) => ({
    id: `${num}-${suit}`,
    name: `${num} of ${cap(suit)}`,
    image: `/images/${num}-of-${suit}.png`
  }))
);

const FOCUS: Card[] = [
  { id: "sun", name: "Sun · XIX · The Sun", image: "/images/the-sun.png" },
  { id: "moon", name: "Moon · II · The High Priestess", image: "/images/the-priestess.png" },
  { id: "mercury", name: "Mercury · I · The Magus", image: "/images/the-magus.png" },
  { id: "venus", name: "Venus · III · The Empress", image: "/images/the-empress.png" },
  { id: "mars", name: "Mars · XVI · The Tower", image: "/images/the-tower.png" },
  { id: "jupiter", name: "Jupiter · X · Fortune", image: "/images/fortune.png" },
  { id: "saturn", name: "Saturn · XXI · The Universe", image: "/images/the-universe.png" },
  { id: "uranus", name: "Uranus · 0 · The Fool", image: "/images/the-fool.png" },
  { id: "neptune", name: "Neptune · XII · The Hanged Man", image: "/images/the-hanged-man.png" },
  { id: "pluto", name: "Pluto · XX · The Aeon", image: "/images/the-aeon.png" }
];

const LAYERS: Layer[] = [
  {
    key: "root",
    title: "第1層 Root",
    meaning: "物語の種・根源的な意志・季節",
    drawCount: 1,
    pool: ACES,
    triad: ["Will", "Intent", "Spark"]
  },
  {
    key: "womb",
    title: "第2層 Womb",
    meaning: "舞台設定・具現化の土壌",
    drawCount: 2,
    pool: PRINCESSES,
    triad: ["Stage", "Domain", "Matrix"]
  },
  {
    key: "agents",
    title: "第3層 Agents",
    meaning: "動因となる2つの人格",
    drawCount: 2,
    pool: AGENTS,
    triad: ["Actors", "Agents", "Duality"]
  },
  {
    key: "destiny",
    title: "第4層 Destiny",
    meaning: "避けられない運命の潮流",
    drawCount: 1,
    pool: DESTINY,
    triad: ["Fate", "Ordinance", "Law"]
  },
  {
    key: "events",
    title: "第5層 Events",
    meaning: "出来事の推移（過去・現在・未来）",
    drawCount: 3,
    pool: EVENTS,
    triad: ["Tales", "Events", "Sequences"]
  },
  {
    key: "focus",
    title: "第6層 Focus",
    meaning: "物語を読む最終的な視点",
    drawCount: 1,
    pool: FOCUS,
    triad: ["Gaze", "Vision", "Perspective"]
  }
];

/** L1 (top, Atziluth) → L6 (bottom, Assiah) — emantion downward on screen */
const REVEAL_ATZILUTH_TO_ASSIAH: number[] = [0, 1, 2, 3, 4, 5];
/** L6 (Assiah) → L1 (Atziluth) — return upward on screen */
const REVEAL_ASSIAH_TO_ATZILUTH: number[] = [5, 4, 3, 2, 1, 0];

const GLOBAL_LOGIC_EQUATION =
  "\\mathrm{Result} = \\mathcal{G} \\circ \\mathcal{T} \\circ \\mathcal{F} \\circ \\mathcal{A} \\circ \\mathcal{S}(W)";

const LAYER_HELP: Record<Layer["key"], { title: string; body: string; formula?: string }> = {
  root: {
    title: "Will — Intent — Spark",
    body: "Atziluth / Kether.\nOne Ace card.\nA singularity that sets the primal polarity of the entire spread.",
    formula: "\\vec{V}_{seed} = \\mathrm{Ace}_{element}"
  },
  womb: {
    title: "Stage — Domain — Matrix",
    body: "Atziluth / Chokmah & Binah.\nTwo Princess cards.\nDefines the field and constraints as boundary conditions.\nForms the two pillars (Severity / Mercy).",
    formula: "\\mathcal{S}(W) = \\{P_{left},\\,P_{right}\\}"
  },
  agents: {
    title: "Actors — Agents — Duality",
    body: "Briah / Chesed & Geburah.\nTwo Court cards (Knight/Queen/Prince).\nInjects dynamic forces into the system.",
    formula: "\\mathcal{A} = \\sum_{i=1}^{2}(\\mathrm{Court}_i \\times \\mathrm{Vector}_i)"
  },
  destiny: {
    title: "Fate — Ordinance — Law",
    body: "Briah / Tiphareth.\nOne zodiac-linked Major Arcana card.\nA fixed system protocol that governs the whole.",
    formula: "\\mathcal{F} = \\mathrm{Const}(\\mathrm{Zodiac})"
  },
  events: {
    title: "Tales — Events — Sequences",
    body: "Yetzirah / Netzach, Hod, Yesod.\nThree small cards.\nTime-series projection into concrete unfolding.",
    formula: "\\mathcal{T} = \\{\\mathrm{Netzach},\\,\\mathrm{Hod},\\,\\mathrm{Yesod}\\}"
  },
  focus: {
    title: "Gaze — Vision — Perspective",
    body: "Assiah / Malkuth.\nOne planet-linked Major Arcana card.\nFinal observation in the material plane.",
    formula: "\\mathcal{G} = \\int \\mathcal{T}\\,dt \\rightarrow \\mathrm{Planet}"
  }
};

const LAYERS_BY_KEY = Object.fromEntries(LAYERS.map((layer) => [layer.key, layer])) as Record<Layer["key"], Layer>;

function LatexInline({ tex }: { tex: string }) {
  const html = useMemo(() => renderKatexHtml(tex, false), [tex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function LatexBlock({ tex }: { tex: string }) {
  const html = useMemo(() => renderKatexHtml(tex, true), [tex]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderTriadWithOperator(layer: Layer) {
  const [first] = layer.triad;
  const initial = first.charAt(0).toUpperCase();
  const text = `(${first})`;

  return (
    <span className="inline-flex items-center gap-1">
      <LatexInline tex={`\\mathcal{${initial}}`} />
      <span>{text}</span>
    </span>
  );
}

function HelpIconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={spread.helpIcon}>
      ?
    </button>
  );
}

function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={spread.modalClose}>
      Close
    </button>
  );
}

function SpreadDialog({
  "aria-label": ariaLabel,
  z,
  maxWidth,
  onClose,
  children
}: {
  "aria-label": string;
  z: "help" | "card";
  maxWidth: "md" | "wide";
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={`${spread.modalOverlay} ${z === "help" ? spread.modalZHelp : spread.modalZCard}`}
      onClick={onClose}
    >
      <div
        className={maxWidth === "wide" ? spread.modalSheetWide : spread.modalSheet}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function drawUnique(pool: Card[], count: number): Card[] {
  // Partial Fisher-Yates: unbiased and avoids full sort cost.
  const cloned = [...pool];
  const max = Math.min(count, cloned.length);
  for (let i = 0; i < max; i += 1) {
    const j = i + Math.floor(Math.random() * (cloned.length - i));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned.slice(0, max);
}

function preloadImageUrls(urls: string[]) {
  for (const src of urls) {
    const im = new Image();
    im.src = src;
  }
}

function RevealedCardButton({
  card,
  cardBackSrc,
  onOpen
}: {
  card: Card;
  cardBackSrc: string;
  onOpen: () => void;
}) {
  const [faceReady, setFaceReady] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative block h-full w-full min-h-0 overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
      aria-label={`Open details for ${card.name}`}
    >
      <img
        src={cardBackSrc}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
        draggable={false}
        aria-hidden
      />
      <img
        src={card.image}
        alt={card.name}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-200 ease-out ${
          faceReady ? "opacity-100" : "opacity-0"
        }`}
        loading="eager"
        decoding="async"
        draggable={false}
        onLoad={() => setFaceReady(true)}
        onError={() => setFaceReady(true)}
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) {
            setFaceReady(true);
          }
        }}
      />
    </button>
  );
}

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const SIGN_SYMBOL: Record<string, string> = {
  Aries: "♈︎",
  Taurus: "♉︎",
  Gemini: "♊︎",
  Cancer: "♋︎",
  Leo: "♌︎",
  Virgo: "♍︎",
  Libra: "♎︎",
  Scorpio: "♏︎",
  Sagittarius: "♐︎",
  Capricorn: "♑︎",
  Aquarius: "♒︎",
  Pisces: "♓︎"
};

const PLANET_SYMBOL: Record<string, string> = {
  Sun: "☉",
  Moon: "☾",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇"
};

const ELEMENT_SYMBOL: Record<string, string> = {
  Fire: "🜂",
  Water: "🜄",
  Air: "🜁",
  Earth: "🜃"
};

function symbolizePlanetValue(value: string): string {
  return value
    .replace(/[☉☾☿♀♂♃♄♅♆♇]\s*/g, "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const symbol = PLANET_SYMBOL[part];
      return symbol ? `${symbol} ${part}` : part;
    })
    .join(" / ");
}

function symbolizeSignValue(value: string): string {
  return value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const symbol = SIGN_SYMBOL[part];
      return symbol ? `${symbol} ${part}` : part;
    })
    .join(" / ");
}

function formatElementLabel(value: string): string {
  const symbol = ELEMENT_SYMBOL[value];
  return symbol ? `${symbol} ${value}` : value;
}

function formatElementLine(elementalAttribution: string | null, astrologyElement: string | null): string | null {
  if (elementalAttribution) {
    return elementalAttribution
      .split(" of ")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => formatElementLabel(part))
      .join(" of ");
  }
  if (astrologyElement) {
    return formatElementLabel(astrologyElement);
  }
  return null;
}

function symbolizeSpan(decanRange: string, sign: string | null): string {
  const hasSignText = /[A-Za-z]/.test(decanRange);
  if (hasSignText) {
    const signs = Object.keys(SIGN_SYMBOL);
    let normalized = decanRange;
    signs.forEach((s) => {
      const regex = new RegExp(`\\b${s}\\b`, "g");
      normalized = normalized.replace(regex, SIGN_SYMBOL[s]);
    });
    return normalized;
  }
  if (sign) {
    return `${symbolizeSignValue(sign)} ${decanRange}`;
  }
  return decanRange;
}

export default function Page() {
  const [step, setStep] = useState(0);
  const [drawn, setDrawn] = useState<Record<string, Card[]>>({});
  /** true = descending: first reveal = Layer 1 (Atziluth, top) … last = Layer 6 (Assiah, bottom) */
  const [revealAtziluthToAssiah, setRevealAtziluthToAssiah] = useState(true);
  const [activeHelpKey, setActiveHelpKey] = useState<Layer["key"] | null>(null);
  const [isGlobalHelpOpen, setIsGlobalHelpOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const layerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const cardBackImage = "/images/card_back.jpg";

  const layerRef = useMemo(
    () =>
      Object.fromEntries(
        LAYERS.map((layer) => [
          layer.key,
          (el: HTMLDivElement | null) => {
            layerRefs.current[layer.key] = el;
          }
        ])
      ) as Record<Layer["key"], (el: HTMLDivElement | null) => void>,
    []
  );

  const revealOrder = useMemo(
    () => (revealAtziluthToAssiah ? REVEAL_ATZILUTH_TO_ASSIAH : REVEAL_ASSIAH_TO_ATZILUTH),
    [revealAtziluthToAssiah]
  );
  const selectedCard = selectedCardId ? CARD_INDEX[selectedCardId] : null;
  const activeLayer = activeHelpKey ? LAYERS_BY_KEY[activeHelpKey] : null;
  const activeLayerHelp = activeHelpKey ? LAYER_HELP[activeHelpKey] : null;
  const isSelectedPlanetLayer = selectedCard?.layer === 6;
  const selectedCardModalTitle =
    selectedCard &&
    (selectedCard.layer === 4 || selectedCard.layer === 6) &&
    selectedCard.rank &&
    selectedCard.arcanaTitle
      ? `${selectedCard.rank} · ${selectedCard.arcanaTitle}`
      : selectedCard?.name ?? "";
  const elementLine = selectedCard
    ? formatElementLine(selectedCard.elementalAttribution, selectedCard.astrology.element)
    : null;
  /** Minors 2–10: `rank` is the string form of `number` — hide Rank to avoid duplicating Number */
  const showRankInModal =
    selectedCard?.rank &&
    !(
      selectedCard.number != null &&
      selectedCard.rank != null &&
      selectedCard.rank === String(selectedCard.number)
    );

  const completed = step === LAYERS.length;
  const nextStep = useCallback(() => {
    if (step >= LAYERS.length) return;
    const layerIndex = revealOrder[step];
    const layer = LAYERS[layerIndex];
    const picked = drawUnique(layer.pool, layer.drawCount);
    preloadImageUrls(picked.map((c) => c.image));
    setDrawn((prev) => ({ ...prev, [layer.key]: picked }));
    setStep((prev) => prev + 1);
  }, [revealOrder, step]);

  const reset = useCallback(() => {
    setDrawn({});
    setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleRevealOrder = useCallback(() => {
    setRevealAtziluthToAssiah((v) => !v);
    setDrawn({});
    setStep(0);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (step === 0) return;
    const layerIndex = revealOrder[step - 1];
    const openedLayer = LAYERS[layerIndex];
    const target = layerRefs.current[openedLayer.key];
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, [step, revealOrder]);

  useEffect(() => {
    // Keep only the shared card-back warm to avoid eager loading every card asset.
    const img = new Image();
    img.src = cardBackImage;
  }, [cardBackImage]);

  const cardsByLayer = useMemo<ReactNode[][]>(
    () =>
      LAYERS.map((layer) => {
        const opened = (drawn[layer.key]?.length ?? 0) > 0;

        if (opened) {
          const cards = drawn[layer.key] ?? [];
          return cards.map((card) => (
            <div key={card.id} className="spread-tile spread-card-back-shell border">
              <RevealedCardButton
                card={card}
                cardBackSrc={cardBackImage}
                onOpen={() => setSelectedCardId(card.id)}
              />
            </div>
          ));
        }

        return Array.from({ length: layer.drawCount }, (_, placeholderIdx) => (
          <div
            key={`${layer.key}-placeholder-${placeholderIdx}`}
            aria-label="card back"
            className="spread-tile-back spread-card-back-shell border border-dashed"
          >
            <img
              src={cardBackImage}
              alt=""
              className="spread-card-back-img"
              loading="lazy"
              decoding="async"
            />
            <span className="sr-only">Card Back</span>
          </div>
        ));
      }),
    [drawn, cardBackImage]
  );
  const yetzirahCards = cardsByLayer[4] ?? [];

  function renderTriadLabel(layerIndex: number, className: string) {
    const layer = LAYERS[layerIndex];
    return (
      <div className={`spread-triad-row ${className}`}>
        <p className="spread-triad text-center text-sm font-semibold tracking-wide">{renderTriadWithOperator(layer)}</p>
        <HelpIconButton label={`Help for ${layer.triad.join(" — ")}`} onClick={() => setActiveHelpKey(layer.key)} />
      </div>
    );
  }

  return (
    <main data-theme={revealAtziluthToAssiah ? "descending" : "ascending"} className={spread.main}>
      <div className={spread.shell}>
        <section className={spread.rail}>
          <h1 className={spread.title}>The Great Wheel Spread</h1>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <p className="spread-hint text-xs font-medium tracking-wide">Reveal order</p>
              <HelpIconButton label="Global logic help" onClick={() => setIsGlobalHelpOpen(true)} />
            </div>
            <div className="mt-1.5 flex w-max max-w-full items-center gap-2">
              <span
                className={`shrink-0 text-xs ${
                  !revealAtziluthToAssiah ? "spread-txt-strong" : "spread-txt-faint"
                }`}
              >
                Ascending
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={revealAtziluthToAssiah}
                aria-label="Toggle between descending (Atziluth to Assiah) and ascending (Assiah to Atziluth)"
                onClick={toggleRevealOrder}
                className="spread-toggle relative h-8 w-14 shrink-0 rounded-full p-0.5 transition"
              >
                <span
                  aria-hidden
                  className={`spread-toggle-knob absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full transition-all ${
                    revealAtziluthToAssiah ? "right-1" : "left-1"
                  }`}
                />
              </button>
              <span
                className={`shrink-0 text-xs ${
                  revealAtziluthToAssiah ? "spread-txt-strong" : "spread-txt-faint"
                }`}
              >
                Descending
              </span>
            </div>
          </div>

          <div className={spread.controlGrid}>
            <button type="button" onClick={nextStep} disabled={completed} className={spread.drawBtn}>
              {completed ? "All Revealed" : `Draw (${step + 1}/6)`}
            </button>
            <button type="button" onClick={reset} className={spread.resetBtn}>
              Reset
            </button>
          </div>
        </section>
        <section ref={rightPanelRef} className={spread.canvas}>
          <div className="flex flex-col items-center gap-4">
            <div className={spread.worldCard}>
              <p className={spread.worldLabel}>Atziluth</p>
              <div className="flex flex-col items-center">
                {renderTriadLabel(0, "mb-3")}
                <div ref={layerRef[LAYERS[0].key]} className="spread-card-row">
                  {cardsByLayer[0]}
                </div>
                {renderTriadLabel(1, "mt-4 mb-3")}
                <div ref={layerRef[LAYERS[1].key]} className="spread-card-row">
                  {cardsByLayer[1]}
                </div>
              </div>
            </div>

            <div className={spread.worldCard}>
              <p className={spread.worldLabel}>Briah</p>
              <div className="flex flex-col items-center">
                {renderTriadLabel(2, "mb-3")}
                <div ref={layerRef[LAYERS[2].key]} className="spread-card-row">
                  {cardsByLayer[2]}
                </div>
                {renderTriadLabel(3, "mt-4 mb-3")}
                <div ref={layerRef[LAYERS[3].key]} className="spread-card-row">
                  {cardsByLayer[3]}
                </div>
              </div>
            </div>

            <div className={spread.worldCard}>
              <p className={spread.worldLabel}>Yetzirah</p>
              {renderTriadLabel(4, "mb-3")}
              <div ref={layerRef[LAYERS[4].key]} className="mx-auto grid w-fit grid-cols-2 gap-3">
                {yetzirahCards[0]}
                {yetzirahCards[1]}
                <div className="col-span-2 -mt-1 flex justify-center">{yetzirahCards[2]}</div>
              </div>
            </div>

            <div className={spread.worldCard}>
              <p className={spread.worldLabel}>Assiah</p>
              <div className="flex flex-col items-center">
                {renderTriadLabel(5, "mb-3")}
                <div ref={layerRef[LAYERS[5].key]} className="spread-card-row">
                  {cardsByLayer[5]}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={spread.floatWrap}>
        <button type="button" onClick={nextStep} disabled={completed} className={spread.floatNext}>
          {completed ? "Complete" : `Next (${step + 1} of 6)`}
        </button>
        <button type="button" onClick={reset} className={spread.floatReset}>
          Reset
        </button>
      </div>

      {activeHelpKey ? (
        <SpreadDialog
          aria-label="Layer help"
          z="help"
          maxWidth="md"
          onClose={() => setActiveHelpKey(null)}
        >
          <div className={spread.modalHeader}>
            <div>
              <h3 className="spread-triad text-base font-semibold">
                {activeLayer ? renderTriadWithOperator(activeLayer) : null}
              </h3>
              {activeLayer ? <p className="spread-hint mt-1 text-xs">{activeLayer.triad.slice(1).join(", ")}</p> : null}
            </div>
            <ModalCloseButton onClick={() => setActiveHelpKey(null)} />
          </div>
          <p className="spread-hint mt-3 whitespace-pre-line text-sm leading-relaxed">{activeLayerHelp?.body}</p>
          {activeLayerHelp?.formula ? (
            <p className="mt-2 text-sm text-indigo-100/90">
              <LatexInline tex={activeLayerHelp.formula} />
            </p>
          ) : null}
        </SpreadDialog>
      ) : null}

      {isGlobalHelpOpen ? (
        <SpreadDialog
          aria-label="Global logic help"
          z="help"
          maxWidth="md"
          onClose={() => setIsGlobalHelpOpen(false)}
        >
          <div className={spread.modalHeader}>
            <h3 className="spread-triad text-base font-semibold">Global Logic</h3>
            <ModalCloseButton onClick={() => setIsGlobalHelpOpen(false)} />
          </div>
          <div className="spread-hint mt-3 space-y-2 text-sm leading-relaxed">
            <p>
              <strong className="spread-triad font-semibold">Descending</strong> is the mode of unfoldment where will
              crystallizes into reality through the layered spread.
            </p>
            <p>
              <strong className="spread-triad font-semibold">Ascending</strong> is the mode of analysis where the
              narrative is integrated back toward essence.
            </p>
          </div>
          <div className="mt-2 text-sm text-indigo-100/90">
            <LatexBlock tex={"\\mathcal{G} = \\int \\mathcal{T}\\,dt"} />
          </div>
          <p className="spread-hint mt-1 text-sm leading-relaxed">
            This expresses how time-axis narrative flow (Tales) is gathered into a planetary lens of observation
            (Gaze).
          </p>
          <p className="spread-hint mt-3 text-sm leading-relaxed">
            <LatexInline tex={GLOBAL_LOGIC_EQUATION} />
          </p>
          <div className="spread-hint mt-3 space-y-1 text-sm leading-relaxed">
            <p>
              Layer 1: <LatexInline tex={"\\mathcal{W}"} /> (Will) - Primal vector
            </p>
            <p>
              Layer 2: <LatexInline tex={"\\mathcal{S}"} /> (Stage) - Environmental filter
            </p>
            <p>
              Layer 3: <LatexInline tex={"\\mathcal{A}"} /> (Actors) - Dynamic energy mapping
            </p>
            <p>
              Layer 4: <LatexInline tex={"\\mathcal{F}"} /> (Fate) - System-level constraints
            </p>
            <p>
              Layer 5: <LatexInline tex={"\\mathcal{T}"} /> (Tales) - Time-series unfolding
            </p>
            <p>
              Layer 6: <LatexInline tex={"\\mathcal{G}"} /> (Gaze) - Observed reality
            </p>
          </div>
        </SpreadDialog>
      ) : null}

      {selectedCard ? (
        <SpreadDialog
          aria-label="Card details"
          z="card"
          maxWidth="wide"
          onClose={() => setSelectedCardId(null)}
        >
          <div className={spread.modalHeader}>
            <h3 className="spread-triad text-base font-semibold">{selectedCardModalTitle}</h3>
            <ModalCloseButton onClick={() => setSelectedCardId(null)} />
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-[auto_1fr]">
            <img
              src={selectedCard.image}
              alt={selectedCard.name}
              className="spread-card-modal-art"
              decoding="async"
            />
            <div className="spread-hint text-sm leading-relaxed">
              <p>
                <strong className="spread-triad font-semibold">Stats</strong>
              </p>
              <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                {selectedCard.suit ? <p>Suit: {selectedCard.suit}</p> : null}
                {showRankInModal ? (
                  <p>Rank: {selectedCard.arcanaTitle ? `${selectedCard.rank} (${selectedCard.arcanaTitle})` : selectedCard.rank}</p>
                ) : null}
                {selectedCard.number ? <p>Number: {selectedCard.number}</p> : null}
                {elementLine ? <p>Element: {elementLine}</p> : null}
                {selectedCard.astrology.sign ? <p>Sign: {symbolizeSignValue(selectedCard.astrology.sign)}</p> : null}
                {isSelectedPlanetLayer && selectedCard.astrology.planet ? (
                  <p>Planet: {symbolizePlanetValue(selectedCard.astrology.planet)}</p>
                ) : null}
                {selectedCard.astrology.modality ? <p>Modality: {selectedCard.astrology.modality}</p> : null}
                {!isSelectedPlanetLayer && selectedCard.astrology.planetRuler ? (
                  <p>Planet Ruler: {symbolizePlanetValue(selectedCard.astrology.planetRuler)}</p>
                ) : null}
                {isSelectedPlanetLayer && selectedCard.astrology.governingSign ? (
                  <p>Governing Sign: {symbolizeSignValue(selectedCard.astrology.governingSign)}</p>
                ) : null}
                {selectedCard.dayOfWeek ? <p>Day: {selectedCard.dayOfWeek}</p> : null}
                {selectedCard.metal ? <p>Metal: {selectedCard.metal}</p> : null}
                {selectedCard.hebrewLetter ? <p>Hebrew Letter: {selectedCard.hebrewLetter}</p> : null}
                {selectedCard.treeOfLifePath ? <p>Path: {selectedCard.treeOfLifePath}</p> : null}
                {selectedCard.astrology.decanRange ? (
                  <p>Span: {symbolizeSpan(selectedCard.astrology.decanRange, selectedCard.astrology.sign)}</p>
                ) : null}
                {selectedCard.astrology.dates ? <p>Dates: {selectedCard.astrology.dates}</p> : null}
              </div>
            </div>
          </div>
        </SpreadDialog>
      ) : null}
    </main>
  );
}
