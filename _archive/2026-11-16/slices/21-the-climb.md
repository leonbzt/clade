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

## 21C: the tree of life, place it and watch it spread
- **One tree screen:** lineages as nodes from the worm, recipes as edges; locked ones as silhouettes with a recipe
  hint; species under each. Tap a node for its close-up. One tap from the map.
- **Place it, then watch** (*decided 9 Nov*, replaces "watch it spread"): you choose where the eggs settle, then the
  map plays the two sea generations in a few seconds: your line's patches pulse, the causes show as headlines.
- The map stays linear until step 9 (*decided 9 Nov*). Hatching keeps offering genes from outside the line.

### Build brief (Codex; one commit per part, in order)
Read `AGENTS.md`, this spec, `docs/status.md`. Files under ~400 lines (`main.ts` is 339: put new flow in `ui/`).
1. **The hidden box** (still there after 21B's `.metaWrap[hidden]` fix). Find it with `npm run look` on the map,
   with and without the launcher open, after a Life (Dev: fake one) and after closing the close-up. Suspects: every
   `.metaWrap` / `.panel` that renders empty (`Meta.svelte` 135, 169, 172; `Hatch`, `LineView`, `Equip`,
   `LifeBody`, `Menu`). Done: no empty panel in any of those states; before/after screenshots.
2. **Place it (sim).** The pending result gets a chosen release patch: `placePending(s, p, patch)` in
   `sim/sea-life.ts`, allowed only for the Life's patch or its neighbours (`patches[p.patch].nb`); default the
   Life's patch. `settlePending` releases there and sets `continuation.patch` to it. `release` already halves the
   score off the proven ground (`SEA.unproven`), which is the risk of moving. Validate `place` in `sea-save.ts`.
   Tests (`tests/sea-life.test.ts`): a neighbour gets the eggs; an illegal patch changes nothing; no choice = today.
3. **Place it (UI).** The end card's "Release your eggs" opens the map in a placing mode: the Life's patch and its
   neighbours lit, others dim; tapping one shows one line (ground, who holds it, hunters, "proven" or "new ground:
   half strength") and a "Release here" button; then hatching as today. A reload mid-choice resumes it.
4. **Watch it spread.** `settlePending` keeps the save atomic but also returns frames for its `afterLife` steps:
   per generation, your line's population per patch and that step's headlines (`sea-news.ts tell`). After the XP
   screen's Continue, the map replays them, about 1.5 s per generation: patches where your line grew pulse in its
   colour, a fall pulses red, the headlines show under the map; if nothing moved: "Your line held patch N". Skippable
   with a tap.
5. **The tree screen** (`ui/Tree.svelte`, a "Tree of life" button next to the map's lines): Svelte and CSS, no
   canvas; rows from the worm by `recipe.from` (`childrenOf` in `ui/line.ts`). An open node: `Creature.svelte`,
   name, level, its species' names (newest three, "+N"); a locked one: a dark silhouette and `recipeText`. Tap an
   open node for `LineView`. Fits a phone (360 px) without side scrolling. Test: every lineage reaches the worm.
- **Checks:** `npm run check`; `npm run look` screenshots of placing mode, one replay frame, the tree (fresh and
  after Dev "Open all lineages"). Not in this brief: a 2D map, a wild moult offer, P48.
- **Review fixes (Claude, 9 Nov):** no replay after a Life without eggs; the placing line shows the real strength
  (`releaseStrength`); the replay opens with the release ("Your eggs settle") and explains the two generations; the
  map zooms (`ui/MapZoom.svelte`: +/−, drag, auto zoom while placing and in the replay). Hidden box: gone (your look).

## Out
- New lineages and their rules, recipe content beyond the four bodies: step 7.
- Tier letters per niche, patch notes, stat bars (P47 closed 9 Nov): step 9 or ideas.md.
- Renaming species, respec, a whole-line XP pool: `ideas.md` (step 6 review lines).
- Upkeep balance beyond Lean ranks, clutch size: step 10. Map polish: step 9.

## Done when
- [x] 21A (9 Nov, `tests/lineage.test.ts`; not played yet): a model test plays Lives into XP, levels, points, ranks, species and a recipe; the launcher only offers
  unlocked parts; a recipe opens a lineage. `npm run check` passes.
- [x] 21B (played 9 Nov: "really cool approaches"; built 9 Nov, `tests/line-view.test.ts`): in play, the end of a Life shows hatching, the XP and any new lineage; the close-up spends points.
  Also from the 21A play: species are launch bodies (decided 9 Nov), the moult view shows each part once, upkeep per slot.
- [ ] 21C: in play, the tree shows how my lineages came from the worm; I choose where my eggs settle and see the line spread.
- [ ] Your notes in `docs/playtests/21-the-climb.md` after each part; then tick roadmap step 6.

## Size check
- One new system: the line's progression. No new stocks or stats; ranks change upkeep and built-ins only.
- Touches the sim: `body.ts` (upkeep and built-ins read the ranks), `sea-life.ts` (launchable bodies, the trait goes).
- About one session per part.

## Open questions
None blocking. Answered 9 Nov: upgrades as above (shape revisited in 21B); bodies from recipes, the swimmer's with
flaps; the kept hatching card becomes a species mutation, unlocks its part and replaces the carried part.
