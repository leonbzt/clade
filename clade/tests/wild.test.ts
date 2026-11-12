import { afterEach, describe, expect, it } from 'vitest';
import { WILD } from '../src/data/sea';
import { fitness, slots } from '../src/sim/fitness';
import type { Habitat } from '../src/sim/habitats';
import type { Build, Species, World } from '../src/sim/records';
import { step } from '../src/sim/sea';
import { prune } from '../src/sim/wild';

const chance = WILD.chance;
afterEach(() => { WILD.chance = chance; });
const worm = (parts: Build['parts'] = {}): Build => ({ clade: 'worm', parts, genes: { size: 1, gut: 1 } });
const yours = (id: string, build: Build): Species => ({ id, lineage: 'worm-line', parent: null, build, name: id, born: 0 });
const habitat = (id: number, pops: Record<string, number>, substrate: 'sand' | 'mud' = 'sand'): Habitat => ({
  id, name: `H${id}`, kind: { depth: 'shallows', substrate, exposure: 'open' }, tiles: [], area: 40,
  centre: { x: id, y: 0 }, neighbours: [], borders: [], perimeter: 20, stocks: { mats: 1200, detritus: 400 }, pops,
});
const sea = (habitats: Habitat[], species: Species[], seed = 3): World => ({
  seed, generation: 0, habitats, species, lineages: [{ id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'worm' }],
});
/** A sand flat whose mats your tentacle worm holds and whose detritus nobody digs. */
const flat = (seed = 3) => sea([habitat(0, { t: 200 })], [yours('t', worm({ front: 'tentacles' }))], seed);

describe('wild branches', () => {
  it('an unchosen slot buds a wild species: parent set, no lineage, C or B, named, with founders', () => {
    WILD.chance = 1;
    const world = flat(), { buds } = step(world);
    expect(buds.map((b) => [b.slot, b.species.name])).toEqual([['detritus', 'Wild burrowing bulb worm'], ['prey', 'Wild proboscis worm']]);
    const bud = buds[0];
    expect(['B', 'C']).toContain(bud.letter);
    expect(bud.species).toMatchObject({ lineage: null, parent: 't' });
    expect(bud.species.name).toMatch(/^Wild /);
    expect(world.species).toContain(bud.species);
    const h = world.habitats[0], slot = slots(h, world).find((s) => s.id === 'detritus')!;
    expect(h.pops[bud.species.id]).toBeGreaterThan(0);
    expect(['B', 'C']).toContain(fitness(bud.species.build, {}, slot, h, world).letter);
  });

  it('buds are deterministic: the same seed, generation and habitat give the same bud', () => {
    WILD.chance = 0.5;
    const run = (seed: number) => {
      const world = flat(seed);
      return Array.from({ length: 10 }, () => step(world).buds.map((b) => `${world.generation}:${b.species.name}`)).flat();
    };
    expect(run(5)).toEqual(run(5));
    expect(run(5).length).toBeGreaterThan(0);
  });

  it('no bud in a held slot', () => {
    WILD.chance = 1;
    const world = sea([habitat(0, { t: 200, b: 200, p: 30 })],
      [yours('t', worm({ front: 'tentacles' })), yours('b', worm({ tail: 'bulb' })), yours('p', worm({ front: 'proboscis' }))]);
    expect(step(world).buds).toEqual([]);
  });

  it('no candidate at C or B, no bud', () => {
    WILD.chance = 1;
    const deep = habitat(0, { t: 200 }, 'mud'); // mud detritus: every digger reads A or S here
    const world = sea([deep], [yours('t', worm({ front: 'tentacles' }))]);
    expect(step(world).buds.filter((b) => b.slot === 'detritus')).toEqual([]);
  });

  it('wild species living nowhere leave unless they parent another; yours stay (law 4)', () => {
    const wild = (id: string, parent: string): Species => ({ id, lineage: null, parent, build: worm(), name: id, born: 0 });
    const world = sea([habitat(0, { child: 50 })], [yours('mine', worm()), wild('lost', 'mine'), wild('elder', 'mine'), wild('child', 'elder')]);
    expect(prune(world).map((s) => s.id)).toEqual(['lost']);
    expect(world.species.map((s) => s.id)).toEqual(['mine', 'elder', 'child']);
    for (const s of world.species.filter((x) => x.lineage === null)) expect(world.species.some((p) => p.id === s.parent)).toBe(true);
  });
});
