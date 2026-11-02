// Islands as data: sizes and themes for the one generator (island.ts), the seasons on run islands, and the run's
// numbers (its price, clock, broods and XP). Home is the `home` row with today's numbers, so home doesn't change.
// A theme is multipliers on today's knobs; landmark counts replace the landmark's own range (which a smaller island
// scales down by area).
import type { LandmarkKind } from './landmarks';

export type SizeId = 'home' | 'small' | 'medium';
export const SIZES: Record<SizeId, { w: number; h: number; name: string }> = {
  home: { w: 96, h: 56, name: 'home' },
  small: { w: 48, h: 28, name: 'small' },
  medium: { w: 64, h: 36, name: 'medium' },
};

export type ThemeId = 'home' | 'dry' | 'wet';
export type Theme = {
  id: ThemeId;
  name: string;
  hint: string; // one line on the offer
  rain: number; // × the water bare lava gets from the sky (its base and the wind's rain)
  crack: number; // × the share of cracked lava
  counts: Partial<Record<LandmarkKind, readonly [number, number]>>; // landmarks per island, from–to
};

export const THEMES: Record<ThemeId, Theme> = {
  home: { id: 'home', name: 'Home', hint: 'the old island', rain: 1, crack: 1, counts: {} },
  dry: { id: 'dry', name: 'Dry island', hint: 'little rain, cracked lava, one vent, a spring at most', rain: 0.5, crack: 2, counts: { spring: [0, 1], vent: [1, 1] } },
  wet: { id: 'wet', name: 'Wet island', hint: 'rain on the wind, three or four springs', rain: 1.5, crack: 1, counts: { spring: [3, 4] } },
};

/** The themes a run can go to, in offer order. */
export const RUN_THEMES: ThemeId[] = ['dry', 'wet'];

/** Run islands only: each season sets the island's moisture to its base × `wet` (eased over `RUN.ease` seconds). */
export const SEASONS = [
  { name: 'Wet season', short: 'wet', wet: 1.3 },
  { name: 'Mild season', short: 'mild', wet: 1 },
  { name: 'Dry season', short: 'dry', wet: 0.7 },
  { name: 'Mild season', short: 'mild', wet: 1 },
] as const;

export const RUN = {
  seasons: 8, // a run's length; four seasons make a year (≈ 8 min)
  season: 120, // seconds
  homeAfter: 4, // seasons before you can bring the line home
  ease: 20, // seconds for a season's swing to settle in
  cost: 14000, // biomass for the first run, × NUM.cost: affordable at ~10 min
  costGrowth: 1.5, // × per run made
  reach: 8, // tiles from the line where an heir can go
  ring: 3, // tiles around the line that a Steady card's fit counts
  good: 0.65, // fit words: good from here, okay from `okay`, poor below
  okay: 0.45,
  // XP: per heir still holding tiles a season later, per new shown variant, per key fired on the run (the line
  // becomes a new species), and per point of the island's land the line fit well at its best (the best fit).
  xp: { heir: 10, shown: 5, key: 60, fit: 100 },
  level: { first: 100, growth: 1.6 }, // XP from level L to L + 1: first × growth^(L − 1)
  wildTries: 12,
};
