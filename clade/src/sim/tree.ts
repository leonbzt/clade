// The build toy (B0): a Life in tree mode starts bare, earns points and spends them on the nodes of its clade's tree.
// CONTRACT (16 Nov): the exported names and shapes are fixed. The bodies are B0 part A's work; the rules are in
// docs/slices/b0-the-build-toy.md and tests/tree.test.ts. A Life without `tree` plays exactly as before.
import type { Branch, TreeNode } from '../data/tree';
import type { Life } from './life';
import type { PartId } from './records';

/** `open`: a point grows it now. `grown`: a point adds a rank while `rank < cap`. `shut`: `why`, for the player. */
export type NodeState = { k: 'open' } | { k: 'grown'; rank: number; cap: number } | { k: 'shut'; why: string };

const todo = (): never => { throw new Error('B0 part A: not built'); };

/** Switch a fresh, bare Life to tree mode. False (and nothing changes) when the build has parts. */
export function startTree(_life: Life): boolean { return todo(); }
/** The tree of the Life's clade. B0: the worm's. */
export function treeOf(_life: Life): readonly TreeNode[] { return todo(); }
export function nodeState(_life: Life, _part: PartId): NodeState { return todo(); }
export function canSpend(_life: Life, _part: PartId): boolean { return todo(); }
/** Spend one point: grow the node, or add a rank to it. No food, no turn. */
export function spend(_life: Life, _part: PartId): boolean { return todo(); }
/** Food for the next bought point; null when every one is bought, or outside tree mode. */
export function pointCost(_life: Life): number | null { return todo(); }
export function canBuyPoint(_life: Life): boolean { return todo(); }
/** Food for a point. No turn. */
export function buyPoint(_life: Life): boolean { return todo(); }
/** The branch with the most points spent (a node 1, each rank 1); a tie goes to the branch grown first. */
export function branchOf(_life: Life): Branch | null { return todo(); }
