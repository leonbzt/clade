// Wiwaxia, the scaled grazer: a native prey with its own drawing (no lineage body). It raises its spines when alarmed.
import type { Graphics } from 'pixi.js';
import type { Creature, Seg } from './body';
import { C, PAL, SHADOW, dome, flat, mixRamp, ring, tri } from './shade';

export class Wiwaxia implements Creature {
  head = { x: 0, y: 0 };
  stretch = { v: 0 }; reach = { v: 0 }; flash = { v: 0 }; moving = { v: 0 };
  squash = 0.3;
  spines = { v: 0 }; // 0 flat … 1 raised (alarmed)
  private a = 0;
  private last = { x: 0, y: 0 };
  private t = Math.random() * 10;

  place(x: number, y: number, heading: number) { this.head.x = this.last.x = x; this.head.y = this.last.y = y; this.a = heading; }
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
