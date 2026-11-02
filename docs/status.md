# Status

Updated 2026-11-02. **v2, the rebuild. Milestone: M0 (the toy, then the spec) · step 1, the toy.** Branch `v2` on
GitHub (`leonbzt/clade`, public); v1 is on `slice-11e` and in `_v1/`.

## Done
- The grow toy, rebuilt to the spec (`docs/slices/00-grow-toy.md`): `toys/grow.html` with `grow-data.ts` (genes,
  habitats, targets, tuning), `grow-world.ts` (hidden soil, neighbours, light), `grow-sim.ts` (plant, 3 stocks,
  stats, score), `grow-verbs.ts` (wake, cut, dig, brood, prediction), `grow-view.ts` (canvas), `grow.ts` (run, HUD).
- Your first playtest (of the first build, made without the spec): `docs/playtests/00-grow-toy.md`.
- The root page redirects to `/toys/` until M1. `npm run check` passes (~5 s).

## Decided (2 Nov)
- The spec's questions: seeds land on different spots (in); nutrient is the only currency for the verbs (yes).
- Rebuild the toy to the spec; longer generations (90 s seasons); the habitat shaped by neighbours and habitat type.

## Next
1. Play the rebuilt toy: all 3 habitats, verbs on and off. Add your notes to `docs/playtests/00-grow-toy.md`
   (enough decisions? heirs different? is the habitat a real choice?).
2. Tune by feel in `toys/grow-data.ts` (`T`, `HABITATS`, `TARGETS`, `TIERS`), then tick step 1 in `ROADMAP.md`.
3. Step 2: the one-page spec (`docs/spec.md`), from rebuild.md, tastes.md and the playtest.

## Open
- The habitat details (3 habitats, neighbours that shade, grow and drain) are AI's: keep, change or cut?
- Balance is a first pass: no-verb seasons score mostly D–B; Low cover is the hardest; water has no cap.
- `main` is still v1's older state; `v2` isn't merged (on your word).
