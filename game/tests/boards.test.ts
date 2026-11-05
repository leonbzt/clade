// Slice 09: the sand shallows and volcanic rock, the arthropod's start, and the boards' rares.
import { describe, expect, it } from 'vitest';
import { HABITATS, HAB_ORDER } from '../src/data/habitats';
import { COLS, ROWS } from '../src/data/life';
import * as L from '../src/sim/life';

const sand = () => L.newLife(3, 'arthropod', HABITATS.sand), rock = () => L.newLife(3, 'worm', HABITATS.rock);
const parts = (l: L.Life) => l.slots.flatMap((s) => (s.part ? [s.part] : []));

describe('the three boards', () => {
  it('are 8 × 11, start on open ground and let the hunter in', () => {
    for (const id of HAB_ORDER) {
      const h = HABITATS[id];
      expect([h.map.length, ...new Set(h.map.map((r) => r.length))]).toEqual([ROWS, COLS]);
      const l = L.newLife(1, 'worm', h);
      expect(L.tile(l).t === 'rock' || L.tile(l).t === 'dead').toBe(false);
      expect(L.tile(l, ...h.entry).t).not.toBe('dead');
    }
  });

  it('the arthropod starts with a claw and a gill, and runs 2 tiles on sand', () => {
    const l = sand();
    expect(parts(l)).toEqual(['claw', 'gill']);
    expect(L.dests(l).has(L.at(4, 8))).toBe(true); // two tiles south over open sand
  });

  it('low tide takes oxygen only by the shore', () => {
    const l = sand();
    l.food = 99;
    while (l.turn < 9) L.stay(l);
    l.x = 4; l.y = 6; const ox = l.oxygen; L.stay(l);
    expect(l.oxygen).toBe(Math.min(L.oxygenMax(l), ox + 1)); // row 6: fine
    l.x = 4; l.y = 1; l.pred = null; L.stay(l);
    expect(l.oxygen).toBe(L.oxygenMax(l) - 1); // row 1: dry
  });

  it('vent water costs oxygen, and blue blood makes it free', () => {
    const l = rock();
    l.food = 99; l.x = 3; l.y = 3; // beside the vents
    L.move(l, L.at(4, 3)); // into vent water
    expect(L.tile(l).t).toBe('dead');
    expect(l.oxygen).toBe(L.oxygenMax(l) - 1);
    const a = L.newLife(3, 'arthropod', HABITATS.rock);
    a.slots[4].part = 'blood'; a.x = 4; a.y = 3; a.oxygen = 1;
    L.stay(a);
    expect(a.oxygen).toBe(2);
  });

  it('sulfur symbionts double a sulfur mat', () => {
    const l = rock();
    const base = L.foodOf(l, 'bloom');
    l.slots[4].part = 'symbiont';
    expect(L.foodOf(l, 'bloom')).toBe(base + 7);
  });

  it('a hooked proboscis opens shell beds; enrolment blocks if you stay put', () => {
    const w = L.newLife(3, 'worm', HABITATS.sand);
    expect(L.lockOf(w, 'shell')).not.toBeNull();
    w.slots[0].part = 'hook';
    expect(L.lockOf(w, 'shell')).toBeNull();
    const a = sand();
    a.slots[1].part = 'enrol'; a.moved = false;
    expect(L.hitOn(a, 1, 0, a.x, a.y).kind).toBe('enrolled');
    a.moved = true;
    expect(L.hitOn(a, 1, 0, a.x, a.y).kind).not.toBe('enrolled');
  });

  it('each board offers its own rares', () => {
    const l = L.newLife(5, 'worm', HABITATS.rock);
    l.food = 99; l.rareAt = 1;
    L.moult(l);
    expect(l.offers).toContain('symbiont');
  });
});
