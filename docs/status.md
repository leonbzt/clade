# Status

Updated 2026-10-30: slice 11 part B built and committed (`acd4889`). Part C spec rewritten from P26 (30 Oct):
habitats as six-slot loadouts, grams on top (d3), headlines.

## Done
- **Slice 11 part B** (build notes in [slices/11-slot-board.md](slices/11-slot-board.md)): roles from the data
  (`src/data/roles.ts`), counters (`src/sim/tally.ts`), slots (`src/sim/slots.ts`), a Regions tab, slot icons under
  region names (Regions view), holder highlight, feed lines, a dev panel slot table, tests (`tests/slots.test.ts`).
  - My call: a grazer's size = regrowth capacity (the curve model), not cover grown (ungrazed plants grow ~0).
  - "Yours" = a species you made. Most food links are open (beetles stay at 1–2); 47–74 feed lines an hour.
- **Slice 11 part A** (spec and build notes: [slices/11-slot-board.md](slices/11-slot-board.md)):
  - Wind side (`src/sim/island.ts`, `NUM.island.wind`): direction by seed, a rain ramp added on top of base water,
    salt spray on the windward coast. Open lava at 60 min: windward 0.44–0.47 water, lee 0.20–0.25.
  - Regions (`src/sim/regions.ts`; `s.region`, `s.regions`): landmark surroundings plus wind-side lava pieces;
    11–14 per seed, 60–900 tiles, unique names. Made once; the sim doesn't read them.
  - Regions map view (key 9), region and side on the tile card, a land line in `npm run sim`, tests.
  - Fix (`src/sim/keys.ts`): door patches no longer paint over other doors' candidates (seed 1 never got mosses).
  - Sim shift: wetter and more mixed; club moss leads, lichens drop, moss and fungi roughly double.
- P25 in `docs/systems.md` (slots from food links and habitats); the spec rewritten into parts A, B and C.

## Decided (29 Oct, in brief.md)
- Slots = leads, food links and habitats the sim detects, beside the fixed regions. Guilds later.
- Groups are named base species. 3 slots per region and habitat, plus an island-wide best of.
- The wind's contrast is good; lichens should lead only on the barest ground. Region names only in Regions view.

## Next
1. **Build part C** (spec in [slices/11-slot-board.md](slices/11-slot-board.md)): habitats as the board's places,
   the six-slot loadout with pictures, sizes in grams (P26 d1), a bar showing how full, a Habitats view with cards,
   headlines and chatter.
2. **Your check of part C.** Then **think through d2** (real biomass in the sim; downsides and gains in P26). Remind
   the user before the 12a spec.
3. 12a (the first run) and 12b (coming home); d2 as its own slice before 12a if you choose it.

## Your notes for another session (30 Oct)
- Improve the names of items. More animals. More and larger plants: trees and fruits.
- Bigger tiles (larger scale) with sprites about the same size.
- **Bug:** refounding a springtail with insect traits keeps the springtail picture and name (should become a
  bristletail, or just insects).

## Open
- "Best" = the biggest share (assumed) or the most efficient? "3 slots" read as lead, eater and hunter.
- Hiding (P25 e), later. Tube mouths often merge into a vent field. Slugs die out on seed 4.
- Parked: animal feel (beetles 0–1), readability (P17 e, f), species screen (P23), moss holding water (P21 f),
  plants as patches (P20), partnership doors (P19 b); flows, zooms, nitrogen; delete `toys/`?
