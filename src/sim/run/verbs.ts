// What a pick or a click does to the plant: wake a bud, root toward a cell, a leaf flush, cut; the tree's rules
// (wood carries height, winter and spring, cuts re-sprout); and the brood. From the toy's verbs and tree. No DOM.
import { FORMS, GENES, PIPS, gene, type Genes } from '../../data/genes';
import { CELL, PULSE, T } from '../../data/run';
import { seeded, type Rng } from '../rng';
import { addBud, measure, newPlant, thicken, tick, wakeBelow, type Body, type Plant } from './plant';
import { cellIndex, knownCopy, plotTick, type Plot } from './plot';

export function subtree(p: Plant, i: number): number[] {
  const inside = new Set([i]);
  for (let k = i + 1; k < p.nodes.length; k++) if (inside.has(p.nodes[k].parent)) inside.add(k);
  return [...inside].filter((k) => !p.nodes[k].dead);
}

// ---- cut (free between pulses; some nutrient back) ----
export function cutPreview(p: Plant, i: number) {
  const gone = subtree(p, i).map((k) => p.nodes[k]).filter((n) => n.state !== 'bud');
  let wakes = 0;
  for (let n = p.nodes[i].parent, k = 0; k < 3 && n >= 0; k++, n = p.nodes[n].parent) wakes += p.nodes.filter((b) => b.parent === n && b.state === 'bud' && !b.dead).length;
  return { segs: gone.length, leaves: gone.filter((n) => n.leaf > 0).length, back: gone.length * T.cutBack, wakes, sprout: p.form === 'tree' && wakes === 0 && p.nodes[i].parent > 0 };
}
export function cut(p: Plant, i: number) {
  if (i <= 0 || p.nodes[i].dead) return;
  const pr = cutPreview(p, i), at = p.nodes[i].parent, n = p.nodes[i];
  for (const k of subtree(p, i)) p.nodes[k].dead = true;
  p.nutrient += pr.back;
  wakeBelow(p, i);
  if (pr.sprout) { // a tree's stump sprouts a new shoot
    const side = p.rng() < 0.5 ? 1 : -1, ang = (gene(p.genes, 'angle') * Math.PI) / 180;
    addBud(p, at, n.heading + side * ang * 0.5, 'shoot', 'tip', side);
  }
  if (p.focus >= 0 && p.nodes[p.focus].dead) p.focus = -1;
}

// ---- the offers' effects ----
export function wake(p: Plant, bud: number): boolean {
  if (p.nutrient < T.wakeCost) return false;
  p.nutrient -= T.wakeCost;
  p.nodes[bud].state = 'tip';
  return true;
}

/** Send the nearest root (within reach) toward a seen cell. Hard soil costs double; stone blocks. */
export function rootPreview(p: Plant, plot: Plot, x: number, y: number) {
  const c = cellIndex(x, y);
  if (c < 0 || !plot.cells[c].seen) return null;
  let from = -1, bd = (T.digReach * CELL) ** 2;
  p.nodes.forEach((n, i) => {
    if (i === 0 || n.dead || n.kind !== 'root' || n.state === 'bud') return;
    const d = (n.x - x) ** 2 + (n.y - y) ** 2;
    if (d < bd) { bd = d; from = i; }
  });
  if (from < 0) return null;
  const n = p.nodes[from], fresh = n.state !== 'tip' || !!n.target;
  const steps = Math.max(1, Math.ceil(Math.hypot(x - n.x, y - n.y) / (CELL / 2))), seen = new Set<number>();
  let cells = 0, hard = 0, blocked = false;
  for (let s = 1; s <= steps; s++) {
    const k = cellIndex(n.x + ((x - n.x) * s) / steps, n.y + ((y - n.y) * s) / steps);
    if (k < 0 || seen.has(k)) continue;
    seen.add(k); cells++;
    if (plot.cells[k].seen && plot.cells[k].kind === 'stone') blocked = true;
    if (plot.cells[k].seen && plot.cells[k].kind === 'hard') hard++;
  }
  return { from, fresh, blocked, cost: T.digBase + T.digPerCell * (cells + hard) + (fresh ? T.newRootTip : 0) };
}
/** Returns the root tip now heading there, or -1. */
export function rootToward(p: Plant, plot: Plot, x: number, y: number): number {
  const d = rootPreview(p, plot, x, y);
  if (!d || d.blocked || p.nutrient < d.cost) return -1;
  p.nutrient -= d.cost;
  let i = d.from;
  if (d.fresh) i = addBud(p, d.from, Math.atan2(y - p.nodes[i].y, x - p.nodes[i].x), 'root', 'tip');
  p.nodes[i].target = { x, y };
  return i;
}

/** The leafless or small-leafed segments near a node that a flush would fill. */
export function flushTargets(p: Plant, at: number): number[] {
  const a = p.nodes[at], max = gene(p.genes, 'leaf') * (p.form === 'moss' ? 0.6 : 1) + 1;
  return p.nodes.map((n, i) => [n, i] as const)
    .filter(([n]) => !n.dead && n.kind === 'shoot' && n.len > 0 && n.leaf < max)
    .sort((x, y) => Math.hypot(x[0].x - a.x, x[0].y - a.y) - Math.hypot(y[0].x - a.x, y[0].y - a.y))
    .slice(0, PULSE.leafFlush.segs).map(([, i]) => i);
}
export const flushCost = (p: Plant, at: number) => flushTargets(p, at).length * PULSE.leafFlush.cost;
export function leafFlush(p: Plant, at: number): boolean {
  const ts = flushTargets(p, at), cost = ts.length * PULSE.leafFlush.cost, max = gene(p.genes, 'leaf') * (p.form === 'moss' ? 0.6 : 1) + 1;
  if (!ts.length || p.energy < cost) return false;
  p.energy -= cost;
  for (const i of ts) p.nodes[i].leaf = Math.min(max, Math.max(p.nodes[i].leaf, gene(p.genes, 'leaf') * (p.form === 'moss' ? 0.6 : 1)) + 1);
  return true;
}

// ---- the tree's rules ----

/** Winter: every living segment lays down wood with its load, then the leaves fall. The frame and buds stay. */
export function winter(p: Plant) {
  const load = new Float32Array(p.nodes.length), th = gene(p.genes, 'thickness');
  for (let i = p.nodes.length - 1; i > 0; i--) {
    const n = p.nodes[i];
    if (n.dead || n.state === 'bud') continue;
    load[i] += n.leaf > 0 || n.kind === 'root' ? 1 : 0;
    if (n.len) n.wood += T.tree.wood * th * Math.sqrt(load[i]) * (n.kind === 'root' ? 0.5 : 1);
    if (n.parent >= 0) load[n.parent] += load[i];
  }
  for (const n of p.nodes) if (n.kind === 'shoot') n.leaf = 0;
  thicken(p);
}

/** Spring: leaves come back on the crown's outer shell (near the stems' ends). */
export function spring(p: Plant) {
  p.season++;
  p.acc = { net: 0, cost: 0, n: 0 };
  const leaf = gene(p.genes, 'leaf'), toEnd = new Float32Array(p.nodes.length).fill(Infinity);
  for (let i = p.nodes.length - 1; i > 0; i--) {
    const n = p.nodes[i];
    if (n.dead || n.kind !== 'shoot' || !n.len) continue;
    if (toEnd[i] === Infinity) toEnd[i] = 0;
    if (toEnd[i] <= T.tree.shell) n.leaf = leaf;
    toEnd[n.parent] = Math.min(toEnd[n.parent], toEnd[i] + 1);
  }
  thicken(p);
}

// ---- the brood ----
export function mutate(g: Genes, rng: Rng): { genes: Genes; changed: number[] } {
  const genes = [...g], changed: number[] = [], k = 1 + Math.floor(rng() * 3);
  for (let tries = 0; changed.length < k && tries < 50; tries++) {
    const i = Math.floor(rng() * GENES.length);
    if (changed.includes(i)) continue;
    const v = Math.max(1, Math.min(PIPS, genes[i] + (rng() < 0.5 ? -1 : 1) * (rng() < 0.2 ? 2 : 1)));
    if (v === genes[i]) continue;
    genes[i] = v; changed.push(i);
  }
  return { genes, changed };
}

export interface Seed { genes: Genes; changed: number[]; spot: number; body: Plant; stats: Body }

/** A season grown with no picks, on what you've seen of the soil (hidden cells count as loam). */
export function predict(genes: Genes, spot: number, plot: Plot, seed: number, form: Plant['form']): { body: Plant; stats: Body } {
  const w = knownCopy(plot), body = newPlant(genes, spot, w, seeded(seed), form), ticks = FORMS[form].seasonTicks;
  w.dry = false;
  for (let t = 1; t <= ticks; t++) { plotTick(w, t, ticks); tick(body, w, t); }
  return { body, stats: measure(body, w) };
}

/** n seeds on different spots, each one season predicted. */
export function brood(parent: Plant, plot: Plot, rng: Rng, n: number): Seed[] {
  const spots = [0, 1, 2, 3, 4].sort(() => rng() - 0.5).slice(0, n).sort((a, b) => a - b);
  return spots.map((spot, i) => {
    const { genes, changed } = mutate(parent.genes, rng);
    return { genes, changed, spot, ...predict(genes, spot, plot, plot.seed * 7 + i + parent.season * 13, parent.form) };
  });
}

