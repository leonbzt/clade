// The camera: fit the board to its area, pan with a drag, pinch or wheel to zoom, shake on a strike.
// Screen positions are CSS pixels inside the canvas.
import type { Container } from 'pixi.js';
import { BH, BW } from './floor';

export class Camera {
  zoom = 1;
  fit = 1;
  look = { x: BW / 2, y: BH / 2 };
  zoomSpeed = 1; // the feel value
  shakeAmt = 0; // the feel value, in screen pixels
  private shakeT = 0;
  private shakeK = 0;
  private w = 1;
  private h = 1;
  private ptrs = new Map<number, { x: number; y: number }>();
  private downAt = { x: 0, y: 0 };
  private dragging = false;
  private multi = false;
  private pinchD = 0;
  private fitted = false;

  constructor(private world: Container, private el: HTMLElement, private onTap: (x: number, y: number) => void, private onHover: (x: number, y: number) => void) {
    el.addEventListener('pointerdown', (e) => this.down(e));
    el.addEventListener('pointermove', (e) => this.move(e));
    el.addEventListener('pointerup', (e) => this.up(e));
    el.addEventListener('pointercancel', (e) => { this.ptrs.delete(e.pointerId); this.multi = true; });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') this.onHover(-1e9, -1e9); });
    el.addEventListener('wheel', (e) => { e.preventDefault(); const p = this.local(e); this.zoomAt(p.x, p.y, Math.pow(1.12, -Math.sign(e.deltaY) * this.zoomSpeed)); }, { passive: false });
  }

  resize(w: number, h: number) {
    const old = this.fit;
    this.w = w; this.h = h;
    this.fit = Math.min(w / (BW + 16), h / (BH + 22));
    this.zoom = this.fitted ? (this.zoom / old) * this.fit : this.fit;
    this.fitted = true;
    this.clamp();
  }

  reset() { this.zoom = this.fit; this.look.x = BW / 2; this.look.y = BH / 2; }

  shake(strength: number) { this.shakeK = this.shakeAmt * strength; this.shakeT = 1; }

  tick(dt: number) {
    this.shakeT = Math.max(0, this.shakeT - dt / 0.45);
    const s = this.shakeK * this.shakeT * this.shakeT, ox = (Math.random() * 2 - 1) * s, oy = (Math.random() * 2 - 1) * s;
    this.world.scale.set(this.zoom);
    this.world.position.set(this.w / 2 - this.look.x * this.zoom + ox, this.h / 2 - this.look.y * this.zoom + oy);
  }

  toWorld(sx: number, sy: number) { return { x: this.look.x + (sx - this.w / 2) / this.zoom, y: this.look.y + (sy - this.h / 2) / this.zoom }; }
  toScreen(wx: number, wy: number) { return { x: this.w / 2 + (wx - this.look.x) * this.zoom, y: this.h / 2 + (wy - this.look.y) * this.zoom }; }

  private clamp() {
    this.zoom = Math.min(this.fit * 3, Math.max(this.fit * 0.8, this.zoom));
    this.look.x = Math.min(BW, Math.max(0, this.look.x));
    this.look.y = Math.min(BH, Math.max(0, this.look.y));
  }

  private zoomAt(sx: number, sy: number, f: number) {
    const before = this.toWorld(sx, sy);
    this.zoom *= f; this.clamp();
    const after = this.toWorld(sx, sy);
    this.look.x += before.x - after.x; this.look.y += before.y - after.y;
    this.clamp();
  }

  private local(e: { clientX: number; clientY: number }) { const r = this.el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  private pinch() {
    const [a, b] = [...this.ptrs.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  private down(e: PointerEvent) {
    this.el.setPointerCapture(e.pointerId);
    this.ptrs.set(e.pointerId, this.local(e));
    if (this.ptrs.size === 1) { this.downAt = this.local(e); this.dragging = false; this.multi = false; }
    else { this.multi = true; this.pinchD = this.pinch().d; }
  }

  private move(e: PointerEvent) {
    const p = this.local(e), prev = this.ptrs.get(e.pointerId);
    if (!prev) { if (e.pointerType === 'mouse') { const w = this.toWorld(p.x, p.y); this.onHover(w.x, w.y); } return; }
    this.ptrs.set(e.pointerId, p);
    if (this.ptrs.size === 1) {
      if (!this.dragging && Math.hypot(p.x - this.downAt.x, p.y - this.downAt.y) > (e.pointerType === 'mouse' ? 6 : 12)) this.dragging = true;
      if (this.dragging) { this.look.x -= (p.x - prev.x) / this.zoom; this.look.y -= (p.y - prev.y) / this.zoom; this.clamp(); }
    } else if (this.ptrs.size === 2) {
      const pm = this.pinch();
      if (this.pinchD > 0) this.zoomAt(pm.x, pm.y, Math.pow(pm.d / this.pinchD, this.zoomSpeed));
      this.pinchD = pm.d;
      this.look.x -= (p.x - prev.x) / this.zoom / 2; this.look.y -= (p.y - prev.y) / this.zoom / 2; this.clamp();
    }
  }

  private up(e: PointerEvent) {
    if (!this.ptrs.has(e.pointerId)) return;
    this.ptrs.delete(e.pointerId);
    if (this.ptrs.size === 0 && !this.dragging && !this.multi) { const p = this.local(e), w = this.toWorld(p.x, p.y); this.onTap(w.x, w.y); }
    else if (this.ptrs.size === 1) this.dragging = true; // one finger left after a pinch: keep panning, never tap
  }
}
