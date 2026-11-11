# Status

11 Nov 2026 · **M2, step 9 N2 (the Life): Session 1 A–D built on `n2-the-life`.**
- `npm run check` passed in 5.2 s. **Claude reviewed it (11 Nov):** the parts that are on, food reach, Enforce, shadow
  strikes and founding match the spec. Fixed (`1135fd0`): the rival cutoff counts heads (game/'s unit), not grams.
- **Open, blocks the slope play test:** on sand and rock slopes and deep water a board has 0 mats and 1–2 buried
  nodes (6–12 food), but the sea rates a bulb worm B or A there. The cap is 1.5 × the template's own count (sand 2, rock 1).
  Seed 1 has 6 of its 13 habitats like this. The user picks a fix before Session 2.
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
