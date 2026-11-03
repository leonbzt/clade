// Grow toy (slice 00): the plot. Hidden soil, the habitat, its neighbours and the light. No DOM.

import { CELL, COLS, GROUND, HABITATS, ROWS, T, type Habitat, type Neighbour } from './grow-data';

export type Rng = () => number;
export function seeded(seed: number): Rng {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type CellKind = 'loam' | 'hard' | 'stone' | 'water' | 'nutrient';
export interface Cell { kind: CellKind; amount: number; max: number; seen: boolean; hint: number }
export type Pt = { x: number; y: number };
export interface World {
  seed: number; habitat: Habitat; cells: Cell[];
  grow: number; // the neighbours' size this season, 0.6 → 1
  zones: number[][]; // per neighbour: the pocket cells its roots drain
  roots: Pt[][]; // the neighbours' roots, for drawing
}

export const isPocket = (c: Cell) => c.kind === 'water' || c.kind === 'nutrient';
export const cellIndex = (x: number, y: number) => {
  const c = Math.floor(x / CELL), r = Math.floor((y - GROUND) / CELL);
  return c < 0 || c >= COLS || r < 0 || r >= ROWS ? -1 : r * COLS + c;
};
const cellCentre = (i: number): Pt => ({ x: (i % COLS) * CELL + CELL / 2, y: GROUND + Math.floor(i / COLS) * CELL + CELL / 2 });

export function makeWorld(habitatId: string, seed: number): World {
  const habitat = HABITATS.find((h) => h.id === habitatId)!, rng = seeded(seed), s = habitat.soil;
  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const depth = r / ROWS, x = rng();
      const water = s.water * (s.waterDeep ? 2.2 * depth : 1), nutrient = s.nutrient * (1.3 - 0.6 * depth);
      let kind: CellKind = 'loam';
      if (x < water) kind = 'water';
      else if (x < water + nutrient) kind = 'nutrient';
      else if (x < water + nutrient + s.stone * (0.6 + depth)) kind = 'stone';
      else if (x < water + nutrient + s.stone * (0.6 + depth) + s.hard) kind = 'hard';
      if (r === 0 && kind === 'stone') kind = 'hard';
      const [lo, hi] = kind === 'water' ? T.pocketWaterAmt : T.pocketNutrientAmt;
      const max = isPocketKind(kind) ? lo + (hi - lo) * rng() : 0;
      cells.push({ kind, amount: max, max, seen: false, hint: 0 });
    }
  }
  for (let i = 0; i < cells.length; i++) {
    let n = 0;
    eachNear(i, T.reveal, (k) => { if (k !== i && isPocket(cells[k])) n++; });
    cells[i].hint = n;
  }
  const zones = habitat.neighbours.map((nb) =>
    cells.map((_, i) => i).filter((i) => isPocket(cells[i]) && inZone(nb, cellCentre(i))));
  const roots = habitat.neighbours.flatMap((nb) => neighbourRoots(nb, rng));
  return { seed, habitat, cells, grow: 0.6, zones, roots };
}

const isPocketKind = (k: CellKind) => k === 'water' || k === 'nutrient';
const inZone = (nb: Neighbour, p: Pt) => ((p.x - nb.x) / nb.roots) ** 2 + ((p.y - GROUND) / nb.depth) ** 2 <= 1;

function neighbourRoots(nb: Neighbour, rng: Rng): Pt[][] {
  const out: Pt[][] = [];
  for (let k = 0; k < 4 + nb.roots / 30; k++) {
    let x = nb.x, y = GROUND, a = Math.PI / 2 + (rng() - 0.5) * 2.4;
    const line: Pt[] = [{ x, y }];
    for (let s = 0; s < 12; s++) {
      a += (rng() - 0.5) * 0.6;
      x += Math.cos(a) * nb.roots / 10; y += Math.abs(Math.sin(a)) * nb.depth / 10;
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

export function reveal(w: World, x: number, y: number) {
  const i = cellIndex(x, y);
  if (i >= 0) eachNear(i, T.reveal, (k) => (w.cells[k].seen = true));
}

/** Sky light at a point after the neighbours' crowns (own leaves are shaded in the sim). */
export function light(w: World, x: number, y: number): number {
  let l = 1;
  for (const nb of w.habitat.neighbours) {
    if (Math.abs(x - nb.x) < nb.w / 2 && y > GROUND - nb.h * w.grow) l *= 1 - nb.density;
  }
  return l;
}

/** Each tick: the neighbours grow toward full size by mid-season and drain the pockets in their root zones. */
export function worldTick(w: World, t: number, seasonTicks: number) {
  w.grow = Math.min(1, 0.6 + (0.4 * t) / (seasonTicks / 2));
  w.zones.forEach((zone) => {
    for (const i of zone) {
      const c = w.cells[i];
      c.amount = Math.max(0, c.amount - (c.kind === 'water' ? T.neighbourDrain.water : T.neighbourDrain.nutrient));
    }
  });
}

/** Between seasons: rain refills the water pockets; nutrient stays used up. */
export function rain(w: World) {
  for (const c of w.cells) if (c.kind === 'water') c.amount = c.max;
  w.grow = 0.6;
}

/** A copy for predictions: hidden cells count as plain loam (you only know what you've seen). */
export function knownCopy(w: World): World {
  const cells = w.cells.map((c) => (c.seen ? { ...c } : { kind: 'loam' as CellKind, amount: 0, max: 0, seen: true, hint: 0 }));
  return { ...w, cells, zones: w.zones.map((z) => z.filter((i) => isPocket(cells[i]))) };
}
