# Slice 04: the core-play toys

**Milestone:** M1, part 2, step 3 (the run's core play, before the stand's part 1b)
**Question:** which core play is fun enough to build the run on: (a) turn-based growth on the plot, (b) a patch
strategy map, or (c) a body builder scored by balance?
**Builds on:** [P44](../proposals.md) and [playtest 04](../playtests/04-stand.md) (3 Nov: "not really fun", "maybe
three at once is too much", "puzzle style with tiles or settler or something strategic"); decisions.md, 3 Nov:
toys for (a), (b) and c1+c2. Mechanics from tastes.md: tile placement, territory capture, hidden info, draft,
"set up and see how good it does".

## In
Three throwaway toys in `toys/`, each a full round in 5–10 min with a score, a tier (F–S) and a "new board" button.
All turn-based, one plant or one line, solo; drawn as flat palette cells (Teal palette, Pixelify, shade kept).
- **A, grow by turns** (`toys/turns.html`). A side-view board of about 14×12 cells (half sky, half hidden soil),
  a fixed sun, two natives that shade and hold pockets. Each turn your plant earns energy from its leaves' light
  and water and nutrient from root cells on pockets; you spend them placing stem, leaf, root or flower cells next
  to your plant. Leaves cost water each turn (short: one wilts). Soil reveals next to roots, with damp or rich
  signs one cell out. 12 turns, one drought turn. Score: flowers and grams. Three plot presets (open dune, forest
  gap, wet hollow).
- **B, the patch map** (`toys/patchmap.html`). A top-down patch of about 12×8 tiles (lava, bare, forest, wet),
  your line against two native species, each plant an individual on a tile. A turn is a season: your plants make
  seeds by how well they fit their tile; you sow them within reach, onto free tiles or next to weaker rivals,
  which you take over in a turn or two (territory capture). The natives spread by a simple rule. Pick one of three
  builds at the start (spreader, tough, tall). 10 seasons. Score: tiles held.
- **C, the body builder** (`toys/body.html`). A body grid of about 7×9 cells with a ground line. Organ pieces as
  small shapes (leaf, root, stem, tuber, thorn, wood, flower), each with a rule (leaves want open sky, roots go
  below, everything connects to the base) and a flow (makes or costs energy, water, nutrient). Draft: 3 offers,
  pick 1, place and rotate it; 10 picks, one reroll. Live readout: the three flows (red when short) and the 6
  stats → a niche's score and tier. Pick the niche at the start; one encounter at the end, checked against the
  body (drought, grazer or a taller rival).

## Out
- The hybrid (drafting organ pieces onto the plot, A + C) → a follow-up toy or the winner's slice, if both A and C
  are liked.
- Organic drawing, animation and the run's renderer polish (flashing, outline, font choice) → the winner's slice.
- Slice 03 part 1b (XP, mutations, sowing) → paused until the call on the toys.
- Links to the island, garden, tier list and saves → the winner's slice.
- Battles, the v1 + v2 merge, the patch map as a zoom layer → ideas.md (3 Nov).
- The final game's layers in the spec → after the toys (P44, question 3).

## Done when
- [ ] In play: the three toys from `/toys/`, each played to its score and tier, with a new board.
- [ ] `npm run check` passes (the known 8 h offline test aside).
- [ ] Your playtest notes are in `docs/playtests/05-core-toys.md`.

## Size check
- New systems: none in `src`; the toys only (each under ~400 lines a file, data apart from logic). They reuse the
  palette and drawing helpers (`src/data/palette.ts`, `src/view/flat.ts`). C reads the 3 stocks and the 6 stats;
  nothing new.
- Touches sim structure? No.
- Fits one or two sessions? Two parts: **part 1** A and C (side view, close kin) · **part 2** B.

## Open questions
1. Pause slice 03 part 1b for these toys? You lean yes; AI agrees, time-boxed to these two parts, then a call.
2. B's turns: a season per turn (lean), or real-time with pause?
3. C scored by the real niche weights (6 stats → the tier list's score; lean yes), so a winner plugs straight in?
