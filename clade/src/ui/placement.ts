// Dev placement opens a named build and its ancestors, then founds exactly twenty heads. No eggs until N2.
import { DEV_LINEAGES, DEV_SPECIES } from '../data/builds';
import { bodyMass } from '../sim/fitness';
import type { Species, World } from '../sim/records';

export function place(world: World, habitat: number, picked: Species): boolean {
  const hab = world.habitats.find((h) => h.id === habitat);
  if (!hab || (hab.pops[picked.id] ?? 0) > 0) return false;
  function open(species: Species) {
    if (world.species.some((s) => s.id === species.id)) return;
    const parent = DEV_SPECIES.find((s) => s.id === species.parent);
    if (parent) open(parent);
    if (species.lineage && !world.lineages.some((l) => l.id === species.lineage)) {
      const line = DEV_LINEAGES.find((l) => l.id === species.lineage);
      if (line) world.lineages.push(structuredClone(line));
    }
    world.species.push({ ...structuredClone(species), born: world.generation });
  }
  open(picked);
  hab.pops[picked.id] = 20 * bodyMass(picked.build);
  return true;
}
