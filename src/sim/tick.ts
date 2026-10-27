// One sim tick, always the same systems in the same order. Rates are per second × dt, so a system can run less
// often (the layers run once a second) without changing the balance.
import { NUM } from '../data/numbers';
import { checkReady } from './commands';
import { updateFields } from './fields';
import { profiles } from './fit';
import { flares, lifeStep, sporeRain } from './life';
import { trends } from './metrics';
import { type State } from './state';
import { keyInnovation, recount } from './variants';

const DT = 1 / NUM.ticksPerSec;
const LOG_KEEP = 30;

export function step(s: State) {
  s.tick++;
  const P = profiles(s);
  flares(s, DT);
  const gain = lifeStep(s, P, DT);
  sporeRain(s, P, DT);
  recount(s);
  if (s.tick % NUM.fieldsEvery === 0) {
    updateFields(s, P, NUM.fieldsEvery * DT);
    keyInnovation(s, P, NUM.fieldsEvery * DT);
    checkReady(s);
  }
  if (s.tick % (NUM.trendEvery * NUM.ticksPerSec) === 0) trends(s, P);
  if (s.log.length > LOG_KEEP) s.log.splice(0, s.log.length - LOG_KEEP);
  s.biomass += gain;
  s.gain = gain;
  s.rate += (gain / DT - s.rate) * (DT / NUM.rateSmoothing);
}

export function advance(s: State, ticks: number) {
  for (let k = 0; k < ticks; k++) step(s);
}
