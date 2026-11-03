// Dev only: one season per form on each kind, auto picks, raw stats and scores. `npx tsx scripts/dev/season.ts`
import { BASE_GENES, FORMS, type FormId } from '../../src/data/genes';
import { BARE, FOREST, LAVA, WET } from '../../src/data/island';
import { NICHE_AT } from '../../src/data/niches';
import { advance, autoPick, newRun, pick, runScore } from '../../src/sim/run/run';
import { measure } from '../../src/sim/run/plant';
const kinds = { lava: LAVA, bare: BARE, forest: FOREST, wet: WET };
for (const form of ['moss', 'herb', 'tree'] as FormId[]) for (const [kn, kind] of Object.entries(kinds)) {
  const niche = NICHE_AT[kind][FORMS[form].layer];
  if (niche < 0) continue;
  for (const auto of [false, true]) {
    const t0 = performance.now();
    const r = newRun(form, BASE_GENES, kind, niche, 0.5, [{ layer: FORMS[form].layer, name: 'x', cover: 0.6 }], 42);
    let picks = 0;
    while (r.season === 1 && r.phase !== 'brood' && r.phase !== 'winter' && r.phase !== 'end') {
      if (r.phase === 'pick') { pick(r, auto ? autoPick(r) : -1); picks++; }
      advance(r, 1000);
    }
    const raw = r.history[0]?.raw ?? measure(r.plant, r.plot).raw;
    console.log(form, kn, auto ? 'auto' : 'none', 'raw', raw.map((v) => v.toFixed(1)).join(' '), 'score', runScore(r, raw), 'nodes', r.plant.nodes.length, 'ms', (performance.now() - t0).toFixed(0), 'offers', r.offers.length);
  }
}
