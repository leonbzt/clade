// Numbers about the whole island: limits per species, trends for the feed, diversity and dominance for the runner.
import { LIMIT_COUNT, STRATA } from '../data/fields';
import { NUM } from '../data/numbers';
import { fit, limitOf, type Profile } from './fit';
import { SEA, type State } from './state';
import { stratumOf } from './variants';

/** For one species: how many of its tiles each limit holds back (index = limit; one more = not held back).
 * Each tile is judged with its own variant's profile. */
export function limitShare(s: State, P: Profile[], sp: number): number[] {
  const n = s.w * s.h, none = LIMIT_COUNT, out = new Array(none + 1).fill(0), k = stratumOf(s, sp);
  for (let i = 0; i < n; i++) {
    const v = s.occ[k * n + i];
    if (v < 0 || s.variants[v].sp !== sp) continue;
    const f = fit(s, P[v], i), l = limitOf();
    out[f >= 0.999 || l < 0 ? none : l]++;
  }
  return out;
}

/** Every minute: a feed line for each placed species whose range grew or shrank a lot, with its main limit. */
export function trends(s: State, P: Profile[]) {
  for (let sp = 0; sp < s.species.length; sp++) {
    const before = s.prevCount[sp], now = s.count[sp], delta = now - before;
    if (!s.foundings[s.species[sp].id] || Math.abs(delta) < Math.max(8, 0.25 * before)) continue;
    const share = limitShare(s, P, sp).slice(0, LIMIT_COUNT);
    const limit = share.indexOf(Math.max(...share));
    s.log.push({ tick: s.tick, kind: 'trend', sp, delta, limit: share[limit] > 0 ? limit : -1 });
  }
  s.prevCount = [...s.count];
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
  for (let sp = 0; sp < s.species.length; sp++) {
    if (STRATA[stratumOf(s, sp)] === 'under') continue;
    const share = s.count[sp] / land;
    if (share > best.share) best = { sp, share };
  }
  return best;
}

/** A copy of which species holds which slot, to measure turnover between two moments. */
export const snapshot = (s: State) => Int16Array.from(s.occ, (v) => (v < 0 ? -1 : s.variants[v].sp));

/** Share of plant slots (ground and herb, on land) whose species differs between two snapshots. */
export function changed(s: State, a: Int16Array, b: Int16Array): number {
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

/** Mean change per land tile of one layer between two copies of it. */
export function swing(s: State, a: Float32Array, b: Float32Array): number {
  let sum = 0, c = 0;
  for (let i = 0; i < a.length; i++) if (s.terrain[i] !== SEA) { sum += Math.abs(a[i] - b[i]); c++; }
  return c ? sum / c : 0;
}

/** A layer's median and top tenth over the land. */
export function spreadOf(s: State, v: Float32Array): { median: number; top: number } {
  const xs = Array.from(v).filter((_, i) => s.terrain[i] !== SEA).sort((a, b) => a - b);
  return { median: xs[Math.floor(xs.length / 2)] ?? 0, top: xs[Math.floor(xs.length * 0.9)] ?? 0 };
}

/** Landmarks with at least `min` plant species living within `radius` tiles of them. */
export function livelyLandmarks(s: State, radius = 4, min = 3): number {
  const n = s.w * s.h;
  let lively = 0;
  for (const m of s.landmarks) {
    const seen = new Set<number>();
    for (const t of m.tiles) {
      const tx = t % s.w, ty = (t / s.w) | 0;
      for (let y = Math.max(0, ty - radius); y <= Math.min(s.h - 1, ty + radius); y++)
        for (let x = Math.max(0, tx - radius); x <= Math.min(s.w - 1, tx + radius); x++)
          for (let k = 1; k < STRATA.length; k++) { const v = s.occ[k * n + y * s.w + x]; if (v >= 0) seen.add(s.variants[v].sp); }
    }
    if (seen.size >= min) lively++;
  }
  return lively;
}
