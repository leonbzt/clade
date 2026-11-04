// Toy A (slice 04): grow by turns. The board, the parts, the rules' numbers and the three plots. Tuned by feel.

export const COLS = 14, ROWS = 12, SKY = 6; // rows 0..SKY-1 are sky (row SKY-1 sits on the ground), the rest soil
export const TURNS = 12;

export type PartId = 'stem' | 'leaf' | 'flower' | 'root';
export type Cost = { e: number; w: number; n: number };
export const PARTS: Record<PartId, { name: string; key: string; cost: Cost; help: string }> = {
  stem: { name: 'Stem', key: '1', cost: { e: 1, w: 0, n: 0 }, help: 'next to a stem; carries leaves and flowers' },
  leaf: { name: 'Leaf', key: '2', cost: { e: 2, w: 0, n: 0 }, help: 'next to a stem; makes its light in energy, drinks 1 water a turn, shades the cells behind it' },
  flower: { name: 'Flower', key: '3', cost: { e: 3, w: 0, n: 2 }, help: 'next to a stem; 10 points at the end' },
  root: { name: 'Root', key: '4', cost: { e: 1, w: 0, n: 0 }, help: 'next to a root; reveals the soil around it and draws from a pocket it sits on' },
};
export const SKY_PARTS: PartId[] = ['stem', 'leaf', 'flower'];

export const RULE = {
  light: 2, // a leaf in open sun makes 2 energy; each leaf or native cell between it and the sun takes 1
  thirst: 1, droughtThirst: 2, // water per leaf per turn
  dampDraw: 2, droughtDraw: 1, richDraw: 1, nativeDraw: 1, // per root cell on a pocket, per turn
  flowerPoints: 10, // and every part is 1 g
  start: { e: 3, w: 4, n: 1 } as Cost,
  damp: [6, 10] as const, rich: [4, 6] as const, // a pocket cell's amount
  droughtAt: [5, 9] as const, // the drought turn, forecast from the start
};

/** A native's shape: shoot cells [dx, height] (height 1 = the row on the ground), root cells [dx, depth]. */
export interface NativeKind { name: string; shoot: [number, number][]; roots: [number, number][] }
export const NATIVES: Record<string, NativeKind> = {
  marram: {
    name: 'Marram grass',
    shoot: [[0, 1], [0, 2], [0, 3], [-1, 2], [1, 3], [-1, 4]],
    roots: [[0, 1], [0, 2], [0, 3], [1, 3], [0, 4], [-1, 4], [0, 5]],
  },
  beech: {
    name: 'Old beech',
    shoot: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [-1, 5], [1, 5], [2, 5], [-1, 6], [0, 6], [1, 6], [2, 6], [3, 6], [-2, 6]],
    roots: [[0, 1], [1, 1], [-1, 1], [0, 2], [2, 2], [1, 3], [0, 3], [3, 3], [-1, 4], [2, 4]],
  },
  sedge: {
    name: 'Sedge clump',
    shoot: [[0, 1], [0, 2], [0, 3], [0, 4], [-1, 1], [-1, 2], [-1, 3], [1, 1], [1, 2]],
    roots: [[-1, 1], [0, 1], [1, 1], [-2, 1], [2, 1], [0, 2], [-1, 2], [1, 2]],
  },
};

export interface Blobs { count: number; size: readonly [number, number]; depth: readonly [number, number] } // depth 1 = top soil row
export interface Plot {
  id: string; name: string; blurb: string;
  sun: number; // columns the sun's ray moves per row up: > 0 the sun is on the left, < 0 on the right
  edge: number; // shade from beyond the board's sides (the forest around a gap)
  rain: number; // water each turn (none in the drought)
  natives: { kind: string; at: readonly [number, number] }[];
  base: readonly [number, number]; // your seed's column
  damp: Blobs; rich: Blobs; stone: Blobs;
  target: number; // the score that counts as 100 for the tier (tuned by feel)
}

export const PLOTS: Plot[] = [
  {
    id: 'dune', name: 'Open dune', blurb: 'Low sun from the left, all light. Water lies deep; the grass drinks first.',
    sun: 1, edge: 0, rain: 1, base: [5, 8],
    natives: [{ kind: 'marram', at: [1, 3] }, { kind: 'marram', at: [10, 12] }],
    damp: { count: 3, size: [2, 4], depth: [3, 6] }, rich: { count: 2, size: [1, 3], depth: [2, 5] },
    stone: { count: 3, size: [1, 3], depth: [1, 4] }, target: 120,
  },
  {
    id: 'gap', name: 'Forest gap', blurb: 'High sun through a hole in the canopy. Litter makes rich soil; the beeches crowd the light.',
    sun: 0.3, edge: 2, rain: 1, base: [5, 8],
    natives: [{ kind: 'beech', at: [0, 1] }, { kind: 'beech', at: [11, 13] }],
    damp: { count: 3, size: [2, 3], depth: [2, 5] }, rich: { count: 3, size: [2, 3], depth: [1, 3] },
    stone: { count: 2, size: [1, 2], depth: [2, 6] }, target: 130,
  },
  {
    id: 'hollow', name: 'Wet hollow', blurb: 'Sun from the right. Water everywhere, the sedges thick, nutrient scarce and deep.',
    sun: -0.6, edge: 0, rain: 2, base: [5, 8],
    natives: [{ kind: 'sedge', at: [2, 4] }, { kind: 'sedge', at: [10, 12] }],
    damp: { count: 5, size: [2, 4], depth: [1, 4] }, rich: { count: 2, size: [1, 2], depth: [4, 6] },
    stone: { count: 2, size: [1, 3], depth: [2, 5] }, target: 110,
  },
];
