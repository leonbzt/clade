# Slice 11d: One map of places, and real biomass

**Question:** with grams as the sim's real stock and habitats as the only places, does the island add up and read
as one living thing: what lives where, how much, and who feeds whom?

From P28 (your calls 31 Oct: c3, hover-only patches, b yes, d parked) and P26 d2 (your call: as soon as possible),
plus P27 a–c. Three parts, built in order, each checked before the next.

## Part A: one map of places (P28)
- **Regions go:** the k-means cuts (`regions.ts`), the Regions view and its labels, and the region in names. The
  wind side stays (it's a field in `island.ts`). Landmark names stay.
- **A habitat is a connected piece of one kind:** 8-neighbour, with 1-tile gaps bridged, so a fern forest with a
  hole in it stays one place. It's recomputed every window.
- **Ids carry over by overlap.** A new piece takes the id of the old one it shares most tiles with. On a merge, the
  bigger one's id lives on. On a split, the biggest part keeps the id and the rest get new ones. Counters and
  smoothing follow the id.
- **Two tiers, with hysteresis:**
  - Major (from `show` 60 tiles, hidden below `hide` 40): a name, a loadout card, and a place on the board.
  - Patch (from ~8 tiles, below ~5 it's a scrap): tinted and outlined in the Habitats view. Hovering shows the kind
    and its top holders (one line per filled slot). No card, no board entry, not clickable.
  - Scraps: just the tint. Their counters go into one island-wide bucket per kind.
  - The slots of patches and scraps still count for the island's best.
- **Names:** the kind and its lead, as now. Twins get a compass word from the island's middle ("Fern forest,
  west"); a third twin uses the nearer of two compass words ("…, north-west").
- **News:** a patch growing into a major habitat is a headline ("A Fern forest grew in the west"). A major one
  shrinking to a patch is chatter. Vanishing stays a headline after `stood`.
- **The card and name go on the piece itself.** No piece holds more than one name.

## Part B: plants and litter in grams (P26 d2)
- **The stock is grams per slot:** `mass[slot]` replaces `cover[slot]` as the state.
  - Cover becomes derived: cover = mass ÷ (`MASS[sp]` × tile area). Fit, hold, art and grazing quality keep reading
    cover, so they hardly change.
  - What health allows is `MASS × area × √health`, as today's target.
- **Growth: a full stand makes the most, and sheds it** (your 31 Oct question). Per slot, with x = mass ÷ ceiling:
  - Production = `grow` × ceiling × (2x − x²). It's highest at full size, like a closed canopy catching all the
    light.
  - Turnover = `grow` × ceiling × x. Old leaves and stems die off as litter.
  - Net growth is the difference, `grow` × ceiling × (x − x²), so a grazed-down plant still regrows by itself.
  - At full size, production equals turnover. A mature carpet feeds grazers or recyclers all the time, instead of
    making nothing until it's eaten.
  - `grow` keeps its current values as a start. A seedling starts at `settleCover` × the ceiling, in grams.
  - Later, trees: wood doesn't turn over, so their mass keeps building after the leaves stop growing.
- **Production is real:** the gross grams each plant makes are its production. Slot sizes come from it ("makes
  40 g/min"), not from the part C formulas. Grazer slot: plant production. Recycler slot: litter fall.
- **Litter is a gram stock.** Turnover, dead plants, dieback, dung and corpses drop grams. Decay turns litter into nitrogen at
  a fixed share per gram (`litterN`, about 1 % N) and into soil at `litterSoil`. The rest is breathed out. Soil and
  nitrogen stay 0–1 inside, with real units for display (part C).
- **The books balance:** each tick, the island's grams (plants + animals + litter) change by exactly production −
  burn − decay. A `ledger` in the dev panel shows the four flows per minute.

## Part C: animals in grams, the currency, real units
- **A member has a body mass:** `mass` = the real mass (masses.md) × `stands`, how many real animals one member
  stands for. For example a springtail member is 1 000 springtails (0.1 g), and a slug member is 1 slug (5 g). The
  card shows real counts (n × stands).
- **Animals eat, burn and keep grams:**
  - Intake per member: up to `appetite` × burn, in grams of food.
  - Burn per member: `B` × mass^0.75 grams per second, × (1 + stress × (1 − fit)) as now. `B` is one island-wide
    number.
  - Kept: eaten × `keep` (assimilation: about 0.3 for moss and litter eaters, about 0.8 for hunters). The rest
    becomes dung (litter grams, nitrogen as now).
  - The store `e` stays 0–1, but it now means up to `store` × body mass in grams. Eating fills it, burning drains it,
    and starving is when it's empty.
- **Young cost their body mass** from the group's store (no growth after birth for now). A hunter eats a caught
  member's mass, and what it doesn't keep becomes dung. A member that dies of old age goes into litter in grams.
- **Ratios are tuned, not real.** The real ~10 % per food-chain step is a guide only: `keep` and `B` are tuned per
  species until hunters persist. Time is game time. Lifespans and rates stay game-paced, and no years yet (P27 d
  is out).
- **The Biomass currency becomes real** (your call: keep the name): it's the grams your placed species produce (plant growth + young born).
  Costs are rescaled by one factor, so the first founding comes at about the same time (±30 %). The top bar and
  costs show g → kg → t.
- **"Best" stays the biggest share** of the food made (your call). **Efficiency** shows in the slot's detail as a
  second number: the grams of new body (young born + store gained) per gram eaten, over the smoothing window
  ("ate 250 g, made 30 g of beetles: 12 %"). For plant slots, it's production per gram standing ("renews 40 % a
  minute").
- **Real units on the tile card (P27 a):** soil in cm, light in %, water as moisture %, nitrogen in g/m², litter in
  g/m². Conversions are data.
- **Scale and counts (P27 b, c):** a scale bar on the map, and populations as real counts and densities
  ("≈ 40 000 springtails, 400 per m²").
- **Areas and productivity (P29 b):** habitats show their area in hectares ("Fern forest, 0.8 ha"), and slot sizes
  get productivity per area beside the total ("40 g/min · 5 g/m² per min"), so a small, rich place can beat a big,
  poor one. Display only.
- **Tile size: 10 m (100 m² per tile)** (your call). The island is ~900 m across, close to Surtsey's size class. It's
  one number (`NUM.mass.tile`), and it scales grams per tile and `stands`.

## Runner and tests
- **`npm run sim`:**
  - Part A: majors and patches per seed, and how many id changes and headlines per hour.
  - Part B: standing mass per kind against masses.md, and the ledger's gap.
  - Part C: hunters alive at 60 minutes, the time of the first founding, and the tick cost.
- **Tests (few):**
  - A piece keeps its id when tiles move, and on a split.
  - A grazed plant regrows to its ceiling.
  - The ledger balances to within 0.1 % over 60 s.
  - A starving animal dies, and its grams land in litter.

## Out of scope
- Borders (P28 d), year/season time (P27 d), sprite size by mass (P27 e), the food-web view (P27 f).
- Juvenile growth, plants as patches (P20), loadouts per kind, regions from geology.
- 12a and 12b; your 30 Oct notes (names, more animals, trees and fruits); hiding (P25 e).

## Done when
- [ ] A: no regions in the code or UI. At 30–60 min there are 5–10 majors per seed with unique names, and patches
  show on hover. Ids survive moving tiles. Habitat headlines ≤ ~10 an hour after 30 min.
- [ ] B: 5/5 seeds run 60 min with no new collapse (slugs on seed 4 noted). Full-cover masses are within ×3 of
  masses.md. The ledger balances. Grazed plants visibly regrow.
- [ ] C: hunters alive on ≥ 4/5 seeds at 60 min. The first founding is within ±30 % of today's time. Every number on
  the board, top bar and tile card is in real units. Tick cost is ≤ +20 % over part C.
- [ ] **You:** does a place read as one thing now? Do the numbers feel real ("the beetles ate 30 g of slugs a
  minute")? Does the island feel like it grows in kilograms?

## Your calls (31 Oct)
1. Tile size 10 m. 2. The currency stays Biomass, in real grams; more currencies later. 3. "Best" is the share, and
efficiency is shown beside it. Part B's production curve is an AI change from your question (P29). Hectares and productivity ride along (P29 b).
