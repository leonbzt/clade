// The news of a Life (N4 C), grouping ported from game/src/sim/sea-news.ts: what the sea did while you lived. Any
// change over `NEWS.change`, arrival, bud or loss is one story; the same story in several habitats is one line, and every
// line names its largest term in tier talk. Read from the step reports and the populations before; changes nothing.
import { YOUR_LINE } from '../data/lines';
import { NEWS } from '../data/sea';
import { termLetter } from './fitness';
import type { Habitat } from './habitats';
import type { Id, Species, World } from './records';
import { bestSlot, ranksOf, type StepReport } from './sea';
import type { Bud } from './wild';

/** Grams per species, per habitat id. */
export type Pops = Record<number, Record<Id, number>>;
export const popsOf = (world: World): Pops => Object.fromEntries(world.habitats.map((h) => [h.id, { ...h.pops }]));

export type Kind = 'bud' | 'arrive' | 'lost' | 'rise' | 'fall';
export interface Headline { kind: Kind; species: Id; yours: boolean; cause: string; habitats: number[]; from: number; to: number; text: string }

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
  const mine = (s?: Species) => s?.lineage === YOUR_LINE;
  const called = (s: Species) => `${mine(s) ? 'your ' : ''}${s.name}`;
  // Survival over the Life, as measured: the grams hunted against all the grams it had there.
  const survival = (h: number, id: Id) => {
    const s = sum(h, id), had = (before[h]?.[id] ?? 0) + s.born + s.into;
    let lost = 0;
    for (const g of s.by.values()) lost += g;
    return termLetter(had > 0 ? Math.max(0, 1 - lost / had) : 1);
  };
  const SLOT = { mats: 'graze mats', detritus: 'dig detritus', prey: 'hunt prey' };
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
        if (prey) yours ||= mine(prey);
        cause = `from ${bud.parent.name}, ${SLOT[bud.slot]} ${bud.letter}${prey ? `, hunts ${called(prey)}: survival ${survival(h.id, prey.id)}` : ''}`;
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
      else stories.set(key, { kind, species: id, yours, cause, habitats: [h.id], from, to, text: '' });
    }
  }

  const size = (l: Headline) => Math.abs(l.to - l.from);
  const lines = [...stories.values()].sort((a, b) => Number(b.yours) - Number(a.yours) || size(b) - size(a)).slice(0, NEWS.most);
  for (const l of lines) l.text = textOf(known.get(l.species)!, l, habitatName);
  return lines;
}

/** "Wild proboscis worm budded in Lee mud flats from Bulb worm, hunts your Bulb worm: survival C." */
function textOf(sp: Species, l: Headline, habitatName: (id: number) => string): string {
  const name = `${sp.lineage === YOUR_LINE ? 'Your ' : ''}${sp.name}`;
  const where = l.habitats.length === 1 ? habitatName(l.habitats[0]) : `${l.habitats.length} habitats`;
  const pct = `${Math.round((100 * Math.abs(l.to - l.from)) / Math.max(1e-9, l.from))}%`;
  const verb = { bud: 'budded in', arrive: 'arrived in', lost: 'died out in', rise: `rose ${pct} in`, fall: `fell ${pct} in` }[l.kind];
  return `${name} ${verb} ${where}${l.kind === 'bud' ? ' ' : ': '}${l.cause}.`;
}
