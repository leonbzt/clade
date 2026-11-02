# Slice 00: the grow toy

**Milestone:** M0, step 1 (from `ROADMAP.md`)
**Question:** are there enough decisions in growing a line in side view, and do the heirs feel different?
**Builds on:** decisions.md, 2 Nov: side-view grow run; genome → body → stats; buds and pruning above ground, hidden
soil below (Minesweeper-like), a switch to turn the verbs off; not aimed shots. 2 Nov (build call): the 3 seeds land
in different spots; nutrient is the only currency.

## In
- `toys/grow.html` (`grow-data.ts` numbers, `grow-sim.ts` rules, `grow.ts` view). One plot, 5 seasons.
- **10 genes** as pips (0–8): internode, branching, branch angle, upright, leaf size, root share, root dive, root
  branching, root hairs, vigour. They grow the body by themselves each season.
- **One store: nutrient.** Roots draw it from the soil (rich pockets, thin plain soil); leaves power the draw
  (income = the lesser of light and roots, shown as "limited by"). Growth, upkeep, buds and roots all cost nutrient.
- **The plot:** shade from a neighbour on the left, full sun on the right; rich pockets on the left, stone on the
  right. Pockets deplete and stay depleted across seasons.
- **Verbs (with a cost preview on hover):** *Bud* a shoot node (a new branch); *Prune* a branch (part refund, less
  upkeep, a bud wakes below); *Root*: click the soil to send the nearest root there. Soil is hidden until roots come
  near; seen cells show how many pockets touch them (Minesweeper); stone deflects roots. A switch turns verbs off.
- **Stats live (6):** reach, spread, depth, light, uptake, upkeep.
- **Season end:** a brood of 3 seeds, each mutated (1–3 genes, ±1, sometimes ±2) and landing **on a different spot** of the 5;
  each drawn as a body (grown in open ground) with its genes, stats and its spot's light. Pick the heir; it starts
  with 15 nutrient plus half the leftover. After 5 seasons, a summary of the line.

## Out
- Water as a second stock, grazers, drought (`ideas.md` if wanted later); the garden, tiers, saves (M1).

## Done when
- [ ] In play: grow 5 seasons with verbs on and off; the heirs and spots read differently.
- [ ] `npm run check` passes.
- [ ] Your playtest notes are in `docs/playtests/00-grow-toy.md`.

## Size check
- New systems: the toy only (throwaway). No `src/` code.
- Fits one session.

## Open questions
- Is the spot choice a decision, or does one spot always win?
- Do the verbs add decisions, or busywork (compare with the switch off)?
