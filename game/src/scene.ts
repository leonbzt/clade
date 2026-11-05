// The board's shared pieces, built once by main and used by the playback and the input.
import type { Application } from 'pixi.js';
import { COLS, type NodeId } from './data/life';
import type { PreyKind } from './data/prey';
import type { Life } from './sim/life';
import type { Hud } from './ui/hud';
import type { Camera } from './view/camera';
import type { Floor } from './view/floor';
import type { Fx } from './view/fx';
import type { Hunter } from './view/hunter';
import type { Marks } from './view/marks';
import { C, PAL, type Ramp } from './view/shade';
import type { Creature, Worm } from './view/worm';

export interface PreyView { kind: PreyKind; body: Creature; visible: boolean }
export const S = {} as {
  app: Application; floor: Floor; fx: Fx; marks: Marks; cam: Camera; hud: Hud; hunter: Hunter;
  you: Creature; rival: Worm; prey: PreyView[]; life: Life; busy: boolean;
};

export const NODE_RAMP: Record<NodeId, Ramp> = { mat: PAL.leaf, buried: PAL.amber, shell: PAL.shell, carcass: PAL.flesh, bloom: PAL.bloom };
export const RED = '#ff6a4c', GOLD = '#ffd75e', CYAN = '#9fe3ff';
export const centre = (i: number) => ({ x: (i % COLS) * C + C / 2, y: Math.floor(i / COLS) * C + C / 2 });
export const dirAngle = (d: number) => ((d - 1) * Math.PI) / 2; // east is 0
export const turnTo = (from: number, to: number) => from + ((((to - from + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
export const screen = (w: { x: number; y: number }) => S.cam.toScreen(w.x, w.y);
