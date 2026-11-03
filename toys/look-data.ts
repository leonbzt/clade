// The look toy (slice 02): palettes, the scene's shapes (plants, soil, island) and mock species. No DOM.

export type V3 = [number, number, number];
export type RampId = 'sky' | 'leaf' | 'earth' | 'stone' | 'water' | 'warm' | 'rare' | 'ink';
export type Palette = { name: string; ramps: Record<RampId, string[]> };

// ---- palettes: 24 colours each, as ramps (dark → light) ----
export const PALETTES: Palette[] = [
  {
    name: 'Volcanic',
    ramps: {
      sky: ['#2b2236', '#5a3f5c', '#a3646a', '#e8a57a'],
      leaf: ['#1c2a1a', '#2f4d24', '#557a2c', '#94a83a', '#dccf5e'],
      earth: ['#140d0c', '#2a1915', '#47291f', '#74412a', '#b4774a'],
      stone: ['#34313a', '#625a63', '#a0948f'],
      water: ['#1f5470', '#52a0c0'],
      warm: ['#a82a1c', '#ee6a1c', '#ffcf55'],
      rare: ['#e05ad0'],
      ink: ['#09070b'],
    },
  },
  {
    name: 'Teal',
    ramps: {
      sky: ['#0d2830', '#174752', '#276b75', '#4f9e9b'],
      leaf: ['#10301f', '#1d5631', '#358a3a', '#6cc644', '#c4ef6a'],
      earth: ['#100d12', '#221a20', '#3a2b2b', '#5f4636', '#937154'],
      stone: ['#283540', '#53636d', '#94a3a8'],
      water: ['#176a96', '#5ccbe8'],
      warm: ['#cc311f', '#ff8a1e', '#ffe14a'],
      rare: ['#f59be0'],
      ink: ['#05090b'],
    },
  },
];

const RAMPS: RampId[] = ['sky', 'leaf', 'earth', 'stone', 'water', 'warm', 'rare', 'ink'];
/** A palette flattened: colours in ramp order, each ramp's first index and size, one step darker per colour. */
export type Flat = { hex: string[]; rgb: number[][]; at: Record<RampId, number>; n: Record<RampId, number>; dk: number[] };
export function flatten(p: Palette): Flat {
  const hex: string[] = [], dk: number[] = [];
  const at = {} as Record<RampId, number>, n = {} as Record<RampId, number>;
  for (const r of RAMPS) {
    at[r] = hex.length;
    n[r] = p.ramps[r].length;
    p.ramps[r].forEach((h, i) => (dk.push(at[r] + Math.max(0, i - 1)), hex.push(h)));
  }
  const rgb = hex.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  return { hex, rgb, at, n, dk };
}
/** The palette index of a ramp step, clamped to the ramp. */
export const pi = (f: Flat, r: RampId, i: number) => f.at[r] + Math.max(0, Math.min(f.n[r] - 1, Math.round(i)));

// ---- maths ----
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: V3): V3 => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export type Rng = () => number;
export function rng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash(x: number, y: number, s: number) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise(x: number, y: number, s: number) {
  const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi;
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
  return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
}
const fbm = (x: number, y: number, s: number) =>
  noise(x, y, s) * 0.6 + noise(x * 2, y * 2, s + 1) * 0.3 + noise(x * 4, y * 4, s + 2) * 0.1;

// ---- the world: side view, x 0..64, sky 0..24 up, soil 0..24 down ----
export const WORLD = { w: 64, sky: 24, soil: 24 };
export const SOIL = { cols: 32, rows: 12, cell: 2 };
export const ISLAND = { w: 48, h: 28 };
/** The island's low-res size for a side-view width (tile px from the width). */
export function isleSize(w: number): [number, number, number] {
  const tp = Math.max(3, Math.round(w / 80));
  return [ISLAND.w * tp, 31 * tp, tp];
}
/** The direction toward the sun for a day fraction f (0 sunrise on the left, 1 sunset on the right). */
export function sunDir(f: number): V3 {
  const a = Math.PI * (1 - f);
  return norm([Math.cos(a), Math.sin(a) * 0.9 + 0.06, 0.4]);
}
/** Where the sun's disc sits in the side view's sky. */
export function sunPos(f: number): [number, number] {
  const a = Math.PI * (1 - f);
  return [WORLD.w / 2 + Math.cos(a) * 27, Math.sin(a) * 18 + 3];
}

// ---- plants: a skeleton grown once per gene, built into 3D triangles at any growth ----
export type Leafy = { kind: 'blade' | 'clump'; sides: 3 | 4 | 5; len: number; wid: number; ang: number; fold: number };
export type PlantGene = {
  x: number; z: number; seed: number; stems: number; fan: number; segs: number; segLen: number; w: number;
  taper: number; bend: number; lean: number; fork: number[]; forkAng: number; branch: number; depth: number;
  leaf: Leafy; stemRamp: RampId; stemBias: number; leafRamp: RampId; leafBias: number; start: number;
  roots: number; rare?: boolean; native?: boolean;
};
export const PLANTS: PlantGene[] = [
  { // an upright herb: one stem, broad alternate leaves
    x: 13, z: 0, seed: 11, stems: 1, fan: 0, segs: 8, segLen: 1.45, w: 0.3, taper: 0.9, bend: 0.22, lean: 0,
    fork: [], forkAng: 0, branch: 0, depth: 0, leaf: { kind: 'blade', sides: 5, len: 2.5, wid: 1.0, ang: 1.05, fold: 0.4 },
    stemRamp: 'leaf', stemBias: -1, leafRamp: 'leaf', leafBias: 0, start: 0.1, roots: 3, rare: true,
  },
  { // a forked herb: splits twice, small diamond leaves
    x: 26, z: 0.3, seed: 23, stems: 1, fan: 0, segs: 6, segLen: 1.35, w: 0.26, taper: 0.86, bend: 0.2, lean: 0.05,
    fork: [1, 3], forkAng: 0.42, branch: 0, depth: 0, leaf: { kind: 'blade', sides: 4, len: 1.5, wid: 0.6, ang: 0.85, fold: 0.35 },
    stemRamp: 'leaf', stemBias: -1, leafRamp: 'leaf', leafBias: 1, start: 0.1, roots: 2,
  },
  { // a fan herb: stems arching out from the base, grass-like blades
    x: 39, z: -0.3, seed: 37, stems: 5, fan: 1.2, segs: 5, segLen: 1.05, w: 0.17, taper: 0.86, bend: 0.14, lean: 0.13,
    fork: [], forkAng: 0, branch: 0, depth: 0, leaf: { kind: 'blade', sides: 3, len: 2.1, wid: 0.42, ang: 0.32, fold: 0 },
    stemRamp: 'leaf', stemBias: -1, leafRamp: 'leaf', leafBias: 0, start: 0.1, roots: 3,
  },
  { // the native shrub: woody, branching, foliage clumps
    x: 53, z: -0.6, seed: 41, stems: 2, fan: 0.55, segs: 6, segLen: 1.65, w: 0.5, taper: 0.8, bend: 0.3, lean: 0.06,
    fork: [], forkAng: 0, branch: 0.6, depth: 2, leaf: { kind: 'clump', sides: 5, len: 1.4, wid: 1.25, ang: 0.6, fold: 0 },
    stemRamp: 'earth', stemBias: 1, leafRamp: 'leaf', leafBias: -1, start: 0.75, roots: 2, native: true,
  },
];

type LeafNode = { th: number; ps: number; len: number; wid: number; birth: number; j: number[] };
type Seg = { th: number; ph: number; len: number; w: number; birth: number; leaves: LeafNode[]; kids: Seg[] };
export type Skeleton = { gene: PlantGene; owner: number; stems: Seg[] };
export type PartKind = 'stem' | 'leaf' | 'clump';
export type Part = { kind: PartKind; owner: number; ramp: RampId; bias: number; tris: V3[][] };
const SEG_DUR = 0.12, LEAF_DUR = 0.18;

export function skeleton(g: PlantGene, owner: number): Skeleton {
  const r = rng(g.seed), step = 0.8 / (g.segs + 2);
  const leaf = (th: number, birth: number, scale: number): LeafNode => ({
    th, ps: (r() < 0.5 ? -1 : 1) * (0.35 + r() * 0.7), len: g.leaf.len * scale * (0.85 + r() * 0.3),
    wid: g.leaf.wid * scale * (0.85 + r() * 0.3), birth, j: [r(), r(), r(), r(), r(), r()],
  });
  const chain = (th: number, ph: number, w: number, birth: number, n: number, depth: number, k: number): Seg => {
    const seg: Seg = { th, ph, len: g.segLen * (0.8 + r() * 0.4) * (depth ? 0.75 : 1), w, birth, leaves: [], kids: [] };
    const side = k % 2 ? 1 : -1, scale = 0.6 + 0.4 * (n / g.segs), b = birth + step;
    const clump = g.leaf.kind === 'clump';
    if (n > 1 && (!clump || k >= 2 || depth > 0)) seg.leaves.push(leaf(th + side * g.leaf.ang, b * 0.97, scale));
    if (n === 1) {
      seg.leaves.push(leaf(th, b * 0.97, clump ? 1.2 : 0.8));
      if (!clump && g.leaf.sides > 3) seg.leaves.push(leaf(th - side * g.leaf.ang * 0.6, b, 0.6));
      return seg;
    }
    const nth = th + (r() - 0.5) * g.bend + g.lean * Math.sign(th);
    const nph = ph + (r() - 0.5) * 0.2;
    if (g.fork.includes(k)) {
      seg.kids.push(chain(nth - g.forkAng, nph - 0.2, w * g.taper * 0.85, b, n - 1, depth, k + 1));
      seg.kids.push(chain(nth + g.forkAng, nph + 0.2, w * g.taper * 0.85, b, n - 1, depth, k + 1));
    } else {
      seg.kids.push(chain(nth, nph, w * g.taper, b, n - 1, depth, k + 1));
      if (depth < g.depth && r() < g.branch)
        seg.kids.push(chain(th + side * (0.6 + r() * 0.5), nph, w * g.taper * 0.7, b, Math.max(1, n - 2), depth + 1, 0));
    }
    return seg;
  };
  const stems: Seg[] = [];
  for (let s = 0; s < g.stems; s++) {
    const th = g.stems > 1 ? -g.fan / 2 + (g.fan * s) / (g.stems - 1) + (r() - 0.5) * 0.1 : (r() - 0.5) * 0.1;
    stems.push(chain(th, (r() - 0.5) * 0.4, g.w * (g.stems > 1 ? 0.8 : 1), s * 0.02, g.segs, 0, 0));
  }
  return { gene: g, owner, stems };
}

/** A tapered four-sided prism from a to b (stems and roots). */
export function prism(a: V3, b: V3, w0: number, w1: number): V3[][] {
  const d = norm(sub(b, a));
  let u = cross(d, [0, 0, 1]);
  if (Math.hypot(u[0], u[1], u[2]) < 1e-3) u = [1, 0, 0];
  u = norm(u);
  const v = cross(u, d);
  const ring = (c: V3, w: number) =>
    [0, 1, 2, 3].map((k) => {
      const t = Math.PI / 4 + (k * Math.PI) / 2;
      return add(c, add(mul(u, Math.cos(t) * w), mul(v, Math.sin(t) * w)));
    });
  const A = ring(a, w0), B = ring(b, w1), tris: V3[][] = [];
  for (let k = 0; k < 4; k++) {
    const k1 = (k + 1) % 4;
    tris.push([A[k], A[k1], B[k1]], [A[k], B[k1], B[k]]);
  }
  return tris;
}

function leafTris(p: V3, l: LeafNode, s: number, lf: Leafy): V3[][] {
  const L = l.len * (0.25 + 0.75 * s), W = l.wid * (0.25 + 0.75 * s);
  const u: V3 = [Math.sin(l.th), Math.cos(l.th), 0];
  const v = add(mul([Math.cos(l.th), -Math.sin(l.th), 0], Math.cos(l.ps)), [0, 0, Math.sin(l.ps)]);
  const n = cross(u, v), F = lf.fold * W;
  const at = (t: number, w: number, f: number): V3 => add(p, add(mul(u, L * t), add(mul(v, W * w), mul(n, F * f))));
  if (lf.kind === 'clump') {
    const c = at(0.45, 0, 0), j = l.j;
    const rx = W * (0.8 + 0.4 * j[0]), ry = W * (0.6 + 0.3 * j[1]), rz = W * (0.6 + 0.3 * j[2]);
    const o: V3 = [(j[3] - 0.5) * 0.3 * W, (j[4] - 0.5) * 0.3 * W, (j[5] - 0.5) * 0.3 * W];
    const X = [add(c, [rx, o[1], 0]), add(c, [-rx, -o[1], 0])], Y = [add(c, [o[0], ry, 0]), add(c, [-o[0], -ry * 0.8, 0])];
    const Z = [add(c, [o[2], 0, rz]), add(c, [0, o[2], -rz])], out: V3[][] = [];
    for (const x of X) for (const y of Y) for (const z of Z) out.push([x, y, z]);
    return out;
  }
  const b = at(0, 0, 0), t = at(1, 0, 0);
  if (lf.sides === 3) return [[at(0, 0.5, 0), at(0, -0.5, 0), t]];
  if (lf.sides === 4) return [[b, at(0.45, 1, 1), t], [b, t, at(0.45, -1, 1)]];
  const l1 = at(0.3, 0.9, 1), l2 = at(0.72, 0.6, 0.6);
  return [[b, l1, l2], [b, l2, t], [b, t, at(0.5, -1, 1)]];
}

/** The plant's parts at global growth G (0..1). */
export function buildPlant(sk: Skeleton, Gg: number, out: Part[]) {
  const g = sk.gene, G = Math.min(1, g.start + Gg * (1 - g.start)), o = sk.owner;
  const walk = (seg: Seg, p: V3) => {
    const s = clamp01((G - seg.birth) / SEG_DUR);
    if (s <= 0) return;
    const e = add(p, mul(norm([Math.sin(seg.th), Math.cos(seg.th), seg.ph]), seg.len * s));
    const w0 = seg.w * (0.3 + 0.7 * clamp01((G - seg.birth) / 0.5));
    out.push({ kind: 'stem', owner: o, ramp: g.stemRamp, bias: g.stemBias, tris: prism(p, e, w0, w0 * g.taper) });
    for (const l of seg.leaves) {
      const sl = clamp01((G - l.birth) / LEAF_DUR);
      if (sl > 0) out.push({ kind: g.leaf.kind === 'clump' ? 'clump' : 'leaf', owner: o, ramp: g.leafRamp, bias: g.leafBias, tris: leafTris(e, l, sl, g.leaf) });
    }
    for (const k of seg.kids) walk(k, e);
  };
  for (const st of sk.stems) walk(st, [g.x, 0, g.z]);
}

// ---- soil: a grid of cells with stone, hard soil and pockets; roots planned toward pockets ----
export type Cell = 'soil' | 'hard' | 'stone' | 'water' | 'food' | 'rare';
export const isPocket = (c: Cell) => c === 'water' || c === 'food' || c === 'rare';
export type Root = { owner: number; path: number[]; from: V3 | null; start: number; rate: number; native: boolean };
export type Soil = { cells: Cell[]; pocket: number[]; roots: Root[]; seen0: number[] };
/** A cell's centre in the world, jittered a little so roots wiggle. */
export function cellXY(i: number): [number, number] {
  const c = i % SOIL.cols, r = (i / SOIL.cols) | 0;
  return [c * 2 + 1 + (hash(c, r, 7) - 0.5) * 0.8, -(r * 2 + 1) + (hash(c, r, 8) - 0.5) * 0.8];
}
/** The cell and its 8 neighbours (or 4 with `four`). */
export function around(i: number, four = false): number[] {
  const { cols, rows } = SOIL, c = i % cols, r = (i / cols) | 0, out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (four && dx && dy) continue;
      const x = c + dx, y = r + dy;
      if (x >= 0 && x < cols && y >= 0 && y < rows) out.push(y * cols + x);
    }
  return out;
}

export function makeSoil(seed: number): Soil {
  const { cols, rows } = SOIL, N = cols * rows, r = rng(seed);
  const cells: Cell[] = [];
  for (let i = 0; i < N; i++) cells.push(fbm((i % cols) * 0.22, ((i / cols) | 0) * 0.3, seed) > 0.6 ? 'hard' : 'soil');
  const pocket: number[] = new Array(N).fill(-1);
  let pid = 0;
  const free = (i: number) => cells[i] === 'soil' || cells[i] === 'hard';
  const blob = (type: Cell, size: number, r0: number, r1: number) => {
    for (let tries = 0; tries < 40; tries++) {
      const i0 = (r0 + Math.floor(r() * (r1 - r0 + 1))) * cols + Math.floor(r() * cols);
      if (!free(i0) || around(i0).some((j) => isPocket(cells[j]))) continue;
      const got = [i0];
      cells[i0] = type;
      while (got.length < size) {
        const opts = around(got[Math.floor(r() * got.length)], true).filter(free);
        if (!opts.length) break;
        const j = opts[Math.floor(r() * opts.length)];
        cells[j] = type;
        got.push(j);
      }
      if (isPocket(type)) for (const j of got) pocket[j] = pid;
      if (isPocket(type)) pid++;
      return;
    }
  };
  for (let k = 0; k < 7; k++) blob('stone', 2 + Math.floor(r() * 4), 1, rows - 1);
  for (let k = 0; k < 7; k++) blob('water', 1 + Math.floor(r() * 3), 1, rows - 2);
  for (let k = 0; k < 6; k++) blob('food', 1 + Math.floor(r() * 2), 2, rows - 1);
  blob('rare', 1, rows - 3, rows - 1);
  const seen0: number[] = [];
  PLANTS.forEach((g) => !g.native && seen0.push(...around(Math.floor(g.x / 2))));
  return { cells, pocket, roots: planRoots(cells, pocket), seen0 };
}

function dijkstra(cells: Cell[], src: number[]) {
  const N = cells.length, dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1);
  const done = new Uint8Array(N);
  for (const s of src) dist[s] = 0;
  for (;;) {
    let u = -1, bd = Infinity;
    for (let i = 0; i < N; i++) if (!done[i] && dist[i] < bd) (bd = dist[i]), (u = i);
    if (u < 0) return { dist, prev };
    done[u] = 1;
    for (const v of around(u)) {
      if (v === u || cells[v] === 'stone') continue;
      const diag = v % SOIL.cols !== u % SOIL.cols && Math.abs(v - u) !== 1;
      const d = bd + (cells[v] === 'hard' ? 3 : 1) * (diag ? 1.4 : 1) + (Math.abs(v - u) === 1 ? 0.3 : 0);
      if (d < dist[v]) (dist[v] = d), (prev[v] = u);
    }
  }
}

/** Each plant's roots in turn reach the nearest unclaimed pocket; the rare find is the upright herb's last. */
function planRoots(cells: Cell[], pocket: number[]): Root[] {
  const claimed = new Set<number>(), roots: Root[] = [], mine: number[][] = PLANTS.map(() => []);
  for (let k = 0; k < Math.max(...PLANTS.map((g) => g.roots)); k++)
    PLANTS.forEach((g, o) => {
      if (k >= g.roots) return;
      const { dist, prev } = dijkstra(cells, mine[o].length ? mine[o] : [Math.floor(g.x / 2)]);
      let best = g.rare && k === g.roots - 1 ? cells.indexOf('rare') : -1;
      if (best < 0 || !isFinite(dist[best])) {
        best = -1;
        let bd = Infinity;
        for (let i = 0; i < cells.length; i++)
          if (pocket[i] >= 0 && cells[i] !== 'rare' && !claimed.has(pocket[i]) && dist[i] < bd) (bd = dist[i]), (best = i);
      }
      if (best < 0) return;
      claimed.add(pocket[best]);
      const path: number[] = [];
      for (let i = best; i >= 0; i = prev[i]) path.unshift(i);
      roots.push({ owner: o, path, from: mine[o].length ? null : [g.x, 0, g.z], start: 0, rate: 1, native: !!g.native });
      mine[o].push(...path);
    });
  // timing: a sapling's roots grow one after another between G 0.14 and 0.95; the native's are mostly grown
  PLANTS.forEach((g, o) => {
    const rs = roots.filter((x) => x.owner === o), total = rs.reduce((s, x) => s + x.path.length, 0);
    let at = g.native ? -0.6 : 0.14;
    const rate = total / (g.native ? 0.75 : 0.78);
    for (const x of rs) (x.start = at), (x.rate = rate), (at += x.path.length / rate + 0.01);
  });
  return roots;
}

// ---- the island: tiles from noise, with one species' area and a rare variant's glint ----
export type Tile = 'sea' | 'beach' | 'bare' | 'forest' | 'wet' | 'lava';
export type Island = { tiles: Tile[]; corner: number[]; area: boolean[]; glint: number };
export function makeIsland(seed: number): Island {
  const { w, h } = ISLAND, tiles: Tile[] = [], hs: number[] = [], vx = w * 0.68, vy = h * 0.36;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const nx = (x + 0.5 - w / 2) / (w * 0.46), ny = (y + 0.5 - h / 2) / (h * 0.43);
      const vd = Math.hypot((x - vx) / 7, (y - vy) / 5);
      const e = 1 - Math.hypot(nx, ny) + (fbm(x * 0.13, y * 0.13, seed) - 0.5) * 0.8 + Math.max(0, 1 - vd) * 0.7;
      const m = fbm(x * 0.1 + 9, y * 0.1, seed + 3) + (x < w * 0.5 ? 0.12 : -0.08);
      const t: Tile = e < 0.06 ? 'sea' : e < 0.15 ? 'beach' : vd < 1 && e > 0.5 ? 'lava'
        : m > 0.62 && e < 0.45 ? 'wet' : m > 0.47 ? 'forest' : 'bare';
      tiles.push(t);
      hs.push(t === 'sea' ? -0.4 : t === 'wet' ? 0.3 : Math.max(0.2, e) * 2.2);
    }
  const corner: number[] = [];
  for (let y = 0; y <= h; y++)
    for (let x = 0; x <= w; x++) {
      let s = 0, n = 0;
      for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) {
        const tx = x + dx, ty = y + dy;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h) (s += hs[ty * w + tx]), n++;
      }
      corner.push(s / n);
    }
  // the area: grown from the forest tile nearest a point on the west side
  const r = rng(seed + 9), area: boolean[] = new Array(w * h).fill(false), ok = (t: Tile) => t === 'forest' || t === 'bare' || t === 'wet';
  let start = 0, bd = Infinity;
  tiles.forEach((t, i) => {
    const d = Math.hypot((i % w) - w * 0.3, ((i / w) | 0) - h * 0.55);
    if (t === 'forest' && d < bd) (bd = d), (start = i);
  });
  const front = [start], got: number[] = [];
  area[start] = true;
  while (front.length && got.length < 40) {
    const i = front.splice(Math.floor(r() * front.length), 1)[0];
    got.push(i);
    for (const j of [i - 1, i + 1, i - w, i + w]) {
      if (j < 0 || j >= w * h || Math.abs((j % w) - (i % w)) > 1 || area[j] || !ok(tiles[j])) continue;
      area[j] = true;
      front.push(j);
    }
  }
  front.forEach((i) => (area[i] = false));
  return { tiles, corner, area, glint: got[got.length - 1] };
}

// ---- mock species for the card (the toy has no game rules) ----
export const ATTRS = ['Stature', 'Roots', 'Shade', 'Endurance', 'Defence', 'Health', 'Pace', 'Spread'];
export const CORNER = ['C', 'C', 'S', 'S', 'S', 'S', 'R', 'R'];
export type Species = { name: string; line: string; form: string; tier: string; niche: string; pressure: string; favour: number; pips: number[] };
export const SPECIES: Species[] = [
  { name: 'Ember sprig', line: 'Your line · sapling 1', form: 'Herb', tier: 'B', niche: 'Forest floor', pressure: 'Shade', favour: 0.78, pips: [5, 4, 7, 2, 2, 3, 4, 3] },
  { name: 'Ash fork', line: 'Your line · sapling 2', form: 'Herb', tier: 'C', niche: 'Bare ground', pressure: 'Wind', favour: 0.42, pips: [3, 3, 2, 4, 3, 2, 6, 5] },
  { name: 'Cinder fan', line: 'Your line · sapling 3', form: 'Herb', tier: 'A', niche: 'Beach', pressure: 'Drought', favour: 0.88, pips: [2, 6, 1, 8, 2, 4, 3, 6] },
  { name: 'Island myrtle', line: 'Native · the rival', form: 'Shrub', tier: 'S', niche: 'Forest floor', pressure: 'Shade', favour: 0.95, pips: [8, 7, 6, 5, 7, 6, 2, 2] },
];

/** 3×5 hint digits 1–8, row-major from the top-left. */
export const GLYPH = ['', '010110010010111', '110001010100111', '110001010001110', '101101111001001', '111100110001110',
  '011100111101111', '111001010010010', '111101111101111'];

// ---- what the looks draw each frame ----
export type Pop = { cell: number; kind: Cell; age: number };
export type Frame = {
  parts: Part[]; soil: Soil; revealed: Uint8Array; found: Set<number>; progress: number[]; hints: Int8Array;
  pops: Pop[]; sun: V3; sunF: number; flat: Flat; shadows: boolean; selected: number; time: number; island: Island;
  growth: number;
};
export interface Look {
  side: HTMLCanvasElement;
  isle: HTMLCanvasElement;
  /** Set the low-res side-view width (height is 3/4 of it; the island follows). */
  resize(w: number): void;
  draw(f: Frame): void;
  /** The plant under a click (canvas CSS pixels), or -1. */
  pick(x: number, y: number, f: Frame): number;
}
