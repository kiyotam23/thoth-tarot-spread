# ATHANOR

*Causal-law editor — a structural tarot spread system*

System author: kiyotam23

---

## Overview

ATHANOR is a six-layer spread engine that places all 78 tarot cards on the structure of the Tree of Life.

Where typical tarot apps stop at "draw a card and show its meaning," ATHANOR **implements the Kabbalistic Four Worlds, the Tree of Life, and the tarot–zodiac correspondences as one coherent structure**, then layers an execution model that controls the *direction of reading* on top. Divination is lifted from static lookup of meanings into a structured analytic process.

ATHANOR consists of two layers:

- **Tarot–zodiac correspondence data** — all 78 cards mapped accurately onto the 360° zodiac with their full correspondences (signs, planets, elements, decans, Hebrew letters). The data file is **replaceable per deck**; current implementation: `thoth_tarot_data.json` (Thoth deck). The same engine works with any tarot whose correspondences can be encoded.
- **ATHANOR** — application layer: unfolds that data across the Four Worlds, six layers, and execution order.

---

## 1. Framework — six layers, observed

ATHANOR's vertical structure does not begin from Kabbalah. It begins from an observation about the tarot deck itself.

**The starting point.** Place all 78 tarot cards on the 360° zodiac — the placement carried out for the Thoth deck in `thoth-tarot-wheel` (visualized) and `thoth_tarot_data.json` (data form). Each card carries its astrological correspondences (zodiac, planet, element, decan), so each card has a place on the wheel.

**The observation.** Once placed, the 78 cards are found to fall into **six grouped layers** — six concentric bands, by card type. This is not a designed layout; it is what the deck does when laid out honestly on the zodiac.

**The correspondence.** Those six observed layers, set against the Kabbalistic **Four Worlds** (Atziluth / Briah / Yetzirah / Assiah), are found to fit the Four-World divisions. The six layers are not derived from the Four Worlds; they were observed first, and then seen to correspond.

| World | ATHANOR layer | Sephirah | Cards |
|---|---|---|---|
| Atziluth | WILL | Kether | 1 |
| Atziluth → Briah | STAGE | Chokmah / Binah | 2 |
| Briah | ACTORS | Chesed / Geburah | 2 |
| Briah → Yetzirah | FATE | Tiphareth | 1 |
| Yetzirah | TALES | Netzach / Hod / Yesod | 3 |
| Assiah | GAZE | Malkuth | 1 |

Total cards: 1+2+2+1+3+1 = **10** — exactly the number of Sephiroth on the Tree.

This convergence is not forced. The tarot 78-card correspondences, the Four Worlds, and the Tree of Life all derive from the same Kabbalistic source; figures from one source, laid out correctly, meet. ATHANOR did not fit the cards to a framework — the six layers emerged from the deck, and the framework was found to match. Card counts per layer follow natural groupings in the deck: minor arcana form triads per sign in the decan system, court cards carry degree placements, and aces sit at the center of each elemental quadrant. **The spread is determined at the intersection of an observed vertical structure (the six layers) and the horizontal structure of natural card groups.**

ATHANOR implements more than the ten Sephiroth. The Tree of Life is composed of **10 Sephiroth + 22 paths = 32 elements** (the "32 paths of wisdom" of the Sefer Yetzirah). The six-layer spread carries the ten Sephiroth; the **path overlay** (Chapter 7) carries the twenty-two paths. ATHANOR implements the Tree of Life in full.

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

## 4. How energy takes form across the layers

Chapter 3 gives the structural notation in symbols. This chapter gives the same thing in plain terms: what each layer *becomes* — how a single energy descends through the six layers and takes on form.

**WILL — energy.** An Ace: the undivided root of an element. Pure energy with a direction but no form yet. This is the seed of the whole reading.

**STAGE — the field, as a 16-element matrix.** The single energy of WILL spreads into a field. The two Princesses set this field as a **4×4 element matrix** — each element interacting with each (fire-of-fire, fire-of-water, and so on), sixteen cells in all. Energy is no longer a point; it is a domain in which things can happen. This is why the layer is named for *Domain / Matrix*.

**ACTORS — the zodiac enters; story becomes possible.** Court cards appear. Court cards correspond to degree spans of the zodiac, so the moment a card lands here, **a zodiac sign enters the board**. With signs present, the standard astrological correspondences (rulerships, relations between signs) become available. Abstract energy now has actors with a place and a time — and a **story can be told**. ACTORS is where the reading starts to move.

**FATE — the protagonist: the zodiac, at Tiphareth.** A zodiac major arcana card. In divination the zodiac sign is the protagonist; on the Tree of Life the protagonist is Tiphareth, the center, the sun. ATHANOR places one on the other — the protagonist of the reading at the protagonist seat of the Tree. This is why FATE, in Spectrum mode, reads *from the center outward in all directions*: the protagonist sits at the center.

**TALES — motive, patterning, synthesis.** Three minor arcana cards at Netzach (7), Hod (8), Yesod (9). Netzach gives motive, Hod gives patterning, Yesod consolidates. These three Sephiroth are grouped into one layer for two reasons that coincide: they are exactly the **Yetzirah** (the World of Formation) of the Four Worlds, and the minor arcana naturally form **triads** in the decan system — three cards to a layer. Tradition and deck structure point to the same grouping.

**GAZE — the material world: planets at Malkuth.** Malkuth is the material world. Planets are what actually move and can be observed in the material world — so placing a planetary major arcana card here is the correct correspondence. The reading resolves into one concrete, observable outcome.

Across the six layers, one energy descends: seed → field → actors → protagonist → unfolding → observable outcome. The structural notation of Chapter 3 is the symbolic record of this same descent.

---

## 5. Layered draw constraint — what makes ATHANOR distinct

Most spreads — Kabbalistic spreads included — treat the 78 cards as one uniform pool. There are ten positions, and any of the 78 cards may land in any position. ATHANOR does not work this way.

ATHANOR **partitions the 78-card deck into six exclusive sub-decks**, and each layer draws only from its own sub-deck:

| Layer | Sephirah | Draws only from | Card abstraction |
|---|---|---|---|
| WILL | Kether | Aces (4) | Highest — the pure root of an element |
| STAGE | Chokmah / Binah | Princesses (4) | Archetypal court ground |
| ACTORS | Chesed / Geburah | Knights / Queens / Princes (12) | Active agents |
| FATE | Tiphareth | Zodiac major arcana (12) | Archetypal pattern |
| TALES | Netzach / Hod / Yesod | Minor arcana (36) | Concrete events |
| GAZE | Malkuth | Planetary major arcana (7) | Final observable phase |

The assignment is not arbitrary. It maps the **abstraction hierarchy of the cards** onto the **vertical axis of the Tree of Life**. In the Thoth / Golden Dawn system, Aces and major arcana are archetypal; minor pip cards are concrete events. ATHANOR places the more abstract cards in the higher Sephiroth (Kether = abstract origin) and the more concrete cards toward Malkuth (concrete manifestation). The abstraction rank of the card and the abstraction rank of the Sephirah are kept aligned.

This is the constituting idea of ATHANOR. A conventional spread expresses its originality in *how positions are interpreted*; ATHANOR expresses it one level up — in *constraining which cards may reach a position at all*, on the basis of abstraction. It changes not the layout of a spread but the drawing rule itself.

Two consequences follow.

**Divinatory.** In an ordinary spread, a concrete pip landing in an abstract position (a Three in the seat of Kether) forces the reader to absorb the mismatch between the abstraction of the seat and the abstraction of the card. ATHANOR removes that dissonance structurally — seat and card always sit at the same level of abstraction. This is also why the upper layers (WILL / STAGE / ACTORS) read as more abstract: it is the designed outcome of the constraint, not a flaw.

**Structural.** The six-way partition is not invented for the draw rule; it is the six-layer grouping observed on the zodiac (Chapter 1). The placement *observed* that the 78 cards fall into six kinds; the draw constraint simply *holds each layer to its kind*. The constraint is a consequence of the observation, not an independent invention.

### Inherited vs. original

To be precise about what ATHANOR claims:

- **Inherited (from tradition):** the Four Worlds, the Tree of Life and its ten Sephiroth, the tarot–zodiac correspondences (zodiac / planet / element / decan / Hebrew letter / path), and the practice of mapping tarot onto the Tree.
- **Original (ATHANOR's own construction):** the six-layer articulation and its naming (WILL / STAGE / ACTORS / FATE / TALES / GAZE); the execution-order model (Descending / Ascending / Spectrum); the ten-card layout determined by natural deck groupings; the structural notation; and — centrally — the **layered draw constraint** described above.

ATHANOR's originality lies not in its materials but in their construction. The bricks are traditional; the building is ATHANOR's.

---

## 6. The three pillars — lateral structure

The six-layer spread runs vertically (WILL down to GAZE). But the ten Sephiroth also organize **laterally**, into the three pillars of the Tree of Life. Reading across the pillars is as much a part of ATHANOR as reading down the layers.

| Pillar | Principle | Sephiroth (ATHANOR layer · position) |
|---|---|---|
| Pillar of Mercy (right) | Expansion, force, grace | Chokmah (STAGE) · Chesed (ACTORS) · Netzach (TALES) |
| Pillar of Severity (left) | Contraction, form, limitation | Binah (STAGE) · Geburah (ACTORS) · Hod (TALES) |
| Pillar of Equilibrium (middle) | Will into manifestation, mediation | Kether (WILL) · Tiphareth (FATE) · Yesod (TALES) · Malkuth (GAZE) |

Note the layout consequence: viewed from the front, the Pillar of Severity (3, 5, 8) falls on the **viewer's left** and the Pillar of Mercy (2, 4, 7) on the **right**. So a left-to-right visual scan runs Severity→Mercy, which is the *descending* order of Sephirah number (3 before 2, 5 before 4). Reading should follow Sephirah number (emanation order: 2 before 3, 4 before 5), not the visual left-to-right.

The pillars are not read in isolation. The core of the Tree is the **dynamic between them**: the Pillar of Mercy expands, the Pillar of Severity contracts, and the Pillar of Equilibrium mediates the two. A board is read laterally by asking:

- Is expansion (right) balanced against contraction (left), or is one in excess?
- How does the middle pillar mediate the imbalance — or fail to?
- Excess expansion reads as dissipation / lack of containment; excess contraction reads as rigidity / paralysis.

This lateral reading — the interplay of the three pillars and the mediation at the center — complements the vertical descent of the six layers. Together they give the board both a vertical story (WILL→GAZE) and a lateral balance (Mercy / Severity / Equilibrium).

---

## 7. Path overlay — the twenty-two paths

The six-layer spread places cards on the ten Sephiroth. The **path overlay** completes the Tree by adding its twenty-two paths.

When enabled, the overlay superimposes all 22 paths of the Tree of Life onto the board. It is a **fixed reference layer** — independent of the draw, always the same — not a result of the reading. Each path carries three pieces of information:

- **Hebrew letter** — e.g. Path 29 = Qoph, Path 22 = Lamed
- **Vector** — the two Sephiroth the path connects, e.g. Sephirah 7 ↔ 10, Sephirah 5 ↔ 6
- **Function** — a one-word role for the path, e.g. *Projection* (The Moon), *Equilibrium* (Adjustment)

Path numbers, Hebrew letters, and major-arcana assignments follow the Golden Dawn system precisely. The *Function* label is ATHANOR's own — the same approach as the structural notation: traditional correspondences kept intact, with one concise functional term added on top.

The overlay is **off by default**. Many users never need it. It serves the reading for those who want to trace paths between Sephiroth, and serves study for those learning the Tree — divination practice doubles as revision of the path correspondences. ATHANOR is a divination tool and a study tool at once.

With the six-layer spread (ten Sephiroth) and the path overlay (twenty-two paths), ATHANOR implements all 32 elements of the Tree of Life.

---

## 8. Data foundation — tarot–zodiac correspondence data

Beneath ATHANOR sits a **tarot–zodiac correspondence data layer**: all 78 cards placed accurately on the 360° zodiac, with their full correspondences.

- 36 decans and planetary rulership (Chaldean order)
- Major arcana tripartition (12 zodiac / 7 planets / 3 elements — matching the 3+7+12 of Yetzirah)
- Court-card degree placements; ace quadrant placements
- Hebrew letters, paths, and elemental correspondences

This data layer is **deck-independent by design** and **replaceable per deck**. The current implementation is the Thoth deck, available in two forms: visualized as an interactive circular chart in the companion `thoth-tarot-wheel` repository, and structured as `thoth_tarot_data.json` for engine and AI use. Any tarot whose correspondences can be encoded — Rider-Waite-Smith, Hermetic, Golden Dawn, and others — runs on the same engine by swapping the data file.

SEED selection and other features read this structured data directly. **An accurate correspondence layer kept independent of the UI** is what separates ATHANOR from a generic fortune app.

---

## 9. Design intent — structured analysis

ATHANOR positions divination as a tool that structures the user’s thinking.

- **Six analytic windows** — WILL / STAGE / ACTORS / FATE / TALES / GAZE: fixed roles keep readings focused and segment situations from multiple angles.
- **Three reading directions** — Descending / Ascending / Spectrum: the same spread supports will-into-reality, root-cause from the present, and omnidirectional sampling from the center.
- **Intent vs. chance** — Manual / Random SEED lets the user choose how much intention enters the run; comparative runs (different SEEDs, same question) address confirmation bias structurally.

Six layers × three directions = eighteen analytic angles. ATHANOR is not built to “predict”; it systematically offers question angles the user would not reach alone.

---

## 10. Application — aiming to be a divination engine for AI

ATHANOR is a structural tarot spread system. **It aims to become a divination engine for AI** — a structured protocol designed for AI to interpret tarot draws within a defined frame, rather than as generic tarot prose.

The basis for this aim is already in place. The wheel data layer keeps the 78-card correspondences accurate and independent of the UI; the six-layer model, execution order, and structural notation give AI a *reading frame* — explicit input, action, and output per layer. With these, AI interpretation can stay segmented along structure rather than collapsing into fluent generic tarot writing.

What remains unproven is the result. Whether AI, given this frame, produces readings that meaningfully extend ATHANOR — or whether AI reaches a structural limit and the engine reveals where rule-based systems cannot replace human imagination — is open. Both outcomes are findings; both belong to the aim.

---

## Summary

ATHANOR is a structural divination engine that:

- **Faithfully implements Kabbalistic tradition (Four Worlds, Tree of Life, tarot–zodiac correspondences),**
- **Implements the Tree in full — ten Sephiroth as the spread, twenty-two paths as the overlay (32 elements),**
- **Reads both axes — the vertical descent of the six layers and the lateral balance of the three pillars,**
- **Constrains each layer to draw only from an abstraction-matched sub-deck — its constituting original idea,**
- **Adds a distinctive execution-order analytic model on top,**
- **Rests on an accurate, deck-independent correspondence data layer (current implementation: Thoth).**

It moves divination from static meaning lookup to structured analytic process, with room to grow as a divination engine for the AI era. ATHANOR occupies a unique position rooted in both esoteric tradition and systems design.

---

*ATHANOR — 2026*
