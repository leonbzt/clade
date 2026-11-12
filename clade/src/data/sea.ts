// Starting N1 numbers, tuned by feel. All biomass is grams; yields are grams per tile (×10 after the N1 review, 11 Nov).
import type { Depth, Substrate } from './ground';
import type { Food, Letter, SlotId } from '../sim/records';

export const FOODS: Food[] = ['mats', 'detritus'];
export const YIELDS: Record<Food, Record<Depth, Record<Substrate, number>>> = {
  mats: {
    flat: { sand: 40, mud: 30, rock: 20 }, // mats yield: lit flats
    shallows: { sand: 30, mud: 20, rock: 15 }, // mats yield: lit shallows
    slope: { sand: 0, mud: 0, rock: 0 }, // mats yield: no light on the slope
    deep: { sand: 0, mud: 0, rock: 0 }, // mats yield: no light at depth
  },
  detritus: {
    flat: { sand: 5, mud: 20, rock: 2.5 }, // detritus yield: silt traps more than rock
    shallows: { sand: 10, mud: 30, rock: 5 }, // detritus yield: more settles below the flats
    slope: { sand: 15, mud: 40, rock: 10 }, // detritus yield: deeper sediment
    deep: { sand: 20, mud: 50, rock: 15 }, // detritus yield: the deepest settling ground
  },
};
export const REGROW: Record<Food, number> = { mats: 0.15, detritus: 0.1 }; // regrow: share of missing stock / generation (slow food, so eaters overshoot and swing)
export const SEA = {
  appetite: 1.4, // eat: grams wanted per gram of population × intake (reach × food per tile)
  deaths: 0.4, // breed and die: base fraction lost per generation
  damping: 0.8, // breed and die: share of the move toward the target
  spread: 0.06, // spread: population fraction × shared border / whole perimeter
  extinctionHeads: 2, // breed and die: below two heads' mass, the population dies
  slotFloor: 100, // slots: minimum food ceiling, in grams
  referenceDensity: 20, // intake: food grams per tile representing one share of stock
  openedReach: 1, // intake / eat: reach supplied by a food-opening part
};
// Who eats whom (N4 A): a build with a hunting part eats only prey, the populations here no bigger than it with no
// hunting part. The take per gram of hunter is type II (levels off as prey grows) and split by share of grams squared.
export const HUNT = {
  reach: 1, // hunt intake: prey reach per bite, like a food-opening part's reach
  referenceDensity: 1, // hunt intake: prey grams per tile representing one share (prey stand far thinner than mats)
  saturation: 2, // hunt intake, type II: the take per gram of hunter levels off at reach × saturation
  maxTake: 0.8, // hunt: hunters together take at most this share of a prey population per generation
  probe: 20, // survival preview: grams of a newcomer that is not here yet, as hunters would meet it
};
// Wild branches (N4 B): an unchosen slot with food buds a wild species, one or two legal changes from a nearby parent.
export const WILD = {
  chance: 0.08, // bud: chance per generation for each slot with food that no population chooses
  founders: 20, // bud: grams the wild species starts with in that habitat
};
export const GUARD = 0.5; // hunt: each prey defence the hunter's beats lack multiplies its take by this
export const MASS_BY_SIZE = [0, 1, 2, 4, 8, 16] as const; // body mass: grams per head at sizes 1–5 (index 0 unused)
export const BASE_UPKEEP = [0, 1, 1.15, 1.3, 1.45, 1.6] as const; // upkeep: base(size), before parts and lean ranks
export const PART_EFFECT = {
  gutFood: 2, // stats bite: Gut gland's copied food bonus
  eyeSense: 2, compoundSense: 20, // stats senses: copied sight bonuses
  legSpeed: 1, flapSpeed: 1, bristleSpeed: 1, // stats speed: copied movement bonuses
  pouchBrood: 1, // stats brood: one extra clutch multiplier per pouch
};
// Letters rank the build at full food (*decided 11 Nov*): value = intake at the ceiling ÷ upkeep × survival × brood.
// D starts at break-even (deaths ÷ appetite ≈ 0.286): below it the build can't live here (F). Each letter up is ×1.5,
// so it grazes the food a third lower and always beats the letter below. Move the ladder with deaths or appetite.
const EVEN = SEA.deaths / SEA.appetite; // break-even: value where a population just replaces itself
const LADDER: readonly (readonly [Letter, number])[] = [
  ['S', EVEN * 1.5 ** 4], ['A', EVEN * 1.5 ** 3], ['B', EVEN * 1.5 ** 2], ['C', EVEN * 1.5], ['D', EVEN], ['F', 0],
];
export const LETTER_THRESHOLDS: Record<SlotId, readonly (readonly [Letter, number])[]> = { mats: LADDER, detritus: LADDER, prey: LADDER };
export const TERM_THRESHOLDS: readonly (readonly [Letter, number])[] = [
  ['S', 1], ['A', 0.8], ['B', 0.6], ['C', 0.4], ['D', 0.2], ['F', 0], // term letters: intake, inverse upkeep, survival
];
