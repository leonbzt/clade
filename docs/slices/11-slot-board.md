# Slice 11: The slot board

**Question:** do slots that the sim makes read clearly on today's island, and do they make you want to fill them?

Builds on slice 10b and springtails on fungi (d8a6293). From P24 b and P25 (your calls, 29 Oct): the sim makes
the slots, the board lives on the map as well as in a panel, and the wind side comes first. **Read-only:** nothing
you do changes yet, and the economy stays as it is. Three parts, with a check after each: **A** the wind side and
the regions (built), **B** slots and the board, **C** habitats, the places the sim makes.

## Part A: the wind side and the regions *(built; see the build notes)*
- **Wind:** a prevailing wind by seed. Its rain ramps from about +0.12 on the windward edge to −0.05 in the lee,
  added to the base water; the windward coast gets a weak salt spray (~0.3, 2 tiles in). The tile card says
  windward or lee.
- **Regions:** made once with the island, a region id per tile. A landmark's surroundings (vent field, spring
  banks, beach shore, tube mouth), then the rest of the lava by wind side, cut into pieces. 8–14 regions of at
  least ~60 tiles, named from the landmarks and the wind. A Regions map view; names only show there.

## Part B: slots and the board *(built; see the build notes)*
A slot is a place plus a role. Places are the regions now and the habitats in part C.

### Roles *(data: `src/data/roles.ts`)*
Generated from the data and what lives on the island, with authored names and icons. **Groups are base species**:
snails and slugs are separate, and a slug species you made still counts as a slug.
- **Leads**, one per stratum with producers (Ground cover, Herb layer, Under ground): the major there. Size = tiles
  where a species on the island could live in that stratum (fit > 0); use = cover.
- **Food links**, one per thing that's eaten: each plant group as cover (Moss grazer, Fern grazer, Fungus grazer …),
  Litter eater (animals), Decomposer (litter broken down by fungi), and each animal group as prey (Springtail
  hunter, Snail eater, Slug eater). A food link exists once its food is produced in the place, so a new arrival
  opens new slots, and Fern grazer shows as open once ferns spread. Size = food produced per minute (cover regrowth,
  litter fall, young born); use = what's eaten.

### The numbers *(`src/sim/slots.ts`)*
- Counters per bucket (region × habitat kind, so part C needs no new hooks), by food group and eater group, over
  windows of 30 game seconds, smoothed over about 3 minutes: cover grown and grazed, litter fallen, eaten and
  decayed, young born and caught.
- Per slot: **size**, **use** (the share taken), **holder** (the group with the biggest share, its leading species
  there and that species' leading variant and tier), **yours or wild**, **trend** (up, flat, down), **fed by** (the
  slot in the same place that supplies most of this one).
- **Open:** no holder above ~15% of the size. **Big open:** open, and among the largest of its role on the island.
  **Hysteresis:** a challenger takes over only with a clearly bigger share (~+10%).
- **Best:** the biggest share (P25 open question).

### The board (a Regions tab) and the map
- **Each place shows 3 slots:** its lead, its biggest eating link and its biggest hunting link. A big open one wins
  its row ("Slug eater: open"). Rows: icon and name, a size bar, use %, the holder (name, colour, tier chip), the
  trend arrow, fed by. Click a region label or a tile to select its place; click a row to light up the holder there.
- **Island best of**, at the top: each role's best holder on the whole island ("Best slug eater: Ground beetles,
  64%"), open roles marked.
- **On the map** (Regions view): each region's name with its 3 slot icons, filled in the holder's colour (a small
  mark when it's yours), hollow when open, glowing when big and open.
- **Feed lines** when a slot opens or changes holder: "Slug eater opened on the Lee lava, south"; "Ground beetles are
  the island's best slug eater".

### Dev panel
- Per slot: raw size and use, the window values, and a **worth** preview (size × share × fit, scaled per place) to
  test the gains formula without touching the economy. The time the slot update takes.

## Part C: habitats, the places the sim makes
- **Kinds (data):** a test per tile, checked every window, with a little hysteresis: Dark floor (shade ≥ ~0.35: tube
  roofs, under ferns), Wet seep (water ≥ ~0.6; a stream on stream tiles), Spray coast (salty ≥ ~0.2), Bare rock
  (soil < ~0.08), Deep soil (soil ≥ ~0.55), Vent scar (cleared by a flare in the last few minutes). One kind per
  tile, by priority.
- **A habitat is a region × a kind** with at least ~15 tiles. Its tiles move with the sim; it keeps its identity, so
  it doesn't flicker.
- **Names from what holds it:** the kind's noun with the leading plant: "Fern forest", "Mossy stream", "Lichen
  barrens", "Windy cliff", "Ash scar"; the region tells twins apart. A new lead renames it, as news.
- Each habitat is a place with its own 3 slots, listed under its region. A **Habitats** map view (key 0): habitat
  tiles tinted by kind, names when zoomed in.
- **Feed lines:** "A Fern forest grew on Echo Tube mouth"; "The barrens on the Lee lava, south are gone".

## Out of scope
Gains changing biomass, lineages, runs, releases and forecasts, seasons and new events, moss holding water, height,
lazy regions, winning wild holders, genome changes, the species screen (P23), guilds (habitat × food, later),
hiding (shade and caves making prey harder to catch: a later sim change, P25 e).

## Done when
- [x] A: `npm run check` and `npm run sim` 5×60 pass with the wind side; shifts noted. Open lava: windward water
  ≥ 0.08 above the lee's. 8–14 regions per seed, each ≥ ~60 tiles, every land tile in one, unique names.
- [x] B: counters add up (taken ≤ produced + stored); at 30–60 min every seed shows at least one open food link
  (Slug eater, Fern grazer or similar), and holders change only a few times an hour. The slot update costs under
  0.3 ms per tick on average.
- [x] B tests (few): roles from data (Fern grazer exists with no fern eater); hysteresis keeps a holder at a
  near-equal share.
- [ ] C: 3–10 habitats per seed at 30–60 min, unique names; a habitat keeps its id while its tiles move.
- [ ] **You:** can you tell at a glance what each place has and lacks? Does a slot opening or changing hands feel
  like news? Do you want to fill one, and which? Do habitats feel like places the island grew?

## Build notes

### Part A: the wind side and the regions (29 Oct)
- **Wind** (`island.ts`, numbers in `NUM.island.wind`): direction by seed (`s.windFrom`), `s.windward` per tile
  (1 = windward edge, 0 = lee edge). The rain ramp is a smoothstep from +0.12 to −0.05 and is **added on top of the
  landmarks** (not just under them): with "strongest wins" alone, vents placed at random decided the medians and
  some seeds came out wetter in the lee. Spray: salt 0.3 on the windward coast (from the middle of the windward
  half), half that 2 tiles in.
- **The wind check is on the open lava** (windward lava vs lee lava regions). Across all land the gap swings with
  where the vents fell (0.02–0.2 apart on base water), so `npm run sim` prints both and checks the lava.
- **Regions** (`src/sim/regions.ts`, `s.region`, `s.regions`): each landmark claims tiles within its `area.reach`
  (vent 6, spring 3, beach 2, tube 3; same rough edges as the effects; the nearer one wins), the rest of the lava
  splits by wind side and is cut into pieces of ~550 tiles (k-means). Strays and pieces under 60 tiles join the
  neighbour with the longest border; above 14, the smallest joins one. 20 seeds: 11–14 regions, 60–900 tiles,
  names unique. Tube mouths are small and often merge into a vent field.
- **View:** a Regions map view (key 9): tinted by kind (vent orange, spring blue, beach sand, tube violet, windward
  lava teal, lee lava tan), faint borders, the hovered region brighter; the readout names the wind. Region names
  show only in the Regions view (your call: less clutter); landmark names when zoomed in. The tile card names the region and the side.
- **A door bug the wind exposed** (`keys.ts`): a nudge or key patch repainted every tile of its species in the patch,
  not just its own variant's, so on seed 1 the Oily nudge (its clock runs in step with Leafy's) wiped the Leafy
  candidate every 2 minutes and nothing opened in 60 minutes. Now all doors' candidates are found first, and patches
  leave other candidates and key carriers alone.
- **Sim shifts** (`npm run sim` 5×60, 5/5 pass): the island is wetter overall and more mixed. Lichens no longer lead
  (were 46–54% of their stratum, now club moss leads at 32–46%); moss ×2 (850–1560 tiles), fungi ×2, Hill 11–16
  (was 7–9). Open-lava water at 60 min: windward 0.44–0.47, lee 0.20–0.25. Slugs vanish on seed 4; springtails hit
  their cap on seed 5. Tick 3.3–3.9 ms (was 2.7–3.4).

### Part B: slots and the board (29 Oct)
- **Roles** (`src/data/roles.ts`, 17 now): 3 leads, a grazer per plant (8, "Crust grazer" for cyanobacteria), Litter
  eater, Decomposer, a hunter per animal (5: Snail eater, Slug eater, Springtail/Bristletail/Beetle hunter). Groups
  = base species. Icons: a glyph per kind; on the map a square (lead), a circle (eating) or a diamond (hunting).
- **Counters** (`src/sim/tally.ts`): per bucket (= region now; part C changes only `bucketOf` and the place sums) ×
  food (a group or litter) × made / taken by each group. Hooks: plant growth and seedlings (life.ts), grazing,
  litter eaten, catches, young born (agents.ts), litter falling via `drop()` (every old `s.fall +=`), litter plants
  make or fungi break down (fields.ts). Read-only: nothing reads them back into the sim.
- **One change from the spec (my call, easy to undo): a grazer's size is the regrowth capacity**, not the cover
  actually grown. A full, ungrazed moss mat grows ~0, so "cover grown" made untouched plants look like no food and
  Fern grazer never opened. Capacity = cover × palatability × grow × 0.25 per second (the curve model `expected()`
  uses). Cover grown is still counted (dev panel "made", the add-up test). Litter roles use litter fallen; hunters
  use young born; leads use the tiles a living plant of the stratum could live on (its leading variant, fit > 0).
- **Slots** (`src/sim/slots.ts`): every 30 s, smoothed over ~3 min. Open below 15% (a holder keeps it down to 10%),
  a challenger needs +10%; exists from 3% of the role's largest; big open = among the 3 largest and ≥ 25% of the
  largest. Trend over the last 3 min (±15%). Fed by: grazers ← the plants' lead; litter roles ← the group that drops
  most; hunters ← the slot the prey eats in. "Yours" = a species you made (everything placed or adopted would
  otherwise count). Rows: a big open slot wins; else the lead with the most cover, and the eating and hunting links
  with the biggest share of their role's island food; a row only switches for one 25% better.
- **Feed** (after 2 min): a board row that opens or changes holder; the island's best changing; a role newly open
  across the island. Timing uses an injected clock (`timer`), since `src/sim` may not read the time.
- **UI:** a Regions tab (the chosen place's 3 rows, the island's best, all places with their icons), slot icons
  under each region name in the Regions view (click a name, or a tile in that view, to choose the place), click a
  row to light up the holder's tiles and animals there. Dev panel: the place's slots (size/min, use, the last window
  made and taken, worth = size against the role's largest × share × the holder's mean fit over the place × 100) and
  the update's cost.
- **Numbers** (`npm run sim` 5×60, 5/5 pass; `NUM.slots`): open food links on the board at 30–60 min ≥ 13–19 per
  seed (beetles stay at 1–2, so hunters are always open; most grazers too); 0.36–0.56 holder changes per board row
  per hour; **47–74 feed lines an hour** (a lot next to the other news); window update 0.011–0.016 ms/tick. Whole
  tick on seed 1, 30 min, idle machine: 3.44 ms vs 3.19 without the slot code (+0.25 ms, mostly the hooks).
