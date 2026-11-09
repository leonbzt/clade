// Slice 20B: the six places, painted. Ported from toys/creature-parts.ts and the old per-body views. One function per
// place draws what that place holds, under the body or over it; size sets how many appendages are drawn, never the
// bonus. An empty place may draw the body's bare shape (dot eyes, a tail plate); a lost locked row draws stumps.
import type { Graphics } from 'pixi.js';
import { spanAt } from '../data/body-look';
import type { PlaceId } from '../data/body';
import type { PartId } from '../data/life';
import { PAL, dome, flat, mixRamp, ring, tri, type P3, type Ramp } from './shade';
import type { Body } from './body';

type Paint = (b: Body, g: Graphics, row: PartId[], ramp: Ramp, over: boolean) => void;
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
/** Evenly spread positions along a span, for `n` copies. */
const spread = (n: number, [a, c]: [number, number]) => Array.from({ length: n }, (_, i) => (n === 1 ? (a + c) / 2 : a + ((c - a) * i) / (n - 1)));
const PINK = 0xf59be0, SULFUR = [0x6a5a10, 0x9a8418, 0xc8b02a, 0xe8d44a, 0xfff08a];

export function paintPlace(b: Body, g: Graphics, place: PlaceId, ramp: Ramp, over: boolean) {
  const row = b.row(place);
  if (!row.length && b.lost(place)) { if (!over && place === 'limbs') stumps(b, g); return; }
  PAINT[place](b, g, row, ramp, over);
}

// ---- Front: one tool ahead of the head ----
const front: Paint = (b, g, row, ramp, over) => {
  const p = row[0];
  if (!p || over !== (p === 'proboscis' || p === 'hook')) return;
  if (p === 'claw') claw(b, g, ramp);
  else if (p === 'rake') frontRakes(b, g, ramp);
  else if (p === 'tentacles') tentacles(b, g);
  else if (p === 'proboscis' || p === 'hook') proboscis(b, g, p === 'hook');
  else if (p === 'arms' || p === 'spikes') arms(b, g, ramp, p === 'spikes');
};

function claw(b: Body, g: Graphics, ramp: Ramp) { // an arm, a fat palm and two fingers with a gap: a pincer at board size
  const s = b.u() / 4.5, W = Math.max(b.w(0.08) * 0.92, b.u() * 0.8), out = (1 + b.reach.v * 2.5) * s, open = (0.5 + b.reach.v * 0.9) * s, tone = mixRamp(ramp, PAL.pale[3], 0.12);
  for (const side of [-1, 1]) {
    const at = (along: number, across: number, z = 2): P3 => b.P(-out - along * s, side * (W + across * s), z);
    const root0 = b.P(1.5, side * W * 0.55, 1), root1 = b.P(1.5, side * W * 0.98, 1), wrist0 = at(0.6, -1.3), wrist1 = at(0.2, 1.1);
    const palm0 = at(3.4, -1.9), palm1 = at(3, 2), notch = at(4.2, 0.1), tip0 = at(6.8, -1.6 - open, 1.5), tip1 = at(6.2, 1.5 + open, 1.5);
    ink(g, [root0, wrist0, palm0, tip0, notch, tip1, palm1, wrist1, root1], 1.1);
    tri(g, root0, wrist0, wrist1, tone, 0.1); tri(g, root0, wrist1, root1, tone, -0.2);
    tri(g, wrist0, palm0, palm1, tone, 0.6); tri(g, wrist0, palm1, wrist1, tone, 0.2);
    tri(g, palm0, tip0, notch, tone, 0.7); tri(g, palm1, notch, tip1, mixRamp(tone, PAL.pale[3], 0.3), 0.3); tri(g, palm0, notch, palm1, tone, 0.4);
  }
}

function frontRakes(b: Body, g: Graphics, ramp: Ramp) { // two combs swept ahead of the head
  const u = b.u(), W = b.w(0.05), sw = Math.sin(b.time() * 5) * u * 0.15, dark = mixRamp(ramp, PAL.ink, 0.3);
  for (const side of [-1, 1]) {
    const base = b.P(1, side * W * 0.6, 1), tip = b.P(-u * 1.7 + sw, side * (W + u * 0.5), 1);
    line(g, [base, tip], 1.9, PAL.ink); line(g, [base, tip], 0.9, dark[3]);
    for (let k = 1; k <= 4; k++) {
      const t = k / 4.5, q = b.P(1 + (-u * 1.7 + sw - 1) * t, side * (W * 0.6 + (W * 0.4 + u * 0.5) * t), 1), r = b.P(1 + (-u * 1.7 + sw - 1) * t - u * 0.2, side * (W * 0.6 + (W * 0.4 + u * 0.5) * t - u * 0.55), 1);
      line(g, [q, r], 0.8, PAL.pale[3]);
    }
  }
}

function tentacles(b: Body, g: Graphics) {
  const u = b.u(), r = b.w(0), t = b.time();
  for (let k = 0; k < 4; k++) {
    const o = -1 + (2 * k) / 3, c = b.P(-r * 0.2, o * r * 0.7), w = Math.sin(t * 4 + k * 1.7) * u * 0.25;
    const m = b.P(-u * 1.05, o * (r * 0.9 + u * 0.4) + w * 0.5), e = b.P(-u * 2.2, o * (r + u * 0.9) + w, 0);
    line(g, [c, m, e], 2, PAL.ink); line(g, [c, m, e], 1.1, PAL.flesh[3]);
  }
}

function proboscis(b: Body, g: Graphics, hook: boolean) {
  const r = b.w(0), len = b.u() * 0.9 + b.reach.v * 9, base0 = b.P(-r * 0.75, -r * 0.3, 1), base1 = b.P(-r * 0.75, r * 0.3, 1), tip = b.P(-r - len, 0, 2); // from the head's tip, not its middle
  ink(g, [base0, tip, base1], 1);
  tri(g, base0, tip, base1, PAL.flesh, 0.3);
  if (hook) for (const s of [-1, 1]) { const h0 = b.P(-r - len + 1, s * 0.8, 2), h1 = b.P(-r - len + 2.6, s * 2.6, 2); line(g, [h0, h1], 1.3, PAL.pale[4]); }
}

function arms(b: Body, g: Graphics, ramp: Ramp, spiny: boolean) { // segments that curl inward as it grabs
  const s = b.R / 4.6, tone = mixRamp(ramp, PAL.ember, 0.25), grab = b.reach.v;
  for (const side of [-1, 1]) {
    let lx = 0, ly = side * 1.8 * s, ang = side * 0.2;
    const curl = (0.5 - 0.44 * grab) * -side, seg = (2.9 + grab * 1.8) * s;
    for (let k = 0; k < 6; k++) {
      const nx = lx + Math.cos(ang) * seg, ny = ly + Math.sin(ang) * seg, w = (1.6 - k * 0.16) * s, px = -Math.sin(ang) * w, py = Math.cos(ang) * w;
      const q = [b.P(-lx - px, ly + py, 4), b.P(-lx + px, ly - py, 4), b.P(-nx + px * 0.8, ny - py * 0.8, 4), b.P(-nx - px * 0.8, ny + py * 0.8, 4)];
      g.poly(xy(q)).fill(PAL.ink);
      tri(g, q[0], q[1], q[2], tone, 0.8); tri(g, q[0], q[2], q[3], tone, 0.8);
      if (spiny) {
        const sb = b.P(-nx, ny, 4), sp = b.P(-nx - Math.cos(ang - side * 1.3) * 3 * s, ny + Math.sin(ang - side * 1.3) * 3 * s, 4);
        g.poly([sb[0] - 0.6, sb[1] - 0.6, sp[0], sp[1], sb[0] + 0.6, sb[1] + 0.6]).fill(PAL.pale[4]);
      }
      lx = nx; ly = ny; ang += curl;
    }
  }
}

// ---- Eyes ----
const eyes: Paint = (b, g, row, _ramp, over) => {
  const p = row[0], along = b.headLen() * (b.hd ? 0.42 : 0.35), W = b.w(along / b.L), u = b.u();
  if (!p) {
    if (over && b.look.bare.eyes) for (const side of [-1, 1]) { const [x, y] = b.P(along, side * W * 0.55); g.rect(x - 0.7, y - 0.7, 1.4, 1.4).fill(PAL.ink); }
    return;
  }
  if (p === 'lenses') { // stalked eyes, under the head
    if (over) return;
    for (const side of [-1, 1]) {
      const e = b.P(along * 0.7, side * (W + u * 1.7), 3), b1 = b.P(along * 0.45, side * W * 0.9, 2), b2 = b.P(along * 0.9, side * W * 0.9, 2), er = Math.max(1.2, u * 0.3);
      g.poly(xy([b1, e, b2])).fill(PAL.ink);
      g.circle(e[0], e[1], er + 0.9).fill(PAL.ink); g.circle(e[0], e[1], er).fill(PAL.gold);
      g.rect(e[0] - 0.6, e[1] - 0.6, 1, 1).fill(0xffffff);
    }
    return;
  }
  if (!over) return;
  for (const side of [-1, 1]) {
    const [x, y] = b.P(along, side * W * 0.55);
    if (p === 'compound') {
      const r = Math.max(1.9, u * 0.4);
      flat(g, ring(x, y, r + 0.8, r * 0.85 + 0.8, 6, b.heading), PAL.ink);
      dome(g, ring(x, y, r, r * 0.85, 6, b.heading), x - 0.4, y - 0.4, r * 0.6, PAL.amber, 0.6);
      g.rect(x - 1, y - 1, 1, 1).fill(0xffffff);
    } else { const r = Math.max(1.2, u * 0.26); g.rect(x - r, y - r, r * 2, r * 2).fill(PAL.ink); g.rect(x - r * 0.8, y - r * 0.8, r * 0.8, r * 0.8).fill(0xffffff); }
  }
};

// ---- Limbs: one row type, drawn as many pairs as the size gives ----
const limbs: Paint = (b, g, row, ramp, over) => {
  if (over || !row.length) return;
  const n = spanAt(b.look.limbs.n, b.size), fs = spread(n, b.look.limbs.f);
  if (row[0] === 'flap') { fs.forEach((f, i) => { for (const s of [-1, 1]) flap(b, g, f, s, i, ramp); }); return; }
  const tip = row[1]; // rake, digger or none
  for (const f of fs) for (const s of [-1, 1]) leg(b, g, f, s, ramp, tip);
};

function leg(b: Body, g: Graphics, f: number, s: number, ramp: Ramp, tip?: PartId) {
  const L = b.L, u = b.u() * b.look.limbs.k, w = b.w(f), sw = b.limb(f, s) * u * (0.25 + 0.5 * b.moving.v), dark = mixRamp(ramp, PAL.ink, 0.3);
  if (b.look.skin === 'bead') { // a soft stump with a foot
    const hip = b.P(f * L, s * w * 0.7, 1), foot = b.P(f * L + sw, s * (w + u * 0.9), 0);
    line(g, [hip, foot], 3, PAL.ink); line(g, [hip, foot], 1.8, ramp[2]);
    return;
  }
  const hip = b.P(f * L, s * w * 0.8, 1), knee = b.P(f * L - u * 0.2 + sw * 0.5, s * (w + u * 0.75), 2), foot = b.P(f * L + u * 0.35 + sw, s * (w + u * 1.45), 0);
  line(g, [hip, knee, foot], 1.6, PAL.ink); line(g, [hip, knee, foot], 0.8, dark[3]);
  if (tip === 'digger') { const pad = ring(foot[0], foot[1], 1.6, 1.1, 5, b.heading + 0.4 * s); flat(g, pad, PAL.ink, 1, 0.7, foot[0], foot[1]); flat(g, pad, PAL.pale[2]); }
  if (tip === 'rake') for (let k = 0; k < 3; k++) { const q = b.P(f * L + u * 0.35 + sw - k * 0.9, s * (w + u * 1.45), 0), r = b.P(f * L + u * 0.35 + sw - k * 0.9 - 1.6, s * (w + u * 1.45 + 0.9), 0); line(g, [q, r], 0.8, PAL.pale[3]); }
}

function flap(b: Body, g: Graphics, f: number, s: number, i: number, ramp: Ramp) {
  const L = b.L, u = b.u(), w = b.w(f) * 0.72, ph = b.limb(f, s), wave = ph * 0.35 * u * 0.3, d = Math.max(u * 0.34, L * 0.036);
  const len = u * 1.5 * (1 - Math.abs(f - 0.45) * 0.55), tone = mixRamp(ramp, PAL.ember, 0.25), z = 2 + ph * 3;
  const b1 = b.P(f * L - d, s * w, 3), b2 = b.P(f * L + d, s * w, 3), o1 = b.P(f * L - d * 0.4 - wave, s * (w + len * 0.92), z), o2 = b.P(f * L + d * 1.7 - wave, s * (w + len * 0.8), z - 0.5);
  g.poly(xy([b1, o1, o2, b2])).fill(PAL.ink);
  const bias = i % 2 ? -0.3 : 0.25;
  tri(g, b1, o1, o2, tone, bias); tri(g, b1, o2, b2, tone, bias - 0.2);
}

/** A lost locked row: short stumps where the limbs were. */
function stumps(b: Body, g: Graphics) {
  const n = spanAt(b.look.limbs.n, b.size), u = b.u() * 0.5;
  for (const f of spread(n, b.look.limbs.f)) for (const s of [-1, 1]) { const w = b.w(f), h = b.P(f * b.L, s * w * 0.8, 1), e = b.P(f * b.L, s * (w + u), 0); line(g, [h, e], 1.6, PAL.ink); }
}

// ---- Sides: a pair per spot, spots by size ----
const sides: Paint = (b, g, row, ramp, over) => {
  const p = row[0];
  if (!p) return;
  const fs = spread(spanAt(b.look.sides.n, b.size), b.look.sides.f);
  if (over) { if (p === 'sclerite') fs.forEach((f) => scales(b, g, f)); else inside(b, g, p, 0.55); return; }
  fs.forEach((f, i) => { for (const s of [-1, 1]) {
    if (p === 'spine') sideSpine(b, g, f, s);
    else if (p === 'gill') gill(b, g, f, s);
    else if (p === 'chaetae') bristles(b, g, f, s);
    else if (p === 'pouch') sac(b, g, b.P(f * b.L, s * (b.w(f) + 1.4)));
    else if (p === 'flap') flap(b, g, f, s, i, ramp);
  } });
  if (p === 'chaetae') for (const f of fs.map((f) => f + 0.12).filter((f) => f < 0.95)) for (const s of [-1, 1]) bristles(b, g, f, s);
  void ramp;
};

function sideSpine(b: Body, g: Graphics, f: number, s: number) {
  const L = b.L, u = b.u(), w = b.w(f), d = u * 0.42, swing = b.limb(f, s) * u * 0.08;
  const b0 = b.P(f * L - d, s * w * 0.6, 1), b1 = b.P(f * L + d, s * w * 0.6, 1), tip = b.P(f * L + u * 0.9 + swing, s * (w + u * 1.35), 1);
  ink(g, [b0, tip, b1], 0.8); tri(g, b0, tip, b1, PAL.pale, 0.4);
}
function gill(b: Body, g: Graphics, f: number, s: number) {
  const L = b.L, u = b.u(), w = b.w(f), sway = b.limb(f, s) * u * 0.12;
  for (let k = 0; k < 3; k++) {
    const ff = f * L - u * 0.5 + k * u * 0.5, o = b.P(ff, s * w * 0.8, 1), e = b.P(ff + u * 0.45 + sway, s * (w + u * 1.05), 0), r = b.P(ff + u * 0.28, s * w, 1);
    tri(g, o, e, r, PAL.gill, 0.5 - k * 0.3);
  }
}
function bristles(b: Body, g: Graphics, f: number, s: number) {
  const L = b.L, u = b.u() * 0.7, w = b.w(f);
  for (let k = -1; k <= 1; k++) {
    const swing = b.limb(f, s) * u * 0.18, o = b.P(f * L + k * u * 0.25, s * w * 0.7, 1), tip = b.P(f * L + k * u * 0.6 + swing, s * (w + u * (k === 0 ? 1.5 : 1.15)), 0), o2 = b.P(f * L + k * u * 0.25 + 0.8, s * w * 0.7, 1);
    g.poly(xy([o, tip, o2])).fill(PAL.pale[3]);
  }
}
function scales(b: Body, g: Graphics, f: number) {
  for (const s of [-1, 1]) for (const d of [-1.6, 1.6]) {
    const [x, y] = b.P(f * b.L + d, s * b.w(f) * 0.85);
    flat(g, ring(x, y, 1.9, 1.9, 4, b.heading + 0.78), PAL.ink);
    dome(g, ring(x, y, 1.3, 1.3, 4, b.heading + 0.78), x - 0.3, y - 0.3, 1, PAL.pale, 0.5);
  }
}
function sac(_b: Body, g: Graphics, [x, y]: P3) { for (const o of [-1.6, 1.6]) dome(g, ring(x + o * 0.5, y + o * 0.5, 1.9, 1.9, 5), x - 0.4, y - 0.4, 1.4, PAL.amber, 0.4); }
/** Physiology shows inside the body: a glow, a tint or a mark at `f`. */
function inside(b: Body, g: Graphics, p: PartId, f: number) {
  const [x, y] = b.P(f * b.L, 0), W = b.w(f);
  if (p === 'gut') dome(g, ring(x, y, b.L * 0.12, W * 0.38, 6, b.heading), x - 0.4, y - 0.4, 1.2, PAL.amber, 0.6, 0.8);
  else if (p === 'symbiont') for (const o of [-0.4, 0.4]) { const [sx, sy] = b.P((f + o * 0.2) * b.L, o * W * 0.6); dome(g, ring(sx, sy, W * 0.3, W * 0.25, 5), sx, sy, 1, SULFUR, 0.5, 0.85); }
  else if (p === 'progenesis') g.rect(x - 1.2, y - 1.2, 2.4, 2.4).fill(PINK);
  else if (p === 'blood') g.rect(x - 1.2, y - 1.2, 2.4, 2.4).fill(PAL.blue[3]);
}

// ---- Back: the head shield's own variants are drawn by the body; physiology along the middle ----
const back: Paint = (b, g, row, _ramp, over) => {
  const p = row[0];
  if (!p || p === 'shield' || !over) return;
  inside(b, g, p, 0.45);
};

// ---- Tail ----
const tail: Paint = (b, g, row, ramp, over) => {
  const p = row[0], L = b.L, u = b.u();
  if (!p) {
    const bare = b.look.bare.tail;
    if (bare === 'plate' && over) pygidium(b, g, ramp, false);
    if ((bare === 'stub' || bare === 'fan') && !over) fan(b, g, ramp, bare === 'stub' ? 0.55 : 0.7);
    return;
  }
  if (p === 'enrol') { if (over) pygidium(b, g, ramp, true); return; }
  if (p === 'sclerite' || p === 'progenesis') {
    if (!over) return;
    if (p === 'progenesis') { inside(b, g, p, 0.9); return; }
    for (const [d, s] of [[-u * 0.4, -0.75], [-u * 0.4, 0.75], [u * 0.3, 0]]) {
      const [x, y] = b.P(L + d, s * b.w(1) * 0.9);
      flat(g, ring(x, y, 1.9, 1.9, 4, b.heading + 0.78), PAL.ink); dome(g, ring(x, y, 1.3, 1.3, 4, b.heading + 0.78), x - 0.3, y - 0.3, 1, PAL.pale, 0.5);
    }
    return;
  }
  if (over) return;
  if (p === 'fan') fan(b, g, ramp, 1.1);
  else if (p === 'spine') for (const side of [-1, 1]) {
    const b0 = b.P(L * 0.9, side * b.w(0.9) * 0.1, 1), b1 = b.P(L * 0.92, side * b.w(0.9), 1), tip = b.P(L + u * 2, side * (b.w(1) + u * 0.8), 1);
    ink(g, [b0, tip, b1], 0.8); tri(g, b0, tip, b1, PAL.pale, 0.4);
  }
  else if (p === 'pouch') sac(b, g, b.P(L + u * 0.6, 0));
  else if (p === 'bulb' || p === 'deep') {
    const r = b.w(1) * (p === 'bulb' ? 1.25 : 1.1), [x, y] = b.P(L + r * 0.6, 0), tone = p === 'deep' ? mixRamp(ramp, PAL.mudDark[1], 0.55) : ramp;
    flat(g, ring(x, y, r * 1.1 + 1.2, r + 1.2, 6, b.heading), PAL.ink);
    dome(g, ring(x, y, r * 1.1, r, 6, b.heading), x - 0.4, y - 0.4, r * 0.8, tone, 0.3);
    if (p === 'deep') for (const s of [-1, 1]) { const q = b.P(L + r * 1.6, s * r * 0.5); g.rect(q[0] - 0.7, q[1] - 0.7, 1.4, 1.4).fill(PAL.mudDark[3]); }
  }
};

function fan(b: Body, g: Graphics, ramp: Ramp, k: number) {
  const L = b.L, u = b.u() * k, t = b.time(), tone = mixRamp(ramp, PAL.ember, 0.2);
  for (const side of [-1, 1]) for (let j = 0; j < 3; j++) {
    const ang = side * (0.3 + j * 0.38), len = u * 1.75 * (1 - j * 0.12), sw = Math.sin(t * 3 + j) * 0.08;
    const b0 = b.P(L * 0.97, side * b.w(1) * 0.2, 3), b1 = b.P(L * 0.98, side * Math.max(b.w(1), 1.6), 3), tip = b.P(L + Math.cos(ang + sw) * len, Math.sin(ang + sw) * len, 1);
    g.poly(xy([b0, tip, b1])).fill(PAL.ink);
    tri(g, b0, b1, tip, tone, 0.3 - j * 0.3);
  }
}

/** The tail shield; with enrolment, a jointed curl with gold rib lines. */
function pygidium(b: Body, g: Graphics, ramp: Ramp, curl: boolean) {
  const L = b.L, from = 0.84, W = Math.max(b.w(from) * 1.08, b.u() * 0.9), back = L * (1 - from) + b.u() * (curl ? 0.75 : 0.25), pts: P3[] = [];
  for (let k = 0; k <= 6; k++) { const ang = -Math.PI / 2 + (k / 6) * Math.PI; pts.push(b.P(from * L + Math.cos(ang) * back, Math.sin(ang) * W, 0.5)); }
  ink(g, pts, 1);
  const top = b.P(from * L, 0, 3.5), tone = curl ? mixRamp(ramp, PAL.pale[3], 0.3) : ramp;
  for (let k = 0; k < pts.length - 1; k++) tri(g, top, pts[k], pts[k + 1], tone, 0.3);
  for (const q of [0.35, 0.68]) {
    const m0 = b.P(from * L + back * q, -W * 0.72 * (1 - q * 0.4), 1), m1 = b.P(from * L + back * q, W * 0.72 * (1 - q * 0.4), 1);
    g.moveTo(m0[0], m0[1]).lineTo(m1[0], m1[1]).stroke({ width: curl ? 0.9 : 0.7, color: curl ? PAL.gold : PAL.ink, alpha: curl ? 0.85 : 0.7 });
  }
}

const PAINT: Record<PlaceId, Paint> = { front, eyes, limbs, sides, back, tail };
