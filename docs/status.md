# Status

Updated 2026-10-31: **slice 11 part C is built and played** (not committed). `npm run check` passed and
`npm run sim` 5×60 is 5/5 (one later runner tweak wasn't re-checked). Build notes and numbers:
[slices/11-slot-board.md](slices/11-slot-board.md).

## Done
- **Part C:** habitats (`src/data/habitats.ts`, `src/sim/habitats.ts`; bucket = region × kind), six-slot loadouts
  (`B.gear` in `src/sim/slots.ts`), grams (`src/data/masses.ts`, `docs/research/masses.md`), headlines and chatter
  (`src/sim/news.ts`), the Habitats tab (`src/ui/HabitatsPanel.svelte`, `board.ts`) and view (key 0),
  `tests/habitats.test.ts`. A fix: plant layers exist wherever a plant could live.
- **Your playtest:** it feels as imagined; slots look great; habitat detection loved. Notes in brief.md (31 Oct) and
  the AI options in P28 (systems.md).

## Decided (31 Oct, in brief.md)
- Show all the small, interesting habitats on the map; name and give slots to fewer (maybe only the big parts).
- Regions and habitats feel doubled up. (Earlier: d2, real biomass, as soon as possible.)

## Next
1. Commit part C (with the doc edits from 30–31 Oct), if you want.
2. Pick from P28 (two tiers, naming the big piece, regions vs habitats, borders), then a small slice 11d or fold it
   into the d2 spec.
3. **Spec d2** (real biomass as the sim's stock, P26 d, with P27 b–f), then 12a and 12b.

## Open
- P28: patches clickable or map-only? Which regions option? Habitats shown now: 13–18 at 60/40 tiles.
- Headlines 4–14/h after 30 min, 34–42/h over the first hour. Grams per minute look huge until d2.
- Tile size (1 m² for now). Which P27 items ride with d2? "Best" = share or efficiency?
- Your 30 Oct notes: names, more animals, trees and fruits, bigger tiles; the springtail refound bug.
- Hiding (P25 e). Slugs die out on seed 4. Parked: P17 e/f, P23, P21 f, P20, P19 b; delete `toys/`?
