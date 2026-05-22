# ATHANOR

*Causal-law editor — a structural divination engine built on the Thoth Tarot*

System author: Beeton

---

## Overview

ATHANOR is a six-layer spread engine that places all 78 Thoth Tarot cards on the structure of the Tree of Life.

Where typical tarot apps stop at “draw a card and show its meaning,” ATHANOR **implements the Kabbalistic Four Worlds, the Tree of Life, and the Thoth correspondence system as one coherent structure**, then layers an execution model that controls the *direction of reading* on top. Divination is lifted from static lookup of meanings into a structured analytic process.

ATHANOR consists of two layers:

- **thoth-tarot-wheel** — reference data layer: all 78 Thoth cards placed accurately on the 360° zodiac.
- **ATHANOR** — application layer: unfolds that data across the Four Worlds, six layers, and execution order.

---

## 1. Framework — Four Worlds and six layers

ATHANOR’s vertical structure follows the Kabbalistic **Four Worlds**. The six layers are that framework expanded to the resolution needed for practice.

| World | ATHANOR layer | Sephirah | Cards |
|---|---|---|---|
| Atziluth | WILL | Kether | 1 |
| Atziluth → Briah | STAGE | Chokmah / Binah | 2 |
| Briah | ACTORS | Chesed / Geburah | 2 |
| Briah → Yetzirah | FATE | Tiphareth | 1 |
| Yetzirah | TALES | Netzach / Hod / Yesod | 3 |
| Assiah | GAZE | Malkuth | 1 |

Total cards: 1+2+2+1+3+1 = **10** — exactly the number of Sephiroth on the Tree.

The Thoth 78-card correspondences, the Four Worlds, and the Tree of Life all derive from the same Kabbalistic system. ATHANOR follows that system faithfully; the ten-card spread is a consequence, not an arbitrary layout. Card counts per layer follow natural groupings in the deck: minor arcana form triads per sign in the decan system, court cards carry degree placements, and aces sit at the center of each elemental quadrant. **The spread is uniquely determined at the intersection of vertical structure (worlds, Sephiroth) and horizontal structure (card group sizes).**

---

## 2. Execution model — three modes

ATHANOR’s central feature is **execution order** across the six layers. The same spread can be read in three directions.

| Mode | Protocol | Direction | Role | SEED |
|---|---|---|---|---|
| Descending | WILL | Will (1) → reality (10) | Creator | Four elements at Kether |
| Ascending | GAZE | Reality (10) → source (1) | Debugger | Planet at Malkuth |
| Spectrum | FATE | Center (6) → all directions | Analyzer | Zodiac sign at Tiphareth |

This model treats divination as a single unfolding drama: WILL → STAGE → ACTORS → FATE → TALES → GAZE. Layer names and execution order give a consistent frame for reading as a structured process.

The user may set the SEED (the first card) manually or leave it fully random — intentional analysis and blind-spot chance on the same engine.

---

## 3. Structural notation — mechanics of each layer

Each of the six layers has **structural notation**: not formulas for numeric calculation, but a consistent way to show what each layer takes as input, how it acts, and what it passes on.

| Layer | Notation | Reading |
|---|---|---|
| WILL | V⃗_seed = Ace_element | Single origin; the Ace sets elemental direction |
| STAGE | V⃗_stage = (Ψ_Pleft ∘ Ψ_Pright)(W) | Two operators compose on WILL to form the field |
| ACTORS | F⃗_net = F⃗_Chesed(4) ⊕ F⃗_Geburah(5) | Synthesis of expansion and contraction |
| FATE | Φ_Fate = Harmonize(F⃗_Chesed(4) ⊕ F⃗_Geburah(5)) \|_Zodiac | ACTORS forces harmonized within the zodiac frame |
| TALES | T(τ) = Netzach(τ) ⊕ Hod(τ) → Yesod(τ) | Time-series unfolding; converges toward Yesod |
| GAZE | G = ∫ T(t) dt --Collapse--> Planet | Integrate TALES over time; collapse to one concrete outcome |

Symbols are role-separated across layers: `∘` (composition), `⊕` (combine), `→` (transition), `∫…dt` (time accumulation), `--Collapse-->` (convergence). Notations chain: each layer’s output feeds the next. From WILL’s seed to GAZE’s collapse, the six notations form one analytic process.

This notation shows that each layer is a functional unit with a clear role, not a vague symbol — uncommon among tarot apps at this level of internal structure.

Implementation: layer help panels render these strings via KaTeX in `app/page.tsx` (`LAYER_HELP.*.formula`). A short symbol legend in code points here; this section is the canonical reference.

---

## 4. Data foundation — thoth-tarot-wheel

Beneath ATHANOR sits **thoth-tarot-wheel**: reference data placing all 78 Thoth cards on the 360° zodiac.

- 36 decans and planetary rulership (Chaldean order)
- Major arcana tripartition (12 zodiac / 7 planets / 3 elements — matching the 3+7+12 of Yetzirah)
- Court-card degree placements; ace quadrant placements
- Hebrew letters, paths, and elemental correspondences

SEED selection and other features read this structured data directly. **An accurate correspondence layer kept independent of the UI** is what separates ATHANOR from a generic fortune app.

---

## 5. Design intent — structured analysis

ATHANOR positions divination as a tool that structures the user’s thinking.

- **Six analytic windows** — WILL / STAGE / ACTORS / FATE / TALES / GAZE: fixed roles keep readings focused and segment situations from multiple angles.
- **Three reading directions** — Descending / Ascending / Spectrum: the same spread supports will-into-reality, root-cause from the present, and omnidirectional sampling from the center.
- **Intent vs. chance** — Manual / Random SEED lets the user choose how much intention enters the run; comparative runs (different SEEDs, same question) address confirmation bias structurally.

Six layers × three directions = eighteen analytic angles. ATHANOR is not built to “predict”; it systematically offers question angles the user would not reach alone.

---

## 6. Application — toward an AI divination engine

ATHANOR is being extended as a next-generation divination engine with AI integration.

The wheel data layer plus the structured six-layer model is a strong base for AI interpretation: AI bridges abstract symbols to concrete situations, while wheel accuracy guards against correspondence errors.

The six layers, execution model, and structural notation give AI a **reading frame** — explicit input, action, and output per layer — so output stays segmented along structure rather than generic tarot prose.

---

## Summary

ATHANOR is a structural divination engine that:

- **Faithfully implements Kabbalistic tradition (Four Worlds, Tree of Life, Thoth correspondences),**
- **Adds a distinctive execution-order analytic model on top,**
- **Rests on an accurate independent data layer (wheel).**

It moves divination from static meaning lookup to structured analytic process, with room to grow as a divination engine for the AI era. ATHANOR occupies a unique position rooted in both esoteric tradition and systems design.

---

*ATHANOR — 2026*
