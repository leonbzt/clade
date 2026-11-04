# Status

Updated 2026-11-03. Branch `v2` on GitHub (`leonbzt/clade`, public); v1 is on `slice-11e` and in `_v1/`.
**Cloud sessions:** `npm ci` first; the user's working preferences are in [workflow.md](workflow.md) (end).

**Milestone:** M1, part 2, step 3: the stand (part 1a built and played) → **3b. the core-play toys** (specced,
not built) → 4. variants in the garden → part B, map.

## Done (this session)
- **Stand part 1a** (slice 03): 3 saplings live on one plot, the light grid (`src/sim/run/light.ts`), steering by
  targets (`src/sim/run/verbs.ts`, `src/ui/aim.ts`), hunt hints, the run in 2D low-poly (`src/view/flat.ts`,
  `bodies.ts`, `side.ts`, palette in `src/data/palette.ts`), Pixelify and calm menus (`src/ui/Run.svelte`,
  `app.css`). Pulses, the brood and auto removed. Bodies are rasterised into palette-index layers: a compose takes
  about 8 ms (was 24).
- Played: [playtests/04-stand.md](playtests/04-stand.md). Pixel-font sampler: `toys/fonts.html`.
- P44 (the run's core play) and its spec: [slices/04-core-toys.md](slices/04-core-toys.md), on ROADMAP step 3b.

## Decided (3 Nov)
- The sun is fixed per plot. Toys for (a) turn-based growth on the plot, (b) a patch strategy map, (c1 + c2) a body
  builder scored by balance, "to really feel out possible game". Part 1b: you lean to pausing it.

## Next
1. Answer slice 04's three questions (pause 1b: AI agrees, time-boxed; B a season per turn; C scored by the real
   niche weights).
2. Build slice 04 part 1: toys A (`toys/turns.html`) and C (`toys/body.html`); then part 2: B (`toys/patchmap.html`).
3. Play them; notes in `docs/playtests/05-core-toys.md`; then the call on P44.

## Open
- P44's questions; P42 (when to switch the stack); P38 (the garden).
- The stand, if it stays: flashing (suspects in playtest 04), the outline, the herb filling the view in year 1
  (about 1,700 parts), moss damp cracks, the island start text, spec questions 1–2 (sowing, mutations).
- `npm run check`: types pass; the 8 h offline test is flaky (passes, or 525–567 ms vs 500); 8.6 s total.
