// Grow toy (slices 00, 00b): the plant. A tree of nodes; a child's index is always above its parent's. Three stocks:
// energy (leaves), water (roots in water pockets and loam), nutrient (roots in nutrient pockets, pays the verbs).
// Each tick the net energy is shared among the active tips, so fewer tips grow faster. No DOM.

import { GROUND, H, SPOTS, STAT_SCALE, T, TARGETS, W, gene, type FormId, type Genes, type StatId } from './grow-data';
import { cellIndex, isPocket, light, reveal, type Pt, type Rng, type World } from './grow-world';

export type Kind = 'shoot' | 'root';
export type State = 'tip' | 'bud' | 'seg';
export interface Node {
  x: number; y: number; parent: number; kind: Kind; state: State; heading: number; len: number;
  leaf: number; light: number; thick: number; progress: number; target: Pt | null; dead: boolean;
  order: number; // 0 = the main stem or root, +1 per branching
  side: number; // ±1: the side of this stem's next bud (alternates along the stem)
  wood: number; // tree: thickness added by past winters
  born: number; // the season this segment grew in
}
export interface Flow { energyIn: number; energyUp: number; waterIn: number; waterUse: number; nutrientIn: number; wilting: boolean }
export interface Plant {
  genes: Genes; spot: number; x: number; nodes: Node[]; rng: Rng; form: FormId; season: number;
  energy: number; water: number; nutrient: number; flow: Flow;
  canGrow: ((p: Plant, tip: number) => boolean) | null; // the form's limit on a tip extending (tree: wood carries height)
}

export const UP = -Math.PI / 2, DOWN = Math.PI / 2;
/** Energy per tick to keep a segment alive. */
export const upkeepOf = (n: Node) => (T.upkeep * (n.thick - n.wood * (1 - T.tree.woodUpkeep)) * Math.max(n.len, 4)) / 8;
const turn = (a: number, to: number, k: number) => a + Math.atan2(Math.sin(to - a), Math.cos(to - a)) * k;

function mk(p: Partial<Node> & Pick<Node, 'x' | 'y' | 'parent' | 'kind'>): Node {
  return { state: 'tip', heading: p.kind === 'shoot' ? UP : DOWN, len: 0, leaf: 0, light: 1, thick: 1, progress: 0, target: null, dead: false, order: 0, side: 1, wood: 0, born: 1, ...p };
}

export function newPlant(genes: Genes, spot: number, world: World | null, rng: Rng, form: FormId = 'herb'): Plant {
  const x = SPOTS[spot];
  const nodes = [
    mk({ x, y: GROUND, parent: -1, kind: 'shoot', state: 'seg' }),
    mk({ x, y: GROUND - 4, parent: 0, kind: 'shoot', len: 4, leaf: 2, side: rng() < 0.5 ? 1 : -1 }),
    mk({ x, y: GROUND + 4, parent: 0, kind: 'root', len: 4 }),
  ];
  if (world) reveal(world, x, GROUND + 4);
  return {
    genes, spot, x, nodes, rng, form, season: 1, canGrow: null, ...T.start,
    flow: { energyIn: 0, energyUp: 0, waterIn: 0, waterUse: 0, nutrientIn: 0, wilting: false },
  };
}

// ---- costs ----

const hardMult = (p: Plant) => 1 + (T.hardCost - 1) / gene(p.genes, 'thickness');
export function segCost(p: Plant, kind: Kind, world: World | null, at?: Node): number {
  const th = gene(p.genes, 'thickness');
  if (kind === 'shoot') return (T.shootCost * gene(p.genes, 'internode') * th) / 8 + T.leafCost * gene(p.genes, 'leaf');
  const c = at && world ? cellIndex(at.x, at.y) : -1;
  return ((T.rootCost * T.rootLen * th) / 8) * (c >= 0 && world!.cells[c].kind === 'hard' ? hardMult(p) : 1);
}

// ---- growth ----

export function addBud(p: Plant, at: number, heading: number, kind: Kind = 'shoot', state: State = 'bud', side = 1): number {
  const n = p.nodes[at];
  p.nodes.push(mk({ x: n.x, y: n.y, parent: at, kind, state, heading, order: n.order + 1, side, born: p.season }));
  return p.nodes.length - 1;
}

/** Extend a shoot tip by one segment (geometry only; the caller pays). The new tip, or -1 if it can't grow on. */
export function extendShoot(p: Plant, world: World | null, i: number): number {
  const t = p.nodes[i], len = gene(p.genes, 'internode'), rng = p.rng;
  for (let tries = 0; tries < 3; tries++) {
    let h = turn(t.heading + (rng() - 0.5) * 0.5, UP, (t.order ? 0.06 : 0.18) + tries * 0.3); // side shoots keep their angle
    if (world) { // lean toward the brighter side, only when it's clearly brighter
      const l = light(world, t.x - 12, t.y), r = light(world, t.x + 12, t.y);
      if (Math.abs(l - r) > T.leanMin) h = turn(h, l > r ? Math.PI : 0, T.lean);
    }
    const x = t.x + Math.cos(h) * len, y = t.y + Math.sin(h) * len;
    if (y > GROUND - 3 || y < 4 || x < 4 || x > W - 4) continue;
    t.state = 'seg';
    p.nodes.push(mk({ x, y, parent: i, kind: 'shoot', heading: h, len, leaf: gene(p.genes, 'leaf'), order: t.order, born: p.season }));
    const k = p.nodes.length - 1, ang = (gene(p.genes, 'angle') * Math.PI) / 180;
    const buds = Math.floor(gene(p.genes, 'buds') + rng());
    let side = t.side; // buds alternate sides along their own stem
    for (let b = 0; b < buds; b++) { addBud(p, k, h + side * ang, 'shoot', 'bud', side); side = -side; }
    p.nodes[k].side = side;
    return k;
  }
  t.state = 'seg';
  return -1;
}

function extendRoot(p: Plant, world: World | null, i: number): number {
  const t = p.nodes[i], rng = p.rng, len = T.rootLen;
  let h: number;
  if (t.target) h = Math.atan2(t.target.y - t.y, t.target.x - t.x) + (rng() - 0.5) * 0.3;
  else {
    const dive = gene(p.genes, 'dive');
    h = turn(t.heading + (rng() - 0.5) * 0.6, DOWN, dive * 0.25);
    h = turn(h, Math.cos(h) >= 0 ? 0.25 : Math.PI - 0.25, (1 - dive) * 0.2);
  }
  for (const dh of [0, 0.8, -0.8, 1.5, -1.5]) {
    const a = h + dh, x = t.x + Math.cos(a) * len, y = t.y + Math.sin(a) * len;
    if (y < GROUND + 3 || y > H - 3 || x < 3 || x > W - 3) continue;
    const c = cellIndex(x, y);
    if (world && c >= 0 && world.cells[c].kind === 'stone') { world.cells[c].seen = true; continue; }
    const target = t.target && Math.hypot(t.target.x - x, t.target.y - y) > len ? t.target : null;
    t.state = 'seg'; t.target = null;
    p.nodes.push(mk({ x, y, parent: i, kind: 'root', heading: a, len, target, order: t.order, born: p.season }));
    const k = p.nodes.length - 1;
    if (world) reveal(world, x, y);
    if (!target && rng() < T.rootBranch + 0.12 * gene(p.genes, 'buds')) addBud(p, k, a + (rng() < 0.5 ? 0.9 : -0.9), 'root', 'tip');
    return k;
  }
  t.state = 'seg'; t.target = null;
  return -1;
}

export const extend = (p: Plant, world: World | null, i: number) =>
  p.nodes[i].kind === 'shoot' ? extendShoot(p, world, i) : extendRoot(p, world, i);

/** Wake the dormant buds on the few nodes below node i (apical dominance released). */
export function wakeBelow(p: Plant, i: number) {
  let n = p.nodes[i].parent;
  for (let k = 0; k < 3 && n >= 0; k++, n = p.nodes[n].parent) {
    for (const b of p.nodes) if (b.parent === n && b.state === 'bud' && !b.dead) b.state = 'tip';
  }
}

/** Share the growth energy among the active tips; tips that reach a segment's cost extend. */
function grow(p: Plant, world: World | null) {
  if (p.nodes.length >= T.maxNodes) return;
  const tips = { shoot: [] as number[], root: [] as number[] };
  p.nodes.forEach((n, i) => { if (!n.dead && n.state === 'tip') tips[n.kind].push(i); });
  const spend = Math.max(0, p.energy) * 0.5;
  let share = gene(p.genes, 'rootShare');
  if (!tips.root.length) share = 0;
  if (!tips.shoot.length) share = tips.root.length ? 1 : 0;
  if (!tips.shoot.length && !tips.root.length) return;
  p.energy -= spend;
  for (const kind of ['shoot', 'root'] as Kind[]) {
    const list = tips[kind], pool = spend * (kind === 'root' ? share : 1 - share);
    const weight = (i: number) => (p.nodes[i].target ? 3 : 1);
    const total = list.reduce((s, i) => s + weight(i), 0);
    for (const i of list) {
      const n = p.nodes[i], cost = segCost(p, kind, world, n);
      const add = Math.min((pool * weight(i)) / total, T.progressCap * cost - n.progress);
      n.progress += Math.max(0, add);
      p.energy += (pool * weight(i)) / total - Math.max(0, add);
      const water = kind === 'shoot' ? T.segWater : 0;
      if (n.progress >= cost && p.water >= water && (!p.canGrow || p.canGrow(p, i))) {
        p.water -= water;
        const carry = n.progress - cost, k = extend(p, world, i);
        n.progress = 0;
        if (k >= 0) p.nodes[k].progress = carry;
        else if (kind === 'shoot') wakeBelow(p, i);
      }
    }
  }
}

// ---- the tick ----

function shade(p: Plant, world: World | null) {
  const leaves = p.nodes.filter((n) => !n.dead && n.kind === 'shoot' && n.leaf > 0);
  for (const a of leaves) {
    let above = 0;
    for (const b of leaves) if (b !== a && b.y < a.y - 2 && Math.abs(b.x - a.x) < 2 + b.leaf * 1.5) above++;
    a.light = (world ? light(world, a.x, a.y) : 1) * T.selfShade ** above;
  }
}

/** Pipe model: stems thicken with the leaves they carry; a tree adds its wood. */
export function thicken(p: Plant) {
  const carried = new Float32Array(p.nodes.length), th = gene(p.genes, 'thickness');
  for (let i = p.nodes.length - 1; i > 0; i--) {
    const n = p.nodes[i];
    if (n.dead) continue;
    carried[i] += n.leaf > 0 || n.kind === 'root' ? 1 : 0;
    n.thick = th * (1 + (n.kind === 'shoot' ? 0.18 : 0.1) * Math.sqrt(carried[i])) + n.wood;
    if (n.parent >= 0) carried[n.parent] += carried[i];
  }
}

export function tick(p: Plant, world: World, t: number) {
  if (t % 5 === 0) shade(p, world);
  if (t % 10 === 0) thicken(p);
  const thirst = world.habitat.thirst;
  let eIn = 0, eUp = 0, wUse = 0;
  const perCell = new Map<number, number>();
  for (const n of p.nodes) {
    if (n.dead || n.state === 'bud') continue;
    eUp += upkeepOf(n);
    if (n.kind === 'shoot' && n.leaf > 0) {
      eIn += n.leaf * n.light * T.leafRate;
      wUse += n.leaf * n.light * T.leafThirst * thirst;
    } else if (n.kind === 'root') {
      const c = cellIndex(n.x, n.y);
      if (c >= 0) perCell.set(c, (perCell.get(c) ?? 0) + 1);
    }
  }
  let wIn = 0, nIn = 0;
  for (const [c, k] of perCell) {
    const cell = world.cells[c], m = Math.min(k, T.rootCap);
    if (cell.kind === 'water' || cell.kind === 'nutrient') {
      const got = Math.min(cell.amount, m * (cell.kind === 'water' ? T.pocketWater : T.pocketNutrient));
      cell.amount -= got;
      if (cell.kind === 'water') wIn += got; else nIn += got;
    } else if (cell.kind !== 'stone') {
      wIn += m * T.loamWater * world.habitat.moisture * (cell.kind === 'hard' ? 0.5 : 1);
    }
  }
  const wilting = p.water <= 0.05;
  const eGot = eIn * (wilting ? T.wilt : 1);
  p.energy = Math.max(0, p.energy + eGot - eUp);
  p.water = Math.max(0, p.water + wIn - wUse * (wilting ? T.wilt : 1));
  p.nutrient += nIn;
  p.flow = { energyIn: eGot, energyUp: eUp, waterIn: wIn, waterUse: wUse, nutrientIn: nIn, wilting };
  const dom = gene(p.genes, 'dominance');
  for (const n of p.nodes) if (n.state === 'bud' && !n.dead && p.rng() < T.wakeChance * (1 - dom) ** 2) n.state = 'tip';
  grow(p, world);
}

// ---- stats and the score ----

export type Stats = Record<StatId, number> & { biomass: number; leaves: number; depth: number };
export function stats(p: Plant, world: World | null): Stats {
  let top = GROUND, lo = W, hi = 0, deep = GROUND, leaves = 0, th = 0, segs = 0, bio = 0;
  const tapped = new Set<number>();
  for (const n of p.nodes) {
    if (n.dead || n.state === 'bud') continue;
    bio += n.len * n.thick * n.thick * 0.02 + n.leaf * 0.05;
    if (n.kind === 'shoot') {
      top = Math.min(top, n.y); lo = Math.min(lo, n.x); hi = Math.max(hi, n.x);
      if (n.leaf) leaves++;
      if (n.len) { th += n.thick; segs++; }
    } else {
      deep = Math.max(deep, n.y);
      const c = cellIndex(n.x, n.y);
      if (world && c >= 0 && isPocket(world.cells[c])) tapped.add(c);
    }
  }
  const f = p.flow;
  return {
    reach: GROUND - top, spread: Math.max(0, hi - lo), roots: tapped.size, toughness: segs ? th / segs : 0,
    growth: (f.energyIn - f.energyUp) * 10, upkeep: (f.energyUp + f.waterUse) * 10,
    biomass: bio, leaves, depth: deep - GROUND,
  };
}

export function score(s: Stats, targetId: string): number {
  const w = TARGETS.find((t) => t.id === targetId)!.w;
  let v = 0;
  for (const [k, wt] of Object.entries(w) as [StatId, number][]) v += wt * Math.min(1, Math.max(0, s[k]) / STAT_SCALE[k]);
  return Math.max(0, Math.min(100, Math.round(v * 100)));
}
