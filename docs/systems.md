# Clade — Systems and world (proposals)

**Everything here is a [Proposal]** written by AI on 25 Oct. Nothing is decided until it moves into [brief.md](brief.md).
Each section is short on purpose. Cut freely.

## Your verdicts (25 Oct)

| Section                    | Verdict                          | Your note → AI answer                                                  |
| -------------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| S0 Frame                   | good                             |                                                                        |
| S1 Island                  | good; **chosen** (brief)         |                                                                        |
| S2 Feel moments            | good                             |                                                                        |
| S3 Slots                   | good                             | Unlock slots slowly                                                    |
| S4 Found vs. release       | **C, founder colony** (brief)    | Could the home spot feel meaningless as numbers grow? → S21            |
| S5 Adaptation core         | good start, needs refinement     | Fine for plants                                                        |
| S6 Gene pool screen        | ok, not sure yet                 | Open to changes. Species vs. individual? → S19                         |
| S7 Key innovations         | good                             | How to balance feel and progression? → S21                             |
| S8 Kingdom × guild         | good                             |                                                                        |
| S9 Garden model            | good                             | A richer sim later: what's the payoff? → S20                           |
| S10 Establishment          | not sure, sounds ok              |                                                                        |
| S11 Resources              | good                             |                                                                        |
| S12 Bundles                | sounds good                      |                                                                        |
| S13 Relationships          | **core value** (brief)           | Symbiosis, predation, grazing, pollination need a place → S23, S24     |
| S14 Seasons                | sounds good                      | Species must still specialise; maybe tie seasons to biomes → S23       |
| S15 Tending moments        | maybe                            | Small interactions like this matter (brief)                            |
| S16 Skills                 | sounds good                      | Maybe package skills with genes / diversity / gene pool → S23          |
| S17 Attention → idle       | good                             |                                                                        |
| S18 MVP cut                | ok, open                         |                                                                        |
| Niche pressure (review)    | good                             | Many open niches make filling easy; competing with the incumbent → S22 |
| S19–S23 (answers)          | sounds good                      | Research ideas go to the brief's "Later" list                         |

---

## S0. The frame that ties the audiences together

| Game idea          | In Clade                                   | Who it's for                         |
| ------------------ | ------------------------------------------ | ------------------------------------ |
| Character          | Your **species**                           | RPG crowd                            |
| Class / subclass   | **Guild** / specialisation                 | RPG crowd                            |
| Gear and stats     | **Genes / traits**                         | RPG crowd                            |
| Prestige           | **Release**, then a new species further down the tree | Idle crowd               |
| Farm / town        | **The garden** (the map), which keeps growing          | Cozy / Stardew crowd     |
| Pokédex / museum   | **Tree of life + codex** of real clades, with facts     | Biology crowd           |

**One fantasy:** you raise species the way you raise characters, and the world they build together is your garden.

## S1. World: a young island

- **The setting.** A new volcanic island rising from the sea. Real anchor: Surtsey, Iceland (born 1963), where
  scientists have recorded life arriving step by step.
- **Progression is ecological succession.** Bare rock → pioneers (lichen, moss) → meadow → scrub → woodland.
  Each stage builds soil and opens new niches.
- **Why it fits:**
  - Succession *is* "the ecosystem expands", and it's real textbook ecology.
  - Bare grey → lush green is a strong visual payoff (Terra Nil).
  - An island is garden-sized, not planet-sized.
  - Islands are where adaptive radiation happens (Darwin's finches), so "specialise down a branch" fits.
- **Alternative:** a valley left behind by a retreating glacier, which is also textbook succession. Animals can walk
  in, which makes grazers more natural. Deep-time Earth is a third option, but it's epic in scale rather than a
  garden, and following real order would push grazers very late.

## S2. Design the feel moments first

Before any system, these three moments must feel great, even with fake numbers:

1. **Your species changes visibly** as you adapt it. Genes drive the looks (the Spore lesson).
2. **The release.** You watch it spread across the map (the Plague Inc lesson).
3. **The garden's long change.** Grey rock slowly becomes a living island (the Terra Nil lesson).

## S3. Lineage slots (your parallel species)

- **Start with 1 slot.** Unlock a 2nd and 3rd at milestones; cap around 3–4.
- **Each slot is a run:** one species, its minigame and its build.
- **Release is that slot's prestige.**
  - The species leaves the slot and lives in the garden.
  - The slot resets.
  - You keep skill XP, unlocked tree nodes and genes you've discovered.
  - A **projected gain** is shown before you release, so the timing decision is informed.
- **The next run in that slot** starts from any tree node you've reached, so a deeper start is your "further along
  the branch". You can also start a new run with a released species as the parent (a descendant).
- **The first run:** always a pioneer plant, to teach the loop. You choose from the second slot on.

## S4. Where you found vs. where it lives (the confusing part)

| Option                      | How it works                                                                                                                     | Good                                                                                                   | Bad                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| A. One spot                 | Pick a niche → it shapes the minigame → you adapt → release there                                                                | Very clear                                                                                             | Rigid. If the build fits elsewhere better, you're stuck                 |
| B. Lab                      | Adapt anywhere, then pick where to release from fit scores                                                                       | Flexible; the ecosystem "finds a place" (your first idea)                                             | The map no longer shapes the minigame                                   |
| **C. Founder colony** *(recommended)* | Found at a home: it shapes the minigame and conditions. The gene pool screen shows live fit for *every* known niche. At release the population **disperses** from home, and how far it reaches depends on dispersal traits (wings, burrs, long legs) and how much you spend on the release. | Keeps map ↔ minigame. Lets you pivot to a better niche. Dispersal becomes a strategic trait. Real biology: founder effect → local adaptation → range expansion | One more concept to teach. Needs a clear fit preview                     |
| D. Conditions card          | Pick a biome card (not a map spot) as the minigame's conditions; release into any matching area                                  | Simple and menu-friendly                                                                               | Weaker link to the actual map                                          |

## S5. Adaptation: one shared core plus a kingdom twist

This is how to keep the scope sane.

- **Shared core, the gene pool (all kingdoms).**
  - Your population shows variants each generation.
  - You favour some, the environment pressures others, and traits shift.
  - That's real selection (variation → selection → inheritance), and it works as menu, idle and strategy all at once.
  - Automation = standing selection rules ("always favour drought tolerance").
  - Note: the old prototype had a "selection test" spike. This is mentioned for transparency only; it isn't a reason to pick it.
- **Kingdom twist, the activity minigame.** This is what you *do* to earn genes and XP: plants allocate growth
  (light vs. roots vs. flowers), grazers pick foraging routes, decomposers grow a network.
  - It's hands-on early and automates with skill.
  - **Build one per kingdom, not one per guild.** Guilds vary its rules and numbers.

## S6. The gene pool screen (your idea, given a job)

It's the species' character sheet *and* where decisions happen:

- traits equipped / available, plus mutation offers
- a fit meter for every known niche (this answers "what if it fits elsewhere?")
- how close you are to the next real clade ("1 key innovation from seed plants")
- the lineage line back up the tree

A passive stats screen is a trap. Every visit should hold a decision.

## S7. Tree of life through key innovations

- **Nodes are real clades.** You reach one by evolving its **key innovation** from a lineage that can get there.
  Biologists call these synapomorphies. Examples: vascular tissue → ferns; seeds → seed plants; flowers → flowering plants.
- **Accurate and gamey at once.** Clades are defined by ancestry plus innovations, not by stacking stats, which
  avoids teaching a misconception to biology fans.
- **Off-tree builds are fine.** They become your own "speculative" species, not failures.
- **Each node gives:**
  - a codex entry with real facts
  - a new starting point
  - a permanent bonus
- **Curate about 30–60 nodes for version 1.** The real tree is endless.

## S8. Kingdom × guild

- **The kingdom** decides your ancestry and tree, and which activity minigame you play. A plant can't become a grazer.
- **The guild** decides your role, niches and guild resource. Guilds mix kingdoms, which is also real:
  - decomposers include fungi, bacteria and earthworms
  - pollinators include insects, birds and bats
- **Self-reinforcing kingdoms.** A kingdom skill boosts all its members, and having more species of a kingdom
  gives a kingdom bonus.

## S9. The garden: simulate simply, render richly

- **The model.** Niches are regions. Each niche holds species populations that grow logistically towards a share
  of the niche, and interactions are multipliers between them.
  - It's stable, predictable and cheap offline. Idle games need that.
  - There's no per-plant or per-animal simulation.
- **The visuals** generate individuals from the model (cosmetic).
- **Niches:**
  - **Filling** a niche gives a flat, easy bonus.
  - **Fit quality** gives tiers (bronze / silver / gold, like Stardew crop quality).
  - **Niche mastery** grows over time.
- **Grace period.** While biodiversity is low, nothing can die out. After that, species compete for *share*, not survival.
- **Succession stages** unlock new niche types.
- **Eras** (the garden resets): parked; maybe never.

## S10. Establishment you can play

- After release there's an establishment window. Levers:
  - **dispersal reach** (from traits and what you spend)
  - **companions** (release near helpers: nurse plants, a grazer near grass)
  - a **tending boost** while it establishes
- The result is a fit tier and a population share. It's never a hard failure while the grace period lasts.

## S11. Resources (agreed in principle)

| Resource           | Examples                                                         | What it's for                                                          |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Biomass            | From the whole garden, mostly idle                               | Major steps                                                            |
| Guild resources    | Seeds (plants), fertility (grazers), nectar (flowers), humus (decomposers) | Niches, bundles, boosts. These create cross-guild needs       |
| Genes              | From the active run's activity                                   | Spent in the gene pool; reset at release                               |

## S12. Ecosystem bundles (from Stardew's Community Center)

To unlock a new niche or succession stage, deliver a **bundle**, e.g. "Flowering meadow: 200 nectar + 150 fertility + 3 grass species".

- It's clear and satisfying.
- It forces horizontal play without locking you out.

## S13. Symbioses as relationships

- Species pairs that live together build a **relationship level**, like Stardew's friendship hearts: pollination,
  mycorrhiza, seed dispersal, grazing lawns, guano.
- Each level adds a multiplier and a codex fact.
- It turns "interactions" into something you collect and grow.

## S14. Seasons

- A season cycle runs on accelerated real time.
- Trade-off traits shine in different seasons (e.g. cold-hardy vs. fast summer growth).
- This gives rhythm and pushback without killing anything. Real biology: phenology.

## S15. Tending moments

- The garden throws up small events now and then: a drought, overgrazing, an invasive arrival.
- Handling one gives a boost. Ignoring it costs a little, never a lot.
- This is the "garden you tend" for active players, and optional for idle ones.

## S16. Skills

- **At the start:** one kingdom skill (Photosynthesis) and one general skill (Ecology, which levels with biodiversity).
- **Unlocked later:** guild skills, when you first reach that guild.
- Levels give perks plus **automation unlocks** for that activity minigame.

## S17. Attention → idle curve

- **A new slot or kingdom** needs attention: decisions every minute or two.
- **As skills rise,** automation takes over and timers stretch to hours.
- **Older species** sit in the garden and only need tending moments.

## S18. MVP cut: the first playable version

- **1 slot and 1 kingdom (plants)** with its activity minigame and the gene pool.
- **3 niches, 1 succession stage, about 6 tree nodes.**
- **Biomass + 1 guild resource.**
- **Release → disperse → establish**, with a simple garden view.
- **Save + offline progress + a dev panel** (time skip).
- **Goal:** prove the 3 feel moments (S2) and the release decision.

---

*S19–S23 were added on 25 Oct as answers to your notes. They are proposals too.*

## S19. Species vs. individual

- **The species is the character.** Its gene pool (which traits it has, and how common they are) is its build.
  Evolution acts on populations, so this is also the accurate choice.
- **Individuals show up in three places:**
  - **Variants.** Each generation the gene pool offers a few individuals with new mutations, and you favour some.
    They are the loot drops.
  - **The type specimen.** The species' portrait is one individual drawn from the most common traits, and it changes
    visibly as you adapt (feel moment 1). "Type specimen" is the real taxonomy term.
  - **The garden.** Generated individuals roam (your animal idea). Now and then a rare odd variant appears; you find
    it and tap it for a small reward or a new gene. That's something to look for, and a cheap small interaction (S15).

## S20. The garden model: simple now, a richer sim later?

| Level                            | What it is                                                                                              | Payoff                                                                                                   | Cost                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **1. Shares** (S9, now)          | Each species grows logistically towards its share of a niche; interactions are fixed multipliers       | Always stable; offline progress is one formula; easy to balance; the projected release gain is exact     | It settles, then sits still. Interactions are hand-set, not emergent                                                         |
| **2. Coupled populations** (later) | Same niches and species, but populations affect each other through equations (Lotka–Volterra: competition, grazing, pollination) | Real dynamics: a grazer boom thins the grass, then both recover. Relationships (S13) become real causes. Biology fans get real graphs | Must be tuned so it always settles (each species limits itself more than it limits others: the textbook condition for stable coexistence). Offline needs stepping |
| **3. Individual agents**         | Every plant and animal simulated                                                                        | Emergent stories                                                                                         | Booms and crashes, slow offline progress, phone performance, unbalanceable for idle. Use it only as the cosmetic layer       |

**Advice:** build level 1 behind a tiny interface (`step(dt)`, plus `settle()` for offline progress). Level 2 can then
replace it without touching anything else. After the version 1 playtest, decide whether the garden feels too static.

## S21. Keeping the home spot and key innovations meaningful

The risk: idle numbers grow fast, so a "+20% at home" turns into noise.

- **Two families of numbers:**
  - **Scale** (biomass, guild resources) grows big and idles; prestige multiplies it.
  - **Shape** (traits, fit tiers, innovations, relationships) stays small, is hand-curated, and never inflates.
    Melvor and OSRS cap levels at 99, and that's why each unlock feels big.
  - The choices live in shape, and number-go-up lives in scale. Shape multiplies scale, so gold fit ×2 is still ×2 at any size.
- **Home sets the direction, not the size.** Mutations come up by chance; the home's conditions decide which ones
  spread. On dry lava, drought traits rise by themselves; in a shaded gully, shade traits do. Where you found shapes the build.
- **Home gates innovations.** Each key innovation needs precursor traits plus a pressure the home supplies. So
  "which branch do I want next?" becomes "where do I found?". This links S4 to S7.
- **Each innovation is qualitative:** a visible change, a new rule or action in the minigame, new niche types, and one
  permanent scale multiplier. Never just +x%.
- **Hand-curate the spine.** The order of innovations is designed (like IdleOn's worlds or OSRS quests). The freedom
  is which branch, and when.

## S22. Niche competition: incumbents push back

Your point: with many open niches, filling them is too easy.

- **Few empty niches at a time.** Succession opens a few per stage.
- **An empty niche** gives an easy, flat gain (already in the brief).
- **In an occupied niche** you compete for share with the incumbent, which holds its ground (real: *priority
  effects*, where early arrivals have an edge). To win share you need a better fit, a relationship that helps, or to
  **specialise into a sub-niche** and split it (real: *niche partitioning*, as in Darwin's finches).
- **Your own old species are incumbents too.** Releasing into their niche takes share from them, so "replace my old
  champion or branch out?" becomes a decision.
- This is pushback without death, and it rewards specialising.

## S23. Notes on your notes

- **S13, relationships (very important).** The review cut them from version 1. A cheap way to keep one: a *wild*
  species the island brings (not yours), such as nesting seabirds that fertilise the ground, and your plant builds a
  relationship with it. On Surtsey a gull colony from the mid-1980s brought far more plant cover and species to its area
  (verified in [research](research/progression-games.md); later, grasses took over there, so succession isn't one-way).
- **S14, seasons + biomes.** Seasons hit each biome differently: a mild coast, harsh upland winters, dry lowland
  summers. Specialising for a biome then means specialising for its season pattern, so seasons push specialists, not generalists.
- **S16, skills inside the gene pool.** Skills could be the lineage's **ancestral traits**: deep genes every
  descendant inherits, levelled by use and kept through release. Photosynthesis is a plant ancestral trait; Ecology
  levels with the garden's diversity. Skills then become one row on the gene pool screen, not a separate system.

## S24. Relationships in the core

Your call: relationships matter a lot, but we start basic. Proposal: make them the **edges of the garden model** from
day one, and flesh them out later.

- **In the core:** the garden model (S20, level 1) is species plus edges. An edge is one relationship with one visible
  effect, e.g. "gulls → your moss: nitrogen, ×1.3 growth". No levels, no hearts.
- **Types, in the order the game reaches them:**
  1. **Facilitation** (plant → plant): pioneers build the soil later plants need. That *is* succession (real: the
     facilitation model of succession, Connell & Slatyer 1977). It works with 1 slot and plants only.
  2. **Wild partners:** species the island brings that aren't yours, like nesting seabirds that fertilise the ground
     (Surtsey). This gives an animal relationship early without the art cost of animals.
  3. **Grazing** arrives with grazers, the first animals.
  4. **Pollination and symbiosis** (mycorrhiza) arrive with flowers, pollinators and fungi.
  5. **Predation** comes last: it's the hardest to keep stable (S20, level 2).
- **Version 1 holds types 1 and 2.**
- **Later:** relationship levels (S13 hearts), IdleOn-style cross bonuses, and discovering a relationship as a codex moment.
- **Why it's cheap:** in the level-1 model an edge is one multiplier with a cause label. The cost is content (which
  pairs, which effect), not systems.
- **Bonus link:** the same 1977 paper's "inhibition" model, where early species hold back later ones, is S22's incumbents.


## S25. The first 30 minutes (strawman)

A beat-by-beat draft of one pioneer plant from founding to the second run, plus how session 2 opens (the gulls). It's
in [first-30-min.md](first-30-min.md). Your decisions on it are in the brief (First session); acts 1–4 are slice 01.


## S26. After the slice 01 playtest (26 Oct)

Answers to your notes in [playtests/01-found-to-release.md](playtests/01-found-to-release.md).
- **Picks with a cost:** give most traits a downside, e.g. creeping shoots spread faster but dry out more; denser tufts
  hold water but spread slower. A pick becomes a bet on your home, not a pure upgrade. Cheap: one negative effect each.
- **Fit as a tier list:** show S / A / B / C / D instead of bronze, silver, gold. Only labels and colours change.
- **More hands-on play in the colony:** options to weigh, smallest first. (a) Tap tiles to direct the next spread.
  (b) Collect things that turn up on the patch, like dew before a dry spell or stray spores. (c) A short growing
  minigame at each key innovation, not all the time, so idle play stays idle.
- **Biomass needs a use:** the release pays, but nothing spends biomass yet. Slice 02's soil building is the first
  sink; consider showing it as greyed-out on the release screen so the payoff reads.
- **Split controls:** the three-way slider felt clunky. Option: three presets (Grow, Hold, Seed) plus fine tuning.
