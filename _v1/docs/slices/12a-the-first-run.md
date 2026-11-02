# Slice 12a: The first run

**Calls settled 1 Nov** (below). Parts A and B are ready to build once 11e is merged. Part C (animal lineages) gets
its own spec after A and B have been played.

**Milestone:** M1, step 2 (from `ROADMAP.md`)
**Question:** does a run feel like a character's adventure: one line on a young island, shaped season by season
through its broods, coming back changed and a level up?
**Builds on:** decisions.md, 28–29 Oct (P24): lineages and runs on a separate young island; you liked broods and
keys; the whole adapted line comes home; lineages level up from runs; the first run after about 10 minutes. 1 Nov:
run islands vary; a year ≈ 8 min, the clock after slice 12; no split-and-place by the player; P33 c after the core
loop. 1 Nov, the 12a calls: no player splits on runs; wet and dry seasons; the first lineage is a plant, animals in
part C. The plan: [design/game-shape.md](../design/game-shape.md) §2, an AI plan, not decided.

**Labels:** every line under In is a *proposal* (mostly game-shape §2) unless it says *decided*.
**Sim freeze** (from the end of 11e): 12a adds run and meta structure on today's engine. Its one ecology change,
the season swing on run islands, has your OK (1 Nov).

Three parts, in order, about one session each. C waits until A and B have been played.

## In
**Part A: the island and the run's frame**
- **One generator:** `createState(seed, { size, theme })`. Size sets the map (home 96×56; run islands small, ~48×28,
  or medium, ~64×36). A theme is a data row (`src/data/islands.ts`) of multipliers on today's knobs: rain, crack
  share, landmark counts. Home is the `home` row with today's numbers, so home doesn't change. *Decided (28–29 Oct):
  random or small islands to start; (1 Nov): run islands vary.*
- **Two themes for M1:** *dry* (half the rain, one spring at most, more cracks) and *wet* (more rain, three or four
  springs). Both young: bare lava, no soil yet.
- **Starting a run:** a Run button on the lineage card that costs Biomass, priced so it's affordable at ~10 min
  (*decided 29 Oct:* the first run after about 10 minutes). Two offers, one per theme, each with its size and a
  one-line hint ("dry: little rain, cracked lava").
- **The founder** (*decided 1 Nov, route B*): any living species of the line, or a find at home (a shown variant).
  Landing splits the line from its parent, which stays home ([evolution](../design/evolution.md) §4). To settle at
  build: whose requirements a door checks on a run island (home's or the island's).
- **Landing:** you place the founder (the lineage's current form, a founding patch as today). On a plant run only
  the line lives there: no locals, no arrivals. Spore rain, mutation and keys run as today.
- **Seasons as the clock:** four a year, so a season ≈ 2 min. A season bar in the top bar. A run is 8 seasons
  (~16 min). Headline timings, tuned by feel.
- **Wet and dry seasons** (*decided 1 Nov*, OK'd under the freeze): each season sets the run island's moisture to
  its base × one multiplier, run islands only. Wet ×1.3, mild ×1, dry ×0.7, mild ×1 (numbers by feel). Fit
  follows at once: a dry season thins the edge tiles, and a wet one is the time to place an heir. The season bar
  names the season.
- **The end, three ways:** the clock runs out; "Bring it home" after 4 seasons; the line dies (no tiles). The
  leading variant (most tiles) becomes the lineage's form; its shown variants are listed on the card for 12b. If the
  line died, the lineage keeps its old form and the XP so far.
- **Home waits** (paused; one live sim). The view shows the island you're on, without the slot board.

**Part B: broods, the heir and the lineage card**
- **A brood of three each season** from the line's leading variant, in words, with a tier:
  - *Steady:* one axis step that raises its fit where the line holds most tiles. Never a loss.
  - *Cross:* one gene from a shown variant of the line within reach (a second Steady if there's none).
  - *Wild:* two of today's mutation rolls. May cut fit somewhere; may roll a higher tier.
- **The heir's spot:** pick a card, then a tile within reach (8 tiles of the line). While you hover, the map shows
  fit as good / okay / poor with a one-line reason ("drier than it likes"). It founds a patch as today, free. An
  unpicked brood waits; the next season's replaces it.
- **Splits on the run** (*decided 1 Nov*): none by the player, so the line comes home whole (12b). Home keeps
  today's split until 12b. Keys roll by themselves as today. When one fires on the run, the new species becomes the
  line: its form is the one that comes home, and it's worth a big step of XP.
- **The lineage card** (*decided 29 Oct:* one lineage at the start; *1 Nov:* it's a plant, since fungi and animals
  need plants, and fungi aren't offered: the lichen has to evolve). The plant is your pioneer, the first species at
  the vent. The card shows a name, its class (the clade, from the tree), its current form in gene words, a level
  with an XP bar, one line per run (theme, seasons, how it ended).
- **XP:** from heirs that settle (still holding tiles a season later), the best fit reached, new shown variants and
  keys. Numbers in `src/data`, a simple curve: level 2 by the end of the first full run. Level 2 gives one perk, a
  fourth brood card (a second Wild). If you'd rather keep the level bare until a playtest asks, say so.
- **Headless:** `npm run sim` gets a run line: the bot (a ruler) plays 8 seasons per theme, always Steady at the
  best-fit spot, and prints seasons lived, best fit and XP.

**Part C: animal lineages** (*decided 1 Nov:* after A and B have been played; its own spec then)
- An animal run lands on an island with **wild plants** (a set per theme from today's plant species) and **two
  helper species you pick** to bring along at the start (*decided 1 Nov*).
- Open until C's spec: which animals can be a lineage and when it unlocks; the heir as a group placed at a spot;
  what the helpers can be; the bot's line for animals. **Scope flag:** M2 (slice 13) holds "a second lineage,
  helpers". An animal lineage next to the plant is a second lineage, so at C's spec we either take that part of M2
  into M1 or move C to slice 13.

## Out
- Coming home as a species, release with the forecast, a slot won, held slots paying, a target slot: 12b (step 3).
- Saves, banked time, home running during a run, runs over days: M2 (slice 13). Helpers on plant runs and a second
  lineage too, except what part C needs.
- Blooms, seeds, events, the nursery: M3 (slice 14). Evolution points (rerolls, nudges): ideas.md.
- Locals on plant runs: the line is alone. Wild plants come with part C, for animal runs. Risk: alone, a plant line
  only meets the theme and the seasons; if plant runs play too easy, the same wild set is the first thing to add.
- Fungus lineages: the lichen has to evolve first (*decided 1 Nov*); later.
- More themes (salt, ash, caves), the archipelago map, outposts: after M1 (ideas.md, to add at handoff).
- Lineage stats and abilities, forms, morphs, the codex: M4 (genome v2).
- New ways species are made (P33 c's routes): after the core loop (*confirmed 1 Nov*).
- The three-tempo clock: after slice 12 (*decided 1 Nov*). Seasons count on today's tick.

## Done when
- [ ] A: from a fresh start the Run button is affordable at ~10 min. You pick dry or wet, land, watch 8 seasons, and
  end it by the clock, by your call after 4, or by the line dying. The season bar shows wet and dry, and a dry
  season visibly thins the edges. Back home, nothing moved while you were away.
- [ ] B: each season shows three distinct cards in words; hovering a spot shows fit and a reason; the heir settles
  where you put it. The card shows the new form, the level and the run line. A second run on the other theme starts
  from that form and plays differently.
- [ ] C: its own spec and done-when, written after A and B have been played.
- [ ] Home unchanged: a test checks that `createState(seed)` for home builds the same island as before (a hash).
- [ ] `npm run check` passes; `npm run sim` 5/5 seeds; the bot's line lives through 8 seasons on both themes on
  ≥ 4/5 seeds (the theme and the dry seasons push, they don't kill).
- [ ] Your playtest notes are in `docs/playtests/12a-the-first-run.md`: does it feel like a character's adventure?
  Do the three cards make a real choice? Do the theme and the seasons push the line somewhere you can see?

## Size check
- New systems: one for A and B, the run (a second island on today's engine, its season clock, broods and end). The
  generator's knobs and the lineage card ride with it. C adds animal heirs, wild plants and helpers.
- Touches sim structure? The generator takes size and theme (home's output unchanged, by test); the ecology rules
  don't change. The season swing scales run islands' moisture: a sim change you OK'd on 1 Nov.
- Three parts, about one session each. The biggest slice since 11.

## Calls (decided 1 Nov)
1. **Splits on the run:** none by the player; variants and keys as today; the line comes home whole. This confirms
   P33 c (how species are made) for after the core loop.
2. **What a season does:** a wet/dry swing of the run island's moisture, run islands only. No bloom window (M3).
3. **Who the lineage is:** you start with a plant on land, since fungi and animals need plants. No lichen at the
   start: it has to evolve. Animal lineages come in part C, on islands with wild plants and two helper species you
   pick.

## Build notes: A and B (1 Nov, AI fill-ins to check in the playtest)
All *proposals* until you play them. Code: `src/data/islands.ts` (numbers), `src/sim/lineage.ts`, `run.ts`,
`brood.ts`, `placing.ts`; UI `LineagePanel`, `RunPanel`, `RunModals`, the season bar in `TopBar`.
- **Doors on a run check home's requirements** (copied at landing; the key still has to grow on the island). No
  nudges on runs. A door home already reached still fires on a run: the line becomes a new species of that clade.
- **Smaller islands get fewer landmarks, by area** (at least one each). Without it a small island was wetter than
  home. Dry: one vent, a spring at most, half the rain, twice the cracks. Wet: 1.5× rain, three or four springs.
  A small dry island is still about as wet as home's open lava (one vent covers much of it); medium dry is drier.
- **The floor protects the line only in the landing season**, so a flare at landing can't end the run; after that
  the line can die.
- **Price:** 14 t of biomass for the first run (home has ~15 t at 10 min), ×1.5 per run made.
- **Founders:** the lineage's form, each living line species at home (thallus and its descendants), and their other
  shown variants. Landing makes the founder the run's own species (its genome the base). Name: "<first vent> line".
- **XP:** heir settled 10, new shown variant 5, key 60, best fit 100 × the best share of the island's land the line
  held at good fit. Level 2 at 100 XP, then ×1.6 per level. The bot gets 104–194 XP from its first run (sim, 5
  seeds): level 2 on every seed, but only just on the dry run.
- **Brood words** come from the profile change (needs, salt, grow/spread/hold/life ±%), plus the fit change where
  the line lives. Steady scores the line plus a 3-tile ring. Wild skips rolls that would carry a key.
- **Ending by the clock or "Bring it home"** both keep the form; heirs placed in the last season count if they hold.
- Dev: `?bot=600&run=0` starts a run on offer 0 (price paid), `&runbot=300` lets the run bot play.
