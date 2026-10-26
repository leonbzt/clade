// Traits in the gene pool. A trait works (and shows on the type specimen) once it is common.

export type TraitId =
  | 'rhizoids'
  | 'dryingOut'
  | 'capsule'
  | 'tufts'
  | 'creeping'
  | 'hairPoints'
  | 'leafyShoot';

export interface TraitEffects {
  spreadCost?: number; // multiplies the cost of a new tile
  spreadEnergy?: number; // multiplies energy put into Spread
  water?: number; // multiplies water from Cushion and the water cap
  dryResist?: number; // added to every tile's resilience
  genes?: number; // multiplies genes from Spores
  energy?: number; // multiplies tile energy
}

export interface TraitDef {
  id: TraitId;
  name: string;
  variant: string; // how a variant carrying it is described in the gene pool
  effect: string; // what it does once common, in words
  startFreq: number;
  drought: boolean; // the dry home nudges these up by itself
  precursor: boolean; // counts toward Mosses
  keyInnovation: boolean; // hidden until the precursors are common
  effects: TraitEffects;
}

export const TRAITS: TraitDef[] = [
  {
    id: 'rhizoids',
    name: 'Rhizoids',
    variant: 'anchoring threads',
    effect: 'Grips bare rock: new tiles cost 20% less.',
    startFreq: 0.12,
    drought: false,
    precursor: true,
    keyInnovation: false,
    effects: { spreadCost: 0.8 },
  },
  {
    id: 'dryingOut',
    name: 'Survives drying out',
    variant: 'dries out and wakes again',
    effect: 'Tiles hold on through dry spells (+0.25 resilience).',
    startFreq: 0.15,
    drought: true,
    precursor: true,
    keyInnovation: false,
    effects: { dryResist: 0.25 },
  },
  {
    id: 'capsule',
    name: 'Stalked spore capsule',
    variant: 'spores held up on a stalk',
    effect: 'Spores ride the wind further: +40% genes.',
    startFreq: 0.1,
    drought: false,
    precursor: true,
    keyInnovation: false,
    effects: { genes: 1.4 },
  },
  {
    id: 'tufts',
    name: 'Denser tufts',
    variant: 'denser tufts',
    effect: 'Holds more water: Cushion and water cap +50%.',
    startFreq: 0.28,
    drought: false,
    precursor: false,
    keyInnovation: false,
    effects: { water: 1.5 },
  },
  {
    id: 'creeping',
    name: 'Creeping shoots',
    variant: 'creeping shoots',
    effect: 'Spreads over bare ground: Spread +30%.',
    startFreq: 0.3,
    drought: false,
    precursor: false,
    keyInnovation: false,
    effects: { spreadEnergy: 1.3 },
  },
  {
    id: 'hairPoints',
    name: 'Hair-tipped leaves',
    variant: 'hair-tipped leaves',
    effect: 'Thought to cut water loss: +0.15 resilience.',
    startFreq: 0.2,
    drought: true,
    precursor: false,
    keyInnovation: false,
    effects: { dryResist: 0.15 },
  },
  {
    id: 'leafyShoot',
    name: 'Leafy shoot',
    variant: 'a leafy shoot from the threads',
    effect: 'Upright leafy shoots: +25% energy. Reaches Mosses.',
    startFreq: 0.1,
    drought: false,
    precursor: false,
    keyInnovation: true,
    effects: { energy: 1.25 },
  },
];

export const TRAIT_BY_ID: Record<TraitId, TraitDef> = Object.fromEntries(
  TRAITS.map((t) => [t.id, t]),
) as Record<TraitId, TraitDef>;
