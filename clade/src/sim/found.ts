// Founder biomass comes from an egg count. Fitness supplies the purpose and the sea supplies the growth test.
import { HEADS_PER_EGG } from '../data/economy';
import { SEA } from '../data/sea';
import { bodyMass, fitness, slots } from './fitness';
import type { Habitat } from './habitats';
import type { Fitness, Ranks, Slot, Species, World } from './records';
import { bestSlot, grows, ranksOf } from './sea';

/** Adds founder biomass to the target habitat for a species registered in the world. */
export function found(world: World, habitat: Habitat, species: Species, eggs: number): number {
  if (!Number.isFinite(eggs) || eggs <= 0) return 0;
  const target = world.habitats.find((candidate) => candidate.id === habitat.id);
  const resident = world.species.find((candidate) => candidate.id === species.id);
  if (!target || !resident) return 0;
  const grams = eggs * HEADS_PER_EGG * bodyMass(resident.build);
  target.pops[resident.id] = (target.pops[resident.id] ?? 0) + grams;
  return grams;
}

interface FitSlot { slot: Slot; fit: Fitness }

function bestFullSlot(world: World, habitat: Habitat, species: Species, ranks: Ranks): FitSlot | undefined {
  let best: FitSlot | undefined;
  for (const slot of slots(habitat, world)) {
    const fit = fitness(species.build, ranks, slot, habitat, world);
    // Both foods use the same letter ladder. A build's other fitness terms are constant across slots.
    if (!best || fit.full > best.fit.full) best = { slot, fit };
  }
  return best;
}

/** The purpose offered for this species, including the slot and tier to show at launch. */
export function colonise(world: World, habitat: Habitat, species: Species) {
  if ((habitat.pops[species.id] ?? 0) > 0) return null;
  const best = bestFullSlot(world, habitat, species, ranksOf(world, species.lineage));
  if (!best || best.fit.letter === 'F') return null;
  return { ...best, text: `Colonise ${habitat.name} · ${best.slot.name.toLowerCase()} · tier ${best.fit.letter}` };
}

export function coloniseJudgement(world: World, habitat: Habitat, species: Species, eggs: number) {
  const ranks = ranksOf(world, species.lineage);
  const choice = bestSlot(species.build, ranks, habitat, world);
  const best = choice
    ? { slot: choice.slot, fit: fitness(species.build, ranks, choice.slot, habitat, world) }
    : bestFullSlot(world, habitat, species, ranks);
  const heads = eggs * HEADS_PER_EGG;
  const outcome = heads < SEA.extinctionHeads ? 'too-few' : grows(choice?.fit.value ?? 0) ? 'grows' : 'shrinks';
  const verdict = outcome === 'too-few' ? 'too few to hold' : outcome === 'grows' ? 'they grow here' : 'they shrink here';
  const name = species.name.toLowerCase();
  const text = `${heads} ${name}${heads === 1 ? '' : 's'} founded · tier ${best?.fit.letter ?? 'F'} · ${verdict}`;
  return { heads, outcome, ...best, text };
}
