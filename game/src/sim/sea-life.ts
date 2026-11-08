// The Life/sea lifecycle. Completion is saved before playback; settlement consumes only the current pending result.
// A Life starts from a checked design (20A starter check) and at most the one carried trait part.
import { MODEL } from '../data/garden';
import type { Rows } from '../data/body';
import { PLAN_IDS, type PlanId } from '../data/life';
import { lineId } from '../data/sea';
import { startBuild, type Placement } from './body';
import { nextTrait, traitFits } from './body-hurt';
import { rollClutch } from './clutch';
import { boardForPatch, resultOf } from './door';
import { tierName } from './garden';
import { newLife, type Life } from './life';
import { release, step } from './sea';
import { tell } from './sea-news';
import type { SeaPending, SeaSave } from './sea-save';

export function launchPatches(s: SeaSave): number[] {
  if (!s.continuation) return s.sea.patches.map((p) => p.id);
  const p = s.sea.patches[s.continuation.patch];
  return [p.id, ...p.nb];
}
export const launchBodies = (s: SeaSave): PlanId[] => s.continuation ? [...PLAN_IDS] : ['worm'];
export const canLaunch = (s: SeaSave, patch: number, plan: PlanId) =>
  !s.pending && launchBodies(s).includes(plan) && launchPatches(s).includes(patch);
/** The trait part this body may carry, if it fits. A body change keeps the trait stored either way. */
export const carriable = (s: SeaSave, plan: PlanId) => (traitFits(s.trait ?? null, plan) ? s.trait!.part : undefined);

/** A Life from a design and the carried trait (if any). A design that fails the starter check can't launch. */
export function startSeaLife(s: SeaSave, seed: number, patch: number, plan: PlanId, design: Rows, carried?: Placement): Life {
  if (!canLaunch(s, patch, plan)) throw new Error('This body cannot launch in this patch');
  if (carried && carried.part !== carriable(s, plan)) throw new Error('Only the stored trait can be carried');
  const { build, problems } = startBuild(plan, design, carried);
  if (problems.length) throw new Error(`Illegal starting build: ${problems.join('; ')}`);
  return newLife(seed, plan, boardForPatch(s.sea, patch), build);
}

export function completeLife(s: SeaSave, life: Life, clutchSeed: number): SeaPending {
  if (s.pending) return s.pending;
  if (life.phase !== 'over' || life.hab.patch === undefined || !s.sea.patches[life.hab.patch]) throw new Error('Life has no completed patch result');
  const r = resultOf(life), tier = tierName(r.hab, r.eggs);
  const p: SeaPending = { ...r, patch: life.hab.patch, species: lineId(r.plan, r.role), tier,
    ...(life.laid && r.eggs > 0 ? { build: structuredClone(life.laid) } : {}), diet: { ...life.ate },
    cards: rollClutch(clutchSeed, r.plan, r.hab, r.eggs, tier, life.rarePassed ? life.rareGot : null) };
  s.pending = p;
  if (p.eggs > 0) s.continuation = { patch: p.patch, species: p.species, plan: p.plan, role: p.role, eggs: p.eggs };
  return p;
}

/** A stale/double click cannot release again, change the trait, or advance the sea twice. Zero eggs keep the trait;
 * a positive result records the chosen card, or none. */
export function settlePending(s: SeaSave, p: SeaPending, card = -1): boolean {
  if (s.pending !== p || !Number.isInteger(card) || card < -1 || card >= p.cards.length) return false;
  const chosen = card >= 0 ? { part: p.cards[card].part, patch: p.patch, line: p.species, life: s.lives + 1 } : null;
  const trait = nextTrait(s.trait ?? null, p.eggs, chosen);
  if (trait) s.trait = trait; else delete s.trait;
  if (p.eggs > 0) {
    release(s.sea, p.patch, p.plan, p.role, p.eggs, p.build, p.diet);
    s.continuation = { patch: p.patch, species: p.species, plan: p.plan, role: p.role, eggs: p.eggs };
  }
  for (let k = 0; k < MODEL.afterLife; k++) tell(s.sea, s.news, step(s.sea));
  const key = `${p.hab}:${p.role}`;
  if (!s.best[key] || 'SABCDF'.indexOf(p.tier) < 'SABCDF'.indexOf(s.best[key])) s.best[key] = p.tier;
  s.lives++;
  delete s.pending;
  return true;
}
