# Planning session: a fresh-eyes view *(prepared 28 Oct, after slice 10b)*

**Goal of the session:** a fresh, critical look at the vision, the current state, the player's part (tasks and
gameplay), the sim layers and organism stats. The output is proposals for the user to decide, not code. This file is
self-contained: open other docs only to check a detail (the pointers are at the end). Rules: the user owns the
design (`brief.md`); AI ideas go to `systems.md` as proposals. Be critical and lean; nothing built is sacred.

## 1. The vision (the user's words, condensed)
- Advance a species: pick a build or class, specialise it, take a role, improve it along the way. It appears on
  the map and stays when you move on, so the ecosystem grows. Long term: a rewarding ecosystem, like a garden.
- **The feeling of growing an ecosystem and growing your species matters most.**
- Audience: idle/RPG players who like nature (TierZoo). Hybrid idle: early systems need attention, later go idle.
  Simple core, strong progression; hand-curated; learn from IdleOn, Melvor, OSRS, Stardew.
- Kept pillars: a young volcanic island, succession; the species is the core unit, one adaptation core for all
  kingdoms; speciation loosely follows the real tree of life; relationships are core; pressure is good; readable
  placement; every layer visible but few shown; calm, slow, big stores; art matters (2D, web, itch.io first).

## 2. What exists (slices 01–10b, 4 days; ~5,400 lines in `src/`)
- **Island:** 96×56 tiles, 10 ticks/s, ~3 ms a tick. Landmarks: vents, springs, beaches, lava tubes. Base water
  is the same everywhere except at landmarks and cracks: **no climate gradient** (no sun, wind or height).
- **Layers:** water, shade (levels); soil, nitrogen, litter (slow stocks); salt as a status. Species read layers
  as need bands and write them (makes). Nitrogen only matters to the herbs (clubmoss, ferns).
- **Plants:** one occupant per tile per stratum (under, ground, herb). Health follows fit, cover follows health;
  spores spread, incumbents hold. Old growth updates every 4 ticks.
- **Animals:** agents as groups (snail families of 12, springtail swarms of 200, troops of 10; beetles single),
  each with its own pace. Diets by stock, plant cover or prey tag (data). Arrivals at landmarks; you adopt them.
- **Food web now:** cyanobacteria fix nitrogen; litter → fungi (release nitrogen) → springtails → beetles; moss
  → snails, slugs; Bitter plants resist grazers.
- **Species model:** a species = a template (clade) + a genome; variants mutate on their own. Genes in three
  layers: axis steps (plants: Dry/Wet, Shade/Sun, Lean/Rich, Wind/Tight; animals: Dry/Wet, Picky/Broad) → combos
  (named niches) → keys (an authored recipe plus a roll opens a clade: Oil bodies, Leafy shoot, Water-carrying
  cells, Shell lost, Insect body). Trait genes with up/down costs (Bitter, Thick shell…). Rarity tiers by
  distance from the clade's base.
- **Tree of life:** Life → Cyanobacteria, Land plants (→ Liverworts, Mosses, Vascular → Ferns), Fungi →
  Lichens, Animals → Hexapods (→ Insects, Beetles), Land snails (→ Slugs). A spindle diagram over time.
- **Player verbs today:** buy a tree node with biomass; place a founder patch (fit heatmap); split a Rare+ variant
  into a new species (you name it; it takes the variant's tiles or groups); open a door when a candidate rolls
  its key; adopt an arrival; follow an animal (its card). Biomass comes from everything alive, automatically.
- **UI:** map with views (layers, variants, animals), species panel (variant rows with gene pips, population
  bars), tile card (layers with their parts), tree screen, event feed, dev panel (time skip, bot).

## 3. What the user said after the latest playtests
- Liked: variants, splits and doors; groups; the calm landscape mix; regions differ; arrivals; the animal card;
  species dying out (good for the feel); founding cost per clade; emergent chains (keep them, tune them).
- **Leanings for the player's part:** your species as a build you level up; a family you follow as the hero;
  maybe build slots; more significant placements; **an activity or minigame, or a hands-on part in selection**;
  reward and progress that are easy to measure; **evolution points** to put into an archetype, or to spend when
  random mutation doesn't bring the combination you want; abilities and skills.
- **Species screen:** TierZoo-style stat cards (a few stats plus unique abilities); the card on the left; filters
  plants / animals / fungi; extinct species only on the tree; a dead ancestor as an era break in the list;
  species that converge merge again.
- **"Overall stats and sim need some rethinking."** Balance is okay for now.

## 4. Problems and tensions to look at
1. **The player is mostly a spectator.** The sim is rich; the decisions are few and mostly about buying unlocks.
   The "growing your species" half (adapting, builds, goals, stakes) has been on hold since 26 Oct.
2. **Relative vs absolute stats.** Rarity and gene pips count from the clade's start, so after a split you lose
   the cumulative picture: you can't see how far a species has come, or that two species from one ancestor have
   become alike. Needs one comparable scale plus deltas (vs parent, vs clade start), and a similarity measure.
3. **Organism stats are scattered.** Plants: seeds, hold, grow, yield, life, reserve, litter, palatable, need
   bands. Animals: speed, upkeep, gain, life, young, escape, range, sight, pace, group, diet. Genes act on these
   through mods. No shared stat model that a player can read, compare or invest in.
4. **Animal niches are thin.** Animal genes are only Dry/Wet and Picky/Broad. **Diet shifts** would make them
   real. A general form (AI sketch): everything edible carries a food tag (litter, fungus, crust, moss, herb,
   tiny-hexapod, snail); a diet is weights over tags; a diet gene moves weight one step along an authored "food
   neighbours" graph (litter ↔ fungus ↔ crust ↔ moss ↔ herb). A line that drifts into an unused food grows fast:
   an emergent niche. The user prefers emergent edges (e.g. snails finding a food slugs don't eat) over special rules.
5. **Contrast between regions** is really important and comes only from landmarks. Proposed simple start: a wind
   side (wet windward coast, dry lee) plus moss keeping its tile wetter (self-reinforcing patches). Later: height,
   disturbance, named regions as a strategic overview (click a region to zoom in).
6. **Complexity budget.** The user wants a network that can grow big, but warns against too much complexity
   (e.g. dormancy). Each system should earn its place in what the player sees or decides.
7. **Idle fit.** Offline catch-up needs a coarse fast-forward. Compute saving is a separate issue from gameplay:
   update only what changes (the user has seen sims that update changing tiles often and stable ones rarely).
   A **Metabolism gene** (fast: more young, quick reactions, high upkeep, short life; slow: the opposite) is
   wanted as gameplay, with the pace following from it.

## 5. Questions for the session (a suggested agenda)
1. **Vision check:** in one sentence each, what is the player's moment-to-moment, session and long-term loop?
   What does the player *do* in a 20-minute session, and what do they look forward to tomorrow?
2. **The player's part:** which of the leanings (build you level up, hero family, slots, evolution points,
   minigame or hands-on selection) form one coherent loop? What's the measurable progress (levels, stats,
   collection, island score, milestones)? How does it stay grounded in the sim?
3. **Organism stats:** one stat model for all kingdoms (a few readable stats + abilities), mapped onto the sim
   numbers; absolute scale vs deltas; how genes, variants and evolution points move stats.
4. **Sim layers:** which layers and links carry the gameplay, which are hidden depth, what to add (contrast,
   diet tags), what to cut or merge. Where do chains (cascades) become player goals?
5. **Order:** what's the next slice that tests the player's part fastest? What can wait?

## 6. Pointers (open only if needed)
| File | Lines | For |
| --- | --- | --- |
| `docs/brief.md` | 192 | All decisions, with dates |
| `docs/systems.md` | ~410 | Proposals P1–P23 (P16–P23 are the recent ones) |
| `docs/review-fresh-eyes.md` | — | The 26 Oct outside view (placement is the decision, growth is the reward) |
| `docs/outline.md` | — | Rough acts outline |
| `docs/playtests/*.md` | short | The user's notes per slice |
| `src/data/species.ts`, `animals.ts`, `genes.ts`, `tree.ts` | 100–200 each | The organism numbers and genes |

Old toys are in `toys/`; `_old/` and `_archive/` stay closed.
