import { describe, expect, it } from 'vitest';
import { BOARD, TEMPLATES } from '../src/data/boards';
import { COLS, ROWS, TURNS } from '../src/data/life';
import { boardFor } from '../src/sim/board';
import { bodyMass, ceiling, fitness, slots } from '../src/sim/fitness';
import { colonise, coloniseJudgement, found } from '../src/sim/found';
import type { Habitat, HabitatKind } from '../src/sim/habitats';
import { newLife, stay, type Board } from '../src/sim/life';
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

describe('boardFor', () => {
  it('is deterministic, leaves the world intact, and mirrors the map, start, entry and rival spots by seed', () => {
    const { habitat, world } = fixture();
    const grazer = worm('grazer', { front: 'tentacles' });
    world.species.push(grazer); habitat.pops.grazer = 30;
    const before = structuredClone(world);
    const base = boardFor(habitat, world, 2), mirror = boardFor(habitat, world, 3);
    expect(boardFor(habitat, world, 2)).toEqual(base);
    expect(world).toEqual(before);
    expect(base.map).toHaveLength(ROWS);
    expect(base.map.every((row) => row.length === COLS)).toBe(true);
    expect(mirror.map).toEqual(base.map.map((row) => [...row].reverse().join('')));
    for (const [a, b] of [[base.start, mirror.start], [base.entry, mirror.entry], [base.rivals[0].at, mirror.rivals[0].at]])
      expect(b).toEqual([COLS - 1 - a[0], a[1]]);
    expect(mirror.event).toEqual(base.event);
    expect(mirror.predatorAt).toBe(base.predatorAt);
    grazer.build.parts.front = 'proboscis';
    expect(base.rivals[0].build.parts.front).toBe('tentacles');
  });

  it('uses each template’s features, replacing vents and sampling away mats below the shallows', () => {
    for (const substrate of ['sand', 'mud', 'rock'] as const) {
      const { habitat, world } = fixture('slope', substrate);
      const template = TEMPLATES[substrate], board = boardFor(habitat, world, 2);
      expect(board.map.join('')).not.toMatch(/[%o]/);
      expect(cells(board, 'm')).toEqual([]);
      expect(cells(board, 's')).toEqual(cells(template, 's'));
      expect(cells(board, 'c')).toEqual(cells(template, 'c'));
      expect([board.event, board.predatorAt]).toEqual([template.event, template.predatorAt]);
    }
  });

  it('halving stocks never adds food nodes and zero stock removes all nodes of its food', () => {
    const { habitat, world } = fixture('shallows', 'mud');
    const rich = boardFor(habitat, world, 2);
    habitat.stocks.mats /= 2;
    habitat.stocks.detritus /= 2;
    const thin = boardFor(habitat, world, 2);
    for (const kind of ['m', 'b']) {
      expect(cells(thin, kind).length).toBeLessThan(cells(rich, kind).length);
      expect(cells(rich, kind)).toEqual(expect.arrayContaining(cells(thin, kind)));
    }
    habitat.stocks = { mats: 0, detritus: 0 };
    const empty = boardFor(habitat, world, 2);
    expect([cells(empty, 'm'), cells(empty, 'b')]).toEqual([[], []]);
  });

  it('caps rich stocks at one and a half times the template node counts', () => {
    const { habitat, world } = fixture('shallows', 'mud');
    habitat.stocks = { mats: 10_000, detritus: 10_000 };
    const board = boardFor(habitat, world, 2);
    for (const kind of ['m', 'b'])
      expect(cells(board, kind)).toHaveLength(Math.floor(cells(TEMPLATES.mud, kind).length * 1.5));
  });

  it('uses the heaviest resident at the threshold and feeds it from its best slot', () => {
    const { habitat, world } = fixture('shallows', 'mud');
    const grazer = worm('grazer', { front: 'tentacles' }), digger = worm('digger', { tail: 'bulb' });
    world.species.push(grazer, digger);
    habitat.pops = { grazer: BOARD.rivalAt - 1, digger: BOARD.rivalAt };
    expect(boardFor(habitat, world, 2).rivals).toMatchObject([{ species: 'digger', eats: 'buried' }]);
    habitat.pops.grazer = BOARD.rivalAt + 1;
    expect(boardFor(habitat, world, 2).rivals).toMatchObject([{ species: 'grazer', eats: 'mat' }]);
    habitat.stocks.mats = 0;
    expect(boardFor(habitat, world, 2).rivals).toMatchObject([{ species: 'grazer', eats: null }]);
    habitat.pops.digger = BOARD.rivalAt - 1; habitat.pops.grazer = BOARD.rivalAt - 1;
    expect(boardFor(habitat, world, 2).rivals).toEqual([]);
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
