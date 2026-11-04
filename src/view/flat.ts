// The 2D low-poly look's tools (from the look toy, `toys/look-2d.ts`): the palette flattened, a 15-bit colour → the
// nearest palette index, polygons, a small 3D facet light, and a hash.
import { PALETTE, type RampId } from '../data/palette';

export type Ctx = CanvasRenderingContext2D;
export type P2 = [number, number];
export type V3 = [number, number, number];
export const mk = (w = 1, h = 1) => Object.assign(document.createElement('canvas'), { width: w, height: h });
export const ctx = (c: HTMLCanvasElement) => c.getContext('2d', { willReadFrequently: true })!;

// ---- the palette: colours in ramp order, each ramp's first index and size, and one step darker per colour ----
const RAMPS = Object.keys(PALETTE) as RampId[];
const hex: string[] = [], dk: number[] = [], at = {} as Record<RampId, number>, n = {} as Record<RampId, number>;
for (const r of RAMPS) {
  at[r] = hex.length; n[r] = PALETTE[r].length;
  PALETTE[r].forEach((h, i) => { dk.push(at[r] + Math.max(0, i - 1)); hex.push(h); });
}
export const F = { hex, dk, rgb: hex.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))) };
/** The palette index of a ramp step, clamped to the ramp. */
export const pi = (r: RampId, i: number) => at[r] + Math.max(0, Math.min(n[r] - 1, Math.round(i)));
export const col = (r: RampId, i: number) => hex[pi(r, i)];

let lut: Uint8Array | null = null;
/** A 15-bit colour → the nearest palette index (weighted for the eye). */
export function lutOf() {
  if (lut) return lut;
  lut = new Uint8Array(32768);
  for (let i = 0; i < 32768; i++) {
    const r = ((i >> 10) & 31) * 8 + 4, g = ((i >> 5) & 31) * 8 + 4, b = (i & 31) * 8 + 4;
    let best = 0, bd = Infinity;
    F.rgb.forEach(([pr, pg, pb], j) => {
      const d = 2 * (r - pr) ** 2 + 4 * (g - pg) ** 2 + 3 * (b - pb) ** 2;
      if (d < bd) { bd = d; best = j; }
    });
    lut[i] = best;
  }
  return lut;
}
export const key = (d: Uint8ClampedArray, p: number) => ((d[p] >> 3) << 10) | ((d[p + 1] >> 3) << 5) | (d[p + 2] >> 3);

/** A layer of palette indices, one per low-res pixel (EMPTY where nothing is drawn): bodies are rasterised straight
 * into it (no anti-aliasing, no read-back, no colour snapping). */
export const EMPTY = 255;
export class Pix {
  d: Uint8Array;
  constructor(public w: number, public h: number) { this.d = new Uint8Array(w * h).fill(EMPTY); }
  clear() { this.d.fill(EMPTY); }
}
export type Out = Ctx | Pix;
const index = new Map(hex.map((h, i) => [h, i]));

/** A triangle into a Pix: the pixels whose centres fall inside it. */
function tri(b: Pix, j: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
  const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (!area) return;
  const s = area > 0 ? 1 : -1, d = b.d, w = b.w;
  const x0 = Math.max(0, Math.round(Math.min(ax, bx, cx))), x1 = Math.min(w - 1, Math.round(Math.max(ax, bx, cx)));
  const y0 = Math.max(0, Math.round(Math.min(ay, by, cy))), y1 = Math.min(b.h - 1, Math.round(Math.max(ay, by, cy)));
  for (let y = y0; y <= y1; y++) {
    const py = y + 0.5;
    for (let x = x0; x <= x1; x++) {
      const px = x + 0.5;
      if (s * ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) >= 0 && s * ((cx - bx) * (py - by) - (cy - by) * (px - bx)) >= 0 && s * ((ax - cx) * (py - cy) - (ay - cy) * (px - cx)) >= 0) d[y * w + x] = j;
    }
  }
}

/** A filled rectangle (whole pixels). */
export function rect(g: Out, x: number, y: number, w: number, h: number, colour: string) {
  if (!(g instanceof Pix)) { g.fillStyle = colour; g.fillRect(x, y, w, h); return; }
  const j = index.get(colour)!;
  for (let yy = Math.max(0, y); yy < Math.min(g.h, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(g.w, x + w); xx++) g.d[yy * g.w + xx] = j;
}

export function poly(g: Out, pts: P2[], colour: string, seam = false) {
  if (g instanceof Pix) {
    const j = index.get(colour)!;
    for (let i = 2; i < pts.length; i++) tri(g, j, pts[0][0], pts[0][1], pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
    return;
  }
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fillStyle = colour;
  g.fill();
  if (seam) { g.strokeStyle = colour; g.lineWidth = 1; g.stroke(); }
}

// ---- a facet's light: its normal against a fixed light, in 3D (y up, z toward you) ----
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const UNDER: V3 = norm([-0.5, 0.8, 0.9]); // the soil's light (no sun underground)
export function lit(a: V3, b: V3, c: V3, L: V3) {
  const u: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v: V3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  let m = norm([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
  if (m[2] < 0) m = [-m[0], -m[1], -m[2]];
  return m[0] * L[0] + m[1] * L[1] + m[2] * L[2];
}

export function hash(x: number, y: number, s: number) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** A 4×4 ordered dither, 0–1. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const dither = (x: number, y: number) => (BAYER[(x & 3) + (y & 3) * 4] + 0.5) / 16;

/** The camera: world → low-res pixels, X = (x − ox)·k. */
export interface Cam { k: number; ox: number; oy: number }
export const X = (c: Cam, x: number) => (x - c.ox) * c.k;
export const Y = (c: Cam, y: number) => (y - c.oy) * c.k;
export const P = (c: Cam, x: number, y: number): P2 => [(x - c.ox) * c.k, (y - c.oy) * c.k];
/** The sun's direction for facets (y up, z toward you). */
export const sunV = (sun: number): V3 => norm([Math.sin(sun), Math.cos(sun), 0.7]);
