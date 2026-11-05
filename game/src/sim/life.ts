// A Life, the rules (no DOM, no Pixi). Ported from toys/life2-sim.ts: move, eat, moult, lay, the predator's hunt,
// mark, strike and rest. Every action records `events`, which the view plays back in order.
import {
  COLS, NODES, PARTS, PART_IDS, PLANS, ROWS, RULE, STAGES, STARTER_PARTS, STARTER_PLAN, TURNS,
  type NodeId, type PartId, type PlanId, type SlotKind, type Terrain,
} from '../data/life';
import { CELL, MUD_FLATS, type Habitat } from '../data/habitats';

export type Dir = 0 | 1 | 2 | 3; // north, east, south, west
export type Side = 'front' | 'right' | 'back' | 'left';
export const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const SIDES: Side[] = ['front', 'right', 'back', 'left'];
const DIR_NAMES = ['north', 'east', 'south', 'west'];
export const at = (x: number, y: number) => y * COLS + x;
export const inB = (x: number, y: number) => x >= 0 && x < COLS && y >= 0 && y < ROWS;
export const xy = (i: number): [number, number] => [i % COLS, Math.floor(i / COLS)];
const dist = (ax: number, ay: number, bx: number, by: number) => Math.abs(ax - bx) + Math.abs(ay - by);

export interface Tile { t: Terrain; node: NodeId | null; seen: boolean }
export interface Slot { kind: SlotKind; side: Side; seg: number; part: PartId | null }
export interface Predator { x: number; y: number; state: 'hunt' | 'strike' | 'rest'; rest: number; marks: number[]; dir: Dir; lx: number; ly: number }
export interface Dest { i: number; dir: Dir; grab: boolean; path: number[] }
export interface Hit { side: Side; kind: 'buried' | 'blocked' | 'hit'; part: PartId | null; tear: number; damage: number }

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
  | { k: 'marks'; marks: number[]; dir: Dir }
  | ({ k: 'strike'; at: number; dir: Dir; marks: number[]; health: number } & (Hit | { kind: 'miss' }))
  | { k: 'event'; name: string; text: string }
  | { k: 'over'; cause: 'season' | 'died' };

export interface Life {
  plan: PlanId; hab: Habitat; r: number;
  tiles: Tile[]; x: number; y: number; facing: Dir; rivals: { x: number; y: number; name: string; eats: NodeId }[];
  turn: number; food: number; oxygen: number; health: number; eggs: number; xp: number; eaten: number;
  size: number; slots: Slot[]; order: number[];
  phase: 'play' | 'offer' | 'over'; offers: PartId[];
  moults: number; rareAt: number; rareGot: PartId | null; rarePassed: boolean; moulted: boolean; soft: boolean; moved: boolean;
  pred: Predator | null; cause: 'season' | 'died' | null; lines: string[]; events: Ev[];
}

function rnd(l: { r: number }) { // the toy's mulberry32
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
export const upkeep = (l: Life) => (has(l, 'deep') && onMud(l) ? 0 : RULE.baseUpkeep + l.slots.reduce((n, s) => n + (s.part ? PARTS[s.part].upkeep : 0), 0));
export const oxygenMax = (l: Life) => RULE.oxygen + count(l, 'gill') * RULE.gillOxygen;
export const range = (l: Life) => Math.min(RULE.maxRange, PLANS[l.plan].range + count(l, 'leg'));
export const tunnel = (l: Life) => RULE.tunnel + count(l, 'chaetae') * RULE.bristleTunnel;
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
const hasReach = (l: Life) => has(l, 'claw') || has(l, 'proboscis');
export const known = (t: Tile) => t.t !== 'mud' || t.seen;

/** What stops you eating this node, or null. */
export function lockOf(l: Life, node: NodeId): string | null {
  if (node === 'buried') return l.plan === 'worm' || has(l, 'digger') ? null : 'needs a digging limb';
  if (node === 'shell') return has(l, 'claw') ? null : l.plan === 'worm' ? 'needs a hooked proboscis (rare)' : 'needs a crushing claw';
  if (node === 'carcass') return l.size >= RULE.carcassSize ? null : `needs size ${RULE.carcassSize}, you are ${l.size}`;
  return null;
}

function reveal(l: Life) {
  const R = sense(l);
  l.tiles.forEach((t, i) => { const [x, y] = xy(i); if (Math.max(Math.abs(x - l.x), Math.abs(y - l.y)) <= R) t.seen = true; });
}
const say = (l: Life, m: string) => { l.lines.push(m); if (l.lines.length > 5) l.lines.shift(); };
const emit = (l: Life, e: Ev) => { l.events.push(e); };
export const fits = (part: PartId, kind: SlotKind) => PARTS[part].slots.includes(kind);

/** The first empty slot this part fits, else the first filled one (it replaces that part), else -1. */
export function freeSlotFor(l: Life, part: PartId) {
  const empty = l.slots.findIndex((s) => !s.part && fits(part, s.kind));
  return empty >= 0 ? empty : l.slots.findIndex((s) => fits(part, s.kind));
}

// ---- starting a Life ----
export function newLife(seed: number, plan: PlanId = STARTER_PLAN, hab: Habitat = MUD_FLATS, starters: PartId[] = STARTER_PARTS): Life {
  const P = PLANS[plan], slots: Slot[] = [];
  for (let k = 0; k < P.head; k++) slots.push({ kind: 'head', side: 'front', seg: -1, part: null });
  slots.push({ kind: 'tail', side: 'back', seg: 99, part: null });
  for (let k = 0; k < P.pairs; k++) slots.push({ kind: 'side', side: 'left', seg: k, part: null }, { kind: 'side', side: 'right', seg: k, part: null });
  const l: Life = {
    plan, hab, r: (seed ^ 0x5bd1e995) | 0,
    tiles: hab.map.join('').split('').map((c) => { const [t, node] = CELL[c]; return { t, node, seen: false }; }),
    x: hab.start[0], y: hab.start[1], facing: 1, rivals: hab.rivals.map((v) => ({ x: v.at[0], y: v.at[1], name: v.name, eats: v.eats })),
    turn: 1, food: RULE.startFood, oxygen: RULE.oxygen, health: RULE.health, eggs: 0, xp: 0, eaten: 0,
    size: 1, slots, order: [], phase: 'play', offers: [], moults: 0, rareAt: 2, rareGot: null, rarePassed: false,
    moulted: false, soft: false, moved: false, pred: null, cause: null, lines: [], events: [],
  };
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
  const worm = l.plan === 'worm', predAt = l.pred ? at(l.pred.x, l.pred.y) : -1;
  for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
    const path: number[] = [];
    let x = l.x, y = l.y;
    for (let k = 1; k <= (worm ? 1 : range(l)); k++) {
      x += DX[d]; y += DY[d];
      if (!inB(x, y)) break;
      const i = at(x, y), t = l.tiles[i];
      if (t.t === 'rock' || i === predAt) break;
      path.push(i);
      out.set(i, { i, dir: d, grab: false, path: path.slice() });
      if (!worm && t.t === 'mud') break;
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

function eat(l: Life, i: number) {
  const t = l.tiles[i];
  if (!t.node) return;
  const lock = lockOf(l, t.node);
  if (lock) { say(l, `${NODES[t.node].name} ${lock}.`); emit(l, { k: 'locked', i, node: t.node, why: lock }); return; }
  const f = NODES[t.node].food + count(l, 'gut') * RULE.gutFood;
  say(l, `${NODES[t.node].name}: +${f} food.`);
  l.food += f; l.xp += f; l.eaten += f;
  emit(l, { k: 'eat', i, node: t.node, gain: f, food: l.food });
  t.node = null;
}

export function move(l: Life, i: number) {
  l.events = [];
  const d = dests(l).get(i);
  if (!d) return;
  const from = at(l.x, l.y);
  if (!d.grab) { [l.x, l.y] = xy(i); l.facing = d.dir; }
  l.moved = !d.grab;
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

// ---- strikes ----
/** What a strike from `dir` would do to you at (x, y), facing `facing`. */
export function hitOn(l: Life, dir: Dir, facing: Dir, x: number, y: number): Hit {
  const side = SIDES[(dir - facing + 4) % 4];
  if (buriedAt(l, x, y)) return { side, kind: 'buried', part: null, tear: -1, damage: 0 };
  const guard = l.slots.find((s) => s.side === side && s.part && PARTS[s.part].guard);
  if (guard) return { side, kind: 'blocked', part: guard.part, tear: -1, damage: 0 };
  let tear = -1;
  l.slots.forEach((s, k) => { if (s.side === side && s.part) tear = k; });
  return { side, kind: 'hit', part: tear >= 0 ? l.slots[tear].part : null, tear, damage: (tear < 0 ? 1 : 0) + (l.soft ? 1 : 0) };
}

function strike(l: Life) {
  const p = l.pred!, marks = p.marks, here = at(l.x, l.y);
  p.state = 'rest'; p.rest = RULE.restAfterStrike; p.marks = [];
  if (!marks.includes(here)) {
    say(l, 'The strike misses.');
    emit(l, { k: 'strike', kind: 'miss', at: here, dir: p.dir, marks, health: l.health });
    return;
  }
  const h = hitOn(l, p.dir, l.facing, l.x, l.y);
  if (h.kind === 'buried') say(l, 'You are buried: the strike misses.');
  else if (h.kind === 'blocked') {
    say(l, `Your ${PARTS[h.part!].name.toLowerCase()} blocks a strike on your ${h.side}.`);
    if (h.part === 'spine') p.rest = RULE.restAfterSpine;
  } else {
    if (h.tear >= 0) { say(l, `Hit on your ${h.side}: your ${PARTS[h.part!].name.toLowerCase()} is torn off.`); l.slots[h.tear].part = null; l.order = l.order.filter((k) => k !== h.tear); }
    if (h.damage) { say(l, `Hit on your ${h.side}: −${h.damage} health${l.soft ? ' (soft from moulting)' : ''}.`); l.health -= h.damage; }
  }
  emit(l, { k: 'strike', ...h, at: here, dir: p.dir, marks, health: l.health });
}

/** One step toward (tx, ty), swimming over rock but never into dead water: it heads for the nearest tile it can reach. */
function predatorMove(l: Life, p: Predator, tx: number, ty: number) {
  const start = at(p.x, p.y), from = new Map<number, number>([[start, -1]]), open = [start];
  let goal = start, gd = dist(p.x, p.y, tx, ty);
  while (open.length) {
    const i = open.shift()!, [x, y] = xy(i), dd = dist(x, y, tx, ty);
    if (dd < gd) { gd = dd; goal = i; }
    for (let d = 0; d < 4; d++) {
      const nx = x + DX[d], ny = y + DY[d];
      if (!inB(nx, ny)) continue;
      const n = at(nx, ny);
      if (from.has(n) || l.tiles[n].t === 'dead') continue;
      from.set(n, i); open.push(n);
    }
  }
  let step = goal;
  while (from.get(step) !== -1 && from.get(step) !== start) step = from.get(step)!;
  if (step !== start) [p.x, p.y] = xy(step);
}

function predatorStep(l: Life) {
  const p = l.pred;
  if (!p) return;
  if (p.state === 'strike') { strike(l); return; }
  if (p.state === 'rest') { if (--p.rest <= 0) p.state = 'hunt'; return; }
  const hidden = buriedAt(l, l.x, l.y), from = at(p.x, p.y);
  if (!hidden) { p.lx = l.x; p.ly = l.y; }
  for (let k = 0; k < RULE.predatorSteps && dist(p.x, p.y, p.lx, p.ly) > 1; k++) predatorMove(l, p, p.lx, p.ly);
  if (at(p.x, p.y) !== from) emit(l, { k: 'pred_move', from, to: at(p.x, p.y) });
  if (hidden || dist(p.x, p.y, l.x, l.y) !== 1) return;
  p.dir = (p.y < l.y ? 0 : p.x > l.x ? 1 : p.y > l.y ? 2 : 3) as Dir;
  const across = p.dir % 2 === 0 ? 1 : 0; // the strike sweeps sideways: step away along its line, or get clear of it
  p.marks = [[0, 0], [DX[across], DY[across]], [-DX[across], -DY[across]]]
    .map(([ox, oy]) => [l.x + ox, l.y + oy]).filter(([x, y]) => inB(x, y) && tile(l, x, y).t !== 'rock').map(([x, y]) => at(x, y));
  p.state = 'strike';
  say(l, `${l.hab.predator} marks a strike from the ${DIR_NAMES[p.dir]}.`);
  emit(l, { k: 'marks', marks: p.marks, dir: p.dir });
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
  if (ate) t.node = null;
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

function world(l: Life) {
  l.food -= upkeep(l);
  if (l.food < 0) { l.food = 0; hurtOrShed(l, 'Starving'); }
  emit(l, { k: 'upkeep', food: l.food });
  const t = tile(l).t, ev = l.hab.event;
  if (t === 'dead' || (eventOn(l) && (ev.where === 'all' || ev.where === t))) {
    l.oxygen -= 1;
    if (l.oxygen < 0) { l.oxygen = 0; say(l, 'No oxygen: −1 health.'); l.health -= 1; emit(l, { k: 'hurt', why: 'No oxygen', health: l.health }); }
  } else l.oxygen = Math.min(oxygenMax(l), l.oxygen + 1);
  emit(l, { k: 'oxygen', oxygen: l.oxygen });
  l.rivals.forEach((_, k) => rivalStep(l, k));
  predatorStep(l);
  l.soft = false; l.moulted = false;
  reveal(l);
  if (l.health <= 0) {
    l.health = 0; l.phase = 'over'; l.cause = 'died';
    say(l, `You died on turn ${l.turn}.`); emit(l, { k: 'over', cause: 'died' });
    return;
  }
  l.turn++;
  if (l.turn === l.hab.predatorAt) {
    l.pred = { x: l.hab.entry[0], y: l.hab.entry[1], state: 'hunt', rest: 0, marks: [], dir: 1, lx: l.x, ly: l.y };
    say(l, `${l.hab.predator} arrives.`); emit(l, { k: 'pred_arrive', at: at(l.pred.x, l.pred.y) });
  }
  if (ev.name && l.turn === ev.from) { say(l, `${ev.name}: ${ev.text}.`); emit(l, { k: 'event', name: ev.name, text: ev.text }); }
  if (l.turn > TURNS) {
    l.turn = TURNS; l.phase = 'over'; l.cause = 'season';
    say(l, 'The season ends.'); emit(l, { k: 'over', cause: 'season' });
  }
}
