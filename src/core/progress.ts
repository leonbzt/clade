// The Photosynthesis skill and the panels that open as the run goes on.
import { NUMBERS } from '../data/numbers';
import { TEXT } from '../data/text';
import { logEvent } from './state';
import type { GameState, Reveal } from './types';

const P = NUMBERS.photosynthesis;

export function maxLevel(): number {
  return P.levels.length + 1;
}

/** XP needed for the next level, or null at max. */
export function nextLevelXp(level: number): number | null {
  return P.levels[level - 1] ?? null;
}

export function addXp(s: GameState, energy: number): void {
  s.skill.xp += energy * P.xpPerEnergy;
  let next = nextLevelXp(s.skill.level);
  while (next !== null && s.skill.xp >= next) {
    s.skill.level++;
    logEvent(s, s.skill.level === P.autoGenerationsAt ? TEXT.events.autoGenerations : TEXT.events.levelUp(s.skill.level));
    next = nextLevelXp(s.skill.level);
  }
}

export function checkReveal(s: GameState): void {
  const gen = s.genePool.generation;
  const r = NUMBERS.reveal;
  const open = (key: keyof Reveal, at: number, text?: string) => {
    if (!s.reveal[key] && gen >= at) {
      s.reveal[key] = true;
      if (text) logEvent(s, text);
    }
  };
  open('tree', r.tree, TEXT.events.treeOpens);
  open('fit', r.fit, TEXT.events.fitShows);
  open('releasePreview', r.releasePreview);
}
