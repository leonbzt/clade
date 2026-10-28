// The headless runner: the bot plays on several seeds, and one compact table says whether the island stays
// alive, mixed and moving. `npm run sim` (SEEDS=5 MIN=60; ASCII=ground,herb,soil adds those text maps, TABLE=1 the species table,
// LIMITS=1 what holds each species back on seed 1).
// A second line per seed measures the variants: shown per species per 10 min, the top share a non-base variant
// reached, sorting (water on Dry + tiles minus the rest of the species), first Rare, combos, Leafy shoot, species made.
// A measuring tool, not a balance bot. Skipped in `npm run check`.
import { it } from 'vitest';
import { writeSync } from 'node:fs';
import { SPECIES } from '../src/data/species';
import { createState } from '../src/sim/state';
import { botTick } from '../src/sim/bot';
import { changed, dominance, hill1, limitShare, livelyLandmarks, minutes, snapshot, spreadOf, swing } from '../src/sim/metrics';
import { profiles } from '../src/sim/fit';
import { LIMIT_COUNT, STRATA, limitName, type LayerId } from '../src/data/fields';
import { interactionTable, layerMap, strataMap } from '../src/sim/ascii';
import { variantStats, variantSummary, type VariantStats } from './variant-stats';

const env = process.env, SEEDS = Number(env.SEEDS || 5), MIN = Number(env.MIN || 60);
const out = (s: string) => writeSync(1, s + '\n'); // straight to stdout: vitest hides console.log
const UNLOCKS = ['mosses', 'lichens', 'vascular', 'ferns'];
const ABBR = ['cy', 'th', 'lv', 'mo', 'li', 'fu', 'cl', 'fe'];

it.skipIf(!env.SIM)('sim', () => {
  if (env.TABLE) out(interactionTable());
  out(`seed | ${UNLOCKS.map((u) => u.slice(0, 4)).join(' ')} | ${ABBR.map((a) => a.padStart(5)).join('')} | hill  dom  turn%/min litter/min N med/top lively | ok`);
  let pass = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const s = createState(seed), when: Record<string, string> = {}, vs: VariantStats = variantStats();
    let snap = snapshot(s), turn = 0, lit = Float32Array.from(s.layers.litter), litSwing = 0;
    for (let k = 0; k < MIN * 600; k++) {
      botTick(s, (l) => { const m = l.match(/^([\d.]+)m (?:evolve|door) (\w+)/); if (m && UNLOCKS.includes(m[2])) when[m[2]] = m[1]; });
      if (s.tick % 10 === 0) vs.sample(s);
      if (s.tick % 6000 === 0) { if (minutes(s) === MIN) turn = changed(s, snap, snapshot(s)) / 10; snap = snapshot(s); }
      // Litter swing: the mean change per tile per minute, over the last 10 minutes.
      if (s.tick % 600 === 0) { if (minutes(s) > MIN - 10) litSwing += swing(s, lit, s.layers.litter) / 10; lit = Float32Array.from(s.layers.litter); }
    }
    const N = spreadOf(s, s.layers.nitrogen);
    const byBase = SPECIES.map((_, b) => s.species.reduce((a, x, sp) => a + (x.base === b ? s.count[sp] : 0), 0));
    const plants = SPECIES.map((sp, i) => (sp.id === 'fungus' ? -1 : byBase[i])).filter((c) => c >= 0);
    const alive = plants.filter((c) => c > 0).length, dom = dominance(s);
    const lively = livelyLandmarks(s), ok = alive >= 5 && dom.share <= 0.6 && turn > 0.0005 && lively >= 4;
    if (ok) pass++;
    out(`${String(seed).padStart(4)} | ${UNLOCKS.map((u) => (when[u] ?? '-').padStart(4)).join(' ')} | ` +
      `${byBase.map((c) => String(c).padStart(5)).join('')} | ${hill1(s).toFixed(2)} ` +
      `${ABBR[s.species[dom.sp]?.base] ?? '--'}${Math.round(dom.share * 100)}% ${(turn * 100).toFixed(2).padStart(5)}     ${litSwing.toFixed(4)}  ` +
      `${N.median.toFixed(2)}/${N.top.toFixed(2)}  ${lively}/${s.landmarks.length} | ${ok ? 'PASS' : 'FAIL'}`);
    out(vs.line(s, MIN));
    if (env.LIMITS && seed === 1) {
      const P = profiles(s);
      for (let sp = 0; sp < s.species.length; sp++) {
        const sh = limitShare(s, P, sp), all = sh.reduce((a, b) => a + b, 0) || 1;
        out(`  ${s.species[sp].id} ` + sh.map((c, j) => c ? `${j < LIMIT_COUNT ? limitName(j).toLowerCase() : 'none'} ${Math.round((100 * c) / all)}%` : '').filter(Boolean).join(' · '));
      }
    }
    if (env.ASCII && seed === 1) for (const m of env.ASCII.split(',')) {
      out(STRATA.includes(m as never) ? strataMap(s, m as (typeof STRATA)[number]) : layerMap(s, m as LayerId));
    }
  }
  out(`${pass}/${SEEDS} seeds pass (≥5 of 7 plants alive, none over 60% of its stratum, still changing, ≥4 lively landmarks)`);
  out(variantSummary());
}, 900_000);
