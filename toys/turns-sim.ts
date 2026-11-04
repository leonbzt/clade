// Toy A (slice 04): grow by turns, the rules (no DOM). One plant on a side-view board: leaves make energy by their
// light, roots draw water and nutrient from hidden pockets, you spend it placing parts next to the plant.
import { between, seeded, type Rng } from '../src/sim/rng';
import { tierOf } from '../src/data/genes';
import { COLS, NATIVES, PARTS, ROWS, RULE, SKY, TURNS, type Blobs, type Cost, type PartId, type Plot } from './turns-data';

export type Soil = 'sky' | 'loam' | 'stone' | 'damp' | 'rich';
export const idx = (x: number, y: number) => y * COLS + x;
export const xy = (i: number): [number, number] => [i % COLS, Math.floor(i / COLS)];
const inside = (x: number, y: number) => x >= 0 && x < COLS && y >= 0 && y < ROWS;
const N4: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const N8: [number, number][] = [...N4, [1, 1], [1, -1], [-1, 1], [-1, -1]];
export const around = (i: number, ns = N4) => {
  const [x, y] = xy(i), out: number[] = [];
  for (const [dx, dy] of ns) if (inside(x + dx, y + dy)) out.push(idx(x + dx, y + dy));
  return out;
};
export const isSky = (i: number) => i < SKY * COLS;

export interface Game {
  plot: Plot; seed: number; turn: number; drought: number; over: boolean;
  e: number; w: number; n: number;
  part: (PartId | null)[]; soil: Soil[]; amt: number[]; seen: boolean[]; native: number[]; // native: -1 or its id
  undo: { i: number; id: PartId }[]; log: string[]; wilted: number;
}

function blobs(g: Game, rng: Rng, b: Blobs, kind: Soil) {
  for (let k = 0; k < b.count; k++) {
    let x = between(rng, [0, COLS - 1]), y = SKY - 1 + between(rng, b.depth), size = between(rng, b.size);
    for (let tries = 0; size > 0 && tries < 20; tries++) {
      const i = idx(x, Math.min(ROWS - 1, y));
      if (g.soil[i] === 'loam' && g.native[i] < 0) {
        g.soil[i] = kind; size--;
        g.amt[i] = kind === 'damp' ? between(rng, RULE.damp) : kind === 'rich' ? between(rng, RULE.rich) : 0;
      }
      const [dx, dy] = N4[Math.floor(rng() * 4)];
      if (inside(x + dx, y + dy) && y + dy >= SKY) { x += dx; y += dy; }
    }
  }
}

export function newGame(plot: Plot, seed: number): Game {
  const rng = seeded(seed), n = COLS * ROWS;
  const g: Game = {
    plot, seed, turn: 1, drought: between(rng, RULE.droughtAt), over: false, ...RULE.start,
    part: Array(n).fill(null), soil: Array.from({ length: n }, (_, i) => (isSky(i) ? 'sky' : 'loam')),
    amt: Array(n).fill(0), seen: Array(n).fill(false), native: Array(n).fill(-1), undo: [], log: [], wilted: 0,
  };
  plot.natives.forEach((nv, id) => {
    const at = between(rng, nv.at), kind = NATIVES[nv.kind];
    for (const [dx, h] of kind.shoot) if (inside(at + dx, SKY - h)) g.native[idx(at + dx, SKY - h)] = id;
    for (const [dx, d] of kind.roots) if (inside(at + dx, SKY - 1 + d)) g.native[idx(at + dx, SKY - 1 + d)] = id;
  });
  blobs(g, rng, plot.stone, 'stone');
  blobs(g, rng, plot.damp, 'damp');
  blobs(g, rng, plot.rich, 'rich');
  // the seedling: a stem on the ground, two seed leaves, one root (natives give way)
  const b = between(rng, plot.base), seedling: [number, number, PartId][] = [[b, SKY - 1, 'stem'], [b - 1, SKY - 1, 'leaf'], [b + 1, SKY - 1, 'leaf'], [b, SKY, 'root']];
  for (const [x, y, id] of seedling) {
    const i = idx(x, y);
    g.native[i] = -1; g.part[i] = id;
    if (!isSky(i)) { g.soil[i] = 'loam'; g.amt[i] = 0; reveal(g, i); }
  }
  return g;
}

function reveal(g: Game, i: number) {
  g.seen[i] = true;
  for (const j of around(i)) g.seen[j] = true;
}

/** Light at a sky cell, 0..RULE.light: each leaf or native cell on the ray toward the sun takes 1. */
export function lightAt(g: Game, i: number): number {
  let [x, y] = xy(i), fx = x, block = 0;
  for (y--; y >= 0; y--) {
    fx -= g.plot.sun;
    const cx = Math.round(fx);
    if (cx < 0 || cx >= COLS) { block += g.plot.edge; break; }
    const j = idx(cx, y);
    if (g.part[j] === 'leaf' || g.native[j] >= 0) block++;
    if (block >= RULE.light) break;
  }
  return Math.max(0, RULE.light - block);
}
export const lightMap = (g: Game) => g.part.map((_, i) => (isSky(i) ? lightAt(g, i) : 0));

/** Hidden pockets in the 8 cells around a seen cell: the damp and rich signs. */
export function signs(g: Game, i: number) {
  let damp = 0, rich = 0;
  for (const j of around(i, N8)) if (!g.seen[j]) { if (g.soil[j] === 'damp') damp++; else if (g.soil[j] === 'rich') rich++; }
  return { damp, rich };
}

export const afford = (g: Game, c: Cost) => g.e >= c.e && g.w >= c.w && g.n >= c.n;

/** Why a part can't go here, or null when it can. */
export function whyNot(g: Game, id: PartId, i: number): string | null {
  if (g.over) return 'the round is over';
  if (g.part[i]) return 'taken';
  if (g.native[i] >= 0) return `held by the ${NATIVES[g.plot.natives[g.native[i]].kind].name.toLowerCase()}`;
  const near = around(i).map((j) => g.part[j]);
  if (id === 'root') {
    if (isSky(i)) return 'roots go in the soil';
    if (g.soil[i] === 'stone') return 'stone';
    if (!near.includes('root')) return 'not next to a root';
  } else {
    if (!isSky(i)) return 'shoots go above ground';
    if (!near.includes('stem')) return 'not next to a stem';
  }
  if (!afford(g, PARTS[id].cost)) return 'not enough';
  return null;
}

export function place(g: Game, id: PartId, i: number): boolean {
  if (whyNot(g, id, i)) return false;
  const c = PARTS[id].cost;
  g.e -= c.e; g.w -= c.w; g.n -= c.n;
  g.part[i] = id;
  if (id === 'root') reveal(g, i);
  g.undo.push({ i, id });
  return true;
}

/** Take back the last part placed this turn (what it revealed stays seen). */
export function undo(g: Game) {
  const u = g.undo.pop();
  if (!u) return;
  const c = PARTS[u.id].cost;
  g.e += c.e; g.w += c.w; g.n += c.n;
  g.part[u.i] = null;
}

/** The end of this turn, without changing anything: income, upkeep and how many leaves would wilt. */
export function forecast(g: Game) {
  const dry = g.turn === g.drought, light = lightMap(g);
  let energy = 0, leaves = 0, rootsW = 0, nutrient = 0;
  const left = g.amt.slice();
  g.part.forEach((p, i) => {
    if (p === 'leaf') { energy += light[i]; leaves++; }
    if (p !== 'root') return;
    if (g.soil[i] === 'damp') { const d = Math.min(left[i], dry ? RULE.droughtDraw : RULE.dampDraw); left[i] -= d; rootsW += d; }
    if (g.soil[i] === 'rich') { const d = Math.min(left[i], RULE.richDraw); left[i] -= d; nutrient += d; }
  });
  const rain = dry ? 0 : g.plot.rain, drink = leaves * (dry ? RULE.droughtThirst : RULE.thirst);
  const water = g.w + rain + rootsW - drink;
  return { dry, energy, rain, rootsW, drink, nutrient, left, wilt: Math.min(leaves, Math.max(0, -water)), water: Math.max(0, water) };
}

/** End the turn: income, natives drink, leaves drink; leaves wilt for each water short (the darkest first). */
export function endTurn(g: Game) {
  if (g.over) return;
  const f = forecast(g), light = lightMap(g);
  g.amt = f.left;
  g.native.forEach((id, i) => {
    if (id >= 0 && (g.soil[i] === 'damp' || g.soil[i] === 'rich')) g.amt[i] = Math.max(0, g.amt[i] - RULE.nativeDraw);
  });
  g.e += f.energy; g.n += f.nutrient; g.w = f.water;
  const leaves = g.part.map((p, i) => (p === 'leaf' ? i : -1)).filter((i) => i >= 0).sort((a, b) => light[a] - light[b] || b - a);
  for (const i of leaves.slice(0, f.wilt)) g.part[i] = null;
  g.wilted += f.wilt;
  g.log = [
    `Turn ${g.turn}${f.dry ? ' (drought)' : ''}: +${f.energy} energy, +${f.rain + f.rootsW} water (rain ${f.rain}, roots ${f.rootsW}), −${f.drink} drunk, +${f.nutrient} nutrient.`,
    ...(f.wilt ? [`${f.wilt} ${f.wilt > 1 ? 'leaves' : 'leaf'} wilted: not enough water.`] : []),
  ];
  g.undo = [];
  if (g.turn >= TURNS) g.over = true; else g.turn++;
}

export function score(g: Game) {
  const flowers = g.part.filter((p) => p === 'flower').length, grams = g.part.filter(Boolean).length;
  const total = flowers * RULE.flowerPoints + grams, pct = Math.min(100, Math.round((total / g.plot.target) * 100));
  return { flowers, grams, total, pct, tier: tierOf(pct) };
}

/** What a leaf here would add to the energy, all shading counted. */
export function leafGain(g: Game, i: number): number {
  if (g.part[i] || g.native[i] >= 0 || !isSky(i)) return 0;
  const sum = () => lightMap(g).reduce((s, l, j) => s + (g.part[j] === 'leaf' ? l : 0), 0);
  const before = sum();
  g.part[i] = 'leaf';
  const after = sum();
  g.part[i] = null;
  return after - before;
}
