// The animals both pages draw: the same builds as the toy's comparison, one row each.
import { Arthropod } from '../../game/src/view/arthropod';
import { PAL } from '../../game/src/view/shade';
import { Swimmer, Wiwaxia } from '../../game/src/view/swimmer';
import { Worm, type BodySlot, type Creature } from '../../game/src/view/worm';
import { RAMPS } from '../../toys/creature-body';
import type { LineageId, PartId } from '../../toys/creature-data';

const slot = (kind: BodySlot['kind'], part: string, seg = 0, side = 'front'): BodySlot => ({ kind, side, seg, part: part as never });
const pair = (seg: number, part: string): BodySlot[] => [slot('side', part, seg, 'left'), slot('side', part, seg, 'right')];
export interface Row { label: string; lineage: LineageId; own: boolean; parts: Record<string, PartId>; today?: () => Creature; slots: BodySlot[] }
export const ROWS: Row[] = [
  { label: 'Worm', lineage: 'worm', own: false, today: () => new Worm(PAL.you), slots: [slot('head', 'eye'), ...pair(0, 'gill'), ...pair(1, 'chaetae'), slot('tail', 'sclerite')], parts: { crown0: 'eye', side0: 'gill', side2: 'bristles', tail0: 'spine' } },
  { label: 'Arthropod', lineage: 'arthropod', own: false, today: () => new Arthropod(PAL.you, 1.2), slots: [slot('head', 'claw'), slot('head', 'eye'), ...pair(0, 'spine'), ...pair(1, 'gill'), ...pair(2, 'leg'), slot('tail', 'spine')], parts: { front0: 'claw', crown0: 'eye', side0: 'spine', side2: 'gill', side4: 'leg', tail0: 'spine' } },
  { label: 'Trilobite', lineage: 'trilobite', own: true, today: () => new Arthropod(RAMPS.trilo, 1.1, true), slots: [slot('head', 'eye'), ...pair(0, 'spine'), ...pair(1, 'gill')], parts: { crown0: 'eye', side0: 'spine', side2: 'gill' } },
  { label: 'Anomalocaris', lineage: 'anomalocaris', own: false, today: () => new Swimmer(PAL.you), slots: [], parts: {} },
  { label: 'Wiwaxia', lineage: 'wiwaxia', own: true, today: () => new Wiwaxia(), slots: [], parts: {} },
  { label: 'Bristle worm', lineage: 'bristle', own: false, today: () => new Worm(PAL.rival, true, 0.85), slots: [], parts: {} },
];
/** A small steady random, so every mode draws the same crowd. */
export function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
