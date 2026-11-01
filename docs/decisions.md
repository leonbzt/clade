# Decisions log

Your calls, dated, oldest first. **Append only:** new calls go at the bottom at `/handoff`, in your words where
possible. [vision.md](vision.md) is the current picture built from this log; when they disagree, the later entry
here wins and vision.md gets fixed.

- 25 Oct (the fresh start): the founding decisions are in [vision.md](vision.md) (principles, loop, world,
  audience, production).
- 26–31 Oct: moved word for word from the old brief.md (its "Direction" sections).
- Calls you made on proposals P19, P21, P24, P31 and P32 are copied here too. The proposals themselves are archived
  (`_archive/2026-11-01/systems.md`, reads blocked; ask to bring one back). Letters like "a yes" refer to the
  options in those proposals.

## 26 Oct
- **The core loop first: several species in the garden.** Place species, watch them spread and compete, evolve the next one, and place it while the old ones stay. Minigames for adapting well come later.
- **Build on the fresh-eyes review** ([review-fresh-eyes.md](design/fresh-eyes.md)) as far as it fits: placement is the decision and growth is the reward, milestones, and a sim/view split.
- **2D, for now** (Q7). **Art matters**: the garden has to look good and read clearly from the start.
- **Traits are visible** on the species, even when it's drawn small.
- **Map and menus first; other layers later** *(26 Oct, after playing slice 03)*. The map should get simpler and less cluttered.
- **Lichens are an unlock, not the starting state** *(26 Oct)*.
- **Pacing: fast unlocks at the start** to learn and get going, **then a midgame** where the real game starts: more kingdoms, interactions, trickier placement *(26 Oct)*.
- **Adapting has to feel like adapting** *(26 Oct)*. Buying every trait isn't it yet; it can come later.
- **Idea:** a second line in the sea: sponges, jellies, then arthropods and later vertebrates, which come onto land as the way animals arrive. Small biomes or microbiomes that develop *(26 Oct, idea)*.

## 27 Oct, after playing slice 04
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

## 27 Oct, after playing slice 05
- **Calm the sim:** tiles and stocks such as litter change gradually. Nitrogen mustn't be high everywhere;
  plants using more of it is the first approach.
- **A larger island at a higher resolution.**
- **Landmarks, starting with vents, springs, beaches and caves.** No seabird cliff for now. Salt becomes a status
  of the beach, not a layer.
- **Fewer visible layers, more hidden depth.**
- **Calm means slow, big stores** *(27 Oct)*: fewer rapid changes; stores such as nitrogen build up over time, so
  plants switch on and off slowly.
- **Slice 06 works** *(27 Oct, after building it)*. Next: a new overall planning thread.

## 27 Oct, species talk after slice 06
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

## 27 Oct, after playing slice 07
- **Variants are a direction you like a lot**: watching them, the gene pips (like a chromosome arm), the calmer map
  with zoom stages, and the soil → mossy tiles → leafy shoot progression. Balancing comes a little later.
- **Two screens:** a tree-of-life screen for the overview and milestones, and an info panel to play with. Variants
  on the map should be clearly visible while playing. Species list with population bars (P16: b inside a).
- **Founding has to help noticeably; extremes stay rare.** No fixed re-centre: rarity scales up cumulatively the
  further a form is from its clade's base.
- **Precursor genes lead to the next clade** (P16 d + e), and new clades and species stem from a variant you grew.
- **Time axis as a spindle diagram.**
- **Later: a few active founded species as your "builds"** (slots); release old ones to take a new one.

## 27–28 Oct, after playing slice 08
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


## 28 Oct, on P19 (the clade map for acts 1–3; how animals come in)
- **Modern forms for the first version.** The full deep-time road (playing the whole chains) is wanted later.
- **Arrivals: yes**, as a second way in, with habitat requirements, for now.
- **Partnership doors: yes.**
- **The map is good, with more plants (a tree).** Fungi by role: saprotrophs, lichen-forming, mycorrhiza.
- **Animals to focus on:** snails, springtails, spiders, later beetles, bees, maybe seabirds and lizards.
- **Earthworms: probably clutter.** Leave them out for now.
- **The first food web, the sim section and the first animal slice: good.** Spec: [slices/10-first-animals.md](slices/10-first-animals.md).

## 28 Oct, on P21 (groups, settled populations, balance and contrast)
- a yes.
- **b yes, and more:** the **update rate is a species trait, like metabolism** (fast animals update often, slow
  ones rarely; a gene can change it later). **Condense established groups and patches into slower "old growth"**;
  look into reducing by state, so unused or established systems progress or are calculated slower. Batching too.
- **c yes, rigorous for the structure.** **Animals releasing nitrogen is important: keep it**, just balanced
  (they release what's in their food, sooner and in hotspots).
- **d: all ideas sound good** (plants that improve their own tile, sharp edges like territories, establishing,
  height, wind, disturbance, regions) and match the flows idea (P13), but **start simple** to keep complexity down.
- **e: species as a build you level up, a family you follow as the hero, maybe build slots.** More significant
  placements, and importantly an activity or minigame, or a part in selection. Reward and progress that are easy
  to measure.
- **Founding gets very expensive and seems to scale across the board.** Cause: a split costs 1500 × 2.5ⁿ with n
  counting every species made on the island, plants and animals; re-founding is 40 × 3ⁿ per species.

## 28–29 Oct, on P24 (the game's shape: lineages, island runs and a slot board)
The plan built on these answers: [design/game-shape.md](design/game-shape.md).
- From five roles and three mixes: **mix 2, built cheaply, with curated slots the sim makes** ("really close to
  my fantasy and still sounds doable"). Hold its principles; don't overengineer.
- The species as a build is the core. Terra Nil is a main reference. Breeding yes, but scarce (a limited
  resource). Shaping the land as a feeling. The naturalist is a role the game fits (readable animals, distinct
  species), not the core.
- Lineages and island runs: yes. The slot board early: yes. The sim should make the slots and decide the holders.
- From the lineage draft you liked growing one thing the whole time, broods, keys, generations, measurable
  progress, kingdom stats and RPG identity. Missing: a big discovery moment, a purpose for growing better, and
  lineages boosting each other.
- Runs: a separate young island; one session up to a few days of idling; random or small authored islands to
  start; finished islands give the new species and maybe produce by their resources; going back isn't important.
  The whole adapted line comes home; lineages level up from runs. Helpers: yes.
- Slots: a team or loadout position that is also what the ecosystem needs; mostly build fit, somewhat balanced.
  Gains: higher tiers, the island growing, bigger numbers, unlocks.
- Time: banked away time for fast-forward; chunks computed when you go in (an idea); a larger home island.
- World: seasons, slow succession and sudden events, some foreseen. Timers: the payoff of a method you chose
  (catching blooms, collecting food, timing a release to a wet window).
- Discovery: rare genes and combinations people could talk about online; show little at first over deep
  mechanics; a place to rework stats, genes and combinations.
- Stakes: species die out and the game goes on; a line can end, but you can restart or carry on. Wild holders:
  maybe win them over; not sure yet. A long target: yes.
- *(29 Oct, after the written plan)* **Keep genes appearing and spreading by themselves**; you really like it.
  The other notes and the long target are good. A home board that grows into a big table is fine long term, but
  it must live on the map as well. Split slice 12. Slice 11 as proposed. The game starts at home. Helpers are full
  species, sometimes other boosts too. Locals: not sure. The wind side first (in slice 11).

## 29 Oct, after slice 11 part A: the wind side and regions
- **Slots come from food links and habitats the sim detects** (P25). Regions exist so you look for a good slot
  somewhere and fill it, so **sim-made places that depend on what's there** sit beside the fixed ones ("windy cliff,
  fern forest, mossy river"). Some difficulties are acceptable for this. **Guilds** (habitat × food) unlock later.
- **Groups are named base species:** snails aren't slugs, but a slug species you found is still a slug.
- **3 slots per region and habitat, with an island-wide best of.**
- **Regional contrast from the wind is good;** lichens should lead only on the barest ground. Region names show
  only in the Regions view (or on zoom).
- **Idea:** hiding in shade and caves (prey harder to catch) fits the feeling of discovering things and animals.

## 30 Oct, after slice 11 part B
- **Habitats on the map are the slots to fill,** filled by fitting species **like an RPG equipment loadout**: a
  **six-slot loadout** per habitat (not too cluttered), and the board shows a **picture of the holder** (maybe of the
  habitat too). Habitats are highlighted on the map. Fewer iconic slots sit alongside the full system.
- **Regions weren't needed;** keep them for now. Later they should grow organically (maybe from geology).
- **Open slots are good:** many more species will come to fill them.
- **Important news must stand out** (headlines); the rest of the feed is fine.
- **Real biomass in the sim (P26 d2), as soon as possible:** weights per animal or group, metabolism and growth
  potential, in numbers that add up, shown g → kg → t. A niche is big when much lives there, and regrowth counts.
  The slot bar should be clear and absolute, yet still allow comparing.

## 31 Oct, after playing slice 11 part C
- **Part C feels as imagined:** the slots look great, and the habitat detection is loved (scattered, but that makes
  sense).
- **Show all the small, interesting habitats on the map,** and border areas between them could be really interesting.
  **Name and give slots to fewer of them** (maybe only the big parts), while still displaying all the small ones.
- **Regions and habitats feel doubled up** now, a little confusing.

## 31 Oct, P28 and the 11d spec
- **Regions go** (P28 c3): a habitat is a connected piece of one kind; twins get a compass word.
- **Small patches are hover only** (kind and top holders); their slots still count for the island's best. The name
  and card go on the big piece. Borders (ecotones) are parked.
- **Tiles are 10 m** (100 m²). **The currency stays Biomass**, in real grams. **"Best" means the biggest share**,
  with efficiency shown beside it.
- **Hectares and productivity per area** ride with slice 11d.

## 31 Oct, after playing 11d parts A and B
- **Split growth from turnover** (`grow` fills, `renew` sheds). The slot's **biggest taker holds almost whatever**
  it takes. Slugs may keep only a small niche.
- **Swings are wanted:** some high-appetite grazers, plants that can be grazed to death, some dying out.
- **Balance shifts and can be part of the game.** Animals gain new diets through genes; a fuller tree of life is
  coming, so balance the structure now and fine-tune later.
- **Geology, leaning yes**, wider than flow age (height, wind, slope, sun, soil); cheap but feelable.
- **Soil:** a few layers at most, not many. Habitat thresholds a little lower.

## 1 Nov, on P31 (the food-web expansion plan, [design/food-web.md](design/food-web.md)) and P32 (nitrogen by the gram)
- **Climate:** a subtropical home island; run islands vary (P31 Q1).
- **Trees get a canopy stratum** (Q5). **Outside inputs: yes** (Q6).
- **Wild splits:** see 12b first, and think about how species are made (→ P33 c) (Q7).
- **Founding costs:** f1 (founders' grams), but **no split-and-place by the player**; founding could come with
  runs (Q8).
- Still open from P31: Q2 (are bigger islands feasible?), Q3 (bats yes, more cute animals, animals coming ashore),
  Q4 (hunting by size), Q9 (order).
- **Nitrogen follows the grams** (P32 a1), with the code open to more nutrients. **Rot chain:** litter decay from
  the clock (b1) and fungus as a decay boost (b2), now. The rough real values (c) as a starting point.
- **Time:** three tempos (life, cycle, ground) with the rule that grams and nitrogen only move on cycle, to be
  checked critically (→ P33 a). **A year ≈ 8 min.** Leak could be a mechanic (→ P33 b).
