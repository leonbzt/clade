// A spike: other ways to draw the one general body. Every look reads the same skeleton and the same data. Throwaway.
import { Filter, GlProgram, Graphics } from 'pixi.js';
import { C, LIGHT, PAL, mixRamp, type P3, type Ramp } from '../../game/src/view/shade';
import { Body } from '../../toys/creature-body';
import { LINEAGES, type Lineage, type LineageId } from '../../toys/creature-data';
import { spanAt } from '../../toys/creature-model';
import { DRAW, drawnOver } from '../../toys/creature-parts';

export const mixC = (a: number, b: number, t: number) => {
  const m = (s: number) => Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * t) << s;
  return m(16) | m(8) | m(0);
};
const darkOf = (r: Ramp) => mixC(r[0], PAL.ink, 0.35);

/** Graphics that re-colours what the body asks for, and can line each shape as an engraver would. */
export class StylePen extends Graphics {
  map: ((c: number) => number) | null = null;
  engrave = 0;
  override fill(style?: any, alpha?: number) {
    if (!this.map) return super.fill(style, alpha);
    const c = typeof style === 'number' ? style : style?.color, a = (typeof style === 'number' ? alpha : style?.alpha) ?? 1;
    super.fill({ color: this.map(c), alpha: a });
    if (this.engrave) super.stroke({ width: this.engrave, color: 0x3a2a18, alpha: 0.55 * a });
    return this;
  }
  override stroke(style?: any) { return this.map ? super.stroke({ ...style, color: this.map(style.color) }) : super.stroke(style); }
}

/** Cute is a rule on the data, the same rule for every lineage: shorter, rounder, a bigger head, fewer repeats. */
export function cuteId(id: LineageId): LineageId {
  const key = `${id}_cute` as LineageId;
  if (LINEAGES[key]) return key;
  const l = LINEAGES[id], fewer = (n: Lineage['built'][number]['n']) => (Array.isArray(n) ? [Math.max(2, Math.round(n[0] * 0.6)), n[1] * 0.5] as [number, number] : n ? Math.max(2, Math.round(n * 0.5)) : n);
  LINEAGES[key] = {
    ...l,
    joints: [Math.max(3, l.joints[0] - 1), l.joints[1] * 0.5], len: [l.len[0] * 0.72, l.len[1] * 0.72], R: [l.R[0] * 1.25, l.R[1] * 1.15], bend: Math.min(l.bend, 3),
    width: l.skin === 'bead' ? [[0, 1], [0.25, 1.02], [1, 0.66]] : [[0, 0.95], [0.3, 1.03], [0.75, 0.86], [1, 0.5]],
    plates: l.plates && [Math.max(1, Math.round(l.plates[0] * 0.5)), l.plates[1] * 0.5],
    head: l.head && { ...l.head, len: Math.max(l.head.len, 0.42), wide: Math.max(1.1, l.head.wide * 0.95) },
    built: l.built.map((q) => ({ ...q, n: fewer(q.n) })),
  };
  return key;
}

/** One smooth outline around the whole body, from its width curve: the cheap way, about 40 points and no facets. */
function hull(b: Body, k = 1, dx = 0, dy = 0): number[] {
  const L = b.L, m = 12, out: number[] = [], put = (p: P3) => out.push(p[0] + dx, p[1] + dy);
  for (let i = 0; i <= m; i++) { const f = i / m; put(b.P(f * L, b.w(f) * b.swell(f) * k)); }
  const t = b.w(1) * k; for (let a = 1; a < 4; a++) { const u = (a / 4) * Math.PI; put(b.P(L + t * 0.85 * Math.sin(u), t * Math.cos(u))); }
  for (let i = m; i >= 0; i--) { const f = i / m; put(b.P(f * L, -b.w(f) * b.swell(f) * k)); }
  const h = b.w(0) * k; for (let a = 1; a < 5; a++) { const u = (a / 5) * Math.PI; put(b.P(-h * 0.9 * Math.sin(u), -h * Math.cos(u))); }
  return out;
}

export interface Soft { line: number; edge?: number; big: number; pixel?: number; sheen: boolean }

/** The face. On top of the head, so that a top-down animal still looks at you. */
function face(b: Body, g: Graphics, o: Soft) {
  const along = b.headLen() * (o.big > 1 ? 0.5 : 0.42), W = b.w(along / b.L), blink = (b.time() % 3.7) < 0.13;
  for (const side of [-1, 1]) {
    const [x, y] = b.P(along, side * W * 0.56);
    if (o.pixel) { // pixels: a dark block with one bright pixel. This is most of what makes a small sprite cute.
      const p = 1 / o.pixel, n = (o.big > 1 ? 3 : 2) * p, sx = Math.round(x * o.pixel) * p, sy = Math.round(y * o.pixel) * p;
      if (blink) { g.rect(sx, sy, n, p).fill(PAL.ink); continue; }
      g.rect(sx, sy, n, n).fill(PAL.ink);
      g.rect(sx, sy, p, p).fill(0xffffff);
      continue;
    }
    const r = Math.max(1.2, (1.1 + 0.11 * b.R) * o.big), a = b.heading;
    if (o.big > 1) { const [cx, cy] = b.P(along + r * 1.1, side * W * 0.86); g.circle(cx, cy, r * 0.6).fill({ color: 0xff8a7a, alpha: 0.45 }); }
    if (blink) { g.moveTo(x - r, y).lineTo(x + r, y).stroke({ width: 0.8, color: PAL.ink }); continue; }
    g.circle(x, y, r + 0.5).fill(PAL.ink); g.circle(x, y, r).fill(0xfffdf4);
    g.circle(x + Math.cos(a) * r * 0.28, y + Math.sin(a) * r * 0.28, r * 0.62).fill(PAL.ink);
    g.circle(x - r * 0.18, y - r * 0.28, r * 0.24).fill(0xffffff);
  }
}

/** One draw path for soft shapes: a smooth hull, three flat tones, seams as curves, parts in flat colour. */
export function softBody(b: Body, g: StylePen, sh: Graphics, o: Soft) {
  b.segs();
  const r = b.ramp, edge = o.edge ?? darkOf(r), lin = b.lin, was = LIGHT.k, any = b as any;
  LIGHT.k = 1.2; g.map = (c) => (c === PAL.ink ? edge : c);
  any.shadow(sh);
  const parts = (over: boolean) => { for (const a of b.anchors) if (a.part !== 'eye' && drawnOver(a) === over) DRAW[a.part](b, g, a, r); };
  parts(false);
  if (lin.head?.antennae) any.antennae(g, r);
  const base = g.poly(hull(b)).fill(r[1]);
  if (o.line) base.stroke({ width: o.line, color: edge, join: 'round' });
  const R = b.R;
  g.poly(hull(b, 0.76, -R * 0.1, -R * 0.14)).fill(r[2]);
  const n = lin.skin === 'bead' ? b.segs().length : spanAt(lin.plates, b.size, 4);
  for (let k = 1; k < n; k++) {
    const f = k / n, a = b.P(f * b.L, b.w(f) * 0.96), c = b.P(f * b.L + R * 0.26, 0), e = b.P(f * b.L, -b.w(f) * 0.96);
    g.moveTo(a[0], a[1]).quadraticCurveTo(c[0], c[1], e[0], e[1]).stroke({ width: o.pixel ? 1.3 : 0.7, color: o.pixel ? r[1] : r[0], alpha: o.pixel ? 1 : 0.5 });
  }
  if (lin.head) {
    const h = lin.head, pts: number[] = [], len = b.L * h.len, W = R * h.wide, t = h.pale ? mixRamp(r, PAL.pale[3], h.pale) : r;
    for (let k = 0; k <= 10; k++) { const u = -Math.PI / 2 + (k / 10) * Math.PI, p = b.P(len * (1 - Math.cos(u)) * 0.95, Math.sin(u) * W); pts.push(p[0], p[1]); }
    const s = g.poly(pts).fill(t[2]);
    if (o.line) s.stroke({ width: o.line * 0.8, color: edge, join: 'round' });
  }
  if (o.sheen) { const m = b.P(b.headLen() * 0.9, 0); g.ellipse(m[0] - R * 0.3, m[1] - R * 0.42, R * 0.34, R * 0.2).fill({ color: r[4], alpha: 0.75 }); }
  parts(true);
  g.map = null; // the face keeps its own colours
  face(b, g, o);
  LIGHT.k = was; g.map = null;
}

/** Continuous light rather than five steps, on a much finer skin. */
const SUN = (() => { const v = [-0.45, -0.62, 0.64], n = Math.hypot(...v); return v.map((a) => a / n); })();
function litTone(r: Ramp, a: P3, b: P3, c: P3, bias: number) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1; if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
  const v = Math.max(0.9, Math.min(3.999, 2.1 + ((nx * SUN[0] + ny * SUN[1] + nz * SUN[2]) / len - SUN[2]) * 2.6 + bias)), i = Math.floor(v);
  return mixC(r[i], r[i + 1], v - i);
}
export function fineBody(b: Body, g: StylePen, sh: Graphics) {
  b.segs();
  const r = b.ramp, lin = b.lin, any = b as any, L = b.L, edge = darkOf(r), was = LIGHT.k, rows = 20, st = 4, z0 = (lin.ridge ?? 3 + b.R * 0.5) * 1.15;
  LIGHT.k = 3.4; g.map = (c) => (c === PAL.ink ? edge : c);
  any.shadow(sh);
  const parts = (over: boolean) => { for (const a of b.anchors) if (drawnOver(a) === over) DRAW[a.part](b, g, a, r); };
  parts(false);
  if (lin.head?.antennae) any.antennae(g, r);
  g.poly(hull(b, 1)).fill(edge).stroke({ width: 0.8, color: edge });
  const count = lin.skin === 'bead' ? b.segs().length : spanAt(lin.plates, b.size, 6);
  const at = (i: number, j: number): P3 => {
    // the skin runs past both ends of the spine and closes as a round cap, the same shape as the hull under it
    const capF = b.w(0) * 0.9, capT = b.w(1) * 0.85, along = -capF + (i / rows) * (L + capF + capT), f = Math.max(0, Math.min(1, along / L)), t = j / st;
    const cap = along < 0 ? Math.sqrt(Math.max(0, 1 - (along / capF) ** 2)) : along > L ? Math.sqrt(Math.max(0, 1 - ((along - L) / capT) ** 2)) : 1;
    const band = Math.abs(Math.sin(f * count * Math.PI)), bulge = lin.skin === 'bead' ? 0.88 + 0.14 * band : 1, w = b.w(f) * b.swell(f) * bulge * cap;
    return b.P(along, t * w, 0.5 + z0 * cap * Math.sqrt(1 - Math.abs(t) ** 2.2) * (lin.skin === 'bead' ? 0.75 + 0.25 * band : 0.9 + 0.1 * band));
  };
  for (let i = 0; i < rows; i++) for (let j = -st; j < st; j++) {
    const a = at(i, j), c = at(i + 1, j), d = at(i + 1, j + 1), e = at(i, j + 1);
    g.poly([a[0], a[1], c[0], c[1], d[0], d[1]]).fill(litTone(r, a, c, d, 0));
    g.poly([a[0], a[1], d[0], d[1], e[0], e[1]]).fill(litTone(r, a, d, e, 0.12));
  }
  if (lin.head) { // the shield as a finer dome
    const h = lin.head, len = L * h.len, W = b.R * h.wide, tint = h.pale ? mixRamp(r, PAL.pale[3], h.pale) : r, at2 = (k: number, q: number): P3 => { const u = -Math.PI / 2 + (k / 12) * Math.PI, c = b.P(len * 0.45, 0); const e = b.P(len * (1 - Math.cos(u)) * 0.95, Math.sin(u) * W); return [c[0] + (e[0] - c[0]) * q, c[1] + (e[1] - c[1]) * q, 0.5 + z0 * 0.7 * (1 - q * q)]; };
    const rim: number[] = []; for (let k = 0; k <= 12; k++) { const e = at2(k, 1.06); rim.push(e[0], e[1]); }
    g.poly(rim).fill(edge);
    for (let k = 0; k < 12; k++) for (let m = 0; m < 3; m++) {
      const a = at2(k, m / 3), c = at2(k, (m + 1) / 3), d = at2(k + 1, (m + 1) / 3), e = at2(k + 1, m / 3);
      g.poly([a[0], a[1], c[0], c[1], d[0], d[1]]).fill(litTone(tint, a, c, d, 0.1));
      if (m) g.poly([a[0], a[1], d[0], d[1], e[0], e[1]]).fill(litTone(tint, a, d, e, 0.2));
    }
  }
  parts(true);
  LIGHT.k = was; g.map = null;
}

/** A warmer ramp: shadows lean purple, lights lean yellow, as pixel artists shift hue instead of adding black. */
export const cozy = (r: Ramp): Ramp => [mixC(r[0], 0x2b1d3f, 0.45), mixC(r[1], 0x47305e, 0.22), r[2], mixC(r[3], 0xfff0a8, 0.15), mixC(r[4], 0xfff6cf, 0.35)];
/** Ink and a thin wash on paper. */
export const washOf = (paper: number) => (c: number) => (c === PAL.ink ? 0x2c2014 : mixC(paper, mixC(c, 0x8a6f4a, 0.45), 0.62));

const VERT = `in vec2 aPosition; out vec2 vTextureCoord; uniform vec4 uInputSize; uniform vec4 uOutputFrame; uniform vec4 uOutputTexture;
void main(void) { vec2 p = aPosition * uOutputFrame.zw + uOutputFrame.xy; p.x = p.x * (2.0 / uOutputTexture.x) - 1.0; p.y = p.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z; gl_Position = vec4(p, 0.0, 1.0); vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw); }`;
const FRAG = `precision highp float; in vec2 vTextureCoord; out vec4 finalColor; uniform sampler2D uTexture; uniform vec4 uInputSize;
void main(void) { vec4 c = texture(uTexture, vTextureCoord); vec2 s = uInputSize.zw;
  if (c.a >= 0.5) { finalColor = vec4(c.rgb / c.a, 1.0); return; }
  vec4 n = texture(uTexture, vTextureCoord + vec2(s.x, 0.0)), e = texture(uTexture, vTextureCoord - vec2(s.x, 0.0)), o = texture(uTexture, vTextureCoord + vec2(0.0, s.y)), w = texture(uTexture, vTextureCoord - vec2(0.0, s.y));
  vec4 best = n; if (e.a > best.a) best = e; if (o.a > best.a) best = o; if (w.a > best.a) best = w;
  if (best.a < 0.5) { finalColor = vec4(0.0); return; }
  finalColor = vec4(mix(best.rgb / best.a * 0.32, vec3(0.13, 0.08, 0.17), 0.45), 1.0); }`;
/** One clean pixel of outline around whatever is drawn, in a dark of the colour next to it. */
export const outlineFilter = () => new Filter({ glProgram: GlProgram.from({ vertex: `#version 300 es\n${VERT}`, fragment: `#version 300 es\n${FRAG}`, name: 'pixel-outline' }), resources: {}, padding: 2, resolution: 1, antialias: 'off' });

export { C };
