# Status

- **Milestone:** M2. Step 13, **W1 the wide toy** ([spec](slices/w1-the-wide-toy.md)): part A built 16 Nov, part B
  next. Step 12 (the N4 fix) is still built and not played. Branch `n4-who-eats-whom`; commits `a245a57` (the
  contract) and `bdec94c` (part A).
- **Done (16 Nov, a build session):** `clade/src/model/board.ts` (240 lines) and `board-goal.ts` (81: the hash,
  `nameOf`, `nextGoal`). The exported shapes are unchanged.
- **Where the brief was silent, the builder chose** (change any of them in a line):
  - A colonist bar outside the bar places, or with no candidate, drops to 0 (it does not pause). `hunt2` runs a bar
    like `hunt`.
  - `what` in plain words: "bigger", "smaller", "more <word>", "less <word>" (e.g. "more spawn"), and a mutation's
    name ("breathes air"). The brief's "burrows deeper" would need a word per direction in the rows.
  - With several variants to adopt, the goal picks the widest value margin.
- **Verified:** the board tests run: 45 model tests pass, 0 skipped. Types are clean. `npm run check`: 217 pass,
  1 fail (`hunt.test.ts` timing, 102 ms against 100, the old flake; it passes alone), 10.8 s at load 2–3.
  - A 40-goal run with seed 7, read by eye: four cells in 48 generations; colonists arrive and are named; the air
    variant shows at generation 168 on the Lee mud flats.
  - Not verified: the page (part B), and how it feels.
- **For the architect** (doesn't block part B): following the goal makes the heir churn and can **drop the air
  key**. Adopt comes first, and each cell's variant was made from the heir at the time. In the seed 7 run, the
  heir adopted "breathes air" and two goals later adopted a Sand deeps variant made before that, so it lost air and
  never reached the shore. Adopt also fires on margins too small to change the letter ("A against A"), as does
  Improve.
  - Options: make variants from the cell's holder rather than the heir; have adopt keep the heir's mutations; or
    only adopt when the letter changes. This is open question 3 in practice.
- **Next:**
  1. `/build W1 B` (the page).
  2. You: play the toy ten minutes and put your notes in `docs/playtests/w1-the-wide-toy.md`. Still owed: the N4
     fix play and the merge (step 12).
- **Open:** the spec's three questions (hunting reads light; gaps in the roster; `nextGoal` puts Adopt first),
  plus the key loss above. Also direction §11.
