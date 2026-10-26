// Species and their traits. Stats are per tick unless noted. Moisture is 0–1; soil depth is 0–3.

export type StatKey = 'spread' | 'vigor' | 'yield' | 'soilBuild' | 'moistMin' | 'moistIdeal' | 'soilMin';
export type Mod = { stat: StatKey; add?: number; mul?: number };

export type Trait = {
  id: string;
  name: string;
  up: string;
  down: string;
  cost: number;
  mods: Mod[];
};

export type SpeciesDef = {
  id: string;
  name: string;
  wild?: boolean; // not yours: no yield, can't be founded
  base: Record<StatKey, number>;
  soilMax?: number; // fades on deeper soil
  salt: number; // fit multiplier on the beach
  wetFalloff: number; // how fast fit drops above the ideal moisture
  traits: Trait[];
  blurb: string;
};

export const SPECIES: SpeciesDef[] = [
  {
    id: 'lichen', name: 'Crust lichens', wild: true, salt: 0.6, wetFalloff: 0.5, soilMax: 1.6,
    base: { spread: 0.006, vigor: 0.7, yield: 0, soilBuild: 0.0006, moistMin: 0, moistIdeal: 0.15, soilMin: 0 },
    traits: [],
    blurb: 'Wild pioneers. Strong on dry bare rock; they fade once soil gets deep.',
  },
  {
    id: 'moss', name: 'Mosses', salt: 0.3, wetFalloff: 0.3,
    base: { spread: 0.03, vigor: 1, yield: 1, soilBuild: 0.0012, moistMin: 0.3, moistIdeal: 0.7, soilMin: 0 },
    blurb: 'Damp-lovers. They grow near the vents and build the first real soil.',
    traits: [
      { id: 'rhizoids', name: 'Rhizoids', up: 'lives 0.1 drier', down: 'spreads 15% slower', cost: 30,
        mods: [{ stat: 'moistMin', add: -0.1 }, { stat: 'spread', mul: 0.85 }] },
      { id: 'cushion', name: 'Cushion growth', up: 'holds ground 30% better', down: 'spreads 20% slower', cost: 80,
        mods: [{ stat: 'vigor', mul: 1.3 }, { stat: 'spread', mul: 0.8 }] },
      { id: 'capsule', name: 'Stalked spore capsule', up: 'spreads 50% faster', down: 'yields 20% less', cost: 150,
        mods: [{ stat: 'spread', mul: 1.5 }, { stat: 'yield', mul: 0.8 }] },
    ],
  },
  {
    id: 'clubmoss', name: 'Club mosses', salt: 0.2, wetFalloff: 1,
    base: { spread: 0.02, vigor: 1.6, yield: 2.5, soilBuild: 0.0015, moistMin: 0.25, moistIdeal: 0.55, soilMin: 0.8 },
    blurb: 'The first vascular plants here. They need thin soil and push mosses aside.',
    traits: [
      { id: 'strobili', name: 'Spore cones', up: 'spreads 40% faster', down: 'yields 15% less', cost: 250,
        mods: [{ stat: 'spread', mul: 1.4 }, { stat: 'yield', mul: 0.85 }] },
      { id: 'creeping', name: 'Creeping stems', up: 'needs 0.3 less soil', down: 'holds ground 15% worse', cost: 400,
        mods: [{ stat: 'soilMin', add: -0.3 }, { stat: 'vigor', mul: 0.85 }] },
      { id: 'tough', name: 'Tough leaves', up: 'lives 0.1 drier', down: 'builds soil 30% slower', cost: 600,
        mods: [{ stat: 'moistMin', add: -0.1 }, { stat: 'soilBuild', mul: 0.7 }] },
    ],
  },
  {
    id: 'fern', name: 'Ferns', salt: 0.1, wetFalloff: 1.5,
    base: { spread: 0.012, vigor: 2, yield: 6, soilBuild: 0.0015, moistMin: 0.3, moistIdeal: 0.6, soilMin: 1.6 },
    blurb: 'Tall and shady. They need deep soil and win most tiles they reach, but not waterlogged vents.',
    traits: [
      { id: 'sori', name: 'Spore dots', up: 'spreads 50% faster', down: 'yields 20% less', cost: 1500,
        mods: [{ stat: 'spread', mul: 1.5 }, { stat: 'yield', mul: 0.8 }] },
      { id: 'rhizome', name: 'Rhizomes', up: 'holds ground 30% better', down: 'spreads 20% slower', cost: 2500,
        mods: [{ stat: 'vigor', mul: 1.3 }, { stat: 'spread', mul: 0.8 }] },
      { id: 'drought', name: 'Leathery fronds', up: 'lives 0.12 drier', down: 'yields 15% less', cost: 4000,
        mods: [{ stat: 'moistMin', add: -0.12 }, { stat: 'yield', mul: 0.85 }] },
    ],
  },
];

export const SPECIES_INDEX: Record<string, number> = Object.fromEntries(SPECIES.map((s, i) => [s.id, i]));
