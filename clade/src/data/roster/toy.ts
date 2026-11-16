// The W1 toy's island and its clocks. The places are hand-made for the toy; W2 takes them from the real map.
import type { Build } from '../../model/types';

/** Your line at the start: a marine worm that is no named species yet. */
export const START: Build = { clade: 'ragworms', dials: { size: Math.log10(3), guard: 0, brood: 1 }, mutations: [] };

export interface PlaceRow { id: number; name: string; kind: string; area: number; next: number[] }
export const PLACES: PlaceRow[] = [
  { id: 0, name: 'Lee mud flats', kind: 'flat-mud-lee', area: 1800, next: [1, 2, 8, 10] },
  { id: 1, name: 'Lee sand shallows', kind: 'shallows-sand-lee', area: 2600, next: [0, 4, 5] },
  { id: 2, name: 'Open rock flats', kind: 'flat-rock-open', area: 900, next: [0, 3, 9] },
  { id: 3, name: 'Open rock shallows', kind: 'shallows-rock-open', area: 3000, next: [2, 4, 6] },
  { id: 4, name: 'Reef shallows', kind: 'shallows-rock-lee', area: 2200, next: [1, 3, 6] },
  { id: 5, name: 'Mud slope', kind: 'slope-mud', area: 5000, next: [1, 6, 7] },
  { id: 6, name: 'Rock slope', kind: 'slope-rock', area: 4000, next: [3, 4, 5, 7] },
  { id: 7, name: 'Sand deeps', kind: 'deep-sand', area: 7000, next: [5, 6] },
  { id: 8, name: 'Black beach', kind: 'shore-sand', area: 700, next: [0, 11] },
  { id: 9, name: 'Lava shore', kind: 'shore-rock', area: 800, next: [2, 12] },
  { id: 10, name: 'Salt flat', kind: 'shore-mud', area: 600, next: [0, 13] },
  { id: 11, name: 'Strand', kind: 'land-sand', area: 900, next: [8, 13] },
  { id: 12, name: 'Lava field', kind: 'land-rock', area: 3000, next: [9, 13] },
  { id: 13, name: 'Old flow', kind: 'land-mud', area: 1500, next: [10, 11, 12] },
];
export const HOME = 0;

export const TOY = {
  lifeGens: 12, // generations a Life takes, as in the game
  colonistBar: 36, // generations an open cell waits for a colonist: about three Lives
  barsNextDoor: true, // bars also run in places next to one you live in (the toy has a switch for it)
  pick: 3, // a colonist is one of the best `pick` candidates, chosen by the seed and the cell
  variantBar: 24, // generations between variants in a held cell
  variantStay: 12, // generations a variant stays beside the holder before it wins or goes
  rare: 4, // every `rare`-th variant of a cell carries a mutation instead of a dial step
  fade: 24, // generations a holder may read F before its cell opens
  news: 30, // news lines kept
};
