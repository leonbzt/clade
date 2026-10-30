// The map's reading views: zones (who holds each stratum), one layer as a single-colour ramp, the variants of one
// species, the habitats, and the placement view (fit tier, the limiting layer, an outline around where
// you can place, and the best spots).
import { FIELDS, STRATA, limitColor, type LayerId } from '../data/fields';
import { NUM } from '../data/numbers';
import { HABITAT_TINT, PAL, TIER_COLORS, ZONE } from '../data/palette';
import { HABITAT_KINDS } from '../data/habitats';
import { VARIANT_COLORS } from '../data/view';
import { placement } from '../sim/commands';
import { fit, limitOf, tierOf } from '../sim/fit';
import { SEA, type State } from '../sim/state';
import { SCRAP } from '../sim/habitats';
import { bucketOf } from '../sim/tally';
import { defOf, poolOf, speciesIndex, stratumOf } from '../sim/variants';
import { tinted } from './pixels';
import { SPECIES } from '../data/species';

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

const zoneCache = new Map<string, string>();
/** A species' Zones colour: its base species' colour, shifted by its own hue if you made it. */
export function zoneColor(s: State, sp: number): string {
  const x = s.species[sp], key = `${x.base}|${x.hue}`;
  let c = zoneCache.get(key);
  if (!c) { c = tinted(ZONE[defOf(s, sp).id], { hue: x.hue, light: 0, sat: 0 }); zoneCache.set(key, c); }
  return c;
}

/** Flat colours: ground species fill the tile, herbs an inner square, fungi the corners. */
export function zonesView(ctx: Ctx, s: State) {
  const n = s.w * s.h, [U, G, H] = [STRATA.indexOf('under'), STRATA.indexOf('ground'), STRATA.indexOf('herb')];
  const col = (v: number) => zoneColor(s, s.variants[v].sp);
  wash(ctx, 0.55);
  for (let i = 0; i < n; i++) {
    const x = (i % s.w) * T, y = ((i / s.w) | 0) * T;
    const g = s.occ[G * n + i], h = s.occ[H * n + i], u = s.occ[U * n + i];
    if (g >= 0) { ctx.fillStyle = col(g); ctx.fillRect(x, y, T, T); }
    if (h >= 0) {
      ctx.fillStyle = PAL.ink; ctx.fillRect(x + 3, y + 3, T - 6, T - 6);
      ctx.fillStyle = col(h); ctx.fillRect(x + 4, y + 4, T - 8, T - 8);
    }
    if (u >= 0) {
      ctx.fillStyle = col(u);
      for (const [dx, dy] of [[0, 0], [T - 2, 0], [0, T - 2], [T - 2, T - 2]]) ctx.fillRect(x + dx, y + dy, 2, 2);
    }
  }
}

/** A colour for each variant of a species, in order of birth, so a variant keeps its colour while others come and go. */
export function variantColors(s: State, sp: number): Map<number, string> {
  const pool = poolOf(s, sp).sort((a, b) => s.variants[a].born - s.variants[b].born || a - b);
  return new Map(pool.map((v, k) => [v, VARIANT_COLORS[k % VARIANT_COLORS.length]]));
}

/** The focused species' tiles, coloured by variant. Hidden variants (under 5 tiles) are grey. */
export function variantsView(ctx: Ctx, s: State, speciesId: string) {
  const sp = speciesIndex(s, speciesId);
  wash(ctx, 0.72);
  if (sp < 0) return;
  const n = s.w * s.h, k = stratumOf(s, sp), colors = variantColors(s, sp);
  for (let i = 0; i < n; i++) {
    const v = s.occ[k * n + i];
    if (v < 0 || s.variants[v].sp !== sp) continue;
    ctx.fillStyle = s.variants[v].shown ? colors.get(v)! : PAL.textDim;
    ctx.fillRect((i % s.w) * T + 1, ((i / s.w) | 0) * T + 1, T - 2, T - 2);
  }
  for (const a of s.agents) if (a.sp === sp) { // animals: a dot each
    ctx.fillStyle = s.variants[a.v].shown ? colors.get(a.v)! : PAL.textDim;
    ctx.fillRect(Math.round(a.x * T) - 2, Math.round(a.y * T) - 2, 4, 4);
  }
}

/** One variant's tiles light up in its Variants-view colour, over a light wash: hovering it in the panel. */
export function variantHighlight(ctx: Ctx, s: State, v: number) {
  const x = s.variants[v];
  if (!x?.alive) return;
  wash(ctx, 0.35);
  const n = s.w * s.h, k = stratumOf(s, x.sp);
  ctx.fillStyle = variantColors(s, x.sp).get(v) ?? PAL.text;
  for (let i = 0; i < n; i++) {
    if (s.occ[k * n + i] !== v) continue;
    ctx.fillRect((i % s.w) * T, ((i / s.w) | 0) * T, T, T);
  }
  for (const a of s.agents) if (a.v === v) ctx.fillRect(Math.round(a.x * T) - 3, Math.round(a.y * T) - 3, 6, 6);
}

/** A slot's holder in one habitat (Habitats tab): its plants' tiles and its animals there, in its colour. */
export function holderHighlight(ctx: Ctx, s: State, place: number, group: number) {
  const n = s.w * s.h, groupAt = (v: number) => s.species[s.variants[v].sp].base;
  wash(ctx, 0.35);
  ctx.fillStyle = ZONE[SPECIES[group].id] ?? PAL.text;
  for (let i = 0; i < n; i++) {
    if (bucketOf(s, i) !== place) continue;
    for (let k = 0; k < STRATA.length; k++) {
      const v = s.occ[k * n + i];
      if (v >= 0 && groupAt(v) === group) { ctx.fillRect((i % s.w) * T, ((i / s.w) | 0) * T, T, T); break; }
    }
  }
  for (const a of s.agents) {
    if (groupAt(a.v) === group && bucketOf(s, (a.y | 0) * s.w + (a.x | 0)) === place) ctx.fillRect(Math.round(a.x * T) - 3, Math.round(a.y * T) - 3, 6, 6);
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

/** The habitats, tinted by kind: majors and patches outlined, scraps just tinted. The one under the mouse is brighter,
 * the chosen one outlined in gold. */
export function habitatsView(ctx: Ctx, s: State, chosen: number, hover: number) {
  const n = s.w * s.h, tier = (b: number) => (b < 0 ? SCRAP : s.habitats[b].tier), hov = hover >= 0 ? bucketOf(s, hover) : -1, lit = tier(hov) > SCRAP ? hov : -1;
  wash(ctx, 0.5);
  for (let i = 0; i < n; i++) {
    const b = bucketOf(s, i);
    if (b < 0) continue;
    ctx.globalAlpha = b === lit || b === chosen ? 0.72 : [0.22, 0.34, 0.45][tier(b)];
    ctx.fillStyle = HABITAT_TINT[HABITAT_KINDS[s.hab[i]].id];
    ctx.fillRect((i % s.w) * T, ((i / s.w) | 0) * T, T, T);
  }
  for (let i = 0; i < n; i++) {
    const b = bucketOf(s, i), x = (i % s.w) * T, y = ((i / s.w) | 0) * T;
    if (b < 0) continue;
    const right = i % s.w < s.w - 1 ? bucketOf(s, i + 1) : -1, down = i + s.w < n ? bucketOf(s, i + s.w) : -1;
    for (const [o, w, h, dx, dy] of [[right, 2, T, T - 1, 0], [down, T, 2, 0, T - 1]] as const) {
      if (o < 0 || o === b || (tier(o) === SCRAP && tier(b) === SCRAP)) continue;
      const edge = b === chosen || o === chosen;
      ctx.globalAlpha = edge ? 1 : 0.35;
      ctx.fillStyle = edge ? PAL.gold : PAL.text;
      ctx.fillRect(x + dx, y + dy, w, h);
    }
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

  private compute(placing: string) {
    const s = this.s, pl = placement(s, placing);
    this.cells = Array.from(s.terrain, (t, i) => {
      if (t === SEA || !pl) return { f: 0, ok: false, limit: -1 };
      const f = fit(s, pl.p, i), limit = limitOf();
      return { f, ok: f > 0 && pl.ok(i), limit };
    });
    this.best = this.cells.map((c, i) => [c.ok ? c.f : 0, i]).sort((a, b) => b[0] - a[0]).slice(0, 3).filter((x) => x[0] > 0).map((x) => x[1]);
  }

  draw(ctx: Ctx, placing: string, hover: number) {
    const s = this.s, key = `${placing}|${Math.floor(s.tick / 5)}`;
    if (key !== this.key) { this.compute(placing); this.key = key; }
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
