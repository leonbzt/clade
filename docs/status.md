# Status

Updated 2026-11-03. Branch `v2` on GitHub (`leonbzt/clade`, public); v1 is on `slice-11e` and in `_v1/`.

**Milestone:** M1, part 2: 1. builds part A (played) → 2. the look toy (played: 2D low-poly) → **3. the stand**
(specced, not built) → 4. variants in the garden → part B, map.

## Done (this session)
- P43 (three calls before the spec), then the spec: [slices/03-stand.md](slices/03-stand.md). Part 1: herb and
  moss (two sessions: 1a the stand, light grid, steering, look; 1b years, XP, pips, mutations, sowing, effects).
  Part 2: the tree thins (one session).
- Logged in decisions.md; spec §2 notes the calls; ROADMAP step 3 links the spec; P43 closed in proposals.md.

## Decided (3 Nov, P43)
- **Steering (a), targets:** click a soil cell or a lit gap, and the selected sapling's nearest tip heads there.
  Click a shoot to feed it; cut any time. Pause and 1×/2×/4×; no auto; steering costs the sapling's nutrient.
- **Shape (b):** moss and herb re-found each year (3 saplings, pick one). The tree's 3 stay all run; each winter
  the pips go on one and you may cut one. Herb first; the tree's thinning in part 2.
- **XP (a):** the whole stand's grams that year; about 1–2 pips a year.

## Next
1. Answer the spec's three open questions: sowing (lean: you place the seeds), mutations (lean: a +1/−1 trade with
   a rare free +1), the sun (lean: fixed per plot).
2. Build part 1a: the stand (3 saplings, years on one plot), the light grid, steering by targets, and the run
   drawn in the look toy's 2D low-poly (`toys/look-flat.ts` into `src/view`) with a solid selection outline,
   Pixelify and calm menus. Pulses, the brood and auto go.
3. Then 1b, play, and the notes in `docs/playtests/04-stand.md`.

## Open
- P42: when to switch the stack (AI lean: at the end of M1, after a 1–2 session Godot spike). P38 (the garden).
- `npm run check`: types pass; the 8 h offline test fails again (520–600 ms vs 500); 8.7 s total. Part B item.
- From before: path exclusion and node cost (part B); reading v1's `variants.ts` for the variants slice (taken as
  yes, not confirmed).
- **Nothing committed:** part A's code, the look toy and all docs are uncommitted on `v2`. Commit before building.
