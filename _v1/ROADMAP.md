# Roadmap

Where Clade is heading, one milestone at a time. **We build only for the current milestone.** Everything else
waits in [docs/ideas.md](docs/ideas.md). This file changes only on your call; AI may propose edits.

> **Draft (1 Nov), AI, for you to check.** The order (12a → 12b → 13 → 14 → 15) is the one you approved on 29 Oct
> ([game shape §8](docs/design/game-shape.md)). New: grouping it into milestones, M1's "done when", and the sim
> freeze. Three open calls below.

## Now: M1, the first playable

**Goal:** one full turn of the loop you chose. **Start at home → take a line on a run → bring it home → it wins (or
loses) a slot → the slot pays for the next run.** Rough in places, but a real game you can play from a fresh start.

**Done when** (draft):
- From a fresh start you reach your first won slot in about 30–60 minutes, without the dev panel.
- A second run plays differently (another island theme, another form of the line).
- Everything the player has to act on comes with a one-line reason (the forecast).
- You, or a friend playing fresh, want to start a third run.

**Steps**
1. [ ] **Close out the sim (slice 11e).** Commit the P30 pass. 11d part C (animals in grams, the currency in real
   units, swings). Nitrogen by the gram and the rot chain (P32, decided 1 Nov). Small fixes: fewer headlines,
   bristletails on dry crusts, the springtail refound bug. Stem doors and the shade–drought trade-off (P35, decided 1 Nov). Spec: [11e](docs/slices/11e-close-out-the-sim.md).
2. [ ] **12a, the first run.** Spec: [12a](docs/slices/12a-the-first-run.md) (calls settled 1 Nov; parts A and B ready). Islands from one generator (size, theme); one lineage; broods of three and the
   heir's spot; seasons as the run clock; the run's end; a lineage card with XP. No player splits on runs. *Route B
   (decided 1 Nov):* a run starts from any living species of the line or a home find ([evolution](docs/design/evolution.md)). Part C, animal lineages, may pull a second lineage and
   helpers forward from M2 (decided at C's spec).
3. [ ] **12b, coming home.** *Revised 2 Nov:* a run starts from **a home target slot** (adapt to your
   surroundings); the line always comes home as a new species, starting fresh (no merge back, no separate release
   step); it takes the slot or doesn't; held slots pay. Open: the home split, levels ("wait"), the family tree
   inside the tree of life.
4. [ ] **The first-playable pass.** Play M1 end to end from a fresh start. Fix only what blocks or hides the loop:
   the first screen, the start at the vent, knowing what to do next.

**Sim freeze (after step 1 until M1 is played):** bug fixes and tuning only. A new layer, species or sim structure
needs your explicit OK, logged in [docs/decisions.md](docs/decisions.md).

**Open calls for M1**
1. Are this goal and "done when" right?
2. ~~The clock with three tempos~~ *Decided 1 Nov: after slice 12 or later.*
3. ~~How species are made (P33 c)~~ *Decided 1 Nov: route B (runs make species) in 12a/12b, route C with genome v2
   (M4), stem doors. Plan: [evolution](docs/design/evolution.md); open parts: P35.*

## Later milestones (order approved 29 Oct; scope set when we get there)

| Milestone | Builds | Question it answers |
| --- | --- | --- |
| **M2 The loop repeats** | Slice 13: saves, banked away time and fast-forward, a second lineage, helpers | Do short check-ins work? Do lineages help each other? |
| **M3 The moving world** | Slice 14: home seasons with a forecast, blooms, 2–3 events, succession opening roles, the nursery and seeds | Do changes make gifts and challenges? Does timing pay off? |
| **M4 Builds and finds** | Slice 15: genome v2 (stats with upkeep, forms, morphs, diet tags), the codex; the full evolution route C (*decided 1 Nov*: nothing bought, wild species, partnerships, hindsight names) | Are builds distinct, and are finds exciting? |
| **After** | The archipelago and outposts; eras and the island's climax; the food-web expansion (P31); life coming ashore; geology; a bigger island; sharing seeds | Set later |

## Frozen until M1 is played
New species or animals beyond what a run needs · the food-web catalogue and trees (P31) · life coming ashore, cute
animals, bigger islands (P33 e–g) · geology, humus, nitrogen leaking downhill (P30 f–g, P33 b) · borders between
habitats · seasons and the nursery (M3) · genome v2 (M4) · the three-tempo clock (after slice 12) · art passes beyond readability.
All of it is kept in [docs/ideas.md](docs/ideas.md).

## Done: M0, the living island (25 Oct – 1 Nov)
- 01–02: the first loop and three toys (retired).
- 03–06: the garden core, a calm map, the layered sim, landmarks.
- 07–09: variants that evolve by themselves, lineages and the tree of life, splits and keys.
- 10–10b: animals as agents, then as groups; food limits; conserved nitrogen.
- 11 A–C: the wind side, slots, habitats as six-slot loadouts with headlines.
- 11d A–B: habitats as connected pieces (no regions); plants and litter in grams. The P30 rebalance (built, not
  yet committed).

Specs are in [docs/slices/](docs/slices/), your notes in [docs/playtests/](docs/playtests/).
