// The map's scale bar: the longest round length (1, 2 or 5 × a power of ten metres) that fits the given width.
import { TILE_M } from '../data/units';

/** pxPerTile: screen pixels per tile at the current zoom. */
export function scaleBar(pxPerTile: number, maxPx = 110): { px: number; text: string } {
  const pxPerM = pxPerTile / TILE_M;
  let m = 1;
  for (const p of [1, 10, 100, 1000]) for (const k of [1, 2, 5]) if (k * p * pxPerM <= maxPx) m = k * p;
  return { px: m * pxPerM, text: m >= 1000 ? `${m / 1000} km` : `${m} m` };
}
