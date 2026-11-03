# Slice 02: the look toy

**Milestone:** M1, part 2, step 2 (decided 3 Nov, after playtest 02: a look toy first, then the stand)
**Question:** Can a 2D low-res low-poly look read clearly and feel like a real game, or is simple 3D the way?
**Builds on:** playtest 02 (3 Nov): "a low-res low-poly look", the two reference frames, "not sure 2D only… if it
can get the look right that's fine, otherwise simple 3D would be really cool", and the fun of reaching underground
nodes. tastes.md, the look: old-school pixel menus (OSRS, Idle Obelisk Miner), OSRS-like low-res low-poly, Terra Nil,
"without a lot of manual art work". Playtest 01: the map is "pretty unreadable and the colours are ugly, but the
pattern is cool".

## In
- **Files:** `toys/look.html`, `look.ts` (scene, toggles, UI), `look-flat.ts` (2D), `look-3d.ts` (3D),
  `look-data.ts` (palettes, the scene's shapes). A link from `toys/index.html`. No code shared with `src/`.
  The 3D look uses `three` (a new dev dependency; toys were plain canvas until now).
- **One scene, drawn in both looks:**
  - **Above ground:** sky, 3 herb saplings with different shapes and a native shrub. They grow slowly by
    themselves; no steering.
  - **Below ground, as big as the sky:** the soil the roots hunt in: hidden cells, revealed cells with
    minesweeper-style hints, stone, hard soil, water and nutrient pockets (one rare find), and root tips reaching
    them. A pocket being reached gets a small pop.
  - **Sun and shadows:** the sun crosses the sky (a slider and a day loop). Each body casts a shadow; shaded leaves
    go darker, so you see whose shadow falls where, and lit gaps stand out as places to grow toward.
  - **Island:** ~48×28 tiles of lava, bare ground, forest floor, wet, beach and sea, with one species' area and a
    rare variant's glint.
  - **UI panel, in the references' style (both looks):** a pixel font with a dark outline, a framed species card
    (name, form, tier badge), the 8 attributes as segmented pip bars, and a "VS" favour bar for the species against
    its niche's pressure.
- **Look (a), 2D low-poly:** flat polygons: stems as tapered quads, leaves as 3–5-sided facets, soil and stones as
  faceted shapes, each facet shaded by its angle to the sun. Drawn at low resolution, snapped to a ~24-colour
  palette, upscaled without smoothing, so edges stay crisp.
- **Look (b), simple 3D:** the same shapes as flat-shaded meshes (`three`), side-on with a slight tilt you can drag,
  real shadows from the sun, rendered at low resolution and upscaled crisp. The soil is a cut-away slab; the island
  is a low heightfield.
- **Toggles:** look (a) / (b); width 240 / 320 / 480 px; two palettes (a warm volcanic one, a teal one like the
  references); shadows on or off.

## Out
- Steering, the hunt's rules, mutations and levels → the stand (P40 sets its core).
- Porting the winner into `src/`: the side view in the stand, the map and the UI in the map pass.
- A pure pixel-art world (the references set the UI; you asked for low-poly). Sound, weather, animals.

## Done when
- [x] In play: the same scene in both looks. You can say which reads better and which feels more like a game; you
      can see each plant's shadow and read the soil (hidden, hinted, found).
- [x] `npm run check` still passes (the toy sits outside `src/`). The 8 h offline test is flaky (failed once at 520–600 ms).
- [x] Your notes are in `docs/playtests/03-look.md`, with a call: (a), (b) or a mix.

## Size check
- **New systems:** none in the game; it's a renderer test.
- **Sim structure:** no.
- **Sessions:** one, two if the 3D look needs it (build (b) second).

## Open questions (three at most)
- None; Q1 (3D?) answered 3 Nov: both are in.
