// A species' build stays intact through growth, tears and starvation. Only active places contribute.
import { CLADES } from '../data/clades';
import type { Substrate } from '../data/ground';
import { ENFORCE_EFFECT } from '../data/economy';
import { GUARDS, NODES, PLANS, RULE, STRUCK, type NodeId } from '../data/life';
import { MUTATION } from '../data/mutation';
import { PARTS, PLACES } from '../data/parts';
import type { TreeState } from '../data/tree';
import { partUpkeep, reach } from './fitness';
import type { Mutation } from './mutation';
import type { Build, DefenceKind, Food, Part, PartId, Place, Ranks, VerbId } from './records';

export type LifePlan = keyof typeof PLANS;
export type LifeBuild = Build & { clade: LifePlan };
export interface LifeBody {
  build: LifeBuild;
  ranks: Ranks;
  size: number;
  lost: Place[];
  enforced: Ranks;
  spentGuards: Ranks;
  mutation: Mutation | null;
  /** Tree mode (B0): set by `startTree`. Undefined: the Life plays as before. */
  tree?: TreeState;
}

const FAMILIES: Part['family'][] = ['feed', 'move', 'sense', 'guard', 'brood'];

/** Family order, with ties in PLACES order. */
export function growthOrder(build: Build): Place[] {
  return FAMILIES.flatMap((family) => PLACES.filter((place) => {
    const part = build.parts[place];
    return part !== undefined && PARTS[part].family === family;
  }));
}

export function activePlaces(body: LifeBody): Place[] {
  if (body.tree) return body.tree.grown.filter((place) => !body.lost.includes(place));
  const order = growthOrder(body.build).filter((place) => place !== body.mutation?.place);
  const active = body.size >= RULE.maxSize ? order : order.slice(0, body.size);
  // Keep activation order for starvation: growth after the pick is newer than the mutation.
  if (body.mutation) active.splice(Math.min(MUTATION.size, active.length), 0, body.mutation.place);
  return active.filter((place) => !body.lost.includes(place));
}

export const activeParts = (body: LifeBody): PartId[] => activePlaces(body).map((place) => body.build.parts[place]!);
export const has = (body: LifeBody, part: PartId) => activeParts(body).includes(part);
export const newest = (body: LifeBody) => activePlaces(body).at(-1);
export const verbs = (body: LifeBody): VerbId[] => activeParts(body).flatMap((part) => PARTS[part].verb ?? []);

export const upkeep = (body: LifeBody, onMud = false) => has(body, 'deep') && onMud ? 0
  : RULE.baseUpkeep + activeParts(body).reduce((total, part) => total + partUpkeep(part, body.ranks), 0);
export const range = (body: LifeBody) => Math.min(RULE.maxRange, PLANS[body.build.clade].range
  + (has(body, 'leg') ? 1 + enforcedBonus(body, 'leg') : 0) + enforcedBonus(body, 'flap'));
export const tunnel = (body: LifeBody) => RULE.tunnel
  + (has(body, 'chaetae') ? RULE.bristleTunnel + enforcedBonus(body, 'chaetae') : 0);
export const sense = (body: LifeBody) => PLANS[body.build.clade].sense
  + (has(body, 'eye') ? RULE.eyeSense + enforcedBonus(body, 'eye') : 0)
  + (has(body, 'compound') ? RULE.compoundSense : 0);
export const oxygenMax = (body: LifeBody) => RULE.oxygen + (has(body, 'gill') ? RULE.gillOxygen + enforcedBonus(body, 'gill') : 0);
export function foodOf(body: LifeBody, node: NodeId): number {
  let food = NODES[node].food;
  for (const part of activeParts(body)) {
    if (part === 'gut') food += RULE.gutFood;
    const effect = ENFORCE_EFFECT[part];
    if (effect?.kind === 'meal' && (!effect.nodes || effect.nodes.includes(node)))
      food += effect.amount * (body.enforced[part] ?? 0);
  }
  return food;
}
export const clutch = (body: LifeBody, onMud = false) => (has(body, 'pouch') ? 2 * body.size + enforcedBonus(body, 'pouch') : body.size)
  + (has(body, 'deep') && onMud ? 1 : 0);
export const canGrab = (body: LifeBody) => has(body, 'claw') || has(body, 'proboscis') || has(body, 'hook');
export const mature = (body: LifeBody) => body.size >= RULE.adultSize || has(body, 'progenesis');

function enforcedBonus(body: LifeBody, part: PartId): number {
  const rank = body.enforced[part] ?? 0;
  return rank > 0 && has(body, part) ? rank * ENFORCE_EFFECT[part]!.amount : 0;
}

const SEA_FOOD: Partial<Record<NodeId, Food>> = { mat: 'mats', buried: 'detritus' };

export function lockOf(body: LifeBody, node: NodeId, substrate: Substrate, cracked = false): string | null {
  const food = SEA_FOOD[node];
  if (food) {
    const parts: Build['parts'] = {};
    for (const place of activePlaces(body)) parts[place] = body.build.parts[place];
    if (reach({ ...body.build, parts }, body.ranks, food, { kind: { substrate } }) > 0) return null;
    return node === 'buried' ? 'is out of digging reach' : 'is out of grazing reach';
  }
  if (CLADES[body.build.clade].substrate[substrate] === 0) return 'is out of feeding reach here';
  if (cracked) return null;
  if (node === 'shell' && !has(body, 'claw') && !has(body, 'hook'))
    return body.build.clade === 'worm' ? 'needs a hooked proboscis' : 'needs a crushing claw';
  if (node === 'carcass' && body.size < RULE.carcassSize)
    return `needs size ${RULE.carcassSize}, you are ${body.size}`;
  return null;
}

export type Side = 'front' | 'right' | 'back' | 'left';
/** `beats`: the defences the sea's hunter ignores (N4 D); the shadow beats none. */
export interface StrikeCtx { buried?: boolean; dug?: boolean; stayed?: boolean; braced?: boolean; soft?: boolean; beats?: DefenceKind[] }
export interface Hit {
  kind: 'buried' | 'enrolled' | 'blocked' | 'hit'; part: PartId | null; tear: Place | null;
  damage: number; rest: number; enforced?: true;
}

const SIDES: Side[] = ['front', 'right', 'back', 'left'];
export const sideOf = (dir: number, facing: number): Side => SIDES[(dir - facing + 4) % 4];

/** Mud, Dig, enrolment and Brace resolve before a guard or a tear; a hunter that beats armour gets past Brace (12 Nov). */
export function strikeOn(body: LifeBody, side: Side, ctx: StrikeCtx = {}): Hit {
  const safe = { part: null, tear: null, damage: 0, rest: RULE.restAfterStrike };
  const beaten = (kind?: DefenceKind) => !!kind && !!ctx.beats?.includes(kind);
  const holds = (part: PartId) => !beaten(PARTS[part].defence);
  if ((ctx.buried || ctx.dug) && !beaten('burrow')) return { ...safe, kind: 'buried' };
  if (ctx.stayed && !beaten('armour') && (body.build.clade === 'trilobite' || has(body, 'enrol')))
    return { ...safe, kind: 'enrolled', part: has(body, 'enrol') ? 'enrol' : null };
  if (ctx.braced && !beaten('armour')) return { ...safe, kind: 'blocked', rest: RULE.restAfterSpine };
  const target = side === 'left' || side === 'right' ? 'flank' : side;
  const active = activePlaces(body);
  const struck = PLACES.filter((place) => active.includes(place)
    && (place === 'back' && body.build.parts.back === 'shield' ? 'front' : STRUCK[place]) === target);
  const guard = struck.map((place) => body.build.parts[place]!).find((part) => GUARDS.includes(part) && holds(part));
  if (guard) return { ...safe, kind: 'blocked', part: guard, rest: guard === 'spine' ? RULE.restAfterSpine : RULE.restAfterStrike };
  const enforced = activeParts(body).find((part) => ENFORCE_EFFECT[part]?.kind === 'block' && holds(part)
    && enforcedBonus(body, part) > (body.spentGuards[part] ?? 0));
  if (enforced) return { ...safe, kind: 'blocked', part: enforced, enforced: true };
  const tear = struck.at(-1) ?? null;
  return { kind: 'hit', part: tear ? body.build.parts[tear]! : null, tear, damage: ctx.soft ? 2 : 1, rest: RULE.restAfterStrike };
}
