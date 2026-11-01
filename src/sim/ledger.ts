// The books in grams: plants, litter and animals. Every gram that enters or leaves them is counted: production (plant
// growth and seedlings), animals that came from outside (arrivals, founder groups), what animals burn, and decay
// (litter breaking down, by itself or by fungi). Eaten (plants and litter into animals) and dropped (dung and bodies
// into litter) move grams inside the books; they're shown, not summed. Once a minute the change in what stands is set
// against the flows; the gap should be 0. Read-only: nothing here changes the sim.
import { STRATA } from '../data/fields';
import { SEA } from './island';
import type { State } from './state';
import { LITTER_G } from './tally';
import { gramsOf } from './bodies';

export type Flows = { prod: number; came: number; burn: number; eaten: number; dropped: number; decay: number };
export type Ledger = Flows & {
  at: number; // grams standing at the last close
  last: Flows & { gap: number; stock: number; animals: number }; // the last minute's flows, the gap, and what stands now
};

const zero = (): Flows => ({ prod: 0, came: 0, burn: 0, eaten: 0, dropped: 0, decay: 0 });
export const newLedger = (): Ledger => ({ ...zero(), at: 0, last: { ...zero(), gap: 0, stock: 0, animals: 0 } });

/** Grams in the animals. */
export const animalGrams = (s: State) => s.agents.reduce((g, a) => g + (a.n > 0 ? gramsOf(s, a) : 0), 0);

/** Grams standing: plant mass, the litter, the litter still falling (it lands at the next layer update), animals. */
export function standing(s: State): number {
  const n = s.w * s.h;
  let g = animalGrams(s);
  for (let slot = 0; slot < n * STRATA.length; slot++) g += s.mass[slot];
  for (let i = 0; i < n; i++) g += (s.terrain[i] !== SEA ? s.layers.litter[i] : 0) * LITTER_G + s.fall[i] * LITTER_G;
  return g;
}

/** Closes a period: the flows since the last close, and the gap between them and what changed. */
export function closeLedger(s: State) {
  const L = s.ledger, now = standing(s);
  L.last = { prod: L.prod, came: L.came, burn: L.burn, eaten: L.eaten, dropped: L.dropped, decay: L.decay, stock: now, animals: animalGrams(s),
    gap: now - L.at - (L.prod + L.came - L.burn - L.decay) };
  L.at = now;
  Object.assign(L, zero());
}
