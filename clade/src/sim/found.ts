// Founder biomass comes from an egg count. Fitness supplies the purpose and the sea supplies the growth test.
// Founding is also how a cell becomes yours: `claim`.
import { ADOPT_EGGS, HEADS_PER_EGG } from '../data/economy';
import { YOUR_LINE } from '../data/lines';
import { SEA } from '../data/sea';
import { huntsWith, isYours } from './build';
import { bodyMass, cellKey, fitness, slots } from './fitness';
import type { Habitat } from './habitats';
import { preyFor } from './hunt';
import type { Fitness, Letter, Ranks, Slot, SlotId, Species, World } from './records';
import { bestSlot, grows, ranksOf } from './sea';

/** Adds founder biomass to the target habitat for a species registered in the world. */
export function found(world: World, habitat: Habitat, species: Species, eggs: number): number {
  if (!Number.isFinite(eggs) || eggs <= 0) return 0;
  const target = world.habitats.find((candidate) => candidate.id === habitat.id);
  const resident = world.species.find((candidate) => candidate.id === species.id);
  if (!target || !resident) return 0;
  const grams = eggs * HEADS_PER_EGG * bodyMass(resident.build);
  target.pops[resident.id] = (target.pops[resident.id] ?? 0) + grams;
  claim(world, target, resident);
  return grams;
}

/** Claims the cell a species of yours takes here (N4 fix D): its best slot, if at least two heads live here and,
 *  unless it is `settled` (an adopted cousin already holds its cell), it grows there on today's food. */
export function claim(world: World, habitat: Habitat, species: Species, settled = false): boolean {
  if (!isYours(species) || !((habitat.pops[species.id] ?? 0) >= SEA.extinctionHeads * bodyMass(species.build))) return false;
  const choice = bestSlot(species.build, ranksOf(world, species.lineage), habitat, world);
  if (!choice || !(settled || grows(choice.fit.value))) return false;
  const key = cellKey(habitat.id, choice.slot.id);
  if (!world.claimed.includes(key)) world.claimed.push(key);
  return true;
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

/** A hunter with nothing to eat here: no Life as it in this habitat (N4 fix B). */
export const noPrey = (world: World, habitat: Habitat, species: Species) =>
  huntsWith(species.build) && !preyFor(species.build, habitat, world).length;

export interface Holder { species: Species; letter: Letter }
/** The heaviest species of another line whose best slot here is this one: the one a newcomer must outgrow. */
export function holderOf(world: World, habitat: Habitat, slot: SlotId, species: Species): Holder | null {
  let holder: Holder | null = null, most = 0;
  for (const s of world.species) {
    const grams = habitat.pops[s.id] ?? 0;
    if (grams <= most || s.id === species.id || (species.lineage !== null && s.lineage === species.lineage)) continue;
    const choice = bestSlot(s.build, ranksOf(world, s.lineage), habitat, world);
    if (choice?.slot.id === slot) { holder = { species: s, letter: choice.fit.letter }; most = grams; }
  }
  return holder;
}

/** The purpose offered for this species, including the slot and tier to show at launch. A held slot is a Challenge:
 *  shares by fitness settle it in the sea, with no new rule (N4 E). */
export function colonise(world: World, habitat: Habitat, species: Species) {
  if ((habitat.pops[species.id] ?? 0) > 0 || noPrey(world, habitat, species)) return null;
  const best = bestFullSlot(world, habitat, species, ranksOf(world, species.lineage));
  if (!best || best.fit.letter === 'F') return null;
  const holder = holderOf(world, habitat, best.slot.id, species);
  const text = holder
    ? `Challenge ${holder.species.name} (${holder.letter}) in ${habitat.name} · your ${species.name} ${best.fit.letter}`
    : `Colonise ${habitat.name} · ${best.slot.name.toLowerCase()} · tier ${best.fit.letter}`;
  return { ...best, holder, text };
}

/** Adopt (N4 E): play a Life as a wild species where it lives. Whether its clade has a Life is the launcher's check. */
export function adoptPurpose(world: World, habitat: Habitat, species: Species) {
  if (species.lineage !== null || (habitat.pops[species.id] ?? 0) <= 0 || noPrey(world, habitat, species)) return null;
  const best = bestFullSlot(world, habitat, species, {});
  if (!best) return null;
  return { ...best, holder: null, text: `Adopt ${species.name} in ${habitat.name} · lay ${ADOPT_EGGS} eggs and it joins your line` };
}
/** With at least `ADOPT_EGGS` eggs the wild species joins your line; its parent is kept. */
export function adopt(world: World, species: Species, eggs: number): boolean {
  const s = world.species.find((x) => x.id === species.id);
  if (!s || s.lineage !== null || !(eggs >= ADOPT_EGGS) || !world.lineages.some((l) => l.id === YOUR_LINE)) return false;
  s.lineage = YOUR_LINE;
  for (const h of world.habitats) claim(world, h, s, true); // its cells are yours now
  return true;
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
