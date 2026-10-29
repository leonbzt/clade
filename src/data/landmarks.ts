// Landmarks: named places with fixed effects. Island making places them by seed; the sim only reads the base values
// and statuses they leave behind, so it never needs code per landmark. Effects fade with distance:
// [value, reach] gives the value on the landmark's tiles and falls to 0 just past `reach` tiles.
import type { LayerId, StatusId } from './fields';

export type LandmarkKind = 'vent' | 'spring' | 'beach' | 'cave';
export type Effect = readonly [value: number, reach: number];

export type LandmarkDef = {
  name: string;
  count: readonly [number, number]; // how many per island, from–to
  effects: Partial<Record<LayerId | StatusId, Effect>>; // layers set the island's base value; statuses set the status
  soilCap?: number; // on its own tiles
  area: { reach: number; word: string }; // its region: tiles within `reach` (rough edges), named "<name> <word>"
  names: string[]; // picked by seed
  blurb: string;
};

export const LANDMARKS: Record<LandmarkKind, LandmarkDef> = {
  vent: {
    name: 'Steam vent', count: [3, 4], effects: { water: [1, 11] }, area: { reach: 6, word: 'field' },
    names: ['Hissing Vent', 'Ash Vent', 'Sulphur Vent', 'Old Vent', 'Ember Vent'],
    blurb: 'Steam keeps the rock around it damp. Now and then it flares and clears a patch.',
  },
  spring: {
    name: 'Spring', count: [2, 3], effects: { water: [0.85, 3] }, area: { reach: 3, word: 'banks' },
    names: ['Clear Spring', 'Cold Spring', 'Moss Spring', 'Hidden Spring'],
    blurb: 'Fresh water seeps out and trickles toward the sea as a small stream.',
  },
  beach: {
    name: 'Beach', count: [2, 4], effects: { water: [0.45, 0], salty: [1, 1] }, soilCap: 0.35, area: { reach: 2, word: 'shore' },
    names: ['Black Sand Beach', 'Long Beach', 'Shell Beach', 'Pebble Beach'],
    blurb: 'Sand holds only thin soil, and salt spray reaches a little inland.',
  },
  cave: {
    name: 'Lava tube', count: [2, 3], effects: { shade: [0.55, 1], water: [0.32, 1] }, area: { reach: 3, word: 'mouth' },
    names: ['Dripping Tube', 'Echo Tube', 'Long Tube', 'Fern Tube'],
    blurb: 'A tunnel left by flowing lava. Its roof keeps steady shade and damp; holes let light in.',
  },
};
