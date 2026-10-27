// The game state: plain data and typed arrays, so it can be cloned, hashed and (later) saved.
// Strata are stored one after another: the slot of stratum k on tile i is k * n + i.
import { LAYER_IDS, STRATA, type LayerId } from '../data/fields';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { START_REACHED } from '../data/tree';
import { rand } from './rng';

export const SEA = 0, BEACH = 1, LAVA = 2, CRACK = 3, VENT = 4;
export const TERRAIN_NAMES = ['Sea', 'Beach', 'Lava field', 'Crack', 'Steam vent'];

/** What last happened in a slot, for the tile card. */
export const EV = { none: 0, settled: 1, founded: 2, age: 3, stress: 4, taken: 5, flare: 6, rain: 7 } as const;

export type LogLine =
  | { tick: number; kind: 'flare'; x: number; y: number; n: number }
  | { tick: number; kind: 'trend'; sp: number; delta: number; limit: number };

export type State = {
  seed: number;
  rng: number;
  tick: number;
  w: number;
  h: number;
  terrain: Uint8Array;
  wet: Float32Array; // base wetness from the terrain; the water layer starts from it
  soilCap: Float32Array;
  vents: number[];
  layers: Record<LayerId, Float32Array>;
  occ: Int8Array; // per slot: species index, or -1
  cover: Float32Array; // per slot: 0–1
  lastTick: Int32Array; // per slot: when something last happened
  lastCode: Uint8Array; // per slot: EV code
  lastSp: Int8Array; // per slot: the species it happened to
  lastLimit: Int8Array; // per slot: the limiting layer index, for deaths by stress
  count: Int32Array; // tiles per species, updated every tick
  prevCount: Int32Array; // at the last trend check
  biomass: number;
  gain: number; // biomass gained in the last tick
  rate: number; // smoothed biomass per second
  reached: string[];
  ready: string[]; // nodes whose requirements were met once (they stay met)
  traits: Record<string, string[]>;
  foundings: Record<string, number>;
  log: LogLine[];
};

export function createState(seed: number): State {
  const { w, h } = NUM.map, n = w * h, slots = n * STRATA.length;
  const s: State = {
    seed, rng: seed >>> 0, tick: 0, w, h,
    terrain: new Uint8Array(n), wet: new Float32Array(n), soilCap: new Float32Array(n), vents: [],
    layers: Object.fromEntries(LAYER_IDS.map((id) => [id, new Float32Array(n)])) as Record<LayerId, Float32Array>,
    occ: new Int8Array(slots).fill(-1), cover: new Float32Array(slots),
    lastTick: new Int32Array(slots), lastCode: new Uint8Array(slots), lastSp: new Int8Array(slots).fill(-1),
    lastLimit: new Int8Array(slots).fill(-1),
    count: new Int32Array(SPECIES.length), prevCount: new Int32Array(SPECIES.length),
    biomass: 0, gain: 0, rate: 0,
    reached: [...START_REACHED], ready: [],
    traits: Object.fromEntries(SPECIES.map((sp) => [sp.id, []])),
    foundings: Object.fromEntries(SPECIES.map((sp) => [sp.id, 0])),
    log: [],
  };
  buildIsland(s);
  return s;
}

function buildIsland(s: State) {
  const I = NUM.island, { w, h } = s;
  const wob = [rand(s) * 6.28, rand(s) * 6.28, rand(s) * 6.28];
  const vents: { x: number; y: number }[] = [];
  for (let k = 0; k < I.vents; k++) {
    // The first vent sits left of centre: the obvious first home.
    vents.push(k === 0 ? { x: w * 0.38, y: h * 0.5 } : { x: w * (0.3 + rand(s) * 0.4), y: h * (0.3 + rand(s) * 0.4) });
  }
  for (let i = 0; i < w * h; i++) {
    const x = i % w, y = (i / w) | 0;
    const a = Math.atan2(y - h / 2, x - w / 2);
    const edge = 1 + 0.1 * Math.sin(3 * a + wob[0]) + 0.06 * Math.sin(5 * a + wob[1]) + 0.04 * Math.sin(8 * a + wob[2]);
    const r = Math.hypot((x + 0.5 - w / 2) / (w * I.radius), (y + 0.5 - h / 2) / (h * I.radius)) / edge;
    const ventDist = Math.min(...vents.map((v) => Math.hypot(x + 0.5 - v.x, y + 0.5 - v.y)));
    const damp = Math.max(0, 1 - ventDist / I.ventRadius);
    if (r > 1) { s.terrain[i] = SEA; continue; }
    if (r > 1 - I.beachWidth) {
      s.terrain[i] = BEACH; s.wet[i] = I.beachWet; s.layers.salt[i] = I.beachSalt; s.soilCap[i] = I.soilCapBeach;
      continue;
    }
    s.terrain[i] = rand(s) < I.crackShare ? CRACK : LAVA;
    s.wet[i] = Math.min(1, Math.max(I.lavaWet, damp) + (s.terrain[i] === CRACK ? I.crackWet : 0));
    s.soilCap[i] = Math.min(1, I.soilCapBase + s.wet[i]);
  }
  // Salt spray reaches the land next to the beach.
  for (let i = 0; i < w * h; i++) {
    if (s.terrain[i] === SEA || s.terrain[i] === BEACH) continue;
    if (neighbours(s, i).some((j) => s.terrain[j] === BEACH)) s.layers.salt[i] = I.coastSalt;
  }
  // One vent tile per vent: the tile the vent point falls in.
  for (const v of vents) {
    const i = Math.floor(v.y) * w + Math.floor(v.x);
    if (s.terrain[i] !== SEA && s.terrain[i] !== BEACH) { s.terrain[i] = VENT; s.vents.push(i); }
  }
  for (let i = 0; i < w * h; i++) if (s.terrain[i] !== SEA) s.layers.water[i] = s.wet[i];
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
