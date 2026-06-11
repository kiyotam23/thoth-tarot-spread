import assert from "node:assert/strict";
import { CARD_INDEX } from "../constants/cards";
import { detectPathResonances } from "./aspectEngine";
import { analyzeSpread, cardElement, type ExportCard } from "./spreadAnalysis";

function exportCard(id: string, sephirah: number): ExportCard {
  const meta = CARD_INDEX[id]!;
  return {
    id: meta.id,
    name: meta.name,
    sephirah,
    suit: meta.suit,
    rank: meta.rank,
    number: meta.number,
    elementalAttribution: meta.elementalAttribution,
    treeOfLifePath: meta.treeOfLifePath,
    astrology: meta.astrology
  };
}

// v2 verification spread (from aspectEngine.test.ts)
const v2Spread: ExportCard[] = [
  exportCard("ace-wands", 1),
  exportCard("princess-wands", 3),
  exportCard("princess-cups", 2),
  exportCard("knight-swords", 5),
  exportCard("prince-swords", 4),
  exportCard("cancer-chariot", 6),
  exportCard("5-cups", 7),
  exportCard("4-cups", 8),
  exportCard("7-wands", 9),
  exportCard("moon", 10)
];

const v2 = analyzeSpread(v2Spread);

assert.equal(v2.census.elements.Fire, 3, "ace-wands + princess-wands + 7-wands");
assert.equal(v2.census.elements.Water, 4, "princess-cups + chariot + 5-cups + 4-cups");
assert.equal(v2.census.elements.Air, 2, "knight-swords + prince-swords");
assert.ok(v2.census.missing.elements.includes("Earth"));
assert.equal(v2.pillars.balance.overloadedPillar, "equilibrium", "4 equilibrium seats filled");

const marsDual = v2.dualityFlags.find((f) => f.cardId === "5-cups" && f.kind === "dual-planet");
assert.ok(marsDual, "5 of Cups dual-planet");
assert.equal(marsDual!.match, true, "5 of Cups decan Mars = number Mars");

const knightDual = v2.dualityFlags.find((f) => f.cardId === "knight-swords" && f.kind === "dual-element");
assert.ok(knightDual);
assert.equal(knightDual!.a, "Fire");
assert.equal(knightDual!.b, "Air");
assert.equal(knightDual!.match, false);

const gap5cups = v2.dualityFlags.find((f) => f.cardId === "5-cups" && f.kind === "sephirah-gap");
assert.ok(gap5cups);
assert.equal(gap5cups!.a, "7");
assert.equal(gap5cups!.b, "5");
assert.equal(gap5cups!.match, false);

assert.equal(v2.pathMatrix.length, 45, "10C2 path adjacency pairs");
const noPath610 = v2.pathMatrix.find((p) => p.sephA === 6 && p.sephB === 10);
assert.ok(noPath610);
assert.equal(noPath610!.path, null, "Tiphareth–Malkuth has no direct path");

const pathResonanceCount = detectPathResonances(
  v2Spread.map((c) => ({ id: c.id, name: c.name, sephirah: c.sephirah }))
).length;
assert.ok(
  v2.resonances.length >= pathResonanceCount,
  "analysis.resonances is a superset of path-bearing pairs"
);

// TALES-like spread: Devil@6, 6-cups@8, 4-disks@9 (sephirah-gap), Capricorn cluster
const talesSpread: ExportCard[] = [
  exportCard("ace-wands", 1),
  exportCard("princess-wands", 2),
  exportCard("knight-swords", 3),
  exportCard("prince-swords", 4),
  exportCard("capricorn-devil", 6),
  exportCard("3-wands", 7),
  exportCard("6-cups", 8),
  exportCard("4-disks", 9),
  exportCard("9-wands", 5),
  exportCard("sun", 10)
];

const tales = analyzeSpread(talesSpread);

const gap4disks = tales.dualityFlags.find((f) => f.cardId === "4-disks" && f.kind === "sephirah-gap");
assert.ok(gap4disks);
assert.equal(gap4disks!.a, "9");
assert.equal(gap4disks!.b, "4");
assert.equal(gap4disks!.match, false);

assert.ok(tales.resonanceClusters.bySign.Capricorn, "Devil + 4-disks share Capricorn sign attribution");
assert.equal(tales.resonanceClusters.bySign.Capricorn!.length, 2);

const devilLanding = tales.majorPathLandings.find((l) => l.cardId === "capricorn-devil");
assert.ok(devilLanding);
assert.equal(devilLanding!.ownPath.vector.join(","), "6,8");
assert.ok(
  devilLanding!.landsOnOccupied.some((h) => h.targetSephirah === 8 && h.cardId === "6-cups"),
  "Devil Ayin path lands on Hod (6 of Cups)"
);
assert.ok(
  !devilLanding!.landsOnOccupied.some((h) => h.targetSephirah === 6),
  "own seat excluded from landings"
);

const sunCluster = tales.resonanceClusters.byPlanet.Sun;
assert.ok(sunCluster, "Sun cluster from sun major + 6-cups + 3-wands decan");
assert.ok(sunCluster!.length >= 3, `expected Sun >= 3, got ${sunCluster?.length}`);

const eightCupsDual = analyzeSpread([exportCard("8-cups", 7)]).dualityFlags.find(
  (f) => f.kind === "dual-planet"
);
assert.ok(eightCupsDual);
assert.equal(eightCupsDual!.match, false, "8 of Cups Saturn decan vs Mercury number");

const knightWandsDual = analyzeSpread([exportCard("knight-wands", 4)]).dualityFlags.find(
  (f) => f.kind === "dual-element"
);
assert.ok(knightWandsDual);
assert.equal(knightWandsDual!.match, true, "Knight of Wands Fire of Fire");

// modalityNote: 6 sign-bearing cards, evenly split across modalities
const modalitySpread: ExportCard[] = [
  exportCard("ace-wands", 1),
  exportCard("princess-cups", 2),
  exportCard("queen-swords", 3),
  exportCard("knight-disks", 4),
  exportCard("scorpio-death", 5),
  exportCard("2-cups", 6),
  exportCard("6-cups", 7),
  exportCard("8-cups", 8),
  exportCard("sun", 9),
  exportCard("moon", 10)
];

const modality = analyzeSpread(modalitySpread).modalityNote;
assert.deepEqual(modality.counts, { Cardinal: 2, Fixed: 2, Mutable: 2 });
assert.equal(modality.signCardCount, 6);
assert.equal(modality.dominantModality, null);
assert.deepEqual(modality.missing, []);

// Mother-letter planetary majors carry element for census (Mem=Water, etc.)
const neptuneOnly = analyzeSpread([exportCard("neptune", 8)]);
assert.equal(neptuneOnly.census.elements.Water, 1, "The Hanged Man (Mem) counts as Water");
assert.equal(cardElement(exportCard("neptune", 8)), "Water");
assert.equal(cardElement(exportCard("sun", 10)), null, "non-mother planetary majors stay elementless");

// decanPositions: 4 of Wands = Aries decan 3 (completion of a beginning)
const fourWands = analyzeSpread([exportCard("4-wands", 4)]).decanPositions[0]!;
assert.equal(fourWands.sign, "Aries");
assert.equal(fourWands.decanIndex, 3);
assert.equal(fourWands.phase, "completion");
assert.equal(fourWands.signModality, "Cardinal");
assert.ok(
  fourWands.positionNote.includes("completion of a beginning"),
  `expected completion-of-beginning note, got: ${fourWands.positionNote}`
);

// decanPositions: 2 of Wands = Aries decan 1 (initiation)
const twoWands = analyzeSpread([exportCard("2-wands", 2)]).decanPositions[0]!;
assert.equal(twoWands.sign, "Aries");
assert.equal(twoWands.decanIndex, 1);
assert.equal(twoWands.phase, "initiation");
assert.ok(twoWands.positionNote.includes("beginning of a beginning"));

// decanRuns: 2, 3, 4 of Wands → full Aries decan run
const wandsRunSpread: ExportCard[] = [
  exportCard("ace-wands", 1),
  exportCard("princess-wands", 2),
  exportCard("2-wands", 3),
  exportCard("3-wands", 4),
  exportCard("4-wands", 5),
  exportCard("knight-swords", 6),
  exportCard("prince-swords", 7),
  exportCard("cancer-chariot", 8),
  exportCard("scorpio-death", 9),
  exportCard("moon", 10)
];
const wandsRun = analyzeSpread(wandsRunSpread);
assert.equal(wandsRun.decanPositions.length, 3);
const ariesRun = wandsRun.decanRuns.find((r) => r.sign === "Aries");
assert.ok(ariesRun, "expected Aries decan run");
assert.deepEqual(ariesRun!.decansPresent, [1, 2, 3]);
assert.equal(ariesRun!.consecutive, true);
assert.equal(ariesRun!.complete, true);
assert.equal(ariesRun!.cards.length, 3);

// decanRuns: Aries minors + Emperor → majorOfSameSignPresent set, not in cards
const ariesWithEmperor: ExportCard[] = [
  exportCard("2-wands", 1),
  exportCard("3-wands", 2),
  exportCard("aries-emperor", 3),
  exportCard("knight-swords", 4),
  exportCard("prince-swords", 5),
  exportCard("cancer-chariot", 6),
  exportCard("5-cups", 7),
  exportCard("4-cups", 8),
  exportCard("7-wands", 9),
  exportCard("moon", 10)
];
const ariesEmperorRun = analyzeSpread(ariesWithEmperor).decanRuns.find((r) => r.sign === "Aries");
assert.ok(ariesEmperorRun);
assert.equal(ariesEmperorRun!.majorOfSameSignPresent?.cardId, "aries-emperor");
assert.ok(!ariesEmperorRun!.cards.some((c) => c.cardId === "aries-emperor"));

// decanRuns: single minor per sign → empty
const singleMinor = analyzeSpread([
  exportCard("2-wands", 1),
  exportCard("5-cups", 2),
  exportCard("8-swords", 3),
  exportCard("ace-wands", 4),
  exportCard("princess-wands", 5),
  exportCard("knight-swords", 6),
  exportCard("prince-swords", 7),
  exportCard("cancer-chariot", 8),
  exportCard("7-wands", 9),
  exportCard("moon", 10)
]);
assert.equal(singleMinor.decanRuns.length, 0);
assert.equal(singleMinor.decanPositions.length, 4);

// decanRuns: non-consecutive gap (1 and 3 only)
const gapRun = analyzeSpread([exportCard("2-wands", 1), exportCard("4-wands", 2)]).decanRuns[0]!;
assert.equal(gapRun.sign, "Aries");
assert.deepEqual(gapRun.decansPresent, [1, 3]);
assert.equal(gapRun.consecutive, false);
assert.equal(gapRun.complete, false);

console.log("spreadAnalysis.test.ts: all assertions passed");
