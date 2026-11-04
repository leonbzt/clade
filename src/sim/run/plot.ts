// The run's plot: hidden soil with pockets in blobs (one rich), signs on the surface over the shallow ones, the
// natives from the garden patch, the fixed sun and the light grid. It carries over the run's years. No DOM.
import { CELL, COLS, GROUND, LIGHT, ROWS, T, type Neighbour, type PlotKind } from '../../data/run';
import { seeded, type Rng } from '../rng';
import { newLight, type Light } from './light';

export type CellKind = 'loam' | 'hard' | 'stone' | 'water' | 'nutrient';
export interface Cell { kind: CellKind; amount: number; max: number; seen: boolean }
export type Pt = { x: number; y: number };
/** A surface sign over a pocket: a damp patch (water), a greener tuft (nutrient), a stone poking out (stone in the top
 * rows), or the rich pocket's faint flower. `depth` 0–1: how deep it lies (deeper: fainter). */
export interface Sign { x: number; kind: 'damp' | 'tuft' | 'stone' | 'rich'; depth: number }
export interface Plot {
  seed: number; kind: number; look: PlotKind; moisture: number; cells: Cell[]; neighbours: Neighbour[];
  grow: number; // the natives' size this year, 0.6 → 1
  zones: number[][]; // per native: the pocket cells its roots drain
  roots: Pt[][]; // the natives' roots, for drawing
  dry: boolean; // a dry spell (moss goes dormant)
  rich: number; // the rich pocket's cell
  signs: Sign[];
  light: Light;
}

export const isPocket = (c: Cell) => c.kind === 'water' || c.kind === 'nutrient';
export const cellIndex = (x: number, y: number) => {
  const c = Math.floor(x / CELL), r = Math.floor((y - GROUND) / CELL);
  return c < 0 || c >= COLS || r < 0 || r >= ROWS ? -1 : r * COLS + c;
};
export const cellCentre = (i: number): Pt => ({ x: (i % COLS) * CELL + CELL / 2, y: GROUND + Math.floor(i / COLS) * CELL + CELL / 2 });

/** The cell and its neighbours within r. */
export function eachNear(i: number, r: number, f: (k: number) => void) {
  const c = i % COLS, row = Math.floor(i / COLS);
  for (let dr = -r; dr <= r; dr++) for (let dc = -r; dc <= r; dc++) {
    const rr = row + dr, cc = c + dc;
    if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) f(rr * COLS + cc);
  }
}

export function makePlot(kind: number, look: PlotKind, moisture: number, neighbours: Neighbour[], seed: number): Plot {
  const rng = seeded(seed), s = look.soil, N = COLS * ROWS, kinds: CellKind[] = [];
  for (let i = 0; i < N; i++) {
    const depth = Math.floor(i / COLS) / ROWS;
    kinds.push(rng() < s.hard * (0.7 + 0.6 * depth) ? 'hard' : 'loam');
  }
  const blobs: { kind: CellKind; cells: number[] }[] = [];
  const blob = (k: CellKind, size: number, r0: number, r1: number) => {
    for (let tries = 0; tries < 40; tries++) {
      const i0 = (r0 + Math.floor(rng() * (r1 - r0 + 1))) * COLS + Math.floor(rng() * COLS);
      let clear = kinds[i0] === 'loam' || kinds[i0] === 'hard';
      eachNear(i0, 1, (j) => { if (kinds[j] === 'water' || kinds[j] === 'nutrient' || (k === 'stone' && kinds[j] === 'stone')) clear = false; });
      if (!clear) continue;
      const got = [i0];
      kinds[i0] = k;
      for (let n = 0; n < 12 && got.length < size; n++) {
        const at = got[Math.floor(rng() * got.length)], c = at % COLS;
        const opts = [at - COLS, at + COLS, c > 0 ? at - 1 : -1, c < COLS - 1 ? at + 1 : -1]
          .filter((j) => j >= 0 && j < N && Math.floor(j / COLS) >= r0 && (kinds[j] === 'loam' || kinds[j] === 'hard'));
        if (!opts.length) continue;
        const j = opts[Math.floor(rng() * opts.length)];
        kinds[j] = k; got.push(j);
      }
      blobs.push({ kind: k, cells: got });
      return got;
    }
    return [];
  };
  const avg = (T.blob[0] + T.blob[1]) / 2, size = () => T.blob[0] + Math.floor(rng() * (T.blob[1] - T.blob[0] + 1));
  const count = (share: number, a = avg) => Math.round((share * N) / a);
  for (let k = count(s.stone, avg + 1); k > 0; k--) blob('stone', size() + 1, 1, ROWS - 1);
  for (let k = count(s.water * (0.6 + (0.4 * moisture) / look.moisture)); k > 0; k--) blob('water', size(), s.waterDeep ? 5 : 1, ROWS - 1);
  for (let k = count(s.nutrient); k > 0; k--) blob('nutrient', size(), 1, ROWS - 3);
  const rich = blob('nutrient', 1, 7, ROWS - 1)[0] ?? -1;
  const cells: Cell[] = kinds.map((k) => {
    const [lo, hi] = k === 'water' ? T.pocketWaterAmt : T.pocketNutrientAmt;
    const max = k === 'water' || k === 'nutrient' ? lo + (hi - lo) * rng() : 0;
    return { kind: k, amount: max, max, seen: false };
  });
  if (rich >= 0) cells[rich].amount = cells[rich].max = T.pocketNutrientAmt[1] * T.rich;
  const zones = neighbours.map((nb) => cells.map((_, i) => i).filter((i) => isPocket(cells[i]) && inZone(nb, cellCentre(i))));
  const roots = neighbours.flatMap((nb) => neighbourRoots(nb, rng));
  const sun = (rng() * 2 - 1) * LIGHT.sun;
  return { seed, kind, look, moisture, cells, neighbours, grow: 0.6, zones, roots, dry: false, rich, signs: signsOf(blobs, rich), light: newLight(sun) };
}

/** One sign per shallow pocket, over its shallowest cell; stones only near the top. */
function signsOf(blobs: { kind: CellKind; cells: number[] }[], rich: number): Sign[] {
  const out: Sign[] = [];
  for (const b of blobs) {
    const top = b.cells.reduce((a, i) => (Math.floor(i / COLS) < Math.floor(a / COLS) ? i : a), b.cells[0]), row = Math.floor(top / COLS);
    const x = (top % COLS) * CELL + CELL / 2;
    if (top === rich) out.push({ x, kind: 'rich', depth: row / ROWS });
    else if (b.kind === 'stone') { if (row <= 2) out.push({ x, kind: 'stone', depth: (row - 1) / 2 }); }
    else if (row < T.signRows) out.push({ x, kind: b.kind === 'water' ? 'damp' : 'tuft', depth: row / T.signRows });
  }
  return out;
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

export function reveal(w: Plot, x: number, y: number, r = T.reveal) {
  const i = cellIndex(x, y);
  if (i >= 0) eachNear(i, r, (k) => (w.cells[k].seen = true));
}

/** Each tick: the natives grow toward full size by mid-year and drain the pockets in their root zones. */
export function plotTick(w: Plot, t: number, yearTicks: number) {
  w.grow = Math.min(1, 0.6 + (0.4 * t) / (yearTicks / 2));
  for (const zone of w.zones) for (const i of zone) {
    const c = w.cells[i];
    c.amount = Math.max(0, c.amount - (c.kind === 'water' ? T.neighbourDrain.water : T.neighbourDrain.nutrient));
  }
}

/** Between years: rain refills the water pockets; nutrient stays used up. */
export function rain(w: Plot) {
  for (const c of w.cells) if (c.kind === 'water') c.amount = c.max;
  w.grow = 0.6;
}
