// The Life's board, generated from its habitat (*decided 11 Nov*): a close-up of one patch. Ground from the bottom
// type, food from the stocks, the shore and the deep side from the neighbours, the event from depth and bottom type.
// Pure (law 8): the same habitat state and seed give the same board; the sea is only read.
import { BOARD, EVENTS, EVENT_AT, GROUNDS } from '../data/boards';
import { DEPTHS, GROUND } from '../data/ground';
import { COLS, ROWS } from '../data/life';
import { bodyMass, density } from './fitness';
import { DX, DY, at, dist, inB, xy } from './grid';
import type { Habitat } from './habitats';
import type { Board, BoardEvent, Rival } from './life';
import type { Food, World } from './records';
import { seeded, type Rng } from './rng';
import { bestSlot, ranksOf } from './sea';

export type Edge = 'top' | 'right' | 'bottom' | 'left';
const OPPOSITE: Record<Edge, Edge> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const CELLS = [...Array(COLS * ROWS).keys()];

/** The deep side, with map north up: deeper neighbours pull, shallower ones push, by shared border. */
export function deepEdge(h: Habitat, world: World): Edge {
  const depth = DEPTHS.indexOf(h.kind.depth);
  let vx = 0, vy = 0;
  h.neighbours.forEach((id, k) => {
    const n = world.habitats.find((other) => other.id === id);
    const step = n ? DEPTHS.indexOf(n.kind.depth) - depth : 0;
    if (!n || !step) return;
    const dx = n.centre.x - h.centre.x, dy = n.centre.y - h.centre.y, len = Math.hypot(dx, dy) || 1;
    vx += (step * h.borders[k] * dx) / len;
    vy += (step * h.borders[k] * dy) / len;
  });
  if (!vx && !vy) [vx, vy] = [h.centre.x - GROUND.w / 2, h.centre.y - GROUND.h / 2]; // no depth step: away from the island
  return Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'bottom' : 'top';
}

/** The cell `inset` cells in from an edge, `along` (0–1) across it. */
function onEdge(edge: Edge, inset: number, along: number): number {
  const span = edge === 'top' || edge === 'bottom' ? COLS : ROWS, a = Math.min(span - 1, Math.floor(along * span));
  if (edge === 'top') return at(a, inset);
  if (edge === 'bottom') return at(a, ROWS - 1 - inset);
  return edge === 'left' ? at(inset, a) : at(COLS - 1 - inset, a);
}

/** The rows or columns within `depth` cells of an edge. */
function band(edge: Edge, depth: number): Pick<BoardEvent, 'rows' | 'cols'> {
  if (edge === 'top') return { rows: [0, depth - 1] };
  if (edge === 'bottom') return { rows: [ROWS - depth, ROWS - 1] };
  return edge === 'left' ? { cols: [0, depth - 1] } : { cols: [COLS - depth, COLS - 1] };
}

const near = (i: number) => {
  const [x, y] = xy(i);
  return [0, 1, 2, 3].flatMap((d) => (inB(x + DX[d], y + DY[d]) ? [at(x + DX[d], y + DY[d])] : []));
};

/** Noise over the board, smoothed into patches by `passes`: low values come first. */
function field(rng: Rng, passes: number): Float64Array {
  let f = Float64Array.from(CELLS, () => rng());
  for (let pass = 0; pass < passes; pass++) {
    const prev = f;
    f = Float64Array.from(CELLS, (i) => {
      const around = [i, ...near(i)];
      return around.reduce((sum, j) => sum + prev[j], 0) / around.length;
    });
  }
  return f;
}
const byField = (f: Float64Array, cells: number[]) => [...cells].sort((a, b) => f[a] - f[b] || a - b);

/** Every open cell is reachable from the start. */
function connected(grid: string[], start: number): boolean {
  const seen = new Set([start]), open = [start];
  while (open.length) for (const j of near(open.pop()!)) if (grid[j] !== '#' && !seen.has(j)) { seen.add(j); open.push(j); }
  return seen.size === grid.filter((c) => c !== '#').length;
}

/** Puts `count` nodes on open cells in field order, on their own ground first; a node brings its ground with it. */
function place(grid: string[], f: Float64Array, node: string, home: string, count: number, taken: Set<number>) {
  const open = CELLS.filter((i) => (grid[i] === '.' || grid[i] === '~') && !taken.has(i));
  const order = byField(f, open).sort((a, b) => Number(grid[a] !== home) - Number(grid[b] !== home));
  for (const i of order.slice(0, count)) grid[i] = node;
}

const nodesFor = (h: Habitat, food: Food) =>
  Math.min(Math.round(BOARD.nodes * density(h, food)), Math.floor(BOARD.nodes * BOARD.maxShare));

export function boardFor(habitat: Habitat, world: World, seed: number): Board {
  const { substrate, depth } = habitat.kind, ground = GROUNDS[substrate];
  const rng = seeded(seed ^ Math.imul(habitat.id + 1, 0x9e3779b1));
  const deep = deepEdge(habitat, world), shore = OPPOSITE[deep];
  const start = onEdge(shore, 1, 0.35 + 0.3 * rng()), entry = onEdge(deep, 0, 0.25 + 0.5 * rng());
  const fields = { // ground in patches, features and food scattered
    mud: field(rng, BOARD.smooth), wall: field(rng, BOARD.smooth), feature: field(rng, 0), buried: field(rng, 0), mat: field(rng, 0),
  };

  // Ground: mud patches, then rock outcrops that never cut the board or crowd the start.
  const grid = CELLS.map(() => '.');
  for (const i of byField(fields.mud, CELLS).slice(0, Math.round(ground.mud * CELLS.length))) grid[i] = '~';
  const clear = new Set([start, entry, ...near(start)]);
  let walls = Math.round(ground.wall * CELLS.length);
  for (const i of byField(fields.wall, CELLS)) {
    if (!walls) break;
    if (clear.has(i)) continue;
    const was = grid[i];
    grid[i] = '#';
    if (connected(grid, start)) walls--;
    else grid[i] = was;
  }

  // Features, then food from the stocks. Each food keeps its own field order, so a smaller stock is a subset.
  const taken = new Set([start, entry]);
  place(grid, fields.feature, 's', '.', ground.shells, taken);
  place(grid, fields.feature, 'c', '.', ground.carcasses, taken);
  place(grid, fields.buried, 'b', '~', nodesFor(habitat, 'detritus'), taken);
  place(grid, fields.mat, 'm', '.', nodesFor(habitat, 'mats'), taken);

  // Rivals: the heaviest residents by heads, each on a spot well away from the start.
  const [sx, sy] = xy(start);
  const spots = CELLS.filter((i) => grid[i] !== '#' && !taken.has(i) && dist(sx, sy, ...xy(i)) >= BOARD.rivalGap);
  const residents = world.species.map((species) => ({ species, grams: habitat.pops[species.id] ?? 0 }))
    .filter(({ species, grams }) => grams / bodyMass(species.build) >= BOARD.rivalAt)
    .sort((a, b) => b.grams - a.grams);
  const rivals: Rival[] = [];
  for (const { species } of residents) {
    if (rivals.length === BOARD.rivals || !spots.length) break;
    const spot = spots.splice(Math.floor(rng() * spots.length), 1)[0];
    const choice = bestSlot(species.build, ranksOf(world, species.lineage), habitat, world);
    const food = choice && choice.fit.intake > 0 ? choice.slot.id : null;
    rivals.push({
      at: xy(spot), species: species.id, name: species.name, build: structuredClone(species.build),
      eats: food === 'mats' ? 'mat' : food === 'detritus' ? 'buried' : null,
    });
  }

  const { band: side, ...event } = EVENTS[EVENT_AT[depth][substrate]];
  return {
    substrate, map: [...Array(ROWS).keys()].map((y) => grid.slice(y * COLS, (y + 1) * COLS).join('')),
    start: xy(start), entry: xy(entry), predatorAt: BOARD.shadow ? ground.shadowTurn : null, rivals,
    event: { ...event, ...(side ? band(side === 'deep' ? deep : shore, BOARD.band) : {}) },
  };
}
