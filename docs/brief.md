# Clade — Brief

What's **decided**. Only the user moves things into this file. AI proposals live in [systems.md](systems.md).

> **26 Oct, AI draft for you to check:** the decisions are split into **Pillars** (stable) and **Current bets**
> (decided, but drop them freely while we look for the best base). No decision was added or removed; only the
> grouping is new. Move items between the two as you see fit, then delete this note.

## The idea (your words, condensed)

- You advance a species: pick a build, class or species, specialise it, go into a role, and improve it along the way.
- It appears on the map. When you evolve and move on, it stays, and the ecosystem expands.
- Long term: an interesting, rewarding ecosystem, a little like a garden you tend.
- The feeling of **growing an ecosystem** and **growing your species** is the most important thing.

## Pillars

### Direction *(26 Oct)*
- **The core loop first: several species in the garden.** Place species, watch them spread and compete, evolve the next one, and place it while the old ones stay. Minigames for adapting well come later.
- **Build on the fresh-eyes review** ([review-fresh-eyes.md](review-fresh-eyes.md)) as far as it fits: placement is the decision and growth is the reward, milestones, and a sim/view split.
- **2D, for now** (Q7). **Art matters**: the garden has to look good and read clearly from the start.
- **Traits are visible** on the species, even when it's drawn small.
- **Map and menus first; other layers later** *(26 Oct, after playing slice 03)*. The map should get simpler and less cluttered.
- **Lichens are an unlock, not the starting state** *(26 Oct)*.
- **Pacing: fast unlocks at the start** to learn and get going, **then a midgame** where the real game starts: more kingdoms, interactions, trickier placement *(26 Oct)*.
- **Adapting has to feel like adapting** *(26 Oct)*. Buying every trait isn't it yet; it can come later.
- **Idea:** a second line in the sea: sponges, jellies, then arthropods and later vertebrates, which come onto land as the way animals arrive. Small biomes or microbiomes that develop *(26 Oct, idea)*.

### Direction *(27 Oct, after playing slice 04)*
- **A layered sim with feedback**: readable, local rules, and **every layer visible**. First layers: nitrogen,
  shade, humidity, soil. This replaces "simple, stable model" below.
- **You can't influence everything.** The sim has a life of its own. It mustn't be static; it's an ecosystem
  that needs balancing.
- **Niches you can see.** Species need and make things. **Fungi become a real species**, not only a gate.
- **Readable placement is really important.** Biomes become **named regions** on the map.
- **Order:** the layered sim first, then the first biomes.
- **Built to grow.** It can become a very complex network (many species, layers and interactions), so the way we
  build and test it has to stay manageable and quick to experiment with.
- **Idea, the adapting minigame:** start from the roll idea, but it should feel like an interaction. Options to just
  level up, random combinations, realistic trade-offs, and some picks that are mostly gain. "Characterised"
  species or individuals you combine; you see the traits change; clearly visible meanings. Still open.

### Direction *(27 Oct, after playing slice 05)*
- **Calm the sim:** tiles and stocks such as litter change gradually. Nitrogen mustn't be high everywhere;
  plants using more of it is the first approach.
- **A larger island at a higher resolution.**
- **Landmarks, starting with vents, springs, beaches and caves.** No seabird cliff for now. Salt becomes a status
  of the beach, not a layer.
- **Fewer visible layers, more hidden depth.**
- **Calm means slow, big stores** *(27 Oct)*: fewer rapid changes; stores such as nitrogen build up over time, so
  plants switch on and off slowly.
- **Slice 06 works** *(27 Oct, after building it)*. Next: a new overall planning thread.

### Direction *(27 Oct, species talk after slice 06)*
- **Species carry variants with differing genes.** Mutations happen by themselves and can be an unexpected reward.
  You see them, pick one as a founder for another part of the map, or push a direction. Rare combinations can fit
  outside the usual range or open new niches. It has to work with the traits.
- **Early on you pick the founding variant to make a new species** (maybe naming it). Later: breeding or combining
  interesting variants.
- **Rarity uses game-like tiers.** A big enough difference (a few good combinations) is enough for a new species;
  a **key innovation is a new clade**.
- **Wild species may split off** when left alone and very survivable, but it should be acknowledged or give you a chance.
- **The species rework comes next** (slice 07), before animals. You want animals later.
- **Fixed flows of water, soil and nutrients across the map: yes, wanted.** Chunks: good for an overview long term;
  whether the whole sim always runs is still open. The clutter fix (fewer plant sprites) is agreed.

### Direction *(27 Oct, after playing slice 07)*
- **Variants are a direction you like a lot**: watching them, the gene pips (like a chromosome arm), the calmer map
  with zoom stages, and the soil → mossy tiles → leafy shoot progression. Balancing comes a little later.
- **Two screens:** a tree-of-life screen for the overview and milestones, and an info panel to play with. Variants
  on the map should be clearly visible while playing. Species list with population bars (P16: b inside a).
- **Founding has to help noticeably; extremes stay rare.** No fixed re-centre: rarity scales up cumulatively the
  further a form is from its clade's base.
- **Precursor genes lead to the next clade** (P16 d + e), and new clades and species stem from a variant you grew.
- **Time axis as a spindle diagram.**
- **Later: a few active founded species as your "builds"** (slots); release old ones to take a new one.

### Direction *(27–28 Oct, after playing slice 08)*
- **Species split off from variants.** Founding a variant moves its tiles into the new species (no twin
  populations), plus a founder patch you place.
- **A new clade grows out of your variant**, keeping its genes and identity. **Clades are authored** (templates and
  recipes); **species are free**. The authored species become templates.
- **Genes carry, the bar resets** at a split; the cap counts from the clade, so genes don't pile up.
- **Keys as authored recipes:** a variant with the whole recipe is a candidate and can roll the key. Three gene
  layers: axis steps → combos → keys (a recipe plus a roll opens a clade).
- **Gene display:** two directions (e.g. Dry / Wet), not good vs bad; cumulative cells, cap ±3 to ±5; no
  independent bars. Rarity shows both distance and fit; show why a variant is winning.
- **A basal ancestor:** start as an early land plant that branches into liverworts and mosses. Liverworts first is
  not required (replaces that part of the first-session bet).
- Map: colour by species, fewer shown variants and sprites. The spindle curves are nice to have.
- Order: slice 09 = flow, slice 10 = readability. The big-picture outline (`outline.md`) stays a rough outline.
- *(28 Oct, after slice 09)* The split system works and is close to intended. **Animals should come soon.** A placed
  organism needs character, not just a group name. **Idea:** many real species, referenced by stat combinations;
  authored but expandable. **Idea:** traits could all have a downside or upkeep.

### Direction *(29 Oct, after slice 11 part A: the wind side and regions)*
- **Slots come from food links and habitats the sim detects** (P25). Regions exist so you look for a good slot
  somewhere and fill it, so **sim-made places that depend on what's there** sit beside the fixed ones ("windy cliff,
  fern forest, mossy river"). Some difficulties are acceptable for this. **Guilds** (habitat × food) unlock later.
- **Groups are named base species:** snails aren't slugs, but a slug species you found is still a slug.
- **3 slots per region and habitat, with an island-wide best of.**
- **Regional contrast from the wind is good;** lichens should lead only on the barest ground. Region names show
  only in the Regions view (or on zoom).
- **Idea:** hiding in shade and caves (prey harder to catch) fits the feeling of discovering things and animals.

### Principles
- **Simple core, strong progression** *(25 Oct)*. The core mechanics can be simple and repetitive if the progression and the sense of choosing what to do are very strong.
- **Hand-curated progression; take shortcuts to proven concepts** *(25 Oct)*. Learn from IdleOn, Idle Obelisk Miner, Melvor Idle and OSRS.
- **Core first** *(25 Oct)*. Start from something basic, only the core, before fleshing things out.

### Loop and species
- The core loop is found → adapt → release → establish → the ecosystem grows. Establishing can be strategic or boostable.
- Released species stay on the map and grow the ecosystem.
- **The species is the core unit** *(25 Oct)*. Its gene pool shows how the population evolves, and it's **the one shared adaptation core for all kingdoms**.
- **Speciation loosely follows the real tree of life** *(25 Oct)*. You progress when you reach a point that exists on the real tree, with a lot of freedom.
- Everything you introduce (plants, animals, ...) uses the same founding and introducing core. Flavours differ.

### Pushback and choice
- Things push back. Progression is clear, and decisions matter.
- You can put resources into different areas and have to choose, but you never get locked out.
- Releasing is strategic. Species are hard to wipe out until there's a good amount of biodiversity.
- Niches: filling one gives easy gains; optimising it well gives further improvements.
- **Pressure is good** *(25 Oct)*. Once a niche is filled, newcomers compete with the species already there.

### World and garden
- **A young volcanic island** *(25 Oct)*. Progression follows ecological succession.
- ~~**The garden runs on a simple, stable model**, not a full ecosystem sim *(25 Oct)*.~~ Replaced 27 Oct by the layered sim (Direction, 27 Oct).
- **Relationships between species are a core value** *(25 Oct)*: symbiosis, predation, grazing, pollination. They get a place in the core, not only later.
- **Small interactions in the garden matter** *(25 Oct)*. The form is open.

### Groups and resources
- **The guild (role) is the main design unit** *(25 Oct)*. Examples: herbivore, carnivore, grass, shrub, tree, flower.
- **Guilds can have members from different kingdoms.** Kingdoms are flavour, plus systems that reinforce themselves *(25 Oct)*.
- **Biomass** pays for the major steps. **Horizontal resources** from the guilds are needed to complete things and unlock niches *(25 Oct, agreed)*.
- Abstract multipliers are fine. Feeling right beats everything being readable.

### Pacing
- **Hybrid idle.** Minigames start to take long, so you idle. Early systems need attention first and go idle as you move on.

### Audience and feel
- **Primary audience: idle/RPG players who like nature**, think Tierzoo *(25 Oct)*. Learn from Stardew Valley and other games that worked.
- **Animals are small**: cute individuals roaming the garden that you can discover, so there's something to look for *(25 Oct, idea)*.
- **A gene pool overview or screen** should fit in somehow. The form is open.

### Production
- **Fresh start** *(25 Oct)*. The old prototype is reference only: it's in `_old/`, and reading it is blocked.
- **Web stack. Release on itch.io first**; app stores are a later target *(25 Oct)*.
- Balance by human feel, not by a bot, **plus a tiny curve model and a dev panel with time skip** *(25 Oct)*.
- The base landscape should be a lot better, without a lot of manual art work from you.
- The old 3D close-up is not carried over.
- Design with the full core in mind. Grazers are the first animals.

## Current bets

Decided, and built into slice 01, but open to change while we look for the best base.
**On hold since 26 Oct:** everything about minigames and the first session waits until the garden core is fun
(the colony minigame "is not it yet"; the review says to lock first-session beats only after the loop works).

### Structure
- **A few species in parallel** *(25 Oct)*. Each has its own minigame you keep working on. **Releasing a species is the prestige of its minigame.** Slots unlock slowly *(25 Oct)*.
- **Founder colony** *(25 Oct)*. You found a species at a home spot, which shapes its minigame. At release it disperses from home; dispersal traits and spending decide how far.
- **Runs start at an ancestor node** *(25 Oct)*. From there a lineage goes a few steps before it reaches trees, roughly.
  "Tree" is a growth form, not a clade, so the end of that line is a real node, such as seed plants.
- **One activity minigame per kingdom**; guilds change its rules *(25 Oct)*. What the minigame is, is open again (slice 02 toys).
- **Skills:** one or two main kingdom skills at the start; more unlock through the right builds or niches; some skills depend on class. Scope still open.

### First session *(25 Oct; the old beat sheet is archived in `_archive/2026-10-26/first-30-min.md`)*
- **The first release comes at about 12 minutes.**
- **The home is fixed in the first run**, to teach the mechanics step by step. You choose from run 2 on.
- **Wild seabirds arrive at the start of session 2**, as the welcome-back surprise.
- **The first home is a steam vent in the lava field**: damp near the vent, dry further out. Surtsey's first mosses grew at steam vents.
- **Mosses is reached through the leafy shoot.** Its precursors are rhizoids, surviving drying out, and a stalked spore
  capsule. The peristome comes later, for True mosses. Facts: [research/moss-facts.md](research/moss-facts.md).
- **Keep every beat of the draft**, including the cheap cut candidates (naming, slot teaser, incumbent line, standing
  rules, beach fit). **Session 1 ends on a cliffhanger:** run 2 is one generation short of Vascular plants.
- **Acts 1–4 of the draft are slice 01** ([slices/01-found-to-release.md](slices/01-found-to-release.md)).

## Later (wanted, after the core)

You want these in the game at some point, but not before the core works *(25 Oct)*. Details are in
[research/progression-games.md](research/progression-games.md).
- OSRS-style quest gates for key innovations, with a visible list of requirements
- IdleOn-style interacting bonuses between slots (e.g. the best species per guild boosts all)
- Fit tiers as Melvor-style checkpoints
- The other research proposals: a diary-style map of next steps, bundles as regional goals, relationships that feed each other, small named levels
- **Idea (27 Oct): two zoom levels.** A rough overview and a detailed, animated view of a tile. Chunks of tiles
  as a higher-level unit: a landscape view from far away; only up close you see the local ground and biomes.
- **Idea (27 Oct): landmarks.** Waterfalls, rivers and the rest. The first set (vents, springs, beaches, caves) moved to Direction (after slice 05).

## Open questions

| #   | Question                                                                  | Notes                                     |
| --- | ------------------------------------------------------------------------- | ----------------------------------------- |
| 5   | First run: always a pioneer plant, or your choice?                        | Old S3 (archived)                         |
| 6   | Does the garden ever reset (eras)?                                        | Old S9 (archived)                         |
| 8   | How many parallel slots, and when do they unlock?                         | Old S3 (archived)                         |
| 9   | itch.io first means desktop browsers. Keep touch-first portrait, or a layout that fits both? | [tech-art.md](tech-art.md) |
| 10  | Which relationships go in the core, and which come later?                 | [minigames.md](minigames.md) (layers)     |
| 11  | What's the colony's hands-on play?                                        | [slices/02-toys.md](slices/02-toys.md)    |

Answered 26 Oct: 7 2D for now.
Answered 25 Oct: 1 web · 2 itch.io first, stores later · 3 founder colony · 4 volcanic island · relationships get a place in the core · the first session: ancestor start, first release at ~12 min, fixed first home, seabirds in session 2.
