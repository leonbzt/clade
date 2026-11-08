// Slice 20B: how each body looks, ported from toys/creature-data.ts. Shape only: nothing here grants anything. A look is
// a spine (joints, length, half-width along it), a skin, a gait and where its six places sit. Lengths are in tiles.
import type { PlanId } from './life';

export type GaitId = 'ripple' | 'legs' | 'flaps';
export type Span = [number, number]; // base + per size

export interface Head { len: number; wide: number; facets: number; pale?: number; genal?: boolean; antennae?: boolean }
export interface Look {
  gait: GaitId; skin: 'bead' | 'ridge'; lift: number; tint: number; // tint: how much of the body's own ramp shows under yours
  joints: Span; len: Span; R: Span; width: [number, number][]; bend: number; turn: number;
  ridge?: number; plates?: Span; seams?: boolean; lobes?: boolean; head?: Head;
  limbs: { n: Span; f: Span; k: number }; // how many rows a limb place draws, and where along the body
  sides: { n: Span; f: Span }; // the same for side parts
  bare: { eyes?: 'dot'; tail?: 'stub' | 'plate' | 'fan' }; // drawn while that place is empty: shape, no effect
}

export const LOOKS: Record<PlanId, Look> = {
  worm: {
    gait: 'ripple', skin: 'bead', lift: 2.5, tint: 0.18,
    joints: [4, 2], len: [0.42, 0.11], R: [0.12, 0.024], width: [[0, 0.92], [0.14, 1], [1, 0.58]], bend: 7, turn: 40,
    limbs: { n: [2, 1], f: [0.2, 0.85], k: 0.7 }, sides: { n: [1, 0.5], f: [0.25, 0.8] }, bare: {},
  },
  arthropod: {
    gait: 'legs', skin: 'ridge', lift: 4, tint: 0.18, ridge: 4, plates: [2, 1], seams: true,
    joints: [5, 0], len: [0.6, 0.108], R: [0.24, 0.036], width: [[0, 0.75], [0.3, 1.02], [1, 0.39]], bend: 0, turn: 18,
    head: { len: 0.3, wide: 1.05, facets: 8, antennae: true },
    limbs: { n: [3, 1], f: [0.3, 0.84], k: 0.72 }, sides: { n: [1, 0.5], f: [0.4, 0.8] }, bare: { eyes: 'dot', tail: 'stub' },
  },
  trilobite: {
    gait: 'legs', skin: 'ridge', lift: 4, tint: 0.3, ridge: 4, plates: [3, 1], seams: true, lobes: true,
    joints: [5, 0], len: [0.55, 0.1], R: [0.264, 0.036], width: [[0, 0.75], [0.3, 1.02], [0.86, 0.5], [1, 0.34]], bend: 0, turn: 18,
    head: { len: 0.3, wide: 1.05, facets: 8, antennae: true },
    limbs: { n: [3, 1], f: [0.32, 0.8], k: 0.5 }, sides: { n: [1, 0.5], f: [0.4, 0.78] }, bare: { eyes: 'dot', tail: 'plate' },
  },
  swimmer: {
    gait: 'flaps', skin: 'ridge', lift: 9, tint: 0.3, ridge: 5, plates: [8, 0],
    joints: [7, 0], len: [0.74, 0.079], R: [0.127, 0.0134], bend: 0.7, turn: 12,
    width: [[0, 0.48], [0.074, 0.96], [0.167, 1], [0.24, 0.78], [0.37, 0.87], [0.52, 0.87], [0.67, 0.78], [0.81, 0.65], [0.93, 0.48], [1, 0.3]],
    head: { len: 0.13, wide: 0.78, facets: 2, pale: 0.15 },
    limbs: { n: [6, 1], f: [0.28, 0.9], k: 1 }, sides: { n: [1, 0.5], f: [0.35, 0.75] }, bare: { eyes: 'dot', tail: 'fan' },
  },
};
/** The head shield part (`shield` on Back) widens the head and adds corner spines. */
export const SHIELD_HEAD = { wide: 1.22, pale: 0.35 };
export const spanAt = (s: number | Span, size: number) => (typeof s === 'number' ? s : Math.max(1, Math.round(s[0] + s[1] * size)));
