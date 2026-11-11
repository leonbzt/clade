import { expect, it } from 'vitest';
import { DEV_SPECIES } from '../src/data/builds';
import { PRESETS } from '../src/data/presets';
import { ceiling, fitness, slots } from '../src/sim/fitness';
import type { Build, World } from '../src/sim/records';
import { step } from '../src/sim/sea';
import { remember } from '../src/ui/history';
import { place } from '../src/ui/placement';
import { applyPreset, skip } from '../src/ui/scenarios';
import { bestFit, heldSlots } from '../src/view/tiers';

const worm: Build = { clade: 'worm', parts: {}, genes: { size: 1, gut: 1 } };
const makeFixture = (): World => ({ seed: 1, generation: 0, species: [], lineages: [], habitats: [{
  id: 0, name: 'Test shallows', kind: { depth: 'shallows', substrate: 'sand', exposure: 'open' },
  tiles: [], area: 100, centre: { x: 0, y: 0 }, neighbours: [], borders: [], perimeter: 40,
  stocks: { mats: 3000, detritus: 1000 }, pops: {},
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

it('placement founds twenty heads in grams, preserves an existing population and does not mutate its template', () => {
  const world = makeFixture();
  const species = { id: 'large-worm', lineage: 'worm-line', parent: 'root-worm', build: { ...worm, genes: { size: 3, gut: 1 } }, name: 'Large worm', born: 0 };
  const before = structuredClone(species);
  world.generation = 12;
  expect(place(world, 0, species)).toBe(true);
  expect(world.habitats[0].pops['large-worm']).toBe(80); // 20 heads × 4 grams at size 3
  expect(world.species.find((s) => s.id === 'large-worm')?.born).toBe(12);
  expect(world.species.some((s) => s.id === 'root-worm')).toBe(true);
  expect(world.lineages[0].ranks).toEqual({});
  expect(place(world, 0, species)).toBe(false);
  expect(world.habitats[0].pops['large-worm']).toBe(80);
  expect(species).toEqual(before);
  expect(place(world, 99, species)).toBe(false);
});

it('presets found apart or together as specified, preserve their data, and midgame holds several habitats', () => {
  const before = structuredClone({ PRESETS, DEV_SPECIES });
  for (const preset of PRESETS) {
    const world = makeFixture(), base = world.habitats[0];
    world.habitats = Array.from({ length: 6 }, (_, id) => ({ ...structuredClone(base), id }));
    const history = applyPreset(world, preset.id);
    const inhabited = world.habitats.filter((h) => Object.values(h.pops).some((p) => p > 0));
    expect(history.at(-1)?.generation).toBe(world.generation);
    if (preset.id === 'empty') expect(world.species).toHaveLength(0);
    if (preset.id === 'first-worm') {
      expect(inhabited).toHaveLength(1);
      expect(inhabited[0].kind.depth).toBe('shallows');
      expect(inhabited[0].pops['root-worm']).toBe(20);
    }
    if (preset.id === 'three-worms') {
      expect(inhabited).toHaveLength(3);
      expect(inhabited.map((h) => Object.keys(h.pops).length)).toEqual([1, 1, 1]);
    }
    if (preset.id === 'rivals') {
      expect(inhabited).toHaveLength(1);
      expect(heldSlots(inhabited[0], world).find((s) => s.slot.id === 'mats')?.holders).toHaveLength(2);
    }
    if (preset.id === 'midgame') {
      expect(inhabited.length).toBeGreaterThan(1);
      expect(world.generation).toBe(100);
      expect(world.lineages.find((l) => l.id === 'worm-line')?.ranks.tentacles).toBe(1);
      expect(history).toHaveLength(101);
    }
  }
  expect({ PRESETS, DEV_SPECIES }).toEqual(before);
});

it('skip 100 records each generation and gives the same sea as ten skips of ten', () => {
  const a = makeFixture(), b = structuredClone(a);
  const ah = skip(a, applyPreset(a, 'three-worms'), 100);
  let bh = applyPreset(b, 'three-worms');
  for (let i = 0; i < 10; i++) bh = skip(b, bh, 10);
  expect(a).toEqual(b);
  expect(ah).toEqual(bh);
  expect(ah).toHaveLength(101);
});
