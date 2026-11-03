// Grow toy (slice 00b): readable trade-offs. What a verb does to the stats and the score, and why a seed scores as
// it does. Each "what if" builds a changed copy of the plant and reads its stats; nothing is simulated ahead. No DOM.

import { STAT_SCALE, T, TARGETS, gene, type StatId } from './grow-data';
import { segCost, stats, upkeepOf, type Node, type Plant, type Stats } from './grow-sim';
import { cutPreview, ghost, subtree } from './grow-verbs';
import { cellIndex, isPocket, light, type World } from './grow-world';

const NAME: Record<StatId, string> = { reach: 'Reach', spread: 'Spread', roots: 'Roots', toughness: 'Toughness', growth: 'Growth', upkeep: 'Upkeep' };
const UNIT: Record<StatId, (v: number) => string> = {
  reach: (v) => `${Math.round(v)} cm`, spread: (v) => `${Math.round(v)} cm`, roots: (v) => `${Math.round(v)}`,
  toughness: (v) => v.toFixed(2), growth: (v) => `${v.toFixed(2)}/s`, upkeep: (v) => `${v.toFixed(2)}/s`,
};
const STATS = Object.keys(NAME) as StatId[];
const sign = (v: number, s: string) => (v >= 0 ? '+' : '−') + s;

/** Each stat's share of the score (before rounding), so differences can be split by cause. */
function parts(s: Stats, target: string): Record<StatId, number> {
  const w = TARGETS.find((t) => t.id === target)!.w, out = {} as Record<StatId, number>;
  for (const k of STATS) out[k] = (w[k] ?? 0) * 100 * Math.min(1, Math.max(0, s[k]) / STAT_SCALE[k]);
  return out;
}
const total = (p: Record<StatId, number>) => Math.max(0, Math.min(100, Object.values(p).reduce((a, b) => a + b, 0)));

export interface Change { lines: string; score: number; top: string }

/** The stats that moved (biggest first, at most 3) and the score change. */
export function compare(before: Stats, after: Stats, target: string): Change {
  const pa = parts(before, target), pb = parts(after, target);
  const moved = STATS.map((k) => ({ k, d: after[k] - before[k], sc: pb[k] - pa[k], rel: Math.abs(after[k] - before[k]) / STAT_SCALE[k] }))
    .filter((m) => m.rel > 0.004).sort((a, b) => Math.abs(b.sc) - Math.abs(a.sc) || b.rel - a.rel).slice(0, 3);
  const score = Math.round(total(pb)) - Math.round(total(pa));
  const lines = moved.map((m) => `${NAME[m.k]} ${sign(m.d, UNIT[m.k](Math.abs(m.d)))}`).join(' · ');
  const big = moved.find((m) => Math.abs(m.sc) >= 0.5);
  const top = big ? `${NAME[big.k]} ${sign(big.d, UNIT[big.k](Math.abs(big.d)))} → ${sign(big.sc, Math.abs(big.sc).toFixed(0))} score` : 'no stat moves the score much';
  return { lines: lines || 'no stat changes', score, top };
}

export const changeLine = (c: Change) => `→ ${c.lines} · score ${c.score >= 0 ? '+' : '−'}${Math.abs(c.score)}`;


/** Cut: the branch's leaves, upkeep and water use go; the stats without it. */
export function whatIfCut(p: Plant, world: World, i: number, target: string): Change {
  const gone = new Set(subtree(p, i)), c = cutPreview(p, world, i), wf = p.flow.wilting ? T.wilt : 1;
  const flow = { ...p.flow, energyIn: p.flow.energyIn - (c.energy / 10) * wf, energyUp: p.flow.energyUp - c.upkeep / 10, waterUse: p.flow.waterUse - c.water / 10 };
  const after: Plant = { ...p, flow, nodes: p.nodes.map((n, k) => (gone.has(k) ? { ...n, dead: true } : n)) };
  return compare(stats(p, world), stats(after, world), target);
}

/** Wake: the ghost branch, once grown; its leaves in the sky's light, its upkeep, and what it costs to grow. */
export function whatIfWake(p: Plant, world: World, bud: number, target: string): Change & { cost: number } {
  const g = ghost(p, world, bud), base = p.nodes.length, th = gene(p.genes, 'thickness');
  const added = g.slice(1).map((n) => ({ ...n, thick: th, parent: n.parent === 0 ? bud : base + n.parent - 1 }));
  let eIn = 0, eUp = 0, wUse = 0;
  for (const n of added) {
    const l = light(world, n.x, n.y) * 0.85; // a little self-shade
    eIn += n.leaf * l * T.leafRate; wUse += n.leaf * l * T.leafThirst * world.habitat.thirst; eUp += upkeepOf(n);
  }
  const flow = { ...p.flow, energyIn: p.flow.energyIn + eIn, energyUp: p.flow.energyUp + eUp, waterUse: p.flow.waterUse + wUse };
  const after: Plant = { ...p, flow, nodes: [...p.nodes, ...added] };
  return { ...compare(stats(p, world), stats(after, world), target), cost: added.length * segCost(p, 'shoot', world) };
}

/** Dig: the root arrives; a pocket adds Roots and its income while it lasts. */
export function whatIfDig(p: Plant, world: World, x: number, y: number, target: string): Change & { income: string } {
  const c = cellIndex(x, y), cell = c >= 0 ? world.cells[c] : null;
  const root: Node = { ...p.nodes[2], x, y, parent: 2, state: 'seg', len: T.rootLen, dead: false, target: null };
  const after: Plant = { ...p, nodes: [...p.nodes, root] };
  const ch = compare(stats(p, world), stats(after, world), target);
  let income = 'loam: a little water';
  if (cell && cell.seen && isPocket(cell)) {
    const rate = (cell.kind === 'water' ? T.pocketWater : T.pocketNutrient) * 10;
    income = `${cell.kind} pocket: +${rate.toFixed(2)} ${cell.kind}/s for ~${Math.round(cell.amount / rate)} s`;
  } else if (cell?.kind === 'hard' && cell.seen) income = 'hard soil: half the loam water';
  return { ...ch, income };
}

/** A seed against the parent's genes on the parent's spot (both one season, no verbs): what moved, and the main reason. */
export const seedReason = (seed: Stats, base: Stats, target: string) => compare(base, seed, target);
