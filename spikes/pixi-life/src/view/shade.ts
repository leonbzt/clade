// The look: one palette, one non-black outline, one sun from the upper left. Every facet is shaded by its angle to
// the sun and takes a step on its ramp (dark → light), so the world reads as low-poly without any textures.
import type { Graphics } from 'pixi.js';

export const C = 24; // world units per tile
export type Ramp = number[]; // dark → light, 5 steps; flat facets take the middle

export const PAL = {
  deep: 0x0a1c24, ink: 0x0c1a20, gold: 0xffd75e, red: 0xe5462c, ember: 0xff8a3a,
  sand: [0x1f4b52, 0x2d6567, 0x3f807c, 0x5e9d8f, 0x8cc0a8],
  mudSeen: [0x231a1d, 0x34261f, 0x4a3526, 0x664a32, 0x86663f],
  mudDark: [0x15111a, 0x1d171e, 0x2a1f22, 0x3a2a27, 0x4d382c],
  mudSlide: [0x110d12, 0x18121a, 0x221a1e, 0x2e2223, 0x3d2c28],
  rock: [0x1b2831, 0x2b3e49, 0x435a64, 0x688289, 0x9bb3b0],
  leaf: [0x183f2a, 0x266b35, 0x449a3e, 0x7cc653, 0xbfec78],
  shell: [0x4c5559, 0x76817f, 0xa4ac9f, 0xcdd2bd, 0xf1efd8],
  flesh: [0x5a2a33, 0x8a4148, 0xb86560, 0xdb9a84, 0xf6cfb2],
  amber: [0x6a3410, 0xa45616, 0xd9861f, 0xf6b843, 0xffe48a],
  you: [0x5b2140, 0x8f3757, 0xc65a6c, 0xec8c80, 0xffc3a2],
  rival: [0x31284a, 0x4f4373, 0x7a6ca3, 0xa898cc, 0xd6cbec],
  hunter: [0x3f1410, 0x6e2116, 0xa3361c, 0xd65a27, 0xff9446],
  gill: [0x17485e, 0x226b86, 0x3797ad, 0x63c3cf, 0xa7ecea],
  pale: [0x55636b, 0x7d8d93, 0xa9b8b8, 0xd2dccf, 0xf3f6e8],
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
