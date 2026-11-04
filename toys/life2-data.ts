// Toy: a Life, v2. The body plans, the parts, the rules' numbers. The rules are ours; the nouns come from nature.
export const COLS = 11, ROWS = 8, TURNS = 20;

export const RULE = {
  startFood: 4, baseUpkeep: 1, oxygen: 3, health: 3,
  layCost: 4, gutFood: 2, starters: 2, gillOxygen: 2, eyeSense: 2, compoundSense: 20, maxRange: 5,
  adultSize: 3, maxSize: 5, // you can lay from size 3; every moult adds a size, a part and eggs per lay
  tunnel: 3, bristleTunnel: 1, // tiles a worm tunnels through connected mud in one move
  carcassSize: 4, foragingAt: 25, // lifetime food eaten for Foraging 2
  predatorSteps: 2, restAfterStrike: 1, restAfterSpine: 3,
};
export const STAGES = ['Hatchling', 'Juvenile', 'Adult', 'Adult', 'Full grown'];

export type PlanId = 'worm' | 'arthropod';
export const PLANS: Record<PlanId, {
  name: string; blurb: string; real: string; head: number; pairs: number; range: number; sense: number; moultExtra: number; soft: boolean;
}> = {
  worm: {
    name: 'Worm',
    blurb: 'Crawls 1 tile. In mud it tunnels 3 tiles around corners, and strikes miss it. Cheap to grow.',
    real: 'Like Ottoia, a burrowing Burgess Shale worm.',
    head: 1, pairs: 2, range: 1, sense: 2, moultExtra: 2, soft: false,
  },
  arthropod: {
    name: 'Arthropod',
    blurb: 'Moves 2 tiles in a line, more with legs. Mud stops it. Soft for the turn it moults: strikes hurt more.',
    real: 'Like Sidneyia, a shell-crushing Cambrian arthropod.',
    head: 1, pairs: 2, range: 2, sense: 1, moultExtra: 3, soft: true,
  },
};

export type SlotKind = 'head' | 'side' | 'tail';
export type PartId = 'claw' | 'shield' | 'eye' | 'spine' | 'leg' | 'digger' | 'gill' | 'gut' | 'pouch' | 'proboscis'
  | 'chaetae' | 'sclerite' | 'compound' | 'enrol' | 'hook' | 'deep' | 'blood' | 'symbiont' | 'progenesis';
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
  gut: { name: 'Gut gland', upkeep: 1, slots: ['side'], plans: BOTH, does: '+2 food from everything you eat.', real: 'Leanchoilia had branching gut glands.' },
  pouch: { name: 'Brood pouch', upkeep: 1, slots: ['side', 'tail'], plans: BOTH, does: 'Multiplies your clutch: +1 × per pouch.', real: 'Waptia carried its eggs.' },
  proboscis: { name: 'Proboscis', upkeep: 1, slots: ['head'], plans: WORM, does: 'Grabs food straight ahead without moving.', real: 'Ottoia shot out a hooked proboscis.' },
  chaetae: { name: 'Bristles', upkeep: 0, slots: ['side'], plans: WORM, does: 'Tunnel 1 tile further through mud.', real: 'Burgessochaeta had bristled sides.' },
  sclerite: { name: 'Sclerites', upkeep: 0, slots: ['side', 'tail'], plans: WORM, guard: true, does: 'Blocks strikes on this side.', real: 'Palaeoscolecid worms wore small plates.' },
  compound: { name: 'Compound eye', upkeep: 1, slots: ['head'], plans: ART, rare: true, does: 'Reveals all hidden food on the board.', real: 'Anomalocaris had over 16,000 lenses per eye.' },
  enrol: { name: 'Enrolment', upkeep: 0, slots: ['tail'], plans: ART, rare: true, does: 'If you stay put this turn, every strike is blocked.', real: 'Trilobites rolled into a ball.' },
  blood: { name: 'Blue blood', upkeep: 0, slots: ['side'], plans: ART, rare: true, does: 'Dead water and low oxygen cost you no oxygen.', real: 'Many arthropods carry oxygen on copper-based haemocyanin.' },
  hook: { name: 'Hooked proboscis', upkeep: 1, slots: ['head'], plans: WORM, rare: true, does: 'Opens brachiopod beds. Grabs food straight ahead without moving.', real: 'Ottoia guts held shelled hyoliths.' },
  deep: { name: 'Deep burrow', upkeep: 0, slots: ['tail'], plans: WORM, rare: true, does: 'While in mud: no upkeep, and each lay gives +1 egg.', real: 'Treptichnus burrows mark the start of the Cambrian.' },
  symbiont: { name: 'Sulfur symbionts', upkeep: 0, slots: ['side'], plans: WORM, rare: true, does: 'Sulfur mats feed you double.', real: 'Some living worms host sulfur-eating bacteria.' },
  progenesis: { name: 'Progenesis', upkeep: 0, slots: ['side', 'tail'], plans: BOTH, rare: true, does: 'You can lay at any size.', real: 'Some species breed while still juvenile in body.' },
};
export const PART_IDS = Object.keys(PARTS) as PartId[];

export type NodeId = 'mat' | 'buried' | 'shell' | 'carcass' | 'sponge' | 'bloom';
export const NODES: Record<NodeId, { name: string; food: number; real: string }> = {
  mat: { name: 'Microbial mat', food: 5, real: 'Mats carpeted the early seafloor.' },
  buried: { name: 'Buried food', food: 6, real: 'Burrowing opened the food in the sediment.' },
  shell: { name: 'Brachiopod bed', food: 9, real: 'Shelled filter feeders, common Cambrian prey.' },
  carcass: { name: 'Carcass', food: 14, real: 'Big meals for big bodies.' },
  sponge: { name: 'Sponge garden', food: 9, real: 'Vauxia and other Burgess Shale sponges.' },
  bloom: { name: 'Sulfur mat', food: 7, real: 'Rich bacterial mats grow where oxygen is low.' },
};

export type Terrain = 'sand' | 'mud' | 'rock' | 'dead';
export const TERRAIN: Record<Terrain, string> = {
  sand: 'Open sand', mud: 'Mud', rock: 'Rock', dead: 'Dead water: costs 1 oxygen a turn, and the predator will not enter',
};
