// The sea's ground, from the seed: the island in the middle of a wide shelf, and for every sea tile a depth band,
// a substrate and an exposure. Ground and paint only, never rules. Same seed, same ground.
import { BARE, BEACH, F_SPRING, F_STREAM, F_VENT, LAVA, SEA } from '../data/island';
import { EXPOSED, GROUND, LAND, MUD, OPEN, ROCK, SAND, SHELTERED } from '../data/ground';
import { makeIsland, type Island } from './island';
import { seeded, type Rng } from './rng';

export interface Ground {
  seed: number; w: number; h: number;
  island: Island; ox: number; oy: number; // the island's grid sits at (ox, oy) in the map
  land: Uint8Array; // the island's kind per map tile (SEA … WET); SEA on every sea tile
  feature: Uint8Array; // the island's features (vents, springs, streams, cracks)
  depth: Uint8Array; // 0 tide flat … 3 deep edge, OPEN beyond, LAND on land
  substrate: Uint8Array; // SAND, MUD, ROCK (sea tiles)
  exposure: Uint8Array; // SHELTERED or EXPOSED (sea tiles)
  toLand: Float32Array; // tiles to the nearest land, 0 on land
  wind: number; // radians from the centre to the windward side
}

export function makeGround(seed: number): Ground {
  const G = GROUND, w = G.w, h = G.h, n = w * h, isl = makeIsland(seed), rng = seeded(seed ^ 5352318); // a salt: the island uses the seed itself
  const ox = (w - isl.w) >> 1, oy = (h - isl.h) >> 1;
  const g: Ground = {
    seed, w, h, island: isl, ox, oy, land: new Uint8Array(n), feature: new Uint8Array(n),
    depth: new Uint8Array(n).fill(LAND), substrate: new Uint8Array(n), exposure: new Uint8Array(n), toLand: new Float32Array(n), wind: isl.wind,
  };
  for (let y = 0; y < isl.h; y++) for (let x = 0; x < isl.w; x++) {
    const i = (y + oy) * w + x + ox, j = y * isl.w + x;
    g.land[i] = isl.kind[j]; g.feature[i] = isl.feature[j];
  }
  const land = new Uint8Array(n);
  for (let i = 0; i < n; i++) land[i] = g.land[i] !== SEA ? 1 : 0;

  // Each sea tile takes the substrate of its nearest coast, as game/'s sea patches do.
  const phase = (seed * 2.399) % 6.283, cx = w / 2, cy = h / 2;
  const coast = new Uint8Array(n);
  for (let y = oy; y < oy + isl.h; y++) for (let i = y * w + ox; i < y * w + ox + isl.w; i++) {
    if (!land[i]) continue;
    const k = g.land[i], f = g.feature[i];
    const arc = Math.sin(Math.atan2(((i / w) | 0) - cy, (i % w) - cx) * G.bareArcs + phase);
    coast[i] = k === BEACH ? SAND : k === LAVA || f === F_VENT ? ROCK : f === F_STREAM || f === F_SPRING ? MUD : k === BARE ? (arc > 0 ? ROCK : MUD) : MUD;
  }
  g.toLand = distance(w, h, land, coast);

  // Fields: roughness stretches the distance (banks and drop-offs); two more push borders around.
  const rough = smooth(w, h, G.roughCell, rng), wx = smooth(w, h, G.warpCell, rng), wy = smooth(w, h, G.warpCell, rng);
  const lee = shadow(g, land), landSum = summed(w, h, land), r = G.bayRadius, bay = G.bayShare * (2 * r + 1) ** 2;
  const masks = [SAND, MUD, ROCK].map(() => new Uint8Array(n));
  for (let i = 0; i < n; i++) if (!land[i]) masks[coast[i]][i] = 1;
  const [kS, kM, kR] = masks.map((m) => summed(w, h, m));
  const W = w + 1, [lo, hi] = G.rough, B = G.bands, mix = G.mix, toLand = g.toLand;
  const mixed = (x: number, y: number, rad: number) => { // the commonest coast substrate within `rad`
    const x0 = x - rad < 0 ? 0 : x - rad, y0 = y - rad < 0 ? 0 : y - rad, x1 = x + rad >= w ? w : x + rad + 1, y1 = y + rad >= h ? h : y + rad + 1;
    const a = y1 * W + x1, b = y0 * W + x1, c = y1 * W + x0, d = y0 * W + x0;
    const sand = kS[a] - kS[b] - kS[c] + kS[d], mud = kM[a] - kM[b] - kM[c] + kM[d], rock = kR[a] - kR[b] - kR[c] + kR[d];
    return sand >= mud && sand >= rock ? SAND : mud >= rock ? MUD : ROCK;
  };
  for (let i = 0; i < n; i++) {
    if (land[i]) continue;
    const x = i % w, y = (i / w) | 0, amp = Math.min(G.warp, toLand[i] * G.warpNear);
    const sx = clamp(Math.round(x + (wx[i] * 2 - 1) * amp), 0, w - 1), sy = clamp(Math.round(y + (wy[i] * 2 - 1) * amp), 0, h - 1);
    const j = sy * w + sx, d = toLand[j] * (lo + (hi - lo) * rough[j]);
    let band = 1, calm = false;
    while (band <= B.length && d > B[band - 1]) band++; // band 4 is OPEN
    if (band < G.exposureBands) { // near the coast: shelter makes wide tide flats on soft ground
      calm = lee[j] === 1 || box(landSum, w, h, sx, sy, r) >= bay;
      if (d <= (calm && mixed(sx, sy, mix[0]) !== ROCK ? G.flatWide : G.flat)) band = 0;
    }
    g.depth[i] = band;
    g.substrate[i] = band >= OPEN ? coast[j] : mixed(sx, sy, mix[band]);
    g.exposure[i] = calm ? SHELTERED : EXPOSED;
  }
  return g;
}

export const isHabitatTile = (g: Ground, i: number) => g.depth[i] < OPEN;

/** Distance to the nearest source tile (two-pass chamfer, 1 and √2), carrying the source's label outward. */
function distance(w: number, h: number, src: Uint8Array, label: Uint8Array): Float32Array {
  const d = new Float32Array(w * h), D = Math.SQRT2;
  for (let i = 0; i < w * h; i++) d[i] = src[i] ? 0 : 1e9;
  const relax = (i: number, j: number, c: number) => { if (d[j] + c < d[i]) { d[i] = d[j] + c; label[i] = label[j]; } };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (x > 0) relax(i, i - 1, 1);
    if (y > 0) { relax(i, i - w, 1); if (x > 0) relax(i, i - w - 1, D); if (x < w - 1) relax(i, i - w + 1, D); }
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x;
    if (x < w - 1) relax(i, i + 1, 1);
    if (y < h - 1) { relax(i, i + w, 1); if (x < w - 1) relax(i, i + w + 1, D); if (x > 0) relax(i, i + w - 1, D); }
  }
  return d;
}

/** Smooth value noise, 0..1: random values on a grid of `cell` tiles, eased between, plus an octave at half size. */
function smooth(w: number, h: number, cell: number, rng: Rng): Float32Array {
  const out = new Float32Array(w * h);
  for (const [c, weight] of [[cell, 2 / 3], [cell / 2, 1 / 3]]) {
    const gw = Math.ceil(w / c) + 2, grid = new Float32Array(gw * (Math.ceil(h / c) + 2));
    for (let k = 0; k < grid.length; k++) grid[k] = rng();
    const ix = new Int32Array(w), tx = new Float32Array(w);
    for (let x = 0; x < w; x++) { ix[x] = (x / c) | 0; tx[x] = ease(x / c - ix[x]); }
    for (let y = 0; y < h; y++) {
      const iy = (y / c) | 0, ty = ease(y / c - iy), row = iy * gw;
      for (let x = 0; x < w; x++) {
        const k = row + ix[x], t = tx[x];
        const top = grid[k] + (grid[k + 1] - grid[k]) * t, bot = grid[k + gw] + (grid[k + gw + 1] - grid[k + gw]) * t;
        out[y * w + x] += (top + (bot - top) * ty) * weight;
      }
    }
  }
  let lo = 1, hi = 0;
  for (const v of out) { if (v < lo) lo = v; if (v > hi) hi = v; }
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - lo) / (hi - lo || 1);
  return out;
}

/** A summed-area table of a 0/1 grid, (w + 1) × (h + 1). */
function summed(w: number, h: number, f: Uint8Array): Int32Array {
  const s = new Int32Array((w + 1) * (h + 1)), W = w + 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    s[(y + 1) * W + x + 1] = f[y * w + x] + s[y * W + x + 1] + s[(y + 1) * W + x] - s[y * W + x];
  return s;
}
/** The count in the square of radius `rad` around (x, y), clipped to the map. */
function box(s: Int32Array, w: number, h: number, x: number, y: number, rad: number) {
  const W = w + 1, x0 = Math.max(0, x - rad), y0 = Math.max(0, y - rad), x1 = Math.min(w - 1, x + rad), y1 = Math.min(h - 1, y + rad);
  return s[(y1 + 1) * W + x1 + 1] - s[y0 * W + x1 + 1] - s[(y1 + 1) * W + x0] + s[y0 * W + x0];
}

/** The island's wind shadow: 1 on sea tiles that land shelters from upwind, within GROUND.lee tiles. The first land
 *  upwind of a sheltered tile is always coast, so rays cast downwind from the coast are enough. */
function shadow(g: Ground, land: Uint8Array): Uint8Array {
  const { w, h } = g, out = new Uint8Array(w * h), dx = -Math.cos(g.wind) * 0.7, dy = -Math.sin(g.wind) * 0.7;
  for (let i = 0; i < w * h; i++) {
    const x0 = i % w;
    if (!land[i] || (x0 > 0 && land[i - 1] && x0 < w - 1 && land[i + 1] && land[i - w] && land[i + w])) continue;
    let x = x0 + 0.5, y = ((i / w) | 0) + 0.5;
    for (let s = 0; s < GROUND.lee / 0.7; s++) {
      x += dx; y += dy;
      if (x < 0 || y < 0 || x >= w || y >= h) break;
      out[(y | 0) * w + (x | 0)] = 1;
    }
  }
  // Slanted rays skip single tiles: a tile with three or four lee neighbours is in the lee too.
  const fill = out.slice();
  for (let i = w; i < w * h - w; i++) {
    const x = i % w;
    if (!out[i] && x > 0 && x < w - 1 && out[i - 1] + out[i + 1] + out[i - w] + out[i + w] >= 3) fill[i] = 1;
  }
  return fill;
}

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
