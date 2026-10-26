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
    id: 'cyano', name: 'Cyanobacteria', salt: 1, wetFalloff: 0.2, soilMax: 1.2,
    base: { spread: 0.04, vigor: 0.6, yield: 0.4, soilBuild: 0.0005, moistMin: 0.25, moistIdeal: 0.6, soilMin: 0 },
    blurb: 'A dark living crust on damp rock and salty sand. Quick to spread, easy to push aside, at home on the beach.',
    traits: [
      { id: 'sheath', name: 'Sun-screen sheath', up: 'lives 0.1 drier', down: 'spreads 15% slower', cost: 15,
        mods: [{ stat: 'moistMin', add: -0.1 }, { stat: 'spread', mul: 0.85 }] },
      { id: 'fixing', name: 'Nitrogen fixing', up: 'builds soil 60% faster', down: 'yields 20% less', cost: 40,
        mods: [{ stat: 'soilBuild', mul: 1.6 }, { stat: 'yield', mul: 0.8 }] },
    ],
  },
  {
    id: 'liverwort', name: 'Liverworts', salt: 0.2, wetFalloff: 0.1,
    base: { spread: 0.035, vigor: 1.2, yield: 0.8, soilBuild: 0.001, moistMin: 0.45, moistIdeal: 0.85, soilMin: 0 },
    blurb: 'Flat green ribbons that need it very wet. They own the steam vents.',
    traits: [
      { id: 'gemmae', name: 'Gemma cups', up: 'spreads 40% faster', down: 'yields 15% less', cost: 40,
        mods: [{ stat: 'spread', mul: 1.4 }, { stat: 'yield', mul: 0.85 }] },
      { id: 'oil', name: 'Oil bodies', up: 'lives 0.08 drier', down: 'holds ground 10% worse', cost: 90,
        mods: [{ stat: 'moistMin', add: -0.08 }, { stat: 'vigor', mul: 0.9 }] },
    ],
  },
  {
    id: 'moss', name: 'Mosses', salt: 0.3, wetFalloff: 0.6,
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
    id: 'lichen', name: 'Lichens', salt: 0.3, wetFalloff: 0.5, soilMax: 1.6,
    base: { spread: 0.012, vigor: 0.8, yield: 0.5, soilBuild: 0.0008, moistMin: 0, moistIdeal: 0.15, soilMin: 0 },
    blurb: 'A fungus living with cyanobacteria. The pioneer of dry bare lava; it fades once soil gets deep.',
    traits: [
      { id: 'crustose', name: 'Tight crust', up: 'holds ground 30% better', down: 'spreads 20% slower', cost: 120,
        mods: [{ stat: 'vigor', mul: 1.3 }, { stat: 'spread', mul: 0.8 }] },
      { id: 'soredia', name: 'Soredia', up: 'spreads 50% faster', down: 'yields 20% less', cost: 250,
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
