// The game state: plain data and typed arrays, so it can be cloned, hashed and (later) saved.
import { NUM } from '../data/numbers';
import { SPECIES, SPECIES_INDEX } from '../data/species';
import { START_REACHED } from '../data/tree';
import { rand } from './rng';

export const SEA = 0, BEACH = 1, LAVA = 2, CRACK = 3, VENT = 4;
export const TERRAIN_NAMES = ['Sea', 'Beach', 'Lava field', 'Crack', 'Steam vent'];

export type State = {
  seed: number;
  rng: number;
  tick: number;
  w: number;
  h: number;
  terrain: Uint8Array;
  moisture: Float32Array; // base moisture; soil adds to it
  soil: Float32Array;
  occ: Int8Array; // species index, or -1
  growth: Float32Array; // 0–1, how established the occupant is
  biomass: number;
  gain: number; // biomass gained in the last tick
  reached: string[];
  traits: Record<string, string[]>;
  foundings: Record<string, number>;
};

export function createState(seed: number): State {
  const { w, h } = NUM.map, n = w * h;
  const s: State = {
    seed, rng: seed >>> 0, tick: 0, w, h,
    terrain: new Uint8Array(n), moisture: new Float32Array(n), soil: new Float32Array(n),
    occ: new Int8Array(n).fill(-1), growth: new Float32Array(n),
    biomass: 0, gain: 0,
    reached: [...START_REACHED],
    traits: Object.fromEntries(SPECIES.map((sp) => [sp.id, []])),
    foundings: Object.fromEntries(SPECIES.map((sp) => [sp.id, 0])),
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
    if (r > 1 - I.beachWidth) { s.terrain[i] = BEACH; s.moisture[i] = I.beachMoisture; continue; }
    s.terrain[i] = rand(s) < I.crackShare ? CRACK : LAVA;
    s.moisture[i] = Math.max(I.lavaMoisture, damp) + (s.terrain[i] === CRACK ? I.crackMoisture : 0);
  }
  // One vent tile per vent: the tile the vent point falls in.
  for (const v of vents) {
    const i = Math.floor(v.y) * w + Math.floor(v.x);
    if (s.terrain[i] !== SEA && s.terrain[i] !== BEACH) s.terrain[i] = VENT;
  }
  const lichen = SPECIES_INDEX.lichen, home = vents[0];
  for (let k = 0, tries = 0; k < I.lichenSeeds && tries < 500; tries++) {
    const i = Math.floor(rand(s) * w * h), x = i % w, y = (i / w) | 0;
    if (s.terrain[i] !== LAVA || Math.hypot(x - home.x, y - home.y) < I.lichenClear) continue;
    s.occ[i] = lichen; s.growth[i] = 0.6; k++;
  }
}

export const idx = (s: State, x: number, y: number) => y * s.w + x;

export function neighbours(s: State, i: number): number[] {
  const x = i % s.w, y = (i / s.w) | 0, out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if ((dx || dy) && nx >= 0 && ny >= 0 && nx < s.w && ny < s.h) out.push(ny * s.w + nx);
  }
  return out;
}
