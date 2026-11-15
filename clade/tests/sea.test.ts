import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FOODS, REGROW, SEA, WILD } from '../src/data/sea';
import { bodyMass, ceiling, cellKey, density, fitness, reach, slots } from '../src/sim/fitness';
import type { Habitat } from '../src/sim/habitats';
import type { Build, Species, World } from '../src/sim/records';
import { makeWorld, step } from '../src/sim/sea';

const worm: Build = { clade: 'worm', parts: {}, genes: { size: 1, gut: 1 } };
const species = (id = 'worm', build = worm): Species => ({ id, lineage: 'worm-line', parent: null, build, name: id, born: 0 });
function habitat(id = 0): Habitat {
  return {
    id, name: `Shallows ${id}`, kind: { depth: 'shallows', substrate: 'sand', exposure: 'open' },
    tiles: [], area: 100, centre: { x: id, y: 0 }, neighbours: [], borders: [], perimeter: 40,
    stocks: { mats: 3000, detritus: 1000 }, pops: {},
  };
}
const sea = (habitats = [habitat()], residents = [species()]): World => ({
  seed: 7, generation: 0, claimed: [], bars: {}, habitats, species: residents,
  lineages: [{ id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'none' }],
});
// N1's sea laws, measured without wild cousins: their bars never fill here.
const bar = WILD.bar;
beforeAll(() => { WILD.bar = Infinity; });
afterAll(() => { WILD.bar = bar; });
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
    h.stocks.mats = 900; // a grazed-down stand: both crowds want several times more than this
    h.pops = { bare: 10000, tentacles: 10000 };
    const world = sea([h], [species('bare'), species('tentacles', tentacles)]);
    const [rb, rt] = [reach(worm, {}, 'mats', h), reach(tentacles, {}, 'mats', h)];
    expect(10000 * SEA.appetite * (rb + rt) * density(h, 'mats')).toBeGreaterThan(900);
    step(world);
    const bareTarget = 10000 * (1 - SEA.deaths) + 900 * rb / (rb + rt);
    const tentacleTarget = 10000 * (1 - SEA.deaths) + 900 * rt / (rb + rt) / 2;
    expect(h.stocks.mats).toBe(REGROW.mats * ceiling(h, 'mats')); // eaten to 0, then regrown
    expect(h.stocks.detritus).toBe(1000); // neither build can dig; already at its ceiling
    expect(h.pops.bare).toBeCloseTo(10000 + SEA.damping * (bareTarget - 10000));
    expect(h.pops.tentacles).toBeCloseTo(10000 + SEA.damping * (tentacleTarget - 10000));
  });

  it('recomputes the best slot when stocks change and eats only that slot', () => {
    const h = habitat(), build: Build = { ...worm, parts: { tail: 'bulb' } };
    h.pops.worm = 10; h.stocks.detritus = 200; // thin detritus: grazing mats is better
    const world = sea([h], [species('worm', build)]);
    step(world);
    expect(h.stocks.mats).toBeLessThan(3000);
    expect(h.stocks.detritus).toBe(200 + REGROW.detritus * (ceiling(h, 'detritus') - 200));
    h.stocks.mats = 0;
    const untouched = h.stocks.detritus + REGROW.detritus * (ceiling(h, 'detritus') - h.stocks.detritus);
    step(world);
    expect(h.stocks.mats).toBe(REGROW.mats * ceiling(h, 'mats'));
    expect(h.stocks.detritus).toBeLessThan(untouched);
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

  it('lets a lone shallow worm swing and settle by about 40 generations without exceeding its food ceiling', () => {
    const h = habitat(); h.pops.worm = 20 * bodyMass(worm);
    const world = sea([h]), populations: number[] = [], stocks: number[] = [];
    for (let i = 0; i < 160; i++) { step(world); populations.push(h.pops.worm ?? 0); stocks.push(h.stocks.mats); }
    const end = populations[159];
    expect(Math.min(...populations)).toBeGreaterThan(0);
    expect(Math.max(...populations)).toBeLessThanOrEqual(ceiling(h, 'mats'));
    expect(Math.abs(populations[39] - end) / end).toBeLessThan(0.05); // 20 founders on ×10 food; N2's eggs set the real founding
    expect(Math.max(...populations)).toBeGreaterThan(1.05 * end); // an overshoot, then a fall toward equilibrium
    expect(stocks[0]).toBeGreaterThan(stocks[29]);
    for (const food of FOODS) expect(h.stocks[food]).toBeGreaterThanOrEqual(0);
  });
});

describe('letters rank the build; growth reads today\'s food', () => {
  const tentacles: Build = { ...worm, parts: { front: 'tentacles' } };
  const settle = (build: Build, generations = 80) => {
    const h = habitat(), world = sea([h], [species('holder', build)]);
    h.pops.holder = 20 * bodyMass(build);
    run(world, generations);
    return { h, world, slot: slots(h, world)[0] };
  };

  it('a settled holder keeps its letter and just replaces itself on the food it left', () => {
    for (const [build, letter] of [[worm, 'C'], [tentacles, 'B']] as const) {
      const { h, world, slot } = settle(build);
      const fit = fitness(build, {}, slot, h, world), fresh = fitness(build, {}, slot, habitat(), world);
      expect([fit.letter, fresh.letter]).toEqual([letter, letter]);
      expect(SEA.appetite * fit.value).toBeCloseTo(SEA.deaths, 2);
      expect(fresh.value).toBeGreaterThan(fit.value); // fresh food grows faster
    }
  });

  it('a stronger newcomer reads above the holder and takes the slot; a weaker one reads below and dies out', () => {
    for (const [holder, newcomer, wins] of [[worm, tentacles, true], [tentacles, worm, false]] as const) {
      const { h, world, slot } = settle(holder);
      const [home, guest] = [fitness(holder, {}, slot, h, world).value, fitness(newcomer, {}, slot, h, world).value];
      expect(guest > home).toBe(wins);
      world.species.push(species('newcomer', newcomer));
      h.pops.newcomer = 20 * bodyMass(newcomer);
      run(world, 160);
      expect(h.pops.newcomer !== undefined).toBe(wins);
      expect(h.pops.holder !== undefined).toBe(!wins);
    }
  });
});

describe('spread', () => {
  it('moves only where a newcomer would grow at today\'s food, by border / whole perimeter, conserving grams', () => {
    const [source, good, dark, depleted] = [0, 1, 2, 3].map(habitat);
    source.neighbours = [1, 2, 3]; source.borders = [10, 10, 10]; source.perimeter = 100;
    source.pops.worm = 400;
    dark.kind.depth = 'deep'; dark.stocks.mats = 0;
    depleted.stocks.mats = 0;
    const world = sea([source, good, dark, depleted]);
    world.claimed = [1, 2, 3].map((id) => cellKey(id, 'mats')); // spread enters only cells you have won (N4 fix D)
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
      const allowed = slots(h, world).some((slot) => SEA.appetite * fitness(worm, {}, slot, h, world).value > SEA.deaths);
      expect((h.pops.worm ?? 0) > 0).toBe(allowed);
    }
  });

  it('spreads simultaneously, with no second hop or change from habitat traversal order', () => {
    const habitats = [0, 1, 2].map(habitat);
    habitats[0].neighbours = [1]; habitats[0].borders = [10]; habitats[0].pops.worm = 400;
    habitats[1].neighbours = [0, 2]; habitats[1].borders = [10, 10];
    habitats[2].neighbours = [1]; habitats[2].borders = [10];
    const world = sea(habitats);
    world.claimed = [cellKey(1, 'mats'), cellKey(2, 'mats')];
    const reversed = structuredClone(world);
    reversed.habitats.reverse();
    step(world); step(reversed);
    expect(habitats[1].pops.worm).toBeGreaterThan(0);
    expect(habitats[2].pops.worm).toBeUndefined();
    expect([...reversed.habitats].reverse()).toEqual(world.habitats);
  });

  it('keeps a move under two heads\' mass at home, where it would only die on arrival', () => {
    const [source, good] = [0, 1].map(habitat);
    source.neighbours = [1]; source.borders = [10]; source.perimeter = 100; source.pops.worm = 40;
    const world = sea([source, good]);
    world.claimed = [cellKey(1, 'mats')];
    const isolated = structuredClone(world);
    isolated.habitats[0].neighbours = []; isolated.habitats[0].borders = [];
    step(world); step(isolated);
    expect(source.pops.worm * SEA.spread * 10 / 100).toBeLessThan(SEA.extinctionHeads * bodyMass(worm));
    expect(good.pops.worm).toBeUndefined();
    expect(source.pops.worm).toBe(isolated.habitats[0].pops.worm);
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

  it('law 2: the world contains no derived slot, tier, letter, role, link, head count, level or points', () => {
    const world = run(seededScenario(8), 20);
    const visit = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        expect(key).not.toMatch(/^(slots?|tier|letter|role|link|heads|stats|fitness|level|points?)$/);
        visit(child);
      }
    };
    visit(world);
    // `claimed` is a choice and `bars` a timer: neither can be worked out from the rest (N4 fix D, E).
    expect(Object.keys(world).sort()).toEqual(['bars', 'claimed', 'generation', 'habitats', 'lineages', 'seed', 'species']);
  });

  it('law 6: 160 generations of 16 habitats × 8 living species take under 100 ms', () => {
    const residents = Array.from({ length: 8 }, (_, i) => species(`worm-${i}`));
    const fixture = () => {
      const world = sea(Array.from({ length: 16 }, (_, i) => {
        const h = habitat(i);
        h.neighbours = [(i + 15) % 16, (i + 1) % 16]; h.borders = [10, 10];
        h.pops = Object.fromEntries(residents.map((s) => [s.id, 20]));
        return h;
      }), residents);
      world.claimed = world.habitats.map((h) => cellKey(h.id, 'mats')); // every cell won, so the spread runs in full
      return world;
    };
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

  it('law 7: sim imports no view, ui or game, and sea and founding import no Life rules', () => {
    const dir = new URL('../src/sim', import.meta.url);
    for (const file of readdirSync(dir).filter((p) => p.endsWith('.ts'))) {
      const text = readFileSync(join(dir.pathname, file), 'utf8');
      expect(text, file).not.toMatch(/(?:from\s*|import\s*\(?\s*)['"][^'"]*\/(?:view|ui|game)\//);
      if (file === 'sea.ts' || file === 'found.ts')
        expect(text, file).not.toMatch(/(?:from\s*|import\s*\(?\s*)['"](?:\.\/(?:life(?:-body)?|grid|verbs|threat|economy|board)|\.\.\/data\/(?:life|boards))(?:\.ts)?['"]/);
    }
  });
});
