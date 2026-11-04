// Toy: a Life, v2. The garden's habitats, laid out as one transect from the sunlit reef down to the dead basin.
// Edit the maps by hand: 11 columns × 8 rows. x and y count from 0 at the top left.
//   . sand   ~ mud   # rock   % dead water
//   m microbial mat   s brachiopod bed   g sponge garden   c carcass (all on sand)
//   b buried food (in mud)   o sulfur mat   C carcass (both in dead water)
import type { NodeId, PartId, PlanId, Terrain } from './life2-data';

export const CELL: Record<string, [Terrain, NodeId | null]> = {
  '.': ['sand', null], '~': ['mud', null], '#': ['rock', null], '%': ['dead', null],
  m: ['sand', 'mat'], s: ['sand', 'shell'], g: ['sand', 'sponge'], c: ['sand', 'carcass'],
  b: ['mud', 'buried'], o: ['dead', 'bloom'], C: ['dead', 'carcass'],
};

export type HabitatId = 'reef' | 'mud' | 'basin';
export interface RivalSpec { at: [number, number]; name: string; eats: NodeId; yours?: boolean }
export const NO_PREDATOR = 99;
/** A board is plain data: the toy's fixed maps, or what the garden writes (toys/garden-board.ts). */
export interface Habitat {
  id: HabitatId; name: string; blurb: string; real: string; map: string[];
  start: [number, number]; entry: [number, number]; predatorAt: number; // NO_PREDATOR: none this time
  predator: string; rivals: RivalSpec[];
  event: { from: number; to: number; where: 'all' | 'mud'; name: string; text: string };
  rares: Record<PlanId, PartId[]>; // the first one you haven't passed on is offered at a moult
  tiers: [string, number][];
}

export const HABITATS: Record<HabitatId, Habitat> = {
  reef: {
    id: 'reef', name: 'Archaeocyath reef',
    blurb: 'Rock lanes and rich shell beds. The predator comes early, and only two small mud pockets to hide in.',
    real: 'Sponge-like archaeocyaths and microbes built the first big animal reefs.',
    map: [
      'm..#sm.#g.m',
      's#.m.#.#s#.',
      'm~~#.m.s...',
      '.~b#.##.#.s',
      'm.#.sg#.m..',
      '.#.s~~bm.#m',
      'm.m#~#s#.m.',
      'c..s.m.#s.g',
    ],
    start: [0, 3], entry: [10, 2], predatorAt: 5,
    predator: 'Anomalocaris', rivals: [{ at: [8, 5], name: 'Wiwaxia, a scaled grazer', eats: 'mat' }],
    event: { from: 0, to: -1, where: 'all', name: '', text: '' },
    rares: { arthropod: ['enrol', 'progenesis'], worm: ['hook', 'progenesis'] },
    tiers: [['S', 36], ['A', 26], ['B', 18], ['C', 11], ['D', 4], ['F', 0]],
  },
  mud: {
    id: 'mud', name: 'Mud flats',
    blurb: 'Soft mud full of hidden food. Burrowers rule until the mudslide, when the mud has no oxygen.',
    real: 'Mudflows buried the Burgess Shale animals where they lived.',
    map: [
      'm.~~b~.m~~b',
      '.m~b~~~~~b~',
      'm.~~~#~~b~~',
      '..~b~~.m~b~',
      's#~~b~.c~~b',
      'm.~~b~~~#~~',
      '.m~b~~~b~bm',
      's.m~b~~b~.m',
    ],
    start: [1, 3], entry: [10, 1], predatorAt: 6,
    predator: 'Peytoia', rivals: [{ at: [9, 4], name: 'a rival priapulid worm', eats: 'buried' }],
    event: { from: 12, to: 15, where: 'mud', name: 'Mudslide', text: 'no oxygen in the mud' },
    rares: { arthropod: ['compound', 'progenesis'], worm: ['deep', 'progenesis'] },
    tiers: [['S', 56], ['A', 40], ['B', 26], ['C', 14], ['D', 5], ['F', 0]],
  },
  basin: {
    id: 'basin', name: 'Sulfur basin',
    blurb: 'Dead water full of rich sulfur mats and sunken carcasses. The predator stays out, but you can only hold your breath so long.',
    real: 'Bacterial mats thrive where oxygen runs out, and most animals stay away.',
    map: [
      'm.%%o%%.o%m',
      '.m%%%%o%.%.',
      'm..m%o%%o%%',
      '.%%.m.m.%%%',
      'o%m%%.m.%oC',
      '%%o%~~%%%o%',
      'm%.~b~%o.%%',
      'C%%~b.m.%m%',
    ],
    start: [1, 0], entry: [7, 7], predatorAt: 6,
    predator: 'Hurdia', rivals: [{ at: [7, 3], name: 'a rival mat-grazing mollusc', eats: 'bloom' }],
    event: { from: 9, to: 11, where: 'all', name: 'Oxygen crash', text: 'oxygen falls everywhere' },
    rares: { arthropod: ['blood', 'progenesis'], worm: ['symbiont', 'progenesis'] },
    tiers: [['S', 44], ['A', 32], ['B', 22], ['C', 12], ['D', 4], ['F', 0]],
  },
};
export const HAB_ORDER: HabitatId[] = ['reef', 'mud', 'basin'];
