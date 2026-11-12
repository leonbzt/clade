import { expect, it } from 'vitest';
import { DEV_SPECIES } from '../src/data/builds';
import { LINE_RULE } from '../src/data/lines';
import { heirBuild } from '../src/sim/clutch';
import { coloniseJudgement } from '../src/sim/found';
import { barOf } from '../src/sim/line';
import { makeWorld } from '../src/sim/sea';
import { finish, launch } from '../src/ui/life/colonise';
import { clutchOf } from '../src/ui/life/hatching';

const worm = DEV_SPECIES.find((s) => s.id === 'tentacle-worm')!;
function ended(eggs: number) {
  const world = makeWorld(1);
  const session = world.habitats.map((h) => launch(world, h.id, worm, 1)).find((s) => s)!;
  session.life.eggs = eggs; session.life.phase = 'over'; session.life.cause = 'season';
  return { world, session, hab: world.habitats[session.habitat] };
}

it('the clutch screen is deterministic, judges each heir here and signs its upkeep change', () => {
  const { world, session, hab } = ended(12), before = structuredClone(world);
  const clutch = clutchOf(world, session)!;
  expect(clutchOf(world, session)).toEqual(clutch);
  expect(world).toEqual(before);
  expect(clutch.offers).toHaveLength(3);
  expect(clutch.letter).toBe(coloniseJudgement(world, hab, worm, 12).fit!.letter);
  for (const o of clutch.offers) {
    const heir = { ...worm, build: heirBuild(worm.build, o.card) };
    expect(o.letter).toBe(coloniseJudgement(world, hab, heir, 12).fit!.letter);
    if (o.card.kind === 'lose') expect(o.upkeep).toBeLessThanOrEqual(0);
    if (o.card.kind === 'swap') expect(o.replaces).toBeTruthy(); else expect(o.replaces).toBeNull();
  }
});

it('no eggs give no cards; settling records the heir and the XP gained for the bar', () => {
  expect(clutchOf(ended(0).world, ended(0).session)!.offers).toEqual([]);
  const { world, session } = ended(9), clutch = clutchOf(world, session)!;
  finish(world, session, clutch.offers[0].card);
  expect(session.heir).not.toBe(worm.id);
  expect(world.species.some((s) => s.id === session.heir)).toBe(true);
  expect(session.gain).toEqual({ from: 0, to: world.lineages[0].xp });
});

it('the XP bar reads level, progress within it and the cap', () => {
  expect(barOf(0)).toEqual({ level: 1, into: 0, step: 60, pct: 0 });
  expect(barOf(90)).toEqual({ level: 2, into: 30, step: 70, pct: 30 / 70 });
  expect(barOf(LINE_RULE.xpAt[LINE_RULE.cap])).toEqual({ level: LINE_RULE.cap, into: 0, step: 0, pct: 1 });
});
