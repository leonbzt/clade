// Draws the whole garden each frame: ground, plants (back to front), steam, sparkles and overlays.
import { NUM } from '../data/numbers';
import { PAL, TIER_COLORS, ZONE } from '../data/palette';
import { CALM_MIN_GROWTH, SPRITE_DENSITY } from '../data/view';
import { SPECIES, SPECIES_INDEX } from '../data/species';
import { SEA, VENT, type State } from '../sim/state';
import { allStats, fit, tierOf } from '../sim/stats';
import { canFoundAt } from '../sim/commands';
import { hash2 } from './pixels';
import { SPRITE, sprite } from './plants';
import { TerrainLayer } from './terrain';

const T = NUM.map.tile;
export type Overlay = 'none' | 'soil' | 'zones';
export type ViewOpts = { placing: string | null; hover: number; overlay: Overlay; time: number; detail: boolean };

export class GardenRenderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private terrain: TerrainLayer;
  private lastTerrainTick = -1;

  constructor(private s: State, canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = s.w * T; canvas.height = s.h * T;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.terrain = new TerrainLayer(s);
    this.terrain.update(true);
  }

  draw(o: ViewOpts) {
    const s = this.s, ctx = this.ctx;
    if (s.tick - this.lastTerrainTick >= 5 || s.tick < this.lastTerrainTick) { this.terrain.update(); this.lastTerrainTick = s.tick; }
    ctx.drawImage(this.terrain.canvas, 0, 0);
    this.sparkles(o.time);
    if (o.overlay === 'zones') { this.zonesOverlay(); return this.hoverOrPlacing(o); }
    this.plants(o.detail);
    this.steam(o.time);
    if (o.overlay === 'soil') this.soilOverlay();
    this.hoverOrPlacing(o);
  }

  private hoverOrPlacing(o: ViewOpts) {
    if (o.placing) this.fitOverlay(o.placing, o.hover);
    else if (o.hover >= 0) this.outline(o.hover, PAL.text);
  }

  private plants(detail: boolean) {
    const s = this.s, density = SPRITE_DENSITY[detail ? 'detail' : 'calm'];
    for (let i = 0; i < s.occ.length; i++) {
      const sp = s.occ[i];
      if (sp < 0) continue;
      const def = SPECIES[sp], g = s.growth[i];
      // Only some tiles get a sprite; the rest show the species' ground cover.
      if (hash2(i, 8) >= density[def.id] || (!detail && g < CALM_MIN_GROWTH)) continue;
      const stage = g < 0.35 ? 0 : g < 0.7 ? 1 : 2;
      const img = sprite(def.id, Math.floor(hash2(i, 5) * SPRITE.variants), { stage, traits: s.traits[def.id] });
      // A small fixed jitter per tile hides the grid.
      const jx = Math.floor(hash2(i, 6) * 5) - 2, jy = Math.floor(hash2(i, 7) * 5) - 2;
      this.ctx.drawImage(img, (i % s.w) * T + SPRITE.ox + jx, ((i / s.w) | 0) * T + SPRITE.oy + jy);
    }
  }

  private steam(time: number) {
    const s = this.s, ctx = this.ctx;
    for (let i = 0; i < s.terrain.length; i++) {
      if (s.terrain[i] !== VENT) continue;
      const cx = (i % s.w) * T + 8, cy = ((i / s.w) | 0) * T + 8;
      for (let k = 0; k < 4; k++) {
        const t = ((time / 2600 + k / 4 + hash2(i, k)) % 1), size = 2 + Math.floor(t * 3);
        ctx.globalAlpha = 0.55 * (1 - t);
        ctx.fillStyle = PAL.steam;
        ctx.fillRect(Math.round(cx + Math.sin(t * 6 + k) * 3 - size / 2), Math.round(cy - t * 22), size, size);
      }
    }
    ctx.globalAlpha = 1;
  }

  private sparkles(time: number) {
    const s = this.s, ctx = this.ctx, frame = Math.floor(time / 400);
    ctx.fillStyle = PAL.foam;
    for (let k = 0; k < 40; k++) {
      const i = Math.floor(hash2(k, frame) * s.terrain.length);
      if (s.terrain[i] !== SEA) continue;
      ctx.fillRect((i % s.w) * T + Math.floor(hash2(k, frame, 1) * 14), ((i / s.w) | 0) * T + Math.floor(hash2(k, frame, 2) * 14), 2, 1);
    }
  }

  private fitOverlay(speciesId: string, hover: number) {
    // Darken the garden, then paint each tile's tier as a clear cell: a heatmap while you choose.
    const s = this.s, ctx = this.ctx, sp = SPECIES_INDEX[speciesId], all = allStats(s), st = all[sp];
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < s.occ.length; i++) {
      if (s.terrain[i] === SEA) continue;
      const tier = tierOf(fit(s, st, sp, i));
      if (!tier) continue;
      // Faded: it would fit, but it's already yours or a stronger species holds it.
      ctx.globalAlpha = canFoundAt(s, speciesId, i, all) ? 0.6 : 0.16;
      ctx.fillStyle = TIER_COLORS[tier];
      ctx.fillRect((i % s.w) * T + 1, ((i / s.w) | 0) * T + 1, T - 2, T - 2);
    }
    ctx.globalAlpha = 1;
    if (hover < 0) return;
    const hx = hover % s.w, hy = (hover / s.w) | 0, r = NUM.founding.patch;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = hx + dx, y = hy + dy;
      if (Math.abs(dx) + Math.abs(dy) <= r && x >= 0 && y >= 0 && x < s.w && y < s.h) this.outline(y * s.w + x, dx || dy ? PAL.textDim : PAL.gold);
    }
  }

  /** A flat map of who holds what: one clear colour per species. */
  private zonesOverlay() {
    const s = this.s, ctx = this.ctx;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalAlpha = 1;
    for (let i = 0; i < s.occ.length; i++) {
      if (s.occ[i] < 0) continue;
      ctx.fillStyle = ZONE[SPECIES[s.occ[i]].id];
      ctx.fillRect((i % s.w) * T, ((i / s.w) | 0) * T, T, T);
    }
  }

  private soilOverlay() {
    const s = this.s, ctx = this.ctx;
    for (let i = 0; i < s.soil.length; i++) {
      if (s.terrain[i] === SEA) continue;
      ctx.globalAlpha = 0.15 + 0.2 * Math.min(3, s.soil[i]);
      ctx.fillStyle = s.soil[i] >= 2 ? PAL.soil3 : s.soil[i] >= 1 ? PAL.soil2 : PAL.lava0;
      ctx.fillRect((i % s.w) * T, ((i / s.w) | 0) * T, T, T);
    }
    ctx.globalAlpha = 1;
  }

  private outline(i: number, color: string) {
    const x = (i % this.s.w) * T, y = ((i / this.s.w) | 0) * T;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 0.5, y + 0.5, T - 1, T - 1);
  }
}
