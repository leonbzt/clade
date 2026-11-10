// Fixed dev-bar choices, shared by placement and the N1 presets. No build editor until N2.
import type { Lineage, Species } from '../sim/records';

export const DEV_LINEAGES: Lineage[] = [
  { id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'none' },
  { id: 'arthropod-line', clade: 'arthropod', xp: 0, ranks: {}, job: 'none' },
];

export const DEV_SPECIES: Species[] = [
  { id: 'root-worm', lineage: 'worm-line', parent: null, name: 'Bare worm', born: 0,
    build: { clade: 'worm', parts: {}, genes: { size: 1, gut: 1 } } },
  { id: 'tentacle-worm', lineage: 'worm-line', parent: 'root-worm', name: 'Tentacle worm', born: 0,
    build: { clade: 'worm', parts: { front: 'tentacles' }, genes: { size: 1, gut: 1 } } },
  { id: 'bulb-worm', lineage: 'worm-line', parent: 'root-worm', name: 'Bulb worm', born: 0,
    build: { clade: 'worm', parts: { tail: 'bulb' }, genes: { size: 1, gut: 1 } } },
  { id: 'sclerite-worm', lineage: 'worm-line', parent: 'root-worm', name: 'Sclerite worm', born: 0,
    build: { clade: 'worm', parts: { sides: 'sclerite' }, genes: { size: 1, gut: 1 } } },
  { id: 'arthropod', lineage: 'arthropod-line', parent: 'sclerite-worm', name: 'Arthropod', born: 0,
    build: { clade: 'arthropod', parts: { front: 'rake' }, genes: { size: 1, gut: 1 } } },
];
