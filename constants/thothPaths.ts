/**
 * Thoth Tarot — 22 paths (Liber 777 paths 11–32, Sepher Yetzirah order).
 * Path id = 777/Yetzirah number. Hebrew letter and geometry are fixed; which
 * Atu goes on a path is Thoth/Book of T per Crowley.
 *
 * AL II:76 “Tzaddi is not the Star”: Heh=path 15=The Star (2–6), Tzaddi=path
 * 28=The Emperor (7–9). 777: Peh=path 27=The Tower (7–8). Teth=19=Lust, Lamed=22=Adjustment.
 * See also ZODIAC_DESTINY in cards.ts.
 */

export type ThothPath = {
  id: number;
  card: string;
  /** `/public` からの相対パス（樹上サムネとモーダル） */
  image: string;
  letter: string;
  /** Sephirah numbers 1–10 (Keter…Malkuth) */
  vector: readonly [number, number];
  function: string;
};

export const THOTH_PATHS: ThothPath[] = [
  { id: 11, card: "0. The Fool", image: "/images/the-fool.png", letter: "Aleph", vector: [1, 2], function: "Potentiality" },
  { id: 12, card: "I. The Magus", image: "/images/the-magus.png", letter: "Beth", vector: [1, 3], function: "Manifestation" },
  { id: 13, card: "II. The High Priestess", image: "/images/the-priestess.png", letter: "Gimel", vector: [1, 6], function: "Direct Sync" },
  { id: 14, card: "III. The Empress", image: "/images/the-empress.png", letter: "Daleth", vector: [2, 3], function: "Synergy" },
  { id: 15, card: "XVII. The Star", image: "/images/the-star.png", letter: "Heh", vector: [2, 6], function: "Illumination" },
  { id: 16, card: "V. The Hierophant", image: "/images/the-hierophant.png", letter: "Vau", vector: [2, 4], function: "Orthodoxy" },
  { id: 17, card: "VI. The Lovers", image: "/images/the-lovers.png", letter: "Zayin", vector: [3, 6], function: "Bifurcation" },
  { id: 18, card: "VII. The Chariot", image: "/images/the-chariot.png", letter: "Cheth", vector: [3, 5], function: "Propulsion" },
  { id: 19, card: "XI. Lust", image: "/images/lust.png", letter: "Teth", vector: [4, 5], function: "Convergence" },
  { id: 20, card: "IX. The Hermit", image: "/images/the-hermit.png", letter: "Yod", vector: [4, 6], function: "Extraction" },
  { id: 21, card: "X. Fortune", image: "/images/fortune.png", letter: "Kaph", vector: [4, 7], function: "Cyclicity" },
  { id: 22, card: "VIII. Adjustment", image: "/images/adjustment.png", letter: "Lamed", vector: [5, 6], function: "Equilibrium" },
  { id: 23, card: "XII. The Hanged Man", image: "/images/the-hanged-man.png", letter: "Mem", vector: [5, 8], function: "Refactoring" },
  { id: 24, card: "XIII. Death", image: "/images/death.png", letter: "Nun", vector: [6, 7], function: "Termination" },
  { id: 25, card: "XIV. Art", image: "/images/art.png", letter: "Samekh", vector: [6, 9], function: "Synthesis" },
  { id: 26, card: "XV. The Devil", image: "/images/the-devil.png", letter: "Ayin", vector: [6, 8], function: "Hard-coding" },
  { id: 27, card: "XVI. The Tower", image: "/images/the-tower.png", letter: "Peh", vector: [7, 8], function: "Hard Reset" },
  { id: 28, card: "IV. The Emperor", image: "/images/the-emperor.png", letter: "Tzaddi", vector: [7, 9], function: "Structure" },
  { id: 29, card: "XVIII. The Moon", image: "/images/the-moon.png", letter: "Qoph", vector: [7, 10], function: "Projection" },
  { id: 30, card: "XIX. The Sun", image: "/images/the-sun.png", letter: "Resh", vector: [8, 9], function: "Articulation" },
  { id: 31, card: "XX. The Aeon", image: "/images/the-aeon.png", letter: "Shin", vector: [8, 10], function: "Finalization" },
  { id: 32, card: "XXI. The Universe", image: "/images/the-universe.png", letter: "Tau", vector: [9, 10], function: "Deployment" }
];
