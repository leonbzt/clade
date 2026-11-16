// N1's stored records. Slots, stats and fitness are return types only; none belongs in World.
import type { Habitat } from './habitats';

export type Id = string;
export type CladeId = 'cell' | 'worm' | 'arthropod' | 'trilobite' | 'swimmer';
export type PlanId = CladeId;
export type PartId = 'claw' | 'shield' | 'eye' | 'spine' | 'leg' | 'digger' | 'gill' | 'gut' | 'pouch'
  | 'proboscis' | 'rake' | 'tentacles' | 'bulb' | 'arms' | 'spikes' | 'lenses' | 'flap' | 'fan'
  | 'chaetae' | 'sclerite' | 'compound' | 'enrol' | 'blood' | 'hook' | 'deep' | 'symbiont' | 'progenesis';
export type Place = 'front' | 'eyes' | 'limbs' | 'sides' | 'back' | 'tail';
export type Food = 'mats' | 'detritus';
export type DefenceKind = 'armour' | 'spines' | 'burrow';
export type VerbId = 'graze' | 'dash' | 'dig' | 'sense' | 'brace' | 'crush';
export type Letter = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
export type Ranks = Partial<Record<PartId, number>>; // line ranks cap at 3; lean savings floor each part's upkeep at 0

export interface Recipe { from: CladeId; parts: PartId[]; tier: Letter }
export interface Clade {
  id: CladeId; parent: CladeId | null; chapter: number; gate: PartId[]; plan: PlanId;
  mechanic: Id; endpoint?: Recipe; debated?: boolean;
}
export interface Part {
  id: PartId; place: Place; pool: 'shared' | CladeId;
  family: 'feed' | 'guard' | 'brood' | 'move' | 'sense';
  upkeep: number; opens?: Food[]; defence?: DefenceKind; beats?: DefenceKind[]; hunts?: boolean; verb?: VerbId; stamp: Id;
  name: string; does: string; rare?: boolean;
  // Keep all old places/pools in the one table, including parts with several homes and variant-only diggers.
  plans: PlanId[]; homes: [PlanId[], Place[]][];
}
export interface Build {
  clade: CladeId; parts: Partial<Record<Place, PartId>>; genes: { size: number; gut: number };
}
export interface Species {
  id: Id; lineage: Id | null; parent: Id | null; build: Build; name: string; born: number;
}
export interface Lineage { id: Id; clade: CladeId; xp: number; ranks: Ranks; job: Id }
export interface World {
  seed: number; generation: number; habitats: Habitat[]; species: Species[]; lineages: Lineage[];
  /** The cells you have won, as `cellKey`s: a choice, never derived (law 2). Your species spread only into these. */
  claimed: string[];
  /** The generations each open cell has waited for a wild cousin, by `cellKey`: a timer. */
  bars: Record<string, number>;
}

export interface Stats { bite: number; thrift: number; defence: number; speed: number; senses: number; brood: number }
export type SlotId = Food | 'prey';
/** One prey population as the hunt slot sees it: grams here, body size and its defences. */
export interface Prey { id: Id; grams: number; size: number; guards: DefenceKind[] }
export interface Slot {
  id: SlotId; foods: Food[]; name: string; role: 'grazer' | 'burrower' | 'hunter'; accent: number; capacity: number;
  prey?: Prey[]; // the hunt slot only: its food is these populations, so no new stock
}
export interface Fitness {
  // intake and value read today's food (the sea's growth rate); full and letter rank the build at full food.
  intake: number; full: number; upkeep: number; survival: number; value: number; letter: Letter;
  reasons: [string, string, string];
}
