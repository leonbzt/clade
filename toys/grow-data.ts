// Grow toy (slice 00): numbers and genes. Tuning sits here on purpose.

export const W = 960, GROUND = 250, CELL = 24, COLS = W / CELL, ROWS = 12, H = GROUND + ROWS * CELL;

export const T = {
  seasons: 5,
  seasonTicks: 300, // 30 s at ×1
  tickMs: 100,
  startStore: 15,
  carry: 0.5, // share of the leftover store the heir's seed carries
  shootCost: 1, // per 8 px of stem
  leafCost: 0.15, // per leaf size step
  rootCost: 0.8,
  budCost: 4,
  reserve: 8, // with the verbs on, auto-growth leaves this much in the store
  pruneRefund: 0.5,
  upkeep: 0.0008, // per segment per tick
  leafUpkeep: 0.0005, // per leaf size step per tick
  leafRate: 0.03, // per leaf size step in full light per tick
  pocketRate: 0.06, // per root node in a pocket per tick
  plainRate: 0.03,
  trickle: 0.05, // the seed's own reserve
  rootCap: 3, // root nodes per cell that draw
  shadeFrom: 60, // the neighbour's shade fades from here (light = shade)…
  shadeTo: 420, // …to full light here
  shade: 0.3,
  selfShade: 0.8, // per leaf above
  pockets: 18,
  pocketAmount: [40, 90] as const,
  plainAmount: 12,
  stoneBase: 0.04,
  stoneRight: 0.24, // extra stone chance at the right edge
  rootLen: 7,
  maxNodes: 2500,
  previewSteps: 170,
};

/** Five places a seed can land, light falls to the left, stone rises to the right. */
export const SPOTS = [110, 290, 480, 670, 850];

export const LEVELS = 8;

export type GeneId =
  | 'internode' | 'branching' | 'angle' | 'upright' | 'leaf'
  | 'rootShare' | 'dive' | 'rootBranch' | 'hairs' | 'vigor';

export const GENES: { id: GeneId; name: string; lo: number; hi: number; help: string }[] = [
  { id: 'internode', name: 'Internode', lo: 5, hi: 12, help: 'long stems reach fast, cost more per step' },
  { id: 'branching', name: 'Branching', lo: 0.02, hi: 0.5, help: 'side buds per node' },
  { id: 'angle', name: 'Branch angle', lo: 15, hi: 75, help: 'narrow or wide crown' },
  { id: 'upright', name: 'Upright', lo: 0, hi: 1, help: 'lean up, favour the main stem' },
  { id: 'leaf', name: 'Leaf size', lo: 1, hi: 4, help: 'more light, more upkeep, more shade below' },
  { id: 'rootShare', name: 'Root share', lo: 0.15, hi: 0.75, help: 'growth spent below ground' },
  { id: 'dive', name: 'Root dive', lo: 0, hi: 1, help: 'shallow and wide, or deep' },
  { id: 'rootBranch', name: 'Root branching', lo: 0.02, hi: 0.5, help: 'side roots per node' },
  { id: 'hairs', name: 'Root hairs', lo: 0.6, hi: 1.8, help: 'uptake per root, and its cost' },
  { id: 'vigor', name: 'Vigour', lo: 0.6, hi: 3, help: 'growth steps per tick: fast, or banks for the seeds' },
];

export type Genes = number[]; // levels 0..LEVELS, in GENES order

export const gene = (g: Genes, id: GeneId) => {
  const i = GENES.findIndex((d) => d.id === id), d = GENES[i];
  return d.lo + ((d.hi - d.lo) * g[i]) / LEVELS;
};

export const BASE_GENES: Genes = GENES.map(() => 4);
