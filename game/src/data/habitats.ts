// The habitat boards, ported from toys/life2-habitats.ts with R2's corrections. Plain data; the garden will write them.
import type { NodeId, PartId, PlanId, Terrain } from './life';

//   . sand   ~ mud   # rock   m microbial mat   s shell bed   c carcass (on sand)   b buried food (in mud)
export const CELL: Record<string, [Terrain, NodeId | null]> = {
  '.': ['sand', null], '~': ['mud', null], '#': ['rock', null],
  m: ['sand', 'mat'], s: ['sand', 'shell'], c: ['sand', 'carcass'], b: ['mud', 'buried'],
};

export interface Rival { at: [number, number]; name: string; eats: NodeId }
export interface Habitat {
  id: string; name: string; blurb: string; real: string; map: string[];
  start: [number, number]; entry: [number, number]; predatorAt: number; predator: string; rivals: Rival[];
  event: { from: number; to: number; where: 'all' | Terrain; name: string; text: string };
  rares: Record<PlanId, PartId[]>; tiers: [string, number][];
}

export const MUD_FLATS: Habitat = {
  id: 'mud', name: 'Mud flats',
  blurb: 'Soft mud full of hidden food. Burrowers rule until the mudslide, when the mud has no oxygen.',
  real: 'Mud slumps swept animals from banks beside a reef cliff into deeper water and buried them.',
  map: [ // the toy's 11 x 8 map turned a quarter (x and y swapped) to fill a phone held upright
    'm.m.sm.s',
    '.m..#.m.',
    '~~~~~~~m',
    '~b~b~~b~',
    'b~~~bb~b',
    '~~#~~~~~',
    '.~~..~~~',
    'm~~mc~bb',
    '~~b~~#~~',
    '~b~b~~b.',
    'b~~~b~mm',
  ],
  start: [3, 1], entry: [1, 10], predatorAt: 6, predator: 'Anomalocaris',
  rivals: [{ at: [4, 9], name: 'a rival priapulid worm', eats: 'buried' }],
  event: { from: 12, to: 15, where: 'mud', name: 'Mudslide', text: 'no oxygen in the mud' },
  rares: { arthropod: ['compound', 'progenesis'], worm: ['deep', 'progenesis'] },
  tiers: [['S', 56], ['A', 40], ['B', 26], ['C', 14], ['D', 5], ['F', 0]],
};
