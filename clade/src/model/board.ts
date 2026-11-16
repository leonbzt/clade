// The wide toy's board rules (W1): cells, a Life as one tap, colonists and variants on bars, the next goal.
// The signatures and shapes are the contract (docs/slices/w1-the-wide-toy.md); the bodies are the builders' work.
// Round two (16 Nov): part C (populations radiate) and part D (rivals and lines) are built.
// Numbers come from data/roster/toy.ts; every judgement comes from model/laws.ts. No dice: the same seed and the
// same taps give the same board. Nothing here may name a clade, a species or a mutation.
import type { Build, Fitness, HabitatKind, Id, JobId, Named, Site } from './types';
import { KIND } from '../data/roster/kinds';
import { NAMED, SPECIES } from '../data/roster/species';
import { CLADE } from '../data/roster/clades';
import { HOME, LINES, PLACES, START, TOY } from '../data/roster/toy';
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
      cell.holder = null; cell.variant = null; cell.rival = null; cell.bar = 0; cell.variantBar = 0;
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

/** D1, a place: a rival rivalOf no longer names gives up; else the first cell it names one for starts; the place's
 *  one bar goes up 1; at `TOY.rivalBar` the rival holds the cell as a wild holder. */
function rivals(b: Board): void {
  const run = barPlaces(b);
  for (const place of b.places) {
    if (!run.has(place.id)) { for (const c of place.cells) c.rival = null; continue; }
    for (const c of place.cells) if (c.rival && rivalIn(b, place, c)?.named.id !== c.rival.id) c.rival = null;
    let cell = place.cells.find((c) => c.rival);
    if (!cell) {
      for (const c of place.cells) {
        const who = rivalIn(b, place, c);
        if (who) { c.rival = { id: who.named.id, bar: 0 }; cell = c; break; }
      }
    }
    if (!cell) continue;
    cell.rival!.bar += 1;
    if (cell.rival!.bar < TOY.rivalBar) continue;
    const who = NAMED[cell.rival!.id], was = cell.holder!, site = siteOf(place);
    const before = fitness(was.build, cell.job, site), f = fitness(who.build, cell.job, site);
    cell.holder = { build: who.build, mine: false, grams: f.grams, fade: 0 };
    cell.variant = null; cell.rival = null;
    say(b, `${place.name}: the ${who.common.toLowerCase()} (${f.letter}) drives out ${was.mine ? 'your population' : `the ${callOf(was.build)}`} (${before.letter}) at ${jobName(cell.job).toLowerCase()}.`);
  }
}

/** D3: while your cards reach the next line's count, that line opens with its start build. */
function lines(b: Board): void {
  for (let n = nextLine(b); n && b.cards.length >= n.cards; n = nextLine(b)) {
    b.lines.push(n.clade);
    b.starts[n.clade] = copyBuild(LINES.find((r) => r.clade === n!.clade)!.start);
    say(b, `A new line opens: the ${CLADE[n.clade].name.toLowerCase()}.`);
  }
}

/** One generation: colonist bars, rival bars, variant bars, grams and fading, cells that appear and go, cards, lines. */
export function step(board: Board): void {
  board.gen += 1;
  colonists(board);
  rivals(board);
  variants(board);
  grams(board);
  for (const place of board.places) syncCells(board, place);
  cards(board);
  lines(board);
}

/** C2: every Life the line could live now (the line you main if none is given), best value first. */
export function options(board: Board, line: Id = board.main): Option[] {
  const out: Option[] = [];
  for (const id of [...reach(board)].sort((x, y) => x - y)) {
    const place = board.places[id], site = siteOf(place);
    for (const cell of place.cells) {
      const otherHunt = cell.job === 'hunt' ? 'hunt2' : cell.job === 'hunt2' ? 'hunt' : null;
      if (otherHunt && place.cells.some((c) => c.job === otherHunt && c.holder?.build.clade === line)) continue;
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
  const others = board.lines.filter((l) => l !== board.main).map((l) => ({ line: l, opts: options(board, l) }));
  return goalOf(board, options(board), {
    coming: (p, j) => coming(board, p, j), dest: (p, j) => destination(board, p, j), rival: (p, j) => rivalOf(board, p, j),
  }, others);
}

/** Part C, rule C1: the build a Life of the main line would found in this cell: the best-reading of the line's
 *  holders in this place or next to it and the line's start build; null if that reads F. */
export function founder(board: Board, place: number, job: JobId, line: Id = board.main): Build | null { return founderOf(board, place, job, line); }
/** Part C, rule C4: the real species a cell of yours is heading for; null if the cell is not yours or none grows. */
export function destination(board: Board, place: number, job: JobId): Named | null { return destinationOf(board, place, job); }

/** Part D, rule D1: who is coming for a held cell and in how many generations; null if nobody is. */
export function rivalOf(board: Board, place: number, job: JobId): { named: Named; gens: number } | null {
  const p = board.places[place], cell = cellAt(board, place, job);
  return p && cell && barPlaces(board).has(place) ? rivalIn(board, p, cell) : null;
}
/** D1's judgement in a place where bars run; the rivals phase finds those places once per step. */
function rivalIn(board: Board, p: Place, cell: Cell): { named: Named; gens: number } | null {
  const h = cell.holder, job = cell.job;
  if (!h || job === 'light') return null;
  const site = siteOf(p), own = JSON.stringify(h.build);
  const best = candidates(job, site, SPECIES).find((c) => !board.lines.includes(c.named.build.clade) && c.fit.letter !== 'F'
    && JSON.stringify(c.named.build) !== own);
  if (!best || best.fit.value < TOY.challenge * fitness(h.build, job, site).value) return null;
  return { named: best.named, gens: TOY.rivalBar - (cell.rival?.id === best.named.id ? cell.rival.bar : 0) };
}
/** Part D, rule D3: the next line to open and the cards it takes; null when every line of the toy is open. */
export function nextLine(board: Board): { clade: Id; cards: number } | null {
  const row = LINES.find((r) => !board.lines.includes(r.clade));
  return row ? { clade: row.clade, cards: row.cards } : null;
}
/** Part D, rule D3: play another open line. False (and nothing changes) if it is not open. No time passes. */
export function setMain(board: Board, clade: Id): boolean {
  if (!board.lines.includes(clade)) return false;
  board.main = clade;
  return true;
}
