// The one curve: pure derived stats, food slots, reach and letters. No population or geometry is changed here.
import { CLADES } from '../data/clades';
import { PARTS } from '../data/parts';
import { ACCENT } from '../data/palette';
import { BASE_UPKEEP, FOODS, LETTER_THRESHOLDS, MASS_BY_SIZE, PART_EFFECT, SEA, TERM_THRESHOLDS, YIELDS } from '../data/sea';
import type { Habitat } from './habitats';
import type { Build, Fitness, Food, Letter, PartId, Ranks, Slot, Stats, World } from './records';

const partsOf = (b: Build): PartId[] => Object.values(b.parts).filter((p): p is PartId => p !== undefined);
const sizeOf = (b: Build) => Math.max(1, Math.min(MASS_BY_SIZE.length - 1, Math.round(b.genes.size)));
export const bodyMass = (b: Build): number => MASS_BY_SIZE[sizeOf(b)];
export const ceiling = (h: Habitat, food: Food) => YIELDS[food][h.kind.depth][h.kind.substrate] * h.area;

export function stats(build: Build, ranks: Ranks): Stats {
  const ids = partsOf(build), has = (p: PartId) => ids.includes(p), c = CLADES[build.clade];
  return {
    bite: Math.max(0, build.genes.gut) + (has('gut') ? PART_EFFECT.gutFood : 0),
    thrift: ids.reduce((n, p) => n + Math.min(PARTS[p].upkeep, Math.max(0, ranks[p] ?? 0)), 0),
    defence: ids.filter((p) => PARTS[p].defence).length,
    speed: c.speed + (has('leg') ? PART_EFFECT.legSpeed : 0) + (has('flap') ? PART_EFFECT.flapSpeed : 0)
      + (has('chaetae') ? PART_EFFECT.bristleSpeed : 0),
    senses: c.senses + (has('eye') ? PART_EFFECT.eyeSense : 0) + (has('compound') ? PART_EFFECT.compoundSense : 0),
    brood: 1 + (has('pouch') ? PART_EFFECT.pouchBrood : 0),
  };
}

export function slots(habitat: Habitat, _world: World): Slot[] {
  return FOODS.flatMap((food): Slot[] => {
    const capacity = ceiling(habitat, food);
    if (capacity < SEA.slotFloor) return [];
    const role = food === 'mats' ? 'grazer' : 'burrower';
    return [{ id: food, foods: [food], name: food === 'mats' ? 'Graze mats' : 'Dig detritus', role, accent: ACCENT[role], capacity }];
  });
}

/** The same reach feeds both the intake prediction and the sea's proportional food requests. */
export function reach(build: Build, ranks: Ranks, food: Food, habitat: Habitat): number {
  return foodReach(build, partsOf(build), stats(build, ranks), food, habitat);
}

function foodReach(build: Build, ids: PartId[], traits: Stats, food: Food, h: Habitat): number {
  const clade = CLADES[build.clade];
  const mouth = clade.mouth[food] ?? 0;
  const opened = ids.some((p) => PARTS[p].opens?.includes(food)) ? SEA.openedReach : 0;
  // Bristles add tunnel distance only in mud; speed is relative to the clade's own base movement.
  const speed = traits.speed - (h.kind.substrate !== 'mud' && ids.includes('chaetae') ? PART_EFFECT.bristleSpeed : 0);
  return Math.max(mouth, opened) * traits.bite * clade.substrate[h.kind.substrate] * speed / Math.max(1, clade.speed);
}

function letterFor(value: number, thresholds: readonly (readonly [Letter, number])[]): Letter {
  return thresholds.find(([, floor]) => value >= floor)![0];
}

export function fitness(build: Build, ranks: Ranks, slot: Slot, habitat: Habitat, _world: World): Fitness {
  const ids = partsOf(build), traits = stats(build, ranks);
  const intake = slot.foods.reduce((sum, food) => sum + foodReach(build, ids, traits, food, habitat)
    * Math.max(0, habitat.stocks[food]) / Math.max(1, habitat.area) / SEA.referenceDensity, 0);
  const upkeep = BASE_UPKEEP[sizeOf(build)] + ids.reduce((sum, p) => sum + PARTS[p].upkeep, 0) - traits.thrift;
  const survival = SEA.survival;
  const value = intake / upkeep * survival * traits.brood;
  const canGraze = foodReach(build, ids, traits, 'mats', habitat) > 0;
  const canDig = foodReach(build, ids, traits, 'detritus', habitat) > 0;
  const feeding = `${canGraze ? 'grazes mats' : "can't graze"}, ${canDig ? 'digs detritus' : "can't dig"}`;
  const costs = ids.filter((p) => PARTS[p].upkeep > Math.max(0, ranks[p] ?? 0)).map((p) => PARTS[p].name.toLowerCase());
  return {
    intake, upkeep, survival, value, letter: letterFor(value, LETTER_THRESHOLDS[slot.id]),
    reasons: [
      `Intake ${letterFor(intake, TERM_THRESHOLDS)}: ${feeding}.`,
      `Upkeep ${letterFor(1 / upkeep, TERM_THRESHOLDS)}: ${costs.length ? costs.join(', ') : 'no costly parts'}; ${build.parts.eyes ? 'eyes' : 'no eyes'}, ${build.parts.limbs ? 'limbs' : 'no legs'}.`,
      `Survival ${letterFor(survival, TERM_THRESHOLDS)}: nothing hunts it here.`,
    ],
  };
}
