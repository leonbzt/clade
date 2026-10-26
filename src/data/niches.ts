// Niches the first species can be released into, and how traits fit them.
import type { TraitId } from './traits';

export type NicheId = 'lava' | 'beach';
export type Tier = 'bronze' | 'silver' | 'gold';
export const TIERS: Tier[] = ['bronze', 'silver', 'gold'];

export interface NicheDef {
  id: NicheId;
  name: string;
  note: string; // shown next to the fit
  weights: Partial<Record<TraitId, number>>; // fit score from each common trait
  silverAt: number;
  goldAt: number;
  share: Record<Tier, number>; // share of the niche's area the garden fills at each tier
  mult: Record<Tier, number>; // biomass multiplier at each tier
}

export const NICHES: NicheDef[] = [
  {
    id: 'lava',
    name: 'Lava field',
    note: 'dry, bare rock',
    weights: { rhizoids: 1, dryingOut: 1.5, capsule: 0.5, tufts: 1, creeping: 0.5, hairPoints: 1, leafyShoot: 1 },
    silverAt: 2.5,
    goldAt: 5,
    share: { bronze: 0.15, silver: 0.3, gold: 0.45 },
    mult: { bronze: 1, silver: 1.6, gold: 2.2 },
  },
  {
    id: 'beach',
    name: 'Black sand beach',
    note: 'salt spray: a poor fit',
    weights: { capsule: 0.5, tufts: 0.5, creeping: 0.5, leafyShoot: 0.5 },
    silverAt: 2.5,
    goldAt: 5,
    share: { bronze: 0.1, silver: 0.18, gold: 0.25 },
    mult: { bronze: 0.2, silver: 0.4, gold: 0.6 },
  },
];

export const HOME = {
  niche: 'lava' as NicheId,
  name: 'Steam vent',
  description: 'warm and damp at the centre, dry lava around',
};
