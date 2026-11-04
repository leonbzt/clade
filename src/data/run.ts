// The run's numbers and content: the side-view plot, growth, the stand, the light grid and each form's rules.
// From the grow toy (slices 00, 00b) and the stand (slice 03). 1 px = 1 cm.
import { BARE, FOREST, LAVA, WET } from './island';

export const W = 960, GROUND = 250, CELL = 20, COLS = W / CELL, ROWS = 14, H = GROUND + ROWS * CELL;
export const SKY_ROWS = Math.ceil(GROUND / CELL); // the light grid's rows, from the ground up
export const SPOTS = [150, 330, 500, 680, 850];

export const T = {
  tickMs: 100,
  start: { energy: 10, water: 10, nutrient: 8 },
  // growth (energy and water per segment)
  shootCost: 0.9, rootCost: 0.7, leafCost: 0.25, segWater: 0.25, hardCost: 2.5, progressCap: 2,
  // income
  leafRate: 0.016, leafThirst: 0.003, wilt: 0.25, pocketWater: 0.04, loamWater: 0.012, pocketNutrient: 0.02, rootCap: 3,
  upkeep: 0.0012,
  // buds and roots
  wakeChance: 0.008, rootBranch: 0.06, rootLen: 6, maxNodes: 2600, rootStuck: 0.3, // a blocked root tip stops (else turns)
  // verbs (the sapling's nutrient): a new root tip sent to a cell, a bud woken for a shoot, a cut's return
  wakeCost: 2, cutBack: 0.08, digBase: 2, digPerCell: 0.4,
  // world: pockets come in blobs; one rich nutrient pocket per plot; signs show pockets this shallow (rows)
  reveal: 2, pocketWaterAmt: [30, 70] as const, pocketNutrientAmt: [20, 45] as const, blob: [1, 4] as const,
  rich: 3, signRows: 7,
  neighbourDrain: { water: 0.012, nutrient: 0.004 },
  leanMin: 0.25, lean: 0.05,
  tree: { carry: 26, wood: 0.22, woodUpkeep: 0.3, shell: 5 },
  moss: {
    internode: 0.45, // × the gene's segment length
    cushion: 8, cushionPerThick: 9, // a cushion's height cap: 8 + 9 × thickness (cm)
    rhizoidLen: 3, rhizoidDepth: [6, 22] as const, // rhizoid depth by Dive (crack grip)
    surfaceWater: 0.0035, // per leaf near the ground per tick × moisture
    light: 0.4, // × a leaf's energy: mosses photosynthesise slowly
    rhizoidChance: 0.25, // × Root share: a new creeping segment puts down a rhizoid
    dust: 0.002, // nutrient per rhizoid per tick
    dryChance: [0.3, 0.2, 0, 0.05], // a tenth of the year is a dry spell (dormant): by kind (lava, bare, forest, wet)
  },
};

/** The stand: saplings per year, a year's length at 1× (s), its tenths (Health's reserve refills, moss may go dry),
 * and the verbs: a fed shoot's tips get `weight` × the growth for `ticks`; a shoot tip sent to a sky cell. */
export const STAND = {
  saplings: 3, yearSeconds: 70, tenths: 10, speeds: [1, 2, 4],
  feed: { cost: 2, ticks: 100, weight: 8 },
  lean: { base: 1, perCell: 0.4 },
};

/** The light grid: shade per unit of leaf size, a leaf's share in its own cell, the sun's widest angle from straight
 * up (set per plot), ticks between rebuilds, and how much a natives' crown starts below its top (× its height). */
export const LIGHT = { leaf: 0.03, own: 0.5, sun: 0.55, every: 5, crown: { tree: 0.5, shrub: 0.6, fern: 0.6, sedge: 1, grass: 1, lichen: 1, moss: 1 } };

// ---- the plot, by the patch's kind ----
export type NeighbourKind = 'tree' | 'shrub' | 'fern' | 'sedge' | 'lichen' | 'grass' | 'moss';
export interface Neighbour { kind: NeighbourKind; name: string; x: number; h: number; w: number; density: number; roots: number; depth: number }
export interface PlotKind {
  name: string; thirst: number; moisture: number;
  soil: { hard: number; stone: number; water: number; nutrient: number; waterDeep: boolean };
  sky: [string, string]; loam: string;
}
export const PLOT: Record<number, PlotKind> = {
  [LAVA]: { name: 'Lava', thirst: 1.3, moisture: 0.35, soil: { hard: 0.3, stone: 0.16, water: 0.035, nutrient: 0.025, waterDeep: true }, sky: ['#9ab8d6', '#efe0cc'], loam: '#3d3633' },
  [BARE]: { name: 'Bare ground', thirst: 1.15, moisture: 0.5, soil: { hard: 0.16, stone: 0.1, water: 0.045, nutrient: 0.045, waterDeep: true }, sky: ['#94bede', '#e6e6d4'], loam: '#4a3c30' },
  [FOREST]: { name: 'Forest floor', thirst: 1, moisture: 0.7, soil: { hard: 0.08, stone: 0.05, water: 0.04, nutrient: 0.07, waterDeep: false }, sky: ['#8cc6e6', '#d6ecf2'], loam: '#5a4330' },
  [WET]: { name: 'Wet', thirst: 0.8, moisture: 1, soil: { hard: 0.03, stone: 0.03, water: 0.08, nutrient: 0.04, waterDeep: false }, sky: ['#9cc7d8', '#dcefe6'], loam: '#4a3a2a' },
};
/** What a garden holder looks like beside you, by layer and kind; × its cover for size and shade. */
export const NEIGHBOUR_LOOK: Record<number, { kind: NeighbourKind; h: number; w: number; density: number; roots: number; depth: number }> = {
  0: { kind: 'lichen', h: 12, w: 90, density: 0.25, roots: 25, depth: 15 }, // mat
  1: { kind: 'shrub', h: 90, w: 130, density: 0.5, roots: 80, depth: 70 }, // herb (sedge in the wet, fern in forest)
  2: { kind: 'tree', h: 240, w: 230, density: 0.6, roots: 170, depth: 170 }, // canopy
};
