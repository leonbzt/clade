// All tuning numbers. Pacing is rough on purpose; tune by feel with the dev panel and `npm run sim`.
// Rates are per second. Species numbers live in species.ts, layer numbers in fields.ts.

export const NUM = {
  ticksPerSec: 10,
  fieldsEvery: 10, // ticks between layer updates (they run with dt = 1 s)
  map: { w: 40, h: 24, tile: 16 },
  island: {
    radius: 0.44, // share of the map
    beachWidth: 0.1, // share of the radius
    vents: 3,
    ventRadius: 5.5, // tiles; wetness falls to the base at this distance
    lavaWet: 0.08,
    beachWet: 0.45,
    crackShare: 0.12,
    crackWet: 0.2,
    beachSalt: 0.8,
    coastSalt: 0.3, // land next to the beach
    soilCapBeach: 0.35,
    soilCapBase: 0.27, // soil cap on dry ground; plus the wetness
  },
  life: {
    stress: 3, // death rate × (1 + stress × (1 − fit))
    starve: 15, // seconds a plant lasts where it can't live at all
    settleCover: 0.05, // cover of a new seedling
    incumbentEdge: 0.25, // a challenger must be this much stronger to take a living plant's tile
    takeover: 0.3, // chance it then does
    floor: 5, // your species' last tiles don't die
    rain: 0.3, // spore rain: tries per second per placed species, anywhere on the island
    rainMinFit: 0.3,
  },
  flare: { every: 150, radius: 2, soilLoss: 0.5 }, // a steam vent flares about every 150 s
  rateSmoothing: 30, // seconds; the shown income is an average
  trendEvery: 60, // seconds between "Mosses retreat" lines in the feed
  founding: { base: 40, growth: 3, patch: 1, cover: 0.3 }, // patch radius in tiles
  tiers: [['S', 0.85], ['A', 0.65], ['B', 0.45], ['C', 0.25], ['D', 0]] as const,
};
