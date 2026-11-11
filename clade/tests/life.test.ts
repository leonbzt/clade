import { describe, expect, it } from 'vitest';
import { RULE, TURNS, VERBS } from '../src/data/life';
import * as L from '../src/sim/life';
import { activeParts, type LifePlan } from '../src/sim/life-body';
import type { Build } from '../src/sim/records';
import { useVerb } from '../src/sim/verbs';

const WORM: Build = { clade: 'worm', parts: { back: 'gut', tail: 'bulb', sides: 'sclerite' }, genes: { size: 5, gut: 1 } };
const MUD: L.Board = {
  substrate: 'mud',
  map: [
    'm.m.sm.s', '.m..#.m.', '~~~~~~~m', '~b~b~~b~', 'b~~~bb~b', '~~#~~~~~',
    '.~~..~~~', 'm~~mc~bb', '~~b~~#~~', '~b~b~~b.', 'b~~~b~mm',
  ],
  start: [3, 1], entry: [1, 10], predatorAt: 6,
  event: { from: 12, to: 15, where: 'mud', name: 'Mudslide', text: 'no oxygen in the mud', look: 'murk' },
  rivals: [{ at: [4, 9], species: 'digger', name: 'Rival worm', build: WORM, eats: 'buried' }],
};
const life = (parts = WORM.parts, clade: LifePlan = 'worm', board = MUD) =>
  L.newLife(board, { ...WORM, clade, parts }, {}, 7);

describe('the Life engine', () => {
  it('starts at size 1 with its first part, regardless of adult sea size', () => {
    const l = L.newLife(MUD, WORM, { gut: 1 }, 7);
    expect([l.x, l.y, l.size, l.food]).toEqual([3, 1, 1, RULE.startFood]);
    expect(activeParts(l)).toEqual(['gut']);
    expect(L.upkeep(l)).toBe(1);
    expect(l.rivals).toHaveLength(1);
    expect(l.pred).toBeNull();
    expect(() => L.newLife(MUD, { ...WORM, clade: 'swimmer' }, {}, 7)).toThrow();
  });

  it('crawls on sand and tunnels around corners through mud', () => {
    const l = life();
    const ds = L.dests(l);
    expect(ds.has(L.at(3, 2)) && ds.has(L.at(3, 0)) && ds.has(L.at(2, 1))).toBe(true);
    expect(ds.has(L.at(4, 1))).toBe(false);
    expect(ds.has(L.at(3, 3))).toBe(false);
    L.move(l, L.at(3, 2));
    expect(L.dests(l).get(L.at(2, 4))?.path).toHaveLength(3);
    expect(L.dests(l).has(L.at(2, 5))).toBe(false);
  });

  it('mud stops an arthropod while a trilobite ploughs through at double cost', () => {
    const a = life({}, 'arthropod');
    const t = life({ limbs: 'leg' }, 'trilobite');
    expect(L.dests(a).has(L.at(3, 2))).toBe(true);
    expect(L.dests(a).has(L.at(3, 3))).toBe(false);
    expect(L.dests(t).has(L.at(3, 2))).toBe(true);
    expect(L.dests(t).has(L.at(3, 3))).toBe(false);
    useVerb(t, 'dash');
    expect(L.dests(t).get(L.at(3, 3))?.path).toHaveLength(2);
    expect(L.hitOn(t, 1, 0, t.x, t.y).kind).toBe('enrolled');
  });

  it('locks buried food until the bulb switches on, then feeds with the gut bonus', () => {
    const l = life();
    L.move(l, L.at(3, 2));
    L.move(l, L.at(3, 3));
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'locked', node: 'buried' }));
    expect(L.tile(l).node).toBe('buried');
    l.size = 2;
    L.eat(l, L.at(3, 3));
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'eat', node: 'buried', gain: 8 }));
    expect(l.ate.buried).toBe(8);
    expect(L.tile(l).node).toBeNull();
    expect(L.lockOf(l, 'carcass')).toContain('needs size 4');
  });

  it('runs rivals and regrows eaten mats on schedule', () => {
    const board: L.Board = { ...MUD, rivals: [{ ...MUD.rivals[0], at: [1, 0], eats: 'mat' }], predatorAt: null };
    const l = life({}, 'worm', board);
    l.food = 99;
    L.stay(l);
    expect(l.events).toContainEqual({ k: 'rival', idx: 0, from: L.at(1, 0), to: L.at(0, 0), ate: true });
    expect(L.tile(l, 0, 0).node).toBeNull();
    l.rivals = [];
    for (let k = 1; k < RULE.regrow; k++) L.stay(l);
    expect(l.events).toContainEqual({ k: 'grow', i: L.at(0, 0), node: 'mat' });
  });

  it('sheds the newest active part at starvation, then loses health', () => {
    const l = life();
    l.size = 2;
    l.food = 0;
    L.stay(l);
    expect(l.lost).toEqual(['tail']);
    expect(l.events).toContainEqual({ k: 'shed', place: 'tail', part: 'bulb' });
    L.stay(l);
    L.stay(l);
    expect(l.lost).toEqual(['tail', 'back']);
    expect(l.health).toBe(2);
    expect(WORM.parts.tail).toBe('bulb');
  });

  it('runs the mudslide and ends the season after 20 turns', () => {
    const l = life();
    l.food = 99;
    L.move(l, L.at(3, 2));
    while (l.turn < 12) L.stay(l);
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'event', name: 'Mudslide' }));
    L.stay(l);
    expect(l.oxygen).toBe(RULE.oxygen - 1);
    while (l.phase === 'play') L.stay(l);
    expect([l.cause, l.turn]).toEqual(['season', TURNS]);
  });
});

describe('verbs', () => {
  it('grazes every mat around you, ends the turn, then recharges', () => {
    const l = life({ front: 'tentacles' });
    l.x = 1; l.y = 0;
    const food = l.food;
    expect(useVerb(l, 'graze')).toBe(true);
    expect(l.events.filter((e) => e.k === 'eat')).toHaveLength(3);
    expect(l.food).toBe(food + 15 - L.upkeep(l));
    expect(l.turn).toBe(2);
    expect(L.ready(l, 'graze')).toBe(false);
    for (let k = 0; k < VERBS.graze.recharge; k++) L.stay(l);
    expect(L.ready(l, 'graze')).toBe(true);
  });

  it('Dash doubles the next move and Sense reveals hidden food, both free', () => {
    const l = life({ limbs: 'leg', eyes: 'eye' }, 'arthropod');
    l.size = 2;
    const hidden = l.tiles.filter((t) => !L.known(t)).length, range = L.range(l);
    expect(useVerb(l, 'dash')).toBe(true);
    expect(useVerb(l, 'sense')).toBe(true);
    expect([l.turn, L.range(l)]).toEqual([1, range * 2]);
    expect(l.tiles.filter((t) => !L.known(t)).length).toBeLessThan(hidden);
    L.move(l, L.at(3, 0));
    expect(l.dash).toBe(false);
  });

  it('Dig eats reachable buried food and hides you when the shadow strikes', () => {
    const l = life({ tail: 'bulb' });
    l.x = 4; l.y = 3; l.food = 10;
    expect(useVerb(l, 'dig')).toBe(true);
    expect(l.events.filter((e) => e.k === 'eat')).toHaveLength(2);
    l.dug = true;
    expect(L.hitOn(l, 1, 0, 3, 1).kind).toBe('buried');
    const a = life({ limbs: 'digger' }, 'arthropod');
    a.x = 4; a.y = 3;
    expect(useVerb(a, 'dig')).toBe(true);
    expect(a.events.some((e) => e.k === 'locked')).toBe(true);
    expect(a.ate.buried).toBeUndefined();
  });

  it('Brace blocks from any side and Crush opens a big meal at size 1', () => {
    const l = life({ sides: 'sclerite', front: 'proboscis' });
    l.size = 2;
    l.pred = { x: 4, y: 1, state: 'strike', rest: 0, marks: [L.at(l.x, l.y)], dir: 1, lx: l.x, ly: l.y };
    expect(useVerb(l, 'brace')).toBe(true);
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'strike', kind: 'blocked', part: null }));
    expect(l.pred.rest).toBe(RULE.restAfterSpine);
    l.size = 1; l.x = 4; l.y = 6;
    const food = l.food;
    expect(useVerb(l, 'crush')).toBe(true);
    expect(l.food).toBe(food + 14 + 4 - L.upkeep(l));
  });

  it('an arthropod on a mud board has no feeding reach, including with Crush', () => {
    const l = life({ front: 'claw' }, 'arthropod');
    l.x = 4; l.y = 6;
    expect(useVerb(l, 'crush')).toBe(true);
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'locked', node: 'carcass' }));
    expect(l.ate).toEqual({});
  });
});

describe('the shadow', () => {
  it('arrives, marks, tears a part and rests', () => {
    const l = life();
    l.food = 99; l.size = 2;
    for (let k = 0; k < 5; k++) L.stay(l);
    expect(l.turn).toBe(6);
    expect([l.pred?.x, l.pred?.y]).toEqual([1, 10]);
    l.x = 3; l.y = 0; l.facing = 2;
    Object.assign(l.pred!, { x: 1, y: 1 });
    L.stay(l);
    expect(l.pred?.state).toBe('strike');
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'marks', marks: expect.arrayContaining([L.at(3, 0)]) }));
    L.stay(l);
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'strike', kind: 'hit', tear: 'back' }));
    expect([l.health, activeParts(l)]).toEqual([2, ['bulb']]);
    expect(l.pred?.state).toBe('rest');
    L.stay(l);
    expect(l.pred?.state).toBe('hunt');
  });

  it('mud hides worms and a passive guard blocks only on the struck side', () => {
    const l = life({ tail: 'sclerite', back: 'gut' });
    l.size = 2;
    expect(L.hitOn(l, 2, 2, 3, 2).kind).toBe('buried');
    expect(L.hitOn(l, 2, 0, 3, 1).kind).toBe('blocked');
    expect(L.hitOn(l, 1, 2, 3, 1)).toMatchObject({ kind: 'hit', part: 'gut' });
  });
});
