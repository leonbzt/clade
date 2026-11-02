// What a placing mode puts down, for the map's placement view and its hover line: founding at home (commands.ts),
// or on a run the founder's landing ('land') and the heir of brood card k ('heir:k'), free, the heir within reach.
import { RUN } from '../data/islands';
import { placement, type Placement } from './commands';
import { cardProfile, fitWord, reachMask } from './brood';
import { fit, profiles, type Profile } from './fit';
import { buildFounder } from './run';
import type { State } from './state';

export type AnyPlacement = Placement & { run?: (i: number) => { word: string; reason: string } };

export function placementOf(s: State, placing: string, P: Profile[] = profiles(s)): AnyPlacement | null {
  const R = s.run;
  if (!R) return placement(s, placing, P);
  let p: Profile, name: string, mask: Uint8Array | null = null;
  if (placing === 'land' && !R.landed) { p = buildFounder(s); name = `${R.founder.name} (the founder)`; }
  else if (placing.startsWith('heir:') && R.brood[Number(placing.slice(5))]) {
    const c = R.brood[Number(placing.slice(5))];
    p = cardProfile(s, c.genome); name = `${c.name} (the heir)`; mask = reachMask(s);
  } else return null;
  const ok = (i: number) => fit(s, p, i) > 0 && (!mask || mask[i] === 1);
  const run = (i: number) => (mask && !mask[i] ? { word: 'too far', reason: `heirs go within ${RUN.reach} tiles of the line` } : fitWord(s, p, i));
  return { p, name, cost: 0, ok, run };
}
