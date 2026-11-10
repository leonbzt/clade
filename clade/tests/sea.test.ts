import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOODS, REGROW, SEA } from '../src/data/sea';
import { bodyMass, ceiling, fitness, slots } from '../src/sim/fitness';
import type { Habitat } from '../src/sim/habitats';
import type { Build, Species, World } from '../src/sim/records';
import { makeWorld, step } from '../src/sim/sea';

const worm: Build = { clade: 'worm', parts: {}, genes: { size: 1, gut: 1 } };
const species = (id = 'worm', build = worm): Species => ({ id, lineage: 'worm-line', parent: null, build, name: id, born: 0 });
function habitat(id = 0): Habitat {
  return {
    id, name: `Shallows ${id}`, kind: { depth: 'shallows', substrate: 'sand', exposure: 'open' },
    tiles: [], area: 100, centre: { x: id, y: 0 }, neighbours: [], borders: [], perimeter: 40,
    stocks: { mats: 300, detritus: 100 }, pops: {},
  };
}
const sea = (habitats = [habitat()], residents = [species()]): World => ({
  seed: 7, generation: 0, habitats, species: residents,
  lineages: [{ id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'none' }],
});
function run(world: World, generations: number) { for (let i = 0; i < generations; i++) step(world); return world; }
const biomass = (world: World) => world.habitats.reduce((sum, h) => sum + Object.values(h.pops).reduce((a, b) => a + b, 0), 0);

describe('sea arithmetic', () => {
  it('regrows each food toward its area-scaled ceiling', () => {
    const h = habitat(), world = sea([h]);
    h.stocks = { mats: 20, detritus: 5 };
    step(world);
    expect(h.stocks.mats).toBe(20 + REGROW.mats * (ceiling(h, 'mats') - 20));
    expect(h.stocks.detritus).toBe(5 + REGROW.detritus * (ceiling(h, 'detritus') - 5));
    expect(world.generation).toBe(1);
  });

  it('splits a shortage by population × reach, then breeds using each build\'s upkeep', () => {
    const h = habitat(), tentacles: Build = { ...worm, parts: { front: 'tentacles' } };
    h.stocks.mats = 0; // regrows to 90 g; the requests are 70 g and 140 g
    h.pops = { bare: 100, tentacles: 100 };
    const world = sea([h], [species('bare'), species('tentacles', tentacles)]);
    step(world);
    const food = REGROW.mats * ceiling(h, 'mats');
    const bareTarget = 100 * (1 - SEA.deaths) + food / 3;
    const tentacleTarget = 100 * (1 - SEA.deaths) + food * 2 / 3 / 2;
    expect(h.stocks.mats).toBe(0);
    expect(h.stocks.detritus).toBe(100); // neither build can dig
    expect(h.pops.bare).toBeCloseTo(100 + SEA.damping * (bareTarget - 100));
    expect(h.pops.tentacles).toBeCloseTo(100 + SEA.damping * (tentacleTarget - 100));
  });

  it('recomputes the best slot when stocks change and eats only that slot', () => {
    const h = habitat(), build: Build = { ...worm, parts: { tail: 'bulb' } };
    h.pops.worm = 10;
    const world = sea([h], [species('worm', build)]);
    step(world);
    expect(h.stocks.mats).toBeLessThan(300);
    expect(h.stocks.detritus).toBe(100);
    h.stocks.mats = 0;
    step(world);
    expect(h.stocks.mats).toBe(REGROW.mats * ceiling(h, 'mats'));
    expect(h.stocks.detritus).toBeLessThan(100);
  });

  it('drives a food-locked population down to extinction, counting two heads by mass', () => {
    const h = habitat(); h.kind.depth = 'deep'; h.stocks.mats = 0;
    const big: Build = { ...worm, genes: { size: 3, gut: 1 } };
    h.pops = { small: 7, big: 7 };
    const world = sea([h], [species('small'), species('big', big)]);
    expect(bodyMass(big) * 2).toBeGreaterThan(7);
    step(world);
    expect(h.pops.small).toBeCloseTo(7 * (1 - SEA.damping * SEA.deaths));
    expect(h.pops.big).toBeUndefined();
    run(world, 10);
    expect(h.pops.small).toBeUndefined();
  });

  it('lets a lone shallow worm swing and settle by about 30 generations without exceeding its food ceiling', () => {
    const h = habitat(); h.pops.worm = 20 * bodyMass(worm);
    const world = sea([h]), populations: number[] = [], stocks: number[] = [];
    for (let i = 0; i < 160; i++) { step(world); populations.push(h.pops.worm ?? 0); stocks.push(h.stocks.mats); }
    expect(Math.min(...populations)).toBeGreaterThan(0);
    expect(Math.max(...populations)).toBeLessThanOrEqual(ceiling(h, 'mats'));
    expect(Math.abs(populations[29] - populations[159]) / populations[159]).toBeLessThan(0.05);
    expect(Math.max(...populations) - Math.min(...populations)).toBeGreaterThan(100);
    expect(Math.max(...populations)).toBeGreaterThan(populations[159]); // an overshoot, then a fall toward equilibrium
    expect(stocks[0]).toBeGreaterThan(stocks[29]);
    expect(populations[159]).toBeCloseTo(REGROW.mats * ceiling(h, 'mats') / SEA.deaths);
    for (const food of FOODS) expect(h.stocks[food]).toBeGreaterThanOrEqual(0);
  });
});

describe('spread', () => {
  it('moves only into predicted C-or-better habitats, by border / whole perimeter, conserving grams', () => {
    const [source, good, dark, depleted] = [0, 1, 2, 3].map(habitat);
    source.neighbours = [1, 2, 3]; source.borders = [10, 10, 10]; source.perimeter = 100;
    source.pops.worm = 400;
    dark.kind.depth = 'deep'; dark.stocks.mats = 0;
    depleted.stocks.mats = 0;
    const world = sea([source, good, dark, depleted]);
    const isolated = structuredClone(world);
    isolated.habitats[0].neighbours = []; isolated.habitats[0].borders = [];
    step(isolated);
    step(world);
    const afterBreed = biomass(isolated), moved = afterBreed * SEA.spread * 10 / source.perimeter;
    expect(good.pops.worm).toBeCloseTo(moved);
    expect(source.pops.worm).toBeCloseTo(afterBreed - moved);
    expect(dark.pops.worm).toBeUndefined();
    expect(depleted.pops.worm).toBeUndefined();
    expect(biomass(world)).toBeCloseTo(afterBreed);
    for (const h of [good, dark, depleted]) {
      const letters = slots(h, world).map((slot) => fitness(worm, {}, slot, h, world).letter);
      const allowed = letters.some((l) => ['S', 'A', 'B', 'C'].includes(l));
      expect((h.pops.worm ?? 0) > 0).toBe(allowed);
    }
  });

  it('spreads simultaneously, with no second hop or change from habitat traversal order', () => {
    const habitats = [0, 1, 2].map(habitat);
    habitats[0].neighbours = [1]; habitats[0].borders = [10]; habitats[0].pops.worm = 400;
    habitats[1].neighbours = [0, 2]; habitats[1].borders = [10, 10];
    habitats[2].neighbours = [1]; habitats[2].borders = [10];
    const world = sea(habitats), reversed = structuredClone(world);
    reversed.habitats.reverse();
    step(world); step(reversed);
    expect(habitats[1].pops.worm).toBeGreaterThan(0);
    expect(habitats[2].pops.worm).toBeUndefined();
    expect([...reversed.habitats].reverse()).toEqual(world.habitats);
  });
});

describe('sea contracts', () => {
  function seededScenario(seed: number) {
    const world = makeWorld(seed);
    world.lineages = sea().lineages;
    world.species = [species('tentacles', { ...worm, parts: { front: 'tentacles' } }),
      species('bulb', { ...worm, parts: { tail: 'bulb' } }), species('sclerite', { ...worm, parts: { sides: 'sclerite' } })];
    world.species.forEach((s, i) => (world.habitats[i].pops[s.id] = 20 * bodyMass(s.build)));
    return world;
  }

  it('recreates geometry and full food stocks from the seed and gives the same sea after 160 generations', () => {
    const a = seededScenario(7), b = seededScenario(7);
    for (const h of a.habitats) for (const food of FOODS) expect(h.stocks[food]).toBe(ceiling(h, food));
    expect(run(a, 160)).toEqual(run(b, 160));
    expect(a.generation).toBe(160);
  });

  it('law 2: the world contains no derived slot, tier, letter, role, link or head count', () => {
    const world = run(seededScenario(8), 20);
    const visit = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        expect(key).not.toMatch(/^(slots?|tier|letter|role|link|heads|stats|fitness)$/);
        visit(child);
      }
    };
    visit(world);
    expect(Object.keys(world).sort()).toEqual(['generation', 'habitats', 'lineages', 'seed', 'species']);
  });

  it('law 6: 160 generations of 16 habitats × 8 living species take under 100 ms', () => {
    const residents = Array.from({ length: 8 }, (_, i) => species(`worm-${i}`));
    const fixture = () => sea(Array.from({ length: 16 }, (_, i) => {
      const h = habitat(i);
      h.neighbours = [(i + 15) % 16, (i + 1) % 16]; h.borders = [10, 10];
      h.pops = Object.fromEntries(residents.map((s) => [s.id, 20]));
      return h;
    }), residents);
    run(fixture(), 160); // warm the same path before timing, as in the ground test
    let best = Infinity;
    for (let i = 0; i < 3; i++) {
      const world = fixture(), start = performance.now();
      run(world, 160);
      best = Math.min(best, performance.now() - start);
      for (const h of world.habitats) expect(Object.values(h.pops).filter((p) => p > 0)).toHaveLength(8);
    }
    console.info(`N1 sea: 160 generations × 16 habitats × 8 species, best of three ${best.toFixed(1)} ms`);
    expect(best, `best of three: ${best.toFixed(1)} ms`).toBeLessThan(100);
  });

  it('law 7: sim imports no view, ui, game or Life module (source grep)', () => {
    const dir = new URL('../src/sim', import.meta.url);
    for (const file of readdirSync(dir).filter((p) => p.endsWith('.ts'))) {
      const text = readFileSync(join(dir.pathname, file), 'utf8');
      expect(text, file).not.toMatch(/(?:from\s*|import\s*\()['"][^'"]*(?:\/(?:view|ui|game)\/|\/life(?:['".]|\/))/);
    }
  });
});
