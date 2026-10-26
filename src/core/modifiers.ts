// What the common traits and the skill add up to.
import { NUMBERS } from '../data/numbers';
import { TRAITS, type TraitId } from '../data/traits';
import type { GameState } from './types';

export interface Modifiers {
  spreadCost: number;
  spreadEnergy: number;
  water: number;
  dryResist: number;
  genes: number;
  energy: number;
}

export function isCommon(freq: number): boolean {
  return freq >= NUMBERS.generation.commonAt;
}

export function commonTraits(s: GameState): TraitId[] {
  return TRAITS.filter((t) => isCommon(s.genePool.freq[t.id])).map((t) => t.id);
}

export function modifiers(s: GameState): Modifiers {
  const m: Modifiers = { spreadCost: 1, spreadEnergy: 1, water: 1, dryResist: 0, genes: 1, energy: 1 };
  for (const t of TRAITS) {
    if (!isCommon(s.genePool.freq[t.id])) continue;
    const e = t.effects;
    m.spreadCost *= e.spreadCost ?? 1;
    m.spreadEnergy *= e.spreadEnergy ?? 1;
    m.water *= e.water ?? 1;
    m.dryResist += e.dryResist ?? 0;
    m.genes *= e.genes ?? 1;
    m.energy *= e.energy ?? 1;
  }
  m.energy *= 1 + NUMBERS.energy.photosynthesisPerLevel * (s.skill.level - 1);
  return m;
}
