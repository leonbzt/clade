// The tree of life for this slice: real nodes, each with a visible list of requirements.
// Quick, cheap unlocks first; Vascular plants is the gate into the midgame.

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
  { id: 'life', name: 'Life', parent: null, cost: 0, reqs: [],
    fact: 'A bare volcanic island: everything that lives here has to arrive and settle.' },
  { id: 'cyanobacteria', name: 'Cyanobacteria', parent: 'life', species: 'cyano', cost: 0, reqs: [],
    fact: 'Cyanobacteria were making oxygen by photosynthesis for billions of years before any plant existed.' },
  { id: 'land', name: 'Land plants', parent: 'life', cost: 20, reqs: [{ kind: 'cover', species: 'cyano', tiles: 12 }],
    fact: 'All land plants descend from freshwater green algae.' },
  { id: 'liverworts', name: 'Liverworts', parent: 'land', species: 'liverwort', cost: 30, reqs: [],
    fact: 'Many liverworts grow as flat green ribbons called thalli, and they dry out quickly.' },
  { id: 'mosses', name: 'Mosses', parent: 'land', species: 'moss', cost: 80,
    reqs: [{ kind: 'cover', species: 'liverwort', tiles: 15 }],
    fact: 'On Surtsey, a volcanic island that rose off Iceland in 1963, mosses were among the first plants, near steam vents.' },
  { id: 'fungi', name: 'Fungi', parent: 'life', cost: 150, reqs: [{ kind: 'cover', species: 'moss', tiles: 20 }],
    fact: 'Fungi are more closely related to animals than to plants.' },
  { id: 'lichens', name: 'Lichens', parent: 'fungi', species: 'lichen', cost: 250,
    reqs: [{ kind: 'cover', species: 'cyano', tiles: 30 }],
    fact: 'A lichen is a fungus living with algae or cyanobacteria. On fresh lava they slowly turn rock into soil.' },
  { id: 'vascular', name: 'Vascular plants', parent: 'land', cost: 1500,
    reqs: [{ kind: 'soil', depth: 1, tiles: 40 }, { kind: 'cover', species: 'moss', tiles: 60 }],
    fact: 'Vascular plants have tissues that carry water, so they can grow taller than mosses.' },
  { id: 'lycophytes', name: 'Club mosses', parent: 'vascular', species: 'clubmoss', cost: 300, reqs: [],
    fact: 'Club mosses are not mosses: they are vascular plants from a lineage over 400 million years old.' },
  { id: 'ferns', name: 'Ferns', parent: 'vascular', species: 'fern', cost: 5000,
    reqs: [{ kind: 'soil', depth: 2, tiles: 30 }],
    fact: 'Ferns spread by spores made in sori, the brown dots under their fronds.' },
];

export const START_REACHED = ['life'];
