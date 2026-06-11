"use client";

import type { ReactNode } from "react";
import type { PathResonance } from "../lib/aspectEngine";
import {
  dignityLabel,
  dignitySymbol,
  elementalDignity,
  elementAbbrev,
  type DignityKind
} from "../lib/elementalDignity";
import {
  cardElement,
  type DualityFlag,
  type ExportCard,
  type PathAdjacency,
  type Resonance,
  type SpreadAnalysis
} from "../lib/spreadAnalysis";

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function shortName(name: string): string {
  const stripped = name.replace(/\s·\s.*$/, "");
  if (stripped.length <= 14) return stripped;
  return `${stripped.slice(0, 12)}…`;
}

function aspectAbbrev(aspect: string): string {
  if (aspect === "Conjunction") return "Cnj";
  if (aspect === "Sextile") return "Sxt";
  if (aspect === "Square") return "Sq";
  if (aspect === "Trine") return "Tri";
  if (aspect === "Opposition") return "Opp";
  return aspect.slice(0, 3);
}

function pathLookup(matrix: PathAdjacency[], sephA: number, sephB: number) {
  const lo = Math.min(sephA, sephB);
  const hi = Math.max(sephA, sephB);
  return matrix.find((entry) => entry.sephA === lo && entry.sephB === hi) ?? null;
}

function MatrixTable({
  rowLabels,
  colLabels,
  renderCell,
  rowHeader = "Row",
  colHeader = "Col"
}: {
  rowLabels: string[];
  colLabels: string[];
  renderCell: (row: number, col: number) => ReactNode;
  rowHeader?: string;
  colHeader?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-[9px] font-mono sm:text-[10px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-[1] border border-white/10 bg-black/60 px-1 py-1 text-left font-semibold text-slate-300">
              {rowHeader}＼{colHeader}
            </th>
            {colLabels.map((label, idx) => (
              <th
                key={`col-${idx}`}
                className="border border-white/10 bg-black/40 px-1 py-1 text-center font-semibold text-slate-200"
                title={label}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((rowLabel, row) => (
            <tr key={`row-${row}`}>
              <th
                className="sticky left-0 z-[1] border border-white/10 bg-black/60 px-1 py-1 text-left font-semibold text-slate-200"
                title={rowLabel}
              >
                {rowLabel}
              </th>
              {colLabels.map((_, col) => (
                <td key={`cell-${row}-${col}`} className="border border-white/10 p-0 align-top">
                  {renderCell(row, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DignityCell({
  dignity,
  pathLetter,
  resonanceLines,
  isPathResonance,
  isDiagonal,
  element
}: {
  dignity: DignityKind | null;
  pathLetter: string | null;
  resonanceLines: string[];
  isPathResonance: boolean;
  isDiagonal: boolean;
  element: string | null;
}) {
  const dignityTone =
    dignity === "same"
      ? "text-amber-200"
      : dignity === "friendly"
        ? "text-emerald-300"
        : dignity === "hostile"
          ? "text-rose-300"
          : dignity === "neutral"
            ? "text-slate-400"
            : "text-slate-500";

  return (
    <div
      className={`min-h-[2.4rem] px-0.5 py-0.5 leading-tight ${
        isPathResonance
          ? "bg-indigo-500/25 ring-1 ring-inset ring-indigo-300/50"
          : pathLetter
            ? "bg-indigo-500/10"
            : ""
      }`}
      title={
        isDiagonal
          ? element ?? "no element"
          : [dignity ? dignityLabel(dignity) : null, pathLetter ? `Path ${pathLetter}` : null, ...resonanceLines]
              .filter(Boolean)
              .join(" · ")
      }
    >
      {isDiagonal ? (
        <span className="block text-center text-[10px] font-semibold text-amber-100/90">{elementAbbrev(element)}</span>
      ) : (
        <>
          <span className={`block text-center text-[11px] font-bold ${dignityTone}`}>
            {dignitySymbol(dignity)}
          </span>
          {pathLetter ? (
            <span className="block text-center text-[8px] text-indigo-200/90">{pathLetter}</span>
          ) : null}
          {resonanceLines.map((line) => (
            <span key={line} className="block truncate text-center text-[7px] text-slate-300/90">
              {line}
            </span>
          ))}
        </>
      )}
    </div>
  );
}

function DualityTable({ flags }: { flags: DualityFlag[] }) {
  if (flags.length === 0) {
    return <p className="spread-hint text-xs">該当なし</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[20rem] border-collapse text-[10px]">
        <thead>
          <tr className="text-left text-slate-300">
            <th className="border border-white/10 px-2 py-1">Card</th>
            <th className="border border-white/10 px-2 py-1">Kind</th>
            <th className="border border-white/10 px-2 py-1">A</th>
            <th className="border border-white/10 px-2 py-1">B</th>
            <th className="border border-white/10 px-2 py-1">Match</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag) => (
            <tr key={`${flag.cardId}-${flag.kind}`}>
              <td className="border border-white/10 px-2 py-1 text-slate-100">
                S{flag.sephirah} {shortName(flag.cardName)}
              </td>
              <td className="border border-white/10 px-2 py-1 text-slate-300">{flag.kind}</td>
              <td className="border border-white/10 px-2 py-1">{flag.a}</td>
              <td className="border border-white/10 px-2 py-1">{flag.b}</td>
              <td
                className={`border border-white/10 px-2 py-1 font-semibold ${
                  flag.match ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {flag.match ? "✓" : "✗"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AnalysisMatrixView({
  cards,
  analysis,
  pathResonances
}: {
  cards: ExportCard[];
  analysis: SpreadAnalysis;
  pathResonances: PathResonance[];
}) {
  const sorted = [...cards].sort((a, b) => a.sephirah - b.sephirah);
  const sephiroth = sorted.map((c) => c.sephirah);
  const elements = sorted.map((c) => cardElement(c));

  const resonanceByPair = new Map<string, Resonance>();
  for (const entry of analysis.resonances) {
    resonanceByPair.set(pairKey(entry.cardA.id, entry.cardB.id), entry);
  }

  const pathResonancePairs = new Set(
    pathResonances.map((entry) => pairKey(entry.cardA.id, entry.cardB.id))
  );

  const sephLabels = sephiroth.map((s) => `S${s}`);
  const cardLabels = sorted.map((c) => `S${c.sephirah}`);

  return (
    <div className="space-y-5">
      <section>
        <h4 className="spread-triad text-sm font-semibold">パス隣接 — Sephirah × Sephirah</h4>
        <p className="spread-hint mt-1 text-xs leading-relaxed">
          セルにヘブライ文字 = 直接パスあり。空 = 非隣接。
        </p>
        <div className="mt-2">
          <MatrixTable
            rowLabels={sephLabels}
            colLabels={sephLabels}
            rowHeader="Sephirah"
            colHeader="Sephirah"
            renderCell={(row, col) => {
              if (row === col) {
                return (
                  <div className="min-h-[1.6rem] bg-white/5 text-center text-[9px] leading-[1.6rem] text-slate-500">
                    —
                  </div>
                );
              }
              const entry = pathLookup(analysis.pathMatrix, sephiroth[row]!, sephiroth[col]!);
              return (
                <div
                  className={`min-h-[1.6rem] text-center text-[9px] leading-[1.6rem] ${
                    entry?.path ? "bg-indigo-500/20 text-indigo-100" : "text-slate-600"
                  }`}
                  title={entry?.path ? `${entry.path.card} (${entry.path.function})` : "no direct path"}
                >
                  {entry?.path?.letter ?? ""}
                </div>
              );
            }}
          />
        </div>
      </section>

      <section>
        <h4 className="spread-triad text-sm font-semibold">共鳴・元素尊厳 — Card × Card</h4>
        <p className="spread-hint mt-1 text-xs leading-relaxed">
          対角 = 元素。非対角: <span className="text-amber-200">=</span>同元素{" "}
          <span className="text-emerald-300">+</span>友好 <span className="text-rose-300">−</span>敵対{" "}
          <span className="text-slate-400">·</span>中立。文字列 = パス。紫背景 = pathResonance。
        </p>
        <div className="mt-2">
          <MatrixTable
            rowLabels={cardLabels}
            colLabels={cardLabels}
            rowHeader="Card"
            colHeader="Card"
            renderCell={(row, col) => {
              const cardA = sorted[row]!;
              const cardB = sorted[col]!;
              const isDiagonal = row === col;

              if (isDiagonal) {
                return (
                  <DignityCell
                    dignity={null}
                    pathLetter={null}
                    resonanceLines={[]}
                    isPathResonance={false}
                    isDiagonal
                    element={elements[row] ?? null}
                  />
                );
              }

              const resonance = resonanceByPair.get(pairKey(cardA.id, cardB.id));
              const pathEntry = pathLookup(analysis.pathMatrix, cardA.sephirah, cardB.sephirah);
              const dignity = elementalDignity(elements[row] ?? null, elements[col] ?? null);
              const resonanceLines: string[] = [];
              if (resonance?.sharedSign) resonanceLines.push(`♈${resonance.sharedSign.slice(0, 3)}`);
              if (resonance?.sharedPlanet) resonanceLines.push(`☿${resonance.sharedPlanet.slice(0, 3)}`);
              if (resonance?.aspect) resonanceLines.push(aspectAbbrev(resonance.aspect.name));

              return (
                <DignityCell
                  dignity={dignity}
                  pathLetter={pathEntry?.path?.letter ?? null}
                  resonanceLines={resonanceLines}
                  isPathResonance={pathResonancePairs.has(pairKey(cardA.id, cardB.id))}
                  isDiagonal={false}
                  element={null}
                />
              );
            }}
          />
        </div>
        <ul className="spread-hint mt-2 space-y-0.5 text-[10px]">
          {sorted.map((card) => (
            <li key={card.id}>
              S{card.sephirah}: {shortName(card.name)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="spread-triad text-sm font-semibold">二重属性フラグ</h4>
        <p className="spread-hint mt-1 text-xs">dual-element / dual-planet / sephirah-gap</p>
        <div className="mt-2">
          <DualityTable flags={analysis.dualityFlags} />
        </div>
      </section>

      <section>
        <h4 className="spread-triad text-sm font-semibold">Path Resonances（深掘りリスト）</h4>
        {pathResonances.length === 0 ? (
          <p className="spread-hint text-xs">該当なし</p>
        ) : (
          <ul className="mt-2 space-y-1 text-[10px] text-slate-200">
            {pathResonances.map((entry) => (
              <li
                key={pairKey(entry.cardA.id, entry.cardB.id)}
                className="rounded border border-white/10 bg-black/20 px-2 py-1"
              >
                S{entry.cardA.sephirah} {shortName(entry.cardA.name)} ↔ S{entry.cardB.sephirah}{" "}
                {shortName(entry.cardB.name)} — {entry.path.letter} (
                {entry.reasons.map((r) => (r.kind === "shared-ruler" ? r.planet : r.aspect)).join(", ")})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
