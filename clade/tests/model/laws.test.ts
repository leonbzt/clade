// W1 contract: the laws' directions, one test a law (direction §4). The numbers are data/roster/laws.ts and move by
// feel; these directions do not.
import { describe, expect, it } from 'vitest';
import { CLADES } from '../../src/data/roster/clades';
import { KIND } from '../../src/data/roster/kinds';
import { LADDER, LAWS } from '../../src/data/roster/laws';
import { NAMED } from '../../src/data/roster/species';
import { START } from '../../src/data/roster/toy';
import { dialOf, eats, fitness, guardLeft, jobsAt, lives, massOf, spareOf, stockOf, upkeepOf } from '../../src/model/laws';
import type { Build, DialId, Site } from '../../src/model/types';

const more = (b: Build, dial: DialId, by: number): Build => ({ ...b, dials: { ...b.dials, [dial]: (b.dials[dial] ?? 0) + by } });
const build = (id: string) => NAMED[id].build;
const site = (kind: string, pops: Site['pops'] = []): Site => ({ kind: KIND[kind], area: 2000, pops });

describe('the laws', () => {
  it('law 1: a bigger body pays less upkeep a gram; every stat point and costly mutation adds to it', () => {
    expect(upkeepOf(more(START, 'size', 1))).toBeLessThan(upkeepOf(START));
    expect(upkeepOf(more(START, 'guard', 1))).toBeCloseTo(upkeepOf(START) + LAWS.cost.guard);
    expect(upkeepOf({ ...START, mutations: ['air-breathing'] })).toBeGreaterThan(upkeepOf(START));
    expect(upkeepOf({ ...START, mutations: ['red'] }), 'a look is free').toBe(upkeepOf(START));
  });
  it('law 1: a bigger body is slower to replace: it loses more where deaths are high', () => {
    const big = more(START, 'size', 1), calm = site('deep-mud'), rough = site('flat-mud-open');
    const share = (b: Build, s: Site) => fitness(b, 'detritus', s).survival;
    expect(share(big, rough) / share(START, rough)).toBeLessThan(share(big, calm) / share(START, calm));
  });
  it('law 2: the build decides the food: off its diet nothing, off its ground a part, a weak bite a part', () => {
    expect(fitness(START, 'plankton', site('flat-mud-lee')).value).toBe(0);
    expect(fitness(START, 'mats', site('flat-rock-lee')).intake).toBeLessThan(fitness(START, 'mats', site('flat-mud-lee')).intake * 0.9);
    const snail = build('common-periwinkle'), kelp = site('shallows-rock-lee', [{ build: build('giant-kelp'), job: 'light', grams: 1 }]);
    expect(fitness(more(snail, 'size', 0.5), 'greens', kelp).intake, 'a bigger gut takes more of a tough green').toBeGreaterThan(fitness(snail, 'greens', kelp).intake);
  });
  it('law 3: prey sits in a size window under the hunter; a bite point moves the window up', () => {
    const star = build('common-starfish'), k = KIND['shallows-rock-open'];
    expect(eats(star, build('blue-mussel'), k)).toBe(true);
    expect(eats(star, build('giant-clam'), k), 'too big').toBe(false);
    expect(eats(build('tiger-shark'), build('acorn-barnacle'), k), 'too small').toBe(false);
    expect(eats(build('blue-mussel'), star, k), 'not a hunter').toBe(false);
  });
  it('law 4: a guard leaves less of the take, a point at a time; a counter leaves all of it; speed beats fleeing', () => {
    const urchin = build('purple-urchin'), tuna = build('yellowfin-tuna'), fish = build('european-anchovy');
    const noCounter = CLADES.find((c) => c.diet.includes('prey') && !c.beats.includes('spines'))!, counter = CLADES.find((c) => c.beats.includes('shell'))!;
    const hunter = (clade: string): Build => ({ clade, dials: {}, mutations: [] });
    expect(guardLeft(hunter(noCounter.id), more(urchin, 'guard', 1))).toBeCloseTo(guardLeft(hunter(noCounter.id), urchin) * LAWS.hunt.guard);
    expect(guardLeft(hunter(counter.id), build('blue-mussel'))).toBe(1);
    expect(guardLeft(tuna, fish), 'the faster hunter').toBe(1);
    expect(guardLeft(fish, tuna), 'the slower one').toBeLessThan(1);
  });
  it('law 4: a hunter here that eats you costs you survival; a guard point wins some back', () => {
    const worm = START, crab = build('green-shore-crab');
    expect(eats(crab, worm, KIND['flat-mud-lee'])).toBe(true);
    const quiet = site('flat-mud-lee'), hunted = site('flat-mud-lee', [{ build: crab, job: 'hunt', grams: 500 }]);
    expect(fitness(worm, 'mats', hunted).survival).toBeLessThan(fitness(worm, 'mats', quiet).survival);
    expect(fitness(worm, 'mats', hunted).by).toEqual([crab]);
    const gain = (s: Site) => fitness(more(worm, 'guard', 1), 'mats', s).value / fitness(worm, 'mats', s).value;
    expect(gain(hunted)).toBeGreaterThan(gain(quiet));
  });
  it('law 5: a producer adds its stocks to the ground\'s, by the light; jobs exist from LAWS.stockFloor', () => {
    const bare = site('shallows-sand-lee'), grass = site('shallows-sand-lee', [{ build: build('turtle-grass'), job: 'light', grams: 1 }]);
    expect(stockOf(bare, 'greens')).toBe(0);
    expect(stockOf(grass, 'greens')).toBeGreaterThan(LAWS.stockFloor);
    expect(jobsAt(bare)).not.toContain('greens');
    expect(jobsAt(grass)).toContain('greens');
    expect(fitness(build('turtle-grass'), 'light', site('deep-sand')).value, 'no light, no growth').toBe(0);
    expect(fitness(build('giant-kelp'), 'light', bare).value, 'kelp needs rock').toBe(0);
  });
  it('law 6: a hunt job exists only above the refuge; the hunter stands at a fraction of what it reaches', () => {
    const worms = (grams: number) => site('flat-mud-lee', [{ build: START, job: 'mats', grams }]);
    expect(jobsAt(worms(300))).not.toContain('hunt');
    expect(spareOf(worms(300))).toBe(0);
    expect(jobsAt(worms(20000))).toContain('hunt');
    const f = fitness(build('green-shore-crab'), 'hunt', worms(20000));
    expect(f.grams).toBeGreaterThan(0);
    expect(f.grams).toBeLessThan(20000 * LAWS.hunt.transfer);
  });
  it('law 7: a build lives where it has one adaptation of each group; a key mutation counts', () => {
    expect(lives(START, KIND['deep-rock'])).toBe(true);
    expect(lives(START, KIND['shore-mud'])).toBe(false);
    expect(lives({ ...START, mutations: ['air-breathing'] }, KIND['shore-mud'])).toBe(true);
    expect(lives(build('yellowfin-tuna'), KIND['flat-sand-lee']), 'the tide leaves it dry').toBe(false);
    expect(fitness(START, 'detritus', site('shore-mud')).reasons[0]).toContain('air');
  });
  it('the curve: a build grows where appetite × value > 1; the ladder is ×1.5 a letter; three reasons, one cause each', () => {
    const f = fitness(START, 'mats', site('flat-mud-lee'));
    expect(f.value).toBeCloseTo(f.intake / (f.upkeep + f.upkeep / f.survival - f.upkeep));
    expect(LADDER.find(([l]) => l === 'D')![1]).toBeCloseTo(1 / LAWS.appetite);
    expect(LADDER.find(([l]) => l === 'C')![1] / LADDER.find(([l]) => l === 'D')![1]).toBeCloseTo(1.5);
    for (const r of f.reasons) expect(r.length).toBeGreaterThan(5);
    expect(massOf({ ...START, mutations: ['giant'] }), 'a push mutation moves its dial').toBeGreaterThan(massOf(START));
    expect(dialOf({ ...START, mutations: ['fecund'] }, 'brood')).toBe(dialOf(START, 'brood') + 1);
  });
});
