// Movement, feeding and the board's turn. Each action records events for playback.
import { CELL, NODES, PLANS, RULE, STAGES, TURNS, type NodeId, type Terrain } from '../data/life';
import { PARTS } from '../data/parts';
import * as B from './life-body';
import type { Hit as BodyHit, LifeBody, LifeBuild, Side } from './life-body';
import type { Build, Id, PartId, Place, Ranks, VerbId } from './records';
import { predatorStep } from './threat';

import { DX, DY, at, dist, inB, xy, type Dir } from './grid';
export { DX, DY, at, dist, inB, xy, type Dir } from './grid';
export { hitOn } from './threat';
export type { Side } from './life-body';

export interface Rival { at: [number, number]; species: Id; name: string; eats: NodeId | null; build: Build }
export interface BoardEvent {
  from: number; to: number; where: 'all' | Terrain; rows?: [number, number]; cols?: [number, number];
  name: string; text: string; look: 'murk' | 'dry' | 'haze';
}
export interface Board {
  substrate: Terrain; map: readonly string[]; start: [number, number]; entry: [number, number];
  predatorAt: number | null; rivals: Rival[]; event: BoardEvent | null;
}

export interface Tile { t: Terrain; node: NodeId | null; seen: boolean; grow?: { node: NodeId; at: number } }
export interface Predator {
  x: number; y: number; state: 'hunt' | 'strike' | 'rest'; rest: number; marks: number[]; dir: Dir; lx: number; ly: number;
}
export interface Dest { i: number; dir: Dir; grab: boolean; path: number[] }
export type Hit = BodyHit & { side: Side };

/** What the last action did, in order, for the view to play back. */
export type Ev =
  | { k: 'move'; from: number; to: number; path: number[]; grab: boolean; dir: Dir }
  | { k: 'eat'; i: number; node: NodeId; gain: number; food: number }
  | { k: 'locked'; i: number; node: NodeId; why: string }
  | { k: 'lay'; n: number; eggs: number; food: number }
  | { k: 'stay'; dir: Dir }
  | { k: 'moult'; size: number; food: number }
  | { k: 'part'; place: Place; part: PartId }
  | { k: 'enforce'; part: PartId; rank: number; food: number }
  | { k: 'upkeep'; food: number }
  | { k: 'shed'; place: Place; part: PartId }
  | { k: 'hurt'; why: string; health: number }
  | { k: 'oxygen'; oxygen: number }
  | { k: 'rival'; idx: number; from: number; to: number; ate: boolean }
  | { k: 'pred_arrive'; at: number }
  | { k: 'pred_move'; from: number; to: number }
  | { k: 'marks'; marks: number[]; dir: Dir }
  | ({ k: 'strike'; at: number; dir: Dir; marks: number[]; health: number } & (Hit | { kind: 'miss' }))
  | { k: 'event'; name: string; text: string }
  | { k: 'verb'; verb: VerbId; tiles: number[] }
  | { k: 'grow'; i: number; node: NodeId }
  | { k: 'over'; cause: 'season' | 'died' };

export interface Life extends LifeBody {
  board: Board;
  tiles: Tile[]; x: number; y: number; facing: Dir; rivals: (Rival & { x: number; y: number })[];
  turn: number; food: number; oxygen: number; health: number; eggs: number;
  phase: 'play' | 'over'; cause: 'season' | 'died' | null;
  grew: boolean; soft: boolean; moved: boolean;
  pred: Predator | null; lines: string[]; events: Ev[];
  recharge: Partial<Record<VerbId, number>>; dash: boolean; braced: boolean; dug: boolean;
  ate: Partial<Record<NodeId, number>>;
}

export const has = (l: Life, part: PartId) => B.has(l, part);
export const tile = (l: Life, x = l.x, y = l.y) => l.tiles[at(x, y)];
export const onMud = (l: Life) => tile(l).t === 'mud';
export const buriedAt = (l: Life, x: number, y: number) => l.build.clade === 'worm' && tile(l, x, y).t === 'mud';
export const eventOn = (l: Life) => !!l.board.event && l.turn >= l.board.event.from && l.turn <= l.board.event.to;
/** Whether the board's event covers (x, y), by terrain, rows and columns. */
export function eventArea(l: Life, x: number, y: number) {
  const ev = l.board.event, t = tile(l, x, y).t;
  return !!ev && (ev.where === 'all' || ev.where === t) && (!ev.rows || (y >= ev.rows[0] && y <= ev.rows[1]))
    && (!ev.cols || (x >= ev.cols[0] && x <= ev.cols[1]));
}
export const airless = (l: Life, x = l.x, y = l.y) => !has(l, 'blood') && eventOn(l) && eventArea(l, x, y);
export const upkeep = (l: Life) => B.upkeep(l, onMud(l));
export const oxygenMax = (l: Life) => B.oxygenMax(l);
export const range = (l: Life) => B.range(l) * (l.dash ? 2 : 1);
export const tunnel = (l: Life) => B.tunnel(l) * (l.dash ? 2 : 1);
export const verbs = (l: Life) => B.verbs(l);
export const ready = (l: Life, v: VerbId) => l.phase === 'play' && verbs(l).includes(v) && !(l.recharge[v]! > 0);
export const sense = (l: Life) => B.sense(l);
export const stage = (l: Life) => STAGES[l.size - 1];
export const known = (t: Tile) => t.t !== 'mud' || t.seen;

/** A tile's food is gone; mats grow back after a while. */
export function cleared(l: Life, t: Tile) {
  if (t.node === 'mat') t.grow = { node: t.node, at: l.turn + RULE.regrow };
  t.node = null;
}

export const foodOf = (l: Life, node: NodeId) => B.foodOf(l, node);
export const lockOf = (l: Life, node: NodeId, cracked = false) => B.lockOf(l, node, l.board.substrate, cracked);

export function reveal(l: Life) {
  const R = sense(l);
  l.tiles.forEach((t, i) => { const [x, y] = xy(i); if (Math.max(Math.abs(x - l.x), Math.abs(y - l.y)) <= R) t.seen = true; });
}
export const say = (l: Life, m: string) => { l.lines.push(m); if (l.lines.length > 5) l.lines.shift(); };
export const emit = (l: Life, e: Ev) => { l.events.push(e); };

/** The board has already used its seed for layout. A Life's turns follow the board and its actions. */
export function newLife(board: Board, build: Build, ranks: Ranks, _seed: number): Life {
  if (!isLifeBuild(build)) throw new Error('This clade has no Life on a grazer board');
  const l: Life = {
    board, build, ranks, size: 1, lost: [], enforced: {}, spentGuards: {},
    tiles: board.map.join('').split('').map((c) => { const [t, node] = CELL[c]; return { t, node, seen: false }; }),
    x: board.start[0], y: board.start[1], facing: 1, rivals: board.rivals.map((v) => ({ ...v, x: v.at[0], y: v.at[1] })),
    turn: 1, food: RULE.startFood, oxygen: RULE.oxygen, health: RULE.health, eggs: 0,
    phase: 'play', grew: false, soft: false, moved: false, pred: null, cause: null, lines: [], events: [],
    recharge: {}, dash: false, braced: false, dug: false, ate: {},
  };
  l.oxygen = oxygenMax(l);
  reveal(l);
  say(l, `Grow up: you can lay from size ${RULE.adultSize}.`);
  return l;
}

export function isLifeBuild(build: Build): build is LifeBuild {
  return Object.hasOwn(PLANS, build.clade);
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
  const worm = l.build.clade === 'worm', predAt = l.pred ? at(l.pred.x, l.pred.y) : -1;
  for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
    const path: number[] = [];
    let x = l.x, y = l.y, budget = worm ? 1 : range(l);
    while (budget > 0) {
      x += DX[d]; y += DY[d];
      if (!inB(x, y)) break;
      const i = at(x, y), t = l.tiles[i], cost = l.build.clade === 'trilobite' && t.t === 'mud' ? 2 : 1; // a trilobite ploughs: mud costs double
      if (t.t === 'rock' || i === predAt || cost > budget) break;
      budget -= cost;
      path.push(i);
      out.set(i, { i, dir: d, grab: false, path: path.slice() });
      if (l.build.clade === 'arthropod' && t.t === 'mud') break;
    }
  }
  if (worm && onMud(l)) tunnels(l, out, predAt);
  if (B.canGrab(l)) {
    const ax = l.x + DX[l.facing], ay = l.y + DY[l.facing];
    if (inB(ax, ay) && at(ax, ay) !== predAt) {
      const t = tile(l, ax, ay);
      if (t.node && known(t) && !lockOf(l, t.node)) out.set(at(ax, ay), { i: at(ax, ay), dir: l.facing, grab: true, path: [] });
    }
  }
  return out;
}

/** Eat the node at tile i. Crush can open shell beds and carcasses that are normally locked. */
export function eat(l: Life, i: number, cracked = false, bonus = 0) {
  const t = l.tiles[i];
  if (!t.node) return;
  const lock = lockOf(l, t.node, cracked);
  if (lock) { say(l, `${NODES[t.node].name} ${lock}.`); emit(l, { k: 'locked', i, node: t.node, why: lock }); return; }
  const f = foodOf(l, t.node) + bonus;
  say(l, `${NODES[t.node].name}: +${f} food.`);
  l.food += f; l.ate[t.node] = (l.ate[t.node] ?? 0) + f;
  emit(l, { k: 'eat', i, node: t.node, gain: f, food: l.food });
  cleared(l, t);
}

export function move(l: Life, i: number) {
  l.events = [];
  const d = dests(l).get(i);
  if (!d) return;
  const from = at(l.x, l.y);
  if (!d.grab) { [l.x, l.y] = xy(i); l.facing = d.dir; }
  l.moved = !d.grab; l.dash = false;
  emit(l, { k: 'move', from, to: i, path: d.path, grab: d.grab, dir: d.dir });
  eat(l, i);
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
  if (!v.eats) return;
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
/** A tear or a shed switches a place off for the rest of the Life. */
export function loseAt(l: Life, place: Place) {
  l.lost.push(place);
  l.oxygen = Math.min(l.oxygen, oxygenMax(l));
}

function hurtOrShed(l: Life, why: string) {
  const place = B.newest(l);
  if (place) {
    const part = l.build.parts[place]!;
    say(l, `${why}: your body absorbs its ${PARTS[part].name.toLowerCase()}.`);
    loseAt(l, place);
    emit(l, { k: 'shed', place, part });
    return;
  }
  say(l, `${why}: −1 health.`); l.health -= 1;
  emit(l, { k: 'hurt', why, health: l.health });
}

export function world(l: Life) {
  if (l.phase !== 'play') return;
  for (const v of Object.keys(l.recharge) as VerbId[]) if (l.recharge[v]! > 0) l.recharge[v]!--;
  l.food -= upkeep(l);
  if (l.food < 0) { l.food = 0; hurtOrShed(l, 'Starving'); }
  emit(l, { k: 'upkeep', food: l.food });
  const ev = l.board.event;
  if (airless(l)) {
    l.oxygen -= 1;
    if (l.oxygen < 0) { l.oxygen = 0; say(l, 'No oxygen: −1 health.'); l.health -= 1; emit(l, { k: 'hurt', why: 'No oxygen', health: l.health }); }
  } else l.oxygen = Math.min(oxygenMax(l), l.oxygen + 1);
  emit(l, { k: 'oxygen', oxygen: l.oxygen });
  l.rivals.forEach((_, k) => rivalStep(l, k));
  predatorStep(l);
  l.grew = false; l.soft = false; l.braced = false; l.dug = false;
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
  if (l.turn === l.board.predatorAt) {
    l.pred = { x: l.board.entry[0], y: l.board.entry[1], state: 'hunt', rest: 0, marks: [], dir: 1, lx: l.x, ly: l.y };
    say(l, 'A shadow from deep water arrives.'); emit(l, { k: 'pred_arrive', at: at(l.pred.x, l.pred.y) });
  }
  if (ev?.name && l.turn === ev.from) { say(l, `${ev.name}: ${ev.text}.`); emit(l, { k: 'event', name: ev.name, text: ev.text }); }
  if (l.turn > TURNS) {
    l.turn = TURNS; l.phase = 'over'; l.cause = 'season';
    say(l, 'The season ends.'); emit(l, { k: 'over', cause: 'season' });
  }
}
