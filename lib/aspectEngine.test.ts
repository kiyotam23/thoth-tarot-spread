import assert from "node:assert/strict";
import { aggregatePathResonances, angularDiff, detectAspects, detectPathResonances } from "./aspectEngine";

// Art (255°) + 6 of Wands (135°) — minor involved → Trine; path 6–9
const artAndMinorRaw = detectAspects([
  { id: "sagittarius-art", name: "Sagittarius · XIV · Art", sephirah: 6 },
  { id: "6-wands", name: "6 of Wands", sephirah: 9 }
]);

assert.equal(angularDiff(255, 135), 120);

const trine = artAndMinorRaw.find((a) => a.aspect === "Trine");
assert.ok(trine, "expected Trine when minor is involved");
assert.equal(trine!.angle, 120);
assert.ok(trine!.path);
assert.equal(trine!.path!.letter, "Samekh");

// Shared-ruler listed before angular aspects in raw detection
const firstSharedIdx = artAndMinorRaw.findIndex((a) => a.aspect === "Shared-ruler");
const firstAngularIdx = artAndMinorRaw.findIndex((a) => a.aspect !== "Shared-ruler");
assert.ok(firstSharedIdx >= 0 && firstAngularIdx >= 0);
assert.ok(firstSharedIdx < firstAngularIdx, "Shared-ruler should precede angular aspects");

// v3: same pair aggregates Jupiter + Trine into one pathResonance
const artResonances = detectPathResonances([
  { id: "sagittarius-art", name: "Sagittarius · XIV · Art", sephirah: 6 },
  { id: "6-wands", name: "6 of Wands", sephirah: 9 }
]);
assert.equal(artResonances.length, 1);
assert.equal(artResonances[0]!.path.letter, "Samekh");
assert.equal(artResonances[0]!.reasons.length, 2);
assert.equal(artResonances[0]!.reasons[0]!.kind, "shared-ruler");
assert.equal(artResonances[0]!.reasons[1]!.kind, "aspect");

// path=null detections are omitted from export
const noPathExport = detectPathResonances([
  { id: "cancer-chariot", name: "Cancer · VII · The Chariot", sephirah: 6 },
  { id: "moon", name: "Moon · II · The High Priestess", sephirah: 10 }
]);
assert.equal(noPathExport.length, 0);

// Fixed × fixed: no angular aspects (structural inevitability)
const fixedOnly = detectAspects([
  { id: "ace-wands", name: "Ace of Wands", sephirah: 1 },
  { id: "princess-disks", name: "Princess of Disks", sephirah: 10 },
  { id: "princess-wands", name: "Princess of Wands", sephirah: 3 },
  { id: "cancer-chariot", name: "Cancer · VII · The Chariot", sephirah: 6 }
]);
assert.equal(
  fixedOnly.filter((a) => a.aspect !== "Shared-ruler").length,
  0,
  "fixed-category pairs must not produce angular aspects"
);

// Princess "Earth" is not a planet
const princessPair = detectAspects([
  { id: "princess-wands", name: "Princess of Wands", sephirah: 3 },
  { id: "princess-cups", name: "Princess of Cups", sephirah: 2 }
]);
assert.equal(princessPair.length, 0, "Earth element must not produce Shared-ruler");

// Adjacent decans (10° apart) must not be Conjunction at orb 8
const adjacent = detectAspects([
  { id: "2-wands", name: "2 of Wands", sephirah: 7 },
  { id: "3-wands", name: "3 of Wands", sephirah: 8 }
]);
assert.equal(adjacent.filter((a) => a.aspect === "Conjunction").length, 0);

// Empress (Venus) + Libra court → Shared-ruler via Venus (no path → omitted from export)
const venusShare = detectAspects([
  { id: "venus", name: "Venus · III · The Empress", sephirah: 10 },
  { id: "queen-swords", name: "Queen of Swords", sephirah: 3 }
]).find((a) => a.aspect === "Shared-ruler" && a.sharedPlanet === "Venus");
assert.ok(venusShare, "expected Venus Shared-ruler in raw detection");
assert.equal(
  detectPathResonances([
    { id: "venus", name: "Venus · III · The Empress", sephirah: 10 },
    { id: "queen-swords", name: "Queen of Swords", sephirah: 3 }
  ]).length,
  0
);

// v2 verification spread — raw detection
const v2Spread = [
  { id: "ace-wands", name: "Ace of Wands", sephirah: 1 },
  { id: "princess-wands", name: "Princess of Wands", sephirah: 3 },
  { id: "princess-cups", name: "Princess of Cups", sephirah: 2 },
  { id: "knight-swords", name: "Knight of Swords", sephirah: 5 },
  { id: "prince-swords", name: "Prince of Swords", sephirah: 4 },
  { id: "cancer-chariot", name: "Cancer · VII · The Chariot", sephirah: 6 },
  { id: "5-cups", name: "5 of Cups", sephirah: 7 },
  { id: "4-cups", name: "4 of Cups", sephirah: 8 },
  { id: "7-wands", name: "7 of Wands", sephirah: 9 },
  { id: "moon", name: "Moon · II · The High Priestess", sephirah: 10 }
];

const v2Raw = detectAspects(v2Spread);
const princeSquare = v2Raw.find(
  (a) =>
    a.aspect === "Square" &&
    [a.cardA.id, a.cardB.id].sort().join() === ["5-cups", "prince-swords"].sort().join()
);
assert.ok(princeSquare, "expected Prince of Swords × 5 of Cups Square");
assert.equal(princeSquare!.angle, 90);

const v2Export = detectPathResonances(v2Spread);
assert.ok(
  v2Export.every((r) => r.path != null),
  "export must only include path-bearing resonances"
);
assert.ok(
  v2Export.some(
    (r) =>
      r.path.letter === "Kaph" &&
      [r.cardA.id, r.cardB.id].sort().join() === ["5-cups", "prince-swords"].sort().join()
  ),
  "Square on 4–7 should survive as pathResonance"
);
assert.ok(
  !v2Export.some((r) => [r.cardA.id, r.cardB.id].sort().join() === ["cancer-chariot", "moon"].sort().join()),
  "path-null Moon pairs must be omitted"
);

// v3 user verification spread (10 cards; sephiroth chosen to match described paths)
const v3Spread = [
  { id: "ace-wands", name: "Ace of Wands", sephirah: 1 },
  { id: "princess-wands", name: "Princess of Wands", sephirah: 2 },
  { id: "princess-cups", name: "Princess of Cups", sephirah: 3 },
  { id: "knight-swords", name: "Knight of Swords", sephirah: 4 },
  { id: "prince-swords", name: "Prince of Swords", sephirah: 5 },
  { id: "libra-adjustment", name: "Libra · VIII · Adjustment", sephirah: 6 },
  { id: "8-cups", name: "8 of Cups", sephirah: 7 },
  { id: "9-cups", name: "9 of Cups", sephirah: 8 },
  { id: "3-cups", name: "3 of Cups", sephirah: 9 },
  { id: "venus", name: "Venus · III · The Empress", sephirah: 10 }
];

const v3 = detectPathResonances(v3Spread);
assert.ok(v3.length >= 4 && v3.length <= 7, `expected ~5–6 path resonances, got ${v3.length}`);

const knight8c = v3.find(
  (r) => [r.cardA.id, r.cardB.id].sort().join() === ["8-cups", "knight-swords"].sort().join()
);
assert.ok(knight8c, "expected Knight of Swords × 8 of Cups");
assert.equal(knight8c!.path.letter, "Kaph");
assert.ok(knight8c!.reasons.some((r) => r.kind === "shared-ruler" && r.planet === "Mercury"));
assert.ok(knight8c!.reasons.some((r) => r.kind === "aspect" && r.aspect === "Square"));

const adjustment3c = v3.find(
  (r) => [r.cardA.id, r.cardB.id].sort().join() === ["3-cups", "libra-adjustment"].sort().join()
);
assert.ok(adjustment3c, "expected Adjustment × 3 of Cups");
assert.equal(adjustment3c!.path.letter, "Samekh");

// aggregatePathResonances dedupes identical reasons
const deduped = aggregatePathResonances([
  {
    cardA: { id: "a", name: "A", sephirah: 4 },
    cardB: { id: "b", name: "B", sephirah: 7 },
    aspect: "Shared-ruler",
    angle: null,
    orb: null,
    sharedPlanet: "Mercury",
    path: { id: 21, card: "X. Fortune", letter: "Kaph", function: "Cyclicity", vector: [4, 7] }
  },
  {
    cardA: { id: "a", name: "A", sephirah: 4 },
    cardB: { id: "b", name: "B", sephirah: 7 },
    aspect: "Shared-ruler",
    angle: null,
    orb: null,
    sharedPlanet: "Mercury",
    path: { id: 21, card: "X. Fortune", letter: "Kaph", function: "Cyclicity", vector: [4, 7] }
  }
]);
assert.equal(deduped.length, 1);
assert.equal(deduped[0]!.reasons.length, 1);

console.log("aspectEngine.test.ts: all assertions passed");
