// The board's populations (W1 round two, part C): founders (C1), destinations (C4), variants (C3).
// Nothing here may name a clade, a species or a mutation.
import type { Board, Cell, Place, Variant } from './board';
import type { Build, DialSpec, Id, JobId, Named } from './types';
import { CLADE } from '../data/roster/clades';
import { DIAL_STEP } from '../data/roster/laws';
import { MUTATION } from '../data/roster/mutations';
import { SPECIES } from '../data/roster/species';
import { TOY } from '../data/roster/toy';
import { fitness, jobName } from './laws';
import { siteOf } from './board';
import { hash, nameOf } from './board-goal';

export const copyBuild = (b: Build): Build => ({ clade: b.clade, dials: { ...b.dials }, mutations: [...b.mutations] });
export const cellAt = (b: Board, place: number, job: JobId) => b.places[place]?.cells.find((c) => c.job === job);
export const say = (b: Board, line: string) => { b.news.push(line); if (b.news.length > TOY.news) b.news.splice(0, b.news.length - TOY.news); };
export const valueIn = (build: Build, job: JobId, place: Place) => fitness(build, job, siteOf(place)).value;
export const keysOf = (build: Build) => build.mutations.filter((m) => MUTATION[m].kind === 'key');

/** C1: of the line's holders in this place or next to it, and its start build, the best-reading here; null if F. */
export function founderOf(b: Board, place: number, job: JobId, line: Id): Build | null {
  const p = b.places[place], start = b.starts[line];
  if (!p || !start || !cellAt(b, place, job)) return null;
  const site = siteOf(p);
  let best = start, top = fitness(start, job, site);
  for (const q of b.places) {
    if (q.id !== place && !p.next.includes(q.id)) continue;
    for (const c of q.cells) {
      const h = c.holder;
      if (!h?.mine || h.build.clade !== line) continue;
      const f = fitness(h.build, job, site);
      if (f.value > top.value) { best = h.build; top = f; }
    }
  }
  return top.letter === 'F' ? null : copyBuild(best);
}

/** C4: a named holder of yours is heading for itself; else the best-reading species of its clade here (given the
 *  holder's mutations) whose card you lack, or the best-reading if you have them all. */
export function destinationOf(b: Board, place: number, job: JobId): Named | null {
  const p = b.places[place], h = cellAt(b, place, job)?.holder;
  if (!p || !h?.mine) return null;
  const named = nameOf(h.build);
  if (named) return named;
  const site = siteOf(p);
  const ranked = SPECIES.filter((n) => n.build.clade === h.build.clade)
    .map((n) => ({ n, f: fitness({ ...n.build, mutations: [...h.build.mutations] }, job, site) }))
    .filter((x) => x.f.letter !== 'F')
    .sort((x, y) => y.f.value - x.f.value);
  return (ranked.find((x) => !b.cards.includes(x.n.id)) ?? ranked[0])?.n ?? null;
}

/** One dial step of a build in one direction, or null if that leaves the clade's range. */
function dialStep(h: Build, d: DialSpec, dir: number): Variant | null {
  const v = (h.dials[d.id] ?? 0) + dir * DIAL_STEP[d.id];
  if (v < d.min - 1e-9 || v > d.max + 1e-9) return null;
  const what = d.id === 'size' ? (dir > 0 ? 'bigger' : 'smaller') : `${dir > 0 ? 'more' : 'less'} ${d.word}`;
  return { build: { ...copyBuild(h), dials: { ...h.dials, [d.id]: v } }, what, left: TOY.variantStay };
}

/** C3: from the cell's own holder. Every `TOY.rare`-th a mutation it lacks (rule 8's pick); else one step toward the
 *  cell's destination on the farthest dial, nothing when every dial is within half a step; no destination: a hash step. */
function makeVariant(b: Board, place: Place, cell: Cell): Variant | null {
  const h = cell.holder!.build, c = CLADE[h.clade], seed = hash(b.seed, place.id, cell.job, cell.variants);
  if ((cell.variants + 1) % TOY.rare === 0) {
    const lacking = c.mutations.filter((m) => !h.mutations.includes(m));
    const keys = lacking.filter((m) => MUTATION[m].kind === 'key'), plain = lacking.filter((m) => MUTATION[m].kind !== 'key');
    const pool = place.kind.edge && keys.length ? keys : plain;
    if (pool.length) {
      const m = pool[seed % pool.length];
      return { build: { ...copyBuild(h), mutations: [...h.mutations, m] }, what: MUTATION[m].name.toLowerCase(), left: TOY.variantStay };
    }
  }
  const dest = destinationOf(b, place.id, cell.job);
  if (dest) {
    const far = c.dials.map((d) => ({ d, off: ((dest.build.dials[d.id] ?? 0) - (h.dials[d.id] ?? 0)) / DIAL_STEP[d.id] }))
      .filter((x) => Math.abs(x.off) > 0.5 + 1e-9)
      .sort((x, y) => Math.abs(y.off) - Math.abs(x.off));
    for (const { d, off } of far) { const v = dialStep(h, d, Math.sign(off)); if (v) return v; }
    return null;
  }
  for (let k = 0; k < c.dials.length; k++) {
    const d = c.dials[(seed + k) % c.dials.length], up = ((seed >>> 8) & 1) === 1;
    for (const dir of up ? [1, -1] : [-1, 1]) { const v = dialStep(h, d, dir); if (v) return v; }
  }
  return null;
}

/** Rule 8 with C3: in each cell of yours a variant bar; a variant that reads higher than its holder takes the cell. */
export function variants(b: Board): void {
  for (const place of b.places) for (const cell of place.cells) {
    if (!cell.holder?.mine) { cell.variant = null; continue; }
    const v = cell.variant;
    if (v && --v.left <= 0) {
      cell.variant = null;
      if (valueIn(v.build, cell.job, place) > valueIn(cell.holder.build, cell.job, place)) {
        cell.holder.build = v.build;
        say(b, `${place.name}: your variant (${v.what}) wins the cell to ${jobName(cell.job).toLowerCase()}.`);
      } else say(b, `${place.name}: your variant (${v.what}) does no better and dies out.`);
    }
    cell.variantBar += 1;
    if (cell.variantBar >= TOY.variantBar) {
      cell.variantBar = 0;
      const nv = makeVariant(b, place, cell);
      cell.variants += 1;
      if (nv) { cell.variant = nv; say(b, `${place.name}: a variant of your population shows up: ${nv.what}.`); }
    }
  }
}
