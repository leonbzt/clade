// The run: one season per form with auto picks (no longer: the side view is played, not simulated).
import { describe, expect, it } from 'vitest';
import { FOUNDER_GENES, FORMS, type FormId } from '../src/data/genes';
import { FOREST, LAVA, WET } from '../src/data/island';
import { NICHE_AT } from '../src/data/niches';
import { advance, autoPick, chooseSeed, cutAt, newRun, pick, springRun } from '../src/sim/run/run';

const kindFor: Record<FormId, number> = { moss: LAVA, herb: WET, tree: FOREST };

describe('run', () => {
  for (const form of ['moss', 'herb', 'tree'] as FormId[]) {
    it(`${form}: a season of pulses with offers ends in a brood or a winter`, () => {
      const kind = kindFor[form], r = newRun(form, FOUNDER_GENES, kind, NICHE_AT[kind][FORMS[form].layer], 0.6, [], 5);
      let picks = 0;
      while (r.season === 1 && (r.phase === 'pick' || r.phase === 'grow')) {
        if (r.phase === 'pick') {
          expect(r.offers.length).toBeGreaterThanOrEqual(2);
          if (picks === 3) cutAt(r, r.plant.nodes.length - 1);
          pick(r, autoPick(r)); picks++;
        }
        advance(r, 50);
      }
      expect(picks).toBe(10);
      expect(r.history[0].score).toBeGreaterThan(5);
      expect(r.phase).toBe(form === 'tree' ? 'winter' : 'brood');
      if (form === 'tree') springRun(r); else { expect(r.seeds!.length).toBe(3); chooseSeed(r, 0); }
      expect(r.season).toBe(2);
      expect(r.phase).toBe('pick');
    });
  }
});
