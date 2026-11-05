// The habitat boards: plain data (the garden will write them). The mud flats are ported from toys/life2-habitats.ts
// with R2's corrections; the sand shallows and volcanic rock are new for slice 09 (geology, plan.md 5 Nov).
// Maps are 8 columns × 11 rows, the shore at the top. x and y count from 0 at the top left.
import type { NodeId, PartId, PlanId, Terrain } from './life';
import type { PreyKind } from './prey';

//   . sand   ~ mud   # rock   % vent water (dead water)
//   m microbial mat   s shell bed   c carcass (on sand)   b buried food (in mud)   o sulfur mat (in vent water)
export const CELL: Record<string, [Terrain, NodeId | null]> = {
  '.': ['sand', null], '~': ['mud', null], '#': ['rock', null], '%': ['dead', null],
  m: ['sand', 'mat'], s: ['sand', 'shell'], c: ['sand', 'carcass'], b: ['mud', 'buried'], o: ['dead', 'bloom'],
};

export type HabitatId = 'mud' | 'sand' | 'rock';
export type Ground = 'mud' | 'sand' | 'basalt';
export interface Rival { at: [number, number]; name: string; eats: NodeId }
/** A board event: from turn to turn, on one terrain or all, optionally only in rows [top, bottom]. */
export interface BoardEvent { from: number; to: number; where: 'all' | Terrain; rows?: [number, number]; name: string; text: string; look: 'murk' | 'dry' | 'haze' }
export interface Habitat {
  id: HabitatId; name: string; ground: Ground; pitch: string; blurb: string; real: string; map: string[];
  start: [number, number]; entry: [number, number]; predatorAt: number; predator: string; rivals: Rival[];
  event: BoardEvent; rares: Record<PlanId, PartId[]>; tiers: [string, number][];
  prey: { kind: PreyKind; at: [number, number] }[]; // the predator Life's prey
}

export const MUD_FLATS: Habitat = {
  id: 'mud', name: 'Mud flats', ground: 'mud', pitch: 'Hidden food in soft mud. Mudslide on turns 12–15.',
  blurb: 'Soft mud full of hidden food. Burrowers rule until the mudslide, when the mud has no oxygen.',
  real: 'Mud slumps swept animals from banks beside a reef cliff into deeper water and buried them.',
  map: [
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
  event: { from: 12, to: 15, where: 'mud', name: 'Mudslide', text: 'no oxygen in the mud', look: 'murk' },
  rares: { arthropod: ['compound', 'progenesis'], worm: ['deep', 'progenesis'], swimmer: ['fan', 'progenesis'] },
  prey: [{ kind: 'worm', at: [1, 3] }, { kind: 'worm', at: [6, 4] }, { kind: 'worm', at: [2, 9] }, { kind: 'trilobite', at: [6, 1] }, { kind: 'wiwaxia', at: [4, 7] }],
  tiers: [['S', 56], ['A', 40], ['B', 26], ['C', 14], ['D', 5], ['F', 0]],
};

export const SAND_SHALLOWS: Habitat = {
  id: 'sand', name: 'Sand shallows', ground: 'sand', pitch: 'Long moves, nowhere to hide. Low tide by the shore.',
  blurb: 'Open rippled sand: long moves, nowhere to hide. The richest mats grow by the shore, which runs dry at low tide.',
  real: 'Cambrian shores were sandy shallows; trilobites left their trackways in the ripples.',
  map: [
    'mm.m.mm.',
    '.m.m..m.',
    'm..s.m.m',
    '.m..#.m.',
    '.s.~~..s',
    '...~b.m.',
    'm.s....s',
    'm.#..m.m',
    '.s...~~.',
    'm..s.~b.',
    '..c...s.',
  ],
  start: [4, 6], entry: [7, 10], predatorAt: 4, predator: 'Anomalocaris',
  rivals: [{ at: [1, 8], name: 'Wiwaxia, a scaled grazer', eats: 'mat' }],
  event: { from: 9, to: 12, where: 'all', rows: [0, 2], name: 'Low tide', text: 'the three rows by the shore run dry', look: 'dry' },
  rares: { arthropod: ['enrol', 'progenesis'], worm: ['hook', 'progenesis'], swimmer: ['fan', 'progenesis'] },
  prey: [{ kind: 'trilobite', at: [1, 1] }, { kind: 'trilobite', at: [6, 2] }, { kind: 'trilobite', at: [3, 9] }, { kind: 'worm', at: [4, 5] }, { kind: 'wiwaxia', at: [6, 7] }],
  tiers: [['S', 48], ['A', 34], ['B', 22], ['C', 12], ['D', 4], ['F', 0]],
};

export const VOLCANIC_ROCK: Habitat = {
  id: 'rock', name: 'Volcanic rock', ground: 'basalt', pitch: 'Basalt lanes; rich vents with no oxygen.',
  blurb: 'Basalt lanes cut your moves short. Warm vents grow rich sulfur mats in water with no oxygen, where the hunter will not follow.',
  real: 'Sulfur-eating microbes grow thick mats where warm, oxygen-poor water seeps out of volcanic rock.',
  map: [
    'm.#..#.m',
    '.s#.m#s.',
    'm.#%o#.m',
    'm..o%...',
    '##.%%.##',
    '.m.mm.m.',
    's#.~b.#s',
    'm#.~~.#m',
    'm..#%o..',
    '.s.#o%m.',
    '.mm#.ms.',
  ],
  start: [5, 5], entry: [0, 5], predatorAt: 5, predator: 'Anomalocaris',
  rivals: [{ at: [7, 10], name: 'a rival bristle worm', eats: 'bloom' }],
  event: { from: 8, to: 10, where: 'all', name: 'Vent surge', text: 'warm water, oxygen falls everywhere', look: 'haze' },
  rares: { arthropod: ['blood', 'progenesis'], worm: ['symbiont', 'progenesis'], swimmer: ['fan', 'progenesis'] },
  prey: [{ kind: 'trilobite', at: [1, 0] }, { kind: 'trilobite', at: [6, 9] }, { kind: 'wiwaxia', at: [1, 5] }, { kind: 'wiwaxia', at: [6, 1] }, { kind: 'worm', at: [4, 6] }],
  tiers: [['S', 44], ['A', 32], ['B', 22], ['C', 12], ['D', 4], ['F', 0]],
};

export const HABITATS: Record<HabitatId, Habitat> = { mud: MUD_FLATS, sand: SAND_SHALLOWS, rock: VOLCANIC_ROCK };
export const HAB_ORDER: HabitatId[] = ['sand', 'mud', 'rock'];
