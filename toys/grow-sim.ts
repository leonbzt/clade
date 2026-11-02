// Grow toy (slice 00): the rules. No DOM. The plant is a node graph; every node hangs off its parent, so a
// child's index is always above its parent's. Nutrient is the only currency.

import { BASE_GENES, CELL, COLS, GENES, GROUND, H, LEVELS, ROWS, SPOTS, T, W, gene, type Genes } from './grow-data';

export type Kind = 'shoot' | 'root';
export type Pt = { x: number; y: number };
export interface Node {
  x: number; y: number; parent: number; kind: Kind; order: number; heading: number;
  tip: boolean; leaf: number; light: number; dead: boolean; target: Pt | null; cost: number;
}
export interface Cell { kind: 'plain' | 'pocket' | 'stone'; amount: number; max: number; seen: boolean; hint: number }
export interface Plot { cells: Cell[] }
export interface Flow { light: number; uptake: number; upkeep: number; income: number; limit: 'light' | 'roots' }
export interface Plant {
  genes: Genes; spot: number; x: number; nodes: Node[]; store: number; gathered: number; acc: number; flow: Flow;
  reserve: number; // auto-growth leaves this much for the verbs
}

const UP = -Math.PI / 2, DOWN = Math.PI / 2;
let rnd = Math.random;
const seeded = (a: number) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ---- the plot ----

export function makePlot(): Plot {
  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const stone = rnd() < T.stoneBase + T.stoneRight * (c / COLS) + 0.04 * (r / ROWS);
      cells.push({ kind: stone ? 'stone' : 'plain', amount: T.plainAmount, max: T.plainAmount, seen: false, hint: 0 });
    }
  }
  for (let p = 0; p < T.pockets; p++) {
    const c = Math.floor(COLS * rnd() ** 1.5), r = 1 + Math.floor((ROWS - 1) * rnd());
    const amt = T.pocketAmount[0] + (T.pocketAmount[1] - T.pocketAmount[0]) * rnd() + r * 4;
    cells[r * COLS + c] = { kind: 'pocket', amount: amt, max: amt, seen: false, hint: 0 };
  }
  for (const x of SPOTS) {
    const c = Math.floor(x / CELL);
    for (const r of [0, 1]) if (cells[r * COLS + c].kind === 'stone') cells[r * COLS + c].kind = 'plain';
  }
  for (let i = 0; i < cells.length; i++) {
    const c = i % COLS, r = Math.floor(i / COLS);
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if ((dr || dc) && rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && cells[rr * COLS + cc].kind === 'pocket') n++;
    }
    cells[i].hint = n;
  }
  return { cells };
}

export const cellAt = (x: number, y: number) => {
  const c = Math.floor(x / CELL), r = Math.floor((y - GROUND) / CELL);
  return c < 0 || c >= COLS || r < 0 || r >= ROWS ? -1 : r * COLS + c;
};

export function reveal(plot: Plot, x: number, y: number) {
  const c = Math.floor(x / CELL), r = Math.floor((y - GROUND) / CELL);
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) plot.cells[rr * COLS + cc].seen = true;
  }
}

export const skyLight = (x: number) =>
  T.shade + (1 - T.shade) * Math.max(0, Math.min(1, (x - T.shadeFrom) / (T.shadeTo - T.shadeFrom)));

// ---- the plant ----

function node(p: Partial<Node> & Pick<Node, 'x' | 'y' | 'parent' | 'kind'>): Node {
  return { order: 0, heading: p.kind === 'shoot' ? UP : DOWN, tip: true, leaf: 0, light: 1, dead: false, target: null, cost: 0, ...p };
}

export function newPlant(genes: Genes, spot: number, store: number, plot: Plot | null): Plant {
  const x = SPOTS[spot];
  const nodes = [
    node({ x, y: GROUND, parent: -1, kind: 'shoot', tip: false }),
    node({ x, y: GROUND - 6, parent: 0, kind: 'shoot', leaf: 2 }),
    node({ x, y: GROUND + 6, parent: 0, kind: 'root' }),
  ];
  if (plot) { reveal(plot, x, GROUND + 6); reveal(plot, x, GROUND + 6 + CELL); }
  return { genes, spot, x, nodes, store, gathered: 0, acc: 0, reserve: 0, flow: { light: 0, uptake: 0, upkeep: 0, income: 0, limit: 'light' } };
}

export const segCost = (p: Plant, kind: Kind) =>
  kind === 'shoot'
    ? (T.shootCost * gene(p.genes, 'internode')) / 8 + T.leafCost * gene(p.genes, 'leaf')
    : T.rootCost * (0.5 + 0.5 * gene(p.genes, 'hairs'));

const turn = (a: number, to: number, k: number) => {
  const d = Math.atan2(Math.sin(to - a), Math.cos(to - a));
  return a + d * k;
};

function pickTip(p: Plant, kind: Kind): number {
  let best = -1, total = 0;
  const up = gene(p.genes, 'upright');
  for (let i = 0; i < p.nodes.length; i++) {
    const n = p.nodes[i];
    if (n.dead || !n.tip || n.kind !== kind) continue;
    if (kind === 'root' && n.target) return i; // sent roots go first
    const w = n.order === 0 ? 1 + 2 * (kind === 'shoot' ? up : 0.5) : 1 / (1 + n.order * 0.3);
    total += w;
    if (rnd() * total < w) best = i;
  }
  return best;
}

function addBud(p: Plant, at: number, heading: number): number {
  const n = p.nodes[at];
  p.nodes.push(node({ x: n.x, y: n.y, parent: at, kind: n.kind, order: n.order + 1, heading }));
  return p.nodes.length - 1;
}

function extendShoot(p: Plant, i: number): boolean {
  const t = p.nodes[i], len = gene(p.genes, 'internode');
  for (let tries = 0; tries < 3; tries++) {
    let h = t.heading + (rnd() - 0.5) * 0.5;
    h = turn(h, UP, gene(p.genes, 'upright') * 0.35 + tries * 0.3);
    const x = t.x + Math.cos(h) * len, y = t.y + Math.sin(h) * len;
    if (y > GROUND - 3 || y < 6 || x < 4 || x > W - 4) continue;
    t.tip = false;
    p.nodes.push(node({ x, y, parent: i, kind: 'shoot', order: t.order, heading: h, leaf: gene(p.genes, 'leaf'), cost: segCost(p, 'shoot') }));
    const k = p.nodes.length - 1;
    if (rnd() < gene(p.genes, 'branching')) {
      const side = k % 2 ? 1 : -1;
      addBud(p, k, h + (side * gene(p.genes, 'angle') * Math.PI) / 180);
    }
    return true;
  }
  t.tip = false;
  return false;
}

function extendRoot(p: Plant, plot: Plot | null, i: number): boolean {
  const t = p.nodes[i], len = T.rootLen;
  let h: number;
  if (t.target) {
    h = Math.atan2(t.target.y - t.y, t.target.x - t.x) + (rnd() - 0.5) * 0.3;
  } else {
    const dive = gene(p.genes, 'dive');
    h = t.heading + (rnd() - 0.5) * 0.6;
    h = turn(h, DOWN, dive * 0.3);
    h = turn(h, Math.cos(h) >= 0 ? 0 : Math.PI, (1 - dive) * 0.2);
  }
  for (const dh of [0, 0.9, -0.9, 1.6, -1.6]) {
    const a = h + dh, x = t.x + Math.cos(a) * len, y = t.y + Math.sin(a) * len;
    if (y < GROUND + 3 || y > H - 3 || x < 3 || x > W - 3) continue;
    const c = cellAt(x, y);
    if (plot && c >= 0 && plot.cells[c].kind === 'stone') { plot.cells[c].seen = true; continue; }
    t.tip = false;
    const target = t.target && Math.hypot(t.target.x - x, t.target.y - y) > len ? t.target : null;
    t.target = null;
    p.nodes.push(node({ x, y, parent: i, kind: 'root', order: t.order, heading: a, target, cost: segCost(p, 'root') }));
    if (plot) reveal(plot, x, y);
    if (!target && rnd() < gene(p.genes, 'rootBranch')) addBud(p, p.nodes.length - 1, a + (rnd() < 0.5 ? 0.9 : -0.9));
    return true;
  }
  t.tip = false;
  t.target = null;
  return false;
}

/** One growth step. Free = a preview in open ground: no costs, no stone. */
function growOnce(p: Plant, plot: Plot | null, free: boolean): boolean {
  if (p.nodes.length >= T.maxNodes) return false;
  const sent = p.nodes.some((n) => !n.dead && n.tip && n.target);
  let kind: Kind = rnd() < (sent ? Math.max(0.6, gene(p.genes, 'rootShare')) : gene(p.genes, 'rootShare')) ? 'root' : 'shoot';
  let i = pickTip(p, kind);
  if (i < 0) { kind = kind === 'root' ? 'shoot' : 'root'; i = pickTip(p, kind); }
  if (i < 0) return false;
  const cost = segCost(p, kind);
  if (!free && p.store - cost < p.reserve) return false;
  const ok = kind === 'shoot' ? extendShoot(p, i) : extendRoot(p, plot, i);
  if (ok && !free) p.store -= cost;
  return true;
}

function shadeLeaves(p: Plant) {
  const leaves = p.nodes.filter((n) => !n.dead && n.kind === 'shoot' && n.leaf > 0);
  for (const a of leaves) {
    let above = 0;
    for (const b of leaves) if (b !== a && b.y < a.y - 2 && Math.abs(b.x - a.x) < 3 + b.leaf * 2) above++;
    a.light = skyLight(a.x) * T.selfShade ** above;
  }
}

/** One tick: shade, draw nutrient from the soil (capped by what the leaves power), pay upkeep, grow. */
export function tick(p: Plant, plot: Plot, t: number) {
  if (t % 5 === 0) shadeLeaves(p);
  let light = T.trickle, upkeep = 0;
  const perCell = new Map<number, number>();
  for (const n of p.nodes) {
    if (n.dead) continue;
    if (n.kind === 'shoot') {
      light += n.leaf * n.light * T.leafRate;
      upkeep += T.upkeep + n.leaf * T.leafUpkeep;
    } else {
      upkeep += T.upkeep;
      const c = cellAt(n.x, n.y);
      if (c >= 0) perCell.set(c, (perCell.get(c) ?? 0) + 1);
    }
  }
  const hairs = gene(p.genes, 'hairs');
  const pots: [Cell, number][] = [];
  let uptake = 0;
  for (const [c, k] of perCell) {
    const cell = plot.cells[c];
    if (cell.kind === 'stone' || cell.amount <= 0) continue;
    const pot = Math.min(cell.amount, (cell.kind === 'pocket' ? T.pocketRate : T.plainRate) * Math.min(k, T.rootCap) * hairs);
    pots.push([cell, pot]);
    uptake += pot;
  }
  const income = Math.min(light, uptake + T.trickle);
  const f = uptake > 0 ? Math.min(1, Math.max(0, income - T.trickle) / uptake) : 0;
  for (const [cell, pot] of pots) cell.amount -= pot * f;
  p.flow = { light, uptake: uptake + T.trickle, upkeep, income, limit: light < uptake + T.trickle ? 'light' : 'roots' };
  p.store = Math.max(0, p.store + income - upkeep);
  p.gathered += income;
  p.acc = Math.min(p.acc + gene(p.genes, 'vigor'), 4);
  while (p.acc >= 1) {
    p.acc -= 1;
    if (!growOnce(p, plot, false)) { p.acc = 0; break; }
  }
}

// ---- verbs ----

export const BUD_COST = T.budCost;

export function nearestNode(p: Plant, x: number, y: number, kind: Kind, r = 9): number {
  let best = -1, bd = r * r;
  for (let i = 1; i < p.nodes.length; i++) {
    const n = p.nodes[i];
    if (n.dead || n.kind !== kind) continue;
    const d = (n.x - x) ** 2 + (n.y - y) ** 2;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

export function bud(p: Plant, i: number, towardX: number): boolean {
  if (p.store < T.budCost) return false;
  p.store -= T.budCost;
  const side = towardX >= p.nodes[i].x ? 1 : -1;
  addBud(p, i, UP + side * 0.9);
  return true;
}

export function subtree(p: Plant, i: number): number[] {
  const inside = new Set([i]);
  for (let k = i + 1; k < p.nodes.length; k++) if (inside.has(p.nodes[k].parent)) inside.add(k);
  return [...inside].filter((k) => !p.nodes[k].dead);
}

export function prunePreview(p: Plant, i: number) {
  const cut = subtree(p, i).map((k) => p.nodes[k]);
  const refund = cut.reduce((s, n) => s + n.cost, 0) * T.pruneRefund;
  const upkeep = cut.reduce((s, n) => s + T.upkeep + n.leaf * T.leafUpkeep, 0);
  return { parts: cut.length, refund, upkeep };
}

/** Cut the branch at node i; a bud wakes on the node below. */
export function prune(p: Plant, i: number) {
  const { refund } = prunePreview(p, i);
  for (const k of subtree(p, i)) { p.nodes[k].dead = true; p.nodes[k].tip = false; }
  p.store += refund;
  const below = p.nodes[i].parent;
  if (below >= 0) addBud(p, below, UP + (rnd() < 0.5 ? 0.8 : -0.8));
}

export function rootPreview(p: Plant, x: number, y: number) {
  let from = -1, bd = Infinity;
  for (let i = 0; i < p.nodes.length; i++) {
    const n = p.nodes[i];
    if (n.dead || n.kind !== 'root') continue;
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < bd) { bd = d; from = i; }
  }
  const n = p.nodes[from], fresh = !(n.tip && !n.target);
  const steps = Math.ceil(bd / T.rootLen);
  return { from, steps, cost: steps * segCost(p, 'root') + (fresh ? T.budCost : 0), fresh };
}

export function sendRoot(p: Plant, x: number, y: number): boolean {
  const pr = rootPreview(p, x, y);
  if (pr.from < 0 || (pr.fresh && p.store < T.budCost)) return false;
  let i = pr.from;
  if (pr.fresh) { p.store -= T.budCost; i = addBud(p, pr.from, Math.atan2(y - p.nodes[i].y, x - p.nodes[i].x)); }
  p.nodes[i].target = { x, y };
  return true;
}

// ---- stats, broods ----

export function stats(p: Plant) {
  let top = GROUND, lo = W, hi = 0, deep = GROUND, leaves = 0;
  for (const n of p.nodes) {
    if (n.dead) continue;
    if (n.kind === 'shoot') { top = Math.min(top, n.y); lo = Math.min(lo, n.x); hi = Math.max(hi, n.x); if (n.leaf) leaves++; }
    else deep = Math.max(deep, n.y);
  }
  return { reach: GROUND - top, spread: Math.max(0, hi - lo), depth: deep - GROUND, leaves };
}

export function mutate(g: Genes): { genes: Genes; changed: number[] } {
  const genes = [...g], changed: number[] = [];
  const k = 1 + Math.floor(rnd() * 3);
  while (changed.length < k) {
    const i = Math.floor(rnd() * GENES.length);
    if (changed.includes(i)) continue;
    const step = (rnd() < 0.5 ? -1 : 1) * (rnd() < 0.35 ? 2 : 1);
    const v = Math.max(0, Math.min(LEVELS, genes[i] + step));
    if (v === genes[i]) continue;
    genes[i] = v;
    changed.push(i);
  }
  return { genes, changed };
}

/** The body a genome grows in open ground, for the brood cards. One fixed random stream, so bodies differ by genes. */
export function preview(genes: Genes): Plant {
  const keep = rnd;
  rnd = seeded(7);
  const p = newPlant(genes, 2, 0, null);
  const steps = Math.round(T.previewSteps * (0.7 + 0.3 * gene(genes, 'vigor')));
  for (let s = 0; s < steps; s++) if (!growOnce(p, null, true)) break;
  rnd = keep;
  return p;
}

export interface Seed { genes: Genes; changed: number[]; spot: number; body: Plant }

export function brood(parent: Plant): Seed[] {
  const spots = [0, 1, 2, 3, 4].sort(() => rnd() - 0.5).slice(0, 3).sort((a, b) => a - b);
  return spots.map((spot) => {
    const { genes, changed } = mutate(parent.genes);
    return { genes, changed, spot, body: preview(genes) };
  });
}

export const firstPlant = (plot: Plot) => newPlant([...BASE_GENES], 2, T.startStore, plot);
