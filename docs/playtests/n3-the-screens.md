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

## Part D · 12 Nov 2026

Rules checkpoint. `npm run check` passes in 7.1 s. Twelve hatch tests cover keeping the parent, a gain, swap and
lose child (independent of the parent), reuse of a build the line already has (key order, ancestors), full-build
matching, numbered names and IDs, letter weights, derived points, zero eggs and rejection without partial
settlement. `finish` now settles through `hatch` once; XP uses the played parent's letter, the report judges the heir.

One deterministic phone run, `npm run look -- /clade/ scripts/look/n3-d.json`, at 390 × 844: launch from *first
worm*, Grow to 3, pick Tentacles, lay 3, end the season. On a copy of the world the first clutch card hatches
"Tentacles worm" (parent root-worm, same line, 6 g, 12 XP) and a second hatch reuses it. The real finish keeps the
parent (no card UI until E): 6 g, 12 XP, one species, a repeat finish changes nothing. All assertions pass; no
browser errors. Inspected both shots: the result card and the map's holders list fit the phone.

## Part E · 12 Nov 2026

The hatching screen (`ui/Hatch.svelte`, `ui/XpBar.svelte`, `ui/life/hatching.ts`) replaces N2's result card.
`npm run check` passes in 7.1 s; three new tests: the clutch screen is deterministic and leaves the world alone,
each heir's letter is its judgement here, upkeep is signed; no eggs give no cards; settling records the heir and
the XP gained; the bar's level, progress and cap. A Life with no eggs skips the cards and keeps the parent.

One deterministic phone run, `npm run look -- /clade/ scripts/look/n3-e.json`, at 390 × 844: Grow to 3, pick
Tentacles, lay 3, end the season. Two eggs lie face down (Hatch disabled); open both: Tentacles first (S here,
upkeep +1), Sclerites (B, upkeep 0). Hatch Tentacles: "Tentacles worm hatches", tier S, +12 XP, the bar fills to
12 / 60. Back to the map: the child lives with `parent` root-worm. All assertions pass. Inspected the shots; the
dialog fits the phone and now sits above the Lay floater (the overlap noted after C).

## Part F · 12 Nov 2026

`ui/life/Mutation.svelte` over the stage; `LifeStage.offering` makes the offer modal (taps, keys, Wait/Grow/Lay,
dev buttons wait). `npm run check` passes in 7.0 s. Phone run `npm run look -- /clade/ scripts/look/n3-f.json`:
Grow to 3 opens Eye/Burrowing bulb/Tentacles with Wait and Lay disabled; picking Eye keeps turn 2, closes the
panel and shows "Mutation: Eye" in gold. All assertions pass; no browser errors. Inspected both shots.

## Part G · 12 Nov 2026

`view/home.ts` (yours, senders, one reason, the overlap rule), `MapView.frame`, App and card wiring; two tests in
`tests/home.test.ts`. `npm run check` passes in 7.2 s. Phone run `npm run look -- /clade/ scripts/look/n3-g.json`:
opens on *first worm* with no dev bar, zoomed on Open mud shallows (gold, B) and its one target, Northwest vent mud
shallows ("B · needs digging"); the other labels name only; no two labels overlap; dev opens the old bar; the
target's card offers "Bare worm from Open mud shallows" and launches "Colonise … tier B". Inspected the shots.
Choice made here: when labels collide, yours and targets win before area (the spec says the smaller hides).

## Part H · 12 Nov 2026

`ui/Line.svelte`, `view/line.ts`; one test. `npm run check` passes in 7.1 s. Phone run `npm run look -- /clade/
scripts/look/n3-h.json` on Midgame: Worm line level 2, no points, Bare worm (gone) with three children, homes
shortened to "10 habitats · best S in Open mud shallows" past two; at 130 XP, one point, +1 rank on Burrowing bulb
gives rank 1/3 and disables every +1. Inspected both shots; fits the phone.

## Part I · 12 Nov 2026

`ui/Tree.svelte`, `view/tree.ts`, `OLD_LIFE` in `data/clades.ts`; one test. `npm run check` passes in 7.2 s.
Phone run `npm run look -- /clade/ scripts/look/n3-i.json`: five clade nodes, only the worm lit (gold, level 1);
arthropod's hint "sclerites + / proboscis / 0 of 2 carried"; every label inside the frame; tapping the worm opens its
line view, Back returns to the tree, Back again to the map. Inspected the shot. Gate hints sit one part per line
(the spec's one-line form overflowed at phone width).

## Your play · 12 Nov 2026

Played the finished N3 (three Lives and more). Your words, lightly trimmed:
- "Everything is looking solid and the UI is nice." "Nothing major is wrong."
- "It was fun to move on to colonise suitable habitats, and grow." "The mutations were nice."
- "The runs themselves are a little boring currently." "I don't feel a lot of decisions in the runs, and in between
  yet."
- "I'm still missing the equipment and RPG character, and more animals."
- "Important to have more action going on on the habitat map, and seeing things move around and unfold."
- The mutation and trait selection screens are very wide on desktop. *Fixed:* the mutation panel is capped at 440 px
  and centred, like the hatching, line and tree screens.
