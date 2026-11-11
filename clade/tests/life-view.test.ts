import { expect, it } from 'vitest';
import { newLife } from '../src/sim/life';
import { boardFor } from '../src/sim/board';
import { makeWorld } from '../src/sim/sea';
import { Body } from '../src/view/body';

it('the ported drawing reads active places after growth, tears and starvation without changing the plan', () => {
  const world = makeWorld(1);
  const life = newLife(boardFor(world.habitats[0], world, 1), {
    clade: 'worm', parts: { front: 'tentacles', sides: 'sclerite', tail: 'pouch' }, genes: { size: 1, gut: 1 },
  }, {}, 1);
  const body = new Body(life);
  expect(body.row('front')).toEqual(['tentacles']);
  expect(body.row('sides')).toEqual([]); expect(body.row('tail')).toEqual([]);
  life.size = 2; body.setBuild(life);
  expect(body.row('sides')).toEqual(['sclerite']); expect(body.row('tail')).toEqual([]);
  life.size = 3; body.setBuild(life);
  expect(body.row('tail')).toEqual(['pouch']);
  life.lost.push('tail'); body.setBuild(life);
  expect(body.row('tail')).toEqual([]); expect(body.lost('tail')).toBe(true);
  expect(life.build.parts.tail).toBe('pouch');
});
