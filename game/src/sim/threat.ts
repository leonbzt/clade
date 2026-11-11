// The hunter on a grazer's board: it tracks you, marks a strike, strikes, rests. When the board's hunter is your own
// line (slice 14), it hunts the way you do: it lurks a turn then swims twice as far, gains a step per hit, and your
// line's form changes it (compound eyes see into mud, flaps add a step, arm spines tear through a guard).
import { PARTS, RULE } from '../data/life';
import { describeRow } from './body';
import { sideOf, strikeOn } from './body-hurt';
import { DX, DY, at, dist, inB, xy, type Dir } from './grid';
import { buriedAt, emit, loseAt, say, tile, type Hit, type Life, type Predator } from './life';

const DIR_NAMES = ['north', 'east', 'south', 'west'];
const yours = (l: Life) => !!l.hab.hunter?.yours;
const their = (l: Life, part: string) => !!l.hab.hunter?.parts.includes(part as never);
/** Whether mud hides you from this hunter (your own compound-eyed line sees into it). */
const hidden = (l: Life, x: number, y: number) => buriedAt(l, x, y) && !(yours(l) && their(l, 'lenses'));

/** What a strike from `dir` would do to you at (x, y), facing `facing`: 20A's order (mud, Dig, rolled up, Brace,
 * a passive guard, then a whole-row tear or damage). Your own line's arm spines bypass passive guards. */
export function hitOn(l: Life, dir: Dir, facing: Dir, x: number, y: number): Hit {
  const side = sideOf(dir, facing), b = l.build;
  const h = strikeOn(b, side, { buried: hidden(l, x, y), dug: l.dug, stayed: !l.moved, braced: l.braced, soft: l.soft, bypass: yours(l) && their(l, 'spikes') });
  const part = h.kind === 'enrolled' ? (b.rows.tail?.includes('enrol') ? 'enrol' : null) : h.guard ?? (h.tear ? b.rows[h.tear]![0] : null);
  return { side, kind: h.kind, part, tear: h.tear, damage: h.damage, rest: h.rest };
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
  if (h.kind === 'buried') say(l, 'You are buried: the strike misses.');
  else if (h.kind === 'enrolled') say(l, 'You roll up: the strike glances off.');
  else if (h.kind === 'blocked') say(l, h.part ? `Your ${PARTS[h.part].name.toLowerCase()} blocks a strike on your ${h.side}.` : `You are braced: the strike on your ${h.side} glances off.`);
  else {
    const n = h.tear ? describeRow(l.build.rows[h.tear]!).toLowerCase() : '';
    const torn = h.tear ? `your ${n} ${n.endsWith('s') ? 'are' : 'is'} torn off, ` : '';
    say(l, `Hit on your ${h.side}: ${torn}−${h.damage} health${l.soft ? ' (soft from moulting)' : ''}.`);
    if (h.tear) loseAt(l, h.tear);
    l.health -= h.damage;
    if (yours(l)) { p.bonus = Math.min(2, p.bonus + 1); say(l, 'Your own hunter grows bolder: +1 step.'); }
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

export function predatorStep(l: Life) {
  const p = l.pred;
  if (!p) return;
  if (p.state === 'strike') { strike(l); return; }
  if (p.state === 'rest') { if (--p.rest <= 0) p.state = 'hunt'; return; }
  const hide = hidden(l, l.x, l.y), from = at(p.x, p.y);
  if (!hide) { p.lx = l.x; p.ly = l.y; }
  let steps = RULE.predatorSteps;
  if (yours(l)) {
    const near = dist(p.x, p.y, p.lx, p.ly) <= 1;
    if (!near && !p.lurked) { p.lurked = true; say(l, `${l.hab.predator} lurk, still as stone.`); emit(l, { k: 'pred_lurk', at: from }); return; }
    steps = (steps + (their(l, 'flap') ? 1 : 0) + p.bonus) * (p.lurked && !near ? 2 : 1);
    p.lurked = false;
  }
  for (let k = 0; k < steps && dist(p.x, p.y, p.lx, p.ly) > 1; k++) predatorMove(l, p, p.lx, p.ly);
  if (at(p.x, p.y) !== from) emit(l, { k: 'pred_move', from, to: at(p.x, p.y) });
  if (hide || dist(p.x, p.y, l.x, l.y) !== 1) return;
  p.dir = (p.y < l.y ? 0 : p.x > l.x ? 1 : p.y > l.y ? 2 : 3) as Dir;
  const across = p.dir % 2 === 0 ? 1 : 0; // the strike sweeps sideways: step away along its line, or get clear of it
  p.marks = [[0, 0], [DX[across], DY[across]], [-DX[across], -DY[across]]]
    .map(([ox, oy]) => [l.x + ox, l.y + oy]).filter(([x, y]) => inB(x, y) && tile(l, x, y).t !== 'rock').map(([x, y]) => at(x, y));
  p.state = 'strike';
  say(l, `${l.hab.predator} mark${yours(l) ? '' : 's'} a strike from the ${DIR_NAMES[p.dir]}.`);
  emit(l, { k: 'marks', marks: p.marks, dir: p.dir });
}
