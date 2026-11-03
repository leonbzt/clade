// The look toy, look (c): the 2D world with plants drawn in 3D by a tiny software rasterizer: a z-buffer, an
// oblique view from a little above, light per facet and a sun shadow map, so leaves shade leaves and each plant
// shades the grass behind it. Everything stays on the palette and the 2D pixel grid.
import { cross, dot, norm, pi, sub, type Flat, type Part, type V3 } from './look-data';

/** The oblique view (world units): screen x = x + z·SX, screen y = y − z·SY. */
export const SX = -0.14, SY = 0.26;
/** The grass top seen from a little above: from the back to the soil's cut face. */
export const BAND = { back: -13, front: 1.2 };
const VIEW = norm([-SX, SY, 1]); // towards the viewer
const N = 320, BIAS = 0.15; // shadow map texels per side; depth bias in world units
const neg = (v: V3): V3 => [-v[0], -v[1], -v[2]];

/** Calls fn(pixel, b0, b1, b2) for each pixel centre in the triangle, grown by a third of a pixel so thin stems stay. */
function tri(P: V3[], W: number, H: number, fn: (i: number, b0: number, b1: number, b2: number) => void) {
  const [p, q, r] = P, area = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  if (Math.abs(area) < 1e-6) return;
  const A = Math.abs(area), g = 0.35;
  const t0 = (-g * Math.hypot(r[0] - q[0], r[1] - q[1])) / A, t1 = (-g * Math.hypot(p[0] - r[0], p[1] - r[1])) / A;
  const t2 = (-g * Math.hypot(q[0] - p[0], q[1] - p[1])) / A;
  const x0 = Math.max(0, Math.floor(Math.min(p[0], q[0], r[0]) - 0.5)), x1 = Math.min(W - 1, Math.ceil(Math.max(p[0], q[0], r[0])));
  const y0 = Math.max(0, Math.floor(Math.min(p[1], q[1], r[1]) - 0.5)), y1 = Math.min(H - 1, Math.ceil(Math.max(p[1], q[1], r[1])));
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const px = x + 0.5, py = y + 0.5;
      const b0 = ((q[0] - px) * (r[1] - py) - (q[1] - py) * (r[0] - px)) / area;
      const b1 = ((r[0] - px) * (p[1] - py) - (r[1] - py) * (p[0] - px)) / area;
      const b2 = 1 - b0 - b1;
      if (b0 >= t0 && b1 >= t1 && b2 >= t2) fn(y * W + x, b0, b1, b2);
    }
}

export class Raster {
  W = 1;
  H = 1;
  k = 1;
  /** Palette index + 1 of the nearest plant facet; 0 = none. */
  idx = new Uint8Array(1);
  /** Its depth towards the viewer. */
  dep = new Float32Array(1);
  /** Whose shadow lies on this grass pixel; −1 = sunlit. */
  gsh = new Int8Array(1);
  private sm = new Float32Array(N * N);
  private sid = new Int32Array(N * N);
  private sow = new Int8Array(N * N);
  private u: V3 = [1, 0, 0];
  private w: V3 = [0, 1, 0];
  private s: V3 = [0, 0, 1];
  private u0 = 0;
  private w0 = 0;
  private sc = 1;
  private on = false;

  resize(W: number, H: number, k: number) {
    Object.assign(this, { W, H, k, idx: new Uint8Array(W * H), dep: new Float32Array(W * H), gsh: new Int8Array(W * H) });
  }
  /** Screen pixel x, y and depth towards the viewer. */
  private sp(v: V3): V3 {
    return [(v[0] + v[2] * SX) * this.k, this.H / 2 - (v[1] - v[2] * SY) * this.k, dot(v, VIEW)];
  }
  /** Shadow-map texel x, y and depth towards the sun. */
  private lc(v: V3): V3 {
    return [(dot(v, this.u) - this.u0) * this.sc, (dot(v, this.w) - this.w0) * this.sc, dot(v, this.s)];
  }
  /** The owner of a facet between this light-space point and the sun, or −1. `self`: the point's own facet. */
  private hit(a: number, b: number, d: number, self: number) {
    const x = Math.floor(a), y = Math.floor(b);
    if (x < 0 || y < 0 || x >= N || y >= N) return -1;
    const i = y * N + x;
    return this.sid[i] >= 0 && this.sid[i] !== self && this.sm[i] > d + BIAS ? this.sow[i] : -1;
  }

  /** The sun's depth map of all plant facets. */
  shadow(parts: Part[], sun: V3, on: boolean) {
    this.on = on;
    if (!on) return;
    const s = (this.s = sun), u = (this.u = norm(cross([0, 0, 1], s))), w = (this.w = cross(s, u));
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
    for (const p of parts)
      for (const t of p.tris)
        for (const v of t) {
          const a = dot(v, u), b = dot(v, w);
          (a0 = Math.min(a0, a)), (a1 = Math.max(a1, a)), (b0 = Math.min(b0, b)), (b1 = Math.max(b1, b));
        }
    (this.u0 = a0 - 0.5), (this.w0 = b0 - 0.5), (this.sc = (N - 2) / Math.max(a1 - a0 + 1, b1 - b0 + 1, 1));
    this.sm.fill(-Infinity), this.sid.fill(-1);
    let id = 0;
    for (const p of parts)
      for (const t of p.tris) {
        const L = t.map((v) => this.lc(v)), me = id++;
        tri(L, N, N, (i, c0, c1, c2) => {
          const d = L[0][2] * c0 + L[1][2] * c1 + L[2][2] * c2;
          if (d > this.sm[i]) (this.sm[i] = d), (this.sid[i] = me), (this.sow[i] = p.owner);
        });
      }
  }

  /** The plant facets: nearest wins; shade by angle to the sun, darker where another facet blocks it. */
  plants(parts: Part[], F: Flat, sun: V3) {
    this.idx.fill(0), this.dep.fill(-Infinity);
    let id = 0;
    for (const p of parts) {
      let c: V3 = [0, 0, 0], n0 = 0;
      for (const t of p.tris) for (const v of t) (c = [c[0] + v[0], c[1] + v[1], c[2] + v[2]]), n0++;
      c = [c[0] / n0, c[1] / n0, c[2] / n0];
      const top = F.n[p.ramp] - 1;
      for (const t of p.tris) {
        const me = id++;
        let n = norm(cross(sub(t[1], t[0]), sub(t[2], t[0]))), L: number;
        if (p.kind === 'leaf') {
          if (dot(n, VIEW) < 0) n = neg(n);
          const d = dot(n, sun);
          L = d >= 0 ? d : -0.3 * d; // a leaf lit from behind glows a little
        } else {
          const m: V3 = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, (t[0][2] + t[1][2] + t[2][2]) / 3];
          if (dot(n, sub(m, c)) < 0) n = neg(n);
          if (dot(n, VIEW) < -0.05) continue;
          L = Math.max(0, dot(n, sun));
        }
        const lv = 1 + (top - 1) * (0.2 + 0.8 * L) + p.bias;
        const jl = pi(F, p.ramp, lv) + 1, js = pi(F, p.ramp, Math.min(lv - 1.5, 1 + (top - 1) * 0.2 + p.bias)) + 1;
        const S = t.map((v) => this.sp(v)), Lc = this.on ? t.map((v) => this.lc(v)) : null;
        tri(S, this.W, this.H, (i, b0, b1, b2) => {
          const d = S[0][2] * b0 + S[1][2] * b1 + S[2][2] * b2;
          if (d <= this.dep[i]) return;
          this.dep[i] = d;
          this.idx[i] = Lc && this.hit(Lc[0][0] * b0 + Lc[1][0] * b1 + Lc[2][0] * b2, Lc[0][1] * b0 + Lc[1][1] * b1 + Lc[2][1] * b2,
            Lc[0][2] * b0 + Lc[1][2] * b1 + Lc[2][2] * b2, me) >= 0 ? js : jl;
        });
      }
    }
  }

  /** Whose shadow lies on each pixel of the grass top. */
  ground() {
    this.gsh.fill(-1);
    if (!this.on) return;
    const { W, H, k } = this;
    const y0 = Math.max(0, Math.floor(H / 2 + BAND.back * SY * k)), y1 = Math.min(H - 1, Math.ceil(H / 2 + BAND.front * SY * k));
    for (let y = y0; y <= y1; y++) {
      const z = (y + 0.5 - H / 2) / (SY * k);
      if (z < BAND.back || z > BAND.front) continue;
      for (let x = 0; x < W; x++) {
        const [a, b, d] = this.lc([(x + 0.5) / k - z * SX, 0, z]);
        this.gsh[y * W + x] = this.hit(a, b, d, -1);
      }
    }
  }

  /** Is this point in the sun (no plant facet towards the sun)? */
  sunlit(v: V3) {
    if (!this.on) return true;
    const [a, b, d] = this.lc(v);
    return this.hit(a, b, d, -1) < 0;
  }
}
