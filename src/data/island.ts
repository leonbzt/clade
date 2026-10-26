// The placeholder island: a hex grid of cells, cut to an island shape. The art spikes replace this.

export const ISLAND = {
  radius: 9, // hex rings in the island grid
  seed: 1963, // Surtsey surfaced in November 1963
  shapeWobble: 1.6, // how ragged the coast is, in cells
  coastWaves: [
    // [waves around the coast, weight]; the weights plus 0.5 should stay within 0..1
    [2, 0.2],
    [3, 0.2],
    [5, 0.1],
  ] as [number, number][],
  fillJitter: 6, // cells of randomness in the garden's fill order
  beach: {
    // cells near the coast in this direction are beach
    angle: 110, // degrees, 90 = south (screen down)
    spread: 70, // degrees either side
    depth: 2, // cells inland from the coast
  },
  vent: { q: -2, r: -1 }, // the steam vent in the lava field
};
