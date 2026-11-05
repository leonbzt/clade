// The look: one palette, one non-black outline, one sun from the upper left. Every facet is shaded by its angle to
// the sun and takes a step on its ramp (dark → light), so the world reads as low-poly without any textures.
import type { Graphics, Texture } from 'pixi.js';

export const C = 24; // world units per tile
export type Ramp = number[]; // dark → light, 5 steps; flat facets take the middle

export const PAL = { // earthy and real under blue-green water (slice 09: "more realistic in the textures")
  deep: 0x0b2730, ink: 0x15110d, gold: 0xffd34a, red: 0xe5462c, ember: 0xff8a3a, water: 0x2f8c8a,
  sand: [0x6e5f3f, 0x968258, 0xbba571, 0xd8c28a, 0xf0dca6],
  dry: [0x8a7a58, 0xae9c70, 0xcdb986, 0xe4d19c, 0xf6e8bc],
  mudSeen: [0x35281d, 0x4a3727, 0x614a33, 0x7a5f41, 0x967a54],
  mudDark: [0x201912, 0x2c2218, 0x392c20, 0x473829, 0x574634],
  mudSlide: [0x121010, 0x191515, 0x211c1a, 0x2b2421, 0x372e29],
  rock: [0x1c1d21, 0x2b2d33, 0x3f434a, 0x5a5f66, 0x80868c],
  ash: [0x27251f, 0x38352d, 0x4c483d, 0x655f50, 0x827a66],
  basalt: [0x18191c, 0x24262a, 0x33363b, 0x464a50, 0x5f646a],
  vent: [0x2a2219, 0x3f3122, 0x5a452c, 0x7a5e36, 0x9e7c45],
  leaf: [0x233418, 0x37501f, 0x506e2a, 0x6f8f37, 0x97b24e],
  bloom: [0x6a6448, 0x958d5e, 0xbfb575, 0xded38e, 0xf6eeb8],
  shell: [0x5a5248, 0x80766a, 0xa89c8a, 0xcbc0a8, 0xede4cb],
  flesh: [0x5a2a2e, 0x8a4144, 0xb6645c, 0xd99a82, 0xf4cfb0],
  amber: [0x6a3410, 0xa45616, 0xd9861f, 0xf6b843, 0xffe48a],
  you: [0x6a1f2e, 0xa0303f, 0xd24f4f, 0xf3866a, 0xffc39c],
  rival: [0x2f2a40, 0x4a4264, 0x716794, 0x9d93bf, 0xcfc7e6],
  hunter: [0x3f1410, 0x6e2116, 0xa3361c, 0xd65a27, 0xff9446],
  gill: [0x17485e, 0x226b86, 0x3797ad, 0x63c3cf, 0xa7ecea],
  pale: [0x5a5d5a, 0x83887f, 0xaeb2a4, 0xd4d6c4, 0xf4f3e4],
  blue: [0x1d2f5a, 0x2c4a86, 0x416bb0, 0x6a95d2, 0xa6c6ee],
};

const L = (() => { const v = [-0.45, -0.62, 0.64], n = Math.hypot(...v); return v.map((a) => a / n); })();
const FLAT = L[2];
/** Contrast of the facets: how many ramp steps one unit of light buys. */
export const LIGHT = { k: 5.5 };
/** Where shadows fall, per unit of height. */
export const SHADOW = { x: 0.5, y: 0.68 };

export type P3 = [number, number, number];

/** A stable 0..1 hash. */
export function hash(x: number, y: number, s = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The ramp step for a facet through a, b, c (screen y points down, z up toward you). */
export function step(a: P3, b: P3, c: P3, bias = 0) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
  const lit = (nx * L[0] + ny * L[1] + nz * L[2]) / len;
  return Math.max(0, Math.min(4, Math.round(2 + (lit - FLAT) * LIGHT.k + bias)));
}

export function tri(g: Graphics, a: P3, b: P3, c: P3, ramp: Ramp, bias = 0, alpha = 1) {
  g.poly([a[0], a[1], b[0], b[1], c[0], c[1]]).fill({ color: ramp[step(a, b, c, bias)], alpha });
}

/** A facet with a texture: the ramp step tints the texture's grey detail. */
export function ttri(g: Graphics, a: P3, b: P3, c: P3, ramp: Ramp, texture: Texture, bias = 0, alpha = 1) {
  g.poly([a[0], a[1], b[0], b[1], c[0], c[1]]).fill({ color: ramp[step(a, b, c, bias)], alpha, texture, textureSpace: 'global' });
}

/** A ring of `n` points around (x, y): an ellipse rx × ry turned by `rot`, jittered by `seed` (-1: none). */
export function ring(x: number, y: number, rx: number, ry: number, n: number, rot = 0, seed = -1, jit = 0.18): [number, number][] {
  const out: [number, number][] = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + 0.3, j = seed < 0 ? 1 : 1 - jit + 2 * jit * hash(seed, k, 7);
    const lx = Math.cos(a) * rx * j, ly = Math.sin(a) * ry * j;
    out.push([x + lx * c - ly * s, y + lx * s + ly * c]);
  }
  return out;
}

/** A faceted dome: a fan from a raised centre to a ring at height `base`. */
export function dome(g: Graphics, pts: [number, number][], cx: number, cy: number, h: number, ramp: Ramp, bias = 0, alpha = 1, base = 0) {
  const top: P3 = [cx, cy, base + h];
  for (let k = 0; k < pts.length; k++) {
    const a = pts[k], b = pts[(k + 1) % pts.length];
    tri(g, top, [a[0], a[1], base], [b[0], b[1], base], ramp, bias, alpha);
  }
}

/** A flat polygon (outlines, shadows). */
export function flat(g: Graphics, pts: number[][], color: number, alpha = 1, grow = 0, cx = 0, cy = 0) {
  const flatPts: number[] = [];
  for (const [x, y] of pts) {
    if (grow) { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1; flatPts.push(x + (dx / d) * grow, y + (dy / d) * grow); }
    else flatPts.push(x, y);
  }
  g.poly(flatPts).fill({ color, alpha });
}

export const mix = (a: number, b: number, t: number) => {
  const ch = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t) << s;
  return ch(16) | ch(8) | ch(0);
};
export const mixRamp = (r: Ramp, to: number, t: number): Ramp => r.map((c) => mix(c, to, t));
