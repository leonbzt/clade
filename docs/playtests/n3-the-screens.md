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

## Part B · 11 Nov 2026

Rules checkpoint. `npm run check` passes in 5.9 s. Eleven mutation tests cover the size-3 trigger, no rerolls,
clade/common/empty-place eligibility, distinct seeded draws, short and empty pools, board and Enforce weights,
pass and invalid picks, activation outside the growth order, upkeep, later growth and shedding, parent-build
isolation, eggs laid after the pick (including after shedding), and result snapshots. Existing checks pass.
Weights start at 1, add 1 per matching board food node and 1 for guards on a board with a shadow, then multiply
by 2 once if any part of the family was enforced. Empty means the part's primary place is absent from the species
build; an inactive or lost part still occupies it.

One deterministic phone run, `npm run look -- /clade/ scripts/look/n3-b.json`, at 390 × 844: launch from *first
worm*, Grow to 3, verify the offer (Eye, Bulb, Tentacles) against the same seed, pick Eye through the dev API,
and verify unchanged turn/food and upkeep 2. Lay three eggs, end the season, verify `{mutation: {part: 'eye',
place: 'eyes'}, eggsAfter: 3}`, return to the map and verify the parent still has no parts. All assertions pass;
no browser errors. Inspected `.shots/n3-b-mutation.png`: the Eye, Sense and Enforce controls fit on the phone.

No mutation cards yet: F will consume the pending offer and present the choice. Pending offers leave existing
controls playable until that UI lands. Sure inheritance belongs to C; the full three-Life question still waits
for the screens.

## Part C · 11 Nov 2026

Rules checkpoint. `npm run check` passes in 5.9 s. Fourteen clutch tests cover the 0/2/3-card egg thresholds,
determinism, eligible gain/swap/lose changes across four clades, equal gain/lose kind weights independent of pool
size, bare/full builds, compounded family weights across enforced parts, mutation-first inheritance after laying
and shedding, and independent heir parts/genes. Existing gameplay checks pass. New gains and swaps use common
parts' primary places; losses use the parent's actual occupied places, including alternate placements. Kind rolls
are limited to legal changes, then part rolls use ×2 per rank enforced in that family. Rolls remain independent
as in the original clutch; the sure mutation occupies the first card within the total and is excluded from rerolls.

One deterministic phone run, `npm run look -- /clade/ scripts/look/n3-c.json`, at 390 × 844: launch from *first
worm*, Grow to 3, pick and Enforce Tentacles, lay three eggs, end the season, then roll from that actual result.
The two cards are Tentacles/front and Sclerites/sides; repeating the seed matches, 10 eggs gives three cards and
0 gives none, the feed-family weight is 2, and the heir gains Tentacles without changing the parent or World.
Return to the map leaves the bare parent intact. All assertions pass; no browser errors. Inspected
`.shots/n3-c-result.png`: the existing result panel fits; a transient Lay floater crosses its text in this capture
(the result screen is replaced in E). The sandbox initially blocked localhost; the authorized browser run passed.

No hatch settlement or card UI yet: D/E will consume these rules. The full three-Life question still waits for
the screens.
