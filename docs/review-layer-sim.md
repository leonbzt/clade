# Review: how to build the layered sim

27 Oct 2026. A fresh-eyed proposal from a systems-design point of view, written after the user's 27 Oct decision
(layered sim with feedback, readable local rules, every layer visible). **AI proposal, not decided.** Anything
the user takes from it goes into `brief.md` or a slice spec; the rest stays here or in `systems.md`.

Based on: `src/sim/*`, `src/data/species.ts`, `src/data/numbers.ts`, `docs/brief.md`. References are from memory.
Where I'm unsure of a detail, it's marked *(unsure)*.

## 0. The diagnosis in one paragraph

The current CA freezes for four reasons, and they're all in `tick.ts`: soil only goes up (a ratchet), nothing dies
while it still fits, the strongest species always wins a contested tile (plus a 25% incumbent edge), and there's
one occupant per tile, so the only kind of change is replacement. A system like that slides to its best fixed
point and stays there. Adding layers on top won't fix that. The fix is structural: **every stock decays, everything
dies, and open space goes to a weighted lottery, not to the strongest.** The rest of this doc builds on those
three rules.

## 1. The model

### 1.1 Two kinds of layer: stocks and levels

Every layer is a `Float32Array` over the tiles, **normalised to 0–1**, with a plain-words meaning at 0 and at 1.
The split that matters most is how a layer gets its value:

| Kind | Has memory? | Updated how | Examples |
| --- | --- | --- | --- |
| **Stock** | Yes | `+ inflows − outflows − decay`, maybe diffusion, every N ticks | soil, nitrogen, litter (later) |
| **Level** | No | Recomputed from the current state when something changes | shade, water, fungal network |
| **Base** | No, fixed | Set at island creation | terrain, base wetness, salt |

Levels are the cheap, safe default: they can't drift, can't blow up, and are trivially explained ("shade 0.6 =
ferns 0.6 cover"). Make a layer a stock only if its *history* matters to play (soil that took 10 minutes to build).
For slice 05: **water** = level (base wetness + soil holding + shade keeping it damp + moss holding), **shade** =
level (cover of taller strata), **soil** = stock, **nitrogen** = stock. Rename "humidity" to **water**: one word,
one map.

### 1.2 Multiple species per tile? Yes: one per stratum

| Option | Good | Bad |
| --- | --- | --- |
| One occupant (now) | Simplest, very readable | Moss can't live under ferns; succession can only be replacement; freezes |
| **Strata, one species each** | Moss under fern under tree; each stratum is a clean map; competition stays inside a stratum; fixed cost | Each species needs a stratum; stacking needs art |
| Cover fractions (k species share a tile) | Realistic, smooth coexistence | Unreadable mush; competition is k² per tile; hard to explain; slow |

**Recommendation: strata, one species per stratum, with a cover value (0–1) in place of `growth`.** Four strata
eventually; two in slice 05.

| Stratum | Who | Slice |
| --- | --- | --- |
| `soil` (below) | fungi: decomposers, mycorrhiza | 06 |
| `ground` (crust, mat) | cyanobacteria, lichens, liverworts, mosses | 05 |
| `herb` (low plants) | club mosses, ferns, later grasses, flowers | 05 |
| `canopy` | tree ferns, trees | 08 |

The rule that keeps this simple: **species compete sideways only inside their stratum. Up and down, they only
touch through layers.** A fern never "takes" a moss tile; it makes shade, the moss's fit drops, and the moss may
die of stress. That one rule turns the vertical interaction into something the inspector can explain.

Animals are **not** strata occupants (see §7).

### 1.3 A species in data terms

```ts
{ id: 'fern', stratum: 'herb', guilds: ['shade-maker'],
  life: 600,        // mean lifespan in seconds; death is what opens tiles
  seeds: 0.4,       // propagules per second at full cover (spread pressure)
  hold: 2,          // how well an established plant resists a challenger
  yield: 6,
  needs: { soil: [0.4, 0.6, 1, 1], water: [0.3, 0.5, 0.8, 0.95], light: [0.2, 0.4, 1, 1] },
  makes: { shade: 0.6, nitrogen: -0.001, litter: 0.002 },
  traits: [...] }
```

- **Needs** are trapezoids `[min, good from, good to, max]`: 0 outside, 1 on the plateau, ramps between. One
  curve shape for every layer. Easy to draw on the species page, and a trait is just "move this corner".
- **Fit = the minimum of the need scores** (Liebig's law of the minimum), times fixed terrain factors like salt.
  Not the product: a product makes everything mediocre and has no single reason. The minimum always gives one
  answer: *"Fit C, limited by light."* That sentence is the backbone of readability.
- **Makes** reads by the target's kind: into a stock it's a rate per second × cover; into a level it's a
  contribution × cover. The sim never needs a special case per species.
- Traits stay `mods` but target `needs.water[0]`, `makes.nitrogen`, `seeds`, and so on. The existing "stat with
  sources" pipeline in `stats.ts` carries over.

## 2. The rule language

### 2.1 Species never name other species

This is the main rule for growing to 100+ species. **All interaction goes through layers** (ecologists call it
interaction mediated by the environment; games call it stigmergy). Cyanobacteria make nitrogen; club mosses need
nitrogen. Neither knows the other exists. Adding species 101 means writing one entry with ~6–10 needs and makes.
The cost is linear: `species × (needs + makes)`, not `species²`. Layers are linear too: a new layer is one entry
in `fields.ts`, plus whichever species care about it.

Relationships the brief calls core (symbiosis, grazing, pollination) also go through layers, or through **guild
tags**, never through ids:

| Relationship | As a layer |
| --- | --- |
| Mycorrhiza | Fungus makes `network` (a level); plants tagged `mycorrhizal` need it or get a bonus from it |
| Decomposing | Fungus needs `litter`, makes `nitrogen` and `-litter` |
| Shade, nursing | Taller stratum makes `shade`; lower species need or avoid light |
| Grazing (later) | Grazer density makes `grazing`; species tagged `palatable` take it as a hazard |
| Pollination (later) | Pollinator density makes `pollen`; species tagged `insect-pollinated` take it as a seed bonus |

So a field affects a species in only **two ways**: through **fit** (a need) or as a **hazard** (extra death
rate). Keep the vocabulary that small. If something doesn't fit these two plus `makes`, the idea is probably too
detailed for this game.

### 2.2 Layer definitions are data too

```ts
nitrogen: { kind: 'stock', every: 10, start: 0, decay: 0.002, diffuse: 0.05, view: 'green', words: ['none', 'rich'] }
shade:    { kind: 'level', from: { strata: ['herb', 'canopy'] }, view: 'violet', words: ['open', 'deep shade'] }
```

One generic kernel in `sim/fields.ts` runs all stocks: add `makes`, subtract decay toward a baseline, diffuse to
neighbours, clamp to 0–1. One function computes all levels. **No layer gets its own hand-written update code.**
Field names are TypeScript keys (`keyof typeof FIELDS`), so a typo in a species' needs is a compile error. That
matters a lot when an AI assistant writes half the data.

### 2.3 Fixed schedule, rates per second

The tick runs the same systems in the same order. Every rate is **per second** and multiplied by the system's
`dt`, so moving a layer from every tick to every 10 ticks doesn't change balance (and offline fast-forward is
the same code with a bigger `dt`, see §6).

1. Events (disturbances) · 2. Life (death, recruitment) · 3. Levels (when dirty) · 4. Stocks (every 1 s) ·
5. Economy (every 1 s, smoothed) · 6. Biomes (every 10 s)

### 2.4 "Why did this tile change?"

Two pieces, both cheap:

- **Breakdowns are recomputed, not stored.** Every field update and fit is a pure function, so the inspector
  calls `explainTile(state, i)` and gets the named parts: *"Nitrogen 0.42: +0.03/s cyanobacteria here, +0.01/s
  from neighbours, −0.02/s used by club mosses, −0.01/s leaching."* No ledger in the save file.
- **One last-event record per tile per stratum**: `{tick, code, species, cause}` in small typed arrays. Codes:
  *settled, died of age, died of stress (limit: light), lost to a challenger, cleared by event.* That's enough to
  answer "what happened here" without history.

A health check for the rule set: if a typical tile change needs more than **two** causes to explain, the rules
are too tangled.

### 2.5 Generate the interaction map from the data

A script prints a table of species × layers (needs in one colour, makes in another), and from it the graph "A
makes X, B needs X, so A helps B". That's the design doc for 100 species for free, and it catches orphans: a layer
nobody makes, a need nobody can meet, a species with no tile on any test island.

## 3. Dynamics

### 3.1 What stops it freezing

Pick mechanisms that make change **patchy and nameable**, not noisy. In order of value:

1. **Everything dies.** Each species has a lifespan (`life`) plus stress mortality when fit is low. Death opens
   the tile in that stratum. This alone guarantees turnover.
2. **Open tiles go to a lottery, not to the strongest.** Neighbours' seed pressure × fit decides who settles
   (the lottery model, Chesson & Warner ~1981). Weaker species keep winning some gaps, so they persist. With the
   colonisation–competition trade-off (Tilman 1994: fast spreaders vs strong holders), you get coexistence for
   reasons you can name. Challenger takeover of a *living* plant stays, but rare, and only when much stronger.
3. **Self-limiting feedback.** Each succession step should undermine itself or prepare its successor: lichens make
   soil, then fade on deep soil (already in the data); ferns shade out their own young (needs light to settle,
   makes shade), so fern stands age and break up into gaps. This is the "pattern and process" gap cycle (Watt
   1947), the classic reason real vegetation is a shifting mosaic and not a fixed map.
4. **Stocks decay.** Bare soil erodes, nitrogen leaches, litter rots. Stocks become equilibria, not ratchets, so a
   dead patch slowly goes back toward bare, and the pioneers get a way back in.
5. **Small disturbances as data.** Vent pulses (fresh bare rock and minerals near a vent), storms (a canopy
   blowdown on one coast), drought spells, salt spray. Local (a few % of tiles), announced in the feed, never
   targeted. Intermediate disturbance keeps diversity highest (Connell 1978). Later, the player can respond to
   these but can't stop them, which is what the user likes.
6. **A slow wet/dry cycle** (e.g. 10–20 minutes) that shifts the water map a little. Ranges breathe; cheap and
   very visible on the water view. Optional; try it after 1–5.

### 3.2 What stops it collapsing

- **Fixed refuges in the terrain**: vents always wet, beach always salty, cracks damp. Every early species has a
  home the sim can't take away.
- **Spore rain**: any species that's on the island seeds every fitting open tile at a tiny base rate. A species
  pushed to zero comes back where it fits. Wipe-outs become rare, as the brief asks ("hard to wipe out until
  there's biodiversity").
- **A floor for the player's species**: the last ~5 tiles of a player species skip stress death and events.
- **Bounds everywhere**: all layers clamped 0–1, all rates small, decay on every stock. Without unbounded
  numbers, the worst case is an oscillation, and the metrics in §5 catch that.

### 3.3 Keep the economy deaf to sim noise

- Income is computed every second from `Σ cover × yield × fit` and shown as a **smoothed rate** (an average over
  ~30 s). Offline uses the same smoothed rate.
- **Requirements latch.** "50 tiles of soil 1+" is met once and stays met. Gates must never flicker because a
  storm hit.
- Events hit few tiles. A check: no single event should cut income by more than ~5%.
- Expect the island to settle into a **statistically steady state** (the map keeps changing, the totals don't).
  That steady state is what makes offline progress fair and predictable.

## 4. Readability

The player doesn't control everything, so they need to **read** everything. The tools, in order of value:

1. **The limiting-factor view while placing.** Every tile shows the fit tier (S–D, already built) *and* the
   colour or icon of the need that limits it. "Ferns: these tiles are B, held back by soil; those are D, held back
   by light." This turns placement into a decision you can read. Build it first.
2. **One view per layer**, same rules for all: a single-hue ramp from 0 to 1, the words for 0 and 1 in the legend,
   number keys to switch. Plus one view per stratum (who's where). Showing all layers at once never works; one at
   a time plus the garden view does.
3. **The tile inspector**: per stratum, the occupant, cover, fit with a bar per need (the limiting one marked), the
   layer values with their parts (§2.4), and the last event. Hover for short, click for full.
4. **The species page shows cause and effect at the scale of the island**: range trend (growing, shrinking), and
   *"62% of moss tiles are limited by light."* That's how the player reads a slow decline they didn't cause.
5. **An event feed, grouped**: *"Storm felled 6 tree ferns on the east coast."* *"Mosses retreat under the ferns."*
   Few lines, named places. Group by region once biomes exist.
6. **Biomes as named regions**: a first-match rule list in `data/biomes.ts` (strata occupants by guild + layer
   ranges), smoothed by a majority filter, a minimum size of ~6 tiles, and hysteresis (a tile changes biome only
   after the condition holds for ~30 s), so labels don't flicker. Names on the map: "Vent mossbank", "Fern gully".
   Biomes are also the natural place for the brief's horizontal resources.
7. **Later, maybe: a forecast.** The sim is deterministic and tiny, so "show where this species will be in 10
   minutes" is a cloned state run headless. It's worth testing once the rest works; it could be the best
   placement aid there is, or too slow on hover *(unsure about cost; measure)*.

A rule for the pace of change: about **1–3% of tiles change per minute, in patches**. Slower reads as frozen;
faster reads as noise. Starting guess; tune by feel.

## 5. Iteration workflow and tooling

The aim: change data, know in under a minute whether you broke coexistence, and have the AI assistant read the
result too.

### Build first (slice 05)

| Tool | What it does | Why first |
| --- | --- | --- |
| **Headless runner** `npm run sim -- --scenario early --seed 3 --min 60` | Prints a table every 5 sim-minutes: cover per species, mean of each layer, diversity, turnover, income | Every data change gets checked in seconds |
| **Scenarios** in `data/scenarios.ts` | Seed + a timed list of commands (found X at Y at minute 2) | Commands are the only input, so a scenario is a replay; this replaces most of the bot |
| **Invariants as tests** | No NaN, layers in 0–1, determinism hash; on 5 seeds after 60 min: ≥ k species alive, no species above 60% of its stratum, turnover inside a band | Catches "it froze" and "it collapsed" automatically |
| **ASCII dumps** | Prints a stratum or a layer as a character map in the terminal | The AI assistant can read and diff maps; costs ~40 lines |
| **Interaction table** | §2.5, generated from data | Keeps 100 species manageable |
| **Dev panel additions** | Pause, step, ×100 speed, paint any layer, place any species anywhere | Testing a rule by hand in seconds |

### Build when it hurts

- **Seed sweeps**: 20 seeds, report the spread of time-to-Ferns and species alive. When balance starts depending on
  luck.
- **Parameter sweeps**: one parameter over 5 values × 5 seeds, CSV out. When one number keeps getting retuned.
- **Snapshot diff**: run two data versions to minute 30 and print both ASCII maps side by side with a changed-tile
  count.
- **Sparklines** of cover per species in the dev panel.
- **Hot reload of data**: Vite HMR on `src/data/*` that swaps tables and keeps the state. Nice, but by-id lookups
  must be stable first.

### Overkill (skip)

A general rule language or expression strings in data; a node-graph editor; an ECS framework; a balance
optimiser or genetic tuning; per-tile history; GPU or WASM.

### Proposed file layout

`data/fields.ts`, `data/strata.ts`, `data/species/*.ts` (split by lineage before 400 lines), `data/biomes.ts`,
`data/events.ts`, `data/scenarios.ts` · `sim/fields.ts` (generic kernel), `sim/fit.ts` (curves, limiting
factor), `sim/life.ts` (death, lottery), `sim/events.ts`, `sim/explain.ts` (pure breakdowns), `sim/metrics.ts` ·
`tools/run.ts`, `tools/ascii.ts`, `tools/matrix.ts`.

## 6. Performance and offline

### Cost

The grid is tiny. 40×24 = 960 tiles; with 4 strata, 3,840 slots. Even 96×60 (a size worth growing to for
biomes) is ~23k slots. Rough budget (estimates, measure): a slot update with RNG costs ~50–200 ns in modern JS,
so a full pass over 23k slots is 1–5 ms. Fine at 10/s, and cheaper with cadences:

| System | Cadence |
| --- | --- |
| Life (death, recruitment) | Every tick, but only a random ~10% of tiles per tick (each tile about once a second) |
| Levels (shade, water, network) | When a stratum changes (dirty flag), at most once a second |
| Stocks (soil, nitrogen, litter) | Every 10 ticks, `dt = 1 s`; soil could run every 50 |
| Economy | Every 10 ticks |
| Biomes, metrics | Every 100 ticks |

Struct of arrays (one typed array per layer and per stratum), double-buffered diffusion, no objects per tile.

**Determinism caveat** *(fairly sure)*: JavaScript's `Math.exp`, `Math.pow`, `Math.sin` aren't required to give
bit-identical results across engines. Inside the sim, stick to `+ − × ÷`, `min`/`max`/`clamp`, and the trapezoid
curves. Island generation uses `sin`/`atan2`, so either save the terrain or accept that a seed may differ slightly
between browsers.

### Offline: fast-forward with big steps, then a cap

1. Because every rate is per second, catch-up is the same sim with `dt = 10 s` (probabilities scaled, e.g.
   `p = min(1, rate × dt)`).
2. 8 hours at `dt = 10 s` is ~2,900 steps; at ~5 ms each, ~15 s *(estimate)*. Run it in a Web Worker behind a
   "while you were away" **time-lapse** of the island. That isn't a loading screen; it's a reward.
3. Cap the simulated ecosystem time (e.g. 4 h). Past the cap, only income accrues, at the smoothed rate.
4. **No events against the player while away**, and the floor in §3.2 stays on. Away time can't hurt.
5. Catch-up is a command (`catchUp(seconds)`), so it's deterministic and tests can replay it.
6. **The dt test**: run a scenario 30 minutes at `dt = 0.1`, `1` and `10`, and require the metrics to agree within
   ~10%. If they don't, a rule depends on the tick rate and must be fixed.

## 7. Staged plan

### Slice 05 "readable layers": the smallest proof

Scope (keep the six current species, nothing new):
- Layers: **soil** (stock, with erosion), **nitrogen** (stock), **water** (level), **shade/light** (level).
- Two strata: **ground** (cyanobacteria, lichens, liverworts, mosses) and **herb** (club mosses, ferns).
- Species rewritten as needs/makes data with lifespans; fit by the minimum rule; the lottery for open tiles; one
  self-limiting loop (ferns can't settle in deep shade); one disturbance (vent pulses).
- Views: one per layer, the limiting-factor view while placing, the tile inspector with parts and last event.
- Tools: headless runner, three invariants (bounded, not frozen, coexistence), ASCII dumps, interaction table.

It's done when:
- On 5 seeds, after 60 sim-minutes with all six placed, ≥ 5 species survive, turnover stays in the band, and
  nothing holds more than 60% of its stratum.
- Mosses visibly live under ferns, and ferns visibly break up and come back in patches.
- **The explain test**: a playtester clicks 5 tiles that changed and can say why for at least 4, using only the
  inspector.

### After that

| Slice | Adds | Proves |
| --- | --- | --- |
| 06 Fungi | `soil` stratum; `litter` stock; decomposer (litter → nitrogen) and mycorrhiza (`network` level) | Fungi as real species; a new stratum and two layers with no new sim code |
| 07 Biomes | Region rules, labels, feed grouped by region, biome bonuses | Named places that come and go |
| 08 Trees | `canopy` stratum, long lifespans, storms, gap cycles | Slow big structure; the mosaic at scale |
| 09 Sea line | Sea tiles get their own strata (`floor`, `water column`) and layers (nutrients, light depth) | Same kernel, second habitat |
| 10 Animals | Grazer density as a layer per guild (needs forage, makes grazing + dung → nitrogen); cute individuals drawn from density | Animals without agents in the sim |
| later | Gene minigame: traits as visible shifts of need curves | "Adapting feels like adapting" maps straight onto the curves |

On animals: keep them as **density fields** (per tile or per region) inside the sim, and spawn individuals only
in the view, sampled from density. The brief wants small cute animals to find, and that does it, while the sim
stays a grid. Agent-based animals in the sim would break offline and determinism cost first.

### The 3 biggest risks

| Risk | What it looks like | Detect early |
| --- | --- | --- |
| **Emergent soup** | Things change and nobody can say why | The explain test every slice; % of tile changes with a single clear cause; the "two causes" rule |
| **Tuning hell** | Each new species knocks over two others; oscillation or a monoculture | Runner + invariants on 5 seeds after every data change; dominance and diversity in the metrics table |
| **Idle vs. sim** | Income swings, offline results feel unfair, or the steady state comes so fast the island is static again | Income spread over 10-min windows; the dt test; turnover after 2 h of sim still in the band |

## 8. What I'd NOT do

- Shared cover fractions for many species per tile.
- Rules or matrices that name two species.
- A scripting language or string formulas in data. Typed TS objects with a fixed vocabulary only.
- Realistic chemistry (N, P, K, pH, carbon). Keep it to ~8 layers by midgame; each must earn its own view *and* a
  placement decision, or it's a stat, not a layer.
- Agent-based animals in the sim.
- Letting the player paint layers (outside the dev panel). That's what keeps the sim's own life.
- Updating every layer every tick, or anything with a ratchet.
- Starting the tooling with sweeps, optimisers or editors. Runner, invariants and ASCII first.
- Growing the grid before slice 05 proves the rules on 40×24.

## Summary

1. Freezing comes from ratchets, no death, best-always-wins and one occupant; fix it structurally, not with layers.
2. Layers are 0–1 typed arrays: **stocks** (soil, nitrogen) have memory and decay; **levels** (shade, water) are recomputed.
3. Multiple species per tile: **yes, one per stratum** (soil / ground / herb / canopy), with a cover value; no shared fractions.
4. Species compete sideways only within a stratum; vertically they only touch through layers.
5. A species is data: needs as trapezoid curves, makes as rates; **fit = the minimum need**, so every tile has one named limit.
6. Species never name each other; symbiosis and grazing go through layers and guild tags, so cost stays linear.
7. Turnover from lifespans, a seed lottery for open tiles, self-limiting loops, decay and small events; refuges, spore rain and a player floor stop collapse.
8. Readability: the limiting-factor placement view, one view per layer, a tile inspector with recomputed parts and last event, a grouped feed, named biomes.
9. Tooling first: headless runner, scenarios as command replays, invariants on 5 seeds, ASCII maps, a generated interaction table; sweeps later.
10. Slice 05 keeps the six species and adds 4 layers, 2 strata, lifespans and the lottery; done when 5 of 6 coexist on 5 seeds and a tester can explain 4 of 5 tile changes.
