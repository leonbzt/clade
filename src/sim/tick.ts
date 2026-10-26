// One sim tick: growth, soil building, yield, spread and competition. A cellular automaton over the tiles.
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { rand } from './rng';
import { BEACH, neighbours, type State } from './state';
import { allStats, fit, type Stats } from './stats';

export function step(s: State) {
  s.tick++;
  const st = allStats(s), n = s.w * s.h;
  let gain = 0;
  // Start at a random tile each tick so no direction is favoured.
  const start = Math.floor(rand(s) * n);
  for (let k = 0; k < n; k++) {
    const i = (start + k) % n, sp = s.occ[i];
    if (sp < 0) continue;
    const f = fit(s, st[sp], sp, i);
    if (f <= 0) {
      if (rand(s) < NUM.dieback) { s.occ[i] = -1; s.growth[i] = 0; }
      continue;
    }
    const g = (s.growth[i] = Math.min(1, s.growth[i] + NUM.growth * f));
    const cap = soilCap(s, i);
    s.soil[i] = Math.min(cap, s.soil[i] + st[sp].soilBuild * f * g);
    if (!SPECIES[sp].wild) gain += st[sp].yield * f * g * NUM.yieldPerTick;
    const floor = NUM.spreadGrowthFloor;
    if (rand(s) < st[sp].spread * (floor + (1 - floor) * g)) trySpread(s, st, sp, i);
  }
  s.biomass += gain;
  s.gain = gain;
}

/** Strength on a tile: fit × vigour. Young tiles hold on less well. */
export function strength(s: State, st: Stats[], sp: number, i: number, growth = 1): number {
  return fit(s, st[sp], sp, i) * st[sp].vigor * (0.5 + 0.5 * growth);
}

function trySpread(s: State, st: Stats[], sp: number, from: number) {
  const nb = neighbours(s, from);
  const j = nb[Math.floor(rand(s) * nb.length)];
  const occ = s.occ[j];
  if (occ === sp || fit(s, st[sp], sp, j) <= 0) return;
  if (occ < 0) { s.occ[j] = sp; s.growth[j] = 0.05; return; }
  const mine = strength(s, st, sp, j), theirs = strength(s, st, occ, j, s.growth[j]);
  if (mine > theirs * (1 + NUM.incumbentEdge) && rand(s) < NUM.takeover) {
    s.occ[j] = sp; s.growth[j] = 0.05;
  }
}

export function soilCap(s: State, i: number): number {
  const S = NUM.soil;
  return Math.min(s.terrain[i] === BEACH ? S.capBeach : S.capLava, S.capBase + S.capPerMoisture * s.moisture[i]);
}

export function advance(s: State, ticks: number) {
  for (let k = 0; k < ticks; k++) step(s);
}
