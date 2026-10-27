// Genes as data: four shared axes for all plants (steps −2 to +2, each step a list of mods with a cost), the
// species' traits as on/off trait genes, combos (a pair of axis steps with an extra effect), rarity tiers, and the
// numbers for mutation and the one key innovation. A mod on a band a species doesn't have does nothing.
import type { Mod } from './species';

export type AxisId = 'dry' | 'shade' | 'lean' | 'spread';
export type Step = -2 | -1 | 1 | 2;
export type Axis = { id: AxisId; name: string; plus: string; minus: string; steps: Record<Step, Mod[]> };

export const AXES: Axis[] = [
  { id: 'dry', name: 'Dry', plus: 'Dry', minus: 'Wet', steps: {
    1: [{ need: 'water', low: -0.05, high: -0.05 }, { stat: 'grow', mul: 0.92 }],
    2: [{ need: 'water', low: -0.1, high: -0.1 }, { stat: 'grow', mul: 0.85 }],
    [-1]: [{ need: 'water', low: 0.05, high: 0.05 }, { stat: 'grow', mul: 1.08 }],
    [-2]: [{ need: 'water', low: 0.1, high: 0.1 }, { stat: 'grow', mul: 1.15 }],
  } },
  { id: 'shade', name: 'Shade', plus: 'Shade', minus: 'Sun', steps: {
    1: [{ need: 'shade', high: 0.1 }, { stat: 'grow', mul: 0.92 }],
    2: [{ need: 'shade', high: 0.2 }, { stat: 'grow', mul: 0.85 }],
    [-1]: [{ need: 'shade', high: -0.1 }, { stat: 'grow', mul: 1.08 }],
    [-2]: [{ need: 'shade', high: -0.2 }, { stat: 'grow', mul: 1.15 }],
  } },
  { id: 'lean', name: 'Lean', plus: 'Lean', minus: 'Rich', steps: {
    1: [{ need: 'nitrogen', low: -0.02 }, { need: 'soil', low: -0.05 }, { stat: 'yield', mul: 0.85 }, { stat: 'seeds', mul: 0.9 }],
    2: [{ need: 'nitrogen', low: -0.04 }, { need: 'soil', low: -0.1 }, { stat: 'yield', mul: 0.72 }, { stat: 'seeds', mul: 0.8 }],
    [-1]: [{ need: 'nitrogen', low: 0.02 }, { need: 'soil', low: 0.05 }, { stat: 'yield', mul: 1.2 }, { stat: 'seeds', mul: 1.05 }],
    [-2]: [{ need: 'nitrogen', low: 0.04 }, { need: 'soil', low: 0.1 }, { stat: 'yield', mul: 1.4 }, { stat: 'seeds', mul: 1.1 }],
  } },
  { id: 'spread', name: 'Spread', plus: 'Wind', minus: 'Tight', steps: {
    1: [{ stat: 'seeds', mul: 1.2 }, { stat: 'hold', mul: 0.88 }],
    2: [{ stat: 'seeds', mul: 1.4 }, { stat: 'hold', mul: 0.76 }],
    [-1]: [{ stat: 'seeds', mul: 0.85 }, { stat: 'hold', mul: 1.15 }],
    [-2]: [{ stat: 'seeds', mul: 0.7 }, { stat: 'hold', mul: 1.3 }],
  } },
];

export const AXIS_INDEX: Record<AxisId, number> = { dry: 0, shade: 1, lean: 2, spread: 3 };

/** A pair of axis steps (at least these) with an extra effect that opens a niche. */
export type Combo = { id: string; name: string; needs: Partial<Record<AxisId, number>>; text: string; mods: Mod[] };

export const COMBOS: Combo[] = [
  { id: 'crust', name: 'Crust form', needs: { dry: 2, spread: -1 }, text: 'much better salt tolerance (the beach)',
    mods: [{ status: 'salty', tol: 0.45 }] },
  { id: 'cave', name: 'Cave form', needs: { shade: 2, dry: -1 }, text: 'a much wider shade band (lava tube mouths)',
    mods: [{ need: 'shade', high: 0.25 }] },
  { id: 'ash', name: 'Ash form', needs: { lean: 2, dry: 1 }, text: 'lives on bare rock with almost no soil',
    mods: [{ need: 'soil', low: -0.15 }, { need: 'nitrogen', low: -0.02 }] },
];

/** Rarity tiers by distance to the species' base genome (axis steps, a trait gene counts `traitWeight`). */
export const TIERS = [
  { id: 'base', name: 'Base', color: '#b5a383' },
  { id: 'common', name: 'Common', color: '#e6dcc0' },
  { id: 'uncommon', name: 'Uncommon', color: '#7cd05a' },
  { id: 'rare', name: 'Rare', color: '#5aa8f0' },
  { id: 'epic', name: 'Epic', color: '#c070f0' },
  { id: 'legendary', name: 'Legendary', color: '#f0a030' },
] as const;
export const TIER = { base: 0, common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 } as const;

export const GENES = {
  traitWeight: 2,
  maxStep: 2,
  cap: 8, // shown variants per species
  hidden: 8, // unshown mutants per species, on top: room for new ones to try
  showAt: 5, // tiles before a variant is shown
  mutate: 0.03, // chance a settling child of a shown variant mutates (hidden mutants must take hold first)
  traitShare: 0.1, // of mutations: a trait gene flips instead of an axis step
  foundFrom: TIER.rare, // a shown variant this rare or better can be founded as a new species
  speciate: { base: 1500, growth: 2.5 }, // biomass for a new species, rising with each one
  hueShift: 0.05, // a new species' colour moves this far from its parent's
};

/** The key innovation: a Legendary trait gene that opens a tree node. Its odds rise the longer its species lives. */
export const KEY = {
  gene: 'leafy', species: 'liverwort', node: 'mosses',
  window: [5, 15], // minutes after the species is first founded; it always arrives by the end
  rate: 0.07, // per minute², times the population factor: the hazard rises linearly through the window
  popRef: 150, // tiles; more tiles bring it a little sooner (factor 0.5–2)
  patch: 1, // radius: the tiles around the first one that take the gene with it
};
