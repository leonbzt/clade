# Status

Updated 10 Nov 2026 (Claude, N1 review). Branch `n1-the-core`. Step 6 (`game/`) waits for your play.
**Milestone:** M2, step 8, **N1** (the core): `docs/slices/n1-the-core.md` (with the build brief).

**Done:** Codex's session 1 (A–D) reviewed; the fixes are in `5af0601`. The port of parts, clades and gates is
faithful to `game/`. Measured on seeds 1 and 2: every settled holder read F at home and no newcomer could enter a
held habitat, because eating ignored food density (stocks hit 0 each generation). Fixed in `clade/src/sim/sea.ts`,
`fitness.ts`, `data/sea.ts`, `data/clades.ts` and `tests/sea.test.ts`:
- Eating = pop × appetite × intake (reach × food per tile). Regrow runs after breeding, so the stored stock is the
  standing food that eaters and letters see.
- **The letter is the growth rate:** C's floor (0.28) sits at break-even (deaths ÷ appetite). A fresh habitat reads
  its full letter, a settled holder reads C at home, and a stronger newcomer reads higher and takes the slot.
- Worm mouth 0.5 → 0.3 (tentacles had tied the bare worm exactly). Regrow 0.3/0.2 → 0.15/0.1 (keeps a swing). A
  spread move under two heads' mass stays home. `score()` = `fitness` without its sentences. Spec part D matches.

**Decided (10 Nov):** Claude fixes review findings itself ("go ahead, fix them yourself"); letters read the current food
("tier should always reflect the current fit of a species"); Codex builds session 2.

**Next:**
1. Codex session 2: E–G. The card's intake line shows the food left ("food at 38%"), so a C holder makes sense.
2. You play the sheet or `/clade/`; notes in `docs/playtests/n1-the-core.md`.

**Open:**
- Tuning for the sheet: worm mud ×3 makes a mud worm S everywhere; Gut gland triples reach for +1 upkeep; a C holder
  in a big poor habitat is too sparse to spread (moves under 2 heads), so spread 0.06 vs body mass needs feel.

**Checkpoint:** `5af0601` (local; not pushed); this handoff's doc edits are uncommitted. `npm run check` 4.7 s
(35 tests); law 6 is 55 ms alone (was 68). Seed 2: worms placed where they read D die out; a C holder holds.
