import { describe, expect, it } from 'vitest';
import { BOARD } from '../src/data/boards';
import { GROUND } from '../src/data/ground';
import { CELL, COLS, ROWS, TURNS } from '../src/data/life';
import { boardFor, deepEdge } from '../src/sim/board';
import { bodyMass, ceiling, density, fitness, slots } from '../src/sim/fitness';
import { colonise, coloniseJudgement, found } from '../src/sim/found';
import type { Habitat, HabitatKind } from '../src/sim/habitats';
import { DX, DY, at, dist, eventArea, inB, newLife, stay, xy, type Board } from '../src/sim/life';
import type { Build, Species, World } from '../src/sim/records';
import { grows } from '../src/sim/sea';

const worm = (id: string, parts: Build['parts'] = {}, size = 1): Species =>
  ({ id, name: id, parent: null, lineage: null, build: { clade: 'worm', parts, genes: { size, gut: 1 } }, born: 0 });

function fixture(depth: HabitatKind['depth'] = 'shallows', substrate: HabitatKind['substrate'] = 'sand') {
  const habitat: Habitat = {
    id: 0, name: 'Lee shallows', kind: { depth, substrate, exposure: 'open' },
    area: 100, tiles: [], centre: { x: 0, y: 0 }, neighbours: [], borders: [], perimeter: 40,
    stocks: { mats: 0, detritus: 0 }, pops: {},
  };
  habitat.stocks = { mats: ceiling(habitat, 'mats'), detritus: ceiling(habitat, 'detritus') };
  const world: World = { seed: 1, generation: 0, habitats: [habitat], species: [], lineages: [] };
  return { habitat, world };
}

const cells = (board: Pick<Board, 'map'>, node: string) =>
  [...board.map.join('')].flatMap((cell, i) => cell === node ? [i] : []);
/** Open cells reachable from the start. */
function reachable(board: Board): number {
  const map = board.map.join(''), seen = new Set([at(...board.start)]), open = [...seen];
  while (open.length) {
    const [x, y] = xy(open.pop()!);
    for (let d = 0; d < 4; d++) {
      const j = at(x + DX[d], y + DY[d]);
      if (inB(x + DX[d], y + DY[d]) && map[j] !== '#' && !seen.has(j)) { seen.add(j); open.push(j); }
    }
  }
  return seen.size;
}

describe('boardFor', () => {
  it('is deterministic, leaves the world intact, and differs by seed', () => {
    const { habitat, world } = fixture();
    const grazer = worm('grazer', { front: 'tentacles' });
    world.species.push(grazer); habitat.pops.grazer = 30;
    const before = structuredClone(world);
    const base = boardFor(habitat, world, 2);
    expect(boardFor(habitat, world, 2)).toEqual(base);
    expect(world).toEqual(before);
    expect(base.map).toHaveLength(ROWS);
    expect(base.map.every((row) => row.length === COLS)).toBe(true);
    expect(boardFor(habitat, world, 3).map).not.toEqual(base.map);
    grazer.build.parts.front = 'proboscis';
    expect(base.rivals[0].build.parts.front).toBe('tentacles');
  });

  it('grows its ground from the bottom type, a little mixed and always playable', () => {
    for (const substrate of ['sand', 'mud', 'rock'] as const) for (let seed = 1; seed <= 20; seed++) {
      const { habitat, world } = fixture('slope', substrate);
      habitat.stocks = { mats: 0, detritus: 0 };
      const board = boardFor(habitat, world, seed), map = board.map.join('');
      const share = (t: string) => [...map].filter((c) => CELL[c][0] === t).length / map.length;
      expect(map[at(...board.start)], `${substrate} ${seed}`).toMatch(/[.~]/);
      expect(reachable(board), `${substrate} ${seed}`).toBe([...map].filter((c) => c !== '#').length);
      expect(share(substrate === 'mud' ? 'mud' : 'sand')).toBeGreaterThan(0.5);
      if (substrate === 'rock') expect(share('rock')).toBeGreaterThan(0.2);
      expect(new Set([...map].map((c) => CELL[c][0])).size).toBeGreaterThan(1);
    }
  });

  it('starts by the shore and lets the shadow in from the deep side, read from the neighbours', () => {
    const { habitat, world } = fixture('shallows', 'mud');
    const deeper: Habitat = { ...structuredClone(habitat), id: 1, kind: { ...habitat.kind, depth: 'slope' } };
    habitat.centre = { x: 100, y: 100 }; deeper.centre = { x: 100, y: 140 };
    habitat.neighbours = [1]; habitat.borders = [30];
    world.habitats.push(deeper);
    expect(deepEdge(habitat, world)).toBe('bottom');
    let board = boardFor(habitat, world, 2);
    expect([board.start[1], board.entry[1]]).toEqual([1, ROWS - 1]);
    deeper.centre = { x: 160, y: 100 };
    board = boardFor(habitat, world, 2);
    expect([board.start[0], board.entry[0]]).toEqual([1, COLS - 1]);
    deeper.kind.depth = 'flat'; // a shallower neighbour pushes the deep side away from it
    expect(deepEdge(habitat, world)).toBe('left');
    habitat.neighbours = []; habitat.borders = []; habitat.centre = { x: GROUND.w / 2, y: GROUND.h - 1 };
    expect(deepEdge(habitat, world)).toBe('bottom'); // no depth step: away from the island
  });

  it('puts food from the stocks: buried pockets on a rock deep, no mats without light, capped', () => {
    const { habitat, world } = fixture('deep', 'rock');
    const board = boardFor(habitat, world, 2);
    expect(cells(board, 'b')).toHaveLength(Math.round(BOARD.nodes * density(habitat, 'detritus')));
    expect(cells(board, 'b').length).toBeGreaterThanOrEqual(10);
    expect(cells(board, 'm')).toEqual([]);
    habitat.stocks = { mats: 10_000, detritus: 10_000 };
    expect(cells(boardFor(habitat, world, 2), 'b')).toHaveLength(Math.floor(BOARD.nodes * BOARD.maxShare));
    const flat = fixture('flat', 'sand');
    expect(cells(boardFor(flat.habitat, flat.world, 2), 'm')).toHaveLength(Math.floor(BOARD.nodes * BOARD.maxShare));
  });

  it('halving a stock keeps a subset of its nodes and a stock at 0 gives none', () => {
    const { habitat, world } = fixture('shallows', 'mud');
    const rich = boardFor(habitat, world, 2);
    for (const [node, food] of [['m', 'mats'], ['b', 'detritus']] as const) {
      const full = habitat.stocks[food];
      habitat.stocks[food] = full / 2;
      const thin = boardFor(habitat, world, 2);
      expect(cells(thin, node).length).toBeLessThan(cells(rich, node).length);
      expect(cells(rich, node)).toEqual(expect.arrayContaining(cells(thin, node)));
      habitat.stocks[food] = full;
    }
    habitat.stocks = { mats: 0, detritus: 0 };
    const empty = boardFor(habitat, world, 2);
    expect([cells(empty, 'm'), cells(empty, 'b')]).toEqual([[], []]);
  });

  it('picks the event from depth and bottom type, with its band on the shore or the deep side', () => {
    const eventOf = (depth: HabitatKind['depth'], substrate: HabitatKind['substrate']) => {
      const { habitat, world } = fixture(depth, substrate); // no neighbours: the deep side is left, away from the island
      return boardFor(habitat, world, 2);
    };
    expect(eventOf('flat', 'sand').event).toMatchObject({ name: 'Low tide', cols: [COLS - 3, COLS - 1] });
    expect(eventOf('shallows', 'sand').event).toMatchObject({ name: 'Upwelling', cols: [0, 2] });
    expect(eventOf('slope', 'mud').event).toMatchObject({ name: 'Mudslide', where: 'mud' });
    expect(eventOf('deep', 'rock').event).toMatchObject({ name: 'Vent surge', where: 'all' });
    expect(eventOf('deep', 'rock').predatorAt).toBeNull(); // no sea hunter here, and no shadow (12 Nov)
    const l = newLife(eventOf('flat', 'sand'), worm('worm').build, {}, 2);
    expect([eventArea(l, COLS - 1, 5), eventArea(l, 0, 5)]).toEqual([true, false]);
  });

  it('uses the heaviest resident at the threshold and feeds it from its best slot', () => {
    const { habitat, world } = fixture('shallows', 'mud');
    const grazer = worm('grazer', { front: 'tentacles' }), digger = worm('digger', { tail: 'bulb' });
    world.species.push(grazer, digger);
    habitat.pops = { grazer: BOARD.rivalAt - 1, digger: BOARD.rivalAt };
    expect(boardFor(habitat, world, 2).rivals).toMatchObject([{ species: 'digger', eats: 'buried' }]);
    for (let seed = 1; seed <= 20; seed++) {
      const board = boardFor(habitat, world, seed), [x, y] = board.rivals[0].at;
      expect(board.map[y][x]).not.toBe('#');
      expect(dist(x, y, ...board.start)).toBeGreaterThanOrEqual(BOARD.rivalGap);
    }
    habitat.pops.grazer = BOARD.rivalAt + 1;
    expect(boardFor(habitat, world, 2).rivals).toMatchObject([{ species: 'grazer', eats: 'mat' }]);
    habitat.stocks.mats = 0;
    expect(boardFor(habitat, world, 2).rivals).toMatchObject([{ species: 'grazer', eats: null }]);
    habitat.pops.digger = BOARD.rivalAt - 1; habitat.pops.grazer = BOARD.rivalAt - 1;
    expect(boardFor(habitat, world, 2).rivals).toEqual([]);
  });

  it('counts the rival cutoff in heads, not grams', () => {
    const { habitat, world } = fixture('shallows', 'mud');
    const big = worm('big', { tail: 'bulb' }, 3), mass = bodyMass(big.build);
    world.species.push(big);
    habitat.pops = { big: (BOARD.rivalAt - 1) * mass };
    expect(habitat.pops.big).toBeGreaterThan(BOARD.rivalAt);
    expect(boardFor(habitat, world, 2).rivals).toEqual([]);
    habitat.pops.big = BOARD.rivalAt * mass;
    expect(boardFor(habitat, world, 2).rivals).toMatchObject([{ species: 'big', eats: 'buried' }]);
  });

  it('runs the whole season without a hunter when the shadow flag is off', () => {
    const { habitat, world } = fixture();
    const original = BOARD.shadow;
    BOARD.shadow = false;
    try {
      const l = newLife(boardFor(habitat, world, 2), worm('worm').build, {}, 2);
      l.food = 99;
      for (let i = 0; i < TURNS; i++) {
        stay(l);
        expect(l.pred).toBeNull();
        expect(l.events.some((e) => e.k === 'pred_arrive')).toBe(false);
      }
      expect(l.cause).toBe('season');
    } finally {
      BOARD.shadow = original;
    }
  });
});

describe('founding', () => {
  it('adds eggs × 2 × the adult build’s body mass to the chosen habitat only', () => {
    const { habitat, world } = fixture();
    const species = worm('tentacle worm', { front: 'tentacles' }, 3);
    world.species.push(species);
    const other = { ...structuredClone(habitat), id: 1 };
    world.habitats.push(other);
    habitat.pops[species.id] = 5;
    expect(found(world, habitat, species, 0)).toBe(0);
    expect(found(world, habitat, species, 9)).toBe(9 * 2 * bodyMass(species.build));
    expect(habitat.pops[species.id]).toBe(77);
    expect(other.pops).toEqual({});
  });

  it('offers Colonise where the species is absent and its best full-food letter is D or better', () => {
    const { habitat, world } = fixture();
    const species = worm('tentacle worm', { front: 'tentacles' });
    const slot = slots(habitat, world).find((s) => s.id === 'mats')!;
    expect(colonise(world, habitat, species)).toMatchObject({
      slot, fit: fitness(species.build, {}, slot, habitat, world), text: 'Colonise Lee shallows · graze mats · tier B',
    });
    habitat.stocks.mats = 0;
    expect(colonise(world, habitat, species)?.fit.letter).toBe('B');
    habitat.pops[species.id] = 4;
    expect(colonise(world, habitat, species)).toBeNull();
    expect(colonise(world, habitat, worm('digger', { tail: 'bulb' }, 5))?.fit.letter).toBe('D');
    expect(colonise(world, habitat, worm('bare worm', {}, 5))).toBeNull();
  });

  it('judges founder heads against the cutoff and growth against today’s sea fitness', () => {
    const { habitat, world } = fixture();
    const species = worm('tentacle worm', { front: 'tentacles' });
    expect(coloniseJudgement(world, habitat, species, 0).outcome).toBe('too-few');
    const result = coloniseJudgement(world, habitat, species, 18);
    expect(result.text).toBe('36 tentacle worms founded · tier B · they grow here');
    expect(grows(result.fit!.value)).toBe(true);
    habitat.stocks.mats = 0;
    expect(coloniseJudgement(world, habitat, species, 1)).toMatchObject({ heads: 2, outcome: 'shrinks' });
  });
});
