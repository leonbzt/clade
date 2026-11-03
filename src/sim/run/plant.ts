// The plant in side view: a tree of nodes (a child's index is always above its parent's). Three stocks: energy
// (leaves), water (roots, or the surface for moss), nutrient (pockets; pays the offers). Each tick the net energy is
// shared among the active tips; the pulse's pick (the focus) gets most of it. From the toy's grow-sim. No DOM.
import { FORMS, FOUNDER_LEVEL, RULES, attr, level, shape, type FormId, type Genes } from '../../data/genes';
import { NICHES, NICHE_AT, PRESSURE } from '../../data/niches';
import { armoured } from '../species';
import { GROUND, H, PULSE, SPOTS, T, W } from '../../data/run';
import type { Rng } from '../rng';
import { cellIndex, isPocket, light, reveal, type Plot, type Pt } from './plot';

export type Kind = 'shoot' | 'root';
export type NodeState = 'tip' | 'bud' | 'seg';
export interface Node {
  x: number; y: number; parent: number; kind: Kind; state: NodeState; heading: number; len: number;
  leaf: number; light: number; thick: number; progress: number; target: Pt | null; dead: boolean;
  order: number; side: number; wood: number; born: number;
  creep: boolean; // moss: a creeping shoot (runs along the ground); else a cushion stack
}
export interface Flow { energyIn: number; energyUp: number; waterIn: number; waterUse: number; nutrientIn: number; wilting: boolean; harmed: number }
export interface Plant {
  genes: Genes; spot: number; x: number; nodes: Node[]; rng: Rng; form: FormId; season: number;
  energy: number; water: number; nutrient: number; flow: Flow; focus: number;
  harm: number; // the share of energy income the patch's pressure takes (0 when armoured)
  reserve: number; // Health: energy that takes the pressure's damage first; refilled each pulse
  acc: { net: number; cost: number; n: number }; // this season's energy flows, for the Growth and Upkeep stats
}

export const UP = -Math.PI / 2, DOWN = Math.PI / 2;
export const upkeepOf = (n: Node) => (T.upkeep * (n.thick - n.wood * (1 - T.tree.woodUpkeep)) * Math.max(n.len, 4)) / 8;
const turn = (a: number, to: number, k: number) => a + Math.atan2(Math.sin(to - a), Math.cos(to - a)) * k;

function mk(p: Partial<Node> & Pick<Node, 'x' | 'y' | 'parent' | 'kind'>): Node {
  return {
    state: 'tip', heading: p.kind === 'shoot' ? UP : DOWN, len: 0, leaf: 0, light: 1, thick: 1, progress: 0, target: null, dead: false,
    order: 0, side: 1, wood: 0, born: 1, creep: false, ...p,
  };
}

export function newPlant(genes: Genes, spot: number, plot: Plot | null, rng: Rng, form: FormId): Plant {
  const x = SPOTS[spot], leaf = shape(genes, 'leaf');
  const nodes = [mk({ x, y: GROUND, parent: -1, kind: 'shoot', state: 'seg' })];
  if (form === 'moss') {
    nodes.push(mk({ x: x - 2, y: GROUND - 2, parent: 0, kind: 'shoot', len: 2, leaf: leaf * 0.6, heading: Math.PI, creep: true, side: -1 }));
    nodes.push(mk({ x: x + 2, y: GROUND - 2, parent: 0, kind: 'shoot', len: 2, leaf: leaf * 0.6, heading: 0, creep: true, side: 1 }));
    nodes.push(mk({ x, y: GROUND + 2, parent: 0, kind: 'root', len: 2 }));
  } else {
    nodes.push(mk({ x, y: GROUND - 4, parent: 0, kind: 'shoot', len: 4, leaf: 2, side: rng() < 0.5 ? 1 : -1 }));
    nodes.push(mk({ x, y: GROUND + 4, parent: 0, kind: 'root', len: 4 }));
  }
  if (plot) reveal(plot, x, GROUND + 4, revealOf(genes));
  const niche = plot ? NICHE_AT[plot.kind][FORMS[form].layer] : -1;
  return {
    genes, spot, x, nodes, rng, form, season: 1, ...T.start, focus: -1, acc: { net: 0, cost: 0, n: 0 },
    harm: niche >= 0 ? PRESSURE.runShare * (1 - armoured(genes, NICHES[niche])) : 0, reserve: reserveOf(genes),
    flow: { energyIn: 0, energyUp: 0, waterIn: 0, waterUse: 0, nutrientIn: 0, wilting: false, harmed: 0 },
  };
}

// ---- what the attributes do in the run (beyond the look) ----
/** Cells of soil revealed around a root: 2, +1 at each of Roots' thresholds. */
export const revealOf = (g: Genes) => T.reveal + RULES.roots.revealAt.filter((k) => attr(g, 'roots') >= k).length;
export const reserveOf = (g: Genes) => attr(g, 'health') * RULES.health.reserve;
/** Upkeep: Pace's cost, and each pip above the founder's level. */
export const upkeepMult = (g: Genes) => (1 + RULES.pace.upkeep * attr(g, 'pace')) * (1 + RULES.upkeep.run * Math.max(0, level(g) - FOUNDER_LEVEL));

// ---- costs ----
const hardMult = (p: Plant) => 1 + (T.hardCost - 1) / shape(p.genes, 'thickness');
const segLen = (p: Plant) => shape(p.genes, 'internode') * (p.form === 'moss' ? T.moss.internode : 1);
export function segCost(p: Plant, kind: Kind, plot: Plot | null, at?: Node): number {
  const th = shape(p.genes, 'thickness'), moss = p.form === 'moss' ? 0.8 : 1;
  if (kind === 'shoot') return ((T.shootCost * segLen(p) * th) / 8 + T.leafCost * shape(p.genes, 'leaf')) * moss;
  const c = at && plot ? cellIndex(at.x, at.y) : -1;
  const len = p.form === 'moss' ? T.moss.rhizoidLen : T.rootLen;
  return ((T.rootCost * len * th) / 8) * (c >= 0 && plot!.cells[c].kind === 'hard' ? hardMult(p) : 1);
}

// ---- growth ----
export function addBud(p: Plant, at: number, heading: number, kind: Kind = 'shoot', state: NodeState = 'bud', side = 1, creep = false): number {
  const n = p.nodes[at];
  p.nodes.push(mk({ x: n.x, y: n.y, parent: at, kind, state, heading, order: n.order + 1, side, born: p.season, creep }));
  return p.nodes.length - 1;
}

/** The moss's cushion height cap. */
export const cushionCap = (p: Plant) => T.moss.cushion + T.moss.cushionPerThick * shape(p.genes, 'thickness');
/** Tree: a tip may grow one more segment only if every stem below it can carry the length above (thickness caps height). */
export function carries(p: Plant, tip: number): boolean {
  if (p.nodes[tip].kind !== 'shoot') return true;
  let above = shape(p.genes, 'internode');
  for (let i = tip; p.nodes[i].parent >= 0; i = p.nodes[i].parent) {
    const n = p.nodes[i];
    if (n.len && above > T.tree.carry * n.thick) return false;
    above += n.len;
  }
  return true;
}

/** Extend a shoot tip by one segment (geometry only; the caller pays). The new tip, or -1 if it can't grow on. */
export function extendShoot(p: Plant, plot: Plot | null, i: number): number {
  const t = p.nodes[i], len = segLen(p), rng = p.rng, moss = p.form === 'moss';
  for (let tries = 0; tries < 3; tries++) {
    let h: number;
    if (moss && t.creep) h = turn(t.heading + (rng() - 0.5) * 0.6, t.side > 0 ? 0 : Math.PI, 0.3 + tries * 0.3);
    else h = turn(t.heading + (rng() - 0.5) * 0.5, UP, (t.order ? 0.06 : 0.18) + tries * 0.3);
    if (!moss && plot) { // lean toward the brighter side, only when it's clearly brighter
      const l = light(plot, t.x - 12, t.y), r = light(plot, t.x + 12, t.y);
      if (Math.abs(l - r) > T.leanMin) h = turn(h, l > r ? Math.PI : 0, T.lean);
    }
    let x = t.x + Math.cos(h) * len, y = t.y + Math.sin(h) * len;
    if (moss && t.creep) y = Math.min(GROUND - 1, Math.max(GROUND - 4, y));
    if (moss && y < GROUND - cushionCap(p)) continue;
    if (y > GROUND - 1 || y < 4 || x < 4 || x > W - 4) continue;
    t.state = 'seg';
    const leaf = shape(p.genes, 'leaf') * (moss ? 0.6 : 1);
    p.nodes.push(mk({ x, y, parent: i, kind: 'shoot', heading: h, len, leaf, order: t.order, born: p.season, creep: t.creep, side: t.side }));
    const k = p.nodes.length - 1, ang = (shape(p.genes, 'angle') * Math.PI) / 180;
    const buds = Math.floor(shape(p.genes, 'buds') + rng());
    let side = t.side;
    for (let b = 0; b < buds; b++) {
      if (moss) { // a moss bud stacks a cushion (up) or starts a new creeper
        const creep = !t.creep || rng() < 0.4;
        addBud(p, k, creep ? (side > 0 ? 0 : Math.PI) : UP + side * ang * 0.3, 'shoot', 'bud', side, creep);
      } else addBud(p, k, h + side * ang, 'shoot', 'bud', side);
      side = -side;
    }
    if (!moss) p.nodes[k].side = side;
    else if (t.creep && rng() < T.moss.rhizoidChance * shape(p.genes, 'rootShare')) addBud(p, k, Math.PI / 2, 'root', 'tip');
    return k;
  }
  t.state = 'seg';
  return -1;
}

function extendRoot(p: Plant, plot: Plot | null, i: number): number {
  const t = p.nodes[i], rng = p.rng, moss = p.form === 'moss', len = moss ? T.moss.rhizoidLen : T.rootLen, dive = shape(p.genes, 'dive');
  const floor = moss ? GROUND + T.moss.rhizoidDepth[0] + (T.moss.rhizoidDepth[1] - T.moss.rhizoidDepth[0]) * dive : H - 3;
  let h: number;
  if (t.target) h = Math.atan2(t.target.y - t.y, t.target.x - t.x) + (rng() - 0.5) * 0.3;
  else {
    h = turn(t.heading + (rng() - 0.5) * 0.6, DOWN, dive * 0.25);
    h = turn(h, Math.cos(h) >= 0 ? 0.25 : Math.PI - 0.25, (1 - dive) * 0.2);
  }
  for (const dh of [0, 0.8, -0.8, 1.5, -1.5]) {
    const a = h + dh, x = t.x + Math.cos(a) * len, y = t.y + Math.sin(a) * len;
    if (y < GROUND + 1 || y > floor || x < 3 || x > W - 3) continue;
    const c = cellIndex(x, y);
    if (plot && c >= 0 && plot.cells[c].kind === 'stone') { plot.cells[c].seen = true; continue; }
    const target = t.target && Math.hypot(t.target.x - x, t.target.y - y) > len ? t.target : null;
    t.state = 'seg'; t.target = null;
    p.nodes.push(mk({ x, y, parent: i, kind: 'root', heading: a, len, target, order: t.order, born: p.season }));
    const k = p.nodes.length - 1;
    if (plot) reveal(plot, x, y, revealOf(p.genes));
    if (!moss && !target && rng() < T.rootBranch + 0.12 * shape(p.genes, 'buds')) addBud(p, k, a + (rng() < 0.5 ? 0.9 : -0.9), 'root', 'tip');
    return k;
  }
  t.state = 'seg'; t.target = null;
  return -1;
}

export const extend = (p: Plant, plot: Plot | null, i: number) => (p.nodes[i].kind === 'shoot' ? extendShoot(p, plot, i) : extendRoot(p, plot, i));

/** Wake the dormant buds on the few nodes below node i (apical dominance released). */
export function wakeBelow(p: Plant, i: number) {
  let n = p.nodes[i].parent;
  for (let k = 0; k < 3 && n >= 0; k++, n = p.nodes[n].parent) for (const b of p.nodes) if (b.parent === n && b.state === 'bud' && !b.dead) b.state = 'tip';
}

/** Share the growth energy among the active tips (the focus gets PULSE.focus ×); tips that reach a segment's cost extend. */
function grow(p: Plant, plot: Plot | null) {
  if (p.nodes.length >= T.maxNodes) return;
  const tips = { shoot: [] as number[], root: [] as number[] };
  p.nodes.forEach((n, i) => { if (!n.dead && n.state === 'tip') tips[n.kind].push(i); });
  if (!tips.shoot.length && !tips.root.length) return;
  const spend = Math.max(0, p.energy) * 0.5;
  let share = shape(p.genes, 'rootShare');
  const focusKind = p.focus >= 0 && p.nodes[p.focus]?.state === 'tip' ? p.nodes[p.focus].kind : null;
  if (focusKind) share = focusKind === 'root' ? Math.max(share, 0.75) : Math.min(share, 0.25);
  if (!tips.root.length) share = 0;
  if (!tips.shoot.length) share = 1;
  p.energy -= spend;
  for (const kind of ['shoot', 'root'] as Kind[]) {
    const list = tips[kind], pool = spend * (kind === 'root' ? share : 1 - share);
    const weight = (i: number) => (i === p.focus ? PULSE.focus : 1) * (p.nodes[i].target ? 3 : 1);
    const total = list.reduce((s, i) => s + weight(i), 0);
    for (const i of list) {
      const n = p.nodes[i], cost = segCost(p, kind, plot, n);
      const add = Math.min((pool * weight(i)) / total, T.progressCap * cost - n.progress);
      n.progress += Math.max(0, add);
      p.energy += (pool * weight(i)) / total - Math.max(0, add);
      const water = kind === 'shoot' ? T.segWater * (p.form === 'moss' ? 0.3 : 1) : 0;
      if (n.progress >= cost && p.water >= water && (p.form !== 'tree' || carries(p, i))) {
        p.water -= water;
        const carry = n.progress - cost, k = extend(p, plot, i);
        n.progress = 0;
        if (k >= 0) { p.nodes[k].progress = carry; if (p.focus === i) p.focus = k; }
        else if (kind === 'shoot' && p.form !== 'moss') wakeBelow(p, i);
      }
    }
  }
}

// ---- the tick ----
/** Each leaf's light: the sky after the neighbours, × the own leaves above it. Shade lifts a share of both. */
function shade(p: Plant, plot: Plot | null) {
  const leaves = p.nodes.filter((n) => !n.dead && n.kind === 'shoot' && n.leaf > 0), sh = attr(p.genes, 'shade');
  const self = Math.min(0.95, T.selfShade + RULES.shade.self * sh), lift = Math.min(1, RULES.shade.neighbour * sh);
  for (const a of leaves) {
    let above = 0;
    for (const b of leaves) if (b !== a && b.y < a.y - 2 && Math.abs(b.x - a.x) < 2 + b.leaf * 1.5) above++;
    const sky = plot ? light(plot, a.x, a.y) : 1;
    a.light = (sky + (1 - sky) * lift) * self ** above;
  }
}

/** Pipe model: stems thicken with the leaves they carry; a tree adds its wood. */
export function thicken(p: Plant) {
  const carried = new Float32Array(p.nodes.length), th = shape(p.genes, 'thickness'), k = p.form === 'moss' ? 0.4 : 1;
  for (let i = p.nodes.length - 1; i > 0; i--) {
    const n = p.nodes[i];
    if (n.dead) continue;
    carried[i] += n.leaf > 0 || n.kind === 'root' ? 1 : 0;
    n.thick = th * k * (1 + (n.kind === 'shoot' ? 0.18 : 0.1) * Math.sqrt(carried[i])) + n.wood;
    if (n.parent >= 0) carried[n.parent] += carried[i];
  }
}

export function tick(p: Plant, plot: Plot, t: number) {
  if (p.form === 'moss' && plot.dry) return; // a dry spell: the moss is dormant
  if (t % 5 === 0) shade(p, plot);
  if (t % 10 === 0) thicken(p);
  const thirst = plot.look.thirst, moss = p.form === 'moss', upk = upkeepMult(p.genes);
  const rate = T.leafRate * (1 + RULES.pace.leafRate * attr(p.genes, 'pace')) * (moss ? T.moss.light : 1);
  let eIn = 0, eUp = 0, wUse = 0, wIn = 0, nIn = 0;
  const perCell = new Map<number, number>();
  for (const n of p.nodes) {
    if (n.dead || n.state === 'bud') continue;
    eUp += upkeepOf(n) * upk;
    if (n.kind === 'shoot' && n.leaf > 0) {
      eIn += n.leaf * n.light * rate;
      wUse += n.leaf * n.light * T.leafThirst * thirst;
      if (moss && n.y > GROUND - 15) wIn += n.leaf * plot.moisture * T.moss.surfaceWater;
    } else if (n.kind === 'root') {
      if (moss) { nIn += T.moss.dust; continue; }
      const c = cellIndex(n.x, n.y);
      if (c >= 0) perCell.set(c, (perCell.get(c) ?? 0) + 1);
    }
  }
  for (const [c, k] of perCell) {
    const cell = plot.cells[c], m = Math.min(k, T.rootCap);
    if (cell.kind === 'water' || cell.kind === 'nutrient') {
      const got = Math.min(cell.amount, m * (cell.kind === 'water' ? T.pocketWater : T.pocketNutrient));
      cell.amount -= got;
      if (cell.kind === 'water') wIn += got; else nIn += got;
    } else if (cell.kind !== 'stone') wIn += m * T.loamWater * plot.moisture * (cell.kind === 'hard' ? 0.5 : 1);
  }
  const wilting = p.water <= 0.05;
  let eGot = eIn * (wilting ? T.wilt : 1), harmed = eGot * p.harm; // the pressure: Health's reserve first
  const soak = Math.min(p.reserve, harmed);
  p.reserve -= soak; harmed -= soak; eGot -= harmed;
  p.energy = Math.max(0, p.energy + eGot - eUp);
  p.water = Math.max(0, p.water + wIn - wUse * (wilting ? T.wilt : 1));
  p.nutrient += nIn;
  p.flow = { energyIn: eGot, energyUp: eUp, waterIn: wIn, waterUse: wUse, nutrientIn: nIn, wilting, harmed };
  p.acc.net += eGot - eUp; p.acc.cost += eUp + wUse; p.acc.n++;
  const dom = shape(p.genes, 'dominance');
  for (const n of p.nodes) if (n.state === 'bud' && !n.dead && p.rng() < T.wakeChance * (1 - dom) ** 2) n.state = 'tip';
  grow(p, plot);
}

// ---- stats: the six, raw (scaled by the form in species.ts) ----
export interface Body { raw: number[]; leaves: number; depth: number; biomass: number }
export function measure(p: Plant, plot: Plot | null): Body {
  let top = GROUND, lo = W, hi = 0, deep = GROUND, leaves = 0, th = 0, segs = 0, bio = 0, rhiz = 0;
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
      if (n.len) rhiz++;
      const c = cellIndex(n.x, n.y);
      if (plot && c >= 0 && isPocket(plot.cells[c])) tapped.add(c);
    }
  }
  const a = p.acc, n = a.n || 1, roots = p.form === 'moss' ? rhiz : tapped.size;
  // Growth and Upkeep: this season's mean net energy and running cost, per second
  const raw = [GROUND - top, Math.max(0, hi - lo), roots, segs ? th / segs : 0, (a.net / n) * 10, (a.cost / n) * 10];
  return { raw, leaves, depth: deep - GROUND, biomass: bio };
}
