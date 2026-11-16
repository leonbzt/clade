# Status

- **Milestone:** M2. Step 14, **B0 the build toy**: built, waits for your play. Part A tree mode (`987312c`), part B
  the toy page (`9070dc3`); both written by Codex, diffs reviewed, within Touch. Look run (390 px, no page errors):
  `.shots/b0-start.png`, `b0-life.png`, `b0-grown.png` (Build · points, node list scrolls in the controls, grown
  node gold), `b0-card.png` ("A feeder's Life", Again and Boards both work).
  Branch `b0-the-build-toy`, cut from `main` after the merge of `n4-who-eats-whom`; both local, not pushed.
- **Done (16 Nov, architect: the whole-road session, three rounds):**
  - `docs/design/direction.md`: a seventh round in §1; §3, §4, §5, §7 (the progression map), §8 (the plan), §9 and
    §11 current. `ROADMAP.md` re-cut from step 12. `docs/README.md`, `CLAUDE.md`: who reads what, the new budget line.
  - The spec `docs/slices/b0-the-build-toy.md`, and its contract as code: `clade/src/data/tree.ts` (the worm's nine
    nodes, the numbers), `data/toy-boards.ts` (three boards), `sim/tree.ts` (signatures; the bodies throw),
    `LifeBody.tree?` in `sim/life-body.ts`, `clade/tests/tree.test.ts` (2 tests pass, 12 skipped until part A).
  - Archived to `_archive/2026-11-16/`: 21 design docs with the four briefs, `docs/planning/`, the specs and
    playtests from before N0. The roadmap's old links point there.
  - `proposals.md`: none open. `ideas.md`: two decided ideas cut, eight parked.
- **Decided (16 Nov, yours):** the build lives in the Life (line levels open nodes; a Life earns points by growing,
  spends them, resets); one Life engine; the progression map, the meta as voice; a tree's branches are the dials and
  the clutch is a variant along the branch you built; the look split (L1a before the closed test); the road with the
  build toy first; the archive, the merge, one branch a step; no design pass before the closed test.
- **Not decided** (*proposal*): every number and node list; the budget of 9 nodes, 12 effect kinds, 8 verbs; the
  doors table (auto-run, partner links, other kinds of Life); the one-sentence pitch.
- **Checks:** `npm run check` passes in 13.2 s (budget 10 s; the fix is a W2 part). Not run: `check:game`.
- **Not verified:** nobody has played a whole Life in tree mode; the look run only spent the birth point, grew once
  and ended the season. The three boards and the prices were never played. Which of the 43 flat dials belong to lines you can play is not measured (step LC).
- **Next:** you play `npm run dev`, then `/clade/?toy=build` (all three boards; the four things to look for are in
  the spec's "Done when") and write `docs/playtests/b0-the-build-toy.md`; W2's spec waits for that.
- **Open:**
  - Rivals and Hold in the wide toy: you did not say whether they read; it waits for N5's spec. (The N4 fix play: none.)
  - The spec's three questions (the tree is shallow; nothing was played; branch to dial for B1).
  - Said wrongly in round 2: "a bar of three verbs" is not in B0. A worm has four verbs at most, and the cap needs
    slot levels, so it waits for B1 or W5 (`ideas.md`).
