// N3's line progression, copied from game/src/data/lineages.ts without rebalancing.
import type { CladeId, Letter } from '../sim/records';

export const LINE_RULE = {
  tierWeight: { F: 1, D: 2, C: 3, B: 4, A: 5, S: 6 } satisfies Record<Letter, number>, // XP per egg
  xpAt: [0, 0, 60, 130, 210, 300, 420, 570, 750, 970, 1250], // total XP for each level
  cap: 10, // highest line level; every level above 1 gives one point
};
export const RANK_CAP = 3; // points spent per part; each rank removes 1 upkeep and adds 1 Enforce headroom

// Job IDs are clade IDs. Descriptions only: jobs do not affect the sea until R7.
export const LINE_JOBS: Record<CladeId, string> = {
  cell: 'drifts in the water',
  worm: 'stirs and grazes the floor',
  arthropod: 'walks and feeds on the floor',
  trilobite: 'rakes and grazes the floor',
  swimmer: 'hunts in the water',
};
