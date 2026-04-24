"use client";

import { motion } from "framer-motion";
import katex from "katex";
import { useEffect, useMemo, useRef, useState } from "react";
import { CARD_INDEX } from "../constants/cards";

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

function LatexInline({ tex }: { tex: string }) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        throwOnError: false,
        displayMode: false
      }),
    [tex]
  );

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function LatexBlock({ tex }: { tex: string }) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        throwOnError: false,
        displayMode: true
      }),
    [tex]
  );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function drawUnique(pool: Card[], count: number): Card[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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
    .map((part) => PLANET_SYMBOL[part] ?? part)
    .join(" / ");
}

function symbolizeSignValue(value: string): string {
  return value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => SIGN_SYMBOL[part] ?? part)
    .join(" / ");
}

function symbolizeElementalAttribution(value: string): string {
  return value
    .split(" of ")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => ELEMENT_SYMBOL[part] ?? part)
    .join(" of ");
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

  const revealOrder = useMemo(
    () => (revealAtziluthToAssiah ? REVEAL_ATZILUTH_TO_ASSIAH : REVEAL_ASSIAH_TO_ATZILUTH),
    [revealAtziluthToAssiah]
  );
  const selectedCard = selectedCardId ? CARD_INDEX[selectedCardId] : null;
  const isSelectedPlanetLayer = selectedCard?.layer === 6;
  const elementLine = selectedCard
    ? formatElementLine(selectedCard.elementalAttribution, selectedCard.astrology.element)
    : null;

  const completed = step === LAYERS.length;
  const nextStep = () => {
    if (step >= LAYERS.length) return;
    const layerIndex = revealOrder[step];
    const layer = LAYERS[layerIndex];
    setDrawn((prev) => ({ ...prev, [layer.key]: drawUnique(layer.pool, layer.drawCount) }));
    setStep((prev) => prev + 1);
  };

  const reset = () => {
    setDrawn({});
    setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleRevealOrder = () => {
    setRevealAtziluthToAssiah((v) => !v);
    setDrawn({});
    setStep(0);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "auto" });
  };

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
    const uniqueImages = Array.from(
      new Set([...LAYERS.flatMap((layer) => layer.pool.map((card) => card.image)), cardBackImage])
    );

    uniqueImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  function renderCards(layerIndex: number) {
    const layer = LAYERS[layerIndex];
    const opened = (drawn[layer.key]?.length ?? 0) > 0;

    if (opened) {
      const cards = drawn[layer.key] ?? [];
      return cards.map((card) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="spread-tile overflow-hidden rounded-lg border"
        >
          <button
            type="button"
            onClick={() => setSelectedCardId(card.id)}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
            aria-label={`Open details for ${card.name}`}
          >
            <img
              src={card.image}
              alt={card.name}
              className="h-[7.2rem] w-[5.2rem] object-cover object-center sm:h-[8.4rem] sm:w-[6rem]"
              loading="lazy"
            />
          </button>
        </motion.div>
      ));
    }

    return Array.from({ length: layer.drawCount }, (_, placeholderIdx) => (
      <div
        key={`${layer.key}-placeholder-${placeholderIdx}`}
        aria-label="card back"
        className="spread-tile-back h-[7.2rem] w-[5.2rem] rounded-lg border border-dashed bg-cover bg-center sm:h-[8.4rem] sm:w-[6rem]"
        style={{ backgroundImage: `url(${cardBackImage})` }}
      >
        <span className="sr-only">Card Back</span>
      </div>
    ));
  }

  function renderTriadLabel(layerIndex: number, className: string) {
    const layer = LAYERS[layerIndex];
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <p className="spread-triad text-center text-sm font-semibold tracking-wide">{layer.triad.join(" — ")}</p>
        <button
          type="button"
          aria-label={`Help for ${layer.triad.join(" — ")}`}
          onClick={() => setActiveHelpKey(layer.key)}
          className="spread-btn-ghost inline-flex h-5 w-5 items-center justify-center rounded-full p-0 text-[11px] leading-none"
        >
          ?
        </button>
      </div>
    );
  }

  return (
    <main
      data-theme={revealAtziluthToAssiah ? "descending" : "ascending"}
      className="flex min-h-screen flex-col px-4 py-6 transition-[background,color] duration-300 sm:px-6 sm:py-8 lg:box-border lg:min-h-0 lg:h-[100dvh] lg:overflow-hidden lg:px-6 lg:py-6"
    >
      <div className="mx-auto flex w-full min-h-0 max-w-7xl flex-1 flex-col gap-5 max-lg:min-h-0 lg:min-h-0 lg:max-h-full lg:flex-row">
        <section className="spread-outer w-full shrink-0 rounded-2xl border p-5 backdrop-blur-md transition-colors duration-300 lg:w-[18rem] lg:max-w-[18rem]">
          <h1 className="spread-title text-2xl font-semibold tracking-wide sm:text-3xl">
            The Great Wheel Spread
          </h1>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <p className="spread-hint text-xs font-medium tracking-wide">Reveal order</p>
              <button
                type="button"
                aria-label="Global logic help"
                onClick={() => setIsGlobalHelpOpen(true)}
                className="spread-btn-ghost inline-flex h-5 w-5 items-center justify-center rounded-full p-0 text-[11px] leading-none"
              >
                ?
              </button>
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

          <div className="mt-3 grid w-full grid-cols-2 gap-2">
            <button
              type="button"
              onClick={nextStep}
              disabled={completed}
              className="spread-btn-go min-w-0 max-w-full rounded-full px-2 py-2 text-center text-xs font-medium backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {completed ? "All Revealed" : `Draw (${step + 1}/6)`}
            </button>
            <button
              type="button"
              onClick={reset}
              className="spread-btn-ghost min-w-0 max-w-full rounded-full px-2 py-2 text-center text-xs font-medium transition"
            >
              Reset
            </button>
          </div>
        </section>
        <section
          ref={rightPanelRef}
          className="spread-outer w-full min-w-0 overflow-x-hidden rounded-2xl border px-4 py-6 backdrop-blur-md transition-colors duration-300 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="spread-inner w-full max-w-md rounded-xl border p-3 transition-colors duration-300"
            >
              <p className="spread-world-label mb-3 text-center text-xs font-medium tracking-[0.12em]">Atziluth</p>
              <div className="flex flex-col items-center">
                {renderTriadLabel(0, "mb-3")}
                <div
                  ref={(el) => {
                    layerRefs.current[LAYERS[0].key] = el;
                  }}
                  className="flex justify-center gap-3"
                >
                  {renderCards(0)}
                </div>
                {renderTriadLabel(1, "mt-4 mb-3")}
                <div
                  ref={(el) => {
                    layerRefs.current[LAYERS[1].key] = el;
                  }}
                  className="flex justify-center gap-3"
                >
                  {renderCards(1)}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="spread-inner w-full max-w-md rounded-xl border p-3 transition-colors duration-300"
            >
              <p className="spread-world-label mb-3 text-center text-xs font-medium tracking-[0.12em]">Briah</p>
              <div className="flex flex-col items-center">
                {renderTriadLabel(2, "mb-3")}
                <div
                  ref={(el) => {
                    layerRefs.current[LAYERS[2].key] = el;
                  }}
                  className="flex justify-center gap-3"
                >
                  {renderCards(2)}
                </div>
                {renderTriadLabel(3, "mt-4 mb-3")}
                <div
                  ref={(el) => {
                    layerRefs.current[LAYERS[3].key] = el;
                  }}
                  className="flex justify-center gap-3"
                >
                  {renderCards(3)}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="spread-inner w-full max-w-md rounded-xl border p-3 transition-colors duration-300"
            >
              <p className="spread-world-label mb-3 text-center text-xs font-medium tracking-[0.12em]">Yetzirah</p>
              {renderTriadLabel(4, "mb-3")}
              <div
                ref={(el) => {
                  layerRefs.current[LAYERS[4].key] = el;
                }}
                className="mx-auto grid w-fit grid-cols-2 gap-3"
              >
                {renderCards(4)[0]}
                {renderCards(4)[1]}
                <div className="col-span-2 -mt-1 flex justify-center">{renderCards(4)[2]}</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="spread-inner w-full max-w-md rounded-xl border p-3 transition-colors duration-300"
            >
              <p className="spread-world-label mb-3 text-center text-xs font-medium tracking-[0.12em]">Assiah</p>
              <div className="flex flex-col items-center">
                {renderTriadLabel(5, "mb-3")}
                <div
                  ref={(el) => {
                    layerRefs.current[LAYERS[5].key] = el;
                  }}
                  className="flex justify-center gap-3"
                >
                  {renderCards(5)}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex flex-wrap items-stretch justify-end gap-3 lg:hidden">
        <button
          type="button"
          onClick={nextStep}
          disabled={completed}
          className="spread-float-next min-h-[52px] min-w-[9rem] rounded-full px-5 py-3 text-sm font-semibold backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {completed ? "Complete" : `Next (${step + 1} of 6)`}
        </button>
        <button
          type="button"
          onClick={reset}
          className="spread-float-reset min-h-[52px] min-w-[9rem] rounded-full px-5 py-3 text-sm font-semibold backdrop-blur transition"
        >
          Reset
        </button>
      </div>

      {activeHelpKey ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Layer help"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActiveHelpKey(null)}
        >
          <div
            className="spread-outer w-full max-w-md rounded-2xl border p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="spread-triad text-base font-semibold">{LAYER_HELP[activeHelpKey].title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveHelpKey(null)}
                className="spread-btn-ghost rounded-full px-2 py-1 text-xs"
              >
                Close
              </button>
            </div>
            <p className="spread-hint mt-3 whitespace-pre-line text-sm leading-relaxed">{LAYER_HELP[activeHelpKey].body}</p>
            {LAYER_HELP[activeHelpKey].formula ? (
              <p className="mt-2 text-sm text-indigo-100/90">
                <LatexInline tex={LAYER_HELP[activeHelpKey].formula} />
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {isGlobalHelpOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Global logic help"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsGlobalHelpOpen(false)}
        >
          <div
            className="spread-outer w-full max-w-md rounded-2xl border p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="spread-triad text-base font-semibold">Global Logic</h3>
              <button
                type="button"
                onClick={() => setIsGlobalHelpOpen(false)}
                className="spread-btn-ghost rounded-full px-2 py-1 text-xs"
              >
                Close
              </button>
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
              <p>Layer 1: W (Will) - Primal vector</p>
              <p>Layer 2: S (Stage) - Environmental filter</p>
              <p>Layer 3: A (Actors) - Dynamic energy mapping</p>
              <p>Layer 4: F (Fate) - System-level constraints</p>
              <p>Layer 5: T (Tales) - Time-series unfolding</p>
              <p>Layer 6: G (Gaze) - Observed reality</p>
            </div>
          </div>
        </div>
      ) : null}

      {selectedCard ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Card details"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedCardId(null)}
        >
          <div
            className="spread-outer w-full max-w-2xl rounded-2xl border p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="spread-triad text-base font-semibold">{selectedCard.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedCardId(null)}
                className="spread-btn-ghost rounded-full px-2 py-1 text-xs"
              >
                Close
              </button>
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-[auto_1fr]">
              <img
                src={selectedCard.image}
                alt={selectedCard.name}
                className="mx-auto h-[16.8rem] w-[12rem] rounded-lg border border-white/15 object-cover object-center"
              />
              <div className="spread-hint text-sm leading-relaxed">
                <p>
                  <strong className="spread-triad font-semibold">Stats</strong>
                </p>
                <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                  {selectedCard.suit ? <p>Suit: {selectedCard.suit}</p> : null}
                  {selectedCard.rank ? (
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
                    <p>
                      Span: {symbolizeSpan(selectedCard.astrology.decanRange, selectedCard.astrology.sign)}
                    </p>
                  ) : null}
                  {selectedCard.astrology.dates ? <p>Dates: {selectedCard.astrology.dates}</p> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
