// Dev panel helpers. Not used by normal play.
import { NUMBERS } from '../data/numbers';
import { NODES, TARGET_NODE } from '../data/tree';
import { found, letItGrow } from './actions';
import { checkProgress, openGenePool } from './genepool';
import { checkReveal } from './progress';
import type { GameState } from './types';

export function addGenes(s: GameState, n: number): void {
  s.genes += n;
}

/** Puts the run where Mosses has just been reached, with a mid-sized colony. */
export function jumpToMosses(s: GameState, tiles = 30): void {
  if (s.phase === 'intro') {
    s.phaseTime = NUMBERS.intro.foundButtonAt;
    found(s);
  }
  if (s.phase === 'arrival') letItGrow(s);
  if (s.phase !== 'colony' || !s.colony) return;
  const c = s.colony;
  [...c.tiles].sort((a, b) => a.ring - b.ring).slice(0, tiles).forEach((t) => (t.covered = true));
  c.water = 0;
  const lvl2 = NUMBERS.photosynthesis.levels[0];
  if (s.skill.xp < lvl2) {
    s.skill.xp = lvl2;
    s.skill.level = Math.max(s.skill.level, 2);
  }
  if (!s.genePool.open) openGenePool(s);
  s.genePool.generation = Math.max(s.genePool.generation, NUMBERS.reveal.releasePreview);
  const target = NODES.find((n) => n.id === TARGET_NODE)!;
  const common = NUMBERS.generation.commonAt;
  for (const id of target.precursors) s.genePool.freq[id] = Math.max(s.genePool.freq[id], common + 0.05);
  checkProgress(s);
  if (target.keyInnovation) s.genePool.freq[target.keyInnovation] = Math.max(s.genePool.freq[target.keyInnovation], common + 0.05);
  checkProgress(s);
  checkReveal(s);
}
