# Status

Updated 2026-11-03. **v2, the rebuild. M1 (the first playable) is built in one pass, all four steps of spec §7;
not yet played by you.** Branch `v2` on GitHub (`leonbzt/clade`, public); v1 is on `slice-11e` and in `_v1/`.

## Done
- M1 steps: `bf14864` (island, habitats, garden), `7eab5ea` (run with pulses, 3 forms), `e10314d` (Svelte loop,
  saves, away, dev panel), `1207027` (reasons, holder news, crowding, vents).
- **Report:** [design/m1-build-report.md](design/m1-build-report.md): overview, every AI default, a critical review,
  the options per decision, a lean.
- Measured: `npm run check` 6.7 s; garden step 9 µs; 8 h offline < 0.5 s; largest file 221 lines.

## Next
1. **You play it:** `npm run dev`, open `/`, fresh save (dev panel → reset). 30–60 min; notes to `docs/playtests/`.
2. Then one tuning pass on your calls. AI lean (report §5): legible picks (fewer pulses with stat trades, release
   the best season), replicator growth in the garden, income per tile held.

## Open
- The report's big risks: picks barely move the score; the first moss sweeps the lava mat; biomass runs away after
  ~3 h; sprouts mostly wilt offline.
- AI choices not in the spec (yours to keep or drop): the crowding rule, succession 5× slower, 0.1 biomass/s per kg,
  costs 10 k / 50 k / 1 M, the sprout pace, the last season released.
- `main` is still v1's older state; `v2` isn't merged (on your word).
