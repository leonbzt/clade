// Read-only views of fitness. A resident eats in its best stocked slot, just as in the sea step.
import { fitness, slots, stocked } from '../sim/fitness';
import type { Habitat } from '../sim/habitats';
import type { Build, Ranks, World } from '../sim/records';

export const ranksOf = (world: World, lineage: string | null): Ranks =>
  world.lineages.find((line) => line.id === lineage)?.ranks ?? {};

export function predictions(build: Build, ranks: Ranks, hab: Habitat, world: World) {
  return slots(hab, world).map((slot) => ({ slot, fit: fitness(build, ranks, slot, hab, world) }));
}

export function bestFit(build: Build, ranks: Ranks, hab: Habitat, world: World) {
  return predictions(build, ranks, hab, world).filter(({ slot }) => stocked(slot, hab))
    .reduce<ReturnType<typeof predictions>[number] | undefined>((best, p) => !best || p.fit.value > best.fit.value ? p : best, undefined);
}

export function heldSlots(hab: Habitat, world: World) {
  const residents = world.species.filter((s) => (hab.pops[s.id] ?? 0) > 0).map((species) => {
    const ranks = ranksOf(world, species.lineage);
    return { species, ranks, best: bestFit(species.build, ranks, hab, world) };
  });
  return slots(hab, world).map((slot) => ({ slot, holders: residents.filter((s) => s.best?.slot.id === slot.id) }));
}
