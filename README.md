# ATHANOR (thoth-tarot-spread)

Six-layer Thoth Tarot spread on the Tree of Life — a structural divination engine with three execution modes (Descending / Ascending / Spectrum).

## Documentation

| Document | Audience | Contents |
|---|---|---|
| [ATHANOR_DESIGN.md](./ATHANOR_DESIGN.md) | Developers, contributors, AI context | Architecture: Four Worlds, six layers, structural notation, wheel data layer, design intent |
| [Operational manual](/manual) (in app) | Practitioners | Modes, SEED rules, case studies (JP/EN in UI) |

Structural notation shown in layer help panels is specified in [ATHANOR_DESIGN.md §3](./ATHANOR_DESIGN.md#3-structural-notation--mechanics-of-each-layer). Implementation: `LAYER_HELP` in `app/page.tsx`.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Manual: [http://localhost:3000/manual](http://localhost:3000/manual).

## Project layout

```
app/              Next.js UI (spread, layer help, manual route)
constants/        Card and path data
ATHANOR_DESIGN.md System design (canonical)
```

## Stack

Next.js 14 · React 18 · TypeScript · Tailwind CSS · KaTeX (layer formulas)

---

*ATHANOR — causal-law editor · 2026*
