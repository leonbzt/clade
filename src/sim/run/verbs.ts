// The verbs on a sapling: a root or a shoot tip sent to a cell, a shoot fed, a cut; the tree's rules (winter and
// spring, cuts re-sprout; part 2); and level-ups. From the toy's verbs and tree. No DOM.
import { ATTRS, MAX_PIPS, shape, type Genes } from '../../data/genes';
import { CELL, GROUND, STAND, T } from '../../data/run';
import type { Rng } from '../rng';
import { addBud, thicken, wakeBelow, type Plant } from './plant';
import { cellCentre, cellIndex, type Plot } from './plot';

export function subtree(p: Plant, i: number): number[] {
  const inside = new Set([i]);
  for (let k = i + 1; k < p.nodes.length; k++) if (inside.has(p.nodes[k].parent)) inside.add(k);
  return [...inside].filter((k) => !p.nodes[k].dead);
}

// ---- cut (free, any time; some nutrient back, its upkeep stops) ----
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
    const side = p.rng() < 0.5 ? 1 : -1, ang = (shape(p.genes, 'angle') * Math.PI) / 180;
    addBud(p, at, n.heading + side * ang * 0.5, 'shoot', 'tip', side);
  }
  if (p.feed && p.nodes[p.feed.node].dead) p.feed = null;
}

// ---- steering: a tip sent to a cell, a shoot fed (each costs the sapling's nutrient) ----
/** A steer's preview: the node it starts from, whether a new tip branches off (or a bud wakes), its cost, the target. */
export interface Steer { from: number; fresh: boolean; cost: number; ok: boolean; x: number; y: number }

/** Branch a new root tip from the nearest root toward a soil cell (hidden or seen), so the rest of the roots grow on as
 * they would. Seen stone can't be a target; seen hard soil costs double. */
export function rootPreview(p: Plant, plot: Plot, x: number, y: number): Steer | null {
  const c = cellIndex(x, y);
  if (c < 0 || (plot.cells[c].seen && plot.cells[c].kind === 'stone')) return null;
  ({ x, y } = cellCentre(c));
  let from = -1, bd = Infinity;
  p.nodes.forEach((n, i) => {
    if (i === 0 || n.dead || n.kind !== 'root' || n.state === 'bud') return;
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < bd) { bd = d; from = i; }
  });
  if (from < 0) return null;
  const n = p.nodes[from], fresh = true;
  const steps = Math.max(1, Math.ceil(Math.hypot(x - n.x, y - n.y) / (CELL / 2))), seen = new Set<number>();
  let cells = 0, hard = 0;
  for (let s = 1; s <= steps; s++) {
    const k = cellIndex(n.x + ((x - n.x) * s) / steps, n.y + ((y - n.y) * s) / steps);
    if (k < 0 || seen.has(k)) continue;
    seen.add(k); cells++;
    if (plot.cells[k].seen && plot.cells[k].kind === 'hard') hard++;
  }
  const cost = T.digBase + T.digPerCell * (cells + hard);
  return { from, fresh, cost, ok: p.nutrient >= cost, x, y };
}
/** Returns the root tip now heading there, or -1. */
export function rootToward(p: Plant, plot: Plot, x: number, y: number): number {
  const d = rootPreview(p, plot, x, y);
  if (!d || !d.ok) return -1;
  p.nutrient -= d.cost;
  const i = addBud(p, d.from, Math.atan2(d.y - p.nodes[d.from].y, d.x - p.nodes[d.from].x), 'root', 'tip');
  p.nodes[i].target = { x: d.x, y: d.y };
  return i;
}

/** Send the nearest shoot tip (or a bud, woken) to a point in the sky; moss: the nearest creeping edge along the ground. */
export function shootPreview(p: Plant, x: number, y: number): Steer | null {
  const moss = p.form === 'moss';
  if (moss) y = GROUND - 2;
  let from = -1, bd = Infinity;
  p.nodes.forEach((n, i) => {
    if (i === 0 || n.dead || n.kind !== 'shoot' || (n.state !== 'tip' && n.state !== 'bud') || (moss && !n.creep)) return;
    const d = moss ? Math.abs(n.x - x) : Math.hypot(n.x - x, n.y - y) + (n.state === 'bud' ? CELL : 0);
    if (d < bd) { bd = d; from = i; }
  });
  if (from < 0) return null;
  const n = p.nodes[from], fresh = n.state === 'bud', dist = moss ? Math.abs(n.x - x) : Math.hypot(n.x - x, n.y - y);
  const cost = STAND.lean.base + (STAND.lean.perCell * dist) / CELL + (fresh ? T.wakeCost : 0);
  return { from, fresh, cost, ok: p.nutrient >= cost, x, y };
}
export function shootToward(p: Plant, x: number, y: number): boolean {
  const d = shootPreview(p, x, y);
  if (!d || !d.ok) return false;
  p.nutrient -= d.cost;
  const n = p.nodes[d.from];
  if (n.state === 'bud') n.state = 'tip';
  n.target = { x: d.x, y: d.y };
  return true;
}

/** Feed a shoot: its tips get most of the growth for a while (a shoot with no tips wakes up to 2 of its buds). */
export function feedPreview(p: Plant, node: number) {
  const n = p.nodes[node];
  if (!n || n.dead || n.kind !== 'shoot') return null;
  const inside = subtree(p, node).filter((k) => p.nodes[k].kind === 'shoot');
  const tips = inside.filter((k) => p.nodes[k].state === 'tip');
  const buds = tips.length ? [] : inside.filter((k) => p.nodes[k].state === 'bud').slice(0, 2);
  const cost = STAND.feed.cost;
  return { tips: tips.length + buds.length, buds, cost, ok: p.nutrient >= cost && tips.length + buds.length > 0 };
}
export function feed(p: Plant, node: number): boolean {
  const f = feedPreview(p, node);
  if (!f || !f.ok) return false;
  p.nutrient -= f.cost;
  for (const b of f.buds) p.nodes[b].state = 'tip';
  p.feed = { node, left: STAND.feed.ticks };
  return true;
}

// ---- the tree's rules (part 2) ----

/** Winter: every living segment lays down wood with its load, then the leaves fall. The frame and buds stay. */
export function winter(p: Plant) {
  const load = new Float32Array(p.nodes.length), th = shape(p.genes, 'thickness');
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
  const leaf = shape(p.genes, 'leaf'), toEnd = new Float32Array(p.nodes.length).fill(Infinity);
  for (let i = p.nodes.length - 1; i > 0; i--) {
    const n = p.nodes[i];
    if (n.dead || n.kind !== 'shoot' || !n.len) continue;
    if (toEnd[i] === Infinity) toEnd[i] = 0;
    if (toEnd[i] <= T.tree.shell) n.leaf = leaf;
    toEnd[n.parent] = Math.min(toEnd[n.parent], toEnd[i] + 1);
  }
  thicken(p);
}

// ---- level-ups (until 1b's pips and mutations, each new sapling is the founder + one) ----
export interface LevelUp { genes: Genes; changed: number[]; sport: boolean }

/** One more pip in attribute i; a sport instead puts +2 there and takes 1 from another attribute. */
export function bumped(g: Genes, i: number, sport: boolean, rng: Rng): LevelUp {
  const genes = [...g], changed = [i];
  if (sport && genes[i] + 2 <= MAX_PIPS) {
    const from = ATTRS.map((_, j) => j).filter((j) => j !== i && genes[j] > 0);
    if (from.length) {
      const j = from[Math.floor(rng() * from.length)];
      genes[i] += 2; genes[j]--; changed.push(j);
      return { genes, changed, sport: true };
    }
  }
  genes[i]++;
  return { genes, changed, sport: false };
}

/** n level-ups, each +1 pip in a different attribute; one of them is a sport (+2 / −1). */
export function levelUps(g: Genes, rng: Rng, n: number): LevelUp[] {
  const open = ATTRS.map((_, i) => i).filter((i) => g[i] < MAX_PIPS).sort(() => rng() - 0.5).slice(0, n);
  const sport = Math.floor(rng() * open.length);
  return open.map((i, k) => bumped(g, i, k === sport, rng));
}
