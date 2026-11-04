// The light grid: one truth for shade. 20 px cells over the sky (row 0 at the ground). The sun is fixed per plot;
// each leaf darkens its own cell a little and every cell beyond it along the sun's direction. The saplings and the
// patch's natives all write into it; each leaf reads its cell, and the view draws the same grid. No DOM.
import { CELL, COLS, GROUND, LIGHT, SKY_ROWS, W, type Neighbour } from '../../data/run';

export interface Light {
  sun: number; // the sun's angle from straight up (rad); > 0: the sun is on the right
  dx: number; dy: number; // the way light travels (screen coordinates, y down)
  depth: Float32Array; // shade per cell; light = e^−depth
}

export function newLight(sun: number): Light {
  return { sun, dx: -Math.sin(sun), dy: Math.cos(sun), depth: new Float32Array(COLS * SKY_ROWS) };
}

export const skyCell = (x: number, y: number) => {
  const c = Math.floor(x / CELL), r = Math.floor((GROUND - y) / CELL);
  return c < 0 || c >= COLS || r < 0 || r >= SKY_ROWS ? -1 : r * COLS + c;
};

/** Shade `d` from a point: LIGHT.own × d in its own cell, d in each cell beyond it along the sun, down to the ground. */
export function cast(L: Light, x: number, y: number, d: number) {
  let last = skyCell(x, y);
  if (last < 0) return;
  L.depth[last] += d * LIGHT.own;
  const step = CELL / 2;
  for (let k = 0; k < 120; k++) {
    x += L.dx * step; y += L.dy * step;
    if (y > GROUND || x < 0 || x >= W) return;
    const c = skyCell(x, y);
    if (c >= 0 && c !== last) { L.depth[c] += d; last = c; }
  }
}

/** The light in a cell, 0–1. */
export const lightAt = (L: Light, x: number, y: number) => {
  const c = skyCell(x, y);
  return c < 0 ? 1 : Math.exp(-L.depth[c]);
};

/** A native's crown: points every half cell in an ellipse, together as dense as the native (its column's total). */
export function castCrown(L: Light, nb: Neighbour, grow: number) {
  const h = nb.h * grow, top = GROUND - h, bottom = GROUND - h * (1 - LIGHT.crown[nb.kind]) - 1;
  const cy = (top + bottom) / 2, ry = Math.max(1, (bottom - top) / 2), rx = nb.w / 2, step = CELL / 2;
  const rows = Math.max(1, Math.round((bottom - top) / step)), d = -Math.log(1 - Math.min(0.95, nb.density)) / rows;
  for (let x = nb.x - rx + step / 2; x < nb.x + rx; x += step)
    for (let y = top + step / 2; y <= bottom; y += step)
      if (rows === 1 || ((x - nb.x) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.05) cast(L, x, y, d);
}

/** Leaves as (x, y, size): a plant's living leafed shoots. */
export interface Leafy { x: number; y: number; leaf: number; dead: boolean; kind: string; len: number }

/** Rebuild the grid from the natives' crowns and every plant's leaves. */
export function buildLight(L: Light, natives: Neighbour[], grow: number, plants: { nodes: Leafy[] }[]) {
  L.depth.fill(0);
  for (const nb of natives) castCrown(L, nb, grow);
  for (const p of plants)
    for (const n of p.nodes) if (!n.dead && n.kind === 'shoot' && n.leaf > 0 && n.len > 0) cast(L, n.x, n.y, n.leaf * LIGHT.leaf);
}
