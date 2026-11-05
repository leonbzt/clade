// A worm as a chain of faceted segments that follows its head: it trails around corners when it tunnels, ripples as
// it crawls, stretches on the move and squashes on landing. Under mud it shows dim, as if seen through the silt.
// Used for you (parts drawn on the body) and for the rival priapulid.
import type { Graphics } from 'pixi.js';
import type { PartId, SlotKind } from '../rules/data';
import { C, PAL, SHADOW, dome, flat, mixRamp, ring, tri, type Ramp } from './shade';

export interface BodySlot { kind: SlotKind; side: string; seg: number; part: PartId | null }
interface Seg { x: number; y: number; r: number; a: number }

export class Worm {
  head = { x: 0, y: 0 };
  stretch = { v: 0 }; // -1 squashed … 1 stretched
  reach = { v: 0 }; // the proboscis, 0 in … 1 out
  flash = { v: 0 }; // a hit, 1 → 0
  moving = { v: 0 }; // how hard it ripples, 0 idle … 1 crawling
  heading = 0;
  size = 1;
  soft = false;
  slots: BodySlot[] = [];
  squash = 0.3; // the feel value, set by main
  private pts: { x: number; y: number }[] = [];
  private t = Math.random() * 10;

  constructor(private ramp: Ramp, private spiny = false, private scale = 1) {}

  private n() { return 4 + this.size * 2; }
  private spacing() { return (C * (0.42 + 0.11 * this.size) * this.scale) / (this.n() - 1); }
  private radius() { return C * (0.12 + 0.024 * this.size) * this.scale; }

  /** Put the head at (x, y) with the body laid out straight behind it. */
  place(x: number, y: number, heading: number) {
    this.head.x = x; this.head.y = y; this.heading = heading;
    const sp = this.spacing();
    this.pts = Array.from({ length: this.n() }, (_, k) => ({ x: x - Math.cos(heading) * sp * k, y: y - Math.sin(heading) * sp * k }));
  }

  /** A new size grows or shrinks the chain from the tail. */
  setBody(size: number, slots: BodySlot[], soft: boolean) {
    this.slots = slots.map((s) => ({ ...s })); this.soft = soft;
    if (size === this.size && this.pts.length) return;
    this.size = size;
    while (this.pts.length < this.n()) { const p = this.pts[this.pts.length - 1] ?? this.head; this.pts.push({ x: p.x, y: p.y }); }
    this.pts.length = this.n();
  }

  update(dt: number) {
    this.t += dt;
    if (!this.pts.length) return;
    const sp = this.spacing() * (1 + this.squash * this.stretch.v * 0.9);
    const p0 = this.pts[0], dx = this.head.x - p0.x, dy = this.head.y - p0.y;
    if (Math.hypot(dx, dy) > 0.05) this.heading = Math.atan2(dy, dx);
    p0.x = this.head.x; p0.y = this.head.y;
    for (let k = 1; k < this.pts.length; k++) {
      const a = this.pts[k - 1], b = this.pts[k];
      let ex = b.x - a.x, ey = b.y - a.y, d = Math.hypot(ex, ey);
      if (d < 1e-3) { ex = -Math.cos(this.heading); ey = -Math.sin(this.heading); d = 1; }
      b.x = a.x + (ex / d) * sp; b.y = a.y + (ey / d) * sp;
    }
  }

  /** The body as drawn this frame: each segment with its ripple, radius and direction. */
  segs(): Seg[] {
    const n = this.pts.length, R = this.radius() * (1 - 0.45 * this.squash * this.stretch.v), amp = 0.35 + 1.5 * this.moving.v;
    return this.pts.map((p, k) => {
      const q = this.pts[Math.max(0, k - 1)], w = this.pts[Math.min(n - 1, k + 1)];
      const a = k === 0 ? this.heading : Math.atan2(q.y - w.y, q.x - w.x);
      const off = Math.sin(this.t * (3 + 5 * this.moving.v) - k * 0.85) * amp * (0.25 + k / n);
      const taper = k === 0 ? 0.92 : 1 - 0.42 * ((k - 1) / Math.max(1, n - 2));
      return { x: p.x - Math.sin(a) * off, y: p.y + Math.cos(a) * off, r: R * taper, a };
    });
  }

  draw(g: Graphics, sh: Graphics, inMud: (x: number, y: number) => boolean) {
    if (!this.pts.length) return;
    const segs = this.segs(), n = segs.length;
    let ramp = this.soft ? mixRamp(this.ramp, PAL.pale[3], 0.45) : this.ramp;
    if (this.flash.v > 0) ramp = mixRamp(ramp, 0xffffff, this.flash.v * 0.8);
    const mudRamp = mixRamp(ramp, PAL.mudSeen[2], 0.4);
    const under = segs.map((s) => inMud(s.x, s.y));
    segs.forEach((s, k) => { if (!under[k]) flat(sh, ring(s.x + 2.5 * SHADOW.x * 2, s.y + 2.5 * SHADOW.y * 2, s.r * 1.05, s.r, 7, s.a), PAL.ink); });
    for (let k = n - 1; k >= 0; k--) { const s = segs[k]; flat(g, ring(s.x, s.y, s.r + 1.2, s.r + 1.2, 7, s.a), under[k] ? PAL.mudSeen[4] : PAL.ink, under[k] ? 0.75 : 1); }
    this.drawParts(g, segs, under, true);
    for (let k = n - 1; k >= 0; k--) {
      const s = segs[k], a = under[k] ? 0.85 : 1;
      dome(g, ring(s.x, s.y, s.r * 1.05, s.r, 7, s.a), s.x - s.r * 0.15, s.y - s.r * 0.2, s.r * 0.95, under[k] ? mudRamp : ramp, k % 2 ? -0.35 : 0.15, a);
    }
    this.drawParts(g, segs, under, false);
    const h = segs[0], mx = h.x + Math.cos(h.a) * h.r * 0.62, my = h.y + Math.sin(h.a) * h.r * 0.62; // the mouth
    flat(g, ring(mx, my, h.r * 0.32, h.r * 0.32, 5, h.a), PAL.ink, under[0] ? 0.5 : 0.9);
    if (this.spiny) { // the rival's spiny proboscis
      const h = segs[0], fx = Math.cos(h.a), fy = Math.sin(h.a);
      for (const o of [-0.7, 0, 0.7]) {
        const ax = Math.cos(h.a + o), ay = Math.sin(h.a + o);
        g.rect(h.x + ax * (h.r + 1.2) - 0.6, h.y + ay * (h.r + 1.2) - 0.6, 1.2, 1.2).fill(PAL.pale[4]);
      }
      g.rect(h.x + fx * h.r * 0.5 - 0.7, h.y + fy * h.r * 0.5 - 0.7, 1.4, 1.4).fill(PAL.ink);
    }
  }

  /** Parts: `back` ones sit under the body (gills, bristles, pouches), the rest on top (glands, plates, eyes). */
  private drawParts(g: Graphics, segs: Seg[], under: boolean[], back: boolean) {
    const n = segs.length, pairs = Math.max(1, this.slots.filter((s) => s.kind === 'side').length / 2);
    for (const slot of this.slots) {
      if (!slot.part) continue;
      const k = slot.kind === 'head' ? 0 : slot.kind === 'tail' ? n - 1 : Math.round(1 + ((slot.seg + 1) * (n - 2)) / (pairs + 1));
      const s = segs[Math.min(n - 1, k)], fx = Math.cos(s.a), fy = Math.sin(s.a), rx = -fy, ry = fx;
      const side = slot.kind === 'side' ? (slot.side === 'left' ? -1 : 1) : 0, a = under[k] ? 0.5 : 1;
      const at = (f: number, r: number): [number, number] => [s.x + fx * f + rx * r * side, s.y + fy * f + ry * r * side];
      const p = slot.part;
      if (back) {
        if (p === 'gill') for (const f of [-1.5, 1.5]) { const [x, y] = at(f, s.r + 3); tri(g, [s.x + fx * f, s.y + fy * f, 2], [x, y, 0], [x - fx * 2, y - fy * 2, 0], PAL.gill, 0.5, a); }
        if (p === 'chaetae') for (const f of [-2, 0, 2]) { const [x, y] = at(f, s.r + 3.2); g.poly([s.x + fx * f, s.y + fy * f, x, y, x + fx, y + fy]).fill({ color: PAL.pale[3], alpha: a }); }
        if (p === 'pouch') for (const f of [-1.6, 1.6]) {
          const [x, y] = slot.kind === 'tail' ? [s.x - fx * (s.r + 2) + rx * f, s.y - fy * (s.r + 2) + ry * f] : at(f, s.r + 1.8);
          dome(g, ring(x, y, 1.9, 1.9, 5), x - 0.4, y - 0.4, 1.4, PAL.amber, 0.4, a);
        }
        if (p === 'deep') { const bx = s.x - fx * (s.r + 2.5), by = s.y - fy * (s.r + 2.5); flat(g, ring(bx, by, 3, 2, 4, s.a), PAL.mudDark[0], a); }
        if (p === 'proboscis') {
          const len = 2.5 + this.reach.v * 9, tx = s.x + fx * (s.r + len), ty = s.y + fy * (s.r + len);
          tri(g, [s.x + rx * 1.6, s.y + ry * 1.6, 1], [s.x - rx * 1.6, s.y - ry * 1.6, 1], [tx, ty, 2], PAL.flesh, 0.3, a);
          for (const o of [-1, 1]) g.rect(tx - fx * 2 + rx * o * 1.4 - 0.5, ty - fy * 2 + ry * o * 1.4 - 0.5, 1, 1).fill(PAL.pale[4]);
        }
        continue;
      }
      if (p === 'gut') { const [x, y] = at(0, s.r * 0.3); dome(g, ring(x, y, s.r * 0.5, s.r * 0.42, 5, s.a), x - 0.4, y - 0.4, 1.4, PAL.amber, 0.6, 0.9 * a); }
      if (p === 'sclerite') {
        const spots: [number, number][] = slot.kind === 'tail' ? [[-s.r * 0.6, -s.r * 0.75], [-s.r * 0.6, s.r * 0.75], [-s.r * 1.05, 0]] : [[-1.4, s.r * 0.85], [1.4, s.r * 0.85]];
        for (const [f, r] of spots) {
          const x = s.x + fx * f + rx * r * (side || 1), y = s.y + fy * f + ry * r * (side || 1);
          flat(g, ring(x, y, 1.9, 1.9, 4, s.a + 0.78), PAL.ink, a);
          dome(g, ring(x, y, 1.3, 1.3, 4, s.a + 0.78), x - 0.3, y - 0.3, 1, PAL.pale, 0.5, a);
        }
      }
      if (p === 'eye') for (const o of [-1, 1]) {
        const x = s.x + fx * s.r * 0.35 + rx * o * s.r * 0.55, y = s.y + fy * s.r * 0.35 + ry * o * s.r * 0.55;
        g.rect(x - 1, y - 1, 2, 2).fill({ color: PAL.ink, alpha: a }); g.rect(x - 1, y - 1, 1, 1).fill({ color: 0xffffff, alpha: a });
      }
      if (p === 'progenesis') g.rect(s.x - 1, s.y - 1, 2, 2).fill({ color: 0xf59be0, alpha: a });
    }
  }
}
