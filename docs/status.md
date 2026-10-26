# Status

Updated 2026-10-26 (design + build session).

**Core in one line:** place species on the island; they spread, compete and build soil; evolve the next one and
place it while the old ones stay. Placing is the decision; growth is the reward.

## Done
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
1. Play slice 03 (`npm run dev`; ` opens the dev panel) and write `docs/playtests/03-garden-core.md`: does placing
   feel like a decision, does it look good, can you read it?
2. Then the review's next milestones: M2 (relationships as adjacency rules, a disturbance like lava flows) or M3
   (save and offline progress).

## Open
- Is the "On hold" mark on the minigame and first-session bets right? (I set it from your message.)
- `toys/` can be deleted once you're done comparing (the tag `toys-02` keeps them).
- Q5, Q6, Q8–Q11 in the brief. Svelte for menus is unconfirmed. The [M] fact-check in `research/moss-facts.md`.
