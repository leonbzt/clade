// Toy: the living garden, the one door between the garden and the Life. The garden writes a board as plain data (boardFor), the Life hands
// back a result (resultOf). This is the only file that knows both sides; the Life's rules run the same on any board.
import { BOARD, ROLE_OF_NODE, type Role } from './garden-data';
import { COLS, ROWS, TURNS, type NodeId, type PlanId } from './life2-data';
import { CELL, HABITATS, NO_PREDATOR, type Habitat, type HabitatId, type RivalSpec } from './life2-habitats';
import { popOf, rowOf, type Garden, type LifeResult } from './garden-sim';
import type { Life } from './life2-sim';

const hash = (x: number, y: number, salt: number) => {
  let t = Math.imul(x * 73856093 ^ y * 19349663 ^ salt * 83492791, 0x5bd1e995);
  t ^= t >>> 13;
  return (t >>> 0) / 4294967296;
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
type Grid = string[][];
const cells = (grid: Grid) => grid.flatMap((row, y) => row.map((c, x) => ({ x, y, c })));
const dist = (ax: number, ay: number, bx: number, by: number) => Math.abs(ax - bx) + Math.abs(ay - by);

/** Keep a share of one node kind. The same spots go first and come back first, so the map stays learnable. Above 1 it adds on free ground. */
function follow(grid: Grid, node: string, ground: string, share: number, salt: number, safe: (x: number, y: number) => boolean) {
  const have = cells(grid).filter((k) => k.c === node && !safe(k.x, k.y)).sort((a, b) => hash(a.x, a.y, salt) - hash(b.x, b.y, salt));
  const want = Math.round(have.length * share);
  for (const k of have.slice(want)) grid[k.y][k.x] = ground;
  if (want <= have.length) return;
  const free = cells(grid).filter((k) => k.c === ground && !safe(k.x, k.y)).sort((a, b) => hash(a.x, a.y, salt) - hash(b.x, b.y, salt));
  for (const k of free.slice(0, want - have.length)) grid[k.y][k.x] = node;
}

/** Oxygen below normal: dead water spreads from what's already dead, or from the corner far from the start. Above normal: it shrinks. */
function shiftDeadWater(grid: Grid, by: number, hab: Habitat) {
  const NEAR = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const dead = (c: string | undefined) => c === '%' || c === 'o' || c === 'C';
  const fixed = (x: number, y: number) => dist(x, y, hab.start[0], hab.start[1]) <= BOARD.safeRange || (x === hab.entry[0] && y === hab.entry[1]);
  for (let n = 0; n < Math.abs(by); n++) {
    const all = cells(grid), touching = (want: boolean) => all.filter((k) => dead(k.c) !== want && k.c !== '#' && !fixed(k.x, k.y) && NEAR.some(([dx, dy]) => dead(grid[k.y + dy]?.[k.x + dx]) === want && grid[k.y + dy]?.[k.x + dx] !== undefined));
    if (by > 0) {
      let edge = touching(true);
      if (!edge.length) edge = all.filter((k) => k.c !== '#' && !fixed(k.x, k.y)).sort((a, b) => dist(b.x, b.y, hab.start[0], hab.start[1]) - dist(a.x, a.y, hab.start[0], hab.start[1])).slice(0, 1);
      if (!edge.length) return;
      const k = edge.sort((a, b) => hash(a.x, a.y, 7) - hash(b.x, b.y, 7))[0];
      grid[k.y][k.x] = k.c === 'm' || k.c === 'b' ? 'o' : k.c === 'c' ? 'C' : '%';
    } else {
      const edge = touching(false).filter((k) => dead(k.c));
      if (!edge.length) return;
      const k = edge.sort((a, b) => hash(a.x, a.y, 7) - hash(b.x, b.y, 7)).at(-1)!;
      grid[k.y][k.x] = k.c === 'o' ? 'm' : k.c === 'C' ? 'c' : '.';
    }
  }
}

function freeSpot(grid: Grid, hab: Habitat, salt: number): [number, number] {
  const spots = cells(grid).filter((k) => k.c !== '#' && dist(k.x, k.y, hab.start[0], hab.start[1]) >= 5).sort((a, b) => hash(a.x, a.y, salt) - hash(b.x, b.y, salt));
  return spots[0] ? [spots[0].x, spots[0].y] : [COLS - 1, ROWS - 1];
}

/** Who you'll meet. At normal: the habitat's authored rival, named after the top resident of its role. A crowded role sends a second one, a
 * crashed role sends none, and your own line shows up once it leads a role. */
function rivalsFor(g: Garden, id: HabitatId, grid: Grid): RivalSpec[] {
  const base = HABITATS[id], h = g.habs[id], normal = g.normal[id], out: RivalSpec[] = [];
  const blooms = cells(grid).filter((k) => k.c === 'o').length, mats = cells(grid).filter((k) => k.c === 'm').length;
  for (const role of ['grazer', 'burrower'] as Role[]) {
    const top = rowOf(h, role)[0], P = popOf(h, role), N = normal.pops[role], authored = base.rivals.find((v) => ROLE_OF_NODE[v.eats] === role);
    if (!top || P < BOARD.rivalAt || P < N * BOARD.rivalGone) continue;
    const crowded = P > N * BOARD.secondRival, count = (authored ? 1 : 0) + (crowded ? 1 : 0);
    const eats = authored?.eats ?? (role === 'burrower' ? 'buried' : blooms > mats ? 'bloom' : 'mat');
    const spec = { name: top.line ? `your own ${top.name.replace('Your ', '')}` : top.name, eats, yours: !!top.line };
    for (let k = 0; k < count; k++) out.push({ ...spec, at: k === 0 && authored ? authored.at : freeSpot(grid, base, out.length + 11) });
  }
  return out.slice(0, BOARD.maxRivals);
}

/** The board this habitat would give you right now. The map is the habitat's; what's on it comes from the garden. */
export function boardFor(g: Garden, id: HabitatId): Habitat {
  const base = HABITATS[id], h = g.habs[id], normal = g.normal[id];
  const grid: Grid = base.map.map((row) => [...row]);
  const share = (now: number, was: number) => (was > 0 ? clamp(now / was, BOARD.minShare, BOARD.maxShare) : 1);
  const skip = (x: number, y: number) => dist(x, y, base.start[0], base.start[1]) <= BOARD.safeRange || (x === base.entry[0] && y === base.entry[1]);
  const off = normal.oxygen - h.oxygen, past = Math.sign(off) * Math.max(0, Math.abs(off) - BOARD.deadBand);
  shiftDeadWater(grid, clamp(Math.round(past / BOARD.oxygenPerTile), -BOARD.maxDeadShift, BOARD.maxDeadShift), base);
  const mats = share(h.mats, normal.mats), rot = share(h.detritus, normal.detritus), filter = share(popOf(h, 'filter'), normal.pops.filter);
  follow(grid, 'm', '.', mats, 1, skip);
  follow(grid, 'o', '%', mats, 2, skip);
  follow(grid, 'b', '~', rot, 3, skip);
  follow(grid, 's', '.', filter, 4, skip);
  follow(grid, 'g', '.', filter, 5, skip);
  if (rot < BOARD.carcassShare) { follow(grid, 'c', '.', 0, 6, skip); follow(grid, 'C', '%', 0, 6, skip); }
  // the hunter: the top predator that isn't you; more of them arrive sooner
  const hunter = rowOf(h, 'predator').find((e) => !e.line);
  const P = popOf(h, 'predator'), hunted = !!hunter && hunter.pop >= BOARD.predatorAt;
  const shift = normal.pops.predator > 0 ? Math.round(Math.log2(Math.max(P, 0.5) / normal.pops.predator) * BOARD.spread) : 0;
  return {
    ...base, map: grid.map((row) => row.join('')), rivals: rivalsFor(g, id, grid),
    predator: hunted ? hunter!.name : 'none', predatorAt: hunted ? clamp(base.predatorAt - shift, BOARD.earliest, Math.min(BOARD.latest, TURNS)) : NO_PREDATOR,
  };
}

const count = (b: Habitat, nodes: string) => [...b.map.join('')].filter((c) => nodes.includes(c)).length;
export const boardFacts = (b: Habitat) => ({
  mats: count(b, 'mo'), buried: count(b, 'b'), shells: count(b, 's'), sponges: count(b, 'g'), carcasses: count(b, 'cC'), dead: count(b, '%oC'),
  rivals: b.rivals.length, predator: b.predatorAt === NO_PREDATOR ? null : { name: b.predator, turn: b.predatorAt }, yours: b.rivals.some((v) => v.yours),
});

/** What changed on the board, in words: "3 fewer mats, Peytoia now on turn 4". Empty if nothing did. */
export function boardChange(before: Habitat, after: Habitat): string {
  const a = boardFacts(before), b = boardFacts(after), out: string[] = [];
  const n = (key: 'mats' | 'buried' | 'shells' | 'sponges' | 'carcasses', one: string, many: string) => {
    const d = b[key] - a[key];
    if (d) out.push(`${Math.abs(d)} ${d > 0 ? 'more' : 'fewer'} ${Math.abs(d) === 1 ? one : many}`);
  };
  n('mats', 'mat', 'mats'); n('buried', 'buried food', 'buried food'); n('shells', 'shell bed', 'shell beds'); n('sponges', 'sponge garden', 'sponge gardens'); n('carcasses', 'carcass', 'carcasses');
  if (b.dead !== a.dead) out.push(`dead water ${b.dead > a.dead ? 'spreading' : 'shrinking'}`);
  if (!a.predator && b.predator) out.push(`${b.predator.name} is back, on turn ${b.predator.turn}`);
  else if (a.predator && !b.predator) out.push('no predator now');
  else if (a.predator && b.predator && (a.predator.turn !== b.predator.turn || a.predator.name !== b.predator.name)) out.push(`${b.predator.name} on turn ${b.predator.turn}`);
  if (!a.yours && b.yours) out.push('your own line is among the rivals');
  return out.join(', ');
}

/** What the Life tells the garden: the eggs, and the role its diet earned. */
export function resultOf(l: Life): LifeResult {
  return { hab: l.hab.id, plan: l.plan, eggs: l.eggs, role: roleFromDiet(l.ate, l.plan) };
}
export function roleFromDiet(ate: Partial<Record<NodeId, number>>, plan: PlanId): Role {
  const by: Partial<Record<Role, number>> = {};
  for (const [node, food] of Object.entries(ate) as [NodeId, number][]) by[ROLE_OF_NODE[node]] = (by[ROLE_OF_NODE[node]] ?? 0) + food;
  const best = (Object.entries(by) as [Role, number][]).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : plan === 'worm' ? 'burrower' : 'grazer';
}

export const boardIsValid = (b: Habitat) => b.map.length === ROWS && b.map.every((row) => row.length === COLS && [...row].every((c) => CELL[c]));
