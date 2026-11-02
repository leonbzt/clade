# The rebuild: v1 review and the plan for v2 (2 Nov)

From the 2 Nov chat. **An AI analysis and proposal built on your answers.** Your calls are in
[decisions.md](../decisions.md) (2 Nov, the rebuild direction). Nothing moves into the vision or the roadmap until
you say so.

## 0. In short
- v1 grew a detailed tile sim, but no game loop. It can't idle, and every change needs minutes of sim runs to check.
- v2: **you breed a line in a short side-view run, release it into an idle garden, and a niche × tier list ranks
  your builds.** Genes grow a body, the body gives the stats, the stats give the tier.
- **Tiles for the land, patches for life, the view paints it.** The habitat detail stays; the population sim runs
  per habitat and costs almost nothing.
- Rebuild in this repo on a new branch, after a one-session toy of the side-view grow.

## 1. v1 as built (25 Oct – 2 Nov)
15 slices, 36 commits, ~9,000 lines of code, ~4,500 lines of docs.
- **Sim:** 96×56 tiles (10 m) at 10 ticks/s. Water, shade, soil, litter, nitrogen in g/m²; wind side, salt, vents.
  Plants hold tiles by fit, spread by spores, take tiles with an incumbent edge. Animal groups in grams.
- **Genes:** 4 plant axes and 2 animal axes (±4 steps, each a need-band shift and a stat multiplier), 2–4 traits,
  3 combos, 5 keys. Variants mutate inside a species, hidden until 5 tiles.
- **Tree of life:** an authored backbone with stem doors. **Board:** habitats as connected pieces, six slots, the
  holder by biggest share. **Runs (12a):** seasons, broods of three, the heir's spot, XP.
- **Economy:** one currency from all growth; held slots pay nothing yet.
- **Verbs:** buy a tree node, plant, split a variant; on runs, pick a card and a spot.

## 2. Critique
1. **The sim became the product.** Most slices deepened it; only 12a built play. Playtests: "lost and random",
   "everything still feels really unclear".
2. **No learnable cause and effect.** Release → minutes of need bands, fit, incumbent edge, takeover odds,
   stickiness, smoothing → a holder. It reads as luck.
3. **Coupling makes every change expensive.** Each layer couples to all others; every change needs a whole-island
   run (`npm run check` 48 s; the default sim ~4 min). Snails overrun, one moss takes all, Dry wins everywhere.
4. **Idle isn't possible at this fidelity.** 1.3 ms a tick: 8 hours away is ~6 min of CPU. No saves, no offline,
   no multipliers.
5. **Genetics: too little freedom, too little structure.** Four sliders moving bands by 0.05; keys and doors are a
   tech tree. No combo or form beyond ±2 ever appears at home. No builds.
6. **Drift by accretion:** garden + RPG character + roguelite heirs + loadout + tech tree + codex + idle, each added
   before the last was fun. Regions, split-and-place and merge-back came and went within days.
7. **Docs weigh half the code**, much of it AI condensation.

**Keep:** grow an ecosystem and grow your species; variants that turn up by themselves and the gene pips; the
habitat detail and loadout look; grams and "it feels alive"; the code-painted pixel art; the target slot ("adapt to
your surroundings"); the research.

## 3. The game
```
RUN (active, 5–10 min)          GARDEN (idle, always on)          TIER LIST (the spine)
a line on a young island    →   it competes for a niche;      →   niche × tier, F … S
side view, seasons, broods      holders pay per tier, offline     tiers unlock parts, rows, islands
     ↑──── biomass pays for runs · the list names targets ("Wet shade cover B: Roots ≥ 6") ────┘
```
- **Run:** pick a target niche at home, a young island whose soil and weather fit it, a lineage. The line grows in
  **side view** (after Mycelarium): the genome grows the body by itself each season; you get a few **aimed shoots**
  (pull and release, with a cost preview) to steer tips toward water and nutrient pockets past stone and hard soil.
  The stats read out live beside the body. Season end: a brood of 3 seeds drawn as bodies, with their parts and
  stats; pick the heir. After 4–6 seasons the line comes home as a new species. Pressure is a seasonal event
  (drought, a grazer bloom), not a roaming enemy. A run can auto-grow when idle.
- **Release:** the list shows the score first ("62 → B, holder at 48"); the garden confirms it over a few minutes
  (grazers, crowding). Most outcomes predicted; surprises come with a reason.
- **Idle:** the garden pays per tier held, offline too. Lineage levels give concrete run perks (a season more, a
  brood of 4, a reroll, start with a part).
- **Later (not M1):** animals with their own run (a top-down forage), eras as prestige.

### The tier list, with a light ladder (your call: niches × tiers, "some ladder feeling")
- **Rows are niches** (habitat kind × role); **columns are tiers F → S** with named thresholds on the score.
- **The ladder is succession:** rows open bottom-up, pioneer crust → ground cover → herb layer → shrubs; decomposer
  and grazer rows open when litter and cover allow. Reaching B in a row opens the next. The island growing up *is*
  the ladder.
- **First time at a tier** pays a one-off: a part, a run island, a multiplier.
- **Lineage rank:** a title from the best tier the line holds (Pioneer → Settler → Holder → Keystone), on its card.

## 4. Genetics: a free genome, fixed physics, authored niches

| Layer | What it is | Free or authored | What it drives |
| --- | --- | --- | --- |
| Genome | ~8–10 numbers steering growth: branch angle, segment length, branching odds, root share, leaf or cap size, thickness. Animals later: segments, legs, size, shell, colour | **Free:** everything mutates by itself, small steps | The body |
| Body | Grown by code from the genome (L-system/CA rules in side view; animals a rig of parts). Procedural looks | Emergent | What you see |
| Stats | 5–6 measured from the body: Reach, Roots, Toughness, Spread, Growth, Upkeep | **Fixed formulas, shown** | The score |
| Parts | Organs (rhizoids, vascular tissue, spores, hyphal cords, shell) that add growth rules | **Authored laws**, unlocked by tiers | Which bodies are possible |
| Niche | Weights and thresholds on stats (dry lava: Toughness ×2, Roots ×1) | **Authored** | Score → tier |

- Trade-offs come from the body: tall catches light and costs upkeep; deep roots survive drought and grow slowly.
- Niches want different stat mixes, so no single direction wins; divergence is built in.
- Keys become parts, not templates ("author the laws, not the history", 1 Nov).
- Mutation by itself stays at the heart: broods surprise, and the garden now and then throws up a mutant to run.

## 5. The sim: tiles for the land, patches for life
**Measured 2 Nov** (Node, plain typed arrays, logistic competition plus spread; 8 h offline at one step a second =
28,800 steps):

| Model | ms per step | 8 h offline |
| --- | --- | --- |
| v1 (10 ticks/s, agents, per-tile logic) | 1.3 per tick | ~6 min (288k ticks) |
| Typed-array grid 96×56, 16 species | 0.77 | ~22 s |
| Grid 192×112, 32 species | 9.7 | ~4.6 min |
| Patches 30 × 16 species | 0.01 | 0.3 s |
| Patches 120 × 48 species | 0.2 | ~6 s |
| Habitat flood fill 96×56 (on land change only) | 0.14 | – |

**Feasibility:** a lean grid runs live easily, but offline takes seconds to minutes and needs a worker. Every tile
is also a small pot that can tip (v1's "one moss takes everything"). Patches are ~70× cheaper, and the number of
places balance can go wrong drops from ~5,000 to ~30.

**The four layers:**
1. **Land (tiles, per era):** the generator's height, substrate, water, salt, wind side, vents, landmarks. Changes
   rarely (eruptions, eras, slow thresholds such as soil depth).
2. **Habitats (patches):** today's finder: a flood fill of tile kinds, gaps bridged, small patches kept. Big pieces
   are cut into sub-patches (≤ ~60 tiles) so a lava field isn't one pot. A graph of neighbours weighted by border
   length. Recomputed only when the land changes. Habitat kinds come from the land only; shade, litter and soil
   are patch stocks, so the shapes stay stable while life changes.
   **Habitats still emerge:** soil depth is a slow tile stock fed by its patch's litter. When a tile crosses a kind
   threshold (bare lava → thin soil), the habitats are found again and populations are remapped by area (each
   patch's grams spread over its tiles, then summed into the new patches). This happens rarely and costs ~0.2 ms.
3. **Life (per patch):** 3–4 stocks (water, light or canopy, nutrients, litter) and the open niches; populations
   in grams per species. A fixed step (~1 s). Competition inside a niche by score; consumers through the stocks;
   dispersal along the graph by border length and Spread. Scores per species × patch are cached, recomputed on a
   release or when a stock crosses a threshold. Mutants appear by chance in proportion to population.
4. **View:** paints each species' share onto its patch's tiles, best-fit tiles first, growing out from where it
   arrived, so spreading stays visible. Animal sprites roam by population and eat where the model grazes.

**Efficiency rules:** one fixed step and a seeded RNG, the same online and offline (fair to the clock for free,
deterministic tests). No objects in the hot loop. Stable updates so a long step can't blow up. Model tests run a
10-hour garden in under a second; no headless 60-minute sims; pacing from a curve script.

**Risks:** a patch model can feel like a spreadsheet; the view has to carry the life. Sub-patch cutting and
remapping populations after an eruption are the fiddly parts.
**Idea (not M1):** a close view of one habitat could run a small tile CA for looks, seeded from the patch state.

**The side-view plot** (the run): the body as segments (polylines and nodes, as in Mycelarium), the soil as a
coarse grid for pockets, stone and hard ground; 3 resources (water, nutrients, light); a growth program of ≤ 10
genes; a few hundred growth steps a season. Small and short, so it can be rich.

## 6. The rebuild
- **Why it makes sense:** what changes (tile life, variants, slots, agents, doors, nitrogen) is where v1's coupling
  and tests live; what stays (generator, habitat finder, pixel painting, Svelte shell, check script) is small and
  portable. Refactoring in place would mean keeping the tests and balance set-up of a model being removed.
- **The risk:** a rebuild fails when it restarts with the same open scope. Guard: a one-page spec, a tiny M1, the
  budgets below.
- **How:** this repo, a new branch; v1's `src/`, `tests/` and its docs move to `_v1/` (blocked like `_old/`). Keep
  git history, the tooling, skills, the researcher agent, `docs/research/`.
- **Step 0 (one session):** a toy in `toys/`: genes → side-view growth → stats → a brood of 3. If picking heirs
  isn't fun on its own, nothing on top will fix it.
- **M1, one question:** "Does growing a line in side view and placing it on the tier list make me want the next
  run?" One plant lineage, one garden with ~8 niches, the run, the tier list, idle income with saves.
- **Budgets in the spec:** garden step < 0.1 ms; 8 h offline < 0.5 s; `npm run check` < 10 s; ≤ 4 stocks, ≤ 6
  stats, ≤ 10 genes per kingdom. Adding one means removing one, or your call.
- **Docs:** the spec (≤ 150 lines), decisions, roadmap, status, ideas, slices, playtests.

## 7. References (researched 2 Nov)
- **Mycelarium** ([research/mycelarium.md](../research/mycelarium.md)), PLAN KAPKAN, Steam, demo out, full release
  planned 3 Nov 2026. You grow a fungal network in side view: a forest strip on top, soil below, white polylines
  with nodes. The verb is a slingshot aim with a cost preview; soil has food pockets, water, hard ground and
  stone; mushrooms automate production. Demo feedback: cozy, but no clear goal, size shows no effect, no replay
  after the upgrade tree. **Borrow:** the picture, the aimed shoot, the cost preview. **Avoid:** hidden stat
  effects, endless sessions (the season and the heir pick give the structure it lacks), an annoying roaming enemy.
- **Hatched** ([research/hatched.md](../research/hatched.md)), Sublime Orange (solo), a 3D action roguelite
  (Unity), browser demo since 15 Oct 2026. Creatures are "just math": built in stages (body, head, the rest) from a
  library of parts that must fit every body; picking an attack grows a matching part. No breeding or heredity.
  **Borrow (for animals):** staged assembly with an attachment contract (anchor, size, facing), a cohesion pass
  (shared palette, outline, light), parts previewed on the heir pick. **Clade's own angle:** heredity, which
  Hatched doesn't have; bodies must matter for stats, or it reads as "just Spore".
