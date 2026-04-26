"use client";

import { THOTH_PATHS, type ThothPath } from "../constants/thothPaths";

/**
 * 中点サムネをわずかに右へ。縦柱（中軸）と重ならない／関係を切る見せ方
 * 女帝(14)・欲望(19)・塔(27)
 */
const THOTH_THUMB_NUDGE_RIGHT_PX: ReadonlySet<number> = new Set([14, 19, 27]);

export type TreeLayout = {
  w: number;
  h: number;
  points: (null | { x: number; y: number })[];
};

type TreeOfLifeLinesProps = {
  layout: TreeLayout;
  className?: string;
};

type TreePathHitLayerProps = {
  layout: TreeLayout;
  onPathSelect: (path: ThothPath) => void;
  className?: string;
};

/**
 * カード中心座標に合わせ、THOTH_PATHS の 22 パスを描画
 */
export function TreeOfLifeLines({ layout, className }: TreeOfLifeLinesProps) {
  const { w, h, points } = layout;
  if (w < 1 || h < 1) return null;
  const unit = Math.min(w, h);
  const rNode = Math.max(4.5, unit * 0.03);
  const strokeL = 1.1;
  const strokeC = 0.85;

  return (
    <svg
      className={["pointer-events-none absolute left-0 top-0", className].filter(Boolean).join(" ")}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden
    >
      <g className="text-white/[0.14] opacity-[0.4] sm:text-white/[0.18] sm:opacity-50">
        {THOTH_PATHS.map((thoth) => {
          const { vector } = thoth;
          const [a, b] = vector;
          const p1 = points[a - 1];
          const p2 = points[b - 1];
          if (!p1 || !p2) return null;
          return (
            <line
              key={`p-${thoth.id}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="currentColor"
              strokeWidth={strokeL}
              strokeLinecap="round"
            />
          );
        })}
        {points.map((p, i) =>
          p ? (
            <circle key={`n-${i + 1}`} cx={p.x} cy={p.y} r={rNode} fill="none" stroke="currentColor" strokeWidth={strokeC} />
          ) : null
        )}
      </g>
    </svg>
  );
}

/**
 * 各パス中点にクリック用ボタン。親オーバーレイは `pointer-events-none`、各ボタンのみ
 * `pointer-events-auto` — ラッパが `auto` のままだと下のスプレッドがクリック不可になる。
 */
export function TreePathHitLayer({ layout, onPathSelect, className }: TreePathHitLayerProps) {
  const { w, h, points } = layout;
  if (w < 1 || h < 1) return null;

  return (
    <div className={["pointer-events-none absolute inset-0", className].filter(Boolean).join(" ")}>
      {THOTH_PATHS.map((path) => {
        const [a, b] = path.vector;
        const p1 = points[a - 1];
        const p2 = points[b - 1];
        if (!p1 || !p2) return null;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const nudgeX = THOTH_THUMB_NUDGE_RIGHT_PX.has(path.id) ? Math.max(16, w * 0.034) : 0;
        return (
          <button
            key={path.id}
            type="button"
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-white/30 bg-black/30 shadow-[0_0_0_1px_rgba(0,0,0,0.25)] ring-1 ring-white/10 transition hover:border-indigo-200/50 hover:ring-indigo-200/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/80 w-[calc(5.2rem/3.5)] h-[calc(7.2rem/3.5)] p-0 sm:w-[calc(6rem/3.5)] sm:h-[calc(8.4rem/3.5)]"
            style={{ left: mx + nudgeX, top: my }}
            aria-label={`Path ${path.id} ${path.card}`}
            onClick={() => onPathSelect(path)}
          >
            <img
              src={path.image}
              alt=""
              className="h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
}

export type { ThothPath };
