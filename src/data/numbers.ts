// All tuning numbers. Pacing is rough on purpose; tune by feel with the dev panel.

export const NUM = {
  ticksPerSec: 10,
  map: { w: 40, h: 24, tile: 16 },
  island: {
    radius: 0.44, // share of the map
    beachWidth: 0.1, // share of the radius
    vents: 3,
    ventRadius: 7, // tiles; moisture falls to the base at this distance
    lavaMoisture: 0.08,
    beachMoisture: 0.45,
    crackShare: 0.12,
    crackMoisture: 0.2,
  },
  soil: { water: 0.12, capLava: 3, capBeach: 1, capBase: 0.8, capPerMoisture: 3 }, // dry ground keeps thin soil
  growth: 0.01, // per tick at fit 1
  spreadGrowthFloor: 0.3, // young tiles still spread a bit
  incumbentEdge: 0.25, // a newcomer must be this much stronger to take a tile
  takeover: 0.3,
  dieback: 0.01, // per tick, when a tile's occupant no longer fits
  yieldPerTick: 0.01,
  founding: { base: 40, growth: 3, patch: 1 }, // patch radius in tiles
  tiers: [['S', 0.85], ['A', 0.65], ['B', 0.45], ['C', 0.25], ['D', 0]] as const,
};
