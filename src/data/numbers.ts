// Every timer and rate in slice 01. Rough on purpose: pacing is tuned later by feel.
// Times are in sim seconds.

export const NUMBERS = {
  sim: {
    tickDt: 0.1, // fixed step used by the frame loop and the dev skips
    seed: 1965, // Surtsey's year; any number works
  },

  intro: {
    sporeArrivesAt: 9, // the spore starts drifting in
    foundButtonAt: 15, // "Found here" shows
  },

  patch: {
    radius: 5, // hex rings around the vent (91 tiles)
    // dampness = 1 - ring / (radius + 1): 1 at the vent, ~0.17 at the edge
  },

  energy: {
    perTile: 1.0, // energy per second for one green tile...
    dampBonus: 0.6, // ...times (1 + dampBonus * dampness)
    photosynthesisPerLevel: 0.15, // +15% energy per level above 1
  },

  split: {
    start: { spread: 0.5, cushion: 0.2, spores: 0.3 },
  },

  spread: {
    baseCost: 22, // energy for the 2nd tile
    costGrowth: 1.09, // cost multiplies by this per tile owned
  },

  water: {
    capPerTile: 10, // the cushion holds this much per covered tile
    perEnergy: 1.0, // water per energy put into Cushion
    evaporation: 0.06, // share of stored water lost per second outside dry spells
    drainPerTile: 0.55, // per green tile per second at full dry-spell stress
  },

  drySpell: {
    firstAt: 60, // colony seconds until the first spell starts
    period: 90, // start to start
    warning: 10, // warned this long ahead
    duration: 20,
    rampTime: 6, // stress climbs from 0 to peak over this many seconds
    peakStress: 0.95,
    rain: 4, // rain after the spell; brown tiles revive during it
    recoveryTime: 35, // a revived tile climbs back to full energy over this long
  },

  resilience: {
    // a tile turns brown when stress > resilience
    damp: 0.85, // * dampness
    water: 0.8, // * (stored water / cap)
  },

  genes: {
    perEnergy: 0.03, // genes per energy put into Spores
  },

  goal: {
    coverTiles: 10, // goal 1, opens the gene pool
  },

  generation: {
    baseTime: 25, // the first generation timer...
    stepTime: 9, // ...grows by this per generation...
    maxTime: 60, // ...up to this
    variantsPerGeneration: 3,
    queueMax: 3, // offers waiting at once, after Photosynthesis level 2
    favourGain: 0.25, // a favour adds this to the trait's frequency
    favourBaseCost: 5, // genes
    favourCostGrowth: 1.25, // per favour made
    commonAt: 0.5, // a trait works and shows at this frequency
    offerMaxFreq: 0.9, // traits at or above this stop being offered
    homeNudge: 0.03, // drought traits rise this much per generation...
    homeNudgeDryBonus: 0.04, // ...plus this times the share of dry-edge tiles
    dryEdgeDampness: 0.5, // tiles below this count as the dry edge
  },

  photosynthesis: {
    xpPerEnergy: 1,
    // total XP to reach level 2, 3, ...; level 2 starts auto generations
    levels: [2800, 9000, 30000, 90000],
    autoGenerationsAt: 2,
  },

  reveal: {
    // generations completed before each panel shows
    tree: 4,
    fit: 5,
    releasePreview: 6,
  },

  release: {
    biomassPerTile: 0.07, // biomass/s per covered tile, times the sum of niche tier multipliers
    dispersalTime: 20, // spores drift across the island; skippable
    fillTime: 60, // patches grow logistically to their share in about this long
    fillStart: 0.02, // the first speckle of each patch
    fillSnap: 0.995, // fill counts as done past this
  },
} as const;

export type Numbers = typeof NUMBERS;
