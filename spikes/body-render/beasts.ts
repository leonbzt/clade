// A spike: more animals, from data alone. Each is one record for the general body; the look comes from the painter. Throwaway.
import { PAL } from '../../game/src/view/shade';
import { RAMPS } from '../../toys/creature-body';
import { LINEAGES, type Lineage, type LineageId, type PartId } from '../../toys/creature-data';

type Rec = Omit<Lineage, 'slots' | 'blurb' | 'sig'>;
const SLOTS: Lineage['slots'] = { front: 1, crown: 1, side: [4, 0.2, 0.8], back: [3, 0.2, 0.8], tail: 1 };
const NEW: Record<string, Rec> = {
  pikaia: { name: 'Pikaia', gait: 'ripple', skin: 'ridge', ramp: 'blue', lift: 4, ridge: 2.5, joints: [7, 1], len: [0.8, 0.14], R: [0.09, 0.016], width: [[0, 0.5], [0.1, 0.85], [0.4, 1], [0.85, 0.55], [1, 0.12]], bend: 3, turn: 30, plates: [7, 1], built: [{ part: 'tentacles', k: 0.5, style: 'palp', kind: 'front' }] },
  opabinia: { name: 'Opabinia', gait: 'flaps', skin: 'ridge', ramp: 'rival', lift: 7, ridge: 3.5, joints: [6, 0], len: [0.66, 0.08], R: [0.13, 0.016], width: [[0, 0.75], [0.15, 1], [0.8, 0.8], [1, 0.45]], bend: 0.7, turn: 16, plates: [8, 0], built: [{ part: 'eye', style: 'five', kind: 'crown' }, { part: 'tentacles', k: 1.1, style: 'palp', kind: 'front' }, { part: 'flap', n: 7, f: [0.18, 0.86], k: 0.85, kind: 'side' }, { part: 'fan', k: 0.8, kind: 'tail' }] },
  hallucigenia: { name: 'Hallucigenia', gait: 'legs', skin: 'bead', ramp: 'flesh', lift: 3, joints: [7, 1], len: [0.6, 0.12], R: [0.07, 0.012], width: [[0, 0.8], [0.15, 0.7], [0.5, 1], [1, 0.75]], bend: 3, turn: 24, built: [{ part: 'spine', n: [5, 1], f: [0.2, 0.85], k: 1.05, kind: 'side' }, { part: 'leg', n: [4, 1], f: [0.25, 0.9], k: 0.65, style: 'walk' }] },
  eurypterid: { name: 'Sea scorpion', gait: 'legs', skin: 'ridge', ramp: 'hunter', lift: 4, ridge: 4, joints: [7, 0], len: [0.9, 0.11], R: [0.17, 0.024], width: [[0, 0.8], [0.25, 1], [0.7, 0.6], [1, 0.22]], bend: 0.9, turn: 18, plates: [8, 1], seams: true, head: { len: 0.22, wide: 1.02, facets: 8, antennae: false }, built: [{ part: 'claw', k: 0.8, kind: 'front' }, { part: 'eye', style: 'dot', kind: 'crown' }, { part: 'leg', n: 3, f: [0.08, 0.28], k: 0.8, style: 'walk' }, { part: 'flap', n: 1, f: [0.3, 0.3], k: 0.9, style: 'fin', kind: 'side' }, { part: 'spine', k: 0.8, kind: 'tail' }] },
  orthocone: { name: 'Nautiloid', gait: 'creep', skin: 'ridge', ramp: 'shell', lift: 5, ridge: 4.5, joints: [5, 0], len: [0.9, 0.12], R: [0.13, 0.018], width: [[0, 1], [0.3, 0.94], [1, 0.25]], bend: 0.2, turn: 14, plates: [7, 1], built: [{ part: 'eye', style: 'dot', kind: 'crown' }, { part: 'tentacles', k: 0.95, kind: 'front' }] },
  arandaspis: { name: 'Jawless fish', gait: 'ripple', skin: 'ridge', ramp: 'shell', lift: 5, ridge: 3.5, joints: [7, 1], len: [0.8, 0.12], R: [0.16, 0.02], width: [[0, 0.82], [0.2, 1], [0.48, 0.72], [0.85, 0.32], [1, 0.1]], bend: 2, turn: 24, head: { len: 0.4, wide: 1.02, facets: 8, pale: 0.25 }, built: [{ part: 'eye', style: 'dot', kind: 'crown' }, { part: 'fan', k: 0.8, kind: 'tail' }] },
  fish: { name: 'Early fish', gait: 'ripple', skin: 'ridge', ramp: 'gill' as never, lift: 5, ridge: 3, joints: [7, 1], len: [0.8, 0.13], R: [0.14, 0.02], width: [[0, 0.55], [0.18, 0.95], [0.4, 1], [0.8, 0.45], [1, 0.14]], bend: 2, turn: 26, built: [{ part: 'eye', style: 'dot', kind: 'crown' }, { part: 'flap', n: 2, f: [0.28, 0.62], k: 0.8, style: 'fin', kind: 'side' }, { part: 'fan', k: 0.9, kind: 'tail' }] },
  salamander: { name: 'First walker', gait: 'legs', skin: 'bead', ramp: 'leaf', lift: 3, joints: [8, 1], len: [0.8, 0.15], R: [0.12, 0.022], width: [[0, 0.95], [0.12, 1], [0.5, 0.85], [1, 0.22]], bend: 3, turn: 26, built: [{ part: 'eye', style: 'dot', kind: 'crown' }, { part: 'leg', n: 2, f: [0.22, 0.62], k: 0.85, style: 'stub' }] },
};

export interface Beast { id: LineageId; size: number; parts?: Record<string, PartId> }
export function beasts(): Beast[] {
  Object.assign(RAMPS, { gill: PAL.gill, blue: PAL.blue });
  for (const [id, r] of Object.entries(NEW)) if (!LINEAGES[id as LineageId]) LINEAGES[id as LineageId] = { ...r, blurb: '', sig: 'leg', slots: SLOTS } as Lineage;
  const b = (id: string, size = 3, parts?: Record<string, PartId>): Beast => ({ id: id as LineageId, size, parts });
  return [
    b('worm', 3), b('bristle', 3), b('lobopod', 3), b('hallucigenia'),
    b('arthropod', 3, { front0: 'claw', side4: 'gill' }), b('crusher', 1), b('trilobite', 3), b('wiwaxia', 3),
    b('anomalocaris', 3), b('opabinia'), b('eurypterid'), b('orthocone'),
    b('pikaia'), b('arandaspis'), b('fish'), b('salamander'),
  ];
}
