// Toy C (slice 04): the body builder. The grid, the organ pieces (shapes, flows), the stats' scaling, each niche's
// ground and the end-of-round encounters. Scored by the real niche weights (src/data/niches.ts). Tuned by feel.

export const BW = 7, BH = 9, ABOVE = 5; // rows 0..ABOVE-1 above ground (height = ABOVE - row), the rest below
export const PICKS = 10, OFFERS = 3, REROLLS = 1;
export const BASE = { x: 3 }; // the seedling: a stem on the ground, a root under it

export type PieceId = 'leaf' | 'stem' | 'wood' | 'thorn' | 'flower' | 'root' | 'tuber';
export type Flow = { e: number; w: number; n: number };
export const PIECES: Record<PieceId, {
  name: string; below: boolean; weight: number; shapes: [number, number][][]; flow: Flow; help: string;
}> = {
  leaf: { name: 'Leaf', below: false, weight: 3, shapes: [[[0, 0]], [[0, 0], [1, 0]]], flow: { e: 2, w: -1, n: 0 },
    help: 'touches a stem or wood. Makes 2 energy in open sky, 1 less for each leaf, flower or wood above it; drinks 1 water' },
  stem: { name: 'Stem', below: false, weight: 2, shapes: [[[0, 0], [0, 1]], [[0, 0], [0, 1], [0, 2]], [[0, 0], [0, 1], [1, 1]]], flow: { e: 0, w: 0, n: 0 },
    help: 'touches a stem or wood. Free: it carries leaves, flowers and thorns, and adds height' },
  wood: { name: 'Wood', below: false, weight: 1, shapes: [[[0, 0], [0, 1]]], flow: { e: -1, w: 0, n: 0 },
    help: 'a stem that is tough: +1 toughness per cell, costs 1 energy per cell' },
  thorn: { name: 'Thorn', below: false, weight: 1, shapes: [[[0, 0]]], flow: { e: 0, w: 0, n: -1 },
    help: 'touches a stem or wood. Guards the leaves around it from a grazer; a little toughness; costs 1 nutrient' },
  flower: { name: 'Flower', below: false, weight: 1, shapes: [[[0, 0]]], flow: { e: -2, w: 0, n: -1 },
    help: 'touches a stem or wood. A body needs one to make seeds (no flower: tier F)' },
  root: { name: 'Root', below: true, weight: 2, shapes: [[[0, 0], [0, 1]], [[0, 0], [0, 1], [0, 2]], [[0, 0], [0, 1], [1, 1]]], flow: { e: -1, w: 2, n: 0 },
    help: 'touches a root. Draws 2 water per cell for 1 energy; deep cells (the bottom two rows) also give 1 nutrient' },
  tuber: { name: 'Tuber', below: true, weight: 1, shapes: [[[0, 0], [1, 0]]], flow: { e: -1, w: 0, n: 0 },
    help: 'touches a root. Stores water: +2 water per cell in a drought; a little toughness' },
};
export const DEEP_N = 1, DEEP_ROWS = 2; // nutrient per root cell in the bottom rows

/** Stat scaling: the raw value that counts as 1.0 (the run's STAT_SCALE, for this small grid). */
export const SCALE = { reach: ABOVE, cover: 5, rootCells: 5, depth: BH - ABOVE, toughness: 3, growth: 4, upkeep: 8 };
export const WILT = { perShort: 0.15, floor: 0.25 }; // the score × (1 − perShort per unit short), at least floor

/** The niches you can build for (the real ones, herb and canopy layers) and their ground. */
export const GROUND: Record<string, { light: number; rootW: number; note: string }> = {
  bareHerb: { light: 2, rootW: 0, note: 'Open and dry: full light, roots draw the usual 2.' },
  wetHerb: { light: 2, rootW: 1, note: 'Wet: roots draw 1 more water.' },
  forestHerb: { light: 1, rootW: 0, note: 'Under trees: a leaf makes at most 1 energy.' },
  forestCanopy: { light: 2, rootW: 0, note: 'Up in the wind: full light.' },
  wetCanopy: { light: 2, rootW: 1, note: 'Swamp: roots draw 1 more water.' },
};

export type EncounterId = 'drought' | 'grazer' | 'rival';
export const ENCOUNTERS: Record<EncounterId, { name: string; text: string; height: number }> = {
  drought: { name: 'A drought', text: 'Roots draw 1 less water per cell; each tuber cell gives 2.', height: 0 },
  grazer: { name: 'A grazer', text: 'Eats every leaf at height 1–2 unless a thorn is next to it (diagonals count).', height: 2 },
  rival: { name: 'A taller rival', text: 'Shades every leaf at height 1–3: 1 less energy each.', height: 3 },
};
