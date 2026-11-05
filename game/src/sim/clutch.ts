// Open your clutch (slice 12): after a Life, a few eggs hatch as cards, each a form carrying one part at a rarity. You keep
// one; your line in that niche carries its part into every later Life there. Deterministic from the seed.
import { HABITATS, HAB_ORDER, type HabitatId } from '../data/habitats';
import { PARTS, PART_IDS, type PartId, type PlanId } from '../data/life';
import { seeded } from './rng';

export type Rarity = 'common' | 'rare' | 'epic';
export interface Card { part: PartId; rarity: Rarity; passed?: boolean }
export const CLUTCH = { base: 2, perEggs: 8, max: 5, rare: 0.2, epic: 0.05, rarePerTier: 0.04, epicPerTier: 0.02 };
const TIER_STEPS = ['F', 'D', 'C', 'B', 'A', 'S'];

export const clutchSize = (eggs: number) => (eggs <= 0 ? 0 : Math.min(CLUTCH.max, CLUTCH.base + Math.floor(eggs / CLUTCH.perEggs)));

/** The odds of a rare and an epic card, by the tier the Life reached. */
export function odds(tier: string) {
  const k = Math.max(0, TIER_STEPS.indexOf(tier));
  return { rare: CLUTCH.rare + CLUTCH.rarePerTier * k, epic: CLUTCH.epic + CLUTCH.epicPerTier * k };
}

/** `passed`: a rare part you laid after getting. It's a sure card on top of the roll, the first in the clutch. */
export function rollClutch(seed: number, plan: PlanId, hab: HabitatId, eggs: number, tier: string, passed: PartId | null = null): Card[] {
  const rng = seeded(seed), o = odds(tier), out: Card[] = [];
  const common = PART_IDS.filter((p) => !PARTS[p].rare && PARTS[p].plans.includes(plan));
  const rare = HABITATS[hab].rares[plan].filter((p) => PARTS[p].plans.includes(plan));
  const epic = [...new Set(HAB_ORDER.filter((h) => h !== hab).flatMap((h) => HABITATS[h].rares[plan]))].filter((p) => !rare.includes(p));
  const pickFrom = (xs: PartId[]) => xs[Math.floor(rng() * xs.length)];
  for (let k = 0; k < clutchSize(eggs); k++) {
    const r = rng();
    if (r < o.epic && epic.length) out.push({ part: pickFrom(epic), rarity: 'epic' });
    else if (r < o.epic + o.rare && rare.length) out.push({ part: pickFrom(rare), rarity: 'rare' });
    else out.push({ part: pickFrom(common), rarity: 'common' });
  }
  return passed && eggs > 0 ? [{ part: passed, rarity: 'rare', passed: true }, ...out.filter((c) => c.part !== passed)] : out;
}
