"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

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

function drawUnique(pool: Card[], count: number): Card[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Page() {
  const [step, setStep] = useState(0);
  const [drawn, setDrawn] = useState<Record<string, Card[]>>({});
  /** true = descending: first reveal = Layer 1 (Atziluth, top) … last = Layer 6 (Assiah, bottom) */
  const [revealAtziluthToAssiah, setRevealAtziluthToAssiah] = useState(true);
  const layerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const cardBackImage = "/images/card_back.jpg";

  const revealOrder = useMemo(
    () => (revealAtziluthToAssiah ? REVEAL_ATZILUTH_TO_ASSIAH : REVEAL_ASSIAH_TO_ATZILUTH),
    [revealAtziluthToAssiah]
  );

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
          <img
            src={card.image}
            alt={card.name}
            className="h-[7.2rem] w-[5.2rem] object-cover object-center sm:h-[8.4rem] sm:w-[6rem]"
            loading="lazy"
          />
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
            <p className="spread-hint text-xs font-medium tracking-wide">Reveal order</p>
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
                <p className="spread-triad mb-3 text-center text-sm font-semibold tracking-wide">
                  {LAYERS[0].triad.join(" — ")}
                </p>
                <div
                  ref={(el) => {
                    layerRefs.current[LAYERS[0].key] = el;
                  }}
                  className="flex justify-center gap-3"
                >
                  {renderCards(0)}
                </div>
                <p className="spread-triad mt-4 mb-3 text-center text-sm font-semibold tracking-wide">
                  {LAYERS[1].triad.join(" — ")}
                </p>
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
                <p className="spread-triad mb-3 text-center text-sm font-semibold tracking-wide">
                  {LAYERS[2].triad.join(" — ")}
                </p>
                <div
                  ref={(el) => {
                    layerRefs.current[LAYERS[2].key] = el;
                  }}
                  className="flex justify-center gap-3"
                >
                  {renderCards(2)}
                </div>
                <p className="spread-triad mt-4 mb-3 text-center text-sm font-semibold tracking-wide">
                  {LAYERS[3].triad.join(" — ")}
                </p>
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
              <p className="spread-triad mb-3 text-center text-sm font-semibold tracking-wide">
                {LAYERS[4].triad.join(" — ")}
              </p>
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
                <p className="spread-triad mb-3 text-center text-sm font-semibold tracking-wide">
                  {LAYERS[5].triad.join(" — ")}
                </p>
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
    </main>
  );
}
