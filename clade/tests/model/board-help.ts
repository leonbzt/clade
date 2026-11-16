// Shared by the board tests (W1 round two). Not a test file; a builder never edits it.
import { expect } from 'vitest';
import { CLADE } from '../../src/data/roster/clades';
import { DIAL_STEP } from '../../src/data/roster/laws';
import { MUTATION } from '../../src/data/roster/mutations';
import { NAMED } from '../../src/data/roster/species';
import { HOME, START, TOY } from '../../src/data/roster/toy';
import { adopt, destination, founder, live, newBoard, nextGoal, options, setMain, siteOf, step } from '../../src/model/board';
import type { Board, Cell, Option, Place } from '../../src/model/board';
import { fitness, jobsAt } from '../../src/model/laws';
import type { Build, DialId, Named } from '../../src/model/types';

export const tryIt = (f: () => unknown) => { try { f(); return true; } catch { return false; } };
export const builtC = tryIt(() => founder(newBoard(1), HOME, 'mats'));
export const builtD = builtC && tryIt(() => setMain(newBoard(1), START.clade));
export const SEED = 7;
export const KING = NAMED['king-ragworm'];
export const isAnimal = (b: Build) => !CLADE[b.clade].makes;
export const copy = <T>(x: T): T => JSON.parse(JSON.stringify(x));
export const cellOf = (b: Board, place: number, job: string): Cell => b.places[place].cells.find((c) => c.job === job)!;
export const mine = (b: Board) => b.places.flatMap((p) => p.cells.filter((c) => c.holder?.mine).map((c) => ({ p, c })));
export const steps = (b: Board, n: number) => { for (let i = 0; i < n; i++) step(b); };
export const valueIn = (build: Build, c: Cell, p: Place) => fitness(build, c.job, siteOf(p)).value;
export const keysOf = (build: Build) => build.mutations.filter((m) => MUTATION[m].kind === 'key');
/** Dial steps between a build and a species of its clade. */
export const stepsTo = (build: Build, n: Named) => CLADE[build.clade].dials.reduce((sum, d) => sum + Math.abs((build.dials[d.id] ?? 0) - (n.build.dials[d.id] ?? 0)) / DIAL_STEP[d.id], 0);
/** C7, written out: an Improve keeps a walk when its founder is no farther than the holder from a card you lack. */
export function keepsWalk(b: Board, o: Option): boolean {
  const d = destination(b, o.place, o.job), h = cellOf(b, o.place, o.job).holder!.build;
  return !d || b.cards.includes(d.id) || stepsTo(h, d) >= stepsTo(o.from, d);
}
/** C7, written out: the Lives the goal may name for a line: every Take and Beat; an Improve only if it reads a
 *  letter higher and keeps the walk. `options` still lists the others: you may tap them. */
export const asked = (b: Board, line = b.main): Option[] =>
  options(b, line).filter((o) => o.act !== 'improve' || (o.fit.letter !== o.holder!.letter && keepsWalk(b, o)));
/** Do what the goal says, once. A `hold` is Adopt if the cell's variant reads higher than its holder, else the Life. */
export function follow(b: Board): void {
  const g = nextGoal(b);
  if (g.kind === 'wait') return steps(b, TOY.lifeGens);
  if (g.kind === 'line') { expect(setMain(b, g.line!), g.text).toBe(true); return; }
  const p = b.places[g.place!], c = cellOf(b, g.place!, g.job!);
  const better = !!c.variant && !!c.holder && valueIn(c.variant.build, c, p) > valueIn(c.holder.build, c, p);
  if (g.kind === 'adopt' || (g.kind === 'hold' && better)) expect(adopt(b, g.place!, g.job!), g.text).toBe(true);
  else expect(live(b, g.place!, g.job!), g.text).toBe(true);
}
/** A board with the home mats cell taken. */
export function settled(start: Build = START): Board {
  const b = newBoard(SEED, start);
  expect(live(b, HOME, 'mats')).toBe(true);
  return b;
}
/** What must hold on every board at every moment. */
export function invariants(b: Board): void {
  expect('heir' in b, 'the heir is gone: a Life founds from `founder`').toBe(false);
  expect(b.lines).toContain(b.main);
  expect(new Set(b.cards).size, 'a card is won once').toBe(b.cards.length);
  for (const id of b.cards) expect(b.lines, `${id} is a species of a line of yours`).toContain(NAMED[id].build.clade);
  for (const p of b.places) {
    expect(p.cells.map((c) => c.job), `${p.name}: one cell per job that exists`).toEqual(jobsAt(siteOf(p)));
    const hunters = p.cells.filter((c) => (c.job === 'hunt' || c.job === 'hunt2') && c.holder?.mine).map((c) => c.holder!.build.clade);
    expect(new Set(hunters).size, `${p.name}: no line of yours hunts itself`).toBe(hunters.length);
    for (const c of p.cells) {
      const h = c.holder;
      if (!h) { expect(c.rival, 'only a held cell has a rival').toBeNull(); expect(c.variant).toBeNull(); continue; }
      expect(c.bar).toBe(0);
      expect(h.fade).toBeLessThan(TOY.fade);
      if (h.mine) expect(b.lines, 'your cells are held by your lines').toContain(h.build.clade);
      else {
        expect(c.variant, 'only your cells show variants').toBeNull();
        if (isAnimal(h.build)) expect(p.kind.realm, 'no wild animal on the shore or the land').toBe('sea');
      }
    }
  }
  expect(b.news.length).toBeLessThanOrEqual(TOY.news);
}
/** One dial step or one mutation apart, inside the clade's ranges and its mutation list. */
export function oneStepApart(from: Build, to: Build): boolean {
  const c = CLADE[from.clade];
  if (to.clade !== from.clade) return false;
  const added = to.mutations.filter((m) => !from.mutations.includes(m));
  const moved = c.dials.filter((d) => Math.abs((to.dials[d.id] ?? 0) - (from.dials[d.id] ?? 0)) > 1e-9);
  const inRange = c.dials.every((d) => (to.dials[d.id] ?? 0) >= d.min - 1e-9 && (to.dials[d.id] ?? 0) <= d.max + 1e-9);
  if (!inRange || to.mutations.length < from.mutations.length) return false;
  if (added.length === 1 && moved.length === 0) return c.mutations.includes(added[0]);
  const d = moved[0]?.id as DialId;
  return added.length === 0 && moved.length === 1 && Math.abs(Math.abs(to.dials[d]! - (from.dials[d] ?? 0)) - DIAL_STEP[d]) < 1e-9;
}
export const bigger = (b: Build): Build => ({ ...copy(b), dials: { ...b.dials, size: b.dials.size! + DIAL_STEP.size } });
