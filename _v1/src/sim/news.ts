// Two kinds of news. Headlines are the big ones (an island's best changing, an arrival, a species dying out, a big slot
// opening, a habitat growing or vanishing): a banner over the map, pinned at the top of the feed. Chatter is the small
// stuff (slot changes in one habitat, renames, rare variants, trends), dim and folded away by default.
import { NUM } from '../data/numbers';
import type { State } from './state';

const KEEP = 10;

/** A headline; the same one again within NUM.habitats.repeat seconds is dropped. */
export function headline(s: State, text: string) {
  if (s.heads.some((h) => h.text === text && s.tick - h.tick < NUM.habitats.repeat * NUM.ticksPerSec)) return;
  s.heads.push({ tick: s.tick, text });
  if (s.heads.length > KEEP) s.heads.shift();
  s.board.heads++;
}

export function chatter(s: State, text: string) {
  s.log.push({ tick: s.tick, kind: 'chat', text });
  s.board.lines++;
}
