# Slice 10: The first animals, as individuals

**Question:** when snails wash up on a drift log and springtails blow in on the wind, do they feel like
*individuals* you can watch and follow? Do you see clearly what they do (eat, breed, wander, starve)? Do snails
grazing your mosses make plant play more interesting, without wiping the garden out?

Builds on slice 09 (tag `slice-09`). From P19 (arrivals, the map, the food web), P20 (animals as agents) and P14,
your calls on 28 Oct. **Numbering:** this takes slot 10; readability moves to slice 11. Swap them if you prefer.

## In scope

### Built to grow: animals are data *(P20)*
Adding an animal or a food cycle should be a data entry, not new code. An `AnimalDef` in `src/data/animals.ts`:
- **Body:** size class (tiny, small, medium, large), speed, lifespan, energy store, upkeep per second.
- **Group:** 1 for most animals. More than 1 makes the agent a **swarm** (springtails): its count grows when fed,
  it splits in two at a cap, and predators bite it down by a few.
- **Diet:** a list of food sources, each with a rate and a gain:
  - `{ stock: 'litter' }` eats a stock
  - `{ plants: stratum, palatable }` grazes plant cover
  - `{ prey: tag }` hunts agents carrying that tag (P19 food web; spiders later)
- **Tags:** what it is to others ("tiny-hexapod", "snail"). Species never name each other; food goes through
  stocks and tags.
- **Makes:** dung or frass into nitrogen and litter; a body into litter when it dies.
- **Needs:** bands on layers, as for plants (water, salt). Fit changes upkeep and breeding.
- **Breeding:** an energy threshold, a cost, and the number of young. Young copy the genome, with a mutation chance.
- **Behaviour:** one small set of states for all animals: forage (move up the food gradient within sight), eat,
  rest, breed, flee (later, from predators). The numbers come from data.

### Agents in the sim
- An agent has an id, a tile and a position inside it, energy, age, a genome (variant id), a state, a group count
  (swarms), and a short log of its last few events.
- A grid by tile for lookups. One update per tick, in a fixed order and with the seeded rng, so `npm run sim`
  stays reproducible.
- **Death** from starvation, old age or bad fit. The body goes into litter.
- **A soft cap per species** (by data) as a safety net, not the main limit. Food should be the limit.
- **Effects go through stocks** (your call): grazing takes plant cover, eating litter lowers litter, and dung goes
  into nitrogen.

### Arrivals *(P19 a)*
- A new node kind, the **arrival**: requirements as now, plus a landmark where the visitor shows up. When they're
  met: a feed line and a marker. "A drift log washed up on the beach. Five snails are riding on it."
- Clicking it **adopts** the arrival (the node's biomass cost): its individuals step off at the landmark.
- **Repeat arrivals:** after adoption, a few more turn up now and then while the habitat suits them. This is real
  for islands, and it saves a line that dies out by chance.

### The nodes
- **Animals** (under Life; fact: animals and fungi are sister groups) → two arrival nodes:
  - **Land snails** ⇢ a drift log on a beach. Needs moss or liverwort cover. Single agents. They graze ground
    cover and like wet tiles. → door **Slugs**: wet +1, broad +1, then **Shell lost**. Slugs are faster and breed
    sooner, but drying out kills them.
  - **Hexapods** ⇢ springtails on the wind, at a vent or ridge. Needs litter. Template: **Springtails** (the
    stand-in ancestor). Swarms that eat litter and speed it into nitrogen. → door **Insects**: dry +1, a hard-skin
    gene, then **Insect body** (wingless first insects). It opens the road to beetles and bees.
- **Ground beetles** ⇢ on a drift log, once springtails and snails live on the island. They hunt `tiny-hexapod`
  (springtail swarms get bitten down) and, less often, `snail`. This is the "you see them get eaten" test. *(Your
  call, 28 Oct: a cute predator instead of the spider.)*
- Headline timings: springtails at about 6–10 min, snails at about 8–12 min. Tune by feel.

### Genes and variants
- **Animal axes:** Dry / Wet and Picky / Broad (diet), two directions each.
  - Picky eats fewer kinds of food but gains more from each.
  - Broad eats anything on its diet list at a lower gain.
- A variant is a genome. Its population is a count of individuals (a swarm counts its whole group). The variant
  rows, the recipes, the candidates and the splits work as for plants.
- **Splitting an animal variant** moves its individuals to the new species. You then place a founder group.

### Plants answer back
- A new plant trait gene, **Bitter**: grazers get 60% less from it, and it grows 15% slower. It mutates in by
  chance. Under snail pressure, bitter variants should win.

### View
- Each agent is drawn (swarms as 3–6 hopping dots). They move smoothly between ticks. Character:
  - **snails:** slow, a shell, a faint slime trail that fades
  - **springtails:** hop in short jumps
- **Click an animal** to open its card and follow it with the camera:
  - its name ("Snail #14, Wet variant"), age and energy
  - what it's doing now
  - its last events (ate moss at the spring, laid 3 eggs)
- An **Animals** map view shows a count per tile. The species list and spindle include animals.

### Dev panel
- Per animal: upkeep, gain, breeding threshold and speed. The Bitter numbers. Agent counts and the cost per tick.
  Time skip as now.

## Out of scope
Plant patches as individuals and battle events (P20, a later slice), beetles, bees, birds, lizards, partnership
doors, flows, a calcium layer, fleeing, wild species, real species references (P18), offline catch-up, readability
(slice 11).

## Done when
- [x] `npm run check` passes. `npm run sim` 5×60 (5/5 pass):
  - slice 09 checks still pass
  - the bot adopts both arrivals
  - snails and springtails are alive at 60 min in 5 of 5 runs *(yes; snails sometimes only 3–6, by a poor beach)*
  - moss cover stays above half its peak
  - a sim tick with all agents stays under a few ms *(3–5.5 ms per tick, plants included)*
  - *Not met yet: beetles (31–40 min) die out, or boom and crash the snails. Litter eaters often sit at their cap.*
- [x] A unit test: a fed agent breeds and its young copy the genome; a starving one dies and leaves litter.
- [x] A unit test: an arrival triggers when its requirements are met; adopting puts agents on the landmark.
- [x] A unit test: grazing lowers cover and adds nitrogen; Bitter cuts what grazers get.
- [x] A unit test: a new animal added only as data (a test def) lives, eats and breeds with no code change.
- [ ] **You:** you can follow a snail and understand its life; the arrivals feel like events; snails change which
  plant variants win.

## Build notes *(28 Oct)*
- **Files:** `src/data/animals.ts` (bodies, diets, numbers), `src/sim/agents.ts` (the individuals),
  `src/sim/arrivals.ts`, `src/view/animals.ts` (sprites, Animals view, specimens), `src/ui/AnimalCard.svelte`.
  Animal species are entries in `SPECIES` (after the plants), so variants, recipes, doors and splits are shared.
  Animal genomes use axis slots 0 (dry) and 1 (diet).
- **Grazing wounds plants:** a bite takes cover and some health (`ANIMAL.wound`). Cover alone regrew so fast
  that food never limited the snails and the caps decided everything.
- **Palatability per plant** (new number, default 1): lichens 0.3, cyanobacteria 0.6, liverworts 0.7 (oil bodies
  deter grazers, which is real), fungi 0.8. Bitter × 0.4 on top.
- **Eating follows the food:** thin cover or little litter feeds less, so animals move on instead of stripping a
  tile. Crowded animals (3 of their kind on a tile) move on and don't breed.
- **Arrivals land near food:** the third of the landmark's tiles with the most edible plants within 6 tiles.
- **Not built:** per-animal sliders in the dev panel (it shows the animal count; tune in `animals.ts`), smooth
  movement between ticks (animals step 10 times a second), and animals on the tile card.
- **Balance is rough.** Some populations still hit their cap (litter eaters, at times snails and slugs); others
  struggle when their landmark is far from food. Needs a feel pass.
