// Little things in the water: bursts of faceted bits when you eat, puffs, the skins you shed when you moult, the
// clutches you lay (they stay on the board for the Life), and marine snow drifting through.
import { Graphics } from 'pixi.js';
import { PAL, dome, flat, hash, ring, type Ramp } from './shade';
import { BW, BH } from './floor';

interface Bit { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; max: number; color: number; s: number }
interface Puff { x: number; y: number; t: number; max: number; color: number }
interface Husk { segs: { x: number; y: number; r: number; a: number }[]; t: number }
interface Ring { x: number; y: number; r: number; t: number; color: number }

export class Fx {
  under = new Graphics(); // on the floor, below the creatures
  over = new Graphics(); // in the water, above everything
  private bits: Bit[] = [];
  private puffs: Puff[] = [];
  private husks: Husk[] = [];
  private rings: Ring[] = [];
  private clutches: { x: number; y: number; n: number; seed: number; t: number }[] = [];
  private snow = Array.from({ length: 34 }, (_, k) => ({ x: hash(k, 1, 31) * BW, y: hash(k, 2, 31) * BH, s: 0.6 + hash(k, 3, 31) * 0.8, p: hash(k, 4, 31) * 6 }));
  private t = 0;

  clear() { this.bits = []; this.puffs = []; this.husks = []; this.clutches = []; this.rings = []; }

  burst(x: number, y: number, ramp: Ramp, n: number, speed = 1) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, v = (18 + Math.random() * 34) * speed;
      this.bits.push({ x, y, z: 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.8, vz: 20 + Math.random() * 30 * speed, life: 0, max: 0.45 + Math.random() * 0.35, color: ramp[2 + (k % 3)], s: 1.2 + Math.random() * 1.6 });
    }
    if (n > 0) this.puffs.push({ x, y, t: 0, max: 0.45, color: ramp[4] });
  }

  /** An expanding ring out to radius r (a verb's reach). */
  ring(x: number, y: number, r: number, color: number) { this.rings.push({ x, y, r, t: 0, color }); }

  husk(segs: Husk['segs']) { this.husks.push({ segs: segs.map((s) => ({ ...s })), t: 0 }); }
  clutch(x: number, y: number, n: number) { this.clutches.push({ x, y, n, seed: this.clutches.length + 1, t: 0 }); }

  tick(dt: number) {
    this.t += dt;
    const u = this.under.clear(), o = this.over.clear();
    for (const c of this.clutches) { // eggs: small amber domes in a cluster, popping in
      c.t = Math.min(1, c.t + dt * 3);
      for (let k = 0; k < Math.min(9, c.n); k++) {
        const ang = k * 2.4 + c.seed, r = 1.5 + Math.sqrt(k) * 2.3, ex = c.x + Math.cos(ang) * r, ey = c.y + Math.sin(ang) * r * 0.8, s = 1.5 * Math.min(1, c.t * 1.5 - k * 0.08);
        if (s <= 0) continue;
        flat(u, ring(ex, ey, s + 0.8, s + 0.8, 5), PAL.ink, 0.8);
        dome(u, ring(ex, ey, s, s, 5), ex - 0.4, ey - 0.4, s, PAL.amber, 0.5);
      }
    }
    this.husks = this.husks.filter((h) => (h.t += dt) < 2.2);
    for (const h of this.husks) {
      const a = 0.55 * (1 - h.t / 2.2);
      for (const s of h.segs) flat(u, ring(s.x, s.y, s.r * 1.1, s.r, 7, s.a), PAL.pale[3], a);
    }
    this.rings = this.rings.filter((r) => (r.t += dt) < 0.6);
    for (const r of this.rings) { const k = r.t / 0.6; o.circle(r.x, r.y, 4 + (r.r - 4) * Math.sqrt(k)).stroke({ width: 2, color: r.color, alpha: 0.8 * (1 - k) }); }
    this.puffs = this.puffs.filter((p) => (p.t += dt) < p.max);
    for (const p of this.puffs) {
      const k = p.t / p.max, r = 3 + k * 11;
      o.circle(p.x, p.y, r).stroke({ width: 1.5, color: p.color, alpha: 0.7 * (1 - k) });
    }
    this.bits = this.bits.filter((b) => (b.life += dt) < b.max);
    for (const b of this.bits) {
      b.vx *= 1 - dt * 3; b.vy *= 1 - dt * 3; b.vz -= 90 * dt;
      b.x += b.vx * dt; b.y += b.vy * dt; b.z = Math.max(0, b.z + b.vz * dt);
      const a = 1 - b.life / b.max, s = b.s * (0.6 + 0.4 * a), y = b.y - b.z;
      o.poly([b.x, y - s, b.x + s, y, b.x, y + s, b.x - s, y]).fill({ color: b.color, alpha: a });
    }
    for (const m of this.snow) {
      m.y += dt * 2.2 * m.s; m.x += Math.sin(this.t * 0.6 + m.p) * dt * 1.5;
      if (m.y > BH) m.y -= BH;
      o.rect(m.x, m.y, m.s, m.s).fill({ color: 0xd9f4ea, alpha: 0.25 + 0.15 * Math.sin(this.t + m.p) });
    }
  }
}
