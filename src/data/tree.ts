// The tree of life in slice 01: a start node, one target and one locked branch.
import type { TraitId } from './traits';

export type NodeId = 'landPlants' | 'mosses' | 'vascular';

export interface NodeDef {
  id: NodeId;
  name: string;
  parent: NodeId | null;
  precursors: TraitId[]; // must all be common before the key innovation shows up
  keyInnovation: TraitId | null; // common = node reached
  lockedBy: string | null; // a need the island can't meet yet
}

export const NODES: NodeDef[] = [
  { id: 'landPlants', name: 'Land plants', parent: null, precursors: [], keyInnovation: null, lockedBy: null },
  {
    id: 'mosses',
    name: 'Mosses',
    parent: 'landPlants',
    precursors: ['rhizoids', 'dryingOut', 'capsule'],
    keyInnovation: 'leafyShoot',
    lockedBy: null,
  },
  { id: 'vascular', name: 'Vascular plants', parent: 'landPlants', precursors: [], keyInnovation: null, lockedBy: 'needs soil' },
];

export const START_NODE: NodeId = 'landPlants';
export const TARGET_NODE: NodeId = 'mosses';
