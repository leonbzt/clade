# Status

Updated 2026-10-28 (slice 10 played; 10b specced). Git: `slice-09` (eb806c0) is committed and tagged; slice 10 is uncommitted.
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
1. **You:** check the 10b spec (`docs/slices/10b-groups-and-balance.md`) and P21 b–e in `docs/systems.md`.
2. Commit slice 10 (played: notes in `docs/playtests/10-first-animals.md`), then build 10b: animals as groups,
   settled groups on a slow tick, dispersal, food-limited litter eaters, conserved nitrogen, damped predators.
3. Then **plan the player's part** (P21 e; your priority: an active part soon), and decide on contrast (P21 d: no
   climate gradient exists today; wind side, height, disturbance, regions). Slice 11 (readability: P17 e, f,
   tooltips) after that or alongside.

## Open
- Slice 10 playtest: snails stuck on the beach; litter eaters at their caps and everywhere; litter eaters add
  nitrogen (moss covers the island); no bitter mosses; beetles boom and crash. All in 10b.
- Animals tiny at the fit zoom, no smooth movement, none on the tile card: in 10b.
- Plants as patches (P20), the deep-time road (later), partnership doors (P19 b).
- Older: Liverworts' timing varies; combos rare; flows (P13), zooms (P15), nitrogen (P11); delete `toys/`?
