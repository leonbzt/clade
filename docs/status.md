# Status

Updated 2026-10-27 (slice 07 built). Git: `slice-06` (5f6d8b7); slice 07 code and all doc changes are uncommitted.
`npm run check` passes.

## Done
- **Slice 07 (variants) built**, per `docs/slices/07-variants.md` (results and deviations under "Build notes").
  - Genes as data: `src/data/genes.ts` (4 axes, 3 combos, tiers, mutation and Leafy numbers). Trait shop removed.
  - Sim: `src/sim/variants.ts` (variants, rarity, mutation, naming, the Leafy pity timer); slots hold variant ids.
    Founding a Rare+ variant as a new species in `src/sim/commands.ts`. Mosses unlock through the Leafy gene (`tree.ts`).
  - UI/view: `src/ui/VariantRow.svelte`, species panel rework, the Variants view (key 7), tints (`src/view/look.ts`),
    glints, feed lines, a calmer sprite layer.
  - Tests: invariant test in `tests/sim.test.ts`; variant stats in `tests/variant-stats.ts`.
- Sim 5×60: 5/5 seeds pass slice 06's checks; 5 of 7 new checks pass. Misses: busy species ≥2 shown variants per
  10 min (moss, fern low), combos (1/5), first Rare too early on some seeds.

## Decided
- Nothing new this session (you asked to build slice 07 as specified).

## Next
1. Playtest slice 07: frame rate, does a variant spreading get noticed, does a Rare glint feel like a find, does
   founding feel like your step, is the map calmer.
2. Tune by feel: `GENES.mutate`, Dry steps, `KEY.window` (the tree is now 10–20 min later than slice 06).
3. Commit slice 07 when you're happy; then P13 flows, P14 animals, P15 zooms (rough order, not decided).

## Open
- Accept the deviations? Shown cap + hidden buffer, only shown variants mutate, near-neutral Leafy, name before spot.
- Combos are rare (1/5): bigger Dry steps help them but let a dry moss take 61% of the ground.
- Chunks: does the whole sim always run? The sea line: when? Game identity before the art pass. Nitrogen (P11).
- Older: the 0.5 s plant-scene hitch; delete `toys/`?; brief Q5, Q6, Q8–Q11; fact-check tree facts and Surtsey animals.
