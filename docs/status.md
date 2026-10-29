# Status

Updated 2026-10-29 (planning done: the game's shape; slice 11 spec written). Git: `slice-10b` (ed3e423) tagged; springtails on fungi committed (d8a6293); the planning docs are not committed yet.
`npm run check` passes; `npm run sim` 5×60: 5/5 pass.

## Done
- **The planning session (28–29 Oct):** the game's shape is lineages (your characters), runs on young islands, and a
  home slot board the sim makes. The plan, principles and order are in `docs/review-game-shape.md`; your calls
  are in P24 (`docs/systems.md`).
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
1. **Build slice 11: the slot board** ([slices/11-slot-board.md](slices/11-slot-board.md)): the wind side, named
   regions, roles from data, slots read from the sim (size, use, holder, trend, fed by), on the map and in a Regions
   tab. Read-only; the economy doesn't change.
2. Then 12a (the first run) and 12b (coming home), as in [review-game-shape.md](review-game-shape.md) §8.
3. Parked: a small feel pass on animals (beetles 0–1, springtails still rising at 60 min), readability (P17 e, f),
   the species screen (P23), moss holding water (P21 f).

## Open
- Clubmoss sometimes holds just over 60% of its stratum (a dev check; one seed in five). A chain, so tune, don't cut.
- Plants as patches (P20), the deep-time road (later), partnership doors (P19 b).
- Older: Liverworts' timing varies; combos rare; flows (P13), zooms (P15), nitrogen (P11); delete `toys/`?
