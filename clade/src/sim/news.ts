// The news of a Life (N4 C), grouping ported from game/src/sim/sea-news.ts: what the sea did while you lived. Any
// change over `NEWS.change`, arrival, wild cousin or loss is one story; the same story in several habitats is one line, and every
// line names its largest term in tier talk. Read from the step reports and the populations before; changes nothing.
import { NEWS } from '../data/sea';
import { isYours } from './build';
import { slots, termLetter } from './fitness';
import type { Habitat } from './habitats';
import type { Id, SlotId, Species, World } from './records';
import { bestSlot, ranksOf, type StepReport } from './sea';
import { cousinFor, cousinIn, type Bud } from './wild';

/** Grams per species, per habitat id. */
export type Pops = Record<number, Record<Id, number>>;
export const popsOf = (world: World): Pops => Object.fromEntries(world.habitats.map((h) => [h.id, { ...h.pops }]));

export type Kind = 'bud' | 'arrive' | 'lost' | 'rise' | 'fall';
export interface Headline { kind: Kind; species: Id; yours: boolean; cause: string; habitats: number[]; from: number; to: number; text: string; slot?: SlotId }
const CELL: Record<SlotId, string> = { mats: 'Graze', detritus: 'Dig', prey: 'Hunt' };

interface Sum { born: number; died: number; into: number; out: number; by: Map<Id, number>; eats: Map<Id, number>; sources: Map<number, number>; dests: Map<number, number> }
const add = <K>(m: Map<K, number>, k: K, g: number) => m.set(k, (m.get(k) ?? 0) + g);
const largest = <K>(m: Map<K, number>): [K, number] | undefined => [...m].reduce<[K, number] | undefined>((a, b) => (!a || b[1] > a[1] ? b : a), undefined);

/** The Life's news, yours first, then the biggest changes; at most `NEWS.most` lines. */
export function news(world: World, before: Pops, reports: StepReport[]): Headline[] {
  const sums = new Map<string, Sum>(), buds = new Map<string, Bud>(), known = new Map(world.species.map((s) => [s.id, s]));
  const sum = (h: number, id: Id) => {
    const key = `${h}|${id}`;
    let s = sums.get(key);
    if (!s) sums.set(key, (s = { born: 0, died: 0, into: 0, out: 0, by: new Map(), eats: new Map(), sources: new Map(), dests: new Map() }));
    return s;
  };
  for (const r of reports) {
    for (const t of r.tallies) { const s = sum(t.habitat, t.species); s.born += t.born; s.died += t.died; }
    for (const t of r.hunts) { add(sum(t.habitat, t.prey).by, t.hunter, t.grams); add(sum(t.habitat, t.hunter).eats, t.prey, t.grams); }
    for (const m of r.moves) {
      const out = sum(m.from, m.species), into = sum(m.to, m.species);
      out.out += m.grams; add(out.dests, m.to, m.grams);
      into.into += m.grams; add(into.sources, m.from, m.grams);
    }
    for (const b of r.buds) { const key = `${b.habitat}|${b.species.id}`; if (!buds.has(key)) buds.set(key, b); known.set(b.species.id, b.species); }
    for (const s of r.gone) if (!known.has(s.id)) known.set(s.id, s);
  }
  const habitatName = (id: number) => world.habitats.find((h) => h.id === id)?.name ?? 'a habitat';
  const mine = (s?: Species) => !!s && isYours(s);
  const called = (s: Species) => `${mine(s) ? 'your ' : ''}${s.name}`;
  // Survival over the Life, as measured: the grams hunted against all the grams it had there.
  const survival = (h: number, id: Id) => {
    const s = sum(h, id), had = (before[h]?.[id] ?? 0) + s.born + s.into;
    let lost = 0;
    for (const g of s.by.values()) lost += g;
    return termLetter(had > 0 ? Math.max(0, 1 - lost / had) : 1);
  };
  const food = (s: Species, h: Habitat, good: boolean) => {
    const best = bestSlot(s.build, ranksOf(world, s.lineage), h, world);
    return best ? `${good ? 'fed well' : 'food ran short'}, ${best.slot.name.toLowerCase()} ${best.fit.letter}` : 'nothing it can eat here';
  };

  const stories = new Map<string, Headline>();
  for (const h of world.habitats) {
    const ids = new Set([...Object.keys(before[h.id] ?? {}), ...Object.keys(h.pops)]);
    for (const id of ids) {
      const sp = known.get(id);
      if (!sp) continue;
      const from = before[h.id]?.[id] ?? 0, to = h.pops[id] ?? 0, s = sum(h.id, id), bud = buds.get(`${h.id}|${id}`);
      let kind: Kind, cause: string, yours = mine(sp);
      if (bud && from <= 0) {
        if (to <= 0) continue; // budded and gone again within the Life: not a story
        kind = 'bud';
        const [preyId] = largest(s.eats) ?? [];
        const prey = preyId === undefined ? undefined : known.get(preyId);
        yours = mine(bud.parent) || mine(prey); // a cousin of yours, or one that eats yours, is your news
        cause = `${sp.name} (${bud.letter}), from ${called(bud.parent)}${prey ? `, hunts ${called(prey)}: survival ${survival(h.id, prey.id)}` : ''}`;
      } else {
        if (from <= 0 && to > 0) kind = 'arrive';
        else if (from > 0 && to <= 0) kind = 'lost';
        else if (to > from * (1 + NEWS.change)) kind = 'rise';
        else if (to < from * (1 - NEWS.change)) kind = 'fall';
        else continue;
        if (kind === 'arrive' || kind === 'rise') {
          const [source] = largest(s.sources) ?? [];
          cause = s.into > s.born && source !== undefined ? `came from ${habitatName(source)}` : food(sp, h, true);
        } else {
          const hunter = largest(s.by), [dest] = largest(s.dests) ?? [];
          const top = Math.max(s.died, s.out, hunter?.[1] ?? 0);
          if (hunter && hunter[1] === top) {
            const by = known.get(hunter[0]);
            cause = `${by ? called(by) : 'a hunter'} hunts it: survival ${survival(h.id, id)}`;
          } else if (s.out === top && dest !== undefined) cause = `moved on to ${habitatName(dest)}`;
          else cause = food(sp, h, false);
        }
      }
      const key = `${kind}|${id}|${cause}`, story = stories.get(key);
      if (story) { story.habitats.push(h.id); story.from += from; story.to += to; }
      else stories.set(key, { kind, species: id, yours, cause, habitats: [h.id], from, to, text: '', slot: bud?.slot });
    }
  }

  const size = (l: Headline) => Math.abs(l.to - l.from);
  const lines = [...stories.values()].sort((a, b) => Number(b.yours) - Number(a.yours) || size(b) - size(a)).slice(0, NEWS.most);
  for (const l of lines) l.text = textOf(known.get(l.species)!, l, habitatName);
  return lines;
}

/** "A wild cousin took Graze in Lee shallows: Wild bulb worm (C), from your Tentacle worm." */
function textOf(sp: Species, l: Headline, habitatName: (id: number) => string): string {
  const name = `${isYours(sp) ? 'Your ' : ''}${sp.name}`;
  const where = l.habitats.length === 1 ? habitatName(l.habitats[0]) : `${l.habitats.length} habitats`;
  if (l.kind === 'bud') return `A wild cousin took ${CELL[l.slot ?? 'mats']} in ${where}: ${l.cause}.`;
  const pct = `${Math.round((100 * Math.abs(l.to - l.from)) / Math.max(1e-9, l.from))}%`;
  const verb = { arrive: 'arrived in', lost: 'died out in', rise: `rose ${pct} in`, fall: `fell ${pct} in` }[l.kind];
  return `${name} ${verb} ${where}: ${l.cause}.`;
}

/** The quiet line: the open cell whose wild cousin is nearest, or null. A cell where nothing on the leash fits today
 *  is passed over: its bar runs, but it stays open for you. */
export function nearestBar(world: World): { habitat: number; text: string } | null {
  for (const [key] of Object.entries(world.bars).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    const [id, slot] = key.split(':') as [string, SlotId], h = world.habitats.find((x) => x.id === +id);
    const cell = h && slots(h, world).find((s) => s.id === slot);
    if (!h || !cell || !cousinFor(world, h, cell)) continue;
    const left = cousinIn(world, h.id, slot)!;
    return { habitat: h.id, text: `A wild cousin takes ${CELL[slot]} in ${h.name} in ${left} generation${left === 1 ? '' : 's'}.` };
  }
  return null;
}
