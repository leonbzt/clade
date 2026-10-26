# Minigames and activities (proposal, 26 Oct)

AI brainstorm. Nothing here is decided. The three toys that test it are in [slices/02-toys.md](slices/02-toys.md).

## The honest frame

- Math toys (cellular automata, boids, L-systems, Lenia) make things **look alive**, but on their own they're for
  watching, not playing. Changing their rules gives unpredictable results; steering them by hand gets fiddly and
  fights idle play.
- What works in idle/RPG games: **pick → clear result → upgrade**. So the toy is the ground you act on, with 2–3
  readable verbs.
- **Its output boils down to a few numbers** (cover, water, fit). Those numbers nudge the economy within a band
  (e.g. ×0.7–1.3); the curve model drives the rest. Otherwise you can't balance it by feel.
- **Say rules in words** (toy 3 does this). Emergence is fun only if you can tell why it happened.

## One frame for every kingdom: one grid, four verbs

**Proposal:** every kingdom plays on the same tile grid, at a different layer. Plants live **on** tiles, fungi run
**under** them, and animals move **over** them. Each kingdom gets the same four verbs in its own flavour.

| Verb | What it means | Plants | Fungi and lichen | Animals |
| --- | --- | --- | --- | --- |
| **Grow** | Decide where the next growth goes | Steer the spread across tiles | Extend a thread from tile to tile | Move the herd, claim a range |
| **Gather** | Collect what turns up | Dew, stray spores, seeds | Dead matter, a plant's sugar | Forage patches, nesting spots |
| **Guard** | Answer a pressure | Dry spell, shade, grazers | A cut thread, drought | Predators, storms, overgrazing |
| **Bet** | A gene pick that rewrites a rule, with a cost | Creeping vs. dense | Wide net vs. thick cords | Tight herd vs. spread out |

Why this fits:
- **Relationships come for free.** Layers touch: grazers eat plant tiles, fungi link plants (mycorrhiza), seabirds
  drop nutrients on tiles. That serves the "relationships in the core" pillar without a separate system.
- **Guilds change the rules, not the verbs.** That matches "one minigame per kingdom; guilds change its rules".
  Grass spreads fast, stays low and regrows after grazing. A shrub is slow and shades its neighbours. A tree is very
  slow, casts a wide shade and lives long. A flower only spreads seed after a pollinator visit.
- **Attention → idle.** Each verb can be handed to a standing order once you've done it by hand (Antimatter
  Dimensions style). Early on you steer; later the colony steers itself, and you only Bet.
- **The colony patch and the garden can be the same grid** at two zoom levels.

Risks:
- **Sameness.** Kingdoms must differ in the *shape* of the decision, not just the skin: plants decide **where**,
  fungi **what connects to what**, animals **when and where to move**.
- **Phones:** a cellular automaton of 1–5k tiles and a few hundred boids are fine. Lenia and big ray-traced light
  are not.

## Classical approaches

### Simulation methods

| Method | Good for | Cost | Verdict |
| --- | --- | --- | --- |
| Cellular automata (Life-like, stochastic) | Colony spread, succession | Low | **Core candidate** (toys 1, 3) |
| Forest-fire model (Drossel–Schwabl) | Disturbance: lava flows, fires, storms that reset patches, then succession | Low | Strong fit for a volcanic island |
| Percolation | "Does the colony connect from the vent to the beach?" as a goal | Low | Nice goal shape |
| Space colonization (Runions 2007) | Shoots, roots, leaf veins | Low | Specimen look; toy 2 |
| L-systems (Prusinkiewicz, *The Algorithmic Beauty of Plants*) | Gene-driven plant shapes | Low | Specimen look |
| Organ graph + rewrite rules (VirtualPlantLab, GroIMP) | Growth with light and sugar flow | Medium | Ideas only, see [research](research/virtual-plant-lab.md) |
| Diffusion-limited aggregation | Lichen crusts, coral | Low | Visual flavour, pioneer lichens |
| Physarum agents (Jones 2010) | Fungal networks linking plants | Low–medium | Fungi kingdom candidate |
| Boids (Reynolds 1987) | Herds, flocks, shoals | Low | Ambient animals first, later the animal game |
| Ant pheromone trails | Insects, foraging routes | Low | Pollinator / insect candidate |
| Reaction–diffusion (Gray–Scott) | Moss-mat textures, animal coats | Low | Visual only |
| Logistic growth / Lotka–Volterra | The garden's numbers | Low | Already the simple model |
| Voronoi territories | Animal ranges, tree crowns | Low | Maybe for territory |
| Lenia | Microbes | High, and unpredictable | No (an easter egg at most) |

### Game mechanics that fit the theme

| Mechanic | Example games | In Clade | Note |
| --- | --- | --- | --- |
| Territory capture / influence | Go, Qix, Splix.io | Spread vs. the incumbent in a niche | Fits "pressure is good" |
| Tile placement | Carcassonne, Dorfromantik | Place offspring tiles that match the terrain | Proven cozy, puzzle-ish |
| A line that grows | Snake, Tron | Fungal threads, runners | Simple, tactile |
| Connect the flow | Pipe Mania, Mini Metro | Water through roots, sugar through fungal links | Good for relationships |
| Hidden info | Minesweeper | Nutrient pockets under the soil; roots reveal them | Cheap tension |
| Light tower defence | Kingdom Rush | Grazers and pests come along paths; thorns and toxins defend | Risk: action-heavy |
| Timing bar | Stardew fishing, OSRS | Release spores on a gust of wind | Tactile but repetitive |
| Herding | Lemmings, sheepdog games | Steer a herd (boids) to forage | Animal kingdom |
| Draft / deckbuild | Slay the Spire | Gene offers as a draft | Already the gene pool (toy 3) |
| Auto-battler | Super Auto Pets, TFT | Your build vs. the incumbent decides who gets a niche | Tierzoo audience; "establish" step |
| Merge | Merge Dragons | Merge seedlings | Cheap and popular, weak fit |
| Idle skilling | OSRS, Melvor | Colony as a skill that repeats an action | The idle backbone either way |

Games worth a look (from memory; verify): Viridi, Equilinox, Terra Nil, Reus, SimLife, SimEarth, Spore (cell stage),
The Sapling, The Powder Toy / Sandspiel, Dorfromantik, Islanders, Mini Metro.

## Shortlist (AI view)

1. **Patch + spatial verbs** (toy 1) as the plant kingdom's base, growing into the layered grid above.
2. **Genes as rule changes** (toy 3) as the Bet verb for every kingdom. It likely combines with 1: 1 gives hands-on
   play, 3 gives build choices.
3. **Specimen growth** (toy 2, VirtualPlantLab ideas) as the type specimen's look, and maybe a one-off moment at each
   key innovation. Not the main loop.
4. Later: forest-fire disturbance for succession, Physarum for fungi, boids for animals, an auto-battler for
   establishing against incumbents.

## Toy backlog (not built)

- **Network:** Physarum threads link plant tiles; trade sugar for nutrients.
- **Herd:** boids graze a patch. Cohesion vs. overgrazing; predators.
- **Lava and fire:** forest-fire disturbance resets patches; succession refills them.
- **Contest:** your patch vs. an incumbent's, Go-like influence.
- **Tiles:** Dorfromantik-style placement of offspring tiles.

## VirtualPlantLab / PlantGraphs.jl

Summary in [research/virtual-plant-lab.md](research/virtual-plant-lab.md):
- It's Julia research software for modelling plant growth. You can't run it in the browser: Julia → WASM is
  experimental, and a server breaks itch.io and offline play.
- **Worth borrowing:** a plant as a graph of organs; rules that collect all changes, then apply them; a turtle that
  turns the graph into a drawing; sugar flowing from sources (leaves) to sinks (growing tips); simple per-leaf light
  instead of ray tracing.
- Toy 2 already uses the collect-then-apply style. Rough estimate for a moss-grade grow-and-draw loop: 3–6 days.
