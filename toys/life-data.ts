// Toy: a Life. The real things, the body plans and the rules' numbers. The rules are ours; the nouns come from nature.
export const COLS = 11, ROWS = 8, TURNS = 20;
export const PREDATOR_AT = 6;
export const LOW_OXYGEN = [13, 14] as const;

export const RULE = {
  startFood: 4, baseUpkeep: 1, oxygen: 3, health: 3,
  layCost: 4, starters: 2, gillOxygen: 2, eyeSense: 2, compoundSense: 20, maxRange: 5,
  clutchStep: 2, // a lay gives (1 + pouches) × (1 + segments / clutchStep, rounded down) eggs
  carcassSize: 5, foragingAt: 25, // lifetime food eaten for Foraging 2
  predatorSteps: 2, restAfterStrike: 1, restAfterSpine: 3,
};
export const TIERS: [string, number][] = [['S', 24], ['A', 17], ['B', 11], ['C', 7], ['D', 3], ['F', 0]];

export type PlanId = 'worm' | 'arthropod';
export const PLANS: Record<PlanId, {
  name: string; blurb: string; real: string; headSlots: number; segments: number; maxSegments: number;
  range: number; sense: number; moultExtra: number; soft: boolean;
}> = {
  worm: {
    name: 'Worm', blurb: 'Moves 1 tile. In mud it is buried: strikes miss it, and it can eat buried food. Slow on open sand.',
    real: 'Like Ottoia, a burrowing Burgess Shale worm.',
    headSlots: 1, segments: 3, maxSegments: 8, range: 1, sense: 2, moultExtra: 1, soft: false,
  },
  arthropod: {
    name: 'Arthropod', blurb: 'Moves 2 tiles in a line, more with legs. Mud stops it. Soft for the turn it moults: strikes hurt more.',
    real: 'Like Sidneyia, a shell-crushing Cambrian arthropod.',
    headSlots: 2, segments: 3, maxSegments: 7, range: 2, sense: 1, moultExtra: 2, soft: true,
  },
};

export type SlotKind = 'head' | 'side' | 'tail';
export type PartId = 'claw' | 'shield' | 'eye' | 'spine' | 'leg' | 'digger' | 'gill' | 'gut' | 'pouch' | 'proboscis'
  | 'chaetae' | 'sclerite' | 'compound' | 'enrol' | 'hook' | 'deep';
const BOTH: PlanId[] = ['worm', 'arthropod'], ART: PlanId[] = ['arthropod'], WORM: PlanId[] = ['worm'];
export const PARTS: Record<PartId, {
  name: string; upkeep: number; slots: SlotKind[]; plans: PlanId[]; does: string; real: string; rare?: boolean; guard?: boolean;
}> = {
  claw: { name: 'Crushing claw', upkeep: 1, slots: ['head'], plans: ART, does: 'Opens brachiopod beds. Grabs food straight ahead without moving.', real: 'Sidneyia crushed shelled prey.' },
  shield: { name: 'Head shield', upkeep: 0, slots: ['head'], plans: ART, guard: true, does: 'Blocks strikes from the front.', real: 'The trilobite cephalon.' },
  eye: { name: 'Eye', upkeep: 1, slots: ['head'], plans: BOTH, does: 'Reveals hidden food 2 tiles further.', real: 'Eyes spread fast in the Cambrian.' },
  spine: { name: 'Spine', upkeep: 1, slots: ['side', 'tail'], plans: ART, guard: true, does: 'Blocks strikes on this side and drives the predator off for 3 turns.', real: 'Trilobite spines.' },
  leg: { name: 'Walking leg', upkeep: 1, slots: ['side'], plans: ART, does: '+1 tile of movement.', real: 'Jointed limbs define arthropods.' },
  digger: { name: 'Digging limb', upkeep: 0, slots: ['side'], plans: ART, does: 'Lets you eat buried food in mud.', real: 'Cruziana trails record trilobites digging.' },
  gill: { name: 'Gill', upkeep: 0, slots: ['side'], plans: BOTH, does: '+2 maximum oxygen.', real: 'Oxygen limited Cambrian body size.' },
  gut: { name: 'Gut gland', upkeep: 1, slots: ['side'], plans: BOTH, does: '+1 food from everything you eat.', real: 'Leanchoilia had branching gut glands.' },
  pouch: { name: 'Brood pouch', upkeep: 1, slots: ['side', 'tail'], plans: BOTH, does: 'Multiplies your clutch: +1 × per pouch.', real: 'Waptia carried its eggs.' },
  proboscis: { name: 'Proboscis', upkeep: 1, slots: ['head'], plans: WORM, does: 'Grabs food straight ahead without moving.', real: 'Ottoia shot out a hooked proboscis.' },
  chaetae: { name: 'Bristles', upkeep: 0, slots: ['side'], plans: WORM, does: '+1 tile of movement, through mud only.', real: 'Burgessochaeta had bristled sides.' },
  sclerite: { name: 'Sclerites', upkeep: 0, slots: ['side', 'tail'], plans: WORM, guard: true, does: 'Blocks strikes on this side.', real: 'Palaeoscolecid worms wore small plates.' },
  compound: { name: 'Compound eye', upkeep: 1, slots: ['head'], plans: ART, rare: true, does: 'Reveals all hidden food on the board.', real: 'Anomalocaris had over 16,000 lenses per eye.' },
  enrol: { name: 'Enrolment', upkeep: 0, slots: ['tail'], plans: ART, rare: true, does: 'If you stay put this turn, every strike is blocked.', real: 'Trilobites rolled into a ball.' },
  hook: { name: 'Hooked proboscis', upkeep: 1, slots: ['head'], plans: WORM, rare: true, does: 'Opens brachiopod beds. Grabs food straight ahead without moving.', real: 'Ottoia guts held shelled hyoliths.' },
  deep: { name: 'Deep burrow', upkeep: 0, slots: ['tail'], plans: WORM, rare: true, does: 'While in mud: no upkeep, and each lay gives +1 egg.', real: 'Treptichnus burrows mark the start of the Cambrian.' },
};
export const PART_IDS = Object.keys(PARTS) as PartId[];

export type NodeId = 'mat' | 'buried' | 'shell' | 'carcass' | 'sponge' | 'bloom';
export const NODES: Record<NodeId, { name: string; food: number; count: number; real: string }> = {
  mat: { name: 'Microbial mat', food: 4, count: 14, real: 'Mats carpeted the early seafloor.' },
  buried: { name: 'Buried food', food: 5, count: 8, real: 'Burrowing opened the food in the sediment.' },
  shell: { name: 'Brachiopod bed', food: 8, count: 5, real: 'Shelled filter feeders, common Cambrian prey.' },
  carcass: { name: 'Carcass', food: 12, count: 2, real: 'Big meals for big bodies.' },
  sponge: { name: 'Sponge garden', food: 8, count: 3, real: 'Vauxia and other Burgess Shale sponges.' },
  bloom: { name: 'Sulfur mat', food: 6, count: 4, real: 'Rich bacterial mats grow where oxygen is low.' },
};

export type Terrain = 'sand' | 'mud' | 'rock' | 'dead';
export const TERRAIN: Record<Terrain, string> = {
  sand: 'Open sand', mud: 'Mud', rock: 'Rock', dead: 'Dead water: costs 1 oxygen a turn',
};
