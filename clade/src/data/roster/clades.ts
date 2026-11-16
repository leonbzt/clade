// The clades: one row each. Every trait here is *drafted* from memory (direction §6); W3 checks them and fills `ott`
// and `parent`. A clade's diet, ground, adaptations, guard and counters are fixed; its species differ by dials only.
// base = [bite, guard, speed, senses, brood], 0–4. Dial ranges: size in grams (stored as log10), the rest in points.
import type { AdaptationId, Clade, DialId, DialSpec, Diet, FoodId, Ground, GuardKind, Range } from '../../model/types';

const ALL: Ground[] = ['sand', 'mud', 'rock'], OPEN: Range[] = ['water'];
const size = (minGrams: number, maxGrams: number): DialSpec => ({ id: 'size', min: Math.log10(minGrams), max: Math.log10(maxGrams), word: 'size' });
const dial = (id: DialId, word: string, max: number, min = 0): DialSpec => ({ id, min, max, word });

type Row = Pick<Clade, 'id' | 'name' | 'plan' | 'life' | 'diet' | 'ground' | 'adaptations' | 'mechanic' | 'dials'> &
  { guard?: GuardKind; beats?: GuardKind[]; base: [number, number, number, number, number]; mutations?: string[] };
const clade = (r: Row): Clade => {
  const [bite, guard, speed, senses, brood] = r.base;
  return { ...r, ott: 0, parent: null, guard: r.guard ?? null, beats: r.beats ?? [], base: { bite, guard, speed, senses, brood }, mutations: r.mutations ?? ['pale', 'dark'] };
};
/** A producer: a board piece that makes food stocks where it grows (law 5). */
const producer = (id: string, name: string, plan: string, ground: Ground[], adaptations: AdaptationId[], makes: Partial<Record<FoodId, number>>, grams: number): Clade =>
  ({ ...clade({ id, name, plan, life: null, diet: ['light'], ground, adaptations, base: [0, 0, 0, 0, 1], mechanic: 'none', dials: [size(grams, grams)], mutations: [] }), makes });

const WET: AdaptationId[] = ['water'], TIDAL: AdaptationId[] = ['water', 'tide', 'clinging'], LANDED: AdaptationId[] = ['rooted', 'air', 'dry'], SALTY: AdaptationId[] = [...LANDED, 'salt'];
const prey: Diet = 'prey';

export const CLADES: Clade[] = [
  // The first line (*decided 15 Nov*): a present-day marine worm.
  clade({ id: 'ragworms', name: 'Ragworms', plan: 'worm', life: 'forage', diet: ['mats', 'detritus'], ground: ['sand', 'mud'], adaptations: ['water', 'tide', 'walking'],
    guard: 'hiding', base: [1, 1, 1, 1, 2], mechanic: 'burrow', dials: [size(0.05, 30), dial('guard', 'burrow', 3), dial('brood', 'spawn', 2)],
    mutations: ['red', 'green', 'giant', 'jaws', 'fecund', 'air-breathing'] }),
  clade({ id: 'lugworms', name: 'Lugworms', plan: 'worm', life: 'dig', diet: ['detritus'], ground: ['sand', 'mud'], adaptations: ['water', 'tide'],
    guard: 'hiding', base: [0, 2, 0, 0, 2], mechanic: 'burrow', dials: [size(1, 15), dial('guard', 'burrow', 2)] }),
  clade({ id: 'limpets', name: 'Limpets', plan: 'snail', life: 'forage', diet: ['mats'], ground: ['rock'], adaptations: TIDAL,
    guard: 'shell', base: [2, 3, 0, 0, 1], mechanic: 'clamp', dials: [size(1, 40), dial('guard', 'shell', 2)], mutations: ['pale', 'banded', 'thick'] }),
  clade({ id: 'periwinkles', name: 'Periwinkles', plan: 'snail', life: 'forage', diet: ['mats', 'greens'], ground: ['rock'], adaptations: TIDAL,
    guard: 'shell', base: [2, 2, 0, 1, 1], mechanic: 'shell', dials: [size(0.1, 8), dial('guard', 'shell', 2), dial('brood', 'spawn', 2)], mutations: ['pale', 'banded', 'thick', 'air-breathing'] }),
  clade({ id: 'urchins', name: 'Sea urchins', plan: 'urchin', life: 'forage', diet: ['greens', 'mats'], ground: ['rock', 'sand'], adaptations: ['water', 'clinging'],
    guard: 'spines', base: [3, 2, 0, 0, 2], mechanic: 'spines', dials: [size(10, 400), dial('guard', 'spines', 3)], mutations: ['pale', 'dark', 'thick'] }),
  clade({ id: 'sea-cucumbers', name: 'Sea cucumbers', plan: 'cucumber', life: 'dig', diet: ['detritus'], ground: ['sand', 'mud'], adaptations: WET,
    guard: 'toxin', base: [0, 2, 0, 0, 1], mechanic: 'eject', dials: [size(50, 2000), dial('guard', 'toxin', 2)] }),
  clade({ id: 'shore-crabs', name: 'Shore crabs', plan: 'crab', life: 'hunt', diet: [prey, 'detritus'], ground: ALL, adaptations: ['water', 'tide', 'walking'],
    guard: 'shell', beats: ['shell'], base: [3, 2, 2, 2, 2], mechanic: 'moult', dials: [size(5, 300), dial('bite', 'claws', 1), dial('guard', 'carapace', 2)], mutations: ['pale', 'dark', 'giant', 'thick'] }),
  clade({ id: 'dog-whelks', name: 'Dog whelks', plan: 'snail', life: 'hunt', diet: [prey], ground: ['rock'], adaptations: TIDAL,
    guard: 'shell', beats: ['shell'], base: [3, 3, 0, 1, 1], mechanic: 'drill', dials: [size(1, 20), dial('bite', 'drill', 1)], mutations: ['pale', 'banded'] }),
  clade({ id: 'sea-stars', name: 'Sea stars', plan: 'star', life: 'hunt', diet: [prey], ground: ['rock', 'sand'], adaptations: ['water', 'clinging'],
    guard: 'spines', beats: ['shell'], base: [3, 1, 0, 0, 2], mechanic: 'pry', dials: [size(20, 1000), dial('bite', 'arms', 1)], mutations: ['pale', 'red', 'giant'] }),
  clade({ id: 'octopuses', name: 'Octopuses', plan: 'octopus', life: 'hunt', diet: [prey], ground: ['rock'], adaptations: ['water', 'clinging'],
    guard: 'hiding', beats: ['shell', 'hiding'], base: [3, 2, 2, 3, 1], mechanic: 'ink', dials: [size(100, 10000), dial('bite', 'beak', 1), dial('speed', 'jet', 2)], mutations: ['pale', 'red', 'giant'] }),
  clade({ id: 'anchovies', name: 'Anchovies', plan: 'fish', life: 'forage', diet: ['plankton'], ground: OPEN, adaptations: WET,
    guard: 'fleeing', base: [0, 0, 3, 2, 3], mechanic: 'school', dials: [size(5, 60), dial('speed', 'school', 1), dial('brood', 'spawn', 1)] }),
  clade({ id: 'damselfishes', name: 'Damselfishes', plan: 'fish', life: 'forage', diet: ['plankton', 'mats'], ground: ['rock'], adaptations: WET,
    guard: 'hiding', base: [1, 3, 2, 2, 1], mechanic: 'host', dials: [size(5, 100), dial('guard', 'host', 1)], mutations: ['pale', 'dark', 'banded'] }),
  clade({ id: 'parrotfishes', name: 'Parrotfishes', plan: 'fish', life: 'forage', diet: ['mats', 'greens'], ground: ['rock', 'sand'], adaptations: WET,
    guard: 'fleeing', base: [3, 0, 2, 2, 1], mechanic: 'beak', dials: [size(100, 60000), dial('bite', 'beak', 1)], mutations: ['pale', 'red', 'green', 'giant'] }),
  clade({ id: 'morays', name: 'Moray eels', plan: 'eel', life: 'hunt', diet: [prey], ground: ['rock'], adaptations: WET,
    guard: 'hiding', beats: ['hiding'], base: [2, 1, 1, 3, 1], mechanic: 'ambush', dials: [size(500, 30000), dial('bite', 'jaws', 1)] }),
  clade({ id: 'tunas', name: 'Tunas', plan: 'fish', life: 'hunt', diet: [prey], ground: OPEN, adaptations: WET,
    guard: 'fleeing', base: [1, 0, 4, 3, 3], mechanic: 'dash', dials: [size(2000, 200000), dial('speed', 'burst', 1)] }),
  clade({ id: 'ground-sharks', name: 'Ground sharks', plan: 'shark', life: 'hunt', diet: [prey], ground: OPEN, adaptations: WET,
    beats: ['shell'], base: [2, 0, 3, 4, 0], mechanic: 'scent', dials: [size(5000, 600000), dial('bite', 'jaws', 1), dial('speed', 'burst', 1)], mutations: ['pale', 'banded', 'giant'] }),
  clade({ id: 'sea-turtles', name: 'Sea turtles', plan: 'turtle', life: 'forage', diet: ['greens'], ground: ['sand', 'mud'], adaptations: ['diving', 'air'],
    guard: 'shell', base: [2, 3, 1, 2, 1], mechanic: 'shell', dials: [size(30000, 200000), dial('guard', 'shell', 1)] }),
  // The shore's own (no animal lands as a colonist: they are candidates for a line that crosses, and the roster sheet).
  clade({ id: 'rock-crabs', name: 'Rock crabs', plan: 'crab', life: 'forage', diet: ['mats'], ground: ['rock'], adaptations: ['water', 'tide', 'air', 'walking', 'clinging'],
    guard: 'fleeing', base: [2, 0, 3, 2, 2], mechanic: 'dash', dials: [size(5, 80), dial('speed', 'dash', 1)], mutations: ['pale', 'red'] }),
  clade({ id: 'ghost-crabs', name: 'Ghost crabs', plan: 'crab', life: 'hunt', diet: [prey, 'detritus'], ground: ['sand'], adaptations: ['air', 'tide', 'walking'],
    guard: 'fleeing', base: [2, 0, 3, 3, 2], mechanic: 'burrow', dials: [size(5, 100), dial('speed', 'dash', 1)] }),
  clade({ id: 'sandhoppers', name: 'Sandhoppers', plan: 'hopper', life: 'dig', diet: ['detritus', 'litter'], ground: ['sand'], adaptations: ['air', 'tide', 'walking'],
    guard: 'fleeing', base: [1, 0, 3, 1, 3], mechanic: 'hop', dials: [size(0.02, 0.5), dial('brood', 'brood', 1)] }),
  clade({ id: 'iguanas', name: 'Iguanas', plan: 'lizard', life: 'forage', diet: ['greens'], ground: ['rock'], adaptations: ['air', 'walking', 'diving', 'salt', 'dry'],
    base: [3, 0, 2, 2, 1], mechanic: 'bask', dials: [size(500, 12000), dial('bite', 'jaws', 1)], mutations: ['pale', 'red', 'dark'] }),
  clade({ id: 'oystercatchers', name: 'Oystercatchers', plan: 'bird', life: 'hunt', diet: [prey], ground: ALL, adaptations: ['air', 'walking', 'salt', 'dry'],
    guard: 'fleeing', beats: ['shell'], base: [3, 0, 3, 3, 1], mechanic: 'pry', dials: [size(300, 800), dial('bite', 'bill', 1)] }),
  clade({ id: 'gulls', name: 'Gulls', plan: 'bird', life: 'hunt', diet: [prey, 'detritus'], ground: ALL, adaptations: ['air', 'walking', 'salt', 'dry'],
    guard: 'fleeing', beats: ['shell'], base: [2, 0, 4, 3, 2], mechanic: 'drop', dials: [size(200, 1800), dial('bite', 'bill', 1)] }),
  clade({ id: 'land-hermit-crabs', name: 'Land hermit crabs', plan: 'crab', life: 'forage', diet: ['seeds', 'litter', 'detritus'], ground: ['sand', 'mud'], adaptations: ['air', 'walking', 'salt', 'dry'],
    guard: 'shell', base: [4, 2, 2, 2, 1], mechanic: 'climb', dials: [size(10, 4000), dial('bite', 'claws', 1)], mutations: ['pale', 'red', 'giant'] }),
  // Sessile life: board pieces with a real diet. They hold a food job and are prey.
  clade({ id: 'mussels', name: 'Mussels', plan: 'bivalve', life: null, diet: ['plankton'], ground: ['rock'], adaptations: TIDAL,
    guard: 'shell', base: [0, 3, 0, 0, 3], mechanic: 'none', dials: [size(1, 30), dial('guard', 'shell', 1)], mutations: [] }),
  clade({ id: 'cockles', name: 'Cockles', plan: 'bivalve', life: null, diet: ['plankton'], ground: ['sand', 'mud'], adaptations: ['water', 'tide'],
    guard: 'shell', base: [0, 2, 0, 0, 3], mechanic: 'none', dials: [size(1, 40), dial('guard', 'shell', 1)], mutations: [] }),
  clade({ id: 'barnacles', name: 'Barnacles', plan: 'barnacle', life: null, diet: ['plankton'], ground: ['rock'], adaptations: TIDAL,
    guard: 'shell', base: [0, 3, 0, 0, 3], mechanic: 'none', dials: [size(0.1, 5)], mutations: [] }),
  clade({ id: 'giant-clams', name: 'Giant clams', plan: 'bivalve', life: null, diet: ['plankton'], ground: ['rock', 'sand'], adaptations: WET,
    guard: 'shell', base: [0, 4, 0, 0, 2], mechanic: 'none', dials: [size(1000, 200000)], mutations: [] }),
  // Producers.
  producer('kelps', 'Kelps', 'kelp', ['rock'], ['water', 'rooted'], { greens: 30, detritus: 10 }, 5000),
  producer('seagrasses', 'Seagrasses', 'grass', ['sand', 'mud'], ['water', 'rooted'], { greens: 28, detritus: 12 }, 20),
  producer('stony-corals', 'Stony corals', 'coral', ['rock'], ['water', 'rooted'], { mats: 28, plankton: 6 }, 3000),
  producer('wracks', 'Wracks', 'kelp', ['rock'], ['water', 'tide', 'rooted'], { greens: 20, detritus: 6 }, 300),
  producer('mangroves', 'Mangroves', 'tree', ['mud'], ['tide', 'air', 'rooted'], { litter: 20, detritus: 12 }, 50000),
  producer('palms', 'Palms', 'tree', ['sand'], SALTY, { seeds: 20, litter: 10 }, 400000),
  producer('lava-lichens', 'Lava lichens', 'lichen', ['rock'], SALTY, { mats: 14, litter: 4 }, 1),
  producer('sword-ferns', 'Sword ferns', 'fern', ['rock', 'mud'], LANDED, { greens: 10, litter: 8 }, 200),
  producer('morning-glories', 'Morning glories', 'vine', ['sand'], SALTY, { greens: 12, seeds: 4 }, 500),
  producer('myrtles', 'Myrtle trees', 'tree', ['rock', 'mud'], LANDED, { greens: 12, seeds: 6, litter: 14 }, 300000),
];
export const CLADE: Record<string, Clade> = Object.fromEntries(CLADES.map((c) => [c.id, c]));
