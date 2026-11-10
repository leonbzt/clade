// The bare map's paint: one palette index per tile, then RGBA for a texture (one pixel per tile). Pure.
import { BARE, BEACH, F_CRACK, F_SPRING, F_STREAM, F_VENT, FOREST, LAVA, SEA, WET } from '../data/island';
import { LAND, OPEN, SUBSTRATES } from '../data/ground';
import { COLORS, P, RAMPS, shade } from '../data/palette';
import type { Ground } from '../sim/ground';
import type { Habitats } from '../sim/habitats';

export const VIEWS = ['habitats', 'depth', 'substrate', 'exposure'] as const;
export type MapMode = (typeof VIEWS)[number];

const SUBSTRATE_RAMP = [RAMPS.sand, RAMPS.mud, RAMPS.rock];
// No land plants yet (you, 10 Nov): forest paints bare; the forest ramp waits for the shore.
const LAND_RAMP: Record<number, readonly number[]> = { [BEACH]: RAMPS.beach, [LAVA]: RAMPS.lava, [BARE]: RAMPS.bare, [FOREST]: RAMPS.bare, [WET]: RAMPS.wet };

/** Palette index per tile. `selected` habitat gets a light border. */
export function paintIndices(g: Ground, hab: Habitats, mode: MapMode, selected = -1): Uint8Array {
  const { w, h } = g, n = w * h, out = new Uint8Array(n), of = hab.of, height = landHeight(g);
  const habSubstrate = hab.list.map((x) => SUBSTRATES.indexOf(x.kind.substrate));
  for (let i = 0; i < n; i++) {
    const d = g.depth[i];
    if (d === LAND) {
      const f = g.feature[i];
      if (f === F_VENT) { out[i] = P.vent; continue; }
      if (f === F_STREAM || f === F_SPRING) { out[i] = P.rockShallow; continue; }
      const ramp = f === F_CRACK ? RAMPS.lava : LAND_RAMP[g.land[i]] ?? RAMPS.bare;
      const up = i - w - 1, x = i % w, y = (i / w) | 0; // the neighbour toward the light; a little grain
      out[i] = shade(ramp, (x > 0 && up >= 0 ? height[i] - height[up] : 0) + grain(x, y));
      continue;
    }
    if (d === OPEN) { out[i] = P.open; continue; }
    out[i] = mode === 'depth' ? RAMPS.rock[3 - d]
      : mode === 'substrate' ? [P.sandFlat, P.mudFlat, P.rockSlope][g.substrate[i]]
      : mode === 'exposure' ? (g.exposure[i] === 0 ? P.beach : P.rockDeep)
      : SUBSTRATE_RAMP[of[i] >= 0 ? habSubstrate[of[i]] : g.substrate[i]][3 - d]; // the habitat's substrate, the tile's depth
    // Borders: one dark pixel where the habitat changes to the right or below, or meets open sea.
    const k = of[i], x = i % w;
    const differs = (j: number) => of[j] !== k && (of[j] >= 0 || g.depth[j] === OPEN);
    if ((x < w - 1 && differs(i + 1)) || (i < n - w && differs(i + w)) || (x > 0 && g.depth[i - 1] === OPEN) || (i >= w && g.depth[i - w] === OPEN))
      out[i] = P.line;
  }
  if (selected >= 0) for (const t of hab.list[selected]?.tiles ?? []) {
    const x = t % w;
    if ((x > 0 && of[t - 1] !== selected) || (x < w - 1 && of[t + 1] !== selected) || of[t - w] !== selected || of[t + w] !== selected) out[t] = P.paper;
  }
  return out;
}

/** A little noise on the land's light, -0.47..0.47: some tiles near a slope's edge take the next tone. */
function grain(x: number, y: number) {
  let k = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  k = Math.imul(k ^ (k >>> 13), 1274126177);
  return ((k ^ (k >>> 16)) >>> 28) / 16 - 0.47;
}

/** RGBA bytes for the indices. */
export function toRGBA(idx: Uint8Array): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(idx.length * 4);
  for (let i = 0; i < idx.length; i++) {
    const c = COLORS[idx[i]];
    out[i * 4] = c >> 16; out[i * 4 + 1] = (c >> 8) & 255; out[i * 4 + 2] = c & 255; out[i * 4 + 3] = 255;
  }
  return out;
}

const heights = new WeakMap<Ground, Float32Array>();
/** Land height for the light: distance to the sea (chamfer, 1 and √2) so the island's flanks catch or lose the light. */
function landHeight(g: Ground): Float32Array {
  const cached = heights.get(g);
  if (cached) return cached;
  const { w, h } = g, n = w * h, d = new Float32Array(n), D = Math.SQRT2;
  for (let i = 0; i < n; i++) d[i] = g.land[i] === SEA ? 0 : 1e9;
  const relax = (i: number, j: number, c: number) => { if (d[j] + c < d[i]) d[i] = d[j] + c; };
  for (let i = 0; i < n; i++) {
    const x = i % w;
    if (x > 0) relax(i, i - 1, 1);
    if (i >= w) { relax(i, i - w, 1); if (x > 0) relax(i, i - w - 1, D); if (x < w - 1) relax(i, i - w + 1, D); }
  }
  for (let i = n - 1; i >= 0; i--) {
    const x = i % w;
    if (x < w - 1) relax(i, i + 1, 1);
    if (i < n - w) { relax(i, i + w, 1); if (x < w - 1) relax(i, i + w + 1, D); if (x > 0) relax(i, i + w - 1, D); }
  }
  heights.set(g, d);
  return d;
}
