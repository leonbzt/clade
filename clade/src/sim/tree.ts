// The build toy (B0): a Life in tree mode starts bare, earns points and spends them on the nodes of its clade's tree.
// CONTRACT (16 Nov): the exported names and shapes are fixed. The bodies are B0 part A's work; the rules are in
// docs/slices/b0-the-build-toy.md and tests/tree.test.ts. A Life without `tree` plays exactly as before.
import { ENFORCE_EFFECT, ENFORCE_HEADROOM } from '../data/economy';
import { PARTS } from '../data/parts';
import { TREE, WORM_TREE, type Branch, type TreeNode } from '../data/tree';
import { emit, reveal, say, type Life } from './life';
import type { PartId } from './records';

/** `open`: a point grows it now. `grown`: a point adds a rank while `rank < cap`. `shut`: `why`, for the player. */
export type NodeState = { k: 'open' } | { k: 'grown'; rank: number; cap: number } | { k: 'shut'; why: string };

/** Switch a fresh, bare Life to tree mode. False (and nothing changes) when the build has parts. */
export function startTree(life: Life): boolean {
  if (life.tree || Object.values(life.build.parts).some((part) => part !== undefined)) return false;
  life.tree = { points: TREE.birthPoints, bought: 0, grown: [] };
  return true;
}
/** The tree of the Life's clade. B0: the worm's. */
export function treeOf(_life: Life): readonly TreeNode[] { return WORM_TREE; }
export function nodeState(life: Life, part: PartId): NodeState {
  const node = treeOf(life).find((n) => n.part === part);
  if (!life.tree || !node) return { k: 'shut', why: 'not in the tree' };
  const place = PARTS[part].place, there = life.build.parts[place];
  if (life.lost.includes(place)) return { k: 'shut', why: 'lost this Life' };
  if (there === part) return {
    k: 'grown', rank: life.enforced[part] ?? 0, cap: ENFORCE_HEADROOM + Math.max(0, life.ranks[part] ?? 0),
  };
  if (there !== undefined) return { k: 'shut', why: `${PARTS[there].name.toLowerCase()} grows there` };
  if (node.needs && !node.needs.some((need) => Object.values(life.build.parts).includes(need)))
    return { k: 'shut', why: `needs ${node.needs.map((need) => PARTS[need].name.toLowerCase()).join(' or ')}` };
  return { k: 'open' };
}
export function canSpend(life: Life, part: PartId): boolean {
  if (life.phase !== 'play' || !life.tree || life.tree.points <= 0) return false;
  const state = nodeState(life, part);
  return state.k === 'open' || (state.k === 'grown' && state.rank < state.cap);
}
/** Spend one point: grow the node, or add a rank to it. No food, no turn. */
export function spend(life: Life, part: PartId): boolean {
  if (!canSpend(life, part)) return false;
  life.events = [];
  life.tree!.points--;
  if (nodeState(life, part).k === 'open') {
    const place = PARTS[part].place;
    life.build = { ...life.build, parts: { ...life.build.parts, [place]: part } };
    life.tree!.grown.push(place);
    say(life, `Grew ${PARTS[part].name.toLowerCase()}.`);
    emit(life, { k: 'part', place, part });
    reveal(life);
  } else {
    const rank = (life.enforced[part] ?? 0) + 1;
    life.enforced[part] = rank;
    say(life, `Enforced ${PARTS[part].name.toLowerCase()}.`);
    emit(life, { k: 'enforce', part, rank, food: life.food });
    if (ENFORCE_EFFECT[part]?.kind === 'sight') reveal(life);
  }
  return true;
}
/** Food for the next bought point; null when every one is bought, or outside tree mode. */
export function pointCost(life: Life): number | null {
  return life.tree ? TREE.pointCosts[life.tree.bought] ?? null : null;
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
  life.tree!.points++;
  life.tree!.bought++;
  say(life, 'Bought a point.');
  return true;
}
/** The branch with the most points spent (a node 1, each rank 1); a tie goes to the branch grown first. */
export function branchOf(life: Life): Branch | null {
  if (!life.tree) return null;
  const counts = new Map<Branch, number>();
  for (const place of life.tree.grown) {
    const node = treeOf(life).find((n) => n.part === life.build.parts[place]);
    if (node) counts.set(node.branch, (counts.get(node.branch) ?? 0) + 1 + (life.enforced[node.part] ?? 0));
  }
  let branch: Branch | null = null, most = 0;
  for (const [b, count] of counts) {
    if (count > most) { branch = b; most = count; }
  }
  return branch;
}
