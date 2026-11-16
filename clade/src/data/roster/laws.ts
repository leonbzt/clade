// The laws' numbers, tuned by feel (direction §4). The directions are biology and are held by tests/model/data.test.ts.
import type { DialId, Food, FoodId, Ground, Letter, StatId } from '../../model/types';

export const LAWS = {
  // Law 1, size. Upkeep per gram falls as mass^-thrift; losses weigh as mass^slow (a slow breeder replaces less).
  thrift: 0.15, slow: 0.2,
  upkeep: 1, // per gram a generation at 1 g, before stat costs
  cost: { bite: 0.04, guard: 0.05, speed: 0.05, senses: 0.02, brood: 0.04 } as Record<StatId, number>, // upkeep per stat point
  brood: 0.35, // each brood point divides losses by 1 + this
  // Law 2, food.
  appetite: 1.4, // a build grows where appetite × value > 1
  referenceDensity: 12, // food grams per tile that count as one share of intake
  offGround: 0.4, // reach on a ground the clade does not list (an open-water clade reads the kind's water instead)
  gutFloor: 0.3, // the least a small body gets from a food that needs a gut
  stockFloor: 14, // a food job exists from this many grams a tile
  standing: 0.5, // law 6: grams of eater per gram of food ceiling, × survival
  // Laws 3 and 4, the hunt.
  hunt: {
    window: 0.05, // prey up to this share of the hunter's mass, doubled per bite point…
    span: 2000, // …and down to the top of the window ÷ this
    guard: 0.75, // each defence point the hunter cannot beat multiplies its take by this
    eatsFloor: 0.4, // `eats` is true from this much take left
    pressure: 0.3, // deaths a generation from one hunter that eats you, × the take left
    referenceDensity: 1, saturation: 2, reach: 1, // the hunter's intake, type II as in N4
    refuge: { sand: 0.15, mud: 0.3, rock: 0.45 } as Record<Ground, number>, // grams of prey per tile out of reach
    from: 500, // a hunt job exists from this many grams of prey above the refuge
    transfer: 0.15, // law 6: grams of hunter per gram of prey in reach, × survival
  },
};

export const FOODS: Record<FoodId, Food> = {
  mats: { id: 'mats', name: 'Mats', verb: 'Graze mats', tough: 1 },
  plankton: { id: 'plankton', name: 'Plankton', verb: 'Filter plankton', tough: 0 },
  detritus: { id: 'detritus', name: 'Detritus', verb: 'Dig detritus', tough: 0 },
  greens: { id: 'greens', name: 'Greens', verb: 'Browse greens', tough: 2, gut: 20 }, // poor food: a gut of 20 g to use it fully
  seeds: { id: 'seeds', name: 'Seeds', verb: 'Pick seeds', tough: 3 },
  litter: { id: 'litter', name: 'Litter', verb: 'Sift litter', tough: 1, gut: 5 },
};
export const FOOD_IDS = Object.keys(FOODS) as FoodId[];
export const JOB_NAMES = { light: 'Grow in the light', hunt: 'Hunt', hunt2: 'Hunt the hunter' };

/** A step of each dial: what a variant differs by, and what the sign-change test moves. */
export const DIAL_STEP: Record<DialId, number> = { size: 0.25, bite: 1, guard: 1, speed: 1, brood: 1 };

// D starts at break-even (1 ÷ appetite); each letter up is ×1.5, as in N1.
const EVEN = 1 / LAWS.appetite;
export const LADDER: readonly (readonly [Letter, number])[] = [
  ['S', EVEN * 1.5 ** 4], ['A', EVEN * 1.5 ** 3], ['B', EVEN * 1.5 ** 2], ['C', EVEN * 1.5], ['D', EVEN], ['F', 0],
];
