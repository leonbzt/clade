# Status

- **Milestone:** M2. Step 14, **B0 round two, the kit toy** ([spec](slices/b0r2-the-kit-toy.md)): specced, the
  contract is code, nothing is built. Round one (the build toy) was played 17 Nov (`playtests/b0-playtest.md`).
  Branch `b0-the-build-toy`, local, not pushed. **Nothing of this session is committed.**
- **Done (17 Nov, architect):**
  - Measured why round one solved: nine nodes make at most 12 full bodies for 3 fixed boards. The sim reads a
    part's name in 30 places, 20 in `sim/life-body.ts`. `docs/research/hooks-and-loops.md`: what pulls, with sources.
  - The spec, four builder parts (A the kit, B the Life reads stats, C the toy page, D the Life's side).
  - The contract: `clade/src/data/kit.ts` (the worm's 12 parts and 2 traits with rungs, the gates, every number),
    `data/kit-boards.ts`, `sim/kit.ts` and `sim/kit-stats.ts` (signatures; the bodies throw), `LifeBody.kit?`,
    `Tile.work`, the events `work` and `rung`, `season(l)`; `tests/kit.test.ts` (3 pass, 14 skipped until part A)
    and `tests/kit-rules.test.ts` (17 skipped until part B).
  - Logged: `decisions.md` (17 Nov), `direction.md` (eighth round, §5, §8, §9), `ROADMAP.md` (step 14 round two,
    W2 at 2 sessions, the kit budget), `tastes.md`, `ideas.md` (nine lines), `proposals.md` (none open).
- **Decided (17 Nov, yours):** the mix (a small planned kit that carries, offers for the rest, a rare one
  sometimes); turns with work on a steady beat and a clock switch; the kit toy before W2; the budget is for what a
  Life uses (6 places, 12 parts, 3 rungs, 2 traits a clade); solved as a chapter; visible progress first.
- **Not decided** (*proposal*): every node, name and number of the kit; defence as all or nothing; small stat
  numbers; the branch-to-dial table for B1; 12 effect kinds and 8 verbs; the doors table; the pitch.
- **Checks:** `npm run check` passes in 13.6 s (budget 10 s; the fix is W2's). Not run: `check:game`.
- **Not verified:** the 31 skipped tests were never run (no bodies); no number was played (a rough sum: 10 to 15
  eggs for a bare first Life, several times that for a good build, so goals and levels may be far off); whether
  one step's playback fits the 600 ms beat (part D reports it); the kit's names are from memory, not researched.
- **Not done:** the draft of a second clade's kit that P64 a named. It needs new part records and sourced names;
  it is one line in `ideas.md`, for a researcher batch after round two is played.
- **Next:** `/build b0r2 A`, then B, C, D in order (A and B may share a session). Then your play; five things to
  look for are in the spec's "Done when".
- **Open:** rivals and Hold in the wide toy (you did not say whether they read; N5's spec). The verb bar's cap of
  three waits for B1 or W5 (`ideas.md`). Round one's page `?toy=build` stays until W2.
