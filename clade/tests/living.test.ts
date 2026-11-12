// N4 F: living paint counts (view only; the drawing is looked at, not tested).
import { expect, it } from 'vitest';
import { LIVING } from '../src/data/sea';
import { bodyMass } from '../src/sim/fitness';
import type { Habitat } from '../src/sim/habitats';
import type { Species, World } from '../src/sim/records';
import { capsuleCounts } from '../src/view/living';

const hab = (id: number): Habitat => ({ id, name: `H${id}`, kind: { depth: 'shallows', substrate: 'mud', exposure: 'open' }, tiles: [], area: 100,
  centre: { x: 0, y: 0 }, neighbours: [], borders: [], perimeter: 40, stocks: { mats: 3000, detritus: 3000 }, pops: {} });
const sp = (id: string, lineage: string | null, parts: Species['build']['parts']): Species =>
  ({ id, name: id, parent: null, lineage, born: 0, build: { clade: 'worm', parts, genes: { size: 1, gut: 1 } } });

it('gives each population clamp(round(log2 heads), 1, 8) capsules with its role, at most LIVING.total', () => {
  const mine = sp('mine', 'worm-line', { front: 'tentacles' }), hook = sp('hook', null, { front: 'hook' });
  const world: World = { seed: 1, generation: 0, habitats: [hab(0)], species: [mine, hook], lineages: [{ id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'worm' }] };
  world.habitats[0].pops = { mine: 20 * bodyMass(mine.build), hook: 1 };
  expect(capsuleCounts(world)).toEqual([
    { habitat: 0, species: 'mine', n: 4, role: 'grazer', yours: true },
    { habitat: 0, species: 'hook', n: 1, role: 'hunter', yours: false },
  ]);
  world.habitats = [...Array(40).keys()].map(hab);
  for (const h of world.habitats) h.pops = { mine: 1e6, hook: 1e6 };
  const wants = capsuleCounts(world), total = wants.reduce((a, w) => a + w.n, 0);
  expect(total).toBeLessThanOrEqual(LIVING.total);
  expect(wants.filter((w) => w.yours)).toHaveLength(40);
});

it('the replay reads a run kept outside World (law 2): one frame per generation, the gone species kept', async () => {
  const { runLife } = await import('../src/ui/sea-run');
  const { makeWorld } = await import('../src/sim/sea');
  const { applyPreset } = await import('../src/ui/scenarios');
  const world = makeWorld(3), past = applyPreset(world, 'midgame'), keys = Object.keys(world).sort();
  const { run } = runLife(world, past, 4);
  expect(run.frames).toHaveLength(4);
  expect(Object.keys(world).sort()).toEqual(keys);
  for (const r of run.reports) for (const g of r.gone) expect(run.species.map((s) => s.id)).toContain(g.id);
  expect(capsuleCounts(world, run.before, run.species).length).toBeGreaterThan(0);
});

it('capsules keep moving on a real map: none stands at a border while hunters chase (N4 fix A)', async () => {
  const { vi } = await import('vitest');
  const { makeGround } = await import('../src/sim/ground');
  const { findHabitats } = await import('../src/sim/habitats');
  const { seeded } = await import('../src/sim/rng');
  const { LivingPaint } = await import('../src/view/living');
  const random = vi.spyOn(Math, 'random').mockImplementation(seeded(5));
  const ground = makeGround(3), habs = findHabitats(ground);
  const stub: unknown = new Proxy({}, { get: () => () => stub }); // a Graphics that draws nothing
  const paint = new LivingPaint(stub as never);
  paint.setGround(habs, ground.w);
  paint.sync(habs.list.flatMap((h) => [
    { habitat: h.id, species: 'prey', n: 6, role: 'grazer' as const, yours: true },
    { habitat: h.id, species: 'hunter', n: 2, role: 'hunter' as const, yours: false },
  ]));
  const caps = (paint as unknown as { caps: { x: number; y: number; pause: number }[] }).caps;
  const still = caps.map(() => 0), dt = 1 / 30, crawl = 0.3 * LIVING.wander * dt;
  let longest = 0; // frames in a row that a capsule, not pausing, barely moved
  for (let frame = 0; frame < 30 * 30; frame++) {
    const was = caps.map((c) => [c.x, c.y, c.pause]);
    paint.tick(dt, { x: 0, y: 0, z: 8 });
    caps.forEach((c, i) => {
      still[i] = was[i][2] <= 0 && Math.hypot(c.x - was[i][0], c.y - was[i][1]) < crawl ? still[i] + 1 : 0;
      longest = Math.max(longest, still[i]);
    });
  }
  random.mockRestore();
  expect(longest * dt).toBeLessThan(1); // seconds; the N4 capsules stood at borders for many seconds
});
