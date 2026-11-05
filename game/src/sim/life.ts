// A Life, the rules (no DOM, no Pixi). Ported from toys/life2-sim.ts: move, eat, moult, lay, the predator's hunt,
// mark, strike and rest. Every action records `events`, which the view plays back in order.
import {
  HUNT, MAX_VERBS, NODES, PARTS, PART_IDS, PLANS, RULE, STAGES, STARTER_PLAN, STYLE_VERBS, TURNS, VERB_PART,
  type NodeId, type PartId, type PlanId, type SlotKind, type Terrain, type VerbId,
} from '../data/life';
import { CELL, MUD_FLATS, type Habitat } from '../data/habitats';
import type { PreyKind } from '../data/prey';
import { preyInit, preyStep, swimDests, swimMove, type Prey } from './hunt';
import { predatorStep } from './threat';
export { hitOn } from './threat';

import { DX, DY, at, dist, inB, xy, type Dir } from './grid';
export { DX, DY, at, dist, inB, xy, type Dir } from './grid';
export type Side = 'front' | 'right' | 'back' | 'left';

export interface Tile { t: Terrain; node: NodeId | null; seen: boolean; grow?: { node: NodeId; at: number } }
export interface Slot { kind: SlotKind; side: Side; seg: number; part: PartId | null }
export interface Predator { x: number; y: number; state: 'hunt' | 'strike' | 'rest'; rest: number; marks: number[]; dir: Dir; lx: number; ly: number; lurked: boolean; bonus: number }
export interface Dest { i: number; dir: Dir; grab: boolean; path: number[] }
export interface Hit { side: Side; kind: 'buried' | 'enrolled' | 'blocked' | 'hit'; part: PartId | null; tear: number; damage: number }

/** What the last action did, in order, for the view to play back. */
export type Ev =
  | { k: 'move'; from: number; to: number; path: number[]; grab: boolean; dir: Dir }
  | { k: 'eat'; i: number; node: NodeId; gain: number; food: number }
  | { k: 'locked'; i: number; node: NodeId; why: string }
  | { k: 'lay'; n: number; eggs: number; food: number }
  | { k: 'stay'; dir: Dir }
  | { k: 'moult'; size: number; food: number }
  | { k: 'part'; slot: number; part: PartId; old: PartId | null }
  | { k: 'upkeep'; food: number }
  | { k: 'shed'; slot: number; part: PartId }
  | { k: 'hurt'; why: string; health: number }
  | { k: 'oxygen'; oxygen: number }
  | { k: 'rival'; idx: number; from: number; to: number; ate: boolean }
  | { k: 'pred_arrive'; at: number }
  | { k: 'pred_move'; from: number; to: number }
  | { k: 'pred_lurk'; at: number }
  | { k: 'marks'; marks: number[]; dir: Dir }
  | ({ k: 'strike'; at: number; dir: Dir; marks: number[]; health: number } & (Hit | { kind: 'miss' }))
  | { k: 'event'; name: string; text: string }
  | { k: 'verb'; verb: VerbId; tiles: number[] }
  | { k: 'grow'; i: number; node: NodeId }
  | { k: 'prey'; idx: number; from: number; to: number; hide: boolean }
  | { k: 'prey_ate'; idx: number; i: number; node: NodeId }
  | { k: 'prey_back'; idx: number; at: number }
  | { k: 'catch'; idx: number; i: number; kind: PreyKind; gain: number; food: number }
  | { k: 'over'; cause: 'season' | 'died' };

export interface Life {
  plan: PlanId; hab: Habitat; r: number;
  tiles: Tile[]; x: number; y: number; facing: Dir; rivals: { x: number; y: number; name: string; eats: NodeId }[];
  turn: number; food: number; oxygen: number; health: number; eggs: number; xp: number; eaten: number;
  size: number; slots: Slot[]; order: number[];
  phase: 'play' | 'offer' | 'over'; offers: PartId[];
  moults: number; rareAt: number; rareGot: PartId | null; rarePassed: boolean; moulted: boolean; soft: boolean; moved: boolean;
  pred: Predator | null; cause: 'season' | 'died' | null; lines: string[]; events: Ev[];
  recharge: Partial<Record<VerbId, number>>; dash: boolean; braced: boolean; dug: boolean;
  prey: Prey[]; frenzy: number; still: boolean; caught: boolean; catches: number; // the predator Life
  ate: Partial<Record<NodeId | 'prey', number>>; // food by source: the garden reads your role from it
}

export function rnd(l: { r: number }) { // the toy's mulberry32
  l.r = (l.r + 0x6d2b79f5) | 0;
  let t = Math.imul(l.r ^ (l.r >>> 15), 1 | l.r);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ---- the body ----
export const count = (l: Life, id: PartId) => l.slots.reduce((n, s) => n + (s.part === id ? 1 : 0), 0);
export const has = (l: Life, id: PartId) => count(l, id) > 0;
export const tile = (l: Life, x = l.x, y = l.y) => l.tiles[at(x, y)];
const onMud = (l: Life) => tile(l).t === 'mud';
export const buriedAt = (l: Life, x: number, y: number) => l.plan === 'worm' && tile(l, x, y).t === 'mud';
export const eventOn = (l: Life) => l.turn >= l.hab.event.from && l.turn <= l.hab.event.to;
/** Whether the board's event covers tile (x, y): its terrain and its rows. Ignores the turn. */
export function eventArea(l: Life, x: number, y: number) {
  const ev = l.hab.event, t = l.tiles[at(x, y)].t;
  return (ev.where === 'all' || ev.where === t) && (!ev.rows || (y >= ev.rows[0] && y <= ev.rows[1]));
}
/** Whether standing on (x, y) costs oxygen this turn: vent water, or the event's area while it lasts. */
export const airless = (l: Life, x = l.x, y = l.y) => !has(l, 'blood') && (l.tiles[at(x, y)].t === 'dead' || (eventOn(l) && eventArea(l, x, y)));
export const upkeep = (l: Life) => (has(l, 'deep') && onMud(l) ? 0 : RULE.baseUpkeep + l.slots.reduce((n, s) => n + (s.part ? PARTS[s.part].upkeep : 0), 0));
export const oxygenMax = (l: Life) => RULE.oxygen + count(l, 'gill') * RULE.gillOxygen;
export const range = (l: Life) => Math.min(RULE.maxRange, PLANS[l.plan].range + count(l, 'leg')) * (l.dash ? 2 : 1);
export const tunnel = (l: Life) => (RULE.tunnel + count(l, 'chaetae') * RULE.bristleTunnel) * (l.dash ? 2 : 1);
/** Your verbs: those your parts give, in the order you got them, three at most. */
export function verbs(l: Life): VerbId[] {
  const out: VerbId[] = [];
  for (const k of l.order) { const v = l.slots[k].part && PARTS[l.slots[k].part!].verb; if (v && !out.includes(v) && out.length < MAX_VERBS) out.push(v); }
  return out;
}
/** The parts a set of verbs gives this body plan: a verb loadout is a starting body. */
export const partsFor = (plan: PlanId, vs: VerbId[]): PartId[] => (plan === 'swimmer' ? ['arms'] : vs.map((v) => VERB_PART[plan][v]));
/** A Life's starting body: your kept form first, so it always gets its slot, then each verb's part while there's room. */
export const startParts = (plan: PlanId, vs: VerbId[], form?: PartId): PartId[] => [...new Set([...(form && PARTS[form].plans.includes(plan) ? [form] : []), ...partsFor(plan, vs)])];
export const ready = (l: Life, v: VerbId) => l.phase === 'play' && verbs(l).includes(v) && !(l.recharge[v]! > 0);
export const sense = (l: Life) => PLANS[l.plan].sense + count(l, 'eye') * RULE.eyeSense + count(l, 'compound') * RULE.compoundSense;
export const clutch = (l: Life) => (1 + count(l, 'pouch')) * l.size + (has(l, 'deep') && onMud(l) ? 1 : 0);
export const moultCost = (l: Life) => l.size + PLANS[l.plan].moultExtra;
export const canMoult = (l: Life) => l.phase === 'play' && !l.moulted && l.size < RULE.maxSize && l.food >= moultCost(l);
export const mature = (l: Life) => l.size >= RULE.adultSize || has(l, 'progenesis');
export const canLay = (l: Life) => l.phase === 'play' && mature(l) && l.food >= RULE.layCost;
export const stage = (l: Life) => STAGES[l.size - 1];
export const foraging = (xp: number) => (xp >= RULE.foragingAt ? 2 : 1);
export const tierOf = (h: Habitat, eggs: number) => h.tiers.find(([, n]) => eggs >= n)![0];
export const nextTier = (h: Habitat, eggs: number) => [...h.tiers].reverse().find(([, n]) => eggs < n) ?? null;
const hasReach = (l: Life) => has(l, 'claw') || has(l, 'proboscis') || has(l, 'hook');
export const known = (t: Tile) => t.t !== 'mud' || t.seen;

/** A tile's food is gone; mats grow back after a while. */
export function cleared(l: Life, t: Tile) {
  if (t.node === 'mat' || t.node === 'bloom') t.grow = { node: t.node, at: l.turn + RULE.regrow };
  t.node = null;
}

/** What a node feeds you, with your parts. */
export const foodOf = (l: Life, node: NodeId) => NODES[node].food * (node === 'bloom' && has(l, 'symbiont') ? 2 : 1) + count(l, 'gut') * RULE.gutFood;

/** What stops you eating this node, or null. */
export function lockOf(l: Life, node: NodeId): string | null {
  if (node === 'buried') return l.plan === 'worm' || has(l, 'digger') ? null : 'needs a digging limb';
  if (node === 'shell') return has(l, 'claw') || has(l, 'hook') ? null : l.plan === 'worm' ? 'needs a hooked proboscis (rare)' : 'needs a crushing claw';
  if (node === 'carcass') return l.size >= RULE.carcassSize ? null : `needs size ${RULE.carcassSize}, you are ${l.size}`;
  return null;
}

export function reveal(l: Life) {
  const R = sense(l);
  l.tiles.forEach((t, i) => { const [x, y] = xy(i); if (Math.max(Math.abs(x - l.x), Math.abs(y - l.y)) <= R) t.seen = true; });
}
export const say = (l: Life, m: string) => { l.lines.push(m); if (l.lines.length > 5) l.lines.shift(); };
export const emit = (l: Life, e: Ev) => { l.events.push(e); };
export const fits = (part: PartId, kind: SlotKind) => PARTS[part].slots.includes(kind);

/** The first empty slot this part fits, else the first filled one (it replaces that part), else -1. */
export function freeSlotFor(l: Life, part: PartId) {
  const empty = l.slots.findIndex((s) => !s.part && fits(part, s.kind));
  return empty >= 0 ? empty : l.slots.findIndex((s) => fits(part, s.kind));
}

// ---- starting a Life ----
export function newLife(seed: number, plan: PlanId = STARTER_PLAN, hab: Habitat = MUD_FLATS, starters: PartId[] = partsFor(plan, STYLE_VERBS.digger)): Life {
  const P = PLANS[plan], slots: Slot[] = [];
  for (let k = 0; k < P.head; k++) slots.push({ kind: 'head', side: 'front', seg: -1, part: null });
  slots.push({ kind: 'tail', side: 'back', seg: 99, part: null });
  for (let k = 0; k < P.pairs; k++) slots.push({ kind: 'side', side: 'left', seg: k, part: null }, { kind: 'side', side: 'right', seg: k, part: null });
  const l: Life = {
    plan, hab, r: (seed ^ 0x5bd1e995) | 0,
    tiles: hab.map.join('').split('').map((c) => { const [t, node] = CELL[c]; return { t, node, seen: false }; }),
    x: hab.start[0], y: hab.start[1], facing: 1, rivals: plan === 'swimmer' ? [] : hab.rivals.map((v) => ({ x: v.at[0], y: v.at[1], name: v.name, eats: v.eats })),
    turn: 1, food: RULE.startFood, oxygen: RULE.oxygen, health: RULE.health, eggs: 0, xp: 0, eaten: 0,
    size: 1, slots, order: [], phase: 'play', offers: [], moults: 0, rareAt: 2, rareGot: null, rarePassed: false,
    moulted: false, soft: false, moved: false, pred: null, cause: null, lines: [], events: [],
    recharge: {}, dash: false, braced: false, dug: false, prey: [], frenzy: 0, still: false, caught: false, catches: 0, ate: {},
  };
  preyInit(l);
  l.rareAt = 2 + Math.floor(rnd(l) * 2);
  for (const part of starters) { const k = freeSlotFor(l, part); if (k >= 0 && !slots[k].part) { slots[k].part = part; l.order.push(k); } }
  l.oxygen = oxygenMax(l);
  reveal(l);
  say(l, `Grow up: you can lay from size ${RULE.adultSize}.`);
  return l;
}

// ---- moulting ----
/** Pay food, grow a size, get offers. The turn doesn't end; one moult a turn. Size 5 finishes the body. */
export function moult(l: Life) {
  l.events = [];
  if (!canMoult(l)) return;
  l.food -= moultCost(l);
  l.size++; l.moults++; l.moulted = true; l.soft = PLANS[l.plan].soft;
  if (l.size === RULE.adultSize) say(l, 'You are an adult: you can lay eggs now.');
  if (l.size === RULE.maxSize) { l.health = RULE.health; say(l, 'Full grown: your body is finished and your wounds close.'); }
  const pool = PART_IDS.filter((id) => !PARTS[id].rare && PARTS[id].plans.includes(l.plan));
  for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(rnd(l) * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
  l.offers = pool.slice(0, 3);
  if (l.moults >= l.rareAt && !l.rareGot) { const rare = l.hab.rares[l.plan].find((id) => !has(l, id)); if (rare) l.offers.push(rare); }
  l.phase = 'offer';
  emit(l, { k: 'moult', size: l.size, food: l.food });
}

/** Take one of the offers: it goes in the first slot it fits (replacing a part if all are full). */
export function pick(l: Life, part: PartId) {
  l.events = [];
  if (l.phase !== 'offer' || !l.offers.includes(part)) return;
  const k = freeSlotFor(l, part);
  if (k >= 0) {
    const old = l.slots[k].part;
    l.order = l.order.filter((o) => o !== k); l.slots[k].part = part; l.order.push(k);
    emit(l, { k: 'part', slot: k, part, old });
  }
  l.phase = 'play'; l.offers = [];
  if (PARTS[part].rare) { l.rareGot = part; l.rarePassed = false; say(l, `Rare: ${PARTS[part].name}. Lay an egg to pass it on.`); }
  l.oxygen = Math.min(l.oxygen, oxygenMax(l));
  reveal(l);
}

// ---- moving ----
/** A worm in mud tunnels through connected mud, around corners. */
function tunnels(l: Life, out: Map<number, Dest>, predAt: number) {
  const max = tunnel(l), seen = new Set([at(l.x, l.y)]), open: [number, number, number[]][] = [[l.x, l.y, []]];
  while (open.length) {
    const [x, y, path] = open.shift()!;
    if (path.length >= max) continue;
    for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
      const nx = x + DX[d], ny = y + DY[d];
      if (!inB(nx, ny)) continue;
      const i = at(nx, ny);
      if (seen.has(i) || l.tiles[i].t !== 'mud') continue;
      seen.add(i);
      const p = [...path, i];
      if (i !== predAt) out.set(i, { i, dir: d, grab: false, path: p });
      open.push([nx, ny, p]);
    }
  }
}

/** Where you can go this turn. */
export function dests(l: Life): Map<number, Dest> {
  const out = new Map<number, Dest>();
  if (l.phase !== 'play') return out;
  if (l.plan === 'swimmer') return swimDests(l);
  const worm = l.plan === 'worm', predAt = l.pred ? at(l.pred.x, l.pred.y) : -1;
  for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
    const path: number[] = [];
    let x = l.x, y = l.y, budget = worm ? 1 : range(l);
    while (budget > 0) {
      x += DX[d]; y += DY[d];
      if (!inB(x, y)) break;
      const i = at(x, y), t = l.tiles[i], cost = l.plan === 'trilobite' && t.t === 'mud' ? 2 : 1; // a trilobite ploughs: mud costs double
      if (t.t === 'rock' || i === predAt || cost > budget) break;
      budget -= cost;
      path.push(i);
      out.set(i, { i, dir: d, grab: false, path: path.slice() });
      if (l.plan === 'arthropod' && t.t === 'mud') break;
    }
  }
  if (worm && onMud(l)) tunnels(l, out, predAt);
  if (hasReach(l)) {
    const ax = l.x + DX[l.facing], ay = l.y + DY[l.facing];
    if (inB(ax, ay) && at(ax, ay) !== predAt) {
      const t = tile(l, ax, ay);
      if (t.node && known(t) && !lockOf(l, t.node)) out.set(at(ax, ay), { i: at(ax, ay), dir: l.facing, grab: true, path: [] });
    }
  }
  return out;
}

/** Eat what lies on tile i; `force` skips the lock (a verb opened it), `bonus` adds food. */
export function eat(l: Life, i: number, force = false, bonus = 0) {
  const t = l.tiles[i];
  if (!t.node) return;
  const lock = force ? null : lockOf(l, t.node);
  if (lock) { say(l, `${NODES[t.node].name} ${lock}.`); emit(l, { k: 'locked', i, node: t.node, why: lock }); return; }
  const f = foodOf(l, t.node) + bonus;
  say(l, `${NODES[t.node].name}: +${f} food.`);
  l.food += f; l.xp += f; l.eaten += f; l.ate[t.node] = (l.ate[t.node] ?? 0) + f;
  emit(l, { k: 'eat', i, node: t.node, gain: f, food: l.food });
  cleared(l, t);
}

export function move(l: Life, i: number) {
  l.events = [];
  const d = dests(l).get(i);
  if (!d) return;
  if (l.plan === 'swimmer') { swimMove(l, d); world(l); return; }
  const from = at(l.x, l.y);
  if (!d.grab) { [l.x, l.y] = xy(i); l.facing = d.dir; }
  l.moved = !d.grab; l.dash = false;
  emit(l, { k: 'move', from, to: i, path: d.path, grab: d.grab, dir: d.dir });
  eat(l, i);
  world(l);
}
export function lay(l: Life) {
  l.events = [];
  if (!canLay(l)) return;
  const n = clutch(l);
  l.food -= RULE.layCost; l.eggs += n; l.moved = false;
  say(l, `Laid ${n} egg${n > 1 ? 's' : ''}.`);
  emit(l, { k: 'lay', n, eggs: l.eggs, food: l.food });
  if (l.rareGot && !l.rarePassed) { l.rarePassed = true; say(l, `${PARTS[l.rareGot].name} passed on.`); }
  world(l);
}
export function stay(l: Life, dir: Dir = l.facing) {
  l.events = [];
  if (l.phase !== 'play') return;
  l.facing = dir; l.moved = false;
  emit(l, { k: 'stay', dir });
  world(l);
}

function rivalStep(l: Life, idx: number) {
  const v = l.rivals[idx], from = at(v.x, v.y);
  let best = -1, bd = 1e9;
  l.tiles.forEach((t, i) => { if (t.node === v.eats) { const d = dist(v.x, v.y, ...xy(i)); if (d < bd) { bd = d; best = i; } } });
  if (best < 0) return;
  const [tx, ty] = xy(best), dx = Math.sign(tx - v.x), dy = Math.sign(ty - v.y);
  const tries = Math.abs(tx - v.x) >= Math.abs(ty - v.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
  for (const [ox, oy] of tries) {
    if ((ox || oy) && inB(v.x + ox, v.y + oy) && tile(l, v.x + ox, v.y + oy).t !== 'rock') { v.x += ox; v.y += oy; break; }
  }
  const t = tile(l, v.x, v.y), ate = t.node === v.eats;
  if (ate) cleared(l, t);
  emit(l, { k: 'rival', idx, from, to: at(v.x, v.y), ate });
}

// ---- the world's turn ----
function hurtOrShed(l: Life, why: string) {
  const k = l.order.pop();
  if (k !== undefined && l.slots[k].part) {
    const part = l.slots[k].part!;
    say(l, `${why}: your body absorbs its ${PARTS[part].name.toLowerCase()}.`);
    emit(l, { k: 'shed', slot: k, part });
    l.slots[k].part = null;
    return;
  }
  say(l, `${why}: −1 health.`); l.health -= 1;
  emit(l, { k: 'hurt', why, health: l.health });
}

export function world(l: Life) {
  for (const v of Object.keys(l.recharge) as VerbId[]) if (l.recharge[v]! > 0) l.recharge[v]!--;
  l.food -= upkeep(l);
  if (l.food < 0) { l.food = 0; hurtOrShed(l, 'Starving'); }
  emit(l, { k: 'upkeep', food: l.food });
  const ev = l.hab.event;
  if (airless(l)) {
    l.oxygen -= 1;
    if (l.oxygen < 0) { l.oxygen = 0; say(l, 'No oxygen: −1 health.'); l.health -= 1; emit(l, { k: 'hurt', why: 'No oxygen', health: l.health }); }
  } else l.oxygen = Math.min(oxygenMax(l), l.oxygen + 1);
  emit(l, { k: 'oxygen', oxygen: l.oxygen });
  l.rivals.forEach((_, k) => rivalStep(l, k));
  preyStep(l);
  predatorStep(l);
  l.soft = false; l.moulted = false; l.braced = false; l.dug = false;
  if (l.plan === 'swimmer') { l.frenzy = l.caught ? Math.min(HUNT.frenzyMax, l.frenzy + 1) : 0; l.caught = false; l.still = !l.moved; }
  reveal(l);
  if (l.health <= 0) {
    l.health = 0; l.phase = 'over'; l.cause = 'died';
    say(l, `You died on turn ${l.turn}.`); emit(l, { k: 'over', cause: 'died' });
    return;
  }
  l.turn++;
  l.tiles.forEach((t, i) => {
    if (!t.grow || t.grow.at > l.turn || t.node || i === at(l.x, l.y)) return;
    t.node = t.grow.node; t.grow = undefined; emit(l, { k: 'grow', i, node: t.node });
  });
  if (l.turn === l.hab.predatorAt && l.plan !== 'swimmer') {
    l.pred = { x: l.hab.entry[0], y: l.hab.entry[1], state: 'hunt', rest: 0, marks: [], dir: 1, lx: l.x, ly: l.y, lurked: false, bonus: 0 };
    say(l, `${l.hab.predator} arrives.`); emit(l, { k: 'pred_arrive', at: at(l.pred.x, l.pred.y) });
  }
  if (ev.name && l.turn === ev.from) { say(l, `${ev.name}: ${ev.text}.`); emit(l, { k: 'event', name: ev.name, text: ev.text }); }
  if (l.turn > TURNS) {
    l.turn = TURNS; l.phase = 'over'; l.cause = 'season';
    say(l, 'The season ends.'); emit(l, { k: 'over', cause: 'season' });
  }
}
