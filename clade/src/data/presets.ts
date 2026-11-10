// N1 dev scenarios, data only. Each group starts together; different groups start apart.
import type { Depth, Substrate } from './ground';
import type { Ranks } from '../sim/records';

export const PRESETS: {
  id: string; name: string; ranks: Ranks; generations: number;
  groups: { species: string[]; heads: number; depth?: Depth; substrate?: Substrate }[];
}[] = [
  { id: 'empty', name: 'Empty sea', ranks: {}, generations: 0, groups: [] },
  { id: 'first-worm', name: 'First worm', ranks: {}, generations: 0,
    groups: [{ species: ['root-worm'], heads: 20, depth: 'shallows' }] },
  { id: 'three-worms', name: 'Three worms', ranks: {}, generations: 0, groups: [
    { species: ['tentacle-worm'], heads: 20 },
    { species: ['bulb-worm'], heads: 20 },
    { species: ['sclerite-worm'], heads: 20 },
  ] },
  { id: 'rivals', name: 'Rivals', ranks: {}, generations: 0,
    groups: [{ species: ['tentacle-worm', 'arthropod'], heads: 20, depth: 'shallows', substrate: 'sand' }] },
  { id: 'midgame', name: 'Midgame', ranks: { tentacles: 1 }, generations: 100, groups: [
    { species: ['tentacle-worm'], heads: 20 },
    { species: ['bulb-worm'], heads: 20 },
    { species: ['tentacle-worm'], heads: 20 },
    { species: ['bulb-worm'], heads: 20 },
    { species: ['sclerite-worm'], heads: 20 },
  ] },
];
