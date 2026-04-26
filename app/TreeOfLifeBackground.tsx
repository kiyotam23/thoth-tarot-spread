"use client";

/**
 * Simplified Tree of Life — 10 sephirot in classical positions (L→R: Severity / Center / Mercy)
 * and 22 path segments (Hermetic / Golden Dawn style connectivity).
 * View: viewer left = 3,5,8; right = 2,4,7; middle = 1,6,9,10.
 */
const VIEWBOX = "0 0 100 120" as const;

/** Sephirah 1..10, coordinates in viewBox space */
const SEP: ReadonlyArray<readonly [number, number]> = [
  [50, 4], // 1 Keter
  [78, 24], // 2 Chokmah
  [22, 24], // 3 Binah
  [78, 45], // 4 Chesed
  [22, 45], // 5 Geburah
  [50, 52], // 6 Tiferet
  [78, 72], // 7 Netzach
  [22, 72], // 8 Hod
  [50, 90], // 9 Yesod
  [50, 112] // 10 Malkuth
];

/** 22 paths as undirected pairs (min,max); indices are sephirah numbers 1..10 */
const PATH_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 2],
  [1, 3],
  [1, 6],
  [2, 3],
  [2, 4],
  [2, 6],
  [3, 5],
  [3, 6],
  [4, 5],
  [4, 6],
  [4, 7],
  [5, 6],
  [5, 8],
  [6, 7],
  [6, 8],
  [6, 9],
  [7, 8],
  [7, 9],
  [7, 10],
  [8, 9],
  [8, 10],
  [9, 10]
];

type Props = {
  className?: string;
};

export function TreeOfLifeBackground({ className }: Props) {
  return (
    <div
      className={["pointer-events-none h-full w-full select-none", className].filter(Boolean).join(" ")}
      aria-hidden
    >
      <svg
        viewBox={VIEWBOX}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        <g className="text-white/[0.11] sm:text-white/[0.14]">
          {PATH_PAIRS.map(([a, b], i) => {
            const p1 = SEP[a - 1];
            const p2 = SEP[b - 1];
            if (!p1 || !p2) return null;
            return (
              <line
                key={`p-${a}-${b}-${i}`}
                x1={p1[0]}
                y1={p1[1]}
                x2={p2[0]}
                y2={p2[1]}
                stroke="currentColor"
                strokeWidth={0.45}
                strokeLinecap="round"
              />
            );
          })}
          {SEP.map(([cx, cy], i) => (
            <circle
              key={`n-${i + 1}`}
              cx={cx}
              cy={cy}
              r={1.5}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.4}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
