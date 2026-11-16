// W1 contract: the board rules of the wide toy, round two (16 Nov), part C. Skipped until `founder` is built; from
// then on every test here runs and passes. A builder never edits this file: a test that seems wrong is a question
// for the architect (docs/status.md). The architect could not run these (the bodies did not exist): a test that
// fails on the data and not on a rule is such a question.
import { describe, expect, it } from 'vitest';
import { DIAL_STEP } from '../../src/data/roster/laws';
import { MUTATION } from '../../src/data/roster/mutations';
import { NAMED, SPECIES } from '../../src/data/roster/species';
import { HOME, START, TOY } from '../../src/data/roster/toy';
import { adopt, coming, destination, founder, live, nameOf, newBoard, nextGoal, options, reach, siteOf, step } from '../../src/model/board';
import { fitness, has } from '../../src/model/laws';
import type { Build } from '../../src/model/types';
import { asked, bigger, builtC, cellOf, copy, follow, invariants, keysOf, KING, mine, oneStepApart, SEED, settled, steps, stepsTo, valueIn } from './board-help';

describe.skipIf(!builtC)('the board, part C: populations radiate', () => {
  it('starts young: one line, its start build, no card, producers only, the first Life at home', () => {
    const b = newBoard(SEED);
    expect(b.gen).toBe(0);
    expect(b.main).toBe(START.clade);
    expect(b.lines).toEqual([START.clade]);
    expect(b.starts[START.clade]).toEqual(START);
    expect(b.cards).toEqual([]);
    for (const p of b.places) for (const c of p.cells) {
      if (c.holder) { expect(c.job).toBe('light'); expect(c.holder.mine).toBe(false); }
      if (c.job !== 'light') expect(coming(b, p.id, c.job)).toBeNull();
    }
    expect([...reach(b)]).toEqual([HOME]);
    expect(options(b).some((o) => o.place === HOME && o.job === 'mats' && o.act === 'take')).toBe(true);
    expect(options(b).every((o) => o.place === HOME), 'the first Life is at home').toBe(true);
    invariants(b);
  });

  it('founder (C1): the best-reading of your holders here or next door and the start build; null if that reads F', () => {
    const b = newBoard(SEED);
    expect(founder(b, HOME, 'mats')).toEqual(START);
    expect(founder(b, HOME, 'plankton'), 'the line does not eat it').toBeNull();
    expect(live(b, HOME, 'mats')).toBe(true);
    cellOf(b, HOME, 'mats').holder!.build = bigger(START);
    for (const o of options(b)) {
      const p = b.places[o.place], c = cellOf(b, o.place, o.job);
      const near = [...(p.id === HOME || p.next.includes(HOME) ? [bigger(START)] : []), START];
      const best = Math.max(...near.map((x) => valueIn(x, c, p)));
      expect(founder(b, o.place, o.job)).toEqual(o.from);
      expect(o.fit.value).toBeCloseTo(best, 9);
      expect(valueIn(o.from, c, p)).toBeCloseTo(best, 9);
    }
  });

  it('a Life founds a copy of the founder in the cell and takes TOY.lifeGens generations', () => {
    const b = settled(), home = cellOf(b, HOME, 'mats').holder!;
    expect(home.mine).toBe(true);
    expect(home.build).toEqual(START);
    expect(home.grams).toBeGreaterThan(0);
    expect(b.gen).toBe(TOY.lifeGens);
    expect(b.news.length).toBeGreaterThan(0);
    const o = options(b).find((x) => x.act === 'take' && x.place !== HOME)!;
    expect(live(b, o.place, o.job)).toBe(true);
    const h = cellOf(b, o.place, o.job).holder!;
    expect(h.mine).toBe(true);
    expect(h.build).toEqual(o.from);
    h.build.dials.size = -3;
    expect(home.build.dials.size, 'no two cells share a build object').toBe(START.dials.size);
    expect(START.dials.size).not.toBe(-3);
  });

  it('a Life that is not an option changes nothing', () => {
    const b = settled(), before = JSON.stringify(b);
    const far = b.places.find((p) => p.id !== HOME && !b.places[HOME].next.includes(p.id) && p.kind.realm === 'sea')!;
    expect(live(b, far.id, far.cells[0].job)).toBe(false);
    expect(live(b, HOME, 'plankton'), 'the line does not eat it').toBe(false);
    expect(JSON.stringify(b)).toBe(before);
  });

  it('the same seed and the same taps give the same board', () => {
    const a = newBoard(SEED), b = newBoard(SEED);
    for (let i = 0; i < 25; i++) { follow(a); follow(b); }
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('your line may hold every cell it can eat in: a second cell at home', () => {
    const b = settled();
    expect(options(b).some((o) => o.place === HOME && o.job === 'detritus' && o.act === 'take')).toBe(true);
    expect(live(b, HOME, 'detritus')).toBe(true);
    expect(mine(b).filter(({ p }) => p.id === HOME).length).toBe(2);
    invariants(b);
  });

  it('the invariants hold through 60 goals followed, and you end up holding four cells or more', () => {
    const b = newBoard(SEED);
    for (let i = 0; i < 60; i++) { follow(b); invariants(b); }
    expect(mine(b).length).toBeGreaterThanOrEqual(4);
  });

  it('options (C2): in reach only, best first; take an open cell, beat a weaker wild holder, improve your own and keep its keys', () => {
    const b = newBoard(SEED);
    for (let i = 0; i < 30; i++) {
      const near = reach(b), opts = options(b);
      expect([...near].sort()).toEqual([...new Set([HOME, ...mine(b).flatMap(({ p }) => [p.id, ...p.next])])].sort());
      for (let k = 1; k < opts.length; k++) expect(opts[k].fit.value).toBeLessThanOrEqual(opts[k - 1].fit.value);
      for (const o of opts) {
        const c = cellOf(b, o.place, o.job);
        expect(near.has(o.place)).toBe(true);
        expect(o.fit.letter).not.toBe('F');
        expect(o.from.clade).toBe(b.main);
        if (o.act === 'take') expect(c.holder).toBeNull();
        if (o.act === 'beat') { expect(c.holder!.mine).toBe(false); expect(o.fit.value).toBeGreaterThan(o.holder!.value); }
        if (o.act === 'improve') {
          expect(c.holder!.mine).toBe(true);
          expect(c.holder!.build.clade).toBe(b.main);
          expect(o.fit.value).toBeGreaterThan(o.holder!.value);
          for (const key of keysOf(c.holder!.build)) expect(o.from.mutations, 'an improvement never loses a key').toContain(key);
        }
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
      expect(b.lines, 'a colonist is never of a line of yours').not.toContain(who.named.build.clade);
      expect(fitness(who.named.build, c.job, siteOf(p)).letter).not.toBe('F');
    }
    expect(seen).toBeGreaterThan(0);
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

  it('destination (C4): the best-reading species of the clade you lack a card for; your own name once you are one', () => {
    const b = settled(), p = b.places[HOME], c = cellOf(b, HOME, 'mats');
    const sisters = () => SPECIES.filter((n) => n.build.clade === START.clade && valueIn(n.build, c, p) > 0 && fitness(n.build, c.job, siteOf(p)).letter !== 'F')
      .sort((x, y) => valueIn(y.build, c, p) - valueIn(x.build, c, p));
    expect(sisters().length).toBe(2);
    expect(destination(b, HOME, 'mats')).toBe(sisters()[0]);
    expect(destination(b, HOME, 'plankton'), 'not a cell of yours').toBeNull();
    b.cards.push(sisters()[0].id);
    expect(destination(b, HOME, 'mats'), 'the card you lack comes first').toBe(sisters()[1]);
    b.cards.push(sisters()[1].id);
    expect(destination(b, HOME, 'mats'), 'all won: the best-reading').toBe(sisters()[0]);
    c.holder!.build = copy(sisters()[1].build);
    expect(destination(b, HOME, 'mats'), 'a named population stays what it is').toBe(sisters()[1]);
  });

  it('variants (C3): from the cell\'s own holder, a dial step toward its destination, for TOY.variantStay generations', () => {
    const b = settled(), p = b.places[HOME], c = () => cellOf(b, HOME, 'mats');
    const own: Build = { ...copy(START), dials: { ...START.dials, guard: 1 } };
    c().holder!.build = own;
    steps(b, TOY.variantBar - TOY.lifeGens - 1);
    expect(c().variant).toBeNull();
    const dest = destination(b, HOME, 'mats')!;
    step(b);
    const v = c().variant!;
    expect(v).not.toBeNull();
    expect(oneStepApart(own, v.build), 'one step from the holder, not from the start build').toBe(true);
    expect(stepsTo(v.build, dest)).toBeLessThan(stepsTo(own, dest));
    expect(v.left).toBe(TOY.variantStay);
    expect(v.what.length).toBeGreaterThan(0);
    steps(b, TOY.variantStay);
    expect(c().variant).toBeNull();
    expect(c().holder!.mine).toBe(true);
    expect(p.cells.includes(c())).toBe(true);
  });

  it('a variant takes its cell by itself only if it reads higher there; else it goes', () => {
    for (const dir of [1, -1]) {
      const b = settled(), p = b.places[HOME], c = cellOf(b, HOME, 'mats');
      const other: Build = { ...copy(START), dials: { ...START.dials, size: START.dials.size! + dir * DIAL_STEP.size } };
      const wins = valueIn(other, c, p) > valueIn(START, c, p);
      c.variant = { build: other, what: dir > 0 ? 'bigger' : 'smaller', left: 1 };
      const news = b.news.length;
      step(b);
      expect(c.variant).toBeNull();
      expect(c.holder!.build).toEqual(wins ? other : START);
      expect(c.holder!.mine).toBe(true);
      expect(b.news.length).toBeGreaterThan(news);
    }
  });

  it('variants: every TOY.rare-th in a cell is a mutation, and on the tide line the first of those is the key', () => {
    const b = settled(), c = () => cellOf(b, HOME, 'mats');
    expect(b.places[HOME].kind.edge).toBe(true);
    const seenAt: Build[] = [];
    for (let i = 0; i < TOY.rare * (TOY.variantBar + TOY.variantStay) + TOY.variantBar && seenAt.length < TOY.rare; i++) {
      const had = c().variants, from = copy(c().holder!.build);
      step(b);
      if (c().variants > had) { seenAt.push(c().variant!.build); expect(oneStepApart(from, c().variant!.build)).toBe(true); }
    }
    expect(seenAt.length).toBe(TOY.rare);
    const rare = seenAt[TOY.rare - 1], added = rare.mutations.filter((m) => !START.mutations.includes(m));
    expect(added.length).toBe(1);
    expect(MUTATION[added[0]].kind).toBe('key');
    expect(has(rare, 'air')).toBe(true);
    for (const v of seenAt.slice(0, -1)) expect(v.mutations).toEqual(START.mutations);
  });

  it('adopt (C5): the variant holds its cell at once; no time passes; a key adopted at the tide line opens the shore', () => {
    const b = settled(), c = cellOf(b, HOME, 'mats');
    const realms = () => new Set(options(b).map((o) => b.places[o.place].kind.realm));
    expect(adopt(b, HOME, 'mats'), 'nothing to adopt yet').toBe(false);
    expect([...realms()]).toEqual(['sea']);
    const air: Build = { ...copy(START), mutations: ['air-breathing'] };
    c.variant = { build: air, what: 'breathes air', left: 5 };
    const gen = b.gen;
    expect(adopt(b, HOME, 'mats')).toBe(true);
    expect(c.holder!.build).toEqual(air);
    expect(c.holder!.mine).toBe(true);
    expect(c.variant).toBeNull();
    expect(b.gen).toBe(gen);
    expect(realms().has('shore'), 'its neighbours on the shore can be founded from it').toBe(true);
    const shore = options(b).find((o) => b.places[o.place].kind.realm === 'shore')!;
    expect(has(shore.from, 'air')).toBe(true);
    expect(live(b, shore.place, shore.job)).toBe(true);
    expect(mine(b).some(({ p }) => p.kind.realm === 'shore')).toBe(true);
  });

  it('the land stays shut, with air or without', () => {
    const dry = settled({ ...START, mutations: ['air-breathing'] });
    for (let i = 0; i < 40; i++) { follow(dry); expect(options(dry).some((o) => dry.places[o.place].kind.realm === 'land')).toBe(false); }
  });

  it('cards (C6): a population of yours that is a real species wins its card once, and stays that species', () => {
    const b = settled(), c = cellOf(b, HOME, 'mats');
    c.holder!.build = copy(KING.build);
    const news = b.news.length;
    step(b);
    expect(b.cards).toEqual([KING.id]);
    expect(b.news.slice(news).some((line) => /king ragworm/i.test(line) && line.includes(b.places[HOME].name))).toBe(true);
    step(b);
    expect(b.cards).toEqual([KING.id]);
    while (c.variants === 0) step(b);
    expect(c.variant, 'a named population throws no dial variant').toBeNull();
    expect(nameOf(c.holder!.build)).toBe(KING);
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
    expect(nameOf(KING.build)).toBe(KING);
    expect(nameOf({ ...KING.build, mutations: ['red'] })).toBe(KING);
    expect(nameOf({ ...KING.build, dials: { ...KING.build.dials, size: KING.build.dials.size! + 0.1 } })).toBe(KING);
    expect(nameOf({ ...KING.build, dials: { ...KING.build.dials, guard: 0 } })).not.toBe(KING);
    expect(nameOf(START)).toBeNull();
    const rough = NAMED['rough-periwinkle'];
    expect(nameOf({ ...rough.build, mutations: [] }), 'it needs the species\' mutations').not.toBe(rough);
  });

  it('the next goal (C7): one sentence that names its place; Adopt only for what would not happen by itself', () => {
    const b = newBoard(SEED);
    const first = nextGoal(b);
    expect(first.kind).toBe('take');
    expect(first.place).toBe(HOME);
    let adopts = 0;
    for (let i = 0; i < 60; i++) {
      const g = nextGoal(b), opts = options(b);
      expect(g.text.length).toBeGreaterThan(10);
      expect(g.text.trim().split(/[.!?]\s/).length, 'one sentence').toBe(1);
      if (g.place !== null) expect(g.text).toContain(b.places[g.place].name);
      expect(g.line === null, 'only a line goal names a line').toBe(g.kind !== 'line');
      if (g.kind === 'adopt') {
        adopts++;
        const p = b.places[g.place!], c = cellOf(b, g.place!, g.job!), v = c.variant!.build, h = c.holder!.build;
        const held = mine(b).filter((x) => x.c.holder!.build.clade === h.clade);
        const newKey = keysOf(v).some((k) => held.every((x) => !x.c.holder!.build.mutations.includes(k)));
        const dest = destination(b, g.place!, g.job!);
        const towardACard = !!dest && !b.cards.includes(dest.id) && stepsTo(v, dest) < stepsTo(h, dest) && valueIn(v, c, p) <= valueIn(h, c, p);
        expect(newKey || towardACard, g.text).toBe(true);
        if (!newKey) for (const x of held) if (x.c !== c && destination(b, x.p.id, x.c.job) === dest) expect(stepsTo(x.c.holder!.build, dest!), 'only the population nearest the card is asked for').toBeGreaterThanOrEqual(stepsTo(h, dest!));
      }
      if (g.kind === 'take' || g.kind === 'race') expect(opts.some((o) => o.act === 'take' && o.place === g.place && o.job === g.job)).toBe(true);
      if (g.kind === 'beat' || g.kind === 'improve') expect(asked(b).some((o) => o.act === g.kind && o.place === g.place && o.job === g.job), g.text).toBe(true);
      if (opts.some((o) => o.act === 'take')) expect(['hold', 'adopt', 'race', 'take']).toContain(g.kind);
      if (g.kind === 'race') expect(coming(b, g.place!, g.job!)).not.toBeNull();
      if (g.kind === 'wait') { expect(g.place).toBeNull(); for (const l of b.lines) expect(asked(b, l).length, 'no line of yours has a Life the goal would name').toBe(0); }
      follow(b);
    }
    expect(adopts, 'Adopt is no longer every other goal').toBeLessThan(20);
  });
});
