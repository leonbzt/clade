// The tree of life for this slice: real nodes, each with a visible list of requirements. A node with a key
// requirement is a door: one of your variants opens it by meeting its recipe (KEYS) and splitting off.
// Quick, cheap unlocks first; Vascular plants is the gate into the midgame. Requirements stay met once reached.
// An arrival is a node whose species turns up by itself at a landmark once its habitat is there; you adopt it.
import type { LayerId } from './fields';
import type { LandmarkKind } from './landmarks';

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
  arrive?: { at: LandmarkKind; n: number; text: string }; // an arrival: n individuals show up at a landmark of this kind
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
  { id: 'animals', name: 'Animals', parent: 'life', cost: 40, reqs: [{ kind: 'cover', species: 'moss', tiles: 40 }],
    fact: 'Animals and fungi are sister groups: both come from one single-celled ancestor that plants split from long before.' },
  { id: 'hexapods', name: 'Hexapods', parent: 'animals', species: 'springtail', cost: 60,
    reqs: [{ kind: 'layer', layer: 'litter', min: 0.04, tiles: 60 }, { kind: 'cover', species: 'fungus', tiles: 40 }],
    arrive: { at: 'vent', n: 300, text: 'A gust dropped a cloud of springtails by {place}.' },
    fact: 'Springtails are not insects but their cousins. On Surtsey, tiny animals like them came on the wind within a year of the eruption.' },
  { id: 'snails', name: 'Land snails', parent: 'animals', species: 'snail', cost: 120,
    reqs: [{ kind: 'cover', species: 'moss', tiles: 90 }],
    arrive: { at: 'beach', n: 5, text: 'A drift log washed up at {place}. Five snails are riding on it.' },
    fact: 'Snails reach islands on floating logs and even on the feet of birds. Their lung is the old gill cavity, turned into an air sac.' },
  { id: 'slugs', name: 'Slugs', parent: 'snails', species: 'slug', cost: 200, reqs: [{ kind: 'key', gene: 'shellLost' }],
    fact: 'Slugs are snails that lost their shell. It happened many times, in lines that are not close kin.' },
  { id: 'insects', name: 'Insects', parent: 'hexapods', species: 'bristletail', cost: 300, reqs: [{ kind: 'key', gene: 'insectBody' }],
    fact: 'Bristletails look much like the first insects: no wings, a tough skin and three tail bristles. Wings came later, once.' },
  { id: 'beetles', name: 'Ground beetles', parent: 'hexapods', species: 'beetle', cost: 250,
    reqs: [{ kind: 'cover', species: 'springtail', tiles: 4 }, { kind: 'cover', species: 'snail', tiles: 3 }],
    arrive: { at: 'beach', n: 2, text: 'Two ground beetles crawled off a drift log at {place}.' },
    fact: 'Beetles are the largest order of animals. Ground beetles hunt on the soil surface, and some specialise in cracking snails.' },
];

export const START_REACHED = ['life'];

/** The door a node is (its key), or null. */
export const doorKey = (n: TreeNode) => (n.reqs.find((r) => r.kind === 'key') as { gene: string } | undefined)?.gene ?? null;
