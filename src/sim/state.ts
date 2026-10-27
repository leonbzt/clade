// The game state: plain data and typed arrays, so it can be cloned, hashed and (later) saved.
// Strata are stored one after another: the slot of stratum k on tile i is k * n + i.
import { LAYER_IDS, STATUS_IDS, STRATA, type LayerId, type StatusId } from '../data/fields';
import type { LandmarkKind } from '../data/landmarks';
import { NUM } from '../data/numbers';
import { START_REACHED } from '../data/tree';
import { buildIsland } from './island';
import { baseSpecies, type Species, type Variant } from './variants';

export { SEA, BEACH, LAVA, CRACK, VENT, SPRING, STREAM, CAVE } from './island';
export const TERRAIN_NAMES = ['Sea', 'Beach', 'Lava field', 'Crack', 'Steam vent', 'Spring', 'Stream', 'Lava tube'];

/** What last happened in a slot, for the tile card. */
export const EV = { none: 0, settled: 1, founded: 2, age: 3, stress: 4, taken: 5, flare: 6, rain: 7, mutated: 8 } as const;

export type LogLine =
  | { tick: number; kind: 'flare'; x: number; y: number; n: number; name: string }
  | { tick: number; kind: 'trend'; sp: number; delta: number; limit: number }
  | { tick: number; kind: 'variant'; sp: number; tier: number; name: string; genes: string; place: string };

export type Landmark = { kind: LandmarkKind; name: string; tiles: number[]; at: number }; // at: where its name goes

export type State = {
  seed: number;
  rng: number;
  tick: number;
  w: number;
  h: number;
  terrain: Uint8Array;
  base: Record<LayerId, Float32Array>; // fixed base values from terrain and landmarks; levels start from them
  statuses: Record<StatusId, Float32Array>;
  soilCap: Float32Array;
  landmarks: Landmark[];
  mark: Int16Array; // per tile: the landmark it belongs to, or -1
  vents: number[];
  layers: Record<LayerId, Float32Array>;
  fall: Float32Array; // litter from dying plants since the last layer update, per tile
  occ: Int16Array; // per slot: variant index, or -1
  cover: Float32Array; // per slot: 0–1
  health: Float32Array; // per slot: follows fit with a lag (the plant's reserves)
  dying: Uint8Array; // per slot: 1 while the plant thins out
  lastTick: Int32Array; // per slot: when something last happened
  lastCode: Uint8Array; // per slot: EV code
  lastSp: Int16Array; // per slot: the species it happened to
  lastLimit: Int8Array; // per slot: the limit index (layer or status), for deaths by stress
  species: Species[]; // the base species from the data first (same order), then the ones you founded
  variants: Variant[]; // dead ones stay as free entries and are reused
  vkey: Record<string, number>; // "species|genome" → variant
  count: number[]; // tiles per species, updated every tick
  prevCount: number[]; // at the last trend check
  biomass: number;
  gain: number; // biomass gained in the last tick
  rate: number; // smoothed biomass per second
  reached: string[];
  ready: string[]; // nodes whose requirements were met once (they stay met)
  foundings: Record<string, number>; // per species id
  made: number; // species you founded from a variant
  combos: string[]; // combos shown so far
  innovations: Record<string, number>; // key gene → the tick it appeared
  keyClock: Record<string, number>; // key gene → its pity clock, in minutes
  keyFrom: Record<string, { sp: number; form: string }>; // key gene → the species and variant it grew in
  history: { tick: number; counts: number[] }[]; // tiles per species, once a minute, for the spindle diagram
  log: LogLine[];
};

const perLayer = (n: number) => Object.fromEntries(LAYER_IDS.map((id) => [id, new Float32Array(n)])) as Record<LayerId, Float32Array>;

export function createState(seed: number): State {
  const { w, h } = NUM.map, n = w * h, slots = n * STRATA.length;
  const s: State = {
    seed, rng: seed >>> 0, tick: 0, w, h,
    terrain: new Uint8Array(n), base: perLayer(n), soilCap: new Float32Array(n),
    statuses: Object.fromEntries(STATUS_IDS.map((id) => [id, new Float32Array(n)])) as Record<StatusId, Float32Array>,
    landmarks: [], mark: new Int16Array(n).fill(-1), vents: [],
    layers: perLayer(n), fall: new Float32Array(n),
    occ: new Int16Array(slots).fill(-1), cover: new Float32Array(slots), health: new Float32Array(slots), dying: new Uint8Array(slots),
    lastTick: new Int32Array(slots), lastCode: new Uint8Array(slots), lastSp: new Int16Array(slots).fill(-1),
    lastLimit: new Int8Array(slots).fill(-1),
    species: baseSpecies(), variants: [], vkey: {}, count: [], prevCount: [],
    biomass: 0, gain: 0, rate: 0,
    reached: [...START_REACHED], ready: [],
    foundings: {}, made: 0, combos: [], innovations: {}, keyClock: {}, keyFrom: {}, history: [],
    log: [],
  };
  s.count = s.species.map(() => 0); s.prevCount = s.species.map(() => 0);
  for (const sp of s.species) s.foundings[sp.id] = 0;
  buildIsland(s);
  return s;
}

export const idx = (s: State, x: number, y: number) => y * s.w + x;
export const slotOf = (s: State, k: number, i: number) => k * s.w * s.h + i;

export function neighbours(s: State, i: number): number[] {
  const x = i % s.w, y = (i / s.w) | 0, out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if ((dx || dy) && nx >= 0 && ny >= 0 && nx < s.w && ny < s.h) out.push(ny * s.w + nx);
  }
  return out;
}
