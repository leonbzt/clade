// The kit toy (B0 round two): a Life in kit mode plans a few parts, is offered the rest, and its body is its stats.
// CONTRACT (17 Nov): the exported names and shapes are fixed. The bodies are the builder's work (parts A and B);
// the rules are in docs/slices/b0r2-the-kit-toy.md, tests/kit.test.ts and tests/kit-rules.test.ts.
// A Life without `kit` plays exactly as before.
import { KIT, WORM_KIT, type Branch, type KitId, type KitNode, type KitProgress } from '../data/kit';
import { PARTS } from '../data/parts';
import { at, dests, dist, eat, emit, lockOf, move, reveal, say, world, xy, type Life } from './life';
import type { PartId } from './records';
import { seeded } from './rng';

/** `open`: a point grows it now. `grown`: a point climbs while `rung < cap`. `wait`: growable, but not on offer.
 *  `locked`: the line opens it at `level`. `shut`: `why`, for the player. */
export type KitNodeState = { k: 'open'; by: 'plan' | 'offer' } | { k: 'grown'; rung: number; cap: number }
  | { k: 'wait' } | { k: 'locked'; level: number } | { k: 'shut'; why: string };

// ---- part A: the kit ----
/** The kit of the Life's clade. Round two: the worm's. */
export function kitOf(_life: Life): readonly KitNode[] { return WORM_KIT; }
export const nodeOf = (id: KitId): KitNode | undefined => WORM_KIT.find((n) => n.id === id);
/** Whether `plan` may be taken into a Life at this level. */
export function planOk(level: number, plan: readonly PartId[]): boolean {
  if (!Number.isInteger(level) || level < 1 || level > KIT.levelEggs.length
    || plan.length > KIT.planSlots[level - 1]) return false;
  const places = new Set();
  for (const id of plan) {
    const node = nodeOf(id);
    if (!node || node.kind !== 'part' || node.rare || node.level > level) return false;
    const place = PARTS[node.id].place;
    if (places.has(place)) return false;
    places.add(place);
  }
  return true;
}
/** Switch a fresh, bare Life to kit mode and roll its first offer. False (and nothing changes) otherwise. */
export function startKit(life: Life, level: number, plan: readonly PartId[]): boolean {
  if (life.tree || life.kit || Object.values(life.build.parts).some((part) => part !== undefined)
    || !planOk(level, plan)) return false;
  life.kit = { level, plan: [...plan], points: KIT.birthPoints, bought: 0, grown: [], order: [],
    rungs: {}, offer: [], offers: 0, task: null };
  rollOffer(life);
  return true;
}
export function kitState(life: Life, id: KitId): KitNodeState {
  const kit = life.kit, node = nodeOf(id);
  if (!kit || !node) return { k: 'shut', why: 'not in the kit' };
  if (node.level > kit.level) return { k: 'locked', level: node.level };
  const place = node.kind === 'part' ? PARTS[node.id].place : null;
  if (place && life.lost.includes(place)) return { k: 'shut', why: 'lost this Life' };
  const rung = kit.rungs[id] ?? 0;
  if (rung >= 1) return { k: 'grown', rung, cap: Math.min(node.rungs.length, KIT.rungCap[kit.level - 1]) };
  const there = place ? life.build.parts[place] : undefined;
  if (there !== undefined && there !== id)
    return { k: 'shut', why: `${nodeOf(there)!.rungs[0].name.toLowerCase()} grows there` };
  if (node.needs && !node.needs.some((need) => (kit.rungs[need] ?? 0) >= 1))
    return { k: 'shut', why: `needs ${node.needs.map((need) => nodeOf(need)!.rungs[0].name.toLowerCase()).join(' or ')}` };
  if (node.kind === 'part' && kit.plan.includes(node.id)) return { k: 'open', by: 'plan' };
  if (kit.offer.includes(id)) return { k: 'open', by: 'offer' };
  return { k: 'wait' };
}
export function canSpend(life: Life, id: KitId): boolean {
  if (life.phase !== 'play' || !life.kit || life.kit.points <= 0) return false;
  const state = kitState(life, id);
  return state.k === 'open' || (state.k === 'grown' && state.rung < state.cap);
}
/** Spend one point: grow the node, or climb one rung. No food, no turn. */
export function spend(life: Life, id: KitId): boolean {
  if (!canSpend(life, id)) return false;
  const kit = life.kit!, node = nodeOf(id)!;
  life.events = [];
  kit.points--;
  if (kitState(life, id).k === 'open') {
    kit.rungs[id] = 1;
    kit.order.push(id);
    kit.offer = kit.offer.filter((offered) => offered !== id);
    if (node.kind === 'part') {
      const place = PARTS[node.id].place;
      life.build = { ...life.build, parts: { ...life.build.parts, [place]: node.id } };
      kit.grown.push(place);
      emit(life, { k: 'part', place, part: node.id });
    }
  } else kit.rungs[id] = kit.rungs[id]! + 1;
  const rung = kit.rungs[id]!;
  say(life, `Grew ${node.rungs[rung - 1].name.toLowerCase()}.`);
  emit(life, { k: 'rung', id, rung });
  reveal(life);
  return true;
}
/** Replace the offer with a fresh, seeded one. `grow` calls it after a moult. */
export function rollOffer(life: Life): void {
  const kit = life.kit;
  if (!kit) return;
  kit.offer = [];
  let pool = kitOf(life).filter((node) => kitState(life, node.id).k === 'wait');
  const rng = seeded(life.seed + 7919 * kit.offers);
  const weight = (node: KitNode) => node.rare ? KIT.rareWeight : 1;
  while (pool.length && kit.offer.length < KIT.offerSize) {
    let roll = rng() * pool.reduce((total, node) => total + weight(node), 0), i = 0;
    while (i < pool.length - 1 && roll >= weight(pool[i])) roll -= weight(pool[i++]);
    const node = pool.splice(i, 1)[0];
    kit.offer.push(node.id);
    if (node.rare) pool = pool.filter((candidate) => !candidate.rare);
  }
  kit.offers++;
}
/** Food for the next bought point; null when every one is bought, or outside kit mode. */
export function pointCost(life: Life): number | null {
  return life.kit ? KIT.pointCosts[life.kit.bought] ?? null : null;
}
export function canBuyPoint(life: Life): boolean {
  const cost = pointCost(life);
  return life.phase === 'play' && cost !== null && life.food >= cost;
}
/** Food for a point. No turn. */
export function buyPoint(life: Life): boolean {
  const cost = pointCost(life);
  if (cost === null || !canBuyPoint(life)) return false;
  life.events = [];
  life.food -= cost;
  life.kit!.points++;
  life.kit!.bought++;
  say(life, 'Bought a point.');
  return true;
}
/** The branch with the most rungs climbed; a tie goes to the branch grown first. */
export function branchOf(life: Life): Branch | null {
  if (!life.kit) return null;
  const counts = new Map<Branch, number>();
  for (const id of life.kit.order) {
    const branch = nodeOf(id)!.branch;
    counts.set(branch, (counts.get(branch) ?? 0) + (life.kit.rungs[id] ?? 0));
  }
  let branch: Branch | null = null, most = 0;
  for (const [b, count] of counts) {
    if (count > most) { branch = b; most = count; }
  }
  return branch;
}

/** The line's level for the eggs laid over all Lives: 1 to `KIT.levelEggs.length`. */
export function levelOf(eggs: number): number {
  let level = 1;
  while (level < KIT.levelEggs.length && KIT.levelEggs[level] <= eggs) level++;
  return level;
}
/** The next level, the eggs it stands at and the nodes it opens; null at the top. */
export function nextLevel(eggs: number): { level: number; at: number; opens: KitId[] } | null {
  const level = levelOf(eggs) + 1;
  if (level > KIT.levelEggs.length) return null;
  return { level, at: KIT.levelEggs[level - 1], opens: WORM_KIT.filter((node) => node.level === level).map((node) => node.id) };
}
/** The progress after a Life of `eggs` on `board`: a new object, the old one untouched. */
export function afterLife(progress: KitProgress, board: string, eggs: number): KitProgress {
  return { eggs: progress.eggs + eggs, best: { ...progress.best, [board]: Math.max(progress.best[board] ?? 0, eggs) },
    plan: [...progress.plan] };
}

// ---- part B: work and tasks ----
/** Work the food under you: one action, then the world's turn. False (and no turn) with nothing to work. */
export function work(life: Life): boolean {
  if (!life.kit || life.phase !== 'play' || !life.tiles[at(life.x, life.y)].node) return false;
  life.events = []; life.moved = false;
  eat(life, at(life.x, life.y));
  world(life);
  return true;
}
/** Set the tile to walk to or work; null drops the task. No turn. False off the board, on rock, outside kit mode or
 *  when the Life is over. */
export function setTask(life: Life, i: number | null): boolean {
  if (!life.kit || life.phase !== 'play') return false;
  if (i !== null && (!life.tiles[i] || life.tiles[i].t === 'rock')) return false;
  life.kit.task = i;
  return true;
}
/** One action toward the task. False (and no turn) when there is no task left to act on. */
export function stepTask(life: Life): boolean {
  const kit = life.kit;
  if (!kit || kit.task === null || life.phase !== 'play') return false;
  const striking = () => life.pred?.state === 'strike';
  if (striking()) { kit.task = null; return false; }
  const i = kit.task, t = life.tiles[i], health = life.health, lost = life.lost.length;
  if (at(life.x, life.y) === i) {
    if (!t.node || lockOf(life, t.node)) { kit.task = null; return false; }
    work(life);
  } else {
    const [x, y] = xy(i);
    let nearest = dist(life.x, life.y, x, y), next: number | null = null;
    for (const d of dests(life).values()) {
      if (d.grab) continue;
      const distance = dist(...xy(d.i), x, y);
      if (distance < nearest) { nearest = distance; next = d.i; }
    }
    if (next === null) { kit.task = null; return false; }
    move(life, next);
  }
  if ((at(life.x, life.y) === i && (!t.node || lockOf(life, t.node)))
    || life.health < health || life.lost.length > lost || striking() || life.phase !== 'play')
    kit.task = null;
  return true;
}
