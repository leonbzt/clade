// A line keeps XP and ranks only. Level, available points and carried parts are derived.
import { LINE_RULE, RANK_CAP } from '../data/lines';
import type { Letter, Lineage, PartId, Species } from './records';

export function levelOf(xp: number): number {
  let level = 1;
  while (level < LINE_RULE.cap && xp >= LINE_RULE.xpAt[level + 1]) level++;
  return level;
}

export const xpFor = (eggs: number, letter: Letter): number => eggs > 0 ? eggs * LINE_RULE.tierWeight[letter] : 0;
export const toNext = (xp: number): number | null =>
  levelOf(xp) >= LINE_RULE.cap ? null : LINE_RULE.xpAt[levelOf(xp) + 1] - xp;
export const pointsOf = (lineage: Lineage): number =>
  levelOf(lineage.xp) - 1 - Object.values(lineage.ranks).reduce((total, rank) => total + rank, 0);

export function addXp(lineage: Lineage, xp: number): void {
  lineage.xp += xp;
}

/** Read the world's species to check ownership; never store a second part pool on the line. */
export function spend(lineage: Lineage, part: PartId, species: readonly Species[]): boolean {
  const rank = lineage.ranks[part] ?? 0;
  if (pointsOf(lineage) <= 0 || rank >= RANK_CAP) return false;
  if (!species.some((s) => s.lineage === lineage.id && Object.values(s.build.parts).includes(part))) return false;
  lineage.ranks[part] = rank + 1;
  return true;
}
