# The tree of life and the food web: an expansion plan (31 Oct)

**An AI proposal (P31; your calls are in [decisions.md](../decisions.md)), from your ask:** review the next steps, and plan the food chain
and animal expansion: a bigger list, more trees, larger animals, a good base for the tree of life, how founding
works, and how new species and clades evolve. Options and questions come first (§7, §9); nothing here is decided.
Facts are from memory unless linked: **check them with the researcher before they become game text.**

## 0. In short

- **Build six pieces of structure once, then animals and plants are data.** Food types (fruit, wood, sea wrack…),
  hunting by body size instead of by named prey, body-size rules, a canopy with wood and fruit, roles grouped by
  food, and partnerships that run through the animals (a pigeon really carries a fig seed).
- **Four levels of evolution:** clade (authored, a key innovation), species (free), form (a named combination
  such as Woody, Flightless or Giant, found in many clades), morph (a look).
- **Six ways a species is born,** including wild species splitting by themselves when a habitat piece isolates them.
- **The list grows in rings that follow real island colonisation:** shore and windfall → soil and litter → herb
  layer → flowers and fruit → small vertebrates → giants and apex hunters. ~25 plant and fungus clades,
  ~35 animal clades, and ~150 real species they resemble.
- **Trees come early and from several lines:** tree ferns (no seeds needed), conifers, pioneer flowering trees,
  fruit trees, and island woodiness (herbs turning into trees, which is real and common on islands).
- **Larger animals come through the island rule:** flying arrivals lose flight and grow big when nothing hunts
  them (dodo, flightless rails, giant tortoises, robber crabs). Big hunters need a bigger island.
- **Recommended order (option C):** finish P30 → 11d part C → one structure slice (11e: food types and the first
  trees) → 12a and 12b → one ring of content rides along with each later slice.

## 1. Where we are, and what's planned

- **Now:** the P30 rebalance pass is in the working tree, not committed (renew, nitrogen from fixers, slot
  floor ≈2%, habitat thresholds 50/35). It still needs `npm run check`, `npm run sim` and your play.
- **Next by the status:** 11d part C (animals in grams, appetite swings, grazed to death).
- **Then by the game shape:** 12a the first run, 12b coming home, 13 time and a second lineage (helpers),
  14 the moving world (seasons, events, the nursery), 15 genome v2 (stats, forms, morphs, diet tags).
- **Parked:** geology (P30 f), humus (P30 g), borders (P28 d), hiding (P25 e), the food-web view (P27 f), your
  30 Oct notes (names, more animals, trees and fruits, the springtail refound bug).

**What the expansion needs from them, and gives back:**

| Slice | It needs | It gives the expansion |
| --- | --- | --- |
| P30 pass | — | A stable base: slots held, renew rates, nitrogen from fixers |
| 11d C | — | Animals in grams; burn by body mass. **Every rule below builds on it.** |
| Geology | — | Old vs young ground: forests on old flows, pioneers on new lava (contrast, and no forest everywhere) |
| 12a run | Locals for each island theme | **The catalogue is the source of locals** (game shape §9's open question) |
| 12b home | — | Lines that come home fill the new slots (fruit eater, wood eater…) |
| 13 helpers | Helper species | Helpers are full species from the catalogue (a fixer tree, a seed-carrying bird) |
| 14 world | Seasons, events | Fruit and flowers in seasons; storms and invaders open the forest |
| 15 genome v2 | Diet tags, a Size axis, forms | Diet shifts, island giants, flightless forms, woody herbs |

## 2. The foundation: six pieces of structure

Today an animal names its prey by tag and eats strata or stocks. That works for five animals; at forty it means
hand-wiring every link. These six pieces make a new species a data row.

**F1. Food types.** Everything edible is one of a short list. Animals eat types, never species.
- Leaves by layer (exists): ground (crusts, moss), herb, canopy (browse).
- Fungus (exists, the under stratum). Litter (exists). Prey (F2).
- **Fruit and seeds (new stock):** plants that fruit put a share of production into it; uneaten, it rots to litter.
- **Nectar (new, small):** flowering plants make it; eating it pollinates (F6).
- **Wood (new slow stock):** dead trees drop into it; only wood eaters and white rot break it down.
- **Outside inputs (new):** sea **wrack** on beaches (washed up seaweed), **windfall** (a thin rain of dead insects
  and seeds on every tile), and **fish** for seabirds (off the map; they bring it back as guano). The ledger gets
  an "imports" line. *Real:* small islands are fed by the sea, and fresh lava in Hawaii has a whole food web living
  on windfall before any plant grows.

**F2. Hunting by body size.** A hunter eats animals inside a size window below its own mass, set by its body plan
(spiders take prey up to their own size; birds take much smaller). Defences move the odds: a shell (needs
crushing jaws), bitterness, escape, hiding in cover (exists), and growing out of the window. Prey tags stay only
for specialists ("Snail jaws"). *Real:* food webs are largely structured by body size; ecologists model them this
way. A new animal finds its place in the web from its mass alone.

**F3. Body-size rules.** From 11d C's burn ∝ mass^0.75, derive the rest as defaults that data can override:
- lifespan and time to adulthood grow with mass^0.25; young per lifetime shrink with it;
- **home range grows with mass**, so a territory caps big animals by island size ("room for five owls");
- how many real animals a member stands for follows the count, aiming at 20–60 agents per species (P21 a).
- A new animal then needs only: a mass, a body plan, food types, defences and needs.

**F4. Trees: a canopy with wood and fruit.**
- A **canopy** stratum above the herbs; its shade falls on everything below.
- Two pools per slot: **leaves** turn over as now; **wood** builds slowly, never sheds, and falls into the wood
  stock when the stand dies. Real stands hold 5–40 kg/m², so 0.5–4 t per 10 m tile: **the island grows in tonnes.**
- **Fruit** as a share of production (F1), seasonal from slice 14.
- Slow to start, then old growth: settled stands update rarely (P22), which keeps them cheap.
- Trees stay stands in the sim; the view picks a few **notable trees** to name (the oldest 'ōhi'a on the ridge).
- **The risk is forest everywhere.** Limits: soil depth, wind and salt, slope, young ground (geology), and later
  storms, landslides, browsing tortoises and fire.

**F5. Roles grouped by food.** The board would explode with one role per species ("Fern grazer", "Gecko
hunter"…). Roles become food types: ground grazer, herb grazer, browser, fruit eater, nectar eater, litter eater,
wood eater, decomposer, small-prey hunter, large-prey hunter, scavenger. The loadout keeps its six frames, with
these as the detail under Grazer, Recycler and Hunter. Open: a seventh frame for the canopy, or "Tall plants"
replacing Herb (§9).

**F6. Partnerships that run through agents.**
- **Seed carrying:** a fruit eater that eats fruit carries a seed and drops it where it is a while later: a
  seeding attempt there. Trees spread far only with partners, which is real (on Krakatau, bird- and bat-carried trees
  came late and unpredictably). And you can watch it happen.
- **Pollination:** a nectar eater raises the seeds of the plant it visits.
- **Fixers:** fixer trees (Casuarina, koa) make nitrogen like cyano does.
- **Mycorrhiza, lichen:** partnership doors (P19 b), as planned.
- **Farmers:** ants tend aphids (honeydew), later.

## 3. The evolution base

### Four levels

| Level | What it is | Made by | Examples |
| --- | --- | --- | --- |
| **Clade** | A body plan or key innovation; an authored template | Door, arrival, partnership | Ferns, Seed plants, Pigeons |
| **Species** | A genome on a template; free and yours | Split, run return, wild split | "Lee Ash Fern" |
| **Form** | A named gene combination with an extra effect; the same form shows up in many clades | Genes meeting the combo | **Woody** (a herb as a shrub or tree), **Flightless**, **Giant**, **Dwarf**, Climber |
| **Morph** | A look with little or no effect | A rare mutation | A left-coiled snail, a white fern |

**Forms are where most "larger" and "tree" stories live**, and that matches the brief ("a tree is a growth form,
not a clade"). *Real:* flightlessness evolved in rails on dozens of islands separately; island woodiness turned
herbs into shrubs and trees many times (Hawaii's silverswords came from one small tarweed and became trees,
shrubs, vines and rosettes).

### Six ways a species is born

| Way | When | You | Status |
| --- | --- | --- | --- |
| **Start** | The game starts | — | Built |
| **Split** | A Rare+ variant at home | Found it, pay biomass | Built (slice 09) |
| **Door** | A candidate has the whole recipe and rolls the key | Split it off as the clade's first species | Built (keys) |
| **Arrival** | Its food and habitat are there; a visitor turns up at a landmark | Adopt it, or it stays wild | Built (3 arrivals) |
| **Partnership** | Two species from different kingdoms overlap | Found the joint clade | Planned (P19 b) |
| **Run return** | The adapted line comes home | Release it into a slot | 12b |
| **Wild split (new)** | A species' groups or patches sit in separate habitat pieces for long, and their genes drift apart | A headline; you may adopt the new species | Proposal |

**Wild splits use what 11d A built:** habitat pieces with lasting ids are islands within the island. A
check every few minutes per species (gene distance between pieces × time apart) is cheap. *Real:* this is
allopatric speciation, the main way island species form. It also answers "how do new species evolve by
themselves" without you paying for each one, and it's the brief's "wild species may split off, acknowledged".

### Clades as templates (data sketch)

```ts
{ id: 'pigeons', name: 'Pigeons', parent: 'birds', era: 3,
  way: { arrive: { at: 'cliff', food: { fruit: 200 } } },   // grams a minute of fruit made on the island
  plan: 'bird', mass: 300, eats: ['fruit', 'seeds'], moves: 'fly',
  needs: { … }, traits: [ … ], forms: ['flightless', 'giant'],
  refs: ['nicobar-pigeon', 'dodo', 'tooth-billed-pigeon'] }  // "resembles…" (P18)
```
- Plants carry a **growth form** (crust, mat, herb, shrub, tree) that sets the stratum, mass per m², grow and renew
  defaults, and the wood share. Animals carry a **body plan** (hexapod, spider, snail, crustacean, lizard, bird,
  bat, tortoise) that sets the prey window, movement and the sprite family.
- **Arrival requirements become food flows in grams** (fruit bats come when the island makes enough fruit). That
  keeps "the sim decides".
- **Ghost ancestors:** an arrival hangs under its real parent, drawn greyed when you haven't played it (Pigeons
  under Birds under Reptiles). The tree stays true without making you play every step. The deep-time road (your
  28 Oct wish) can fill the ghosts in later.

### Founding: what pays for a new species ("funding")

I read "funding" as founding and what pays for it. Today: a biomass cost per tree node (20 → 5 000) and per
clade for splits; after 12b, most new lines come from runs. Options:
- **f1. Founders' grams (recommended):** a founding costs the founders' body mass × a factor, plus a door's
  one-off cost. A moss patch is cheap; a pair of giant tortoises costs 400 kg × the factor. One rule across eight
  orders of magnitude, and it reads honestly in grams.
- **f2. Tiers:** a cost per clade tier, as today, tuned by hand.
- **f3. Guild resources** (P29 c, later): higher doors also ask for what a guild makes: nitrogen fixed, litter
  recycled, seeds carried, prey caught. It ties funding to the food web. Not before 12a.

## 4. The catalogue

Each line is a clade or a form, with a real model. Mass is live mass per animal, or dry mass per m² for plants.
**Way:** ⇢ arrival, → door, ⊕ partnership, ◇ form. Era as in game shape §4, extended in §6.

### Plants

| Name | Real model | Mass | Way | Era | Note |
| --- | --- | --- | --- | --- | --- |
| Cyanobacteria, Early land plants, Liverworts, Mosses, Club mosses, Ferns | (built) | 50–200 g/m² | — | 1 | |
| Lava ferns | *Sadleria* ('ama'u, Hawaii) | 300 g/m² | ◇ of ferns | 1–2 | A fern that pioneers young lava |
| Horsetails | *Equisetum* | 200 g/m² | → from ferns' line | 2 | Wet ground; optional |
| **Beach seed plants** | sea sandwort, sea rocket, lyme grass (Surtsey's first) | 100–300 g/m² | ⇢ beach | 2 | The first seeds, by sea drift (P19) |
| Grasses | lyme grass, island grasses | 300 g/m² | → from flowering plants | 2–3 | Grazer food; the gull colony feeds them |
| **Tree ferns** | *Cibotium* (hāpu'u), *Cyathea* | 5 kg/m² | → from ferns (a trunk) | **2** | **The first trees, no seeds needed** |
| Seed plants → Conifers | Canary Island pine, junipers | 10–20 kg/m² | → | 2 | Pines take young ash and survive fire |
| Heath shrubs | crowberry, heather | 1 kg/m² | → from flowering plants | 2–3 | Windy, poor ground |
| Berry shrubs | *Vaccinium* ('ōhelo, on Hawaiian lava) | 1 kg/m² | ◇ fruit | 3 | Berries for geese and birds |
| **Pioneer trees** | *Metrosideros* ('ōhi'a lehua) | 10–30 kg/m² | ⇢ wind (tiny seeds) | 3 | THE lava tree in Hawaii; very variable; bird-pollinated |
| Fixer trees | *Casuarina* (Krakatau's beaches), koa | 10–20 kg/m² | ⇢ beach / ⊕ fixer bacteria | 3 | Make nitrogen; Casuarina was an early Krakatau tree |
| Fig trees | *Ficus* | 20 kg/m² | ⇢ in a bird or bat | 3 | Keystone fruit; ⊕ fig wasps |
| Beach trees | *Pandanus*, coconut, *Barringtonia* | 10 kg/m² | ⇢ sea drift | 3 | Floating seeds; crabs |
| Laurel forest | laurels (Canaries, Azores) | 20–40 kg/m² | → | 3–4 | Cloud forest; pigeons |
| **Woody herbs** | silverswords, Canary *Echium* | 1–10 kg/m² | ◇ Woody on any herb | 3 | Island woodiness |

### Fungi

| Name | Real model | Way | Era | Note |
| --- | --- | --- | --- | --- |
| Soil fungi, Lichens | (built) | — | 1 | |
| Sac fungi \| Mushrooms | Ascomycota \| Basidiomycota | → sisters | 2 | P19 |
| Mycorrhiza | arbuscular fungi + vascular plants | ⊕ | 2 | Plants need less nitrogen and water |
| **White rot** | wood-rotting mushrooms | → (lignin enzymes) | 2–3 | The only thing that breaks wood down |

### Animals, by ring

**Ring 0 (built):** springtails, bristletails, land snails, slugs, ground beetles.

**Ring 1, shore and windfall** (no plants needed; how real new islands start):

| Name | Real model | Mass | Eats | Way | Note |
| --- | --- | --- | --- | --- | --- |
| Beach hoppers | sandhoppers (Talitridae) | 20 mg | wrack | ⇢ beach | Crustaceans; feed the shore web |
| Kelp flies | Coelopidae | 5 mg | wrack | ⇢ beach | Swarms on rotting seaweed |
| Midges | Chironomidae | 1 mg | cyano in springs | ⇢ wind | Surtsey's first insect (1964) |
| Lava crickets | *Caconemobius* (Hawaii) | 50 mg | windfall | ⇢ wind | Live on bare new lava |
| Wolf spiders | Lycosidae | 0.2 g | small prey | ⇢ ballooning | First hunters on fresh lava |
| Mites | Oribatida | 0.01 mg | fungus, litter | ⇢ wind, riding on beetles | Huge numbers |
| Pseudoscorpions | — | 0.5 mg | springtails, mites | ⇢ riding on flies | They hitchhike: real |

**Ring 2, soil and litter:**

| Name | Real model | Mass | Eats | Way | Note |
| --- | --- | --- | --- | --- | --- |
| Woodlice | Oniscidea | 50 mg | litter, fungus | ⇢ drift log | Land crustaceans |
| Millipedes | — | 0.3 g | litter, soft wood | ⇢ drift log | Chemical defence: hard to eat |
| Centipedes | *Lithobius* → *Scolopendra* | 50 mg → 20 g | small prey | ⇢ drift, ◇ Giant | A hunter that can grow big |
| Ants | a colony as one group | 2 mg each | prey, seeds, honeydew | ⇢ flying queen | Omnivores; ⊕ aphids |
| Fungus gnats | Sciaridae | 1 mg | fungi | ⇢ wind | |
| Termites | (cockroach line) | 5 mg | wood | → | Era 3; wood eaters |

**Ring 3, herb layer:**

| Name | Real model | Mass | Eats | Way | Note |
| --- | --- | --- | --- | --- | --- |
| Crickets, grasshoppers | Orthoptera | 0.5 g | herbs, grass | ⇢ flying | Main herb grazers |
| Moths | caterpillars and adults | 0.2 g | leaves; nectar | ⇢ wind | Two foods in one life |
| Aphids | Aphidoidea | 0.5 mg | sap (herb, shrub) | ⇢ wind | Ant farms |
| Ladybirds | Coccinellidae | 30 mg | aphids | ⇢ wind | Warning colours |
| Orb weavers | Araneidae, *Tetragnatha* | 0.2 g | flying insects | ⇢ ballooning | *Tetragnatha* radiated in Hawaii |

**Ring 4, flowers and fruit** (needs flowering plants):

| Name | Real model | Mass | Eats | Way | Note |
| --- | --- | --- | --- | --- | --- |
| Bees | solitary bees first | 0.1 g | nectar, pollen | ⊕ flowering plant + insect | P19 b |
| Butterflies | — | 0.3 g | nectar; leaves as caterpillars | ⇢ wind | |
| Fruit flies | *Drosophila* | 1 mg | rotting fruit, fungi | ⇢ wind | ~1 000 Hawaiian species: a radiation showcase |
| Fig wasps | Agaonidae | 1 mg | inside figs | ⊕ with fig trees | Each needs the other |

**Ring 5, small vertebrates:**

| Name | Real model | Mass | Eats | Way | Note |
| --- | --- | --- | --- | --- | --- |
| Geckos | mourning gecko | 3–10 g | insects | ⇢ drift log | Eggs survive sea water; some need no male |
| Skinks | — | 10–30 g | insects, snails, fruit | ⇢ drift log | Krakatau |
| Wagtails, pipits | — | 20 g | shore and ground insects | ⇢ flying | Surtsey: they followed the insects |
| Finches | Darwin's finches | 20 g | seeds | ⇢ flying | A Beak gene; a radiation |
| Nectar birds | honeycreepers (from a finch) | 10–20 g | nectar, insects | → from finches | Pollinate 'ōhi'a |
| Insect bats | — | 10 g | flying insects at night | ⇢ flying | Often the only native mammals on remote islands |

**Ring 6, giants and apex hunters:**

| Name | Real model | Mass | Eats | Way | Note |
| --- | --- | --- | --- | --- | --- |
| **Seabird colony** | gulls, shearwaters | 0.4–1 kg | fish (outside), eggs, carrion | ⇢ cliffs, once there's cover | Engineer: guano, burrows, seeds (Surtsey 1985) |
| Land crabs → **robber crab** | *Gecarcoidea* → *Birgus* | 0.3 → 4 kg | fruit, seedlings, carrion | ⇢ larvae from the sea | Biggest land arthropod; eats seedlings, shapes forests |
| Pigeons → **island giant** | Nicobar pigeon → dodo | 0.3 → 13 kg | fruit, seeds | ⇢ flying, ◇ Flightless + Giant | The island rule's icon |
| Rails → flightless rail | many islands | 0.1–0.3 kg | insects, snails, seeds | ⇢ flying, ◇ Flightless | Happened dozens of times |
| Geese → island goose | nēnē | 2 kg | grass, berries | ⇢ flying | Walks on lava; eats 'ōhelo |
| Fruit bats | flying foxes | 0.5–1 kg | fruit, nectar | ⇢ flying | Carry seeds far; pollinate |
| Tortoises → **giant tortoise** | Aldabra, Galápagos | 5 → 250 kg | grass, shrubs, fruit | ⇢ floating, ◇ Giant | Engineer: grazes lawns, opens forest |
| Iguanas | green iguana | 1–5 kg | leaves, fruit | ⇢ rafting | Real raft arrival after a hurricane (Anguilla, 1995) |
| Owls | barn owl, short-eared owl | 0.4 kg | birds, bats, lizards, big insects | ⇢ flying | Apex for a small island |
| Falcons | — | 0.5–1 kg | birds, lizards | ⇢ flying | |
| Monitors → **island dragon** | Komodo dragon | 5 → 70 kg | anything, carrion | ⇢ swimming | Needs a big island (era 4) |
| Seals | fur seals | 50–200 kg | fish (outside) | ⇢ beach | Bring sea nitrogen ashore |

**Invaders (events in slice 14, not playable):** rats (eggs, seeds, snails: the real island disaster), goats
(strip shrubs), cats, crazy ants, mosquitoes with bird malaria (Hawaii). Real pushback with a clear story.

**Left out:** earthworms (your call: clutter), land mammals besides bats (they rarely reach islands), amphibians
(salt water kills them), the sea line (later, P19).

## 5. The web at a glance

```
sea wrack ─► beach hoppers, kelp flies ───────────► wolf spiders, wagtails, crabs
windfall ──► lava crickets ───────────────────────► wolf spiders
crusts, moss ► snails, slugs, bristletails ───────► beetles, centipedes ─► skinks, rails ─► owls, falcons
litter ────► springtails, mites, woodlice ────────► pseudoscorpions, spiders, beetles
fungi ─────► springtails, fungus gnats
herbs, grass ► crickets, caterpillars, aphids(⊕ants) ► orb weavers, ladybirds, wagtails, geckos
canopy leaves ► caterpillars, tortoises, iguanas
fruit, seeds ► pigeons, finches, fruit bats, crabs ──(carry seeds: F6)
nectar ────► bees, moths, nectar birds ─────────────(pollinate: F6)
wood ──────► white rot, termites
fish (sea) ► seabirds, seals ──► guano: nitrogen
dead things ► litter (crabs, gulls, beetles scavenge)
```
Many hunters eat across several rows (omnivory). That is what keeps real webs stable, so it's a good default.

## 6. Eras and rings

| Era | Plants and fungi | Animals | Capstone |
| --- | --- | --- | --- |
| **1. Pioneers** (now) | crusts, liverworts, mosses, lichens, fungi, club mosses | ring 0, ring 1 (shore, windfall) | Vascular plants |
| **2. First forest** | ferns, tree ferns, beach seed plants, conifers, mycorrhiza, white rot | ring 2, seabird colony | A forest of a few tonnes |
| **3. Flowers and fruit** | flowering trees, figs, shrubs, grasses, woody herbs | rings 3–5, crabs, fruit bats | Seeds carried by animals across the island |
| **4. Giants** | laurel forest | ring 6 forms (flightless, giant), apex hunters | An island giant; needs a bigger island (an eruption adds land) |

**On island size:** 96×56 tiles of 10 m is ~50 ha, of which ~30 is land. That holds tortoises and geese well, a
handful of owls, and no dragon. That's the island rule at work: on small islands the giants are plant eaters and
the hunters stay small. A bigger home island (game shape §8, later) is what lets the big hunters in.

## 7. Order: three options

| | A. Web first | B. Runs first | **C. One structure slice, then runs (recommended)** |
| --- | --- | --- | --- |
| Order | 11d C → 11e food web → 11f trees + geology → 12a → 12b | 11d C → 12a → 12b → 13 … food web later | 11d C → **11e food types and the first trees** → 12a → 12b → a ring rides along with each later slice |
| Good | The fullest island before runs; balance the structure once | The active part comes soonest (your 28 Oct priority) | Runs get locals and new slots to aim at; content after that is mostly data |
| Cost | Runs wait two more slices | Runs on five animals feel thin, and the food-web rework lands on top of the run code | Runs wait one slice |

**11e in option C** (one slice, kept small):
- F1 (fruit, wood, wrack, windfall), F2 (size windows), F3 (body-size defaults), F5 (roles by food).
- F4 with **two trees:** tree ferns (a door from ferns) and one pioneer tree arrival ('ōhi'a or Casuarina).
- Ring 1 as data (beach hoppers, kelp flies, lava crickets, wolf spiders), plus the springtail refound bug.
- Not in it: F6 seed carrying (with fruit eaters, later), geology (its own spec, before or beside 11e), genome
  v2 forms (slice 15).

**Then:** 13 adds ring 2 and seabirds (helpers), 14 adds rings 3–4 with seasons, fruit and pollination
(F6), 15 adds the Size and Diet axes and forms, which open ring 5–6's island giants.

## 8. Risks (honest)

- **Balance:** every ring adds feedback loops. One ring per slice, each checked with the 5-seed runner.
  Generalists, omnivores and refuges steady a web; specialist hunters make it swing (which you want, a little).
- **Forest everywhere:** without soil limits, geology and disturbance, trees win every tile. Geology matters more
  once trees exist.
- **Content cost:** each animal is data, a sprite, a blurb and a fact check. Sprites by body-plan family with
  parameters (size, colour, legs, shell) keep it cheap; the researcher checks facts in batches.
- **Clutter:** forty species can't all walk on the map. The view shows a few per tile, biggest first (P27 e).
- **Small numbers:** 1:1 big animals (five owls) die out by chance. Repeat arrivals cover it, and that's real.
- **Real numbers invite checks:** the masses are order-of-magnitude; say so in the codex.
- **Imports break the closed ledger:** wrack, windfall and fish need their own line, or the books stop balancing.

## 9. Questions for you

1. **Climate of the home island.** Cold Atlantic like Surtsey (few or no trees for decades), mild Atlantic like
   the Azores and Canaries (laurel forest, pines), subtropical Pacific like Hawaii and Galápagos ('ōhi'a, tree
   ferns, crabs, tortoises, fruit bats), or a subtropical home with run islands that vary? *AI lean: subtropical home,
   varied run islands*; Hawaii and Galápagos are the classic evolution-on-volcanic-islands stories.
2. **How big, and when?** Up to ~1 kg (gulls, crabs, geese) in eras 2–3, with the 10–250 kg giants as era 4
   capstones on a grown island? Or giants sooner?
3. **Mammals:** bats only (real), with rats and goats as invader events?
4. **Hunting by body size** instead of named prey (F2): yes?
5. **Trees:** one canopy stratum with a Shrub/Tree height gene, or separate shrub and tree strata? On the loadout, a
   seventh frame (Canopy), or "Tall plants" in place of Herb?
6. **Outside inputs** (sea wrack, windfall, fish through seabirds): yes? They bring the shore and bare lava alive
   early, at the cost of an imports line.
7. **Wild splits by isolation:** yes, as a headline you can adopt?
8. **Founding cost from the founders' grams (f1)**, tiers (f2), or guild resources later (f3)?
9. **Order:** A, B or C?
