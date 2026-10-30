// The books in grams: plants and litter (animals join in part C). Every gram that enters or leaves them is counted:
// production (plant growth and seedlings), eaten by animals, dropped by animals (bodies, dung) and decay (litter
// breaking down, by itself or by fungi). Once a minute the change in what stands is set against the flows; the gap
// should be 0. Read-only: nothing here changes the sim.
import { STRATA } from '../data/fields';
import { SEA } from './island';
import type { State } from './state';
import { LITTER_G } from './tally';

export type Flows = { prod: number; eaten: number; dropped: number; decay: number };
export type Ledger = Flows & {
  at: number; // grams standing at the last close
  last: Flows & { gap: number; stock: number }; // the last minute's flows, the gap, and what stands now
};

export const newLedger = (): Ledger => ({ prod: 0, eaten: 0, dropped: 0, decay: 0, at: 0, last: { prod: 0, eaten: 0, dropped: 0, decay: 0, gap: 0, stock: 0 } });

/** Grams standing: plant mass, the litter, and the litter still falling (it lands at the next layer update). */
export function standing(s: State): number {
  const n = s.w * s.h;
  let g = 0;
  for (let slot = 0; slot < n * STRATA.length; slot++) g += s.mass[slot];
  for (let i = 0; i < n; i++) if (s.terrain[i] !== SEA) g += (s.layers.litter[i] + s.fall[i]) * LITTER_G;
  return g;
}

/** Closes a period: the flows since the last close, and the gap between them and what changed. */
export function closeLedger(s: State) {
  const L = s.ledger, now = standing(s);
  L.last = { prod: L.prod, eaten: L.eaten, dropped: L.dropped, decay: L.decay, stock: now, gap: now - L.at - (L.prod - L.eaten + L.dropped - L.decay) };
  L.at = now; L.prod = 0; L.eaten = 0; L.dropped = 0; L.decay = 0;
}
