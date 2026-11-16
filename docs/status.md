# Status

- **Milestone:** M2. Step 13, **W1 the wide toy** ([spec](slices/w1-the-wide-toy.md)): round one played 16 Nov; round
  two: parts C and D committed; **E (the page) to go**. Step 12 (the N4 fix) is still built and not played. Branch
  `n4-who-eats-whom`.
- **Done (16 Nov, build W1 D):** commit `47325ee` "W1 part D: rivals and lines". Built by Codex (`codex exec`) and
  verified by Claude against spec part D. It holds the architect's data, laws, tests and docs.
  - `clade/src/model/board.ts` (284 lines): rivals phase (bar places found once a step), `rivalOf`, `nextLine`,
    `setMain`, lines opening, C2 "no line hunts itself".
  - `clade/src/model/board-goal.ts` (130 lines): `keepsWalk`, D2 Hold (one tap ends the challenge), C7 named Improve,
    D3 line goal; `goalOf` now takes `Looks` and the other lines' options.
- **Check:** passes, **13.4 s: over the 10 s budget** (the spec said about 10 s; per the spec, noted here, not chased).
- **Decided (16 Nov):** Codex may build a part. Claude briefs it, reads the diff against the spec, runs the check and
  commits (`decisions.md`). How: `codex exec -s workspace-write -C . -o <file> "<brief>"`, run in the background.
- **Next:** `/build W1 E` (the page; Codex can build it), then you play the wide toy. Still owed: the N4 fix play and
  the merge (step 12).
- **Open:** the check time (13.4 s); the spec's questions 4 to 8 (7: half of all goals are Wait and the toy's
  content ends near goal 100; 8: a near relative has nowhere to live, direction §11.5).
