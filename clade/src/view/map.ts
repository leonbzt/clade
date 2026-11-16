// The bare map: the ground painted one pixel per tile, scaled by whole numbers. Drag to pan; wheel or pinch to zoom
// in integer steps; a tap reports the tile. Labels and cards live in the Svelte shell, which follows `onCamera`.
import { Application, Graphics, Sprite, Texture } from 'pixi.js';
import { P, rgb } from '../data/palette';
import type { Ground } from '../sim/ground';
import type { Habitats } from '../sim/habitats';
import { LivingPaint } from './living';
import { paintIndices, toRGBA, type MapMode } from './paint';

export interface Camera { x: number; y: number; z: number } // the map's top-left on screen, and px per tile
export const ZOOM = { min: 1, max: 16 };

export class MapView {
  camera: Camera = { x: 0, y: 0, z: 4 };
  onCamera: (c: Camera) => void = () => {};
  onTap: (tile: number) => void = () => {};
  private app = new Application();
  private canvas = document.createElement('canvas');
  private sprite = new Sprite();
  private layer = new Graphics();
  living = new LivingPaint(this.layer); // capsules over the ground, in screen pixels
  private tex: Texture | null = null;
  private w = 0;
  private h = 0;
  private ground: Habitats | null = null;

  async init(host: HTMLElement) {
    await this.app.init({ resizeTo: host, background: rgb(P.open), antialias: false, roundPixels: true, autoDensity: true, resolution: devicePixelRatio || 1 });
    host.appendChild(this.app.canvas);
    this.app.stage.addChild(this.sprite, this.layer);
    this.app.ticker.add((t) => this.living.tick(t.deltaMS / 1000, this.camera));
    this.input(this.app.canvas); // the canvas, not the host: the card above it keeps its own taps
  }

  show(g: Ground, hab: Habitats, mode: MapMode, selected: number) {
    if (g.w !== this.w || g.h !== this.h) {
      this.w = this.canvas.width = g.w; this.h = this.canvas.height = g.h;
      this.tex?.destroy(true);
      this.tex = Texture.from(this.canvas);
      this.tex.source.scaleMode = 'nearest';
      this.sprite.texture = this.tex;
    }
    if (this.ground !== hab) {
      this.ground = hab;
      this.living.setGround(hab, g.w);
    }
    this.canvas.getContext('2d')!.putImageData(new ImageData(toRGBA(paintIndices(g, hab, mode, selected)), g.w, g.h), 0, 0);
    this.tex!.source.update();
  }

  /** The largest whole zoom that shows the whole map (at least 2), centred. */
  fit() {
    const { width, height } = this.app.screen;
    const z = Math.max(2, Math.min(ZOOM.max, Math.floor(Math.min(width / this.w, height / this.h))));
    this.set({ z, x: Math.round((width - this.w * z) / 2), y: Math.round((height - this.h * z) / 2) });
  }

  /** Zoom to `z`, keeping the screen point (sx, sy) over the same spot of the map. */
  zoomAt(z: number, sx: number, sy: number) {
    const c = this.camera, to = Math.max(ZOOM.min, Math.min(ZOOM.max, Math.round(z)));
    if (to === c.z) return;
    this.set({ z: to, x: Math.round(sx - ((sx - c.x) * to) / c.z), y: Math.round(sy - ((sy - c.y) * to) / c.z) });
  }

  /** The largest whole zoom (2 to 8) that shows these tiles with room for labels, centred on them. */
  frame(tiles: { x: number; y: number }[], pad = { x: 160, y: 240 }) {
    if (!tiles.length) return this.fit();
    const xs = tiles.map((t) => t.x), ys = tiles.map((t) => t.y), { width, height } = this.app.screen;
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const z = Math.max(2, Math.min(8, Math.floor(Math.min((width - pad.x) / (x1 - x0 + 1), (height - pad.y) / (y1 - y0 + 1)))));
    this.look((x0 + x1) / 2, (y0 + y1) / 2, z);
  }

  /** Centre the tile (tx, ty) at zoom z. */
  look(tx: number, ty: number, z: number) {
    const { width, height } = this.app.screen;
    this.set({ z, x: Math.round(width / 2 - (tx + 0.5) * z), y: Math.round(height / 2 - (ty + 0.5) * z) });
  }

  tileAt(sx: number, sy: number): number {
    const c = this.camera, tx = Math.floor((sx - c.x) / c.z), ty = Math.floor((sy - c.y) / c.z);
    return tx < 0 || ty < 0 || tx >= this.w || ty >= this.h ? -1 : ty * this.w + tx;
  }

  private set(c: Camera) {
    this.camera = c;
    this.sprite.position.set(c.x, c.y);
    this.sprite.scale.set(c.z);
    this.onCamera(c);
  }

  private input(el: HTMLElement) {
    const down = new Map<number, { x: number; y: number }>();
    let moved = 0, pinch = 0;
    const local = (e: PointerEvent | WheelEvent) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      down.set(e.pointerId, local(e));
      if (down.size === 1) moved = 0;
      if (down.size === 2) pinch = spread(down);
    });
    el.addEventListener('pointermove', (e) => {
      const was = down.get(e.pointerId);
      if (!was) return;
      const at = local(e);
      down.set(e.pointerId, at);
      if (down.size === 1) {
        moved += Math.abs(at.x - was.x) + Math.abs(at.y - was.y);
        if (moved > 6) this.set({ ...this.camera, x: this.camera.x + at.x - was.x, y: this.camera.y + at.y - was.y });
      } else if (down.size === 2) {
        moved = 99;
        const now = spread(down), mid = middle(down);
        if (now > pinch * 1.3) { this.zoomAt(this.camera.z + 1, mid.x, mid.y); pinch = now; }
        else if (now < pinch / 1.3) { this.zoomAt(this.camera.z - 1, mid.x, mid.y); pinch = now; }
      }
    });
    const up = (e: PointerEvent) => {
      if (!down.has(e.pointerId)) return;
      const at = local(e);
      down.delete(e.pointerId);
      if (down.size === 0 && moved <= 6) this.onTap(this.tileAt(at.x, at.y));
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const at = local(e);
      this.zoomAt(this.camera.z + (e.deltaY < 0 ? 1 : -1), at.x, at.y);
    }, { passive: false });
  }
}

const spread = (m: Map<number, { x: number; y: number }>) => { const [a, b] = [...m.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
const middle = (m: Map<number, { x: number; y: number }>) => { const [a, b] = [...m.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
