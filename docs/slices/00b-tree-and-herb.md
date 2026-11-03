# Slice 00b: the tree beside the herb (toy pass 2)

**Milestone:** M0, step 1 (`ROADMAP.md`), second pass of the grow toy.
**Question:** Does a tree, whose body lasts all run, make cutting and steering matter, and does it play differently
from the herb? And can you now tell what a build gains and loses?
**Approved 3 Nov.** **Builds on:** decisions.md, 3 Nov: add the tree beside the herb; plants must feel different ("moss vs herb vs tree
should all play different"); playtest 2 ("runs felt too short to make a difference", "didn't see a benefit of
steering", "didn't get the advantages and disadvantages", asymmetric plants). Research:
[research/plant-models.md](../research/plant-models.md). Changes `toys/grow*.ts` from slice 00.

## In
- **Pick a form at the start** beside the habitat and the target: *Herb* (as now) or *Tree*. Same 8 genes, same 3
  stocks, same 6 stats; the form changes the rules, not the genome.
- **Tree:** one body for all 8 seasons of 60 s; no heir pick between seasons.
  - **Winter:** leaves fall, the woody frame and its buds stay; next spring the tips and buds grow on.
  - **Wood:** each season every living segment thickens with its load (secondary growth); thicker stems carry
    more height (thickness caps how tall a branch may grow) and add Upkeep. Thickness gene = how fast wood builds.
  - **Cut:** removes the branch and everything above it; the dormant buds just below the cut wake (re-sprouting).
  - **Roots:** steered roots stay and keep drinking every season; the dig therefore pays off over the run.
  - **Run end:** a brood of 3 seeds, drawn as young trees with pips; pick one, shown as the line's next tree.
- **Herb:** as in slice 00, plus the season's result carries a little: a better final score gives the brood a 4th
  seed. (Keeps the change small; the herb stays the "breed fast" form.)
- **Readable trade-offs:**
  - Each gene shows its plus and minus in one line (Leaf: + light, − water and energy), from `grow-data.ts`.
  - Every verb preview shows its effect on the score and the stats ("cut: −4 Upkeep, −2 Reach → score +3").
  - The brood shows each seed's stat changes against the parent, with the biggest reason for its score.
- **Asymmetry fix:** buds alternate sides along their own stem (not by the plant's node index); the lean toward
  light only acts when one side is clearly brighter, and it is weaker.

## Out
- Moss (spreads over the surface, no roots, dries and idles): M1, decided 3 Nov; its own toy or slice there.
- Breeding with dominance (PlantStudio), the age scrubber: `ideas.md`.
- Grazers, drought, seasonal events: only if this playtest misses pressure (`ideas.md`).
- Skills / ways of life unlocking forms ("Woody stem" opens trees): the spec, M1.
- Pixel painting, saves, the garden: M1.

## Done when
- [x] In play: pick Herb or Tree. The tree keeps its body over 8 seasons, drops and regrows leaves, thickens, and
  re-sprouts below a cut. Genes show plus and minus; every verb preview shows its score change; the brood shows why.
  Plants look balanced left to right in the open.
- [x] `npm run check` passes.
- [x] Your playtest notes are in `docs/playtests/00-grow-toy.md` (playtest 3): do cuts and digs matter on the tree?
  Do herb and tree play differently? Can you read the trade-offs?

## Size check
- New system: the perennial body (winter, wood, re-sprouting). No new stock, stat or gene; within budgets.
- Touches the toy only, no `src/`. `grow-sim.ts` is 245 lines: tree rules go in a new `grow-tree.ts`.
- One session, maybe two. Build order: asymmetry fix, readable trade-offs, the tree.

## Open questions
- Answered 3 Nov: the tree runs 8 seasons of 60 s; a good herb season earns a 4th seed.
