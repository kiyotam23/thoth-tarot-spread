import { CARD_INDEX, type AstrologyMeta, type ThothCardMeta } from "../constants/cards";
import { THOTH_PATHS } from "../constants/thothPaths";
import { ASPECT_ORB, detectAspects, type SpreadCardRef } from "./aspectEngine";

export type CardRef = { id: string; name: string; sephirah: number };

export type PathRef = {
  id: number;
  card: string;
  letter: string;
  function: string;
  vector: [number, number];
};

export type ExportCard = CardRef & {
  suit?: string | null;
  rank?: string | null;
  number?: number | null;
  elementalAttribution?: string | null;
  treeOfLifePath?: string | null;
  astrology?: AstrologyMeta;
};

export type PillarSlot = {
  sephiroth: number[];
  cards: CardRef[];
  elements: string[];
  suits: string[];
};

export type PillarCensus = {
  mercy: PillarSlot;
  severity: PillarSlot;
  equilibrium: PillarSlot;
  balance: {
    elementCounts: Record<string, number>;
    dominantElement: string | null;
    missingElements: string[];
    pillarElementProfile: {
      mercy: string | null;
      severity: string | null;
      equilibrium: string | null;
    };
    overloadedPillar: "mercy" | "severity" | "equilibrium" | null;
  };
};

export type Census = {
  elements: Record<string, number>;
  suits: Record<string, number>;
  modalities: Record<string, number>;
  missing: {
    elements: string[];
    suits: string[];
    modalities: string[];
  };
  modalityNote: {
    signCardCount: number;
    dominantModality: string | null;
  };
};

export type DualityFlag = {
  cardId: string;
  cardName: string;
  sephirah: number;
  kind: "dual-planet" | "dual-element" | "sephirah-gap";
  a: string;
  b: string;
  match: boolean;
};

export type Resonance = {
  cardA: CardRef;
  cardB: CardRef;
  sharedSign: string | null;
  sharedPlanet: string | null;
  aspect: { name: string; angle: number; orb: number } | null;
  path: PathRef | null;
};

export type PathAdjacency = {
  sephA: number;
  sephB: number;
  path: PathRef | null;
};

export type MajorPathLanding = {
  cardId: string;
  cardName: string;
  sephirah: number;
  ownPath: { vector: [number, number]; card: string; function: string };
  landsOnOccupied: Array<{
    targetSephirah: number;
    cardId: string;
    cardName: string;
  }>;
};

export type ResonanceClusters = {
  byPlanet: Record<string, CardRef[]>;
  bySign: Record<string, CardRef[]>;
  byElement: Record<string, CardRef[]>;
};

export type ModalityNote = {
  counts: {
    Cardinal: number;
    Fixed: number;
    Mutable: number;
  };
  signCardCount: number;
  dominantModality: string | null;
  missing: string[];
};

export type SpreadAnalysis = {
  pillars: PillarCensus;
  census: Census;
  dualityFlags: DualityFlag[];
  resonances: Resonance[];
  pathMatrix: PathAdjacency[];
  majorPathLandings: MajorPathLanding[];
  resonanceClusters: ResonanceClusters;
  modalityNote: ModalityNote;
};

const PILLAR_OF_SEPHIRAH: Record<number, "mercy" | "severity" | "equilibrium"> = {
  2: "mercy",
  4: "mercy",
  7: "mercy",
  3: "severity",
  5: "severity",
  8: "severity",
  1: "equilibrium",
  6: "equilibrium",
  9: "equilibrium",
  10: "equilibrium"
};

const PILLAR_SEPIROTH: Record<"mercy" | "severity" | "equilibrium", number[]> = {
  mercy: [2, 4, 7],
  severity: [3, 5, 8],
  equilibrium: [1, 6, 9, 10]
};

const ALL_ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;
const ALL_SUITS = ["Wands", "Cups", "Disks", "Swords"] as const;
const ALL_MODALITIES = ["Cardinal", "Fixed", "Mutable"] as const;

const VALID_PLANETS = new Set([
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto"
]);

const PLANETARY_MAJOR_RULERS: Record<string, string> = {
  mercury: "Mercury",
  moon: "Moon",
  venus: "Venus",
  jupiter: "Jupiter",
  mars: "Mars",
  sun: "Sun",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto"
};

const SIGN_RULERS: Record<string, readonly string[]> = {
  Aries: ["Mars"],
  Taurus: ["Venus"],
  Gemini: ["Mercury"],
  Cancer: ["Moon"],
  Leo: ["Sun"],
  Virgo: ["Mercury"],
  Libra: ["Venus"],
  Scorpio: ["Mars", "Pluto"],
  Sagittarius: ["Jupiter"],
  Capricorn: ["Saturn"],
  Aquarius: ["Saturn", "Uranus"],
  Pisces: ["Jupiter", "Neptune"]
};

const RANK_ELEMENTS: Record<string, string> = {
  Knight: "Fire",
  Queen: "Water",
  Prince: "Air",
  Princess: "Earth"
};

const PLANETARY_MAJOR_IDS = new Set([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto"
]);

function sortedPair(a: number, b: number): [number, number] {
  return a < b ? [a, b] : [b, a];
}

function toCardRef(card: ExportCard): CardRef {
  return { id: card.id, name: card.name, sephirah: card.sephirah };
}

function normalizePlanet(raw: string): string | null {
  const trimmed = raw.trim();
  if (VALID_PLANETS.has(trimmed)) return trimmed;

  const match = trimmed.match(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)\b$/);
  return match ? match[1] : null;
}

function isMinorArcana(meta: ThothCardMeta): boolean {
  return meta.number != null && meta.number >= 2 && meta.number <= 10;
}

function isMajorArcana(meta: ThothCardMeta): boolean {
  return meta.suit?.startsWith("Major Arcana") ?? false;
}

function isCourtRank(rank: string | null | undefined): boolean {
  return rank === "Knight" || rank === "Queen" || rank === "Prince" || rank === "Princess";
}

function metaFor(card: ExportCard): ThothCardMeta | undefined {
  return CARD_INDEX[card.id];
}

/** Element for census / clusters — planetary majors return null (skipped). */
function cardElement(card: ExportCard, meta?: ThothCardMeta): string | null {
  const m = meta ?? metaFor(card);
  if (!m) return null;
  if (PLANETARY_MAJOR_IDS.has(m.id)) return null;

  if (m.astrology.element) return m.astrology.element;

  const attr = m.elementalAttribution ?? card.elementalAttribution;
  if (!attr) return null;
  if (!attr.includes(" of ")) return attr;

  const parts = attr.split(" of ");
  return parts[1] ?? null;
}

function parseDualElements(
  meta: ThothCardMeta
): { rankElement: string; suitElement: string } | null {
  const attr = meta.elementalAttribution;
  if (attr?.includes(" of ")) {
    const [rankPart, suitPart] = attr.split(" of ");
    if (rankPart && suitPart) return { rankElement: rankPart, suitElement: suitPart };
  }

  const rankElement = meta.rank ? RANK_ELEMENTS[meta.rank] : null;
  const suitElement = meta.astrology.element;
  if (rankElement && suitElement) return { rankElement, suitElement };
  return null;
}

function findPath(sephA: number, sephB: number): PathRef | null {
  const pair = sortedPair(sephA, sephB);
  const path = THOTH_PATHS.find((p) => {
    const [v0, v1] = sortedPair(p.vector[0], p.vector[1]);
    return v0 === pair[0] && v1 === pair[1];
  });
  if (!path) return null;
  return {
    id: path.id,
    card: path.card,
    letter: path.letter,
    function: path.function,
    vector: [path.vector[0], path.vector[1]]
  };
}

function effectivePlanets(meta: ThothCardMeta): string[] {
  if (meta.rank === "Ace") return [];

  const planetary = PLANETARY_MAJOR_RULERS[meta.id];
  if (planetary) return [planetary];

  const planets = new Set<string>();

  const decan = meta.astrology.planet ? normalizePlanet(meta.astrology.planet) : null;
  if (decan) planets.add(decan);

  if (meta.astrology.numberPlanet) {
    const numberPlanet = normalizePlanet(meta.astrology.numberPlanet);
    if (numberPlanet) planets.add(numberPlanet);
  }

  if (meta.astrology.sign) {
    for (const ruler of SIGN_RULERS[meta.astrology.sign] ?? []) {
      if (VALID_PLANETS.has(ruler)) planets.add(ruler);
    }
  }

  return Array.from(planets);
}

/** Clustering: minors count decan and number planets as separate attributions. */
function clusterPlanets(meta: ThothCardMeta): string[] {
  if (isMinorArcana(meta)) {
    const planets: string[] = [];
    const decan = meta.astrology.planet ? normalizePlanet(meta.astrology.planet) : null;
    if (decan) planets.push(decan);
    if (meta.astrology.numberPlanet) {
      const np = normalizePlanet(meta.astrology.numberPlanet);
      if (np) planets.push(np);
    }
    return planets;
  }
  return effectivePlanets(meta);
}

function dominantKey(counts: Record<string, number>, keys: readonly string[]): string | null {
  let best: string | null = null;
  let bestCount = 0;
  let tied = false;

  for (const key of keys) {
    const count = counts[key] ?? 0;
    if (count > bestCount) {
      best = key;
      bestCount = count;
      tied = false;
    } else if (count === bestCount && count > 0) {
      tied = true;
    }
  }

  return tied ? null : best;
}

function emptyCounts(keys: readonly string[]): Record<string, number> {
  return Object.fromEntries(keys.map((k) => [k, 0]));
}

function computePillarCensus(cards: ExportCard[]): PillarCensus {
  const slots: Record<"mercy" | "severity" | "equilibrium", PillarSlot> = {
    mercy: { sephiroth: PILLAR_SEPIROTH.mercy, cards: [], elements: [], suits: [] },
    severity: { sephiroth: PILLAR_SEPIROTH.severity, cards: [], elements: [], suits: [] },
    equilibrium: { sephiroth: PILLAR_SEPIROTH.equilibrium, cards: [], elements: [], suits: [] }
  };

  const elementCounts = emptyCounts(ALL_ELEMENTS);

  for (const card of cards) {
    const meta = metaFor(card);
    const pillar = PILLAR_OF_SEPHIRAH[card.sephirah];
    if (!pillar) continue;

    const ref = toCardRef(card);
    slots[pillar].cards.push(ref);

    const element = cardElement(card, meta);
    if (element) {
      slots[pillar].elements.push(element);
      elementCounts[element] = (elementCounts[element] ?? 0) + 1;
    }

    const suit = meta?.suit ?? card.suit;
    if (suit && suit !== "Major Arcana (Zodiac)" && suit !== "Major Arcana (Planetary)") {
      slots[pillar].suits.push(suit);
    }
  }

  const pillarElementProfile = {
    mercy: dominantKey(
      Object.fromEntries(ALL_ELEMENTS.map((e) => [e, slots.mercy.elements.filter((x) => x === e).length])),
      ALL_ELEMENTS
    ),
    severity: dominantKey(
      Object.fromEntries(
        ALL_ELEMENTS.map((e) => [e, slots.severity.elements.filter((x) => x === e).length])
      ),
      ALL_ELEMENTS
    ),
    equilibrium: dominantKey(
      Object.fromEntries(
        ALL_ELEMENTS.map((e) => [e, slots.equilibrium.elements.filter((x) => x === e).length])
      ),
      ALL_ELEMENTS
    )
  };

  const pillarCounts = {
    mercy: slots.mercy.cards.length,
    severity: slots.severity.cards.length,
    equilibrium: slots.equilibrium.cards.length
  };
  const maxCards = Math.max(pillarCounts.mercy, pillarCounts.severity, pillarCounts.equilibrium);
  const overloaded = (["mercy", "severity", "equilibrium"] as const).filter(
    (p) => pillarCounts[p] === maxCards
  );
  const overloadedPillar = overloaded.length === 1 ? overloaded[0]! : null;

  return {
    mercy: slots.mercy,
    severity: slots.severity,
    equilibrium: slots.equilibrium,
    balance: {
      elementCounts,
      dominantElement: dominantKey(elementCounts, ALL_ELEMENTS),
      missingElements: ALL_ELEMENTS.filter((e) => (elementCounts[e] ?? 0) === 0),
      pillarElementProfile,
      overloadedPillar
    }
  };
}

function computeCensus(cards: ExportCard[]): Census {
  const elements = emptyCounts(ALL_ELEMENTS);
  const suits = emptyCounts(ALL_SUITS);
  const modalities = emptyCounts(ALL_MODALITIES);
  let signCardCount = 0;

  for (const card of cards) {
    const meta = metaFor(card);
    const element = cardElement(card, meta);
    if (element) elements[element] = (elements[element] ?? 0) + 1;

    const suit = meta?.suit ?? card.suit;
    if (suit && (ALL_SUITS as readonly string[]).includes(suit)) {
      suits[suit] = (suits[suit] ?? 0) + 1;
    }

    const modality = meta?.astrology.modality ?? card.astrology?.modality;
    if (modality && (ALL_MODALITIES as readonly string[]).includes(modality)) {
      modalities[modality] = (modalities[modality] ?? 0) + 1;
      signCardCount += 1;
    }
  }

  return {
    elements,
    suits,
    modalities,
    missing: {
      elements: ALL_ELEMENTS.filter((e) => (elements[e] ?? 0) === 0),
      suits: ALL_SUITS.filter((s) => (suits[s] ?? 0) === 0),
      modalities: ALL_MODALITIES.filter((m) => (modalities[m] ?? 0) === 0)
    },
    modalityNote: {
      signCardCount,
      dominantModality: dominantKey(modalities, ALL_MODALITIES)
    }
  };
}

function computeDualityFlags(cards: ExportCard[]): DualityFlag[] {
  const flags: DualityFlag[] = [];

  for (const card of cards) {
    const meta = metaFor(card);
    if (!meta) continue;

    if (isMinorArcana(meta)) {
      const decan = meta.astrology.planet ? normalizePlanet(meta.astrology.planet) : null;
      const numberPlanet = meta.astrology.numberPlanet
        ? normalizePlanet(meta.astrology.numberPlanet)
        : null;
      if (decan && numberPlanet) {
        flags.push({
          cardId: card.id,
          cardName: card.name,
          sephirah: card.sephirah,
          kind: "dual-planet",
          a: decan,
          b: numberPlanet,
          match: decan === numberPlanet
        });
      }

      const numberSephirah = meta.number ?? card.number;
      if (numberSephirah != null) {
        flags.push({
          cardId: card.id,
          cardName: card.name,
          sephirah: card.sephirah,
          kind: "sephirah-gap",
          a: String(card.sephirah),
          b: String(numberSephirah),
          match: card.sephirah === numberSephirah
        });
      }
    }

    if (isCourtRank(meta.rank)) {
      const dual = parseDualElements(meta);
      if (dual) {
        flags.push({
          cardId: card.id,
          cardName: card.name,
          sephirah: card.sephirah,
          kind: "dual-element",
          a: dual.rankElement,
          b: dual.suitElement,
          match: dual.rankElement === dual.suitElement
        });
      }
    }
  }

  return flags;
}

function orderedPairKey(a: SpreadCardRef, b: SpreadCardRef): string {
  const [left, right] = a.id < b.id ? [a, b] : [b, a];
  return `${left.id}|${right.id}`;
}

function computeResonances(cards: ExportCard[]): Resonance[] {
  const refs = cards.map(toCardRef);
  const aspects = detectAspects(refs);
  const aspectsByPair = new Map<string, typeof aspects>();

  for (const aspect of aspects) {
    const key = orderedPairKey(aspect.cardA, aspect.cardB);
    const list = aspectsByPair.get(key) ?? [];
    list.push(aspect);
    aspectsByPair.set(key, list);
  }

  const results: Resonance[] = [];

  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const cardA = refs[i]!;
      const cardB = refs[j]!;
      const metaA = metaFor(cards[i]!);
      const metaB = metaFor(cards[j]!);

      const signA = metaA?.astrology.sign ?? cards[i]!.astrology?.sign;
      const signB = metaB?.astrology.sign ?? cards[j]!.astrology?.sign;
      const sharedSign = signA && signB && signA === signB ? signA : null;

      const pairAspects = aspectsByPair.get(orderedPairKey(cardA, cardB)) ?? [];
      const sharedRuler = pairAspects.find((a) => a.aspect === "Shared-ruler");
      const sharedPlanet = sharedRuler?.sharedPlanet ?? null;

      const angular = pairAspects.find((a) => a.aspect !== "Shared-ruler");
      const aspect =
        angular && angular.angle != null && angular.orb != null
          ? { name: angular.aspect, angle: angular.angle, orb: angular.orb }
          : null;

      const path = findPath(cardA.sephirah, cardB.sephirah);

      if (!sharedSign && !sharedPlanet && !aspect) continue;

      results.push({
        cardA,
        cardB,
        sharedSign,
        sharedPlanet,
        aspect,
        path
      });
    }
  }

  return results;
}

function computePathMatrix(cards: ExportCard[]): PathAdjacency[] {
  const sephiroth = Array.from(new Set(cards.map((c) => c.sephirah))).sort((a, b) => a - b);
  const matrix: PathAdjacency[] = [];

  for (let i = 0; i < sephiroth.length; i += 1) {
    for (let j = i + 1; j < sephiroth.length; j += 1) {
      const sephA = sephiroth[i]!;
      const sephB = sephiroth[j]!;
      matrix.push({ sephA, sephB, path: findPath(sephA, sephB) });
    }
  }

  return matrix;
}

function findOwnPathForMajor(meta: ThothCardMeta): PathRef | null {
  if (!meta.arcanaTitle) return null;
  const title = meta.arcanaTitle;
  const path = THOTH_PATHS.find((p) => p.card.endsWith(title) || p.card.includes(title));
  if (!path) return null;
  return {
    id: path.id,
    card: path.card,
    letter: path.letter,
    function: path.function,
    vector: [path.vector[0], path.vector[1]]
  };
}

function computeMajorPathLandings(cards: ExportCard[]): MajorPathLanding[] {
  const occupied = new Map<number, CardRef>();
  for (const card of cards) {
    occupied.set(card.sephirah, toCardRef(card));
  }

  const landings: MajorPathLanding[] = [];

  for (const card of cards) {
    const meta = metaFor(card);
    if (!meta || !isMajorArcana(meta)) continue;

    const ownPath = findOwnPathForMajor(meta);
    if (!ownPath) continue;

    const [endA, endB] = ownPath.vector;
    const hits: MajorPathLanding["landsOnOccupied"] = [];

    for (const targetSephirah of [endA, endB]) {
      const occupant = occupied.get(targetSephirah);
      if (!occupant || occupant.id === card.id) continue;
      hits.push({
        targetSephirah,
        cardId: occupant.id,
        cardName: occupant.name
      });
    }

    landings.push({
      cardId: card.id,
      cardName: card.name,
      sephirah: card.sephirah,
      ownPath: {
        vector: ownPath.vector,
        card: ownPath.card,
        function: ownPath.function
      },
      landsOnOccupied: hits
    });
  }

  return landings;
}

function addToCluster(
  clusters: Record<string, CardRef[]>,
  key: string,
  ref: CardRef
): void {
  if (!clusters[key]) clusters[key] = [];
  if (!clusters[key]!.some((c) => c.id === ref.id)) {
    clusters[key]!.push(ref);
  }
}

function computeResonanceClusters(cards: ExportCard[]): ResonanceClusters {
  const byPlanet: Record<string, CardRef[]> = {};
  const bySign: Record<string, CardRef[]> = {};
  const byElement: Record<string, CardRef[]> = {};

  for (const card of cards) {
    const meta = metaFor(card);
    if (!meta) continue;
    const ref = toCardRef(card);

    for (const planet of clusterPlanets(meta)) {
      addToCluster(byPlanet, planet, ref);
    }

    const sign = meta.astrology.sign ?? card.astrology?.sign;
    if (sign) addToCluster(bySign, sign, ref);

    const element = cardElement(card, meta);
    if (element) addToCluster(byElement, element, ref);
  }

  const filterPairs = (record: Record<string, CardRef[]>) =>
    Object.fromEntries(Object.entries(record).filter(([, list]) => list.length >= 2));

  return {
    byPlanet: filterPairs(byPlanet),
    bySign: filterPairs(bySign),
    byElement: filterPairs(byElement)
  };
}

function computeModalityNote(cards: ExportCard[]): ModalityNote {
  const counts = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  let signCardCount = 0;

  for (const card of cards) {
    const meta = metaFor(card);
    const modality = meta?.astrology.modality ?? card.astrology?.modality;
    if (!modality || !(ALL_MODALITIES as readonly string[]).includes(modality)) continue;

    counts[modality as keyof typeof counts] += 1;
    signCardCount += 1;
  }

  const countRecord: Record<string, number> = counts;

  return {
    counts,
    signCardCount,
    dominantModality: dominantKey(countRecord, ALL_MODALITIES),
    missing: ALL_MODALITIES.filter((m) => (counts[m as keyof typeof counts] ?? 0) === 0)
  };
}

/** Deterministic structure census for a ten-card spread export. */
export function analyzeSpread(cards: ExportCard[]): SpreadAnalysis {
  return {
    pillars: computePillarCensus(cards),
    census: computeCensus(cards),
    dualityFlags: computeDualityFlags(cards),
    resonances: computeResonances(cards),
    pathMatrix: computePathMatrix(cards),
    majorPathLandings: computeMajorPathLandings(cards),
    resonanceClusters: computeResonanceClusters(cards),
    modalityNote: computeModalityNote(cards)
  };
}

export { ASPECT_ORB };
