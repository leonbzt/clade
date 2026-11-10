# Status

Updated 10 Nov 2026 (Claude, after the N0 play). Branch `n0-the-ground`; N0 is committed.
**Milestone:** M2. Step 7 (N0, the ground) is done; next is step 8, **N1** (the core). Step 6 (`game/`) still waits
for your play (frozen; it may simply be superseded).

**Done:**
- N0 played and passed: "looks good, i can tell them apart"; reading as a ring is fine. Notes:
  `docs/playtests/n0-the-ground.md`. The build's departures are accepted (`docs/decisions.md`).
- Two fixes from your notes: no green on the island (`clade/src/view/paint.ts`, `data/palette.ts`); slopes and deeps
  no longer carry an exposure word ("Rock slope", `clade/src/sim/names.ts`). `npm run check` 4.2 s.
- `/spec` now reads the build brief (§0, §10, the step's row and the sections it needs), not the archived
  `docs/spec.md`; `/handoff` and `CLAUDE.md` point at the brief too. The memory note that called `spec.md` "the game"
  is fixed.

**Decided (10 Nov):** N0 passes; departures accepted; exposure stays as planned (classes, names, flats; no rule in
N1); the session tools point at the rebuild.

**Next:**
1. `/spec n1` from the build brief §3 (the sea step), §4 and §6 (records, `fitness`, the one curve, the laws).
2. Build N1 in two sessions, parts in order (one spec, no review round per part).

**Open:**
- In N1, a Lee and an Open habitat of the same substrate and depth differ only by area and neighbours (exposure has
  no rule until filterers; parked in `docs/ideas.md`).
- Parked from your N0 notes: the phone fix (N3's home map), a habitat for leftover deep water, re-cutting big or mixed
  habitats, island peaks instead of a ridge.
- `AGENTS.md` and `docs/workflow.md` still name `full-version.md` as the vision; `CLAUDE.md` says the brief wins.
