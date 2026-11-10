# Status

Updated 10 Nov 2026 (Codex, N1 session 1). Branch `n1-the-core` (from `n0-the-ground`).
**Milestone:** M2, step 8, **N1** (the core). Spec with its build brief: `docs/slices/n1-the-core.md`. Step 6
(`game/`) still waits for your play (frozen; it may simply be superseded).

**Done:** N1 session 1, parts A–D: records, all 27 parts and their original pools/homes, clades, food data,
pure `stats`/`slots`/`fitness`, and the deterministic sea step in grams. No screen changes.

**Decided (10 Nov):** populations in grams; ChatGPT (Codex) builds N1, Claude reviews each session.

**Next:**
1. Claude reviews session 1's A–D diff against the build brief before session 2.
2. After review, Codex session 2: E–G (tier card, preview, presets, the sheet).
3. You play the sheet or `/clade/`; notes in `docs/playtests/n1-the-core.md`.

**Open:**
- In N1, a Lee and an Open habitat of the same substrate and depth differ only by area and neighbours (exposure has
  no rule until filterers; parked in `docs/ideas.md`).
- Parked from your N0 notes: the phone fix (N3's home map), a habitat for leftover deep water, re-cutting big or mixed
  habitats, island peaks instead of a ridge.

**Checkpoint:** A–C: `0c83898`, `6438070`, `ee7a693`; D and this handoff: `feat(N1-D): simulate biomass feeding breeding and spread` (local commits; not pushed).
**Claude review:** compare against `c5cd114`; review the one fitness curve, full-perimeter/simultaneous C-or-better spread, gram/head extinction and copied metadata. Starting yields, mass/upkeep curves, weak mouth reach 0.5, reference density 2, appetite 1.4, deaths 0.4, damping 0.8, spread 0.06 and letter thresholds await session-2 tuning.
**Verified / next:** `npm run check` passed in 4.4 s (32 tests + types); 160 generations × 16 habitats × 8 living species <100 ms, repeatable seeded seas, lone worm overshoots and settles within 5% by generation 30. No new design questions; next action: Claude review in a fresh session, then E–G and the play/screenshot sheet.
