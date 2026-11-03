// Habitats: patches of one kind. A flood fill per kind (4 neighbours), big pieces cut by BFS into chunks of at most
// PATCHES.maxTiles, and a neighbour graph weighted by shared border length. Recomputed only when a tile changes kind.
// Deterministic for the same tiles, so a save can store the garden per patch index.
import { LIVING, PATCHES } from '../data/island';
import type { Island } from './island';

export interface Patch {
  id: number; kind: number; tiles: number[];
  x: number; y: number; // middle, in tiles
  at: number; // the tile nearest the middle
  water: number; soil: number; // averages over the tiles (soil refreshed on succession)
  nb: number[]; nbW: number[]; // neighbour patch ids and the share of this patch's border they take
}

export interface Habitats { patches: Patch[]; of: Int32Array } // of[tile] = patch id, or -1

export function findHabitats(isl: Island): Habitats {
  const { w, h } = isl, n = w * h, of = new Int32Array(n).fill(-1), patches: Patch[] = [];
  const seen = new Uint8Array(n), living = (k: number) => LIVING.includes(k), piece = new Int32Array(n), mark = new Int32Array(n);
  let stamp = 0; // mark[t] === stamp: t is in the current piece; -stamp: taken by a chunk
  const near = (i: number, f: (j: number) => void) => {
    const x = i % w, y = (i / w) | 0;
    if (x > 0) f(i - 1);
    if (x < w - 1) f(i + 1);
    if (y > 0) f(i - w);
    if (y < h - 1) f(i + w);
  };
  for (let i = 0; i < n; i++) {
    const k = isl.kind[i];
    if (seen[i] || !living(k)) continue;
    // the whole connected piece
    stamp++;
    let len = 1;
    piece[0] = i; seen[i] = 1; mark[i] = stamp;
    for (let q = 0; q < len; q++) near(piece[q], (j) => { if (!seen[j] && isl.kind[j] === k) { seen[j] = 1; mark[j] = stamp; piece[len++] = j; } });
    // cut it into chunks: BFS from the first free tile, up to maxTiles each
    for (let s0 = 0; s0 < len; s0++) {
      const start = piece[s0];
      if (mark[start] !== stamp) continue;
      const tiles = [start];
      mark[start] = -stamp;
      for (let q = 0; q < tiles.length && tiles.length < PATCHES.maxTiles; q++)
        near(tiles[q], (j) => { if (tiles.length < PATCHES.maxTiles && mark[j] === stamp) { mark[j] = -stamp; tiles.push(j); } });
      const id = patches.length;
      for (const t of tiles) of[t] = id;
      patches.push({ id, kind: k, tiles, x: 0, y: 0, at: tiles[0], water: 0, soil: 0, nb: [], nbW: [] });
    }
  }
  // Tiny leftovers (≤ 2 tiles) from cutting join their biggest same-kind neighbour chunk.
  for (const p of patches) {
    if (p.tiles.length > 2) continue;
    let best = -1;
    for (const t of p.tiles) near(t, (j) => {
      const q = of[j];
      if (q >= 0 && q !== p.id && patches[q].kind === p.kind && patches[q].tiles.length + p.tiles.length <= PATCHES.maxTiles && (best < 0 || patches[q].tiles.length > patches[best].tiles.length)) best = q;
    });
    if (best >= 0) { for (const t of p.tiles) of[t] = best; patches[best].tiles.push(...p.tiles); p.tiles = []; }
  }
  // Renumber without the emptied ones.
  const kept = patches.filter((p) => p.tiles.length);
  kept.forEach((p, id) => { p.id = id; for (const t of p.tiles) of[t] = id; });
  for (const p of kept) {
    let sx = 0, sy = 0, wa = 0, so = 0;
    for (const t of p.tiles) { sx += t % w; sy += (t / w) | 0; wa += isl.water[t]; so += isl.soil[t]; }
    p.x = sx / p.tiles.length; p.y = sy / p.tiles.length; p.water = wa / p.tiles.length; p.soil = so / p.tiles.length;
    let bd = Infinity;
    for (const t of p.tiles) { const d = Math.hypot((t % w) - p.x, ((t / w) | 0) - p.y); if (d < bd) { bd = d; p.at = t; } }
    const border = new Map<number, number>();
    for (const t of p.tiles) near(t, (j) => { const q = of[j]; if (q >= 0 && q !== p.id) border.set(q, (border.get(q) ?? 0) + 1); });
    const total = [...border.values()].reduce((a, b) => a + b, 0) || 1;
    p.nb = [...border.keys()]; p.nbW = [...border.values()].map((v) => v / total);
  }
  return { patches: kept, of };
}

/** Refresh each patch's soil average (after succession changes the tiles' soil). */
export function refreshSoil(isl: Island, hab: Habitats) {
  for (const p of hab.patches) {
    let s = 0;
    for (const t of p.tiles) s += isl.soil[t];
    p.soil = s / p.tiles.length;
  }
}
