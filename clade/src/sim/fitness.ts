// The one curve: pure derived stats, food slots, reach and letters. No population or geometry is changed here.
import { CLADES } from '../data/clades';
import { PARTS } from '../data/parts';
import { ACCENT } from '../data/palette';
import { BASE_UPKEEP, FOODS, LETTER_THRESHOLDS, PART_EFFECT, SEA, TERM_THRESHOLDS, YIELDS } from '../data/sea';
import { biteOf, huntsWith, partsOf, sizeOf } from './build';
import type { Habitat } from './habitats';
import { kitOf, preyIn, takeRates, threat, type Kit } from './hunt';
import type { Build, Fitness, Food, Letter, PartId, Ranks, Slot, Stats, World } from './records';

export { bodyMass } from './build';
export const partUpkeep = (part: PartId, ranks: Ranks) => Math.max(0, PARTS[part].upkeep - Math.max(0, ranks[part] ?? 0));
export const ceiling = (h: Habitat, food: Food) => YIELDS[food][h.kind.depth][h.kind.substrate] * h.area;
/** Food per tile against the reference density: the one food term of intake, read by `fitness` and the sea's eating. */
export const density = (h: Habitat, food: Food) => Math.max(0, h.stocks[food]) / Math.max(1, h.area) / SEA.referenceDensity;
/** The same density with the stock at its ceiling: what the letter ranks, whoever grazes there now. */
const fullDensity = (h: Habitat, food: Food) => YIELDS[food][h.kind.depth][h.kind.substrate] / SEA.referenceDensity;

export function stats(build: Build, ranks: Ranks): Stats {
  return deriveStats(build, ranks, partsOf(build));
}

/** A build read once: its parts and derived stats. The sea prepares one per species per generation (law 6). */
export interface Body { build: Build; ids: PartId[]; traits: Stats; hunts: boolean; kit: Kit; upkeep: number; opens: Food[] }
export function bodyOf(build: Build, ranks: Ranks): Body {
  const ids = partsOf(build), kit = kitOf(build, ids), traits = deriveStats(build, ranks, ids);
  let upkeep = BASE_UPKEEP[sizeOf(build)] - traits.thrift;
  for (const p of ids) upkeep += PARTS[p].upkeep;
  return { build, ids, traits, hunts: kit.hunts, kit, upkeep, opens: ids.flatMap((p) => PARTS[p].opens ?? []) };
}

function deriveStats(build: Build, ranks: Ranks, ids: PartId[]): Stats {
  const c = CLADES[build.clade];
  let bite = biteOf(build, ids), thrift = 0, defence = 0, speed = c.speed, senses = c.senses, brood = 1;
  for (const p of ids) {
    thrift += PARTS[p].upkeep - partUpkeep(p, ranks);
    if (PARTS[p].defence) defence++;
    if (p === 'leg') speed += PART_EFFECT.legSpeed;
    if (p === 'flap') speed += PART_EFFECT.flapSpeed;
    if (p === 'chaetae') speed += PART_EFFECT.bristleSpeed;
    if (p === 'eye') senses += PART_EFFECT.eyeSense;
    if (p === 'compound') senses += PART_EFFECT.compoundSense;
    if (p === 'pouch') brood += PART_EFFECT.pouchBrood;
  }
  return { bite, thrift, defence, speed, senses, brood };
}

/** Food slots read ceilings; the hunt slot reads today's prey, whose grams are its capacity (N4 A). */
export function slots(habitat: Habitat, world: World): Slot[] {
  const out = FOODS.flatMap((food): Slot[] => {
    const capacity = ceiling(habitat, food);
    if (capacity < SEA.slotFloor) return [];
    const role = food === 'mats' ? 'grazer' : 'burrower';
    return [{ id: food, foods: [food], name: food === 'mats' ? 'Graze mats' : 'Dig detritus', role, accent: ACCENT[role], capacity }];
  });
  const prey = preyIn(habitat, world), capacity = prey.reduce((sum, p) => sum + p.grams, 0);
  if (capacity >= SEA.slotFloor) out.push({ id: 'prey', foods: [], name: 'Hunt prey', role: 'hunter', accent: ACCENT.hunter, capacity, prey });
  return out;
}

/** A slot with something in it to eat today. */
export const stocked = (slot: Slot, h: Habitat) => slot.prey ? slot.capacity > 0 : slot.foods.some((food) => h.stocks[food] > 0);

/** The same reach feeds both the intake prediction and the sea's proportional food requests. */
type FeedingGround = { kind: Pick<Habitat['kind'], 'substrate'> };

export function reach(build: Build, ranks: Ranks, food: Food, habitat: FeedingGround, body = bodyOf(build, ranks)): number {
  return foodReach(body, food, habitat);
}

function foodReach({ build, ids, traits, hunts, opens }: Body, food: Food, h: FeedingGround): number {
  if (hunts) return 0; // a hunting tool commits the build to prey
  const clade = CLADES[build.clade];
  const mouth = clade.mouth[food] ?? 0;
  const opened = opens.includes(food) ? SEA.openedReach : 0;
  // Bristles add tunnel distance only in mud; speed is relative to the clade's own base movement.
  const speed = traits.speed - (h.kind.substrate !== 'mud' && ids.includes('chaetae') ? PART_EFFECT.bristleSpeed : 0);
  return Math.max(mouth, opened) * traits.bite * clade.substrate[h.kind.substrate] * speed / Math.max(1, clade.speed);
}

function letterFor(value: number, thresholds: readonly (readonly [Letter, number])[]): Letter {
  for (const [letter, floor] of thresholds) if (value >= floor) return letter;
  return thresholds[thresholds.length - 1][0];
}

/** The curve's numbers and letter without the reasons: the sea's hot loop. `fitness` adds the three sentences.
 *  `value` reads today's food (the growth rate the sea uses); the letter ranks the build at full food. Prey has no
 *  ceiling, so a hunt slot's full food is today's prey. `survival` comes from `threat` (the hunters here). */
export function score(build: Build, ranks: Ranks, slot: Slot, habitat: Habitat, survival = 1, body = bodyOf(build, ranks)): Omit<Fitness, 'reasons'> {
  const { traits, upkeep } = body;
  let intake = 0, full = 0;
  for (const food of slot.foods) {
    const r = foodReach(body, food, habitat);
    intake += r * density(habitat, food);
    full += r * fullDensity(habitat, food);
  }
  if (slot.prey) intake = full = takeRates(body.kit, slot.prey, habitat.area).reduce((sum, rate) => sum + rate, 0);
  const per = survival * traits.brood / upkeep;
  return { intake, full, upkeep, survival, value: intake * per, letter: letterFor(full * per, LETTER_THRESHOLDS[slot.id]) };
}

/** The sea's hot loop: `score`'s value for a prepared body, with no letter, reasons or allocation. */
export function valueIn(body: Body, slot: Slot, h: Habitat, survival: number): number {
  let intake = 0;
  if (slot.prey) { if (body.hunts) for (const rate of takeRates(body.kit, slot.prey, h.area)) intake += rate; }
  else if (!body.hunts) for (const food of slot.foods) intake += foodReach(body, food, h) * density(h, food);
  return intake * survival * body.traits.brood / body.upkeep;
}

export function fitness(build: Build, ranks: Ranks, slot: Slot, habitat: Habitat, world: World): Fitness {
  const danger = threat(build, habitat, world);
  const fit = score(build, ranks, slot, habitat, danger.survival);
  const hunter = huntsWith(build), grazes = reach(build, ranks, 'mats', habitat) > 0, digs = reach(build, ranks, 'detritus', habitat) > 0;
  const prey = slot.prey ? `${slot.prey.length} prey kind${slot.prey.length === 1 ? '' : 's'} here, ${Math.round(slot.capacity)} g` : '';
  const foodLeft = slot.prey ? prey : slot.foods.map((food) => {
    const max = ceiling(habitat, food);
    return `${slot.foods.length > 1 ? `${food} ` : ''}food at ${Math.round(max > 0 ? 100 * habitat.stocks[food] / max : 0)}%`;
  }).join(', ');
  const costs = partsOf(build).filter((p) => partUpkeep(p, ranks) > 0).map((p) => PARTS[p].name.toLowerCase());
  return {
    ...fit,
    reasons: [
      `Intake ${letterFor(fit.full, TERM_THRESHOLDS)}: ${hunter ? 'hunts prey, eats no mats or detritus' : `${grazes ? 'grazes mats' : "can't graze"}, ${digs ? 'digs detritus' : "can't dig"}`}; ${foodLeft}.`,
      `Upkeep ${letterFor(1 / fit.upkeep, TERM_THRESHOLDS)}: ${costs.length ? costs.join(', ') : 'no costly parts'}; ${build.parts.eyes ? 'eyes' : 'no eyes'}, ${build.parts.limbs ? 'limbs' : 'no legs'}.`,
      `Survival ${letterFor(fit.survival, TERM_THRESHOLDS)}: ${danger.by ? `${danger.by.name} hunts it here` : 'nothing hunts it here'}.`,
    ],
  };
}
