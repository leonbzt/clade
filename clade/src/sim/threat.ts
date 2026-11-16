// The shadow tracks you, marks a strike, strikes and rests.
import { RULE } from '../data/life';
import { PARTS } from '../data/parts';
import { sideOf, strikeOn } from './life-body';
import { DX, DY, at, dist, inB, xy, type Dir } from './grid';
import { buriedAt, emit, hunterName, loseAt, say, tile, type Hit, type Life, type Predator } from './life';

const DIR_NAMES = ['north', 'east', 'south', 'west'];

/** Preview the strike from dir against the body at (x, y), facing facing. */
export function hitOn(l: Life, dir: Dir, facing: Dir, x: number, y: number): Hit {
  const side = sideOf(dir, facing);
  return { side, ...strikeOn(l, side, {
    buried: buriedAt(l, x, y), dug: l.dug, stayed: !l.moved, braced: l.braced, soft: l.soft, beats: l.board.predator?.beats,
  }) };
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
  p.rest = h.rest;
  if (h.enforced && h.part) l.spentGuards[h.part] = (l.spentGuards[h.part] ?? 0) + 1;
  if (h.kind === 'buried') say(l, 'You are buried: the strike misses.');
  else if (h.kind === 'enrolled') say(l, 'You roll up: the strike glances off.');
  else if (h.kind === 'blocked') say(l, h.part ? `Your ${PARTS[h.part].name.toLowerCase()} blocks a strike on your ${h.side}.` : `You are braced: the strike on your ${h.side} glances off.`);
  else {
    const n = h.tear && h.part ? PARTS[h.part].name.toLowerCase() : '';
    const torn = h.tear ? `your ${n} ${n.endsWith('s') ? 'are' : 'is'} torn off, ` : '';
    say(l, `Hit on your ${h.side}: ${torn}−${h.damage} health${l.soft ? ' (soft from moulting)' : ''}.`);
    if (h.tear) loseAt(l, h.tear);
    l.health -= h.damage;
  }
  emit(l, { k: 'strike', ...h, at: here, dir: p.dir, marks, health: l.health });
}

/** One step toward (tx, ty), swimming over rock. */
function predatorMove(p: Predator, tx: number, ty: number) {
  const start = at(p.x, p.y), from = new Map<number, number>([[start, -1]]), open = [start];
  let goal = start, gd = dist(p.x, p.y, tx, ty);
  while (open.length) {
    const i = open.shift()!, [x, y] = xy(i), dd = dist(x, y, tx, ty);
    if (dd < gd) { gd = dd; goal = i; }
    if (dd === 0) break;
    for (let d = 0; d < 4; d++) {
      const nx = x + DX[d], ny = y + DY[d];
      if (!inB(nx, ny)) continue;
      const n = at(nx, ny);
      if (from.has(n)) continue;
      from.set(n, i); open.push(n);
    }
  }
  let step = goal;
  while (from.get(step) !== -1 && from.get(step) !== start) step = from.get(step)!;
  if (step !== start) [p.x, p.y] = xy(step);
}

export function predatorStep(l: Life) {
  const p = l.pred;
  if (!p) return;
  if (p.state === 'strike') { strike(l); return; }
  if (p.state === 'rest') { if (--p.rest <= 0) p.state = 'hunt'; return; }
  const hide = buriedAt(l, l.x, l.y), from = at(p.x, p.y);
  if (!hide) { p.lx = l.x; p.ly = l.y; }
  for (let k = 0; k < RULE.predatorSteps && dist(p.x, p.y, p.lx, p.ly) > 1; k++) predatorMove(p, p.lx, p.ly);
  if (at(p.x, p.y) !== from) emit(l, { k: 'pred_move', from, to: at(p.x, p.y) });
  if (hide || dist(p.x, p.y, l.x, l.y) !== 1) return;
  p.dir = (p.y < l.y ? 0 : p.x > l.x ? 1 : p.y > l.y ? 2 : 3) as Dir;
  const across = p.dir % 2 === 0 ? 1 : 0; // the strike sweeps sideways: step away along its line, or get clear of it
  p.marks = [[0, 0], [DX[across], DY[across]], [-DX[across], -DY[across]]]
    .map(([ox, oy]) => [l.x + ox, l.y + oy]).filter(([x, y]) => inB(x, y) && tile(l, x, y).t !== 'rock').map(([x, y]) => at(x, y));
  p.state = 'strike';
  say(l, `${hunterName(l)} marks a strike from the ${DIR_NAMES[p.dir]}.`);
  emit(l, { k: 'marks', marks: p.marks, dir: p.dir });
}
