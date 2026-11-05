// Toy: the living sea, its patches. The shallows around the real island, cut into chunks as `src/sim/habitats.ts` cuts land
// (a flood per ground kind, then BFS chunks, tiny leftovers join a neighbour, a neighbour graph by shared border).
// Same seed, same patches.
import type { HabitatId } from '../game/src/data/habitats';
import { BARE, BEACH, LAVA, SEA as WATER } from '../game/src/data/island';
import type { Island } from '../game/src/sim/island';
import { SEA } from './sea-data';

export interface Patch {
  id: number; ground: HabitatId; tiles: number[]; x: number; y: number;
  nb: number[]; nbW: number[]; // neighbours and the share of this patch's border each takes
  outer: boolean; // touches the open sea: the trickle arrives here
}
export interface Shallows { patches: Patch[]; of: Int32Array }

const GROUNDS: HabitatId[] = ['sand', 'mud', 'rock'];

export function makeShallows(isl: Island): Shallows {
  const { w, h } = isl, n = w * h, ground = new Int8Array(n).fill(-1), depth = new Int8Array(n).fill(-1), queue: number[] = [];
  const near4 = (i: number, f: (j: number) => void) => {
    const x = i % w, y = (i / w) | 0;
    if (x > 0) f(i - 1);
    if (x < w - 1) f(i + 1);
    if (y > 0) f(i - w);
    if (y < h - 1) f(i + w);
  };
  // Ground comes from the nearest coast: beach → sand, lava → rock, forest and wet → mud. Most of a coast is bare ground, so that
  // alone gives 75% mud or 75% rock: bare coast takes long arcs of each, old lava flows and silted plains, by the seed.
  const phase = (isl.seed * 2.399) % 6.283, arc = (i: number) => Math.sin(Math.atan2(((i / w) | 0) - h / 2, (i % w) - w / 2) * 3 + phase);
  const groundOfCoast = (i: number) => { const k = isl.kind[i]; return k === BEACH ? 0 : k === LAVA ? 2 : k === BARE ? (arc(i) > 0 ? 2 : 1) : 1; };
  // A BFS out from the land, 8 neighbours, up to SEA.shallow tiles.
  for (let i = 0; i < n; i++) if (isl.kind[i] !== WATER) { depth[i] = 0; ground[i] = groundOfCoast(i); queue.push(i); }
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q], x = i % w, y = (i / w) | 0;
    if (depth[i] >= SEA.shallow) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx, Y = y + dy;
      if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
      const j = Y * w + X;
      if (depth[j] >= 0) continue;
      depth[j] = depth[i] + 1; ground[j] = ground[i]; queue.push(j);
    }
  }
  const wet = (i: number) => isl.kind[i] === WATER && depth[i] > 0;

  // Cut per ground kind: BFS chunks of at most maxTiles.
  const of = new Int32Array(n).fill(-1), raw: { kind: number; tiles: number[] }[] = [];
  for (let i = 0; i < n; i++) {
    if (!wet(i) || of[i] >= 0) continue;
    const tiles = [i], id = raw.length;
    of[i] = id;
    for (let q = 0; q < tiles.length && tiles.length < SEA.maxTiles; q++)
      near4(tiles[q], (j) => { if (tiles.length < SEA.maxTiles && wet(j) && of[j] < 0 && ground[j] === ground[i]) { of[j] = id; tiles.push(j); } });
    raw.push({ kind: ground[i], tiles });
  }
  // Scraps (under a third of a full chunk) join the neighbour of the same ground with the most room.
  const scrap = SEA.maxTiles / 3;
  for (const r of raw) {
    if (!r.tiles.length || r.tiles.length >= scrap) continue;
    let best = -1;
    for (const t of r.tiles) near4(t, (j) => {
      const q = of[j];
      if (q < 0 || raw[q] === r || raw[q].kind !== r.kind) return;
      if (best < 0 || raw[q].tiles.length < raw[best].tiles.length) best = q;
    });
    if (best >= 0) { for (const t of r.tiles) of[t] = best; raw[best].tiles.push(...r.tiles); r.tiles = []; }
  }
  const kept = raw.filter((r) => r.tiles.length), patches: Patch[] = kept.map((r, id) => {
    for (const t of r.tiles) of[t] = id;
    let sx = 0, sy = 0;
    for (const t of r.tiles) { sx += t % w; sy += (t / w) | 0; }
    return { id, ground: GROUNDS[r.kind], tiles: r.tiles, x: sx / r.tiles.length, y: sy / r.tiles.length, nb: [], nbW: [], outer: r.tiles.some((t) => depth[t] === SEA.shallow) };
  });
  for (const p of patches) {
    const border = new Map<number, number>();
    for (const t of p.tiles) near4(t, (j) => { const q = wet(j) ? of[j] : -1; if (q >= 0 && q !== p.id) border.set(q, (border.get(q) ?? 0) + 1); });
    const total = [...border.values()].reduce((a, b) => a + b, 0) || 1;
    p.nb = [...border.keys()]; p.nbW = [...border.values()].map((v) => v / total);
  }
  return { patches, of };
}
