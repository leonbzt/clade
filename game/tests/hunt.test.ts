// Slice 11: the swimmer's moves, ambush, frenzy, and prey that flee by one rule each.
import { describe, expect, it } from 'vitest';
import { HABITATS, MUD_FLATS } from '../src/data/habitats';
import { HUNT, PLANS } from '../src/data/life';
import { PREY_BACK } from '../src/data/prey';
import * as L from '../src/sim/life';
import { nextStep, predict, speed } from '../src/sim/hunt';

const swim = (hab = MUD_FLATS) => L.newLife(4, 'swimmer', hab);
const only = (l: L.Life, k: number) => { l.prey.forEach((p, j) => { if (j !== k) p.alive = false, p.back = 99; }); return l.prey[k]; };

describe('the predator Life', () => {
  it('the swimmer has arms, prey instead of rivals, and no hunter', () => {
    const l = swim();
    expect(l.slots.flatMap((s) => (s.part ? [s.part] : []))).toEqual(['arms']);
    expect([l.rivals.length, l.prey.length]).toEqual([0, 5]);
    l.food = 99;
    for (let k = 0; k < 8; k++) L.stay(l);
    expect(l.pred).toBeNull();
  });

  it('swims any path over rock, but not into vent water', () => {
    const l = L.newLife(4, 'swimmer', HABITATS.rock);
    l.x = 2; l.y = 3; l.prey.forEach((p) => (p.alive = false, p.back = 99));
    const ds = L.dests(l);
    expect(ds.has(L.at(2, 1))).toBe(true); // over the basalt at (2,2)
    expect(ds.has(L.at(3, 3))).toBe(false); // vent water
    expect(Math.max(...[...ds.values()].map((d) => d.path.length))).toBe(PLANS.swimmer.range);
  });

  it('lurking doubles the next swim; prey ignore a still hunter', () => {
    const l = swim();
    l.food = 99;
    const p = only(l, 0); p.x = 1; p.y = 3; l.x = 1; l.y = 1;
    L.stay(l);
    expect(l.still).toBe(true);
    expect(speed(l)).toBe(PLANS.swimmer.range * HUNT.ambush);
    expect(p.alarmed).toBe(false);
  });

  it('a worm burrows in mud; on sand it crawls toward mud', () => {
    const l = swim();
    const p = only(l, 0); p.x = 1; p.y = 3; // on mud
    expect(nextStep(l, p, 1, 2, true).hide).toBe(true);
    p.x = 1; p.y = 1; // on sand, mud to the south
    const n = nextStep(l, p, 1, 0, true);
    expect([n.x, n.y, n.hide]).toEqual([1, 2, false]);
  });

  it('a trilobite runs two tiles straight away; mud stops it', () => {
    const l = L.newLife(4, 'swimmer', HABITATS.sand);
    const p = only(l, 1); p.x = 3; p.y = 6;
    const n = nextStep(l, p, 3, 5, true);
    expect([n.x, n.y]).toEqual([3, 8]);
    p.x = 6; p.y = 5; // mud lies west, so it can't run that way
    const m = nextStep(l, p, 7, 5, true);
    expect(m.x).not.toBe(4);
  });

  it('catching: food, frenzy, Wiwaxia spines, and the kind comes back', () => {
    const l = swim();
    l.food = 10;
    const k = l.prey.findIndex((p) => p.kind === 'wiwaxia'), p = l.prey[k];
    l.x = p.x - 1; l.y = p.y; l.prey.forEach((q, j) => { if (j !== k) q.alive = false, q.back = 99; });
    p.alarmed = true; // it saw you coming: spines up
    L.move(l, L.at(p.x, p.y));
    expect(p.alive).toBe(false);
    expect(l.health).toBe(2); // cut by its spines
    expect(l.frenzy).toBe(1);
    expect(speed(l)).toBe(PLANS.swimmer.range + 1);
    for (let t = 0; t < PREY_BACK; t++) L.stay(l);
    expect(p.alive).toBe(true);
    expect(l.frenzy).toBe(0);
  });

  it('the compound eyes predict where prey go', () => {
    const l = L.newLife(4, 'swimmer', HABITATS.sand);
    const p = only(l, 1); p.x = 3; p.y = 6; l.x = 3; l.y = 3;
    const pr = predict(l, L.at(3, 5));
    expect(pr).toEqual([{ idx: 1, from: L.at(3, 6), to: L.at(3, 8), hide: false }]);
  });
});
