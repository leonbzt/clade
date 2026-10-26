// The tree of life for this slice: a few real nodes, each with a visible list of requirements.

export type Req =
  | { kind: 'soil'; depth: number; tiles: number }
  | { kind: 'cover'; species: string; tiles: number };

export type TreeNode = {
  id: string;
  name: string;
  parent: string | null;
  species?: string; // reaching this node lets you found this species
  cost: number; // biomass
  reqs: Req[];
  fact: string;
};

export const TREE: TreeNode[] = [
  { id: 'land', name: 'Land plants', parent: null, cost: 0, reqs: [],
    fact: 'All land plants descend from freshwater green algae.' },
  { id: 'mosses', name: 'Mosses', parent: 'land', species: 'moss', cost: 0, reqs: [],
    fact: 'On Surtsey, a volcanic island that rose off Iceland in 1963, mosses were among the first plants, near steam vents.' },
  { id: 'vascular', name: 'Vascular plants', parent: 'land', cost: 800,
    reqs: [{ kind: 'soil', depth: 1, tiles: 40 }, { kind: 'cover', species: 'moss', tiles: 60 }],
    fact: 'Vascular plants have tissues that carry water, so they can grow taller than mosses.' },
  { id: 'lycophytes', name: 'Club mosses', parent: 'vascular', species: 'clubmoss', cost: 300, reqs: [],
    fact: 'Club mosses are not mosses: they are vascular plants from a lineage over 400 million years old.' },
  { id: 'ferns', name: 'Ferns', parent: 'vascular', species: 'fern', cost: 5000,
    reqs: [{ kind: 'soil', depth: 2, tiles: 30 }],
    fact: 'Ferns spread by spores made in sori, the brown dots under their fronds.' },
];

export const START_REACHED = ['land'];
