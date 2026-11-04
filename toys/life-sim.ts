// Toy: a Life, the rules (no DOM). One creature on a seafloor board: move, eat, moult, lay eggs, dodge one predator.
import { COLS, LOW_OXYGEN, NODES, PARTS, PART_IDS, PLANS, PREDATOR_AT, ROWS, RULE, TIERS, TURNS, type NodeId, type PartId, type PlanId, type SlotKind, type Terrain } from './life-data';

export type Dir = 0 | 1 | 2 | 3; // north, east, south, west
export type Side = 'front' | 'right' | 'back' | 'left';
export const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const SIDES: Side[] = ['front', 'right', 'back', 'left'];
export const at = (x: number, y: number) => y * COLS + x;
export const inB = (x: number, y: number) => x >= 0 && x < COLS && y >= 0 && y < ROWS;
export const xy = (i: number): [number, number] => [i % COLS, Math.floor(i / COLS)];

export interface Tile { t: Terrain; node: NodeId | null; seen: boolean }
export interface Slot { kind: SlotKind; side: Side; seg: number; part: PartId | null }
export interface Predator { x: number; y: number; state: 'hunt' | 'strike' | 'rest'; rest: number; marks: number[]; dir: Dir; lx: number; ly: number }
export interface Lineage { xp: number; rare: PartId[]; best: Record<PlanId, number>; lives: number }
export interface Life {
  seed: number; plan: PlanId; lineage: Lineage; r: number;
  tiles: Tile[]; x: number; y: number; facing: Dir; entry: [number, number]; rival: { x: number; y: number };
  turn: number; food: number; oxygen: number; health: number; eggs: number; xp: number; eaten: number;
  segments: number; slots: Slot[]; order: number[];
  phase: 'build' | 'play' | 'offer' | 'over'; held: PartId | null; offers: PartId[];
  moults: number; rareAt: number; rareGot: PartId | null; rarePassed: boolean; moulted: boolean; soft: boolean; moved: boolean;
  pred: Predator | null; cause: 'season' | 'died' | null; log: string[];
}

function rnd(s: { r: number }) {
  s.r = (s.r + 0x6d2b79f5) | 0;
  let t = Math.imul(s.r ^ (s.r >>> 15), 1 | s.r);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const shuffled = <T>(s: { r: number }, a: T[]) => {
  const o = a.slice();
  for (let k = o.length - 1; k > 0; k--) { const j = Math.floor(rnd(s) * (k + 1)); [o[k], o[j]] = [o[j], o[k]]; }
  return o;
};
const dist = (ax: number, ay: number, bx: number, by: number) => Math.abs(ax - bx) + Math.abs(ay - by);

// ---- the board ----
const START: [number, number] = [1, ROWS >> 1];

function blob(tiles: Tile[], s: { r: number }, t: Terrain, cx: number, cy: number, size: number) {
  const open: [number, number][] = [[cx, cy]];
  for (let n = 0; open.length && n < size;) {
    const [x, y] = open.splice(Math.floor(rnd(s) * open.length), 1)[0];
    if (!inB(x, y) || tiles[at(x, y)].t === t || dist(x, y, START[0], START[1]) < 2) continue;
    tiles[at(x, y)].t = t; n++;
    for (let d = 0; d < 4; d++) open.push([x + DX[d], y + DY[d]]);
  }
}

function connect(tiles: Tile[]) {
  for (;;) {
    const reach = new Set([at(START[0], START[1])]), open = [START];
    while (open.length) {
      const [x, y] = open.pop()!;
      for (let d = 0; d < 4; d++) {
        const nx = x + DX[d], ny = y + DY[d];
        if (inB(nx, ny) && tiles[at(nx, ny)].t !== 'rock' && !reach.has(at(nx, ny))) { reach.add(at(nx, ny)); open.push([nx, ny]); }
      }
    }
    const stuck = tiles.findIndex((t, i) => t.t !== 'rock' && !reach.has(i));
    if (stuck < 0) return;
    const rock = tiles.findIndex((t) => t.t === 'rock');
    if (rock < 0) return;
    tiles[rock].t = 'sand';
  }
}

function board(seed: number) {
  const s = { r: seed | 0 };
  const tiles: Tile[] = Array.from({ length: COLS * ROWS }, () => ({ t: 'sand' as Terrain, node: null, seen: false }));
  const nearY = START[1] + (rnd(s) < 0.5 ? -2 : 2);
  blob(tiles, s, 'mud', 2, nearY, 9);
  blob(tiles, s, 'mud', 5 + Math.floor(rnd(s) * 2), rnd(s) < 0.5 ? 1 : ROWS - 2, 10);
  blob(tiles, s, 'mud', 8, ROWS >> 1, 8);
  blob(tiles, s, 'dead', COLS - 2, rnd(s) < 0.5 ? 1 : ROWS - 2, 11);
  const all = tiles.map((_, i) => i);
  for (const i of shuffled(s, all).filter((k) => tiles[k].t === 'sand' && dist(...xy(k), START[0], START[1]) > 1).slice(0, 6)) tiles[i].t = 'rock';
  connect(tiles);
  const put = (node: NodeId, n: number, fit: (i: number) => boolean) => {
    for (const i of shuffled(s, all).filter((k) => !tiles[k].node && fit(k)).slice(0, n)) tiles[i].node = node;
  };
  const open = (i: number) => tiles[i].t === 'sand' && i !== at(START[0], START[1]);
  const from = (i: number) => dist(...xy(i), START[0], START[1]);
  put('mat', 3, (i) => open(i) && from(i) <= 3);
  put('mat', NODES.mat.count - 3, open);
  put('buried', 3, (i) => tiles[i].t === 'mud' && from(i) <= 5);
  put('buried', NODES.buried.count - 3, (i) => tiles[i].t === 'mud');
  put('bloom', NODES.bloom.count, (i) => tiles[i].t === 'dead');
  put('shell', NODES.shell.count, (i) => open(i) && from(i) >= 3);
  put('sponge', NODES.sponge.count, (i) => open(i) && from(i) >= 4);
  put('carcass', NODES.carcass.count, (i) => open(i) && from(i) >= 5);
  const sand = shuffled(s, all).find((i) => tiles[i].t === 'sand' && xy(i)[0] >= 6) ?? at(COLS - 2, 3);
  const [rx, ry] = xy(sand);
  return { tiles, entry: [COLS - 1, Math.floor(rnd(s) * ROWS)] as [number, number], rival: { x: rx, y: ry } };
}

// ---- the body ----
function segmentSlots(seg: number): Slot[] {
  return [{ kind: 'side', side: 'left', seg, part: null }, { kind: 'side', side: 'right', seg, part: null }];
}
const count = (l: Life, id: PartId) => l.slots.reduce((n, s) => n + (s.part === id ? 1 : 0), 0);
export const has = (l: Life, id: PartId) => count(l, id) > 0;
export const tile = (l: Life, x = l.x, y = l.y) => l.tiles[at(x, y)];
export const isLow = (turn: number) => turn >= LOW_OXYGEN[0] && turn <= LOW_OXYGEN[1];
const onMud = (l: Life) => tile(l).t === 'mud';
const buriedAt = (l: Life, x: number, y: number) => l.plan === 'worm' && tile(l, x, y).t === 'mud';

export const upkeep = (l: Life) => (has(l, 'deep') && onMud(l) ? 0 : RULE.baseUpkeep + l.slots.reduce((n, s) => n + (s.part ? PARTS[s.part].upkeep : 0), 0));
export const oxygenMax = (l: Life) => RULE.oxygen + count(l, 'gill') * RULE.gillOxygen;
export const range = (l: Life) => Math.min(RULE.maxRange, PLANS[l.plan].range + count(l, 'leg'));
export const sense = (l: Life) => PLANS[l.plan].sense + count(l, 'eye') * RULE.eyeSense + count(l, 'compound') * RULE.compoundSense;
export const clutch = (l: Life) => (1 + count(l, 'pouch')) * (1 + Math.floor(l.segments / RULE.clutchStep)) + (has(l, 'deep') && onMud(l) ? 1 : 0);
export const moultCost = (l: Life) => l.segments + PLANS[l.plan].moultExtra;
export const canMoult = (l: Life) => l.phase === 'play' && !l.moulted && l.segments < PLANS[l.plan].maxSegments && l.food >= moultCost(l);
export const canLay = (l: Life) => l.phase === 'play' && l.food >= RULE.layCost;
export const foraging = (xp: number) => (xp >= RULE.foragingAt ? 2 : 1);
export const tierOf = (eggs: number) => TIERS.find(([, n]) => eggs >= n)![0];
export const nextTier = (eggs: number) => [...TIERS].reverse().find(([, n]) => eggs < n) ?? null;
const hasReach = (l: Life) => has(l, 'claw') || has(l, 'proboscis') || has(l, 'hook');

/** What stops you eating this node, or null. */
export function lockOf(l: Life, node: NodeId): string | null {
  if (node === 'buried') return l.plan === 'worm' || has(l, 'digger') ? null : 'needs a digging limb';
  if (node === 'shell') return has(l, 'claw') || has(l, 'hook') ? null : l.plan === 'worm' ? 'needs a hooked proboscis (rare)' : 'needs a crushing claw';
  if (node === 'carcass') return l.segments >= RULE.carcassSize ? null : `needs size ${RULE.carcassSize}, you are ${l.segments}`;
  if (node === 'sponge') return foraging(l.xp) >= 2 ? null : `needs Foraging 2 (${l.xp}/${RULE.foragingAt} food eaten, across Lives)`;
  return null;
}
export const known = (t: Tile) => t.t !== 'mud' || t.seen;

function reveal(l: Life) {
  const R = sense(l);
  l.tiles.forEach((t, i) => { const [x, y] = xy(i); if (Math.max(Math.abs(x - l.x), Math.abs(y - l.y)) <= R) t.seen = true; });
}
const say = (l: Life, m: string) => { l.log.push(m); if (l.log.length > 5) l.log.shift(); };

// ---- starting a Life ----
export const newLineage = (): Lineage => ({ xp: 0, rare: [], best: { worm: 0, arthropod: 0 }, lives: 0 });

export function newLife(seed: number, plan: PlanId, lineage: Lineage): Life {
  const b = board(seed), P = PLANS[plan], slots: Slot[] = [];
  for (let k = 0; k < P.headSlots; k++) slots.push({ kind: 'head', side: 'front', seg: -1, part: null });
  slots.push({ kind: 'tail', side: 'back', seg: 99, part: null });
  for (let k = 0; k < P.segments; k++) slots.push(...segmentSlots(k));
  const r = { r: (seed ^ 0x5bd1e995) | 0 };
  const l: Life = {
    seed, plan, lineage, r: r.r, tiles: b.tiles, x: START[0], y: START[1], facing: 1, entry: b.entry, rival: b.rival,
    turn: 1, food: RULE.startFood, oxygen: RULE.oxygen, health: RULE.health, eggs: 0, xp: lineage.xp, eaten: 0,
    segments: P.segments, slots, order: [], phase: 'build', held: null, offers: [], moults: 0, rareAt: 2 + Math.floor(rnd(r) * 2),
    rareGot: null, rarePassed: false, moulted: false, soft: false, moved: false, pred: null, cause: null, log: [],
  };
  l.r = r.r;
  reveal(l);
  return l;
}
export const starterPool = (l: Life) => PART_IDS.filter((id) => PARTS[id].plans.includes(l.plan) && (!PARTS[id].rare || l.lineage.rare.includes(id)));
const placed = (l: Life) => l.slots.filter((s) => s.part).length;
export const startersLeft = (l: Life) => RULE.starters - placed(l);
export const fits = (l: Life, part: PartId, slot: number) => PARTS[part].slots.includes(l.slots[slot].kind);

export function begin(l: Life) {
  if (l.phase !== 'build') return;
  l.phase = 'play'; l.held = null; l.oxygen = oxygenMax(l); reveal(l);
  say(l, 'Goal: lay as many eggs as you can before the season ends.');
}

/** Put the held part in a slot, in the build or at a moult. In the build, an empty hand clears a filled slot. */
export function placeAt(l: Life, slot: number) {
  const s = l.slots[slot];
  if (!s) return;
  if (l.phase === 'build' && !l.held && s.part) { s.part = null; l.order = l.order.filter((k) => k !== slot); return; }
  const part = l.held;
  if (!part || !fits(l, part, slot) || (l.phase !== 'build' && l.phase !== 'offer')) return;
  if (l.phase === 'build' && !s.part && startersLeft(l) <= 0) return;
  l.order = l.order.filter((k) => k !== slot);
  s.part = part; l.order.push(slot); l.held = null;
  if (l.phase === 'offer') {
    l.phase = 'play'; l.offers = [];
    if (PARTS[part].rare) { l.rareGot = part; l.rarePassed = false; say(l, `Rare: ${PARTS[part].name}. Lay an egg to pass it on, or it dies with you.`); }
    reveal(l);
  }
  l.oxygen = Math.min(l.oxygen, oxygenMax(l));
}

/** Pay food, grow a segment, get offers. The turn doesn't end; only one moult a turn. */
export function moult(l: Life) {
  if (!canMoult(l)) return;
  l.food -= moultCost(l);
  l.slots.push(...segmentSlots(l.segments));
  l.segments++; l.moults++; l.moulted = true; l.soft = PLANS[l.plan].soft;
  const s = { r: l.r };
  l.offers = shuffled(s, PART_IDS.filter((id) => !PARTS[id].rare && PARTS[id].plans.includes(l.plan))).slice(0, 3);
  if (l.moults === l.rareAt && !l.rareGot) {
    const rare = shuffled(s, PART_IDS.filter((id) => PARTS[id].rare && PARTS[id].plans.includes(l.plan) && !has(l, id) && !l.lineage.rare.includes(id)));
    if (rare[0]) l.offers.push(rare[0]);
  }
  l.r = s.r; l.phase = 'offer'; l.held = null;
}

// ---- moving ----
export interface Dest { i: number; dir: Dir; grab: boolean; path: number[] }

export function dests(l: Life): Map<number, Dest> {
  const out = new Map<number, Dest>();
  if (l.phase !== 'play') return out;
  const worm = l.plan === 'worm', predAt = l.pred ? at(l.pred.x, l.pred.y) : -1;
  for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
    const max = worm ? 1 + (onMud(l) ? count(l, 'chaetae') : 0) : range(l);
    const path: number[] = [];
    let x = l.x, y = l.y;
    for (let k = 1; k <= max; k++) {
      x += DX[d]; y += DY[d];
      if (!inB(x, y)) break;
      const i = at(x, y), t = l.tiles[i];
      if (t.t === 'rock' || i === predAt || (worm && k > 1 && t.t !== 'mud')) break;
      path.push(i);
      out.set(i, { i, dir: d, grab: false, path: path.slice() });
      if (!worm && t.t === 'mud') break;
    }
  }
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
  if (lock) { say(l, `${NODES[t.node].name} ${lock}.`); return; }
  const f = NODES[t.node].food + count(l, 'gut');
  say(l, `${NODES[t.node].name}: +${f} food.`);
  l.food += f; l.xp += f; l.eaten += f; t.node = null;
}

export function move(l: Life, i: number) {
  const d = dests(l).get(i);
  if (!d) return;
  if (!d.grab) { [l.x, l.y] = xy(i); l.facing = d.dir; }
  l.moved = !d.grab;
  eat(l, i);
  world(l);
}
export function lay(l: Life) {
  if (!canLay(l)) return;
  const n = clutch(l);
  l.food -= RULE.layCost; l.eggs += n; l.moved = false;
  say(l, `Laid ${n} egg${n > 1 ? 's' : ''}.`);
  if (l.rareGot && !l.rarePassed) { l.rarePassed = true; say(l, `${PARTS[l.rareGot].name} passed on: it joins your lineage.`); }
  world(l);
}
export function stay(l: Life, dir: Dir = l.facing) {
  if (l.phase !== 'play') return;
  l.facing = dir; l.moved = false;
  world(l);
}

// ---- strikes ----
export interface Hit { side: Side; kind: 'buried' | 'enrolled' | 'blocked' | 'hit'; part?: PartId; tear: number; damage: number }

/** What a strike from `dir` would do to you at (x, y), facing `facing`. */
export function hitOn(l: Life, dir: Dir, facing: Dir, moved: boolean, x: number, y: number): Hit {
  const side = SIDES[(dir - facing + 4) % 4];
  if (buriedAt(l, x, y)) return { side, kind: 'buried', tear: -1, damage: 0 };
  if (has(l, 'enrol') && !moved) return { side, kind: 'enrolled', tear: -1, damage: 0 };
  const guard = l.slots.find((s) => s.side === side && s.part && PARTS[s.part].guard);
  if (guard) return { side, kind: 'blocked', part: guard.part!, tear: -1, damage: 0 };
  let tear = -1;
  l.slots.forEach((s, k) => { if (s.side === side && s.part) tear = k; });
  return { side, kind: 'hit', part: tear >= 0 ? l.slots[tear].part! : undefined, tear, damage: (tear < 0 ? 1 : 0) + (l.soft ? 1 : 0) };
}

function strike(l: Life) {
  const p = l.pred!;
  p.state = 'rest'; p.rest = RULE.restAfterStrike;
  if (!p.marks.includes(at(l.x, l.y))) { say(l, 'The strike misses.'); p.marks = []; return; }
  p.marks = [];
  const h = hitOn(l, p.dir, l.facing, l.moved, l.x, l.y);
  if (h.kind === 'buried') say(l, 'You are buried: the strike misses.');
  else if (h.kind === 'enrolled') say(l, 'You roll up: the strike glances off.');
  else if (h.kind === 'blocked') {
    say(l, `Your ${PARTS[h.part!].name.toLowerCase()} blocks a strike on your ${h.side}.`);
    if (h.part === 'spine') p.rest = RULE.restAfterSpine;
  } else {
    if (h.tear >= 0) { say(l, `Hit on your ${h.side}: your ${PARTS[h.part!].name.toLowerCase()} is torn off.`); l.slots[h.tear].part = null; l.order = l.order.filter((k) => k !== h.tear); }
    if (h.damage) { say(l, `Hit on your ${h.side}: −${h.damage} health${l.soft ? ' (soft from moulting)' : ''}.`); l.health -= h.damage; }
  }
}

function predatorStep(l: Life) {
  const p = l.pred;
  if (!p) return;
  if (p.state === 'strike') { strike(l); return; }
  if (p.state === 'rest') { if (--p.rest <= 0) p.state = 'hunt'; return; }
  const hidden = buriedAt(l, l.x, l.y);
  if (!hidden) { p.lx = l.x; p.ly = l.y; }
  for (let k = 0; k < RULE.predatorSteps && dist(p.x, p.y, p.lx, p.ly) > 1; k++) {
    const dx = p.lx - p.x, dy = p.ly - p.y;
    if (Math.abs(dx) >= Math.abs(dy)) p.x += Math.sign(dx); else p.y += Math.sign(dy);
  }
  if (hidden || dist(p.x, p.y, l.x, l.y) !== 1) return;
  p.dir = (p.y < l.y ? 0 : p.x > l.x ? 1 : p.y > l.y ? 2 : 3) as Dir;
  const across = p.dir % 2 === 0 ? 1 : 0; // the strike sweeps sideways: step away along its line, or get clear of it
  p.marks = [[0, 0], [DX[across], DY[across]], [-DX[across], -DY[across]]]
    .map(([ox, oy]) => [l.x + ox, l.y + oy]).filter(([x, y]) => inB(x, y) && tile(l, x, y).t !== 'rock').map(([x, y]) => at(x, y));
  p.state = 'strike';
  say(l, `The predator marks a strike from the ${['north', 'east', 'south', 'west'][p.dir]}.`);
}

function rivalStep(l: Life) {
  const v = l.rival;
  let best = -1, bd = 1e9;
  l.tiles.forEach((t, i) => { if (t.node === 'mat') { const d = dist(v.x, v.y, ...xy(i)); if (d < bd) { bd = d; best = i; } } });
  if (best < 0) return;
  const [tx, ty] = xy(best), dx = Math.sign(tx - v.x), dy = Math.sign(ty - v.y);
  const tries = Math.abs(tx - v.x) >= Math.abs(ty - v.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
  for (const [ox, oy] of tries) {
    if ((ox || oy) && inB(v.x + ox, v.y + oy) && tile(l, v.x + ox, v.y + oy).t !== 'rock') { v.x += ox; v.y += oy; break; }
  }
  const t = tile(l, v.x, v.y);
  if (t.node === 'mat') t.node = null;
}

// ---- the world's turn ----
function hurtOrShed(l: Life, why: string) {
  const k = l.order.pop();
  if (k !== undefined && l.slots[k].part) { say(l, `${why}: your body absorbs its ${PARTS[l.slots[k].part!].name.toLowerCase()}.`); l.slots[k].part = null; return; }
  say(l, `${why}: −1 health.`); l.health -= 1;
}

function world(l: Life) {
  l.food -= upkeep(l);
  if (l.food < 0) { l.food = 0; hurtOrShed(l, 'Starving'); }
  if (tile(l).t === 'dead' || isLow(l.turn)) {
    l.oxygen -= 1;
    if (l.oxygen < 0) { l.oxygen = 0; say(l, 'No oxygen: −1 health.'); l.health -= 1; }
  } else l.oxygen = Math.min(oxygenMax(l), l.oxygen + 1);
  rivalStep(l);
  predatorStep(l);
  l.soft = false; l.moulted = false;
  reveal(l);
  if (l.health <= 0) { l.health = 0; l.phase = 'over'; l.cause = 'died'; say(l, `You died on turn ${l.turn}.`); return; }
  l.turn++;
  if (l.turn === PREDATOR_AT) {
    l.pred = { x: l.entry[0], y: l.entry[1], state: 'hunt', rest: 0, marks: [], dir: 1, lx: l.x, ly: l.y };
    say(l, 'The predator arrives.');
  }
  if (l.turn > TURNS) { l.turn = TURNS; l.phase = 'over'; l.cause = 'season'; say(l, 'The season ends.'); }
}

/** The Life's result on the lineage: food eaten counts even if you die; a rare part only if it was passed on. */
export function finish(l: Life): Lineage {
  const v = l.lineage;
  return {
    xp: l.xp, lives: v.lives + 1, best: { ...v.best, [l.plan]: Math.max(v.best[l.plan], l.eggs) },
    rare: l.rareGot && l.rarePassed && !v.rare.includes(l.rareGot) ? [...v.rare, l.rareGot] : v.rare,
  };
}
