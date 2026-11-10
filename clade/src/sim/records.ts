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
export type Ranks = Partial<Record<PartId, number>>; // lean ranks, capped at the part's upkeep

export interface Recipe { from: CladeId; parts: PartId[]; tier: Letter }
export interface Clade {
  id: CladeId; parent: CladeId | null; chapter: number; gate: PartId[]; plan: PlanId;
  mechanic: Id; endpoint?: Recipe; debated?: boolean;
}
export interface Part {
  id: PartId; place: Place; pool: 'shared' | CladeId;
  family: 'feed' | 'guard' | 'brood' | 'move' | 'sense';
  upkeep: number; opens?: Food[]; defence?: DefenceKind; beats?: DefenceKind[]; verb?: VerbId; stamp: Id;
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
}

export interface Stats { bite: number; thrift: number; defence: number; speed: number; senses: number; brood: number }
export interface Slot {
  id: Food; foods: Food[]; name: string; role: 'grazer' | 'burrower'; accent: number; capacity: number;
}
export interface Fitness {
  intake: number; upkeep: number; survival: number; value: number; letter: Letter;
  reasons: [string, string, string];
}
