// Toy C (slice 04): the body builder, the rules (no DOM). Draft organ pieces, place them on a body grid; the body's
// flows (energy, water, nutrient) must balance; its 6 stats are scored by a real niche's weights; one encounter at
// the end is checked against the body.
import { seeded } from '../src/sim/rng';
import { STATS, tierOf } from '../src/data/genes';
import { NICHES, type Niche } from '../src/data/niches';
import { nicheScore } from '../src/sim/species';
import {
  ABOVE, BASE, BH, BW, DEEP_N, DEEP_ROWS, ENCOUNTERS, GROUND, OFFERS, PICKS, PIECES, REROLLS, SCALE, WILT,
  type EncounterId, type Flow, type PieceId,
} from './body-data';

export type Shape = [number, number][];
export interface Offer { id: PieceId; shape: Shape }
export interface Body {
  niche: Niche; seed: number; encounter: EncounterId;
  cells: (PieceId | null)[]; picks: number; offers: Offer[]; held: number; rerolls: number; over: boolean;
  history: { cells: (PieceId | null)[]; picks: number; offers: Offer[] }[];
}

export const at = (x: number, y: number) => y * BW + x;
export const height = (y: number) => ABOVE - y; // 1 on the ground row
const inside = (x: number, y: number) => x >= 0 && x < BW && y >= 0 && y < BH;
const N4: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const N8: [number, number][] = [...N4, [1, 1], [1, -1], [-1, 1], [-1, -1]];
export const BUILD_NICHES = NICHES.filter((n) => n.key in GROUND);

export function newBody(nicheKey: string, seed: number): Body {
  const rng = seeded(seed), ids = Object.keys(ENCOUNTERS) as EncounterId[];
  const b: Body = {
    niche: NICHES.find((n) => n.key === nicheKey)!, seed, encounter: ids[Math.floor(rng() * ids.length)],
    cells: Array(BW * BH).fill(null), picks: 0, offers: [], held: -1, rerolls: REROLLS, over: false, history: [],
  };
  b.cells[at(BASE.x, ABOVE - 1)] = 'stem';
  b.cells[at(BASE.x, ABOVE)] = 'root';
  deal(b);
  return b;
}

/** Three offers of different kinds, weighted, each with a random shape; fixed by the pick and the rerolls used, so
 * an undo can't fish for new offers. */
function deal(b: Body) {
  const rng = seeded(b.seed + 7919 * (b.picks + 1) + 104729 * (REROLLS - b.rerolls)), bag = (Object.keys(PIECES) as PieceId[]).flatMap((id) => Array(PIECES[id].weight).fill(id) as PieceId[]);
  b.offers = [];
  while (b.offers.length < OFFERS) {
    const id = bag[Math.floor(rng() * bag.length)];
    if (b.offers.some((o) => o.id === id)) continue;
    const shapes = PIECES[id].shapes;
    b.offers.push({ id, shape: shapes[Math.floor(rng() * shapes.length)] });
  }
  b.held = -1;
}

/** A quarter turn, moved back so its smallest x and y are 0. */
export function rotate(s: Shape): Shape {
  const r = s.map(([x, y]) => [-y, x] as [number, number]);
  const mx = Math.min(...r.map((c) => c[0])), my = Math.min(...r.map((c) => c[1]));
  return r.map(([x, y]) => [x - mx, y - my]);
}
export const cellsOf = (s: Shape, ax: number, ay: number) => s.map(([x, y]) => [ax + x, ay + y] as [number, number]);

/** Why this piece can't go here, or null when it can. */
export function whyNot(b: Body, o: Offer, ax: number, ay: number): string | null {
  const p = PIECES[o.id], cs = cellsOf(o.shape, ax, ay);
  if (cs.some(([x, y]) => !inside(x, y))) return 'off the body';
  if (cs.some(([x, y]) => b.cells[at(x, y)])) return 'taken';
  if (cs.some(([, y]) => (y >= ABOVE) !== p.below)) return p.below ? 'goes below ground' : 'goes above ground';
  const anchors: PieceId[] = p.below ? ['root'] : ['stem', 'wood'];
  const touches = cs.some(([x, y]) => N4.some(([dx, dy]) => inside(x + dx, y + dy) && anchors.includes(b.cells[at(x + dx, y + dy)]!)));
  return touches ? null : `must touch ${p.below ? 'a root' : 'a stem or wood'}`;
}

function save(b: Body) { b.history.push({ cells: b.cells.slice(), picks: b.picks, offers: b.offers.map((o) => ({ ...o })) }); }

export function place(b: Body, ax: number, ay: number): boolean {
  const o = b.offers[b.held];
  if (b.over || !o || whyNot(b, o, ax, ay)) return false;
  save(b);
  for (const [x, y] of cellsOf(o.shape, ax, ay)) b.cells[at(x, y)] = o.id;
  next(b);
  return true;
}
export function skip(b: Body) { if (b.over) return; save(b); next(b); }
export function reroll(b: Body) { if (b.over || b.rerolls <= 0) return; b.rerolls--; deal(b); }
export function undo(b: Body) {
  const h = b.history.pop();
  if (!h) return;
  Object.assign(b, h, { over: false, held: -1 });
}
function next(b: Body) {
  b.picks++;
  if (b.picks >= PICKS) { b.over = true; b.offers = []; b.held = -1; } else deal(b);
}

/** The body's flows, stats and score; `enc` applies the encounter. */
export function measure(cells: (PieceId | null)[], niche: Niche, enc: EncounterId | null = null) {
  const ground = GROUND[niche.key], flow: Flow = { e: 0, w: 0, n: 0 }, light: number[] = Array(cells.length).fill(-1);
  const eaten = new Set<number>(), count = { leaf: 0, wood: 0, thorn: 0, tuber: 0, rootCells: 0, flower: 0 };
  let top = 0, depth = 0, costE = 0;
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
    const i = at(x, y), id = cells[i];
    if (!id) continue;
    if (y < ABOVE) top = Math.max(top, height(y)); else depth = Math.max(depth, y - ABOVE + 1);
    if (id === 'leaf') {
      if (enc === 'grazer' && height(y) <= ENCOUNTERS.grazer.height &&
        !N8.some(([dx, dy]) => inside(x + dx, y + dy) && cells[at(x + dx, y + dy)] === 'thorn')) { eaten.add(i); continue; }
      let shade = 0;
      for (let yy = 0; yy < y; yy++) { const c = cells[at(x, yy)]; if (c === 'leaf' || c === 'flower' || c === 'wood') shade++; }
      if (enc === 'rival' && height(y) <= ENCOUNTERS.rival.height) shade++;
      light[i] = Math.max(0, Math.min(ground.light, 2 - shade));
      flow.e += light[i]; flow.w += PIECES.leaf.flow.w; count.leaf++;
      continue;
    }
    const f = PIECES[id].flow;
    flow.e += f.e; flow.n += f.n; costE += Math.max(0, -f.e);
    if (id === 'root') {
      count.rootCells++;
      flow.w += f.w + ground.rootW - (enc === 'drought' ? 1 : 0);
      if (y >= BH - DEEP_ROWS) flow.n += DEEP_N;
    }
    if (id === 'tuber') { count.tuber++; count.rootCells++; if (enc === 'drought') flow.w += 2; }
    if (id === 'wood') count.wood++;
    if (id === 'thorn') count.thorn++;
    if (id === 'flower') count.flower++;
  }
  const c01 = (v: number) => Math.max(0, Math.min(1, v));
  const stat: Record<string, number> = {
    reach: c01(top / SCALE.reach),
    cover: c01(count.leaf / SCALE.cover),
    roots: c01(0.5 * Math.min(1, count.rootCells / SCALE.rootCells) + 0.5 * (depth / SCALE.depth)),
    toughness: c01((count.wood + 0.5 * count.thorn + 0.5 * count.tuber) / SCALE.toughness),
    growth: c01(flow.e / SCALE.growth),
    upkeep: c01(costE / SCALE.upkeep),
  };
  const sn = STATS.map((s) => stat[s]);
  const short = Math.max(0, -flow.e) + Math.max(0, -flow.w) + Math.max(0, -flow.n);
  const fit = nicheScore(sn, niche), wilt = Math.max(WILT.floor, 1 - WILT.perShort * short);
  const seeds = count.flower > 0, score = Math.round(fit * wilt);
  return { flow, sn, light, eaten, short, fit, wilt, seeds, score, tier: seeds ? tierOf(score) : 'F' };
}
export type Measure = ReturnType<typeof measure>;

/** The body as it would be with the held piece placed here (for the live preview). */
export function preview(b: Body, ax: number, ay: number): (PieceId | null)[] | null {
  const o = b.offers[b.held];
  if (!o || whyNot(b, o, ax, ay)) return null;
  const cells = b.cells.slice();
  for (const [x, y] of cellsOf(o.shape, ax, ay)) cells[at(x, y)] = o.id;
  return cells;
}
