// One seeded choice at size 3. The added part bypasses the species' growth order.
import { CELL } from '../data/life';
import { MUTATION } from '../data/mutation';
import { PARTS } from '../data/parts';
import { emit, reveal, say, type Life } from './life';
import type { PartId, Place } from './records';
import { seeded } from './rng';

export interface Mutation { part: PartId; place: Place }

export function mutationWeight(life: Life, part: PartId): number {
  const p = PARTS[part], cells = life.board.map.join('').split('');
  let weight = MUTATION.base;
  if (p.opens?.includes('detritus')) weight += cells.filter((c) => CELL[c][1] === 'buried').length * MUTATION.buried;
  if (p.opens?.includes('mats')) weight += cells.filter((c) => CELL[c][1] === 'mat').length * MUTATION.mat;
  if (p.family === 'guard' && life.board.predatorAt !== null) weight += MUTATION.shadow;
  const enforced = (Object.keys(life.enforced) as PartId[]).some((id) => (life.enforced[id] ?? 0) > 0 && PARTS[id].family === p.family);
  return weight * (enforced ? MUTATION.enforced : 1);
}

/** Mark the event even when no place is empty, so it can never roll again this Life. */
export function offerMutation(life: Life): boolean {
  if (life.phase !== 'play' || life.size !== MUTATION.size || life.mutationOffer !== null) return false;
  const pool = Object.values(PARTS).filter((p) => p.plans.includes(life.build.clade) && !p.rare
    && life.build.parts[p.place] === undefined).map((p) => ({ part: p.id, weight: mutationWeight(life, p.id) }));
  const rng = seeded(life.seed);
  life.mutationOffer = [];
  while (pool.length && life.mutationOffer.length < MUTATION.offers) {
    let roll = rng() * pool.reduce((total, p) => total + p.weight, 0);
    let i = 0;
    while (i < pool.length - 1 && roll >= pool[i].weight) roll -= pool[i++].weight;
    life.mutationOffer.push(pool.splice(i, 1)[0].part);
  }
  return true;
}

/** Pick a part or pass. Both resolve the event without food, upkeep or a turn being paid. */
export function pickMutation(life: Life, part: PartId | null): boolean {
  if (life.phase !== 'play' || !life.mutationOffer?.length) return false;
  if (part !== null && (!life.mutationOffer.includes(part) || life.build.parts[PARTS[part].place] !== undefined)) return false;
  life.events = [];
  life.mutationOffer = [];
  if (part === null) return true;
  const place = PARTS[part].place;
  life.build = { ...life.build, parts: { ...life.build.parts, [place]: part } };
  life.mutation = { part, place };
  say(life, `Grew ${PARTS[part].name.toLowerCase()}.`);
  emit(life, { k: 'part', place, part });
  reveal(life);
  return true;
}
