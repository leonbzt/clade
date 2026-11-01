// The one generic kernel for every layer. Levels are recomputed; stocks get inflow, use, decay and diffusion.
// No layer has its own update code: it's all driven by FIELDS and the species' makes, except nitrogen, which goes by
// the gram (nitrogen.ts). Litter is grams: what falls is shared out without loss, with its nitrogen, and what leaves
// it is counted as decay in the ledger; decay frees the nitrogen it held. Fungi speed decay on their tile.
import { FIELDS, LAYER_IDS, LEVEL_ORDER, STOCK_ORDER, STRATA, type LayerId, type LevelDef, type StockDef } from '../data/fields';
import { SEA, type State } from './state';
import { type Profile } from './fit';
import { litterFlow, LITTER_G } from './tally';
import { free, rain, spreadN } from './nitrogen';

/** Per tile: what the occupants put into or take from each layer this second. */
export type Flows = {
  plus: Record<LayerId, Float32Array>; // stocks: inflow per second (before saturation)
  minus: Record<LayerId, Float32Array>; // stocks: use per second (before availability)
  add: Record<LayerId, Float32Array>; // levels: contribution
  cover: Float32Array; // the highest plant cover on the tile (protects soil)
  rot: Float32Array; // how much faster litter decays here (fungi: rot × activity)
};

let flows: Flows | null = null;
const arrs = (n: number) => Object.fromEntries(LAYER_IDS.map((id) => [id, new Float32Array(n)])) as Record<LayerId, Float32Array>;

/** Sums what every occupant makes, per tile and layer. */
export function gatherFlows(s: State, P: Profile[]): Flows {
  const n = s.w * s.h;
  if (!flows || flows.cover.length !== n) flows = { plus: arrs(n), minus: arrs(n), add: arrs(n), cover: new Float32Array(n), rot: new Float32Array(n) };
  const F = flows;
  for (const id of LAYER_IDS) { F.plus[id].fill(0); F.minus[id].fill(0); F.add[id].fill(0); }
  F.cover.fill(0); F.rot.fill(0);
  for (let k = 0; k < STRATA.length; k++) for (let i = 0; i < n; i++) {
    const slot = k * n + i, sp = s.occ[slot];
    if (sp < 0) continue;
    const p = P[sp], cover = s.cover[slot], act = cover * s.health[slot];
    if (k > 0 && cover > F.cover[i]) F.cover[i] = cover;
    if (p.stats.rot) F.rot[i] += p.stats.rot * act;
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
export function stockTerms(def: StockDef, v: number, plus: number, minus: number, cover: number, mean: number, fell = 0, rot = 0) {
  return {
    fell, // dead plants, here and next door
    made: plus * (1 - v), // slows as it fills up
    used: -minus * (v / (v + 0.05)), // can't take what isn't there
    decay: -def.decay * (v - def.rest) * (1 - (def.protect ?? 0) * cover) * (1 + rot),
    spread: (def.diffuse ?? 0) * (mean - v),
  };
}

/** The parts of one level on one tile. */
export function levelTerms(s: State, id: LayerId, def: LevelDef, add: number, i: number) {
  const out: { label: string; value: number }[] = [];
  if (s.base[id][i]) out.push({ label: 'ground, landmarks and wind', value: s.base[id][i] });
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

/** Litter falling on tile i (per second) and its nitrogen (grams): half stays, half goes to its land neighbours (all
 * of it, if it has none; at sea, all of it goes to land). */
function share(s: State, i: number, f: number, g: number) {
  const x = i % s.w, y = (i / s.w) | 0, near: number[] = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if ((dx || dy) && nx >= 0 && ny >= 0 && nx < s.w && ny < s.h && s.terrain[ny * s.w + nx] !== SEA) near.push(ny * s.w + nx);
  }
  const keep = !near.length ? 1 : s.terrain[i] === SEA ? 0 : 0.5;
  fellLast[i] += f * keep; landN[i] += g * keep;
  for (const j of near) { fellLast[j] += (f * (1 - keep)) / near.length; landN[j] += (g * (1 - keep)) / near.length; }
}
/** The nitrogen that landed with it at the last update, per tile. */
let landN = new Float32Array(0);

/** Litter that fell per second at the last update, for the tile card. */
export let fellLast = new Float32Array(0);

export function updateFields(s: State, P: Profile[], dt: number) {
  const n = s.w * s.h, F = gatherFlows(s, P);
  if (scratch.a.length !== n) scratch.a = new Float32Array(n);
  const tmp = scratch.a;
  for (const id of LEVEL_ORDER) {
    const def = FIELDS[id] as LevelDef, v = s.layers[id];
    for (let i = 0; i < n; i++) {
      if (s.terrain[i] === SEA) { tmp[i] = 0; continue; }
      let x = F.add[id][i];
      for (const t of levelTerms(s, id, def, 0, i)) x += t.value;
      tmp[i] = x;
    }
    const b = def.bleed ?? 0;
    for (let i = 0; i < n; i++) {
      if (s.terrain[i] === SEA) { v[i] = 0; continue; }
      const x = b ? (1 - b) * tmp[i] + b * landMean(s, tmp, i) : tmp[i];
      v[i] = x < 0 ? 0 : x > 1 ? 1 : x;
    }
  }
  if (fellLast.length !== n) { fellLast = new Float32Array(n); landN = new Float32Array(n); }
  fellLast.fill(0); landN.fill(0);
  for (let i = 0; i < n; i++) if (s.fall[i] || s.fallN[i]) share(s, i, s.fall[i] / dt, s.fallN[i]);
  s.fall.fill(0); s.fallN.fill(0);
  for (const id of STOCK_ORDER) {
    if (id === 'nitrogen') continue; // by the gram (nitrogen.ts)
    const def = FIELDS[id] as StockDef, v = s.layers[id];
    tmp.set(v);
    for (let i = 0; i < n; i++) {
      if (s.terrain[i] === SEA) { if (id === 'litter') s.litN[i] += landN[i]; continue; }
      const mean = def.diffuse ? landMean(s, tmp, i) : tmp[i];
      const t = stockTerms(def, tmp[i], F.plus[id][i], F.minus[id][i], F.cover[i], mean, def.fall ? fellLast[i] : 0, id === 'litter' ? F.rot[i] : 0);
      let x = tmp[i] + dt * (t.made + t.used + t.decay + t.spread + t.fell);
      if (id === 'litter' && (t.made || t.used)) litterFlow(s, P, i, t.made * dt, Math.min(tmp[i], -t.used * dt));
      for (const to in def.into) { const u = s.layers[to as LayerId]; u[i] = Math.min(1, u[i] - dt * t.decay * def.into[to as LayerId]!); }
      if (def.capped && x > s.soilCap[i]) x = s.soilCap[i];
      v[i] = x < 0 ? 0 : x > 1 && !def.open ? 1 : x;
      if (id === 'litter') {
        const had = tmp[i] + dt * (t.fell + t.made), gone = had - v[i], N = s.litN[i] + landN[i];
        s.ledger.decay += gone * LITTER_G; s.ledger.prod += dt * t.made * LITTER_G;
        const g = had > 0 ? (N * Math.max(0, gone)) / had : 0; // the nitrogen leaves with its share of the grams
        s.litN[i] = N - g;
        if (g > 0) free(s, i, g);
      }
    }
  }
  rain(s, dt);
  spreadN(s, dt);
}
