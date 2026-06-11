export type ElementName = "Fire" | "Water" | "Air" | "Earth";
export type DignityKind = "same" | "friendly" | "hostile" | "neutral";

const ELEMENTS: ElementName[] = ["Fire", "Water", "Air", "Earth"];

/** Golden Dawn–style elemental dignity between two elements. */
const DIGNITY_TABLE: Record<ElementName, Record<ElementName, DignityKind>> = {
  Fire: { Fire: "same", Water: "hostile", Air: "friendly", Earth: "neutral" },
  Water: { Fire: "hostile", Water: "same", Air: "neutral", Earth: "friendly" },
  Air: { Fire: "friendly", Water: "neutral", Air: "same", Earth: "hostile" },
  Earth: { Fire: "neutral", Water: "friendly", Air: "hostile", Earth: "same" }
};

export function elementalDignity(a: string | null, b: string | null): DignityKind | null {
  if (!a || !b) return null;
  if (!ELEMENTS.includes(a as ElementName) || !ELEMENTS.includes(b as ElementName)) return null;
  return DIGNITY_TABLE[a as ElementName][b as ElementName];
}

export function dignitySymbol(kind: DignityKind | null): string {
  if (!kind) return "—";
  if (kind === "same") return "=";
  if (kind === "friendly") return "+";
  if (kind === "hostile") return "−";
  return "·";
}

export function dignityLabel(kind: DignityKind | null): string {
  if (!kind) return "N/A";
  if (kind === "same") return "Same";
  if (kind === "friendly") return "Friendly";
  if (kind === "hostile") return "Hostile";
  return "Neutral";
}

export function elementAbbrev(element: string | null): string {
  if (!element) return "—";
  return element.charAt(0);
}
