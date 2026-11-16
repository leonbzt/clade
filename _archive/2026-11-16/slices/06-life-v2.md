# Slice 06: a Life, v2

**Milestone:** none set yet; the direction changed on 4 Nov ([design/big-picture.md](../design/big-picture.md)).
**Question:** does a different habitat make a different build best, and does growing up to a finished body feel good?
**Builds on:** decisions.md, 4 Nov: habitats as areas in the garden, fewer slots, a body you finish, lay only later, worm tunnels.
[Playtest 06](../playtests/06-life.md). The toy: `toys/life2.html`. v1 stays at `toys/life.html` to compare.

## In
- **A garden strip:** three boards side by side as one stretch of seafloor. Each shows your population (eggs added up), your best
  body per plan with its tier and parts, and which rare parts you've found. Pick where to live.
- **Three fixed habitats, as hand-editable text maps** (`toys/life2-habitats.ts`), each with its own tier scale, threats and rare parts:
  - **Archaeocyath reef:** rock lanes, shell beds, two mud pockets, the predator from turn 5.
  - **Mud flats:** hidden food; a Mudslide on turns 12–15 takes the oxygen out of the mud, so burrowers have to surface.
  - **Sulfur basin:** rich dead water the predator won't enter; an Oxygen crash on turns 9–11.
- **A body you finish:** 6 slots (1 head, 4 sides, 1 tail), 2 starter parts, one part per moult, sizes 1 to 5. Every moult adds eggs per
  lay. Reaching size 5 heals you.
- **Lay only once adult:** from size 3.
- **Worm tunnels:** in mud, up to 3 tiles through connected mud, around corners; Bristles add 1 each. On sand it crawls 1.
- **All parts visible at once,** under the board.

## Out
- Anything running by itself: no sim, residents or spill; population is only a sum → the garden toy (slice 07, P45).
- Feel, animation and the rest of the UI → "only later" (4 Nov).
- Stacking synergies, a third body plan → ideas.md.
- Release choice, species, branching, the role from what you ate → the garden toy or later.

## AI additions to check (not asked for)
- Rare parts per habitat, with three new ones: Blue blood, Sulfur symbionts, and Progenesis (lay at any size, breaking the adult rule).
- The predator won't enter dead water. Each habitat has its own predator and rival name and its own rival diet.
- Numbers: food up by 1–2 per node, Gut gland +2 food (at +1 it barely paid), arthropods down to 1 head slot.
- Saves are separate from v1, so rare parts found in v1 don't carry over.
- `real` lines, predator and habitat facts are from memory: please correct them.

## Done when
- [x] In play from `/toys/`: pick a habitat, build, grow, lay, die or finish, see the eggs back in the garden.
- [x] `npm run check` passes.
- [x] Played through the garden toy, which runs on these rules; notes in [playtest 08](../playtests/08-garden.md). No separate v2 notes.

## Size check
- New systems: none in `src/`. Toy files, all under 400 lines (`life2-data.ts`, `life2-habitats.ts`, `life2-sim.ts`, `life2-view.ts`, `life2.ts`).
- Touches sim structure? No.

## Sanity numbers (a throwaway greedy bot, 200 Lives per row, fresh lineage; a person should beat it)
Mean eggs by policy, lowest to highest. Reef: arthropod 8.6–17.9, worm 6.4–12.3. Mud flats: worm 6.9–34.0, arthropod 0–7.1. Basin:
arthropod 7.2–22.8, worm 14.0–25.0. So the mud flats clearly favour the worm and the reef the arthropod; **the basin doesn't yet favour
the arthropod as intended.** Tier scales are first guesses from these numbers.

## Open questions
1. Do sides still matter with only 6 slots? Unanswered from 4 Nov.
2. Is "lay from size 3" better than free laying? v1 is there to compare.
3. Is the worm too strong overall? Its cheap moults may be why.
