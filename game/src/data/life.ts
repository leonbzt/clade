// The Life's numbers and nouns, ported from toys/life2-data.ts with R2's corrections (docs/research/cambrian-world.md).
// No logic here. The boards are in habitats.ts.
export const COLS = 8, ROWS = 11, TURNS = 20; // portrait: the toy's board turned a quarter

export const RULE = {
  startFood: 4, baseUpkeep: 1, oxygen: 3, health: 3,
  layCost: 4, gutFood: 2, gillOxygen: 2, eyeSense: 2, compoundSense: 20, maxRange: 5,
  adultSize: 3, maxSize: 5, // lay from size 3; every moult adds a size, a part and eggs per lay
  tunnel: 3, bristleTunnel: 1, // tiles a worm tunnels through connected mud in one move
  carcassSize: 4, foragingAt: 25,
  predatorSteps: 2, restAfterStrike: 1, restAfterSpine: 3,
};
export const STAGES = ['Hatchling', 'Juvenile', 'Adult', 'Adult', 'Full grown'];

export type PlanId = 'worm' | 'arthropod';
export const PLANS: Record<PlanId, { name: string; head: number; pairs: number; range: number; sense: number; moultExtra: number; soft: boolean; blurb: string; real: string }> = {
  worm: {
    name: 'Worm', head: 1, pairs: 2, range: 1, sense: 2, moultExtra: 2, soft: false,
    blurb: 'Crawls 1 tile. In mud it tunnels 3 tiles around corners, and strikes miss it.',
    real: 'Like Ottoia, a burrowing Burgess Shale worm.',
  },
  arthropod: {
    name: 'Arthropod', head: 1, pairs: 2, range: 2, sense: 1, moultExtra: 3, soft: true,
    blurb: 'Moves 2 tiles in a line, more with legs. Mud stops it. Soft for the turn it moults.',
    real: 'Like Sidneyia, a Cambrian arthropod that ate shelled prey.',
  },
};

/** The one fixed starter body for this spike (no parts screen). */
export const STARTER_PLAN: PlanId = 'worm';
export const STARTER_PARTS: PartId[] = ['gut', 'sclerite'];

export type SlotKind = 'head' | 'side' | 'tail';
export type PartId = 'claw' | 'shield' | 'eye' | 'spine' | 'leg' | 'digger' | 'gill' | 'gut' | 'pouch' | 'proboscis'
  | 'chaetae' | 'sclerite' | 'compound' | 'deep' | 'progenesis';
const BOTH: PlanId[] = ['worm', 'arthropod'], ART: PlanId[] = ['arthropod'], WORM: PlanId[] = ['worm'];
export const PARTS: Record<PartId, { name: string; upkeep: number; slots: SlotKind[]; plans: PlanId[]; does: string; rare?: boolean; guard?: boolean }> = {
  claw: { name: 'Crushing claw', upkeep: 1, slots: ['head'], plans: ART, does: 'Opens shell beds. Grabs food ahead without moving.' },
  shield: { name: 'Head shield', upkeep: 0, slots: ['head'], plans: ART, guard: true, does: 'Blocks strikes from the front.' },
  eye: { name: 'Eye', upkeep: 1, slots: ['head'], plans: BOTH, does: 'See hidden food 2 tiles further.' },
  spine: { name: 'Spine', upkeep: 1, slots: ['side', 'tail'], plans: ART, guard: true, does: 'Blocks strikes on this side; the hunter backs off 3 turns.' },
  leg: { name: 'Walking leg', upkeep: 1, slots: ['side'], plans: ART, does: '+1 tile of movement.' },
  digger: { name: 'Digging limb', upkeep: 0, slots: ['side'], plans: ART, does: 'Eat buried food in mud.' },
  gill: { name: 'Gill', upkeep: 0, slots: ['side'], plans: BOTH, does: '+2 maximum oxygen.' },
  gut: { name: 'Gut gland', upkeep: 1, slots: ['side'], plans: BOTH, does: '+2 food from every meal.' },
  pouch: { name: 'Brood pouch', upkeep: 1, slots: ['side', 'tail'], plans: BOTH, does: 'Bigger clutches: +1x per pouch.' },
  proboscis: { name: 'Proboscis', upkeep: 1, slots: ['head'], plans: WORM, does: 'Grabs food ahead without moving.' },
  chaetae: { name: 'Bristles', upkeep: 0, slots: ['side'], plans: WORM, does: 'Tunnel 1 tile further through mud.' },
  sclerite: { name: 'Sclerites', upkeep: 0, slots: ['side', 'tail'], plans: WORM, guard: true, does: 'Blocks strikes on this side.' },
  compound: { name: 'Compound eye', upkeep: 1, slots: ['head'], plans: ART, rare: true, does: 'See all hidden food.' },
  deep: { name: 'Deep burrow', upkeep: 0, slots: ['tail'], plans: WORM, rare: true, does: 'In mud: no upkeep, +1 egg per lay.' },
  progenesis: { name: 'Progenesis', upkeep: 0, slots: ['side', 'tail'], plans: BOTH, rare: true, does: 'Lay at any size.' },
};
export const PART_IDS = Object.keys(PARTS) as PartId[];

export type NodeId = 'mat' | 'buried' | 'shell' | 'carcass';
export const NODES: Record<NodeId, { name: string; food: number }> = {
  mat: { name: 'Microbial mat', food: 5 },
  buried: { name: 'Buried food', food: 6 },
  shell: { name: 'Shell bed', food: 9 },
  carcass: { name: 'Carcass', food: 14 },
};

export type Terrain = 'sand' | 'mud' | 'rock' | 'dead';
export const TERRAIN: Record<Terrain, string> = { sand: 'Open sand', mud: 'Mud', rock: 'Rock', dead: 'Dead water' };
