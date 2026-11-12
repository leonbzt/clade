// Deterministic N2 play route for the review sheet. Uses revealed food and normal actions, no dev food.
import { TURNS } from '../../clade/src/data/life';
import { PARTS } from '../../clade/src/data/parts';
import * as E from '../../clade/src/sim/economy';
import * as L from '../../clade/src/sim/life';
import { activeParts } from '../../clade/src/sim/life-body';
import { useVerb } from '../../clade/src/sim/verbs';
import type { PartId, VerbId } from '../../clade/src/sim/records';

export type Action = { kind: 'grow' | 'lay' | 'wait' } | { kind: 'enforce'; part: PartId } | { kind: 'verb'; verb: VerbId } | { kind: 'move'; tile: number };

export function choose(l: L.Life, order: PartId[]): Action {
  const at = L.at(l.x, l.y), parts = activeParts(l), upkeep = L.upkeep(l);
  if (L.ready(l, 'sense') && l.tiles.some((t) => !t.seen && t.t === 'mud')) return { kind: 'verb', verb: 'sense' };
  const part = order.find((p) => !l.enforced[p]);
  if (part && parts.includes(part) && E.canEnforce(l, part) && l.food >= E.enforceCost(l)! + upkeep && l.turn <= TURNS - 4)
    return { kind: 'enforce', part };
  if (E.canGrow(l) && l.food >= E.growCost(l) + upkeep + 2 && l.turn < TURNS - 3) return { kind: 'grow' };
  if (E.canLay(l) && (l.food >= 4 + upkeep + 3 || l.turn === TURNS)) return { kind: 'lay' };
  if (l.pred?.state === 'strike' && l.pred.marks.includes(at) && !L.buriedAt(l, l.x, l.y) && L.ready(l, 'brace'))
    return { kind: 'verb', verb: 'brace' };
  for (const verb of ['graze', 'dig'] as const) {
    const node = verb === 'graze' ? 'mat' : 'buried';
    if (!L.ready(l, verb) || L.lockOf(l, node)) continue;
    const food = l.tiles.filter((t, i) => {
      const [x, y] = L.xy(i), dx = Math.abs(x - l.x), dy = Math.abs(y - l.y);
      return t.node === node && (verb === 'graze' ? Math.max(dx, dy) === 1 : dx + dy <= 1);
    }).length;
    if (food) return { kind: 'verb', verb };
  }
  const seen = new Set([at]), queue = [{ tile: at, first: -1, steps: 0 }];
  let best = -1, score = -Infinity, explore = -1, exploreSteps = Infinity;
  for (let q = 0; q < queue.length; q++) {
    const pos = queue[q], [x, y] = L.xy(pos.tile);
    const copy = { ...l, x, y };
    for (const [i] of L.dests(copy)) {
      if (seen.has(i)) continue;
      seen.add(i);
      const steps = pos.steps + 1, first = pos.first < 0 ? i : pos.first, t = l.tiles[i];
      queue.push({ tile: i, first, steps });
      const danger = l.pred?.marks.includes(first) && !L.buriedAt(l, ...L.xy(first)) ? 5 : 0;
      if (t.node && L.known(t) && !L.lockOf(l, t.node)) {
        const value = L.foodOf(l, t.node) / steps - steps * 0.1 - danger;
        if (value > score) { score = value; best = first; }
      }
      if (!t.seen && steps < exploreSteps) { explore = first; exploreSteps = steps; }
    }
  }
  if (best >= 0) return { kind: 'move', tile: best };
  if (E.canLay(l)) return { kind: 'lay' };
  return explore >= 0 ? { kind: 'move', tile: explore } : { kind: 'wait' };
}

export function apply(l: L.Life, a: Action) {
  if (a.kind === 'grow') E.grow(l);
  else if (a.kind === 'lay') E.lay(l);
  else if (a.kind === 'wait') L.stay(l);
  else if (a.kind === 'enforce') E.enforce(l, a.part);
  else if (a.kind === 'verb') useVerb(l, a.verb);
  else L.move(l, a.tile);
}

export function rehearse(l: L.Life, order: PartId[]) {
  const actions = [];
  for (let n = 0; n < 100 && l.phase === 'play'; n++) {
    const a = choose(l, order); actions.push({ turn: l.turn, ...a }); apply(l, a);
  }
  return { ...E.resultOf(l), health: l.health, turn: l.turn, actions, parts: activeParts(l).map((p) => PARTS[p].name) };
}
