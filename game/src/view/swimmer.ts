// The swimmer you play (slice 11): the Anomalocaris drawing in your colours, smaller, growing with size; it turns toward
// where it swims. Wiwaxia, the armoured prey: a scaled dome with two rows of spines.
import type { Graphics } from 'pixi.js';
import { Hunter } from './hunter';
import { C, PAL, SHADOW, dome, flat, mixRamp, ring, tri, type Ramp } from './shade';
import type { BodySlot, Creature, Seg } from './worm';

export class Swimmer implements Creature {
  h: Hunter;
  head: { x: number; y: number };
  stretch = { v: 0 };
  reach: { v: number };
  flash: { v: number };
  moving: { v: number };
  squash = 0.3;
  private last = { x: 0, y: 0 };

  constructor(ramp: Ramp) {
    this.h = new Hunter(ramp, 0.6);
    this.h.show.v = 1; this.h.lift.v = 7;
    this.head = this.h.pos; this.reach = this.h.grab; this.flash = this.h.flash; this.moving = this.h.swim;
  }

  place(x: number, y: number, heading: number) { this.head.x = this.last.x = x; this.head.y = this.last.y = y; this.h.look.a = heading; }
  setBody(size: number, slots: BodySlot[]) { this.h.scale = 0.66 + 0.07 * size; this.h.big = slots.some((s) => s.part === 'lenses'); }

  update(dt: number) {
    const dx = this.head.x - this.last.x, dy = this.head.y - this.last.y;
    if (Math.hypot(dx, dy) > 0.05) {
      const want = Math.atan2(dy, dx), diff = Math.atan2(Math.sin(want - this.h.look.a), Math.cos(want - this.h.look.a));
      this.h.look.a += diff * Math.min(1, dt * 12);
    }
    this.last.x = this.head.x; this.last.y = this.head.y;
    this.h.update(dt);
  }

  segs(): Seg[] {
    const c = Math.cos(this.h.look.a), s = Math.sin(this.h.look.a), r = C * 0.22 * this.h.scale / 0.6;
    return [0, 1, 2, 3].map((k) => ({ x: this.head.x - c * k * r * 1.4, y: this.head.y - s * k * r * 1.4, r: r * (1 - k * 0.15), a: this.h.look.a }));
  }

  draw(g: Graphics, sh: Graphics) { this.h.draw(g, sh); }
}

export class Wiwaxia implements Creature {
  head = { x: 0, y: 0 };
  stretch = { v: 0 }; reach = { v: 0 }; flash = { v: 0 }; moving = { v: 0 };
  squash = 0.3;
  spines = { v: 0 }; // 0 flat … 1 raised (alarmed)
  private a = 0;
  private last = { x: 0, y: 0 };
  private t = Math.random() * 10;

  place(x: number, y: number, heading: number) { this.head.x = this.last.x = x; this.head.y = this.last.y = y; this.a = heading; }
  setBody() {}
  update(dt: number) {
    this.t += dt;
    const dx = this.head.x - this.last.x, dy = this.head.y - this.last.y;
    if (Math.hypot(dx, dy) > 0.05) this.a = Math.atan2(dy, dx);
    this.last.x = this.head.x; this.last.y = this.head.y;
  }
  segs(): Seg[] { return [{ x: this.head.x, y: this.head.y, r: C * 0.3, a: this.a }]; }

  draw(g: Graphics, sh: Graphics) {
    const { x, y } = this.head, rx = C * 0.34, ry = C * 0.24, ramp = mixRamp(PAL.shell, PAL.amber[1], 0.35);
    const body = ring(x, y, rx, ry, 10, this.a);
    flat(sh, body.map(([px, py]) => [px + 3 * SHADOW.x, py + 3 * SHADOW.y]), PAL.ink);
    const c = Math.cos(this.a), s = Math.sin(this.a), up = 0.35 + 0.65 * this.spines.v;
    for (const side of [-1, 1]) for (let k = 0; k < 5; k++) { // two rows of spines along the back
      const f = -0.6 + k * 0.3, bx = x + c * f * rx - s * side * ry * 0.4, by = y + s * f * rx + c * side * ry * 0.4;
      const tx = bx - s * side * (4 + 4 * up) - c * 2, ty = by + c * side * (4 + 4 * up) - s * 2;
      g.poly([bx - c, by - s, tx, ty, bx + c, by + s]).fill(PAL.ink);
      tri(g, [bx - c * 0.6, by - s * 0.6, 2], [tx, ty, 3], [bx + c * 0.6, by + s * 0.6, 2], PAL.pale, 0.5);
    }
    flat(g, body, PAL.ink, 1, 1.2, x, y);
    dome(g, body, x - 1, y - 1, 4, ramp, 0.1);
    for (let k = -2; k <= 2; k++) { // rows of scales
      const sx = x + c * k * rx * 0.3, sy = y + s * k * rx * 0.3;
      g.moveTo(sx - s * ry * 0.7, sy + c * ry * 0.7).lineTo(sx + s * ry * 0.7, sy - c * ry * 0.7).stroke({ width: 0.7, color: ramp[0], alpha: 0.7 });
    }
    void this.t;
  }
}
