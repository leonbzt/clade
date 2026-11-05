// An arthropod, Sidneyia-like: a rigid plated body that turns as one piece (a worm trails), a head shield, a row of
// thorax plates and a tail fan, walking legs that step in waves while it moves. Its parts sit on the body: claws ahead,
// eyes on the shield, spines and gills at the plate edges, the gut gland's glow along the middle.
import type { Graphics } from 'pixi.js';
import { C, PAL, SHADOW, dome, flat, mixRamp, ring, tri, type P3, type Ramp } from './shade';
import type { BodySlot, Creature, Seg } from './worm';

export class Arthropod implements Creature {
  head = { x: 0, y: 0 };
  stretch = { v: 0 };
  reach = { v: 0 };
  flash = { v: 0 };
  moving = { v: 0 };
  heading = 0;
  size = 1;
  soft = false;
  slots: BodySlot[] = [];
  squash = 0.3;
  private t = Math.random() * 10;
  private step = 0;
  private last = { x: 0, y: 0 };

  constructor(private ramp: Ramp, private scale = 1) {}

  private plates() { return 2 + this.size; } // thorax plates
  private len() { return C * (0.5 + 0.09 * this.size) * this.scale; }
  private half() { return C * (0.2 + 0.03 * this.size) * this.scale; }

  place(x: number, y: number, heading: number) { this.head.x = this.last.x = x; this.head.y = this.last.y = y; this.heading = heading; }
  setBody(size: number, slots: BodySlot[], soft: boolean) { this.size = size; this.slots = slots.map((s) => ({ ...s })); this.soft = soft; }

  update(dt: number) {
    this.t += dt;
    const dx = this.head.x - this.last.x, dy = this.head.y - this.last.y, d = Math.hypot(dx, dy);
    if (d > 0.05) { // turn toward the way it moves, quickly, as one piece
      const want = Math.atan2(dy, dx), diff = Math.atan2(Math.sin(want - this.heading), Math.cos(want - this.heading));
      this.heading += diff * Math.min(1, dt * 18);
      this.step += d * 0.9;
    }
    this.last.x = this.head.x; this.last.y = this.head.y;
  }

  /** Point at (along, across) in body space: along from the head (0) back, across to the right. */
  private P(along: number, across: number, z = 0): P3 {
    const c = Math.cos(this.heading), s = Math.sin(this.heading), k = 1 + this.squash * this.stretch.v * 0.25;
    return [this.head.x - c * along * k - s * across, this.head.y - s * along * k + c * across, z];
  }

  /** The outline's half-width along the body: a broad shield, the thorax tapering into the tail. */
  private width(f: number) { return this.half() * (f < 0.3 ? 0.75 + f * 0.9 : 1.02 - (f - 0.3) * 0.9); }

  segs(): Seg[] {
    const n = this.plates() + 2, L = this.len();
    return Array.from({ length: n }, (_, k) => {
      const f = (k + 0.5) / n, [x, y] = this.P(f * L, 0);
      return { x, y, r: this.width(f), a: this.heading };
    });
  }

  draw(g: Graphics, sh: Graphics) {
    const L = this.len(), W = this.half(), n = this.plates();
    let ramp = this.soft ? mixRamp(this.ramp, PAL.pale[3], 0.45) : this.ramp;
    if (this.slots.some((s) => s.part === 'blood')) ramp = mixRamp(ramp, PAL.blue[2], 0.3);
    if (this.flash.v > 0) ramp = mixRamp(ramp, 0xffffff, this.flash.v * 0.8);
    const dark = mixRamp(ramp, PAL.ink, 0.35), has = (id: string) => this.slots.filter((s) => s.part === id);
    const outline: P3[] = [];
    for (let k = 0; k <= 12; k++) { const f = k / 12; outline.push(this.P(f * L, this.width(f) + 1.2)); }
    for (let k = 12; k >= 0; k--) { const f = k / 12; outline.push(this.P(f * L, -this.width(f) - 1.2)); }
    flat(sh, outline.map(([x, y]) => [x + 4 * SHADOW.x, y + 4 * SHADOW.y]), PAL.ink);
    // legs: jointed pairs under the plates, stepping in a wave when it moves
    const legs = n + has('leg').length;
    for (let k = 0; k < legs; k++) for (const side of [-1, 1]) {
      const f = 0.28 + (k / Math.max(1, legs - 1)) * 0.56, ph = this.step + k * 1.1 + (side > 0 ? Math.PI : 0);
      const sw = Math.sin(ph) * 2.2 * (0.3 + this.moving.v), long = k >= n ? 1.25 : 1;
      const hip = this.P(f * L, side * this.width(f) * 0.8, 1), knee = this.P(f * L - 1 + sw * 0.5, side * (this.width(f) + 3.2 * long), 2);
      const foot = this.P(f * L + 1.5 + sw, side * (this.width(f) + 5.2 * long), 0);
      g.moveTo(hip[0], hip[1]).lineTo(knee[0], knee[1]).lineTo(foot[0], foot[1]).stroke({ width: 1.6, color: PAL.ink });
      g.moveTo(hip[0], hip[1]).lineTo(knee[0], knee[1]).lineTo(foot[0], foot[1]).stroke({ width: 0.8, color: dark[3] });
    }
    for (const s of has('gill')) this.gill(g, s);
    for (const s of has('digger')) this.digger(g, s, dark);
    for (const s of has('pouch')) this.pouch(g, s);
    for (const s of has('rake')) this.rake(g, s, dark);
    for (const s of has('spine')) this.spine(g, s, s.kind === 'tail');
    // antennae
    for (const side of [-1, 1]) {
      const b = this.P(0.5, side * 1.6), m = this.P(-4, side * 3.5), e = this.P(-7 + Math.sin(this.t * 2 + side) * 0.8, side * 6);
      g.moveTo(b[0], b[1]).lineTo(m[0], m[1]).lineTo(e[0], e[1]).stroke({ width: 0.8, color: dark[1] });
    }
    for (const s of has('claw')) this.claw(g, s, ramp);
    // the body: outline, then the plates as ridges (high along the middle, low at the edges), the shield over the front
    flat(g, outline, PAL.ink);
    const tailF = 0.86;
    for (let k = 0; k < n; k++) {
      const f0 = 0.3 + ((tailF - 0.3) * k) / n, f1 = 0.3 + ((tailF - 0.3) * (k + 1)) / n, b = k % 2 ? -0.3 : 0.15;
      for (const side of [-1, 1]) {
        const s0 = this.P(f0 * L, 0, 4), s1 = this.P(f1 * L, 0, 4), e0 = this.P(f0 * L, side * this.width(f0), 0.5), e1 = this.P(f1 * L, side * this.width(f1), 0.5);
        tri(g, s0, e0, e1, ramp, b); tri(g, s0, e1, s1, ramp, b);
      }
      const a = this.P(f1 * L, -this.width(f1)), c = this.P(f1 * L, this.width(f1)); // the seam between plates
      g.moveTo(a[0], a[1]).lineTo(c[0], c[1]).stroke({ width: 0.7, color: PAL.ink, alpha: 0.7 });
    }
    const fan: P3[] = [this.P(tailF * L, -this.width(tailF), 0.5), this.P(L + 2, -W * 0.45, 0.5), this.P(L + 3, 0, 1), this.P(L + 2, W * 0.45, 0.5), this.P(tailF * L, this.width(tailF), 0.5)];
    for (let k = 0; k < fan.length - 1; k++) tri(g, this.P(tailF * L, 0, 3), fan[k], fan[k + 1], ramp, 0.4 - k * 0.2);
    const shieldW = has('shield').length ? 1.22 : 1;
    const shield: P3[] = [];
    for (let k = 0; k <= 8; k++) { const a = -Math.PI / 2 + (k / 8) * Math.PI; shield.push(this.P(0.3 * L * (1 - Math.cos(a)) * 0.95, Math.sin(a) * W * 1.05 * shieldW, 0.5)); }
    if (shieldW > 1) for (const side of [-1, 1]) { // genal spines at the shield's corners
      const b = this.P(0.3 * L, side * W * 1.2, 1), e = this.P(0.48 * L, side * W * 1.55, 0);
      g.poly([b[0], b[1], e[0], e[1], ...this.P(0.25 * L, side * W * 1.05).slice(0, 2)]).fill(PAL.pale[2]);
    }
    flat(g, shield.map(([x, y]) => [x, y]), PAL.ink, 1, 1.1, ...this.P(0.15 * L, 0).slice(0, 2) as [number, number]);
    const top = this.P(0.13 * L, 0, 5.5), shRamp = shieldW > 1 ? mixRamp(ramp, PAL.pale[3], 0.35) : ramp;
    for (let k = 0; k < shield.length - 1; k++) tri(g, top, shield[k], shield[k + 1], shRamp, 0.35);
    if (has('gut').length) { const [x, y] = this.P(0.55 * L, 0); dome(g, ring(x, y, L * 0.16, W * 0.32, 6, this.heading), x - 0.4, y - 0.4, 1.2, PAL.amber, 0.6, 0.8); }
    this.eyes(g, has('compound').length > 0, has('eye').length > 0);
    if (has('progenesis').length) { const [x, y] = this.P(0.7 * L, 0); g.rect(x - 1, y - 1, 2, 2).fill(0xf59be0); }
    if (has('enrol').length) for (let k = 1; k < 3; k++) { const a = this.P((tailF - 0.06 * k) * L, -W * 0.6), b = this.P((tailF - 0.06 * k) * L, W * 0.6); g.moveTo(a[0], a[1]).lineTo(b[0], b[1]).stroke({ width: 0.8, color: PAL.gold, alpha: 0.7 }); }
  }

  private sideOf(s: BodySlot) { return s.side === 'left' ? -1 : 1; }
  private along(s: BodySlot) { const pairs = Math.max(1, this.slots.filter((q) => q.kind === 'side').length / 2); return 0.36 + ((s.seg + 0.5) / pairs) * 0.42; }

  private eyes(g: Graphics, compound: boolean, eye: boolean) {
    const L = this.len(), W = this.half();
    for (const side of [-1, 1]) {
      const [x, y] = this.P(0.1 * L, side * W * 0.5);
      if (compound) { flat(g, ring(x, y, 2.6, 2.2, 6, this.heading), PAL.ink); dome(g, ring(x, y, 1.9, 1.6, 6, this.heading), x - 0.4, y - 0.4, 1.2, PAL.amber, 0.6); g.rect(x - 1, y - 1, 1, 1).fill(0xffffff); }
      else if (eye) { g.rect(x - 1.2, y - 1.2, 2.4, 2.4).fill(PAL.ink); g.rect(x - 1, y - 1, 1, 1).fill(0xffffff); }
      else g.rect(x - 0.6, y - 0.6, 1.2, 1.2).fill(PAL.ink);
    }
  }

  private claw(g: Graphics, s: BodySlot, ramp: Ramp) {
    void s;
    const out = 2 + this.reach.v * 6, W = this.half();
    for (const side of [-1, 1]) {
      const base = this.P(1, side * W * 0.55, 2), arm = this.P(-out, side * W * 1.05, 2), tip = this.P(-out - 6, side * W * 0.2, 1.5), inner = this.P(-out - 3, side * W * 0.55, 1.5);
      flat(g, [[base[0], base[1]], [arm[0], arm[1]], [tip[0], tip[1]], [inner[0], inner[1]]], PAL.ink, 1, 1.2, ...this.P(-out, side * W * 0.6).slice(0, 2) as [number, number]);
      tri(g, base, arm, inner, ramp, 0.6); tri(g, arm, tip, inner, ramp, 0.2);
      const f = this.P(-out - 5, side * W * 1.1, 1); // the movable finger
      g.poly([arm[0], arm[1], f[0], f[1], tip[0], tip[1]]).fill(mixRamp(ramp, PAL.pale[3], 0.3)[3]);
    }
  }

  private spine(g: Graphics, s: BodySlot, tail: boolean) {
    const L = this.len(), side = this.sideOf(s);
    const pairs: [number, number][] = tail ? [[-1, 0], [1, 0]] : [[side, this.along(s)]];
    for (const [sd, f] of pairs) {
      const ff = tail ? 0.88 : f, b0 = this.P(ff * L - 1.5, sd * this.width(ff), 1), b1 = this.P(ff * L + 1.5, sd * this.width(ff), 1);
      const tip = tail ? this.P(L + 7, sd * this.half() * 0.9, 1) : this.P(ff * L + 5, sd * (this.width(ff) + 6), 1);
      g.poly([b0[0], b0[1], tip[0], tip[1], b1[0], b1[1]]).fill(PAL.ink);
      tri(g, b0, tip, b1, PAL.pale, 0.4);
    }
  }

  private gill(g: Graphics, s: BodySlot) {
    const L = this.len(), side = this.sideOf(s), f = this.along(s);
    for (let k = 0; k < 3; k++) {
      const ff = f - 0.06 + k * 0.06, b = this.P(ff * L, side * this.width(ff) * 0.9, 1), e = this.P(ff * L + 2.5, side * (this.width(ff) + 3.5), 0);
      tri(g, b, e, this.P(ff * L + 1.2, side * this.width(ff), 1), PAL.gill, 0.5 - k * 0.3);
    }
  }

  private digger(g: Graphics, s: BodySlot, dark: Ramp) {
    const L = this.len(), side = this.sideOf(s), f = this.along(s), b = this.P(f * L, side * this.width(f), 1);
    const pad = ring(...(this.P(f * L - 1, side * (this.width(f) + 4)).slice(0, 2) as [number, number]), 2.6, 1.6, 5, this.heading + 0.4 * side);
    g.moveTo(b[0], b[1]).lineTo(pad[0][0], pad[0][1]).stroke({ width: 1.6, color: PAL.ink });
    flat(g, pad, PAL.ink, 1, 0.8, pad[0][0], pad[0][1]);
    flat(g, pad, dark[3]);
  }

  private rake(g: Graphics, s: BodySlot, dark: Ramp) { // a comb of bristled limbs reaching forward
    const L = this.len(), side = this.sideOf(s), f = this.along(s), sw = Math.sin(this.t * 5) * 1.2;
    const b = this.P(f * L, side * this.width(f)), e = this.P(f * L - 6 + sw, side * (this.width(f) + 5));
    g.moveTo(b[0], b[1]).lineTo(e[0], e[1]).stroke({ width: 1.8, color: PAL.ink });
    g.moveTo(b[0], b[1]).lineTo(e[0], e[1]).stroke({ width: 0.9, color: dark[3] });
    for (let k = 1; k <= 3; k++) { const q = this.P(f * L - 2 * k + sw * k / 3, side * (this.width(f) + 1.7 * k)), r = this.P(f * L - 2 * k - 2 + sw * k / 3, side * (this.width(f) + 1.7 * k)); g.moveTo(q[0], q[1]).lineTo(r[0], r[1]).stroke({ width: 0.8, color: PAL.pale[3] }); }
  }

  private pouch(g: Graphics, s: BodySlot) {
    const L = this.len(), side = s.kind === 'tail' ? 0 : this.sideOf(s), f = s.kind === 'tail' ? 0.8 : this.along(s);
    for (const o of [-1.8, 1.8]) {
      const [x, y] = this.P(f * L + o, side * (this.width(f) + 1.2) + (side ? 0 : o));
      dome(g, ring(x, y, 1.8, 1.8, 5), x - 0.4, y - 0.4, 1.3, PAL.amber, 0.4);
    }
  }
}
