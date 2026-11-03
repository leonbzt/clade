// How things look: the island's palette and the map's scale. Colours only; no logic.
export const TILE_PX = 6; // map pixels per tile (a tile is 10 m)

export const PAL = {
  seaDeep: '#1b3a55', sea: '#24506f', shallow: '#3a7690', foam: '#9cc8d0',
  sand: '#d6c189', sandLight: '#e4d4a0', sandDark: '#b5a06c',
  lava: ['#2a2523', '#36302c', '#433a34'], lavaGlow: '#b8502a', crack: '#171312',
  bare: ['#6f604a', '#7d6d54', '#8b7b5f'], forest: ['#3d2f22', '#47372a', '#523f2e'], wet: ['#34503f', '#3d5d49', '#486a52'],
  stream: '#4f8db0', spring: '#8fd0e8',
  // the half-year: the wet half tints the land a little bluer and greener
  wetTint: [0.96, 1.03, 1.06] as const,
};

/** Cover noise per layer: blob size (px) and how a filled pixel is shaded. */
export const COVER = [
  { scale: 2.2, shade: [0.85, 1, 1.12], show: 0.6 }, // mat: fine speckle; a full mat still lets the ground show
  { scale: 3.5, shade: [0.8, 0.95, 1.1], show: 0.85 }, // herb: tufts
  { scale: 6, shade: [0.7, 0.9, 1.08], show: 1 }, // canopy: crowns
];
