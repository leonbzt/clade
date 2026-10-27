// The headless runner: the bot plays on several seeds, and one compact table says whether the island stays
// alive, mixed and moving. `npm run sim` (SEEDS=5 MIN=60; ASCII=ground,herb,soil adds those text maps, TABLE=1 the species table,
// LIMITS=1 what holds each species back on seed 1).
// A measuring tool, not a balance bot. Skipped in `npm run check`.
import { it } from 'vitest';
import { writeSync } from 'node:fs';
import { SPECIES } from '../src/data/species';
import { createState } from '../src/sim/state';
import { botTick } from '../src/sim/bot';
import { changed, dominance, hill1, limitShare, minutes, snapshot } from '../src/sim/metrics';
import { profiles } from '../src/sim/fit';
import { LAYER_IDS, STRATA, type LayerId } from '../src/data/fields';
import { interactionTable, layerMap, strataMap } from '../src/sim/ascii';

const env = process.env, SEEDS = Number(env.SEEDS || 5), MIN = Number(env.MIN || 60);
const out = (s: string) => writeSync(1, s + '\n'); // straight to stdout: vitest hides console.log
const UNLOCKS = ['lichens', 'vascular', 'ferns'];
const ABBR = ['cy', 'lv', 'mo', 'li', 'fu', 'cl', 'fe'];

it.skipIf(!env.SIM)('sim', () => {
  if (env.TABLE) out(interactionTable());
  out(`seed | ${UNLOCKS.map((u) => u.slice(0, 4)).join(' ')} | ${ABBR.map((a) => a.padStart(4)).join('')} | hill  dom  turn%/min | ok`);
  let pass = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const s = createState(seed), when: Record<string, string> = {};
    let snap = snapshot(s), turn = 0;
    for (let k = 0; k < MIN * 600; k++) {
      botTick(s, (l) => { const m = l.match(/^([\d.]+)m evolve (\w+)/); if (m && UNLOCKS.includes(m[2])) when[m[2]] = m[1]; });
      if (s.tick % 6000 === 0) { if (minutes(s) === MIN) turn = changed(s, snap, s.occ) / 10; snap = snapshot(s); }
    }
    const plants = SPECIES.map((sp, i) => (sp.id === 'fungus' ? -1 : s.count[i])).filter((c) => c >= 0);
    const alive = plants.filter((c) => c > 0).length, dom = dominance(s);
    const ok = alive >= 5 && dom.share <= 0.6 && turn > 0.002;
    if (ok) pass++;
    out(`${String(seed).padStart(4)} | ${UNLOCKS.map((u) => (when[u] ?? '-').padStart(4)).join(' ')} | ` +
      `${Array.from(s.count).map((c) => String(c).padStart(4)).join('')} | ${hill1(s).toFixed(2)} ` +
      `${ABBR[dom.sp] ?? '--'}${Math.round(dom.share * 100)}% ${(turn * 100).toFixed(2).padStart(5)} | ${ok ? 'PASS' : 'FAIL'}`);
    if (env.LIMITS && seed === 1) {
      const P = profiles(s);
      for (const p of P) {
        const sh = limitShare(s, p), all = sh.reduce((a, b) => a + b, 0) || 1;
        out(`  ${ABBR[p.sp]} ` + [...LAYER_IDS, 'none'].map((l, j) => sh[j] ? `${l} ${Math.round((100 * sh[j]) / all)}%` : '').filter(Boolean).join(' · '));
      }
    }
    if (env.ASCII && seed === 1) for (const m of env.ASCII.split(',')) {
      out(STRATA.includes(m as never) ? strataMap(s, m as (typeof STRATA)[number]) : layerMap(s, m as LayerId));
    }
  }
  out(`${pass}/${SEEDS} seeds pass (≥5 of 6 plants alive, none over 60% of its stratum, still changing)`);
}, 900_000);
