// The run line for `npm run sim`: at minute 10 the run bot plays one run per theme from home (free, so home's numbers
// stay as they were) and prints seasons lived, the best fit and the XP. Home doesn't move during a run.
import { RUN } from '../src/data/islands';
import { runBotTick } from '../src/sim/bot';
import { finish, founders, levelOf, offers } from '../src/sim/lineage';
import { startRun } from '../src/sim/run';
import type { State } from '../src/sim/state';

export function runLine(home: State): { text: string; lived: boolean } {
  let lived = true;
  const parts = offers(home).map((o) => {
    const r = startRun(home, o, founders(home)[0], true);
    for (let k = 0; !r.run!.end && k < (RUN.seasons + 1) * RUN.season * 10; k++) runBotTick(r);
    const R = r.run!, line = finish(home, r);
    if (R.end === 'died' || line.seasons < RUN.seasons) lived = false;
    return `${o.theme} ${o.size[0]} ${line.seasons}s best ${Math.round(R.best * 100)}% xp ${line.xp}${R.keys.length ? ` key ${R.keys.join(',')}` : ''} → ${line.form}`;
  });
  return { text: `     runs: ${parts.join(' | ')} | level ${levelOf(home.lineage!.xp).level}`, lived };
}
