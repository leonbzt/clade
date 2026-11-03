// The look toy: 2D canvas helpers shared by the flat looks (palette snapping, polygons, hulls) and the island.
import { ISLAND, cross, dot, hash, norm, pi, sub, type Flat, type Frame, type RampId, type V3 } from './look-data';

export type Ctx = CanvasRenderingContext2D;
export type P2 = [number, number];
export const mk = (w = 1, h = 1) => Object.assign(document.createElement('canvas'), { width: w, height: h });
export const ctx = (c: HTMLCanvasElement) => c.getContext('2d', { willReadFrequently: true })!;

// ---- palette snapping: a 15-bit colour → the nearest palette index ----
const luts = new WeakMap<Flat, Uint8Array>();
export function lutOf(f: Flat) {
  let l = luts.get(f);
  if (l) return l;
  l = new Uint8Array(32768);
  for (let i = 0; i < 32768; i++) {
    const r = ((i >> 10) & 31) * 8 + 4, g = ((i >> 5) & 31) * 8 + 4, b = (i & 31) * 8 + 4;
    let best = 0, bd = Infinity;
    f.rgb.forEach(([pr, pg, pb], j) => {
      const d = 2 * (r - pr) ** 2 + 4 * (g - pg) ** 2 + 3 * (b - pb) ** 2;
      if (d < bd) (bd = d), (best = j);
    });
    l[i] = best;
  }
  luts.set(f, l);
  return l;
}
export const key = (d: Uint8ClampedArray, p: number) => ((d[p] >> 3) << 10) | ((d[p + 1] >> 3) << 5) | (d[p + 2] >> 3);

export function snapAll(g: Ctx, w: number, h: number, f: Flat) {
  const img = g.getImageData(0, 0, w, h), d = img.data, lut = lutOf(f);
  for (let p = 0; p < d.length; p += 4) {
    const c = f.rgb[lut[key(d, p)]];
    (d[p] = c[0]), (d[p + 1] = c[1]), (d[p + 2] = c[2]), (d[p + 3] = 255);
  }
  g.putImageData(img, 0, 0);
}
export function poly(g: Ctx, pts: P2[], col: string, seam = false) {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fillStyle = col;
  g.fill();
  if (seam) (g.strokeStyle = col), (g.lineWidth = 1), g.stroke();
}
export function hull(p: P2[]): P2[] {
  p = p.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P2[] = [], up: P2[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (let i = p.length - 1; i >= 0; i--) {
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p[i]) <= 0) up.pop();
    up.push(p[i]);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

export function drawIsle(isle: HTMLCanvasElement, f: Frame, tp: number) {
  const g = ctx(isle), col = (F: Flat, r: RampId, i: number) => F.hex[pi(F, r, i)];
  const F = f.flat, I = f.island, { w, h } = ISLAND, t = f.time;
  const sunI = norm([f.sun[0], f.sun[2], f.sun[1]]);
  g.fillStyle = col(F, 'water', 0), g.fillRect(0, 0, isle.width, isle.height);
  const P = (x: number, y: number): V3 => [x, y, I.corner[y * (w + 1) + x]];
  const S = (v: V3): P2 => [v[0] * tp, (v[1] + 2.5) * tp - v[2] * tp * 0.9];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const ti = y * w + x, tile = I.tiles[ti], a = P(x, y), b = P(x + 1, y), c = P(x, y + 1), d = P(x + 1, y + 1);
      [[a, b, d], [a, d, c]].forEach((tr, q) => {
        let n = norm(cross(sub(tr[1], tr[0]), sub(tr[2], tr[0])));
        if (n[2] < 0) n = [-n[0], -n[1], -n[2]];
        const L = dot(n, sunI), hh = hash(x, y, 30 + q);
        const j = tile === 'sea' ? pi(F, 'water', (hh * 7 + t * 0.4) % 1 < 0.06 ? 1 : 0)
          : tile === 'beach' ? pi(F, 'earth', L > 0.55 ? 4 : 3)
          : tile === 'bare' ? pi(F, 'stone', L > 0.55 ? 2 : 1)
          : tile === 'forest' ? pi(F, 'leaf', L > 0.7 ? 3 : L > 0.4 ? 2 : 1)
          : tile === 'wet' ? (hh > 0.65 ? pi(F, 'water', 0) : pi(F, 'leaf', L > 0.55 ? 1 : 0))
          : hh > 0.78 ? pi(F, 'warm', (hh * 5 + t * 0.3) % 1 > 0.5 ? 1 : 0) : pi(F, L > 0.6 ? 'stone' : 'earth', 0);
        poly(g, tr.map(S), F.hex[j], true);
      });
      const top = S([x + 0.5, y + 0.6, (a[2] + d[2]) / 2]);
      if (I.area[ti] || (tile === 'forest' && hash(x, y, 33) > 0.35)) {
        const s2 = tp * 0.45, cl = I.area[ti] ? col(F, 'leaf', 4) : col(F, 'leaf', 1);
        poly(g, [[top[0] - s2, top[1]], [top[0] + s2, top[1]], [top[0], top[1] - tp * 1.1]], cl);
      }
    }
  // the area's border, dotted
  g.fillStyle = col(F, 'warm', 2);
  for (let ti = 0; ti < w * h; ti++) {
    if (!I.area[ti]) continue;
    const x = ti % w, y = (ti / w) | 0;
    const edges: [number, number, number, number, boolean][] = [
      [x, y, x + 1, y, y === 0 || !I.area[ti - w]], [x, y + 1, x + 1, y + 1, y === h - 1 || !I.area[ti + w]],
      [x, y, x, y + 1, x === 0 || !I.area[ti - 1]], [x + 1, y, x + 1, y + 1, x === w - 1 || !I.area[ti + 1]]];
    for (const [x0, y0, x1, y1, on] of edges) {
      if (!on) continue;
      const p0 = S(P(x0, y0)), p1 = S(P(x1, y1)), n = Math.max(2, Math.round(tp));
      for (let s = 0; s < n; s += 2) g.fillRect(Math.round(p0[0] + ((p1[0] - p0[0]) * s) / n), Math.round(p0[1] + ((p1[1] - p0[1]) * s) / n), 1, 1);
    }
  }
  snapAll(g, isle.width, isle.height, F);
  // the rare variant's glint, blinking
  if (t % 1.6 < 1) {
    const gx = I.glint % w, gy = (I.glint / w) | 0, [cx, cy] = S([gx + 0.5, gy + 0.5, I.corner[gy * (w + 1) + gx]]).map(Math.round);
    const arm = Math.max(2, Math.round(tp * (0.6 + 0.4 * Math.sin(t * 6))));
    g.fillStyle = col(F, 'rare', 0), g.fillRect(cx - arm, cy, arm * 2 + 1, 1), g.fillRect(cx, cy - arm, 1, arm * 2 + 1);
    g.fillStyle = col(F, 'warm', 2), g.fillRect(cx, cy, 1, 1);
  }
}
