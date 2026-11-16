# Status

- **Milestone:** M2. Step 13, **W1 the wide toy** ([spec](slices/w1-the-wide-toy.md)): round one (parts A, B) played
  16 Nov; **round two** is specified and its contract is code. Step 12 (the N4 fix) is still built and not played.
  Branch `n4-who-eats-whom`. **Nothing of this session is committed.**
- **Your calls (16 Nov, in `decisions.md`):** round two before W2 · a better-reading wild species comes for a held
  cell on a visible bar, yours included, and you get a Hold goal · radiate, then a new line, with cards to collect.
  Your skill-bar wish (an OSRS curve per line) is parked for W5 in `ideas.md`.
- **Done (16 Nov, architect):** the spec's "Round two" section (rules C0–C7, D1–D3, parts C, D, E); direction §1
  (fourth round), §5, §11.4; `board.ts` carries the new shapes (`Cell.rival`, `Board.lines/starts/cards`,
  `Option.from`, `Goal.line`, `reach` exported) and five stubs that throw; `TOY.challenge`, `TOY.rivalBar` and
  `LINES` in `toy.ts`; `board.test.ts` rewritten (19 tests, skipped until part C), `board-lines.test.ts` (5, skipped
  until part D), `board-help.ts`; three new data tests (passing).
- **The builder's two questions, answered:** (1) `reach` is exported; part E deletes the page's copy. (2) Variants
  come from the cell's own population and the heir goes (C0, C3), so a key is never lost to a variant.
- **Measured:** following the goal for 1 500 generations gave 90 Adopt and 62 Wait of about 215 goals, no Beat, no
  Hold, 6 of 59 cells held, no named heir. One dial step moves a value 4 to 5%.
- **Not delivered:** the retune I offered. 43 of 54 clade dials are flat and four sweeps of the laws' numbers did
  not move that; it is the formulas. Now direction §11.4 and two ratchets (`FLAT_MOST`, `UNDER`).
- **Verified:** `npm run check` passes, 8.6 s (types clean; 24 board tests skipped until built); the data the new
  tests lean on (two ragworm species grow at home, a new line has a cell near home, air opens both shore places).
  **Not verified:** the 24 skipped tests have never run, so some may fail on the data: the builder stops and asks.
- **Expected:** `/toys/wide.html` still plays round one now; it will not run between part C and part E.
- **Next:**
  1. `/build W1 C` (populations radiate), then `/build W1 D` (rivals and lines), then `/build W1 E` (the page).
  2. You: play round two ten minutes and add notes to `docs/playtests/w1-the-wide-toy.md`. Still owed: the N4 fix
     play and the merge (step 12).
- **Open:** the spec's six questions (4: the laws' second cut; 5: the rival threshold of ×1.25, not the full letter
  I named when asking; 6: a card can cost value), direction §11.
