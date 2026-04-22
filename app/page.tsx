"use client";

import { motion } from "framer-motion";
import { useState } from "react";

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
  { id: "adjustment", name: "Adjustment", image: "/images/adjustment.png" },
  { id: "death", name: "Death", image: "/images/death.png" },
  { id: "art", name: "Art", image: "/images/art.png" },
  { id: "chariot", name: "The Chariot", image: "/images/the-chariot.png" },
  { id: "emperor", name: "The Emperor", image: "/images/the-emperor.png" },
  { id: "empress", name: "The Empress", image: "/images/the-empress.png" },
  { id: "hierophant", name: "The Hierophant", image: "/images/the-hierophant.png" },
  { id: "lovers", name: "The Lovers", image: "/images/the-lovers.png" },
  { id: "hermit", name: "The Hermit", image: "/images/the-hermit.png" },
  { id: "star", name: "The Star", image: "/images/the-star.png" },
  { id: "moon", name: "The Moon", image: "/images/the-moon.png" },
  { id: "sun", name: "The Sun", image: "/images/the-sun.png" }
];

const EVENTS: Card[] = [2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((num) =>
  ["wands", "cups", "swords", "disks"].map((suit) => ({
    id: `${num}-${suit}`,
    name: `${num} of ${cap(suit)}`,
    image: `/images/${num}-of-${suit}.png`
  }))
);

const FOCUS: Card[] = [
  { id: "sun", name: "Sun (The Sun)", image: "/images/the-sun.png", note: "意志・顕現" },
  { id: "moon", name: "Moon (The Priestess)", image: "/images/the-priestess.png", note: "直観・受容" },
  { id: "mars", name: "Mars (The Tower)", image: "/images/the-tower.png", note: "突破・変容" },
  { id: "mercury", name: "Mercury (The Magus)", image: "/images/the-magus.png", note: "言語化・橋渡し" },
  { id: "jupiter", name: "Jupiter (Fortune)", image: "/images/fortune.png", note: "拡張・流転" },
  { id: "venus", name: "Venus (The Empress)", image: "/images/the-empress.png", note: "調和・引力" },
  { id: "saturn", name: "Saturn (The Universe)", image: "/images/the-universe.png", note: "統合・完成" }
];

const LAYERS: Layer[] = [
  { key: "root", title: "第1層 Root", meaning: "物語の種・根源的な意志・季節", drawCount: 1, pool: ACES },
  { key: "womb", title: "第2層 Womb", meaning: "舞台設定・具現化の土壌", drawCount: 1, pool: PRINCESSES },
  { key: "agents", title: "第3層 Agents", meaning: "動因となる2つの人格", drawCount: 2, pool: AGENTS },
  { key: "destiny", title: "第4層 Destiny", meaning: "避けられない運命の潮流", drawCount: 1, pool: DESTINY },
  { key: "events", title: "第5層 Events", meaning: "出来事の推移（過去・現在・未来）", drawCount: 3, pool: EVENTS },
  { key: "focus", title: "第6層 Focus", meaning: "物語を読む最終的な視点", drawCount: 1, pool: FOCUS }
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
            className="h-[5.6rem] w-16 object-cover object-center sm:h-[6.4rem] sm:w-[4.8rem]"
            loading="lazy"
          />
        </div>
      ));
    }

    return Array.from({ length: layer.drawCount }, (_, placeholderIdx) => (
      <div
        key={`${layer.key}-placeholder-${placeholderIdx}`}
        className="flex h-[5.6rem] w-16 items-center justify-center rounded-lg border border-dashed border-indigo-200/30 bg-slate-950/30 text-[10px] text-indigo-200/45 sm:h-[6.4rem] sm:w-[4.8rem]"
      >
        ?
      </div>
    ));
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <section className="rounded-2xl border border-indigo-100/10 bg-white/5 p-5 shadow-glow backdrop-blur-md">
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
              {completed ? "全レイヤー展開済み" : `カードをめくる（${step + 1}/6）`}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-white/5 px-5 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/20 transition hover:bg-white/10"
            >
              引き直す
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-indigo-100/10 bg-white/5 px-4 py-6 shadow-glow backdrop-blur-md sm:px-8">
          <div className="flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              {renderCards(0)}
            </motion.div>
            <div className="h-5 w-px bg-indigo-200/40" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              {renderCards(1)}
            </motion.div>
            <div className="h-4 w-px bg-indigo-200/40" />
            <div className="h-px w-40 bg-indigo-200/40" />
            <div className="mb-1 mt-1 h-4 w-px bg-indigo-200/40" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
              {renderCards(2)}
            </motion.div>
            <div className="h-5 w-px bg-indigo-200/40" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              {renderCards(3)}
            </motion.div>
            <div className="h-5 w-px bg-indigo-200/40" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              {renderCards(4)}
            </motion.div>
            <div className="h-5 w-px bg-indigo-200/40" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              {renderCards(5)}
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
