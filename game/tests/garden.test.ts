// Slice 13: the garden (self-limit, release, offline), the one door, and the budgets.
import { describe, expect, it } from 'vitest';
import { MODEL } from '../src/data/garden';
import { HABITATS, HAB_ORDER } from '../src/data/habitats';
import * as L from '../src/sim/life';
import { boardFor, boardIsValid, resultOf, roleFromDiet } from '../src/sim/door';
import { capacity, catchUp, newGarden, popOf, release, rowOf, shares, step, type Entry } from '../src/sim/garden';
import { advance, freshSave } from '../src/sim/save';

const e = (score: number): Entry => ({ sp: `s${score}`, name: 'x', role: 'grazer', pop: 1, score, proven: true });

describe('the garden', () => {
  it('the self-limit: no species takes more than its share of a row', () => {
    expect(shares([e(40)])[0]).toBeCloseTo(MODEL.selfMax);
    const s = shares([e(40), e(10), e(5)]);
    expect(s[0]).toBeCloseTo(MODEL.selfMax);
    expect(s[1] + s[2]).toBeCloseTo(1 - MODEL.selfMax);
  });

  it('settles with natives in every role, and keeps every row alive for a long run', () => {
    const g = newGarden(3);
    for (let k = 0; k < 400; k++) step(g);
    for (const id of HAB_ORDER) for (const role of ['grazer', 'burrower', 'predator'] as const) expect(popOf(g.habs[id], role)).toBeGreaterThan(0);
  });

  it('a strong line of yours joins its row but cannot take it all', () => {
    const g = newGarden(5);
    release(g, { hab: 'mud', plan: 'worm', role: 'burrower', eggs: 60 });
    for (let k = 0; k < 120; k++) step(g);
    const h = g.habs.mud, mine = h.entries.find((x) => x.line === 'worm' && x.role === 'burrower')!;
    expect(mine.pop).toBeGreaterThan(0);
    expect(mine.pop).toBeLessThan(capacity(h).burrower * MODEL.selfMax * 1.35);
    expect(rowOf(h, 'burrower').length).toBeGreaterThan(1);
    expect(g.news.every((n) => n.why.length > 0)).toBe(true);
  });

  it('the door writes valid boards, and a Life lands where it ate', () => {
    const g = newGarden(7);
    for (const id of HAB_ORDER) expect(boardIsValid(boardFor(g, id))).toBe(true);
    const l = L.newLife(1, 'worm', boardFor(g, 'mud'));
    l.ate = { mat: 20, buried: 6 }; l.eggs = 9;
    expect(resultOf(l)).toEqual({ hab: 'mud', plan: 'worm', eggs: 9, role: 'grazer' });
    expect(roleFromDiet({ prey: 30 }, 'swimmer')).toBe('predator');
    expect(roleFromDiet({}, 'worm')).toBe('burrower');
    expect(boardFor(g, 'sand').prey.length).toBeGreaterThanOrEqual(2);
  });

  it('budgets: a step under 0.1 ms; 8 h offline under 0.5 s', () => {
    const g = newGarden(9);
    for (let k = 0; k < 100; k++) step(g); // warm up; then the best of five batches (other tests run alongside)
    const batch = () => { const t0 = performance.now(); for (let k = 0; k < 100; k++) step(g); return (performance.now() - t0) / 100; };
    expect(Math.min(batch(), batch(), batch(), batch(), batch())).toBeLessThan(0.1);
    let t = 0;
    const s = freshSave(11, 0);
    t = performance.now();
    const r = advance(s, 8 * 3600_000);
    expect(performance.now() - t).toBeLessThan(500);
    expect(r.gens).toBe(MODEL.awayCap);
    expect(catchUp(g, MODEL.genMs * 2).gens).toBe(2);
    void HABITATS;
  });
});
