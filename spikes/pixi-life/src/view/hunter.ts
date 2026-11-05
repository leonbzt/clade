// The hunter, Anomalocaris: it swims above the floor (its shadow shows how high), its side flaps ripple in a wave,
// its two grasping arms stay curled until it strikes, then uncurl as it dives. All facets take the same sun.
import type { Graphics } from 'pixi.js';
import { PAL, SHADOW, flat, mixRamp, tri, type P3 } from './shade';

const HULL: [number, number][] = [[13, 2.2], [11, 4.4], [8.5, 4.6], [6.5, 3.6], [3, 4], [-1, 4], [-5, 3.6], [-9, 3], [-12, 2.2], [-14, 1.4]]; // x, half-width
const FLAPS = 10;

export class Hunter {
  pos = { x: 0, y: 0 };
  look = { a: 0 }; // heading in radians
  lift = { v: 12 }; // height above the floor
  show = { v: 0 }; // 0 hidden … 1 there
  grab = { v: 0 }; // the arms, 0 curled … 1 out
  swim = { v: 0.4 }; // flap speed
  resting = false;
  private t = 0;

  update(dt: number) { this.t += dt * (0.6 + 2.6 * this.swim.v) * (this.resting ? 0.4 : 1); }

  private tf() {
    const c = Math.cos(this.look.a), s = Math.sin(this.look.a), k = 0.95 + 0.15 * this.show.v, { x, y } = this.pos;
    return (lx: number, ly: number, z = 0): P3 => [x + (lx * c - ly * s) * k, y + (lx * s + ly * c) * k, z];
  }

  draw(g: Graphics, sh: Graphics) {
    if (this.show.v <= 0.01) return;
    const P = this.tf(), a = this.show.v, ramp = this.resting ? mixRamp(PAL.hunter, PAL.rock[2], 0.25) : PAL.hunter;
    const flapRamp = mixRamp(PAL.hunter, PAL.ember, 0.25);
    // the shadow on the floor: the hull and the flaps, pushed away from the sun by the height
    const ox = this.lift.v * SHADOW.x, oy = this.lift.v * SHADOW.y;
    const wide = (lx: number, w: number) => (lx < 6.5 && lx > -12 ? w + 6.5 - Math.abs(lx + 2) * 0.25 : w + 1);
    const hull = [...HULL.map(([lx, w]) => P(lx, wide(lx, w))), ...HULL.slice().reverse().map(([lx, w]) => P(lx, -wide(lx, w))), P(15, 0)];
    flat(sh, hull.map(([x, y]) => [x + ox, y + oy]), PAL.ink, a);
    // the flaps under the body, rippling front to back
    for (const side of [-1, 1]) for (let k = FLAPS - 1; k >= 0; k--) {
      const lx = 5.5 - k * 1.85, w = 3.2, ph = this.t * 4.5 - k * 0.7, wave = Math.sin(ph) * 0.35;
      const len = 6.8 - Math.abs(k - 3) * 0.45, z = 2 + Math.sin(ph) * 3;
      const b1 = P(lx + 1.5, side * w, 3), b2 = P(lx - 1.5, side * w, 3);
      const o1 = P(lx + 0.4 - 1.2 * wave, side * (w + len * 0.92), z), o2 = P(lx - 2.6 - 1.2 * wave, side * (w + len * 0.8), z - 0.5);
      g.poly([b1, o1, o2, b2].flatMap(([x, y]) => [x, y])).fill({ color: PAL.ink, alpha: a });
      tri(g, b1, o1, o2, flapRamp, k % 2 ? -0.3 : 0.25, a); tri(g, b1, o2, b2, flapRamp, k % 2 ? -0.5 : 0, a);
    }
    // the tail fan
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
      const ang = Math.PI + side * (0.3 + k * 0.38), len = 8 - k, sw = Math.sin(this.t * 3 + k) * 0.08;
      tri(g, P(-13, side * 0.4, 3), P(-13.2, side * 2.2, 3), P(-13 + Math.cos(ang + sw) * len, Math.sin(ang + sw) * len, 1), flapRamp, 0.3 - k * 0.3, a);
    }
    // the outline, then the body as a ridge: high along the spine, low at the edges
    flat(g, HULL.map(([lx, w]) => P(lx, w + 1.1)).concat(HULL.slice().reverse().map(([lx, w]) => P(lx, -w - 1.1)), [P(13.2, 0)]), PAL.ink, a);
    for (let k = 0; k < HULL.length - 1; k++) {
      const [x0, w0] = HULL[k], [x1, w1] = HULL[k + 1];
      for (const side of [-1, 1]) {
        const s0 = P(x0, 0, 6), s1 = P(x1, 0, 6), e0 = P(x0, side * w0, 1.5), e1 = P(x1, side * w1, 1.5);
        tri(g, s0, e0, e1, ramp, k % 2 ? -0.3 : 0.2, a);
        tri(g, s0, e1, s1, ramp, k % 2 ? -0.3 : 0.2, a);
      }
    }
    // the head shield and the stalked eyes
    tri(g, P(13, 0, 6.5), P(9.5, 3.4, 5), P(9.5, -3.4, 5), mixRamp(ramp, PAL.ember, 0.2), 0.7, a);
    tri(g, P(9.5, 3.4, 5), P(9.5, -3.4, 5), P(7, 0, 6), mixRamp(ramp, PAL.ember, 0.1), 0.3, a);
    for (const side of [-1, 1]) {
      const e = P(10.2, side * 8.4, 6), b1 = P(11, side * 3.6, 5), b2 = P(9.4, side * 3.6, 5);
      g.poly([b1[0], b1[1], e[0], e[1], b2[0], b2[1]]).fill({ color: PAL.ink, alpha: a });
      g.circle(e[0], e[1], 2.4).fill({ color: PAL.ink, alpha: a });
      g.circle(e[0], e[1], 1.5).fill({ color: this.resting ? PAL.rock[2] : PAL.gold, alpha: a });
      g.rect(e[0] - 1, e[1] - 1, 1, 1).fill({ color: 0xffffff, alpha: this.resting ? 0 : a });
    }
    // the grasping arms: segments that curl inward, and straighten as it strikes
    for (const side of [-1, 1]) {
      let lx = 13, ly = side * 1.8, ang = side * 0.2;
      const curl = (0.5 - 0.44 * this.grab.v) * -side, seg = 2.9 + this.grab.v * 1.8;
      for (let k = 0; k < 6; k++) {
        const nx = lx + Math.cos(ang) * seg, ny = ly + Math.sin(ang) * seg, w = 1.6 - k * 0.16;
        const px = -Math.sin(ang) * w, py = Math.cos(ang) * w;
        const q = [P(lx + px, ly + py, 4), P(lx - px, ly - py, 4), P(nx - px * 0.8, ny - py * 0.8, 4), P(nx + px * 0.8, ny + py * 0.8, 4)];
        g.poly(q.flatMap(([x, y]) => [x, y])).fill({ color: PAL.ink, alpha: a });
        tri(g, q[0], q[1], q[2], flapRamp, 0.8, a); tri(g, q[0], q[2], q[3], flapRamp, 0.8, a);
        const sb = P(nx, ny, 4), sp = P(nx + Math.cos(ang - side * 1.3) * 2.6, ny + Math.sin(ang - side * 1.3) * 2.6, 4);
        g.poly([sb[0] - 0.5, sb[1] - 0.5, sp[0], sp[1], sb[0] + 0.5, sb[1] + 0.5]).fill({ color: PAL.pale[4], alpha: a });
        lx = nx; ly = ny; ang += curl;
      }
    }
  }
}
