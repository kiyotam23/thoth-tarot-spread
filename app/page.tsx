"use client";

import katex from "katex";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ALL_CARDS, CARD_INDEX } from "../constants/cards";
import type { ThothPath } from "../constants/thothPaths";
import { TreeOfLifeLines, TreePathHitLayer, type TreeLayout } from "./TreeOfLifeBackground";

const KATEX_OPTS = { throwOnError: false } as const;

function renderKatexHtml(tex: string, displayMode: boolean) {
  return katex.renderToString(tex, { ...KATEX_OPTS, displayMode });
}

/** Reusable class strings — change layout / chrome in one place */
const spread = {
  main: "flex min-h-screen flex-col px-4 py-6 transition-[background,color] duration-300 sm:px-6 sm:py-8 lg:box-border lg:min-h-0 lg:h-[100dvh] lg:overflow-hidden lg:px-6 lg:py-6",
  shell: "mx-auto flex w-full min-h-0 max-w-7xl flex-1 flex-col gap-5 max-lg:min-h-0 lg:min-h-0 lg:max-h-full lg:flex-row",
  rail:
    "spread-outer w-full shrink-0 rounded-2xl border p-5 supports-[backdrop-filter]:backdrop-blur-sm transition-colors duration-300 max-lg:fixed max-lg:bottom-3 max-lg:inset-x-3 max-lg:w-auto max-lg:z-40 lg:w-[20rem] lg:max-w-[20rem] lg:supports-[backdrop-filter]:backdrop-blur-md",
  canvas:
    "spread-outer spread-canvas-panel w-full min-w-0 overflow-x-hidden rounded-2xl border px-5 py-7 transition-colors duration-300 sm:px-9 sm:py-8 max-lg:pb-80 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain supports-[backdrop-filter]:backdrop-blur-sm lg:supports-[backdrop-filter]:backdrop-blur-md",
  worldCard:
    "spread-inner spread-panel spread-panel-fade w-full max-w-xl rounded-xl border p-4 transition-colors duration-300 sm:p-5",
  worldLabel:
    "spread-world-label relative z-[3] mb-4 w-full pointer-events-none text-left text-xs font-medium tracking-[0.12em] pl-0.5",
  title: "spread-title whitespace-nowrap font-mono text-xl font-bold tracking-[0.18em] sm:text-2xl",
  brandCopyright:
    "pointer-events-none max-w-2xl select-none text-right text-[8px] font-mono font-thin leading-relaxed tracking-wide opacity-50 sm:ml-auto sm:text-[9px]",
  modalOverlay: "fixed inset-0 flex items-center justify-center bg-black/90 p-4",
  modalZHelp: "z-[60]",
  modalZCard: "z-[70]",
  modalSheet: "spread-outer w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border p-4",
  modalSheetWide: "spread-outer w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border p-4",
  helpIcon: "spread-btn-ghost inline-flex h-5 w-5 items-center justify-center rounded-full p-0 text-[11px] leading-none",
  modalClose: "spread-btn-ghost rounded-full px-2 py-1 text-xs",
  floatWrap: "hidden",
  floatNext:
    "spread-float-next min-h-[52px] min-w-[9rem] rounded-full px-5 py-3 text-sm font-semibold supports-[backdrop-filter]:backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-40",
  floatReset:
    "spread-float-reset min-h-[52px] min-w-[9rem] rounded-full px-5 py-3 text-sm font-semibold supports-[backdrop-filter]:backdrop-blur-sm transition",
  controlGrid: "mt-3 grid w-full grid-cols-2 gap-2",
  modePillRow: "mt-1.5 grid w-full min-w-0 grid-cols-3 gap-2 px-0.5 sm:gap-3",
  layerExecutionFixed:
    "pointer-events-auto fixed right-3 top-3 z-30 w-auto min-w-0 text-right sm:right-5 sm:top-5",
  sephiroticPanel:
    "pointer-events-auto fixed right-3 top-3 z-30 w-auto min-w-0 max-w-[min(96vw,24rem)] text-right sm:right-5 sm:top-5",
  drawBtn: "spread-btn-go min-w-0 max-w-full rounded-full px-2 py-2 text-center text-xs font-medium backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-40",
  resetBtn: "spread-btn-ghost min-w-0 max-w-full rounded-full px-2 py-2 text-center text-xs font-medium transition",
  modalHeader: "flex items-start justify-between gap-4"
} as const;

const LAYER_OPERATOR_LABELS = ["W", "S", "A", "F", "T", "G"] as const;

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
    triad: ["WILL", "Intent", "Spark"]
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

/**
 * Map each **physical card slot** (left-to-right, then bottom row) to a Sephirah 1–10, matching
 * a standard Tree of Life view: viewer-left = Pillar of Severity (3,5,8), viewer-right = Pillar
 * of Mercy (2,4,7), center column (1,6,9,10). Pairs in `spread-card-row` are [left, right];
 * Yetzirah is a 2+1 grid: top [Hod, Netzach], bottom [Yesod].
 */
function sephirahForLayerSlot(layerIndex: number, cardIndexInLayer: number): number {
  if (layerIndex === 0) return 1;
  // Womb: left Binah (3), right Chokmah (2)
  if (layerIndex === 1) return cardIndexInLayer === 0 ? 3 : 2;
  // Agents: left Geburah (5), right Chesed (4)
  if (layerIndex === 2) return cardIndexInLayer === 0 ? 5 : 4;
  if (layerIndex === 3) return 6;
  // Events: top-left Hod (8), top-right Netzach (7), bottom Yesod (9) — see grid in page layout
  if (layerIndex === 4) {
    if (cardIndexInLayer === 0) return 8;
    if (cardIndexInLayer === 1) return 7;
    return 9;
  }
  if (layerIndex === 5) return 10;
  return 0;
}

function sephirahForSlotKey(slotKey: string): number {
  const parts = slotKey.split("__");
  if (parts.length < 2) return 0;
  const layerKey = parts[0];
  const idxStr = parts[parts.length - 1];
  const layerIndex = LAYERS.findIndex((l) => l.key === layerKey);
  const cardIndex = parseInt(idxStr, 10);
  if (layerIndex < 0 || Number.isNaN(cardIndex)) return 0;
  return sephirahForLayerSlot(layerIndex, cardIndex);
}

function layerIndexForSephirah(n: number): number {
  if (n === 1) return 0;
  if (n === 2 || n === 3) return 1;
  if (n === 4 || n === 5) return 2;
  if (n === 6) return 3;
  if (n >= 7 && n <= 9) return 4;
  if (n === 10) return 5;
  return 0;
}

/** L1 (top, Atziluth) → L6 (bottom, Assiah) — emantion downward on screen */
const REVEAL_ATZILUTH_TO_ASSIAH: number[] = [0, 1, 2, 3, 4, 5];
/** L6 (Assiah) → L1 (Atziluth) — return upward on screen */
const REVEAL_ASSIAH_TO_ATZILUTH: number[] = [5, 4, 3, 2, 1, 0];

const GLOBAL_LOGIC_EQUATION =
  "\\mathrm{Result} = \\mathcal{G} \\circ \\mathcal{T} \\circ \\mathcal{F} \\circ \\mathcal{A} \\circ \\mathcal{S}(W)";

const OVERLAY_HELP_INTRO =
  'Visualizes the 22 paths of the Tree of Life as the system\u2019s "internal wiring." It maps the spread to the 22 links between the ten Sephiroth.';

const OVERLAY_HELP_SECTIONS = [
  "Interpretation: Displays the fixed major arcana for each route. These are the specific protocols through which energy travels between Sephiroth.",
  "Function: Read the connections between cards to understand the dynamic transmission of the event—how one layer's outcome influences the next.",
  "Qabalistic Anchor: The 22 paths are the \"Vectors of Influence.\" They define the quality of the link between the 10 Sephiroth.",
  "Protocol: A path is not merely a line between two points. It is the contract that governs how adjacent cards communicate: the major arcana on that edge names the mediating link."
].join("\n");

const LAYER_HELP: Record<Layer["key"], { title: string; body: string; cardLine?: string; formula?: string }> = {
  root: {
    title: "WILL — Intent — Spark",
    body: "Interpretation: Sephirah 1 (Kether). The Ace defines root WILL and elemental direction.\nFunction: Use this as the baseline intention for the whole reading.\nQabalistic Anchor: Kether (1) is the undivided origin.\nFormula Rationale: $\\vec{V}_{seed}$ is singular because the spread begins from one seed.",
    cardLine: "One Ace card.",
    formula: "\\vec{V}_{seed} = \\mathrm{Ace}_{element}"
  },
  womb: {
    title: "Stage — Domain — Matrix",
    body: "Interpretation: Sephiroth 2-3 (Chokmah-Binah). Two Princesses set the stage through expansion and boundary.\nFunction: They shape how WILL (𝒲) can manifest in this reading.\nQabalistic Anchor: Chokmah (2) opens force; Binah (3) gives form.\nFormula Rationale: Two operators ($\\Psi_{P_{left}}$, $\\Psi_{P_{right}}$) act on one source to produce a workable field.",
    cardLine: "Two Princess cards.",
    formula: "\\vec{V}_{stage} = \\Psi_{P_{left}} \\cdot \\Psi_{P_{right}}(W)"
  },
  agents: {
    title: "Actors — Agents — Duality",
    body: "Interpretation: Sephiroth 4-5 (Chesed-Geburah). Court cards represent active powers in tension.\nFunction: Read their balance as the current driving momentum of events.\nQabalistic Anchor: Chesed (4) expands and supports; Geburah (5) limits and corrects.\nFormula Rationale: $\\vec{F}_{net}$ is directional because outcome depends on opposing forces.",
    cardLine: "Two Court cards (Knight / Queen / Prince).",
    formula: "\\vec{F}_{net} = \\vec{F}_{\\mathrm{Chesed}(4)} \\oplus \\vec{F}_{\\mathrm{Geburah}(5)}"
  },
  destiny: {
    title: "Fate — Ordinance — Law",
    body: "Interpretation: Sephirah 6 (Tiphareth). A Zodiac Major Arcana defines the core pattern of fate.\nFunction: It stabilizes and interprets dynamics coming from 𝒜 (Actors).\nQabalistic Anchor: Tiphareth (6) harmonizes upper cause and lower expression.\nFormula Rationale: $\\mathrm{Harmonize}(\\mathcal{A}_{4} \\oplus \\mathcal{A}_{5})$ is constrained by Zodiac as a fixed archetypal frame.",
    cardLine: "One Zodiac Major Arcana card.",
    formula: "\\Phi_{\\mathrm{Fate}} = \\mathrm{Harmonize}\\left(\\mathcal{A}_{4} \\oplus \\mathcal{A}_{5}\\right)\\big|_{\\mathrm{Zodiac}}"
  },
  events: {
    title: "Tales — Events — Sequences",
    body: "Interpretation: Sephiroth 7-8-9 (Netzach-Hod-Yesod). Three small cards show unfolding sequence.\nFunction: Read them as motive (7), patterning (8), and synthesis (9).\nQabalistic Anchor: Netzach (7) fuels, Hod (8) structures, Yesod (9) consolidates.\nFormula Rationale: Flow moves to Yesod before manifestation in Malkuth.",
    cardLine: "Three small cards.",
    formula: "\\mathcal{T}(\\tau) = \\mathrm{Netzach}(7) \\oplus \\mathrm{Hod}(8) \\rightarrow \\mathrm{Yesod}(9)"
  },
  focus: {
    title: "Gaze — Vision — Perspective",
    body: "Interpretation: Sephirah 10 (Malkuth). The planetary Major Arcana shows the final observable phase.\nFunction: It integrates 𝒯 over time and resolves the reading into one practical lens.\nQabalistic Anchor: Malkuth (10) is the grounded endpoint of the Tree.\nFormula Rationale: Integral + collapse expresses accumulation followed by one concrete outcome.",
    cardLine: "One Planetary Major Arcana card.",
    formula:
      "\\mathcal{G} = \\int_{t_0}^{t_{\\mathrm{final}}} \\mathcal{T}(t)\\,dt \\xrightarrow{\\mathrm{Collapse}} \\mathrm{Planet}"
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

const TOTAL_SPREAD_CARDS = LAYERS.reduce((acc, l) => acc + l.drawCount, 0);

type SelectedModalPick = {
  cardId: string;
  sephirah: number;
};

type SephirahFlankEcho = {
  leftId: string;
  rightId: string;
};

function collectSpreadCardIds(drawn: Record<string, Card[]>): Set<string> {
  const ids = new Set<string>();
  for (const arr of Object.values(drawn)) {
    for (const c of arr) ids.add(c.id);
  }
  return ids;
}

function pickTwoDistinctIds(pool: string[]): [string, string] | null {
  if (pool.length < 2) return null;
  const copy = [...pool];
  const i = Math.floor(Math.random() * copy.length);
  const left = copy.splice(i, 1)[0];
  const j = Math.floor(Math.random() * copy.length);
  const right = copy[j];
  if (!left || !right || left === right) return null;
  return [left, right];
}

function dealAllLayers(): Record<string, Card[]> {
  const next: Record<string, Card[]> = {};
  for (const layer of LAYERS) {
    next[layer.key] = drawUnique(layer.pool, layer.drawCount);
  }
  return next;
}

type RevealMode = "ascending" | "descending" | "freestyle";

type FreestyleLogEntry = {
  slotKey: string;
  cardId: string;
  name: string;
  op: (typeof LAYER_OPERATOR_LABELS)[number];
  sephirah: number;
};

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

const HEBREW_LETTER_META: Record<string, { name: string; keyword: string; value: number }> = {
  א: { name: "Aleph", keyword: "Ox", value: 1 },
  ב: { name: "Beth", keyword: "House", value: 2 },
  ג: { name: "Gimel", keyword: "Camel", value: 3 },
  ד: { name: "Daleth", keyword: "Door", value: 4 },
  ה: { name: "Heh", keyword: "Window", value: 5 },
  ו: { name: "Vav", keyword: "Nail", value: 6 },
  ז: { name: "Zain", keyword: "Sword", value: 7 },
  ח: { name: "Cheth", keyword: "Fence", value: 8 },
  ט: { name: "Teth", keyword: "Serpent", value: 9 },
  י: { name: "Yod", keyword: "Hand", value: 10 },
  כ: { name: "Kaph", keyword: "Palm", value: 20 },
  ל: { name: "Lamed", keyword: "Ox-Goad", value: 30 },
  מ: { name: "Mem", keyword: "Water", value: 40 },
  נ: { name: "Nun", keyword: "Fish", value: 50 },
  ס: { name: "Samekh", keyword: "Prop", value: 60 },
  ע: { name: "Ayin", keyword: "Eye", value: 70 },
  פ: { name: "Peh", keyword: "Mouth", value: 80 },
  צ: { name: "Tzaddi", keyword: "Fish Hook", value: 90 },
  ק: { name: "Qoph", keyword: "Back of Head", value: 100 },
  ר: { name: "Resh", keyword: "Head", value: 200 },
  ש: { name: "Shin", keyword: "Tooth", value: 300 },
  ת: { name: "Tav", keyword: "Cross", value: 400 }
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

function formatHebrewLetterLine(value: string): string {
  const glyphMatch = value.match(/[א-ת]/);
  if (!glyphMatch) return value;
  const glyph = glyphMatch[0];
  const meta = HEBREW_LETTER_META[glyph];
  if (!meta) return value;
  return `${glyph} (${meta.name})\u00A0—\u00A0${meta.keyword} [${meta.value}]`;
}

function renderHelpBody(body: string) {
  const renderInlineMath = (text: string) => {
    const parts = text.split(/(\$[^$]+\$)/g).filter(Boolean);
    return parts.map((part, i) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        return <LatexInline key={`help-math-${i}`} tex={part.slice(1, -1)} />;
      }
      return <span key={`help-text-${i}`}>{part}</span>;
    });
  };

  return body.split("\n").map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={`help-gap-${idx}`} className="h-1" aria-hidden />;
    }
    const sectionMatch = trimmed.match(
      /^(Interpretation|Function|Qabalistic Anchor|Protocol|Formula Rationale):\s*(.*)$/
    );
    if (sectionMatch) {
      return (
        <p key={`help-line-${idx}`} className="leading-relaxed">
          <strong className="spread-triad font-semibold">{sectionMatch[1]}:</strong>{" "}
          <span>{renderInlineMath(sectionMatch[2])}</span>
        </p>
      );
    }
    return (
      <p key={`help-line-${idx}`} className="leading-relaxed">
        {renderInlineMath(line)}
      </p>
    );
  });
}

export default function Page() {
  const [step, setStep] = useState(0);
  const [drawn, setDrawn] = useState<Record<string, Card[]>>({});
  /** descending: Atziluth→Assiah; ascending: Assiah→Atziluth; freestyle: same Tree layout, any reveal order */
  const [revealMode, setRevealMode] = useState<RevealMode>("descending");
  const [freestyleFaceUp, setFreestyleFaceUp] = useState<Record<string, boolean>>({});
  const [freestyleOrderLog, setFreestyleOrderLog] = useState<FreestyleLogEntry[]>([]);
  const [activeHelpKey, setActiveHelpKey] = useState<Layer["key"] | null>(null);
  const [isGlobalHelpOpen, setIsGlobalHelpOpen] = useState(false);
  const [isOverlayHelpOpen, setIsOverlayHelpOpen] = useState(false);
  const [showMobileAdvancedControls, setShowMobileAdvancedControls] = useState(false);
  const [seedHelpTarget, setSeedHelpTarget] = useState<"will" | "gaze" | null>(null);
  const [isEchoHelpOpen, setIsEchoHelpOpen] = useState(false);
  const [manualSeedEnabled, setManualSeedEnabled] = useState(false);
  const [manualSeedCardId, setManualSeedCardId] = useState<string | null>(null);
  const [echoEnabled, setEchoEnabled] = useState(false);
  const [echoCardId, setEchoCardId] = useState<string | null>(null);
  const [echoSeedApplied, setEchoSeedApplied] = useState(false);
  const [showTreeOfLife, setShowTreeOfLife] = useState(false);
  const [treeLayout, setTreeLayout] = useState<TreeLayout | null>(null);
  const [selectedThothPath, setSelectedThothPath] = useState<ThothPath | null>(null);
  const [selectedModalPick, setSelectedModalPick] = useState<SelectedModalPick | null>(null);
  /** Per-Sephirah (1–10), at most one L/R pair from the leftover deck once drawn */
  const [sephFlankEchoes, setSephFlankEchoes] = useState<Record<number, SephirahFlankEcho>>({});
  const layerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const treeLayoutRootRef = useRef<HTMLDivElement | null>(null);
  const sephirahSlotRef = useRef<(HTMLDivElement | null)[]>(Array.from({ length: 10 }, () => null));
  const sequentialAdvanceLockRef = useRef(false);
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
    () => (revealMode === "descending" ? REVEAL_ATZILUTH_TO_ASSIAH : REVEAL_ASSIAH_TO_ATZILUTH),
    [revealMode]
  );
  const effectiveRevealOrder = revealOrder;
  const seedCandidateCards = useMemo(() => {
    if (revealMode === "ascending") return FOCUS;
    if (revealMode === "descending") return ACES;
    return [] as Card[];
  }, [revealMode]);
  const selectedSeedCard = useMemo(
    () => seedCandidateCards.find((card) => card.id === manualSeedCardId) ?? null,
    [seedCandidateCards, manualSeedCardId]
  );

  const selectedCard = selectedModalPick ? CARD_INDEX[selectedModalPick.cardId] : null;
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

  const modalSephirah = selectedModalPick?.sephirah ?? 0;
  const modalFlankEcho =
    modalSephirah >= 1 && modalSephirah <= 10 ? sephFlankEchoes[modalSephirah] : undefined;

  const isSequential = revealMode === "ascending" || revealMode === "descending";
  const freestyleRevealedCount = useMemo(
    () => Object.values(freestyleFaceUp).filter(Boolean).length,
    [freestyleFaceUp]
  );
  const echoLocked =
    revealMode === "freestyle" &&
    freestyleRevealedCount > 0 &&
    !(echoSeedApplied && freestyleRevealedCount === 1);
  const seedLocked = isSequential && step > 0 && (!manualSeedEnabled || step > 1);
  const completed = isSequential ? step === LAYERS.length : revealMode === "freestyle" && freestyleRevealedCount >= TOTAL_SPREAD_CARDS;

  const drawSephirahFlankEcho = useCallback(
    (sephirah: number) => {
      if (!completed) return;
      if (sephirah < 1 || sephirah > 10) return;
      setSephFlankEchoes((prev) => {
        if (prev[sephirah]) return prev;
        const used = new Set<string>();
        for (const v of Object.values(prev)) {
          used.add(v.leftId);
          used.add(v.rightId);
        }
        const spreadIds = collectSpreadCardIds(drawn);
        const pool = ALL_CARDS.map((c) => c.id).filter((id) => !spreadIds.has(id) && !used.has(id));
        const pair = pickTwoDistinctIds(pool);
        if (!pair) return prev;
        const [leftId, rightId] = pair;
        preloadImageUrls([CARD_INDEX[leftId].image, CARD_INDEX[rightId].image]);
        return { ...prev, [sephirah]: { leftId, rightId } };
      });
    },
    [completed, drawn]
  );

  const litOperatorIndexSet = useMemo(() => {
    if (revealMode === "freestyle") {
      return new Set<number>();
    }
    return new Set(effectiveRevealOrder.slice(0, step));
  }, [revealMode, effectiveRevealOrder, step]);

  const dealFreestyle = useCallback(() => {
    const d = dealAllLayers();
    preloadImageUrls(Object.values(d).flatMap((c) => c.map((x) => x.image)));
    setDrawn(d);
    setFreestyleFaceUp({});
    setFreestyleOrderLog([]);
    setEchoSeedApplied(false);
    setStep(0);
    setSelectedModalPick(null);
    setSephFlankEchoes({});
  }, []);

  const selectRevealMode = useCallback(
    (m: RevealMode) => {
      setSelectedModalPick(null);
      setSephFlankEchoes({});
      setStep(0);
      setActiveHelpKey(null);
      setRevealMode(m);
      if (m === "freestyle") {
        setManualSeedEnabled(false);
        setManualSeedCardId(null);
        setEchoCardId(null);
        setEchoSeedApplied(false);
        const d = dealAllLayers();
        preloadImageUrls(Object.values(d).flatMap((c) => c.map((x) => x.image)));
        setDrawn(d);
        setFreestyleFaceUp({});
        setFreestyleOrderLog([]);
      } else {
        setEchoEnabled(false);
        setEchoCardId(null);
        setEchoSeedApplied(false);
        setManualSeedCardId(null);
        setDrawn({});
        setFreestyleFaceUp({});
        setFreestyleOrderLog([]);
      }
      rightPanelRef.current?.scrollTo({ top: 0, behavior: "auto" });
    },
    []
  );

  const nextStep = useCallback(() => {
    if (!isSequential) return;
    if (step >= LAYERS.length) return;
    const layerIndex = effectiveRevealOrder[step];
    const layer = LAYERS[layerIndex];
    const picked =
      step === 0 && manualSeedEnabled && selectedSeedCard
        ? [selectedSeedCard]
        : drawUnique(layer.pool, layer.drawCount);
    preloadImageUrls(picked.map((c) => c.image));
    setDrawn((prev) => ({ ...prev, [layer.key]: picked }));
    setStep((prev) => prev + 1);
  }, [isSequential, effectiveRevealOrder, step, manualSeedEnabled, selectedSeedCard]);

  const reset = useCallback(() => {
    if (revealMode === "freestyle") {
      dealFreestyle();
    } else {
      setDrawn({});
      setStep(0);
    }
    setSelectedModalPick(null);
    setSephFlankEchoes({});
    window.scrollTo({ top: 0, behavior: "smooth" });
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [revealMode, dealFreestyle]);

  const revealFreestyleSlot = useCallback((slotKey: string, card: Card, op: (typeof LAYER_OPERATOR_LABELS)[number]) => {
    setFreestyleFaceUp((prev) => {
      if (prev[slotKey]) return prev;
      return { ...prev, [slotKey]: true };
    });
    setEchoSeedApplied(false);
    setFreestyleOrderLog((prev) => {
      if (prev.some((e) => e.slotKey === slotKey)) return prev;
      return [...prev, { slotKey, cardId: card.id, name: card.name, op, sephirah: sephirahForSlotKey(slotKey) }];
    });
    preloadImageUrls([card.image]);
  }, []);

  const scrollToLayer = useCallback((layerIndex: number) => {
    const layer = LAYERS[layerIndex];
    const target = layerRefs.current[layer.key];
    if (!target) return;
    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, []);

  const jumpToNextAndReveal = useCallback(() => {
    if (!isSequential) return;
    if (step >= LAYERS.length) return;
    if (sequentialAdvanceLockRef.current) return;
    sequentialAdvanceLockRef.current = true;
    const nextLayerIndex = effectiveRevealOrder[step];
    scrollToLayer(nextLayerIndex);
    window.setTimeout(() => {
      nextStep();
      // prevent accidental multi-draw from quick repeated taps
      window.setTimeout(() => {
        sequentialAdvanceLockRef.current = false;
      }, 220);
    }, 80);
  }, [isSequential, step, effectiveRevealOrder, scrollToLayer, nextStep]);

  useEffect(() => {
    if (revealMode !== "freestyle" || !echoEnabled) return;
    if (!echoCardId) return;
    const selected = DESTINY.find((card) => card.id === echoCardId);
    if (!selected) return;
    preloadImageUrls([selected.image]);
    setFreestyleFaceUp((prev) => ({ ...prev, destiny__0: true }));
    setDrawn((prev) => {
      const current = prev.destiny;
      if (current?.length === 1 && current[0]?.id === selected.id) return prev;
      return { ...prev, destiny: [selected] };
    });
    setFreestyleOrderLog((prev) => {
      const idx = prev.findIndex((entry) => entry.slotKey === "destiny__0");
      if (idx < 0) {
        return [
          ...prev,
          { slotKey: "destiny__0", cardId: selected.id, name: selected.name, op: LAYER_OPERATOR_LABELS[3], sephirah: 6 }
        ];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], cardId: selected.id, name: selected.name };
      return next;
    });
    setEchoSeedApplied(true);
    requestAnimationFrame(() => {
      scrollToLayer(3); // Tiphareth / Destiny layer
    });
  }, [revealMode, echoEnabled, echoCardId, scrollToLayer]);

  useEffect(() => {
    if (!isSequential || !manualSeedEnabled || !selectedSeedCard) return;
    const seedLayerIndex = revealOrder[0];
    const seedLayer = LAYERS[seedLayerIndex];
    preloadImageUrls([selectedSeedCard.image]);
    setDrawn((prev) => {
      const current = prev[seedLayer.key];
      if (current?.length === 1 && current[0]?.id === selectedSeedCard.id) return prev;
      return { ...prev, [seedLayer.key]: [selectedSeedCard] };
    });
    setStep((prev) => (prev < 1 ? 1 : prev));
  }, [isSequential, manualSeedEnabled, selectedSeedCard, revealOrder]);

  useEffect(() => {
    if (revealMode === "freestyle" || !isSequential) return;
    if (step === 0) return;
    const layerIndex = effectiveRevealOrder[step - 1];
    const openedLayer = LAYERS[layerIndex];
    const target = layerRefs.current[openedLayer.key];
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, [step, effectiveRevealOrder, revealMode, isSequential]);

  useEffect(() => {
    // Keep only the shared card-back warm to avoid eager loading every card asset.
    const img = new Image();
    img.src = cardBackImage;
  }, [cardBackImage]);

  const assignSephirahNode = useCallback((n: number) => (el: HTMLDivElement | null) => {
    if (n < 1 || n > 10) return;
    sephirahSlotRef.current[n - 1] = el;
  }, []);

  const recomputeTreeLayout = useCallback(() => {
    const root = treeLayoutRootRef.current;
    if (!root) return;
    const w = root.offsetWidth;
    const h = root.offsetHeight;
    if (w < 2 || h < 2) return;
    const rroot = root.getBoundingClientRect();
    const points: (null | { x: number; y: number })[] = Array.from({ length: 10 }, () => null);
    for (let i = 0; i < 10; i++) {
      const el = sephirahSlotRef.current[i];
      if (!el) continue;
      const re = el.getBoundingClientRect();
      if (re.width < 0.5 && re.height < 0.5) continue;
      points[i] = {
        x: re.left - rroot.left + re.width / 2,
        y: re.top - rroot.top + re.height / 2
      };
    }
    setTreeLayout({ w, h, points });
  }, []);

  const cardsByLayer = useMemo<ReactNode[][]>(
    () =>
      LAYERS.map((layer, layerIdx) => {
        const op = LAYER_OPERATOR_LABELS[layerIdx];

        if (revealMode === "freestyle") {
          const cards = drawn[layer.key] ?? [];
          return cards.map((card, idx) => {
            const slotKey = `${layer.key}__${idx}`;
            const s = sephirahForLayerSlot(layerIdx, idx);
            const up = Boolean(freestyleFaceUp[slotKey]);
            if (up) {
              return (
                <div key={slotKey} ref={s > 0 ? assignSephirahNode(s) : undefined} className="spread-tile spread-card-back-shell border">
                  <RevealedCardButton
                    card={card}
                    cardBackSrc={cardBackImage}
                    onOpen={() => setSelectedModalPick({ cardId: card.id, sephirah: s })}
                  />
                </div>
              );
            }
            return (
              <div
                key={slotKey}
                ref={s > 0 ? assignSephirahNode(s) : undefined}
                className="spread-tile-back spread-card-back-shell border border-dashed"
              >
                <button
                  type="button"
                  onClick={() => revealFreestyleSlot(slotKey, card, op)}
                  aria-label={`Reveal card (${op})`}
                  className="block h-full w-full min-h-0 overflow-hidden rounded-lg border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                >
                  <img
                    src={cardBackImage}
                    alt=""
                    className="spread-card-back-img"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                  <span className="sr-only">Card back — tap to reveal</span>
                </button>
              </div>
            );
          });
        }

        const opened = (drawn[layer.key]?.length ?? 0) > 0;
        const nextLayerIndex = step < LAYERS.length ? effectiveRevealOrder[step] : -1;
        const isNextLayer = layerIdx === nextLayerIndex;

        if (opened) {
          const cards = drawn[layer.key] ?? [];
          return cards.map((card, cardIdx) => {
            const s = sephirahForLayerSlot(layerIdx, cardIdx);
            return (
              <div key={card.id} ref={s > 0 ? assignSephirahNode(s) : undefined} className="spread-tile spread-card-back-shell border">
                <RevealedCardButton
                  card={card}
                  cardBackSrc={cardBackImage}
                  onOpen={() => setSelectedModalPick({ cardId: card.id, sephirah: s })}
                />
              </div>
            );
          });
        }

        return Array.from({ length: layer.drawCount }, (_, placeholderIdx) => {
          const placeholderKey = `${layer.key}-placeholder-${placeholderIdx}`;
          const s = sephirahForLayerSlot(layerIdx, placeholderIdx);
          if (isNextLayer) {
            return (
              <div
                key={placeholderKey}
                ref={s > 0 ? assignSephirahNode(s) : undefined}
                className="spread-tile-back spread-card-back-shell border border-dashed"
              >
                <button
                  type="button"
                  onClick={jumpToNextAndReveal}
                  aria-label={`Draw — same as control (${step + 1}/6, ${op})`}
                  className="block h-full w-full min-h-0 overflow-hidden rounded-lg border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                >
                  <img
                    src={cardBackImage}
                    alt=""
                    className="spread-card-back-img"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                  <span className="sr-only">Card back — tap to draw this layer</span>
                </button>
              </div>
            );
          }
          return (
            <div
              key={placeholderKey}
              ref={s > 0 ? assignSephirahNode(s) : undefined}
              className="spread-tile-back spread-card-back-shell border border-dashed"
            >
              <button
                type="button"
                onClick={jumpToNextAndReveal}
                aria-label="Card back (tap to jump to next draw)"
                className="block h-full w-full min-h-0 overflow-hidden rounded-lg border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
              >
                <img
                  src={cardBackImage}
                  alt=""
                  className="spread-card-back-img"
                  loading="lazy"
                  decoding="async"
                />
                <span className="sr-only">Card back</span>
              </button>
            </div>
          );
        });
      }),
    [
      drawn,
      cardBackImage,
      revealMode,
      freestyleFaceUp,
      revealFreestyleSlot,
      step,
      effectiveRevealOrder,
      assignSephirahNode,
      jumpToNextAndReveal
    ]
  );
  const yetzirahCards = cardsByLayer[4] ?? [];

  useLayoutEffect(() => {
    if (!showTreeOfLife) {
      setTreeLayout(null);
      return;
    }
    recomputeTreeLayout();
    const a = requestAnimationFrame(() => recomputeTreeLayout());
    const root = treeLayoutRootRef.current;
    if (!root) {
      return () => cancelAnimationFrame(a);
    }
    const ro = new ResizeObserver(() => recomputeTreeLayout());
    ro.observe(root);
    return () => {
      cancelAnimationFrame(a);
      ro.disconnect();
    };
  }, [showTreeOfLife, recomputeTreeLayout, cardsByLayer, drawn, revealMode, freestyleFaceUp, step, effectiveRevealOrder]);

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
    <main data-theme={revealMode} className={spread.main}>
      {revealMode === "freestyle" ? (
        <div
          className={`${spread.sephiroticPanel} rounded-lg border border-white/5 bg-black/30 px-2 py-1.5 shadow-lg backdrop-blur-md sm:px-2.5 sm:py-1.5`}
          aria-label="The Sephirotic Trajectory"
        >
          <p className="text-left text-[8px] font-medium leading-snug tracking-[0.2em] text-slate-100/95 sm:text-[10px] sm:leading-tight sm:tracking-[0.16em]">
            THE SEPHIROTIC TRAJECTORY
          </p>
          <div className="mt-1 flex w-full min-w-0 max-w-full flex-wrap items-center justify-start gap-1.5 text-left" role="list">
            {Array.from({ length: TOTAL_SPREAD_CARDS }, (_, i) => {
              const entry = freestyleOrderLog[i];
              if (entry) {
                const n = entry.sephirah;
                return (
                  <button
                    type="button"
                    key={entry.slotKey}
                    role="listitem"
                    onClick={() => scrollToLayer(layerIndexForSephirah(n))}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] transition sm:h-5 sm:w-5 sm:text-[10px] spread-txt-strong ring-1 ring-indigo-200/80 ${
                      n === 10 ? "text-[8px] sm:text-[9px]" : ""
                    }`}
                    title={`Sephirah ${n}`}
                    aria-label={`Reveal ${i + 1}, Sephirah ${n} — scroll to that sphere on the Tree`}
                  >
                    <span className="font-mono tabular-nums" aria-hidden>
                      {n}
                    </span>
                  </button>
                );
              }
              return (
                <span
                  key={`trajectory-pending-${i}`}
                  role="listitem"
                  aria-label={`Trajectory step ${i + 1} of ${TOTAL_SPREAD_CARDS} — not yet taken`}
                  className="box-border flex h-6 w-6 shrink-0 items-center justify-center rounded-full spread-txt-faint ring-1 ring-white/20 sm:h-5 sm:w-5"
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className={`${spread.layerExecutionFixed} rounded-lg border border-white/5 bg-black/30 px-2 py-1.5 shadow-lg backdrop-blur-md sm:px-2.5 sm:py-1.5`}
          aria-label="Layer execution"
        >
          <p className="text-[10px] font-medium tracking-[0.16em] text-slate-100/95 sm:text-[11px]">LAYER EXECUTION</p>
          <div className="mt-1 flex items-center justify-end gap-1.5">
            {LAYER_OPERATOR_LABELS.map((label, idx) => {
              const isActive = litOperatorIndexSet.has(idx);
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => scrollToLayer(idx)}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition sm:h-5 sm:w-5 ${
                    isActive
                      ? "spread-txt-strong ring-1 ring-indigo-200/80"
                      : "spread-txt-faint ring-1 ring-white/20"
                  }`}
                  aria-label={`Scroll to layer ${label}${isActive ? " active" : ""}`}
                >
                  <span className="spread-layer-op-char" aria-hidden>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className={spread.shell}>
        <section className={spread.rail}>
          <div className="flex items-center justify-between gap-2">
            <h1 className={spread.title}>ATHANOR</h1>
            <Link
              href="/manual"
              className="spread-btn-ghost hidden rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] lg:inline-flex"
            >
              MANUAL
            </Link>
          </div>

          {revealMode === "freestyle" ? (
            <div className={spread.controlGrid}>
              <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
                <p className="spread-hint flex items-center text-xs opacity-85">Tap or click cards.</p>
              </div>
              <button type="button" onClick={dealFreestyle} className={spread.resetBtn}>
                Reset
              </button>
            </div>
          ) : (
            <div className={spread.controlGrid}>
              <button type="button" onClick={nextStep} disabled={completed} className={spread.drawBtn}>
                {completed ? "All Revealed" : `Draw (${step + 1}/6)`}
              </button>
              <button type="button" onClick={reset} className={spread.resetBtn}>
                Reset
              </button>
            </div>
          )}

          <div className="mt-2 lg:hidden">
            <button
              type="button"
              onClick={() => setShowMobileAdvancedControls((v) => !v)}
              className="spread-btn-ghost flex w-full items-center justify-center rounded-md px-3 py-2"
              aria-expanded={showMobileAdvancedControls}
              aria-controls="mobile-advanced-controls"
              aria-label={showMobileAdvancedControls ? "Hide controls" : "Show controls"}
            >
              <span
                aria-hidden
                className={`text-lg leading-none opacity-90 transition-transform duration-200 ${
                  showMobileAdvancedControls ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
          </div>

          <div
            id="mobile-advanced-controls"
            className={[
              "overflow-x-visible overflow-y-hidden transition-all duration-200 ease-out",
              showMobileAdvancedControls ? "max-h-[48rem] opacity-100" : "max-h-0 opacity-0 lg:max-h-[48rem] lg:opacity-100",
              "lg:block"
            ].join(" ")}
          >
          <div className="mt-3">
            <div className="flex min-w-0 items-center gap-2">
              <p className="spread-hint text-xs font-medium tracking-wide">Reveal order</p>
              <HelpIconButton label="Global logic help" onClick={() => setIsGlobalHelpOpen(true)} />
              <Link
                href="/manual"
                className="spread-btn-ghost ml-auto rounded-md px-2 py-1 text-[10px] font-semibold tracking-[0.12em] lg:hidden"
              >
                MANUAL
              </Link>
            </div>
          </div>

          <div className={spread.modePillRow} role="group" aria-label="Reveal order mode">
            <button
              type="button"
              onClick={() => selectRevealMode("ascending")}
              className={`spread-mode-pill min-h-10 ${revealMode === "ascending" ? "is-active" : ""}`}
            >
              <span className={revealMode === "ascending" ? "spread-txt-strong" : "spread-txt-faint"}>Ascending</span>
            </button>
            <button
              type="button"
              onClick={() => selectRevealMode("descending")}
              className={`spread-mode-pill min-h-10 ${revealMode === "descending" ? "is-active" : ""}`}
            >
              <span className={revealMode === "descending" ? "spread-txt-strong" : "spread-txt-faint"}>Descending</span>
            </button>
            <button
              type="button"
              onClick={() => selectRevealMode("freestyle")}
              className={`spread-mode-pill min-h-10 ${revealMode === "freestyle" ? "is-active" : ""}`}
            >
              <span
                className={[
                  revealMode === "freestyle" ? "spread-txt-strong" : "spread-txt-faint",
                  "text-[0.6rem] font-semibold tracking-[0.14em] sm:text-[0.7rem] sm:tracking-[0.16em]"
                ].join(" ")}
              >
                Spectrum
              </span>
            </button>
          </div>
          {isSequential ? (
            <div className="mt-2 w-full rounded-lg border border-white/10 bg-black/25 px-2.5 py-2">
              <div className="flex w-full min-w-0 items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={manualSeedEnabled}
                  aria-label={manualSeedEnabled ? "Disable SEED first pick" : "Enable SEED first pick"}
                  disabled={seedLocked}
                  onClick={() => {
                    setManualSeedEnabled((v) => {
                      const next = !v;
                      if (!next) {
                        setManualSeedCardId(null);
                        if (step <= 1) {
                          setStep(0);
                          setDrawn({});
                        }
                      }
                      return next;
                    });
                  }}
                  className={[
                    "seed-mode-pill inline-flex min-h-7 items-center rounded-full border px-2.5 text-[10px] font-semibold tracking-[0.16em] transition",
                    seedLocked
                      ? "border-white/20 bg-white/5 spread-txt-faint opacity-65 cursor-not-allowed"
                      : manualSeedEnabled
                      ? "is-on"
                      : "border-white/25 bg-white/5 spread-txt-faint"
                  ].join(" ")}
                >
                  {revealMode === "descending" ? "WILL" : "GAZE"}
                </button>
                <HelpIconButton
                  label={revealMode === "descending" ? "Help: WILL seed option" : "Help: GAZE seed option"}
                  onClick={() => setSeedHelpTarget(revealMode === "descending" ? "will" : "gaze")}
                />
                {manualSeedEnabled ? (
                  <>
                    <select
                      className="min-w-0 flex-1 rounded-md border border-white/20 bg-black/35 px-2 py-1 text-xs text-slate-100/95 outline-none focus:border-indigo-300/60"
                      value={manualSeedCardId ?? ""}
                      onChange={(e) => setManualSeedCardId(e.target.value || null)}
                      disabled={seedLocked}
                      aria-label="Choose seed card"
                    >
                      <option value="" disabled>
                        Select one...
                      </option>
                      {seedCandidateCards.map((card) => {
                        const seedLabel =
                          revealMode === "descending" ? card.name.replace(/^Ace of\s+/i, "") : card.name;
                        return (
                          <option key={`seed-card-${card.id}`} value={card.id}>
                            {seedLabel}
                          </option>
                        );
                      })}
                    </select>
                  </>
                ) : (
                  <p className="spread-hint text-[10px] leading-tight opacity-90">
                    {revealMode === "descending" ? "OPTION SELECT WILL" : "OPTION SELECT GAZE"}
                  </p>
                )}
              </div>
            </div>
          ) : null}
          {revealMode === "freestyle" ? (
            <div className="mt-2 w-full rounded-lg border border-white/10 bg-black/25 px-2.5 py-2">
              <div className="flex w-full min-w-0 items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={echoEnabled}
                  aria-label={echoEnabled ? "Disable Fate option" : "Enable Fate option"}
                  disabled={echoLocked}
                  onClick={() => {
                    setEchoEnabled((v) => {
                      const next = !v;
                      if (!next) setEchoCardId(null);
                      return next;
                    });
                  }}
                  className={[
                    "seed-mode-pill inline-flex min-h-7 items-center rounded-full border px-2.5 text-[10px] font-semibold tracking-[0.16em] transition",
                    echoLocked
                      ? "border-white/20 bg-white/5 spread-txt-faint opacity-65 cursor-not-allowed"
                      : echoEnabled
                      ? "is-on"
                      : "border-white/25 bg-white/5 spread-txt-faint"
                  ].join(" ")}
                >
                  FATE
                </button>
                <HelpIconButton label="Help: Fate option" onClick={() => setIsEchoHelpOpen(true)} />
                {echoEnabled ? (
                  <select
                    className="min-w-0 flex-1 rounded-md border border-white/20 bg-black/35 px-2 py-1 text-xs text-slate-100/95 outline-none focus:border-indigo-300/60"
                    value={echoCardId ?? ""}
                    onChange={(e) => setEchoCardId(e.target.value || null)}
                    disabled={echoLocked}
                    aria-label="Choose Fate zodiac major"
                  >
                    <option value="" disabled>
                      Select one...
                    </option>
                    {DESTINY.map((card) => (
                      <option key={`echo-card-${card.id}`} value={card.id}>
                        {card.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="spread-hint text-[10px] leading-tight opacity-90">OPTION SELECT FATE</p>
                )}
              </div>
            </div>
          ) : null}
          <div className="mt-2 w-full rounded-lg border border-white/10 bg-black/25 px-2.5 py-2">
            <div className="flex w-full min-w-0 items-center justify-start gap-1.5 sm:gap-2">
              <span
                className="text-[9px] font-semibold leading-none tracking-[0.2em] text-slate-200/90 sm:text-[10px]"
                id="tree-overlay-label"
              >
                OVERLAY
              </span>
              <HelpIconButton
                label="Help: Sephirotic overlay"
                onClick={() => setIsOverlayHelpOpen(true)}
              />
              <button
                type="button"
                id="tree-overlay-switch"
                role="switch"
                aria-checked={showTreeOfLife}
                aria-labelledby="tree-overlay-label"
                title={showTreeOfLife ? "生命の樹オーバーレイ：オン" : "生命の樹オーバーレイ：オフ"}
                onClick={() => setShowTreeOfLife((v) => !v)}
                className={[
                  "overlay-toggle-switch relative h-5 w-9 shrink-0 rounded-full border transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950/80",
                  showTreeOfLife ? "is-on" : null
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "pointer-events-none absolute top-0.5 left-0.5 block h-4 w-4 rounded-full bg-white shadow",
                    "transition-transform duration-200 ease-out will-change-transform",
                    showTreeOfLife ? "translate-x-4" : "translate-x-0"
                  ].join(" ")}
                />
              </button>
            </div>
          </div>
          </div>
        </section>
        <section ref={rightPanelRef} className={spread.canvas}>
          <div ref={treeLayoutRootRef} className="relative z-0 mx-auto w-full max-w-xl">
            {showTreeOfLife && treeLayout ? (
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
                <TreeOfLifeLines layout={treeLayout} />
              </div>
            ) : null}
            <div className="spread-canvas-surface relative z-[1] flex w-full flex-col items-center gap-8 sm:gap-10">
              <div className={spread.worldCard}>
                <p className={spread.worldLabel}>Atziluth</p>
                <div className="flex flex-col items-center">
                  {renderTriadLabel(0, "mb-4")}
                  <div ref={layerRef[LAYERS[0].key]} className="spread-card-row">
                    {cardsByLayer[0]}
                  </div>
                  {renderTriadLabel(1, "mb-4 mt-6 sm:mt-7")}
                  <div ref={layerRef[LAYERS[1].key]} className="spread-card-row--pair-wide">
                    {cardsByLayer[1]}
                  </div>
                </div>
              </div>

              <div className={spread.worldCard}>
                <p className={spread.worldLabel}>Briah</p>
                <div className="flex flex-col items-center">
                  {renderTriadLabel(2, "mb-4")}
                  <div ref={layerRef[LAYERS[2].key]} className="spread-card-row--pair-wide">
                    {cardsByLayer[2]}
                  </div>
                  {renderTriadLabel(3, "mt-7 mb-4 sm:mt-8")}
                  <div ref={layerRef[LAYERS[3].key]} className="spread-card-row">
                    {cardsByLayer[3]}
                  </div>
                </div>
              </div>

              <div className={spread.worldCard}>
                <p className={spread.worldLabel}>Yetzirah</p>
                {renderTriadLabel(4, "mb-4")}
                <div
                  ref={layerRef[LAYERS[4].key]}
                  className="mx-auto grid w-fit max-w-full grid-cols-2 [column-gap:clamp(2.4rem,12vw,10.5rem)] [row-gap:1.2rem] sm:[column-gap:min(10.5rem,36vw)] sm:[row-gap:1.45rem]"
                >
                  {yetzirahCards[0]}
                  {yetzirahCards[1]}
                  <div className="col-span-2 -mt-0.5 flex justify-center pt-1.5 sm:pt-2">{yetzirahCards[2]}</div>
                </div>
              </div>

              <div className={spread.worldCard}>
                <p className={spread.worldLabel}>Assiah</p>
                <div className="flex flex-col items-center">
                  {renderTriadLabel(5, "mb-4")}
                  <div ref={layerRef[LAYERS[5].key]} className="spread-card-row">
                    {cardsByLayer[5]}
                  </div>
                </div>
              </div>
            </div>
            {showTreeOfLife && treeLayout ? (
              <div
                className="pointer-events-none absolute inset-0 z-[2] min-h-0 w-full min-w-0"
                aria-hidden
              >
                <TreePathHitLayer layout={treeLayout} onPathSelect={setSelectedThothPath} />
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <footer className="mx-auto w-full max-w-7xl shrink-0 px-4 py-1 sm:px-6">
        <p className={spread.brandCopyright} aria-label="Copyright and credit">
          © 2026 Beeton &mdash; creator of the ATHANOR system.
        </p>
      </footer>

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
              {activeLayerHelp?.cardLine ? (
                <p className="spread-hint mt-1 text-sm leading-relaxed">{activeLayerHelp.cardLine}</p>
              ) : null}
            </div>
            <ModalCloseButton onClick={() => setActiveHelpKey(null)} />
          </div>
          <div className="spread-hint mt-3 text-sm">{activeLayerHelp ? renderHelpBody(activeLayerHelp.body) : null}</div>
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
              <strong className="spread-triad font-semibold">Descending</strong> is the mode of unfoldment where WILL
              crystallizes into reality through the layered spread.
            </p>
            <p>
              <strong className="spread-triad font-semibold">Ascending</strong> is the mode of analysis where the
              narrative is integrated back toward essence.
            </p>
            <p>
              <strong className="spread-triad font-semibold">Spectrum</strong> bypasses the sequential flow of the Tree,
              allowing for non-linear observation. Use this to sample specific nodes directly through your own will.
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
              Layer 1: <LatexInline tex={"\\mathcal{W}"} /> (WILL) - Primal vector
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

      {isOverlayHelpOpen ? (
        <SpreadDialog
          aria-label="Sephirotic overlay help"
          z="help"
          maxWidth="md"
          onClose={() => setIsOverlayHelpOpen(false)}
        >
          <div className={spread.modalHeader}>
            <div>
              <h3 className="spread-triad text-base font-semibold">The Sephirotic Overlay</h3>
              <p className="spread-hint mt-1 text-xs font-medium tracking-[0.16em] text-indigo-200/75">[OVERLAY]</p>
            </div>
            <ModalCloseButton onClick={() => setIsOverlayHelpOpen(false)} />
          </div>
          <p className="spread-hint mt-3 text-sm leading-relaxed text-indigo-100/80 opacity-80">{OVERLAY_HELP_INTRO}</p>
          <div className="spread-hint mt-3 text-sm text-indigo-100/80 opacity-80">
            {renderHelpBody(OVERLAY_HELP_SECTIONS)}
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            <strong className="spread-triad font-semibold">Formula Rationale:</strong>{" "}
            <span className="text-indigo-100/80 opacity-80">
              The path is an operator: two Sephira (the cards at its ends) are its arguments, and the major arcana
              assigned to that path mediates the result.
            </span>
          </p>
          <p className="spread-hint mt-2 text-sm leading-relaxed text-indigo-100/80 opacity-80">
            Toggle <span className="font-medium tracking-wider text-indigo-100/90">OVERLAY</span> to show or hide the map and
            the path thumbnails; turn it off for an unobstructed read of the cards.
          </p>
          <div className="mt-2 text-sm text-blue-400/95">
            <LatexBlock
              tex={
                "\\mathrm{Result} = T_{\\mathrm{path}}(\\mathrm{Card}_a,\\, \\mathrm{Card}_b)"
              }
            />
          </div>
        </SpreadDialog>
      ) : null}

      {seedHelpTarget ? (
        <SpreadDialog
          aria-label={seedHelpTarget === "will" ? "WILL seed help" : "GAZE seed help"}
          z="help"
          maxWidth="md"
          onClose={() => setSeedHelpTarget(null)}
        >
          <div className={spread.modalHeader}>
            <h3 className="spread-triad text-base font-semibold">
              {seedHelpTarget === "will" ? "WILL Seed Option" : "GAZE Seed Option"}
            </h3>
            <ModalCloseButton onClick={() => setSeedHelpTarget(null)} />
          </div>
          <div className="spread-hint mt-3 space-y-2 text-sm leading-relaxed">
            {seedHelpTarget === "will" ? (
              <>
                <p>
                  In <strong className="spread-triad font-semibold">Descending</strong> mode, this protocol allows you to
                  manually define the origin of the causal chain.
                </p>
                <p>
                  Choose a suit to set the Kether (1) Seed from the four Aces. This selection establishes the primary
                  element of the spread. The first position updates immediately, and subsequent cards will be deployed
                  following the sequential Emanation flow toward Malkuth.
                </p>
              </>
            ) : (
              <>
                <p>
                  In <strong className="spread-triad font-semibold">Ascending</strong> mode, this protocol allows you to
                  lock the observation point on a specific cosmic manifestation within Malkuth (10).
                </p>
                <p>
                  Select a Planetary Major from the dropdown to define the initial &quot;Gaze.&quot; This fixes the
                  physical landing point of the spread. The first card updates immediately, and the deployment then
                  proceeds in the reverse Integration flow toward the source.
                </p>
              </>
            )}
          </div>
        </SpreadDialog>
      ) : null}

      {isEchoHelpOpen ? (
        <SpreadDialog aria-label="Fate option help" z="help" maxWidth="md" onClose={() => setIsEchoHelpOpen(false)}>
          <div className={spread.modalHeader}>
            <h3 className="spread-triad text-base font-semibold">Fate Option</h3>
            <ModalCloseButton onClick={() => setIsEchoHelpOpen(false)} />
          </div>
          <div className="spread-hint mt-3 space-y-2 text-sm leading-relaxed">
            <p>
              In <strong className="spread-triad font-semibold">Spectrum</strong> mode, this protocol establishes a
              harmonic anchor at Tiphareth (6).
            </p>
            <p>
              By fixing a Zodiacal Major as the seed, the system defines a specific archetypal nature as the center of
              the spread. This allows you to observe how that chosen nature resonates through the entire Tree, mapping
              its alignment with higher Will and its manifestation in Reality.
            </p>
          </div>
        </SpreadDialog>
      ) : null}

      {selectedThothPath ? (
        <SpreadDialog
          aria-label="Thoth path"
          z="help"
          maxWidth="md"
          onClose={() => setSelectedThothPath(null)}
        >
          <div className={spread.modalHeader}>
            <img
              src={selectedThothPath.image}
              alt=""
              className="h-[5.5rem] w-[3.9rem] shrink-0 rounded-md border border-white/15 object-cover sm:h-24 sm:w-[4.5rem]"
            />
            <div className="min-w-0 flex-1">
              <h3 className="spread-triad text-base font-semibold">
                Path {selectedThothPath.id} · {selectedThothPath.card}
              </h3>
            </div>
            <ModalCloseButton onClick={() => setSelectedThothPath(null)} />
          </div>
          <div className="spread-hint mt-3 space-y-2 text-sm leading-relaxed">
            <p>
              <span className="text-indigo-100/90">Hebrew letter:</span> {selectedThothPath.letter}
            </p>
            <p>
              <span className="text-indigo-100/90">Vector:</span> Sephirah {selectedThothPath.vector[0]} ↔ {selectedThothPath.vector[1]}
            </p>
            <p>
              <span className="text-indigo-100/90">Function:</span> {selectedThothPath.function}
            </p>
          </div>
        </SpreadDialog>
      ) : null}

      {selectedCard ? (
        <SpreadDialog
          aria-label="Card details"
          z="card"
          maxWidth="wide"
          onClose={() => setSelectedModalPick(null)}
        >
          <div className="flex justify-end">
            <ModalCloseButton onClick={() => setSelectedModalPick(null)} />
          </div>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              {!modalFlankEcho ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={selectedCard.image}
                    alt={selectedCard.name}
                    className="spread-card-modal-art max-w-[min(100%,20rem)]"
                    decoding="async"
                  />
                  <p className="spread-hint text-center text-xs opacity-80">
                    Sephirah {modalSephirah} · Spread position
                  </p>
                  {completed ? (
                    <div className="flex w-full max-w-md flex-col items-center gap-2">
                      <button
                        type="button"
                        className="spread-btn-go rounded-full px-4 py-2 text-xs font-semibold tracking-wide"
                        onClick={() => drawSephirahFlankEcho(modalSephirah)}
                      >
                        Draw Sephirah echoes (L / R)
                      </button>
                      <p className="text-center text-[11px] opacity-70">
                        Two random cards from the remaining deck (spread cards excluded). Each Sephirah keeps one L/R pair.
                      </p>
                    </div>
                  ) : (
                    <p className="max-w-md text-center text-[11px] opacity-70">
                      Unlocks after all {TOTAL_SPREAD_CARDS} spread cards are revealed — then you can add echo cards for every Sephirah.
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
                  <div className="mx-auto grid min-w-[18rem] grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] items-start gap-x-3 gap-y-2 px-1 sm:min-w-0 sm:gap-x-4">
                    <div className="isolate flex min-w-0 flex-col items-center gap-1.5 overflow-hidden px-0.5">
                      <span className="spread-hint text-[10px] font-medium tracking-[0.12em] opacity-85">ECHO L</span>
                      <div className="w-full overflow-hidden rounded-lg">
                        <img
                          src={CARD_INDEX[modalFlankEcho.leftId].image}
                          alt=""
                          className="aspect-[2/3] h-auto w-full max-w-full rounded-lg border border-white/15 object-cover object-center"
                          decoding="async"
                        />
                      </div>
                      <p className="max-w-full text-center text-[9px] leading-snug opacity-90 sm:text-[10px]">
                        {CARD_INDEX[modalFlankEcho.leftId].name}
                      </p>
                    </div>
                    <div className="isolate flex min-w-0 flex-col items-center gap-2 overflow-hidden px-0.5">
                      <span className="spread-hint text-[10px] font-medium tracking-[0.12em] opacity-85">SPREAD</span>
                      {/* triad layout: avoid spread-card-modal-art — it fixes 12×16.8rem and overflows narrow columns */}
                      <div className="relative w-full max-w-[9rem] overflow-hidden rounded-lg sm:max-w-[11rem]">
                        <img
                          src={selectedCard.image}
                          alt={selectedCard.name}
                          className="aspect-[2/3] h-auto w-full max-w-full rounded-lg border border-white/15 object-cover object-center"
                          decoding="async"
                        />
                      </div>
                      <p className="text-center text-[11px] opacity-80">Sephirah {modalSephirah}</p>
                    </div>
                    <div className="isolate flex min-w-0 flex-col items-center gap-1.5 overflow-hidden px-0.5">
                      <span className="spread-hint text-[10px] font-medium tracking-[0.12em] opacity-85">ECHO R</span>
                      <div className="w-full overflow-hidden rounded-lg">
                        <img
                          src={CARD_INDEX[modalFlankEcho.rightId].image}
                          alt=""
                          className="aspect-[2/3] h-auto w-full max-w-full rounded-lg border border-white/15 object-cover object-center"
                          decoding="async"
                        />
                      </div>
                      <p className="max-w-full text-center text-[9px] leading-snug opacity-90 sm:text-[10px]">
                        {CARD_INDEX[modalFlankEcho.rightId].name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="spread-hint min-w-0 flex-1 text-sm leading-relaxed lg:max-w-md">
              <h3 className="spread-triad text-base font-semibold">{selectedCardModalTitle}</h3>
              <div className="mt-2 grid grid-cols-1 gap-x-5 gap-y-1.5 md:grid-cols-2">
                {selectedCard.suit ? <p className="min-w-0 leading-snug">Suit: {selectedCard.suit}</p> : null}
                {showRankInModal ? (
                  <p className="min-w-0 leading-snug">
                    Rank: {selectedCard.arcanaTitle ? `${selectedCard.rank} (${selectedCard.arcanaTitle})` : selectedCard.rank}
                  </p>
                ) : null}
                {selectedCard.number ? <p className="min-w-0 leading-snug">Number: {selectedCard.number}</p> : null}
                {elementLine ? <p className="min-w-0 leading-snug">Element: {elementLine}</p> : null}
                {selectedCard.astrology.sign ? (
                  <p className="min-w-0 leading-snug">Sign: {symbolizeSignValue(selectedCard.astrology.sign)}</p>
                ) : null}
                {isSelectedPlanetLayer && selectedCard.astrology.planet ? (
                  <p className="min-w-0 leading-snug">Planet: {symbolizePlanetValue(selectedCard.astrology.planet)}</p>
                ) : null}
                {selectedCard.astrology.modality ? (
                  <p className="min-w-0 leading-snug">Modality: {selectedCard.astrology.modality}</p>
                ) : null}
                {!isSelectedPlanetLayer && selectedCard.astrology.planetRuler ? (
                  <p className="min-w-0 leading-snug">Planet Ruler: {symbolizePlanetValue(selectedCard.astrology.planetRuler)}</p>
                ) : null}
                {isSelectedPlanetLayer && selectedCard.astrology.governingSign ? (
                  <p className="min-w-0 leading-snug">Governing Sign: {symbolizeSignValue(selectedCard.astrology.governingSign)}</p>
                ) : null}
                {selectedCard.dayOfWeek ? <p className="min-w-0 leading-snug">Day: {selectedCard.dayOfWeek}</p> : null}
                {selectedCard.metal ? <p className="min-w-0 leading-snug">Metal: {selectedCard.metal}</p> : null}
                {selectedCard.hebrewLetter ? (
                  <p className="min-w-0 leading-snug md:col-span-2">
                    Hebrew Letter: {formatHebrewLetterLine(selectedCard.hebrewLetter)}
                  </p>
                ) : null}
                {selectedCard.treeOfLifePath ? (
                  <p className="min-w-0 leading-snug md:col-span-2">Path: {selectedCard.treeOfLifePath}</p>
                ) : null}
                {selectedCard.astrology.decanRange ? (
                  <p className="min-w-0 leading-snug">
                    Span: {symbolizeSpan(selectedCard.astrology.decanRange, selectedCard.astrology.sign)}
                  </p>
                ) : null}
                {selectedCard.astrology.dates ? <p className="min-w-0 leading-snug">Dates: {selectedCard.astrology.dates}</p> : null}
              </div>
            </div>
          </div>
        </SpreadDialog>
      ) : null}
    </main>
  );
}
