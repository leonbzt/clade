// The living sea (slice 19), ported from the slice 17 toy. Ecological tuning is unchanged.
import { ROLE_IDS, WORLD, type Role } from './garden';
import type { HabitatId } from './habitats';
import { PLAN_IDS, PLANS, type PlanId } from './life';

/** Identity includes the body and diet; legacy residents keep their own IDs. */
export interface Species { id: string; name: string; role: Role; plan?: PlanId; colour: [number, number, number]; line: boolean }
export const lineId = (plan: PlanId, role: Role) => `line:${plan}:${role}`;
export const LINE_COLOUR: [number, number, number] = [255, 90, 220];
export const PLAYER_SPECIES: Species[] = PLAN_IDS.flatMap((plan) => ROLE_IDS.map((role) => ({
  id: lineId(plan, role), name: `Your ${PLANS[plan].name.toLowerCase()}s`, plan, role, colour: LINE_COLOUR, line: true,
})));
export const LEGACY_COLOUR: Record<string, [number, number, number]> = {
  wiwaxia: [120, 210, 90], olenoides: [235, 190, 70], odonto: [180, 140, 90], haplo: [90, 200, 200], burgesso: [226, 124, 48], selkirkia: [150, 130, 235],
  anomalocaris: [240, 80, 60], ottoia: [240, 130, 110], sidneyia: [200, 60, 90],
};

/** The ground's numbers: the mats it can hold, rot washing in, the oxygen it drifts to. */
export const GROUND: Record<HabitatId, { mats: number; rotIn: number; oxygen: number; shock: string; why: string }> = {
  sand: { mats: WORLD.sand.mats, rotIn: 1, oxygen: WORLD.sand.oxygen, shock: 'a storm', why: 'storm waves' },
  mud: { mats: WORLD.mud.mats, rotIn: 2.5, oxygen: WORLD.mud.oxygen, shock: 'a mudslide', why: 'the slope gave way' },
  rock: { mats: WORLD.rock.mats, rotIn: 2, oxygen: WORLD.rock.oxygen, shock: 'a vent surge', why: 'oxygen-poor water welled up' },
};

export const SEA = {
  shallow: 5, maxTiles: 16, richness: 0.3, // patches differ by up to this share in mats and rot
  history: 60, awayCap: 160, genMs: 180_000,

  // Grazers and burrowers: eat with a saturating intake, breed from what they ate.
  matsRegrow: 0.4, matsRefuge: 2, // logistic regrowth, plus the bit that survives under the sand
  eat: 0.34, eatHalf: 18, maxTake: 0.85, // food a well-fed animal eats per generation; half speed at this much food
  breed: 1.45, die: 0.09, // young per unit of food; deaths everyone suffers
  starve: 0.5, need: 0.5, // below `need` of a full meal, this share of the shortfall starves
  scorePower: 0.5, // a species' skill is (score/20)^this, so a better score eats faster and holds on with less food

  // Rot, oxygen.
  deathToRot: 0.3, rotDecay: 0.08, stir: 0.08, rotBreath: 0.12, oxygenPull: 0.2,
  chokeAt: 20, choke: 0.5, // below this oxygen, up to this share of a population suffocates each generation

  // Hunters.
  hunt: 0.8, huntHalf: 26, maxKill: 0.45, commonest: 3, // prey per hunter; the prey taken goes by pop^commonest
  huntBreed: 0.34, huntDie: 0.14, huntNeed: 0.45, huntStarve: 0.45,

  // Spreading.
  flow: 0.3, // at full hunger, this share of a population crosses borders

  // Shocks, one patch at a time.
  shockChance: 0.004, shockKill: 0.5, shockOxygen: 30,

  // Your line: tiers in eggs, as in the game. Off its own ground it counts as unproven.
  unproven: 0.5,

  // Telling: a crash is a fall to this share of the peak, from at least minPeak. A boom is this many times the low, up to minBoom.
  crashTo: 0.4, minPeak: 18, boomBy: 3, minBoom: 22, established: 6, mergeGens: 4,
  tellCrash: 25, tellBoom: 35, keepLines: 40, // what's big enough for a headline
  patchCrashTo: 0.5, patchMinPeak: 25,
};
