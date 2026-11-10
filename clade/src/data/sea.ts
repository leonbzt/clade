// Starting N1 numbers, to tune on the session-2 sheet. All biomass is grams; yields are grams per tile.
import type { Depth, Substrate } from './ground';
import type { Food, Letter } from '../sim/records';

export const FOODS: Food[] = ['mats', 'detritus'];
export const YIELDS: Record<Food, Record<Depth, Record<Substrate, number>>> = {
  mats: {
    flat: { sand: 4, mud: 3, rock: 2 }, // mats yield: lit flats
    shallows: { sand: 3, mud: 2, rock: 1.5 }, // mats yield: lit shallows
    slope: { sand: 0, mud: 0, rock: 0 }, // mats yield: no light on the slope
    deep: { sand: 0, mud: 0, rock: 0 }, // mats yield: no light at depth
  },
  detritus: {
    flat: { sand: 0.5, mud: 2, rock: 0.25 }, // detritus yield: silt traps more than rock
    shallows: { sand: 1, mud: 3, rock: 0.5 }, // detritus yield: more settles below the flats
    slope: { sand: 1.5, mud: 4, rock: 1 }, // detritus yield: deeper sediment
    deep: { sand: 2, mud: 5, rock: 1.5 }, // detritus yield: the deepest settling ground
  },
};
export const REGROW: Record<Food, number> = { mats: 0.15, detritus: 0.1 }; // regrow: share of missing stock / generation (slow food, so eaters overshoot and swing)
export const SEA = {
  appetite: 1.4, // eat: grams wanted per gram of population × intake (reach × food per tile)
  deaths: 0.4, // breed and die: base fraction lost per generation
  damping: 0.8, // breed and die: share of the move toward the target
  spread: 0.06, // spread: population fraction × shared border / whole perimeter
  extinctionHeads: 2, // breed and die: below two heads' mass, the population dies
  slotFloor: 10, // slots: minimum food ceiling, in grams
  referenceDensity: 2, // intake: food grams per tile representing one share of stock
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
// Letter thresholds: value = intake / upkeep × survival × brood. Same starting curve for the two slots. A population
// grows while appetite × value > deaths, so C's floor sits just under deaths ÷ appetite (≈ 0.286): C holds its own,
// D and F shrink, and a settled holder reads C at home. Move it with deaths or appetite.
export const LETTER_THRESHOLDS: Record<Food, readonly (readonly [Letter, number])[]> = {
  mats: [['S', 1.5], ['A', 1], ['B', 0.65], ['C', 0.28], ['D', 0.15], ['F', 0]], // mats value thresholds
  detritus: [['S', 1.5], ['A', 1], ['B', 0.65], ['C', 0.28], ['D', 0.15], ['F', 0]], // detritus value thresholds
};
export const TERM_THRESHOLDS: readonly (readonly [Letter, number])[] = [
  ['S', 1], ['A', 0.8], ['B', 0.6], ['C', 0.4], ['D', 0.2], ['F', 0], // term letters: intake, inverse upkeep, survival
];
