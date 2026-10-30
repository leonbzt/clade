// Habitats: the places the sim makes. Every tile gets one kind, by a test per kind checked in this order (the first
// that passes wins; open ground takes the rest). A tile changes kind only when the new test passes by `margin`, and it
// keeps its kind until its own test fails by `margin`, so edges don't flicker. A habitat is a region × a kind.
// Also here: the six loadout slots every habitat shows, and the words for sizes.
import type { RoleKind } from './roles';

/** What a kind's test reads on a tile: a layer, the salt, or 1 while a flare's scar is fresh. */
export type Measure = 'scar' | 'salty' | 'water' | 'shade' | 'soil';

export type HabitatKind = {
  id: string;
  name: string; // the kind, in the tile card and the readout
  noun: string; // "Fern forest": a plant word and this
  bare: string; // the name while no plant leads it
  test?: { on: Measure; min?: number; max?: number; margin: number };
  stream?: boolean; // a stream tile always passes
  quiet?: boolean; // its coming and going is chatter, not a headline (a scar follows every flare, which is news already)
};

export const HABITAT_KINDS: HabitatKind[] = [
  { id: 'scar', name: 'Vent scar', noun: 'scar', bare: 'Ash scar', test: { on: 'scar', min: 0.5, margin: 0 }, quiet: true },
  { id: 'spray', name: 'Spray coast', noun: 'cliff', bare: 'Windy cliff', test: { on: 'salty', min: 0.2, margin: 0.03 } },
  { id: 'wet', name: 'Wet seep', noun: 'stream', bare: 'Wet seep', test: { on: 'water', min: 0.6, margin: 0.04 }, stream: true },
  { id: 'dark', name: 'Dark floor', noun: 'forest', bare: 'Dark floor', test: { on: 'shade', min: 0.35, margin: 0.04 } },
  { id: 'bare', name: 'Bare rock', noun: 'barrens', bare: 'Bare rock', test: { on: 'soil', max: 0.08, margin: 0.015 } },
  { id: 'deep', name: 'Deep soil', noun: 'meadow', bare: 'Deep soil', test: { on: 'soil', min: 0.55, margin: 0.04 } },
  { id: 'open', name: 'Open ground', noun: 'heath', bare: 'Open ground' },
];

/** The plant word in a habitat's name, by the group that leads it. */
export const LEAD_WORD: Record<string, string> = {
  cyano: 'Crusted', thallus: 'Green', liverwort: 'Liverwort', moss: 'Mossy', lichen: 'Lichen', clubmoss: 'Club moss', fern: 'Fern',
};

/** The six loadout slots, always in this order: the three plant layers (their leads), then the animals (the role under
 * the slot with the most food made here). */
export type Gear = { id: string; name: string; glyph: string; plant: boolean; stratum?: string; kinds?: RoleKind[] };
export const GEAR: Gear[] = [
  { id: 'under', name: 'Under ground', glyph: '✱', plant: true, stratum: 'under' },
  { id: 'ground', name: 'Ground', glyph: '▲', plant: true, stratum: 'ground' },
  { id: 'herb', name: 'Herb layer', glyph: '♠', plant: true, stratum: 'herb' },
  { id: 'grazer', name: 'Grazer', glyph: '●', plant: false, kinds: ['graze'] },
  { id: 'recycler', name: 'Recycler', glyph: '≈', plant: false, kinds: ['litter', 'decompose'] },
  { id: 'hunter', name: 'Hunter', glyph: '◆', plant: false, kinds: ['hunt'] },
];

/** Size words, a factor of 10 apart: below the first step is tiny. Standing mass in g; flows in g/min. */
export const SIZE_WORDS = ['tiny', 'small', 'medium', 'large', 'huge'];
export const SIZE_STEPS = { stock: [100, 1000, 10_000, 100_000], flow: [1, 10, 100, 1000] };
