# Slice 00: the grow toy

**Milestone:** M0, step 1 (`ROADMAP.md`). **AI draft for your approval.**
**Question:** With buds and pruning above ground and hidden soil below, are there enough decisions? And do the heirs
feel different? (Compare with the verbs switched off.)
**Builds on:** decisions.md, 2 Nov: genome → body → stats; the side-view run; a toy first; buds and pruning mixed
with hidden soil (options 1 + 3), with a switch that turns the verbs off. Tastes: the gene pips, grams, "adapt to
your surroundings". It starts from `toys/specimen.ts` (the canvas, the HUD, the organ graph).

## In
- **Files:** `toys/grow.html`, `grow.ts` (view and HUD), `grow-sim.ts` (rules, no DOM), `grow-data.ts` (the genes,
  the targets, the tuning). A link from `toys/index.html`.
- **Genome: 8 genes**, each 1–9 pips, drawn as a chromosome arm:
  Internode (segment length) · Angle (branch angle) · Buds (buds per segment) · Dominance (high: buds stay dormant)
  · Leaf (leaf size: more light, more water) · Root share · Dive (roots go down or sideways) · Thickness (Toughness;
  costs more, pushes through hard soil).
- **Body:** a tree of segments grown by the genes. Each step, the net energy is shared among the active tips, so
  fewer tips grow faster. Shoots lean up and toward light; roots follow Dive. Leaves shade the leaves below them
  (simple column shading). Buds sit dormant along the stems, and low Dominance wakes them by itself.
- **Stocks (3):** energy from leaves; water from water pockets; nutrient from nutrient pockets (a lump each, used
  up). Growth costs energy and water; the verbs cost nutrient.
- **Shoot verbs:** *wake a bud* (hover: a ghost of what the genes would grow there, plus the cost; click: wake it) ·
  *cut a branch* (hover: what falls and what it frees; some of its nutrient comes back).
- **Soil verbs (hidden soil):** a grid of loam, hard soil, stone, water and nutrient pockets, dark until a root comes
  within 2 cells. A revealed cell shows how many pockets lie within 2 cells. *Dig:* pick a revealed cell next to a
  root tip, and that tip heads there (cost preview; hard soil costs more, stone can't be dug).
- **Stats (6), with the formula shown in the HUD:** Reach (top tip height, cm) · Spread (crown width, cm) · Roots
  (pockets tapped) · Toughness (mean thickness) · Growth (net energy/s) · Upkeep (energy and water/s). Biomass in g.
- **Target:** at the start, pick 1 of 3 cards (e.g. Tall herb, Low cover, Deep rooter). Each card weighs the stats
  into a score, and the score gives a tier F → S. The score updates live.
- **Seasons:** 5, about 60–90 s each at ×1, with pause and ×4. The soil you've revealed stays revealed; tapped
  nutrient pockets stay empty.
- **Brood:** at the season's end, 3 seeds. Each has the heir's genes with mutations (mostly ±1 pip, now and then
  ±2), a small body grown without verbs, the changed pips marked, a predicted score, and its landing spot on the soil.
  Pick the heir; it sprouts at its spot and the parent dies.
- **Run end:** the tier on the card, and the line's genomes season by season. New run, or the same island again
  (seed shown).
- **The switch:** verbs on/off. Off: no wake, cut or dig; buds wake by Dominance only; picking the heir stays.

## Out
- Aimed shots: replaced by buds and soil (2 Nov).
- Grazers, drought and seasonal events: add them in a second pass only if the playtest misses pressure.
- Parts and unlocks, the garden, release, the full tier list, saves, idle auto-grow: M1's spec.
- v1's pixel painting: M1. The toy draws plain lines and blobs.

## Done when
- [ ] In play: pick a target, then grow 5 seasons with wake, cut and dig, each with a cost preview. The brood of 3 is
  drawn as bodies with pips. A final tier. The switch turns the verbs off.
- [ ] `npm run check` passes.
- [ ] Your playtest notes are in `docs/playtests/00-grow-toy.md`: enough decisions (on vs off)? Heirs different?

## Size check
- One toy, no `src/`. New: the genome-driven growth and the soil grid (the toy is the system).
- Fits one or two sessions. Build order: the body and stats, the brood, the soil, the shoot verbs, the switch.

## Open questions
1. Seeds landing at different spots (good genes on a poor spot): in or out? AI lean: in, it's one more real choice.
2. Nutrient as the only currency for the verbs, earned by the soil puzzle: AI lean: yes, it ties the two halves.
