import { CARD_INDEX, type ThothCardMeta } from "../constants/cards";
import { THOTH_PATHS } from "../constants/thothPaths";

export const ASPECT_ORB = 8;

export type AspectName =
  | "Conjunction"
  | "Sextile"
  | "Square"
  | "Trine"
  | "Opposition"
  | "Shared-ruler";

export type SpreadCardRef = {
  id: string;
  name: string;
  sephirah: number;
};

export type DetectedAspect = {
  cardA: SpreadCardRef;
  cardB: SpreadCardRef;
  aspect: AspectName;
  angle: number | null;
  orb: number | null;
  sharedPlanet: string | null;
  path: {
    id: number;
    card: string;
    letter: string;
    function: string;
    vector: readonly [number, number];
  } | null;
};

export type PathResonanceReason =
  | { kind: "shared-ruler"; planet: string }
  | {
      kind: "aspect";
      aspect: Exclude<AspectName, "Shared-ruler">;
      angle: number;
      orb: number;
    };

export type PathResonance = {
  cardA: SpreadCardRef;
  cardB: SpreadCardRef;
  path: {
    id: number;
    card: string;
    letter: string;
    function: string;
    vector: [number, number];
  };
  reasons: PathResonanceReason[];
};

const ASPECT_DEFINITIONS = [
  { name: "Conjunction" as const, angle: 0, label: "合体・強調" },
  { name: "Sextile" as const, angle: 60, label: "機会・協力" },
  { name: "Square" as const, angle: 90, label: "緊張・課題" },
  { name: "Trine" as const, angle: 120, label: "調和・流れ" },
  { name: "Opposition" as const, angle: 180, label: "対立・補完" }
];

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

export function angularDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function sortedPair(a: number, b: number): [number, number] {
  return a < b ? [a, b] : [b, a];
}

function isMinorArcana(meta: ThothCardMeta): boolean {
  return meta.number != null && meta.number >= 2 && meta.number <= 10;
}

/** Strip leading symbols (e.g. "☾ Moon") and keep only the ten classical/modern planets. */
function normalizePlanet(raw: string): string | null {
  const trimmed = raw.trim();
  if (VALID_PLANETS.has(trimmed)) return trimmed;

  const match = trimmed.match(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)\b$/);
  return match ? match[1] : null;
}

function findPath(sephA: number, sephB: number): DetectedAspect["path"] {
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
    vector: path.vector
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

function detectAngularAspects(cards: SpreadCardRef[]): DetectedAspect[] {
  const results: DetectedAspect[] = [];

  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const metaA = CARD_INDEX[cards[i].id];
      const metaB = CARD_INDEX[cards[j].id];
      if (!metaA || !metaB) continue;

      if (!isMinorArcana(metaA) && !isMinorArcana(metaB)) continue;

      const angleA = metaA.midAngle;
      const angleB = metaB.midAngle;
      if (angleA == null || angleB == null) continue;

      const diff = angularDiff(angleA, angleB);
      for (const def of ASPECT_DEFINITIONS) {
        const orb = Math.abs(diff - def.angle);
        if (orb > ASPECT_ORB) continue;

        results.push({
          cardA: cards[i],
          cardB: cards[j],
          aspect: def.name,
          angle: diff,
          orb,
          sharedPlanet: null,
          path: findPath(cards[i].sephirah, cards[j].sephirah)
        });
        break;
      }
    }
  }

  return results;
}

function detectSharedRulerAspects(cards: SpreadCardRef[]): DetectedAspect[] {
  const results: DetectedAspect[] = [];

  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const metaA = CARD_INDEX[cards[i].id];
      const metaB = CARD_INDEX[cards[j].id];
      if (!metaA || !metaB) continue;

      const planetsA = effectivePlanets(metaA);
      const planetsB = effectivePlanets(metaB);
      if (planetsA.length === 0 || planetsB.length === 0) continue;

      const shared = planetsA.find((p) => planetsB.includes(p));
      if (!shared) continue;

      results.push({
        cardA: cards[i],
        cardB: cards[j],
        aspect: "Shared-ruler",
        angle: null,
        orb: null,
        sharedPlanet: shared,
        path: findPath(cards[i].sephirah, cards[j].sephirah)
      });
    }
  }

  return results;
}

/** Deterministic aspect + path detection for a spread's ten cards. Shared-ruler first. */
export function detectAspects(spreadCards: SpreadCardRef[]): DetectedAspect[] {
  return [...detectSharedRulerAspects(spreadCards), ...detectAngularAspects(spreadCards)];
}

function orderedCardPair(a: SpreadCardRef, b: SpreadCardRef): [SpreadCardRef, SpreadCardRef] {
  return a.id < b.id ? [a, b] : [b, a];
}

function pairKey(a: SpreadCardRef, b: SpreadCardRef): string {
  return orderedCardPair(a, b)
    .map((c) => c.id)
    .join("|");
}

function aspectToReason(aspect: DetectedAspect): PathResonanceReason | null {
  if (aspect.aspect === "Shared-ruler") {
    if (!aspect.sharedPlanet) return null;
    return { kind: "shared-ruler", planet: aspect.sharedPlanet };
  }
  if (aspect.angle == null || aspect.orb == null) return null;
  return {
    kind: "aspect",
    aspect: aspect.aspect,
    angle: aspect.angle,
    orb: aspect.orb
  };
}

function reasonKey(reason: PathResonanceReason): string {
  if (reason.kind === "shared-ruler") return `shared:${reason.planet}`;
  return `aspect:${reason.aspect}:${reason.angle}:${reason.orb}`;
}

/** Filter to path-bearing detections and merge reasons per card pair. */
export function aggregatePathResonances(aspects: DetectedAspect[]): PathResonance[] {
  const groups = new Map<string, PathResonance>();

  for (const aspect of aspects) {
    if (!aspect.path) continue;

    const key = pairKey(aspect.cardA, aspect.cardB);
    const reason = aspectToReason(aspect);
    if (!reason) continue;

    const [cardA, cardB] = orderedCardPair(aspect.cardA, aspect.cardB);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        cardA,
        cardB,
        path: {
          id: aspect.path.id,
          card: aspect.path.card,
          letter: aspect.path.letter,
          function: aspect.path.function,
          vector: [aspect.path.vector[0], aspect.path.vector[1]]
        },
        reasons: [reason]
      });
      continue;
    }

    if (!existing.reasons.some((r) => reasonKey(r) === reasonKey(reason))) {
      existing.reasons.push(reason);
    }
  }

  return Array.from(groups.values()).map((entry) => ({
    ...entry,
    reasons: [
      ...entry.reasons.filter((r) => r.kind === "shared-ruler"),
      ...entry.reasons.filter((r) => r.kind === "aspect")
    ]
  }));
}

/** Final export: path resonances worth deepening (path non-null, aggregated by card pair). */
export function detectPathResonances(spreadCards: SpreadCardRef[]): PathResonance[] {
  return aggregatePathResonances(detectAspects(spreadCards));
}
