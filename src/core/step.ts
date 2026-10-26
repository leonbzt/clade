// step(dt) drives the whole game. Everything else in core is called from here or from actions.
import { NUMBERS } from '../data/numbers';
import { coveredCount, stepColony } from './colony';
import { startFill, stepGarden } from './garden';
import { openGenePool, stepGenePool } from './genepool';
import { addXp, checkReveal } from './progress';
import { setPhase } from './state';
import type { GameState } from './types';

export function step(s: GameState, dt: number): void {
  s.t += dt;
  s.phaseTime += dt;

  if (s.phase === 'colony' && s.colony) {
    const energy = stepColony(s, s.colony, dt);
    addXp(s, energy);
    if (!s.genePool.open && coveredCount(s.colony) >= NUMBERS.goal.coverTiles) openGenePool(s);
    stepGenePool(s, dt);
    checkReveal(s);
  }

  if (s.phase === 'dispersal' && s.phaseTime >= NUMBERS.release.dispersalTime) {
    setPhase(s, 'garden');
    startFill(s.garden);
  }

  stepGarden(s.garden, dt);
}

/** Runs `seconds` of sim time in fixed ticks. */
export function advance(s: GameState, seconds: number): void {
  const dt = NUMBERS.sim.tickDt;
  let left = seconds;
  while (left > 1e-9) {
    const d = Math.min(dt, left);
    step(s, d);
    left -= d;
  }
}
