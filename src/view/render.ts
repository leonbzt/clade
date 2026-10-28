// Draws the garden: ground and plants (back to front, ground then herbs) go into a cached scene that is redrawn
// only when the sim has moved; each frame adds sparkles, steam, the glint of rare variants and the current view on
// top (zones, one layer, the variants of one species, or the placement view).
import { FIELDS, LAYER_IDS, STRATA, type LayerId } from '../data/fields';
import { TIERS } from '../data/genes';
import { NUM } from '../data/numbers';
import { PAL } from '../data/palette';
import { CALM_MIN_GROWTH, SPRITE_DENSITY } from '../data/view';
import { SEA, VENT, type State } from '../sim/state';
import { defOf, glints } from '../sim/variants';
import { lookOf } from './look';
import { hash2, makeCanvas } from './pixels';
import { SPRITE, sprite } from './plants';
import { TerrainLayer } from './terrain';
import { layerView, outline, PlacingView, variantHighlight, variantsView, zonesView } from './overlays';

const T = NUM.map.tile;
export type View = 'none' | 'zones' | LayerId | 'variants';
export const VIEWS: View[] = ['none', 'zones', ...LAYER_IDS.filter((l) => !FIELDS[l].hidden), 'variants'];
export type ViewOpts = { placing: string | null; hover: number; view: View; time: number; detail: boolean; selected: number; focus: string; hoverVariant: number };

export class GardenRenderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private terrain: TerrainLayer;
  private lastTerrainTick = -1;
  private placingView: PlacingView;
  private scene: HTMLCanvasElement;
  private sceneCtx: CanvasRenderingContext2D;
  private sceneKey = '';
  private glint: { i: number; color: string }[] = [];
  private glintTick = -1;

  constructor(private s: State, canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = s.w * T; canvas.height = s.h * T;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.terrain = new TerrainLayer(s);
    this.terrain.update(true);
    this.placingView = new PlacingView(s);
    this.scene = makeCanvas(canvas.width, canvas.height);
    this.sceneCtx = this.scene.getContext('2d')!;
    this.sceneCtx.imageSmoothingEnabled = false;
  }

  draw(o: ViewOpts) {
    const s = this.s, ctx = this.ctx;
    if (s.tick - this.lastTerrainTick >= 5 || s.tick < this.lastTerrainTick) { this.terrain.update(); this.lastTerrainTick = s.tick; }
    if (o.view === 'zones') {
      ctx.drawImage(this.terrain.canvas, 0, 0);
      this.sparkles(o.time);
      zonesView(ctx, s);
    } else {
      const key = `${this.lastTerrainTick}|${o.detail}`;
      if (key !== this.sceneKey) {
        this.sceneKey = key;
        this.sceneCtx.drawImage(this.terrain.canvas, 0, 0);
        this.plants(this.sceneCtx, o.detail);
      }
      ctx.drawImage(this.scene, 0, 0);
      this.sparkles(o.time);
      this.steam(o.time);
      if (o.view === 'variants') variantsView(ctx, s, o.focus);
      else if (o.view !== 'none') layerView(ctx, s, o.view);
      else this.glints(o.time);
      if (o.hoverVariant >= 0) variantHighlight(ctx, s, o.hoverVariant);
    }
    if (o.placing) this.placingView.draw(ctx, o.placing, o.hover);
    else if (o.hover >= 0) outline(ctx, s, o.hover, PAL.text);
    if (o.selected >= 0 && !o.placing) outline(ctx, s, o.selected, PAL.gold);
  }

  private plants(ctx: CanvasRenderingContext2D, detail: boolean) {
    const s = this.s, n = s.w * s.h, density = SPRITE_DENSITY[detail ? 'detail' : 'calm'];
    const strata = [STRATA.indexOf('under'), STRATA.indexOf('ground'), STRATA.indexOf('herb')];
    const has = new Uint8Array(n); // calm: a tile next to an earlier sprite gets none, so sprites don't clump
    const near = (i: number) => {
      const x = i % s.w;
      return (x > 0 && (has[i - 1] || (i >= s.w && has[i - s.w - 1]))) || (i >= s.w && has[i - s.w]) || (x < s.w - 1 && i >= s.w && has[i - s.w + 1]);
    };
    for (let i = 0; i < n; i++) {
      let drew = false;
      for (const k of strata) {
        const slot = k * n + i, v = s.occ[slot];
        if (v < 0) continue;
        const def = defOf(s, s.variants[v].sp), c = s.cover[slot];
        // Only some tiles get a sprite; the rest show the ground cover. Fungi show only where nothing else does.
        if (def.stratum === 'under' && drew) continue;
        if (hash2(i, 8 + k) >= density[def.id] || (!detail && (c < CALM_MIN_GROWTH || near(i)))) continue;
        const stage = c < 0.35 ? 0 : c < 0.7 ? 1 : 2, look = lookOf(s, v);
        const img = sprite(def.id, Math.floor(hash2(i, 5 + k) * SPRITE.variants), { stage, traits: look.traits, tint: look.tint });
        // A small fixed jitter per tile hides the grid.
        const jx = Math.floor(hash2(i, 6, k) * 3) - 1, jy = Math.floor(hash2(i, 7, k) * 3) - 1;
        // Dying plants fade as they thin out.
        ctx.globalAlpha = s.dying[slot] ? 0.35 + 0.65 * c : 1;
        ctx.drawImage(img, (i % s.w) * T + SPRITE.ox + jx, ((i / s.w) | 0) * T + SPRITE.oy + jy);
        ctx.globalAlpha = 1;
        if (def.stratum !== 'under') { drew = true; has[i] = 1; }
      }
    }
  }

  /** Rare and better variants you haven't looked at yet sparkle on some of their tiles, in their tier's colour;
   * candidates for a door (a whole recipe) sparkle gold. */
  private glints(time: number) {
    const s = this.s, ctx = this.ctx, n = s.w * s.h;
    if (s.tick !== this.glintTick) {
      this.glintTick = s.tick;
      this.glint = [];
      const cand = new Set(s.cands);
      if (cand.size || s.variants.some(glints)) for (let slot = 0; slot < s.occ.length; slot++) {
        const v = s.occ[slot], i = slot % n;
        if (v < 0 || hash2(i, 77) >= 0.5) continue;
        if (cand.has(v)) this.glint.push({ i, color: PAL.gold });
        else if (glints(s.variants[v])) this.glint.push({ i, color: TIERS[s.variants[v].tier].color });
      }
    }
    for (const { i, color } of this.glint) {
      const t = (time / 900 + hash2(i, 78)) % 1;
      if (t > 0.45) continue;
      const r = t < 0.15 || t > 0.3 ? 1 : 2, cx = (i % s.w) * T + 3 + Math.floor(hash2(i, 79) * (T - 6)), cy = ((i / s.w) | 0) * T + 3 + Math.floor(hash2(i, 80) * (T - 6));
      ctx.fillStyle = color;
      ctx.fillRect(cx - r, cy, 2 * r + 1, 1); ctx.fillRect(cx, cy - r, 1, 2 * r + 1);
      ctx.fillStyle = PAL.text; ctx.fillRect(cx, cy, 1, 1);
    }
  }

  private steam(time: number) {
    const s = this.s, ctx = this.ctx;
    for (const i of s.vents) {
      if (s.terrain[i] !== VENT) continue;
      const cx = (i % s.w) * T + T / 2, cy = ((i / s.w) | 0) * T + T / 2;
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
    for (let k = 0; k < 120; k++) {
      const i = Math.floor(hash2(k, frame) * s.terrain.length);
      if (s.terrain[i] !== SEA) continue;
      ctx.fillRect((i % s.w) * T + Math.floor(hash2(k, frame, 1) * (T - 2)), ((i / s.w) | 0) * T + Math.floor(hash2(k, frame, 2) * (T - 2)), 2, 1);
    }
  }
}
