// The one generic kernel for every layer. Levels are recomputed; stocks get inflow, use, decay and diffusion.
// No layer has its own update code: it's all driven by FIELDS and the species' makes.
import { FIELDS, LAYER_IDS, LEVEL_ORDER, STOCK_ORDER, STRATA, type LayerId, type LevelDef, type StockDef } from '../data/fields';
import { SEA, type State } from './state';
import { fit, type Profile } from './fit';

/** Per tile: what the occupants put into or take from each layer this second. */
export type Flows = {
  plus: Record<LayerId, Float32Array>; // stocks: inflow per second (before saturation)
  minus: Record<LayerId, Float32Array>; // stocks: use per second (before availability)
  add: Record<LayerId, Float32Array>; // levels: contribution
  cover: Float32Array; // the highest plant cover on the tile (protects soil)
};

let flows: Flows | null = null;
const arrs = (n: number) => Object.fromEntries(LAYER_IDS.map((id) => [id, new Float32Array(n)])) as Record<LayerId, Float32Array>;

/** Sums what every occupant makes, per tile and layer. */
export function gatherFlows(s: State, P: Profile[]): Flows {
  const n = s.w * s.h;
  if (!flows || flows.cover.length !== n) flows = { plus: arrs(n), minus: arrs(n), add: arrs(n), cover: new Float32Array(n) };
  const F = flows;
  for (const id of LAYER_IDS) { F.plus[id].fill(0); F.minus[id].fill(0); F.add[id].fill(0); }
  F.cover.fill(0);
  for (let k = 0; k < STRATA.length; k++) for (let i = 0; i < n; i++) {
    const slot = k * n + i, sp = s.occ[slot];
    if (sp < 0) continue;
    const p = P[sp], cover = s.cover[slot], act = cover * fit(s, p, i);
    if (k > 0 && cover > F.cover[i]) F.cover[i] = cover;
    for (const id in p.makes) {
      const r = p.makes[id as LayerId]!, def = FIELDS[id as LayerId];
      if (def.kind === 'level') F.add[id as LayerId][i] += r * cover;
      else if (r > 0) F.plus[id as LayerId][i] += r * act;
      else F.minus[id as LayerId][i] -= r * act;
    }
  }
  return F;
}

/** The parts of one stock's change per second on one tile. Shared by the kernel and the tile card. */
export function stockTerms(def: StockDef, v: number, plus: number, minus: number, cover: number, mean: number) {
  return {
    made: plus * (1 - v), // slows as it fills up
    used: -minus * (v / (v + 0.05)), // can't take what isn't there
    decay: -def.decay * (v - def.rest) * (1 - (def.protect ?? 0) * cover),
    spread: (def.diffuse ?? 0) * (mean - v),
  };
}

/** The parts of one level on one tile. */
export function levelTerms(s: State, def: LevelDef, add: number, i: number) {
  const out: { label: string; value: number }[] = [];
  if (def.wet) out.push({ label: 'island base', value: s.wet[i] });
  for (const [l, w] of Object.entries(def.from ?? {})) out.push({ label: FIELDS[l as LayerId].name, value: w * s.layers[l as LayerId][i] });
  if (add) out.push({ label: 'plants here', value: add });
  return out;
}

const scratch = { a: new Float32Array(0) };

export function landMean(s: State, v: Float32Array, i: number): number {
  const x = i % s.w, y = (i / s.w) | 0;
  let sum = 0, c = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= s.w || ny >= s.h) continue;
    const j = ny * s.w + nx;
    if (s.terrain[j] === SEA) continue;
    sum += v[j]; c++;
  }
  return c ? sum / c : v[i];
}

export function updateFields(s: State, P: Profile[], dt: number) {
  const n = s.w * s.h, F = gatherFlows(s, P);
  if (scratch.a.length !== n) scratch.a = new Float32Array(n);
  const tmp = scratch.a;
  for (const id of LEVEL_ORDER) {
    const def = FIELDS[id] as LevelDef, v = s.layers[id];
    for (let i = 0; i < n; i++) {
      if (s.terrain[i] === SEA) { tmp[i] = 0; continue; }
      let x = F.add[id][i];
      for (const t of levelTerms(s, def, 0, i)) x += t.value;
      tmp[i] = x;
    }
    const b = def.bleed ?? 0;
    for (let i = 0; i < n; i++) {
      if (s.terrain[i] === SEA) { v[i] = 0; continue; }
      const x = b ? (1 - b) * tmp[i] + b * landMean(s, tmp, i) : tmp[i];
      v[i] = x < 0 ? 0 : x > 1 ? 1 : x;
    }
  }
  for (const id of STOCK_ORDER) {
    const def = FIELDS[id] as StockDef, v = s.layers[id];
    tmp.set(v);
    for (let i = 0; i < n; i++) {
      if (s.terrain[i] === SEA) continue;
      const mean = def.diffuse ? landMean(s, tmp, i) : tmp[i];
      const t = stockTerms(def, tmp[i], F.plus[id][i], F.minus[id][i], F.cover[i], mean);
      let x = tmp[i] + dt * (t.made + t.used + t.decay + t.spread);
      if (def.capped && x > s.soilCap[i]) x = s.soilCap[i];
      v[i] = x < 0 ? 0 : x > 1 ? 1 : x;
    }
  }
}
