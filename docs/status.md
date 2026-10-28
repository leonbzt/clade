# Status

Updated 2026-10-28 (slice 10 committed and tagged; 10b built, uncommitted). Git: `slice-10` (347e289) is committed and tagged; 10b is uncommitted.
`npm run check` passes; `npm run sim` 5×60: 5/5 pass.

## Done
- Research: `docs/research/tree-of-life-overview.md` (big structure of plants, fungi, animals; insects, birds,
  mammals, snails; island colonisation; good doors and sister groups).
- P19 (clade map for acts 1–3, arrivals, partnership doors) and P20 (animals as individuals, plants as patches)
  in `docs/systems.md`, with your calls.
- **Slice 10 (first animals, as individuals) built**, spec and build notes in `docs/slices/10-first-animals.md`:
  - Animals are agents (`src/sim/agents.ts`), data in `src/data/animals.ts`: diets by stock, plant cover or prey tag.
  - Arrivals (`src/sim/arrivals.ts`): springtails on the wind (~6–14 min), snails on a drift log (~7–15 min),
    ground beetles later (~31–40 min). Adopt on the tree; repeat arrivals while a species is small.
  - Doors: Slugs (Shell lost), Insects (Insect body → bristletails). Animal variants, splits and recipes use the
    plant core.
  - Plants: Bitter gene; palatability per plant; grazing takes cover and some health.
  - View: animal sprites, slime trails, an Animals map view; click an animal to follow it and see its card.

## Next
1. **You:** play 10b (`docs/slices/10b-groups-and-balance.md`, build notes at the end): fewer sprites? snails off
   the beach? regions still differ? bitter mosses under snails? Dev panel shows members, groups, cap and expected.
2. Commit 10b when you're happy; then a feel pass on animal numbers (springtails few, snails small, beetles 1–3).
3. Then **plan the player's part** (P21 e, your leanings recorded there) and contrast, a simple start (P21 f:
   wind side + moss holds water). Slice 11 (readability: P17 e, f, tooltips) after that or alongside.

## Open
- 10b: `npm run sim` 4/5 (one seed: clubmoss 64% of its stratum). Tick 3–4.7 ms (target 3). Bitter not measured.
- Plants as patches (P20), the deep-time road (later), partnership doors (P19 b).
- Older: Liverworts' timing varies; combos rare; flows (P13), zooms (P15), nitrogen (P11); delete `toys/`?
