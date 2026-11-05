// What changes every frame on the board: the tiles you can reach, the path under the mouse, the hunter's way in,
// and its pulsing strike marks with an arrow from it toward you.
import { Graphics } from 'pixi.js';
import { DX, DY, xy, type Dest } from '../rules/life';
import { C, PAL } from './shade';

export class Marks {
  g = new Graphics();
  dests = new Map<number, Dest>();
  hover = -1;
  entry = -1; // the hunter's way in, before it comes
  marks: number[] = [];
  markDir = 0;
  pop = { v: 0 }; // 0 → 1 as the marks appear
  from = { x: 0, y: 0 }; // the hunter, for the arrow
  pulse = 1.6; // beats a second
  private t = 0;

  tick(dt: number) {
    this.t += dt;
    const g = this.g.clear(), glow = 0.5 + 0.5 * Math.sin(this.t * Math.PI * 2 * 0.9);
    if (this.entry >= 0) {
      const [x, y] = xy(this.entry), r = 4 + ((this.t * 9) % 10);
      g.rect(x * C + 1, y * C + 1, C - 2, C - 2).stroke({ width: 1, color: PAL.red, alpha: 0.5 + 0.4 * glow });
      g.circle(x * C + C / 2, y * C + C / 2, r).stroke({ width: 1, color: PAL.red, alpha: 0.6 * (1 - (r - 4) / 10) });
    }
    for (const [i, d] of this.dests) {
      const [x, y] = xy(i), o = glow > 0.5 ? 1 : 0, x0 = x * C, y0 = y * C, a = 0.6 + 0.4 * glow, L = 4, n = 4;
      g.rect(x0 + 1, y0 + 1, C - 2, C - 2).fill({ color: PAL.gold, alpha: 0.06 + 0.06 * glow });
      for (const [cx, cy, sx, sy] of [[x0 + n - o, y0 + n - o, 1, 1], [x0 + C - n + o, y0 + n - o, -1, 1], [x0 + n - o, y0 + C - n + o, 1, -1], [x0 + C - n + o, y0 + C - n + o, -1, -1]]) {
        g.rect(Math.min(cx, cx + sx * L), cy - (sy < 0 ? 1.5 : 0), L, 1.5).fill({ color: PAL.gold, alpha: a });
        g.rect(cx - (sx < 0 ? 1.5 : 0), Math.min(cy, cy + sy * L), 1.5, L).fill({ color: PAL.gold, alpha: a });
      }
      if (d.grab) g.circle(x0 + C / 2, y0 + C / 2, 2.5).fill({ color: PAL.gold, alpha: 0.6 });
    }
    const h = this.dests.get(this.hover);
    if (h) {
      for (const i of h.path) { const [x, y] = xy(i); g.rect(x * C + C / 2 - 1.5, y * C + C / 2 - 1.5, 3, 3).fill(PAL.gold); }
      const [x, y] = xy(this.hover);
      g.rect(x * C, y * C, C, C).fill({ color: PAL.gold, alpha: 0.18 });
    }
    if (!this.marks.length) return;
    const beat = 0.5 + 0.5 * Math.sin(this.t * Math.PI * 2 * this.pulse);
    for (const i of this.marks) {
      const [x, y] = xy(i), s = C * this.pop.v, x0 = x * C + (C - s) / 2, y0 = y * C + (C - s) / 2;
      g.rect(x0, y0, s, s).fill({ color: PAL.red, alpha: 0.2 + 0.28 * beat });
      g.rect(x0 + 0.75, y0 + 0.75, s - 1.5, s - 1.5).stroke({ width: 1.5, color: beat > 0.5 ? PAL.ember : PAL.red, alpha: 0.95 });
      const c = 3 + 2 * beat; // a cross-hair notch on each side
      g.rect(x0 + s / 2 - 0.75, y0 - 1, 1.5, c).fill(PAL.ember); g.rect(x0 + s / 2 - 0.75, y0 + s + 1 - c, 1.5, c).fill(PAL.ember);
      g.rect(x0 - 1, y0 + s / 2 - 0.75, c, 1.5).fill(PAL.ember); g.rect(x0 + s + 1 - c, y0 + s / 2 - 0.75, c, 1.5).fill(PAL.ember);
    }
    const d = (this.markDir + 2) % 4, fx = DX[d], fy = DY[d], rx = DX[(d + 1) % 4], ry = DY[(d + 1) % 4];
    const bx = this.from.x + fx * (15 + 2 * beat), by = this.from.y + fy * (15 + 2 * beat);
    g.poly([bx + fx * 5, by + fy * 5, bx + rx * 4, by + ry * 4, bx - rx * 4, by - ry * 4]).fill({ color: PAL.gold, alpha: 0.95 });
  }
}
