# Slice 05: Readable layers

**Question:** with a layered sim that keeps moving, can you read *why* things grow where they do, and does the
island feel like an ecosystem that lives without you?

Builds on slice 04 (git tag `slice-04`). Follows P9 in `systems.md` and `review-layer-sim.md` (your call, 27 Oct:
"go ahead in a similar way"; not a hard lock). The sim core is rewritten; the view and menus are adapted.

## In scope

### The model
- **Height layers (strata) per tile, one species each, with a cover value 0–1:**
  `under` (fungi) · `ground` (cyanobacteria, lichens, liverworts, mosses) · `herb` (club mosses, ferns).
  Species compete only inside their stratum. Up and down they touch only through layers.
- **Layers, all 0–1, all visible:**

| Layer | Kind | Comes from | Goes |
| --- | --- | --- | --- |
| Water | level (recomputed) | base wetness (vents, cracks, beach) + soil holds it + mosses hold it + shade keeps it damp | — |
| Shade | level | cover of the herb layer (canopy later), a little bleed to neighbours | — |
| Soil | stock (memory) | built by plants, lichens weather rock | erodes when bare |
| Nitrogen | stock | fixed by cyanobacteria and lichens, released by fungi from litter | taken up by plants, leaches |
| Litter | stock | dead plants, leaf fall | rots slowly, eaten by fungi |
| Salt | base (fixed) | beach and coast | — |

  *Litter* is dead leaves and stems on the ground. (Other names: dead matter, detritus. Humus is what it becomes.)
- **A species is data:** a stratum, needs as bands (an ideal range inside a survivable range), makes as rates,
  plus lifespan, seeds, hold and yield. **Fit = its lowest need**, so every tile has one named limit.
  Species never name each other.
- **Not frozen:** everything dies of age (and faster when stressed), open tiles go to whichever seed arrives and
  fits (fast spreaders win gaps, strong holders keep tiles), stocks decay, and **steam vents flare** now and then,
  clearing a small patch.
- **Not collapsed:** spore rain (every species you've placed reseeds fitting open tiles at a low rate), and your
  species' last 5 tiles don't die.
- **The economy can't hear the noise:** the shown income is smoothed; tree requirements stay met once reached.

### Species
The six current species are ported to needs and makes. **Fungi become a species** (the Fungi node unlocks
*Soil fungi*: under the ground, need litter and water, turn litter into nitrogen). Fungi are added as data only,
as the proof that the sim grows without new code. Traits now move need bands or scale rates ("lives 0.1 drier").

### Readability
- **Placing:** a dark wash; tiles you can place on show the fit tier (S–D) strongly, with an outline around the
  placeable area; a small mark in the colour of the limiting layer; the best few spots marked. Hover: "Fit B,
  limited by water (0.31; ideal from 0.45)".
- **Views:** Garden, Zones (all three strata), Water, Soil, Nitrogen, Shade, Litter. Keys 1–7. One colour ramp per
  layer, with the words for 0 and 1.
- **Tile card:** hover for a short version, click for the full one in a Tile tab: per stratum the occupant, cover,
  fit with the limit, and the last thing that happened ("died of stress, limited by nitrogen"); each layer's value
  with its parts ("+0.004/s Cyanobacteria, −0.002/s leaching").
- **Species page:** needs drawn as bands, makes as a list, and "62% of its tiles are limited by shade".
- **Event feed:** a few lines with causes ("A steam vent flared: 11 tiles cleared").

### Tools (kept light on output)
- `npm run sim`: a headless run of the bot on 5 seeds, one compact table, PASS/FAIL against the checks below.
  `ASCII=1` adds text maps. `TABLE=1` prints the species × layer table (who makes and needs what, plus orphans).
- `npm run check` stays fast: determinism, layers in 0–1, no NaN, not frozen and ≥3 species after 10 minutes on
  one seed, and no `Math.random` or `Date.now` in `src/sim`.
- Dev panel: pause, and unlock everything.

## Out of scope
Biomes (slice 06), trees and canopy, the sea line, animals, the adapting minigame, save and offline progress,
diffusion of anything but nitrogen, new art beyond what the new views need.

## Rough timing
Like slice 04: Lichens around 3 minutes, Vascular plants around 6–10, Ferns around 10–20. Pacing stays rough.

## Done when
- [x] `npm run check` passes.
- [x] `npm run sim`: on 5 seeds, after 60 sim-minutes, ≥5 of the 6 plant species survive, no species holds more than
  60% of the land in its stratum, and tiles keep changing. *(5/5 pass: all 6 alive, top share ~53% (club mosses),
  ~2.8% of tiles change per minute.)*
- [ ] Mosses visibly live under ferns, and fern stands break up and come back in patches. *(Mosses under ferns: yes
  in the Zones view. Fern stands are small, 30–80 tiles at 60 min; please judge in play.)*
- [ ] **The explain test (you):** click 5 tiles that changed and say why for at least 4, using only the tile card.
- [ ] You can see where to place without guessing.

## Built beyond the spec (AI choices, 27 Oct; change freely)
- **Stressed plants make fewer spores, and seedlings rarely take on poor tiles** (spread × fit, settling × fit²).
  Without it, club mosses carpeted 65–75% of the land at fit D.
- **Club mosses got a soil band** (thin soil, 0.3–0.55): lichens on bare rock → club mosses on thin soil → ferns on
  deep soil is the succession ladder.
- **Vent wetness reaches 5.5 tiles (was 7)**, so there is a real dry lava field for the lichens.
- **Feed lines for trends:** every minute, a species that grew or shrank a lot gets a line with its main limit.
- Requirements now name a layer (soil 0.3+ instead of soil depth 1+). Soil is 0–1 now (was 0–3).
- Nitrogen and litter views show full colour at 0.3, since their values stay low.
- Lichen ground cover is patchier, so the dry field isn't one flat grey.
- `npm run curve` is replaced by `npm run sim`. Dev panel: Pause, Unlock all. URL: `?tab=tile&tile=494`, `?view=water`.
