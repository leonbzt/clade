# Status

Updated 2026-10-30: slice 11 part B built and committed (`acd4889`). Your feedback is in P26 (loadouts, real
biomass, headlines).

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
1. **Your calls on P26** (`docs/systems.md`): the six-slot loadout (a), and biomass d1, d2 or d3 plus a tile size.
2. **Part C, reshaped:** habitats as the main places, the loadout board (P26 a) with all three plant layers,
   habitats highlighted on the map with a loadout card (b), headlines in the feed (e). The spec needs rewriting first.
3. **Real biomass** (P26 d) as its own slice if d2; it changes slot sizes, so before 12a (the first run) judges slots.
4. Then 12a (the first run) and 12b (coming home). Pictures (P26 c) with an art pass.

## Open
- "Best" = the biggest share (assumed) or the most efficient? "3 slots" read as lead, eater and hunter.
- Hiding (P25 e), later. Tube mouths often merge into a vent field. Slugs die out on seed 4.
- Parked: animal feel (beetles 0–1), readability (P17 e, f), species screen (P23), moss holding water (P21 f),
  plants as patches (P20), partnership doors (P19 b); flows, zooms, nitrogen; delete `toys/`?
