# Status

- **Milestone:** M2. Step 13, **W1 the wide toy** ([spec](slices/w1-the-wide-toy.md)): contract written 16 Nov,
  nothing built. Step 12 (the N4 fix) is still built and not played. Branch `n4-who-eats-whom`; **nothing of this
  session is committed.**
- **Done (15–16 Nov, an architect session):**
  - The organism model in `clade/src/model/`: `types.ts` (the contract), `laws.ts` (the seven laws as pure
    functions, 172 lines), `board.ts` (signatures only; bodies are part A).
  - Rows in `clade/src/data/roster/`: 38 clades, 43 named species, 10 mutations, 24 habitat kinds, 29 known links,
    the law numbers, the toy's 14 places and clocks. **Every trait is drafted from memory**; `ott` is 0, no tree.
  - Tests in `clade/tests/model/`: `rules`, `laws`, `data` (30 passing), `board` (15, skipped until part A).
  - `direction.md` §1 (third round), §4 (the shapes are the code) and §8 (W2 shrinks); `ROADMAP.md` steps 13, 14;
    `decisions.md`; `ideas.md`; `CLAUDE.md` (the model folder); `clade/tests/fitness.test.ts` (the letters grep
    lets `model/laws.ts` make letters).
- **Decided (15 Nov, third round):** the model is a real tested module in `clade/src/model/`, the toy a thin page,
  W2 shrinks to wiring; dials are five shared axes under each clade's own words; in the toy the shore opens by a
  rare "breathes air" variant and the land stays shut (direction §11.2 stays open for W4).
- **Not as the role says:** the architect wrote `laws.ts` itself. The data tests cannot be shown to be passable
  without the law functions, so they are part of the contract here. Say so if builders should own them instead.
- **Verified:** the 30 model tests pass in 0.5 s; types clean. `npm run check`: 201 pass, 2 fail, 14 s. Both
  failures are timing tests in files this session did not touch (`ground.test.ts` 54 ms against 45,
  `hunt.test.ts` 146 ms against 100); they fail the same way with this session's changes stashed, on a machine at
  load 5–7. Not re-run on a quiet machine. Not verified: any species fact; that the board tests can all pass
  (above all "you end up holding three places or more"); the toy, which does not exist yet.
- **Next:**
  1. A builder at medium effort: `/build W1 A` (the board rules), then `/build W1 B` (the page).
  2. You: commit this session's files once looked at; play the toy ten minutes, notes to
     `docs/playtests/w1-the-wide-toy.md`. Still owed: the N4 fix play and the merge (step 12).
- **Open** (the spec's three): hunting reads light; the roster leaves gaps (no hunter on the lee reef, 16 of 76
  cells with one candidate: W3 fills them); `nextGoal` puts Adopt first. Also direction §11.
