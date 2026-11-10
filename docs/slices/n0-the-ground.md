# Step N0: The ground

**Milestone:** M2, step 7, N0 (from `ROADMAP.md`) · 1 session · in the fresh folder `clade/`
**Question:** Does the shelf read as a sea floor of distinct places? One seed gives 10–16 named habitats from
depth × substrate × exposure, with irregular neighbours, on a map you pan and zoom.
**Builds on:** decisions.md, 10 Nov (the rebuild; the folder `clade/`; build brief §3 and §5 decided).
[whole-game-build.md](../design/whole-game-build.md) §3 (ground and habitats), §5.4 (the palette), §6 law 9, §8 (port list).

## In (parts in order)
- **0. The folder.** `clade/` with `index.html`, `src/{sim,data,view,ui}` and `tests/`, served at `/clade/`.
  `npm run check` covers `clade/` only; `npm run check:game` runs the frozen game's. Make `npm run look -- /clade/`
  work (Playwright is not in the repo; the 10 Nov shots used a scratchpad copy).
- **A. The palette** (`data/palette.ts`): about 32 colours in ramps, dark → light, used by index only; start from
  the tuned ramps in `game/src/view/shade.ts`. One shading function (light from the top left, three tones). Reserved:
  red for danger, gold for yours. Ground ramps are muted; the four feeding accents (green grazer, brown burrower, red
  hunter, blue filterer) are saturated. The Clade font comes over from `game/src/ui/fonts`.
- **B. The ground.** Port `sim/island.ts`, `data/island.ts` and `sim/rng.ts` as they are, without `habitatSpots`.
  New `sim/ground.ts` with its numbers in `data/ground.ts`. Every sea tile gets:
  - a depth band: tide flat, shallows, slope or deep edge (distance to land, roughened by the seed). Past the deep
    edge is open sea, which is not a habitat.
  - a substrate: sand, mud or rock, from the nearest coast as `game/src/sim/sea-patches.ts` does it (beach → sand,
    lava and vents → rock, streams, wet ground and forest → mud).
  - an exposure: sheltered or open (land around the tile, and the lee of the island's wind).

  The island takes about a third of the map's width; the shelf runs to the edges.
- **C. The habitat finder** (`sim/habitats.ts`, after `sea-patches.ts`): a flood fill over connected tiles of one
  kind. Pieces under a minimum area join the neighbour they share the most border with. Each habitat has an id, a
  kind, its tiles, an area, a centre and its neighbours with border lengths (§6's `Habitat` without stocks and pops).
- **D. Names** (*proposal*; words in `data/ground.ts`): exposure + substrate + depth word ("Lee mud flats", "Open
  rock slope"). A vent or stream mouth next to the habitat gives its word instead ("Vent rocks"); twins get a compass
  word. The same seed gives the same names.
- **E. The bare map** (`view/map.ts`, a Svelte shell in `ui/`): every tile painted from the palette (land too),
  habitat borders as one dark pixel, names as labels. Drag to pan; wheel or pinch to zoom in integer steps. Tapping a
  habitat opens a small card with its name, area, kind and neighbours. A dev bar: seed − and +, and four views
  (habitats, depth, substrate, exposure).

## Not in this step
- Stocks, populations, slots, ceilings from area, the sea step, dev presets: N1. The Life board from a habitat: N2.
- The home map, fog over unvisited habitats, the tree's trunk: N3. Living paint (sprites and mats over tiles): with
  populations, N1 onward.
- Ground that changes (eruption, river mud, reef, burrowing) and ids that survive a change: R7. v1's `habitats.ts`
  (ids carried over by overlap) waits for it, so no `_v1/` file is read here.
- Stamps, plans and the contact sheet: L1. Saving: step A (the seed alone rebuilds the ground).

## Done when
- [ ] **Play question** (from the screenshot sheet or `/clade/`): on three seeds, can you tell the habitats apart and
  say which one you would visit first? Does the map look like a sea floor rather than a ring?
- [ ] Tests: 10–16 habitats on each of 20 seeds, none under the minimum area; every habitat has a neighbour and the
  graph is connected; same seed, same ground and names; no colour literal in `clade/src` outside the palette file;
  no ground ramp uses red or gold; the ground and finder take under 20 ms.
- [ ] `npm run check` passes in under 10 s.
- [ ] The screenshot sheet: three seeds at fit zoom, one close zoom, the four views. Three lines in `docs/status.md`.
- [ ] Your notes are in `docs/playtests/n0-the-ground.md`.

## Size check
- **New systems:** one, the ground with its finder (the base of the sea). No stocks, stats or genes.
- **Sim structure:** a fresh folder. `game/` is untouched except for the check script.
- **One session:** the island and the finder are ports; the map is the new code, about 200 lines.
- **If it slips:** if the count will not settle in 10–16, exposure stops splitting habitats and becomes a property.
  Then the dev bar.

## Open questions
None. §3 and §5 were decided on 10 Nov. Band widths, the minimum area and the map size are numbers tuned by feel on
the sheet.
