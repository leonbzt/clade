// Small pixel-art helpers: deterministic noise, colours, and a pixel painter over a canvas.

export function hash2(x: number, y: number, k = 0): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth value noise, 0–1, with features about `scale` pixels wide. */
export function noise(x: number, y: number, scale: number, k = 0): number {
  const fx = x / scale, fy = y / scale, x0 = Math.floor(fx), y0 = Math.floor(fy);
  const tx = fx - x0, ty = fy - y0, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = hash2(x0, y0, k), b = hash2(x0 + 1, y0, k), c = hash2(x0, y0 + 1, k), d = hash2(x0 + 1, y0 + 1, k);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** A tiny seeded generator for sprite painters. */
export function seeded(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** '#rrggbb' to a little-endian RGBA uint32 for ImageData. */
export function rgba32(hex: string, alpha = 255): number {
  const n = parseInt(hex.slice(1), 16);
  return ((alpha << 24) | ((n & 0xff) << 16) | (n & 0xff00) | ((n >> 16) & 0xff)) >>> 0;
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

/** Paints single pixels into a small canvas, then commits them in one go. */
export class Painter {
  readonly w: number;
  readonly h: number;
  private img: ImageData;
  private px: Uint32Array;
  private tints = new Map<string, number>();
  constructor(w: number, h: number, private tint: Tint = NO_TINT) {
    this.w = w; this.h = h;
    this.img = new ImageData(w, h);
    this.px = new Uint32Array(this.img.data.buffer);
  }
  /** Colours set from now on are tinted with `t`. */
  setTint(t: Tint) { this.tint = t; this.tints.clear(); }
  set(x: number, y: number, hex: string) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    let c = this.tints.get(hex);
    if (c === undefined) { c = rgba32(tinted(hex, this.tint)); this.tints.set(hex, c); }
    this.px[y * this.w + x] = c;
  }
  line(x0: number, y0: number, x1: number, y1: number, hex: string) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let k = 0; k <= n; k++) this.set(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, hex);
  }
  disc(cx: number, cy: number, r: number, hex: string) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.8) this.set(cx + x, cy + y, hex);
  }
  toCanvas(): HTMLCanvasElement {
    const c = makeCanvas(this.w, this.h);
    c.getContext('2d')!.putImageData(this.img, 0, 0);
    return c;
  }
}

/** A colour shift: hue in turns, lightness added, saturation scaled by 1 + sat. */
export type Tint = { hue: number; light: number; sat: number };
export const NO_TINT: Tint = { hue: 0, light: 0, sat: 0 };
export const tintKey = (t: Tint) => `${t.hue.toFixed(3)},${t.light.toFixed(3)},${t.sat.toFixed(3)}`;

/** '#rrggbb' shifted in HSL. */
export function tinted(hex: string, t: Tint): string {
  if (!t.hue && !t.light && !t.sat) return hex;
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l0 = (max + min) / 2, d = max - min;
  let h = 0, s0 = 0;
  if (d) {
    s0 = d / (1 - Math.abs(2 * l0 - 1));
    h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  h = (((h + t.hue) % 1) + 1) % 1;
  const s = Math.max(0, Math.min(1, s0 * (1 + t.sat))), l = Math.max(0, Math.min(1, l0 + t.light));
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h * 6) % 2) - 1)), m = l - c / 2;
  const [rr, gg, bb] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h * 6) % 6];
  const hx = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${hx(rr)}${hx(gg)}${hx(bb)}`;
}
