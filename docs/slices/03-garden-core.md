# Slice 03: Garden core

**Question:** does this feel good: place a species on the island, watch it spread, compete and change the ground,
then evolve the next species and place it while the old ones stay? And does the 2D pixel garden look good and read
clearly?

This is the review's M0 + M1 ([review-fresh-eyes.md](../design/fresh-eyes.md)), cut to the brief's 26 Oct direction.
It replaces the slice 01 code (git tag `slice-01` keeps it).

## In scope

**The island (one map, 2D pixel art)**
- About 40×24 tiles of 16 px, scaled up crisp. Sea, beach, lava field, steam vents, cracks.
- **Soil depth 0–3 per tile.** Plants build it slowly. The ground visibly turns from black lava to brown soil (the
  Terra Nil payoff), and soil holds water, so dry lava becomes livable over time.

**Species (data-driven)**
- **Wild lichen** is already on the island: the pioneer and incumbent. It's strong on dry bare rock, builds soil, and
  fades once the soil gets deep. That's succession.
- **Your line:** Mosses → (Vascular plants, a gate) → Club mosses or Ferns. Each placed species stays.
- Per species: moisture needs, the soil it needs, vigour (competition), spread, soil building, yield.

**The one thing you do: place**
- Pick an unlocked species, and the map shows its **fit tier S–D on every tile**. Click to found a small patch.
  The first founding of each species is free; extra ones cost biomass.
- **Spread and competition** (a cellular automaton): patches spread to neighbouring tiles where they fit. A newcomer
  takes an occupied tile only if it's clearly stronger there (incumbents push back).

**Grow the species**
- **Biomass** comes from your tiles (yield × fit × growth). It's shown in the top bar.
- **Traits:** 3 per species, bought with biomass, each with an upside and a downside. Bought traits **show on the
  specimen and on the map**.
- **Evolve** on the tree panel: nodes with a visible list of requirements (tiles with soil, biomass), and a fact line.
- Every species stat shows where its number comes from (a modifier list).

**Look and readability**
- One fixed palette, pixel sprites drawn by code, a pixel font, OSRS-like panels.
- A hover readout (terrain, moisture, soil, occupant, fit tier), and overlay toggles (fit, soil).

**Tech (from the review)**
- `src/sim/`: pure TS, with no DOM, time or `Math.random`. A seeded random generator lives in the state. A fixed tick
  of 10 per second. Input arrives as commands (`found`, `buyTrait`, `evolve`).
- `src/data/`: numbers, species, traits, tree, palette. `src/view/`: canvas drawing. `src/ui/`: Svelte panels.
- Dev panel (the ` key): speed ×1/×10/×100, skip time, +biomass, reset, `window.dev.dump()`.
- Tests: determinism (same seed and commands give the same hash), founding rules, spread and competition basics.

## Out of scope
- Save and offline progress (next: the review's M3), animals and grazers, disturbance, minigames, slots, zoom
  levels, relationships beyond lichen → soil → others, sound, mobile layout, the curve script.

## Done when
- [x] `npm run check` passes (typecheck + 5 sim tests, including determinism).
- [ ] From a fresh start you can reach Ferns in about 15–25 minutes at ×1 (rough). *(The greedy bot reaches Ferns at
  ~10 min, so a human should be slower; not timed by hand yet.)*
- [ ] You've played it and written notes in `docs/playtests/03-garden-core.md`: does placing feel like a decision,
  does the garden look good, and can you read it?

## Built beyond the spec (AI choices, 26 Oct; change freely)

- **Lasting niches instead of a monoculture.** In the first bot run, soil built evenly everywhere and ferns ended up
  winning every tile. Now dry ground keeps thinner soil (the soil cap rises with moisture), and each species has a
  "wet falloff", so ferns can't hold waterlogged vents. Result after 40 bot minutes: moss at the vents, ferns in the
  damp ring, club mosses in between, lichen on dry lava.
- **Founding onto a weaker occupant is allowed.** Otherwise there's no free tile left once moss and lichen fill the
  island. The fit overlay fades tiles that a stronger species holds.
- **The curve script exists after all:** `npm run curve` (the bot in `src/sim/bot.ts`). The dev panel can let the bot
  play 5 or 15 minutes.
- **Dev URL options:** `?bot=600`, `?tab=species`, `?place=fern` (for screenshots and quick previews).
- The Tree tab opens first, because the first action is "Evolve Mosses".
