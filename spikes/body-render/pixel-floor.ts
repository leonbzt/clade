// A spike: the seafloor as pixels, from one height map of the whole board. Light and cast shadows come from the same sun as
// the animals. Baked once; only a tile that changes would be painted again. Throwaway.
import { COLS, ROWS } from '../../game/src/data/life';
import { known, type Life } from '../../game/src/sim/life';
import { C, PAL, SHADOW, hash, type Ramp } from '../../game/src/view/shade';
import { Paint, SUN } from './pixel-paint';
import { cozy, mixC } from './looks';

const smooth = (t: number) => { const u = Math.max(0, Math.min(1, t)); return u * u * (3 - 2 * u); };
function noise(x: number, y: number, s: number, seed: number) {
  const fx = x / s, fy = y / s, ix = Math.floor(fx), iy = Math.floor(fy), u = smooth(fx - ix), v = smooth(fy - iy);
  const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed), c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const BASE = { sand: 0, mud: -3.2, rock: -0.3, dead: -2.4 } as const;

/** Under a rock is whatever its neighbours are, so that a rock doesn't sit on a square of sand. */
export function groundTypes(life: Life) {
  return life.tiles.map((q, i) => {
    if (q.t !== 'rock') return q.t;
    const n: Record<string, number> = {};
    for (const j of [i - 1, i + 1, i - COLS, i + COLS]) { const o = life.tiles[j]; if (o && o.t !== 'rock' && (j === i - COLS || j === i + COLS || Math.floor(j / COLS) === Math.floor(i / COLS))) n[o.t] = (n[o.t] ?? 0) + 1; }
    return (Object.entries(n).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'sand') as typeof q.t;
  });
}

export function paintFloor(life: Life, art: number) {
  const W = Math.round(COLS * C * art), H = Math.round(ROWS * C * art), Z = new Float32Array(W * H), TileAt = new Int16Array(W * H), basalt = life.hab.ground === 'basalt';
  const G = groundTypes(life), t = (x: number, y: number) => G[Math.max(0, Math.min(ROWS - 1, y)) * COLS + Math.max(0, Math.min(COLS - 1, x))];
  const rocks = life.tiles.map((q, i) => (q.t === 'rock' ? { x: (i % COLS + 0.5 + (hash(i, 1, 9) - 0.5) * 0.12) * C, y: (Math.floor(i / COLS) + 0.5 + (hash(i, 2, 9) - 0.5) * 0.12) * C, r: C * (basalt ? 0.47 : 0.42), tall: basalt ? 10 : 8, seed: i } : null)).filter(Boolean) as { x: number; y: number; r: number; tall: number; seed: number }[];
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const wx = (px + 0.5) / art, wy = (py + 0.5) / art, tx = wx / C - 0.5, ty = wy / C - 0.5, ix = Math.floor(tx), iy = Math.floor(ty);
    const u = smooth((tx - ix - 0.3) / 0.4), v = smooth((ty - iy - 0.3) / 0.4), a = BASE[t(ix, iy)], b = BASE[t(ix + 1, iy)], c = BASE[t(ix, iy + 1)], d = BASE[t(ix + 1, iy + 1)];
    let z = a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    const here = t(Math.floor(wx / C), Math.floor(wy / C));
    z += (noise(wx, wy, 11, 3) - 0.5) * (here === 'sand' ? 1.5 : 1.9);
    if (here === 'sand') z += Math.sin((wx * 0.44 + wy * 0.27 + noise(wx, wy, 26, 5) * 7)) * 0.2;
    if (here === 'mud') z += (noise(wx, wy, 5, 8) - 0.5) * 0.8;
    if (here === 'dead') z += (noise(wx, wy, 4, 12) - 0.5) * 1.6;
    for (const r of rocks) {
      const dx = wx - r.x, dy = wy - r.y, d2 = Math.hypot(dx, dy); if (d2 > r.r * 1.3) continue;
      const ang = Math.atan2(dy, dx), edge = r.r * (0.82 + 0.3 * noise(ang * 4 + 9, r.seed, 1, 21)), q = d2 / edge;
      if (q < 1) { const lump = (noise(wx + r.seed * 7, wy, 6, 22) - 0.5) * 2.2; z = Math.max(z, r.tall * Math.pow(1 - q * q, 0.55) + lump * (1 - q)); TileAt[py * W + px] = 1; }
    }
    Z[py * W + px] = z * art;
  }
  const out = new Uint8Array(W * H * 4), rockRamp = cozy(basalt ? PAL.basalt : PAL.rock), sand = cozy(basalt ? PAL.ash : PAL.sand), mudSeen = cozy(PAL.mudSeen), mudDark = cozy(PAL.mudDark), vent = cozy(PAL.vent);
  const shD = Math.hypot(SHADOW.x, SHADOW.y), sx = -SHADOW.x / shD, sy = -SHADOW.y / shD, rise = 1 / shD;
  const zAt = (x: number, y: number) => Z[Math.max(0, Math.min(H - 1, Math.round(y))) * W + Math.max(0, Math.min(W - 1, Math.round(x)))];
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const p = py * W + px, wx = (px + 0.5) / art, wy = (py + 0.5) / art, jx = wx + (hash(px, py, 40) - 0.5) * 2, jy = wy + (hash(px, py, 41) - 0.5) * 2;
    const tile = Math.max(0, Math.min(ROWS - 1, Math.floor(jy / C))) * COLS + Math.max(0, Math.min(COLS - 1, Math.floor(jx / C))), T = life.tiles[tile], kind = G[tile];
    const ramp: Ramp = TileAt[p] ? rockRamp : kind === 'mud' ? (T.seen ? mudSeen : mudDark) : kind === 'dead' ? vent : sand;
    const dx = (zAt(px + 1, py) - zAt(px - 1, py)) * 0.5, dy = (zAt(px, py + 1) - zAt(px, py - 1)) * 0.5, l = Math.hypot(dx, dy, 1), lit = (-dx * SUN[0] - dy * SUN[1] + SUN[2]) / l;
    const check = ((tile % COLS) + Math.floor(tile / COLS)) % 2 ? 0.14 : -0.1, grain = hash(px, py, 44) > 0.985 ? 0.7 : hash(px, py, 45) > 0.985 ? -0.7 : 0;
    let tone = 2 + (lit - SUN[2]) * (TileAt[p] ? 3.6 : 4.6) + (TileAt[p] ? 0 : check + grain);
    let shaded = false;
    for (let s = 1; s < 18 * art; s += 1) { if (zAt(px + sx * s, py + sy * s) > Z[p] + s * rise + 0.2) { shaded = true; break; } }
    if (shaded) tone -= 1.6;
    const fx = px % Math.round(C * art), fy = py % Math.round(C * art), n = Math.round(C * art);
    if (!TileAt[p] && (fx === 0 || fx === n - 1) && (fy === 0 || fy === n - 1)) tone -= 0.9; // the grid, as a dark tick at each corner
    let c = ramp[Math.max(0, Math.min(4, Math.round(tone)))];
    if (shaded) c = mixC(c, 0x2b1d3f, 0.22);
    const o = p * 4; out[o] = c >> 16; out[o + 1] = (c >> 8) & 255; out[o + 2] = c & 255; out[o + 3] = 255;
  }
  paintFood(life, art, out, W);
  return { out, W, H };
}

/** Food: the same painter as the animals, blitted with a little contact shadow. */
function paintFood(life: Life, art: number, out: Uint8Array, W: number) {
  const n = Math.round(C * art) + 8, P = new Paint(n, n), H = out.length / 4 / W;
  life.tiles.forEach((t, i) => {
    if (!t.node || !known(t)) return;
    P.clear();
    const m = n / 2, x0 = Math.round((i % COLS) * C * art) + Math.round((C * art) / 2) - m, y0 = Math.round(Math.floor(i / COLS) * C * art) + Math.round((C * art) / 2) - m, r = (v: number) => Math.max(0.8, v * art);
    if (t.node === 'mat' || t.node === 'bloom') {
      P.mats = [cozy(t.node === 'mat' ? PAL.leaf : PAL.bloom)];
      for (let k = 0; k < 6; k++) { const x = m + (hash(i, k, 11) - 0.5) * 16 * art, y = m + (hash(i, k, 12) - 0.5) * 15 * art, q = r(2.6 + hash(i, k, 13) * 2.4); P.capsule(x, y, 1 + k * 0.2, x, y, 1 + k * 0.2, q, q, 0, hash(i, k, 15) > 0.5 ? 0.3 : -0.1, 0.8); }
    } else if (t.node === 'buried') {
      P.mats = [cozy(PAL.amber)];
      for (let k = 0; k < 3; k++) { const x = m + (k - 1) * 4.4 * art + (hash(i, k, 16) - 0.5) * 2 * art, y = m + (hash(i, k, 17) - 0.5) * 4 * art, q = r(2.5); P.capsule(x, y, 1, x, y, 1, q, q, 0, 0.3, 0.8); }
    } else if (t.node === 'shell') {
      P.mats = [cozy(PAL.shell)];
      for (let k = 0; k < 3; k++) { const x = m + [-4.5, 4.5, -1][k] * art, y = m + [-3, -1, 5][k] * art, rot = hash(i, k, 18) * 3; for (let j = -2; j <= 2; j++) { const a = rot + j * 0.42, l = 5 * art; P.capsule(x - Math.cos(rot) * 2 * art, y - Math.sin(rot) * 2 * art, 1, x + Math.cos(a) * l * 0.55, y + Math.sin(a) * l * 0.55, 1.2, r(0.8), r(1.5), 0, j % 2 ? 0.45 : -0.1, 0.4, j + 3); } }
    } else if (t.node === 'carcass') {
      P.mats = [cozy(PAL.flesh)];
      const a = 0.4, dx = Math.cos(a) * 6 * art, dy = Math.sin(a) * 6 * art; P.capsule(m - dx, m - dy, 1, m + dx, m + dy, 1, r(4.6), r(3.6), 0, 0, 0.7);
      for (let k = -2; k <= 2; k++) { const f = k / 3, cx = m + dx * f, cy = m + dy * f; P.line(cx - Math.sin(a) * 3.6 * art, cy + Math.cos(a) * 3.6 * art, cx + Math.sin(a) * 3.6 * art, cy - Math.cos(a) * 3.6 * art, 12, 0, -1.6); }
    }
    P.finish();
    const shx = Math.round(1.5 * art + 0.5), shy = Math.round(2 * art + 0.5);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { // shadow first
      const o = (y * n + x) * 4; if (!P.out[o + 3]) continue;
      const X = x0 + x + shx, Y = y0 + y + shy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const q = (Y * W + X) * 4; out[q] = out[q] * 0.68 + 0x2b * 0.32; out[q + 1] = out[q + 1] * 0.68 + 0x1d * 0.32; out[q + 2] = out[q + 2] * 0.68 + 0x3f * 0.32;
    }
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const o = (y * n + x) * 4; if (!P.out[o + 3]) continue;
      const X = x0 + x, Y = y0 + y; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const q = (Y * W + X) * 4; out[q] = P.out[o]; out[q + 1] = P.out[o + 1]; out[q + 2] = P.out[o + 2];
    }
  });
}

/** Light through water, as crisp one-bit lines that step at a low rate, so that it reads as pixels and not a blur. */
export function causticPixels(n = 64) {
  const out = new Uint8Array(n * n * 4), pts: [number, number][] = [];
  for (let k = 0; k < 11; k++) pts.push([hash(k, 1, 21) * n, hash(k, 2, 21) * n]);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let d1 = 1e9, d2 = 1e9;
    for (const [px, py] of pts) for (let oy = -n; oy <= n; oy += n) for (let ox = -n; ox <= n; ox += n) { const d = Math.hypot(x - px - ox, y - py - oy); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
    if (d2 - d1 < 1.2 && hash(Math.floor(x / 9), Math.floor(y / 9), 31) > 0.35) { const o = (y * n + x) * 4; out[o] = 220; out[o + 1] = 255; out[o + 2] = 235; out[o + 3] = 255; }
  }
  return out;
}
