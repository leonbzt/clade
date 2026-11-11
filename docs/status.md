# Status

11 Nov 2026 · **M2, step 9 N2 (the Life): Session 1 A–D built on `n2-the-life`.**
- `npm run check` passed in 5.2 s. Claude should review active-part reach, Enforce and shadow strikes, and the board/sea join. The rival cutoff is the ported value of 6 g.
- Session 2 (E–G) wires the screen and Colonise loop, registers dev picks before `found`, and captures the sheet and three-habitat playtest.

**Done (Claude):**
- N1's review fixes committed on `n1-the-core` (`255940b` code, `0fec4b0` docs) and merged into `main` (`72608ca`);
  `npm run check` passed on `main` (5.4 s, 41 tests). Nothing pushed.
- Spec: [slices/n2-the-life.md](slices/n2-the-life.md), with a Codex build brief. Session 1: the Life body over the
  clade `Build` (parts switch on with size), the engine port, the economy module (Grow, Enforce, Lay), `boardFor` and
  `found`. Session 2: the Life screen, Colonise from the habitat card, the sheet. ROADMAP step 9 links it.

**Decided (user, 11 Nov; decisions.md):** the shadow from deep water on N2 boards if cheap (a data flag; else no
hunter until N4); 2 heads per egg; Enforce 3, 5, 7, 9, 11 and a cap of 1 + line rank; parts switch on in family
order (a species' own order parked in ideas.md).

**Open:**
- Putting the current `game/` build on itch now for early feedback (Claude's advice given; no call yet).
