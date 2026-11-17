// The kit toy (B0 round two, 17 Nov): a clade's tree as data rows, and the numbers of a Life in kit mode.
// CONTRACT: the shapes change only on the user's call. Every node, rung and number is a first cut (*proposal*),
// tuned by play. The rules are in docs/slices/b0r2-the-kit-toy.md and tests/kit.test.ts, tests/kit-rules.test.ts.
// A node adds stats and nothing else: no rule reads a node by name. A part sits on its place (PARTS[id].place),
// is drawn there and brings its verb (PARTS[id].verb); a trait has no place. Two parts on one place: either/or.
import type { NodeId } from './life';
import type { PartId, Place, Stats } from '../sim/records';

export type StatId = keyof Stats;
export const STAT_NAMES: Record<StatId, string> = {
  bite: 'Bite', thrift: 'Thrift', defence: 'Defence', speed: 'Speed', senses: 'Senses', brood: 'Brood',
};
/** What a stat does in a Life, for the body screen. */
export const STAT_DOES: Record<StatId, string> = {
  bite: 'Opens tougher food and works it faster.', thrift: 'Food from every meal.',
  defence: 'A strike no stronger than this glances off.', speed: 'Tiles a move, and tunnel length.',
  senses: 'How far you see hidden food.', brood: 'Eggs each lay.',
};

/** One branch a dial the clade shows (direction §5). From B1 the branch you spent most in steers the clutch. */
export type Branch = 'feed' | 'burrow' | 'spawn';
export const BRANCHES: Record<Branch, { name: string; life: string }> = {
  feed: { name: 'Feed', life: 'A feeder’s Life' },
  burrow: { name: 'Burrow', life: 'A burrower’s Life' },
  spawn: { name: 'Spawn', life: 'A spawner’s Life' },
};

export type TraitId = 'venom' | 'epitoky';
export type KitId = PartId | TraitId;

/** One step of a node's ladder. The first rung is growing the node; a point climbs one rung. */
export interface Rung { name: string; adds: Partial<Stats> }
/** `level`: the line level that opens the node. `needs`: any one of them grown. `rare`: seldom offered, never planned. */
export type KitNode = { branch: Branch; level: number; rare?: true; needs?: readonly KitId[]; rungs: readonly Rung[] }
  & ({ kind: 'part'; id: PartId } | { kind: 'trait'; id: TraitId });

/** What a Life in kit mode carries. */
export interface KitState {
  level: number; // the line's level this Life: opens nodes and caps rungs
  plan: PartId[]; // the parts chosen before the Life: always growable, never on offer
  points: number; bought: number;
  grown: Place[]; // the places with a part, oldest first (a shed takes the newest)
  order: KitId[]; // every node grown, parts and traits, oldest first
  rungs: Partial<Record<KitId, number>>; // rungs climbed (1: grown)
  offer: KitId[]; // the nodes on offer now; a moult replaces them
  offers: number; // offers rolled so far (it seeds the next)
  task: number | null; // the tile you are walking to or working, or null
}

/** What the toy keeps between Lives (the line's side of the mix, P62 m). */
export interface KitProgress { eggs: number; best: Record<string, number>; plan: PartId[] }

/** A food asks for a stat and takes work: one action adds your stat to the tile's work. */
export interface Gate { stat: StatId; min: number; work: number }
export const GATES: Record<NodeId, Gate> = {
  mat: { stat: 'bite', min: 1, work: 3 },
  buried: { stat: 'bite', min: 1, work: 4 },
  shell: { stat: 'bite', min: 3, work: 6 },
  carcass: { stat: 'bite', min: 2, work: 10 },
};

export const KIT = {
  base: { bite: 1, thrift: 0, defence: 0, speed: 1, senses: 2, brood: 0 } satisfies Stats, // the bare worm
  birthPoints: 1, moultPoints: 1,
  pointCosts: [3, 5, 7, 9, 11], // food for each bought point across the Life
  offerSize: 3, rareWeight: 0.2, // a rare node's chance against a common one's 1; one rare an offer at most
  levelEggs: [0, 12, 40, 90], // eggs laid over all Lives to stand at level 1, 2, 3, 4 (the toy's line XP)
  planSlots: [1, 2, 2, 3], // parts planned before a Life, by level
  rungCap: [2, 3, 3, 3], // the highest rung a point reaches, by level
  season: 60, upkeepEvery: 3, regrow: 12, // turns: a kit Life is three times as long, with the same upkeep in all
  strike: 2, // the hunter's force: a defence this high blocks it
  crushBite: 2, // Crush works with this much more bite
  beatMs: 600, // the steady beat a task runs at
  budget: { slots: 6, parts: 12, rungs: 3, traits: 2 }, // a clade's tree at most (*decided 17 Nov* for the Life's side)
};

export const SLOT_NAMES: Record<Place, string> = {
  front: 'Front', eyes: 'Head', limbs: 'Limbs', sides: 'Sides', back: 'Back', tail: 'Tail',
};

// The worm (an errant polychaete). Names are real features, drafted from memory: none is researched yet.
export const WORM_KIT: readonly KitNode[] = [
  // front
  { kind: 'part', id: 'tentacles', branch: 'feed', level: 1, rungs: [
    { name: 'Tentacles', adds: { bite: 1 } }, { name: 'Feeding palps', adds: { thrift: 1 } },
    { name: 'Ciliated crown', adds: { bite: 1, thrift: 1 } }] },
  { kind: 'part', id: 'proboscis', branch: 'feed', level: 1, rungs: [
    { name: 'Proboscis', adds: { bite: 1 } }, { name: 'Jawed proboscis', adds: { bite: 2 } },
    { name: 'Copper jaws', adds: { bite: 2 } }] },
  { kind: 'part', id: 'hook', branch: 'feed', level: 3, rare: true, rungs: [{ name: 'Hooked proboscis', adds: { bite: 4 } }] },
  // head
  { kind: 'part', id: 'eye', branch: 'feed', level: 1, rungs: [
    { name: 'Eyespots', adds: { senses: 2 } }, { name: 'Cup eyes', adds: { senses: 2 } },
    { name: 'Lensed eyes', adds: { senses: 3 } }] },
  // sides
  { kind: 'part', id: 'chaetae', branch: 'burrow', level: 1, rungs: [
    { name: 'Bristles', adds: { speed: 1 } }, { name: 'Paddle feet', adds: { speed: 1 } },
    { name: 'Swimming paddles', adds: { speed: 1 } }] },
  { kind: 'part', id: 'sclerite', branch: 'burrow', level: 2, rungs: [
    { name: 'Sclerites', adds: { defence: 1 } }, { name: 'Scale rows', adds: { defence: 1 } },
    { name: 'Overlapping scales', adds: { defence: 2 } }] },
  // back
  { kind: 'part', id: 'gut', branch: 'feed', level: 1, needs: ['tentacles', 'proboscis'], rungs: [
    { name: 'Gut gland', adds: { thrift: 1 } }, { name: 'Long gut', adds: { thrift: 1 } },
    { name: 'Gizzard', adds: { thrift: 1, bite: 1 } }] },
  { kind: 'part', id: 'symbiont', branch: 'feed', level: 3, rare: true, rungs: [{ name: 'Sulfur symbionts', adds: { thrift: 3 } }] },
  { kind: 'part', id: 'progenesis', branch: 'spawn', level: 4, rare: true, rungs: [{ name: 'Progenesis', adds: { brood: 2 } }] },
  // tail
  { kind: 'part', id: 'bulb', branch: 'burrow', level: 1, rungs: [
    { name: 'Burrowing bulb', adds: { defence: 1 } }, { name: 'Muscular bulb', adds: { speed: 1 } },
    { name: 'Anchor bulb', adds: { defence: 1 } }] },
  { kind: 'part', id: 'pouch', branch: 'spawn', level: 2, rungs: [
    { name: 'Brood pouch', adds: { brood: 2 } }, { name: 'Brood chambers', adds: { brood: 2 } },
    { name: 'Brooding tube', adds: { brood: 3 } }] },
  { kind: 'part', id: 'deep', branch: 'burrow', level: 3, rare: true, rungs: [{ name: 'Deep burrow', adds: { defence: 2, brood: 1 } }] },
  // traits: no place
  { kind: 'trait', id: 'venom', branch: 'feed', level: 2, needs: ['proboscis', 'hook'], rungs: [
    { name: 'Jaw venom', adds: { bite: 1 } }, { name: 'Paralysing venom', adds: { bite: 2 } },
    { name: 'Tissue-dissolving venom', adds: { bite: 2, thrift: 1 } }] },
  { kind: 'trait', id: 'epitoky', branch: 'spawn', level: 3, rungs: [
    { name: 'Yolky eggs', adds: { brood: 1 } }, { name: 'Spawning form', adds: { brood: 2 } },
    { name: 'Swarm spawning', adds: { brood: 3 } }] },
];
