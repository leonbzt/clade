// The island map, painted per pixel: ground by kind (coast, beaches, lava, soil, wet), streams and vents; then each
// layer's cover dithered over its tiles by how full the slot is, coloured by the species that hold it. Cover grows
// out from the patch's seed tile, so a fresh line starts as a spot and widens.
import { BARE, BEACH, F_CRACK, F_SPRING, F_STREAM, F_VENT, FOREST, LAVA, SEA, WET } from '../data/island';
import { COVER, PAL, TILE_PX as T } from '../data/look';
import { halfYear } from '../sim/garden';
import type { Game } from '../sim/game';
import type { Habitats } from '../sim/habitats';
import { hash2, noise, rgba32 } from './pixels';

const GROUND_OF: Record<number, string[]> = { [LAVA]: PAL.lava, [BARE]: PAL.bare, [FOREST]: PAL.forest, [WET]: PAL.wet };

export class IslandPainter {
  readonly w: number; readonly h: number;
  private img: ImageData; private px: Uint32Array; private base: Uint32Array;
  private thr: Float32Array[]; private pickAt: Float32Array; private shadeAt: Uint8Array;
  private rank = new Float32Array(0); private hab: Habitats | null = null; private colors = new Map<string, number[]>();

  constructor(private g: Game) {
    this.w = g.isl.w * T; this.h = g.isl.h * T;
    this.img = new ImageData(this.w, this.h);
    this.px = new Uint32Array(this.img.data.buffer);
    this.base = new Uint32Array(this.w * this.h);
    const n = this.w * this.h;
    this.thr = COVER.map(() => new Float32Array(n)); this.pickAt = new Float32Array(n); this.shadeAt = new Uint8Array(n);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const p = y * this.w + x;
      COVER.forEach((c, l) => { this.thr[l][p] = 0.7 * noise(x, y, c.scale, 30 + l) + 0.3 * hash2(x, y, 40 + l); });
      this.pickAt[p] = noise(x, y, 4, 50);
      this.shadeAt[p] = Math.min(2, Math.floor(noise(x, y, 2.5, 60) * 3));
    }
  }

  setGame(g: Game) { this.g = g; this.hab = null; }

  private kindAt(tx: number, ty: number): number {
    const isl = this.g.isl;
    tx = Math.max(0, Math.min(isl.w - 1, tx)); ty = Math.max(0, Math.min(isl.h - 1, ty));
    return isl.kind[ty * isl.w + tx];
  }
  /** Bilinear share of tiles around a pixel that pass `on`, measured between tile centres. */
  private field(x: number, y: number, on: (k: number) => boolean): number {
    const u = x / T - 0.5, v = y / T - 0.5, x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
    const at = (a: number, b: number) => (on(this.kindAt(a, b)) ? 1 : 0);
    return (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy) + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy;
  }

  /** The ground: once, and again whenever a tile changes kind (the habitats are found anew then). */
  private paintBase() {
    const isl = this.g.isl;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const p = y * this.w + x, tx = (x / T) | 0, ty = (y / T) | 0, i = ty * isl.w + tx, k = isl.kind[i], f = isl.feature[i];
      const wob = (noise(x, y, 5, 21) - 0.5) * 0.45, fine = hash2(x, y, 1);
      const land = this.field(x, y, (q) => q !== SEA) + wob, rock = this.field(x, y, (q) => q !== SEA && q !== BEACH) + wob;
      let c: string;
      if (land < 0.5) c = land > 0.42 ? PAL.foam : land > 0.2 ? PAL.shallow : noise(x, y, 22, 4) > 0.7 ? PAL.sea : PAL.seaDeep;
      else if (rock < 0.5 || k === BEACH) c = fine > 0.985 ? PAL.sandDark : noise(x, y, 7, 5) > 0.6 ? PAL.sandLight : PAL.sand;
      else {
        const kk = k === SEA || k === BEACH ? LAVA : k, pal = GROUND_OF[kk], n = noise(x, y, 9, 6 + kk);
        c = pal[n > 0.62 ? 2 : n > 0.35 ? 1 : 0];
        if (kk === LAVA && Math.abs(noise(x, y, f === F_CRACK ? 5 : 12, 7) - 0.5) < (f === F_CRACK ? 0.05 : 0.012)) c = PAL.crack;
        if (f === F_STREAM && Math.abs(noise(x, y, 4, 8) - 0.5) < 0.22) c = PAL.stream;
        if (f === F_SPRING && Math.hypot(x - (tx + 0.5) * T, y - (ty + 0.5) * T) < T * 0.45) c = PAL.spring;
        if (f === F_VENT) { const d = Math.hypot(x - (tx + 0.5) * T, y - (ty + 0.5) * T) + fine; if (d < T * 0.6) c = d < T * 0.3 ? '#f0a040' : PAL.lavaGlow; }
      }
      this.base[p] = rgba32(c);
    }
    // Each patch's tiles ranked by distance from its seed tile: cover fills the near ones first.
    this.rank = new Float32Array(isl.w * isl.h);
    for (const pt of this.g.hab.patches) {
      const ax = pt.at % isl.w, ay = (pt.at / isl.w) | 0;
      const order = [...pt.tiles].sort((a, b) => Math.hypot(a % isl.w - ax, ((a / isl.w) | 0) - ay) - Math.hypot(b % isl.w - ax, ((b / isl.w) | 0) - ay));
      order.forEach((t, r) => { this.rank[t] = order.length > 1 ? r / (order.length - 1) : 0; });
    }
    this.hab = this.g.hab;
  }

  private shades(hex: string, l: number): number[] {
    const key = hex + l;
    let s = this.colors.get(key);
    if (!s) { s = COVER[l].shade.map((k) => rgba32(hex, k)); this.colors.set(key, s); }
    return s;
  }

  /** Paint the whole map: the ground, then mat, herb and canopy cover. */
  paint(ctx: CanvasRenderingContext2D) {
    const g = this.g, isl = g.isl;
    if (this.hab !== g.hab) this.paintBase();
    this.px.set(this.base);
    const wet = (halfYear(g.garden.t) - 1) / 0.25; // −1 dry … +1 wet
    // per tile and layer: how full (0..1 locally) and who holds it (cumulative shares)
    for (const pt of g.hab.patches) {
      const life = g.garden.life[pt.id];
      for (let l = 0; l < 3; l++) {
        const slot = life.slots[l], cap = life.cap[l];
        if (!slot || !slot.length || cap <= 0) continue;
        let total = 0;
        for (const e of slot) total += e.g;
        const fill = Math.min(1, total / cap) * COVER[l].show, cols = slot.map((e) => this.shades(g.species[e.sp].color, l));
        const cum: number[] = []; let acc = 0;
        for (const e of slot) { acc += e.g / total; cum.push(acc); }
        for (const t of pt.tiles) {
          const local = Math.max(0, Math.min(1, fill * 1.8 - this.rank[t] * 0.8 * (1 - fill)));
          if (local <= 0.02) continue;
          const tx = t % isl.w, ty = (t / isl.w) | 0;
          for (let y = ty * T; y < ty * T + T; y++) for (let x = tx * T; x < tx * T + T; x++) {
            const p = y * this.w + x;
            if (this.thr[l][p] > local) continue;
            const h = this.pickAt[p];
            let s = 0;
            while (s < cum.length - 1 && h > cum[s]) s++;
            this.px[p] = cols[s][this.shadeAt[p]];
          }
        }
      }
    }
    ctx.putImageData(this.img, 0, 0);
    for (const v of isl.vents) { // vents glow through any cover
      const x = (v % isl.w + 0.5) * T, y = (((v / isl.w) | 0) + 0.5) * T;
      ctx.fillStyle = '#b8502a'; ctx.beginPath(); ctx.arc(x, y, T * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f0a040'; ctx.beginPath(); ctx.arc(x, y, T * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    if (Math.abs(wet) > 0.05) {
      ctx.fillStyle = wet > 0 ? `rgba(60,120,160,${0.08 * wet})` : `rgba(200,160,80,${-0.08 * wet})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }
  }
}

/** Your lines on the map: a ring per patch where they hold grams, in the colour of the biggest, sized by share. */
export function markYours(ctx: CanvasRenderingContext2D, g: Game) {
  g.hab.patches.forEach((p) => {
    const life = g.garden.life[p.id];
    let best = -1, bg = 0, mine = 0, cap = 0;
    life.slots.forEach((slot, l) => slot?.forEach((e) => {
      if (g.species[e.sp].native) return;
      mine += e.g; cap = Math.max(cap, life.cap[l]);
      if (e.g > bg) { bg = e.g; best = e.sp; }
    }));
    if (best < 0) return;
    const r = 2 + 3 * Math.sqrt(Math.min(1, mine / (cap || 1)));
    ctx.strokeStyle = '#111'; ctx.fillStyle = g.species[best].color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc((p.x + 0.5) * T, (p.y + 0.5) * T, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
}

/** Outline a patch's tiles (and optionally fill them) on the map. */
export function outlinePatch(ctx: CanvasRenderingContext2D, g: Game, patch: number, stroke: string, fill?: string) {
  const isl = g.isl, of = g.hab.of, pt = g.hab.patches[patch];
  if (!pt) return;
  ctx.strokeStyle = stroke; ctx.lineWidth = 1;
  if (fill) ctx.fillStyle = fill;
  ctx.beginPath();
  for (const t of pt.tiles) {
    const x = (t % isl.w) * T, y = ((t / isl.w) | 0) * T;
    if (fill) ctx.fillRect(x, y, T, T);
    const same = (dx: number, dy: number) => {
      const nx = t % isl.w + dx, ny = ((t / isl.w) | 0) + dy;
      return nx >= 0 && ny >= 0 && nx < isl.w && ny < isl.h && of[ny * isl.w + nx] === patch;
    };
    if (!same(0, -1)) { ctx.moveTo(x, y + 0.5); ctx.lineTo(x + T, y + 0.5); }
    if (!same(0, 1)) { ctx.moveTo(x, y + T - 0.5); ctx.lineTo(x + T, y + T - 0.5); }
    if (!same(-1, 0)) { ctx.moveTo(x + 0.5, y); ctx.lineTo(x + 0.5, y + T); }
    if (!same(1, 0)) { ctx.moveTo(x + T - 0.5, y); ctx.lineTo(x + T - 0.5, y + T); }
  }
  ctx.stroke();
}

/** Dim the patches a form can't grow in (while you choose where to plant a sprout). */
export function dimExcept(ctx: CanvasRenderingContext2D, g: Game, ok: (patch: number) => boolean) {
  const isl = g.isl;
  ctx.fillStyle = 'rgba(10,12,16,0.55)';
  for (let t = 0; t < isl.w * isl.h; t++) {
    const k = isl.kind[t];
    if (k === SEA) continue;
    const p = g.hab.of[t];
    if (p >= 0 && ok(p)) continue;
    ctx.fillRect((t % isl.w) * T, ((t / isl.w) | 0) * T, T, T);
  }
}
