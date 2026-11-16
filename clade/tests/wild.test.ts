// N4 fix E: wild cousins come on a bar, on a leash. No dice.
import { describe, expect, it } from 'vitest';
import { HUNT, WILD } from '../src/data/sea';
import { cellKey, fitness, slots } from '../src/sim/fitness';
import type { Habitat } from '../src/sim/habitats';
import type { Build, Species, World } from '../src/sim/records';
import { grows, step } from '../src/sim/sea';
import { cousinIn, prune } from '../src/sim/wild';

const worm = (parts: Build['parts'] = {}): Build => ({ clade: 'worm', parts, genes: { size: 1, gut: 1 } });
const sp = (id: string, build: Build, lineage: string | null = 'worm-line'): Species => ({ id, lineage, parent: null, build, name: id, born: 0 });
const habitat = (id: number, pops: Record<string, number>, substrate: 'sand' | 'mud' = 'sand'): Habitat => ({
  id, name: `H${id}`, kind: { depth: 'shallows', substrate, exposure: 'open' }, tiles: [], area: 40,
  centre: { x: id, y: 0 }, neighbours: [], borders: [], perimeter: 20, stocks: { mats: 1200, detritus: 400 }, pops,
});
const sea = (habitats: Habitat[], species: Species[], seed = 3): World => ({
  seed, generation: 0, claimed: [], bars: {}, habitats, species, lineages: [{ id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'worm' }],
});
/** A sand flat whose mats your tentacle worm holds and whose detritus nobody digs. */
const flat = (seed = 3) => sea([habitat(0, { t: 200 })], [sp('t', worm({ front: 'tentacles' }))], seed);
const RANK = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };

describe('wild cousins', () => {
  it('a bar fills in exactly WILD.bar generations; then a cousin takes the open cell: B at most, it grows, its parent lives there', () => {
    const world = flat(), h = world.habitats[0];
    for (let g = 1; g < WILD.bar; g++) {
      expect(step(world).buds, `generation ${g}`).toEqual([]);
      expect(cousinIn(world, 0, 'detritus')).toBe(WILD.bar - g);
    }
    const slot = slots(h, world).find((s) => s.id === 'detritus')!;
    const [bud, ...more] = step(world).buds.filter((b) => b.slot === 'detritus');
    expect(more).toEqual([]);
    expect(bud.species).toMatchObject({ lineage: null, parent: 't', born: WILD.bar - 1 });
    expect(bud.species.name).toMatch(/^Wild /);
    expect(world.species).toContain(bud.species);
    expect(h.pops[bud.parent.id]).toBeGreaterThan(0); // law 4: its parent is a species living in this habitat
    expect(h.pops[bud.species.id]).toBe(WILD.founders);
    const fit = fitness(bud.species.build, {}, slot, h, world);
    expect(RANK[fit.letter]).toBeLessThanOrEqual(RANK.B);
    expect(grows(fit.value)).toBe(true);
    expect(world.bars[cellKey(0, 'detritus')]).toBeUndefined(); // the bar restarts
    step(world);
    expect(cousinIn(world, 0, 'detritus')).toBeNull(); // the cell is held now
  });

  it('bars are a clock, not dice: any seed gives the same cousin in the same generation', () => {
    const run = (seed: number) => {
      const world = flat(seed);
      return Array.from({ length: WILD.bar + 4 }, () => step(world).buds.map((b) => `${world.generation}:${b.slot}:${b.species.name}`)).flat();
    };
    expect(run(5)).toEqual(run(9));
    expect(run(5).length).toBeGreaterThan(0);
  });

  it('a bar runs only on an open cell where a species of yours lives; it starts again from 0 when you leave', () => {
    const held = sea([habitat(0, { t: 200, b: 200 })], [sp('t', worm({ front: 'tentacles' })), sp('b', worm({ tail: 'bulb' }))]);
    step(held);
    expect(cousinIn(held, 0, 'mats')).toBeNull();
    expect(cousinIn(held, 0, 'detritus')).toBeNull();
    const wild = sea([habitat(0, { t: 200 })], [sp('t', worm({ front: 'tentacles' }), null)]); // nobody of yours: no clock
    for (let g = 0; g < WILD.bar + 2; g++) expect(step(wild).buds).toEqual([]);
    expect(wild.bars).toEqual({});
    const world = flat();
    for (let g = 0; g < 10; g++) step(world);
    expect(world.bars[cellKey(0, 'detritus')]).toBe(10);
    const kept = world.habitats[0].pops.t;
    delete world.habitats[0].pops.t; // you leave
    step(world);
    expect(world.bars).toEqual({});
    world.habitats[0].pops.t = kept; // and come back: the bar starts over
    step(world);
    expect(world.bars[cellKey(0, 'detritus')]).toBe(1);
  });

  it('no build on the leash reads B at most, no cousin; the bar restarts', () => {
    const mud = habitat(0, { t: 200 }, 'mud'); // mud detritus: every digger reads A or S here
    const world = sea([mud], [sp('t', worm({ front: 'tentacles' }))]);
    world.bars[cellKey(0, 'detritus')] = WILD.bar - 1;
    expect(step(world).buds.filter((b) => b.slot === 'detritus')).toEqual([]);
    expect(world.bars[cellKey(0, 'detritus')]).toBeUndefined();
  });

  it('the hunt cell waits until the prey above the refuge weighs HUNT.from; then a hunting cousin comes', () => {
    const thin = sea([habitat(0, { t: HUNT.from })], [sp('t', worm({ front: 'tentacles' }))]); // under HUNT.from above the refuge
    step(thin);
    expect(cousinIn(thin, 0, 'prey')).toBeNull();
    const rich = sea([habitat(0, { t: 2 * HUNT.from })], [sp('t', worm({ front: 'tentacles' }))]);
    rich.bars[cellKey(0, 'prey')] = WILD.bar - 1;
    const [bud] = step(rich).buds.filter((b) => b.slot === 'prey');
    expect(bud.species.build.parts.front).toMatch(/^(proboscis|hook)$/);
    expect(bud.parent.id).toBe('t');
  });

  it('wild species living nowhere leave unless they parent another; yours stay (law 4)', () => {
    const wild = (id: string, parent: string): Species => ({ ...sp(id, worm(), null), parent });
    const world = sea([habitat(0, { child: 50 })], [sp('mine', worm()), wild('lost', 'mine'), wild('elder', 'mine'), wild('child', 'elder')]);
    expect(prune(world).map((s) => s.id)).toEqual(['lost']);
    expect(world.species.map((s) => s.id)).toEqual(['mine', 'elder', 'child']);
    for (const s of world.species.filter((x) => x.lineage === null)) expect(world.species.some((p) => p.id === s.parent)).toBe(true);
  });
});
