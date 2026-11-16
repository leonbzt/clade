# Status

- **Milestone:** M2. Step 13, **W1 the wide toy** ([spec](slices/w1-the-wide-toy.md)): round one played 16 Nov; round
  two: part C committed; **part D is built but not finished and not committed**; E to go. Step 12 (the N4 fix) is
  still built and not played. Branch `n4-who-eats-whom`.
- **Your call (16 Nov, in `decisions.md`):** the quiet sea, and a rock line second. Your wish, parked in `ideas.md`
  and named in direction §1: a TierZoo meta you find your place in, balance patches as eras and events, your earlier
  Lives as the meta.
- **Done (architect, uncommitted, for the builder's commit):**
  - Data and laws: `clade/src/data/roster/toy.ts` (`barsNextDoor` off; `LINES` periwinkles 1, urchins 2, shore crabs
    3, octopuses 4, lugworms 6), `clade/src/model/laws.ts` (`candidates` skips species that could never do the job:
    the same boards, a step 2.4× faster).
  - Tests: `clade/tests/model/board-lines.test.ts`, `board.test.ts` (the C7 test), `board-help.ts` (`asked`,
    `keepsWalk`, "no line hunts itself").
  - Docs: the spec's part D (the rules to build), direction §1 (fifth round) and §11.5, `decisions.md`, `ideas.md`.
- **The builder's questions, answered:**
  1. *The lugworm line had nothing to do.* More than the lugworm: every later line's start reads lower than the
     holder of each cell it could use, and the loud sea filled every cell in reach by the first card. And the goal
     looped (Adopt a step toward a card, Improve undid it: 136 of 200 goals; my rule of round two, in since part C).
     Cure: your call above, plus four goal rules in the spec's part D.
  2. *The check was 25 s.* Now 10.8 s with the unfinished part D; about 10 s expected when it is finished (the
     model tests ran in 3.3 s on my scratch build). At the edge of the budget, not under it.
  - The builder's three small calls stand (a rival for a wild holder's cell too; the shared build object; the first
    line in opening order).
- **Verified:** on a scratch build of the rules, all 57 model tests pass; eight seeds, 150 goals: two lines live by
  goal 25 to 28, 4 to 7 of 9 cards, five lines open by goal 65 to 97. **In the repo 3 tests fail until part D is
  finished** (C7, Hold, the line goal): expected. **Not verified:** the toy page (part E), other seeds, the feel.
- **Next:** `/build W1 D` (finish the rules, commit everything), then `/build W1 E`, then you play. Still owed: the
  N4 fix play and the merge (step 12).
- **Open:** the spec's questions 4 to 8 (7: half of all goals are Wait and the toy's content ends near goal 100;
  8: a near relative has nowhere to live, direction §11.5).
