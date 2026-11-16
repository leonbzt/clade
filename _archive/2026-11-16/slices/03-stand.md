# Slice 03: the stand

**Milestone:** M1, part 2, step 3 (`ROADMAP.md`)
**Question:** Does steering three live saplings, with shade drawn and soil hidden, beat leaving them to their genes
by enough that you play each year instead of wishing for auto? And do levels from growth feel earned?
**Builds on:** decisions.md, 3 Nov: no pulses; your stand idea ("a few saplings… select one at the end to found the
next year"); levels follow growth; P39 (XP from growth, pips you place, "mutation", the spot chosen, effects shown);
P40 (hunts below and above); shoots keep input ("cutting… more energy into a specific shoot… light and shade");
the look (2D low-poly, Pixelify, calm menus); P43 (1a targets, 2b, 3a). Design: [design/after-playtest-02.md](../design/after-playtest-02.md).

## In
**Part 1: the stand, herb and moss**
1. **The stand.** A run is a few years on one plot. Each year 3 saplings grow live, side by side, among the patch's
   natives and garden species. The plot (the soil, what you revealed, drained pockets) carries over the years.
   Pulses, offers, the brood and auto go.
2. **Time.** Live, slow by default; pause (Space), 1×/2×/4×. A year ≈ 60–75 s at 1×: spring to autumn, then winter
   pauses for the pick. Herb 4 years, moss 3 (by feel).
3. **Light, one truth** (the new system). A light grid over the sky, in 20 px cells like the soil. Each leaf darkens
   the cells beyond it along the sun's direction. Saplings, natives and garden species all write into it, and each
   leaf's energy reads its cell. The view draws this grid, so the shade you see is the shade the sim uses. It
   replaces the self-shade count (0.8 per leaf above) and the neighbours' light curve. The Shade attribute lifts
   shade as now.
4. **Steering (P43 1a).** Click a sapling to select it; a solid outline replaces the dotted yellow one; Tab cycles.
   - Click a soil cell: the selected sapling's nearest root tip heads there, as with the toy's dig. A dotted path
     shows, with its nutrient cost before you commit.
   - Click a lit sky cell: its nearest shoot tip leans there.
   - Click a shoot: feed it, and it gets most of the sapling's growth for ~10 s.
   - Cut (right-click) any part: it returns a little nutrient and its upkeep stops.
   - Every verb except the cut costs the sapling's own nutrient, so steering stays scarce. Unsteered, the genes grow
     up, toward light, with roots down; they can't see pockets or stone.
5. **The hunt below.** Hidden soil as now (water, nutrient, hard, stone), with readable hints: a surface sign over
   each pocket (a damp patch, a greener tuft, a stone poking out), and a glint in cells just beyond a root tip's
   reveal. Each plot has one rich pocket (3× nutrient), faintly hinted. Natives' and siblings' roots drain what they
   reach, so it's a race.
6. **Moss hunts the surface.** Its creeping edges are its tips. Damp cracks hide in the top soil row, hinted, and are
   revealed as an edge creeps near. A click on the ground sends the nearest edge there. Lit gaps on the ground count
   the same.
7. **XP from growth (P43 3a).** The grams the whole stand grows fill an XP bar, live. Levels sit on a rising curve:
   about 1–2 pips a year when played well (defaults in `src/data`). Genome upkeep per pip stays.
8. **Winter.** The 3 sapling cards show grams, the niche score with its tier letter, and their mutations. You pick
   the founder, then place the year's pips on its attribute bars. Next year's 3 saplings are the founder plus one
   random **mutation** each ("sport" renamed): +1 in one attribute and −1 in another. About 1 in 6 is a free +1,
   which glints. *Proposal:* you drag each seed to one of the 5 spots, so what you revealed pays next year; by
   default they go to the founder's spot and its neighbours.
9. **Release.** After the last year you pick the sapling to release; the list shows its score in every niche, as
   now. The species' level is its pips.
10. **Effects shown where they act.** Each card shows the year's energy lines: light in, lost to shade, lost to the
    pressure, upkeep. Each line names the attribute that moved it ("Shade 3: kept 14 g"). On the canvas: the reveal
    ring around root tips (Roots), and a flash where the pressure hits leaves (Endurance, Defence), with Health's
    reserve as a small bar.
11. **The spot.** The start screen says "Pick a patch on the map to grow in", with the patch's kind, pressure and
    holders.
12. **The look.** The run screen is drawn like the look toy's 2D low-poly (`toys/look-flat.ts` into `src/view`):
    sky, soil, facets lit by the sun, the light grid as shade, Pixelify, calm menus.

**Part 2: the tree thins (P43 2b)**
13. The tree's 3 saplings stay for the whole run (about 6 years; wood each winter and spring leaves on the outer
    twigs, as now). Each winter you place the pips on one sapling and may cut one down; cutting twigs returns
    nutrient. The last pick is released. Until part 2, a tree sprout runs like the herb.

## Out
- The chromosome gene view (P39) → a later slice, with part B; the coloured attribute bars stand in.
- The island screen and the map in the 2D low-poly look, and variants hunted on the map → step 4.
- Part B (the skill tree, its node cost and path exclusion) → after step 4.
- The 8 h offline budget (520–600 ms) → part B, as in status.md. Old saves: a version bump resets them.

## Done when
- [ ] Part 1 in play: three herb saplings grow live, and their shade is drawn and shifts as they grow. A root sent
      to a hinted pocket, or a shoot fed into a gap, visibly wins the year over an unsteered sibling. The XP bar
      fills, you place pips, mutations show, and the founder seeds the next year. A moss run hunts damp cracks.
- [ ] You don't miss an auto button (your call, after playing).
- [ ] Part 2 in play: a tree stand thinned to one over the run.
- [ ] `npm run check` passes. Few tests: the light grid (a leaf shades along the sun's direction, not against it);
      over one year with one seed, a root steered to a pocket grows more grams than an unsteered one; XP → pips on
      the curve. The pulse and brood tests go.
- [ ] Your playtest notes are in `docs/playtests/04-stand.md`.

## Size check
- **New system:** the light grid. The stand reshapes the run (3 plants, years); `pulse.ts`, the brood and
  `Brood.svelte` are removed.
- **Budgets:** no new stock, stat or gene. Each sapling keeps energy, water and nutrient; XP is a counter. Watch the
  tick time with 3 plants at 4×, and cap the nodes per sapling if needed.
- **Sim structure:** yes: `src/sim/run/*`, `src/data/run`, `src/view/side.ts` (the 2D look), `src/ui/Run.svelte`.
  The garden is untouched.
- **Sessions:** part 1 takes two (1a: the stand, the light grid, steering, the look; 1b: years, XP, pips,
  mutations, sowing, effects shown); part 2 takes one.

## Open questions (three at most)
1. **Sowing:** do you place next year's seeds (lean: yes, so revealed soil pays), or do they fall by the founder?
2. **Mutations:** each one a +1/−1 trade with a rare free +1 (lean), or a plain random +1?
3. ~~**The sun**~~ *decided (3 Nov):* fixed per plot.
