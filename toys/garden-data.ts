// Toy: the living garden. Residents, habitats and the model's numbers. The nouns come from nature; the rules are ours.
// Budgets for this toy: 3 stocks, 4 roles, 10 natives, 3 habitats (tests/garden-toy.test.ts counts them). Defaults to keep it simple, not limits on the game.
import type { NodeId } from './life2-data';
import type { HabitatId } from './life2-habitats';

export type Role = 'grazer' | 'burrower' | 'filter' | 'predator';
export const ROLES: Record<Role, { name: string; plural: string; verb: string }> = {
  grazer: { name: 'grazer', plural: 'Grazers', verb: 'graze' },
  burrower: { name: 'burrower', plural: 'Burrowers', verb: 'churn' },
  filter: { name: 'filter feeder', plural: 'Filter feeders', verb: 'filter' },
  predator: { name: 'predator', plural: 'Predators', verb: 'hunt' },
};
export const ROLE_IDS = Object.keys(ROLES) as Role[];
export const STOCKS = ['mats', 'detritus', 'oxygen'] as const;
export type Stock = (typeof STOCKS)[number];

/** Your role comes from what you ate: the biggest share of food by node. */
export const ROLE_OF_NODE: Record<NodeId, Role> = {
  mat: 'grazer', bloom: 'grazer', sponge: 'grazer', buried: 'burrower', shell: 'predator', carcass: 'predator',
};

/** Real residents. `at` is their score per habitat, counted in eggs, so your eggs compare directly. */
export interface Native { id: string; name: string; role: Role; real: string; at: Partial<Record<HabitatId, number>> }
export const NATIVES: Native[] = [
  { id: 'wiwaxia', name: 'Wiwaxia', role: 'grazer', real: 'A scaled, spiny slug-like grazer of the Burgess Shale.', at: { reef: 22 } },
  { id: 'odonto', name: 'Odontogriphus', role: 'grazer', real: 'A soft, flat animal that rasped microbial mats.', at: { mud: 18 } },
  { id: 'scenella', name: 'Scenella', role: 'grazer', real: 'A small cap-shaped shell, probably a grazer.', at: { basin: 24 } },
  { id: 'burgesso', name: 'Burgessochaeta', role: 'burrower', real: 'A bristled worm, feeding on sediment.', at: { mud: 30, basin: 14 } },
  { id: 'selkirkia', name: 'Selkirkia', role: 'burrower', real: 'A priapulid worm living in a tube in the mud.', at: { mud: 16 } },
  { id: 'vauxia', name: 'Vauxia', role: 'filter', real: 'A branching Burgess Shale sponge.', at: { reef: 24 } },
  { id: 'nisusia', name: 'Nisusia', role: 'filter', real: 'An early brachiopod, filtering the water.', at: { reef: 16, mud: 12 } },
  { id: 'anomalocaris', name: 'Anomalocaris', role: 'predator', real: 'The famous Cambrian hunter, up to a metre long or so.', at: { reef: 28, mud: 16 } },
  { id: 'peytoia', name: 'Peytoia', role: 'predator', real: 'A radiodont, relative of Anomalocaris.', at: { mud: 30, basin: 12 } },
  { id: 'hurdia', name: 'Hurdia', role: 'predator', real: 'A radiodont with a big head carapace.', at: { basin: 24 } },
];

/** How each habitat runs. `neighbours` is the map: splitting a habitat later means adding one here. */
export const WORLD: Record<HabitatId, {
  neighbours: HabitatId[]; mats: number; detritusIn: number; oxygen: number; filterCap: number; shock: string; shockWhy: string;
}> = {
  reef: { neighbours: ['mud'], mats: 80, detritusIn: 3, oxygen: 90, filterCap: 60, shock: 'A storm broke up the reef', shockWhy: 'storms from the open sea' },
  mud: { neighbours: ['reef', 'basin'], mats: 45, detritusIn: 10, oxygen: 65, filterCap: 25, shock: 'A mudslide buried the mud flats', shockWhy: 'the slope above gave way' },
  basin: { neighbours: ['mud'], mats: 55, detritusIn: 12, oxygen: 25, filterCap: 0, shock: 'An oxygen crash hit the basin', shockWhy: 'dead water welled up' },
};

export const MODEL = {
  genMs: 180_000, awayCap: 40, afterLife: 2, // a generation every 3 min, also away; a Life's end passes 2 more
  burnIn: 48, averageOver: 16, // the garden settles before you first see it; "normal" is the average over one season
  slots: 3, rate: 0.35, // species a role holds per habitat; how fast populations move toward their share
  perMat: 1, perDetritus: 0.9, perPrey: 0.22, // how much of each role a stock supports
  kill: 0.3, maxKill: 0.35, // what predators take each generation
  regrow: 0.25, graze: 0.12, churn: 0.05, // mats: regrowth, grazing, burrowers churning them away
  deathToDetritus: 0.2, burrowEat: 0.14, detritusDecay: 0.08,
  oxygenPull: 0.15, burrowOxygen: 0.07, decayOxygen: 0.03,
  season: 0.2, seasonLength: 16, noise: 0.15, // keeps it moving: a slow rhythm and uneven years
  shockChance: 0.03, shockKill: 0.35, shockOxygen: 20,
  spillAt: 0.6, spillMin: 10, spill: 0.06, unproven: 0.5, // crowded lines cross borders, arriving at half their score until proven
  arms: 0.15, armsMax: 1.15, // natives you beat adapt: score per generation, up to this share of the S line
  variantPer: 900, variantMax: 0.15, variantsHeld: 3,
  low: 0.6, high: 1.4, // stock news fires when it crosses these shares of normal
  leadBy: 1.25, // a new leader is news only once it's this far ahead of the last one announced
};

/** The garden's numbers → the board. At normal the garden writes exactly the authored board, so balance on the fixed maps carries over. */
export const BOARD = {
  minShare: 0.4, maxShare: 1.5, // node counts follow a stock's share of normal, within these
  safeRange: 3, // tiles from the start: food here is never taken and dead water never comes, so a hatchling can always get going
  oxygenPerTile: 4, deadBand: 8, maxDeadShift: 12, // a dead-water tile per this many points of oxygen, past this much off normal
  earliest: 4, latest: 18, spread: 2.5, // predator arrival: normal, moved by `spread` turns per doubling or halving
  rivalAt: 6, secondRival: 1.6, rivalGone: 0.4, maxRivals: 3, // population to appear at all; share of normal for a second one; below this share, none
  predatorAt: 2, carcassShare: 0.7, // below this population there's no predator; below this share of normal there are no carcasses
};
