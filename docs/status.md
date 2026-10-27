# Status

Updated 2026-10-27 (planning + build session, slice 05). Git: `slice-05` (e60bbed), then docs (f96c0e8).

## Done
- **Slice 06 built (27 Oct):** calm sim (health with reserves, gradual dieback, slow stores), 96×56 island at 12 px,
  landmarks as data (`src/data/landmarks.ts`, made in `src/sim/island.ts`), salt as a status, 4 layer views, steady UI.
  `npm run sim`: 5/5 pass, flips 1.1%/min (was 2.8), litter swing 10× lower. Nitrogen middle still flat.
- **Planning:** fresh-eyes proposal `docs/review-layer-sim.md`, research `docs/research/layer-sim-{games,ecology,engineering}.md`,
  combined approach as P9 in `docs/systems.md`. Playtest notes: `docs/playtests/04-calm-map.md`, `05-layers.md`.
- **Slice 05 built** (`docs/slices/05-readable-layers.md`): the sim core is a layered sim.
  - Strata under / ground / herbs; layers water, shade, soil, nitrogen, litter, salt (`src/data/fields.ts`).
  - Species as needs/makes data (`src/data/species.ts`); fit = the lowest need; Soil fungi added as data only.
  - Sim: `src/sim/{fit,fields,life,tick,metrics,explain,ascii}.ts`. View: `src/view/overlays.ts` (placement view,
    layer views, zones). UI: `TilePanel.svelte`, `EventFeed.svelte`, new `SpeciesPanel.svelte`.
  - `npm run check` passes (7 tests). `npm run sim`: 5/5 seeds pass (all 6 plants alive at 60 min, top share ~53%,
    ~2.8% of tiles change per minute). Quick check: `SEEDS=1 MIN=30 LIMITS=1 npm run sim`.

## Decided (by you, 27 Oct; in the brief under Direction 27 Oct)
- A layered sim with feedback: readable local rules, every layer visible. You can't influence everything.
- Water (merged with humidity), shade, soil, nitrogen; fungi and litter in slice 05. Readable placement matters.
- Order: layered sim first, then the first biomes (named regions). Build it to grow and stay manageable.

## Next
1. **Play slice 06** (`docs/slices/06-calm-island.md`, built 27 Oct, not committed yet) and judge: calm but alive?
   Bigger island? Nitrogen view readable? Landmarks worth aiming for?
2. Then trees (canopy) and the first biomes; your chunk / two-zoom idea (brief, Later) may shape how biomes work.

## Open
- Game identity and world context: how new species arrive, setting, tone. After the biomes slice, before the art pass.
- Rendering is ugly (placeholder); the Zones view is busy. Pacing is slower than slice 04 (bot: Lichens 4–9 min).
- Ferns stay small (30–80 tiles). The "fern stands break up and return" check is still open.
- Token practice: one slice per session, handoff + /clear between, agents rarely (~70–80k tokens each), short runs.
- Older: "On hold" mark on minigame bets; delete `toys/`?; brief Q5, Q6, Q8–Q11; fact-check the tree facts.
