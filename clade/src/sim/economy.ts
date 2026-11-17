// The Life's three uses of surplus food, with effects and prices from data/economy.ts.
import { ENFORCE_COSTS, ENFORCE_EFFECT, ENFORCE_HEADROOM, GROW_SHARE, LAY_COST, LAY_STEP } from '../data/economy';
import { PLANS, RULE, TURNS } from '../data/life';
import { PARTS } from '../data/parts';
import { TREE } from '../data/tree';
import { KIT } from '../data/kit';
import { rollOffer } from './kit';
import { activePlaces, clutch, has, mature } from './life-body';
import { emit, onMud, reveal, say, world, type Life } from './life';
import { offerMutation } from './mutation';
import type { PartId } from './records';

export const growCost = (life: Life) => Math.ceil((life.size + PLANS[life.build.clade].moultExtra) * GROW_SHARE);
export const canGrow = (life: Life) => life.phase === 'play' && !life.grew && life.size < RULE.maxSize && life.food >= growCost(life);

export function grow(life: Life): boolean {
  if (!canGrow(life)) return false;
  life.events = [];
  const before = activePlaces(life);
  life.food -= growCost(life);
  life.size++;
  if (life.tree) life.tree.points += TREE.moultPoints;
  if (life.kit) {
    life.kit.points += KIT.moultPoints;
    rollOffer(life);
  }
  life.grew = true;
  life.soft = PLANS[life.build.clade].soft;
  if (life.size === RULE.adultSize) say(life, 'You are an adult: you can lay eggs now.');
  if (life.size === RULE.maxSize) {
    life.health = RULE.health;
    say(life, 'Full grown: your body is finished and your wounds close.');
  }
  emit(life, { k: 'moult', size: life.size, food: life.food });
  for (const place of activePlaces(life)) {
    if (!before.includes(place)) emit(life, { k: 'part', place, part: life.build.parts[place]! });
  }
  reveal(life);
  offerMutation(life);
  return true;
}

export function enforceCost(life: Life): number | null {
  if (life.tree || life.kit) return null;
  const bought = Object.values(life.enforced).reduce((total, rank) => total + rank, 0);
  return ENFORCE_COSTS[bought] ?? null;
}

export function canEnforce(life: Life, part: PartId): boolean {
  const cost = enforceCost(life);
  return life.phase === 'play' && cost !== null && life.food >= cost && !!ENFORCE_EFFECT[part] && has(life, part)
    && (life.enforced[part] ?? 0) < ENFORCE_HEADROOM + Math.max(0, life.ranks[part] ?? 0);
}

export function enforce(life: Life, part: PartId): boolean {
  const cost = enforceCost(life);
  if (cost === null || !canEnforce(life, part)) return false;
  life.events = [];
  life.food -= cost;
  const rank = (life.enforced[part] ?? 0) + 1;
  life.enforced[part] = rank;
  say(life, `Enforced ${PARTS[part].name.toLowerCase()}.`);
  emit(life, { k: 'enforce', part, rank, food: life.food });
  if (ENFORCE_EFFECT[part]?.kind === 'sight') reveal(life);
  return true;
}

export function payback(life: Life, part: PartId): string | null {
  const effect = ENFORCE_EFFECT[part], cost = enforceCost(life);
  if (!effect || cost === null) return null;
  const text = effect.kind === 'meal' ? `pays back after ${Math.ceil(cost / effect.amount)} ${effect.meals}` : effect.text;
  const turns = life.phase === 'play' ? TURNS - life.turn + 1 : 0;
  return `${text} · ${turns} turn${turns === 1 ? '' : 's'} left`;
}

export const layCost = (life: Life) => LAY_COST + LAY_STEP * life.lays;
export const layYield = (life: Life) => clutch(life, onMud(life));
export const canLay = (life: Life) => life.phase === 'play' && mature(life) && life.food >= layCost(life);

export function lay(life: Life): boolean {
  if (!canLay(life)) return false;
  life.events = [];
  const n = layYield(life);
  life.food -= layCost(life);
  life.lays++;
  life.eggs += n;
  if (life.mutation) life.eggsAfter += n;
  life.moved = false;
  say(life, `Laid ${n} egg${n === 1 ? '' : 's'}.`);
  emit(life, { k: 'lay', n, eggs: life.eggs, food: life.food });
  world(life);
  return true;
}

export function resultOf(life: Life) {
  if (!life.cause) return null;
  return {
    eggs: life.eggs,
    mutation: life.mutation ? { ...life.mutation } : null,
    eggsAfter: life.eggsAfter,
    enforced: { ...life.enforced },
    ate: { ...life.ate },
    cause: life.cause,
    witnessed: [...new Set(life.rivals.map((rival) => rival.species))],
  };
}
