// Mutations: discrete and rare, shared by id across clades (a clade lists at most six). A look is yours to collect
// and feeds no rule. A push moves a dial past its clade's range and costs upkeep. A key grants an adaptation (law 7).
import type { Mutation } from '../../model/types';

export const MUTATIONS: Mutation[] = [
  { id: 'pale', kind: 'look', name: 'Pale', does: 'A pale morph.' },
  { id: 'dark', kind: 'look', name: 'Dark', does: 'A dark morph.' },
  { id: 'red', kind: 'look', name: 'Red', does: 'A red morph.' },
  { id: 'green', kind: 'look', name: 'Green', does: 'A green morph.' },
  { id: 'banded', kind: 'look', name: 'Banded', does: 'A banded morph.' },
  { id: 'giant', kind: 'push', name: 'Giant', does: 'A size step past the clade\'s range.', dial: 'size', by: 0.5, cost: 0.05 },
  { id: 'thick', kind: 'push', name: 'Thick', does: 'One more point of guard.', dial: 'guard', by: 1, cost: 0.04 },
  { id: 'jaws', kind: 'push', name: 'Strong jaws', does: 'One more point of bite.', dial: 'bite', by: 1, cost: 0.04 },
  { id: 'fecund', kind: 'push', name: 'Fecund', does: 'One more point of brood.', dial: 'brood', by: 1, cost: 0.04 },
  { id: 'air-breathing', kind: 'key', name: 'Breathes air', does: 'Takes air through wet skin: it can live on the shore.', grants: 'air', cost: 0.05 },
];
export const MUTATION: Record<string, Mutation> = Object.fromEntries(MUTATIONS.map((m) => [m.id, m]));
