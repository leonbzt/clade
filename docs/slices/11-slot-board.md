# Slice 11: The slot board

**Question:** do slots that the sim makes read clearly on today's island, and do they make you want to fill them?

Builds on slice 10b and springtails on fungi (d8a6293). From P24 b and your calls (29 Oct): the sim makes the
slots, the board lives on the map as well as in a panel, and the wind side comes first. **Read-only:** nothing you
do changes yet, and the economy stays as it is. The plan behind it: [review-game-shape.md](../review-game-shape.md).

## In scope

### The wind side *(P21 f, first half)*
- A prevailing wind by seed. Base water ramps smoothly across the island, from about +0.12 on the windward edge to
  −0.05 in the lee (on top of `lavaWet` 0.08). The windward coast gets a weak salt spray (`salty` ~0.3, 2 tiles in).
  Numbers by feel.
- The tile card says windward or lee. Moss holding water stays for later.

### Regions
- Made once with the island and stored as a region id per tile (they don't change in this slice).
- Kinds: a landmark's surroundings (vent field, spring banks, beach shore, tube mouth), then the rest of the lava by
  wind side (windward lava, lee lava, cut into pieces if big). Tiny pieces merge into a neighbour.
- Names from the landmarks ("Hissing Vent field", "Shell Beach shore") and the wind ("Windward lava, north").
  Aim for 8–14 regions of at least ~60 tiles.

### Roles *(data: `src/data/roles.ts`)*
Generated from the data, with authored names and icons:
- **Space roles** (in tiles): one per plant stratum with producers (Ground cover, Herb layer), plus Nitrogen fixer
  (cover of species that make nitrogen without eating litter). Size = tiles where at least one species of that kind
  on the island could live (fit > 0); use = their cover. Succession grows these by itself (more soil, a bigger
  herb layer).
- **Flow roles** (per minute): an eater role per edible thing (Ground grazer, Herb grazer, Fungus grazer, Litter
  eater), Decomposer (litter broken down by fungi), and a hunter role per prey tag (Hexapod hunter, Snail hunter).
  Size = what's produced per minute in the region (cover regrowth, litter fall, prey born); use = what that role
  takes.
- Roles come from what's edible, not from who eats it today, so Herb grazer shows up as open once ferns spread.
  A role appears on the board once its size passes a small threshold somewhere.

### The numbers *(`src/sim/slots.ts`)*
- Counters per region over windows of 30 game seconds, by species: cover grown and grazed per stratum; litter
  fallen, eaten and decayed; prey born and caught. Smoothed over about 3 minutes.
- Per slot:
  - **size** and **use** (the share taken);
  - **holder:** the species with the biggest share, its leading variant there and that variant's tier;
  - **yours or wild** (yours: founded, split or adopted);
  - **trend:** up, flat or down;
  - **fed by:** the slot in the same region that supplies most of this one (grazers ← their stratum's cover;
    litter roles ← the producers that drop it; hunters ← the roles their prey hold; producers ← the fixer and
    decomposer there).
- **Open:** no holder above ~15% of the size. **Big open:** open, and among the largest of its role on the island.
- **Hysteresis:** a challenger takes over only with a clearly bigger share (~+10%), so holders don't flicker.
- The slots only read totals; nothing in the sim changes.

### View
- **On the map:** at the overview zoom, each region's name at its centre with a row of role icons: filled in the
  holder's colour (with a small mark when it's yours), hollow when open, glowing when big and open. A **Regions**
  map view tints the regions and draws faint borders.
- **The slot board** (a new Regions tab): the island's regions with "filled / open" counts, and below, the selected
  region's slots as rows: icon and name, a size bar, use %, the holder (name, colour, tier chip), the trend arrow,
  fed by. Click a region label or any tile to select its region; click a row to light up the holder's tiles or
  groups there.
- **Feed lines** when a slot opens or changes holder: "Herb grazer opened on the Lee lava, north"; "Dry Moss took
  the ground cover on Shell Beach shore".
- The tile card names the tile's region.

### Dev panel
- Per slot: raw size and use, the window values, and a **worth** preview (size × share × fit, scaled per region)
  to test the gains formula without touching the economy. The time the slot update takes.

## Out of scope
Gains changing biomass, lineages, runs, releases and forecasts, seasons and new events, moss holding water, height,
lazy regions, winning wild holders, genome changes, the species screen (P23).

## Done when
- [ ] `npm run check` passes. `npm run sim` 5×60 still passes its checks with the wind side; shifts are noted.
- [ ] Wind: the median water of windward land is clearly above the lee's (≥ 0.08 apart), and the species map
  shows it.
- [ ] Regions: 8–14 per seed, each ≥ ~60 tiles, every land tile in one, unique names.
- [ ] Slots: counters add up (taken ≤ produced + stored); at 30–60 min every seed shows at least one open slot
  (Herb grazer, Snail hunter or similar), and holders change only a few times an hour.
- [ ] The slot update costs under 0.3 ms per tick on average.
- [ ] Tests (few): roles from data (Herb grazer exists with no herb eater); hysteresis keeps a holder at a
  near-equal share; region ids cover all land.
- [ ] **You:** can you tell at a glance what each region has and lacks? Does a slot opening or changing hands feel
  like news? Do you want to fill one, and which? Do windward and lee read as different places?
