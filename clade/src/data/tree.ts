// The build toy (B0, 16 Nov): the worm's parts as a tree. CONTRACT: the shapes change only on the user's call;
// the node list and the numbers are a first cut, tuned by play.
// A node is a part record (data/parts.ts: its place, its effect, its verb) plus a branch and what it needs.
// Two nodes on one place are an either/or: a Life grows one of them.
import type { PartId, Place } from '../sim/records';

/** One branch a dial the clade shows (direction §5). From B1 the branch you spent most in steers the clutch. */
export type Branch = 'feed' | 'burrow' | 'spawn';
export const BRANCHES: Record<Branch, { name: string; life: string }> = {
  feed: { name: 'Feed', life: 'A feeder’s Life' },
  burrow: { name: 'Burrow', life: 'A burrower’s Life' },
  spawn: { name: 'Spawn', life: 'A spawner’s Life' },
};

/** `needs`: grown first, any one of them (still on the body or not). No `needs`: a root. */
export interface TreeNode { part: PartId; branch: Branch; needs?: readonly PartId[] }

/** What a Life in tree mode carries. `grown`: the places with a node, oldest first (a shed takes the newest). */
export interface TreeState { points: number; bought: number; grown: Place[] }

export const TREE = {
  birthPoints: 1, moultPoints: 1,
  pointCosts: [3, 5, 7, 9, 11], // food for each bought point across the Life (the old Enforce prices)
  maxNodes: 9, // a clade's budget (proposal 16 Nov)
};

export const WORM_TREE: readonly TreeNode[] = [
  { part: 'tentacles', branch: 'feed' },
  { part: 'proboscis', branch: 'feed' },
  { part: 'eye', branch: 'feed' },
  { part: 'gut', branch: 'feed', needs: ['tentacles', 'proboscis'] },
  { part: 'bulb', branch: 'burrow' },
  { part: 'chaetae', branch: 'burrow' },
  { part: 'sclerite', branch: 'burrow' },
  { part: 'gill', branch: 'burrow', needs: ['bulb'] },
  { part: 'pouch', branch: 'spawn' },
];
