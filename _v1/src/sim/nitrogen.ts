// Nitrogen by the gram. Every species is `n` nitrogen by its grams. A plant takes production × n from its tile's
// available nitrogen (with too little, it makes less); a fixer fixes its own and adds `fix` per gram it makes. What
// falls carries its nitrogen into the litter (a hidden stock per tile); decay frees it, and a share `leak` is lost.
// An animal keeps its body's share of what it keeps; dung carries the rest, and what it burns goes back to the soil.
// Uptake slows as it runs low, and it evens out toward neighbours (spreadN). Rain adds a little everywhere. The books, like the grams': in (fixed, rain, came), out (leak), and the pools
// (plants, litter, animals, the soil's available nitrogen). Grams of nitrogen per tile; the layer holds available
// nitrogen in units of NITROGEN_MASS g/m².
import { ANIMAL_N } from '../data/animals';
import { STRATA } from '../data/fields';
import { NITROGEN_MASS } from '../data/masses';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { gramsOf } from './bodies';
import { SEA } from './island';
import type { State } from './state';

/** Grams of nitrogen on a tile per unit of the layer. */
export const N_UNIT = NITROGEN_MASS * NUM.mass.tile;
/** The nitrogen share of a base species' grams. */
export const nOf = (base: number) => SPECIES[base]?.n ?? ANIMAL_N;

type NFlows = { fixed: number; rain: number; came: number; leak: number; freed: number };
export type NBook = NFlows & {
  at: number; // grams of nitrogen at the last close
  last: NFlows & { gap: number; plants: number; litter: number; animals: number; soil: number };
};
const zero = (): NFlows => ({ fixed: 0, rain: 0, came: 0, leak: 0, freed: 0 });
export const newNBook = (): NBook => ({ ...zero(), at: 0, last: { ...zero(), gap: 0, plants: 0, litter: 0, animals: 0, soil: 0 } });

/** Takes up to `want` grams from tile i's available nitrogen; returns what it got. */
export function nTake(s: State, i: number, want: number): number {
  const L = s.layers.nitrogen, got = Math.max(0, Math.min(want, L[i] * N_UNIT));
  L[i] -= got / N_UNIT;
  return got;
}

/** Adds grams of nitrogen to tile i's available nitrogen. */
export function nGive(s: State, i: number, g: number) {
  s.layers.nitrogen[i] += g / N_UNIT;
}

/** Fresh land starts with a little. */
export function seedNitrogen(s: State) {
  for (let i = 0; i < s.w * s.h; i++) if (s.terrain[i] !== SEA) s.layers.nitrogen[i] = NUM.nitrogen.start / NITROGEN_MASS;
}

/** Rain over `dt` seconds. */
export function rain(s: State, dt: number) {
  const g = NUM.nitrogen.rain * NUM.mass.tile * dt;
  for (let i = 0; i < s.w * s.h; i++) if (s.terrain[i] !== SEA) { nGive(s, i, g); s.nbook.rain += g; }
}

const scratch = { a: new Float32Array(0) };
/** Available nitrogen evens out toward land neighbours over `dt` seconds: pairwise (right and down), so nothing is
 * made or lost. */
export function spreadN(s: State, dt: number) {
  const L = s.layers.nitrogen, n = s.w * s.h, k = (NUM.nitrogen.spread * dt) / 4;
  if (scratch.a.length !== n) scratch.a = new Float32Array(n);
  const v = scratch.a;
  v.set(L);
  for (let i = 0; i < n; i++) {
    if (s.terrain[i] === SEA) continue;
    const x = i % s.w;
    if (x + 1 < s.w && s.terrain[i + 1] !== SEA) { const f = k * (v[i] - v[i + 1]); L[i] -= f; L[i + 1] += f; }
    if (i + s.w < n && s.terrain[i + s.w] !== SEA) { const f = k * (v[i] - v[i + s.w]); L[i] -= f; L[i + s.w] += f; }
  }
}

/** Decay freed `g` grams of nitrogen from tile i's litter: most to the soil, a share lost. */
export function free(s: State, i: number, g: number) {
  const lost = g * NUM.nitrogen.leak;
  nGive(s, i, g - lost);
  s.nbook.freed += g; s.nbook.leak += lost;
}

/** All the nitrogen on tile i, in layer units: free in the soil, in the litter and in the plants (the map shows this;
 * plants keep the free share low where they grow). */
export function nAllAt(s: State, i: number): number {
  const n = s.w * s.h;
  let g = s.layers.nitrogen[i] * N_UNIT + s.litN[i] + s.fallN[i];
  for (let k = 0; k < STRATA.length; k++) { const v = s.occ[k * n + i]; if (v >= 0) g += s.mass[k * n + i] * nOf(s.species[s.variants[v].sp].base); }
  return g / N_UNIT;
}

/** The pools now, in grams of nitrogen. */
export function nPools(s: State) {
  const n = s.w * s.h;
  let plants = 0, litter = 0, soil = 0, animals = 0;
  for (let slot = 0; slot < n * STRATA.length; slot++) {
    const v = s.occ[slot];
    if (v >= 0) plants += s.mass[slot] * nOf(s.species[s.variants[v].sp].base);
  }
  for (let i = 0; i < n; i++) { litter += s.litN[i] + s.fallN[i]; soil += s.layers.nitrogen[i] * N_UNIT; }
  for (const a of s.agents) if (a.n > 0) animals += gramsOf(s, a) * nOf(s.species[a.sp].base);
  return { plants, litter, animals, soil };
}

/** Closes a period of the nitrogen books: the change in the pools against what came in and went out. */
export function closeNBook(s: State) {
  const B = s.nbook, p = nPools(s), now = p.plants + p.litter + p.animals + p.soil;
  B.last = { fixed: B.fixed, rain: B.rain, came: B.came, leak: B.leak, freed: B.freed, ...p, gap: now - B.at - (B.fixed + B.rain + B.came - B.leak) };
  B.at = now;
  Object.assign(B, zero());
}
