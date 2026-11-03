// The home island: tile kinds, the generator's numbers, and succession. Tiles are 10 m.

export const SEA = 0, BEACH = 1, LAVA = 2, BARE = 3, FOREST = 4, WET = 5;
export const KIND_NAMES = ['Sea', 'Beach', 'Lava', 'Bare ground', 'Forest floor', 'Wet'];
/** Kinds that hold life (a patch kind). */
export const LIVING = [LAVA, BARE, FOREST, WET];

// Features painted on top (they don't change the rules beyond the water they leave).
export const F_NONE = 0, F_VENT = 1, F_SPRING = 2, F_STREAM = 3, F_CRACK = 4;

export const ISLAND = {
  w: 96, h: 56,
  radius: 0.46, // the coast's ellipse, × the map
  beaches: [3, 4] as const,
  vents: [1, 2] as const,
  springs: [2, 3] as const,
  streamLen: 40,
  crackShare: 0.08,
  // water, 0..1 (≥ wet makes a tile Wet)
  water: { base: 0.18, lee: 0.0, windward: 0.22, spring: 1, springReach: 4, stream: 0.85, streamReach: 2, crack: 0.08 },
  wet: 0.62,
  // soil depth at the start: 0 at a vent, up to `farSoil` far from it (× a rough field 0.7–1.3)
  farSoil: 0.5, soilCurve: 1.3,
  hot: 5, // tiles around a vent that stay lava
};

/** Soil depth turns Lava → Bare ground → Forest floor. Wet stays Wet (water decides it). */
export const SUCCESSION = {
  bare: 0.3,
  forest: 0.75,
  max: 1.2,
  // soil per second per unit of cover in each layer (mat, herb, canopy): your full moss cover takes lava to bare in
  // ~45 min, a full herb cover bare ground to forest in ~70 min. Natives build soil at `native` × that.
  rate: [7e-5, 1.1e-4, 1.6e-4],
  native: 0.08,
  // a layer builds soil only up to its cap: mats make thin soil (bare ground), herbs make forest floor
  cap: [0.45, 0.9, 1.2],
  every: 60, // seconds between soil updates
  flipEvery: 300, // seconds between kind changes (each one finds the habitats again, ~1 ms)
};

/** Habitats: patches of one kind, cut to at most `maxTiles`. */
export const PATCHES = { maxTiles: 60 };
