// The wide toy's board rules (W1): cells, a Life as one tap, colonists and variants on bars, the next goal.
// The signatures and shapes are the contract (docs/slices/w1-the-wide-toy.md); the bodies are the builders' work.
// Round two (16 Nov): part C (populations radiate) is built; `rivalOf`, `nextLine` and `setMain` throw until part D.
// Numbers come from data/roster/toy.ts; every judgement comes from model/laws.ts. No dice: the same seed and the
// same taps give the same board. Nothing here may name a clade, a species or a mutation.
import type { Build, Fitness, HabitatKind, Id, JobId, Named, Site } from './types';
import { KIND } from '../data/roster/kinds';
import { SPECIES } from '../data/roster/species';
import { HOME, PLACES, START, TOY } from '../data/roster/toy';
import { candidates, fitness, jobName, jobsAt, type Candidate } from './laws';
import { callOf, goalOf, hash, nameOf as nameOfBuild } from './board-goal';
import { cellAt, copyBuild, destinationOf, founderOf, keysOf, say, variants } from './board-pop';

/** Who holds a cell. `fade` counts the generations in a row its letter has read F. */
export interface Holder { build: Build; mine: boolean; grams: number; fade: number }
/** A challenger beside your population: its holder one dial step away, or with one mutation more. `left`
 *  generations until it goes. `what` says the difference in the clade's own words. */
export interface Variant { build: Build; what: string; left: number }
/** A wild species on its way to take a held cell (part D): `id` is its `Named` id, `bar` counts up to TOY.rivalBar. */
export interface Rival { id: Id; bar: number }
/** One job of one place. `bar` counts up to a colonist while the cell is open; `variantBar` up to the next variant
 *  while you hold it; `variants` is how many it has had; `rival` is who is coming for a held cell. */
export interface Cell { job: JobId; holder: Holder | null; bar: number; variantBar: number; variant: Variant | null; variants: number; rival: Rival | null }
export interface Place { id: number; name: string; kind: HabitatKind; area: number; next: number[]; cells: Cell[] }
/** `main` is the line you play, one of `lines` (the clades open to you). `starts` holds each open line's first build.
 *  `cards` are the ids of the named species a population of yours has been, in the order won. `news` is newest last,
 *  one cause a line. A Life founds from `founder`. */
export interface Board { seed: number; gen: number; main: Id; lines: Id[]; starts: Record<Id, Build>; cards: Id[]; places: Place[]; news: string[] }

export type Act = 'take' | 'beat' | 'improve';
/** A Life you could live now. `from` is the build it founds (`founder`), `fit` is that build on the job; `holder` is
 *  the holder's fitness there, if any. */
export interface Option { place: number; job: JobId; act: Act; from: Build; fit: Fitness; holder: Fitness | null }
export type GoalKind = 'hold' | 'adopt' | 'race' | 'take' | 'beat' | 'improve' | 'line' | 'wait';
/** The one next goal: a sentence that names the place and gives one reason. `wait` has no place. `line` is set on a
 *  `line` goal only: the open line to main next (`setMain`); its place and job are that line's best option. */
export interface Goal { kind: GoalKind; place: number | null; job: JobId | null; line: Id | null; text: string }

const openCell = (job: JobId): Cell => ({ job, holder: null, bar: 0, variantBar: 0, variant: null, variants: 0, rival: null });
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

/** The young island: every place of data/roster/toy.ts, its producer if one grows there, no animals, nothing yours.
 *  C0: one line, `start` its first build, no card. */
export function newBoard(seed: number, start: Build = START): Board {
  const b: Board = { seed, gen: 0, main: start.clade, lines: [start.clade], starts: { [start.clade]: copyBuild(start) }, cards: [], places: [], news: [] };
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

/** Rule 3 with C0: home, where any line of yours holds a cell, and next to one. */
export function reach(b: Board): Set<number> {
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
/** Who would come to this open cell: one of the best `TOY.pick` candidates not of a line of yours, by the seed. */
function comer(b: Board, place: Place, cell: Cell): Candidate | null {
  if (cell.job === 'light' || cell.holder) return null;
  const pool = candidates(cell.job, siteOf(place), SPECIES).filter((c) => !b.lines.includes(c.named.build.clade) && c.fit.letter !== 'F').slice(0, TOY.pick);
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
      say(b, `${place.name}: the ${h.mine ? 'population of yours' : callOf(h.build)} dies out at ${jobName(cell.job).toLowerCase()}: ${firstReason(f).replace(/\.$/, '').toLowerCase()}.`);
    }
  }
}

/** C6: each population of yours that is a real species wins its card, once. */
function cards(b: Board): void {
  for (const place of b.places) for (const cell of place.cells) {
    const n = cell.holder?.mine ? nameOfBuild(cell.holder.build) : null;
    if (!n || b.cards.includes(n.id)) continue;
    b.cards.push(n.id);
    say(b, `${place.name}: your population there is the ${n.common.toLowerCase()}; you win its card.`);
  }
}

/** One generation: colonist bars, variant bars, grams and fading, cells that appear and go, cards. */
export function step(board: Board): void {
  board.gen += 1;
  colonists(board);
  variants(board);
  grams(board);
  for (const place of board.places) syncCells(board, place);
  cards(board);
}

/** C2: every Life the line could live now (the line you main if none is given), best value first. */
export function options(board: Board, line: Id = board.main): Option[] {
  const out: Option[] = [];
  for (const id of [...reach(board)].sort((x, y) => x - y)) {
    const place = board.places[id], site = siteOf(place);
    for (const cell of place.cells) {
      const from = founderOf(board, id, cell.job, line);
      if (!from) continue;
      const fit = fitness(from, cell.job, site), h = cell.holder;
      if (!h) { out.push({ place: id, job: cell.job, act: 'take', from, fit, holder: null }); continue; }
      if (h.mine && h.build.clade !== line) continue;
      const hf = fitness(h.build, cell.job, site);
      if (fit.value <= hf.value) continue;
      if (h.mine && !keysOf(h.build).every((k) => from.mutations.includes(k))) continue;
      out.push({ place: id, job: cell.job, act: h.mine ? 'improve' : 'beat', from, fit, holder: hf });
    }
  }
  return out.sort((x, y) => y.fit.value - x.fit.value);
}

/** One Life: found a copy of the founder in this cell, then `TOY.lifeGens` generations pass. False (and nothing
 *  changes) if it is not one of `options`. */
export function live(board: Board, place: number, job: JobId): boolean {
  const o = options(board).find((x) => x.place === place && x.job === job);
  const cell = cellAt(board, place, job);
  if (!o || !cell) return false;
  const was = cell.holder;
  cell.holder = { build: copyBuild(o.from), mine: true, grams: o.fit.grams, fade: 0 };
  Object.assign(cell, { bar: 0, variantBar: 0, variant: null, variants: 0 });
  const verb = jobName(job).toLowerCase(), p = board.places[place].name;
  say(board, o.act === 'take' ? `${p}: your line takes the open cell to ${verb}.`
    : o.act === 'beat' ? `${p}: your line beats the ${callOf(was!.build)} to ${verb}.`
      : `${p}: your line improves its population that can ${verb}.`);
  for (let i = 0; i < TOY.lifeGens; i++) step(board);
  return true;
}

/** C5: the variant in a cell of yours becomes that cell's holder. No time passes. */
export function adopt(board: Board, place: number, job: JobId): boolean {
  const cell = cellAt(board, place, job), v = cell?.variant;
  if (!cell?.holder?.mine || !v) return false;
  cell.holder.build = v.build;
  cell.variant = null;
  say(board, `${board.places[place].name}: you adopt the variant (${v.what}); it holds the cell to ${jobName(job).toLowerCase()}.`);
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
export function nextGoal(board: Board): Goal {
  return goalOf(board, options(board), (p, j) => coming(board, p, j), (p, j) => destination(board, p, j));
}

/** Part C, rule C1: the build a Life of the main line would found in this cell: the best-reading of the line's
 *  holders in this place or next to it and the line's start build; null if that reads F. */
export function founder(board: Board, place: number, job: JobId, line: Id = board.main): Build | null { return founderOf(board, place, job, line); }
/** Part C, rule C4: the real species a cell of yours is heading for; null if the cell is not yours or none grows. */
export function destination(board: Board, place: number, job: JobId): Named | null { return destinationOf(board, place, job); }

// Part D. The bodies are part D's (docs/slices/w1-the-wide-toy.md); the signatures are the contract.
const later = (part: string): never => { throw new Error(`W1 part ${part} is not built`); };
/** Part D, rule D1: who is coming for a held cell and in how many generations; null if nobody is. */
export function rivalOf(_board: Board, _place: number, _job: JobId): { named: Named; gens: number } | null { return later('D'); }
/** Part D, rule D3: the next line to open and the cards it takes; null when every line of the toy is open. */
export function nextLine(_board: Board): { clade: Id; cards: number } | null { return later('D'); }
/** Part D, rule D3: play another open line. False (and nothing changes) if it is not open. No time passes. */
export function setMain(_board: Board, _clade: Id): boolean { return later('D'); }
