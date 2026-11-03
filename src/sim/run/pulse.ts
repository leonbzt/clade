// Pulses and offers. Before each pulse, 2–4 offers light up on the body, each a place and an organ; the genes decide
// which (Buds gives more offers, Dominance puts the main tip first). Each offer is previewed: the pulse grown with
// that pick, on what you've seen of the soil, and its stats measured. No DOM.
import { gene, geneIndex } from '../../data/genes';
import { CELL, COLS, GROUND, T } from '../../data/run';
import { seeded } from '../rng';
import { addBud, measure, tick, type Plant } from './plant';
import { isPocket, knownCopy, light, plotTick, type Plot } from './plot';
import { flushCost, flushTargets, leafFlush, rootPreview, rootToward, wake } from './verbs';

export type OfferKind = 'extend' | 'wake' | 'flush' | 'root' | 'creep' | 'cushion' | 'rhizoid';
export interface Offer {
  kind: OfferKind; node: number; x: number; y: number; tx?: number; ty?: number; // tx/ty: a root's target cell
  label: string; nutrient: number; energy: number; ok: boolean;
  after: number[] | null; // raw stats after the pulse with this pick
}

const LABEL: Record<OfferKind, string> = {
  extend: 'Extend this shoot', wake: 'Wake this bud', flush: 'Leaf flush here', root: 'Root toward the pocket',
  creep: 'Creep this edge', cushion: 'Stack a cushion here', rhizoid: 'Rhizoids here',
};
const MOSS_COST = { cushion: 1, rhizoid: 1 };

/** How many offers the genes give: 2, +1 at Buds 4, +1 at Buds 7. */
export const offerCount = (p: Plant) => {
  const b = p.genes[geneIndex('buds')];
  return 2 + (b >= 4 ? 1 : 0) + (b >= 7 ? 1 : 0);
};

const alive = (p: Plant) => p.nodes.map((n, i) => [n, i] as const).filter(([n, i]) => i > 0 && !n.dead);

/** The candidate offers, best first by a simple read of the body; then the count is taken. */
export function makeOffers(p: Plant, plot: Plot, pulseTicks: number, seed: number): Offer[] {
  const rng = seeded(seed), out: Offer[] = [], nodes = alive(p), dom = gene(p.genes, 'dominance');
  const add = (kind: OfferKind, node: number, extra: Partial<Offer> = {}) => {
    const n = p.nodes[node];
    if (out.some((o) => o.kind === kind && o.node === node)) return;
    out.push({ kind, node, x: n.x, y: n.y, label: LABEL[kind], nutrient: 0, energy: 0, ok: true, after: null, ...extra });
  };
  const lightAt = (i: number) => light(plot, p.nodes[i].x, p.nodes[i].y - 4) - p.nodes[i].order * 0.05;
  const best = (xs: number[]) => xs.sort((a, b) => lightAt(b) - lightAt(a));
  if (p.form === 'moss') {
    const creepers = nodes.filter(([n]) => n.kind === 'shoot' && n.state === 'tip' && n.creep).map(([, i]) => i);
    const left = creepers.sort((a, b) => p.nodes[a].x - p.nodes[b].x)[0], right = creepers[creepers.length - 1];
    if (left !== undefined) add('creep', left, { label: 'Creep the left edge' });
    if (right !== undefined && right !== left) add('creep', right, { label: 'Creep the right edge' });
    const segs = nodes.filter(([n]) => n.kind === 'shoot' && n.creep && n.len > 0).map(([, i]) => i);
    if (segs.length) {
      add('cushion', segs[Math.floor(rng() * segs.length)], { nutrient: MOSS_COST.cushion });
      const far = segs.sort((a, b) => rhizoidGap(p, b) - rhizoidGap(p, a))[0];
      add('rhizoid', far, { nutrient: MOSS_COST.rhizoid });
    }
  } else {
    const tips = nodes.filter(([n]) => n.kind === 'shoot' && n.state === 'tip').map(([, i]) => i);
    const main = tips.filter((i) => p.nodes[i].order === 0).sort((a, b) => p.nodes[a].y - p.nodes[b].y)[0];
    if (main !== undefined && dom >= 0.5) add('extend', main, { label: 'Extend the main tip' });
    const buds = best(nodes.filter(([n]) => n.kind === 'shoot' && n.state === 'bud').map(([, i]) => i));
    const pocket = bestPocket(p, plot);
    const cands: (() => void)[] = [];
    if (buds.length) cands.push(() => add('wake', buds[0], { nutrient: T.wakeCost }));
    if (pocket) cands.push(() => add('root', pocket.node, { tx: pocket.x, ty: pocket.y, nutrient: pocket.cost, x: pocket.x, y: pocket.y }));
    best(tips).slice(0, 2).forEach((i) => cands.push(() => add('extend', i)));
    if (buds.length > 1) cands.push(() => add('wake', buds[1 + Math.floor(rng() * Math.min(3, buds.length - 1))], { nutrient: T.wakeCost }));
    for (let k = cands.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); [cands[k], cands[j]] = [cands[j], cands[k]]; }
    for (const c of cands) c();
  }
  const leafy = best(nodes.filter(([n]) => n.kind === 'shoot' && n.len > 0).map(([, i]) => i));
  if (leafy.length && flushTargets(p, leafy[0]).length) add('flush', leafy[0], { energy: flushCost(p, leafy[0]) });
  const list = out.slice(0, offerCount(p));
  for (const o of list) {
    o.ok = p.nutrient >= o.nutrient && p.energy >= o.energy;
    o.after = o.ok ? preview(p, plot, o, pulseTicks, seed) : null;
  }
  return list;
}

function rhizoidGap(p: Plant, i: number): number {
  let d = Infinity;
  for (const n of p.nodes) if (!n.dead && n.kind === 'root') d = Math.min(d, Math.abs(n.x - p.nodes[i].x));
  return d;
}

/** The seen pocket with the most left in it that a root can reach and isn't heading to yet. */
function bestPocket(p: Plant, plot: Plot) {
  let best: { node: number; x: number; y: number; cost: number; v: number } | null = null;
  plot.cells.forEach((c, i) => {
    if (!c.seen || !isPocket(c) || c.amount < 3) return;
    const x = (i % COLS) * CELL + CELL / 2, y = GROUND + Math.floor(i / COLS) * CELL + CELL / 2;
    if (p.nodes.some((n) => n.target && Math.hypot(n.target.x - x, n.target.y - y) < 12)) return;
    if (p.nodes.some((n) => !n.dead && n.kind === 'root' && Math.hypot(n.x - x, n.y - y) < 10)) return;
    const r = rootPreview(p, plot, x, y);
    if (!r || r.blocked) return;
    const v = c.amount / (1 + r.cost);
    if (!best || v > best.v) best = { node: r.from, x, y, cost: r.cost, v };
  });
  return best as { node: number; x: number; y: number; cost: number; v: number } | null;
}

/** Apply a pick: pay, set the focus. Returns false if it can't be paid. */
export function applyOffer(p: Plant, plot: Plot, o: Offer): boolean {
  switch (o.kind) {
    case 'extend': case 'creep': p.focus = o.node; return true;
    case 'wake': if (!wake(p, o.node)) return false; p.focus = o.node; return true;
    case 'root': { const i = rootToward(p, plot, o.tx!, o.ty!); if (i < 0) return false; p.focus = i; return true; }
    case 'flush': p.focus = -1; return leafFlush(p, o.node);
    case 'cushion': {
      if (p.nutrient < MOSS_COST.cushion) return false;
      p.nutrient -= MOSS_COST.cushion;
      p.focus = addBud(p, o.node, -Math.PI / 2, 'shoot', 'tip', p.nodes[o.node].side, false);
      return true;
    }
    case 'rhizoid': {
      if (p.nutrient < MOSS_COST.rhizoid) return false;
      p.nutrient -= MOSS_COST.rhizoid;
      p.focus = addBud(p, o.node, Math.PI / 2, 'root', 'tip');
      return true;
    }
  }
}

/** Clone the plant onto what you've seen, apply the pick, grow one pulse, measure. */
function preview(p: Plant, plot: Plot, o: Offer, ticks: number, seed: number): number[] | null {
  const w = knownCopy(plot), q: Plant = { ...p, nodes: p.nodes.map((n) => ({ ...n, target: n.target && { ...n.target } })), rng: seeded(seed), flow: { ...p.flow } };
  if (!applyOffer(q, w, o)) return null;
  for (let t = 1; t <= ticks; t++) { plotTick(w, t, ticks * 10); tick(q, w, t); }
  return measure(q, w).raw;
}
