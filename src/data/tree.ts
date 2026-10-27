// The tree of life for this slice: real nodes, each with a visible list of requirements.
// Quick, cheap unlocks first; Vascular plants is the gate into the midgame. Requirements stay met once reached.
import type { LayerId } from './fields';

export type Req =
  | { kind: 'layer'; layer: LayerId; min: number; tiles: number }
  | { kind: 'cover'; species: string; tiles: number }
  | { kind: 'gene'; species: string; gene: string }; // a key innovation appeared in that species

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
  { id: 'land', name: 'Land plants', parent: 'life', cost: 20, reqs: [{ kind: 'cover', species: 'cyano', tiles: 50 }],
    fact: 'All land plants descend from freshwater green algae.' },
  { id: 'liverworts', name: 'Liverworts', parent: 'land', species: 'liverwort', cost: 30, reqs: [],
    fact: 'Many liverworts grow as flat green ribbons called thalli, and they dry out quickly.' },
  { id: 'mosses', name: 'Mosses', parent: 'land', species: 'moss', cost: 80,
    reqs: [{ kind: 'gene', species: 'liverwort', gene: 'leafy' }],
    fact: 'On Surtsey, a volcanic island that rose off Iceland in 1963, mosses were among the first plants, near steam vents.' },
  { id: 'fungi', name: 'Fungi', parent: 'life', species: 'fungus', cost: 150, reqs: [{ kind: 'cover', species: 'moss', tiles: 90 }],
    fact: 'Fungi are more closely related to animals than to plants. Most of a fungus is a net of threads in the ground.' },
  { id: 'lichens', name: 'Lichens', parent: 'fungi', species: 'lichen', cost: 250,
    reqs: [{ kind: 'cover', species: 'cyano', tiles: 140 }],
    fact: 'A lichen is a fungus living with algae or cyanobacteria. On fresh lava they slowly turn rock into soil.' },
  { id: 'vascular', name: 'Vascular plants', parent: 'land', cost: 1500,
    reqs: [{ kind: 'layer', layer: 'soil', min: 0.3, tiles: 350 }, { kind: 'cover', species: 'moss', tiles: 280 }],
    fact: 'Vascular plants have tissues that carry water, so they can grow taller than mosses.' },
  { id: 'lycophytes', name: 'Club mosses', parent: 'vascular', species: 'clubmoss', cost: 300, reqs: [],
    fact: 'Club mosses are not mosses: they are vascular plants from a lineage over 400 million years old.' },
  { id: 'ferns', name: 'Ferns', parent: 'vascular', species: 'fern', cost: 5000,
    reqs: [{ kind: 'layer', layer: 'soil', min: 0.55, tiles: 400 }],
    fact: 'Ferns spread by spores made in sori, the brown dots under their fronds.' },
];

export const START_REACHED = ['life'];
