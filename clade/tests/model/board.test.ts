// W1 contract: the board rules of the wide toy. Skipped until part A builds clade/src/model/board.ts; from then on
// every test here runs and passes. A builder never edits this file: a test that seems wrong is a question for the
// architect (docs/status.md).
import { describe, expect, it } from 'vitest';
import { CLADE } from '../../src/data/roster/clades';
import { DIAL_STEP } from '../../src/data/roster/laws';
import { MUTATION } from '../../src/data/roster/mutations';
import { NAMED } from '../../src/data/roster/species';
import { HOME, START, TOY } from '../../src/data/roster/toy';
import { adopt, coming, live, nameOf, newBoard, nextGoal, options, siteOf, step } from '../../src/model/board';
import type { Board, Cell, Place } from '../../src/model/board';
import { fitness, has, jobsAt } from '../../src/model/laws';
import type { Build, DialId } from '../../src/model/types';

const built = (() => { try { newBoard(1); return true; } catch { return false; } })();
const SEED = 7;
const isAnimal = (b: Build) => !CLADE[b.clade].makes;
const cellOf = (b: Board, place: number, job: string): Cell => b.places[place].cells.find((c) => c.job === job)!;
const mine = (b: Board) => b.places.flatMap((p) => p.cells.filter((c) => c.holder?.mine).map((c) => ({ p, c })));
const steps = (b: Board, n: number) => { for (let i = 0; i < n; i++) step(b); };
/** Do what the goal says, once. */
function follow(b: Board): void {
  const g = nextGoal(b);
  if (g.kind === 'wait') steps(b, TOY.lifeGens);
  else if (g.kind === 'adopt') expect(adopt(b, g.place!, g.job!)).toBe(true);
  else expect(live(b, g.place!, g.job!), g.text).toBe(true);
}
/** A board with the home mats cell taken. */
function settled(heir: Build = START): Board {
  const b = newBoard(SEED, heir);
  expect(live(b, HOME, 'mats')).toBe(true);
  return b;
}
/** What must hold on every board at every moment. */
function invariants(b: Board): void {
  for (const p of b.places) {
    expect(p.cells.map((c) => c.job), `${p.name}: one cell per job that exists`).toEqual(jobsAt(siteOf(p)));
    const held = p.cells.filter((c) => c.holder);
    expect(held.filter((c) => c.holder!.mine).length, `${p.name}: one cell of yours a place`).toBeLessThanOrEqual(1);
    expect(new Set(held.map((c) => JSON.stringify(c.holder!.build))).size, `${p.name}: one job per build`).toBe(held.length);
    for (const c of held) {
      const h = c.holder!;
      expect(h.fade).toBeLessThan(TOY.fade);
      if (h.mine) expect(h.build.clade).toBe(b.main);
      else if (isAnimal(h.build)) {
        expect(h.build.clade, 'colonists are never of your clade').not.toBe(b.main);
        expect(p.kind.realm, 'no animal colonist on the shore or the land').toBe('sea');
      }
      if (!h.mine) expect(c.variant, 'only your cells show variants').toBeNull();
    }
    for (const c of p.cells) if (c.holder) expect(c.bar).toBe(0);
  }
  expect(b.news.length).toBeLessThanOrEqual(TOY.news);
}
/** One dial step or one mutation apart, inside the clade's ranges and its mutation list. */
function oneStepApart(from: Build, to: Build): boolean {
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

describe.skipIf(!built)('the board', () => {
  it('starts young: producers only, nothing yours, no bar running, home has an open cell to take', () => {
    const b = newBoard(SEED);
    expect(b.gen).toBe(0);
    expect(b.heir).toEqual(START);
    expect(b.main).toBe(START.clade);
    for (const p of b.places) for (const c of p.cells) {
      if (c.holder) { expect(c.job).toBe('light'); expect(c.holder.mine).toBe(false); }
      if (c.job !== 'light') expect(coming(b, p.id, c.job)).toBeNull();
    }
    expect(b.places.some((p) => p.cells.some((c) => c.job === 'light' && c.holder))).toBe(true);
    expect(options(b).some((o) => o.place === HOME && o.job === 'mats' && o.act === 'take')).toBe(true);
    expect(options(b).every((o) => o.place === HOME), 'the first Life is at home').toBe(true);
    invariants(b);
  });

  it('a Life founds the heir in the cell and takes TOY.lifeGens generations', () => {
    const b = settled();
    const h = cellOf(b, HOME, 'mats').holder!;
    expect(h.mine).toBe(true);
    expect(h.build).toEqual(START);
    expect(h.grams).toBeGreaterThan(0);
    expect(b.gen).toBe(TOY.lifeGens);
    expect(b.news.length).toBeGreaterThan(0);
  });

  it('a Life that is not an option changes nothing', () => {
    const b = settled(), before = JSON.stringify(b);
    const far = b.places.find((p) => p.id !== HOME && !b.places[HOME].next.includes(p.id) && p.kind.realm === 'sea')!;
    expect(live(b, far.id, far.cells[0].job)).toBe(false);
    expect(live(b, HOME, 'plankton'), 'the heir does not eat it').toBe(false);
    expect(JSON.stringify(b)).toBe(before);
  });

  it('the same seed and the same taps give the same board', () => {
    const a = newBoard(SEED), b = newBoard(SEED);
    for (let i = 0; i < 25; i++) { follow(a); follow(b); }
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('the invariants hold through 60 goals followed, and you end up holding three places or more', () => {
    const b = newBoard(SEED);
    for (let i = 0; i < 60; i++) { follow(b); invariants(b); }
    expect(mine(b).length).toBeGreaterThanOrEqual(3);
  });

  it('options: only where you live or next door; take an open cell, beat a weaker wild holder, improve your own', () => {
    const b = newBoard(SEED);
    for (let i = 0; i < 30; i++) {
      const near = new Set([HOME, ...mine(b).flatMap(({ p }) => [p.id, ...p.next])]);
      const opts = options(b);
      for (let k = 1; k < opts.length; k++) expect(opts[k].fit.value).toBeLessThanOrEqual(opts[k - 1].fit.value);
      for (const o of opts) {
        const p = b.places[o.place], c = cellOf(b, o.place, o.job);
        expect(near.has(o.place)).toBe(true);
        expect(o.fit.letter).not.toBe('F');
        const own = p.cells.find((x) => x.holder?.mine);
        if (own) expect(own, `${p.name}: your one cell here is the only option`).toBe(c);
        if (o.act === 'take') expect(c.holder).toBeNull();
        if (o.act === 'beat') { expect(c.holder!.mine).toBe(false); expect(o.fit.value).toBeGreaterThan(o.holder!.value); }
        if (o.act === 'improve') { expect(c.holder!.mine).toBe(true); expect(c.holder!.build).not.toEqual(b.heir); expect(o.fit.value).toBeGreaterThan(o.holder!.value); }
      }
      follow(b);
    }
  });

  it('colonists: a bar runs in sea places where you live or next door; the open cell names who comes, and it comes', () => {
    const b = settled();
    const near = new Set([HOME, ...b.places[HOME].next]);
    let seen = 0;
    for (const p of b.places) for (const c of p.cells) {
      if (c.job === 'light' || c.holder) continue;
      const who = coming(b, p.id, c.job);
      if (!near.has(p.id) || p.kind.realm !== 'sea') expect(who, p.name).toBeNull();
      if (!who) continue;
      seen++;
      expect(who.gens).toBe(TOY.colonistBar - c.bar);
      expect(who.named.build.clade).not.toBe(b.main);
      expect(fitness(who.named.build, c.job, siteOf(p)).letter).not.toBe('F');
    }
    expect(seen).toBeGreaterThan(0);
    // The first to arrive is the one its cell named the generation before.
    for (let i = 0; i < TOY.colonistBar + 1; i++) {
      const due = b.places.flatMap((p) => p.cells.filter((c) => !c.holder).map((c) => ({ p, c, who: coming(b, p.id, c.job) }))).filter((x) => x.who?.gens === 1);
      step(b);
      for (const { p, c, who } of due) {
        const now = p.cells.find((x) => x.job === c.job);
        if (now?.holder) { expect(now.holder.build).toEqual(who!.named.build); expect(now.holder.mine).toBe(false); }
      }
      if (due.length) return;
    }
    expect.fail('no colonist arrived within a bar');
  });

  it('taking a cell before its bar fills keeps the colonist out', () => {
    const b = settled();
    const next = b.places[b.places[HOME].next.find((id) => b.places[id].kind.realm === 'sea' && options(b).some((o) => o.place === id && o.act === 'take'))!];
    const o = options(b).find((x) => x.place === next.id && x.act === 'take')!;
    expect(live(b, o.place, o.job)).toBe(true);
    steps(b, TOY.colonistBar);
    expect(cellOf(b, o.place, o.job).holder!.mine).toBe(true);
  });

  it('variants: one shows in a cell of yours every TOY.variantBar generations, one step from the heir, and stays TOY.variantStay', () => {
    const b = settled(), c = () => cellOf(b, HOME, 'mats');
    steps(b, TOY.variantBar - TOY.lifeGens - 1);
    expect(c().variant).toBeNull();
    step(b);
    const v = c().variant!;
    expect(v).not.toBeNull();
    expect(oneStepApart(b.heir, v.build)).toBe(true);
    expect(v.left).toBe(TOY.variantStay);
    expect(v.what.length).toBeGreaterThan(0);
    steps(b, TOY.variantStay);
    expect(c().variant).toBeNull();
    expect(c().holder!.mine, 'a variant that wins the cell is still your line').toBe(true);
  });

  it('variants: every TOY.rare-th in a cell is a mutation, and on the tide line the first of those is the key', () => {
    const b = settled(), c = () => cellOf(b, HOME, 'mats');
    expect(b.places[HOME].kind.edge).toBe(true);
    const seenAt: Build[] = [];
    for (let i = 0; i < TOY.rare * (TOY.variantBar + TOY.variantStay) + TOY.variantBar && seenAt.length < TOY.rare; i++) {
      const had = c().variants;
      step(b);
      if (c().variants > had) { seenAt.push(c().variant!.build); expect(oneStepApart(b.heir, c().variant!.build)).toBe(true); }
    }
    expect(seenAt.length).toBe(TOY.rare);
    const rare = seenAt[TOY.rare - 1], added = rare.mutations.filter((m) => !START.mutations.includes(m));
    expect(added.length).toBe(1);
    expect(MUTATION[added[0]].kind).toBe('key');
    expect(has(rare, 'air')).toBe(true);
    for (const v of seenAt.slice(0, -1)) expect(v.mutations).toEqual(START.mutations);
  });

  it('adopt: the variant becomes the heir and holds the cell; no time passes', () => {
    const b = settled();
    expect(adopt(b, HOME, 'mats'), 'nothing to adopt yet').toBe(false);
    while (!cellOf(b, HOME, 'mats').variant) step(b);
    const v = cellOf(b, HOME, 'mats').variant!.build, gen = b.gen;
    expect(adopt(b, HOME, 'mats')).toBe(true);
    expect(b.heir).toEqual(v);
    expect(cellOf(b, HOME, 'mats').holder!.build).toEqual(v);
    expect(cellOf(b, HOME, 'mats').variant).toBeNull();
    expect(b.gen).toBe(gen);
  });

  it('the shore opens with air; the land stays shut', () => {
    const wet = settled();
    const realms = (b: Board) => new Set(options(b).map((o) => b.places[o.place].kind.realm));
    expect([...realms(wet)]).toEqual(['sea']);
    const dry = settled({ ...START, mutations: ['air-breathing'] });
    expect(realms(dry).has('shore')).toBe(true);
    for (let i = 0; i < 40; i++) { follow(dry); expect(realms(dry).has('land')).toBe(false); }
    expect(mine(dry).some(({ p }: { p: Place }) => p.kind.realm === 'shore')).toBe(true);
  });

  it('a holder that reads F for TOY.fade generations loses its cell, and the news says why', () => {
    const b = settled();
    const h = cellOf(b, HOME, 'mats').holder!;
    h.build = { ...h.build, dials: { ...h.build.dials, size: -6 } }; // too small to pay its upkeep
    cellOf(b, HOME, 'mats').variantBar = -1000; // no variant comes to its rescue
    expect(fitness(h.build, 'mats', siteOf(b.places[HOME])).letter).toBe('F');
    steps(b, TOY.fade - 1);
    expect(cellOf(b, HOME, 'mats').holder).not.toBeNull();
    const before = [...b.news];
    step(b);
    expect(cellOf(b, HOME, 'mats').holder).toBeNull();
    expect(b.news.filter((line) => !before.includes(line)).some((line) => line.includes(b.places[HOME].name))).toBe(true);
  });

  it('nameOf: a build within half a step of a real species is that species; the start worm is none yet', () => {
    const king = NAMED['king-ragworm'];
    expect(nameOf(king.build)).toBe(king);
    expect(nameOf({ ...king.build, mutations: ['red'] })).toBe(king);
    expect(nameOf({ ...king.build, dials: { ...king.build.dials, size: king.build.dials.size! + 0.1 } })).toBe(king);
    expect(nameOf({ ...king.build, dials: { ...king.build.dials, guard: 0 } })).not.toBe(king);
    expect(nameOf(START)).toBeNull();
    const rough = NAMED['rough-periwinkle'];
    expect(nameOf({ ...rough.build, mutations: [] }), 'it needs the species\' mutations').not.toBe(rough);
  });

  it('the next goal: one sentence that names its place; adopt first, then hold, race, take, beat, improve, wait', () => {
    const b = newBoard(SEED);
    const first = nextGoal(b);
    expect(first.kind).toBe('take');
    expect(first.place).toBe(HOME);
    for (let i = 0; i < 40; i++) {
      const g = nextGoal(b), opts = options(b);
      expect(g.text.length).toBeGreaterThan(10);
      expect(g.text.trim().split(/[.!?]\s/).length, 'one sentence').toBe(1);
      if (g.place !== null) expect(g.text).toContain(b.places[g.place].name);
      const better = mine(b).some(({ p, c }) => c.variant && fitness(c.variant.build, c.job, siteOf(p)).value > fitness(b.heir, c.job, siteOf(p)).value);
      if (better) expect(g.kind).toBe('adopt');
      else if (opts.some((o) => o.act === 'take')) expect(['hold', 'race', 'take', 'adopt']).toContain(g.kind);
      else if (opts.length === 0) expect(['wait', 'adopt']).toContain(g.kind);
      if (g.kind === 'race') expect(coming(b, g.place!, g.job!)).not.toBeNull();
      if (g.kind === 'wait') expect(g.place).toBeNull();
      follow(b);
    }
  });
});
