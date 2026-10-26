# Clade — Brief

What's **decided**. Only the user moves things into this file. AI proposals live in [systems.md](systems.md);
the critical review lives in [review-2026-10-25.md](review-2026-10-25.md).

## The idea (your words, condensed)

- You advance a species: pick a build, class or species, specialise it, go into a role, and improve it along the way.
- It appears on the map. When you evolve and move on, it stays, and the ecosystem expands.
- Long term: an interesting, rewarding ecosystem, a little like a garden you tend.
- The feeling of **growing an ecosystem** and **growing your species** is the most important thing.

## Decided

### Principles
- **Simple core, strong progression** *(25 Oct)*. The core mechanics can be simple and repetitive if the progression and the sense of choosing what to do are very strong.
- **Hand-curated progression; take shortcuts to proven concepts** *(25 Oct)*. Learn from IdleOn, Idle Obelisk Miner, Melvor Idle and OSRS.
- **Core first** *(25 Oct)*. Start from something basic, only the core, before fleshing things out.

### Loop and structure
- The core loop is found → adapt → release → establish → the ecosystem grows. Establishing can be strategic or boostable.
- **A few species in parallel** *(25 Oct)*. Each has its own minigame you keep working on. **Releasing a species is the prestige of its minigame.** Slots unlock slowly *(25 Oct)*.
- **Founder colony** *(25 Oct)*. You found a species at a home spot, which shapes its minigame. At release it disperses from home; dispersal traits and spending decide how far (systems S4, option C).
- Released species stay on the map and grow the ecosystem.
- **Speciation loosely follows the real tree of life** *(25 Oct)*. You progress when you reach a point that exists on the real tree, with a lot of freedom.
- Everything you introduce (plants, animals, ...) uses the same founding and introducing core. Flavours differ.
- **Runs start at an ancestor node** *(25 Oct)*. From there a lineage goes a few steps before it reaches trees, roughly.
  "Tree" is a growth form, not a clade, so the end of that line is a real node, such as seed plants.
- **The species is the core unit** *(25 Oct)*. Its gene pool shows how the population evolves, and it's **the one shared adaptation core for all kingdoms**.
- **One activity minigame per kingdom**; guilds change its rules *(25 Oct; replaces "adapting mechanics differ")*.

### Pushback and choice
- Things push back. Progression is clear, and decisions matter.
- You can put resources into different areas and have to choose, but you never get locked out.
- Releasing is strategic. Species are hard to wipe out until there's a good amount of biodiversity.
- Niches: filling one gives easy gains; optimising it well gives further improvements.
- **Pressure is good** *(25 Oct)*. Once a niche is filled, newcomers compete with the species already there.

### World and garden
- **A young volcanic island** *(25 Oct)*. Progression follows ecological succession (systems S1).
- **The garden runs on a simple, stable model**, not a full ecosystem sim *(25 Oct)*. A richer sim later stays possible.
- **Relationships between species are a core value** *(25 Oct)*: symbiosis, predation, grazing, pollination. They get a place in the core, not only later.
- **Small interactions in the garden matter** *(25 Oct)*. The form is open (systems S15).

### Groups
- **The guild (role) is the main design unit** *(25 Oct)*. Examples: herbivore, carnivore, grass, shrub, tree, flower.
- **Guilds can have members from different kingdoms.** Kingdoms are flavour, plus systems that reinforce themselves *(25 Oct)*.

### Resources
- **Biomass** pays for the major steps. **Horizontal resources** from the guilds are needed to complete things and unlock niches *(25 Oct, agreed)*.
- Abstract multipliers are fine. Feeling right beats everything being readable.

### Pacing and skills
- **Hybrid idle.** Minigames start to take long, so you idle. Early systems need attention first and go idle as you move on.
- **Skills:** one or two main kingdom skills at the start; more unlock through the right builds or niches; some skills depend on class. Scope still open.

### First session *(25 Oct; the draft is [first-30-min.md](first-30-min.md))*
- **The first release comes at about 12 minutes.**
- **The home is fixed in the first run**, to teach the mechanics step by step. You choose from run 2 on.
- **Wild seabirds arrive at the start of session 2**, as the welcome-back surprise.
- **The first home is a steam vent in the lava field**: damp near the vent, dry further out. Surtsey's first mosses grew at steam vents.
- **Mosses is reached through the leafy shoot.** Its precursors are rhizoids, surviving drying out, and a stalked spore
  capsule. The peristome comes later, for True mosses. Facts: [research/moss-facts.md](research/moss-facts.md).
- **Keep every beat of the draft**, including the cheap cut candidates (naming, slot teaser, incumbent line, standing
  rules, beach fit). **Session 1 ends on a cliffhanger:** run 2 is one generation short of Vascular plants.
- **Acts 1–4 of the draft are slice 01** ([slices/01-found-to-release.md](slices/01-found-to-release.md)).

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

## Later (wanted, after the core)

You want these in the game at some point, but not before the core works *(25 Oct)*. Details are in
[research/progression-games.md](research/progression-games.md).
- OSRS-style quest gates for key innovations, with a visible list of requirements
- IdleOn-style interacting bonuses between slots (e.g. the best species per guild boosts all)
- Fit tiers as Melvor-style checkpoints
- The other research proposals: a diary-style map of next steps, bundles as regional goals, relationships that feed each other, small named levels

## Open questions

| #   | Question                                                                  | Where it's discussed        |
| --- | ------------------------------------------------------------------------- | --------------------------- |
| 5   | First run: always a pioneer plant, or your choice?                        | [systems.md](systems.md) S3 |
| 6   | Does the garden ever reset (eras)?                                        | [systems.md](systems.md) S9 |
| 7   | 2D or low-poly 3D look? (Decide after the art spikes.)                    | [tech-art.md](tech-art.md)  |
| 8   | How many parallel slots, and when do they unlock?                         | [systems.md](systems.md) S3 |
| 9   | itch.io first means desktop browsers. Keep touch-first portrait, or a layout that fits both? | [tech-art.md](tech-art.md)  |
| 10  | Which relationships go in the core, and which come later?                 | [systems.md](systems.md) S24 |

Answered 25 Oct: 1 web · 2 itch.io first, stores later · 3 founder colony · 4 volcanic island · relationships get a place in the core · the first session: ancestor start, first release at ~12 min, fixed first home, seabirds in session 2.
