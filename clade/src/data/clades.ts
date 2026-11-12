// N1's clade tree. Gates are copied from game/src/data/lineages.ts; no gate rule runs until R6.
// Movement and senses are PLANS' numbers; mud reach follows tunnelling / stopped / double movement cost.
import type { Substrate } from './ground';
import type { Clade, CladeId, Food } from '../sim/records';

export const CLADES: Record<CladeId, Clade & {
  name: string; playable: boolean; endpointName?: string;
  speed: number; senses: number; mouth: Partial<Record<Food, number>>;
  substrate: Record<Substrate, number>;
}> = {
  cell: {
    id: 'cell', name: 'First cell', parent: null, chapter: 0, gate: [], plan: 'cell', mechanic: 'none',
    debated: false, playable: false, speed: 0, senses: 0, mouth: {}, substrate: { sand: 0, mud: 0, rock: 0 },
  },
  worm: {
    id: 'worm', name: 'Worm', parent: 'cell', chapter: 1, gate: [], plan: 'worm', mechanic: 'tunnel',
    debated: false, playable: true, endpointName: 'Ottoia', speed: 1, senses: 2,
    mouth: { mats: 0.3 }, substrate: { sand: 1, mud: 3, rock: 1 }, // weak mouth: under tentacles' 1 ÷ their doubled upkeep
  },
  arthropod: {
    id: 'arthropod', name: 'Arthropod', parent: 'worm', chapter: 2, gate: ['sclerite', 'proboscis'],
    plan: 'arthropod', mechanic: 'moult', debated: false, playable: true, endpointName: 'Sidneyia',
    endpoint: { from: 'worm', parts: ['sclerite', 'proboscis'], tier: 'B' }, speed: 2, senses: 1,
    mouth: { mats: 0.5 }, substrate: { sand: 1, mud: 0, rock: 1 },
  },
  trilobite: {
    id: 'trilobite', name: 'Trilobite', parent: 'arthropod', chapter: 3, gate: ['shield', 'digger'],
    plan: 'trilobite', mechanic: 'enrol', debated: false, playable: true, endpointName: 'Olenoides',
    endpoint: { from: 'arthropod', parts: ['shield', 'digger'], tier: 'B' }, speed: 2, senses: 2,
    mouth: { mats: 0.5 }, substrate: { sand: 1, mud: 0.5, rock: 1 },
  },
  swimmer: {
    id: 'swimmer', name: 'Swimmer', parent: 'arthropod', chapter: 3, gate: ['compound', 'flap'],
    plan: 'swimmer', mechanic: 'hunt', debated: false, playable: true, endpointName: 'Anomalocaris',
    endpoint: { from: 'arthropod', parts: ['compound', 'flap'], tier: 'B' }, speed: 2, senses: 3,
    mouth: {}, substrate: { sand: 1, mud: 1, rock: 1 },
  },
};

// Old life: older branches of the same trunk, wild, drawn faded on the tree. Names only; no rules read them.
export const OLD_LIFE = ['Mats', 'Algae', 'Sponges', 'Jellies'] as const;
