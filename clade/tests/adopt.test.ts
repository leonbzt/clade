// N4 E: Challenge a held slot; Adopt a wild species by playing a Life as it.
import { describe, expect, it } from 'vitest';
import { DEV_LINEAGES, DEV_SPECIES } from '../src/data/builds';
import { ADOPT_EGGS } from '../src/data/economy';
import { YOUR_LINE } from '../src/data/lines';
import { bodyMass } from '../src/sim/fitness';
import { colonise } from '../src/sim/found';
import type { Species, World } from '../src/sim/records';
import { makeWorld } from '../src/sim/sea';
import { finish, launch } from '../src/ui/life/colonise';
import { clutchOf } from '../src/ui/life/hatching';
import { homeLabel } from '../src/view/home';

const tentacle = DEV_SPECIES.find((s) => s.id === 'tentacle-worm')!;
const wild: Species = { ...structuredClone(tentacle), id: 'wild-t', lineage: null, parent: 'root-worm', name: 'Wild tentacle worm' };
function setup() {
  const world: World = makeWorld(1);
  world.lineages.push(structuredClone(DEV_LINEAGES[0]));
  const hab = world.habitats.find((h) => colonise(world, h, tentacle))!;
  world.species.push(structuredClone(DEV_SPECIES[0]), structuredClone(wild));
  hab.pops['wild-t'] = 40 * bodyMass(wild.build);
  return { world, hab };
}
const play = (world: World, hab: number, eggs: number) => {
  const session = launch(world, hab, world.species.find((s) => s.id === 'wild-t')!, 1, true)!;
  Object.assign(session.life, { eggs, phase: 'over', cause: 'season' });
  return session;
};

describe('challenge and adopt', () => {
  it('a slot held by another line reads Challenge, with both letters', () => {
    const { world, hab } = setup(), purpose = colonise(world, hab, tentacle)!;
    expect(purpose.holder?.species.id).toBe('wild-t');
    expect(purpose.text).toMatch(new RegExp(`^Challenge Wild tentacle worm \\(${purpose.holder!.letter}\\) in .* · your Tentacle worm ${purpose.fit.letter}$`));
  });

  it('a home-map target names its holder', () => {
    const { world, hab } = setup(), from = world.habitats[hab.neighbours[0]];
    world.species.push(structuredClone(tentacle)); from.pops[tentacle.id] = 100;
    const label = homeLabel(world, hab);
    expect(label).toMatchObject({ kind: 'target', reason: 'Wild tentacle worm holds it' });
  });

  it(`below ${ADOPT_EGGS} eggs it stays wild: the eggs hatch wild, no form, no XP`, () => {
    const { world, hab } = setup(), before = hab.pops['wild-t'], xp = world.lineages[0].xp;
    const session = play(world, hab.id, ADOPT_EGGS - 1);
    expect(session.purpose).toMatch(/^Adopt Wild tentacle worm/);
    expect(clutchOf(world, session)!.offers).toEqual([]);
    expect(finish(world, session)).not.toBeNull();
    expect(session.adopted).toBe(false);
    expect(world.species.find((s) => s.id === 'wild-t')!.lineage).toBeNull();
    expect(hab.pops['wild-t']).toBeGreaterThan(before);
    expect(world.lineages[0].xp).toBe(xp);
  });

  it(`at ${ADOPT_EGGS} eggs it joins your line, its parent kept`, () => {
    const { world, hab } = setup(), xp = world.lineages[0].xp;
    const session = play(world, hab.id, ADOPT_EGGS);
    expect(clutchOf(world, session)!.offers.length).toBeGreaterThan(0);
    finish(world, session);
    expect(session.adopted).toBe(true);
    expect(world.species.find((s) => s.id === 'wild-t')).toMatchObject({ lineage: YOUR_LINE, parent: 'root-worm' });
    expect(world.lineages[0].xp).toBeGreaterThan(xp);
  });
});
