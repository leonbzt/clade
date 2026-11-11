// The board's shared pieces, built once by main and used by the playback and the input.
import type { Application } from 'pixi.js';
import { COLS, type NodeId } from '../data/life';
import type { Life } from '../sim/life';
import type { Hud } from '../ui/life/hud';
import type { Camera } from './camera';
import type { Floor } from './floor';
import type { Fx } from './fx';
import type { Hunter } from './hunter';
import type { Marks } from './marks';
import { C, FEEDBACK, PAL, type Ramp } from './shade';
import type { Body } from './body';

export const S = {} as {
  app: Application; floor: Floor; fx: Fx; marks: Marks; cam: Camera; hud: Hud; hunter: Hunter;
  you: Body; rivals: Body[]; life: Life; busy: boolean;
};

export const NODE_RAMP: Record<NodeId, Ramp> = { mat: PAL.leaf, buried: PAL.amber, shell: PAL.shell, carcass: PAL.flesh };
export const RED = FEEDBACK.red, GOLD = FEEDBACK.gold, CYAN = FEEDBACK.cyan;
export const centre = (i: number) => ({ x: (i % COLS) * C + C / 2, y: Math.floor(i / COLS) * C + C / 2 });
export const dirAngle = (d: number) => ((d - 1) * Math.PI) / 2; // east is 0
export const turnTo = (from: number, to: number) => from + ((((to - from + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
export const screen = (w: { x: number; y: number }) => S.cam.toScreen(w.x, w.y);
/** Show the Life's current build on your body: a moult, a new part, a tear or a shed, and moult softness. */
export const dress = (b: Body, l: Life) => { b.setBuild(l); b.soft = l.soft; };
