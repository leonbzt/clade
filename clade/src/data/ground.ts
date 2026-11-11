// The sea's ground: what each sea tile is (depth band × substrate × exposure), the numbers that shape it, and the
// words that name habitats. Tiles are 10 m. Numbers are tuned by feel on the screenshot sheet.

export const DEPTHS = ['flat', 'shallows', 'slope', 'deep'] as const; // tide flat … deep edge
export const SUBSTRATES = ['sand', 'mud', 'rock'] as const;
export const EXPOSURES = ['sheltered', 'open'] as const;
export type Depth = (typeof DEPTHS)[number];
export type Substrate = (typeof SUBSTRATES)[number];
export type Exposure = (typeof EXPOSURES)[number];

/** Depth codes on the grid: 0–3 are the bands above; past the deep edge is open sea (not a habitat); land. */
export const OPEN = 4, LAND = 255;
export const SAND = 0, MUD = 1, ROCK = 2;
export const SHELTERED = 0, EXPOSED = 1;

export const GROUND = {
  w: 256, h: 168, // the map; the island's own 96 × 56 grid sits in the middle, so the island is about a third wide
  // Depth: roughened tiles from land. Tide flats are wide where it is sheltered and soft (bays, the lee, deltas).
  flat: 1, flatWide: 18, // tide flat width; wide where it is calm (lee or bay) and the bottom is soft
  bands: [30, 58, 92], // outer edges of the shallows, the slope and the deep edge; open sea beyond
  rough: [0.55, 1.5] as const, // a smooth field multiplies the distance to land: shallow banks, steep drop-offs
  roughCell: 40, // the field's feature size, in tiles
  warp: 14, warpCell: 28, // borders wander up to this many tiles, at this scale…
  warpNear: 0.5, // …but never more than this share of the distance to land, so the coast stays put
  bareArcs: 2, // bare coast alternates rock and mud in this many arcs around the island (old flows, silted plains)
  mix: [4, 18, 40, 80], // per band, the radius over which the commonest substrate wins (sediment mixes offshore)
  lee: 50, // a tile is in the island's lee when land lies upwind within this many tiles
  bayRadius: 7, bayShare: 0.5, // or when at least this share of the tiles around it is land (a bay)
  exposureBands: 2, // exposure splits only the flats and shallows; waves do not reach the slope
  minArea: 500, // pieces under this many tiles join the neighbour they share the most border with
  maxArea: 8000, // pieces over this are cut in parts around the island
  minHabitats: 10, maxHabitats: 16, // then the smallest joins a neighbour, or the largest halves, until in range
};

/** Name words (proposal): exposure + substrate + depth, "Lee mud flats". A feature word replaces the exposure. */
export const WORDS = {
  depth: { flat: 'flats', shallows: 'shallows', slope: 'slope', deep: 'deeps' } as Record<Depth, string>,
  substrate: { sand: 'sand', mud: 'mud', rock: 'rock' } as Record<Substrate, string>,
  exposure: { sheltered: 'Lee', open: 'Open' } as Record<Exposure, string>,
  vent: 'Vent', // the habitat nearest a vent
  stream: 'Stream', // the habitat at a stream's mouth
  compass: ['East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest', 'North', 'Northeast'], // twins
};
