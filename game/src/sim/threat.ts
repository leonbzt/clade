// The hunter on a grazer's board: it tracks you, marks a strike, strikes, rests. When the board's hunter is your own
// line (slice 14), it hunts the way you do: it lurks a turn then swims twice as far, gains a step per hit, and your
// line's form changes it (compound eyes see into mud, flaps add a step, arm spines tear through a guard).
import { PARTS, RULE, VERB_PART } from '../data/life';
import { DX, DY, at, dist, inB, xy, type Dir } from './grid';
import { buriedAt, emit, has, say, tile, type Hit, type Life, type Predator, type Side } from './life';

const SIDES: Side[] = ['front', 'right', 'back', 'left'];
const DIR_NAMES = ['north', 'east', 'south', 'west'];
const yours = (l: Life) => !!l.hab.hunter?.yours;
const their = (l: Life, part: string) => !!l.hab.hunter?.parts.includes(part as never);
/** Whether mud hides you from this hunter (your own compound-eyed line sees into it). */
const hidden = (l: Life, x: number, y: number) => buriedAt(l, x, y) && !(yours(l) && their(l, 'lenses'));

/** What a strike from `dir` would do to you at (x, y), facing `facing`. */
export function hitOn(l: Life, dir: Dir, facing: Dir, x: number, y: number): Hit {
  const side = SIDES[(dir - facing + 4) % 4];
  if (hidden(l, x, y)) return { side, kind: 'buried', part: null, tear: -1, damage: 0 };
  if (l.dug) return { side, kind: 'buried', part: null, tear: -1, damage: 0 };
  if ((has(l, 'enrol') || l.plan === 'trilobite') && !l.moved) return { side, kind: 'enrolled', part: has(l, 'enrol') ? 'enrol' : null, tear: -1, damage: 0 };
  if (l.braced && l.plan !== 'swimmer') return { side, kind: 'blocked', part: VERB_PART[l.plan].brace, tear: -1, damage: 0 };
  const guard = l.slots.findIndex((s) => s.side === side && s.part && PARTS[s.part].guard);
  if (guard >= 0 && !(yours(l) && their(l, 'spikes'))) return { side, kind: 'blocked', part: l.slots[guard].part, tear: -1, damage: 0 };
  let tear = guard;
  if (tear < 0) l.slots.forEach((s, k) => { if (s.side === side && s.part) tear = k; });
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
  else if (h.kind === 'enrolled') say(l, 'You roll up: the strike glances off.');
  else if (h.kind === 'blocked') {
    say(l, `Your ${PARTS[h.part!].name.toLowerCase()} blocks a strike on your ${h.side}.`);
    if (h.part === 'spine' || l.braced) p.rest = RULE.restAfterSpine;
  } else {
    if (h.tear >= 0) { const n = PARTS[h.part!].name.toLowerCase(); say(l, `Hit on your ${h.side}: your ${n} ${n.endsWith('s') ? 'are' : 'is'} torn off.`); l.slots[h.tear].part = null; l.order = l.order.filter((k) => k !== h.tear); }
    if (h.damage) { say(l, `Hit on your ${h.side}: −${h.damage} health${l.soft ? ' (soft from moulting)' : ''}.`); l.health -= h.damage; }
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
