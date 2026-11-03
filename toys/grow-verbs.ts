// Grow toy (slices 00, 00b): the verbs (wake a bud, cut a branch, dig), each with its preview, and the brood. No DOM.

import { CELL, GENES, PIPS, SPOTS, T, formOf, gene, type FormId, type Genes } from './grow-data';
import { addBud, extendShoot, newPlant, score, stats, tick, upkeepOf, wakeBelow, type Node, type Plant, type Stats } from './grow-sim';
import { cellIndex, knownCopy, seeded, worldTick, type Rng, type World } from './grow-world';

// ---- wake a bud ----

export function nearest(p: Plant, x: number, y: number, ok: (n: Node) => boolean, r = 8): number {
  let best = -1, bd = r * r;
  p.nodes.forEach((n, i) => {
    if (i === 0 || n.dead || !ok(n)) return;
    const d = (n.x - x) ** 2 + (n.y - y) ** 2;
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

/** What the genes would grow from this bud: a few segments, drawn as a ghost. */
export function ghost(p: Plant, world: World, bud: number): Node[] {
  const b = p.nodes[bud];
  const tmp: Plant = { ...p, rng: seeded(bud), nodes: [{ ...b, parent: -1, state: 'tip' }] };
  let tip = 0;
  for (let s = 0; s < T.ghostSteps && tip >= 0; s++) tip = extendShoot(tmp, world, tip);
  return tmp.nodes;
}

export function wake(p: Plant, bud: number): boolean {
  if (p.nutrient < T.wakeCost) return false;
  p.nutrient -= T.wakeCost;
  p.nodes[bud].state = 'tip';
  return true;
}

// ---- cut a branch ----

export function subtree(p: Plant, i: number): number[] {
  const inside = new Set([i]);
  for (let k = i + 1; k < p.nodes.length; k++) if (inside.has(p.nodes[k].parent)) inside.add(k);
  return [...inside].filter((k) => !p.nodes[k].dead);
}

export function cutPreview(p: Plant, world: World, i: number) {
  const cut = subtree(p, i).map((k) => p.nodes[k]).filter((n) => n.state !== 'bud');
  const leaves = cut.filter((n) => n.leaf > 0);
  const energy = leaves.reduce((s, n) => s + n.leaf * n.light * T.leafRate, 0) * 10;
  const water = leaves.reduce((s, n) => s + n.leaf * n.light * T.leafThirst, 0) * world.habitat.thirst * 10;
  const upkeep = cut.reduce((s, n) => s + upkeepOf(n), 0) * 10;
  let wakes = 0;
  for (let n = p.nodes[i].parent, k = 0; k < 3 && n >= 0; k++, n = p.nodes[n].parent) {
    wakes += p.nodes.filter((b) => b.parent === n && b.state === 'bud' && !b.dead).length;
  }
  return { segs: cut.length, leaves: leaves.length, energy, water, upkeep, back: cut.length * T.cutBack, wakes };
}

export function cut(p: Plant, world: World, i: number) {
  const pr = cutPreview(p, world, i);
  for (const k of subtree(p, i)) p.nodes[k].dead = true;
  p.nutrient += pr.back;
  wakeBelow(p, i);
}

// ---- dig ----

export interface Dig { from: number; cost: number; cells: number; hard: number; fresh: boolean; blocked: string }

/** Send the nearest root (within reach) to a seen cell. Hard soil costs double; stone can't be dug. */
export function digPreview(p: Plant, world: World, x: number, y: number): Dig | null {
  const c = cellIndex(x, y);
  if (c < 0 || !world.cells[c].seen) return null;
  const from = nearest(p, x, y, (n) => n.kind === 'root' && n.state !== 'bud', T.digReach * CELL);
  if (from < 0) return null;
  const n = p.nodes[from], fresh = n.state !== 'tip' || !!n.target;
  const dist = Math.hypot(x - n.x, y - n.y), steps = Math.max(1, Math.ceil(dist / (CELL / 2)));
  const seen = new Set<number>();
  let cells = 0, hard = 0, blocked = '';
  for (let s = 1; s <= steps; s++) {
    const k = cellIndex(n.x + ((x - n.x) * s) / steps, n.y + ((y - n.y) * s) / steps);
    if (k < 0 || seen.has(k)) continue;
    seen.add(k);
    const kind = world.cells[k].kind;
    if (kind === 'stone' && world.cells[k].seen) blocked = 'stone in the way';
    cells++;
    if (kind === 'hard' && world.cells[k].seen) hard++;
  }
  const cost = T.digBase + T.digPerCell * (cells + hard) + (fresh ? T.newRootTip : 0);
  return { from, cost, cells, hard, fresh, blocked };
}

export function dig(p: Plant, world: World, x: number, y: number): boolean {
  const d = digPreview(p, world, x, y);
  if (!d || d.blocked || p.nutrient < d.cost) return false;
  p.nutrient -= d.cost;
  let i = d.from;
  if (d.fresh) i = addBud(p, d.from, Math.atan2(y - p.nodes[i].y, x - p.nodes[i].x), 'root', 'tip');
  p.nodes[i].target = { x, y };
  return true;
}

// ---- the brood ----

export function mutate(g: Genes, rng: () => number): { genes: Genes; changed: number[] } {
  const genes = [...g], changed: number[] = [];
  const k = 1 + Math.floor(rng() * 3);
  for (let tries = 0; changed.length < k && tries < 50; tries++) {
    const i = Math.floor(rng() * GENES.length);
    if (changed.includes(i)) continue;
    const v = Math.max(1, Math.min(PIPS, genes[i] + (rng() < 0.5 ? -1 : 1) * (rng() < 0.2 ? 2 : 1)));
    if (v === genes[i]) continue;
    genes[i] = v;
    changed.push(i);
  }
  return { genes, changed };
}

export interface Seed { genes: Genes; changed: number[]; spot: number; body: Plant; stats: Stats; score: number }
export type Make = (genes: Genes, spot: number, world: World | null, rng: Rng) => Plant;
export interface Brood { seeds: Seed[]; base: { stats: Stats; score: number } }

/** A season grown without verbs, on what you've seen of the soil (hidden cells count as loam). */
export function predict(genes: Genes, spot: number, world: World, target: string, seed: number, form: FormId, make: Make) {
  const w = knownCopy(world), body = make(genes, spot, w, seeded(seed)), ticks = formOf(form).seasonTicks;
  for (let t = 1; t <= ticks; t++) { worldTick(w, t, ticks); tick(body, w, t); }
  const s = stats(body, w);
  return { body, stats: s, score: score(s, target) };
}

/** n seeds on different spots, each one season predicted; base = the parent's genes on its own spot, no verbs. */
export function brood(parent: Plant, world: World, target: string, rng: () => number, n: number, make: Make): Brood {
  const spots = [0, 1, 2, 3, 4].sort(() => rng() - 0.5).slice(0, n).sort((a, b) => a - b);
  const base = predict(parent.genes, parent.spot, world, target, world.seed * 7 + 9, parent.form, make);
  const seeds = spots.map((spot, i) => {
    const { genes, changed } = mutate(parent.genes, rng);
    return { genes, changed, spot, ...predict(genes, spot, world, target, world.seed * 7 + i, parent.form, make) };
  });
  return { seeds, base };
}

/** The open spot nearest the middle: where a line starts. */
export function startSpot(world: World): number {
  const open = [2, 1, 3, 0, 4].filter((s) => !world.habitat.neighbours.some((nb) => Math.abs(SPOTS[s] - nb.x) < nb.w / 2));
  return open.length ? open[0] : 2;
}

export const spotLabel = (world: World, spot: number) => {
  const x = SPOTS[spot], under = world.habitat.neighbours.find((nb) => Math.abs(x - nb.x) < nb.w / 2);
  const roots = world.habitat.neighbours.find((nb) => Math.abs(x - nb.x) < nb.roots);
  return under ? `under the ${under.kind}` : roots ? `in the open, by the ${roots.kind}'s roots` : 'in the open';
};

export const makeHerb: Make = (g, s, w, r) => newPlant(g, s, w, r, 'herb');

export const geneText = (g: Genes, i: number) => {
  const d = GENES[i], v = gene(g, d.id);
  return v < 10 ? v.toFixed(2) : Math.round(v).toString();
};
