// The one door between the garden and the Life (slice 13, ported from toys/garden-board.ts). The garden writes a board as
// plain data (boardFor); the Life hands back a result (resultOf). The only file that knows both sides.
import { BOARD, ROLE_OF_FOOD, type Role } from '../data/garden';
import { HABITATS, NO_PREDATOR, type Habitat, type HabitatId } from '../data/habitats';
import { COLS, ROWS, TURNS, type NodeId, type PartId, type PlanId } from '../data/life';
import type { PreyKind } from '../data/prey';
import { popOf, type Garden, type LifeResult } from './garden';
import type { Life } from './life';

const hash = (x: number, y: number, salt: number) => {
  let t = Math.imul((x * 73856093) ^ (y * 19349663) ^ (salt * 83492791), 0x5bd1e995);
  t ^= t >>> 13;
  return (t >>> 0) / 4294967296;
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
type Grid = string[][];
const cells = (grid: Grid) => grid.flatMap((row, y) => row.map((c, x) => ({ x, y, c })));
const dist = (ax: number, ay: number, bx: number, by: number) => Math.abs(ax - bx) + Math.abs(ay - by);

/** Keep a share of one node kind. The same spots go first and come back first, so the map stays learnable. */
function follow(grid: Grid, node: string, ground: string, share: number, salt: number, safe: (x: number, y: number) => boolean) {
  const have = cells(grid).filter((k) => k.c === node && !safe(k.x, k.y)).sort((a, b) => hash(a.x, a.y, salt) - hash(b.x, b.y, salt));
  const want = Math.round(have.length * share);
  for (const k of have.slice(want)) grid[k.y][k.x] = ground;
  if (want <= have.length) return;
  const free = cells(grid).filter((k) => k.c === ground && !safe(k.x, k.y)).sort((a, b) => hash(a.x, a.y, salt) - hash(b.x, b.y, salt));
  for (const k of free.slice(0, want - have.length)) grid[k.y][k.x] = node;
}

/** Oxygen below normal: vent water spreads from the vents; above normal, it shrinks (volcanic rock only). */
function shiftVents(grid: Grid, by: number, safe: (x: number, y: number) => boolean) {
  const dead = (c: string | undefined) => c === '%' || c === 'o';
  for (let n = 0; n < Math.abs(by); n++) {
    const edge = cells(grid).filter((k) => dead(k.c) !== by > 0 && k.c !== '#' && !safe(k.x, k.y)
      && [[0, 1], [1, 0], [0, -1], [-1, 0]].some(([dx, dy]) => dead(grid[k.y + dy]?.[k.x + dx]) === by > 0 && grid[k.y + dy]?.[k.x + dx] !== undefined));
    if (!edge.length) return;
    const k = edge.sort((a, b) => hash(a.x, a.y, 7) - hash(b.x, b.y, 7))[by > 0 ? 0 : edge.length - 1];
    grid[k.y][k.x] = by > 0 ? (k.c === 'm' ? 'o' : '%') : k.c === 'o' ? 'm' : '.';
  }
}

/** The board this habitat gives right now. The map is the habitat's; what's on it comes from the garden. */
export function boardFor(g: Garden, id: HabitatId, forms: Record<string, PartId> = {}): Habitat {
  const base = HABITATS[id], h = g.habs[id], normal = g.normal[id], grid: Grid = base.map.map((row) => [...row]);
  const share = (now: number, was: number) => (was > 0 ? clamp(now / was, BOARD.minShare, BOARD.maxShare) : 1);
  const safe = (x: number, y: number) => dist(x, y, base.start[0], base.start[1]) <= BOARD.safeRange || (x === base.entry[0] && y === base.entry[1]);
  if (base.ground === 'basalt') {
    const off = normal.oxygen - h.oxygen, past = Math.sign(off) * Math.max(0, Math.abs(off) - BOARD.deadBand);
    shiftVents(grid, clamp(Math.round(past / BOARD.oxygenPerTile), -BOARD.maxDeadShift, BOARD.maxDeadShift), safe);
  }
  const mats = share(h.mats, normal.mats), rot = share(h.rot, normal.rot);
  follow(grid, 'm', '.', mats, 1, safe);
  follow(grid, 'o', '%', mats, 2, safe);
  follow(grid, 'b', '~', rot, 3, safe);
  if (rot < BOARD.carcassShare) follow(grid, 'c', '.', 0, 6, safe);
  const byPop = (role: Role) => h.entries.filter((e) => e.role === role).sort((a, b) => b.pop - a.pop);
  const rivals = base.rivals.flatMap((v) => { // the authored rival, named after the top species of its role (gone if the role crashed)
    const role = ROLE_OF_FOOD[v.eats], top = byPop(role)[0], P = popOf(h, role);
    if (!top || P < BOARD.rivalAt || P < normal.pops[role] * BOARD.rivalGone) return [];
    return [{ ...v, name: top.line ? `your own ${top.name.replace('Your ', '')}` : top.name }];
  });
  // the hunter: your own line once it ranks top in the hunter row (slice 14), else the top native by numbers
  const top = h.entries.filter((e) => e.role === 'predator').sort((a, b) => b.score - a.score || b.pop - a.pop)[0];
  const mine = top?.line && top.pop >= BOARD.predatorAt ? top : null, form = forms[`${id}:predator`];
  const hunter = mine ?? byPop('predator').find((e) => !e.line), P = popOf(h, 'predator'), hunted = !!hunter && hunter.pop >= BOARD.predatorAt;
  const shift = normal.pops.predator > 0 ? Math.round(Math.log2(Math.max(P, 0.5) / normal.pops.predator) * BOARD.spread) : 0;
  return {
    ...base, map: grid.map((row) => row.join('')), rivals, prey: preyFor(g, id),
    predator: hunted ? hunter!.name : 'none', predatorAt: hunted ? clamp(base.predatorAt - shift, BOARD.earliest, Math.min(BOARD.latest, TURNS)) : NO_PREDATOR,
    hunter: mine ? { yours: true, parts: form ? [form] : [] } : undefined,
  };
}

const count = (b: Habitat, nodes: string) => [...b.map.join('')].filter((c) => nodes.includes(c)).length;
/** What's on a board, counted from the board itself. */
export const boardFacts = (b: Habitat) => ({
  mats: count(b, 'mo'), buried: count(b, 'b'), shells: count(b, 's'), carcasses: count(b, 'cC'), prey: b.prey.length,
  predator: b.predatorAt === NO_PREDATOR ? null : { name: b.predator, turn: b.predatorAt }, rivals: [...new Set(b.rivals.map((v) => v.name))],
});
/** The card's "Next board" line, read from the board you'd get, so the two can't disagree. */
export function nextBoard(b: Habitat): string {
  const f = boardFacts(b), many = (n: number, one: string, more = `${one}s`) => (n ? `${n} ${n === 1 ? one : more}` : '');
  return [many(f.mats, 'mat'), f.buried ? `${f.buried} buried` : '', many(f.shells, 'shell bed'), many(f.carcasses, 'carcass', 'carcasses'), `${f.prey} prey`,
    f.predator ? `${f.predator.name} on turn ${f.predator.turn}` : 'no hunter', f.rivals.length ? `rivals: ${f.rivals.join(', ')}` : ''].filter(Boolean).join(' · ');
}

/** The predator Life's prey follow the prey populations: worms the burrowers, trilobites and Wiwaxia the grazers. */
function preyFor(g: Garden, id: HabitatId): Habitat['prey'] {
  const base = HABITATS[id].prey, h = g.habs[id], n = g.normal[id];
  const keep = (kind: PreyKind) => { const role: Role = kind === 'worm' ? 'burrower' : 'grazer'; return n.pops[role] > 0 ? popOf(h, role) / n.pops[role] : 1; };
  const out = base.filter((p, k) => hash(k, p.at[1], 9) < keep(p.kind) * 0.9 + 0.1);
  for (const p of base) if (out.length < BOARD.preyMin && !out.includes(p)) out.push(p);
  return out.slice(0, BOARD.preyMax);
}

/** What the Life tells the garden: the eggs, and the role its diet earned. */
export function resultOf(l: Life): LifeResult {
  return { hab: l.hab.id, plan: l.plan, eggs: l.eggs, role: roleFromDiet(l.ate, l.plan) };
}
export function roleFromDiet(ate: Partial<Record<NodeId | 'prey', number>>, plan: PlanId): Role {
  const by: Partial<Record<Role, number>> = {};
  for (const [src, food] of Object.entries(ate) as [NodeId | 'prey', number][]) by[ROLE_OF_FOOD[src]] = (by[ROLE_OF_FOOD[src]] ?? 0) + food;
  const best = (Object.entries(by) as [Role, number][]).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : plan === 'worm' ? 'burrower' : plan === 'swimmer' ? 'predator' : 'grazer';
}
/** The base body for a niche (filling a niche = C, decided 5 Nov). */
export const BODY_FOR: Record<Role, PlanId> = { grazer: 'arthropod', burrower: 'worm', predator: 'swimmer' };

export const boardIsValid = (b: Habitat) => b.map.length === ROWS && b.map.every((row) => row.length === COLS);
