// The curve model: the greedy bot plays 40 minutes and prints when things happen. Run with `npm run curve`.
// A ruler for pacing, not a balance bot. Skipped in `npm run check`.
import { it } from 'vitest';
import { writeSync } from 'node:fs';
import { createState } from '../src/sim/state';
import { coverCount } from '../src/sim/commands';
import { botTick } from '../src/sim/bot';
import { SPECIES } from '../src/data/species';

it.skipIf(!process.env.CURVE)('curve', () => {
  const s = createState(1), log: string[] = [];
  for (let k = 0; k < 10 * 60 * 40; k++) {
    botTick(s, (l) => log.push(l));
    if (s.tick % 1800 === 0) {
      let soil1 = 0, soil2 = 0;
      for (const v of s.soil) { if (v >= 1) soil1++; if (v >= 2) soil2++; }
      log.push(`${(s.tick / 600).toFixed(1)}m bio=${s.biomass.toFixed(0)} rate=${(s.gain * 10).toFixed(1)}/s ` +
        SPECIES.map((sp) => `${sp.id}=${coverCount(s, sp.id)}`).join(' ') + ` soil1=${soil1} soil2=${soil2}`);
    }
  }
  writeSync(1, log.join('\n') + '\n'); // straight to stdout: vitest hides console.log
});
