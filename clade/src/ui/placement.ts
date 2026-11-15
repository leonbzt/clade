// Dev species registration is shared by placement and Colonise. Place still founds twenty heads and claims their cell.
import { DEV_LINEAGES, DEV_SPECIES } from '../data/builds';
import { bodyMass } from '../sim/fitness';
import { claim } from '../sim/found';
import type { Species, World } from '../sim/records';

export function place(world: World, habitat: number, picked: Species): boolean {
  const hab = world.habitats.find((h) => h.id === habitat);
  if (!hab || (hab.pops[picked.id] ?? 0) > 0) return false;
  registerSpecies(world, picked);
  hab.pops[picked.id] = 20 * bodyMass(picked.build);
  claim(world, hab, world.species.find((s) => s.id === picked.id)!); // a dev placement claims its cell, like eggs do
  return true;
}

export function registerSpecies(world: World, species: Species) {
  if (world.species.some((s) => s.id === species.id)) return;
  const parent = DEV_SPECIES.find((s) => s.id === species.parent);
  if (parent) registerSpecies(world, parent);
  if (species.lineage && !world.lineages.some((l) => l.id === species.lineage)) {
    const line = DEV_LINEAGES.find((l) => l.id === species.lineage);
    if (line) world.lineages.push(structuredClone(line));
  }
  world.species.push({ ...structuredClone(species), born: world.generation });
}
