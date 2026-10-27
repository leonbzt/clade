// Profiles (a species with its traits applied, each change tagged with its source), need scores, fit and tiers.
import { FIELDS, LAYER_IDS, STATUS_IDS, STRATA, type LayerId, type LevelDef, type StatusId } from '../data/fields';
import { NUM } from '../data/numbers';
import { SPECIES, type Band, type Scalar } from '../data/species';
import { SEA, type State } from './state';

export type Need = { layer: number; band: Band };
export type Tolerance = { status: number; tol: number }; // index into STATUS_IDS; the score at full strength
export type Profile = {
  sp: number;
  stratum: number;
  needs: Need[];
  tolerance: Tolerance[];
  makes: Partial<Record<LayerId, number>>;
  stats: Record<Scalar, number>;
  parts: Record<string, string[]>; // why each number is what it is: 'seeds', 'need:water', 'make:nitrogen', ...
};

const SCALARS: Scalar[] = ['seeds', 'hold', 'yield', 'life', 'grow', 'reserve'];

export function profile(s: State, sp: number): Profile {
  const def = SPECIES[sp], owned = def.traits.filter((t) => s.traits[def.id].includes(t.id));
  const stats = {} as Record<Scalar, number>, parts: Record<string, string[]> = {};
  for (const k of SCALARS) { stats[k] = def[k]; parts[k] = [`base ${fmt(def[k])}`]; }
  const bands: Partial<Record<LayerId, number[]>> = {};
  for (const [id, b] of Object.entries(def.needs)) { bands[id as LayerId] = [...b]; parts[`need:${id}`] = []; }
  const makes = { ...def.makes };
  for (const id of Object.keys(makes)) parts[`make:${id}`] = [`base ${fmt(makes[id as LayerId]!)}`];
  for (const t of owned) for (const m of t.mods) {
    if ('stat' in m) { stats[m.stat] *= m.mul; parts[m.stat].push(`${t.name} ×${m.mul}`); }
    else if ('make' in m) { makes[m.make] = (makes[m.make] ?? 0) * m.mul; parts[`make:${m.make}`]?.push(`${t.name} ×${m.mul}`); }
    else {
      const b = bands[m.need];
      if (!b) continue;
      if (m.low) { b[0] += m.low; b[1] += m.low; parts[`need:${m.need}`].push(`${t.name}: lower edge ${sign(m.low)}`); }
      if (m.high) { b[2] += m.high; b[3] += m.high; parts[`need:${m.need}`].push(`${t.name}: upper edge ${sign(m.high)}`); }
    }
  }
  const needs = (Object.entries(bands) as [LayerId, number[]][]).map(([id, b]) => ({
    layer: LAYER_IDS.indexOf(id), band: b as unknown as Band,
  }));
  // Statuses not listed are tolerated fully.
  const tolerance = (Object.entries(def.tolerance) as [StatusId, number][]).map(([id, tol]) => ({ status: STATUS_IDS.indexOf(id), tol }));
  return { sp, stratum: STRATA.indexOf(def.stratum), needs, tolerance, makes, stats, parts };
}

export function profiles(s: State): Profile[] {
  return SPECIES.map((_, i) => profile(s, i));
}

/** 0 outside the band, 1 on its ideal part, 0.2–1 on the slopes. */
export function score(v: number, b: Band): number {
  if (v < b[0] || v > b[3]) return 0;
  if (v < b[1]) return 0.2 + (0.8 * (v - b[0])) / (b[1] - b[0]);
  if (v > b[2]) return 0.2 + (0.8 * (b[3] - v)) / (b[3] - b[2]);
  return 1;
}

const SHADE = LAYER_IDS.indexOf('shade');
const SHADE_BELOW = STRATA.indexOf((FIELDS.shade as LevelDef).readBelow!);

/** The value a species in this stratum feels: shade only falls on what's below the herbs. */
export function feltValue(s: State, layer: number, stratum: number, i: number): number {
  if (layer === SHADE && stratum >= SHADE_BELOW) return 0;
  return s.layers[LAYER_IDS[layer]][i];
}

let lastLimit = -1;
/** The score a status gives: 1 where it's absent, down to the tolerance at full strength. */
export const statusScore = (strength: number, tol: number) => 1 - strength * (1 - tol);

/** Fit 0–1: the lowest need score, statuses included. `limitOf()` right after tells which limit set it. */
export function fit(s: State, p: Profile, i: number): number {
  lastLimit = -1;
  if (s.terrain[i] === SEA) return 0;
  let f = 1;
  for (const n of p.needs) {
    const v = score(feltValue(s, n.layer, p.stratum, i), n.band);
    if (v < f) { f = v; lastLimit = n.layer; }
  }
  for (const t of p.tolerance) {
    const v = statusScore(s.statuses[STATUS_IDS[t.status]][i], t.tol);
    if (v < f) { f = v; lastLimit = LAYER_IDS.length + t.status; }
  }
  return f;
}

/** The limit (layer, or LAYER_IDS.length + status) of the last fit() call, or -1 when nothing held it back. */
export const limitOf = () => lastLimit;

export function tierOf(f: number): string | null {
  if (f <= 0) return null;
  return NUM.tiers.find(([, min]) => f >= min)![0];
}

function fmt(v: number): string {
  return Math.abs(v) >= 0.1 ? String(+v.toFixed(2)) : String(+v.toPrecision(2));
}
const sign = (v: number) => (v > 0 ? '+' : '') + fmt(v);
