// Starting N1 numbers, tuned by feel. All biomass is grams; yields are grams per tile (×10 after the N1 review, 11 Nov).
import type { Depth, Substrate } from './ground';
import type { Food, Letter } from '../sim/records';

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
  survival: 1, // survival: nothing hunts or harms populations until N4
};
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
export const LETTER_THRESHOLDS: Record<Food, readonly (readonly [Letter, number])[]> = { mats: LADDER, detritus: LADDER };
export const TERM_THRESHOLDS: readonly (readonly [Letter, number])[] = [
  ['S', 1], ['A', 0.8], ['B', 0.6], ['C', 0.4], ['D', 0.2], ['F', 0], // term letters: intake, inverse upkeep, survival
];
