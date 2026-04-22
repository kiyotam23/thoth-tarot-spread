"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
    drawCount: 1,
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
  const layerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const completed = step === LAYERS.length;
  const nextStep = () => {
    if (step >= LAYERS.length) return;
    const layer = LAYERS[step];
    setDrawn((prev) => ({ ...prev, [layer.key]: drawUnique(layer.pool, layer.drawCount) }));
    setStep((prev) => prev + 1);
  };

  const reset = () => {
    setDrawn({});
    setStep(0);
  };

  useEffect(() => {
    if (step === 0) return;
    const openedLayer = LAYERS[step - 1];
    const target = layerRefs.current[openedLayer.key];
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, [step]);

  function renderCards(layerIndex: number) {
    const layer = LAYERS[layerIndex];
    const opened = layerIndex < step;

    if (opened) {
      const cards = drawn[layer.key] ?? [];
      return cards.map((card) => (
        <div
          key={card.id}
          className="overflow-hidden rounded-lg border border-white/15 bg-slate-950/50 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
        >
          <img
            src={card.image}
            alt={card.name}
            className="h-[7.2rem] w-[5.2rem] object-cover object-center sm:h-[8.4rem] sm:w-[6rem]"
            loading="lazy"
          />
        </div>
      ));
    }

    return Array.from({ length: layer.drawCount }, (_, placeholderIdx) => (
      <div
        key={`${layer.key}-placeholder-${placeholderIdx}`}
        className="flex h-[7.2rem] w-[5.2rem] items-center justify-center rounded-lg border border-dashed border-indigo-200/30 bg-slate-950/30 text-[10px] text-indigo-200/45 sm:h-[8.4rem] sm:w-[6rem]"
      >
        ?
      </div>
    ));
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <section className="rounded-2xl border border-indigo-100/10 bg-white/5 p-5 shadow-glow backdrop-blur-md lg:sticky lg:top-4 lg:self-start">
          <h1 className="text-2xl font-semibold tracking-wide text-indigo-100 sm:text-3xl">
            The Great Wheel Spread
          </h1>

          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={nextStep}
              disabled={completed}
              className="rounded-full bg-indigo-400/20 px-5 py-2 text-sm font-medium text-indigo-100 ring-1 ring-indigo-200/30 backdrop-blur transition hover:bg-indigo-300/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {completed ? "All Layers Revealed" : `Draw Next Layer (${step + 1} of 6)`}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-white/5 px-5 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/20 transition hover:bg-white/10"
            >
              Reset Spread
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-indigo-100/10 bg-white/5 px-4 py-6 shadow-glow backdrop-blur-md sm:px-8">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md rounded-xl border border-indigo-200/20 bg-slate-950/25 p-3"
            >
              <p className="mb-3 text-center text-xs font-medium tracking-[0.12em] text-indigo-200/80">Atziluth</p>
              <div
                ref={(el) => {
                  layerRefs.current[LAYERS[5].key] = el;
                }}
                className="flex flex-col items-center"
              >
                <p className="mb-3 text-center text-sm font-semibold tracking-wide text-indigo-100/90">
                  {LAYERS[5].triad.join(" — ")}
                </p>
                <div className="flex justify-center gap-3">{renderCards(5)}</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md rounded-xl border border-indigo-200/20 bg-slate-950/25 p-3"
            >
              <p className="mb-3 text-center text-xs font-medium tracking-[0.12em] text-indigo-200/80">Briah</p>
              <div className="flex flex-col items-center">
                <div
                  ref={(el) => {
                    layerRefs.current[LAYERS[4].key] = el;
                  }}
                >
                  <p className="mb-3 text-center text-sm font-semibold tracking-wide text-indigo-100/90">
                    {LAYERS[4].triad.join(" — ")}
                  </p>
                  <div className="flex justify-center gap-3">{renderCards(4)}</div>
                </div>
                <p className="mt-4 mb-3 text-center text-sm font-semibold tracking-wide text-indigo-100/90">
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
              className="w-full max-w-md rounded-xl border border-indigo-200/20 bg-slate-950/25 p-3"
            >
              <p className="mb-3 text-center text-xs font-medium tracking-[0.12em] text-indigo-200/80">Yetzirah</p>
              <p className="mb-3 text-center text-sm font-semibold tracking-wide text-indigo-100/90">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md rounded-xl border border-indigo-200/20 bg-slate-950/25 p-3"
            >
              <p className="mb-3 text-center text-xs font-medium tracking-[0.12em] text-indigo-200/80">Assiah</p>
              <div className="flex flex-col items-center">
                <p className="mb-3 text-center text-sm font-semibold tracking-wide text-indigo-100/90">
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
                <p className="mt-4 mb-3 text-center text-sm font-semibold tracking-wide text-indigo-100/90">
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
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={nextStep}
          disabled={completed}
          className="rounded-full bg-indigo-400/30 px-3 py-2 text-xs font-medium text-indigo-50 ring-1 ring-indigo-200/40 backdrop-blur transition hover:bg-indigo-300/35 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {completed ? "Complete" : `Next (${step + 1} of 6)`}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-100 ring-1 ring-white/30 backdrop-blur transition hover:bg-slate-800/80"
        >
          Reset
        </button>
      </div>
    </main>
  );
}
