// Species as data: a stratum, needs (bands on layers), makes (rates into layers), and a few numbers.
// Rates are per second. Species never name each other; everything goes through the layers.
//
// A need is a band [lowest, ideal from, ideal to, highest]: outside it the species can't live, on the ideal part
// it scores 1, on the slopes 0.2–1. Fit on a tile = its lowest need score (the limit).
// Makes into a stock (soil, nitrogen, litter) are per second × activity (cover × fit); negative means "uses".
// Makes into a level (shade, water) are a contribution × cover.
// Health follows fit with a lag of `reserve` seconds, so big plants switch on and off slowly. A status (salt)
// counts like a need: at full strength it scores the species' tolerance (1 = doesn't mind).
import type { LayerId, StatusId, StratumId } from './fields';

export type Band = readonly [number, number, number, number];
const band = (a: number, b: number, c: number, d: number): Band => [a, b, c, d];
const upTo = (ok: number, max: number): Band => [-1, -1, ok, max];
const from = (min: number, ok: number): Band => [min, ok, 2, 2];

export type Scalar = 'seeds' | 'hold' | 'yield' | 'life' | 'grow' | 'reserve';
export type Mod =
  | { stat: Scalar; mul: number }
  | { need: LayerId; low?: number; high?: number } // moves the lower or upper edge of a band
  | { make: LayerId; mul: number }
  | { status: StatusId; tol: number }; // raises the tolerance (the score at full strength)

/** A trait gene: on or off in a variant. A key one never mutates in by chance (see KEYS in genes.ts). */
export type Trait = { id: string; name: string; up: string; down: string; mods: Mod[]; key?: boolean };

export type SpeciesDef = {
  id: string;
  name: string;
  short: string; // one plant, for variant names: "Dry Moss"
  stratum: StratumId;
  seeds: number; // spread attempts per second at full cover
  hold: number; // how well it keeps a tile against a challenger
  yield: number; // biomass per second at full activity
  life: number; // mean lifespan in seconds
  grow: number; // cover gained per second at fit 1
  reserve: number; // seconds for health to follow fit
  litter: number; // litter left when it dies, × cover
  needs: Partial<Record<LayerId, Band>>;
  tolerance: Partial<Record<StatusId, number>>;
  makes: Partial<Record<LayerId, number>>;
  traits: Trait[];
  blurb: string;
};

export const SPECIES: SpeciesDef[] = [
  {
    id: 'cyano', name: 'Cyanobacteria', short: 'Cyano', stratum: 'ground',
    seeds: 0.4, hold: 0.6, yield: 0.04, life: 400, grow: 0.1, reserve: 15, litter: 0.02, tolerance: {},
    needs: { water: band(0.22, 0.45, 0.85, 1.3), soil: upTo(0.35, 0.55), shade: upTo(0.2, 0.5) },
    makes: { nitrogen: 0.005, soil: 0.0017 },
    blurb: 'A dark living crust on damp rock and salty sand. Fixes nitrogen from the air. Quick to spread, easy to push aside, needs open sky.',
    traits: [
      { id: 'sheath', name: 'Sun-screen sheath', up: 'lives 0.1 drier', down: 'spreads 15% slower',
        mods: [{ need: 'water', low: -0.1 }, { stat: 'seeds', mul: 0.85 }] },
      { id: 'fixing', name: 'Heterocysts', up: 'fixes 60% more nitrogen', down: 'yields 20% less',
        mods: [{ make: 'nitrogen', mul: 1.6 }, { stat: 'yield', mul: 0.8 }] },
    ],
  },
  {
    id: 'liverwort', name: 'Liverworts', short: 'Liverwort', stratum: 'ground',
    seeds: 0.35, hold: 1.2, yield: 0.08, life: 700, grow: 0.08, reserve: 25, litter: 0.06, tolerance: { salty: 0.3 },
    needs: { water: from(0.45, 0.75), shade: upTo(0.6, 0.95) },
    makes: { water: 0.05, soil: 0.0033, nitrogen: -0.0005 },
    blurb: 'Flat green ribbons that need it very wet. They own the steam vents and put up with shade.',
    traits: [
      { id: 'gemmae', name: 'Gemma cups', up: 'spreads 40% faster', down: 'yields 15% less',
        mods: [{ stat: 'seeds', mul: 1.4 }, { stat: 'yield', mul: 0.85 }] },
      { id: 'oil', name: 'Oil bodies', up: 'lives 0.08 drier', down: 'holds ground 10% worse',
        mods: [{ need: 'water', low: -0.08 }, { stat: 'hold', mul: 0.9 }] },
      // Close to neutral on purpose: it's the step toward mosses, not a better liverwort.
      { id: 'leafy', name: 'Leafy shoot', up: 'takes 0.1 more shade', down: 'spreads 5% slower', key: true,
        mods: [{ need: 'shade', high: 0.1 }, { stat: 'seeds', mul: 0.95 }] },
    ],
  },
  {
    id: 'moss', name: 'Mosses', short: 'Moss', stratum: 'ground',
    seeds: 0.3, hold: 1, yield: 0.1, life: 900, grow: 0.08, reserve: 30, litter: 0.08, tolerance: { salty: 0.35 },
    needs: { water: band(0.3, 0.5, 0.7, 1.05), shade: upTo(0.45, 0.85) },
    makes: { soil: 0.004, water: 0.1, nitrogen: -0.001, litter: 0.0003 },
    blurb: 'Damp-lovers. They build the first real soil and hold water in it. They grow on under ferns.',
    traits: [
      { id: 'rhizoids', name: 'Rhizoids', up: 'lives 0.1 drier', down: 'spreads 15% slower',
        mods: [{ need: 'water', low: -0.1 }, { stat: 'seeds', mul: 0.85 }] },
      { id: 'cushion', name: 'Cushion growth', up: 'holds ground 30% better', down: 'spreads 20% slower',
        mods: [{ stat: 'hold', mul: 1.3 }, { stat: 'seeds', mul: 0.8 }] },
      { id: 'capsule', name: 'Stalked spore capsule', up: 'spreads 50% faster', down: 'yields 20% less',
        mods: [{ stat: 'seeds', mul: 1.5 }, { stat: 'yield', mul: 0.8 }] },
      // Close to neutral on purpose, like the leafy shoot: it's the step toward vascular plants.
      { id: 'hydroids', name: 'Hydroids', up: 'lives 0.05 drier', down: 'grows 5% slower', key: true,
        mods: [{ need: 'water', low: -0.05 }, { stat: 'grow', mul: 0.95 }] },
    ],
  },
  {
    id: 'lichen', name: 'Lichens', short: 'Lichen', stratum: 'ground',
    seeds: 0.12, hold: 0.8, yield: 0.05, life: 2400, grow: 0.03, reserve: 60, litter: 0.04, tolerance: { salty: 0.4 },
    needs: { water: upTo(0.2, 0.65), soil: upTo(0.25, 0.55), shade: upTo(0.15, 0.4) },
    makes: { soil: 0.0027, nitrogen: 0.0003 },
    blurb: 'A fungus living with cyanobacteria. The pioneer of dry bare lava: it weathers rock into soil, then fades once the soil gets deep.',
    traits: [
      { id: 'crustose', name: 'Tight crust', up: 'holds ground 30% better', down: 'spreads 20% slower',
        mods: [{ stat: 'hold', mul: 1.3 }, { stat: 'seeds', mul: 0.8 }] },
      { id: 'soredia', name: 'Soredia', up: 'spreads 50% faster', down: 'yields 20% less',
        mods: [{ stat: 'seeds', mul: 1.5 }, { stat: 'yield', mul: 0.8 }] },
    ],
  },
  {
    id: 'fungus', name: 'Soil fungi', short: 'Fungus', stratum: 'under',
    seeds: 0.25, hold: 1, yield: 0.08, life: 600, grow: 0.08, reserve: 30, litter: 0.02, tolerance: { salty: 0.35 },
    needs: { litter: from(0.03, 0.2), water: band(0.25, 0.4, 0.9, 1.2), soil: from(0.05, 0.15) },
    makes: { litter: -0.004, nitrogen: 0.006 },
    blurb: 'Threads under the ground that rot dead plants. They turn litter back into nitrogen that plants can use.',
    traits: [
      { id: 'mycelium', name: 'Fast mycelium', up: 'spreads 40% faster', down: 'yields 15% less',
        mods: [{ stat: 'seeds', mul: 1.4 }, { stat: 'yield', mul: 0.85 }] },
      { id: 'hardy', name: 'Tough hyphae', up: 'lives 0.1 drier', down: 'frees 20% less nitrogen',
        mods: [{ need: 'water', low: -0.1 }, { make: 'nitrogen', mul: 0.8 }] },
    ],
  },
  {
    id: 'clubmoss', name: 'Club mosses', short: 'Club moss', stratum: 'herb',
    seeds: 0.12, hold: 1.4, yield: 0.25, life: 1800, grow: 0.06, reserve: 60, litter: 0.12, tolerance: { salty: 0.25 },
    needs: { water: band(0.28, 0.4, 0.62, 0.85), soil: band(0.2, 0.3, 0.55, 0.85), nitrogen: from(0.02, 0.07) },
    makes: { shade: 0.3, soil: 0.005, nitrogen: -0.005, litter: 0.001 },
    blurb: 'The first vascular plants here. They take thin soil and some nitrogen, cast a light shade, and give way to ferns where soil gets deep.',
    traits: [
      { id: 'strobili', name: 'Spore cones', up: 'spreads 40% faster', down: 'yields 15% less',
        mods: [{ stat: 'seeds', mul: 1.4 }, { stat: 'yield', mul: 0.85 }] },
      { id: 'creeping', name: 'Creeping stems', up: 'needs 0.1 less soil', down: 'holds ground 15% worse',
        mods: [{ need: 'soil', low: -0.1 }, { stat: 'hold', mul: 0.85 }] },
      { id: 'tough', name: 'Tough leaves', up: 'lives 0.1 drier', down: 'builds soil 30% slower',
        mods: [{ need: 'water', low: -0.1 }, { make: 'soil', mul: 0.7 }] },
    ],
  },
  {
    id: 'fern', name: 'Ferns', short: 'Fern', stratum: 'herb',
    seeds: 0.16, hold: 2, yield: 0.6, life: 2400, grow: 0.04, reserve: 90, litter: 0.2, tolerance: { salty: 0.2 },
    needs: { water: band(0.3, 0.42, 0.72, 0.92), soil: from(0.45, 0.6), nitrogen: from(0.03, 0.12) },
    makes: { shade: 0.7, soil: 0.005, nitrogen: -0.008, litter: 0.002 },
    blurb: 'Tall and shady. They need deep soil and a lot of nitrogen, and shade out the crusts beneath them.',
    traits: [
      { id: 'sori', name: 'Spore dots', up: 'spreads 50% faster', down: 'yields 20% less',
        mods: [{ stat: 'seeds', mul: 1.5 }, { stat: 'yield', mul: 0.8 }] },
      { id: 'rhizome', name: 'Rhizomes', up: 'holds ground 30% better', down: 'spreads 20% slower',
        mods: [{ stat: 'hold', mul: 1.3 }, { stat: 'seeds', mul: 0.8 }] },
      { id: 'drought', name: 'Leathery fronds', up: 'lives 0.12 drier', down: 'yields 15% less',
        mods: [{ need: 'water', low: -0.12 }, { stat: 'yield', mul: 0.85 }] },
    ],
  },
];

export const SPECIES_INDEX: Record<string, number> = Object.fromEntries(SPECIES.map((s, i) => [s.id, i]));
