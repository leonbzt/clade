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
  return deriveStats(build, ranks, partsOf(build));
}

function deriveStats(build: Build, ranks: Ranks, ids: PartId[]): Stats {
  const c = CLADES[build.clade];
  let bite = Math.max(0, build.genes.gut), thrift = 0, defence = 0, speed = c.speed, senses = c.senses, brood = 1;
  for (const p of ids) {
    thrift += Math.min(PARTS[p].upkeep, Math.max(0, ranks[p] ?? 0));
    if (PARTS[p].defence) defence++;
    if (p === 'gut') bite += PART_EFFECT.gutFood;
    if (p === 'leg') speed += PART_EFFECT.legSpeed;
    if (p === 'flap') speed += PART_EFFECT.flapSpeed;
    if (p === 'chaetae') speed += PART_EFFECT.bristleSpeed;
    if (p === 'eye') senses += PART_EFFECT.eyeSense;
    if (p === 'compound') senses += PART_EFFECT.compoundSense;
    if (p === 'pouch') brood += PART_EFFECT.pouchBrood;
  }
  return { bite, thrift, defence, speed, senses, brood };
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
  const ids = partsOf(build);
  return foodReach(build, ids, deriveStats(build, ranks, ids), food, habitat);
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
  for (const [letter, floor] of thresholds) if (value >= floor) return letter;
  return thresholds[thresholds.length - 1][0];
}

export function fitness(build: Build, ranks: Ranks, slot: Slot, habitat: Habitat, _world: World): Fitness {
  const ids = partsOf(build), traits = deriveStats(build, ranks, ids);
  const reaches = { mats: foodReach(build, ids, traits, 'mats', habitat), detritus: foodReach(build, ids, traits, 'detritus', habitat) };
  let intake = 0, upkeep = BASE_UPKEEP[sizeOf(build)] - traits.thrift;
  const costs: string[] = [];
  for (const food of slot.foods) intake += reaches[food] * Math.max(0, habitat.stocks[food]) / Math.max(1, habitat.area) / SEA.referenceDensity;
  for (const p of ids) {
    upkeep += PARTS[p].upkeep;
    if (PARTS[p].upkeep > Math.max(0, ranks[p] ?? 0)) costs.push(PARTS[p].name.toLowerCase());
  }
  const survival = SEA.survival;
  const value = intake / upkeep * survival * traits.brood;
  return {
    intake, upkeep, survival, value, letter: letterFor(value, LETTER_THRESHOLDS[slot.id]),
    reasons: [
      `Intake ${letterFor(intake, TERM_THRESHOLDS)}: ${reaches.mats > 0 ? 'grazes mats' : "can't graze"}, ${reaches.detritus > 0 ? 'digs detritus' : "can't dig"}.`,
      `Upkeep ${letterFor(1 / upkeep, TERM_THRESHOLDS)}: ${costs.length ? costs.join(', ') : 'no costly parts'}; ${build.parts.eyes ? 'eyes' : 'no eyes'}, ${build.parts.limbs ? 'limbs' : 'no legs'}.`,
      `Survival ${letterFor(survival, TERM_THRESHOLDS)}: nothing hunts it here.`,
    ],
  };
}
