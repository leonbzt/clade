# Slice 05: a Life (v1)

**Status:** built and played, 4 Nov ([playtest 06](../playtests/06-life.md)): the answer is yes. `toys/life.html`. Next: [slice 06](06-life-v2.md).
**Question:** is a single Life fun with eggs as the goal, locked nodes and a body that grows while you use it?

## In
- One Cambrian seafloor board, 11×8, 20 turns. You see the board before you build.
- **Two body plans that move differently:** worm (1 step, burrows in mud, safe from strikes there) and arthropod
  (2+ tiles in a straight line, mud stops it, soft for a turn after moulting).
- **Pick the plan and up to 2 starter parts,** then grow during the Life: pay food to moult, get a segment, pick 1 of
  3 parts and place it.
- **Every part does something on the board.** Parts on a side matter when a strike comes from that side.
- **Goal: eggs.** Laying takes your turn and costs food; a bigger body lays more. Grow or lay is the core trade-off.
- **Locked nodes:** body locks (claw for brachiopods, digging for buried food), a stat lock (carcass needs size 5), one
  skill lock (sponges need Foraging 2, earned over several Lives).
- **Threats, all known early:** a predator arrives on turn 6 and marks where it will strike; a low-oxygen event on
  turns 13–14; a rival grazer eating the mats.
- **One rare mutation** at a moult. It works at once, but only joins your lineage if you lay an egg afterwards.
- **A small lineage in browser storage:** Foraging, passed-on rare parts, best eggs. Reset button.

## Out
Tier list, release and generations, biome conditions, apex slot and boss fights, branching, the evolution tree,
part rarity and materials, stacking synergies, art.

## Done when
- [x] In play from `/toys/`: build, play 20 turns or die, see eggs and a tier, start another Life.
- [x] `npm run check` passes (the known 8 h offline test aside).
- [x] The user has played it several rounds. Did they start another Life without deciding to? Yes.

## Size check
No `src/` changes. Four files under ~400 lines each: `life-data.ts`, `life-sim.ts` (rules, no DOM), `life-view.ts`,
`life.ts`.
