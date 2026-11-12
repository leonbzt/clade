// The ported Life's numbers. Species parts live in parts.ts.
import type { PartId, Place, PlanId, VerbId } from '../sim/records';

export const COLS = 8, ROWS = 11, TURNS = 20;
export const PREY_FOOD = 10; // food for crushing an adjacent rival you could eat (N4 D): between a shell bed and a carcass

export const RULE = {
  startFood: 6, baseUpkeep: 1, oxygen: 3, health: 3,
  gutFood: 2, gillOxygen: 2, eyeSense: 2, compoundSense: 20, maxRange: 5,
  adultSize: 3, maxSize: 5, // lay from size 3; full growth switches on every part
  tunnel: 3, bristleTunnel: 1, // tiles a worm tunnels through connected mud in one move
  carcassSize: 4,
  predatorSteps: 2, restAfterStrike: 1, restAfterSpine: 3,
  regrow: 4, // turns until an eaten mat grows back
};

export const STRUCK = {
  front: 'front', eyes: 'front', limbs: 'flank', sides: 'flank', back: 'flank', tail: 'back',
} satisfies Record<Place, 'front' | 'flank' | 'back'>;
export const GUARDS: readonly PartId[] = ['shield', 'spine', 'sclerite'];
export const STAGES = ['Larva', 'Juvenile', 'Adult', 'Adult', 'Full grown'];

export const PLANS: Record<Exclude<PlanId, 'cell' | 'swimmer'>, { range: number; sense: number; moultExtra: number; soft: boolean }> = {
  worm: {
    range: 1, sense: 2, moultExtra: 2, soft: false,
  },
  arthropod: {
    range: 2, sense: 1, moultExtra: 3, soft: true,
  },
  trilobite: {
    range: 2, sense: 2, moultExtra: 3, soft: true,
  },
};

export type NodeId = 'mat' | 'buried' | 'shell' | 'carcass';
export const NODES: Record<NodeId, { name: string; food: number }> = {
  mat: { name: 'Microbial mat', food: 5 },
  buried: { name: 'Buried food', food: 6 },
  shell: { name: 'Shell bed', food: 9 },
  carcass: { name: 'Carcass', food: 14 },
};

/** Verbs (slice 10): each comes from a part. `free` verbs don't end the turn; `recharge` is in turns. */
export const VERBS: Record<VerbId, { name: string; does: string; free: boolean; recharge: number; style: StyleId }> = {
  graze: { name: 'Graze', does: 'Eat every mat around you.', free: false, recharge: 3, style: 'sweeper' },
  dash: { name: 'Dash', does: 'Your next move goes twice as far.', free: true, recharge: 3, style: 'sweeper' },
  dig: { name: 'Dig', does: 'Eat the buried food on and beside your tile. Strikes miss you.', free: false, recharge: 2, style: 'digger' },
  sense: { name: 'Sense', does: 'Reveal the hidden food within 5 tiles.', free: true, recharge: 4, style: 'digger' },
  brace: { name: 'Brace', does: 'Stay put: strikes from every side are blocked, and the hunter backs off.', free: false, recharge: 3, style: 'tank' },
  crush: { name: 'Crush', does: 'Break a shell bed or carcass beside you: +4 food, at any size.', free: false, recharge: 2, style: 'tank' },
};
type StyleId = 'sweeper' | 'digger' | 'tank';

export type Terrain = 'sand' | 'mud' | 'rock';
export const CELL: Record<string, [Terrain, NodeId | null]> = {
  '.': ['sand', null], '~': ['mud', null], '#': ['rock', null],
  m: ['sand', 'mat'], s: ['sand', 'shell'], c: ['sand', 'carcass'], b: ['mud', 'buried'],
};
