import { expect, it } from 'vitest';
import type { Habitat } from '../src/sim/habitats';
import type { World } from '../src/sim/records';
import { homeLabel, senders, visibleLabels } from '../src/view/home';
import { carriedParts, familyOf } from '../src/view/line';

const hab = (id: number, neighbours: number[]): Habitat => ({
  id, name: `H${id}`, kind: { depth: 'shallows', substrate: 'mud', exposure: 'open' }, tiles: [], area: 100,
  centre: { x: 0, y: 0 }, neighbours, borders: neighbours.map(() => 1), perimeter: 40, stocks: { mats: 3000, detritus: 3000 }, pops: {},
});
const world = (): World => ({ seed: 1, generation: 0, habitats: [hab(0, [1]), hab(1, [0, 2]), hab(2, [1])],
  lineages: [{ id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'worm' }],
  species: [{ id: 'w', lineage: 'worm-line', parent: null, name: 'Worm', born: 0, build: { clade: 'worm', parts: { front: 'tentacles' }, genes: { size: 1, gut: 1 } } }] });

it('marks your habitats, lights only neighbours Colonise allows, and fogs the rest', () => {
  const w = world(); w.habitats[0].pops.w = 100;
  expect(homeLabel(w, w.habitats[0]).kind).toBe('yours');
  const target = homeLabel(w, w.habitats[1]);
  expect(target.kind).toBe('target');
  if (target.kind === 'target') expect(target.reason).toMatch(/here|needs/);
  expect(homeLabel(w, w.habitats[2])).toEqual({ kind: 'fog' });
  expect(senders(w, w.habitats[1]).map((s) => [s.species.id, s.from.id])).toEqual([['w', 0]]);
  w.species[0].lineage = 'other';
  expect(homeLabel(w, w.habitats[0])).toEqual({ kind: 'fog' });
});

it('hides the lower-ranked of two overlapping labels', () => {
  const box = (id: number, rank: number, x: number) => ({ id, rank, x, y: 0, w: 40, h: 20 });
  expect([...visibleLabels([box(0, 1, 0), box(1, 2, 30), box(2, 0, 100)])].sort()).toEqual([1, 2]);
});

it('the line view nests children under parents, marks the extinct gone, and lists each carried part once', () => {
  const w = world(), line = w.lineages[0];
  w.species.push({ id: 'c', lineage: 'worm-line', parent: 'w', name: 'Child', born: 1, build: { clade: 'worm', parts: { front: 'tentacles', tail: 'bulb' }, genes: { size: 1, gut: 1 } } });
  w.habitats[1].pops.c = 100;
  const [root] = familyOf(w, line);
  expect([root.species.id, root.homes, root.children.map((c) => [c.species.id, c.homes.map((h) => h.name)])]).toEqual(['w', [], [['c', ['H1']]]]);
  expect(carriedParts(w, line).map((p) => p.id)).toEqual(['tentacles', 'bulb']);
});
