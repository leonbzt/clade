// Slice 20B: the one general body, ported from toys/creature-body.ts. A chain of joints follows the head, as loose or as
// stiff as the look says; the gait moves it; a skin (rings or a plated ridge) goes over it; the build's six places are
// painted on by view/body-parts.ts. It draws a 20A `Build`: you, residents with a known build, prey and the
// equipment view. Drawing only: it never touches the sim or its RNG.
import type { Graphics } from 'pixi.js';
import { LOOKS, SHIELD_HEAD, spanAt, type Head, type Look } from '../data/body-look';
import type { PlaceId } from '../data/body';
import type { PartId } from '../data/life';
import type { Build } from '../sim/body';
import { has } from '../sim/body';
import { C, PAL, SHADOW, dome, flat, mixRamp, ring, tri, type P3, type Ramp } from './shade';
import { paintPlace } from './body-parts';

const TRILO: Ramp = [0x3a3326, 0x5c4e36, 0x86734f, 0xb09a6c, 0xd8c493];
const BASE: Record<Build['body'], Ramp> = { worm: PAL.flesh, arthropod: PAL.amber, trilobite: TRILO, swimmer: PAL.hunter };
/** Under the body first, then over it; Front last so a tool reads in front of the head. */
const UNDER: PlaceId[] = ['tail', 'limbs', 'sides', 'eyes', 'back', 'front'];
const OVER: PlaceId[] = ['back', 'sides', 'tail', 'eyes', 'front'];

export interface Seg { x: number; y: number; r: number; a: number }
/** What the board needs from anything it draws: you, a rival, the prey. */
export interface Creature {
  head: { x: number; y: number }; stretch: { v: number }; reach: { v: number }; flash: { v: number }; moving: { v: number }; squash: number;
  place(x: number, y: number, heading: number): void;
  update(dt: number): void;
  segs(): Seg[];
  draw(g: Graphics, sh: Graphics, inMud: (x: number, y: number) => boolean): void;
}

interface Joint { x: number; y: number; a: number }
interface Beat { t: number; step: number; moving: number; joints: number }
interface Pose { off: number; limb: number; swell: number }
const GAITS: Record<Look['gait'], (b: Beat, f: number, side: number, out: Pose) => void> = {
  ripple: (b, f, side, out) => {
    out.off = Math.sin(b.t * (3 + 5 * b.moving) - f * b.joints * 0.85) * (0.35 + 1.5 * b.moving) * (0.25 + f);
    out.limb = Math.sin(b.t * (2 + 5 * b.moving) - f * 7 + side); out.swell = 1;
  },
  legs: (b, f, side, out) => { out.off = 0; out.limb = Math.sin(b.step + f * 9 + (side > 0 ? Math.PI : 0)); out.swell = 1; },
  flaps: (b, f, side, out) => {
    out.off = Math.sin(b.t * 2.6 - f * 3) * (0.2 + 0.7 * b.moving) * f;
    out.limb = Math.sin(b.t * (2 + 3.5 * b.moving) - f * 7) * (side ? 1 : 0); out.swell = 1;
  },
};
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export class Body implements Creature {
  head = { x: 0, y: 0 };
  stretch = { v: 0 }; reach = { v: 0 }; flash = { v: 0 }; moving = { v: 0 };
  heading = 0; squash = 0.3; soft = false;
  look!: Look; build!: Build; hd: Head | null = null;
  L = 0; R = 0; size = 1;
  ramp: Ramp = PAL.you;
  treadmill = 0; // walking on the spot, for the large view: distance per second
  private follow: { x: number; y: number }[] = [];
  private J: Joint[] = [];
  private sp = 1;
  private t = Math.random() * 10;
  private stepAt = 0;
  private last = { x: 0, y: 0 };
  private beat: Beat = { t: 0, step: 0, moving: 0, joints: 0 };
  private pose: Pose = { off: 0, limb: 0, swell: 1 };

  constructor(build: Build, public colour: Ramp = PAL.you) { this.setBuild(build); }

  /** Change the build. The chain grows or shrinks from the tail; the head stays where it is. */
  setBuild(b: Build) {
    this.build = b; this.look = LOOKS[b.body]; this.size = b.size;
    const lk = this.look, n = spanAt(lk.joints, b.size);
    this.L = C * (lk.len[0] + lk.len[1] * b.size); this.R = C * (lk.R[0] + lk.R[1] * b.size);
    this.sp = this.L / (n - 1);
    this.ramp = mixRamp(this.colour, BASE[b.body][2], lk.tint);
    const shield = has(b, 'shield');
    this.hd = lk.head ? { ...lk.head, ...(shield ? { wide: SHIELD_HEAD.wide, pale: SHIELD_HEAD.pale, genal: true } : {}) } : null;
    while (this.follow.length < n) { const p = this.follow[this.follow.length - 1] ?? this.head; this.follow.push({ x: p.x - Math.cos(this.heading) * this.sp, y: p.y - Math.sin(this.heading) * this.sp }); }
    this.follow.length = n;
  }
  /** What the body holds at a place, or nothing. */
  row(place: PlaceId): PartId[] { return this.build.rows[place] ?? []; }
  lost(place: PlaceId) { return !!this.build.lost?.includes(place); }

  place(x: number, y: number, heading: number) {
    this.head.x = this.last.x = x; this.head.y = this.last.y = y; this.heading = heading;
    this.follow = this.follow.map((_, k) => ({ x: x - Math.cos(heading) * this.sp * k, y: y - Math.sin(heading) * this.sp * k }));
  }

  update(dt: number) {
    this.t += dt;
    this.stepAt += dt * this.treadmill;
    const dx = this.head.x - this.last.x, dy = this.head.y - this.last.y, d = Math.hypot(dx, dy);
    if (d > 0.02) { this.heading += wrap(Math.atan2(dy, dx) - this.heading) * Math.min(1, dt * this.look.turn); this.stepAt += d * 0.9; }
    this.last.x = this.head.x; this.last.y = this.head.y;
    const n = this.follow.length, sp = this.sp * this.stretchK(), most = this.look.bend / Math.max(1, n - 1);
    this.follow[0].x = this.head.x; this.follow[0].y = this.head.y;
    let ref = this.heading;
    for (let k = 1; k < n; k++) { // each joint trails the one before, but may only bend so far from it
      const a = this.follow[k - 1], b = this.follow[k];
      ref += Math.max(-most, Math.min(most, wrap(Math.atan2(a.y - b.y, a.x - b.x) - ref)));
      b.x = a.x - Math.cos(ref) * sp; b.y = a.y - Math.sin(ref) * sp;
    }
  }

  private bead() { return this.look.skin === 'bead'; }
  private stretchK() { return 1 + this.squash * this.stretch.v * (this.bead() ? 0.9 : 0.25); }

  private poseJoints() {
    const n = this.follow.length, F = this.follow, beat = this.beat, gait = GAITS[this.look.gait];
    beat.t = this.t; beat.step = this.stepAt; beat.moving = this.moving.v; beat.joints = n;
    this.J = F.map((p, k) => {
      const q = F[Math.max(0, k - 1)], w = F[Math.min(n - 1, k + 1)], a = k === 0 ? this.heading : Math.atan2(q.y - w.y, q.x - w.x);
      gait(beat, k / (n - 1), 0, this.pose);
      return { x: p.x - Math.sin(a) * this.pose.off, y: p.y + Math.cos(a) * this.pose.off, a };
    });
  }

  /** A point in body space: `along` from the head (negative ahead of it, past L behind the tail), `across` to the right. */
  P(along: number, across: number, z = 0): P3 {
    const J = this.J, fp = along / this.sp, i = Math.max(0, Math.min(J.length - 2, Math.floor(fp))), u = fp - i;
    const a = J[i], b = J[i + 1], ang = a.a + wrap(b.a - a.a) * Math.max(0, Math.min(1, u));
    return [a.x + (b.x - a.x) * u - Math.sin(ang) * across, a.y + (b.y - a.y) * u + Math.cos(ang) * across, z];
  }
  /** Half-width of the body at f, 0 head … 1 tail. */
  w(f: number) {
    const W = this.look.width, ff = Math.max(0, Math.min(1, f));
    let k = 0;
    while (k < W.length - 2 && ff > W[k + 1][0]) k++;
    const [a, va] = W[k], [b, vb] = W[k + 1];
    return this.R * (va + ((vb - va) * (ff - a)) / (b - a)) * (1 - 0.45 * this.squash * this.stretch.v * (this.bead() ? 1 : 0.2));
  }
  /** Part sizes grow with the body, but less, so that they stay readable when small. */
  u() { return 2.5 + 0.4 * this.R; }
  limb(f: number, side: number) { GAITS[this.look.gait](this.beat, f, side, this.pose); return this.pose.limb; }
  time() { return this.t; }
  headLen() { return this.hd ? this.L * this.hd.len : this.R * 0.9; }
  segs(): Seg[] { this.poseJoints(); return this.J.map((j, k) => ({ x: j.x, y: j.y, r: this.w(k / (this.J.length - 1)), a: j.a })); }
  /** Where a place sits now, for labels and highlights: Eyes and Limbs on the left, Sides on the right. */
  placeAt(place: PlaceId): [number, number] {
    this.poseJoints();
    const u = this.u(), L = this.L, lf = this.look.limbs.f, sf = this.look.sides.f;
    const p = place === 'front' ? this.P(-u * 1.4, 0) : place === 'eyes' ? this.P(this.headLen() * 0.4, -this.w(0.05) * 0.6)
      : place === 'limbs' ? this.P(((lf[0] + lf[1]) / 2) * L, -(this.w(0.5) + u * 1.2)) : place === 'sides' ? this.P(((sf[0] + sf[1]) / 2) * L, this.w(0.6) + u * 0.6)
      : place === 'back' ? this.P(this.hd && has(this.build, 'shield') ? this.headLen() * 0.6 : L * 0.45, 0) : this.P(L + u * 0.8, 0);
    return [p[0], p[1]];
  }

  /** The one draw path, for every body and size. `inMud` dims what's under the silt. */
  draw(g: Graphics, sh: Graphics, inMud?: (x: number, y: number) => boolean) {
    this.poseJoints();
    let ramp = this.soft ? mixRamp(this.ramp, PAL.pale[3], 0.45) : this.ramp;
    if (has(this.build, 'blood')) ramp = mixRamp(ramp, PAL.blue[2], 0.3);
    if (this.flash.v > 0) ramp = mixRamp(ramp, 0xffffff, Math.min(1, this.flash.v) * 0.8);
    const mud = !!inMud && inMud(this.head.x, this.head.y);
    if (mud && !this.bead()) ramp = mixRamp(ramp, PAL.mudSeen[2], 0.4);
    if (!mud) this.shadow(sh);
    for (const p of UNDER) paintPlace(this, g, p, ramp, false);
    if (this.hd?.antennae) this.antennae(g, ramp);
    if (this.bead()) this.beads(g, ramp, inMud); else this.ridge(g, ramp);
    if (this.hd) this.shield(g, ramp);
    for (const p of OVER) paintPlace(this, g, p, ramp, true);
    if (this.bead()) this.mouth(g);
  }

  private shadow(sh: Graphics) {
    const off = this.look.lift, ox = off * SHADOW.x, oy = off * SHADOW.y, wide = this.look.gait === 'flaps' ? this.u() * 1.2 : 0, m = 8, pts: number[][] = [];
    for (let k = 0; k <= m; k++) { const f = k / m, [x, y] = this.P(f * this.L, this.w(f) + wide); pts.push([x + ox, y + oy]); }
    for (let k = m; k >= 0; k--) { const f = k / m, [x, y] = this.P(f * this.L, -this.w(f) - wide); pts.push([x + ox, y + oy]); }
    flat(sh, pts, PAL.ink);
  }

  /** Soft rings: each joint a faceted dome, from the tail forward. */
  private beads(g: Graphics, ramp: Ramp, inMud?: (x: number, y: number) => boolean) {
    const J = this.J, n = J.length, rad = (k: number) => this.w(k / (n - 1)), under = J.map((j) => !!inMud?.(j.x, j.y)), mudRamp = mixRamp(ramp, PAL.mudSeen[2], 0.4);
    for (let k = n - 1; k >= 0; k--) { const j = J[k], r = rad(k); flat(g, ring(j.x, j.y, r + 1.2, r + 1.2, 7, j.a), under[k] ? PAL.mudSeen[4] : PAL.ink, under[k] ? 0.75 : 1); }
    for (let k = n - 1; k >= 0; k--) {
      const j = J[k], r = rad(k);
      dome(g, ring(j.x, j.y, r * 1.05, r, 7, j.a), j.x - r * 0.15, j.y - r * 0.2, r * 0.95, under[k] ? mudRamp : ramp, k % 2 ? -0.35 : 0.15, under[k] ? 0.85 : 1);
    }
  }

  /**
   * A plated ridge: high along the middle, low at the edges, a seam between plates. With a head shield the hull starts
   * under the shield, never ahead of it (20B: the arthropod/trilobite hull used to poke out in front of the head).
   */
  private ridge(g: Graphics, ramp: Ramp) {
    const lk = this.look, L = this.L, n = spanAt(lk.plates ?? 4, this.size), sub = 2, m = n * sub, z = lk.ridge ?? 4;
    const f0 = this.hd ? this.hd.len * 0.5 : 0, F = (i: number) => f0 + ((1 - f0) * i) / m;
    const rows = Array.from({ length: m + 1 }, (_, i) => { const f = F(i), w = this.w(f); return { f, w, c: this.P(f * L, 0, z), a: this.P(f * L, -w, 0.5), b: this.P(f * L, w, 0.5) }; });
    for (let i = 0; i < m; i++) { // the outline, as quads, so that a bent body never folds its polygon
      const p = rows[i], q = rows[i + 1], o0 = this.P(p.f * L, p.w + 1.2), o1 = this.P(q.f * L, q.w + 1.2), o2 = this.P(q.f * L, -q.w - 1.2), o3 = this.P(p.f * L, -p.w - 1.2);
      g.poly([o0[0], o0[1], o1[0], o1[1], o2[0], o2[1], o3[0], o3[1]]).fill(PAL.ink);
    }
    const ends: [number, number, number][] = [[L, L + 1.2, this.w(1)]];
    if (!this.hd) ends.push([0, -1.2, this.w(0)]);
    for (const [near, along, w] of ends) {
      const o0 = this.P(near, w + 1.2), o1 = this.P(along, w * 0.7), o2 = this.P(along, -w * 0.7), o3 = this.P(near, -w - 1.2);
      g.poly([o0[0], o0[1], o1[0], o1[1], o2[0], o2[1], o3[0], o3[1]]).fill(PAL.ink);
    }
    for (let i = 0; i < m; i++) {
      const p = rows[i], q = rows[i + 1], b = Math.floor(i / sub) % 2 ? -0.3 : 0.15;
      tri(g, p.c, p.a, q.a, ramp, b); tri(g, p.c, q.a, q.c, ramp, b);
      tri(g, p.c, p.b, q.b, ramp, b); tri(g, p.c, q.b, q.c, ramp, b);
    }
    if (lk.seams) for (let k = 1; k < n; k++) { const r = rows[k * sub]; g.moveTo(r.a[0], r.a[1]).lineTo(r.b[0], r.b[1]).stroke({ width: 0.7, color: PAL.ink, alpha: 0.7 }); }
    if (lk.lobes) for (const side of [-1, 1]) {
      const a = this.P(0.3 * L, side * this.R * 0.34), b = this.P(0.94 * L, side * this.R * 0.2);
      g.moveTo(a[0], a[1]).lineTo(b[0], b[1]).stroke({ width: 0.8, color: PAL.ink, alpha: 0.75 });
    }
  }

  /** The head: a low dome over the front of the body. The shield part widens it and adds corner spines. */
  private shield(g: Graphics, ramp: Ramp) {
    const h = this.hd!, L = this.L, W = this.R * h.wide, len = L * h.len, pts: P3[] = [], tint = h.pale ? mixRamp(ramp, PAL.pale[3], h.pale) : ramp;
    const spined = this.row('back').includes('spine');
    for (let k = 0; k <= h.facets; k++) { const a = -Math.PI / 2 + (k / h.facets) * Math.PI; pts.push(this.P(len * (1 - Math.cos(a)) * 0.95, Math.sin(a) * W, 0.5)); }
    if (h.genal) for (const side of [-1, 1]) { // spines at the shield's corners, long ones on a spined shield
      const reach = spined ? 2.4 : 1.6, b = this.P(len, side * W, 1), e = this.P(len * reach, side * W * (spined ? 1.45 : 1.28), 0), c = this.P(len * 0.8, side * W * 0.86);
      g.poly([b[0], b[1], e[0], e[1], c[0], c[1]]).fill(spined ? PAL.ink : tint[2]);
      if (spined) tri(g, b, e, c, PAL.pale, 0.4);
    }
    const mid = this.P(len * 0.5, 0);
    flat(g, pts.map(([x, y]) => [x, y]), PAL.ink, 1, 1.1, mid[0], mid[1]);
    const top = this.P(len * 0.43, 0, (this.look.ridge ?? 4) + 1.5);
    for (let k = 0; k < pts.length - 1; k++) tri(g, top, pts[k], pts[k + 1], tint, 0.35);
    tri(g, top, pts[pts.length - 1], pts[0], tint, -0.1); // the back edge, so that the fan closes
  }

  private antennae(g: Graphics, ramp: Ramp) {
    const dark = mixRamp(ramp, PAL.ink, 0.35), t = this.t, u = this.u();
    for (const side of [-1, 1]) {
      const b = this.P(0.5, side * this.w(0) * 0.5), m = this.P(-u * 0.9, side * (this.w(0) * 0.5 + u * 0.5)), e = this.P(-u * 1.6 + Math.sin(t * 2 + side) * 0.8, side * (this.w(0) * 0.5 + u * 1.1));
      g.moveTo(b[0], b[1]).lineTo(m[0], m[1]).lineTo(e[0], e[1]).stroke({ width: 0.8, color: dark[1] });
    }
  }

  private mouth(g: Graphics) {
    const h = this.J[0], r = this.w(0), mx = h.x + Math.cos(h.a) * r * 0.62, my = h.y + Math.sin(h.a) * r * 0.62;
    flat(g, ring(mx, my, r * 0.32, r * 0.32, 5, h.a), PAL.ink, 0.9);
  }
}
