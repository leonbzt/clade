// Draws the whole garden each frame: ground, plants (back to front, ground then herbs), steam, sparkles, and
// the current view on top (zones, one layer, or the placement view).
import { LAYER_IDS, STRATA, type LayerId } from '../data/fields';
import { NUM } from '../data/numbers';
import { PAL } from '../data/palette';
import { CALM_MIN_GROWTH, SPRITE_DENSITY } from '../data/view';
import { SPECIES } from '../data/species';
import { SEA, VENT, type State } from '../sim/state';
import { hash2 } from './pixels';
import { SPRITE, sprite } from './plants';
import { TerrainLayer } from './terrain';
import { layerView, outline, PlacingView, zonesView } from './overlays';

const T = NUM.map.tile;
export type View = 'none' | 'zones' | LayerId;
export const VIEWS: View[] = ['none', 'zones', ...LAYER_IDS.filter((l) => l !== 'salt')];
export type ViewOpts = { placing: string | null; hover: number; view: View; time: number; detail: boolean; selected: number };

export class GardenRenderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private terrain: TerrainLayer;
  private lastTerrainTick = -1;
  private placingView: PlacingView;

  constructor(private s: State, canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = s.w * T; canvas.height = s.h * T;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.terrain = new TerrainLayer(s);
    this.terrain.update(true);
    this.placingView = new PlacingView(s);
  }

  draw(o: ViewOpts) {
    const s = this.s, ctx = this.ctx;
    if (s.tick - this.lastTerrainTick >= 5 || s.tick < this.lastTerrainTick) { this.terrain.update(); this.lastTerrainTick = s.tick; }
    ctx.drawImage(this.terrain.canvas, 0, 0);
    this.sparkles(o.time);
    if (o.view === 'zones') zonesView(ctx, s);
    else {
      this.plants(o.detail);
      this.steam(o.time);
      if (o.view !== 'none') layerView(ctx, s, o.view);
    }
    if (o.placing) this.placingView.draw(ctx, o.placing, o.hover);
    else if (o.hover >= 0) outline(ctx, s, o.hover, PAL.text);
    if (o.selected >= 0 && !o.placing) outline(ctx, s, o.selected, PAL.gold);
  }

  private plants(detail: boolean) {
    const s = this.s, n = s.w * s.h, density = SPRITE_DENSITY[detail ? 'detail' : 'calm'];
    const strata = [STRATA.indexOf('under'), STRATA.indexOf('ground'), STRATA.indexOf('herb')];
    for (let i = 0; i < n; i++) {
      let drew = false;
      for (const k of strata) {
        const slot = k * n + i, sp = s.occ[slot];
        if (sp < 0) continue;
        const def = SPECIES[sp], c = s.cover[slot];
        // Only some tiles get a sprite; the rest show the ground cover. Fungi show only where nothing else does.
        if (def.stratum === 'under' && drew) continue;
        if (hash2(i, 8 + k) >= density[def.id] || (!detail && c < CALM_MIN_GROWTH)) continue;
        const stage = c < 0.35 ? 0 : c < 0.7 ? 1 : 2;
        const img = sprite(def.id, Math.floor(hash2(i, 5 + k) * SPRITE.variants), { stage, traits: s.traits[def.id] });
        // A small fixed jitter per tile hides the grid.
        const jx = Math.floor(hash2(i, 6, k) * 5) - 2, jy = Math.floor(hash2(i, 7, k) * 5) - 2;
        this.ctx.drawImage(img, (i % s.w) * T + SPRITE.ox + jx, ((i / s.w) | 0) * T + SPRITE.oy + jy);
        if (def.stratum !== 'under') drew = true;
      }
    }
  }

  private steam(time: number) {
    const s = this.s, ctx = this.ctx;
    for (const i of s.vents) {
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
}
