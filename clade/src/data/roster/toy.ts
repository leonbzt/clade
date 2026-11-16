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
  // The quiet sea (*decided 16 Nov*): wild species arrive only in a place where you hold a cell, so the far sea stays
  // open for your next line. With `true` every cell in reach was full by the first card (the toy keeps the switch).
  barsNextDoor: false,
  pick: 3, // a colonist is one of the best `pick` candidates, chosen by the seed and the cell
  variantBar: 24, // generations between variants in a held cell
  variantStay: 12, // generations a variant stays beside the holder before it wins or goes
  rare: 4, // every `rare`-th variant of a cell carries a mutation instead of a dial step
  fade: 24, // generations a holder may read F before its cell opens
  news: 30, // news lines kept
  // Round two (16 Nov).
  challenge: 1.25, // a rival comes for a held cell when it reads this many times the holder's value (half a letter)
  rivalBar: 48, // generations a rival takes to arrive: four Lives to answer it
};

/** The lines that open after the first, in order: each when you hold `cards` cards in all. `start` is the line's
 *  first build: no named species, and it reads D or better somewhere in the toy's sea (tests/model/data.test.ts).
 *  A stand-in for the tree as the unlock map (W5); the rising cost is the user's wish of 16 Nov.
 *  The order (*decided 16 Nov*): a line that lives on rock comes second, because the first line cannot hold rock and
 *  leaves it open. Lugworms eat what ragworms eat on the same ground and never found a cell: they come last. */
const grams = (g: number) => Math.log10(g);
export const LINES: { clade: string; cards: number; start: Build }[] = [
  { clade: 'periwinkles', cards: 1, start: { clade: 'periwinkles', dials: { size: grams(0.5), guard: 0, brood: 0 }, mutations: [] } },
  { clade: 'urchins', cards: 2, start: { clade: 'urchins', dials: { size: grams(15), guard: 0 }, mutations: [] } },
  { clade: 'shore-crabs', cards: 3, start: { clade: 'shore-crabs', dials: { size: grams(8), bite: 0, guard: 0 }, mutations: [] } },
  { clade: 'octopuses', cards: 4, start: { clade: 'octopuses', dials: { size: grams(150), bite: 0, speed: 0 }, mutations: [] } },
  { clade: 'lugworms', cards: 6, start: { clade: 'lugworms', dials: { size: grams(1.5), guard: 0 }, mutations: [] } },
];
