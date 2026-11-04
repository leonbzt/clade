// Toy: a Life, v2, the rules (no DOM). One creature on a fixed habitat board: move, eat, grow up, lay eggs, dodge one predator.
import { COLS, NODES, PARTS, PART_IDS, PLANS, ROWS, RULE, TURNS, type NodeId, type PartId, type PlanId, type SlotKind, type Terrain } from './life2-data';
import { CELL, type Habitat, type HabitatId } from './life2-habitats';

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
export interface Rec { eggs: number; parts: PartId[] }
export interface HabRec { pop: number; lives: number; best: Partial<Record<PlanId, Rec>> }
export interface Lineage { xp: number; rare: PartId[]; lives: number; habs: Partial<Record<HabitatId, HabRec>> }
export interface Life {
  seed: number; plan: PlanId; hab: Habitat; lineage: Lineage; r: number;
  tiles: Tile[]; x: number; y: number; facing: Dir; rivals: { x: number; y: number; name: string; eats: NodeId; yours: boolean }[];
  turn: number; food: number; oxygen: number; health: number; eggs: number; xp: number; eaten: number; ate: Partial<Record<NodeId, number>>;
  size: number; slots: Slot[]; order: number[]; laidWith: PartId[];
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

// ---- the body ----
const count = (l: Life, id: PartId) => l.slots.reduce((n, s) => n + (s.part === id ? 1 : 0), 0);
export const has = (l: Life, id: PartId) => count(l, id) > 0;
export const tile = (l: Life, x = l.x, y = l.y) => l.tiles[at(x, y)];
const onMud = (l: Life) => tile(l).t === 'mud';
const buriedAt = (l: Life, x: number, y: number) => l.plan === 'worm' && tile(l, x, y).t === 'mud';
export const partsOn = (l: Life) => l.slots.flatMap((s) => (s.part ? [s.part] : []));
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
export const foraging = (xp: number) => (xp >= RULE.foragingAt ? 2 : 1);
export const tierOf = (h: Habitat, eggs: number) => h.tiers.find(([, n]) => eggs >= n)![0];
export const nextTier = (h: Habitat, eggs: number) => [...h.tiers].reverse().find(([, n]) => eggs < n) ?? null;
const hasReach = (l: Life) => has(l, 'claw') || has(l, 'proboscis') || has(l, 'hook');

/** What stops you eating this node, or null. */
export function lockOf(l: Life, node: NodeId): string | null {
  if (node === 'buried') return l.plan === 'worm' || has(l, 'digger') ? null : 'needs a digging limb';
  if (node === 'shell') return has(l, 'claw') || has(l, 'hook') ? null : l.plan === 'worm' ? 'needs a hooked proboscis (rare)' : 'needs a crushing claw';
  if (node === 'carcass') return l.size >= RULE.carcassSize ? null : `needs size ${RULE.carcassSize}, you are ${l.size}`;
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
export const newLineage = (): Lineage => ({ xp: 0, rare: [], lives: 0, habs: {} });
export const habRec = (v: Lineage, id: HabitatId): HabRec => v.habs[id] ?? { pop: 0, lives: 0, best: {} };

export function newLife(seed: number, plan: PlanId, lineage: Lineage, hab: Habitat): Life {
  const P = PLANS[plan], slots: Slot[] = [];
  const tiles: Tile[] = hab.map.join('').split('').map((c) => { const [t, node] = CELL[c]; return { t, node, seen: false }; });
  for (let k = 0; k < P.head; k++) slots.push({ kind: 'head', side: 'front', seg: -1, part: null });
  slots.push({ kind: 'tail', side: 'back', seg: 99, part: null });
  for (let k = 0; k < P.pairs; k++) slots.push({ kind: 'side', side: 'left', seg: k, part: null }, { kind: 'side', side: 'right', seg: k, part: null });
  const r = { r: (seed ^ 0x5bd1e995) | 0 };
  const l: Life = {
    seed, plan, hab, lineage, r: r.r, tiles, x: hab.start[0], y: hab.start[1], facing: 1, rivals: hab.rivals.map((v) => ({ x: v.at[0], y: v.at[1], name: v.name, eats: v.eats, yours: !!v.yours })),
    turn: 1, food: RULE.startFood, oxygen: RULE.oxygen, health: RULE.health, eggs: 0, xp: lineage.xp, eaten: 0, ate: {},
    size: 1, slots, order: [], laidWith: [], phase: 'build', held: null, offers: [], moults: 0, rareAt: 2 + Math.floor(rnd(r) * 2),
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

/** Start with a rare part the garden threw up. It passes on the usual way: lay an egg. */
export function giveVariant(l: Life, part: PartId) {
  const k = l.slots.findIndex((s, i) => !s.part && fits(l, part, i));
  if (k < 0) return;
  l.slots[k].part = part; l.order.push(k); l.rareGot = part; l.rarePassed = false;
}

export function begin(l: Life) {
  if (l.phase !== 'build') return;
  l.phase = 'play'; l.held = null; l.oxygen = oxygenMax(l); reveal(l);
  say(l, `Grow up: you can lay from size ${RULE.adultSize}.`);
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

/** Pay food, grow a size, get offers. The turn doesn't end; only one moult a turn. Size 5 finishes the body. */
export function moult(l: Life) {
  if (!canMoult(l)) return;
  l.food -= moultCost(l);
  l.size++; l.moults++; l.moulted = true; l.soft = PLANS[l.plan].soft;
  if (l.size === RULE.adultSize) say(l, 'You are an adult: you can lay eggs now.');
  if (l.size === RULE.maxSize) { l.health = RULE.health; say(l, 'Full grown: your body is finished and your wounds close.'); }
  const s = { r: l.r };
  l.offers = shuffled(s, PART_IDS.filter((id) => !PARTS[id].rare && PARTS[id].plans.includes(l.plan))).slice(0, 3);
  if (l.moults >= l.rareAt && !l.rareGot) {
    const rare = l.hab.rares[l.plan].find((id) => !has(l, id) && !l.lineage.rare.includes(id));
    if (rare) l.offers.push(rare);
  }
  l.r = s.r; l.phase = 'offer'; l.held = null;
}

// ---- moving ----
export interface Dest { i: number; dir: Dir; grab: boolean; path: number[] }

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
  if (lock) { say(l, `${NODES[t.node].name} ${lock}.`); return; }
  const before = foraging(l.xp), f = NODES[t.node].food * (t.node === 'bloom' && has(l, 'symbiont') ? 2 : 1) + count(l, 'gut') * RULE.gutFood;
  say(l, `${NODES[t.node].name}: +${f} food.`);
  l.food += f; l.xp += f; l.eaten += f; l.ate[t.node] = (l.ate[t.node] ?? 0) + f; t.node = null;
  if (before < 2 && foraging(l.xp) >= 2) say(l, 'Foraging 2: sponge gardens are open!');
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
  l.food -= RULE.layCost; l.eggs += n; l.moved = false; l.laidWith = partsOn(l);
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

/** One step toward (tx, ty), swimming over rock but never into dead water: it heads for the nearest tile it can reach. */
function predatorMove(l: Life, p: Predator, tx: number, ty: number) {
  const from = new Map<number, number>([[at(p.x, p.y), -1]]), open = [at(p.x, p.y)];
  let goal = open[0], gd = dist(p.x, p.y, tx, ty);
  while (open.length) {
    const i = open.shift()!, [x, y] = xy(i);
    const dd = dist(x, y, tx, ty);
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
  while (from.get(step) !== -1 && from.get(step) !== at(p.x, p.y)) step = from.get(step)!;
  if (step !== at(p.x, p.y)) [p.x, p.y] = xy(step);
}

function predatorStep(l: Life) {
  const p = l.pred;
  if (!p) return;
  if (p.state === 'strike') { strike(l); return; }
  if (p.state === 'rest') { if (--p.rest <= 0) p.state = 'hunt'; return; }
  const hidden = buriedAt(l, l.x, l.y);
  if (!hidden) { p.lx = l.x; p.ly = l.y; }
  for (let k = 0; k < RULE.predatorSteps && dist(p.x, p.y, p.lx, p.ly) > 1; k++) predatorMove(l, p, p.lx, p.ly);
  if (hidden || dist(p.x, p.y, l.x, l.y) !== 1) return;
  p.dir = (p.y < l.y ? 0 : p.x > l.x ? 1 : p.y > l.y ? 2 : 3) as Dir;
  const across = p.dir % 2 === 0 ? 1 : 0; // the strike sweeps sideways: step away along its line, or get clear of it
  p.marks = [[0, 0], [DX[across], DY[across]], [-DX[across], -DY[across]]]
    .map(([ox, oy]) => [l.x + ox, l.y + oy]).filter(([x, y]) => inB(x, y) && tile(l, x, y).t !== 'rock').map(([x, y]) => at(x, y));
  p.state = 'strike';
  say(l, `${l.hab.predator} marks a strike from the ${['north', 'east', 'south', 'west'][p.dir]}.`);
}

function rivalStep(l: Life, v: Life['rivals'][number]) {
  let best = -1, bd = 1e9;
  l.tiles.forEach((t, i) => { if (t.node === v.eats) { const d = dist(v.x, v.y, ...xy(i)); if (d < bd) { bd = d; best = i; } } });
  if (best < 0) return;
  const [tx, ty] = xy(best), dx = Math.sign(tx - v.x), dy = Math.sign(ty - v.y);
  const tries = Math.abs(tx - v.x) >= Math.abs(ty - v.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
  for (const [ox, oy] of tries) {
    if ((ox || oy) && inB(v.x + ox, v.y + oy) && tile(l, v.x + ox, v.y + oy).t !== 'rock') { v.x += ox; v.y += oy; break; }
  }
  const t = tile(l, v.x, v.y);
  if (t.node === v.eats) t.node = null;
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
  const t = tile(l).t, ev = l.hab.event;
  if (!has(l, 'blood') && (t === 'dead' || (eventOn(l) && (ev.where === 'all' || ev.where === t)))) {
    l.oxygen -= 1;
    if (l.oxygen < 0) { l.oxygen = 0; say(l, 'No oxygen: −1 health.'); l.health -= 1; }
  } else l.oxygen = Math.min(oxygenMax(l), l.oxygen + 1);
  for (const v of l.rivals) rivalStep(l, v);
  predatorStep(l);
  l.soft = false; l.moulted = false;
  reveal(l);
  if (l.health <= 0) { l.health = 0; l.phase = 'over'; l.cause = 'died'; say(l, `You died on turn ${l.turn}.`); return; }
  l.turn++;
  if (l.turn === l.hab.predatorAt) {
    l.pred = { x: l.hab.entry[0], y: l.hab.entry[1], state: 'hunt', rest: 0, marks: [], dir: 1, lx: l.x, ly: l.y };
    say(l, `${l.hab.predator} arrives.`);
  }
  if (ev.name && l.turn === ev.from) say(l, `${ev.name}: ${ev.text}.`);
  if (l.turn > TURNS) { l.turn = TURNS; l.phase = 'over'; l.cause = 'season'; say(l, 'The season ends.'); }
}

/** The Life's result on the lineage: eggs join the habitat's population; a rare part only if it was passed on. */
export function finish(l: Life): Lineage {
  const v = l.lineage, h = habRec(v, l.hab.id), was = h.best[l.plan];
  const best = !was || l.eggs > was.eggs ? { ...h.best, [l.plan]: { eggs: l.eggs, parts: l.laidWith.length ? l.laidWith : partsOn(l) } } : h.best;
  return {
    xp: l.xp, lives: v.lives + 1, habs: { ...v.habs, [l.hab.id]: { pop: h.pop + l.eggs, lives: h.lives + 1, best } },
    rare: l.rareGot && l.rarePassed && !v.rare.includes(l.rareGot) ? [...v.rare, l.rareGot] : v.rare,
  };
}
