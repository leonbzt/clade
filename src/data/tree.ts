// The tree of life for this slice: real nodes, each with a visible list of requirements. A node with a key
// requirement is a door: one of your variants opens it by meeting its recipe (KEYS) and splitting off.
// Quick, cheap unlocks first; Vascular plants is the gate into the midgame. Requirements stay met once reached.
import type { LayerId } from './fields';

export type Req =
  | { kind: 'layer'; layer: LayerId; min: number; tiles: number }
  | { kind: 'cover'; species: string; tiles: number }
  | { kind: 'key'; gene: string }; // a door: the key gene appeared in one of your variants (see KEYS)

export type TreeNode = {
  id: string;
  name: string;
  parent: string | null;
  species?: string; // reaching this node lets you found this species; on a door, the template your split builds on
  cost: number; // biomass
  reqs: Req[];
  fact: string;
};

export const TREE: TreeNode[] = [
  { id: 'life', name: 'Life', parent: null, cost: 0, reqs: [],
    fact: 'A bare volcanic island: everything that lives here has to arrive and settle.' },
  { id: 'cyanobacteria', name: 'Cyanobacteria', parent: 'life', species: 'cyano', cost: 0, reqs: [],
    fact: 'Cyanobacteria were making oxygen by photosynthesis for billions of years before any plant existed.' },
  { id: 'land', name: 'Land plants', parent: 'life', species: 'thallus', cost: 20, reqs: [{ kind: 'cover', species: 'cyano', tiles: 50 }],
    fact: 'All land plants descend from freshwater green algae. Liverworts and mosses are sister groups: they share one ancestor.' },
  { id: 'liverworts', name: 'Liverworts', parent: 'land', species: 'liverwort', cost: 30, reqs: [{ kind: 'key', gene: 'oil' }],
    fact: 'Many liverworts grow as flat green ribbons called thalli. Oil bodies in their cells are found in no other plants.' },
  { id: 'mosses', name: 'Mosses', parent: 'land', species: 'moss', cost: 80, reqs: [{ kind: 'key', gene: 'leafy' }],
    fact: 'On Surtsey, a volcanic island that rose off Iceland in 1963, mosses were among the first plants, near steam vents.' },
  { id: 'fungi', name: 'Fungi', parent: 'life', species: 'fungus', cost: 150, reqs: [{ kind: 'cover', species: 'moss', tiles: 90 }],
    fact: 'Fungi are more closely related to animals than to plants. Most of a fungus is a net of threads in the ground.' },
  { id: 'lichens', name: 'Lichens', parent: 'fungi', species: 'lichen', cost: 250,
    reqs: [{ kind: 'cover', species: 'cyano', tiles: 140 }],
    fact: 'A lichen is a fungus living with algae or cyanobacteria. On fresh lava they slowly turn rock into soil.' },
  { id: 'vascular', name: 'Vascular plants', parent: 'land', species: 'clubmoss', cost: 1500,
    reqs: [{ kind: 'layer', layer: 'soil', min: 0.3, tiles: 350 }, { kind: 'cover', species: 'moss', tiles: 150 }, { kind: 'key', gene: 'tracheids' }],
    fact: 'Vascular plants have cells that carry water, so they can grow tall. Club mosses are the oldest living line of them: not mosses at all, but over 400 million years old.' },
  { id: 'ferns', name: 'Ferns', parent: 'vascular', species: 'fern', cost: 5000,
    reqs: [{ kind: 'layer', layer: 'soil', min: 0.55, tiles: 400 }],
    fact: 'Ferns spread by spores made in sori, the brown dots under their fronds.' },
];

export const START_REACHED = ['life'];

/** The door a node is (its key), or null. */
export const doorKey = (n: TreeNode) => (n.reqs.find((r) => r.kind === 'key') as { gene: string } | undefined)?.gene ?? null;
