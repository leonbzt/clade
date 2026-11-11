// The palette: the only file with colour values. Everything else uses colours by index, through the ramps below.
// Ramps run dark → light. Ground is muted; the four feeding accents are saturated. Red is reserved for danger, gold
// for yours. One light, from the top left, in three tones (`shade`). Started from game/'s tuned ramps (view/shade.ts).

const ENTRIES = [
  // UI
  ['ink', 0x15110d], ['panel', 0x2a241c], ['dim', 0xa89c8a], ['paper', 0xede4cb],
  // Sea floor, deep edge → tide flat: the substrate seen through more and more water
  ['sandDeep', 0x314745], ['sandSlope', 0x577063], ['sandShallow', 0x869c7a], ['sandFlat', 0xbba571],
  ['mudDeep', 0x1f3539], ['mudSlope', 0x354d4b], ['mudShallow', 0x4e6354], ['mudFlat', 0x614a33],
  ['rockDeep', 0x1e3943], ['rockSlope', 0x32555f], ['rockShallow', 0x4a7074], ['rockFlat', 0x6a8380],
  ['open', 0x0b2730], ['line', 0x07161c], // open sea past the deep edge; habitat borders
  // Land (three tones each where the light falls on slopes)
  ['lava0', 0x24262a], ['lava1', 0x33363b], ['lava2', 0x464a50],
  ['bare0', 0x38352d], ['bare1', 0x4c483d], ['bare2', 0x655f50],
  ['forest0', 0x233418], ['forest1', 0x37501f], ['forest2', 0x506e2a],
  ['beach', 0xd8c28a], ['vent', 0x6b3f2a],
  // Accents: how a creature feeds; danger; yours
  ['green', 0x7cc43f], ['brown', 0xa0682f], ['red', 0xe5462c], ['blue', 0x4f9be0],
  ['goldDark', 0xb8862a], ['gold', 0xffd34a],
] as const;

export type ColorName = (typeof ENTRIES)[number][0];
export const COLORS: readonly number[] = ENTRIES.map((e) => e[1]);
export const P = Object.fromEntries(ENTRIES.map((e, i) => [e[0], i])) as Record<ColorName, number>;

/** Ramps of palette indices, dark → light. */
export const RAMPS = {
  ui: [P.ink, P.panel, P.dim, P.paper],
  sand: [P.sandDeep, P.sandSlope, P.sandShallow, P.sandFlat], // by depth band, deep edge first
  mud: [P.mudDeep, P.mudSlope, P.mudShallow, P.mudFlat],
  rock: [P.rockDeep, P.rockSlope, P.rockShallow, P.rockFlat],
  sea: [P.line, P.open],
  lava: [P.lava0, P.lava1, P.lava2],
  bare: [P.bare0, P.bare1, P.bare2],
  forest: [P.forest0, P.forest1, P.forest2],
  wet: [P.bare0, P.mudFlat, P.bare1],
  beach: [P.sandFlat, P.beach, P.paper],
  vent: [P.lava0, P.vent, P.vent],
  gold: [P.goldDark, P.gold],
} as const;

/** The ground's ramps: muted, never red or gold (a test checks). */
export const GROUND_RAMPS = ['sand', 'mud', 'rock', 'sea', 'lava', 'bare', 'forest', 'wet', 'beach', 'vent'] as const;
/** The four feeding accents, saturated: green grazer, brown burrower, red hunter, blue filterer. */
export const ACCENT = { grazer: P.green, burrower: P.brown, hunter: P.red, filterer: P.blue };
/** Reserved: red means danger, gold means yours. */
export const RESERVED = { danger: [P.red], yours: [P.goldDark, P.gold] };

export const rgb = (i: number) => COLORS[i];
export const css = (i: number) => `#${COLORS[i].toString(16).padStart(6, '0')}`;

/** The one light, from the top left, in three tones. `rise` is how much higher a spot is than its neighbour toward
 *  the light: facing the light takes the light tone, facing away the dark, flat the middle. */
export function shade(ramp: readonly number[], rise: number): number {
  const mid = (ramp.length - 1) >> 1;
  return ramp[Math.max(0, Math.min(ramp.length - 1, mid + (rise > 0.25 ? 1 : rise < -0.25 ? -1 : 0)))];
}
