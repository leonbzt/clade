// Fit, the release preview, and the release itself.
import { NICHES, type NicheId, type Tier } from '../data/niches';
import { NUMBERS } from '../data/numbers';
import { TEXT } from '../data/text';
import { TARGET_NODE } from '../data/tree';
import { coveredCount } from './colony';
import { addSpecies } from './garden';
import { generationTime } from './genepool';
import { commonTraits } from './modifiers';
import { createGenePool, logEvent, setPhase } from './state';
import { advance } from './step';
import type { GameState } from './types';

export function fitScore(s: GameState, niche: NicheId): number {
  const def = NICHES.find((n) => n.id === niche)!;
  return commonTraits(s).reduce((sum, id) => sum + (def.weights[id] ?? 0), 0);
}

export function fitTier(s: GameState, niche: NicheId): Tier {
  const def = NICHES.find((n) => n.id === niche)!;
  const score = fitScore(s, niche);
  return score >= def.goldAt ? 'gold' : score >= def.silverAt ? 'silver' : 'bronze';
}

export function fitAll(s: GameState): Record<NicheId, Tier> {
  return Object.fromEntries(NICHES.map((n) => [n.id, fitTier(s, n.id)])) as Record<NicheId, Tier>;
}

export interface ReleaseGain {
  biomassPerSec: number;
  fit: Record<NicheId, Tier>;
  share: Record<NicheId, number>; // share of each niche the garden will fill
}

/** What releasing right now gives, once the garden has filled in. */
export function releaseGain(s: GameState): ReleaseGain {
  const fit = fitAll(s);
  const tiles = s.colony ? coveredCount(s.colony) : 0;
  const mult = NICHES.reduce((sum, n) => sum + n.mult[fit[n.id]], 0);
  const share = Object.fromEntries(NICHES.map((n) => [n.id, n.share[fit[n.id]]])) as Record<NicheId, number>;
  return { biomassPerSec: tiles * NUMBERS.release.biomassPerTile * mult, fit, share };
}

/** The gain after one more generation, with the split left as it is and no picks. */
export function releaseGainPlusOne(s: GameState): ReleaseGain {
  const copy = structuredClone(s);
  advance(copy, generationTime(copy));
  return releaseGain(copy);
}

export function canRelease(s: GameState): boolean {
  return s.phase === 'colony' && s.reached.includes(TARGET_NODE);
}

export function release(s: GameState): boolean {
  if (!canRelease(s)) return false;
  const gain = releaseGain(s);
  addSpecies(s.garden, { name: s.speciesName, traits: commonTraits(s), ...gain });
  // kept: skill, reached nodes, traits found. Reset: genes, the colony in the slot.
  s.colony = null;
  s.genes = 0;
  s.genePool = createGenePool();
  setPhase(s, 'dispersal');
  logEvent(s, TEXT.events.released);
  return true;
}
