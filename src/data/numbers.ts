// All tuning numbers. Pacing is rough on purpose; tune by feel with the dev panel and `npm run sim`.
// Rates are per second. Species numbers live in species.ts, layer numbers in fields.ts.

export const NUM = {
  ticksPerSec: 10,
  fieldsEvery: 10, // ticks between layer updates (they run with dt = 1 s)
  map: { w: 96, h: 56, tile: 12 },
  island: {
    radius: 0.45, // share of the map
    coastWidth: 0.07, // share of the radius: the ring where beaches can be
    lavaWet: 0.08,
    crackShare: 0.1,
    crackWet: 0.18,
    soilCapBase: 0.27, // soil cap on dry ground; plus the wetness
    // The prevailing wind (direction by seed): its rain adds to the base water everywhere, from `windward` on the
    // windward edge to `lee` on the far edge; its coast gets salt spray, fading over `sprayIn` tiles.
    wind: { windward: 0.12, lee: -0.05, spray: 0.3, sprayIn: 2 },
  },
  // The slot board (slots.ts): counters over windows of `window` s, smoothed over about `smooth` s. The biggest taker
  // holds a slot from a small floor, `open` of its size (a holder keeps it down to `keep`); below that it is open. A
  // challenger needs `hyst` more than the holder. Big open: among the `bigTop` largest of its role, and at least `bigShare` of the largest. A slot
  // exists from `exists` of its role's largest. A board row changes only for one `sticky` × bigger.
  slots: { window: 30, smooth: 180, open: 0.02, keep: 0.015, hyst: 0.1, bigTop: 3, bigShare: 0.25, exists: 0.03,
    sticky: 1.25, trend: 0.15, trendWindows: 6, warmup: 4 },
  // Habitats (habitats.ts): connected pieces of one kind, gaps of `gap` tiles bridged. A major one (named, on the
  // board) from `show` tiles, hidden below `hide`; a patch (hover only) from `patch`, a scrap below `scrap`. A vent scar lasts `scar`
  // seconds after a flare. A new lead renames a habitat once it has led for `rename` windows. Headlines: the last
  // `pinned` stay at the top of the feed; the same one isn't repeated within `repeat` seconds. A habitat growing is a
  // headline the first time only, its vanishing only after it stood `stood` seconds. A role's island's best is a
  // headline at most once per `bestEvery` seconds, and any two island's-best headlines are `bestGap` seconds apart;
  // the rest is chatter.
  habitats: { show: 50, hide: 35, patch: 8, scrap: 5, gap: 1, scar: 300, rename: 10, pinned: 3, repeat: 600, stood: 600, bestEvery: 1200,
    bestGap: 300 },
  // m² per tile (10 m tiles; masses.ts); the share of each gram of litter that decays into soil.
  mass: { tile: 100, litterSoil: 0.05 },
  // Nitrogen by the gram (nitrogen.ts), in g/m²: a share `leak` of what decay frees is lost; rain adds `rain` per
  // second everywhere (0.6 g/m² a year, a year ≈ 8 min); fresh land starts with `start` (ash and sea spray); `spread`
  // per second moves it toward its land neighbours (water, roots and hyphae), without loss. Uptake slows as it runs
  // low: at `half` g/m² a plant gets half of what it asks for, so some always stays in the soil.
  nitrogen: { leak: 0.1, rain: 0.6 / 480, start: 0.5, spread: 0.02, half: 1 },
  // Biomass is the grams made (plant growth, young born); every cost is its old number × this.
  cost: 1000,
  life: {
    stress: 1.5, // death rate × (1 + stress × (1 − health))
    oldEvery: 4, // old growth updates every this many ticks
    oldCover: 0.8, // old growth: cover above this, and health and cover within oldDelta of where they're heading
    oldDelta: 0.02,
    starve: 20, // seconds a plant lasts once its health is near 0
    dieback: 30, // seconds a dying plant takes to thin out from full cover
    dyingHold: 0.3, // a dying plant keeps this share of its hold on the tile
    settleCover: 0.05, // a new seedling's mass, as a share of what health allows
    reach: 2, // tiles a spore can travel from its parent
    incumbentEdge: 0.4, // a challenger must be this much stronger to take a living plant's tile
    takeover: 0.3, // chance it then does
    floor: 12, // your species' last tiles don't die
    rain: 1.2, // spore rain: tries per second per placed species, anywhere on the island
    rainMinFit: 0.3,
  },
  flare: { every: 150, radius: 4, soilLoss: 0.5 }, // a steam vent flares about every 150 s
  rateSmoothing: 30, // seconds; the shown income is an average
  trendEvery: 60, // seconds between "Mosses retreat" lines in the feed
  founding: { base: 40, growth: 2, patch: 2, cover: 0.3 }, // patch radius in tiles
  tiers: [['S', 0.85], ['A', 0.65], ['B', 0.45], ['C', 0.25], ['D', 0]] as const,
};
