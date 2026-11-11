import { BOARD, TEMPLATES } from '../data/boards';
import { COLS } from '../data/life';
import { density } from './fitness';
import type { Habitat } from './habitats';
import type { Board, Rival } from './life';
import type { World } from './records';
import { bestSlot, ranksOf } from './sea';

function hash(x: number, y: number, salt: number): number {
  let n = Math.imul((x * 73856093) ^ (y * 19349663) ^ (salt * 83492791), 0x5bd1e995);
  n ^= n >>> 13;
  return (n >>> 0) / 4294967296;
}

/** Stock changes remove and restore the same spots first, from game/src/sim/door.ts. */
function follow(grid: string[][], node: string, ground: string, share: number, salt: number, reserved: number[]) {
  const cells = grid.flatMap((row, y) => row.map((c, x) => ({ c, x, y, order: hash(x, y, salt) })));
  const have = cells.filter((cell) => cell.c === node).sort((a, b) => a.order - b.order);
  const want = Math.min(Math.round(have.length * share), Math.floor(have.length * BOARD.maxShare));
  for (const { x, y } of have.slice(want)) grid[y][x] = ground;
  if (want <= have.length) return;
  const free = cells.filter(({ c, x, y }) => c === ground && !reserved.includes(y * COLS + x))
    .sort((a, b) => a.order - b.order);
  for (const { x, y } of free.slice(0, want - have.length)) grid[y][x] = node;
}

/** A new board snapshot from this habitat's stocks and residents, without changing the sea. */
export function boardFor(habitat: Habitat, world: World, seed: number): Board {
  const { substrate } = habitat.kind, base = TEMPLATES[substrate];
  const grid = base.map.map((row) => [...row]);
  const reserved = [base.start, base.entry].map(([x, y]) => y * COLS + x);
  follow(grid, 'm', '.', density(habitat, 'mats'), 1, reserved);
  follow(grid, 'b', '~', density(habitat, 'detritus'), 3, reserved);

  const mirrored = (seed & 1) !== 0;
  const spot = ([x, y]: [number, number]): [number, number] => [mirrored ? COLS - 1 - x : x, y];
  const residents = world.species.map((species) => ({ species, grams: habitat.pops[species.id] ?? 0 }))
    .filter(({ grams }) => grams >= BOARD.rivalAt)
    .sort((a, b) => b.grams - a.grams);
  const rivals: Rival[] = [];
  for (const { species } of residents) {
    if (rivals.length === base.rivalSpots.length) break;
    const choice = bestSlot(species.build, ranksOf(world, species.lineage), habitat, world);
    const food = choice && choice.fit.intake > 0 ? choice.slot.id : null;
    rivals.push({
      at: spot(base.rivalSpots[rivals.length]), species: species.id, name: species.name,
      build: structuredClone(species.build), eats: food === 'mats' ? 'mat' : food === 'detritus' ? 'buried' : null,
    });
  }
  return {
    substrate, map: grid.map((row) => (mirrored ? row.reverse() : row).join('')),
    start: spot(base.start), entry: spot(base.entry),
    predatorAt: BOARD.shadow ? base.predatorAt : null, rivals, event: structuredClone(base.event),
  };
}
