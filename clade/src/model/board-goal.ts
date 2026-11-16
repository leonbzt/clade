// The board's helpers that read and say: the seed's hash, the name of a build (rule 11), the next goal (rule 12).
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

const verb = (job: JobId) => jobName(job).toLowerCase();
const goal = (kind: Goal['kind'], place: number | null, job: JobId | null, text: string): Goal => ({ kind, place, job, text });
const widest = (opts: Option[]) => opts.reduce<Option | null>((w, o) => (!w || o.fit.value - o.holder!.value > w.fit.value - w.holder!.value ? o : w), null);

/** Rule 12: adopt, hold, race, take, beat, improve, wait; the first that applies. */
export function goalOf(b: Board, opts: Option[], coming: (place: number, job: JobId) => { named: Named; gens: number } | null): Goal {
  // Adopt: a variant better than the heir in its cell, or one with a key the heir lacks; the widest margin first.
  let adopt: { place: number; job: JobId; margin: number; text: string } | null = null;
  for (const p of b.places) for (const c of p.cells) {
    const v = c.variant;
    if (!c.holder?.mine || !v) continue;
    const site = siteOf(p), vf = fitness(v.build, c.job, site), hf = fitness(b.heir, c.job, site);
    const key = v.build.mutations.find((m) => MUTATION[m].kind === 'key' && !b.heir.mutations.includes(m));
    if (vf.value <= hf.value && !key) continue;
    const margin = vf.value - hf.value;
    const why = vf.value > hf.value ? `it reads ${vf.letter} there against your heir's ${hf.letter}` : `it ${MUTATION[key!].name.toLowerCase()}, which your heir cannot`;
    if (!adopt || margin > adopt.margin) adopt = { place: p.id, job: c.job, margin, text: `Adopt the variant (${v.what}) in ${p.name}: ${why}.` };
  }
  if (adopt) return goal('adopt', adopt.place, adopt.job, adopt.text);

  const name = (id: number) => b.places[id].name;
  const hold = opts.find((o) => o.act === 'improve' && b.places[o.place].cells.find((c) => c.job === o.job)!.holder!.fade > 0);
  if (hold) return goal('hold', hold.place, hold.job, `Hold ${name(hold.place)}: your line reads F at ${verb(hold.job)} there, and your heir reads ${hold.fit.letter}.`);

  const takes = opts.filter((o) => o.act === 'take');
  const races = takes.map((o) => ({ o, who: coming(o.place, o.job) })).filter((x) => x.who).sort((x, y) => x.who!.gens - y.who!.gens);
  if (races.length) {
    const { o, who } = races[0], n = who!.gens;
    return goal('race', o.place, o.job, `Take ${jobName(o.job)} in ${name(o.place)} before the ${who!.named.common.toLowerCase()} arrives in ${n} generation${n === 1 ? '' : 's'}.`);
  }
  if (takes.length) {
    const o = takes[0];
    return goal('take', o.place, o.job, `Take ${jobName(o.job)} in ${name(o.place)}: it is open, and your heir reads ${o.fit.letter} there.`);
  }
  const beat = widest(opts.filter((o) => o.act === 'beat'));
  if (beat) {
    const holder = b.places[beat.place].cells.find((c) => c.job === beat.job)!.holder!;
    return goal('beat', beat.place, beat.job, `Beat the ${callOf(holder.build)} at ${verb(beat.job)} in ${name(beat.place)}: your heir reads ${beat.fit.letter} against its ${beat.holder!.letter}.`);
  }
  const improve = widest(opts.filter((o) => o.act === 'improve'));
  if (improve) return goal('improve', improve.place, improve.job, `Improve your hold on ${verb(improve.job)} in ${name(improve.place)}: your heir reads ${improve.fit.letter} against ${improve.holder!.letter}.`);
  return goal('wait', null, null, 'Wait a Life: nothing in reach is open to your heir yet.');
}
