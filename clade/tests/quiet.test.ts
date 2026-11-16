// N4 fix D, E: the quiet sea. Your species spread only into cells you have won; wild cousins come on a bar, on a leash.
import { describe, expect, it } from 'vitest';
import { DEV_SPECIES } from '../src/data/builds';
import { ADOPT_EGGS } from '../src/data/economy';
import { HUNT, WILD } from '../src/data/sea';
import { bodyMass, cellKey } from '../src/sim/fitness';
import { adopt, colonise, found } from '../src/sim/found';
import type { Habitat } from '../src/sim/habitats';
import { speciesKit } from '../src/sim/hunt';
import { nearestBar } from '../src/sim/news';
import type { Build, Species, World } from '../src/sim/records';
import { makeWorld, step } from '../src/sim/sea';
import { place } from '../src/ui/placement';
import { applyPreset, skip } from '../src/ui/scenarios';
import { bestFit, heldSlots } from '../src/view/tiers';

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

describe('the quiet sea on real maps', () => {
  it('96 idle generations after Life 1 leave your one cell: nothing of yours spreads, and cousins come only where you live', () => {
    const world = makeWorld(1);
    applyPreset(world, 'first-worm');
    const home = world.habitats.find((h) => Object.keys(h.pops).length)!, first = world.species[0];
    found(world, home, first, 10); // Life 1's eggs, laid at home
    const cousins: { generation: number; habitat: number; parent: string }[] = [];
    for (let g = 0; g < 96; g++) for (const b of step(world).buds) cousins.push({ generation: world.generation, habitat: b.habitat, parent: b.parent.id });
    expect(world.claimed).toEqual([cellKey(home.id, 'mats')]);
    expect(world.habitats.filter((h) => Object.values(h.pops).some((p) => p > 0))).toEqual([home]);
    expect(home.pops[first.id]).toBeGreaterThan(0);
    expect(cousins.length).toBeGreaterThan(0);
    for (const c of cousins) {
      expect(c.generation).toBeGreaterThanOrEqual(WILD.bar);
      expect(c).toMatchObject({ habitat: home.id, parent: first.id });
    }
    // The quiet line never promises a cousin that no build on the leash could be.
    const next = nearestBar(world);
    if (next) expect(next.text).toMatch(/^A wild cousin takes (Graze|Dig|Hunt) in .+ in \d+ generations?\.$/);
  });

  it('the trough test: the midgame preset on three seeds for 160 generations; hunters come, no prey falls under its refuge, no holder is lost', () => {
    let best = Infinity;
    for (const seed of [1, 2, 3]) {
      const world = makeWorld(seed), early = applyPreset(world, 'midgame'); // 100 generations: the cousins and the first troughs
      const hunters = new Set(world.species.filter((s) => speciesKit(s).hunts).map((s) => s.id));
      const holders = world.habitats.flatMap((h) => heldSlots(h, world).flatMap((cell) => cell.holders.map((o) => ({ h, id: o.species.id }))));
      expect(holders.some((o) => hunters.has(o.id)), `seed ${seed}: a hunter holds a cell`).toBe(true);
      const start = performance.now(), frames = skip(world, early, 60);
      best = Math.min(best, performance.now() - start);
      expect(frames).toHaveLength(161);
      for (const s of world.species) if (speciesKit(s).hunts) hunters.add(s.id);
      for (const frame of frames) for (const h of world.habitats) {
        const pops = Object.entries(frame.habitats[h.id].pops);
        if (!pops.some(([id, grams]) => hunters.has(id) && grams > 0)) continue;
        const prey = pops.reduce((sum, [id, grams]) => sum + (hunters.has(id) ? 0 : grams), 0);
        expect(prey, `seed ${seed}, generation ${frame.generation}, ${h.name}`).toBeGreaterThanOrEqual(HUNT.refuge[h.kind.substrate] * h.area);
      }
      for (const { h, id } of holders) expect(h.pops[id] ?? 0, `seed ${seed}: ${id} in ${h.name}`).toBeGreaterThan(0);
      // Every cell you won is still held by a species of yours.
      for (const key of world.claimed) {
        const [id, slot] = key.split(':'), h = world.habitats.find((x) => x.id === +id)!;
        expect(heldSlots(h, world).find((cell) => cell.slot.id === slot)?.holders.some((o) => o.species.lineage !== null), `seed ${seed}: ${key}`).toBe(true);
      }
    }
    console.info(`quiet sea: 60 generations of the midgame map with bars and cousins, best of three seeds ${best.toFixed(1)} ms`);
    expect(best).toBeLessThan(100); // law 6: the bars and the leash stay inside the sea's budget
  });
});
