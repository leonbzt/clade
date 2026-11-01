# Clade — Vision

**What you've decided, as it stands now.** Yours: only your explicit calls go in here, and every change is also
logged with its date in [decisions.md](decisions.md). Open AI ideas are in [proposals.md](proposals.md) and
[ideas.md](ideas.md); what we build next is in [ROADMAP.md](../ROADMAP.md).

> **1 Nov, AI condensation for you to check.** Rebuilt from the old brief.md (25–31 Oct) and your calls on
> P19–P32. Nothing was added. Lines that later calls replaced were dropped (e.g. regions, 3 slots per region, the
> "simple, stable model"); their history stays in decisions.md. Fix anything I got wrong, then delete this note.

## The idea (your words, condensed)
- You advance a species: pick a build, class or species, specialise it, go into a role, and improve it along the way.
- It appears on the map. When you evolve and move on, it stays, and the ecosystem expands.
- Long term: an interesting, rewarding ecosystem, a little like a garden you tend.
- The feeling of **growing an ecosystem** and **growing your species** is the most important thing.

## The game's shape *(29 Oct)*
- **Home is the garden.** The sim finds the island's habitats; each one is a set of slots that species fill. **The
  sim decides the holders**; you win slots by bringing the right species.
- **Lineages are your characters:** a class (the clade), stats, abilities, a level from runs. You grow one thing the
  whole time. One lineage at the start, three or four at most.
- **Runs happen on young islands:** land a lineage with one or two helpers (full species, sometimes other boosts),
  play its generations, and bring the whole adapted line home, where it has to take a slot.
- **The game starts at home** (the pioneer at the vent); the first run comes after about 10 minutes.
- Breeding yes, but scarce. Shaping the land is a feeling. Terra Nil is a main reference. The naturalist is a role
  the game fits (readable animals, distinct species), not the core.
- **A long target:** the island's climax closes an era.
- Stakes: species die out and the game goes on; a line can end, and you can restart or carry on.
- The AI plan built on these answers: [design/game-shape.md](design/game-shape.md).

## Principles
- **Simple core, strong progression.** The core can be simple and repetitive if progression and choosing what to
  do are very strong.
- **Hand-curated progression; shortcuts to proven concepts** (IdleOn, Idle Obelisk Miner, Melvor Idle, OSRS).
- **Core first; every system starts as its smallest version.** Don't overengineer.
- **The sim decides; the game names it.** Slots, holders and gains come from the sim, not from authoring.
- **Genes appear and spread by themselves**, and that stays at the heart. Choices sit on top of it.
- **Things push back.** Progression is clear and decisions matter. You choose where to put resources but are never
  locked out. Pressure is good: newcomers compete with the species already in a niche.
- **Balance the structure now, the numbers later.** Balance shifting is part of the game. Chains (cascades) are
  features: tune them, don't cut them.
- Balance by feel, plus a tiny curve model and a dev panel with time skip. No balance bot.
- Abstract multipliers are fine. Feeling right beats everything being readable.

## Pacing
- **Fast unlocks at the start** to learn and get going, **then a midgame** where the real game starts (more
  kingdoms, interactions, trickier placement).
- **Hybrid idle:** early systems need attention, then go idle as you move on.
- **Adapting has to feel like adapting.** Buying every trait isn't it.

## The island and the sim
- **A young volcanic island**; progression follows ecological succession. The home island is subtropical; run
  islands vary.
- **A layered sim with feedback:** readable, local rules. **Fewer visible layers, more hidden depth.**
- **You can't influence everything.** The sim has a life of its own; it isn't static, it needs balancing.
- **Calm means slow, big stores:** stocks like nitrogen and litter change gradually.
- **Built to grow:** it can become a big network, so building and testing it has to stay quick.
- **Contrast between areas matters** (the wind side). **Landmarks:** vents, springs, beaches, caves. Salt is a status
  of the beach, not a layer.
- **Places are habitats:** connected pieces of one kind that the sim detects. The big piece gets the name and the
  card; small patches show on the map with the kind and top holders on hover, and their slots still count for the
  island's best. Twins get a compass word. **No regions.** Borders between habitats are parked.
- **Real biomass:** grams are the sim's stock (shown g → kg → t). Tiles are 10 m. Growth fills, turnover renews
  (`grow` and `renew` are split). Hectares and productivity per area.
- **Nitrogen follows the grams** (1 Nov), with the code open to more nutrients. Litter decays by the clock; fungus
  speeds decay.
- **Time:** a year ≈ 8 min. Three tempos (life, cycle, ground); grams and nitrogen move only on cycle. The clock
  waits until after slice 12 or later (1 Nov); until then a year is a display conversion.
- **Swings are wanted:** high-appetite grazers (snails first, 1 Nov), plants that can be grazed to death, some
  species dying out.

## Species and evolution
- **The species is the core unit** and the one adaptation core for all kingdoms. Everything you introduce uses the
  same core; flavours differ.
- **Species carry variants with differing genes.** Mutations happen by themselves and can be an unexpected reward.
- **Rarity uses game-like tiers** and scales up cumulatively the further a form is from its clade's base. Founding
  has to help noticeably; extremes stay rare.
- **Species split off from variants** (their tiles move; no twin populations). **Clades are authored** (templates and
  recipes); **species are free.** Genes carry, the bar resets; the cap counts from the clade.
- **Keys are authored recipes:** a variant with the whole recipe is a candidate and can roll the key. Three gene
  layers: axis steps → combos → keys. A key innovation is a new clade.
- **Gene display:** two directions (e.g. Dry / Wet), cumulative cells, cap ±3 to ±5. Rarity shows distance and fit;
  show why a variant is winning.
- **Speciation loosely follows the real tree of life**, with a lot of freedom. Start: a basal ancestor (an early land
  plant) that branches into liverworts and mosses. Modern forms first; the full deep-time road later.
- **Lichens are an unlock**, not the starting state.
- **How new species are made:** no split-and-place by the player; founding could come with runs; wild splits wait
  until 12b (1 Nov). Founders cost grams. Maybe better after the core loop (1 Nov): adaptations you discover from
  random gene changes; species as one connected tree, rising from each other; a home start leaning toward algae,
  cyano and early land plants, if we take the full-evolution route.
- **Groups are named base species:** snails aren't slugs, but a slug species you found is still a slug.
- Later: animals gain new diets through genes.

## Animals
- **Individuals and visible interactions are core:** you see why things happen. Animals are groups (high real
  numbers, few shown); big, rare animals are close to 1:1. Their effects go through stocks (dung, litter, grazing).
- **Animals are small:** cute individuals roaming the garden, so there's something to discover.
- Arrivals are a second way in, with habitat requirements, for now. Partnership doors: yes.
- Focus: snails, springtails, spiders; later beetles, bees, maybe seabirds and lizards. Bats yes; more cute
  animals. Earthworms out for now.
- Animals releasing nitrogen is important (what's in their food, sooner and in hotspots).
- Outside inputs onto the island: yes.

## The board and the screen
- **Habitats on the map are the slots**, filled by fitting species **like an RPG equipment loadout**: six slots per
  habitat, a picture of the holder. Fewer iconic slots sit alongside the full system. **Open slots are good.**
- The board **must live on the map**; long term it may grow into a big table.
- **"Best" means the biggest share**, with efficiency beside it. The slot bar is clear and absolute and still allows
  comparing. **The currency stays Biomass**, in real grams.
- **Important news stands out** (headlines); the rest of the feed is fine.
- **Two screens:** a tree of life (overview, milestones, a spindle time axis) and an info panel to play with. The
  species list has population bars.
- **Readable placement is really important.** The map colours by species, with few variants and sprites shown.
  Traits are visible on the species, even drawn small.
- **2D for now. Art matters:** the garden has to look good and read clearly from the start, without a lot of manual
  art work from you.

## Audience and production
- **Idle/RPG players who like nature** (think Tierzoo). Learn from Stardew Valley and other games that worked.
- **Web stack; itch.io first**, app stores later.
- Fresh start (25 Oct): the old prototype in `_old/` is reference only, and its 3D close-up isn't carried over.

## Wanted later (after the core)
- OSRS-style quest gates for key innovations; IdleOn-style bonuses between slots; Melvor-style checkpoints; a
  diary-style map of next steps; bundles as goals; small named levels ([research/progression-games.md](research/progression-games.md)).
- Two zoom levels and chunks (an overview and a detailed, animated close view). More landmarks (waterfalls,
  rivers).
- Fixed flows of water, soil and nutrients across the map.
- A canopy stratum for trees. Guilds (habitat × food) unlock later.
- Geology, leaning yes: wider than flow age (height, wind, slope, sun, soil), cheap but feelable. Soil: a few layers
  at most.
- Hiding in shade and caves (prey harder to catch).
- A second line in the sea (sponges, jellies, arthropods, vertebrates coming onto land); the deep-time road.

## On hold (bets from 25–26 Oct, before the game's shape)
Decided then and not withdrawn, but made before lineages and runs. **Check which still hold.**
- Minigames and the first session wait until the garden core is fun (26 Oct). The adapting minigame: start from the
  roll idea, but it should feel like an interaction (still open).
- A few species in parallel, each with its own minigame; releasing is its prestige; slots unlock slowly. A founder
  colony at a home spot. One activity minigame per kingdom; guilds change its rules. Skills per kingdom.
- First session: the first release at about 12 min (now the first run's return); a fixed first home at a steam vent
  in the lava field; wild seabirds at the start of session 2; mosses reached through the leafy shoot; session 1 ends
  on a cliffhanger. Facts: [research/moss-facts.md](research/moss-facts.md).
- The guild (role) as the main design unit, with members from different kingdoms. Biomass pays for the major steps;
  horizontal resources from guilds complete things. Relationships (symbiosis, predation, grazing, pollination) get a
  place in the core. A gene pool overview fits in somehow.

## Open questions

| #   | Question                                                                  | Notes                         |
| --- | ------------------------------------------------------------------------- | ----------------------------- |
| 5   | First run: always a pioneer plant, or your choice?                        |                               |
| 6   | Does the garden ever reset (eras)?                                        | The game shape proposes eras  |
| 8   | How many parallel slots, and when do they unlock?                         | Lineages: 1 → 3–4 (29 Oct)    |
| 9   | itch.io means desktop browsers. Touch-first portrait, or a layout for both? | [design/tech-art.md](design/tech-art.md) |
| 10  | Which relationships go in the core, and which come later?                 |                               |

Answered: 1 web · 2 itch.io first · 3 founder colony · 4 volcanic island · 7 2D for now. Q11 (the colony's
hands-on play) went on hold with the minigames.
