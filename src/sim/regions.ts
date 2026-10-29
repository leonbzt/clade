// Regions: the island cut into named places, once, when it's made. Each landmark claims its surroundings (the vent
// field, the spring banks, the beach shore, the tube mouth); the open lava is split by wind side and cut into pieces
// of about NUM.regions.piece tiles. Stray bits and pieces under NUM.regions.min tiles join the neighbour they share
// the most border with. Regions don't change; the slot board reads the sim per region.
import { LANDMARKS, type LandmarkKind } from '../data/landmarks';
import { NUM } from '../data/numbers';
import { SEA } from './island';
import type { State } from './state';

export type Region = {
  name: string;
  kind: LandmarkKind | 'lava';
  windward: boolean;
  tiles: number;
  at: number; // where its name goes: the tile deepest inside it
};

const COMPASS = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
/** "north-west" for a direction on the map (y points south). */
export const compass = (a: number) => COMPASS[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];

/** The 8 neighbours inside the map. */
function near(s: State, i: number, f: (j: number) => void) {
  const x = i % s.w, y = (i / s.w) | 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if ((dx || dy) && nx >= 0 && ny >= 0 && nx < s.w && ny < s.h) f(ny * s.w + nx);
  }
}

/** Connected pieces of the tiles that pass `ok`, where neighbours join only if `same`. */
function pieces(s: State, ok: (i: number) => boolean, same: (i: number, j: number) => boolean): number[][] {
  const seen = new Uint8Array(s.w * s.h), out: number[][] = [];
  for (let i = 0; i < seen.length; i++) {
    if (seen[i] || !ok(i)) continue;
    const p = [i];
    seen[i] = 1;
    for (let q = 0; q < p.length; q++) near(s, p[q], (j) => { if (!seen[j] && ok(j) && same(p[q], j)) { seen[j] = 1; p.push(j); } });
    out.push(p);
  }
  return out;
}

/** Splits tiles into k compact parts: k-means on position, started from tiles spread far apart. */
function cut(s: State, tiles: number[], k: number): number[][] {
  if (k <= 1) return [tiles];
  const X = tiles.map((i) => i % s.w), Y = tiles.map((i) => (i / s.w) | 0), mx = X.reduce((a, b) => a + b) / X.length, my = Y.reduce((a, b) => a + b) / Y.length;
  const far = (from: [number, number][]) => {
    let best = 0, bd = -1;
    tiles.forEach((_, t) => { const d = Math.min(...from.map(([cx, cy]) => Math.hypot(X[t] - cx, Y[t] - cy))); if (d > bd) { bd = d; best = t; } });
    return [X[best], Y[best]] as [number, number];
  };
  const cs = [far([[mx, my]])];
  while (cs.length < k) cs.push(far(cs));
  const own = new Int32Array(tiles.length);
  for (let it = 0; it < 12; it++) {
    tiles.forEach((_, t) => { own[t] = cs.reduce((b, c, j) => (Math.hypot(X[t] - c[0], Y[t] - c[1]) < Math.hypot(X[t] - cs[b][0], Y[t] - cs[b][1]) ? j : b), 0); });
    cs.forEach((c, j) => {
      let sx = 0, sy = 0, m = 0;
      tiles.forEach((_, t) => { if (own[t] === j) { sx += X[t]; sy += Y[t]; m++; } });
      if (m) { c[0] = sx / m; c[1] = sy / m; }
    });
  }
  return cs.map((_, j) => tiles.filter((_, t) => own[t] === j)).filter((p) => p.length);
}

export function buildRegions(s: State, rough: Float32Array) {
  const R = NUM.regions, n = s.w * s.h, land = (i: number) => s.terrain[i] !== SEA;
  const label = new Int32Array(n).fill(-1), kinds: Region['kind'][] = [], names: string[] = [];

  // 1. Landmarks claim their surroundings; where two reach, the nearer one (relative to its reach) wins.
  const best = new Float32Array(n).fill(Infinity);
  s.landmarks.forEach((m, k) => {
    const { reach, word } = LANDMARKS[m.kind].area;
    kinds.push(m.kind); names.push(`${m.name} ${word}`);
    const xs = m.tiles.map((i) => i % s.w), ys = m.tiles.map((i) => (i / s.w) | 0), far = Math.ceil(reach / 0.7) + 1;
    for (let y = Math.max(0, Math.min(...ys) - far); y <= Math.min(s.h - 1, Math.max(...ys) + far); y++)
      for (let x = Math.max(0, Math.min(...xs) - far); x <= Math.min(s.w - 1, Math.max(...xs) + far); x++) {
        const j = y * s.w + x;
        if (!land(j)) continue;
        let d = 1e9;
        for (let t = 0; t < xs.length; t++) d = Math.min(d, Math.hypot(xs[t] - x, ys[t] - y));
        const q = (d * rough[j]) / reach;
        if (q <= 1 && q < best[j]) { best[j] = q; label[j] = k; }
      }
  });

  // 2. The open lava, by wind side, in connected pieces; big pieces are cut into parts.
  const side = (i: number) => s.windward[i] >= 0.5;
  for (const p of pieces(s, (i) => land(i) && label[i] < 0, (i, j) => side(i) === side(j)))
    for (const part of cut(s, p, Math.round(p.length / R.piece))) {
      for (const i of part) label[i] = kinds.length;
      kinds.push('lava'); names.push('');
    }

  // 3. Each region one solid piece of at least `min` tiles: strays and small ones join the neighbour they share the
  //    most border with, smallest first. Then, while there are too many, the smallest joins one too.
  const stuck = new Set<number>(); // a piece with no land neighbour (a lone rock): left as it is
  for (;;) {
    const all = pieces(s, (i) => label[i] >= 0, (i, j) => label[i] === label[j]).filter((p) => !stuck.has(p[0]));
    const main = new Map<number, number[]>();
    for (const p of all) if ((main.get(label[p[0]])?.length ?? 0) < p.length) main.set(label[p[0]], p);
    const weak = all.filter((p) => main.get(label[p[0]]) !== p || p.length < R.min).sort((a, b) => a.length - b.length);
    const p = weak[0] ?? (main.size > R.most ? [...main.values()].sort((a, b) => a.length - b.length)[0] : null);
    if (!p) break;
    const border = new Map<number, number>(), own = label[p[0]];
    for (const i of p) near(s, i, (j) => { if (label[j] >= 0 && label[j] !== own) border.set(label[j], (border.get(label[j]) ?? 0) + 1); });
    const into = [...border].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];
    if (into === undefined) { stuck.add(p[0]); continue; }
    for (const i of p) label[i] = into;
  }

  // 4. Number them, find where each name goes, and name the lava.
  const ids = [...new Set(label)].filter((l) => l >= 0).sort((a, b) => a - b), to = new Map(ids.map((l, k) => [l, k]));
  for (let i = 0; i < n; i++) s.region[i] = label[i] >= 0 ? to.get(label[i])! : -1;
  const m = ids.length, sum = Array.from({ length: m }, () => ({ x: 0, y: 0, w: 0, c: 0 }));
  for (let i = 0; i < n; i++) {
    const r = s.region[i];
    if (r < 0) continue;
    sum[r].x += i % s.w; sum[r].y += (i / s.w) | 0; sum[r].w += s.windward[i]; sum[r].c++;
  }
  // The deepest tile: the most steps from the region's edge, then the nearest its middle.
  const depth = new Int32Array(n).fill(-1), queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (s.region[i] < 0) continue;
    let edge = (i % s.w) === 0 || (i % s.w) === s.w - 1 || i < s.w || i >= n - s.w;
    near(s, i, (j) => { if (s.region[j] !== s.region[i]) edge = true; });
    if (edge) { depth[i] = 0; queue.push(i); }
  }
  for (let q = 0; q < queue.length; q++) near(s, queue[q], (j) => { if (depth[j] < 0 && s.region[j] === s.region[queue[q]]) { depth[j] = depth[queue[q]] + 1; queue.push(j); } });
  const at = new Int32Array(m).fill(-1), off = (r: number, i: number) => Math.hypot((i % s.w) - sum[r].x / sum[r].c, ((i / s.w) | 0) - sum[r].y / sum[r].c);
  for (let i = 0; i < n; i++) {
    const r = s.region[i];
    if (r >= 0 && (at[r] < 0 || depth[i] > depth[at[r]] || (depth[i] === depth[at[r]] && off(r, i) < off(r, at[r])))) at[r] = i;
  }
  s.regions = ids.map((l, r) => ({ name: names[l], kind: kinds[l], windward: sum[r].w / sum[r].c >= 0.5, tiles: sum[r].c, at: at[r] }));
  nameLava(s, sum.map((c) => [c.x / c.c, c.y / c.c]));
}

/** "Windward lava, north": the wind side, then the direction from the island's middle. Twins: the one nearer the
 * middle is "inner"; a third gets a number. */
function nameLava(s: State, mid: number[][]) {
  const cx = s.w / 2, cy = s.h / 2, from = (r: number) => Math.hypot((mid[r][0] - cx) / s.w, (mid[r][1] - cy) / s.h);
  const lava = s.regions.map((_, r) => r).filter((r) => s.regions[r].kind === 'lava').sort((a, b) => from(b) - from(a));
  const used = new Map<string, number>();
  for (const r of lava) {
    const g = s.regions[r], dir = from(r) < 0.08 ? 'middle' : compass(Math.atan2((mid[r][1] - cy) / s.h, (mid[r][0] - cx) / s.w));
    const base = `${g.windward ? 'Windward' : 'Lee'} lava, ${dir}`, k = used.get(base) ?? 0;
    used.set(base, k + 1);
    g.name = k === 0 ? base : k === 1 ? `${g.windward ? 'Windward' : 'Lee'} lava, inner ${dir}` : `${base} ${k + 1}`;
  }
}
