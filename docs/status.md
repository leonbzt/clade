# Status

- **Milestone:** M2. Step 13, **W1 the wide toy** ([spec](slices/w1-the-wide-toy.md)): round two parts C–E built;
  ready for your play. Step 12 (the N4 fix) is still built and not played. Branch `n4-who-eats-whom`.
- **Done (16 Nov, build W1 E):** "W1 part E: the page", following checkpoint `4d85a04` (part D status).
  - `toys/wide.ts`, `wide.html`: open-line and collected-card chips, line goal taps, both Hold actions, first-line
    reset and rival-bar dev control; heir controls removed. Reset keeps the selected first line.
  - `toys/wide-board.ts`: population destinations, won-card marks, rival countdowns and readings, founder actions
    and unavailable-action reasons; uses model `reach`. No changes under `clade/` or to contract tests.
  - `toys/wide-variant.ts`, `wide-say.ts`: paired reasons with changes marked, shared letter/value bar, each
    build's own mutations and their effects, automatic outcome text, "thrift (from size)".
- **Checks:** `npm run check` passes, **13.8 s: over the 10 s budget**, noted rather than chased per spec.
  Separate strict TypeScript check of `toys/wide.ts` and its imports passes; diff checked for unrelated changes.
- **Browser:** seed 7, quiet sea, 90 goal taps: first card at tap 25, second line founded at 28; both Hold actions,
  manual line switching, roster/coverage, rare mutations, rival countdowns, dev controls and all 44 current cell
  cards checked. No console errors or horizontal overflow at 390 px. Screenshots inspected in `.shots/wide-e-*.png`.
- **Next:** play `/toys/wide.html`: collect a card, play the next line, compare a variant, answer a rival.
  Then use a fresh session: `/architect W1 round-two playtest`, with your notes; record them in the
  [playtest file](playtests/w1-the-wide-toy.md). The N4 fix play and merge are still owed (step 12).
- **Open:** check time; the spec's questions 4 to 8 (flat dials, challenge threshold, cards costing value,
  frequent Wait/content ending near goal 100, near relatives without a place). Round two still needs your play.
