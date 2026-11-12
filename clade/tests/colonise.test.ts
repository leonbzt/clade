import { expect, it } from 'vitest';
import { DEV_SPECIES } from '../src/data/builds';
import { HEADS_PER_EGG } from '../src/data/economy';
import { coloniseJudgement } from '../src/sim/found';
import { bodyMass } from '../src/sim/fitness';
import { xpFor } from '../src/sim/line';
import { makeWorld } from '../src/sim/sea';
import { finish, launch } from '../src/ui/life/colonise';
import { place } from '../src/ui/placement';

const worm = DEV_SPECIES.find((s) => s.id === 'tentacle-worm')!;

it('Colonise launches deterministically without advancing the sea; unsuitable and inhabited habitats reject it', () => {
  const world = makeWorld(1), before = structuredClone(world);
  const hab = world.habitats.find((h) => launch(world, h.id, worm, 1))!;
  const a = launch(world, hab.id, worm, 1)!, b = launch(world, hab.id, worm, 1)!;
  expect(a.life).toEqual(b.life); expect(world).toEqual(before);
  expect(a.purpose).toContain(hab.name);
  expect(launch(world, 999, worm, 1)).toBeNull();
  const deep = world.habitats.find((h) => h.kind.depth === 'deep')!;
  expect(launch(world, deep.id, worm, 1)).toBeNull();
  expect(launch(world, hab.id, worm, 2)?.life.board).not.toEqual(a.life.board);
  place(world, hab.id, worm); expect(launch(world, hab.id, worm, 3)).toBeNull();
});

it('the terminal result registers a dev choice before founding, once, in the selected habitat in the same generation', () => {
  const world = makeWorld(1), before = structuredClone(world), count = 7;
  const session = world.habitats.map((h) => launch(world, h.id, worm, count)).find((s) => s)!;
  expect(finish(world, session)).toBeNull(); expect(world).toEqual(before);
  session.life.eggs = 9; session.life.phase = 'over'; session.life.cause = 'season';
  const report = finish(world, session)!;
  const hab = world.habitats[session.habitat];
  expect(hab.pops[worm.id]).toBe(9 * HEADS_PER_EGG * bodyMass(worm.build));
  expect(report.heads).toBe(18); expect(report.fit?.reasons).toHaveLength(3);
  expect(world.species.map((s) => s.id)).toEqual(['root-worm', worm.id]);
  expect(world.lineages[0].id).toBe('worm-line'); expect(world.generation).toBe(before.generation);
  const earned = xpFor(9, report.fit!.letter);
  expect(world.lineages[0].xp).toBe(earned);
  expect(finish(world, session)).toBe(report); expect(hab.pops[worm.id]).toBe(18 * bodyMass(worm.build));
  expect(world.lineages[0].xp).toBe(earned);
  expect(world.habitats.filter((h) => h.id !== hab.id)).toEqual(before.habitats.filter((h) => h.id !== hab.id));
});

it('a death with no eggs reports too few and adds no population', () => {
  const world = makeWorld(1);
  const session = world.habitats.map((h) => launch(world, h.id, worm, 1)).find((s) => s)!;
  session.life.phase = 'over'; session.life.cause = 'died';
  expect(finish(world, session)?.outcome).toBe('too-few');
  expect(world.habitats[session.habitat].pops[worm.id]).toBeUndefined();
  expect(world.lineages[0].xp).toBe(0);
});

it('settles a selected card once, judges the heir here, and awards XP for the played parent’s letter', () => {
  const world = makeWorld(1);
  const session = world.habitats.map((h) => launch(world, h.id, worm, 1)).find((s) => s)!;
  const hab = world.habitats[session.habitat];
  session.life.eggs = 9; session.life.phase = 'over'; session.life.cause = 'season';
  const played = coloniseJudgement(world, hab, worm, 9);
  const report = finish(world, session, { kind: 'swap', part: 'proboscis', place: 'front' })!;
  const child = world.species.find((s) => s.parent === worm.id)!;
  expect(child.build.parts).toEqual({ front: 'proboscis' });
  expect(report).toEqual(coloniseJudgement(world, hab, child, 9));
  expect(report.fit!.letter).not.toBe(played.fit!.letter);
  expect(world.lineages[0].xp).toBe(xpFor(9, played.fit!.letter));
  expect(hab.pops).toEqual({ [child.id]: 9 * HEADS_PER_EGG * bodyMass(child.build) });
  const settled = structuredClone(world);
  expect(finish(world, session, { kind: 'gain', part: 'bulb', place: 'tail' })).toBe(report);
  expect(world).toEqual(settled);
});
