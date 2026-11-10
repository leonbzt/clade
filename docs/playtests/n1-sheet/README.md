# N1 screen sheet · 10 Nov 2026

Seed 1 at 360 × 844 and 1440 × 1000. Each build has its map preview and tapped cards; the last two rows start
from **Three worms** and skip 100. The habitat card is **Open mud shallows**, with both slots held.

| View | 360 px | Desktop |
| --- | --- | --- |
| Tentacle worm · map | [Preview](phone-tentacle-preview.png) | [Preview](desktop-tentacle-preview.png) |
| Tentacle worm · cards | [Cards](phone-tentacle-card.png) | [Cards](desktop-tentacle-card.png) |
| Bulb worm · map | [Preview](phone-bulb-preview.png) | [Preview](desktop-bulb-preview.png) |
| Bulb worm · cards | [Cards](phone-bulb-card.png) | [Cards](desktop-bulb-card.png) |
| Sclerite worm · map | [Preview](phone-sclerite-preview.png) | [Preview](desktop-sclerite-preview.png) |
| Sclerite worm · cards | [Cards](phone-sclerite-card.png) | [Cards](desktop-sclerite-card.png) |
| Three worms · generation 100 | [Map](phone-three-worms-100.png) | [Map](desktop-three-worms-100.png) |
| Slots and biomass history | [Habitat](phone-habitat-graph.png) | [Habitat](desktop-habitat-graph.png) |

![Both holders and their history at 360 px](phone-habitat-graph.png)

Reproduce with `W=360 H=844 npm run look -- /clade/ scripts/look/n1-sheet.json` and
`W=1440 H=1000 npm run look -- /clade/ scripts/look/n1-sheet.json`. Shots land in `.shots/n1-*.png`.
The script also checks midgame and runs Three worms on seed 2. No browser errors in either capture.

Observed: seed 1 spreads from 3 to 13 occupied habitats; the sclerite worm loses its mat slot to tentacles.
In Open mud shallows, tentacles hold 287 heads with mats at 19%; bulbs hold 602 heads with detritus at 10%.
Both read C. Food falls, populations overshoot and settle; the graph keeps every generation on one grams axis.
Seed 2 reaches all 15 habitats, with sclerite worms still holding two sand habitats. These are observations for
Claude and the user's play review, not a tuning verdict.

Preset choices to review: founders use 20 heads; groups start apart in their strongest available shared fit
(First worm requests shallows; Rivals requests sand shallows, with the best remaining ground as fallback).
Midgame starts five groups, grants the worm line one lean Tentacles rank, and advances 100 generations.
The existing worm mud multiplier, Gut gland bonus and two-head spread cutoff are unchanged.

Final verification: `npm run check` passed in **8.6 s**, all **41 tests**, including the unchanged ground and sea
timing limits. Earlier attempts exceeded timing limits while other R/database jobs occupied the host; the final
run passed after CPU load dropped. The check uses one reused test worker to reduce contention and startup cost.
