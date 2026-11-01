# Clade — Live proposals

AI proposals that are still open. Nothing here is decided until you move it into [brief.md](brief.md).
Keep each one short. Delete a proposal when it's decided or dropped.

The old proposals S0–S26 were archived on 26 Oct (`_archive/2026-10-26/systems.md`). Ask for one by name to bring it back.

## P1. Hands-on play in the colony *(on hold since 26 Oct: the garden core comes first)*
Three toys test three answers: steer the spread, grow one plant, or pick genes that rewrite rules.
See [slices/02-toys.md](slices/02-toys.md), and the wider brainstorm in [minigames.md](minigames.md).

## P2. One grid, four verbs *(on hold; slice 03 has one layer)*
Every kingdom plays on the same tile grid at its own layer (plants on, fungi under, animals over), using the same
verbs: Grow, Gather, Guard, Bet. Relationships come from layers touching. Details in [minigames.md](minigames.md).

## P3. Picks with a cost
Most traits get one downside. Creeping shoots spread faster but dry out more; dense tufts hold water but spread
slower. A pick becomes a bet on your home, not a pure upgrade. Toys 1 and 3 try this.

## P4. Fit as a tier list *(built in slice 03 as the placement heatmap)*
Show S / A / B / C / D instead of bronze, silver, gold. Only labels and colours change. Toy 3 shows it per zone.

## P5. Split controls *(obsolete: slice 03 has no split)*
The three-way slider felt clunky. Try presets (e.g. Grow / Hold / Seed) plus fine tuning. Toy 2 tries presets.

## P6. Biomass needs a first use
The release pays, but nothing spends biomass yet. The next slice that builds the game needs a sink, e.g. soil
building. Show it greyed out on the release screen so the payoff reads.

## P7. The type specimen as a growing plant *(built in slice 03: code-painted sprites; traits show)*
Draw the specimen from an organ graph (VirtualPlantLab ideas) or an L-system, driven by genes. Every pick changes
its shape. That's cheap, and it answers "does the pick visibly change it?"

## P8. The critical path *(replaced 27 Oct by P9's stages)*

## P9. The layered sim: one approach from four sources *(27 Oct)*
From [review-layer-sim.md](review-layer-sim.md) and `research/layer-sim-{games,ecology,engineering}.md`. All four
agree on the core; the points where they differed are marked.
- **Strata:** each tile has one species per stratum (soil / ground / herb, later canopy), each with a cover value.
  Species compete only inside their stratum; up and down they touch only through layers. *(Ecology wanted fungi as
  two tile values, not a slot. The proposal: a slot, because you want fungi as a species you place.)*
- **Layers are typed 0–1 arrays of two kinds:** stocks with memory that decay (soil, nitrogen, litter), and levels
  recomputed from the current state (shade, water). Defined as data; one generic kernel runs them all.
- **Species are data:** needs are trapezoids (ideal band inside a survivable band), makes are rates. **Fit = the
  lowest need**, so every tile has one named limit: "Fit C, limited by light".
- **Species never name each other.** Every interaction goes through layers or guild tags, so the cost grows with
  species + layers, not species².
- **Not frozen:** lifespans, a seed lottery for open tiles (spreading fast vs holding well), loops that undermine
  themselves (ferns shade out their own young), decay on every stock, small capped events. **Not collapsed:**
  refuges, spore rain, a floor for your species. Disturbance is a lever, not a law (the peak-diversity claim is weak).
- **Readable:** a placement view with tier + limiting factor, one view per layer (hotkeys), a tile card that names
  the failing need, an event feed with causes, and later biomes as named regions (untested in any shipped game →
  toy first).
- **The economy can't hear sim noise:** smoothed income, requirements latch once met.
- **Tools first:** a headless runner on 5 seeds, scenarios as command replays, invariants (bounded, not frozen,
  coexistence), ASCII map dumps, a generated species × layer table, a `trace` for the tile card, cause-coded event
  log, a determinism lint, and a "dt test" for offline.
- **Stages:** 05 readable layers (rewrite of the sim core, six species ported, fungi added as data only) → 06 first
  biomes → 07 trees (canopy) → sea line → animals as density fields (individuals drawn only in the view) → the
  adapting minigame (traits move need curves, so you see what they change).

## P10. Landmarks and static layers *(27 Oct, from your landmark idea; built in slice 06: vents, springs, beaches, lava tubes; salt as a status)*
- **Static layers cost nothing per tick:** they're set when the island is made (like terrain and base wetness) and
  never recomputed. So the CPU allows many. The real limit is reading: each layer you *see* should change a
  placement decision. So: few visible layers, and more static ones folded into landmarks.
- **Landmarks as tile features:** a feature per tile (vent, beach, river, waterfall, cave, ...) with fixed effects:
  wetness, shelter, a status. The beach gives the status **Salty**; species have a tolerance instead of a salt band
  (fit × tolerance). The tile card shows "Beach: salty (−70% for mosses)".
- Landmarks also give the map names and places to aim for, and biomes can grow around them.

## P11. Nitrogen with real contrast *(27 Oct, after slice 06)*
- In slice 06 the plants draw nitrogen down to one even level (~0.07–0.10); only beach crusts and litter piles are rich.
- Options: fixers that live under plants (e.g. fixing in fern or club moss roots, as in real alders), patchy
  fungi, or the view showing the change (gaining or losing) instead of the level. Pick by feel in play.


## P12. Species as variants that evolve by themselves *(27 Oct; full overview in [species-models.md](species-models.md); built in slice 07)*
- The sim runs a few **variants** per species (a small genome in steps: dryness, shade, nitrogen, spread vs hold;
  each step has a cost). Mutations happen on spread by luck; selection by fit does the steering.
- **You pick a variant as a founder** elsewhere → it becomes a new, named species. Later: push mutations toward an
  axis, favour a variant, and cross variants (the adapting minigame).
- **Rare finds:** key innovations (tree nodes, with a pity timer) and gene combos that open niches (beach, vent rim).
- Today's bought traits become genes. Individuals only in the view and the minigame. Order: before animals and flows.

## P13. Fixed flows: water, nutrients and soil move across the map *(27 Oct; you like it, after slice 07)*
- A downhill neighbour per tile, set when the island is made. Water and nitrogen run downhill: hollows and the land
  behind the beaches get rich, slopes poor. Flow in one direction makes contrast; plain spreading would flatten it (P11).
- Soil slowly erodes from steep tiles and gathers in low ones (a big, slow store).
- Wind and rain as static gradients: a wet windward side, a dry side behind the volcano, salt spray on the coast.
- Cost: about half a slice; compute ~5k steps per stock per layer update.

## P14. Animals: small grazers first, seabirds as engineers *(27 Oct)*
- No big grazers before grasses. First: snails and springtails eating moss and litter, releasing nitrogen faster
  (pressure on hotspots; helps P11). Then seabirds bringing sea nutrients: a colony becomes a lush new biome
  (Surtsey's gull colony; fact-check). Later engineers: earthworms, burrowers, grazing lawns, coral (sea).
- Animals use the same variant core (P12): density fields in the sim, individuals only in the view.
- The sea stays a source (drift, seabirds, salt) until the land loop is proven.

## P15. Two zooms and chunks *(27 Oct)*
- View only: the whole sim keeps running (it's under 1 ms). Overview: ~8×8-tile chunks as ground colour + name, no
  sprites. Close view: one chunk at ~4× with sprites and animals. Biomes become named chunks instead of a stage.
- The real compute issue is offline catch-up (8 h ≈ 12 min at today's headless speed): needs a coarse fast-forward.

## P16. Variants in the UI and the tree of life *(27 Oct, after playing slice 07; d, e and the tree built in slice 08)*
Three questions: how to order species and variants, what founding means, how both sit in the tree.

**Ordering (pick one or mix):**
- **a. Lineage list.** The species tab becomes an indented list: clade → species → variants. A founded species
  nests under the species it came from. Rows collapse; variants sort by tiles.
- **b. Population bar.** One compact row per species with a single chromosome-style strip: its variants as
  segments sized by tiles, coloured by tier. Click to expand into the full variant rows. Scans well with many species.
- **c. One tree screen.** Merge the Tree and Species tabs: real clades are branches, your species are leaves,
  variants are twigs on hover. A side card shows whatever you click.
- *AI pick: b inside a* (the list stays the workhorse; the tree becomes the trophy view, see below).

**What founding means (today it's only a new name and pool):**
- **d. Founding moves the centre (a ratchet).** A species' variants stay within ±2 of its own base. Founding a
  Rare form makes that form the new base, so its children can reach +3, +4. Extremes (and some combos) are only
  reachable through a chain of foundings. Founding becomes the steering verb, not a cosmetic split.
- **e. Precursor genes lead to the next clade.** Each key innovation needs precursor genes first, as in the brief
  (Mosses: rhizoids, surviving drying out, a stalked capsule, then the leafy shoot). A species carrying more
  precursors gets better key-innovation odds. You found species that carry them, to breed toward the next node.
  Every node could get one key gene this way (Vascular: water-carrying tissue).
- **f. Slots (Q8).** Each founded species takes a slot; few slots make the pick matter. Can come later.
- *AI pick: d + e.* They make founding the path to unlocks, and the pity timer still keeps the pacing.

**In the tree of life:**
- Real nodes stay fixed (the clades). **Your species are leaves** under their clade, linked to the species they
  came from: your own family tree inside the real one. Extinct species stay as grey fossils.
- A leaf shows its tier colour, tiles and a mini population bar (b). The next locked node shows which of your
  species is closest to its key gene (e's precursors as a checklist).
- Later, maybe: a time axis (branches drawn when founded), and wild splits (shown as leaves you didn't found).
- Cost: d + e and the tree leaves ≈ one slice; the ordering alone ≈ half a slice.
- **Your calls (27 Oct):** founded species shown twice is confusing. b inside a for play; clades and milestones
  in a separate tree-of-life screen; the variants on the map clearly visible while playing. d without a hard
  re-centre: rarity scales up cumulatively the further a form is from its clade's base (refunds can balance cost).
  d + e yes. f later: a few active founded species as your "builds"; release old ones to take a new one. Wanted
  if possible: a time axis, and new clades and species drawn as stemming from the variant you grew.
- **Still open from P16:** slots and releasing (f, later), refunding founding cost, a "resembles a real species"
  line on the card (fact-check via researcher), wild splits as leaves you didn't found, the odd stacked names
  ("Sun Sun-screen Cyano").

## P17. Species split off from variants; clades open by recipe *(27 Oct, after playing slice 08; a–d, g and the map built in slice 09)*
One rule for both: **a species splits off from a variant you grew**, inside a clade or into a new one.
- **a. A split.** Founding a Rare+ variant as a species turns *that variant's tiles* into the new species (the
  parent loses them: no twin populations), plus one founder patch where you choose.
- **b. Authored clades, free species.** A clade (data) is a template: look, base bands, its trait list, its door
  recipe. Species are yours: a genome on top of the template. The authored species (e.g. Mosses) are no longer
  founded; they become the templates (maybe wild species later).
- **c. Genes carry, the bar resets.** At a split the variant's axis genes become the new species' base (drawn as
  faint cells); new mutations count from there (bright cells). The cap counts from the **clade template**, so
  splits can't pile up. At a clade change the old clade's traits drop; the key becomes normal for the new clade.
- **d. Doors open by recipe.** Each clade has an authored recipe shown on its node ("What makes a moss: dry +1,
  wind +1, then the leafy shoot"). A variant carrying the whole recipe is a **candidate** (gold outline); only
  candidates roll the key gene (1–3 min, with a pity clock behind it). Then you split it off as the clade's first
  species. Three gene layers: axis steps (trade-offs) → combos (a niche) → keys (a recipe plus a roll → a clade).
- **e. Gene meters.** One meter per axis from the centre, a colour per direction (Dry amber / Wet blue), not good
  vs bad; cumulative cells, each further one rarer; cap ±3 to ±5 by feel. Tooltips show each cell's gain and cost.
- **f. Distance and fit.** Tier colour = how unusual (distance). **Edge** = how much better than its parent where it
  lives, with a "spreads because…" line and a trend arrow. Founding needs Rare or a strong edge.
- **g. A basal ancestor (open).** Start as an "Early land plant" species in the Land plants node. Liverworts and
  Mosses are both doors under it, each with its own recipe, so one ancestor can branch into both (real: mosses and
  liverworts are sister groups, Setaphyta; vascular plants branch from the land-plant stem). Recipes are on clades,
  so any species in the parent clade can meet one. Changes the first-session bet (liverworts first).
- **Map (agreed):** the normal view colours by species; variant colours only in the Variants view or on hover;
  shown variants 8 → 4; half the sprites zoomed in. **Spindle (nice to have):** child bands peel out in a curve,
  the parent thins at a split, samples every 15 s.
- **Order (agreed):** slice 09 = flow (a–d, map); slice 10 = readability (e, f, tooltips); later spindle, more
  combos, wild species.
- **Your calls (27 Oct):** a yes; b yes (templates); c yes (your reset idea); d yes (recipe + candidate roll); e
  two directions, no independent bars, cap ±3–5; f both distance and fit; g yes (liverworts first not required).
- **Still open:** e and f (slice 10), the spindle curves.

## P18. Real species as references *(28 Oct, from your idea after slice 09)*
- **Placed organisms get character:** clades stay groups; what you place is always a named species (you name the
  founder, or it takes a place name: "Vent Thallus"). The ancestor gets a "what it was like" fact.
- **"Resembles…":** an authored list of real species, each a stat combination (axes, traits), a name, one fact and a
  source. When your species matches, the card shows it ("resembles *Racomitrium lanuginosum*, woolly fringe-moss").
- **Sources:** birds and mammals from open trait databases (AVONET, PanTHERIA, EltonTraits; check licences) mapped
  by a script, so cheap at scale. Insects, molluscs, fungi and mosses by hand via the researcher agent (~20–30 per
  call). Start with 30–50 for the first acts; grow by group as the game reaches it.

## P19. The clade map for acts 1–3, and how animals come in *(28 Oct; facts: [research/tree-of-life-overview.md](research/tree-of-life-overview.md))*
**One rule for the look: deep tree, modern island.** The nodes are real clades. A line's ancestor is a generic early
form (like "Early land plants"). Everything you place looks like a recognisable living member: a garden snail, a
springtail, a gull. **Recommendation on your prehistoric vs current question:** prototype with current species. Why:
- you want recognisable species
- real island colonisation (Surtsey, Krakatau) is done by living groups
- a prehistoric animal chain (sponge → fish → tetrapod) needs the sea and about 8 doors before anything walks on land, which is too slow for "animals soon"
- the plant line already works this way: an abstract ancestor, then living groups

The sea line stays a later idea (act 4+, maybe a "deep time" mode).

**a. Two ways in: arrival and door.** Plants evolve into new clades through doors (P17). Most animals **arrive**,
because that is how real islands fill up:
- An arrival node has habitat requirements (e.g. moss on 100 tiles, litter near a beach).
- When they're met, a visitor turns up at a landmark: a snail on a drift log on the beach, springtails on the
  wind, gulls circling the cliffs.
- You adopt it as your species, or it settles wild (brief: wild species, acknowledged).
- From then on it uses the same core: variants, recipes, doors, splits.

Arrivals give each kingdom a cheap, story-like start. Doors give the depth.

**b. Partnership doors (cross-kingdom).** A recipe that names two species from different kingdoms, met where they
overlap on the map:
- Lichen: fungus + cyanobacteria (already a node; becomes this kind).
- Mycorrhiza: fungus + vascular plant.
- Pollination: flowering plant + insect.

Real: these are lifestyles that join lineages, not clades. They put relationships (a pillar) into the tree itself.

**c. The map** (→ = door, ⇢ = arrival, | = sister groups that branch from one ancestor; ★ = suggested first build):
- **Plants:** Early land plants → Liverworts | Mosses (built) → Vascular / club mosses → Ferns | Seed plants →
  Conifers | Flowering plants → Grasses (monocots) | Herbs and shrubs (eudicots). ⇢ **Beach seed plants** (sea
  rocket, lyme grass) drift in at the shore in act 2: the first seeds, before the doors get there (Surtsey's first
  vascular plant, 1965).
- **Fungi:** Fungi (moulds on litter) → Sac fungi (Ascomycota) | Mushrooms (Basidiomycota). Partnerships:
  Lichens (sac fungus + cyanobacteria), Mycorrhiza (+ vascular). Later: white rot (wood).
- **Snails ★:** ⇢ Land snails (a drift log on the beach) → Snails (shell; needs calcium: beach, shell sand) | Slugs
  (shell lost; fast but wet only). Real: shells were lost several times. A good two-direction gene: Shell / Bare.
- **Arthropods ★:**
  - ⇢ Tiny hexapods (on the wind) → Springtails | Insects. This mirrors liverworts / mosses (sister groups).
  - ⇢ Spiders: ballooning on silk, the first predator, eating springtails.
  - Insects → Wings → Dragonflies (aquatic larvae: springs) | Folding wings → Crickets (grass), Cockroaches →
    Termites (wood) | Metamorphosis → Beetles, Flies, then Bees and Butterflies (these need flowering plants:
    a partnership).
- **Worms:** ⇢ Potworms (small, litter) → Earthworms (door: soil mixing, needs soil). Real: earthworms rarely
  cross the sea, so they arrive late, in mud from the bird colony (fact-check).
- **Vertebrates (act 3):**
  - ⇢ Seabirds (gulls): they arrive once seed plants give nesting cover and seeds, as you wanted. The colony is an
    engineer: a nitrogen hotspot that brings seeds (Surtsey's gull colony, 1985, drove plant growth).
  - ⇢ Small birds that follow the insects (wagtail, pipit). Then seed-eaters (finch beaks as a gene).
  - ⇢ Lizards on drift logs (geckos, skinks: Krakatau).
  - ⇢ Bats: the first mammals on remote islands. Fruit and pollination.
  - Rodents and bigger mammals much later, or never (real islands rarely get them).

**d. The first animal food web** (all early, no seed plants needed): litter → springtails → spiders; moss and
liverworts → snails. Snails are the first pressure on your plants, as you wanted: they graze the cover down,
turn it into litter and nitrogen faster, and shift which variants win (bitter, tough or dry ones). Springtails
speed up decay and spread fungi. Spiders keep springtails in check.

**e. How animals work in the sim** *(replaced 28 Oct by P20: animals as agents)* (as P14: density fields in the sim, individuals only in the view):
- A species is a density per tile, like plant cover. Diet: a layer or species it eats (litter, moss cover, prey
  density). Effects: what it lowers and what it releases (nitrogen, litter).
- Spread: animals move faster than plants and lean toward food (a gradient on neighbours), not only outward.
- Genes on a few animal axes, two directions each: Dry / Wet, Small / Large, Picky / Broad (diet), Shell / Bare or
  Hidden / Bold (defence). The same variant core, meters and recipes.
- View: a few cute individuals walk on high-density tiles, so you can find them (brief: small animals to discover).
  They have character: a snail leaves a slime trail, springtails jump, a spider sits on a web.

**f. A first animal slice (suggestion):** snails on a log, and tiny hexapods → springtails, with spiders as a
stretch. One door inside each line (Snails | Slugs; Springtails | Insects). Arrival nodes, a density field, eat and
release, a few sprites. No birds, no partnerships yet. Order: after slice 10 (readability), or before it if animals
matter more now.

**Your calls (28 Oct):**
- **Modern forms for the first version.** The full deep-time road (playing the whole chains) is wanted later.
- **Arrivals: yes**, as a second way in, with habitat requirements, for now.
- **Partnership doors: yes.**
- **The map is good, with more plants (a tree).** Fungi by role: saprotrophs, lichen-forming, mycorrhiza.
- **Animals to focus on:** snails, springtails, spiders, later beetles, bees, maybe seabirds and lizards.
- **Earthworms: probably clutter.** Leave them out for now.
- **The first food web, the sim section and the first animal slice: good.** Spec: [slices/10-first-animals.md](slices/10-first-animals.md).

## P20. Individuals: animals as agents, plants as patches *(28 Oct, from your wish for individual drama)*
- **Animals are individuals in the sim** (an individual-based model, standard in ecology), not density fields.
  Each one has a place, energy, an age, a genome (its variant) and a state (foraging, resting, fleeing).
  - You can follow one.
  - A spider picks a springtail and eats it, and you see it.
  - Too many snails in one spot draws the predators there.
  - An island has room for only a few birds, because each one needs a territory.
- **The cost is low:** the map is 96×56 and ticks 10 times a second. A few thousand agents in a grid by tile is
  easy in JS. Birds and lizards come in tens, snails in hundreds.
- **Swarms for tiny animals:** an agent can stand for a small group (springtails as a swarm that grows, splits and
  gets bitten down). That keeps the numbers small while each one still looks like an individual. Ecology calls this
  "super-individuals".
- **Variants = genomes of individuals.** A child copies its parent's genome, with a mutation chance. The variant UI
  counts individuals instead of tiles, and the same recipes, doors and splits apply.
- **Effects go through stocks** (your call): dung goes into nitrogen, grazing takes cover, deaths become litter.
  Who eats whom is data (food tags), not species names, so new animals and food cycles are data only.
- **No zoom-level sim.** Running individuals only where you look makes results depend on the camera. Instead the
  zoom is a view: zoom in, follow one animal, open its card (name, age, what it ate, its children).
- **Risks:**
  - Noise: small populations can die out by chance. That's real, and arrivals can repeat now and then, as on
    real islands.
  - Harder balance, and slower time skip or offline catch-up (offline may need a coarse step).
- **Plants get identity as patches.** A connected group of one variant's tiles is an individual: a moss cushion
  really is one genetic individual (a genet). It gets a name, an age, a size and a history.
  - Battles happen at patch borders. Events go in a feed: "Dry Moss pushed the Wet Liverwort off the ridge."
  - "Why it won" (slice 11) explains each battle.
  - Big plants (trees, later) are individuals outright: few per island, so they can be agents too.

## P21. Groups, settled populations, balance and contrast *(28 Oct, after playing slice 10; notes in [playtests/10-first-animals.md](playtests/10-first-animals.md))*
- **a. Groups (your call: yes).** Every small animal's agent stands for a group: snails as a family (~12),
  springtails as a swarm (~200), bristletails as a troop (~10). Big, rare animals (beetles, later birds) stay close
  to one agent per animal. Rule: the bigger and rarer, the closer to 1:1. Aim for 20–60 agents per species while
  the real counts run into the thousands (real springtails live at tens of thousands per m²).
  - A group grows by breeding and splits at its size. The half that splits off walks 4–10 tiles away before it
    settles: young dispersing, which also gets snails off their beach.
  - Hunters bite members off a group. A mutation happens at a split, so a group carries one genome.
  - You still follow one: "Snail family #14, 12 snails, Wet variant".
- **b. Settled populations, behind the scenes (feasible).** Not by camera (P20: results mustn't depend on where
  you look), but by state:
  - **Slow tick:** a settled group (fed, not hunted lately, not moving) updates every ~10 ticks with 10× the time
    step. Groups at the frontier, hungry or hunted stay on the fast tick.
  - **Merging:** small groups of one variant on one tile merge, so a population stays a few groups after a crash.
  - **Visuals:** the overview zoom draws no animal sprites, only the Animals view tint; up close a group draws 1–3
    sprites. Compute is fine today (3–5.5 ms a tick with plants); the gain is time skip and offline catch-up.
  - Later, if needed: a fully established population becomes a density field per tile that only spawns groups
    at its edges. Only worth it once agent counts really hurt.
- **c. Balance the structure now, the numbers later.** Your question: wait until the food web is full? Two kinds:
  - **Structure** (what limits each population, nothing made from nothing, contrast kept) has to be right for
    each layer before the next comes. Otherwise every new species lands on a broken base and you can't see what it
    does. Slice 10 shows it: one number reshaped the island.
  - **Numbers** (exact sizes and timings) wait until producers, grazers, predators and partners are all in.
  - Rule: each species has an expected size from a small curve model (food supply ÷ what one needs); no species
    sits at its cap. Caps stay a safety net.
  - **Nitrogen is conserved:** decaying litter releases nitrogen; animals only speed that flow up.
  - **Predation as top-down control:** a hunter is full for a while after a catch (handling time), prey hide
    better in thick cover (refuges), and hunters keep apart (territory). These damp the boom and crash. Later,
    predators (mites, spiders, beetles) become the main control on springtails, which is real.
- **d. Contrast between regions.** Today there's **no climate gradient**: base water is the same everywhere
  (`lavaWet`); only landmarks and cracks change it. No sun, wind or height. Natural ways to get it, strongest
  first:
  1. **A wind side:** the prevailing wind gives a wet windward side with salt spray on its coast, and a dry lee
     (rain shadow, real on most volcanic islands). One gradient across the map, set by seed.
  2. **Height:** the volcano cone. Higher is cooler and wetter (cloud); steep slopes hold less soil; the sunny
     side is drier. That gives a summit, slopes and lowlands.
  3. **Disturbance:** storms on the windward coast, vent flares, rockfalls. Succession restarts locally, which
     keeps a mosaic (patch dynamics in ecology).
  4. **Patches that reinforce themselves:** plants that change their tile in their own favour (moss holds water,
     so the tile gets wetter) make patches with sharp edges.
  5. **Stores that don't spread:** soil depth and age stay where they formed.
  - **Regions from the gradients:** name the areas they make (Windward slope, Lee shore, Summit, Lava field). The
    overview is a strategic map of regions; click one for its close view (P15). The sim stays one level; the
    view does the regions. This ties contrast, named regions and readable placement together.
- **e. The player's part next.** After 10b, a planning thread rather than a slice: what does a 20-minute session
  and a day ask of you, and where are the goals and stakes? Seeds from the sim: the ecosystem asks for things
  (beetles need cover on the lee shore), placement across contrasting regions, your species as a build you level
  up, and a family you follow as the RPG hero.
- **Your calls (28 Oct):**
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
- **f. Contrast, a simple start (proposal for after 10b).** One climate gradient plus one feedback:
  - a **wind side** by seed: base water +0.15 on the windward half, −0.1 in the lee, salt spray on the windward
    coast;
  - **moss holds water:** ground cover raises its tile's water a little (shade already does), so wet patches
    reinforce themselves and get sharp edges.
  - Height, disturbance and named regions come after, once this reads.

## P22. Ideas list *(28 Oct, yours unless marked)*
- **A tile side view:** a cut-through picture of one tile with all its layers and nutrients (rock, soil, litter,
  water, plants, animals).
- **Tile types change over generations** (succession on the ground itself): a lava field tile that gathers litter,
  soil and water becomes bare ground, later a forest floor on deep soil. Fits "condensing into old growth" (P21 b).
- **Metabolism as a trait:** the update rate (P21 b) as a gene with a cost: faster reacts and spreads sooner but
  costs upkeep. *(AI, 28 Oct)* Update frequency alone is nearly neutral by design (dt scales, and a test checks
  it); its only real effect is how fast an animal reacts (hunters, food). So make it a **Metabolism** gene with
  stat effects, and let the pace follow: fast = more young, quicker reactions, higher upkeep, shorter life; slow =
  lasts longer through hunger, lives longer, reacts late (caught more). Real: small animals live fast (Kleiber).
  **Dormancy** ties it to compute: in bad times a group goes dormant (very slow pace, little upkeep) instead of
  dying; real for snails (sealed with slime), springtails (drying out) and spores.
- *(Your notes, 28 Oct, after 10b)* **Tick saving is a separate issue** from the Metabolism gene; scaling update
  times makes sense in many places. **Update what changes:** tiles that change update often, stable ones rarely
  (as in many sims). Dormancy is cool, but watch the complexity. For snails, prefer an **emergent edge** over a
  special rule.
- **Diet shifts, generalised** *(your wish; AI sketch in [session-fresh-eyes.md](session-fresh-eyes.md) §4.4)*:
  food tags on everything edible, diets as weights, a gene that moves weight along a food-neighbours graph.
- **Evolution points** *(your idea)*: a currency you put into an archetype, or spend when random mutation doesn't
  bring the combination you want.
- **Absolute vs relative** *(your note)*: after a split you can't see the cumulative genes or how two species from
  one ancestor compare. Wanted: a cumulative view and a way to see similarity.
- **Chains are features** (your call after 10b): let chains like nitrogen → herbs → shade → lichens lose, or
  litter → fungi → springtails, play out; tune them, don't cut them. They can drive colonisation later.
- **Old growth:** established, stable patches and groups condense and update slower; a disturbance wakes them up.
- *(AI)* Founding cost per clade, not per island (in 10b).

## P23. The species screen: stat cards, abilities, tidying the list *(28 Oct, your ideas after 10b; AI notes marked)*
- **a. The species card on the left** instead of at the bottom, so it sits beside the map while you play.
- **b. A stat card per species** (TierZoo-style: a few stats plus unique abilities), so you see species differ and
  get better. *(AI)* Map it onto numbers the sim already has, shown as 1–10 against the clade's template, with an
  arrow against the parent species:
  - animals: Speed (speed), Toughness (life, upkeep), Defence (escape), Breeding (young), Appetite (diet breadth),
    Senses (sight), Metabolism (pace, P22)
  - plants: Spread (seeds), Hold, Growth, Yield, Hardiness (how wide its need bands are)
  - **abilities** are the trait genes and keys (Thick shell, Bitter, Heterocysts, Leafy shoot) as chips.
  - The need bars stay (you like them); the gene pips become the "how it got here" view behind the card.
- **c. Species that converge merge.** Two species of one clade that end up with the same genes (or go back to
  being duplicates) merge into one. *(AI)* Real: lines that meet again can hybridise. A feed line ("Dry Moss and
  Shade Moss have become one species again") and the spindle joins them.
- **d. Old and extinct species leave the list.** Extinct ones show only on the tree. An ancestor that dies out (the
  early land plants) becomes a break in the species list, an era marker that organises it.
- **e. Filters: plants / animals / fungi** in the species list. *(AI, on niches)* Animals can already found species
  from a variant (splits move their groups; you place a founder group), but their axes are only Dry / Wet and
  Picky / Broad, so animal species differ little. Real animal niches come from **diet shifts** (a springtail line
  that eats litter instead of fungi, a snail that eats lichens), **habitat** (bark, rock, litter layer) and
  **timing** (night, season). A diet-shift gene would make animal founding matter.

## P24. The game's shape: lineages, island runs and a slot board *(28–29 Oct, the fresh-eyes planning chat; the plan is [review-game-shape.md](review-game-shape.md))*
- **a. Principles:** the sim decides and the game names it; you grow one thing the whole time; runs change the
  line, home pays for it; everything helps something else; pick from offers, designing is scarce; simple first,
  depth as progress; the world moves; rare means rare in the data; fair to the clock; smallest version first.
- **b. Home and the slot board:** a slot is a region plus a role (roles mostly from data). The sim gives size, use,
  holder, tier, trend and "fed by". Gains = size × share × fit, scaled per region. Shown on the map too.
- **c. Lineages as characters:** class (clade), stats, abilities, a level from runs; 1 → 3–4; each run starts
  from one of its descendants.
- **d. Runs on young islands:** choose island, lineage, target and 1–2 helpers; land; broods and the heir's spot;
  seasons, blooms, locals; ends by the clock, your call or the line dying. The adapted line comes home and has to
  take a slot (the forecast is its reasons). Finished islands stay as outposts.
- **e. The nursery:** breeding that costs seeds, kept scarce.
- **f. The moving world:** seasons with a forecast, succession opening roles, events.
- **g. Discovery:** forms, keys, morphs, locals, the codex; tiers from the odds; island seeds and genome codes.
- **h. What you see first:** a simple surface; lenses unlock as progress.
- **i. Time:** a clock per island; live and coarse; sleeping regions; banked away time for fast-forward; saves.
- **j. Genome v2, later:** niche genes, stats with upkeep, abilities, forms, morphs.
- **k. The long target:** the island's climax closes an era with a capstone clade.
- **l. Order:** 11 the slot board (with the wind side) · 12a the first run · 12b coming home · 13 time and a
  second lineage · 14 the moving world · 15 genome v2. Spec: [slices/11-slot-board.md](slices/11-slot-board.md).
- **Your calls (28–29 Oct):**
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

## P25. Slots from food links and habitats *(29 Oct, after part A of slice 11)*
- **a. Two kinds of place:** the fixed regions (geography: landmarks and wind side, made once) and **habitats** the
  sim makes from what grows: a region × a kind (dark floor, wet seep, spray coast, bare rock, deep soil, vent scar),
  tested per tile every check. Tiles move; the habitat keeps its identity. Named by kind and what holds it
  ("Fern forest", "Mossy stream", "Lichen barrens", "Windy cliff").
- **b. Roles:** leads (the major per layer), food links (one per thing eaten: Slug eater, Moss grazer, Litter eater,
  Decomposer; they open when their food appears), later guilds (habitat × food: "dark-floor grazer").
- **c. Groups are base species:** snails ≠ slugs, and a slug species you made still counts as a slug.
- **d. The board:** each place shows 3 slots (its lead, its biggest eating link, its biggest hunting link); on top,
  the island's best of each role ("Best slug eater: Ground beetles").
- **e. Later, hiding:** shade and caves make prey harder to catch, so dark places matter to animals. A sim change.
- **Your calls (29 Oct):** food links and detected habitats are "what I had in mind"; you'll accept some difficulties
  for them. Sim-made places that depend on what's there, alongside the fixed ones ("windy cliff, fern forest, mossy
  river"): the reason for regions was to look for a good slot somewhere and fill it. Guilds: great, unlock later.
  Groups: named groups (b, c). 3 slots per region and habitat, with an island-wide best of. Hiding: very
  interesting, fits the feeling of discovering things and animals. Region names only in the Regions view.
- **Open:** "best" = the biggest share (assumed for now) or the most efficient?

## P26. Habitats as loadouts, real biomass, and headlines *(30 Oct, after part B of slice 11)*
- **Your notes (30 Oct):** part B is a step toward it but not what you pictured. Habitats developing on the map should
  be highlighted and be the slots to fill, filled by fitting species **like an RPG equipment loadout**. The board
  should show a **picture of the current best species** (and maybe of the habitat). Regions are fine but weren't
  needed; later they should grow organically (maybe from geology). Fewer iconic slots alongside the full system.
  Open slots are good (many more species will come). The feed is fine, but important news must stand out. You want
  **real biomass**: weight per animal (or group), metabolism and growth potential, in numbers that add up, shown
  g → kg → t; a niche should be big when much lives there or it matters, and regrowth should count.
- **a. The loadout (AI):** every place shows the same six iconic slots, always in the same order, like gear slots:
  **Under ground ✱, Ground ▲, Herb layer ♠** (who leads each plant layer), **Grazer, Recycler** (litter eater and
  decomposer), **Hunter**. Each one is filled by the best of the full roles under it (Moss grazer, Fern grazer… stay
  as the detail behind it, and in the island's best). An empty frame means open; a greyed frame means nothing could
  live here (no herb layer on bare rock). This fixes "only ground cover". *Option:* later, the habitat kind changes
  the loadout (a spray coast gets no herb slot; a stream gets a water slot).
- **b. Habitats on the map (AI):** in part C the habitats become the main places. Their tiles get a tint or outline
  and a small loadout card floats on them, while regions recede to naming and telling twins apart. Regions grown
  from geology (lava flows, ash, tubes): parked.
- **c. Pictures (AI):** a filled slot shows the holder's portrait. First the species' map sprite drawn large, with
  real portraits in an art pass. The habitat card can show a swatch of its kind's ground.
- **d. Real biomass, three options (AI):**
  - d1. **Units on top:** a mass per species (grams per full tile of cover, grams per animal) turns cover and members
    into grams, for display and slot sizes only. The sim stays as it is. Cheap, but numbers still don't truly add up.
  - d2. **Biomass as the sim's stock:** plants hold grams per tile and grow by a rate × mass (filling up to a
    maximum, so regrowth is built in); animals have a body mass per member, eat grams, burn mass^0.75 × rate
    (metabolism), and keep ~10–20 % of what they eat. Dead mass becomes litter in grams, and decomposers turn it
    into soil and nitrogen. Everything is conserved (sun in, breathing out). A slot's size = food made per minute in
    grams, shown beside the standing mass ("moss 1.2 kg, makes 40 g/min, 5 % eaten"). Honest and what you
    described, but it reworks life, agents and fields, and needs a balance pass.
  - d3. d1 now, d2 later together with plants as patches (P20).
  - Rough real masses (to check with the researcher): springtail ~0.1 mg, bristletail ~5 mg, snail ~1–3 g, slug
    ~3–8 g, ground beetle ~0.1–0.5 g; a moss mat ~100–500 g dry per m². This needs a tile size (1 m? 5 m?).
  - The top bar's "Biomass" is a currency today (plant yield + food eaten × yield), not a mass. With d2 it either
    becomes a real share of your species' production or gets a new name (open).
- **e. Headlines (AI):** the feed splits into headlines (the island's best changes, a new species or arrival, a
  big slot opening, a species dying out), which show as a banner on the map for a few seconds and stay pinned at
  the top, and chatter (per-place slot changes), small and collapsible.
- **Open:** a1 now, or the habitat-kind loadouts straight away? d1, d2 or d3? Tile size? Does "best" mean the
  biggest share or the most efficient (now easier to measure with d2: grams kept per gram eaten)?
- **Your calls (30 Oct):** a yes, if the menu doesn't get cluttered; b, c and e yes. d: you like d2 a lot but want
  time to think it through, so **d3**: grams on top in part C, and d2 as its own slice once you've decided. For the
  bar you want something clear and absolute that still allows comparing (the part C answer: the bar shows how full
  the slot is, the size is in grams with a size word). Part C spec written.
- **d2 for when you think it through (AI):**
  - *What it would improve:* everything has to add up, so the flows the sim fakes today become real. Animals starve
    when they eat less than they burn, plants regrow from what's left (no more hand-tuned recovery), and litter,
    soil and nitrogen follow from dead mass. Chains (P21, chains-are-features) get stronger and easier to explain
    ("the beetles ate 30 g of slugs a minute"). Slot sizes, "best" (grams kept per gram eaten) and later gains all
    come from one number. Big and small animals become comparable, and gram → kg → t gives a sense of growth.
  - *Downsides:*
    - Most of life.ts, agents.ts and fields.ts change, and all the balance work since slice 05 has to be redone.
      This is the biggest risk.
    - Real ratios are extreme: a springtail is ~10 000× lighter than a slug, and real food chains lose ~90 % per
      step. Hunters may become rare unless the efficiencies are tuned away from reality.
    - Cover (what the art and the fit use) has to come from mass, so a fast-growing plant could look full while
      holding little.
    - Real numbers invite real-world checks (players and you will notice wrong ones).
    - Slower ticks if every member tracks mass (mitigated by groups and the current pacing).
  - *When:* after you've played part C, before the 12a spec, because the run judges slots in whatever units we
    have then.
- **Your call (30 Oct, handoff):** part C as specced is great; **d2 as soon as possible**, right after part C.

## P27. Real-world units for readability *(30 Oct, AI, from your question; goes well with d2)*
Ranked by how much they'd help reading the island, cheapest first:
- **a. Layers in real units on the tile card:** soil as cm deep, shade as % light, water as % moisture (and mm of
  rain), nitrogen as g/m², salt as a word. "Soil 3 cm, 40 % light, moist" reads faster than 0.42 bars. Display only.
- **b. A map scale bar and real distances** ("this fern forest is 60 m across"). It needs the tile size from d2 and
  your bigger-tiles note.
- **c. Counts as individuals and densities:** "≈ 40 000 springtails (2 000 per m²)" beside the few shown. That's
  real, it fits groups with high numbers and few shown, and it makes small animals feel numerous.
- **d. Island time in years and seasons:** primary succession on lava takes decades, so a game minute could be a
  year. "Year 34: the first fern forest" turns the run into a story with eras. Seasons later.
- **e. Body size you can see:** sprite size and how many are drawn scale with the log of the body mass (from d2),
  so a beetle reads as bigger than a springtail at a glance.
- **f. Flows in grams on a food-web view:** arrows sized by g/min between the groups (moss → slugs → beetles,
  litter → fungi). It shows the chains (chains-are-features) and needs d2.
- **Skip for now:** real temperature or a climate gradient (no gradient yet, your call), and exact real
  physiology. Rough real ratios are enough to read; tune by feel.

## P28. Big and small habitats, and regions vs habitats *(31 Oct, AI, from your part C playtest)*
- **a. Two tiers:** *major* habitats (today's 60+ tiles: a name, a loadout card, on the board) and *patches* (from
  ~8 tiles: tinted on the map, the kind on hover, their slots still count for the island's best). A patch can grow
  into a major one, which is the headline.
- **b. Name the big piece:** a habitat's name and card go on its largest connected piece; scattered bits read as
  "patches of the Fern stream". Optionally split a habitat by connected pieces instead of by region.
- **c. Regions vs habitats:** (1) regions only as the twin suffix, with the Regions view dropped; (2) regions become
  large "areas" that group habitats in the panel ("Windward lava: Club moss heath, Fern stream, 3 patches"); (3)
  regions replaced by connected pieces of a kind (no k-means cuts at all).
- **d. Borders (ecotones):** tiles where two kinds meet as their own small places, with both sides' slots.
  Real ecology: edges are often the richest spots.
- **Open:** are patches clickable with a loadout, or map-only? Which of c?
- **Your calls (31 Oct):** **c3**: drop the k-means regions; habitats are connected pieces of one kind, and twins
  get a compass suffix ("Fern stream, west"). **a:** two tiers; patches are **hover only** (tint, kind and top holders
  on hover, no card or board entry) and their slots still count for the island's best. **b yes:** the name and card go
  on the largest piece, and a patch growing into a major habitat is a headline. **d parked** until d2. Folds into the
  d2 spec.


## P29. Growth curves, more real units, and currencies *(31 Oct, AI, from your questions on the 11d spec)*
- **a. Growth (in 11d part B):** plain logistic growth peaks at half size and stops at full size, so a mature carpet
  would make nothing for grazers. Real stands make the most when full (a closed canopy) and shed it as litter. The
  spec splits it: production = grow × C × (2x − x²), turnover = grow × C × x; the net is still logistic.
- **b. Units worth adding, best first:**
  - Habitat area in hectares ("Fern forest, 0.8 ha"); cheap with 10 m tiles.
  - Productivity as g/m² per minute, the ecologist's NPP, so places compare per area, not only in total.
  - Turnover and residence time ("the moss renews every 3 min", "litter lasts 5 min").
  - Home range in metres ("roams 30 m").
  - Food quality as C:N: nitrogen-poor food is worth less to eaters, and nitrogen-poor litter rots slower. Real,
    strong hidden depth, a link to the nitrogen layer. Its own slice.
  - Years and seasons (P27 d), later.
  - Skip: joules (grams carry it), temperature (no gradient yet), pH.
- **c. Currencies, later:** Biomass stays (grams your species make). The brief already wants horizontal resources
  from guilds; real candidates are nitrogen fixed, litter recycled, spores or seeds spread, and prey caught. Not
  before 12a.
- **Your calls (31 Oct):** a yes; hectares and productivity ride with 11d; the rest of b and c later.

## P30. Rebalance after 11d B, geology, swings *(31 Oct, AI, from your 11d A+B play)*
- **a. Turnover:** shed uses `grow` (per second), so plants renew ~5× a minute; grazer slots (a flow, ~1 t/min) dwarf
  standing mass (340 kg), litter and nitrogen flood (hotspots under dense plants). Fix: a per-species `renew`
  (≈5–10% of standing mass a minute) for the shed term; `grow` stays the fill speed. No extra compute.
- **b. Nitrogen:** mainly from fixers (cyano, lichen) and animals (dung, bodies); litter recycles a small share and
  leaks the rest. Real on young volcanic islands (Surtsey: fixers and seabird droppings first).
- **c. Slot holders:** the biggest taker holds a slot above a small floor (≈2% of the food); the share is shown,
  no longer the gate.
- **d. Slugs:** a small wet niche (seeps, liverwort, fungus, fresh rot) with a lower upkeep than snails.
- **e. Habitat thresholds:** a little lower (show ≈50, hide ≈35).
- **f. Geology (later, its own spec):** a few ground units painted at island build, each with a type (old flow,
  young flow, tephra/ash, cinder cone, beach) that sets soil cap, water hold and drainage; slope (from height) thins
  soil and feeds the foot below; wind side brings salt and rain. Pieces of a kind don't join across a unit edge, so
  places split along real lines ("Fern forest on the Old Flow"). Cost only at build. Island recipes (one big old flow
  vs many young ones, springs, wind) make islands differ.
- **g. Soil (later):** one slow humus stock between litter and soil (raises soil, holds nitrogen); not many layers.
- **h. Swings (part C):** some grazers with high appetite that breed when fed and starve after; plants can be grazed
  to death (higher `minGrazed`); some dying out is fine.
- **i. Progression (later):** diets gained through genes; a fuller tree of life will shift balance, so balance the
  structure now and fine-tune later. Balance shifting is part of the game.
- **Your calls (31 Oct):** a, b, c, d, e now (one small pass); f leaning yes, wider than flow age; g yes, few layers;
  h yes in part C; i yes.

## P31. The tree of life and the food web: an expansion plan *(31 Oct, AI, from your ask; the plan is [review-food-web.md](review-food-web.md))*
- **a. Six pieces of structure** so new species are data: food types (fruit, nectar, wood, sea wrack, windfall),
  hunting by body size, body-size rules (life, young, home range from mass), a canopy with wood and fruit, roles
  grouped by food, partnerships through agents (seed carrying, pollination).
- **b. Four levels:** clade, species, form (Woody, Flightless, Giant, Dwarf), morph. Six ways a species is born,
  including **wild splits** when habitat pieces isolate a species.
- **c. A catalogue in rings** (shore and windfall → soil and litter → herbs → flowers and fruit → small vertebrates
  → giants), mapped to four eras. Trees from tree ferns, conifers, pioneer and fruit trees, island woodiness.
- **d. Founding costs:** f1 founders' grams, f2 tiers, f3 guild resources later.
- **e. Order:** A web first, B runs first, C one structure slice (11e) then runs (AI lean: C).
- **Open:** the nine questions in §9 of the plan (climate, how big, mammals, size windows, tree strata, imports,
  wild splits, costs, order).
- **Your calls (1 Nov):** Q1 a subtropical home, run islands that vary. Q5 a canopy stratum for trees. Q6 outside
  inputs yes. Q7 wild splits: see 12b first, and think about how species are made (P33 c). Q8 f1, but no
  split-and-place by the player; founding could come with runs. Open: Q2 (are bigger islands feasible? P33 f),
  Q3 (bats yes, more cute animals, and animals coming ashore: P33 e, g), Q4 hunting by size, Q9 order.

## P32. Nitrogen by the gram, the rot chain, and one clock *(31 Oct, AI, from your questions after the P30 pass)*
- **Why it's fragile now:** nitrogen isn't tied to grams. Plants take a fixed rate whatever they grow, fungus makes
  0.006 whatever it eats, and one unit is 5000 g/m² (real plant-available N is 1–5 g/m²). So fungus is nearly all
  the nitrogen, and any change to litter swings the whole web (P30 a cut litter, fungus died, ferns crashed). Real
  old ecosystems get ~90% of plant N from recycling; young volcanic islands are N-poor and new inputs decide.
- **a. Nitrogen follows the grams.** Options: **a1 (AI lean)** each species has a tissue N share; plants take
  production × share (no N, no growth); litter carries the N of what fell; decay frees it and a share `leak` is lost;
  fungus speeds decay instead of making N; fixers add N per gram made; dung returns the food's N minus what the body
  keeps; bodies carry theirs into litter; an N ledger like the grams one. Hotspots can't come from nothing. A few
  multiplies per slot. **a2** only uptake tied to production, fungus as now. **a3** retune rates, no structure.
- **b. Rot chain.** Standing litter = litterfall ÷ decay; real floors hold 1–3 years of fall. **b1** litter decay from
  the clock (d), so litter holds a few "years" of fall again. **b2** fungus as a decay boost (litter → threads →
  springtails). **b3** eaters' `full` and fungus's need in years of litterfall, not absolute units, so they rescale
  when rates change. Lean: b1 + b3 now, b2 with a1.
- **c. Real values** (rough, from memory; the researcher can source them). Per m²: standing g · production g/yr ·
  tissue N. Cyano crust 10–50 · 20–100 · 3–6%, fixes 0.1–1 g N/yr. Lichen 50–500 · 10–50 · 1–3%, fixes 0.1–1.
  Moss 100–1000 · 50–300 · ~1%, litter k 0.1–0.3/yr. Liverwort 50–300 · 50–200 · 1.5–2%. Club moss 100–500 · 50–150
  · 1–1.5%. Fern 200–1000 · 200–800 (fronds ~1×/yr) · 1.5–2.5%, k 0.3–1/yr. Fungus threads 10–100, turnover 5–20/yr,
  3–6%. Soil N: available 1–5 g, total 100–1000 g. Rain 0.1–1 g N/yr; a gull colony ~5 (Surtsey); leak in N-poor
  land ≤10–20% of what's freed. Springtails 10⁴–10⁵ per m², snails 1–50; snail life 1–5 yr, springtail months.
  Soil on young lava ~1 cm per 100–1000 years.
- **d. One clock, three tempos.** Every rate in data in real units (per year), and the sim divides by a game clock:
  ratios stay real and one knob speeds a whole group. One clock can't fit all: with a year ≈ 8 min, a fern forest
  (decades) takes hours and soil (centuries) never comes. So three tempos, each one multiplier in the dev panel:
  **life** (moving, eating, breeding: days), **cycle** (growth, turnover, litter, nitrogen: years), **ground** (soil,
  humus, succession: centuries). Balance lives where tempos meet (grazing vs regrowth, soil vs plants), so an eater's
  yearly intake stays in cycle units and only its behaviour is in life.
- **e. Today's pace on that clock:** `renew` 6%/min ≈ moss turnover 0.5/yr, so a year ≈ 8 min. Then litter decay
  should be ~0.0006–0.002/s (now 0.01, 5–15× fast) and a full crust fixes ~0.001 g N/m²/s.
- **f. Small fixes:** fewer headlines (they doubled with the 2% floor: a higher bar or a per-habitat cooldown);
  bristletails on dry crusts first, litter second; a sim line for nitrogen by source and litter in years of fall.
- **Open:** a1, a2 or a3; three tempos or one; the year's length; the leak share.
- **Your calls (1 Nov):** a1, with the code open to more nutrients. b1 + b2 now. c as a starting point. d three
  tempos with the rule (grams and nitrogen only move on cycle), checked critically in P33 a. Leak could be a mechanic
  (P33 b). A year ≈ 8 min.

## P33. Species from the sim, life comes ashore, tempos checked *(1 Nov, AI, from your P31 and P32 calls)*
- **a. Tempos, checked:** two real clocks and a view speed. **Cycle:** every gram and nitrogen flow (eating,
  births, deaths, tree growth). **Ground:** slow stores (soil, humus); speeding them means a smaller store, and the
  flows across the seam carry one visible factor, so the ledger stays honest. **Life:** movement and behaviour only;
  foraging and hunting rates are set per year, so the life knob changes no yearly flow (a test: life ×2 keeps the
  yearly flows within ~5%). Trees on cycle: a stand takes 1–3 h, fine for an idle game.
- **b. Leak as a mechanic:** the leak share depends on cover (bare ground leaks most) and goes downhill with the
  water, landing in low wet ground, springs and the shore. Ridges stay poor, seeps and valleys get rich; species that
  hold nitrogen (a Tight gene) close the leak. Ties to P13 (fixed flows) and to regional contrast.
- **c. Species from the sim:** no buying and no split-and-place. Three sim routes, each a headline, the new species
  wild at first: **drift** (groups in separate habitat pieces drift apart), **key** (a variant meets a recipe and
  rolls it), **partnership** (two species overlap long enough, e.g. lichen from fungus and cyano). You pick any
  species to start a run from; runs are how you steer toward a recipe. Authored: the real tree, recipes and odds;
  never which species or where.
- **d. Today's introductions become sim routes:** land plants (bought) → a key; fungi (bought) → part of the
  starting set; lichens (bought) → a partnership; ferns (bought on a layer gate) → a key on the vascular line;
  animals (arrivals) → e.
- **e. Life comes ashore.** **e1 (AI lean):** a shore stratum with sea life from the start (the sea is the
  reservoir, like the start plant); lineages walk landward through Dry genes and recipes: sea snails → land snails,
  sea isopods → woodlice, amphipods → beach hoppers, crabs → land crabs, fish → tetrapods → reptiles → turtles.
  Real: these moves happened many times and are still going on at the shore (from memory; check). **e2:** animals
  keep arriving. **e3:** one ancestor per group arrives, the rest evolves. The tension: a young island and deep time;
  the game already folds time (mosses from early land plants).
- **f. Bigger islands:** real units per m² make tile size a knob: a big island = the same tile count with 20–30 m
  tiles, or more tiles with sleeping regions (game shape §5). Measure the tick first. 4× the area holds owls and
  tortoises; island dragons need hundreds of km².
- **g. Cute animals:** hermit crabs (real shore pioneers), sea turtles nesting on beaches (sea nitrogen ashore,
  hatchlings running to the sea), geckos, fruit bats, rails, doves, nēnē, puffins and shearwaters, sea lions on
  beaches, rice rats (real rafting rodents on the Galápagos; check).
- **Open:** e1, e2 or e3; the starting set (the sea, cyano, fungal spores?); do arrivals stay at all (invaders
  only?); how far deep time goes on the home island; P31 Q4 and Q9.
