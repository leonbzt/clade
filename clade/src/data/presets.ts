// N1 dev scenarios, data only. Each group starts together; different groups start apart.
import type { Depth, Substrate } from './ground';
import type { Ranks } from '../sim/records';

export const PRESETS: {
  id: string; name: string; xp: number; ranks: Ranks; generations: number;
  groups: { species: string[]; heads: number; depth?: Depth; substrate?: Substrate }[];
}[] = [
  { id: 'empty', name: 'Empty sea', xp: 0, ranks: {}, generations: 0, groups: [] },
  { id: 'first-worm', name: 'First worm', xp: 0, ranks: {}, generations: 0,
    groups: [{ species: ['root-worm'], heads: 20, depth: 'shallows' }] },
  { id: 'three-worms', name: 'Three worms', xp: 0, ranks: {}, generations: 0, groups: [
    { species: ['tentacle-worm'], heads: 20 },
    { species: ['bulb-worm'], heads: 20 },
    { species: ['sclerite-worm'], heads: 20 },
  ] },
  { id: 'rivals', name: 'Rivals', xp: 0, ranks: {}, generations: 0,
    groups: [{ species: ['tentacle-worm', 'root-worm'], heads: 20, depth: 'shallows', substrate: 'sand' }] }, // B against C on sand; the arthropod returns with N4's armour
  { id: 'midgame', name: 'Midgame', xp: 60, ranks: { tentacles: 1 }, generations: 100, groups: [ // level 2 funds its existing rank
    { species: ['tentacle-worm'], heads: 20 },
    { species: ['bulb-worm'], heads: 20 },
    { species: ['tentacle-worm'], heads: 20 },
    { species: ['bulb-worm'], heads: 20 },
    { species: ['sclerite-worm'], heads: 20 },
  ] },
];
