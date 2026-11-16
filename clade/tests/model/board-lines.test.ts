// W1 contract: the board rules of the wide toy, round two (16 Nov), part D. Skipped until `setMain` is built; the
// same terms as board.test.ts: a builder never edits this file, and a test that seems wrong is a question.
// Rewritten 16 Nov after part D stopped: the architect ran these against a scratch build of the rules (seed 7).
import { describe, expect, it } from 'vitest';
import { CLADE } from '../../src/data/roster/clades';
import { SPECIES } from '../../src/data/roster/species';
import { HOME, LINES, START, TOY } from '../../src/data/roster/toy';
import { coming, live, newBoard, nextGoal, nextLine, options, rivalOf, setMain, siteOf, step } from '../../src/model/board';
import type { Board, Cell, Place } from '../../src/model/board';
import { candidates, fitness } from '../../src/model/laws';
import type { JobId, Named } from '../../src/model/types';
import { asked, builtD, cellOf, copy, follow, invariants, keepsWalk, KING, mine, SEED, settled, valueIn } from './board-help';

describe.skipIf(!builtD)('the board, part D: rivals and lines', () => {
  /** Rule D1's judgement, written out: the best wild candidate that reads TOY.challenge times the holder or better. */
  function rivalFor(b: Board, p: Place, c: Cell): Named | null {
    if (!c.holder || c.job === 'light' || p.kind.realm !== 'sea') return null;
    if (!mine(b).some((x) => x.p.id === p.id || (TOY.barsNextDoor && x.p.next.includes(p.id)))) return null;
    const floor = TOY.challenge * valueIn(c.holder.build, c, p);
    const best = candidates(c.job as JobId, siteOf(p), SPECIES).find((x) => !b.lines.includes(x.named.build.clade) && x.fit.letter !== 'F'
      && JSON.stringify(x.named.build) !== JSON.stringify(c.holder!.build));
    return best && best.fit.value >= floor ? best.named : null;
  }
  const cells = (b: Board) => b.places.flatMap((p) => p.cells.map((c) => ({ p, c })));
  /** The most often one goal may name one cell in 100 goals (measured 16 Nov: 5 on this seed, 6 over eight seeds; a
   *  walk to a card is at most that many Adopts). The loops this catches ran to 24 and more. May only shrink. */
  const MOST = 8;

  it('rivals (D1): who comes for a held cell is the best wild species that reads TOY.challenge times its holder', () => {
    const b = newBoard(SEED);
    let seen = 0;
    for (let i = 0; i < 40; i++) {
      follow(b);
      invariants(b);
      for (const { p, c } of cells(b)) {
        const want = rivalFor(b, p, c), got = rivalOf(b, p.id, c.job);
        expect(got?.named ?? null, `${p.name} ${c.job}`).toBe(want);
        if (got) { seen++; expect(got.gens).toBe(TOY.rivalBar - (c.rival?.id === got.named.id ? c.rival.bar : 0)); }
      }
    }
    expect(seen, 'somebody is challenged in 40 goals').toBeGreaterThan(0);
  });

  it('a rival arrives when its bar fills and takes the cell as a wild holder; one that no longer reads better gives up', () => {
    const b = newBoard(SEED);
    let found: { p: Place; c: Cell; who: Named } | null = null;
    for (let i = 0; i < 80 && !found; i++) {
      follow(b);
      for (const { p, c } of cells(b)) { const who = rivalFor(b, p, c); if (who && !found) found = { p, c, who }; }
    }
    expect(found, 'no rival in 80 goals').not.toBeNull();
    const { p, c, who } = found!;
    const saved = JSON.stringify(b);
    for (const x of p.cells) { x.bar = 0; if (x !== c) x.rival = null; }
    c.rival = { id: who.id, bar: TOY.rivalBar - 1 };
    const news = b.news.length;
    step(b);
    expect(c.holder!.build).toEqual(who.build);
    expect(c.holder!.mine).toBe(false);
    expect(c.variant).toBeNull();
    expect(c.rival).toBeNull();
    expect(b.news.slice(news).some((line) => line.includes(p.name) && line.toLowerCase().includes(who.common.toLowerCase()))).toBe(true);
    // The same moment again, but the holder now reads as well as the rival: it gives up.
    const again: Board = JSON.parse(saved), p2 = again.places[p.id], c2 = cellOf(again, p.id, c.job);
    c2.holder!.build = copy(who.build);
    c2.rival = { id: who.id, bar: TOY.rivalBar - 1 };
    step(again);
    expect(c2.holder!.build).toEqual(who.build);
    expect(c2.rival?.id === who.id, 'it gave up').toBe(false);
    expect(p2.cells.includes(c2)).toBe(true);
  });

  it('hold (D2): the first goal when a cell of yours is challenged and one tap ends the challenge', () => {
    const b = newBoard(SEED);
    let holds = 0;
    for (let i = 0; i < 60; i++) {
      const g = nextGoal(b);
      const helped = mine(b).filter(({ p, c }) => {
        const who = rivalOf(b, p.id, c.job);
        if (!who) return false;
        const ends = (value: number) => fitness(who.named.build, c.job, siteOf(p)).value < TOY.challenge * value;
        const v = c.variant ? valueIn(c.variant.build, c, p) : 0;
        if (c.variant && v > valueIn(c.holder!.build, c, p) && ends(v)) return true;
        return options(b).some((o) => o.act === 'improve' && o.place === p.id && o.job === c.job && keepsWalk(b, o) && ends(o.fit.value));
      });
      expect(g.kind === 'hold', g.text).toBe(helped.length > 0);
      if (g.kind === 'hold') {
        holds++;
        expect(helped.some(({ p, c }) => p.id === g.place && c.job === g.job)).toBe(true);
        expect(g.text.toLowerCase()).toContain(rivalOf(b, g.place!, g.job!)!.named.common.toLowerCase());
      }
      follow(b);
    }
    expect(holds, 'you are asked to hold a cell in 60 goals').toBeGreaterThan(0);
  });

  it('lines (D3): a card opens the next line; you main it, and it founds from its own start build', () => {
    const b = settled(), next = LINES[0];
    expect(nextLine(b)).toEqual({ clade: next.clade, cards: next.cards });
    expect(setMain(b, next.clade), 'not open yet').toBe(false);
    cellOf(b, HOME, 'mats').holder!.build = copy(KING.build);
    const news = b.news.length;
    step(b);
    expect(b.cards.length).toBeGreaterThanOrEqual(next.cards);
    expect(b.lines).toEqual([START.clade, next.clade]);
    expect(b.starts[next.clade]).toEqual(next.start);
    expect(b.news.slice(news).some((line) => line.toLowerCase().includes(CLADE[next.clade].name.toLowerCase()))).toBe(true);
    expect(nextLine(b)).toEqual({ clade: LINES[1].clade, cards: LINES[1].cards });
    expect(b.main).toBe(START.clade);
    const gen = b.gen;
    expect(setMain(b, next.clade)).toBe(true);
    expect(b.main).toBe(next.clade);
    expect(b.gen).toBe(gen);
    const opts = options(b);
    expect(opts.length).toBeGreaterThan(0);
    for (const o of opts) { expect(o.from.clade).toBe(next.clade); expect(cellOf(b, o.place, o.job).holder?.mine ?? false, 'you do not beat yourself').toBe(false); }
    expect(options(b, START.clade).every((o) => o.from.clade === START.clade)).toBe(true);
    expect(live(b, opts[0].place, opts[0].job)).toBe(true);
    expect(cellOf(b, opts[0].place, opts[0].job).holder!.build).toEqual(next.start);
    expect(options(b, START.clade).some((o) => o.place === opts[0].place && o.job === opts[0].job), 'nor does your first line').toBe(false);
    for (const p of b.places) for (const c of p.cells) { const who = c.holder ? null : coming(b, p.id, c.job); if (who) expect(b.lines).not.toContain(who.named.build.clade); }
    invariants(b);
    expect(setMain(b, 'no-such-line')).toBe(false);
  });

  it('following the goal wins a card and opens a line you play; no goal comes back for ever', () => {
    const b = newBoard(SEED), times: Record<string, number> = {};
    let lineGoals = 0;
    for (let i = 0; i < 100; i++) {
      const g = nextGoal(b);
      if (g.kind === 'line') {
        lineGoals++;
        expect(b.lines).toContain(g.line);
        expect(g.line).not.toBe(b.main);
        expect(asked(b).length, 'the line you main has no Life the goal would name').toBe(0);
        expect(asked(b, g.line!).some((o) => o.place === g.place && o.job === g.job), g.text).toBe(true);
      } else if (g.kind !== 'wait') {
        const key = `${g.kind} ${b.places[g.place!].name} ${g.job}`;
        times[key] = (times[key] ?? 0) + 1;
      }
      follow(b);
      if (g.kind === 'line') expect(nextGoal(b).kind, 'the line you were sent to has something to do').not.toBe('line');
      invariants(b);
      if (i === 39) expect(new Set(mine(b).map(({ c }) => c.holder!.build.clade)).size, 'two lines of yours live on the board by goal 40').toBeGreaterThanOrEqual(2);
    }
    expect(lineGoals).toBeGreaterThan(0);
    expect(b.cards.length, 'three cards in 100 goals').toBeGreaterThanOrEqual(3);
    expect(b.lines.length).toBeGreaterThanOrEqual(3);
    for (const [key, n] of Object.entries(times)) expect(n, `"${key}" was the goal ${n} times: a loop`).toBeLessThanOrEqual(MOST);
  });
});
