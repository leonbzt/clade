# Status

Updated 2026-10-27 (planning + build session, slice 05).

**Core in one line:** place species on the island; they spread, compete and build soil; evolve the next one and
place it while the old ones stay. Placing is the decision; growth is the reward.

## Done
- **Slice 05 built** (`docs/slices/05-readable-layers.md`, 27 Oct): the sim core is rewritten as a layered sim.
  - Three strata per tile (under ground / ground / herbs), one species each with a cover value.
  - Layers: water, shade (recomputed), soil, nitrogen, litter (stocks that decay), salt (fixed). All visible.
  - Species are data (`src/data/species.ts`): needs as bands, makes as rates. Fit = the lowest need, so every tile
    has one named limit. Layers and strata are data too (`src/data/fields.ts`).
  - Not frozen: lifespans, a seed lottery for open tiles, vent flares. Not collapsed: spore rain, a floor of 5 tiles.
  - **Soil fungi** are a species (decomposers: litter → nitrogen), added as data only.
  - Readable: a placement view (tier, limit mark, outline, best spots), 7 views on keys 1–7, a Tile tab (each
    stratum's fit, limit and last event; each layer with its parts), a species page with need bands, an event feed.
  - Tools: `npm run sim` (5 seeds × 60 min, one table, PASS/FAIL; `LIMITS=1`, `ASCII=herb,soil`, `TABLE=1`).
    5/5 seeds pass: ≥5 of 6 plants alive, no plant over ~53% of its stratum, ~2.8% of tiles change per minute.
- Slice 04 (calm map, early line) and slice 03 (garden core) are in git (tags `slice-04`, `slice-03`).
- 27 Oct planning: layered sim chosen (brief, Direction 27 Oct), P9 in `systems.md`, fresh-eyes proposal in
  `review-layer-sim.md`, research in `research/layer-sim-*.md`.

## Decided
- 26 Oct, in the brief: the garden with several species is the core loop first, and minigames come later. Build on
  the review. 2D for now. Art matters. Traits stay visible. Minigame and first-session bets are on hold.

## Next
1. **You played slice 05** (`docs/playtests/05-layers.md`): more dynamic, but very jumpy; few layers of organisms,
   no canopy; the island feels small; life clusters at the two vents. The AI notes there list likely causes.
2. **Next slice (to spec with you):** calm the dynamics (gradual dieback, longer lives, smoother stocks), a larger
   map at a higher resolution, and water beyond the vents. Then canopy (trees) and the first biomes. Your chunk /
   two-zoom idea (brief, Later) may be how biomes work.
3. Saving and offline progress wait; the dev panel is enough for now.

## Open
- **Game identity and world context** (your note, 27 Oct): how new species arrive on the island, the setting,
  the tone. Keep on the base first. My view: it matters before the art pass and the first itch.io build.
- Pacing got slower in slice 05 (bot: Lichens 4–9 min, Vascular 8–18). Tune by feel after playing.
- Is the "On hold" mark on the minigame and first-session bets right? (I set it from your message.)
- `toys/` can be deleted once you're done comparing (the tag `toys-02` keeps them).
- Q5, Q6, Q8–Q11 in the brief. Svelte for menus is unconfirmed. The [M] fact-check in `research/moss-facts.md`.
