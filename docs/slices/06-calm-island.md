# Slice 06: A calm, larger island with landmarks

**Question:** on a bigger, finer island where life changes gradually, do landmarks spread life into several distinct
places, and can you still read why things grow where they do, with fewer layers on screen?

Builds on slice 05 (git tag `slice-05`). From playtest 05 (`docs/playtests/05-layers.md`) and your calls on 27 Oct:
calm tiles and litter, nitrogen less everywhere (plants use more first), a bigger map at higher resolution,
landmarks (vents, springs, beaches, caves; no seabird cliff), fewer visible layers and more hidden depth.

## In scope

### Calm *(your note, 27 Oct: fewer rapid changes overall; big stores that build up slowly, so plants turn
on and off slowly)*
- **Big, slow stores:** nitrogen, litter and soil change over minutes, not seconds (slower makes, uses and losses).
  A store can build up for a long time before a plant can use it.
- **Plants have reserves:** each plant has a health that follows its fit with a lag (big plants slower). Growth,
  spores, yield and death follow health, so a plant doesn't switch on or off the moment a layer moves.
- **Gradual dieback:** a dying plant loses cover over time (rough: 20–40 s) instead of dropping to 0. Its tile is
  open to newcomers only once cover is low. Stress slows growth and thins cover before it kills.
- **Longer lives for big plants:** club mosses and ferns live clearly longer than crusts and mosses. Fast, short
  lives stay with the pioneers.
- **Draw by cover:** sprites and ground tint fade with cover, so thinning is visible before a tile changes.
- **Smoother litter:** a death spreads its litter over the tile and its neighbours, over the dieback time.
  Slower rot and fungi rates, and a stock with more room (the view range fits the new values).

### Nitrogen
- **Plants use more:** club mosses and ferns take clearly more nitrogen, so it becomes their limit in places.
  Makers and leaching only move if that isn't enough.
- **Target:** rich near fixers and rotting litter, poor elsewhere. The Nitrogen view shows real contrast,
  not one flat green.

### A bigger, finer island
- **About 5× the tiles, at a finer grain:** roughly 96×56 tiles at 10 px (was 40×24 at 16 px). Zoom and pan
  as in slice 04. Exact size is set by feel and frame rate.
- **Distances are rescaled** to the new grain (vent reach, spread, founding patch, flare radius), so a species
  covers a similar share of the island as before.
- The island shape gets a less round coast: bays and points, so beaches and rocky coast alternate.

### Landmarks
- **A landmark is data** (`src/data/landmarks.ts`): its kind, shape and fixed effects on base wetness, soil cap,
  shade and statuses. Island making places them by seed. No special rules per landmark in the sim.
- **Starting set:**

| Landmark | How many | Effect |
| --- | --- | --- |
| Steam vent | 3–4 | wet around it, flares now and then (as now) |
| Spring | 2–3 | a water source with a short wet stream line toward the coast |
| Beach | 2–4 stretches | thin, sandy soil, a bit wet, status **Salty** |
| Cave (lava tube) | 2–3 | steady shade and damp at the mouth and along it |

- **Names on the map:** each landmark gets a short name ("North Vent", "Black Sand Beach"), shown when zoomed in
  and on the tile card.
- **Statuses replace the salt layer:** a status is a fixed tag on a tile. Species have a tolerance per status;
  a status counts like a need (at full strength it scores the tolerance), so fit is still the lowest score and
  the limit can be "salt".

### Fewer visible layers, more hidden depth
- **Views:** Garden, Zones, Water, Soil, Nitrogen, Shade (keys 1–6). Litter and salt leave the views.
- **The tile card shows everything:** visible layers, hidden ones (litter), the landmark and its statuses, each with
  its parts as now.
- The placement view keeps the limit mark; a limit can now be a status ("limited by salt").

### A calmer screen *(your note: the UI jumps around a lot)*
- Fixed-size rows under the map (readout, view buttons, feed), so hover text and new feed lines don't move anything.
- No page scrollbar flicker that resizes the map. Panels update a little less often, and their rows don't appear and
  vanish with tiny values.

### Tools
- `npm run sim` and `npm run check` keep working on the bigger map, still with short output.
- New sim measures: **flips** (tiles that change occupant per minute), **litter swing** (mean change per tile
  per minute), the **nitrogen spread** (median and top tenth of land tiles), and **life per landmark** (species
  within a few tiles of each landmark).

## Out of scope
Trees and canopy, biomes and chunks (next), two zoom levels, rain or a windward wet side, seabird cliffs, rivers and
waterfalls, the sea line, animals, the adapting minigame, save and offline progress, the art pass.

## Rough timing
Similar to slice 05 per species (Lichens a few minutes, Ferns 10–20). The bigger map may slow it; pacing stays rough.

## Done when
- [x] `npm run check` passes (8 tests, ~20 s).
- [x] `npm run sim` on 5 seeds, 60 sim-minutes: ≥5 of 6 plants survive, no species holds more than 60% of its stratum,
  and tiles keep changing, but **flips are clearly below slice 05**. *(5/5 pass: all 6 alive, top share 46–56%
  (lichens), 1.06–1.18% of tiles change per minute, was 2.8%.)*
- [x] Litter swings clearly less than in slice 05. *(0.008 per tile per minute, was 0.082 on the same measure.)*
- [~] Nitrogen limits at least one plant on a real share of its tiles, and the median land tile is well below the
  top tenth. *(Limits: club mosses ~84%, ferns ~92% of their tiles. Spread: median 0.07, top tenth 0.09–0.20; the
  rich spots are a few percent of tiles (top 3% at 0.4+, cyanobacteria crusts on the beaches). The middle is flat:
  plants draw it down evenly. Please judge the Nitrogen view.)*
- [x] Life is spread: at least 4 landmarks have 3 or more species near them. *(8–10 per island.)*
- [x] Smooth frame rate on the bigger map at normal speed. *(60 fps in Chrome; a short hitch when the plant scene
  redraws every half second.)*
- [ ] **You:** it feels calm but alive, the island feels bigger, and you can still say why a tile changed from the
  tile card.

## Built beyond the spec (AI choices, 27 Oct; change freely)
- **Health and cover:** cover settles at √health, so a weak plant sits thin instead of flickering. Stress kills
  more slowly (×1.5, was ×3), and seedlings take on poor tiles with chance fit³ (was fit²). Dying plants fade on the map.
- **Nitrogen roles:** mosses and liverworts use little (as before); club mosses and ferns use 2.5× and 2× more.
  Lichens fix little (0.0003), cyanobacteria more (0.005). Fungi need thicker litter (ideal from 0.2), so they free
  nitrogen where litter piles up. Bare rock rests at 0.01 (was 0.04). Ferns' nitrogen band is 0.03–0.12.
- **Club mosses need more water** (from 0.28, ideal 0.4); otherwise they took ~70% of the land.
- **Scale:** spores travel up to 2 tiles, the founding patch has radius 2, spore rain is 4× stronger, your last
  12 tiles are protected, flares reach 4 tiles. Tree requirements are ~5–10× the tile counts.
- **Landmark effects fade unevenly** (a smooth random field), so wet zones aren't circles.
- **Plants are drawn into a cached scene** that is redrawn only when the sim moves (frame rate went from ~37 to 60).
- **Timing:** Ferns often unlock right after Vascular plants (their soil requirement is already met). Tune in play.
