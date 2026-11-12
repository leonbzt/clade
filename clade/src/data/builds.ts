// Fixed dev-bar choices, shared by placement and the N1 presets. No build editor in N2.
import type { Lineage, Species } from '../sim/records';

export const DEV_LINEAGES: Lineage[] = [
  { id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'worm' },
  { id: 'arthropod-line', clade: 'arthropod', xp: 0, ranks: {}, job: 'arthropod' },
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
  { id: 'grazer-worm', lineage: 'worm-line', parent: 'tentacle-worm', name: 'Grazer worm', born: 0,
    build: { clade: 'worm', parts: { front: 'tentacles', sides: 'sclerite', tail: 'pouch' }, genes: { size: 1, gut: 1 } } },
  { id: 'digger-worm', lineage: 'worm-line', parent: 'bulb-worm', name: 'Digger worm', born: 0,
    build: { clade: 'worm', parts: { tail: 'bulb', eyes: 'eye', sides: 'pouch' }, genes: { size: 1, gut: 1 } } },
  // A wild hunter to place by hand (N4): it hunts the other worms here.
  { id: 'hook-worm', lineage: null, parent: 'root-worm', name: 'Wild hook worm', born: 0,
    build: { clade: 'worm', parts: { front: 'hook' }, genes: { size: 1, gut: 1 } } },
];
