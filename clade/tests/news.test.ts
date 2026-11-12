import { afterEach, describe, expect, it } from 'vitest';
import { WILD } from '../src/data/sea';
import type { Habitat } from '../src/sim/habitats';
import { news, popsOf } from '../src/sim/news';
import type { Build, Species, World } from '../src/sim/records';
import { step, type StepReport } from '../src/sim/sea';

const chance = WILD.chance;
afterEach(() => { WILD.chance = chance; });
const worm = (parts: Build['parts'] = {}): Build => ({ clade: 'worm', parts, genes: { size: 1, gut: 1 } });
const sp = (id: string, build: Build, lineage: string | null = 'worm-line'): Species => ({ id, lineage, parent: null, build, name: id, born: 0 });
const habitat = (id: number, pops: Record<string, number>, neighbours: number[] = []): Habitat => ({
  id, name: `H${id}`, kind: { depth: 'shallows', substrate: 'sand', exposure: 'open' }, tiles: [], area: 40,
  centre: { x: id, y: 0 }, neighbours, borders: neighbours.map(() => 10), perimeter: 20, stocks: { mats: 1200, detritus: 400 }, pops,
});
const life = (world: World, gens = 12) => {
  const before = popsOf(world), reports: StepReport[] = [];
  for (let i = 0; i < gens; i++) reports.push(step(world));
  return news(world, before, reports);
};

describe('news', () => {
  it('every line has a cause; yours come first; a hunter on yours is named', () => {
    WILD.chance = 0.3;
    const world: World = {
      seed: 5, generation: 0, lineages: [{ id: 'worm-line', clade: 'worm', xp: 0, ranks: {}, job: 'worm' }],
      habitats: [habitat(0, { t: 300, hook: 30 }, [1]), habitat(1, {}, [0])],
      species: [sp('t', worm({ front: 'tentacles' })), sp('hook', worm({ front: 'proboscis' }), null)],
    };
    const lines = life(world);

    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) {
      expect(l.cause.length).toBeGreaterThan(3);
      expect(l.text).toContain(l.cause);
    }
    const firstOther = lines.findIndex((l) => !l.yours);
    if (firstOther >= 0) expect(lines.slice(firstOther).every((l) => !l.yours)).toBe(true);
    expect(lines.some((l) => l.species === 't' && /hook hunts it|came from|fed well|food ran short/.test(l.cause))).toBe(true);
  });

  it('a quiet sea has no news', () => {
    WILD.chance = 0;
    const world: World = { seed: 1, generation: 0, lineages: [], habitats: [habitat(0, {})], species: [] };
    expect(life(world)).toEqual([]);
  });
});

it('a species of any line of yours that dies out is told first, with its cause (N4 fix A: the placed arthropod)', async () => {
  const { DEV_SPECIES } = await import('../src/data/builds');
  const { makeWorld } = await import('../src/sim/sea');
  const { place } = await import('../src/ui/placement');
  const { applyPreset } = await import('../src/ui/scenarios');
  const { runLife } = await import('../src/ui/sea-run');
  const world = makeWorld(3), past = applyPreset(world, 'first-worm');
  const flats = world.habitats.find((h) => h.kind.depth === 'flat' && h.kind.substrate === 'mud')!;
  place(world, flats.id, DEV_SPECIES.find((s) => s.id === 'arthropod')!);
  const lost = runLife(world, past).run.news.find((l) => l.species === 'arthropod');
  expect(lost?.text).toBe(`Your Arthropod died out in ${flats.name}: food ran short, graze mats F.`);
});
