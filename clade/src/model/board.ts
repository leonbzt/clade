// The wide toy's board rules (W1 part A): cells, a Life as one tap, colonists and variants on bars, the next goal.
// The signatures and shapes are the contract (docs/slices/w1-the-wide-toy.md); the bodies are part A's work.
// Numbers come from data/roster/toy.ts; every judgement comes from model/laws.ts. No dice: the same seed and the
// same taps give the same board. Nothing here may name a clade, a species or a mutation.
import type { Build, Fitness, HabitatKind, JobId, Named, Site } from './types';
import { CLADE } from '../data/roster/clades';
import { KIND } from '../data/roster/kinds';
import { DIAL_STEP } from '../data/roster/laws';
import { MUTATION } from '../data/roster/mutations';
import { SPECIES } from '../data/roster/species';
import { HOME, PLACES, START, TOY } from '../data/roster/toy';
import { candidates, fitness, jobName, jobsAt, type Candidate } from './laws';
import { callOf, goalOf, hash, nameOf as nameOfBuild } from './board-goal';

/** Who holds a cell. `fade` counts the generations in a row its letter has read F. */
export interface Holder { build: Build; mine: boolean; grams: number; fade: number }
/** A challenger beside your holder: the heir one dial step away, or with one mutation more. `left` generations
 *  until it goes. `what` says the difference in the clade's own words. */
export interface Variant { build: Build; what: string; left: number }
/** One job of one place. `bar` counts up to a colonist while the cell is open; `variantBar` up to the next variant
 *  while you hold it; `variants` is how many it has had. */
export interface Cell { job: JobId; holder: Holder | null; bar: number; variantBar: number; variant: Variant | null; variants: number }
export interface Place { id: number; name: string; kind: HabitatKind; area: number; next: number[]; cells: Cell[] }
/** `main` is the clade you play; `heir` is the build a Life founds. `news` is newest last, one cause a line. */
export interface Board { seed: number; gen: number; main: string; heir: Build; places: Place[]; news: string[] }

export type Act = 'take' | 'beat' | 'improve';
/** A Life you could live now. `fit` is the heir on the job; `holder` is the holder's fitness there, if any. */
export interface Option { place: number; job: JobId; act: Act; fit: Fitness; holder: Fitness | null }
export type GoalKind = 'adopt' | 'hold' | 'race' | 'take' | 'beat' | 'improve' | 'wait';
/** The one next goal: a sentence that names the place and gives one reason. `wait` has no place. */
export interface Goal { kind: GoalKind; place: number | null; job: JobId | null; text: string }

const openCell = (job: JobId): Cell => ({ job, holder: null, bar: 0, variantBar: 0, variant: null, variants: 0 });
const cellAt = (b: Board, place: number, job: JobId) => b.places[place]?.cells.find((c) => c.job === job);
const say = (b: Board, line: string) => { b.news.push(line); if (b.news.length > TOY.news) b.news.splice(0, b.news.length - TOY.news); };
const firstReason = (f: Fitness) => f.reasons.find((r) => r.length > 0) ?? 'it cannot hold on';

/** Rule 1: one cell per job that exists, in order. A cell whose job is gone goes, its holder with it. */
function syncCells(b: Board, place: Place): void {
  for (let guard = 0; guard < 8; guard++) {
    const jobs = jobsAt(siteOf(place));
    const same = jobs.length === place.cells.length && jobs.every((j, i) => place.cells[i].job === j);
    if (same) return;
    for (const c of place.cells) if (!jobs.includes(c.job) && c.holder) say(b, `${place.name}: the ${callOf(c.holder.build)} loses its place to ${jobName(c.job).toLowerCase()}; the job is gone.`);
    place.cells = jobs.map((j) => place.cells.find((c) => c.job === j) ?? openCell(j));
  }
}

/** The young island: every place of data/roster/toy.ts, its producer if one grows there, no animals, nothing yours. */
export function newBoard(seed: number, heir: Build = START): Board {
  const b: Board = { seed, gen: 0, main: heir.clade, heir, places: [], news: [] };
  for (const row of PLACES) {
    const place: Place = { id: row.id, name: row.name, kind: KIND[row.kind], area: row.area, next: [...row.next], cells: [] };
    place.cells = jobsAt(siteOf(place)).map(openCell);
    const light = place.cells.find((c) => c.job === 'light');
    const best = light ? candidates('light', siteOf(place), SPECIES)[0] : undefined;
    if (light && best && best.fit.letter !== 'F') light.holder = { build: best.named.build, mine: false, grams: best.fit.grams, fade: 0 };
    syncCells(b, place);
    b.places.push(place);
  }
  return b;
}

/** A place as the laws read it. */
export function siteOf(place: Place): Site {
  return { kind: place.kind, area: place.area, pops: place.cells.filter((c) => c.holder).map((c) => ({ build: c.holder!.build, job: c.job, grams: c.holder!.grams })) };
}

/** Rule 3: home, where you hold a cell, and next to one. */
function reach(b: Board): Set<number> {
  const out = new Set<number>([HOME]);
  for (const p of b.places) if (p.cells.some((c) => c.holder?.mine)) { out.add(p.id); for (const n of p.next) out.add(n); }
  return out;
}
/** Rule 7: the sea places where colonist bars run. */
function barPlaces(b: Board): Set<number> {
  const out = new Set<number>();
  for (const p of b.places) if (p.cells.some((c) => c.holder?.mine)) { out.add(p.id); if (TOY.barsNextDoor) for (const n of p.next) out.add(n); }
  return new Set([...out].filter((id) => b.places[id].kind.realm === 'sea'));
}
/** Who would come to this open cell: one of the best `TOY.pick` candidates, picked by the seed and the cell. */
function comer(b: Board, place: Place, cell: Cell): Candidate | null {
  if (cell.job === 'light' || cell.holder) return null;
  const pool = candidates(cell.job, siteOf(place), SPECIES).filter((c) => c.named.build.clade !== b.main && c.fit.letter !== 'F').slice(0, TOY.pick);
  return pool.length ? pool[hash(b.seed, place.id, cell.job) % pool.length] : null;
}

function colonists(b: Board): void {
  const run = barPlaces(b);
  for (const place of b.places) {
    let arrived = false;
    for (const cell of place.cells) {
      if (cell.job === 'light' || cell.holder) continue;
      const who = run.has(place.id) ? comer(b, place, cell) : null;
      if (!who) { cell.bar = 0; continue; }
      cell.bar += 1;
      if (cell.bar < TOY.colonistBar) continue;
      if (arrived) { cell.bar = TOY.colonistBar - 1; continue; }
      arrived = true;
      cell.bar = 0;
      cell.holder = { build: who.named.build, mine: false, grams: who.fit.grams, fade: 0 };
      say(b, `${place.name}: the ${who.named.common.toLowerCase()} arrives to ${jobName(cell.job).toLowerCase()}.`);
    }
  }
}

const valueIn = (build: Build, job: JobId, place: Place) => fitness(build, job, siteOf(place)).value;

/** Rule 8: one dial step of the heir, or every `TOY.rare`-th variant one mutation it lacks. */
function makeVariant(b: Board, place: Place, cell: Cell): Variant | null {
  const heir = b.heir, c = CLADE[heir.clade], h = hash(b.seed, place.id, cell.job, cell.variants);
  if ((cell.variants + 1) % TOY.rare === 0) {
    const lacking = c.mutations.filter((m) => !heir.mutations.includes(m));
    const keys = lacking.filter((m) => MUTATION[m].kind === 'key'), plain = lacking.filter((m) => MUTATION[m].kind !== 'key');
    const pool = place.kind.edge && keys.length ? keys : plain.length ? plain : place.kind.edge ? keys : [];
    if (pool.length) {
      const m = pool[h % pool.length];
      return { build: { ...heir, dials: { ...heir.dials }, mutations: [...heir.mutations, m] }, what: MUTATION[m].name.toLowerCase(), left: TOY.variantStay };
    }
  }
  for (let k = 0; k < c.dials.length; k++) {
    const d = c.dials[(h + k) % c.dials.length], now = heir.dials[d.id] ?? 0;
    const up = ((h >>> 8) & 1) === 1;
    for (const dir of up ? [1, -1] : [-1, 1]) {
      const v = now + dir * DIAL_STEP[d.id];
      if (v < d.min - 1e-9 || v > d.max + 1e-9) continue;
      const what = d.id === 'size' ? (dir > 0 ? 'bigger' : 'smaller') : `${dir > 0 ? 'more' : 'less'} ${d.word}`;
      return { build: { ...heir, dials: { ...heir.dials, [d.id]: v }, mutations: [...heir.mutations] }, what, left: TOY.variantStay };
    }
  }
  return null;
}

function variants(b: Board): void {
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
      if (nv) { cell.variant = nv; say(b, `${place.name}: a variant of your line shows up: ${nv.what}.`); }
    }
  }
}

/** Rule 10: grams from the laws, cells in order; F for `TOY.fade` generations in a row opens the cell. */
function grams(b: Board): void {
  for (const place of b.places) for (const cell of place.cells) {
    const h = cell.holder;
    if (!h) continue;
    const f = fitness(h.build, cell.job, siteOf(place));
    h.grams = f.grams;
    h.fade = f.letter === 'F' ? h.fade + 1 : 0;
    if (h.fade >= TOY.fade) {
      cell.holder = null; cell.variant = null; cell.bar = 0; cell.variantBar = 0;
      say(b, `${place.name}: the ${h.mine ? 'line of yours' : callOf(h.build)} dies out at ${jobName(cell.job).toLowerCase()}: ${firstReason(f).replace(/\.$/, '').toLowerCase()}.`);
    }
  }
}

/** One generation: grams, fading, colonist bars, variant bars, cells that appear and go. */
export function step(board: Board): void {
  board.gen += 1;
  colonists(board);
  variants(board);
  grams(board);
  for (const place of board.places) syncCells(board, place);
}

/** Every Life you could live now, best value first. */
export function options(board: Board): Option[] {
  const out: Option[] = [];
  for (const id of [...reach(board)].sort((x, y) => x - y)) {
    const place = board.places[id], site = siteOf(place), own = place.cells.find((c) => c.holder?.mine);
    for (const cell of place.cells) {
      if (own && own !== cell) continue;
      const fit = fitness(board.heir, cell.job, site);
      if (fit.letter === 'F') continue;
      const h = cell.holder;
      if (!h) { out.push({ place: id, job: cell.job, act: 'take', fit, holder: null }); continue; }
      if (h.mine && JSON.stringify(h.build) === JSON.stringify(board.heir)) continue;
      const hf = fitness(h.build, cell.job, site);
      if (fit.value > hf.value) out.push({ place: id, job: cell.job, act: h.mine ? 'improve' : 'beat', fit, holder: hf });
    }
  }
  return out.sort((x, y) => y.fit.value - x.fit.value);
}

/** One Life: found the heir in this cell, then `TOY.lifeGens` generations pass. False (and nothing changes) if it
 *  is not one of `options`. */
export function live(board: Board, place: number, job: JobId): boolean {
  const o = options(board).find((x) => x.place === place && x.job === job);
  const cell = cellAt(board, place, job);
  if (!o || !cell) return false;
  const was = cell.holder;
  cell.holder = { build: board.heir, mine: true, grams: o.fit.grams, fade: 0 };
  Object.assign(cell, { bar: 0, variantBar: 0, variant: null, variants: 0 });
  const verb = jobName(job).toLowerCase(), p = board.places[place].name;
  say(board, o.act === 'take' ? `${p}: your line takes the open cell to ${verb}.`
    : o.act === 'beat' ? `${p}: your line beats the ${callOf(was!.build)} to ${verb}.`
      : `${p}: your heir improves your line's hold to ${verb}.`);
  for (let i = 0; i < TOY.lifeGens; i++) step(board);
  return true;
}

/** Take the variant in a cell of yours: it becomes the heir and holds the cell. No time passes. */
export function adopt(board: Board, place: number, job: JobId): boolean {
  const cell = cellAt(board, place, job), v = cell?.variant;
  if (!cell?.holder?.mine || !v) return false;
  board.heir = v.build;
  cell.holder.build = v.build;
  cell.variant = null;
  say(board, `${board.places[place].name}: you adopt the variant (${v.what}); it is your heir now.`);
  syncCells(board, board.places[place]);
  return true;
}

/** Who is on the way to an open cell and in how many generations; null if no bar runs there. */
export function coming(board: Board, place: number, job: JobId): { named: Named; gens: number } | null {
  const p = board.places[place], cell = cellAt(board, place, job);
  if (!p || !cell || !barPlaces(board).has(place)) return null;
  const who = comer(board, p, cell);
  return who ? { named: who.named, gens: TOY.colonistBar - cell.bar } : null;
}

/** The real species a build is, if its dials sit within half a step of one and it has that species' mutations. */
export function nameOf(build: Build): Named | null { return nameOfBuild(build); }

/** The one next goal. */
export function nextGoal(board: Board): Goal { return goalOf(board, options(board), (p, j) => coming(board, p, j)); }
