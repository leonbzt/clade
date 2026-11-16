# Slice 01: builds (attributes, a tree per form, pressures)

**Milestone:** M1, part 2, slice 1 of 3 (genes → stand → map and income; decisions.md, 3 Nov, P38)
**Question:** Does a second run become a build you chose for a niche (a pure that wins there and loses elsewhere),
instead of an all-rounder?
**Builds on:** decisions.md, 3 Nov: playtest 01 ("the genes are still the problem", "fast climb means noticeable
improvement"); builds: three layers, CSR as identity, (c) for the points, three locks against all-rounders, upkeep
grows with the genome (try it), the lean M1 version. Design: [design/builds.md](../design/builds.md) §2–5.

## In
**Part A: attributes and pressures** (play it, then part B)
1. **The genome is 8 attributes**, each a bar of 0–10 pips. They replace the 8 shape genes.
   - Compete: Stature, Roots. Endure: Shade, Endurance, Defence, Health. Spread: Pace, Spread.
   - The founder starts with 1 pip in each. The **level** is the total number of pips.
2. **The body's look comes from the attributes:**
   - Stature sets the internode length and the dominance.
   - Pace sets the leaf size.
   - Shade sets the leaf breadth.
   - Roots sets the root share.
   - Defence sets the thickness and tints the colour.
3. **Each attribute's rule:**
   - **Pace:** more energy per leaf, more upkeep, faster in the garden.
   - **Roots:** a wider soil reveal and one extra root offer at 5+, for more root control.
   - **Shade:** less light lost to your own leaves and to neighbours' shade.
   - **Endurance and Defence:** armour against the pressures (item 5).
   - **Health:** a reserve that absorbs pressure damage first; the garden loses grams more slowly.
   - **Spread:** the garden spreads faster along borders and sprouts come more often.
4. **Levels come through the brood:** each season's 3 seeds are the parent plus 1 pip, each in a different attribute.
   - One seed in three is a **sport**: +2 in one attribute and −1 in another.
   - A moss run gains 4 levels, a tree run 8. The lineage keeps its level.
   - The release shows the gain over the parent ("+14 in Lava mat").
5. **One pressure per niche**, shown as an icon on the tier-list row and as a reason on the map.
   - The niches (AI defaults, in `src/data`): Lava mat heat · Bare mat drought · Wet mat shade · Bare herb wind ·
     Wet herb flooding · Forest herb shade · Forest canopy wind · Wet canopy flooding.
   - The armour against each: Endurance for heat, drought and flooding; Defence for wind; Shade for shade.
   - **The score is multiplied by a smooth ramp:** ×0.4 with no armour, rising to ×1 at the niche's need.
   - **In the run:** the patch's pressure takes a share of each pulse's energy unless armoured, Health first.
6. **Upkeep grows with the level:** each pip adds upkeep in the run and in the garden's fit. A high-level
   all-rounder starves on poor stocks.
7. **The 6 stats are still measured from the body** (genome → body → stats, tastes.md).
   - The stat "Spread" is renamed **Cover**, to free the name for the attribute.
   - The niche weights are retuned so the rows want opposite things (Growth leaves some rows).
8. **The CSR dot:** each species gets a small triangle with its points per corner (normalised). It shows on the
   species card, the brood and the tier-list cell.

**Part B: the tree** (the one new system)

*Waits until after the stand (decided 3 Nov, playtest 02); not dropped.*

9. **Each form has 6 nodes:** three branches (C, S and R), two nodes each.
   - A node costs biomass (or another currency, open) and needs an attribute threshold (the locked reward).
   - **Paths keep a choice** (you, 3 Nov: "not sure, should still have choice"). Default to try: any node once
     its threshold is met, but a branch's second node locks the other branches' second nodes for that lineage.
   - A node is one effect from a short list: armour against one pressure, a stat multiplier, or a garden rule.
   - The moss tree:
     - S: *Desiccation sleep* (Endurance 3, drought armour) → *Crust* (Endurance 5, heat armour).
     - R: *Spore cloud* (Spread 3, spreads twice as far) → *Pioneer* (Pace 4, first on new bare ground).
     - C: *Cushion* (Stature 3, Reach ×1.3) → *Turf* (Stature 5, shades the other mats on its patch).
   - Herb and tree get the same shape, with names and effects in `src/data`.
10. **Each node's name is the lineage's form name** ("Crust ash moss"); this replaces the named forms.

## Out
- Grazers, Defence against bodies, the full C/S/R trees, chromosome duplication → `ideas.md` (M2 or later).
- Neighbour strategies (climbers, parasites, nurses, allelopathy) → `ideas.md`.
- New run verbs from nodes, and the stand → slice 2. The map palette and income → slice 3.
- Respec, buying attribute pips. P38's garden question (one line holding a row) stays open.
- Old saves: a version bump resets them.

## Done when
- [ ] Part A in play: you see the bars, the CSR dot and the pressure icons. A second moss run, steered at one row,
      reaches B there and scores visibly lower in the others.
- [ ] Part B in play: two sister lineages on different branches look and score differently.
- [ ] `npm run check` passes. Only a few tests are added (on your call: play more, fewer model tests): the ramp,
      upkeep by level, and one "no founder-level genome reaches B everywhere" check.
- [ ] Your playtest notes are in `docs/playtests/02-builds.md`.

## Size check
- **New systems:** the tree (part B). Attributes replace the genes, and pressures are niche data plus one multiplier.
- **Budgets:** 8 genes (≤ 10); 6 stats (one renamed); stocks unchanged.
- **Sim structure:** yes. It touches `data/genes`, `data/niches`, `sim/species`, `sim/garden` (fit) and `sim/run`
  (growth reads attributes).
- **Sessions:** two, part A then part B.

## Open questions (three at most)
1. **Paths:** how much exclusion (you: "should still have choice")? Settle after playing part B.
2. **Node cost:** biomass or another currency (you, 3 Nov)? Lean: biomass, until a reason for a second one.
3. **Pressure kinds:** *decided (3 Nov):* heat, drought, shade, wind, flooding. Sun and cold → `ideas.md`.

## Build notes, part A (3 Nov, AI)
- **Levels per run:** one per brood (moss 3, herb 4) and one per winter for the tree (7, picked at spring), not 4
  and 8. A last pick at the release would make it 4 / 5 / 8 (your call).
- **Defaults to tune by feel** (`data/genes` RULES and SHAPES, `data/niches`): needs lava 5, bare mat 3, wet mat 4,
  herbs 5 / 5 / 6, canopies 7 / 6. Weights retuned so most of each row's weight is on stats another row of its layer
  wants the opposite of (the test showed a medium body otherwise keeps most of the score everywhere). The best
  level-8 all-rounder now tops out at 54 / 40 / 51 (mat / herb / canopy).
- **A quick check (auto picks, seed 11):** a lava moss steered at Endurance goes 25 → 67 (A) there, 23 and 21 in
  the other mat rows. A bare-mat moss reaches only 36 (its body is a tight moss, so it scores 65 on lava): Bare
  mat's Cover weight may want a lower need or a creeping body.
- **Budget:** 8 h offline takes 0.5–0.7 s, on the last commit too (succession re-finds habitats every 300 s). The
  test passes or fails by load. Not fixed here.
