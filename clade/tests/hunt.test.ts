import { describe, expect, it } from 'vitest';
import { GUARD, SEA } from '../src/data/sea';
import { fitness, slots } from '../src/sim/fitness';
import type { Habitat } from '../src/sim/habitats';
import { hunted, preyIn, threat } from '../src/sim/hunt';
import type { Build, Species, World } from '../src/sim/records';
import { step } from '../src/sim/sea';

const worm = (parts: Build['parts'] = {}, size = 1): Build => ({ clade: 'worm', parts, genes: { size, gut: 1 } });
const grazer = worm({ front: 'tentacles' }), hunter = worm({ front: 'proboscis' });
const sp = (id: string, build: Build): Species => ({ id, lineage: null, parent: 'root', build, name: id, born: 0 });
const habitat = (pops: Record<string, number>, substrate: 'sand' | 'mud' = 'mud'): Habitat => ({
  id: 0, name: 'Test', kind: { depth: 'shallows', substrate, exposure: 'open' }, tiles: [], area: 40,
  centre: { x: 0, y: 0 }, neighbours: [], borders: [], perimeter: 20, stocks: { mats: 800, detritus: 1200 }, pops,
});
const sea = (h: Habitat, species: Species[]): World => ({ seed: 1, generation: 0, habitats: [h], species, lineages: [] });
const take = (world: World, h: Habitat, prey: string) =>
  hunted(h, world).filter((t) => t.prey === prey).reduce((sum, t) => sum + t.grams, 0);

describe('who eats whom', () => {
  it('the diet rule: only a hunting tool hunts, never another hunter, never bigger prey', () => {
    const big = worm({ front: 'tentacles' }, 2);
    const h = habitat({ g: 300, big: 300, p: 50, q: 50 });
    const world = sea(h, [sp('g', grazer), sp('big', big), sp('p', hunter), sp('q', worm({ front: 'hook' }))]);
    expect(preyIn(h, world).map((p) => p.id)).toEqual(['g', 'big']);
    const takes = hunted(h, world);
    expect(new Set(takes.map((t) => t.hunter))).toEqual(new Set(['p', 'q']));
    expect(takes.every((t) => t.prey === 'g')).toBe(true);
    const prey = slots(h, world).find((s) => s.id === 'prey')!;
    expect(prey.role).toBe('hunter');
    expect(fitness(grazer, {}, prey, h, world).intake).toBe(0);
    expect(fitness(hunter, {}, prey, h, world).intake).toBeGreaterThan(0);
    for (const food of slots(h, world).filter((s) => s.id !== 'prey')) expect(fitness(hunter, {}, food, h, world).intake).toBe(0);
  });

  it('no hunt slot while the prey weighs under slotFloor, and then no take', () => {
    const h = habitat({ g: SEA.slotFloor - 1, p: 50 }), world = sea(h, [sp('g', grazer), sp('p', hunter)]);
    expect(slots(h, world).some((s) => s.id === 'prey')).toBe(false);
    expect(hunted(h, world)).toEqual([]);
  });

  it('law 3: adding a hunter lowers its prey\'s survival, and the reason names it', () => {
    const h = habitat({ g: 300 }), world = sea(h, [sp('g', grazer), { ...sp('p', hunter), name: 'Proboscis worm' }]);
    const slot = slots(h, world)[0];
    const before = fitness(grazer, {}, slot, h, world);
    h.pops.p = 50;
    const after = fitness(grazer, {}, slot, h, world);
    expect(after.survival).toBeLessThan(before.survival);
    expect(after.value).toBeLessThan(before.value);
    expect(after.reasons[2]).toContain('Proboscis worm hunts it here');
    expect(before.reasons[2]).toContain('nothing hunts it here');
  });

  it('law 3: removing the prey drives the hunter down', () => {
    const h = habitat({ g: 300, p: 60 }), world = sea(h, [sp('g', grazer), sp('p', hunter)]);
    step(world);
    const fed = h.pops.p;
    delete h.pops.g;
    step(world);
    expect(h.pops.p ?? 0).toBeLessThan(fed);
  });

  it('a guard the hunter can\'t beat cuts the take by GUARD; a tool that beats it does not', () => {
    const armoured = worm({ front: 'tentacles', sides: 'sclerite' });
    const plain = habitat({ g: 300, p: 50 }), guarded = habitat({ g: 300, p: 50 });
    const a = take(sea(plain, [sp('g', grazer), sp('p', hunter)]), plain, 'g');
    const b = take(sea(guarded, [sp('g', armoured), sp('p', hunter)]), guarded, 'g');
    expect(b).toBeCloseTo(a * GUARD);
    const hooked = habitat({ g: 300, p: 50 });
    expect(take(sea(hooked, [sp('g', armoured), sp('p', worm({ front: 'hook' }))]), hooked, 'g')).toBeCloseTo(a);
  });

  it('the commonest prey is taken most, so rare prey has a refuge', () => {
    const h = habitat({ common: 400, rare: 40, p: 50 });
    const world = sea(h, [sp('common', grazer), sp('rare', worm({ tail: 'pouch' })), sp('p', hunter)]);
    expect(threat(grazer, h, world).survival).toBeLessThan(threat(worm({ tail: 'pouch' }), h, world).survival);
  });

  it('the sea removes exactly the hunted grams; the hunter eats them', () => {
    const h = habitat({ g: 300, p: 50 }), world = sea(h, [sp('g', grazer), sp('p', hunter)]);
    const lost = take(world, h, 'g');
    const free = habitat({ g: 300 }), control = sea(free, [sp('g', grazer), sp('p', hunter)]);
    step(world); step(control);
    expect(free.pops.g - h.pops.g).toBeCloseTo(lost);
  });

  it('law 6: 160 generations of 20 species (four hunters), 8 in each of 16 habitats, take under 100 ms', () => {
    const fronts = ['tentacles', undefined, 'tentacles', undefined] as const, tails = ['bulb', 'pouch', undefined, 'bulb'] as const;
    const species = Array.from({ length: 20 }, (_, i) => i < 4
      ? sp(`h${i}`, worm({ front: i % 2 ? 'hook' : 'proboscis', sides: i > 1 ? 'chaetae' : undefined }))
      : sp(`g${i}`, worm({ front: fronts[i % 4], tail: tails[(i >> 2) % 4], sides: i % 3 ? 'sclerite' : undefined })));
    const fixture = (): World => ({ seed: 1, generation: 0, species, lineages: [], habitats: Array.from({ length: 16 }, (_, i) => ({
      // Like N1's law: 8 species per habitat, two of them hunters; the 20 overlap from habitat to habitat.
      ...habitat(Object.fromEntries([species[i % 4], species[(i + 1) % 4], ...Array.from({ length: 6 }, (_, k) => species[4 + (i + k) % 16])]
        .map((s) => [s.id, 30]))), id: i, area: 120,
      neighbours: [(i + 15) % 16, (i + 1) % 16], borders: [10, 10],
    })) });
    const run = (world: World) => { for (let g = 0; g < 160; g++) step(world); return world; };
    run(fixture());
    let best = Infinity;
    for (let i = 0; i < 3; i++) {
      const world = fixture(), start = performance.now();
      run(world);
      best = Math.min(best, performance.now() - start);
    }
    console.info(`N4 sea: 160 generations × 16 habitats × 20 species, best of three ${best.toFixed(1)} ms`);
    expect(best).toBeLessThan(100);
  });
});
