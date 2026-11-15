// N4 fix D, E: the quiet sea. Your species spread only into cells you have won; wild cousins come on a bar, on a leash.
import { describe, expect, it } from 'vitest';
import { DEV_SPECIES } from '../src/data/builds';
import { ADOPT_EGGS } from '../src/data/economy';
import { bodyMass, cellKey } from '../src/sim/fitness';
import { adopt, colonise, found } from '../src/sim/found';
import type { Habitat } from '../src/sim/habitats';
import type { Build, Species, World } from '../src/sim/records';
import { makeWorld, step } from '../src/sim/sea';
import { place } from '../src/ui/placement';
import { applyPreset } from '../src/ui/scenarios';
import { bestFit } from '../src/view/tiers';

const worm = (parts: Build['parts'] = {}): Build => ({ clade: 'worm', parts, genes: { size: 1, gut: 1 } });
const sp = (id: string, build: Build, lineage: string | null = 'worm-line'): Species => ({ id, lineage, parent: null, build, name: id, born: 0 });
const habitat = (id: number, pops: Record<string, number> = {}): Habitat => ({
  id, name: `H${id}`, kind: { depth: 'shallows', substrate: 'sand', exposure: 'open' }, tiles: [], area: 100,
  centre: { x: id, y: 0 }, neighbours: [1 - id], borders: [50], perimeter: 100, stocks: { mats: 3000, detritus: 1000 }, pops,
});
const sea = (habitats: Habitat[], species: Species[]): World => ({
  seed: 3, generation: 0, claimed: [], bars: {}, habitats, species, lineages: [{ id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'worm' }],
});
const run = (world: World, generations: number) => { for (let i = 0; i < generations; i++) step(world); return world; };
const tentacle = DEV_SPECIES.find((s) => s.id === 'tentacle-worm')!;

describe('claimed cells', () => {
  it('your species spread only into a cell you have won, and it refills after a crash; wild species never spread', () => {
    const home = habitat(0, { mine: 400, wild: 400 }), next = habitat(1);
    const world = sea([home, next], [sp('mine', worm({ front: 'tentacles' })), sp('wild', worm({ front: 'tentacles' }), null)]);
    run(world, 2);
    expect(next.pops).toEqual({});
    world.claimed.push(cellKey(1, 'detritus')); // not the cell a grazer would take there
    expect(step(world).moves).toEqual([]);
    world.claimed.push(cellKey(1, 'mats'));
    expect(step(world).moves.map((m) => [m.species, m.to])).toEqual([['mine', 1]]);
    run(world, 2);
    delete next.pops.mine; // a crash empties the cell: it is still yours, so it refills from next door
    step(world);
    expect(next.pops.mine).toBeGreaterThan(0);
    expect(next.pops.wild).toBeUndefined();
  });

  it('eggs claim the cell their build takes if they grow there; a placement and an adopted cousin claim theirs', () => {
    const world = makeWorld(1);
    const [a, b] = world.habitats.filter((h) => bestFit(tentacle.build, {}, h, world)?.fit.letter !== 'F');
    const cell = (h: Habitat) => cellKey(h.id, bestFit(tentacle.build, {}, h, world)!.slot.id);
    expect(place(world, a.id, tentacle)).toBe(true);
    expect(world.claimed).toEqual([cell(a)]);
    const mine = world.species.find((s) => s.id === tentacle.id)!;
    found(world, b, mine, 0.5); // one head: too few to hold, so nothing is won
    expect(world.claimed).toEqual([cell(a)]);
    found(world, b, mine, 10);
    expect(world.claimed).toEqual([cell(a), cell(b)]);
    const barren = world.habitats.find((h) => !colonise(world, h, mine) && !(h.pops[mine.id] > 0))!;
    found(world, barren, mine, 10); // they shrink there: no claim
    expect(world.claimed).toHaveLength(2);
    // A wild cousin's cells become yours when you adopt it, wherever it lives.
    const wild = sp('wild-b', worm({ tail: 'bulb' }), null), [c, d] = world.habitats.filter((h) => h !== a && h !== b && bestFit(wild.build, {}, h, world)?.fit.letter !== 'F');
    world.species.push(wild);
    for (const h of [c, d]) h.pops[wild.id] = 40 * bodyMass(wild.build);
    expect(adopt(world, wild, ADOPT_EGGS)).toBe(true);
    for (const h of [c, d]) expect(world.claimed).toContain(cellKey(h.id, bestFit(wild.build, {}, h, world)!.slot.id));
    expect(world.claimed).toHaveLength(4);
  });

  it('a preset claims the cells it fills, and a hundred generations add none', () => {
    const world = makeWorld(2);
    applyPreset(world, 'midgame');
    expect(world.generation).toBe(100);
    expect(world.claimed).toHaveLength(5);
    const yours = world.habitats.filter((h) => world.species.some((s) => s.lineage !== null && h.pops[s.id] > 0));
    for (const h of yours) expect(world.claimed.some((key) => key.startsWith(`${h.id}:`)), h.name).toBe(true);
  });
});
