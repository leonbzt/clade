// The verbs (slice 10): each comes from a part. A free verb (Dash, Sense) doesn't end the turn; the others are your
// action for the turn and then the world moves. Recharge counts down one a turn.
import { NODES, VERBS, type VerbId } from '../data/life';
import { DX, DY, at, eat, emit, inB, ready, say, world, xy, type Life } from './life';

const around = (l: Life, diag: boolean) => {
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if ((!dx && !dy) || (!diag && dx && dy)) continue;
    if (inB(l.x + dx, l.y + dy)) out.push(at(l.x + dx, l.y + dy));
  }
  return out;
};

/** What a verb would do now, in a few words, or why it can't (for the button). */
export function verbNote(l: Life, v: VerbId): string {
  if (!(l.recharge[v]! > 0)) {
    if (v === 'graze') { const n = around(l, true).filter((i) => ['mat', 'bloom'].includes(l.tiles[i].node!)).length; return n ? `${n} mat${n > 1 ? 's' : ''}` : 'no mats near'; }
    if (v === 'dig') { const n = [at(l.x, l.y), ...around(l, false)].filter((i) => l.tiles[i].node === 'buried').length; return n ? `${n} buried` : 'hides you'; }
    if (v === 'brace') return l.pred?.state === 'strike' ? 'strike marked!' : 'no strike yet';
    if (v === 'crush') { const i = crushTarget(l); return i < 0 ? 'nothing to crack' : NODES[l.tiles[i].node!].name.toLowerCase(); }
    return VERBS[v].free ? 'free' : 'ready';
  }
  return `ready in ${l.recharge[v]}`;
}

function crushTarget(l: Life) {
  let best = -1, food = 0;
  const ahead = at(l.x + DX[l.facing], l.y + DY[l.facing]);
  for (const i of around(l, false)) {
    const n = l.tiles[i].node;
    if ((n === 'shell' || n === 'carcass') && (NODES[n].food > food || (NODES[n].food === food && i === ahead))) { best = i; food = NODES[n].food; }
  }
  return best;
}

/** Use a verb. Returns false (and does nothing) if it isn't ready. */
export function useVerb(l: Life, v: VerbId): boolean {
  l.events = [];
  if (!ready(l, v)) return false;
  const V = VERBS[v];
  let tiles: number[] = [];
  if (v === 'graze') {
    tiles = around(l, true).filter((i) => l.tiles[i].node === 'mat' || l.tiles[i].node === 'bloom');
    if (!tiles.length) { say(l, 'No mats around you to graze.'); return false; }
    emit(l, { k: 'verb', verb: v, tiles });
    for (const i of tiles) eat(l, i);
  } else if (v === 'dash') {
    l.dash = true; say(l, 'Dash: your next move goes twice as far.');
    emit(l, { k: 'verb', verb: v, tiles });
  } else if (v === 'dig') {
    tiles = [at(l.x, l.y), ...around(l, false)].filter((i) => l.tiles[i].node === 'buried');
    l.dug = true; l.moved = false;
    for (const i of around(l, true)) l.tiles[i].seen = true;
    emit(l, { k: 'verb', verb: v, tiles });
    say(l, tiles.length ? 'You dig in.' : 'You dig in: strikes miss you this turn.');
    for (const i of tiles) eat(l, i, true);
  } else if (v === 'sense') {
    l.tiles.forEach((t, i) => { const [x, y] = xy(i); if (Math.max(Math.abs(x - l.x), Math.abs(y - l.y)) <= 5 && !t.seen) { t.seen = true; tiles.push(i); } });
    say(l, 'You sense the food hidden around you.');
    emit(l, { k: 'verb', verb: v, tiles });
  } else if (v === 'brace') {
    l.braced = true; l.moved = false;
    say(l, 'You brace: strikes from any side will glance off.');
    emit(l, { k: 'verb', verb: v, tiles });
  } else if (v === 'crush') {
    const i = crushTarget(l);
    if (i < 0) { say(l, 'Nothing beside you to crack open.'); return false; }
    tiles = [i];
    emit(l, { k: 'verb', verb: v, tiles });
    eat(l, i, true, 4);
  }
  if (V.free) { l.recharge[v] = V.recharge; return true; }
  world(l);
  l.recharge[v] = V.recharge;
  return true;
}
