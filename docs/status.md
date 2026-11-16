# Status

- **Milestone:** M2. Step 13, **W1 the wide toy** ([spec](slices/w1-the-wide-toy.md)): round one (parts A, B) played
  16 Nov; round two: **part C built** (16 Nov), D and E to go. Step 12 (the N4 fix) is still built and not played.
  Branch `n4-who-eats-whom`, all committed.
- **Your calls (16 Nov, in `decisions.md`):** round two before W2 · a better-reading wild species comes for a held
  cell on a visible bar, yours included, and you get a Hold goal · radiate, then a new line, with cards to collect.
  Your skill-bar wish (an OSRS curve per line) is parked for W5 in `ideas.md`.
- **Done (part C, builder):** `Board.heir` is gone; `founder`, `destination` built; variants come from each cell's
  own holder and walk toward its destination; cards are won at the end of a step; Adopt only for a new key or a
  step nearer a card you lack. New file `clade/src/model/board-pop.ts` (founders, destinations, variants);
  `board-goal.ts` has the C7 goal and `stepsTo`. Commits `c4f3d96` (the architect's round-two docs) and `0d0a473`.
- **Builder's calls the spec left open (small; say if wrong):** a destination is read with the species' dials and
  the holder's mutations; a step toward it that would leave the dial's range tries the next-farthest dial, else
  nothing shows; among several Adopt candidates a key comes first, then the first cell in board order.
- **Verified:** all 19 board tests pass (the 5 in `board-lines.test.ts` skipped until D); `npm run check` passes
  in **11.2 to 11.6 s** with load average 3.4 from other work on the machine (budget 10 s; 8.6 s before C).
  The board tests take 2.8 s alone; one step costs about 0.7 ms, most of it round one's colonists and grams.
- **Expected:** `/toys/wide.html` does not run until part E (it reads `board.heir`). Nothing to play yet.
- **Next:**
  1. `/build W1 D` (rivals and lines), then `/build W1 E` (the page).
  2. You: play round two ten minutes and add notes to `docs/playtests/w1-the-wide-toy.md`. Still owed: the N4 fix
     play and the merge (step 12).
- **For the architect:** the check is over its 10 s budget once the board tests run. A cheaper step (cache the
  colonist candidates per place and step) is round one's code, so not a builder's call.
- **Open:** the spec's six questions (4: the laws' second cut; 5: the rival threshold of ×1.25, not the full letter
  I named when asking; 6: a card can cost value), direction §11.
