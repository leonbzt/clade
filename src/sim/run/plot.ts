// The run's plot: hidden soil, the neighbours from the garden patch, and the light. From the toy's world. No DOM.
import { CELL, COLS, GROUND, ROWS, T, type Neighbour, type PlotKind } from '../../data/run';
import { seeded, type Rng } from '../rng';

export type CellKind = 'loam' | 'hard' | 'stone' | 'water' | 'nutrient';
export interface Cell { kind: CellKind; amount: number; max: number; seen: boolean; hint: number }
export type Pt = { x: number; y: number };
export interface Plot {
  seed: number; kind: number; look: PlotKind; moisture: number; cells: Cell[]; neighbours: Neighbour[];
  grow: number; // the neighbours' size this season, 0.6 → 1
  zones: number[][]; // per neighbour: the pocket cells its roots drain
  roots: Pt[][]; // the neighbours' roots, for drawing
  dry: boolean; // a dry spell (moss goes dormant)
}

export const isPocket = (c: Cell) => c.kind === 'water' || c.kind === 'nutrient';
export const cellIndex = (x: number, y: number) => {
  const c = Math.floor(x / CELL), r = Math.floor((y - GROUND) / CELL);
  return c < 0 || c >= COLS || r < 0 || r >= ROWS ? -1 : r * COLS + c;
};
const cellCentre = (i: number): Pt => ({ x: (i % COLS) * CELL + CELL / 2, y: GROUND + Math.floor(i / COLS) * CELL + CELL / 2 });

export function makePlot(kind: number, look: PlotKind, moisture: number, neighbours: Neighbour[], seed: number): Plot {
  const rng = seeded(seed), s = look.soil, cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const depth = r / ROWS, x = rng();
    const water = s.water * (s.waterDeep ? 2.2 * depth : 1) * (0.6 + 0.4 * moisture / look.moisture), nutrient = s.nutrient * (1.3 - 0.6 * depth);
    let k: CellKind = 'loam';
    if (x < water) k = 'water';
    else if (x < water + nutrient) k = 'nutrient';
    else if (x < water + nutrient + s.stone * (0.6 + depth)) k = 'stone';
    else if (x < water + nutrient + s.stone * (0.6 + depth) + s.hard) k = 'hard';
    if (r === 0 && k === 'stone') k = 'hard';
    const [lo, hi] = k === 'water' ? T.pocketWaterAmt : T.pocketNutrientAmt;
    const max = k === 'water' || k === 'nutrient' ? lo + (hi - lo) * rng() : 0;
    cells.push({ kind: k, amount: max, max, seen: false, hint: 0 });
  }
  for (let i = 0; i < cells.length; i++) {
    let n = 0;
    eachNear(i, T.reveal, (k) => { if (k !== i && isPocket(cells[k])) n++; });
    cells[i].hint = n;
  }
  const zones = neighbours.map((nb) => cells.map((_, i) => i).filter((i) => isPocket(cells[i]) && inZone(nb, cellCentre(i))));
  const roots = neighbours.flatMap((nb) => neighbourRoots(nb, rng));
  return { seed, kind, look, moisture, cells, neighbours, grow: 0.6, zones, roots, dry: false };
}

const inZone = (nb: Neighbour, p: Pt) => ((p.x - nb.x) / nb.roots) ** 2 + ((p.y - GROUND) / nb.depth) ** 2 <= 1;

function neighbourRoots(nb: Neighbour, rng: Rng): Pt[][] {
  const out: Pt[][] = [];
  for (let k = 0; k < 4 + nb.roots / 30; k++) {
    let x = nb.x, y = GROUND, a = Math.PI / 2 + (rng() - 0.5) * 2.4;
    const line: Pt[] = [{ x, y }];
    for (let s = 0; s < 12; s++) {
      a += (rng() - 0.5) * 0.6;
      x += (Math.cos(a) * nb.roots) / 10; y += (Math.abs(Math.sin(a)) * nb.depth) / 10;
      if (!inZone(nb, { x, y })) break;
      line.push({ x, y });
    }
    out.push(line);
  }
  return out;
}

export function eachNear(i: number, r: number, f: (k: number) => void) {
  const c = i % COLS, row = Math.floor(i / COLS);
  for (let dr = -r; dr <= r; dr++) for (let dc = -r; dc <= r; dc++) {
    const rr = row + dr, cc = c + dc;
    if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) f(rr * COLS + cc);
  }
}

export function reveal(w: Plot, x: number, y: number) {
  const i = cellIndex(x, y);
  if (i >= 0) eachNear(i, T.reveal, (k) => (w.cells[k].seen = true));
}

/** Sky light at a point after the neighbours' crowns (own leaves are shaded in the plant). */
export function light(w: Plot, x: number, y: number): number {
  let l = 1;
  for (const nb of w.neighbours) if (Math.abs(x - nb.x) < nb.w / 2 && y > GROUND - nb.h * w.grow) l *= 1 - nb.density;
  return l;
}

/** Each tick: the neighbours grow toward full size by mid-season and drain the pockets in their root zones. */
export function plotTick(w: Plot, t: number, seasonTicks: number) {
  w.grow = Math.min(1, 0.6 + (0.4 * t) / (seasonTicks / 2));
  for (const zone of w.zones) for (const i of zone) {
    const c = w.cells[i];
    c.amount = Math.max(0, c.amount - (c.kind === 'water' ? T.neighbourDrain.water : T.neighbourDrain.nutrient));
  }
}

/** Between seasons: rain refills the water pockets; nutrient stays used up. */
export function rain(w: Plot) {
  for (const c of w.cells) if (c.kind === 'water') c.amount = c.max;
  w.grow = 0.6;
}

/** A copy for predictions: hidden cells count as plain loam (you only know what you've seen). */
export function knownCopy(w: Plot): Plot {
  const cells = w.cells.map((c) => (c.seen ? { ...c } : { kind: 'loam' as CellKind, amount: 0, max: 0, seen: true, hint: 0 }));
  return { ...w, cells, zones: w.zones.map((z) => z.filter((i) => isPocket(cells[i]))) };
}
