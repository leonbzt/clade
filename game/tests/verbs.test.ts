// Slice 10: verbs come from parts; 1–3 picked; each does its one thing and recharges.
import { describe, expect, it } from 'vitest';
import { HABITATS, MUD_FLATS } from '../src/data/habitats';
import { STYLE_VERBS, VERBS } from '../src/data/life';
import * as L from '../src/sim/life';
import { useVerb } from '../src/sim/verbs';

const life = (style: keyof typeof STYLE_VERBS, plan: 'worm' | 'arthropod' = 'worm', hab = MUD_FLATS) =>
  L.newLife(9, plan, hab, L.partsFor(plan, STYLE_VERBS[style]));

describe('verbs', () => {
  it('a loadout is a starting body; head clashes do not fit', () => {
    expect(L.verbs(life('sweeper'))).toEqual(['graze', 'dash']);
    expect(L.verbs(life('tank', 'arthropod'))).toEqual(['brace', 'crush']);
    const clash = L.newLife(1, 'worm', MUD_FLATS, L.partsFor('worm', ['graze', 'crush']));
    expect(clash.order.length).toBe(1);
  });

  it('graze eats every mat around you, then recharges', () => {
    const l = life('sweeper', 'worm', HABITATS.sand);
    l.x = 1; l.y = 1; // mats at (0,0), (1,0) and (0,2)
    const food = l.food;
    expect(useVerb(l, 'graze')).toBe(true);
    expect(l.events.filter((e) => e.k === 'eat').length).toBe(3);
    expect(l.food).toBeGreaterThan(food + 10);
    expect(L.ready(l, 'graze')).toBe(false);
    for (let k = 0; k < VERBS.graze.recharge; k++) L.stay(l);
    expect(L.ready(l, 'graze')).toBe(true);
  });

  it('dash is free and doubles the next move', () => {
    const l = life('sweeper', 'arthropod', HABITATS.sand);
    const turn = l.turn, r = L.range(l);
    useVerb(l, 'dash');
    expect([l.turn, L.range(l)]).toEqual([turn, r * 2]);
    L.move(l, L.at(4, 10));
    expect(l.dash).toBe(false);
  });

  it('dig eats buried food beside you and hides you from a strike', () => {
    const l = life('digger');
    l.x = 4; l.y = 3; l.food = 10; // buried food at (3,3) and (4,4)
    useVerb(l, 'dig');
    expect(l.events.filter((e) => e.k === 'eat').length).toBe(2);
    l.dug = true;
    expect(L.hitOn(l, 1, 0, 3, 1).kind).toBe('buried');
  });

  it('sense reveals hidden mud and is free', () => {
    const l = life('digger');
    const hidden = l.tiles.filter((t) => !L.known(t)).length, turn = l.turn;
    useVerb(l, 'sense');
    expect(l.tiles.filter((t) => !L.known(t)).length).toBeLessThan(hidden);
    expect(l.turn).toBe(turn);
  });

  it('brace blocks a strike from any side; crush cracks a shell at size 1', () => {
    const l = life('tank', 'arthropod', HABITATS.rock);
    l.braced = true;
    expect(L.hitOn(l, 2, 0, l.x, l.y).kind).toBe('blocked');
    l.braced = false; l.x = 1; l.y = 0; // beside the shell bed at (1,1)
    const food = l.food;
    useVerb(l, 'crush');
    expect(l.food).toBe(food + 9 + 4 - L.upkeep(l));
  });
});
