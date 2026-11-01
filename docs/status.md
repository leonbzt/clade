# Status

Updated 2026-11-01. **Milestone: M1, the first playable · step 1, close out the sim (slice 11e): built, waiting on
your playtest** (`ROADMAP.md`). Work is on branch `slice-11e` (5 commits on top of `main`; merge when you're happy).

## Done
- **11e A, animals in grams** (`src/sim/bodies.ts`, `agents.ts`, `data/animals.ts`): bodies, burn, appetite, keep, dung,
  young and catches in grams; tiles 10 m; Biomass = grams made, costs × 1000 (`NUM.cost`). Snails appetite 30.
- **11e B, nitrogen by the gram** (`src/sim/nitrogen.ts`, `fields.ts`, `life.ts`, `data/species.ts`): tissue N, fixers,
  rain, litter N, leak 10%, fungus as a decay boost, an N ledger; litter decay 0.001/s.
- **11e C, real units** (agent; `src/data/units.ts`, `src/view/scale.ts`, ui): g/kg/t, tile card in cm/%/g/m², counts and
  densities, hectares, slot sizes per m², a scale bar, fewer headlines, the springtail → bristletail split.
- **Checks:** `npm run check` passes. `npm run sim` 5/5 seeds pass. Both ledgers within 0.0001%; first unlock 0.7–0.9
  min (was 0.9). Beetles alive on 5/5 seeds, but only 1–2. Snail swings are local (1–12 per seed, in 12×12 cells),
  none island-wide. Headlines 10–18/h after 30 min. Fragility (decay × 0.5 and × 2, **3 seeds each**, not 5): fungus
  and ferns alive 3/3, ferns thin at × 0.5. Litter 0.9–1.3 years of fall (low edge of 1–3).
- **12a spec drafted** (agent): `docs/slices/12a-the-first-run.md`, linked from the roadmap, three calls for you.

## Decided
- How we work: fewer full sims (CPU); finish open work by itself; agents for smaller tasks (decisions.md).

## Next
1. Your playtest of 11e → `docs/playtests/11e-close-out.md`. Then tick step 1, merge `slice-11e`, the sim freeze starts.
2. Your three 12a calls (splits on the run, what a season does, who the lineage is), then build 12a part A.

## Open
- Tuning to watch in the playtest: beetles thin (1–2); snails hit their group cap on some seeds and lose to
  bristletails on others; ferns 100–275 tiles (were ~600). Decay 0.0008 gives 1.5 years of litter but slows unlocks ~25%.
- `.claude/agents/researcher.md` has an uncommitted edit that isn't mine (yours?).
- Roadmap call 1: M1's goal and "done when". P33 c: confirm at the 12a calls.
