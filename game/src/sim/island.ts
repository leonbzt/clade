// The island, from its seed: the coast, beaches, vents, springs with their streams and cracks; then the water and
// the starting soil they leave. Deterministic: everything comes back from the seed.
import { BARE, BEACH, FOREST, F_CRACK, F_SPRING, F_STREAM, F_VENT, ISLAND, LAVA, SEA, SUCCESSION, WET } from '../data/island';
import { between, seeded, type Rng } from './rng';

export interface Island {
  seed: number; w: number; h: number;
  kind: Uint8Array; // SEA … WET
  feature: Uint8Array; // F_NONE … F_CRACK
  water: Float32Array; // 0..1, before the half-year
  soil: Float32Array; // soil depth, 0..SUCCESSION.max
  hot: Uint8Array; // 1 near a vent: fresh lava
  vents: number[]; springs: number[];
}

const dist = (w: number, i: number, j: number) => Math.hypot((i % w) - (j % w), ((i / w) | 0) - ((j / w) | 0));

/** A tile's kind from its water and soil (sea and beach never change). */
export function kindOf(isl: Island, i: number): number {
  const k = isl.kind[i];
  if (k === SEA || k === BEACH) return k;
  if (isl.water[i] >= ISLAND.wet) return WET;
  const s = isl.soil[i];
  return s < SUCCESSION.bare ? LAVA : s < SUCCESSION.forest ? BARE : FOREST;
}

export function makeIsland(seed: number): Island {
  const I = ISLAND, w = I.w, h = I.h, n = w * h, rng = seeded(seed);
  const isl: Island = {
    seed, w, h, kind: new Uint8Array(n), feature: new Uint8Array(n), water: new Float32Array(n), soil: new Float32Array(n), hot: new Uint8Array(n),
    vents: [], springs: [],
  };
  // A wobbly ellipse: a few waves around the coast make bays and points.
  const wob = [0, 1, 2, 3].map(() => rng() * 6.28), r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i % w, y = (i / w) | 0, a = Math.atan2(y - h / 2, x - w / 2);
    const edge = 1 + 0.1 * Math.sin(2 * a + wob[0]) + 0.08 * Math.sin(3 * a + wob[1]) + 0.06 * Math.sin(5 * a + wob[2]) + 0.04 * Math.sin(9 * a + wob[3]);
    r[i] = Math.hypot((x + 0.5 - w / 2) / (w * I.radius), (y + 0.5 - h / 2) / (h * I.radius)) / edge;
    isl.kind[i] = r[i] > 1 ? SEA : LAVA;
    if (isl.kind[i] === LAVA && rng() < I.crackShare) isl.feature[i] = F_CRACK;
  }
  const toSea = seaDistance(isl);

  // Beaches: stretches of the coast, spread around the island.
  const nb = between(rng, I.beaches), a0 = rng() * 6.28;
  for (let k = 0; k < nb; k++) {
    const a = a0 + (k * 6.28) / nb + (rng() - 0.5) * 0.8, span = 0.2 + rng() * 0.25;
    for (let i = 0; i < n; i++) {
      if (isl.kind[i] === SEA || toSea[i] > 2) continue;
      const d = Math.atan2(((i / w) | 0) - h / 2, (i % w) - w / 2) - a;
      if (Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) < span) { isl.kind[i] = BEACH; isl.feature[i] = 0; }
    }
  }
  const land = (j: number) => isl.kind[j] === LAVA;

  // Vents: the first sits left of centre (the obvious first home); the others spread out inland.
  const nv = between(rng, I.vents);
  for (let k = 0; k < nv; k++) {
    const i = k === 0 ? Math.floor(h * 0.5) * w + Math.floor(w * 0.38)
      : pick(rng, n, (j) => r[j] < 0.6 && land(j) && isl.vents.every((v) => dist(w, j, v) >= 16));
    if (i < 0) continue;
    isl.vents.push(i); isl.feature[i] = F_VENT;
  }

  // Springs, each with a stream that wanders toward the sea.
  const ns = between(rng, I.springs), streams: number[] = [];
  for (let k = 0; k < ns; k++) {
    const i = pick(rng, n, (j) => r[j] > 0.25 && r[j] < 0.7 && land(j)
      && isl.vents.every((v) => dist(w, j, v) >= 10) && isl.springs.every((v) => dist(w, j, v) >= 14));
    if (i < 0) continue;
    isl.springs.push(i);
    const line = walk(isl, rng, i, Math.atan2(((i / w) | 0) - h / 2, (i % w) - w / 2), 0.5, I.streamLen, land);
    for (const j of line) { isl.feature[j] = F_STREAM; streams.push(j); }
    isl.feature[i] = F_SPRING;
  }

  for (const v of isl.vents) for (let i = 0; i < n; i++) if (isl.kind[i] === LAVA && dist(w, i, v) <= I.hot) isl.hot[i] = 1;
  water(isl, rng, streams);
  soil(isl, rng);
  for (let i = 0; i < n; i++) isl.kind[i] = kindOf(isl, i);
  return isl;
}

/** Water: a base, the wind's rain (windward wetter), springs and streams fading out, cracks hold a little. */
function water(isl: Island, rng: Rng, streams: number[]) {
  const W = ISLAND.water, { w, h } = isl, n = w * h, a = rng() * 6.28, rough = roughness(isl, rng);
  const along = (i: number) => ((i % w) + 0.5 - w / 2) * Math.cos(a) + (((i / w) | 0) + 0.5 - h / 2) * Math.sin(a);
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) if (isl.kind[i] !== SEA) { lo = Math.min(lo, along(i)); hi = Math.max(hi, along(i)); }
  const near = (src: number[], value: number, reach: number) => {
    for (const s of src) {
      const sx = s % w, sy = (s / w) | 0, far = Math.ceil((reach + 1) / 0.7);
      for (let y = Math.max(0, sy - far); y <= Math.min(h - 1, sy + far); y++)
        for (let x = Math.max(0, sx - far); x <= Math.min(w - 1, sx + far); x++) {
          const j = y * w + x;
          if (isl.kind[j] === SEA) continue;
          const v = value * Math.max(0, 1 - (Math.hypot(x - sx, y - sy) * rough[j]) / (reach + 1));
          if (v > isl.water[j]) isl.water[j] = v;
        }
    }
  };
  near(isl.springs, W.spring, W.springReach);
  near(streams, W.stream, W.streamReach);
  for (let i = 0; i < n; i++) {
    if (isl.kind[i] === SEA) continue;
    const t = (along(i) - lo) / (hi - lo || 1), rain = W.lee + (W.windward - W.lee) * t * t * (3 - 2 * t);
    const crack = isl.feature[i] === F_CRACK ? W.crack : 0;
    isl.water[i] = Math.min(1, Math.max(isl.water[i], W.base * rough[i]) + rain + crack);
  }
}

/** Starting soil: none at the vents, deeper with distance (young lava near the vent, older ground outward). */
function soil(isl: Island, rng: Rng) {
  const w = isl.w, n = w * isl.h, rough = roughness(isl, rng);
  let far = 1;
  const d = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (isl.kind[i] === SEA) continue;
    d[i] = Math.min(...isl.vents.map((v) => dist(w, i, v)));
    far = Math.max(far, d[i]);
  }
  for (let i = 0; i < n; i++) {
    if (isl.kind[i] === SEA || isl.kind[i] === BEACH) continue;
    isl.soil[i] = Math.min(SUCCESSION.forest - 0.05, ISLAND.farSoil * (d[i] / far) ** ISLAND.soilCurve * rough[i] * 1.15);
  }
}

/** Tiles to the nearest sea tile (8 neighbours). */
function seaDistance(isl: Island): Int32Array {
  const { w, h } = isl, d = new Int32Array(w * h).fill(1e6), queue: number[] = [];
  for (let i = 0; i < w * h; i++) if (isl.kind[i] === SEA) { d[i] = 0; queue.push(i); }
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q], x = i % w, y = (i / w) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy, j = ny * w + nx;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || d[j] <= d[i] + 1) continue;
      d[j] = d[i] + 1; queue.push(j);
    }
  }
  return d;
}

/** A random tile that passes the test, or -1. */
function pick(rng: Rng, n: number, ok: (i: number) => boolean): number {
  for (let k = 0; k < 600; k++) {
    const i = Math.floor(rng() * n);
    if (ok(i)) return i;
  }
  return -1;
}

/** A wandering line of tiles from `i`, heading roughly along `a`, while the tile passes `ok`. */
function walk(isl: Island, rng: Rng, i: number, a: number, wiggle: number, max: number, ok: (j: number) => boolean): number[] {
  const { w, h } = isl, out = [i];
  let x = (i % w) + 0.5, y = ((i / w) | 0) + 0.5;
  while (out.length < max) {
    a += (rng() - 0.5) * wiggle;
    x += Math.cos(a); y += Math.sin(a);
    const tx = Math.floor(x), ty = Math.floor(y), j = ty * w + tx;
    if (tx < 0 || ty < 0 || tx >= w || ty >= h || !ok(j)) break;
    if (j !== out[out.length - 1]) out.push(j);
  }
  return out;
}

/** A smooth random field around 1 (0.7–1.3), so effects fade unevenly. */
function roughness(isl: Island, rng: Rng): Float32Array {
  const { w, h } = isl, n = w * h;
  let a = Float32Array.from({ length: n }, () => rng()), b = new Float32Array(n);
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < n; i++) {
      const x = i % w, y = (i / w) | 0;
      let sum = 0, c = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h) { sum += a[ny * w + nx]; c++; }
      }
      b[i] = sum / c;
    }
    [a, b] = [b, a];
  }
  let lo = 1, hi = 0;
  for (const v of a) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  return a.map((v) => 0.7 + (0.6 * (v - lo)) / (hi - lo || 1));
}


// ---- Habitat spots: three areas in the sea just off the coast ----
export type SpotId = 'sand' | 'mud' | 'rock';
export interface Spot { id: SpotId; x: number; y: number; r: number }

const SPOT_R = 7, MIN_APART = 18;

export function habitatSpots(isl: Island): Record<SpotId, Spot> {
  const { w, h } = isl, n = w * h, toSea = seaDistance(isl);
  const xy = (i: number) => ({ x: i % w, y: (i / w) | 0 });
  // Land distance for sea tiles: 1 + tiles to the nearest land (8 neighbours).
  const toLand = new Int32Array(n).fill(1e6), q: number[] = [];
  for (let i = 0; i < n; i++) if (isl.kind[i] !== SEA) { toLand[i] = 0; q.push(i); }
  for (let k = 0; k < q.length; k++) {
    const i = q[k], x = i % w, y = (i / w) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy, j = ny * w + nx;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || toLand[j] <= toLand[i] + 1) continue;
      toLand[j] = toLand[i] + 1; q.push(j);
    }
  }
  const room = SPOT_R + 1;
  let loose = false; // fallback: any sea tile off the coast, anywhere on the map
  const okTile = (i: number) => {
    const x = i % w, y = (i / w) | 0;
    if (loose) return isl.kind[i] === SEA && toLand[i] >= 2 && toLand[i] <= 12;
    return isl.kind[i] === SEA && toLand[i] >= 2 && toLand[i] <= 6 && x >= room && y >= room && x < w - room && y < h - room - 4;
  };
  const placed: Spot[] = [];
  const free = (i: number, gap = MIN_APART) => placed.every((s) => dist(w, i, s.y * w + s.x) >= gap);
  const nearest = (from: number, gap: number): number => { // sea tile near land closest to `from`, clear of the others
    let best = -1, bd = Infinity;
    for (let i = 0; i < n; i++) if (okTile(i) && free(i, gap)) { const d = dist(w, i, from); if (d < bd) { bd = d; best = i; } }
    return best;
  };
  const coast: number[] = [];
  for (let i = 0; i < n; i++) if (isl.kind[i] !== SEA && toSea[i] === 1) coast.push(i);
  const fallbackFrom = (k: number) => coast[Math.floor(((k + 0.5) * coast.length) / 3) % coast.length] ?? Math.floor(n / 2);
  const make = (id: SpotId, i: number, k: number): Spot => {
    if (i < 0) i = nearest(fallbackFrom(k), MIN_APART);
    if (i < 0) { loose = true; i = nearest(fallbackFrom(k), MIN_APART); loose = false; }
    if (i < 0) i = nearest(fallbackFrom(k), 0);
    if (i < 0) i = (h >> 1) * w + room;
    const s = { id, ...xy(i), r: SPOT_R };
    placed.push(s);
    return s;
  };

  // Sand: off the longest beach (the tile nearest the middle of the largest beach cluster along the coast).
  const beach = coast.filter((i) => isl.kind[i] === BEACH);
  const sandFrom = beach.length ? beach.reduce((best, i) => {
    const c = beach.filter((j) => dist(w, i, j) <= 6).length, cb = beach.filter((j) => dist(w, best, j) <= 6).length;
    return c > cb ? i : best;
  }, beach[0]) : -1;
  const sand = make('sand', sandFrom >= 0 ? nearest(sandFrom, 0) : -1, 0);

  // Rock: off the coast nearest a vent.
  let rockFrom = -1, rd = Infinity;
  for (const i of coast) for (const v of isl.vents) { const d = dist(w, i, v); if (d < rd) { rd = d; rockFrom = i; } }
  const rock = make('rock', rockFrom >= 0 ? nearest(rockFrom, MIN_APART) : -1, 1);

  // Mud: where a stream meets the sea, else the deepest bay (most land around).
  let mudFrom = -1;
  for (let i = 0; i < n; i++) if (isl.feature[i] === F_STREAM && toSea[i] <= 3 && (mudFrom < 0 || toSea[i] < toSea[mudFrom])) mudFrom = i;
  if (mudFrom >= 0) { /* a stream reaches the coast */ }
  else {
    let best = -1, bl = -1;
    for (let i = 0; i < n; i++) {
      if (!okTile(i) || !free(i)) continue;
      const x = i % w, y = (i / w) | 0;
      let land = 0;
      for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && isl.kind[ny * w + nx] !== SEA) land++;
      }
      if (land > bl) { bl = land; best = i; }
    }
    mudFrom = best;
  }
  const mud = make('mud', mudFrom >= 0 ? nearest(mudFrom, MIN_APART) : -1, 2);
  return { sand, mud, rock };
}
