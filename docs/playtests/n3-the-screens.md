# N3: the screens

## Part A · 11 Nov 2026

Rules checkpoint, before the new screens. `npm run check` passes in 5.9 s. Seven new tests cover the original XP
weights and thresholds, multiple levels and the level-10 cap, derived points, carried-part ownership, rank-3 and
zero-point purchase limits, upkeep floored per part, the next Life's Enforce headroom, job data and law 2. Existing
preset checks also require nonnegative points; Midgame now has the 60 XP that funds its existing rank.

One deterministic phone run, `npm run look -- /clade/ scripts/look/n3-a.json`, at 390 × 844: award 72 XP to the worm
line, reach level 2, spend its one point on tentacles, launch Colonise, verify the Life receives rank 1, end the
season and return to the map. All assertions pass; no browser errors. Inspected `.shots/n3-a-map.png` and
`.shots/n3-a-life.png`: the Life fits, with upkeep 1 in its HUD. Existing map labels crowd and clip at the edges;
the label rule belongs to G.

The first full check exited without test diagnostics; isolated line tests and both subsequent full checks passed.
No code change was needed for that exit. No new screens yet: XP settlement is D and spending UI is H. The full
three-Life play question waits for the screens.
