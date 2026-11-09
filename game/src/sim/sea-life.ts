// The Life/sea lifecycle. Completion is saved before playback; settlement consumes only the current pending result.
// A Life starts from a checked design of its line's pool, with the line's ranks (21A); settling moves the line on.
import { MODEL } from '../data/garden';
import type { Rows } from '../data/body';
import { PLAN_IDS, type PlanId } from '../data/life';
import { SEA, lineId } from '../data/sea';
import { startBuild } from './body';
import { rollClutch } from './clutch';
import { boardForPatch, resultOf } from './door';
import { tierName } from './garden';
import { settleLine, type Gain } from './lineage';
import { newLife, type Life } from './life';
import { release, step } from './sea';
import { tell, type Headline } from './sea-news';
import type { SeaPending, SeaSave } from './sea-save';

export interface SpreadFrame { gen: number; pop: number[]; news: Headline[] }
/** A release to replay: frame 0 is the eggs settling, then one frame per generation the sea passes after a Life. */
export interface Spread { species: string; patch: number; eggs: number; before: number[]; frames: SpreadFrame[] }
/** `spread` is null when no eggs were released: the sea still moves on, but there is nothing of yours to watch. */
export type Settlement = Gain & { spread: Spread | null };

export function launchPatches(s: SeaSave): number[] {
  if (!s.continuation) return s.sea.patches.map((p) => p.id);
  const p = s.sea.patches[s.continuation.patch];
  return [p.id, ...p.nb];
}
/** The open lineages: the worm, and every lineage a recipe opened. The founding Life is a worm either way. */
export const launchBodies = (s: SeaSave): PlanId[] => (s.continuation ? PLAN_IDS.filter((p) => s.lines[p]) : ['worm']);
export const canLaunch = (s: SeaSave, patch: number, plan: PlanId) =>
  !s.pending && launchBodies(s).includes(plan) && launchPatches(s).includes(patch);

/** A Life from a design of the line's pool, with its ranks. A design that fails the starter check can't launch. */
export function startSeaLife(s: SeaSave, seed: number, patch: number, plan: PlanId, design: Rows): Life {
  if (!canLaunch(s, patch, plan)) throw new Error('This body cannot launch in this patch');
  const line = s.lines[plan]!, { build, problems } = startBuild(plan, design, line);
  if (problems.length) throw new Error(`Illegal starting build: ${problems.join('; ')}`);
  const l = newLife(seed, plan, boardForPatch(s.sea, patch), build);
  l.pool = [...line.parts];
  l.launch = structuredClone(build.rows);
  return l;
}

export function completeLife(s: SeaSave, life: Life, clutchSeed: number): SeaPending {
  if (s.pending) return s.pending;
  if (life.phase !== 'over' || life.hab.patch === undefined || !s.sea.patches[life.hab.patch]) throw new Error('Life has no completed patch result');
  const r = resultOf(life), tier = tierName(r.hab, r.eggs);
  const p: SeaPending = { ...r, patch: life.hab.patch, species: lineId(r.plan, r.role), tier,
    ...(life.laid && r.eggs > 0 ? { build: structuredClone(life.laid), ...(life.launch ? { launch: structuredClone(life.launch) } : {}) } : {}), diet: { ...life.ate },
    cards: rollClutch(clutchSeed, r.plan, r.hab, r.eggs, tier, life.rarePassed ? life.rareGot : null) };
  s.pending = p;
  if (p.eggs > 0) s.continuation = { patch: p.patch, species: p.species, plan: p.plan, role: p.role, eggs: p.eggs };
  return p;
}

/** Choose a release point without settling or changing the proven ground. */
export function placePending(s: SeaSave, p: SeaPending, patch: number): boolean {
  if (s.pending !== p || p.eggs <= 0 || !Number.isInteger(patch)
    || (patch !== p.patch && !s.sea.patches[p.patch].nb.includes(patch))) return false;
  p.place = patch;
  return true;
}

/** How strong the eggs start on a patch, 0–1: full on the Life's own ground, else what the line already holds there
 * or the unproven share, whichever is more (`release` keeps the higher fitness). */
export function releaseStrength(s: SeaSave, p: SeaPending, patch: number): number {
  const q = s.sea.patches[patch], k = s.sea.species.findIndex((sp) => sp.id === p.species);
  if (!q || p.eggs <= 0 || q.ground === p.hab) return 1;
  return Math.min(1, Math.max(q.fit[k] ?? 0, p.eggs * SEA.unproven) / p.eggs);
}

/** A stale/double click cannot release again, move the line twice, or advance the sea twice. The kept card (or none)
 * unlocks its part and becomes the new species' mutation. Returns what the line gained, or null. */
export function settlePending(s: SeaSave, p: SeaPending, card = -1): Settlement | null {
  if (s.pending !== p || !Number.isInteger(card) || card < -1 || card >= p.cards.length) return null;
  const gain = settleLine(s.lines, p.plan, p.eggs, p.tier, p.build, card >= 0 ? p.cards[card].part : null, s.lives + 1, p.launch);
  const k = s.sea.species.findIndex((sp) => sp.id === p.species), at = p.place ?? p.patch;
  const snapshot = () => s.sea.patches.map((q) => q.pop[k]);
  let spread: Spread | null = null;
  if (p.eggs > 0) {
    spread = { species: p.species, patch: at, eggs: p.eggs, before: snapshot(), frames: [] };
    release(s.sea, at, p.plan, p.role, p.eggs, p.build, p.diet, p.hab);
    spread.frames.push({ gen: s.sea.gen, pop: snapshot(), news: [] });
    s.continuation = { patch: at, species: p.species, plan: p.plan, role: p.role, eggs: p.eggs };
  }
  for (let n = 0; n < MODEL.afterLife; n++) {
    const events = step(s.sea);
    tell(s.sea, s.news, events);
    if (!spread) continue;
    const news: Headline[] = [];
    tell(s.sea, news, events);
    spread.frames.push({ gen: s.sea.gen, pop: snapshot(), news });
  }
  const key = `${p.hab}:${p.role}`;
  if (!s.best[key] || 'SABCDF'.indexOf(p.tier) < 'SABCDF'.indexOf(s.best[key])) s.best[key] = p.tier;
  s.lives++;
  delete s.pending;
  return { ...gain, spread };
}
