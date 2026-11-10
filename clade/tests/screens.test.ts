import { expect, it } from 'vitest';
import { ceiling, fitness, slots } from '../src/sim/fitness';
import type { Build, World } from '../src/sim/records';
import { step } from '../src/sim/sea';
import { remember } from '../src/ui/history';
import { bestFit, heldSlots } from '../src/view/tiers';

const worm: Build = { clade: 'worm', parts: {}, genes: { size: 1, gut: 1 } };
const makeFixture = (): World => ({ seed: 1, generation: 0, species: [], lineages: [], habitats: [{
  id: 0, name: 'Test shallows', kind: { depth: 'shallows', substrate: 'sand', exposure: 'open' },
  tiles: [], area: 100, centre: { x: 0, y: 0 }, neighbours: [], borders: [], perimeter: 40,
  stocks: { mats: 300, detritus: 100 }, pops: {},
}] });

it('the intake sentence names the current fraction of its own slot food, including zero', () => {
  const world = makeFixture(), hab = world.habitats[0];
  for (const slot of slots(hab, world)) {
    hab.stocks[slot.id] = ceiling(hab, slot.id) * 0.38;
    expect(fitness(worm, {}, slot, hab, world).reasons[0]).toContain('food at 38%');
    hab.stocks[slot.id] = 0;
    expect(fitness(worm, {}, slot, hab, world).reasons[0]).toContain('food at 0%');
  }
});

it('cards and labels assign residents to their best stocked slot using current food and lineage ranks', () => {
  const world = makeFixture(), hab = world.habitats[0];
  const build: Build = { ...worm, parts: { front: 'tentacles', tail: 'bulb' } };
  world.lineages.push({ id: 'line', clade: 'worm', xp: 0, ranks: { tentacles: 1 }, job: 'none' });
  world.species.push({ id: 'worm', lineage: 'line', parent: null, build, name: 'Worm', born: 0 });
  hab.pops.worm = 20;
  hab.stocks.mats = ceiling(hab, 'mats'); hab.stocks.detritus = 0;
  let held = heldSlots(hab, world);
  expect(held.find((s) => s.holders.length)?.slot.id).toBe('mats');
  const holder = held.flatMap((s) => s.holders)[0];
  expect(holder.best?.fit).toEqual(fitness(build, { tentacles: 1 }, slots(hab, world)[0], hab, world));
  hab.stocks.mats = 0; hab.stocks.detritus = ceiling(hab, 'detritus');
  held = heldSlots(hab, world);
  expect(held.find((s) => s.holders.length)?.slot.id).toBe('detritus');
  expect(bestFit(build, {}, hab, world)?.slot.id).toBe('detritus');
  delete hab.pops.worm;
  expect(heldSlots(hab, world).every((s) => !s.holders.length)).toBe(true);
});

it('UI history captures every generation, bounds the window to 160, and owns copies outside World', () => {
  const world = makeFixture();
  let history = remember([], world);
  const original = world.habitats[0].stocks.mats;
  world.habitats[0].stocks.mats = 0;
  expect(history[0].habitats[0].stocks.mats).toBe(original);
  history = remember(history, world); // a placement in this generation replaces the endpoint
  expect(history).toHaveLength(1);
  for (let i = 0; i < 200; i++) { step(world); history = remember(history, world); }
  expect(history).toHaveLength(161);
  expect(history.map((f) => f.generation)).toEqual(Array.from({ length: 161 }, (_, i) => i + 40));
  expect(Object.keys(world).sort()).toEqual(['generation', 'habitats', 'lineages', 'seed', 'species']);
});
