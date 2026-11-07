// The living sea, ported from the slice 17 toy: the headlines. The same story within a few generations is one line, and every line says why.
import { SEA } from '../data/sea';
import type { Event, Sea } from './sea';

export interface Headline { kind: Event['kind']; sp: number; cause: string; patches: number[]; from: number; to: number; gen: number }

const worthTelling = (s: Sea, e: Event) => s.species[e.sp].line || (e.kind === 'crash' ? e.from - e.to >= SEA.tellCrash : e.kind === 'boom' ? e.to >= SEA.tellBoom : true);

/** Add a generation's events to the list, newest first. Within a few generations, the same story anywhere on the map is one line, so a wave reads as one event. */
export function tell(s: Sea, list: Headline[], events: Event[]) {
  for (const e of events) {
    if (!worthTelling(s, e)) continue;
    const line = list.find((h) => s.gen - h.gen <= SEA.mergeGens && h.kind === e.kind && h.sp === e.sp && h.cause === e.cause);
    if (!line) { list.unshift({ kind: e.kind, sp: e.sp, cause: e.cause, patches: [e.patch], from: e.from, to: e.to, gen: s.gen }); continue; }
    if (!line.patches.includes(e.patch)) { line.patches.push(e.patch); line.from += e.from; line.to += e.to; }
  }
  list.sort((a, b) => b.gen - a.gen);
  if (list.length > SEA.keepLines) list.length = SEA.keepLines;
}

const VERB = { crash: 'crashed', boom: 'boomed', spread: 'spread' };
function place(s: Sea, h: Headline) {
  const grounds = new Set(h.patches.map((q) => s.patches[q].ground)), kind = grounds.size === 1 ? `${[...grounds][0]} ` : '';
  return h.patches.length === 1 ? `a ${kind}patch` : `${h.patches.length} ${kind}patches`;
}
/** "Wiwaxia crashed on 5 sand patches: mats ran out, 62 → 9." */
export function headlineText(s: Sea, h: Headline) {
  const where = `${s.species[h.sp].name} ${VERB[h.kind]} ${h.kind === 'spread' ? 'to' : 'on'} ${place(s, h)}`;
  return h.kind === 'spread' ? `${where}: ${h.cause}.` : `${where}: ${h.cause}, ${Math.round(h.from)} → ${Math.round(h.to)}.`;
}

/** "While you were away": at most five lines. Yours first, then the biggest crash, boom and spread, then whatever was biggest. */
export function awayLines(s: Sea, list: Headline[], most = 5): Headline[] {
  const size = (h: Headline) => Math.abs(h.from - h.to) * h.patches.length, by = (a: Headline, b: Headline) => size(b) - size(a), out: Headline[] = [];
  const take = (h?: Headline) => { if (h && !out.includes(h) && out.length < most) out.push(h); };
  list.filter((h) => s.species[h.sp].line).sort(by).slice(0, 2).forEach(take);
  for (const kind of ['crash', 'boom', 'spread'] as const) take(list.filter((h) => h.kind === kind).sort(by)[0]);
  [...list].sort(by).forEach(take);
  return out;
}
