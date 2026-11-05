// The living garden's data (slice 13, ported from toys/garden-data.ts): roles, the natives per habitat, how each habitat
// runs, the model's numbers, and how the garden writes a board. Nouns from nature (R2's corrections), rules ours.
import type { NodeId } from './life';
import type { HabitatId } from './habitats';

export type Role = 'grazer' | 'burrower' | 'predator';
export const ROLES: Record<Role, { name: string; plural: string; verb: string; call: string }> = {
  grazer: { name: 'grazer', plural: 'Grazers', verb: 'graze', call: 'Grazer' },
  burrower: { name: 'burrower', plural: 'Burrowers', verb: 'churn', call: 'Burrower' },
  predator: { name: 'hunter', plural: 'Hunters', verb: 'hunt', call: 'Hunter' },
};
export const ROLE_IDS = Object.keys(ROLES) as Role[];

/** Your role comes from what you ate: the biggest share of food. */
export const ROLE_OF_FOOD: Record<NodeId | 'prey', Role> = {
  mat: 'grazer', bloom: 'grazer', shell: 'grazer', buried: 'burrower', carcass: 'predator', prey: 'predator',
};

/** Real residents (composite Cambrian). `at` is their score per habitat, in eggs, so your eggs compare directly. */
export interface Native { id: string; name: string; role: Role; real: string; at: Partial<Record<HabitatId, number>> }
export const NATIVES: Native[] = [
  { id: 'wiwaxia', name: 'Wiwaxia', role: 'grazer', real: 'A scaled, spiny slug-like grazer.', at: { sand: 20 } },
  { id: 'olenoides', name: 'Olenoides', role: 'grazer', real: 'A spiny trilobite that scavenged the seafloor.', at: { sand: 14, rock: 10 } },
  { id: 'odonto', name: 'Odontogriphus', role: 'grazer', real: 'A soft, flat animal that rasped microbial mats.', at: { mud: 14 } },
  { id: 'haplo', name: 'Haplophrentis', role: 'grazer', real: 'A hyolith: a cone shell propped on two struts, feeding on the floor.', at: { rock: 16 } },
  { id: 'burgesso', name: 'Burgessochaeta', role: 'burrower', real: 'A bristled worm; how it fed is not known.', at: { mud: 24, rock: 8 } },
  { id: 'selkirkia', name: 'Selkirkia', role: 'burrower', real: 'A priapulid worm living in a tube in the mud.', at: { mud: 12, sand: 10 } },
  { id: 'anomalocaris', name: 'Anomalocaris', role: 'predator', real: 'A radiodont hunter, roughly 40 cm long.', at: { sand: 22, mud: 16, rock: 18 } },
  { id: 'ottoia', name: 'Ottoia', role: 'predator', real: 'A burrowing priapulid that ate hyoliths and other worms.', at: { mud: 12 } },
  { id: 'sidneyia', name: 'Sidneyia', role: 'predator', real: 'An arthropod whose gut held trilobites and hyoliths.', at: { rock: 14 } },
];

/** How each habitat runs. `neighbours`: where crowded species spill. */
export const WORLD: Record<HabitatId, { neighbours: HabitatId[]; mats: number; rotIn: number; oxygen: number; shock: string; shockWhy: string }> = {
  sand: { neighbours: ['mud', 'rock'], mats: 80, rotIn: 3, oxygen: 90, shock: 'A storm churned the sand shallows', shockWhy: 'storm waves from the open sea' },
  mud: { neighbours: ['sand', 'rock'], mats: 45, rotIn: 10, oxygen: 65, shock: 'A mudslide buried the mud flats', shockWhy: 'the slope above gave way' },
  rock: { neighbours: ['sand', 'mud'], mats: 55, rotIn: 6, oxygen: 45, shock: 'A vent surge choked the volcanic rock', shockWhy: 'warm, oxygen-poor water welled up' },
};

export const MODEL = {
  genMs: 180_000, awayCap: 160, afterLife: 2, skip: 10, // a generation every 3 min (8 h away = 160); a Life's end passes 2 more
  burnIn: 48, averageOver: 16, // the garden settles before you first see it; "normal" is the average over one season
  power: 2, selfMax: 0.6, rate: 0.35, // shares go by score²; no species holds more than 60% of its role (the self-limit)
  perMat: 1, perRot: 0.9, perPrey: 0.22, // how much of each role a stock supports
  kill: 0.3, maxKill: 0.35, // what hunters take each generation
  regrow: 0.25, graze: 0.12, churn: 0.05, // mats: regrowth, grazing, burrowers churning them away
  deathToRot: 0.2, burrowEat: 0.14, rotDecay: 0.08,
  oxygenPull: 0.15, burrowOxygen: 0.07, decayOxygen: 0.03,
  season: 0.2, seasonLength: 16, noise: 0.15,
  shockChance: 0.03, shockKill: 0.35, shockOxygen: 20,
  spillAt: 0.6, spillMin: 10, spill: 0.06, unproven: 0.5, // crowded lines cross borders, arriving at half their score until proven
  arms: 0.15, armsMax: 1.15, // natives you beat adapt, up to this share of the S line
  low: 0.6, high: 1.4, leadBy: 1.25, // news thresholds
};

/** The garden's numbers → the board (the one door). At normal the board is the authored one. */
export const BOARD = {
  minShare: 0.4, maxShare: 1.5, safeRange: 2, // node counts follow a stock's share of normal; the start's surroundings stay
  oxygenPerTile: 4, deadBand: 8, maxDeadShift: 6, // vent water grows a tile per 4 oxygen past 8 below normal (volcanic rock only)
  earliest: 3, latest: 16, spread: 2.5, // the hunter's turn: normal, moved by 2.5 turns per doubling or halving
  rivalAt: 6, rivalGone: 0.4, predatorAt: 2, carcassShare: 0.7,
  preyMin: 2, preyMax: 7, // the predator Life's prey count, following the prey populations
};
