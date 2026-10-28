# Status

Updated 2026-10-28 (10b played, committed and tagged; springtails on fungi uncommitted). Git: `slice-10b` (ed3e423) is committed and tagged; springtails eating fungi is uncommitted.
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
1. **You:** try springtails on fungi (10b build notes, last line); commit if it feels right.
2. A small feel pass on animals: snails do poorly (11–102), beetles 0–1, springtails still rising at 60 min.
3. Then **plan the player's part** (P21 e). Candidates to fold in: the species screen and stat cards (P23),
   contrast as a simple start (P21 f), slice 11 readability (P17 e, f, tooltips).

## Open
- Clubmoss sometimes holds just over 60% of its stratum (a dev check; one seed in five). A chain, so tune, don't cut.
- Plants as patches (P20), the deep-time road (later), partnership doors (P19 b).
- Older: Liverworts' timing varies; combos rare; flows (P13), zooms (P15), nitrogen (P11); delete `toys/`?
