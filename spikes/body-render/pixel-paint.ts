// A spike: a pixel-native painter. Shapes go on a real pixel grid as heights, each pixel takes its light from the shape's
// own normal, and tones, seams and outlines are decided per pixel. No triangles and no filter. Throwaway.
import { PAL, hash, mixRamp, type P3, type Ramp } from '../../game/src/view/shade';
import type { Body } from '../../toys/creature-body';
import type { Anchor } from '../../toys/creature-parts';
import { spanAt } from '../../toys/creature-model';
import { mixC } from './looks';

const S0 = [-0.45, -0.62, 0.64], Sn = Math.hypot(...S0);
export const SUN = S0.map((v) => v / Sn);
const TONE_K = 3.3, THIN = 255; // a thin line is one pixel of colour, with no outline, or legs turn into dark bars

export class Paint {
  H: Float32Array; N: Float32Array; A: Float32Array; M: Uint8Array; B: Uint8Array; T: Int8Array; out: Uint8Array;
  mats: Ramp[] = [];
  private x0 = 1e9; private y0 = 1e9; private x1 = -1; private y1 = -1;
  private dots: number[] = [];
  constructor(public w: number, public h: number) {
    const n = w * h;
    this.H = new Float32Array(n).fill(-99); this.N = new Float32Array(n); this.A = new Float32Array(n); this.M = new Uint8Array(n); this.B = new Uint8Array(n); this.T = new Int8Array(n);
    this.out = new Uint8Array(n * 4);
  }
  clear() {
    if (this.x1 >= 0) {
      const w = this.w, xa = Math.max(0, this.x0 - 1), xb = Math.min(w - 1, this.x1 + 1), ya = Math.max(0, this.y0 - 1), yb = Math.min(this.h - 1, this.y1 + 1);
      for (let y = ya; y <= yb; y++) { const a = y * w + xa, e = y * w + xb + 1; this.H.fill(-99, a, e); this.M.fill(0, a, e); this.B.fill(0, a, e); this.out.fill(0, a * 4, e * 4); }
    }
    this.x0 = this.y0 = 1e9; this.x1 = this.y1 = -1; this.dots.length = 0;
  }
  /** A round-ended bar, with height. `s` flattens it; `band` marks plates; `bias` shifts its tone. */
  capsule(ax: number, ay: number, az: number, bx: number, by: number, bz: number, ra: number, rb: number, mat: number, bias = 0, s = 0.8, band = 0) {
    const R = Math.max(ra, rb), w = this.w, h = this.h, xa = Math.max(0, Math.floor(Math.min(ax, bx) - R)), xb = Math.min(w - 1, Math.ceil(Math.max(ax, bx) + R)), ya = Math.max(0, Math.floor(Math.min(ay, by) - R)), yb = Math.min(h - 1, Math.ceil(Math.max(ay, by) + R));
    const dx = bx - ax, dy = by - ay, d2 = dx * dx + dy * dy || 1e-6, dl = Math.sqrt(d2), bb = bias / TONE_K;
    for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) {
      const px = x + 0.5 - ax, py = y + 0.5 - ay, t = Math.max(0, Math.min(1, (px * dx + py * dy) / d2)), qx = px - dx * t, qy = py - dy * t, d = Math.sqrt(qx * qx + qy * qy), r = ra + (rb - ra) * t;
      if (d >= r) continue;
      const q = d / r, nz = Math.sqrt(1 - q * q), z = az + (bz - az) * t + r * nz * s, p = y * w + x;
      if (z <= this.H[p]) continue;
      const k = (s * q) / Math.max(nz, 0.25), ux = d > 1e-5 ? qx / d : 0, uy = d > 1e-5 ? qy / d : 0, nx = k * ux, ny = k * uy, l = Math.sqrt(nx * nx + ny * ny + 1);
      this.H[p] = z; this.M[p] = mat + 1; this.B[p] = band;
      this.N[p] = (nx * SUN[0] + ny * SUN[1] + SUN[2]) / l + bb;
      this.A[p] = (px * dy - py * dx) / dl / r;
      if (x < this.x0) this.x0 = x; if (x > this.x1) this.x1 = x; if (y < this.y0) this.y0 = y; if (y > this.y1) this.y1 = y;
    }
  }
  /** A head shield: the front of a dome, its centre at (cx, cy), `a` long towards the nose along (ux, uy) and `b` wide across (vx, vy). */
  shield(cx: number, cy: number, ux: number, uy: number, vx: number, vy: number, a: number, b: number, z0: number, h: number, mat: number, bias = 0) {
    const R = Math.max(a, b) + 1, w = this.w, bb = bias / TONE_K, xa = Math.max(0, Math.floor(cx - R)), xb = Math.min(w - 1, Math.ceil(cx + R)), ya = Math.max(0, Math.floor(cy - R)), yb = Math.min(this.h - 1, Math.ceil(cy + R));
    for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) {
      const px = x + 0.5 - cx, py = y + 0.5 - cy, s = (px * ux + py * uy) / a, c = (px * vx + py * vy) / b; // s < 0 is towards the nose
      if (s > 0.18) continue;
      const q2 = s * s + c * c; if (q2 >= 1) continue;
      const nz = Math.max(0.25, Math.sqrt(1 - q2)), z = z0 + h * nz, p = y * w + x; if (z <= this.H[p]) continue;
      const ns = (h * s) / (a * nz), nc = (h * c) / (b * nz), nx = ns * ux + nc * vx, ny = ns * uy + nc * vy, l = Math.sqrt(nx * nx + ny * ny + 1);
      this.H[p] = z; this.M[p] = mat + 1; this.B[p] = 0; this.N[p] = (nx * SUN[0] + ny * SUN[1] + SUN[2]) / l + bb;
      if (x < this.x0) this.x0 = x; if (x > this.x1) this.x1 = x; if (y < this.y0) this.y0 = y; if (y > this.y1) this.y1 = y;
    }
  }
  /** A one-pixel line (Bresenham), never thicker or broken at any angle. */
  line(ax: number, ay: number, bx: number, by: number, z: number, mat: number, bias = 0) {
    let x = Math.floor(ax), y = Math.floor(ay); const ex = Math.floor(bx), ey = Math.floor(by), dx = Math.abs(ex - x), dy = -Math.abs(ey - y), sx = x < ex ? 1 : -1, sy = y < ey ? 1 : -1;
    let err = dx + dy, guard = 200;
    while (guard-- > 0) {
      if (x >= 0 && y >= 0 && x < this.w && y < this.h) {
        const p = y * this.w + x;
        if (z > this.H[p]) { this.H[p] = z; this.M[p] = mat + 1; this.B[p] = THIN; this.N[p] = SUN[2] + bias / TONE_K; if (x < this.x0) this.x0 = x; if (x > this.x1) this.x1 = x; if (y < this.y0) this.y0 = y; if (y > this.y1) this.y1 = y; }
      }
      if (x === ex && y === ey) break;
      const e2 = 2 * err; if (e2 >= dy) { err += dy; x += sx; } if (e2 <= dx) { err += dx; y += sy; }
    }
  }
  /** A fixed colour on top of everything: eyes. */
  dot(x: number, y: number, c: number) { this.dots.push(Math.floor(x), Math.floor(y), c); }

  /** Pixels from heights: tones, then seams and contours, then clean-up, then a selective outline. */
  finish(groove = 0) {
    const w = this.w, h = this.h, { H, N, M, B, A, T, out } = this;
    const xa = Math.max(0, this.x0 - 1), xb = Math.min(w - 1, this.x1 + 1), ya = Math.max(0, this.y0 - 1), yb = Math.min(h - 1, this.y1 + 1);
    for (let y = this.y0; y <= this.y1; y++) for (let x = this.x0; x <= this.x1; x++) {
      const p = y * w + x; if (!M[p]) continue;
      T[p] = Math.round(Math.max(0, Math.min(4, 2.1 + (N[p] - SUN[2]) * TONE_K - (B[p] && B[p] % 2 === 0 ? 0.3 : 0))));
    }
    for (let y = this.y0; y <= this.y1; y++) for (let x = this.x0; x <= this.x1; x++) { // seams between plates; a darker pixel where a part overlaps a lower one
      const p = y * w + x; if (!M[p]) continue;
      const r = x + 1 < w ? p + 1 : p, d = y + 1 < h ? p + w : p, l = x > 0 ? p - 1 : p, u = y > 0 ? p - w : p;
      let down = 0;
      const band = B[p] && B[p] !== THIN;
      if (band && ((M[r] === M[p] && B[r] && B[r] !== THIN && B[r] !== B[p]) || (M[d] === M[p] && B[d] && B[d] !== THIN && B[d] !== B[p]))) down = 1;
      for (const q of [r, d, l, u]) if (M[q] && H[q] - H[p] > 1.7) down = Math.max(down, 2);
      if (groove && band && Math.abs(Math.abs(A[p]) - groove) < 0.075) down = Math.max(down, 1);
      if (down) T[p] = Math.max(0, T[p] - down);
    }
    for (let y = Math.max(1, this.y0); y <= Math.min(h - 2, this.y1); y++) for (let x = Math.max(1, this.x0); x <= Math.min(w - 2, this.x1); x++) { // one lonely pixel of a tone is noise
      const p = y * w + x, m = M[p]; if (!m) continue;
      const a = T[p - 1], b = T[p + 1], c = T[p - w], d = T[p + w];
      if (M[p - 1] === m && M[p + 1] === m && M[p - w] === m && M[p + w] === m && a === b && c === d && a === c && a !== T[p]) T[p] = a;
    }
    for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) {
      const p = y * w + x, o = p * 4; let c: number;
      if (M[p]) c = this.mats[M[p] - 1][T[p]];
      else {
        const edge = (q: number) => (B[q] === THIN ? 0 : M[q]), rr = x + 1 < w ? edge(p + 1) : 0, dd = y + 1 < h ? edge(p + w) : 0, ll = x > 0 ? edge(p - 1) : 0, uu = y > 0 ? edge(p - w) : 0, m = rr || dd || ll || uu;
        if (!m) continue;
        const ramp = this.mats[m - 1];
        c = rr || dd ? mixC(ramp[1], 0x2b1d3f, 0.5) : mixC(ramp[0], 0x1c1430, 0.55); // the lit side's outline is softer
      }
      out[o] = c >> 16; out[o + 1] = (c >> 8) & 255; out[o + 2] = c & 255; out[o + 3] = 255;
    }
    for (let k = 0; k < this.dots.length; k += 3) {
      const x = this.dots[k], y = this.dots[k + 1], c = this.dots[k + 2]; if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const o = (y * w + x) * 4; out[o] = c >> 16; out[o + 1] = (c >> 8) & 255; out[o + 2] = c & 255; out[o + 3] = 255;
    }
  }

  /** The same shapes as an ink plate: stipple from the light, a thin wash, ink on the contours. */
  finishPlate(paper: number) {
    const w = this.w, h = this.h, { H, N, M, B, out } = this, ink = 0x2c2014;
    const xa = Math.max(1, this.x0 - 1), xb = Math.min(w - 2, this.x1 + 1), ya = Math.max(1, this.y0 - 1), yb = Math.min(h - 2, this.y1 + 1);
    for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) {
      const p = y * w + x, o = p * 4; let c = -1;
      if (M[p]) {
        const wash = mixC(paper, this.mats[M[p] - 1][3], 0.5), dark = Math.max(0, Math.min(1, (SUN[2] + 0.42 - N[p]) * 1.5));
        c = hash(x, y, 77) < dark * dark * 0.9 + 0.012 ? mixC(ink, wash, 0.12) : wash;
        for (const q of [p + 1, p - 1, p + w, p - w]) if (M[q] && (H[q] - H[p] > 2.2 || (B[p] && B[q] && B[p] !== B[q] && B[p] !== THIN && B[q] !== THIN && q > p))) c = ink;
      } else if (M[p + 1] || M[p - 1] || M[p + w] || M[p - w]) c = ink;
      if (c < 0) continue;
      out[o] = c >> 16; out[o + 1] = (c >> 8) & 255; out[o + 2] = c & 255; out[o + 3] = 255;
    }
  }
}

/** One animal from the general body's skeleton and data. */
export function paintBody(P: Paint, b: Body, ox: number, oy: number, art: number, ramp: Ramp = b.ramp) {
  b.segs();
  const lin = b.lin as Body['lin'] & { pixel?: { smooth?: boolean } }, L = b.L, R = b.R, U = b.u(), base = 2 * art;
  const pale = mixRamp(ramp, PAL.pale[3], 0.55), dark = mixRamp(ramp, PAL.ink, 0.28), tint = lin.head?.pale ? mixRamp(ramp, PAL.pale[3], lin.head.pale) : ramp;
  P.mats = [ramp, pale, PAL.gill, dark, tint];
  const BODY = 0, PALE = 1, GILL = 2, DARK = 3, HEAD = 4;
  const at = (a: number, c: number): [number, number] => { const p = b.P(a, c); return [p[0] * art + ox, p[1] * art + oy]; };
  const rad = (r: number) => Math.max(0.72, r * art);
  const cap = (a0: number, c0: number, z0: number, a1: number, c1: number, z1: number, r0: number, r1: number, mat: number, bias = 0, s = 0.8, band = 0) => { const p = at(a0, c0), q = at(a1, c1); P.capsule(p[0], p[1], z0 * art, q[0], q[1], z1 * art, rad(r0), rad(r1), mat, bias, s, band); };
  const ln = (a0: number, c0: number, a1: number, c1: number, z: number, mat: number, bias = 0) => { const p = at(a0, c0), q = at(a1, c1); P.line(p[0], p[1], q[0], q[1], z * art, mat, bias); };
  const eye = (a: number, c: number, big: boolean) => { const [x, y] = at(a, c); P.dot(x, y, PAL.ink); if (big) { P.dot(x + 1, y, PAL.ink); P.dot(x, y + 1, PAL.ink); P.dot(x + 1, y + 1, PAL.ink); P.dot(x, y, 0xf4f3e4); } };

  const part = (q: Anchor) => {
    const k = q.k, u = U * k, f = q.f, s = q.side, w = b.w(f), sw = b.limb(f, s) * u * (0.25 + 0.5 * b.moving.v);
    switch (q.part) {
      case 'leg':
        if (q.style === 'stub') { cap(f * L, s * w * 0.7, 1, f * L + sw, s * (w + u * 0.8), 0.3, u * 0.42, u * 0.36, BODY, -0.2); break; }
        if (art < 0.8 || q.style === 'walk') { ln(f * L, s * w, f * L - u * 0.2 + sw * 0.5, s * (w + u * 0.75), 1.4, DARK, 0.4); ln(f * L - u * 0.2 + sw * 0.5, s * (w + u * 0.75), f * L + u * 0.35 + sw, s * (w + u * 1.45), 1.2, DARK, 0.4); break; }
        cap(f * L, s * w, 1.2, f * L - u * 0.2 + sw * 0.5, s * (w + u * 0.75), 1, u * 0.2, u * 0.16, DARK, 0.4);
        cap(f * L - u * 0.2 + sw * 0.5, s * (w + u * 0.75), 1, f * L + u * 0.35 + sw, s * (w + u * 1.45), 0.3, u * 0.16, u * 0.1, DARK, 0.4);
        break;
      case 'claw': {
        if (q.style === 'arm') { // a grasping arm, segmented, curling in
          for (const side of [-1, 1]) {
            let a0 = -1, c0 = side * b.w(0) * 0.7; const n = 6, out = 1 + b.reach.v * 0.8;
            for (let i = 1; i <= n; i++) { const t = i / n, a1 = -1 - t * U * 2.5 * out, c1 = side * (b.w(0) * 0.62 + t * U * 0.95 - Math.max(0, t - 0.62) * U * 1.5); cap(a0, c0, 2, a1, c1, 2, U * 0.27 * (1.05 - t * 0.5), U * 0.27 * (1.05 - (t + 0.15) * 0.5), BODY, i % 2 ? 0.45 : -0.2, 0.6); const sp = at(a1, c1), e = at(a1 - U * 0.12, c1 - side * U * 0.42); P.line(sp[0], sp[1], e[0], e[1], 1, PALE); a0 = a1; c0 = c1; }
          }
          break;
        }
        const sc = (U / 4.5) * k, W = Math.max(b.w(0.08) * 0.92, U * 0.8), out = (1 + b.reach.v * 2.5) * sc, open = (0.5 + b.reach.v * 0.9) * sc;
        for (const side of [-1, 1]) {
          cap(1.5, side * W * 0.7, 2, -out, side * W, 2, 1.25 * sc, 1.05 * sc, HEAD, 0.1);
          cap(-out, side * W, 2.5, -out - 3 * sc, side * W, 2.5, 1.7 * sc, 1.95 * sc, HEAD, 0.45, 0.7);
          cap(-out - 3 * sc, side * (W - 1.1 * sc), 2.5, -out - 6.6 * sc, side * (W - 1.4 * sc - open), 2, 1.1 * sc, 0.4 * sc, HEAD, 0.6);
          cap(-out - 3 * sc, side * (W + 1.1 * sc), 2.5, -out - 6 * sc, side * (W + 1.3 * sc + open), 2, 0.95 * sc, 0.35 * sc, HEAD, 0.25);
        }
        break;
      }
      case 'tentacles': {
        const n = q.style === 'palp' ? 1 : 2, len = U * (q.style === 'palp' ? 1.3 : 2.2) * k;
        for (const side of [-1, 1]) for (let j = 0; j < n; j++) {
          let a0 = 0, c0 = side * b.w(0) * (0.3 + j * 0.3);
          for (let i = 1; i <= 3; i++) { const t = i / 3, a1 = -t * len, c1 = side * (b.w(0) * (0.3 + j * 0.3) + t * U * (0.4 + j * 0.6)) + Math.sin(b.time() * 3 + i + j + side) * t * U * 0.25; ln(a0, c0, a1, c1, 2, PALE); a0 = a1; c0 = c1; }
        }
        break;
      }
      case 'eye': {
        const along = b.headLen() * 0.42, W = b.w(along / L);
        if (q.style === 'stalk') for (const side of [-1, 1]) { const c = side * (W + U * 0.75); ln(along, side * W * 0.8, along - U * 0.15, c, 5, PALE); const [x, y] = at(along - U * 0.15, c); P.capsule(x, y, 6 * art, x, y, 6 * art, rad(U * 0.32), rad(U * 0.32), BODY, 0.8); P.dot(x, y, PAL.ink); }
        else if (q.style === 'five') { for (const [da, c] of [[0, 0], [U * 0.5, -W * 0.5], [U * 0.5, W * 0.5], [-U * 0.1, -W * 0.8], [-U * 0.1, W * 0.8]] as const) eye(along + da, c, false); }
        else for (const side of [-1, 1]) eye(along, side * W * 0.56, q.style !== 'dot' && art >= 0.8);
        break;
      }
      case 'gill': for (let j = 0; j < 3; j++) { const a0 = f * L - u * 0.5 + j * u * 0.5; cap(a0, s * w * 0.85, 1.3, a0 + u * 0.45 + sw * 0.3, s * (w + u * 1.05), 0.8, u * 0.17, u * 0.11, GILL, j % 2 ? 0.3 : -0.1); } break;
      case 'bristles': for (let j = 0; j < 3; j++) { const a0 = f * L - u * 0.35 + j * u * 0.35, n = q.style === 'tuft' ? 0.7 : 1.15; ln(a0, s * w, a0 + u * 0.3 + sw * 0.3, s * (w + u * n), 1.5, PALE, j === 1 ? 0.7 : 0); } break;
      case 'flap': {
        const fin = q.style === 'fin', len = u * (fin ? 1.25 : 1.5) * (fin ? 1 : 1 - Math.abs(f - 0.45) * 0.55), ph = b.limb(f, s), z = 2 + ph * 2;
        cap(f * L, s * w * 0.75, 2, f * L + u * (fin ? 0.9 : 0.3) - ph * u * 0.1, s * (w + len), z, u * 0.42, u * (fin ? 0.12 : 0.24), HEAD, ph > 0 ? 0.5 : 0, 0.32);
        break;
      }
      case 'spine':
        if (q.kind === 'tail') cap(L, 0, 2, L + u * 1.6, 0, 1.5, u * 0.3, u * 0.08, PALE, 0.2);
        else if (q.kind === 'back') { cap(f * L, 0, (lin.ridge ?? 3) + 2, f * L + u * 0.5, 0, (lin.ridge ?? 3) + 4, u * 0.3, u * 0.1, PALE, 0.4); }
        else { const n = q.style === 'row' ? 0.72 : 1.25; cap(f * L, s * w * 0.85, 1.6, f * L + u * 0.45, s * (w + u * n), 1, u * 0.24, u * 0.06, PALE, 0.25); }
        break;
      case 'plate': { const d = Math.max(u * 0.55, L * 0.065); cap(f * L, -w * 0.78, (lin.ridge ?? 3) + 2.4, f * L, w * 0.78, (lin.ridge ?? 3) + 2.4, d, d, PALE, 0.15, 0.36); break; }
      case 'fan': {
        const n = q.style === 'stub' ? 1 : 2, len = U * k * (q.style === 'stub' ? 0.8 : 1.45);
        for (let j = -n; j <= n; j++) cap(L - 1, 0, 2, L + Math.cos(j * 0.42) * len, Math.sin(j * 0.42) * len, 1.2, U * 0.22 * k, U * 0.3 * k, HEAD, j % 2 ? 0.35 : -0.1, 0.35);
        break;
      }
      case 'enrol': { if (lin.lobes) break; const n = 3; for (let j = 0; j < n; j++) { const af = L * (0.72 + j * 0.13), wf = b.w(Math.min(1, af / L)) * 0.95; cap(af, -wf * 0.55, 3.2 + j * 0.2, af, wf * 0.55, 3.2 + j * 0.2, U * 0.42, U * 0.42, HEAD, j % 2 ? 0.25 : 0, 0.4); } break; }
    }
  };
  for (const q of b.anchors) if (q.part !== 'plate' && q.part !== 'enrol' && !(q.part === 'eye') && !(q.part === 'spine' && q.kind === 'back')) part(q);
  if (lin.head?.antennae) for (const side of [-1, 1]) { const c = side * b.w(0) * 0.5, wig = Math.sin(b.time() * 2 + side) * U * 0.16; ln(0.5, c, -U * 0.9, side * (b.w(0) * 0.5 + U * 0.5), 1, DARK, 0.3); ln(-U * 0.9, side * (b.w(0) * 0.5 + U * 0.5), -U * 1.6 + wig, side * (b.w(0) * 0.5 + U * 1.1), 1, DARK, 0.3); }

  if (lin.skin === 'bead') { // soft rings: each a round cushion, so its edge is drawn by its height
    const segs = b.segs();
    segs.forEach((j, k) => { const f = k / (segs.length - 1), r = j.r * b.swell(f), x = j.x * art + ox, y = j.y * art + oy; P.capsule(x, y, base * 0.2 + (segs.length - k) * 0.03, x, y, base * 0.2 + (segs.length - k) * 0.03, Math.max(1, r * art), Math.max(1, r * art), BODY, k % 2 ? -0.12 : 0.12, 0.8, (L * art) / segs.length >= 2.4 ? k + 1 : 0); });
    const J = segs[0], m = J.r * 0.72; P.dot(J.x * art + ox + Math.cos(J.a) * m * art, J.y * art + oy + Math.sin(J.a) * m * art, mixC(ramp[0], PAL.ink, 0.5));
    if (!b.anchors.some((q) => q.part === 'eye')) for (const side of [-1, 1]) { const [x, y] = at(b.headLen() * 0.4, side * b.w(0.05) * 0.62); P.dot(x, y, PAL.ink); }
  } else { // a stiff or smooth hull, one long dome, its plates told apart per pixel
    const n = Math.min(spanAt(lin.plates, b.size, 0) * (lin.lobes ? 2 : 1), Math.floor((L * art) / 3)), steps = Math.max(6, Math.ceil((L * art) / 1.25)), S = lin.ridge ? Math.min(0.72, lin.ridge * 0.11) : 0.6;
    for (let i = 0; i < steps; i++) {
      const f0 = i / steps, f1 = (i + 1) / steps, band = n ? Math.min(n - 1, Math.floor(((f0 + f1) / 2) * n)) + 1 : 0;
      cap(f0 * L, 0, 1, f1 * L, 0, 1, b.w(f0) * b.swell(f0), b.w(f1) * b.swell(f1), BODY, lin.lobes ? 0.3 : 0, S, band);
    }
    if (lin.lobes) for (let i = 0; i < steps; i++) { // the axial lobe stands up from the hull: real height, so light does the drawing
      const f0 = i / steps, f1 = (i + 1) / steps, w0 = b.w(f0), w1 = b.w(f1), band = Math.min(n - 1, Math.floor(((f0 + f1) / 2) * n)) + 1;
      cap(f0 * L, 0, 1 + 0.96 * w0 * S, f1 * L, 0, 1 + 0.96 * w1 * S, w0 * 0.3, w1 * 0.3, BODY, 0.45, S, band);
    }
  }
  if (lin.head) {
    const h = lin.head, len = L * h.len, W = R * h.wide, r = Math.max(len * 0.56, R * 0.4);
    if (h.genal) for (const side of [-1, 1]) cap(len * 0.7, side * W * 0.86, 2, len * 1.6, side * W * 1.22, 1, U * 0.15, U * 0.05, HEAD, 0.1);
    const Sh = Math.min(0.62, (lin.ridge ?? 4) * 0.13), hz = Math.max(2.2, 1.2 + b.w(Math.min(1, (r * 2) / L)) * Math.min(0.72, (lin.ridge ?? 4) * 0.11) * 1.06); // the shield lies on top of the hull
    const o = at(len, 0), ua = at(len + 1, 0), va = at(len, 1), H0 = Math.max(1.6, len * 0.42);
    P.shield(o[0], o[1], (ua[0] - o[0]) / art, (ua[1] - o[1]) / art, (va[0] - o[0]) / art, (va[1] - o[1]) / art, len * 1.05 * art, W * art, hz * art, H0 * art, HEAD, 0.1);
    if (lin.lobes) cap(len * 0.25, 0, hz + H0 * 0.88, len * 0.95, 0, hz + H0 * 0.88, r * 0.46, r * 0.36, HEAD, 0.3, Sh);
  }
  for (const q of b.anchors) if (q.part === 'plate' || q.part === 'enrol' || q.part === 'eye' || (q.part === 'spine' && q.kind === 'back')) part(q);
}
