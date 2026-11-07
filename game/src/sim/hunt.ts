// The predator Life (slice 11): the swimmer's moves, catching, and the prey, each fleeing by one rule. Prey sense
// you only on a turn you moved, which is what makes an ambush work. No DOM.
import type { Habitat } from '../data/habitats';
import { COLS, HUNT, PLANS, RULE, ROWS } from '../data/life';
import { PREY, PREY_BACK, PREY_HIDE, type PreyKind } from '../data/prey';
import { DX, DY, at, dist, inB, xy, type Dir } from './grid';
import { cleared, count, eat, emit, eventArea, eventOn, has, rnd, say, type Dest, type Life } from './life';

export interface Prey { kind: PreyKind; species?: string; name?: string; eats?: Habitat['prey'][number]['eats']; x: number; y: number; hidden: number; alive: boolean; back: number; alarmed: boolean }

export function preyInit(l: Life) {
  l.prey = l.plan === 'swimmer' ? l.hab.prey.map((p) => ({ kind: p.kind, species: p.species, name: p.name, eats: p.eats, x: p.at[0], y: p.at[1], hidden: 0, alive: true, back: 0, alarmed: false })) : [];
}

/** How far you swim this turn: flaps and frenzy add, an ambush multiplies. */
export const speed = (l: Life) => Math.min(HUNT.maxSpeed,
  (PLANS.swimmer.range + count(l, 'flap') + l.frenzy) * (l.still ? (has(l, 'fan') ? HUNT.fanAmbush : HUNT.ambush) : 1));
/** The visible prey on tile i, or -1. */
export const preyAt = (l: Life, i: number) => l.prey.findIndex((p) => p.alive && !p.hidden && at(p.x, p.y) === i);

/** Where the swimmer can go: any path of `speed` steps through open water (rock is fine, vent water isn't); prey end it. */
export function swimDests(l: Life): Map<number, Dest> {
  const out = new Map<number, Dest>(), start = at(l.x, l.y), seen = new Set([start]), open: [number, number[], Dir][] = [[start, [], l.facing]];
  const max = speed(l);
  while (open.length) {
    const [i, path] = open.shift()!, [x, y] = xy(i);
    if (path.length >= max) continue;
    for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
      const nx = x + DX[d], ny = y + DY[d], n = at(nx, ny);
      if (!inB(nx, ny) || seen.has(n) || l.tiles[n].t === 'dead') continue;
      seen.add(n);
      const p = [...path, n];
      out.set(n, { i: n, dir: d, grab: false, path: p });
      if (preyAt(l, n) < 0) open.push([n, p, d]);
    }
  }
  return out;
}

export function swimMove(l: Life, d: Dest) {
  const from = at(l.x, l.y);
  [l.x, l.y] = xy(d.i); l.facing = d.dir; l.moved = true;
  emit(l, { k: 'move', from, to: d.i, path: d.path, grab: false, dir: d.dir });
  const k = preyAt(l, d.i);
  if (k >= 0 && (has(l, 'arms') || has(l, 'spikes'))) catchPrey(l, k);
  else if (l.tiles[d.i].node === 'carcass') eat(l, d.i);
}

function catchPrey(l: Life, k: number) {
  const p = l.prey[k], P = PREY[p.kind], gain = P.food + count(l, 'gut') * RULE.gutFood;
  p.alive = false; p.back = l.turn + PREY_BACK;
  l.food += gain; l.xp += gain; l.eaten += gain; l.caught = true; l.catches++; l.ate.prey = (l.ate.prey ?? 0) + gain;
  say(l, `${p.name ?? P.name} caught: +${gain} food.`);
  emit(l, { k: 'catch', idx: k, i: at(p.x, p.y), kind: p.kind, gain, food: l.food });
  if (P.armour && p.alarmed && !has(l, 'spikes')) { // spines up: it saw you coming
    l.health -= HUNT.spineCut;
    say(l, `Its spines cut you: −${HUNT.spineCut} health.`);
    emit(l, { k: 'hurt', why: 'Spines', health: l.health });
  }
}

/** Where prey p goes next if you stand at (yx, yy): the pure rule, shared by the turn and the compound eyes' preview. */
export function nextStep(l: Life, p: Prey, yx: number, yy: number, alarmed: boolean): { x: number; y: number; hide: boolean } {
  const P = PREY[p.kind], here = { x: p.x, y: p.y, hide: false };
  const free = (x: number, y: number) => inB(x, y) && (p.kind === 'swimmer' || l.tiles[at(x, y)].t !== 'rock') && l.tiles[at(x, y)].t !== 'dead'
    && !(x === yx && y === yy) && !l.prey.some((q) => q !== p && q.alive && q.x === x && q.y === y);
  const ground = (x: number, y: number) => l.tiles[at(x, y)].t;
  if (alarmed) {
    if (P.rule === 'hunker') return here;
    if (P.rule === 'burrow') {
      const slide = eventOn(l) && l.hab.event.where === 'mud' && eventArea(l, p.x, p.y);
      if (ground(p.x, p.y) === 'mud' && !slide) return { ...here, hide: true };
      let best = here, bs = dist(p.x, p.y, yx, yy) * 2;
      for (let d = 0; d < 4; d++) {
        const x = p.x + DX[d], y = p.y + DY[d];
        if (!free(x, y)) continue;
        const sc = dist(x, y, yx, yy) * 2 + (ground(x, y) === 'mud' && !slide ? 3 : 0);
        if (sc > bs) { bs = sc; best = { x, y, hide: false }; }
      }
      return best;
    }
    let best = here, bd = dist(p.x, p.y, yx, yy) * 2; // run: two tiles straight away (ties go to straight away); mud stops it
    for (let d = 0; d < 4; d++) {
      let x = p.x, y = p.y;
      for (let k = 0; k < 2; k++) { const nx = x + DX[d], ny = y + DY[d]; if (!free(nx, ny) || (p.kind === 'trilobite' && ground(nx, ny) === 'mud')) break; x = nx; y = ny; if (p.kind === 'arthropod' && ground(x, y) === 'mud') break; }
      const sc = dist(x, y, yx, yy) * 2 + (DX[d] * (p.x - yx) > 0 || DY[d] * (p.y - yy) > 0 ? 1 : 0);
      if ((x !== p.x || y !== p.y) && sc > bd) { bd = sc; best = { x, y, hide: false }; }
    }
    return best;
  }
  let goal = -1, gd = 1e9; // grazing: a step toward the nearest food it eats
  l.tiles.forEach((t, i) => { if (t.node === (p.eats ?? P.eats)) { const [x, y] = xy(i), dd = dist(p.x, p.y, x, y); if (dd < gd) { gd = dd; goal = i; } } });
  if (goal < 0 || gd === 0) return here;
  const [gx, gy] = xy(goal), sx = Math.sign(gx - p.x), sy = Math.sign(gy - p.y);
  const tries = Math.abs(gx - p.x) >= Math.abs(gy - p.y) ? [[sx, 0], [0, sy]] : [[0, sy], [sx, 0]];
  for (const [ox, oy] of tries) {
    const x = p.x + ox, y = p.y + oy;
    if ((ox || oy) && free(x, y) && !(p.kind === 'trilobite' && ground(x, y) === 'mud')) return { x, y, hide: false };
  }
  return here;
}

/** The prey's turn: hidden worms count down, alarmed prey flee, the rest graze; caught kinds come back at the edge. */
export function preyStep(l: Life) {
  l.prey.forEach((p, k) => {
    if (!p.alive) { if (l.turn >= p.back) back(l, k); return; }
    if (p.hidden > 0) { p.hidden--; if (!p.hidden) emit(l, { k: 'prey', idx: k, from: at(p.x, p.y), to: at(p.x, p.y), hide: false }); return; }
    p.alarmed = l.moved && dist(p.x, p.y, l.x, l.y) <= PREY[p.kind].sense;
    const n = nextStep(l, p, l.x, l.y, p.alarmed), from = at(p.x, p.y);
    p.x = n.x; p.y = n.y;
    if (n.hide) p.hidden = PREY_HIDE;
    if (from !== at(p.x, p.y) || n.hide) emit(l, { k: 'prey', idx: k, from, to: at(p.x, p.y), hide: n.hide });
    const t = l.tiles[at(p.x, p.y)];
    if (!p.alarmed && t.node === (p.eats ?? PREY[p.kind].eats)) { emit(l, { k: 'prey_ate', idx: k, i: at(p.x, p.y), node: t.node }); cleared(l, t); }
  });
}

function back(l: Life, k: number) {
  const p = l.prey[k], spots: number[] = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const edge = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1, t = l.tiles[at(x, y)].t;
    if (edge && (p.kind === 'swimmer' || t !== 'rock') && t !== 'dead' && dist(x, y, l.x, l.y) > 3 && !l.prey.some((q) => q.alive && q.x === x && q.y === y)) spots.push(at(x, y));
  }
  if (!spots.length) return;
  [p.x, p.y] = xy(spots[Math.floor(rnd(l) * spots.length)]);
  p.alive = true; p.hidden = 0; p.alarmed = false;
  emit(l, { k: 'prey_back', idx: k, at: at(p.x, p.y) });
}

/** The compound eyes' preview: where each visible prey would go if you swam to tile i. */
export function predict(l: Life, i: number) {
  const [x, y] = xy(i);
  return l.prey.flatMap((p, k) => {
    if (!p.alive || p.hidden || at(p.x, p.y) === i) return [];
    const n = nextStep(l, p, x, y, dist(p.x, p.y, x, y) <= PREY[p.kind].sense);
    return [{ idx: k, from: at(p.x, p.y), to: at(n.x, n.y), hide: n.hide }];
  });
}
