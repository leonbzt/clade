// The garden's numbers: capacity, competition, spread, stocks, the half-year, biomass and sprouts. Tuned by feel
// (the dev panel); the model tests check the shape, not the values.

export const GARDEN = {
  /** Grams a tile holds per layer at full productivity (mat, herb, canopy): 0.2, 0.5 and 10 kg/m² on 100 m². */
  perTile: [20_000, 50_000, 1_000_000],
  /** Share of the gap to the target share closed per second (steady: ~5 min to settle). */
  rate: 1 / 300,
  /** A species can grow at most by this share of its grams per second, plus `seedGrow` g: growth starts slowly. */
  maxGrow: 0.0012, seedGrow: 0.5,
  /** A species above its target share shrinks only once the slot is fuller than this (crowding). */
  crowd: 0.85,
  /** Spread: share of grams per second flowing out along borders, × (0.3 + Cover) × the Spread attribute. Runs every `spreadEvery` s. */
  spread: 0.00012, spreadEvery: 30,
  /** Below this a species dies out in a patch. Natives stay at least this (a seed bank). */
  dieBelow: 1,
  /** Stocks (water, light, nutrient) and the cached scores refresh every `stockEvery` s. */
  stockEvery: 30,
  /** Shade: a full canopy takes this share of the herb layer's light; a full herb layer of the mat's. */
  canopyShade: 0.65, herbShade: 0.45,
  /** The half-year: water × (1 ± swing), over `period` seconds (wet half first). */
  halfYear: { period: 1800, swing: 0.25 },
  /** Grams a release puts into its patch. */
  releaseGrams: [2_000, 5_000, 40_000],
};

export const ECONOMY = {
  startBiomass: 20_000, // grams
  /** Biomass per second per kilogram your lines hold (0.1 g/s per kg). */
  perKg: 0.1,
  /** Sprouts: one per `every` seconds at `refKg` held (× held/refKg, clamped to `min`…`max`). */
  sprout: { every: 900, refKg: 200, min: 0.5, max: 1.2, hold: 3, sportChance: 1 / 3, formChance: 0.4 },
  /** Biomass a run costs, by form, in grams (moss, herb, tree). */
  cost: { moss: 10_000, herb: 50_000, tree: 1_000_000 },
  saveEvery: 10, // seconds
  offlineCap: 8 * 3600, // seconds
};
