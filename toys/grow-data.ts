// Grow toy (slices 00, 00b): numbers and content. Tuning sits here on purpose. 1 px = 1 cm.

export const W = 960, GROUND = 250, CELL = 20, COLS = W / CELL, ROWS = 14, H = GROUND + ROWS * CELL;

// ---- forms: the form changes the rules, not the genome ----

export type FormId = 'herb' | 'tree';
export const FORMS: { id: FormId; name: string; blurb: string; seasons: number; seasonTicks: number }[] = [
  { id: 'herb', name: 'Herb', blurb: '5 seasons of 90 s. Each season ends in seeds: pick the heir. A good season earns a 4th seed.', seasons: 5, seasonTicks: 900 },
  { id: 'tree', name: 'Tree', blurb: 'One body for 8 seasons of 60 s. Leaves fall each winter, wood thickens, cuts re-sprout. Seeds at the end.', seasons: 8, seasonTicks: 600 },
];
export const formOf = (id: FormId) => FORMS.find((f) => f.id === id)!;

export const T = {
  tickMs: 100,
  start: { energy: 10, water: 10, nutrient: 8 },
  // growth (energy and water per segment)
  shootCost: 0.9, // energy per 8 px × thickness
  rootCost: 0.7,
  leafCost: 0.25, // energy per leaf size step
  segWater: 0.25, // shoots only: roots grow without water, to find it
  hardCost: 2.5, // ×cost into hard soil at thickness 1 (thicker pushes easier)
  progressCap: 2, // a tip banks at most this many segments' worth of energy
  // income
  leafRate: 0.016, // energy per leaf size step per tick in full light
  leafThirst: 0.003, // water per leaf size step per tick in full light
  wilt: 0.25, // leaf output when the water store is empty
  pocketWater: 0.04, // per root node in a water pocket per tick
  loamWater: 0.012, // × the habitat's moisture, per root node in loam
  pocketNutrient: 0.02, // per root node in a nutrient pocket per tick
  rootCap: 3, // root nodes per cell that draw
  upkeep: 0.0012, // energy per segment per tick × thickness
  selfShade: 0.8, // per leaf above
  // buds and roots
  wakeChance: 0.008, // per dormant bud per tick at Dominance 1
  rootBranch: 0.06, // + Buds × 0.12, per root segment
  rootLen: 6,
  maxNodes: 2600,
  // verbs (nutrient)
  wakeCost: 3,
  cutBack: 0.08, // nutrient back per segment cut
  digBase: 1,
  digPerCell: 0.5, // ×2 in hard soil
  digReach: 3, // cells from a root node
  newRootTip: 2, // extra when digging from a root node that isn't a tip
  // world
  reveal: 2, // cells
  pocketWaterAmt: [30, 70] as const,
  pocketNutrientAmt: [20, 45] as const,
  neighbourDrain: { water: 0.012, nutrient: 0.004 }, // per pocket in a root zone per tick
  ghostSteps: 14,
  // shoots lean toward light only when one side is clearly brighter
  leanMin: 0.25, lean: 0.05,
  tree: {
    carry: 26, // cm of stem a segment can carry above it, per unit of thickness
    wood: 0.22, // wood added per winter × Thickness gene × √(leaves carried); roots half
    woodUpkeep: 0.3, // wood costs this share of a living stem's upkeep (heartwood is mostly dead)
    shell: 5, // spring leaves come back on segments at most this many from their stem's end
  },
};

export const SPOTS = [150, 330, 500, 680, 850];

// ---- genes: 8, each 1–9 pips ----

export type GeneId = 'internode' | 'angle' | 'buds' | 'dominance' | 'leaf' | 'rootShare' | 'dive' | 'thickness';
export const PIPS = 9;
// plus / minus: what more pips gain and lose, in one line each
export const GENES: { id: GeneId; name: string; lo: number; hi: number; help: string; plus: string; minus: string }[] = [
  { id: 'internode', name: 'Internode', lo: 4, hi: 12, help: 'segment length', plus: 'reach, fast', minus: 'energy per segment, fewer buds per cm' },
  { id: 'angle', name: 'Angle', lo: 15, hi: 80, help: 'branch angle', plus: 'spread, less self-shade', minus: 'branches add no reach' },
  { id: 'buds', name: 'Buds', lo: 0.15, hi: 1, help: 'buds per segment (and side roots)', plus: 'branches, side roots', minus: 'energy split over more tips' },
  { id: 'dominance', name: 'Dominance', lo: 0, hi: 1, help: 'how long buds stay dormant', plus: 'one fast stem: reach', minus: 'narrow, branches only by verbs' },
  { id: 'leaf', name: 'Leaf', lo: 1, hi: 5, help: 'leaf size', plus: 'light: energy', minus: 'water, energy per segment, shade below' },
  { id: 'rootShare', name: 'Root share', lo: 0.15, hi: 0.7, help: 'share of growth energy sent below ground', plus: 'roots: water, nutrient', minus: 'slower shoots' },
  { id: 'dive', name: 'Dive', lo: 0, hi: 1, help: 'roots go sideways (low) or down (high)', plus: 'deep pockets', minus: 'misses shallow ones' },
  { id: 'thickness', name: 'Thickness', lo: 0.6, hi: 2, help: 'stem thickness (tree: how fast wood builds)', plus: 'toughness, hard soil, tall wood', minus: 'energy per segment, upkeep' },
];
export type Genes = number[]; // pips 1..PIPS, in GENES order
const IDX = Object.fromEntries(GENES.map((g, i) => [g.id, i])) as Record<GeneId, number>;
export const gene = (g: Genes, id: GeneId) => {
  const d = GENES[IDX[id]];
  return d.lo + ((d.hi - d.lo) * (g[IDX[id]] - 1)) / (PIPS - 1);
};
export const BASE_GENES: Genes = GENES.map(() => 5);

// ---- habitats ----

export type NeighbourKind = 'tree' | 'shrub' | 'fern' | 'sedge' | 'lichen';
export interface Neighbour { kind: NeighbourKind; x: number; h: number; w: number; density: number; roots: number; depth: number }
export interface Habitat {
  id: string; name: string; blurb: string;
  thirst: number; // × leaf water use
  moisture: number; // loam water
  soil: { hard: number; stone: number; water: number; nutrient: number; waterDeep: boolean };
  neighbours: Neighbour[];
  sky: [string, string]; loam: string;
}

export const HABITATS: Habitat[] = [
  {
    id: 'forest', name: 'Forest edge', blurb: 'A tree, a shrub and a fern crowd you. Rich, moist loam.',
    thirst: 1, moisture: 0.7,
    soil: { hard: 0.08, stone: 0.05, water: 0.04, nutrient: 0.07, waterDeep: false },
    neighbours: [
      { kind: 'tree', x: 110, h: 245, w: 240, density: 0.65, roots: 170, depth: 170 },
      { kind: 'shrub', x: 500, h: 105, w: 130, density: 0.5, roots: 90, depth: 80 },
      { kind: 'fern', x: 850, h: 45, w: 90, density: 0.4, roots: 50, depth: 40 },
    ],
    sky: ['#8cc6e6', '#d6ecf2'], loam: '#5a4330',
  },
  {
    id: 'lava', name: 'Lava field', blurb: 'Full sun, thirsty air. Hard soil and stone, few pockets, water deep.',
    thirst: 1.3, moisture: 0.35,
    soil: { hard: 0.3, stone: 0.16, water: 0.035, nutrient: 0.025, waterDeep: true },
    neighbours: [
      { kind: 'lichen', x: 330, h: 14, w: 60, density: 0.2, roots: 20, depth: 15 },
      { kind: 'fern', x: 680, h: 35, w: 70, density: 0.35, roots: 40, depth: 40 },
    ],
    sky: ['#9ab8d6', '#efe0cc'], loam: '#3d3633',
  },
  {
    id: 'hollow', name: 'Wet hollow', blurb: 'Sedge clumps steal the light low down. Soft, wet soil.',
    thirst: 0.8, moisture: 1,
    soil: { hard: 0.03, stone: 0.03, water: 0.08, nutrient: 0.04, waterDeep: false },
    neighbours: [
      { kind: 'sedge', x: 150, h: 95, w: 150, density: 0.6, roots: 80, depth: 60 },
      { kind: 'sedge', x: 500, h: 75, w: 120, density: 0.55, roots: 70, depth: 55 },
      { kind: 'sedge', x: 850, h: 105, w: 160, density: 0.6, roots: 85, depth: 60 },
    ],
    sky: ['#9cc7d8', '#dcefe6'], loam: '#4a3a2a',
  },
];

// ---- targets: weights on the stats (each stat scaled to 0..1 first) ----

export type StatId = 'reach' | 'spread' | 'roots' | 'toughness' | 'growth' | 'upkeep';
export const STAT_SCALE: Record<StatId, number> = { reach: 300, spread: 260, roots: 8, toughness: 3.5, growth: 10, upkeep: 12 };
export const TARGETS: { id: string; name: string; blurb: string; w: Partial<Record<StatId, number>> }[] = [
  { id: 'tall', name: 'Tall', blurb: 'Reach over everything, on a tough stem.', w: { reach: 0.55, toughness: 0.25, growth: 0.2 } },
  { id: 'cover', name: 'Low cover', blurb: 'Wide and low, cheap to keep.', w: { spread: 0.65, growth: 0.25, roots: 0.1, reach: -0.25, upkeep: -0.1 } },
  { id: 'deep', name: 'Deep rooter', blurb: 'Tap many pockets, stay tough.', w: { roots: 0.6, toughness: 0.2, growth: 0.2 } },
];
export const TIERS: [string, number][] = [['S', 85], ['A', 70], ['B', 55], ['C', 40], ['D', 25], ['F', 0]];
export const tierOf = (score: number) => TIERS.find(([, min]) => score >= min)![0];
