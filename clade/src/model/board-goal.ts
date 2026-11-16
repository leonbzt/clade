// The board's helpers that read and say: the seed's hash, the name of a build (rule 11), the next goal (C7).
// Nothing here may name a clade, a species or a mutation.
import type { Board, Goal, Option } from './board';
import type { Build, JobId, Named } from './types';
import { CLADE } from '../data/roster/clades';
import { DIAL_STEP } from '../data/roster/laws';
import { MUTATION } from '../data/roster/mutations';
import { SPECIES } from '../data/roster/species';
import { fitness, jobName } from './laws';
import { siteOf } from './board';

/** A stable 32-bit hash of the parts (FNV-1a): the board's only source of choice. */
export function hash(...parts: (string | number)[]): number {
  let h = 0x811c9dc5;
  for (const ch of parts.join(':')) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193);
  return h >>> 0;
}

/** Rule 11: the species of the build's clade within half a step on every dial, whose mutations the build has. */
export function nameOf(build: Build): Named | null {
  const dials = CLADE[build.clade]?.dials ?? [];
  let best: Named | null = null, bestGap = Infinity;
  for (const n of SPECIES) {
    if (n.build.clade !== build.clade || !n.build.mutations.every((m) => build.mutations.includes(m))) continue;
    let gap = 0, near = true;
    for (const d of dials) {
      const off = Math.abs((build.dials[d.id] ?? 0) - (n.build.dials[d.id] ?? 0)) / DIAL_STEP[d.id];
      if (off > 0.5 + 1e-9) { near = false; break; }
      gap += off;
    }
    if (near && gap < bestGap) { best = n; bestGap = gap; }
  }
  return best;
}

/** A build's name for news and goals: its species' common name, else its clade's. */
export const callOf = (build: Build) => nameOf(build)?.common.toLowerCase() ?? CLADE[build.clade].name.toLowerCase();

/** Dial steps between a build and a species of its clade. */
export const stepsTo = (build: Build, n: Named) => (CLADE[build.clade]?.dials ?? []).reduce((sum, d) => sum + Math.abs((build.dials[d.id] ?? 0) - (n.build.dials[d.id] ?? 0)) / DIAL_STEP[d.id], 0);

const verb = (job: JobId) => jobName(job).toLowerCase();
const goal = (kind: Goal['kind'], place: number | null, job: JobId | null, text: string): Goal => ({ kind, place, job, line: null, text });
const widest = (opts: Option[]) => opts.reduce<Option | null>((w, o) => (!w || o.fit.value - o.holder!.value > w.fit.value - w.holder!.value ? o : w), null);
type Lookup<T> = (place: number, job: JobId) => T;

/** C7's Adopt, only for what would not happen by itself: (a) a key no population of its line has, first; (b) a step
 *  nearer a card you lack that does not read higher than its holder, in the line's population nearest that card. */
function adoptGoal(b: Board, dest: Lookup<Named | null>): Goal | null {
  const held = b.places.flatMap((p) => p.cells.filter((c) => c.holder?.mine).map((c) => ({ p, c, h: c.holder!.build })));
  let card: Goal | null = null;
  for (const { p, c, h } of held) {
    const v = c.variant?.build;
    if (!v) continue;
    const kin = held.filter((x) => x.h.clade === h.clade);
    const key = v.mutations.find((m) => MUTATION[m].kind === 'key' && kin.every((x) => !x.h.mutations.includes(m)));
    if (key) return goal('adopt', p.id, c.job, `Adopt the variant (${c.variant!.what}) in ${p.name}: it ${MUTATION[key].name.toLowerCase()}, which no population of your line can.`);
    if (card) continue;
    const d = dest(p.id, c.job), site = siteOf(p);
    if (!d || b.cards.includes(d.id) || stepsTo(v, d) >= stepsTo(h, d)) continue;
    if (fitness(v, c.job, site).value > fitness(h, c.job, site).value) continue;
    if (kin.some((x) => x.c !== c && dest(x.p.id, x.c.job) === d && stepsTo(x.h, d) < stepsTo(h, d))) continue;
    card = goal('adopt', p.id, c.job, `Adopt the variant (${c.variant!.what}) in ${p.name}: it is a step nearer the ${d.common.toLowerCase()}, a card you lack.`);
  }
  return card;
}

/** C7: hold (part D), adopt, race, take, beat, improve, line (part D), wait; the first that applies. */
export function goalOf(b: Board, opts: Option[], coming: Lookup<{ named: Named; gens: number } | null>, dest: Lookup<Named | null>): Goal {
  const adopt = adoptGoal(b, dest);
  if (adopt) return adopt;

  const name = (id: number) => b.places[id].name;
  const takes = opts.filter((o) => o.act === 'take');
  const races = takes.map((o) => ({ o, who: coming(o.place, o.job) })).filter((x) => x.who).sort((x, y) => x.who!.gens - y.who!.gens);
  if (races.length) {
    const { o, who } = races[0], n = who!.gens;
    return goal('race', o.place, o.job, `Take ${jobName(o.job)} in ${name(o.place)} before the ${who!.named.common.toLowerCase()} arrives in ${n} generation${n === 1 ? '' : 's'}.`);
  }
  if (takes.length) {
    const o = takes[0];
    return goal('take', o.place, o.job, `Take ${jobName(o.job)} in ${name(o.place)}: it is open, and your line reads ${o.fit.letter} there.`);
  }
  const beat = widest(opts.filter((o) => o.act === 'beat'));
  if (beat) {
    const holder = b.places[beat.place].cells.find((c) => c.job === beat.job)!.holder!;
    return goal('beat', beat.place, beat.job, `Beat the ${callOf(holder.build)} at ${verb(beat.job)} in ${name(beat.place)}: your line reads ${beat.fit.letter} against its ${beat.holder!.letter}.`);
  }
  const improve = widest(opts.filter((o) => o.act === 'improve'));
  if (improve) return goal('improve', improve.place, improve.job, `Improve your population at ${verb(improve.job)} in ${name(improve.place)}: a new founder reads ${improve.fit.letter} against ${improve.holder!.letter}.`);
  return goal('wait', null, null, 'Wait a Life: nothing in reach is open to your line yet.');
}
