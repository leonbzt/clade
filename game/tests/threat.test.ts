// Slice 14: your own line as the hunter, and the trilobite.
import { describe, expect, it } from 'vitest';
import { HABITATS, MUD_FLATS } from '../src/data/habitats';
import * as L from '../src/sim/life';
import { boardFor } from '../src/sim/door';
import { newGarden, release } from '../src/sim/garden';

const withHunter = (parts: string[] = []) => ({ ...MUD_FLATS, predator: 'Your swimmers', predatorAt: 2, hunter: { yours: true, parts: parts as never[] } });

describe('your predator hunts you', () => {
  it('the board takes your line as the hunter once it ranks top', () => {
    const g = newGarden(4);
    expect(boardFor(g, 'mud').hunter).toBeUndefined();
    release(g, { hab: 'mud', plan: 'swimmer', role: 'predator', eggs: 30 });
    const b = boardFor(g, 'mud', { 'mud:predator': 'lenses' });
    expect([b.predator, b.hunter]).toEqual(['Your swimmers', { yours: true, parts: ['lenses'] }]);
  });

  it('it lurks a turn, then swims twice as far', () => {
    const l = L.newLife(3, 'worm', withHunter(), ['gut']);
    l.food = 99; L.stay(l); // turn 2: it arrives
    const p = l.pred!; p.x = 7; p.y = 10; l.x = 0; l.y = 0;
    L.stay(l);
    expect([p.x, p.y, p.lurked]).toEqual([7, 10, true]);
    L.stay(l);
    expect(Math.abs(p.x - 7) + Math.abs(p.y - 10)).toBe(4);
  });

  it('compound eyes see you in mud; arm spines tear through a guard', () => {
    const l = L.newLife(3, 'worm', withHunter(['lenses', 'spikes']), ['sclerite']);
    l.x = 3; l.y = 3; // in mud
    expect(L.hitOn(l, 2, 2, 3, 3).kind).toBe('hit');
    const k = l.slots.findIndex((s) => s.part === 'sclerite'), side = l.slots[k].side;
    const dir = (['front', 'right', 'back', 'left'].indexOf(side) + 2) % 4 as L.Dir;
    const h = L.hitOn(l, dir, 2, 3, 1);
    expect([h.kind, h.part]).toEqual(['hit', 'sclerite']);
    const native = L.newLife(3, 'worm', MUD_FLATS, ['sclerite']);
    expect(L.hitOn(native, 2, 2, 3, 3).kind).toBe('buried');
  });
});

describe('the trilobite', () => {
  it('ploughs through mud at double cost, and rolls up when it stays put', () => {
    const l = L.newLife(3, 'trilobite', HABITATS.sand, ['leg', 'leg']);
    l.x = 2; l.y = 4; // mud lies east at (3,4) and (4,4)
    const ds = L.dests(l);
    expect(ds.has(L.at(3, 4))).toBe(true);
    expect(ds.has(L.at(4, 4))).toBe(true); // range 4: two mud tiles
    const a = L.newLife(3, 'arthropod', HABITATS.sand, ['leg', 'leg']);
    a.x = 2; a.y = 4;
    expect(L.dests(a).has(L.at(4, 4))).toBe(false); // mud stops an arthropod
    l.moved = false;
    expect(L.hitOn(l, 1, 0, l.x, l.y).kind).toBe('enrolled');
    expect(l.slots.filter((s) => s.kind === 'side').length).toBe(6);
  });
});
