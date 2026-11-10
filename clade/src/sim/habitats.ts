// The habitat finder (after game/'s sea patches): a flood fill over connected sea tiles of one kind; pieces under the
// minimum area join the neighbour they share the most border with. Same ground, same habitats.
import { DEPTHS, EXPOSURES, GROUND, SUBSTRATES, type Depth, type Exposure, type Substrate } from '../data/ground';
import { isHabitatTile, type Ground } from './ground';
import { nameHabitats } from './names';
import type { Food, Id } from './records';

export interface HabitatKind { depth: Depth; substrate: Substrate; exposure: Exposure }
export interface Habitat {
  id: number; kind: HabitatKind; name: string;
  tiles: number[]; area: number; // area in tiles
  centre: { x: number; y: number }; // the tile deepest inside it (labels go here)
  neighbours: number[]; borders: number[]; // the tile edges shared with each neighbour
  perimeter: number; // every outer tile edge, including coast and map edges (spread's denominator)
  stocks: Record<Food, number>; pops: Record<Id, number>; // food and populations, both in grams
}
export interface Habitats { list: Habitat[]; of: Int32Array } // `of`: the habitat id per tile, -1 outside

const codeOf = (g: Ground, i: number) => g.depth[i] * 6 + g.substrate[i] * 2 + g.exposure[i];
const kindOf = (code: number): HabitatKind => ({ depth: DEPTHS[(code / 6) | 0], substrate: SUBSTRATES[((code % 6) / 2) | 0], exposure: EXPOSURES[code % 2] });

type Near = (i: number, f: (j: number) => void) => void;

export function findHabitats(g: Ground): Habitats {
  const { w, h } = g, n = w * h, G = GROUND, cx = w / 2, cy = h / 2;
  const near4: Near = (i, f) => {
    const x = i % w;
    if (x > 0) f(i - 1);
    if (x < w - 1) f(i + 1);
    if (i >= w) f(i - w);
    if (i < n - w) f(i + w);
  };
  const live = (ps: number[][]) => ps.filter((p) => p.length).length;

  // 1. Flood fill: connected tiles of one kind. Pieces under the minimum area join a neighbour.
  const kind = new Int32Array(n);
  for (let i = 0; i < n; i++) kind[i] = isHabitatTile(g, i) ? codeOf(g, i) : -1;
  let { of, pieces, keys: codes } = flood(w, kind);
  const reflood = () => { const f = flood(w, of); of = f.of; pieces = f.pieces; codes = f.keys.map((k) => codes[k]); };
  const join = (more: (size: number, count: number) => boolean) => merge(of, pieces, codes, near4, more);
  join((size) => size < G.minArea);
  // 2. Oversized pieces (a whole ring of deep water) are cut by angle around the island.
  pieces.forEach((p, k) => {
    if (p.length <= G.maxArea) return;
    for (const part of byAngle(p, Math.ceil(p.length / G.maxArea), w, cx, cy, near4)) {
      for (const t of part) of[t] = pieces.length;
      pieces.push([]); codes.push(codes[k]);
    }
  });
  reflood();
  join((size) => size < G.minArea);
  // 3. Into range: the smallest joins a neighbour while there are too many; the largest halves while too few.
  join((_, count) => count > G.maxHabitats);
  for (let k = 0; k < 8 && live(pieces) < G.minHabitats; k++) {
    const p = pieces.reduce((best, q, i) => (q.length > pieces[best].length ? i : best), 0);
    for (const t of byAngle(pieces[p], 2, w, cx, cy, near4)[1]) of[t] = pieces.length;
    pieces.push([]); codes.push(codes[p]);
    reflood();
    join((size) => size < G.minArea);
  }

  // 4. The habitats, in first-tile order (a scan gives each its tiles sorted): kind by majority, the deepest-inside
  //    tile, neighbours by shared edges.
  const idOf = new Int32Array(pieces.length).fill(-1), list: Habitat[] = [], count: number[][] = [];
  for (let i = 0; i < n; i++) {
    const p = of[i];
    if (p < 0) continue;
    if (idOf[p] < 0) {
      idOf[p] = list.length; count.push(new Array(24).fill(0));
      list.push({ id: list.length, kind: kindOf(0), name: '', tiles: [], area: 0, centre: { x: 0, y: 0 }, neighbours: [], borders: [],
        perimeter: 0, stocks: { mats: 0, detritus: 0 }, pops: {} });
    }
    const id = (of[i] = idOf[p]);
    list[id].tiles.push(i); count[id][kind[i]]++;
  }
  for (const hab of list) {
    const c = count[hab.id];
    hab.kind = kindOf(c.indexOf(Math.max(...c)));
    hab.area = hab.tiles.length;
  }
  const mark = new Int32Array(n);
  for (const hab of list) {
    const border = new Map<number, number>();
    for (const t of hab.tiles) {
      hab.perimeter += 4;
      near4(t, (j) => {
        const q = of[j];
        if (q === hab.id) hab.perimeter--;
        else if (q >= 0) border.set(q, (border.get(q) ?? 0) + 1);
      });
    }
    hab.neighbours = [...border.keys()].sort((a, b) => a - b);
    hab.borders = hab.neighbours.map((q) => border.get(q)!);
    hab.centre = inside(hab.tiles, of, hab.id, w, h, near4, mark);
  }
  nameHabitats(g, list, of);
  return { list, of };
}

/** Connected tiles with the same key (key < 0: outside). */
function flood(w: number, key: Int32Array) {
  const n = key.length, of = new Int32Array(n).fill(-1), pieces: number[][] = [], keys: number[] = [];
  for (let i = 0; i < n; i++) {
    const k = key[i];
    if (k < 0 || of[i] >= 0) continue;
    const id = pieces.length, tiles = [i];
    of[i] = id;
    for (let q = 0; q < tiles.length; q++) {
      const t = tiles[q], x = t % w;
      if (x > 0 && of[t - 1] < 0 && key[t - 1] === k) { of[t - 1] = id; tiles.push(t - 1); }
      if (x < w - 1 && of[t + 1] < 0 && key[t + 1] === k) { of[t + 1] = id; tiles.push(t + 1); }
      if (t >= w && of[t - w] < 0 && key[t - w] === k) { of[t - w] = id; tiles.push(t - w); }
      if (t < n - w && of[t + w] < 0 && key[t + w] === k) { of[t + w] = id; tiles.push(t + w); }
    }
    pieces.push(tiles); keys.push(k);
  }
  return { of, pieces, keys };
}

/** How much a piece would rather join a neighbour of its own kind: same depth counts most, then substrate. */
const likeness = (a: number, b: number) => 1 + (((a / 6) | 0) === ((b / 6) | 0) ? 2 : 0) + (((a % 6) >> 1) === ((b % 6) >> 1) ? 1 : 0);

/** Smallest first, while `more(size, count)`: a piece joins the neighbour with the most border × likeness (none: it drops). */
function merge(of: Int32Array, pieces: number[][], codes: number[], near4: Near, more: (size: number, count: number) => boolean) {
  const heap = new Heap();
  let count = 0;
  pieces.forEach((p, k) => { if (p.length) { heap.push(p.length, k); count++; } });
  while (heap.size) {
    const [size, p] = heap.pop();
    if (!pieces[p].length) continue; // gone
    if (size !== pieces[p].length) { heap.push(pieces[p].length, p); continue; } // it grew: back in line
    if (!more(size, count)) break;
    const border = new Map<number, number>();
    for (const t of pieces[p]) near4(t, (j) => { const q = of[j]; if (q >= 0 && q !== p) border.set(q, (border.get(q) ?? 0) + 1); });
    let best = -1, top = 0;
    for (const [q, len] of border) {
      const score = len * likeness(codes[p], codes[q]);
      if (score > top || (score === top && q < best)) { top = score; best = q; }
    }
    for (const t of pieces[p]) of[t] = best;
    if (best >= 0) for (const t of pieces[p]) pieces[best].push(t);
    pieces[p] = [];
    count--;
  }
}

/** Cut tiles into k parts around (cx, cy): seeds at equal steps of angle (from the widest empty gap), then each tile
 *  goes to the seed that reaches it first walking inside the piece, so the cuts follow its shape. */
function byAngle(tiles: number[], k: number, w: number, cx: number, cy: number, near4: Near): number[][] {
  const TAU = Math.PI * 2, a = tiles.map((t) => Math.atan2(((t / w) | 0) - cy, (t % w) - cx)), s = [...a].sort((x, y) => x - y);
  let gap = s[0] + TAU - s[s.length - 1], seam = s[0];
  for (let i = 1; i < s.length; i++) if (s[i] - s[i - 1] > gap) { gap = s[i] - s[i - 1]; seam = s[i]; }
  const order = tiles.map((t, i) => [(a[i] - seam + 2 * TAU) % TAU, t]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const part = new Map<number, number>(), queue: number[] = []; // tile → part; -1 while unreached
  for (const t of tiles) part.set(t, -1);
  for (let j = 0; j < k; j++) { const t = order[Math.floor(((j + 0.5) * order.length) / k)][1]; part.set(t, j); queue.push(t); }
  for (let q = 0; q < queue.length; q++) near4(queue[q], (t) => { if (part.get(t) === -1) { part.set(t, part.get(queue[q])!); queue.push(t); } });
  const out: number[][] = Array.from({ length: k }, () => []);
  for (const t of tiles) out[Math.max(0, part.get(t)!)].push(t);
  return out;
}

/** The tile farthest from the habitat's edge (ties: the first reached), by a BFS inward from the edge tiles.
 *  `seen` is scratch space; it is marked with id + 1. */
function inside(tiles: number[], of: Int32Array, id: number, w: number, h: number, near4: Near, seen: Int32Array) {
  const queue: number[] = [];
  for (const t of tiles) {
    const x = t % w, y = (t / w) | 0;
    let edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
    near4(t, (j) => { if (of[j] !== id) edge = true; });
    if (edge) { seen[t] = id + 1; queue.push(t); }
  }
  for (let q = 0; q < queue.length; q++) near4(queue[q], (j) => { if (of[j] === id && seen[j] !== id + 1) { seen[j] = id + 1; queue.push(j); } });
  const best = queue[queue.length - 1] ?? tiles[0]; // BFS order: the last tile is the deepest
  return { x: best % w, y: (best / w) | 0 };
}

/** A min-heap of [size, id] pairs; ties go to the lower id, so merges come out the same every time. */
class Heap {
  private a: [number, number][] = [];
  get size() { return this.a.length; }
  private less = (i: number, j: number) => this.a[i][0] < this.a[j][0] || (this.a[i][0] === this.a[j][0] && this.a[i][1] < this.a[j][1]);
  private swap(i: number, j: number) { [this.a[i], this.a[j]] = [this.a[j], this.a[i]]; }
  push(size: number, id: number) {
    this.a.push([size, id]);
    for (let i = this.a.length - 1; i > 0 && this.less(i, (i - 1) >> 1); i = (i - 1) >> 1) this.swap(i, (i - 1) >> 1);
  }
  pop(): [number, number] {
    const top = this.a[0], last = this.a.pop()!;
    if (this.a.length) {
      this.a[0] = last;
      for (let i = 0; ;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < this.a.length && this.less(l, m)) m = l;
        if (r < this.a.length && this.less(r, m)) m = r;
        if (m === i) break;
        this.swap(i, m); i = m;
      }
    }
    return top;
  }
}
