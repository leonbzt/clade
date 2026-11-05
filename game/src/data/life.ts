// The Life's numbers and nouns, ported from toys/life2-data.ts with R2's corrections (docs/research/cambrian-world.md).
// No logic here. The boards are in habitats.ts.
export const COLS = 8, ROWS = 11, TURNS = 20; // portrait: the toy's board turned a quarter

export const RULE = {
  startFood: 6, baseUpkeep: 1, oxygen: 3, health: 3,
  layCost: 4, gutFood: 2, gillOxygen: 2, eyeSense: 2, compoundSense: 20, maxRange: 5,
  adultSize: 3, maxSize: 5, // lay from size 3; every moult adds a size, a part and eggs per lay
  tunnel: 3, bristleTunnel: 1, // tiles a worm tunnels through connected mud in one move
  carcassSize: 4, foragingAt: 25,
  predatorSteps: 2, restAfterStrike: 1, restAfterSpine: 3,
  regrow: 4, // turns until an eaten mat (or sulfur mat) grows back
};
export const STAGES = ['Hatchling', 'Juvenile', 'Adult', 'Adult', 'Full grown'];

export type PlanId = 'worm' | 'arthropod';
export const PLANS: Record<PlanId, { name: string; pitch: string; head: number; pairs: number; range: number; sense: number; moultExtra: number; soft: boolean; blurb: string; real: string }> = {
  worm: {
    name: 'Worm', pitch: 'Tunnels in mud, where strikes miss it.', head: 1, pairs: 2, range: 1, sense: 2, moultExtra: 2, soft: false,
    blurb: 'Crawls 1 tile. In mud it tunnels 3 tiles around corners, and strikes miss it.',
    real: 'Like Ottoia, a burrowing Burgess Shale worm.',
  },
  arthropod: {
    name: 'Arthropod', pitch: 'Runs 2 tiles in a line; mud stops it.', head: 1, pairs: 2, range: 2, sense: 1, moultExtra: 3, soft: true,
    blurb: 'Moves 2 tiles in a line, more with legs. Mud stops it. Soft for the turn it moults.',
    real: 'Like Sidneyia, a Cambrian arthropod that ate shelled prey.',
  },
};

export const STARTER_PLAN: PlanId = 'worm';

/** Verbs (slice 10): each comes from a part. `free` verbs don't end the turn; `recharge` is in turns. */
export type VerbId = 'graze' | 'dash' | 'dig' | 'sense' | 'brace' | 'crush';
export const VERBS: Record<VerbId, { name: string; does: string; free: boolean; recharge: number; style: StyleId }> = {
  graze: { name: 'Graze', does: 'Eat every mat around you.', free: false, recharge: 3, style: 'sweeper' },
  dash: { name: 'Dash', does: 'Your next move goes twice as far.', free: true, recharge: 3, style: 'sweeper' },
  dig: { name: 'Dig', does: 'Eat the buried food on and beside your tile. Strikes miss you.', free: false, recharge: 2, style: 'digger' },
  sense: { name: 'Sense', does: 'Reveal the hidden food within 5 tiles.', free: true, recharge: 4, style: 'digger' },
  brace: { name: 'Brace', does: 'Stay put: strikes from every side are blocked, and the hunter backs off.', free: false, recharge: 3, style: 'tank' },
  crush: { name: 'Crush', does: 'Break a shell bed or carcass beside you: +4 food, at any size.', free: false, recharge: 2, style: 'tank' },
};
export const VERB_IDS = Object.keys(VERBS) as VerbId[];
export const MAX_VERBS = 3;
export type StyleId = 'sweeper' | 'digger' | 'tank';
export const STYLES: Record<StyleId, { name: string; blurb: string }> = {
  sweeper: { name: 'Sweeper', blurb: 'Covers ground and grazes mats in bulk.' },
  digger: { name: 'Digger', blurb: 'Finds and digs up hidden food, safe in the sediment.' },
  tank: { name: 'Tank', blurb: 'Cracks the big meals and stands up to the hunter.' },
};
/** Which part gives each verb, per body plan. */
export const VERB_PART: Record<PlanId, Record<VerbId, PartId>> = {
  worm: { graze: 'tentacles', dash: 'chaetae', dig: 'bulb', sense: 'eye', brace: 'sclerite', crush: 'proboscis' },
  arthropod: { graze: 'rake', dash: 'leg', dig: 'digger', sense: 'eye', brace: 'spine', crush: 'claw' },
};
export const STYLE_VERBS: Record<StyleId, VerbId[]> = { sweeper: ['graze', 'dash'], digger: ['dig', 'sense'], tank: ['brace', 'crush'] };

export type SlotKind = 'head' | 'side' | 'tail';
export type PartId = 'claw' | 'shield' | 'eye' | 'spine' | 'leg' | 'digger' | 'gill' | 'gut' | 'pouch' | 'proboscis' | 'rake' | 'tentacles' | 'bulb'
  | 'chaetae' | 'sclerite' | 'compound' | 'enrol' | 'blood' | 'hook' | 'deep' | 'symbiont' | 'progenesis';
const BOTH: PlanId[] = ['worm', 'arthropod'], ART: PlanId[] = ['arthropod'], WORM: PlanId[] = ['worm'];
export const PARTS: Record<PartId, { name: string; upkeep: number; slots: SlotKind[]; plans: PlanId[]; does: string; rare?: boolean; guard?: boolean; verb?: VerbId }> = {
  claw: { name: 'Crushing claw', upkeep: 1, slots: ['head'], plans: ART, verb: 'crush', does: 'Opens shell beds. Grabs food ahead without moving.' },
  shield: { name: 'Head shield', upkeep: 0, slots: ['head'], plans: ART, guard: true, does: 'Blocks strikes from the front.' },
  eye: { name: 'Eye', upkeep: 1, slots: ['head'], plans: BOTH, verb: 'sense', does: 'See hidden food 2 tiles further.' },
  spine: { name: 'Spine', upkeep: 1, slots: ['side', 'tail'], plans: ART, guard: true, verb: 'brace', does: 'Blocks strikes on this side; the hunter backs off 3 turns.' },
  leg: { name: 'Walking leg', upkeep: 1, slots: ['side'], plans: ART, verb: 'dash', does: '+1 tile of movement.' },
  digger: { name: 'Digging limb', upkeep: 0, slots: ['side'], plans: ART, verb: 'dig', does: 'Eat buried food in mud.' },
  rake: { name: 'Raking limbs', upkeep: 1, slots: ['side'], plans: ART, verb: 'graze', does: 'Sweep mats into your mouth.' },
  gill: { name: 'Gill', upkeep: 0, slots: ['side'], plans: BOTH, does: '+2 maximum oxygen.' },
  gut: { name: 'Gut gland', upkeep: 1, slots: ['side'], plans: BOTH, does: '+2 food from every meal.' },
  pouch: { name: 'Brood pouch', upkeep: 1, slots: ['side', 'tail'], plans: BOTH, does: 'Bigger clutches: +1x per pouch.' },
  proboscis: { name: 'Proboscis', upkeep: 1, slots: ['head'], plans: WORM, verb: 'crush', does: 'Grabs food ahead without moving.' },
  chaetae: { name: 'Bristles', upkeep: 0, slots: ['side'], plans: WORM, verb: 'dash', does: 'Tunnel 1 tile further through mud.' },
  sclerite: { name: 'Sclerites', upkeep: 0, slots: ['side', 'tail'], plans: WORM, guard: true, verb: 'brace', does: 'Blocks strikes on this side.' },
  tentacles: { name: 'Tentacles', upkeep: 1, slots: ['head'], plans: WORM, verb: 'graze', does: 'Sweep mats into your mouth.' },
  bulb: { name: 'Burrowing bulb', upkeep: 0, slots: ['tail'], plans: WORM, verb: 'dig', does: 'Dig fast through any ground.' },
  compound: { name: 'Compound eye', upkeep: 1, slots: ['head'], plans: ART, rare: true, does: 'See all hidden food.' },
  enrol: { name: 'Enrolment', upkeep: 0, slots: ['tail'], plans: ART, rare: true, does: 'If you stay put, every strike glances off.' },
  blood: { name: 'Blue blood', upkeep: 0, slots: ['side'], plans: ART, rare: true, does: 'Dead water and low oxygen cost you no oxygen.' },
  hook: { name: 'Hooked proboscis', upkeep: 1, slots: ['head'], plans: WORM, rare: true, does: 'Opens shell beds. Grabs food ahead without moving.' },
  symbiont: { name: 'Sulfur symbionts', upkeep: 0, slots: ['side'], plans: WORM, rare: true, does: 'Sulfur mats feed you double.' },
  deep: { name: 'Deep burrow', upkeep: 0, slots: ['tail'], plans: WORM, rare: true, does: 'In mud: no upkeep, +1 egg per lay.' },
  progenesis: { name: 'Progenesis', upkeep: 0, slots: ['side', 'tail'], plans: BOTH, rare: true, does: 'Lay at any size.' },
};
export const PART_IDS = Object.keys(PARTS) as PartId[];

export type NodeId = 'mat' | 'buried' | 'shell' | 'carcass' | 'bloom';
export const NODES: Record<NodeId, { name: string; food: number }> = {
  mat: { name: 'Microbial mat', food: 5 },
  buried: { name: 'Buried food', food: 6 },
  shell: { name: 'Shell bed', food: 9 },
  carcass: { name: 'Carcass', food: 14 },
  bloom: { name: 'Sulfur mat', food: 7 },
};

export type Terrain = 'sand' | 'mud' | 'rock' | 'dead';
export const TERRAIN: Record<Terrain, string> = { sand: 'Open sand', mud: 'Mud', rock: 'Rock', dead: 'Vent water: costs 1 oxygen a turn, and the hunter stays out' };
