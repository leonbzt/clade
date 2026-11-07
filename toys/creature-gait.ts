// Toy 18: a gait is one small function. It gets where along the body (f, 0 head … 1 tail) and which side, and says how far
// that point sways sideways (off), how its limb swings (limb, -1 … 1) and how much the body swells there (swell).
import type { GaitId } from './creature-data';

export interface Beat { t: number; step: number; moving: number; joints: number }
export interface Pose { off: number; limb: number; swell: number }
export type Gait = (b: Beat, f: number, side: number, out: Pose) => void;

export const GAITS: Record<GaitId, Gait> = {
  ripple: (b, f, side, out) => {
    out.off = Math.sin(b.t * (3 + 5 * b.moving) - f * b.joints * 0.85) * (0.35 + 1.5 * b.moving) * (0.25 + f);
    out.limb = Math.sin(b.t * (2 + 5 * b.moving) - f * 7 + side);
    out.swell = 1;
  },
  legs: (b, f, side, out) => {
    out.off = 0;
    out.limb = Math.sin(b.step + f * 9 + (side > 0 ? Math.PI : 0));
    out.swell = 1;
  },
  flaps: (b, f, side, out) => {
    out.off = Math.sin(b.t * 2.6 - f * 3) * (0.2 + 0.7 * b.moving) * f;
    out.limb = Math.sin(b.t * (2 + 3.5 * b.moving) - f * 7) * (side ? 1 : 0);
    out.swell = 1;
  },
  creep: (b, f, side, out) => {
    out.off = 0;
    out.limb = Math.sin(b.t * 1.6 + f * 5 + side) * 0.35;
    out.swell = 1 + Math.sin(b.t * (1.4 + 3 * b.moving) - f * 6) * 0.035;
  },
};
