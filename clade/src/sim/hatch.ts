// Settle a Life's chosen form and XP; the sea receives only the founder egg count.
import { CLADES } from '../data/clades';
import { PARTS, PLACES } from '../data/parts';
import { heirBuild, type Card } from './clutch';
import { found } from './found';
import type { Habitat } from './habitats';
import { addXp, xpFor } from './line';
import type { Build, Letter, Species, World } from './records';

const sameBuild = (a: Build, b: Build) => a.clade === b.clade
  && a.genes.size === b.genes.size && a.genes.gut === b.genes.gut
  && PLACES.every((place) => a.parts[place] === b.parts[place]);

/** Parent and line must be registered. The UI owns the once-only settlement guard. */
export function hatch(world: World, habitat: Habitat, parent: Species, card: Card | null, eggs: number, letter: Letter): Species | null {
  const resident = world.species.find((s) => s.id === parent.id);
  const line = world.lineages.find((l) => l.id === resident?.lineage);
  if (!resident || !line || !world.habitats.some((h) => h.id === habitat.id) || !Number.isFinite(eggs) || eggs < 0) return null;

  let heir = resident;
  if (card) {
    const build = heirBuild(resident.build, card);
    const existing = world.species.find((s) => s.lineage === line.id && sameBuild(s.build, build));
    if (existing) heir = existing;
    else {
      const base = `${PARTS[card.part].name} ${CLADES[build.clade].name.toLowerCase()}`;
      let name = base, suffix = 2;
      while (world.species.some((s) => s.name === name)) name = `${base} ${suffix++}`;
      let serial = 1;
      while (world.species.some((s) => s.id === `${resident.id}-child-${serial}`)) serial++;
      heir = { id: `${resident.id}-child-${serial}`, lineage: line.id, parent: resident.id,
        build, name, born: world.generation };
      world.species.push(heir);
    }
  }
  found(world, habitat, heir, eggs);
  addXp(line, xpFor(eggs, letter));
  return heir;
}
