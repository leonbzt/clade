// The line view, read-only: the line's species as a family tree with where each lives, and the parts it carries.
import { RANK_CAP } from '../data/lines';
import { PARTS } from '../data/parts';
import { partUpkeep } from '../sim/fitness';
import type { Letter, Lineage, PartId, Species, World } from '../sim/records';
import { bestFit } from './tiers';

export interface FamilyNode { species: Species; homes: { name: string; letter: Letter }[]; children: FamilyNode[] }

/** Roots are species whose parent is outside the line (or none). Extinct species stay, with no homes. */
export function familyOf(world: World, line: Lineage): FamilyNode[] {
  const own = world.species.filter((s) => s.lineage === line.id);
  const node = (species: Species): FamilyNode => ({
    species,
    homes: world.habitats.filter((h) => (h.pops[species.id] ?? 0) > 0)
      .map((h) => ({ name: h.name, letter: bestFit(species.build, line.ranks, h, world)?.fit.letter ?? 'F' })),
    children: own.filter((c) => c.parent === species.id).map(node),
  });
  return own.filter((s) => !own.some((p) => p.id === s.parent)).map(node);
}

/** Every part a species of the line has, in first-seen order, with its rank and upkeep before and after ranks. */
export function carriedParts(world: World, line: Lineage) {
  const ids = [...new Set(world.species.filter((s) => s.lineage === line.id)
    .flatMap((s) => Object.values(s.build.parts).filter((p): p is PartId => p !== undefined)))];
  return ids.map((id) => ({ id, name: PARTS[id].name, rank: line.ranks[id] ?? 0, cap: RANK_CAP,
    upkeep: partUpkeep(id, line.ranks), base: PARTS[id].upkeep }));
}
