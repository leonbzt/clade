// The Life/sea lifecycle. Completion is saved before playback; settlement consumes only the current pending result.
import { MODEL } from '../data/garden';
import { PLAN_IDS, type PartId, type PlanId, type VerbId } from '../data/life';
import { lineId } from '../data/sea';
import { rollClutch } from './clutch';
import { boardForPatch, resultOf } from './door';
import { tierName } from './garden';
import { newLife, startParts, type Life } from './life';
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

export function startSeaLife(s: SeaSave, seed: number, patch: number, plan: PlanId, verbs: VerbId[], form?: PartId): Life {
  if (!canLaunch(s, patch, plan)) throw new Error('This body cannot launch in this patch');
  return newLife(seed, plan, boardForPatch(s.sea, patch), startParts(plan, verbs, form));
}

export const formKey = (patch: number, species: string) => `${patch}:${species}`;
/** Legacy forms remain available until a patch/body/role-specific form has been kept. */
export function formFor(s: SeaSave, patch: number, plan: PlanId, role: SeaPending['role']): PartId | undefined {
  return s.forms[formKey(patch, lineId(plan, role))] ?? s.forms[`${s.sea.patches[patch].ground}:${role}`];
}

export function completeLife(s: SeaSave, life: Life, clutchSeed: number): SeaPending {
  if (s.pending) return s.pending;
  if (life.phase !== 'over' || life.hab.patch === undefined || !s.sea.patches[life.hab.patch]) throw new Error('Life has no completed patch result');
  const r = resultOf(life), tier = tierName(r.hab, r.eggs);
  const p: SeaPending = { ...r, patch: life.hab.patch, species: lineId(r.plan, r.role), tier,
    parts: [...(life.eggParts ?? life.order.flatMap((k) => life.slots[k].part ? [life.slots[k].part!] : []))], diet: { ...life.ate },
    cards: rollClutch(clutchSeed, r.plan, r.hab, r.eggs, tier, life.rarePassed ? life.rareGot : null) };
  s.pending = p;
  if (p.eggs > 0) s.continuation = { patch: p.patch, species: p.species, plan: p.plan, role: p.role, eggs: p.eggs };
  return p;
}

/** A stale/double click cannot release again, change forms, or advance the sea twice. */
export function settlePending(s: SeaSave, p: SeaPending, card = -1): boolean {
  if (s.pending !== p || !Number.isInteger(card) || card < -1 || card >= p.cards.length) return false;
  if (card >= 0) s.forms[formKey(p.patch, p.species)] = p.cards[card].part;
  if (p.eggs > 0) {
    release(s.sea, p.patch, p.plan, p.role, p.eggs, p.parts, p.diet);
    s.continuation = { patch: p.patch, species: p.species, plan: p.plan, role: p.role, eggs: p.eggs };
  }
  for (let k = 0; k < MODEL.afterLife; k++) tell(s.sea, s.news, step(s.sea));
  const key = `${p.hab}:${p.role}`;
  if (!s.best[key] || 'SABCDF'.indexOf(p.tier) < 'SABCDF'.indexOf(s.best[key])) s.best[key] = p.tier;
  // Keep old unlock progress, though all existing bodies are now available after founding.
  if (p.plan === 'arthropod' && ['A', 'S'].includes(p.tier)) s.unlocks.trilobite = true;
  s.lives++;
  delete s.pending;
  return true;
}
