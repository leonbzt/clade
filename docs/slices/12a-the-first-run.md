# Slice 12a: The first run

**Draft, waiting on your calls** (below). Not started: slice 11e is still being finished.

**Milestone:** M1, step 2 (from `ROADMAP.md`)
**Question:** does a run feel like a character's adventure: one line on a young island, shaped season by season
through its broods, coming back changed and a level up?
**Builds on:** decisions.md, 28–29 Oct (P24): lineages and runs on a separate young island; you liked broods and
keys; the whole adapted line comes home; lineages level up from runs; the first run after about 10 minutes. 1 Nov:
run islands vary; a year ≈ 8 min, the clock after slice 12; no split-and-place by the player; P33 c after the core
loop (your lean). The plan: [design/game-shape.md](../design/game-shape.md) §2, an AI plan, not decided.

**Labels:** every line under In is a *proposal* (mostly game-shape §2) unless it says *decided*.
**Sim freeze** (from the end of 11e): 12a adds run and meta structure on today's engine. The one ecology change on
the table (call 2 b) needs your OK.

Two parts, in order, about one session each.

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
- **Landing:** you place the founder (the lineage's current form, a founding patch as today). Only the line lives
  there: no locals, no arrivals. Spore rain, mutation and keys run as today.
- **Seasons as the clock:** four a year, so a season ≈ 2 min. A season bar in the top bar. A run is 8 seasons
  (~16 min). Headline timings, tuned by feel.
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
- **Splits on the run:** call 1. Keys roll by themselves as today.
- **The lineage card** (*decided 29 Oct:* one lineage at the start): a name, its class (the clade, from the tree),
  its current form in gene words, a level with an XP bar, one line per run (theme, seasons, how it ended).
- **XP:** from heirs that settle (still holding tiles a season later), the best fit reached, new shown variants and
  keys. Numbers in `src/data`, a simple curve: level 2 by the end of the first full run. Level 2 gives one perk, a
  fourth brood card (a second Wild). If you'd rather keep the level bare until a playtest asks, say so.
- **Headless:** `npm run sim` gets a run line: the bot (a ruler) plays 8 seasons per theme, always Steady at the
  best-fit spot, and prints seasons lived, best fit and XP.

## Out
- Coming home as a species, release with the forecast, a slot won, held slots paying, a target slot: 12b (step 3).
- Helpers, a second lineage, saves, banked time, home running during a run, runs over days: M2 (slice 13).
- Blooms, seeds, events, the nursery: M3 (slice 14). Evolution points (rerolls, nudges): ideas.md.
- Locals on run islands (game-shape §9; you: not sure): a later slice. Risk: alone, the line only meets the theme.
  If runs play too easy, a wild set per theme from today's species is the first thing to add.
- More themes (salt, ash, caves), the archipelago map, outposts: after M1 (ideas.md, to add at handoff).
- Lineage stats and abilities, forms, morphs, the codex: M4 (genome v2).
- New ways species are made (P33 c's routes): after the core loop, your lean (proposals.md).
- The three-tempo clock: after slice 12 (*decided 1 Nov*). Seasons count on today's tick.
- Animal lineages (a group as the hero): only if call 3 is c; otherwise later.

## Done when
- [ ] A: from a fresh start the Run button is affordable at ~10 min. You pick dry or wet, land, watch 8 seasons, and
  end it by the clock, by your call after 4, or by the line dying. Back home, nothing moved while you were away.
- [ ] B: each season shows three distinct cards in words; hovering a spot shows fit and a reason; the heir settles
  where you put it. The card shows the new form, the level and the run line. A second run on the other theme starts
  from that form and plays differently.
- [ ] Home unchanged: a test checks that `createState(seed)` for home builds the same island as before (a hash).
- [ ] `npm run check` passes; `npm run sim` 5/5 seeds; the bot's line lives through 8 seasons on both themes on
  ≥ 4/5 seeds (the theme pushes, it doesn't kill).
- [ ] Your playtest notes are in `docs/playtests/12a-the-first-run.md`: does it feel like a character's adventure?
  Do the three cards make a real choice? Does the theme push the line somewhere you can see?

## Size check
- New systems: one, the run (a second island on today's engine, its season clock, broods and end). The generator's
  knobs and the lineage card ride with it. It's the biggest slice since 11, hence two parts.
- Touches sim structure? The generator takes size and theme (home's output unchanged, by test); the ecology rules
  don't change. Call 2 b would add a rain swing on run islands: a sim change, so it needs your OK under the freeze.
- Fits one or two sessions: two parts, about one each.

## Your calls (three)
1. **Splits on the run** (P33 c; roadmap call 3 asks you to confirm here). Your 1 Nov calls say both "no
   split-and-place by the player" and "how species are made: after the core loop".
   a. Today's rules everywhere: you can split a variant into a species on the run island too.
   b. Variants and keys as today; no player splits on the run, so the line comes home whole (12b). Home keeps
   today's split until 12b. **AI lean.**
   c. No player splits anywhere from 12a: species only from keys (P33 c's key route, brought forward).
2. **What a season does.**
   a. A count only: one brood per season; the island never changes, the theme is the whole pressure.
   b. A wet/dry swing: wet seasons raise the run island's rain, dry ones cut it (one multiplier, run islands only),
   so an heir placed in a wet season settles more easily. Needs your OK under the freeze. **AI lean:** without it
   the clock is only a timer.
   c. As b, plus a bloom window (seeds, points). That's M3's blooms; lean no.
3. **Who the lineage is** (vision.md open question 5: always a pioneer plant, or your choice?).
   a. Your pioneer, the first species at the vent, always. **AI lean** for M1: the shortest way into the loop; the
   choice comes with the second lineage (M2).
   b. Any plant species you hold, picked at the first run.
   c. Any species you hold, animals too (the hero is a group; the heir a group placed at the spot).
