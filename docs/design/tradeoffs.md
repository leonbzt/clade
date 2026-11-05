# Trade-offs: the versions compared

Started 5 Nov at your suggestion ("to follow where tradoffs have been made and what they achieved"). Add a column when a version
changes the model or the look, and a line to the log. Numbers are measured unless marked.

## The versions
| | v1 (to 2 Nov) | v2 plant map | Garden toy | M1 build (5 Nov) | Living sea *(target)* |
|---|---|---|---|---|---|
| **Places** | Tiles (10 m), habitats found by the sim | Tiles for land, 89 patches for life | 3 boards | 3 fixed spots, 3 numbers each | About 40–90 patches |
| **Places change shape** | Yes | Yes (lava → soil → forest) | No | No | Yes, at the edges |
| **Spreading you can see** | Yes | Yes | No | No | Yes |
| **Crashes** | Yes (snails best at 18:00, dead by 19:30) | Not checked | Not checked | None in 1,000 generations | Yes, with a cause in a headline |
| **Your species changes the board** | Not comparable (no boards) | Not comparable (no boards) | By design, not measured | Barely: S worm 9.9 mats, same as no worm | Yes, by a few named rules |
| **Layers to view** | 9 map views | Hover a patch | Resource bars | Species bars | Overview map with views, resource bars |
| **The Life** | None | Toy | Toy | Full: 3 bodies, verbs, hunting | Keep |
| **Body** | Gene pips, specimen | Genes | Toy parts | Verbs pick parts; text only | Drawn, plug in parts; verbs from the body |
| **Progression** | Runs, tree, levels ("I don't get what the levels benefit") | Tier ladder | Foraging level | Tiers, one unlock | Skill tree, inventory |
| **8 h offline** | About 6 min CPU; no saves | About 0.3–6 s by size (benchmark, 2 Nov) | Not measured | 13 ms | About 5 s, up to 10 |
| **`npm run check`** | 48 s | Not recorded here | Not recorded here | 7 s | Under 10 s |
| **What you said** | "It feels alive"; "a little lost and it was random" | "Still seems like a toy" | Liked the roaming, overview and bars | "Fun and as imagined"; "the map ust looks dead" | |

## The log: what we gave up, and what it bought
| When | Trade-off | Bought | Cost |
|---|---|---|---|
| 2 Nov | Tiles → patches for life | Saves, offline, 70× cheaper | The fine-grained picture of spreading |
| 4–5 Nov | The plant game → the Life first | "Fun and as imagined"; you start Lives without deciding to | The world, for now |
| 5 Nov | 3 pots with a self-limit, smooth populations | Stable and learnable; 13 ms offline; can't tip to one winner | No crashes, no booms, boards barely change |
| 5 Nov | Niche picks the body; verbs pick the parts | Quick to start, clear call to action | No building, no adapting feel; reversed the same day |
| 5 Nov | Catch-up budget 0.5 s → about 5 s | Room for a richer map, about 12× by estimate | Slower return after a long time away |
