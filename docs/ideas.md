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
- **From playing the garden toy (you, 5 Nov):** playing to fill each niche · playing as a predator · your own predator's behaviour chasing you later.
- **From the 4 Nov planning (AI unless marked), see [design/big-picture.md](design/big-picture.md):** door tiles, so a Life can cross
  into the next habitat and found a population · your role set by what you ate · your descendants on the board as rivals · other
  players' species as residents, through share codes · boards as plain text, so the community can make them · a third body plan
  with a different move shape (a swimmer that can't stop short) · a predator with its own move pattern per species · stacking
  synergies between parts (you) · plants with their own verb, growing instead of walking (you).
- **Geology** (ground units, slope, island recipes; you: leaning yes) → the land layer. M1 needs a small part
  (substrate, wetness, height) to make habitats; the rest later.
- More landmarks (waterfalls, rivers); fixed flows of water and nutrients downhill → cheap along the patch graph.
- Reefs and more structure on the sea map “instead of just going sideways” (you, Part C desktop play, 8 Nov); landmarks versus different routes still to clarify, not added to release scope.
- More run islands (salt, ash, caves), the archipelago map, outposts.
- Sun and cold as pressures (you, 3 Nov), once a niche has them (alpine, open dunes, other islands).
- Two zoom levels: the garden and a close view of one habitat (possibly in side view) (you + AI).
- A small patch strategy map with the individuals visible, as one zoom layer; v1 had a map like it (you, 3 Nov; P44 b).
- Battles in the style of monster-collecting RPGs: the pressures as types (heat, flood, shade, grazers), organs as
  moves; better once animals come (you, 3 Nov).
- After M1: v1 and v2 side by side, combined into one fresh game with every feature (you, 3 Nov).
- An original bitmap font in the spirit of OSRS menus (small, proportional, 1-px black shadow); not a copy (you + AI,
  3 Nov). Free ones to compare: `toys/fonts.html`. How (5 Nov, *proposal*): letters as small text grids, a script with fonttools builds regular and
  real bold; drawn so V/U, 5/S, 8/B and 0/O differ. About one session plus your taste passes. You'd like this too (5 Nov); the lean for the itch release. GNF is your fallback: embed only, the file stays out of the repo.
- Encounters as the tier ladder made visible: a build climbs a niche's encounters (AI, 3 Nov).
- **Morphs:** rare looks (a colour, a pattern, a left-coiled snail); cheap with bodies drawn from genes.
- **"Resembles…":** a body close to a real species' shape names it, with a fact and a source (you + AI). Strong fit.
- Hindsight names for big groups; partnerships (lichen, mycorrhiza) as a partner that changes the side-view rules
  (your "guilds change the rules").
- Species similarity and a cumulative gene view; the lineage's family tree; the tree of life as a collection.
- Found a custom species whose whole build, possibly plus mutations, is inherited (you, 8 Nov); revisit in the step-6 species/lineage review. Step 5's one chosen clutch part is explicitly temporary.
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
- Portrait boards for phones: author maps 8 wide × 11 tall, as the Godot spike's turned mud flats (AI, 5 Nov).
- Shrink Godot's 40 MB web engine with a custom build without 3D; check whether itch serves it compressed (AI, 5 Nov).

- *(M1 run, 5 Nov, AI)* Prey kinds straight from the garden's species (each native a prey with its own flee rule),
  not three fixed kinds. · Several hunters per habitat (Ottoia in the mud, Sidneyia on rock), each with its own rule.
  · A trilobite tree (enrolling, spiny, blind burrowing forms). · Visitors from codes that spread like your lines.
  · Swimmer verbs (a pounce, a sonar sweep) once the hunt is played.

- *(6 Nov, from the full-version plan; the plan itself is [full-version.md](design/full-version.md))*
  - More mechanics and minigames as new kinds of Life, midterm (you): the lineage's `mechanic` key is their door.
  - Playable algae and plants, "playable later is okay" (you). Sessile animals as habitat, sponges and brachiopods (you liked it; M3).
  - Anchored bodies and shells with a jet, as their own small rigs (AI). Planted feet and rope physics as polish on the spine (AI).
  - Code-drawn pixel creatures or hand-drawn bases, if code-drawn low-poly falls short (you liked both).
  - Stretch lineages: Marrella, Waptia, Leanchoilia, Hurdia, hyolith, Pikaia (AI). Later: sea scorpion, millipede, snail, nautiloid, fish; crabs in their own era (you, for the crab).
  - Bodies purely from parts, or a generator that names off-recipe builds as new lineages, alongside recipes (you: "really important" alongside them; AI: shared pieces with named combos).
  - Respec in the close-up tree; XP per lineage or for the whole line (AI; open for step 6).
  - Overarching rules that make parts combine, "skeleton + flabby skin/feathers = wing" (you, 6 Nov; authored recipes come first).
  - Slots that grow with size, so big recipes fit in a Life (AI, 6 Nov; for step 5, full-version.md §6).

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
- More buried food on sand, introduced later, opening burrowing there as a new niche (your idea, 5 Nov).
- Offline as banked time you advance by choice, or catch-up in pieces (your idea, 5 Nov: "8h offline could be handled differently").
- A limited inventory for the body screen ("maybe inventory should be somewhat limited?", 5 Nov; how limited is open).
- Fully free bodies "maybe later or as extension" (5 Nov).
- Pluggable segments, heads and tails as rare late finds (AI, from the review, 5 Nov).
- Save a Life in progress, so closing the page mid-Life loses nothing (AI, 5 Nov).
- Habitats changing shape on the sea map (sand to mud at the edges), after the sea toy if the map lives (slice 17, 5 Nov).
- A line that starts to spread on land, "maybe just as a cliffhanger for now", to end the first version (you, 5 Nov).
- The full chain from ocean to the island (you, 5 Nov).
- "some alorhitm to put together the animals or a base model that shows alla adaptation" (you, 5 Nov).
- More lines; more recognisable, customisable characters, possibly with names (you, 5 Nov; part of the goal in decisions.md).
- The sea toy's little drawn interactions play out, "like something was hunted"; "thats for later" (you, 5 Nov).
- Species shown as more than numbers on the patch card and map (you found numbers confusing, 5 Nov).
- Exact placement of parts in some places, later (you, 6 Nov).
- One tweak for older lineages, resembling an upgrade system (you, 6 Nov).
- Field-guide plates for species and family cards, whatever the board's look (AI, 6 Nov).
- One painted or AI-made image per part, tied to the joints; or small hand-made pixel parts on the computed body (AI, 6 Nov).
- Future minigames with shadows (you, 6 Nov); what they need from the sun decides how the floor stores light.
- Hidden neutral drift per lineage, then rare breakthroughs; some forms only reachable through stepping stones (research shortlist; you liked it, 6 Nov).
- Niche-model food web for the garden: a niche value and a prey interval per species (research shortlist; you liked it, 6 Nov).
- Heritable coat patterns to collect, from a tiny pattern network or reaction-diffusion grid (research shortlist; you liked it, 6 Nov).
- Body shape as a visible read-out of existing stats, not new stats (AI, 6 Nov; research shortlist 3, you asked what the effects would be).
- One pixel size, 16 px a tile, with large animals drawn across two tiles; or a switch between 16 and 24 (you, 7 Nov). For the art pass, step 9.
- Today's floor rendered on the 16 px grid, so 16 px animals share its pixels; untried (AI, 7 Nov).
- AI art test for concept and card art only: Retro Diffusion, your key, under $4 (AI, 6 Nov; not answered).
- Animals on the sea map: the same recipe baked at about 12 px, a capped few roaming each patch, small portraits instead of numbers on the patch card (AI, 7 Nov). For step 4.
