// Toy 18: the parts. Each is one function that draws in the body's space, sized by the body, so that it fits any base with
// that slot kind and every size. Each one adds to the outline: all of them stick out of the body somewhere. The map's
// reduced form is here too: a body blob and one signature mark.
import type { Graphics } from 'pixi.js';
import { PAL, dome, flat, mixRamp, ring, tri, type P3, type Ramp } from '../game/src/view/shade';
import type { PartId, SlotKind } from './creature-data';
import type { Body } from './creature-body';

export interface Anchor { part: PartId; kind: SlotKind; f: number; side: number; k: number; style?: string; i: number; fused: boolean }
type Draw = (b: Body, g: Graphics, a: Anchor, ramp: Ramp) => void;

const xy = (p: P3[]) => p.flatMap(([x, y]) => [x, y]);
const ink = (g: Graphics, p: P3[], grow = 0.9) => {
  const cx = p.reduce((s, q) => s + q[0], 0) / p.length, cy = p.reduce((s, q) => s + q[1], 0) / p.length;
  flat(g, p.map(([x, y]) => [x, y]), PAL.ink, 1, grow, cx, cy);
};
const line = (g: Graphics, p: P3[], width: number, color: number) => {
  g.moveTo(p[0][0], p[0][1]);
  for (let k = 1; k < p.length; k++) g.lineTo(p[k][0], p[k][1]);
  g.stroke({ width, color });
};
/** Parts that sit on top of the body rather than under it. */
export const drawnOver = (a: Anchor) => a.part === 'plate' || a.part === 'enrol' || (a.part === 'eye' && a.style === 'dot') || (a.part === 'spine' && a.kind === 'back');

export const DRAW: Record<PartId, Draw> = {
  leg(b, g, a, ramp) {
    const L = b.L, u = b.u() * a.k, f = a.f, s = a.side, w = b.w(f), sw = b.limb(f, s) * u * (0.25 + 0.5 * b.moving.v), dark = mixRamp(ramp, PAL.ink, 0.3);
    if (a.style === 'stub') { // a soft stump with a foot
      const hip = b.P(f * L, s * w * 0.7, 1), foot = b.P(f * L + sw, s * (w + u * 0.9), 0);
      line(g, [hip, foot], 3, PAL.ink); line(g, [hip, foot], 1.8, ramp[2]);
      g.rect(foot[0] - 0.8, foot[1] - 0.8, 1.6, 1.6).fill(ramp[0]);
      return;
    }
    const hip = b.P(f * L, s * w * 0.8, 1), knee = b.P(f * L - u * 0.2 + sw * 0.5, s * (w + u * 0.75), 2), foot = b.P(f * L + u * 0.35 + sw, s * (w + u * 1.45), 0);
    const walk = a.style === 'walk';
    line(g, [hip, knee, foot], walk ? 1.6 : 2.6, PAL.ink);
    line(g, [hip, knee, foot], walk ? 0.8 : 1.4, walk ? dark[3] : ramp[3]);
  },

  claw(b, g, a, ramp) {
    if (a.style === 'arm') return arm(b, g, ramp);
    // an arm, a fat palm and two fingers with a gap: it must read as a pincer at board size
    const s = (b.u() / 4.5) * a.k, W = Math.max(b.w(0.08) * 0.92, b.u() * 0.8), out = (1 + b.reach.v * 2.5) * s, open = (0.5 + b.reach.v * 0.9) * s, tone = a.fused ? ramp : mixRamp(ramp, PAL.pale[3], 0.12);
    for (const side of [-1, 1]) {
      const at = (along: number, across: number, z = 2): P3 => b.P(-out - along * s, side * (W + across * s), z);
      const root0 = b.P(1.5, side * W * 0.55, 1), root1 = b.P(1.5, side * W * 0.98, 1), wrist0 = at(0.6, -1.3), wrist1 = at(0.2, 1.1);
      const palm0 = at(3.4, -1.9), palm1 = at(3, 2), notch = at(4.2, 0.1), tip0 = at(6.8, -1.6 - open, 1.5), tip1 = at(6.2, 1.5 + open, 1.5);
      ink(g, [root0, wrist0, palm0, tip0, notch, tip1, palm1, wrist1, root1], 1.1);
      tri(g, root0, wrist0, wrist1, tone, 0.1); tri(g, root0, wrist1, root1, tone, -0.2);
      tri(g, wrist0, palm0, palm1, tone, 0.6); tri(g, wrist0, palm1, wrist1, tone, 0.2);
      tri(g, palm0, tip0, notch, tone, 0.7); tri(g, palm1, notch, tip1, mixRamp(tone, PAL.pale[3], 0.3), 0.3); tri(g, palm0, notch, palm1, tone, 0.4);
    }
  },

  eye(b, g, a) {
    const along = b.headLen() * 0.42, W = b.w(along / b.L), u = b.u();
    if (a.style === 'dot') {
      for (const side of [-1, 1]) { const [x, y] = b.P(along, side * W * 0.55); g.rect(x - 0.7, y - 0.7, 1.4, 1.4).fill(PAL.ink); }
      return;
    }
    const long = a.style === 'stalk' ? 1.7 : 1, er = Math.max(1, u * 0.25) * a.k;
    for (const side of [-1, 1]) {
      const e = b.P(along * 0.7, side * (W + u * long), 3), b1 = b.P(along * 0.45, side * W * 0.9, 2), b2 = b.P(along * 0.9, side * W * 0.9, 2);
      g.poly(xy([b1, e, b2])).fill(PAL.ink);
      g.circle(e[0], e[1], er + 0.9).fill(PAL.ink);
      g.circle(e[0], e[1], er).fill(PAL.gold);
      g.rect(e[0] - 0.6, e[1] - 0.6, 1, 1).fill(0xffffff);
    }
  },

  spine(b, g, a) {
    const L = b.L, u = b.u() * a.k, pale = PAL.pale;
    if (a.kind === 'tail') {
      for (const side of [-1, 1]) {
        const b0 = b.P(L * 0.9, side * b.w(0.9) * 0.1, 1), b1 = b.P(L * 0.92, side * b.w(0.9), 1), tip = b.P(L + u * 2, side * (b.w(1) + u * 0.8), 1);
        g.poly(xy([b0, tip, b1])).fill(PAL.ink); tri(g, b0, tip, b1, pale, 0.4);
      }
      return;
    }
    if (a.kind === 'back') { // a pair standing on the back and splayed outward
      const w = b.w(a.f);
      for (const side of [-1, 1]) {
        const d = u * 0.32, b0 = b.P(a.f * L - d, side * w * 0.25, 3), b1 = b.P(a.f * L + d, side * w * 0.25, 3), tip = b.P(a.f * L + u * 0.7, side * (w + u * 1.25), 5);
        ink(g, [b0, tip, b1], 0.8); tri(g, b0, tip, b1, pale, 0.5);
      }
      return;
    }
    const f = a.f, s = a.side, w = b.w(f), row = a.style === 'row', d = row ? u * 0.34 : u * 0.42;
    const swing = b.limb(f, s) * u * 0.08, b0 = b.P(f * L - d, s * w * 0.6, 1), b1 = b.P(f * L + d, s * w * 0.6, 1), tip = b.P(f * L + u * (row ? 0.5 : 0.9) + swing, s * (w + u * (row ? 1.05 : 1.35)), 1);
    ink(g, [b0, tip, b1], 0.8); tri(g, b0, tip, b1, pale, 0.4);
  },

  plate(b, g, a, ramp) {
    const L = b.L, u = b.u() * a.k, f = a.f, d = Math.max(u * 0.55, L * 0.065), w = b.w(f), z = (b.lin.ridge ?? 3) + 2;
    const tone = a.fused ? mixRamp(ramp, PAL.pale[3], 0.2) : mixRamp(ramp, PAL.pale[3], 0.5), reach = u * 0.62;
    const top0 = b.P(f * L - d, 0, z), top1 = b.P(f * L + d, 0, z);
    for (const side of [-1, 1]) {
      const e0 = b.P(f * L - d, side * (w + reach * 0.15), 0.5), e1 = b.P(f * L + d * 1.35, side * (w + reach), 0.5);
      ink(g, [top0, e0, e1, top1], 0.9);
    }
    for (const side of [-1, 1]) {
      const e0 = b.P(f * L - d, side * (w + reach * 0.15), 0.5), e1 = b.P(f * L + d * 1.35, side * (w + reach), 0.5);
      tri(g, top0, e0, e1, tone, 0.2); tri(g, top0, e1, top1, tone, 0.2);
    }
  },

  gill(b, g, a) {
    const L = b.L, u = b.u() * a.k, f = a.f, s = a.side, w = b.w(f), sway = b.limb(f, s) * u * 0.12;
    for (let k = 0; k < 3; k++) {
      const ff = f * L - u * 0.5 + k * u * 0.5, o = b.P(ff, s * w * 0.8, 1), e = b.P(ff + u * 0.45 + sway, s * (w + u * 1.05), 0), r = b.P(ff + u * 0.28, s * w, 1);
      tri(g, o, e, r, PAL.gill, 0.5 - k * 0.3);
    }
  },

  bristles(b, g, a) {
    const L = b.L, u = b.u() * a.k, f = a.f, s = a.side, w = b.w(f), tuft = a.style === 'tuft';
    for (let k = -1; k <= 1; k++) {
      const swing = b.limb(f, s) * u * 0.18, o = b.P(f * L + k * u * 0.25, s * w * 0.7, 1), tip = b.P(f * L + k * u * 0.6 + swing, s * (w + u * (k === 0 ? 1.5 : 1.15)), 0), o2 = b.P(f * L + k * u * 0.25 + 0.8, s * w * 0.7, 1);
      g.poly(xy([o, tip, o2])).fill(tuft ? PAL.pale[2] : PAL.pale[3]);
    }
  },

  tentacles(b, g, a) {
    const palp = a.style === 'palp', u = b.u() * a.k, r = b.w(0), n = palp ? 2 : 4, t = b.time();
    for (let k = 0; k < n; k++) {
      const o = -1 + (2 * k) / (n - 1), c = b.P(-r * 0.2, o * r * 0.7), w = Math.sin(t * 4 + k * 1.7) * u * 0.25;
      const m = b.P(-u * 1.05, o * (r * 0.9 + u * 0.4) + w * 0.5), e = b.P(-u * (palp ? 1.7 : 2.2), o * (r + u * 0.9) + w, 0);
      line(g, [c, m, e], 2, PAL.ink); line(g, [c, m, e], 1.1, PAL.flesh[3]);
    }
  },

  flap(b, g, a, ramp) {
    const L = b.L, u = b.u() * a.k, f = a.f, s = a.side, w = b.w(f) * 0.72, ph = b.limb(f, s), wave = ph * 0.35 * u * 0.3, d = Math.max(u * 0.34, L * 0.036);
    const len = u * 1.5 * (1 - Math.abs(f - 0.45) * 0.55), tone = mixRamp(ramp, PAL.ember, 0.25), z = 2 + ph * 3;
    const b1 = b.P(f * L - d, s * w, 3), b2 = b.P(f * L + d, s * w, 3), o1 = b.P(f * L - d * 0.4 - wave, s * (w + len * 0.92), z), o2 = b.P(f * L + d * 1.7 - wave, s * (w + len * 0.8), z - 0.5);
    g.poly(xy([b1, o1, o2, b2])).fill(PAL.ink);
    const bias = a.i % 2 ? -0.3 : 0.25;
    tri(g, b1, o1, o2, tone, bias); tri(g, b1, o2, b2, tone, bias - 0.2);
  },

  fan(b, g, a, ramp) {
    const L = b.L, u = b.u() * a.k, t = b.time(), tone = mixRamp(ramp, PAL.ember, 0.2), stub = a.style === 'stub';
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
      const ang = side * (0.3 + k * 0.38), len = u * (stub ? 1.9 : 1.75) * (1 - k * 0.12), sw = Math.sin(t * 3 + k) * 0.08;
      const b0 = b.P(L * 0.97, side * b.w(1) * 0.2, 3), b1 = b.P(L * 0.98, side * Math.max(b.w(1), 1.6), 3), tip = b.P(L + Math.cos(ang + sw) * len, Math.sin(ang + sw) * len, 1);
      g.poly(xy([b0, tip, b1])).fill(PAL.ink);
      tri(g, b0, b1, tip, tone, 0.3 - k * 0.3);
    }
  },

  enrol(b, g, a, ramp) {
    const L = b.L, from = 0.84, plain = a.style === 'plain', W = Math.max(b.w(from) * 1.08, b.u() * 0.9) * a.k, back = L * (1 - from) + b.u() * (plain ? 0.25 : 0.75) * a.k, pts: P3[] = [];
    for (let k = 0; k <= 6; k++) { const ang = -Math.PI / 2 + (k / 6) * Math.PI; pts.push(b.P(from * L + Math.cos(ang) * back, Math.sin(ang) * W, 0.5)); }
    ink(g, pts, 1);
    const top = b.P(from * L, 0, 3.5), tone = plain ? ramp : mixRamp(ramp, PAL.pale[3], a.fused ? 0.12 : 0.3);
    for (let k = 0; k < pts.length - 1; k++) tri(g, top, pts[k], pts[k + 1], tone, 0.3);
    for (const q of [0.35, 0.68]) { // the rib lines it folds along
      const m0 = b.P(from * L + back * q, -W * 0.72 * (1 - q * 0.4), 1), m1 = b.P(from * L + back * q, W * 0.72 * (1 - q * 0.4), 1);
      g.moveTo(m0[0], m0[1]).lineTo(m1[0], m1[1]).stroke({ width: plain ? 0.7 : 0.9, color: plain ? PAL.ink : PAL.gold, alpha: plain ? 0.7 : 0.85 });
    }
  },
};

/** Anomalocaris' grasping arms: segments that curl inward. A style of the claw. */
function arm(b: Body, g: Graphics, ramp: Ramp) {
  const s = b.R / 4.6, tone = mixRamp(ramp, PAL.ember, 0.25), grab = b.reach.v;
  for (const side of [-1, 1]) {
    let lx = 0, ly = side * 1.8 * s, ang = side * 0.2;
    const curl = (0.5 - 0.44 * grab) * -side, seg = (2.9 + grab * 1.8) * s;
    for (let k = 0; k < 6; k++) {
      const nx = lx + Math.cos(ang) * seg, ny = ly + Math.sin(ang) * seg, w = (1.6 - k * 0.16) * s, px = -Math.sin(ang) * w, py = Math.cos(ang) * w;
      const q = [b.P(-lx - px, ly + py, 4), b.P(-lx + px, ly - py, 4), b.P(-nx + px * 0.8, ny - py * 0.8, 4), b.P(-nx - px * 0.8, ny + py * 0.8, 4)];
      g.poly(xy(q)).fill(PAL.ink);
      tri(g, q[0], q[1], q[2], tone, 0.8); tri(g, q[0], q[2], q[3], tone, 0.8);
      const sb = b.P(-nx, ny, 4), sp = b.P(-nx - Math.cos(ang - side * 1.3) * 2.6 * s, ny + Math.sin(ang - side * 1.3) * 2.6 * s, 4);
      g.poly([sb[0] - 0.5, sb[1] - 0.5, sp[0], sp[1], sb[0] + 0.5, sb[1] + 0.5]).fill(PAL.pale[4]);
      lx = nx; ly = ny; ang += curl;
    }
  }
}

/** The signature mark at map size: one bold shape for each part, in its accent colour. */
const MARK: Record<PartId, (g: Graphics, l: number, w: number) => void> = {
  claw: (g, l, w) => { for (const s of [-1, 1]) g.poly([l * 0.7, s * w * 0.3, l * 1.6, s * w * 1.1, l * 1.3, s * w * 0.1]).fill(PAL.pale[4]); },
  tentacles: (g, l, w) => { for (const s of [-1, 0, 1]) g.rect(l * 0.8, s * w * 0.75 - 0.5, l * 0.7, 1).fill(PAL.flesh[3]); },
  eye: (g, l, w) => { for (const s of [-1, 1]) g.rect(l * 0.35, s * (w + 0.5) - 1, 2, 2).fill(PAL.gold); },
  leg: (g, l, w) => { for (const f of [-0.5, 0.1, 0.6]) for (const s of [-1, 1]) g.rect(f * l - 0.5, s > 0 ? w : -w - 2, 1, 2).fill(PAL.pale[1]); },
  gill: (g, l, w) => { for (const s of [-1, 1]) g.rect(-l * 0.4, s > 0 ? w : -w - 2, l * 0.8, 2).fill(PAL.gill[3]); },
  bristles: (g, l, w) => { for (const f of [-0.6, -0.2, 0.2, 0.6]) for (const s of [-1, 1]) g.rect(f * l - 0.5, s > 0 ? w : -w - 1.5, 1, 1.5).fill(PAL.pale[4]); },
  flap: (g, l, w) => { for (const s of [-1, 1]) g.poly([l * 0.5, s * w, -l * 0.7, s * w, -l * 0.4, s * (w + 2.5), l * 0.3, s * (w + 2.5)]).fill(PAL.ember); },
  spine: (g, l, w) => { for (const f of [-0.45, 0.25]) for (const s of [-1, 1]) g.poly([f * l - 1, s * w * 0.8, f * l + 1, s * w * 0.8, f * l - 1, s * (w + 2.5)]).fill(PAL.pale[4]); },
  plate: (g, l, w) => { for (const f of [-0.5, 0, 0.5]) g.rect(f * l - 0.6, -w, 1.2, w * 2).fill(PAL.pale[3]); },
  fan: (g, l, w) => { g.poly([-l * 0.8, 0, -l * 1.5, w * 1.1, -l * 1.5, -w * 1.1]).fill(PAL.ember); },
  enrol: (g, l, w) => { g.poly([-l * 0.6, -w, -l * 0.6, w, -l * 1.25, w * 0.5, -l * 1.25, -w * 0.5]).fill(PAL.gold); },
};

/** A creature at map size: a body blob, one signature part. Not the doll scaled down (R6's checklist). */
export function drawMapForm(g: Graphics, b: Body, sig: PartId, x: number, y: number, heading: number, unit = 1) {
  const l = Math.max(3.2, Math.min(7, 2.4 + b.L * 0.11)) * unit, w = Math.max(1.5, Math.min(4.2, 1 + b.R * 0.28)) * unit;
  const cos = Math.cos(heading), sin = Math.sin(heading);
  flat(g, ring(x, y, l + 1, w + 1, 6, heading), PAL.ink);
  dome(g, ring(x, y, l, w, 6, heading), x - 0.5, y - 0.5, Math.max(1, w * 0.6), b.ramp, 0.2);
  g.setTransform(cos, sin, -sin, cos, x, y);
  MARK[sig](g, l, w);
  g.setTransform(1, 0, 0, 1, 0, 0);
}
