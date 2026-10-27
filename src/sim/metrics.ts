// Numbers about the whole island: limits per species, trends for the feed, diversity and dominance for the runner.
import { LAYER_IDS, STRATA } from '../data/fields';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { fit, limitOf, type Profile } from './fit';
import { SEA, type State } from './state';

/** For one species: how many of its tiles each layer holds back (index = layer; one more = not held back). */
export function limitShare(s: State, p: Profile): number[] {
  const n = s.w * s.h, none = LAYER_IDS.length, out = new Array(none + 1).fill(0);
  for (let i = 0; i < n; i++) {
    if (s.occ[p.stratum * n + i] !== p.sp) continue;
    const f = fit(s, p, i), l = limitOf();
    out[f >= 0.999 || l < 0 ? none : l]++;
  }
  return out;
}

/** Every minute: a feed line for each placed species whose range grew or shrank a lot, with its main limit. */
export function trends(s: State, P: Profile[]) {
  for (let sp = 0; sp < SPECIES.length; sp++) {
    const before = s.prevCount[sp], now = s.count[sp], delta = now - before;
    if (!s.foundings[SPECIES[sp].id] || Math.abs(delta) < Math.max(8, 0.25 * before)) continue;
    const share = limitShare(s, P[sp]).slice(0, LAYER_IDS.length);
    const limit = share.indexOf(Math.max(...share));
    s.log.push({ tick: s.tick, kind: 'trend', sp, delta, limit: share[limit] > 0 ? limit : -1 });
  }
  s.prevCount.set(s.count);
}

export function landTiles(s: State): number {
  let n = 0;
  for (const t of s.terrain) if (t !== SEA) n++;
  return n;
}

/** Hill number of order 1 (exp of Shannon entropy) over tile counts: "how many equally common species". */
export function hill1(s: State): number {
  const total = s.count.reduce((a, b) => a + b, 0);
  if (!total) return 0;
  let h = 0;
  for (const c of s.count) if (c) { const p = c / total; h -= p * Math.log(p); }
  return Math.exp(h);
}

/** The largest share of the land any one plant holds in its stratum (fungi have theirs to themselves). */
export function dominance(s: State): { sp: number; share: number } {
  const land = landTiles(s);
  let best = { sp: -1, share: 0 };
  for (let sp = 0; sp < SPECIES.length; sp++) {
    if (SPECIES[sp].stratum === 'under') continue;
    const share = s.count[sp] / land;
    if (share > best.share) best = { sp, share };
  }
  return best;
}

/** A copy of who holds which slot, to measure turnover between two moments. */
export const snapshot = (s: State) => Int8Array.from(s.occ);

/** Share of plant slots (ground and herb, on land) whose occupant differs between two snapshots. */
export function changed(s: State, a: Int8Array, b: Int8Array): number {
  const n = s.w * s.h;
  let diff = 0, all = 0;
  for (let k = 1; k < STRATA.length; k++) for (let i = 0; i < n; i++) {
    if (s.terrain[i] === SEA) continue;
    all++;
    if (a[k * n + i] !== b[k * n + i]) diff++;
  }
  return diff / all;
}

export const minutes = (s: State) => s.tick / (60 * NUM.ticksPerSec);
