# Ideas (parking lot)

Ideas that aren't on the current milestone. **One line each.** Parking an idea isn't rejecting it; nothing here is
built or specced until a milestone needs it, then it becomes a proposal ([proposals.md](proposals.md)).

**2 Nov: every v1 idea reviewed against v2** (v1's parking lot, vision's "wanted later" and "on hold", the game
shape, your 26 Oct mechanics list). The sorting and the verdicts are **AI's**; the drops are yours (confirmed 2 Nov).
v1's file: `_v1/docs/ideas.md`. Marks: **(you)** your idea · **(AI)** AI idea.

## Already in the v2 plan
- Picks with a cost, every trait with a downside (you) · let size set the pace (AI) → Upkeep comes from the body.
- Keys that add features · nothing bought · wild drift species (route C) → parts; species come from runs; garden
  mutants you can take on a run.
- Tile types change over generations: lava → bare ground → forest floor (you) → habitats emerge as soil builds; the
  tier list's ladder.
- Melvor checkpoints, OSRS diaries, Stardew bundles, small named levels, guilds (habitat × food) → the tier list:
  tiers, rows by succession, niches, lineage ranks.
- The adapting minigame "should feel like an interaction" (you) · one activity per kingdom (you) · a tile side view,
  a cut with all its layers (you, 28 Oct) → the side-view run.
- Auto battler "set up and see how good it does" (you) → the release into the garden. Draft (you) → the brood of 3.
- Banked time and fast-forward → offline progress with saves (M1).
- Old growth and update rates (AI) · a bigger island (AI) → moot as performance work: the patch model is cheap.

## Fits v2, later
- **Geology** (ground units, slope, island recipes; you: leaning yes) → the land layer. M1 needs a small part
  (substrate, wetness, height) to make habitats; the rest later.
- More landmarks (waterfalls, rivers); fixed flows of water and nutrients downhill → cheap along the patch graph.
- More run islands (salt, ash, caves), the archipelago map, outposts.
- Sun and cold as pressures (you, 3 Nov), once a niche has them (alpine, open dunes, other islands).
- Two zoom levels: the garden and a close view of one habitat (possibly in side view) (you + AI).
- **Morphs:** rare looks (a colour, a pattern, a left-coiled snail); cheap with bodies drawn from genes.
- **"Resembles…":** a body close to a real species' shape names it, with a fact and a source (you + AI). Strong fit.
- Hindsight names for big groups; partnerships (lichen, mycorrhiza) as a partner that changes the side-view rules
  (your "guilds change the rules").
- Species similarity and a cumulative gene view; the lineage's family tree; the tree of life as a collection.
- The nursery: crossing two lines, kept scarce. Sharing island seeds and genome codes (a code redraws the specimen).
- Animals with staged assembly (Hatched): snails, springtails, spiders, then beetles, bees, bats; cute animals
  (hermit crabs, geckos, fruit bats, rails, doves, nēnē…). Diet through mouthparts.
- Seabirds as engineers: a colony as a nutrient hotspot that brings seeds (an outside input to a patch).
- Hiding in shade and caves (prey harder to catch) as a niche modifier (you: very interesting).
- Trees and fruits, a canopy stratum: the growth program plus a vascular part.
- Eras and the island's climax as prestige. The sea line and life coming ashore (era-sized).
- The species screen: the specimen card, TierZoo-style stat cards, parts as chips, filters (you + AI). A light
  version in M1.
- **Critical:** horizontal currencies from guilds (nitrogen fixed, litter recycled, spores spread) → one or two at
  most, or currencies sprawl.
- **Critical:** evolution points (you) → only for rerolls or an extra shoot. Buying traits breaks "adapting has to
  feel like adapting".
- Skills per kingdom, idle skilling (you) → lineage levels could work like skills.
- Better names; bigger tiles with sprites the same size (you).

- Grow toy: the dead parent's leaves and roots feed the soil (litter) for its heir (AI, 2 Nov).
- Zoom layers beyond M1: a close-up of the soil (bacteria, hyphae, insects; maybe fungi's layer) and a world map
  (continents, climate zones; maybe the archipelago or eras) (friend + you, 2 Nov). Frame: P36.
- Telomeres and DNA stabilization: control over mutation (lock a pip, smaller or bigger steps) (friend, 2 Nov).
- The released species goes wild and you manage it too (friend, 2 Nov); today the garden is idle.
- Adaptive resolution (you, 3 Nov): compute detail only where you look. AI verdict: the patch model is the coarse
  truth; a zoomed layer runs a detail sim seeded from it, for looks; settled patches sleep. Fits the zoom frame.
- Plant-model references (you, 3 Nov): PlantGL, Virtual Plant Lab, PlantStudio-js → docs/research/plant-models.md.
- Tree pacing: it grew too little (playtest 3); `T.tree` in toys/grow-data.ts (carry, wood, woodUpkeep, shell).
- Breeding with dominance (PlantStudio): genes pass on with one version winning (you: interesting, 3 Nov).
- Chromosome duplication: a new attribute bar to stack, like polyploidy (AI, 3 Nov; builds.md).
- A full C/S/R skill tree per form, and grazers as a pressure with defence branches (you: "grazers soon", 3 Nov).
- Neighbour strategies as tree nodes: climbers, parasites, nurse plants, allelopathy (AI, 3 Nov; builds.md §5).
- A pixel-art world as a third look, if neither low-poly look wins (dropped from the look toy, AI, 3 Nov).
- Steering as a scarce resource (nutrient or attention) so auto stays naive (AI, 3 Nov; after-playtest-02.md).
- 3D, or 3D-drawn plants, if it can be stable (you: "if it could be stable it were great", 3 Nov; look toy).
- Steam and phone releases (you: "cool", 3 Nov): via Godot or a wrapped web app (P42).

## Fits if reshaped
- The food-web expansion plan (P31: structure pieces, a catalogue in rings) → keep only the list of roles; the
  patch niches replace the structure.
- Diet shifts on a food graph (you) → diet from body parts and one niche per food; no graph before animals.
- Metabolism gene and dormancy (AI) → a Pace stat would be the seventh; fold it into Growth and Upkeep, or swap.
- Four levels (clade, species, form, morph) and six ways a species is born (AI) → three: clade (parts), species
  (runs), morph (looks).
- Borders (ecotones) as small places (AI) → a patch kind if the land makes one; not a system.
- Real units, the rest (flows in grams, turnover, home range) (AI) → keep grams on screen; drop the flow views.
- Your mechanics list (Go/Risk territory, Carcassonne tiles, connect the flow, hidden info, a timing bar,
  deckbuilding) → one per activity, not all at once. The side view fits connect the flow and hidden soil (roots
  reveal what's near) (AI).
- Your sim methods, one per kingdom: plants = space colonization and L-systems; fungi = physarum; animals = boids
  and pheromone trails (AI).

## Dropped (your call, 2 Nov): v1 sim realism, or replaced
- Humus as its own stock → fold into soil depth.
- The clock with three tempos → one fixed step.
- Nitrogen leaking downhill with a Tight gene; food quality as C:N; nitrogen resorption.
- Species that converge merge; runs merge back → merging back was reversed on 2 Nov.
- One grid with four verbs (Grow, Gather, Guard, Bet) for every kingdom → one activity per kingdom instead.
- The tree's insect errors (beetles beside insects, bristletails from springtails) → v1's tree; "keep the tree
  accurate" carries.
- "Minigames wait until the garden core is fun" (26 Oct) → v2 reverses it: the activity comes first.
- v1's first-session script (seabirds in session 2, mosses via the leafy shoot, a cliffhanger) → the vent start
  stays (tastes.md).
