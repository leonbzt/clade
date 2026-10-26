# Status

Updated 2026-10-26 (design + build session, slice 04).

**Core in one line:** place species on the island; they spread, compete and build soil; evolve the next one and
place it while the old ones stay. Placing is the decision; growth is the reward.

## Done
- **Slice 04 built** (`docs/slices/04-calm-map-early-line.md`): ground cover per species (zones read as areas),
  far fewer sprites, zoom and pan (wheel, drag, + / − / Fit), Garden / Zones / Soil views, a working dev panel
  (key left of 1, F2, or the Dev button). The island starts bare. Early line: Cyanobacteria → Land plants →
  Liverworts → Mosses → Fungi → Lichens → Vascular plants → Club mosses / Ferns. Six species coexist in niches.
- **Slice 03, the garden core, is built:** spec `docs/slices/03-garden-core.md`. It replaces the slice 01 code
  (git tag `slice-01`).
  - `src/sim/`: a deterministic cellular automaton with seeded RNG, stats with sources, and commands.
  - `src/view/`: pixel art painted by code (organic coast, soil that browns the lava, sprites that show traits).
  - `src/ui/`: Svelte panels (Tree of life, Species), a pixel font and OSRS-like panels.
  - Wild lichen → Mosses → Vascular plants → Club mosses / Ferns. A fit heatmap S–D while placing.
- `npm run check` passes (5 sim tests, including determinism). `npm run curve`: the greedy bot reaches Ferns at
  ~10 min, and 4 species coexist after 40 min. Screenshots checked in headless Chrome. **Not hand-played yet.**
- Earlier today: the docs reset, toys 1–4 (`toys/`, git tag `toys-02`), the fresh-eyes review
  (`docs/review-fresh-eyes.md`), and your decisions in the brief (Direction, 26 Oct).

## Decided
- 26 Oct, in the brief: the garden with several species is the core loop first, and minigames come later. Build on
  the review. 2D for now. Art matters. Traits stay visible. Minigame and first-session bets are on hold.

## Next
1. Play slice 04 (`npm run dev`) and write `docs/playtests/04-calm-map.md`: is the map calm and readable, and do the
   early unlocks pull you in?
2. Slice 05: early biomes (your call, 26 Oct). Saving and offline progress wait; the dev panel is enough for now.

## Open
- Is the "On hold" mark on the minigame and first-session bets right? (I set it from your message.)
- `toys/` can be deleted once you're done comparing (the tag `toys-02` keeps them).
- Q5, Q6, Q8–Q11 in the brief. Svelte for menus is unconfirmed. The [M] fact-check in `research/moss-facts.md`.
