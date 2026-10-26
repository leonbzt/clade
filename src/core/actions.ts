// Everything the player can do. The UI calls only these (and reads the state).
import { NUMBERS } from '../data/numbers';
import { TEXT } from '../data/text';
import type { TraitId } from '../data/traits';
import { TARGET_NODE } from '../data/tree';
import { coveredCount, normaliseSplit } from './colony';
import { startFill } from './garden';
import { favour as favourVariant, pass as passOffer } from './genepool';
import { release as releaseColony } from './release';
import { createColony, setPhase } from './state';
import type { GameState, Split } from './types';

export function canFound(s: GameState): boolean {
  return s.phase === 'intro' && s.phaseTime >= NUMBERS.intro.foundButtonAt;
}

export function found(s: GameState): void {
  if (!canFound(s)) return;
  setPhase(s, 'arrival');
}

export function letItGrow(s: GameState): void {
  if (s.phase !== 'arrival') return;
  s.colony = createColony();
  setPhase(s, 'colony');
}

export function rename(s: GameState, name: string): void {
  const trimmed = name.trim();
  s.speciesName = trimmed.length > 0 ? trimmed : TEXT.defaultName;
}

export function setSplit(s: GameState, split: Split): void {
  if (s.colony) s.colony.split = normaliseSplit(split);
}

export function favour(s: GameState, offerId: number, trait: TraitId): boolean {
  return favourVariant(s, offerId, trait);
}

export function pass(s: GameState, offerId: number): void {
  passOffer(s, offerId);
}

export function closeCodex(s: GameState): void {
  s.codexOpen = null;
}

export function release(s: GameState): boolean {
  return releaseColony(s);
}

export function skipDispersal(s: GameState): void {
  if (s.phase !== 'dispersal') return;
  setPhase(s, 'garden');
  startFill(s.garden);
}

export type Goal = { text: string; done: boolean } | null;

export function currentGoal(s: GameState): Goal {
  if (s.phase === 'intro' || s.phase === 'arrival') return null;
  if (s.phase === 'dispersal' || s.phase === 'garden') return { text: TEXT.goals.next, done: false };
  if (!s.colony) return null;
  if (!s.genePool.open) {
    return { text: TEXT.goals.cover(coveredCount(s.colony), NUMBERS.goal.coverTiles), done: false };
  }
  if (s.reached.includes(TARGET_NODE)) return { text: TEXT.goals.release, done: false };
  if (s.reveal.tree) return { text: TEXT.goals.mosses, done: false };
  return null;
}
