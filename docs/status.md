# Status

Updated 2026-10-29: slice 11 part A committed, slots redesigned (P25). Check passes; sim 5×60: 5/5.

## Done
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
1. **Build slice 11 part B** (slots and the board): roles from data, counters where animals eat, plants grow and
   litter falls, `src/sim/slots.ts`, the Regions tab, slot icons on the map, feed lines, dev panel. Then a check.
2. Then part C (habitats), then 12a (the first run) and 12b (coming home).

## Open
- "Best" = the biggest share (assumed) or the most efficient? "3 slots" read as lead, eater and hunter.
- Hiding (P25 e), later. Tube mouths often merge into a vent field. Slugs die out on seed 4.
- Parked: animal feel (beetles 0–1), readability (P17 e, f), species screen (P23), moss holding water (P21 f),
  plants as patches (P20), partnership doors (P19 b); flows, zooms, nitrogen; delete `toys/`?
