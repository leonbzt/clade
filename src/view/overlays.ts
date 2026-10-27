// The map's reading views: zones (who holds each stratum), one layer as a single-colour ramp, and the placement
// view (fit tier, the limiting layer, an outline around where you can place, and the best spots).
import { FIELDS, STRATA, limitColor, type LayerId } from '../data/fields';
import { NUM } from '../data/numbers';
import { PAL, TIER_COLORS, ZONE } from '../data/palette';
import { SPECIES, SPECIES_INDEX } from '../data/species';
import { canFoundAt } from '../sim/commands';
import { fit, limitOf, profiles, tierOf } from '../sim/fit';
import { SEA, type State } from '../sim/state';

const T = NUM.map.tile;
type Ctx = CanvasRenderingContext2D;

function wash(ctx: Ctx, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalAlpha = 1;
}

export function outline(ctx: Ctx, s: State, i: number, color: string, width = 1) {
  const x = (i % s.w) * T, y = ((i / s.w) | 0) * T;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.strokeRect(x + width / 2, y + width / 2, T - width, T - width);
}

/** Flat colours: ground species fill the tile, herbs an inner square, fungi the corners. */
export function zonesView(ctx: Ctx, s: State) {
  const n = s.w * s.h, [U, G, H] = [STRATA.indexOf('under'), STRATA.indexOf('ground'), STRATA.indexOf('herb')];
  wash(ctx, 0.55);
  for (let i = 0; i < n; i++) {
    const x = (i % s.w) * T, y = ((i / s.w) | 0) * T;
    const g = s.occ[G * n + i], h = s.occ[H * n + i], u = s.occ[U * n + i];
    if (g >= 0) { ctx.fillStyle = ZONE[SPECIES[g].id]; ctx.fillRect(x, y, T, T); }
    if (h >= 0) {
      ctx.fillStyle = PAL.ink; ctx.fillRect(x + 3, y + 3, T - 6, T - 6);
      ctx.fillStyle = ZONE[SPECIES[h].id]; ctx.fillRect(x + 4, y + 4, T - 8, T - 8);
    }
    if (u >= 0) {
      ctx.fillStyle = ZONE[SPECIES[u].id];
      for (const [dx, dy] of [[0, 0], [T - 2, 0], [0, T - 2], [T - 2, T - 2]]) ctx.fillRect(x + dx, y + dy, 2, 2);
    }
  }
}

/** One layer: a single colour, stronger where the value is higher. */
export function layerView(ctx: Ctx, s: State, id: LayerId) {
  const v = s.layers[id], max = FIELDS[id].viewMax ?? 1;
  wash(ctx, 0.72);
  ctx.fillStyle = FIELDS[id].color;
  for (let i = 0; i < v.length; i++) {
    if (s.terrain[i] === SEA) continue;
    ctx.globalAlpha = 0.08 + 0.85 * Math.min(1, v[i] / max);
    ctx.fillRect((i % s.w) * T, ((i / s.w) | 0) * T, T, T);
  }
  ctx.globalAlpha = 1;
}

type Cell = { f: number; ok: boolean; limit: number };

/** The placement view. Recomputed every few ticks, not every frame. */
export class PlacingView {
  private key = '';
  private cells: Cell[] = [];
  private best: number[] = [];

  constructor(private s: State) {}

  private compute(speciesId: string) {
    const s = this.s, P = profiles(s), p = P[SPECIES_INDEX[speciesId]];
    this.cells = Array.from(s.terrain, (t, i) => {
      if (t === SEA) return { f: 0, ok: false, limit: -1 };
      const f = fit(s, p, i), limit = limitOf();
      return { f, ok: f > 0 && canFoundAt(s, speciesId, i, P), limit };
    });
    this.best = this.cells.map((c, i) => [c.ok ? c.f : 0, i]).sort((a, b) => b[0] - a[0]).slice(0, 3).filter((x) => x[0] > 0).map((x) => x[1]);
  }

  draw(ctx: Ctx, speciesId: string, hover: number) {
    const s = this.s, key = `${speciesId}|${Math.floor(s.tick / 5)}|${s.traits[speciesId].length}`;
    if (key !== this.key) { this.compute(speciesId); this.key = key; }
    wash(ctx, 0.68);
    const cells = this.cells;
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i], tier = tierOf(c.f);
      if (!tier) continue;
      const x = (i % s.w) * T, y = ((i / s.w) | 0) * T;
      // Faded: it would fit, but it's already yours or a stronger species holds it.
      ctx.globalAlpha = c.ok ? 0.85 : 0.18;
      ctx.fillStyle = TIER_COLORS[tier];
      ctx.fillRect(x + 1, y + 1, T - 2, T - 2);
      ctx.globalAlpha = 1;
      // The limiting layer, as a small mark in its colour (S tiles have nothing holding them back).
      if (c.ok && tier !== 'S' && c.limit >= 0) {
        ctx.fillStyle = PAL.ink; ctx.fillRect(x + 2, y + 2, 5, 5);
        ctx.fillStyle = limitColor(c.limit); ctx.fillRect(x + 3, y + 3, 3, 3);
      }
    }
    // An outline around the area you can place on.
    ctx.fillStyle = PAL.text;
    const okAt = (x: number, y: number) => x >= 0 && y >= 0 && x < s.w && y < s.h && cells[y * s.w + x].ok;
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i].ok) continue;
      const tx = i % s.w, ty = (i / s.w) | 0, x = tx * T, y = ty * T;
      if (!okAt(tx, ty - 1)) ctx.fillRect(x, y, T, 1);
      if (!okAt(tx, ty + 1)) ctx.fillRect(x, y + T - 1, T, 1);
      if (!okAt(tx - 1, ty)) ctx.fillRect(x, y, 1, T);
      if (!okAt(tx + 1, ty)) ctx.fillRect(x + T - 1, y, 1, T);
    }
    for (const i of this.best) outline(ctx, s, i, PAL.gold, 2);
    if (hover < 0) return;
    const hx = hover % s.w, hy = (hover / s.w) | 0, r = NUM.founding.patch;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = hx + dx, y = hy + dy;
      if (Math.abs(dx) + Math.abs(dy) <= r && x >= 0 && y >= 0 && x < s.w && y < s.h) outline(ctx, s, y * s.w + x, dx || dy ? PAL.textDim : PAL.text);
    }
  }
}
