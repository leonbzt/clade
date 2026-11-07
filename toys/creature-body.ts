// Toy 18: the one general body and its one draw path. A chain of joints follows the head, as loose or as stiff as the
// lineage says; the gait moves it; a skin (rings or a plated ridge) goes over it; parts go on by the same anchors for
// every animal. It offers the same fields as the game's `Creature`, so it can replace the per-animal classes at step 5.
import type { Graphics } from 'pixi.js';
import { C, PAL, SHADOW, dome, flat, mixRamp, ring, tri, type P3, type Ramp } from '../game/src/view/shade';
import { LINEAGES, type Lineage, type PartId, type RampKey, type SlotKind } from './creature-data';
import { GAITS, type Beat, type Pose } from './creature-gait';
import { slotsOf, spanAt, type Build, type Slot } from './creature-model';
import { DRAW, drawnOver, type Anchor } from './creature-parts';

export const RAMPS: Record<RampKey, Ramp> = {
  flesh: PAL.flesh, you: PAL.you, rival: PAL.rival, hunter: PAL.hunter, shell: PAL.shell, amber: PAL.amber, leaf: PAL.leaf,
  trilo: [0x3a3326, 0x5c4e36, 0x86734f, 0xb09a6c, 0xd8c493], wiwaxia: mixRamp(PAL.shell, PAL.amber[1], 0.35),
};

interface Joint { x: number; y: number; a: number }

export class Body {
  head = { x: 0, y: 0 };
  stretch = { v: 0 }; reach = { v: 0 }; flash = { v: 0 }; moving = { v: 0 };
  heading = 0;
  squash = 0.3;
  lin!: Lineage;
  L = 0; R = 0; size = 1;
  ramp: Ramp = PAL.you;
  anchors: Anchor[] = [];
  build!: Build;
  private follow: { x: number; y: number }[] = [];
  private J: Joint[] = [];
  private sp = 1;
  private t = Math.random() * 10;
  private stepAt = 0;
  treadmill = 0; // walking on the spot, for the big drawing: distance per second
  private last = { x: 0, y: 0 };
  private beat: Beat = { t: 0, step: 0, moving: 0, joints: 0 };
  private pose: Pose = { off: 0, limb: 0, swell: 1 };

  constructor(build: Build, public colour: Ramp | null = PAL.you, private tint = 0.18) { this.setBuild(build); }

  /** Change the body. The chain grows or shrinks from the tail; the head stays where it is. */
  setBuild(b: Build) {
    this.build = b; this.lin = LINEAGES[b.lineage]; this.size = b.size;
    const lin = this.lin, n = spanAt(lin.joints, b.size);
    this.L = C * (lin.len[0] + lin.len[1] * b.size); this.R = C * (lin.R[0] + lin.R[1] * b.size);
    this.sp = this.L / (n - 1);
    this.ramp = this.colour ? mixRamp(this.colour, RAMPS[lin.ramp][2], this.tint) : RAMPS[lin.ramp];
    while (this.follow.length < n) { const p = this.follow[this.follow.length - 1] ?? this.head; this.follow.push({ x: p.x - Math.cos(this.heading) * this.sp, y: p.y - Math.sin(this.heading) * this.sp }); }
    this.follow.length = n;
    this.anchors = anchorsOf(b, lin);
  }

  place(x: number, y: number, heading: number) {
    this.head.x = this.last.x = x; this.head.y = this.last.y = y; this.heading = heading;
    this.follow = this.follow.map((_, k) => ({ x: x - Math.cos(heading) * this.sp * k, y: y - Math.sin(heading) * this.sp * k }));
  }

  update(dt: number) {
    this.t += dt;
    this.stepAt += dt * this.treadmill;
    const dx = this.head.x - this.last.x, dy = this.head.y - this.last.y, d = Math.hypot(dx, dy);
    if (d > 0.02) {
      const want = Math.atan2(dy, dx), diff = wrap(want - this.heading);
      this.heading += diff * Math.min(1, dt * this.lin.turn);
      this.stepAt += d * 0.9;
    }
    this.last.x = this.head.x; this.last.y = this.head.y;
    const n = this.follow.length, sp = this.sp * this.stretchK(), most = this.lin.bend / Math.max(1, n - 1);
    this.follow[0].x = this.head.x; this.follow[0].y = this.head.y;
    let ref = this.heading;
    for (let k = 1; k < n; k++) { // each joint trails the one before, but may only bend so far from it
      const a = this.follow[k - 1], b = this.follow[k];
      const toward = Math.atan2(a.y - b.y, a.x - b.x), diff = Math.max(-most, Math.min(most, wrap(toward - ref)));
      ref += diff;
      b.x = a.x - Math.cos(ref) * sp; b.y = a.y - Math.sin(ref) * sp;
    }
  }

  private stretchK() { return 1 + this.squash * this.stretch.v * (this.lin.skin === 'bead' ? 0.9 : 0.25); }

  /** The joints as drawn this frame: the chain, swayed by the gait. */
  private poseJoints() {
    const n = this.follow.length, F = this.follow, beat = this.beat;
    beat.t = this.t; beat.step = this.stepAt; beat.moving = this.moving.v; beat.joints = n;
    const gait = GAITS[this.lin.gait];
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
    const W = this.lin.width, ff = Math.max(0, Math.min(1, f));
    let k = 0;
    while (k < W.length - 2 && ff > W[k + 1][0]) k++;
    const [a, va] = W[k], [b, vb] = W[k + 1];
    return this.R * (va + ((vb - va) * (ff - a)) / (b - a)) * (1 - 0.45 * this.squash * this.stretch.v * (this.lin.skin === 'bead' ? 1 : 0.2));
  }
  /** Part sizes: they grow with the body, but less, so that they stay readable when small. */
  u() { return 2.5 + 0.4 * this.R; }
  /** How a limb at (f, side) swings now. */
  limb(f: number, side: number) { GAITS[this.lin.gait](this.beat, f, side, this.pose); return this.pose.limb; }
  swell(f: number) { GAITS[this.lin.gait](this.beat, f, 0, this.pose); return this.pose.swell; }
  time() { return this.t; }
  headLen() { return this.lin.head ? this.L * this.lin.head.len : this.R * 0.9; }
  segs() { this.poseJoints(); return this.J.map((j, k) => ({ x: j.x, y: j.y, r: this.w(k / (this.J.length - 1)), a: j.a })); }

  /** Where a slot sits on the body now, in world units. Side slots give the right-hand one; `flip` the left. */
  slotAt(s: Slot, flip = false): [number, number] {
    this.poseJoints();
    const u = this.u(), f = s.f, L = this.L;
    if (s.kind === 'front') return pt(this.P(-u * 1.3, 0));
    if (s.kind === 'crown') return pt(this.P(this.headLen() * 0.45, 0));
    if (s.kind === 'tail') return pt(this.P(L + u * 0.9, 0));
    if (s.kind === 'back') return pt(this.P(f * L, 0));
    return pt(this.P(f * L, (flip ? -1 : 1) * (this.w(f) + u * 0.7)));
  }

  /** The one draw path, for every animal and every size. */
  draw(g: Graphics, sh: Graphics) {
    this.poseJoints();
    let ramp = this.ramp;
    if (this.flash.v > 0) ramp = mixRamp(ramp, 0xffffff, Math.min(1, this.flash.v));
    this.shadow(sh);
    this.parts(g, ramp, false);
    if (this.lin.head?.antennae) this.antennae(g, ramp);
    if (this.lin.skin === 'bead') this.beads(g, ramp); else this.ridge(g, ramp);
    if (this.lin.head) this.shield(g, ramp);
    this.parts(g, ramp, true);
    if (this.lin.skin === 'bead') this.mouth(g);
  }

  private parts(g: Graphics, ramp: Ramp, over: boolean) {
    for (const a of this.anchors) if (drawnOver(a) === over) DRAW[a.part](this, g, a, ramp);
  }

  private shadow(sh: Graphics) {
    const off = this.lin.lift * 1.0, ox = off * SHADOW.x, oy = off * SHADOW.y, wide = this.lin.gait === 'flaps' ? this.u() * 1.2 : 0, m = 8, pts: number[][] = [];
    for (let k = 0; k <= m; k++) { const f = k / m, [x, y] = this.P(f * this.L, this.w(f) + wide); pts.push([x + ox, y + oy]); }
    for (let k = m; k >= 0; k--) { const f = k / m, [x, y] = this.P(f * this.L, -this.w(f) - wide); pts.push([x + ox, y + oy]); }
    flat(sh, pts, PAL.ink);
  }

  /** Soft rings: each joint a faceted dome, from the tail forward. */
  private beads(g: Graphics, ramp: Ramp) {
    const J = this.J, n = J.length, rad = (k: number) => this.w(k / (n - 1)) * this.swell(k / (n - 1));
    for (let k = n - 1; k >= 0; k--) { const j = J[k], r = rad(k); flat(g, ring(j.x, j.y, r + 1.2, r + 1.2, 7, j.a), PAL.ink); }
    for (let k = n - 1; k >= 0; k--) {
      const j = J[k], r = rad(k);
      dome(g, ring(j.x, j.y, r * 1.05, r, 7, j.a), j.x - r * 0.15, j.y - r * 0.2, r * 0.95, ramp, k % 2 ? -0.35 : 0.15);
    }
  }

  /** A plated ridge: high along the middle, low at the edges, a seam between plates. */
  private ridge(g: Graphics, ramp: Ramp) {
    const lin = this.lin, L = this.L, n = spanAt(lin.plates, this.size, 6), sub = 2, m = n * sub, z = lin.ridge ?? 4;
    const at = (i: number) => { const f = i / m, w = this.w(f) * this.swell(f); return { f, w, c: this.P(f * L, 0, z), a: this.P(f * L, -w, 0.5), b: this.P(f * L, w, 0.5) }; };
    const rows = Array.from({ length: m + 1 }, (_, i) => at(i));
    for (let i = 0; i < m; i++) { // the outline, as quads, so that a bent body never folds its polygon
      const p = rows[i], q = rows[i + 1], o0 = this.P(p.f * L, p.w + 1.2), o1 = this.P(q.f * L, q.w + 1.2), o2 = this.P(q.f * L, -q.w - 1.2), o3 = this.P(p.f * L, -p.w - 1.2);
      g.poly([o0[0], o0[1], o1[0], o1[1], o2[0], o2[1], o3[0], o3[1]]).fill(PAL.ink);
    }
    for (const [along, w] of [[-1.2, this.w(0)], [L + 1.2, this.w(1)]] as const) { // the ends
      const near = along < 0 ? 0 : L, o0 = this.P(near, w + 1.2), o1 = this.P(along, w * 0.7), o2 = this.P(along, -w * 0.7), o3 = this.P(near, -w - 1.2);
      g.poly([o0[0], o0[1], o1[0], o1[1], o2[0], o2[1], o3[0], o3[1]]).fill(PAL.ink);
    }
    for (let i = 0; i < m; i++) {
      const p = rows[i], q = rows[i + 1], plate = Math.floor(i / sub), b = plate % 2 ? -0.3 : 0.15;
      tri(g, p.c, p.a, q.a, ramp, b); tri(g, p.c, q.a, q.c, ramp, b);
      tri(g, p.c, p.b, q.b, ramp, b); tri(g, p.c, q.b, q.c, ramp, b);
    }
    if (lin.seams) for (let k = 1; k < n; k++) { const r = rows[k * sub]; g.moveTo(r.a[0], r.a[1]).lineTo(r.b[0], r.b[1]).stroke({ width: 0.7, color: PAL.ink, alpha: 0.7 }); }
    if (lin.lobes) for (const side of [-1, 1]) {
      const a = this.P(0.3 * L, side * this.R * 0.34), b = this.P(0.94 * L, side * this.R * 0.2);
      g.moveTo(a[0], a[1]).lineTo(b[0], b[1]).stroke({ width: 0.8, color: PAL.ink, alpha: 0.75 });
    }
  }

  /** The head shield: a low dome over the front of the body. */
  private shield(g: Graphics, ramp: Ramp) {
    const h = this.lin.head!, L = this.L, W = this.R * h.wide, len = L * h.len, pts: P3[] = [], tint = h.pale ? mixRamp(ramp, PAL.pale[3], h.pale) : ramp;
    for (let k = 0; k <= h.facets; k++) { const a = -Math.PI / 2 + (k / h.facets) * Math.PI; pts.push(this.P(len * (1 - Math.cos(a)) * 0.95, Math.sin(a) * W, 0.5)); }
    if (h.genal) for (const side of [-1, 1]) { // spines at the shield's corners
      const b = this.P(len, side * W, 1), e = this.P(len * 1.6, side * W * 1.28, 0), c = this.P(len * 0.8, side * W * 0.86);
      g.poly([b[0], b[1], e[0], e[1], c[0], c[1]]).fill(tint[2]);
    }
    const mid = this.P(len * 0.5, 0);
    flat(g, pts.map(([x, y]) => [x, y]), PAL.ink, 1, 1.1, mid[0], mid[1]);
    const top = this.P(len * 0.43, 0, (this.lin.ridge ?? 4) + 1.5);
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

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const pt = (p: P3): [number, number] => [p[0], p[1]];

/** Everything on the body, where it sits: drawn-in parts of the lineage and the form, then the parts on slots. */
export function anchorsOf(b: Build, lin: Lineage): Anchor[] {
  const out: Anchor[] = [], add = (part: PartId, kind: SlotKind, f: number, k: number, style: string | undefined, i: number, fused: boolean) => {
    if (kind === 'side') for (const side of [-1, 1]) out.push({ part, kind, f, side, k, style, i, fused });
    else out.push({ part, kind, f, side: 0, k, style, i, fused });
  };
  for (const q of lin.built) {
    const n = spanAt(q.n, b.size), [a, c] = q.f ?? [0.5, 0.5], kind = q.kind ?? 'side';
    const slotF = kind === 'front' ? 0 : kind === 'crown' ? 0.1 : kind === 'tail' ? 1 : null;
    for (let i = 0; i < n; i++) add(q.part, kind, slotF ?? (n === 1 ? a : a + ((c - a) * i) / (n - 1)), q.k ?? 1, q.style, i, true);
  }
  const every = [...slotsOf({ ...b, fused: [] })];
  for (const u of b.fused) { const s = every.find((q) => q.id === u.slot); if (s) add(u.part, s.kind, s.f, 1.25, undefined, 0, true); }
  every.forEach((s, i) => { const part = b.parts[s.id]; if (part) add(part, s.kind, s.f, 1, undefined, i, false); });
  return out;
}
