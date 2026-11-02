// Animals in grams. A member stands for `stands` real animals per m² of tile: its body is MASS × stands × the tile's
// m², and its store holds up to `store` × that. It burns B × upkeep × stands × mass^0.75 g/s (each real animal by its
// own mass), and the store e (0–1) is what it has left. A group also carries `bit`: grams hunters took from members
// not yet whole. So a group weighs n × (body + e × store) − bit, and every gram it gains or loses is counted.
import { ANIMAL, type Food } from '../data/animals';
import { MASS } from '../data/masses';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import type { Profile } from './fit';
import type { Agent, State } from './state';

/** Per base species, worked out once: [body, full store, burn] in grams (and grams per second). */
const cache: [number, number, number][] = [];
function numbers(base: number): [number, number, number] {
  if (cache[base]) return cache[base];
  const d = SPECIES[base], m = MASS[d.id] ?? 0, b = d.animal, stands = (b?.stands ?? 0) * NUM.mass.tile;
  return (cache[base] = [m * stands, m * stands * (b?.store ?? 0), ANIMAL.B * stands * m ** 0.75]);
}

/** A member's body, in grams. */
export const bodyG = (s: State, sp: number) => numbers(s.species[sp].base)[0];
/** A member's full store, in grams. */
export const storeG = (s: State, sp: number) => numbers(s.species[sp].base)[1];
/** A member's burn at rest and full fit, in grams per second (its upkeep genes included). */
export const burnG = (s: State, p: Profile) => numbers(s.species[p.sp].base)[2] * p.body.upkeep!;
/** One member, body and store. */
export const memberG = (s: State, a: Agent) => bodyG(s, a.sp) + a.e * storeG(s, a.sp);
/** All the grams a group holds. */
export const gramsOf = (s: State, a: Agent) => a.n * memberG(s, a) - a.bit;
/** The share of a food's grams it keeps (its gain genes included). */
export const keepOf = (d: Food, p: Profile) => Math.min(0.95, (d.keep ?? ('prey' in d ? ANIMAL.keep.prey : ANIMAL.keep.plants)) * p.body.gain!);
/** How much of its appetite a food can fill: its share, and side foods × range. */
export const shareOf = (d: Food, k: number, p: Profile) => ('share' in d ? d.share ?? 1 : 1) * (k ? Math.min(1, p.body.range!) : 1);

/** Hunters take `g` grams from a group: whole members go as the bitten grams add up to one. Returns the members
 * lost. */
export function bite(s: State, a: Agent, g: number): number {
  const m = memberG(s, a);
  a.bit += g;
  const whole = Math.min(a.n, Math.floor(a.bit / m));
  a.n -= whole; a.bit -= whole * m;
  if (a.n <= 0) a.bit = 0;
  return whole;
}

/** Members dying of age take the bitten grams with them first. Returns the grams they leave. */
export function lose(s: State, a: Agent, members: number): number {
  const g = members * memberG(s, a), from = Math.min(a.bit, g);
  a.n -= members; a.bit -= from;
  if (a.n <= 0) a.bit = 0;
  return g - from;
}
