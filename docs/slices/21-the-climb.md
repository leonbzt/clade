# Slice 21: The climb

**Milestone:** M2, step 6 ([ROADMAP](../../ROADMAP.md)): after a Life, and the climb.
**Question:** Does a Life move my line on, so that I want the next run and can see where my animals came from?
**Status:** spec 9 Nov, questions answered the same day. One spec for the whole step; parts A, B and C are built in order without a new spec or
review round each (*decided 9 Nov*). Each part ends with a short play.
**Builds on:** [decisions](../decisions.md), 6 Nov (after a Life, the trees, new parts, recipes, hatching at the end);
8 Nov (a custom species with its whole build plus mutations); 9 Nov: a run carries both line XP and saved species
("1c"), "spend points gotten by leveling, some levels could unlock things and the currency could be used for further
upgrades", model first. [P47](../proposals.md) (points spent per place, fixation into signature parts).

## Cause
Today a Life only moves the sea: every body opens after the first worm, every starter part is always on offer, and
one clutch part rides along to the next Life (the step 4 and 20A bridges). Nothing grows across runs. Return feedback
is text, and the story of founding and continuation got "a little more confusing" (playtest 19).

## 21A: the model (rules and tests, plain wiring)
1. **Lineages as data** (`data/lineages.ts`): per lineage its body, name, named end point, starting parts, a level
   table and the recipe that opens it. For now the four bodies we have: worm, arthropod, trilobite, swimmer.
2. **A line's state in the save:** XP, level, points, unlocked parts, part ranks, saved species. Save v5; old saves
   drop (as decided 8 Nov).
3. **XP** from a Life: eggs × a tier weight (F low … S high). Rough headlines: level 2 after one good Life, level 5
   after about six, a cap of 10 for the release.
4. **Levels:** +1 point each. Some levels unlock things: a part joins the line's pool (launcher and moult offers),
   and level 10 gives the named end point (a title on the line).
5. **Points buy upgrades** (*decided 9 Nov*, shape open to tuning): per part, rank 1 is a choice, *Lean* (−1 upkeep,
   not below 0) or *Enhanced* (more effect, where the part has a number: eye sight, gut food, gill oxygen, flap
   speed …); rank 2 *Signature*: the part becomes one of the line's built-ins (free, like the leg today). Upgrades are
   data records (id, cost, needs, effect), so the later skill tree's moves and stat nodes are more records of the same
   kind, not a second system. "Needs to feel cool": judge it in 21B's close-up and revise there.
6. **Saved species:** a Life with eggs saves its laid build plus the hatching card you keep (a mutation) as a
   species in its lineage. The launcher's presets are the line's species (about six; the oldest drops).
   The kept card also unlocks its part for the line. The single carried part (20A bridge) goes.
7. **Recipes** (*decided 9 Nov*, following the ladder in `design/full-version.md` §5): a laid build that holds a
   recipe's parts at tier B or better opens that lineage; the recipe's parts become its built-ins. Only the worm is
   open at the start. Drafts to tune: arthropod ← worm + sclerites + proboscis (stand-in for the lobopod until step
   7); trilobite ← arthropod + head shield + digging limbs; swimmer ← arthropod + compound eye + swimming flaps (the
   ladder's Opabinia step folded in). Arthropods gain flaps on Sides for this (Opabinia's lateral flaps), a
   `HOMES` change.
8. **Plain wiring to play it:** the return line says "+N XP · Worm line level 3 · unlocked Gill"; a plain list to
   spend points; the dev panel grants XP and opens all lineages.

## 21B: after a Life
- **Hatching** replaces the clutch screen: the eggs open, the cards are found genes; the one you keep shows on the
  slots as old → new and names the new species.
- **The XP bar fills,** with level-up and unlock lines. A recipe met: "your form became an arthropod", drawn.
- **The close-up tree** (the line's screen): the level track with its unlocks, part ranks on the six slots
  (reuses `Slots.svelte`), the species list.

## 21C: the tree of life and watching it spread
- **One tree screen:** lineages as nodes from the worm, recipes as edges; locked ones as silhouettes with a recipe
  hint; species under each. Tap a node for its close-up. One tap from the map.
- **Watch it spread:** after hatching, the map plays the two sea generations in a few seconds: your line's patches
  pulse, and the causes show as headlines. This should make "where the animals came from" clear.

## Out
- New lineages and their rules, recipe content beyond the four bodies: step 7.
- Tier letters per niche, patch notes, stat bars (P47, still open): parked until you answer P47.
- Renaming species, respec, a whole-line XP pool: `ideas.md` (step 6 review lines).
- Upkeep balance beyond Lean ranks, clutch size: step 10. Map polish: step 9.

## Done when
- [ ] 21A: a model test plays Lives into XP, levels, points, ranks, species and a recipe; the launcher only offers
  unlocked parts; a recipe opens a lineage. `npm run check` passes.
- [ ] 21B: in play, the end of a Life shows hatching, the XP and any new lineage; the close-up spends points.
- [ ] 21C: in play, the tree shows how my lineages came from the worm; the map shows my line spreading.
- [ ] Your notes in `docs/playtests/21-the-climb.md` after each part; then tick roadmap step 6.

## Size check
- One new system: the line's progression. No new stocks or stats; ranks change upkeep and built-ins only.
- Touches the sim: `body.ts` (upkeep and built-ins read the ranks), `sea-life.ts` (launchable bodies, the trait goes).
- About one session per part.

## Open questions
None blocking. Answered 9 Nov: upgrades as above (shape revisited in 21B); bodies from recipes, the swimmer's with
flaps; the kept hatching card becomes a species mutation, unlocks its part and replaces the carried part.
