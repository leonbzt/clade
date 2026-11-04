// The stand: the light grid, a steered root against an unsteered one, and a run's years.
import { describe, expect, it } from 'vitest';
import { FOUNDER_GENES, FORMS, type FormId } from '../src/data/genes';
import { FOREST, LAVA, WET } from '../src/data/island';
import { NICHE_AT } from '../src/data/niches';
import { cast, lightAt, newLight } from '../src/sim/run/light';
import { measure } from '../src/sim/run/plant';
import { cellCentre } from '../src/sim/run/plot';
import { advance, found, newRun, yearTicks, type Run } from '../src/sim/run/run';
import { rootToward } from '../src/sim/run/verbs';

const runOf = (form: FormId, kind: number, seed: number) => newRun(form, FOUNDER_GENES, kind, NICHE_AT[kind][FORMS[form].layer], 0.5, [], seed);

describe('the light grid', () => {
  it('a leaf shades along the sun, not against it', () => {
    const L = newLight(0.4); // the sun on the right: shade falls down and to the left
    cast(L, 480, 100, 1);
    const along = [480 - 100 * Math.sin(0.4), 100 + 100 * Math.cos(0.4)], against = [480 + 100 * Math.sin(0.4), 100 + 100 * Math.cos(0.4)];
    expect(lightAt(L, along[0], along[1])).toBeLessThan(0.5);
    expect(lightAt(L, against[0], against[1])).toBe(1);
    expect(lightAt(L, 480, 40)).toBe(1); // above the leaf
  });
});

/** The water pocket nearest the selected sapling's root, within 10 cells. */
function nearPocket(r: Run) {
  const p = r.stand[r.sel].plant, root = p.nodes[2];
  let best = -1, bd = 10 * 20;
  r.plot.cells.forEach((c, i) => {
    if (c.kind !== 'water') return;
    const q = cellCentre(i), d = Math.hypot(q.x - root.x, q.y - root.y);
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

describe('the stand', () => {
  it('roots steered to pockets grow more grams over a year than roots left to their genes (2 seeds, forest)', () => {
    let plain = 0, steered = 0;
    for (const seed of [7, 8]) {
      const a = runOf('herb', FOREST, seed), b = runOf('herb', FOREST, seed), cell = nearPocket(b);
      expect(cell).toBeGreaterThanOrEqual(0);
      const q = cellCentre(cell);
      expect(rootToward(b.stand[b.sel].plant, b.plot, q.x, q.y)).toBeGreaterThan(0);
      advance(a, yearTicks('herb')); advance(b, yearTicks('herb'));
      const grams = (r: Run) => measure(r.stand[r.sel].plant, r.plot).biomass;
      plain += grams(a); steered += grams(b);
    }
    expect(steered).toBeGreaterThan(plain * 1.2);
  });

  it('moss: the founder seeds each year; the last year ends the run', () => {
    const r = runOf('moss', LAVA, 9);
    for (let y = 1; y <= FORMS.moss.years; y++) {
      expect(r.stand.length).toBe(3);
      advance(r, yearTicks('moss'));
      expect(r.last!.every((x) => x.score >= 0 && x.grams > 0)).toBe(true);
      if (y < FORMS.moss.years) { expect(r.phase).toBe('winter'); found(r, 0); expect(r.year).toBe(y + 1); }
    }
    expect(r.phase).toBe('end');
  });

  it('wet herb: one year grows three saplings', () => {
    const r = runOf('herb', WET, 11);
    advance(r, yearTicks('herb'));
    expect(r.last!.filter((x) => x.score > 5).length).toBe(3);
  });
});
