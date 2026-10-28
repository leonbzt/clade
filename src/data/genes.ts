// Genes as data: four shared axes for all plants and two for animals (steps −4 to +4, each step a list of mods with
// a cost), the species' traits as on/off trait genes, combos (a pair of axis steps with an extra effect), rarity
// tiers, and the numbers for mutation and the key innovations. A mod on a band a species doesn't have does nothing.
import type { Mod, SpeciesDef, Trait } from './species';

export type AxisId = 'dry' | 'shade' | 'lean' | 'spread' | 'diet';
export type Axis = { id: AxisId; name: string; plus: string; minus: string; steps: Record<number, Mod[]> };

/** Steps 3 and 4 extend step 2 by step 1 each: band shifts and gains (×>1) at the same rate, costs (×<1) steeply. */
const STEEP = 2;
function far(one: Mod[], two: Mod[], n: number): Mod[] {
  return two.map((m, k) => {
    const o = one[k] as Mod & { low?: number; high?: number; mul?: number }, extra = n - 2;
    if ('mul' in m) return { ...m, mul: +(m.mul * o.mul! ** (extra * (o.mul! < 1 ? STEEP : 1))).toFixed(3) };
    const out = { ...m } as Mod & { low?: number; high?: number };
    if (out.low !== undefined) out.low = +(out.low + o.low! * extra).toFixed(3);
    if (out.high !== undefined) out.high = +(out.high + o.high! * extra).toFixed(3);
    return out;
  });
}
function ramp(id: AxisId, name: string, plus: string, minus: string, steps: Record<-2 | -1 | 1 | 2, Mod[]>): Axis {
  const all: Record<number, Mod[]> = { ...steps };
  for (const n of [3, 4]) { all[n] = far(steps[1], steps[2], n); all[-n] = far(steps[-1], steps[-2], n); }
  return { id, name, plus, minus, steps: all };
}

export const AXES: Axis[] = [
  ramp('dry', 'Dry', 'Dry', 'Wet', {
    1: [{ need: 'water', low: -0.05, high: -0.05 }, { stat: 'grow', mul: 0.92 }],
    2: [{ need: 'water', low: -0.1, high: -0.1 }, { stat: 'grow', mul: 0.85 }],
    [-1]: [{ need: 'water', low: 0.05, high: 0.05 }, { stat: 'grow', mul: 1.08 }],
    [-2]: [{ need: 'water', low: 0.1, high: 0.1 }, { stat: 'grow', mul: 1.15 }],
  }),
  ramp('shade', 'Shade', 'Shade', 'Sun', {
    1: [{ need: 'shade', high: 0.1 }, { stat: 'grow', mul: 0.92 }],
    2: [{ need: 'shade', high: 0.2 }, { stat: 'grow', mul: 0.85 }],
    [-1]: [{ need: 'shade', high: -0.1 }, { stat: 'grow', mul: 1.08 }],
    [-2]: [{ need: 'shade', high: -0.2 }, { stat: 'grow', mul: 1.15 }],
  }),
  ramp('lean', 'Lean', 'Lean', 'Rich', {
    1: [{ need: 'nitrogen', low: -0.02 }, { need: 'soil', low: -0.05 }, { stat: 'yield', mul: 0.85 }, { stat: 'seeds', mul: 0.9 }],
    2: [{ need: 'nitrogen', low: -0.04 }, { need: 'soil', low: -0.1 }, { stat: 'yield', mul: 0.72 }, { stat: 'seeds', mul: 0.8 }],
    [-1]: [{ need: 'nitrogen', low: 0.02 }, { need: 'soil', low: 0.05 }, { stat: 'yield', mul: 1.2 }, { stat: 'seeds', mul: 1.05 }],
    [-2]: [{ need: 'nitrogen', low: 0.04 }, { need: 'soil', low: 0.1 }, { stat: 'yield', mul: 1.4 }, { stat: 'seeds', mul: 1.1 }],
  }),
  ramp('spread', 'Spread', 'Wind', 'Tight', {
    1: [{ stat: 'seeds', mul: 1.2 }, { stat: 'hold', mul: 0.88 }],
    2: [{ stat: 'seeds', mul: 1.4 }, { stat: 'hold', mul: 0.76 }],
    [-1]: [{ stat: 'seeds', mul: 0.85 }, { stat: 'hold', mul: 1.15 }],
    [-2]: [{ stat: 'seeds', mul: 0.7 }, { stat: 'hold', mul: 1.3 }],
  }),
];

/** Animals: Dry / Wet as for plants, and Picky / Broad (diet). Picky gains more from its main food and less from
 * the rest of its diet (`range`); Broad eats everything on its list, at a lower gain. */
export const ANIMAL_AXES: Axis[] = [
  ramp('dry', 'Dry', 'Dry', 'Wet', {
    1: [{ need: 'water', low: -0.06, high: -0.06 }, { body: 'upkeep', mul: 1.06 }],
    2: [{ need: 'water', low: -0.12, high: -0.12 }, { body: 'upkeep', mul: 1.12 }],
    [-1]: [{ need: 'water', low: 0.06, high: 0.06 }, { body: 'young', mul: 1.1 }],
    [-2]: [{ need: 'water', low: 0.12, high: 0.12 }, { body: 'young', mul: 1.2 }],
  }),
  ramp('diet', 'Diet', 'Picky', 'Broad', {
    1: [{ body: 'gain', mul: 1.12 }, { body: 'range', mul: 0.6 }],
    2: [{ body: 'gain', mul: 1.25 }, { body: 'range', mul: 0.35 }],
    [-1]: [{ body: 'gain', mul: 0.92 }, { body: 'range', mul: 1.5 }],
    [-2]: [{ body: 'gain', mul: 0.85 }, { body: 'range', mul: 2 }],
  }),
];

/** Where each axis sits in a genome. Animals use slots 0 (dry) and 1 (diet); their other slots stay 0. */
export const AXIS_INDEX: Record<AxisId, number> = { dry: 0, shade: 1, lean: 2, spread: 3, diet: 1 };

/** The axes a species' genes move along. */
export const axesOf = (def: SpeciesDef): Axis[] => (def.animal ? ANIMAL_AXES : AXES);

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
  maxStep: 4, // the hard cap on an axis, from the clade's original genes
  // A step further than 2 from its species' own base takes with odds `out` per extra step; one beyond ±2 from the
  // clade's original genes also needs `extreme` per step. Founding a +2 form makes +3 likelier; +4 stays rare.
  reach: { free: 2, out: 0.3, extreme: 0.5 },
  cap: 4, // shown variants per species
  hidden: 8, // unshown mutants per species, on top: room for new ones to try
  showAt: 5, // tiles before a variant is shown
  mutate: 0.03, // chance a settling child of a shown variant mutates (hidden mutants must take hold first)
  traitShare: 0.1, // of mutations: a trait gene flips instead of an axis step
  foundFrom: TIER.rare, // a shown variant this rare or better can be founded as a new species
  speciate: { base: 1500, growth: 1.8 }, // biomass for a new species, rising with each one in its clade
  hueShift: 0.05, // a new species' colour moves this far from its parent's
};

/** Doors: a tree node opens when one of your variants meets its recipe. A shown variant of a species in one of the
 * `from` clades that carries every precursor is a candidate; the key gene arrives in the biggest candidate within
 * `KEY.window` minutes. The variant with the key splits off as the clade's first species, on the node's template. */
export type Precursor = { axis?: AxisId; step?: number; trait?: string; text: string }; // step: at least this far, on its side
export type Key = Trait & { word: string; node: string; from: string[]; precursors: Precursor[] };

// Close to neutral on purpose: a key is the step into a clade, not a better plant of the old one.
export const KEYS: Key[] = [
  { id: 'oil', name: 'Oil bodies', word: 'Oily', up: 'lives 0.04 drier', down: 'grows 5% slower', key: true,
    mods: [{ need: 'water', low: -0.04 }, { stat: 'grow', mul: 0.95 }], node: 'liverworts', from: ['land'], precursors: [
      { axis: 'dry', step: -1, text: 'loves it wet (Wet)' },
      { axis: 'spread', step: -1, text: 'grows as a tight mat (Tight)' },
    ] },
  { id: 'leafy', name: 'Leafy shoot', word: 'Leafy', up: 'takes 0.1 more shade', down: 'spreads 5% slower', key: true,
    mods: [{ need: 'shade', high: 0.1 }, { stat: 'seeds', mul: 0.95 }], node: 'mosses', from: ['land', 'liverworts'], precursors: [
      { axis: 'dry', step: 1, text: 'survives drying out (Dry)' },
      { axis: 'spread', step: 1, text: 'spores lifted into the wind (Wind)' },
    ] },
  { id: 'tracheids', name: 'Water-carrying cells', word: 'Upright', up: 'lives 0.05 drier', down: 'grows 5% slower', key: true,
    mods: [{ need: 'water', low: -0.05 }, { stat: 'grow', mul: 0.95 }], node: 'vascular', from: ['land', 'mosses'], precursors: [
      { trait: 'rhizoids', text: 'Rhizoids anchor it' },
      { axis: 'dry', step: 1, text: 'lives drier (Dry)' },
    ] },
  { id: 'shellLost', name: 'Shell lost', word: 'Bare', up: 'moves 30% faster', down: 'needs it 0.08 wetter, easier to catch', key: true,
    mods: [{ body: 'speed', mul: 1.3 }, { need: 'water', low: 0.08 }, { body: 'escape', mul: 1.2 }], node: 'slugs', from: ['snails'], precursors: [
      { axis: 'dry', step: -1, text: 'loves it wet (Wet)' },
      { axis: 'diet', step: -1, text: 'eats almost anything (Broad)' },
    ] },
  { id: 'insectBody', name: 'Insect body', word: 'Insect', up: 'lives 0.08 drier, moves 20% faster', down: 'costs 5% more to keep', key: true,
    mods: [{ need: 'water', low: -0.08 }, { body: 'speed', mul: 1.2 }, { body: 'upkeep', mul: 1.05 }], node: 'insects', from: ['hexapods'], precursors: [
      { axis: 'dry', step: 1, text: 'survives drying out (Dry)' },
      { trait: 'cuticle', text: 'a hard skin (Hard skin)' },
    ] },
];

export const KEY = {
  window: [0.5, 3] as [number, number], // minutes with a candidate: the hazard rises linearly, and at the end it arrives
  rate: 1.2, // per minute²
  nudge: 2, // minutes with the door open and no candidate: the closest variant gains a missing precursor
  patch: 1, // radius: the tiles around the first one that take the key with it
  nudgePatch: 2, // radius for a nudge's precursor
};
