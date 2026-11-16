// N4 D: the board's hunter and rivals come from the sea; a hunter may crush a rival it could eat.
import { describe, expect, it } from 'vitest';
import { BOARD } from '../src/data/boards';
import { PREY_FOOD } from '../src/data/life';
import { boardFor } from '../src/sim/board';
import { bodyMass, ceiling } from '../src/sim/fitness';
import type { Habitat } from '../src/sim/habitats';
import * as L from '../src/sim/life';
import { strikeOn } from '../src/sim/life-body';
import type { Build, Species, World } from '../src/sim/records';
import { useVerb } from '../src/sim/verbs';

const worm = (id: string, parts: Build['parts'] = {}, size = 1): Species =>
  ({ id, name: id, parent: null, lineage: null, build: { clade: 'worm', parts, genes: { size, gut: 1 } }, born: 0 });
function sea(...residents: [Species, number][]) {
  const habitat: Habitat = { id: 0, name: 'Lee shallows', kind: { depth: 'shallows', substrate: 'sand', exposure: 'open' },
    area: 100, tiles: [], centre: { x: 0, y: 0 }, neighbours: [], borders: [], perimeter: 40, stocks: { mats: 0, detritus: 0 }, pops: {} };
  habitat.stocks = { mats: ceiling(habitat, 'mats'), detritus: ceiling(habitat, 'detritus') };
  const world: World = { seed: 1, generation: 0, claimed: [], bars: {}, habitats: [habitat], species: residents.map(([s]) => s), lineages: [] };
  for (const [s, heads] of residents) habitat.pops[s.id] = heads * bodyMass(s.build);
  return { habitat, world };
}
const you = worm('you', { front: 'tentacles', sides: 'sclerite' }).build;

describe('the board from the sea', () => {
  it('a sea hunter that can eat you is the predator, not a rival; else no predator', () => {
    const hook = worm('Wild hook worm', { front: 'hook' }), grazer = worm('grazer', { front: 'tentacles' });
    const { habitat, world } = sea([hook, BOARD.rivalAt], [grazer, 40]);
    const board = boardFor(habitat, world, 2, you);
    expect(board.predator).toMatchObject({ species: hook.id, name: 'Wild hook worm', beats: ['armour'] });
    expect(board.predatorAt).not.toBeNull();
    expect(board.rivals.map((r) => r.species)).toEqual(['grazer']);
    // Too few heads, a hunter yourself, or bigger than the hunter: no predator at all.
    habitat.pops[hook.id] = (BOARD.rivalAt - 1) * bodyMass(hook.build);
    expect(boardFor(habitat, world, 2, you)).toMatchObject({ predator: null, predatorAt: null });
    habitat.pops[hook.id] = 20 * bodyMass(hook.build);
    expect(boardFor(habitat, world, 2, worm('h', { front: 'proboscis' }).build).predator).toBeNull();
    expect(boardFor(habitat, world, 2, { ...you, genes: { size: 2, gut: 1 } }).predator).toBeNull();
  });

  it("the hunter's beats ignore that defence of yours", () => {
    const { habitat, world } = sea(), l = L.newLife(boardFor(habitat, world, 1), you, {}, 1);
    l.size = 2;
    expect(strikeOn(l, 'right')).toMatchObject({ kind: 'blocked', part: 'sclerite' });
    expect(strikeOn(l, 'right', { beats: ['armour'] }).kind).toBe('hit');
    expect(strikeOn(l, 'right', { buried: true, beats: ['armour'] }).kind).toBe('buried');
    // Brace holds against the shadow's kind of strike, not against a hunter that gets past armour.
    expect(strikeOn(l, 'right', { braced: true }).kind).toBe('blocked');
    expect(strikeOn(l, 'front', { braced: true, beats: ['armour'] }).kind).toBe('hit');
  });

  it('a hunter crushes a rival beside it that it could eat: the rival is gone and you gain PREY_FOOD', () => {
    const prey = worm('Bulb worm', { tail: 'bulb' });
    const board: L.Board = { substrate: 'sand', map: Array(11).fill('........'), start: [3, 3], entry: [0, 10], predatorAt: null, event: null,
      rivals: [{ at: [4, 3], species: prey.id, name: prey.name, build: prey.build, eats: 'buried' }] };
    const l = L.newLife(board, worm('me', { front: 'hook' }).build, {}, 1);
    l.size = 3;
    const food = l.food;
    expect(useVerb(l, 'crush')).toBe(true);
    expect(l.rivals[0].caught).toBe(true);
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'prey', idx: 0, gain: PREY_FOOD }));
    expect(l.food).toBe(food + PREY_FOOD - L.upkeep(l));
    // A grazer can't: crush is a hunting part's verb, and the rival must be no bigger.
    const big = L.newLife({ ...board, rivals: [{ ...board.rivals[0], build: { ...prey.build, genes: { size: 3, gut: 1 } } }] }, worm('me', { front: 'hook' }).build, {}, 1);
    big.size = 3;
    useVerb(big, 'crush');
    expect(big.rivals[0].caught).toBeFalsy();
  });
});
