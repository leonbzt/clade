import { describe, expect, it } from 'vitest';
import { createState, VENT, type State } from '../src/sim/state';
import { advance } from '../src/sim/tick';
import { buyTrait, coverCount, evolve, found, foundingCost } from '../src/sim/commands';
import { fit, stats } from '../src/sim/stats';
import { SPECIES_INDEX } from '../src/data/species';

function hash(s: State): number {
  let h = 2166136261;
  const feed = (v: number) => { h = Math.imul(h ^ (v | 0), 16777619); };
  for (const a of [s.occ, s.terrain]) for (const v of a) feed(v);
  for (const v of s.soil) feed(v * 1e6);
  feed(s.biomass * 1e3);
  return h >>> 0;
}

function ventTile(s: State): number {
  return s.terrain.findIndex((t, i) => t === VENT && s.occ[i] < 0);
}

function play(seed: number): State {
  const s = createState(seed);
  evolve(s, 'mosses');
  found(s, 'moss', ventTile(s));
  advance(s, 1500);
  buyTrait(s, 'moss', 'rhizoids');
  advance(s, 1500);
  return s;
}

describe('sim', () => {
  it('is deterministic: same seed and commands give the same state', () => {
    expect(hash(play(7))).toBe(hash(play(7)));
    expect(hash(play(7))).not.toBe(hash(play(8)));
  });

  it('needs Mosses reached before founding, and the first founding is free', () => {
    const s = createState(1);
    expect(found(s, 'moss', ventTile(s)).ok).toBe(false);
    evolve(s, 'mosses');
    expect(foundingCost(s, 'moss')).toBe(0);
    expect(found(s, 'moss', ventTile(s)).ok).toBe(true);
    expect(coverCount(s, 'moss')).toBeGreaterThan(1);
    expect(foundingCost(s, 'moss')).toBeGreaterThan(0);
  });

  it('refuses tiles a species cannot live on', () => {
    const s = createState(1);
    evolve(s, 'mosses');
    const sea = 0; // the corner is always sea
    expect(found(s, 'moss', sea).ok).toBe(false);
  });

  it('mosses spread, build soil and earn biomass', () => {
    const s = play(3);
    expect(coverCount(s, 'moss')).toBeGreaterThan(20);
    expect(Math.max(...s.soil)).toBeGreaterThan(0.5);
    expect(s.biomass).toBeGreaterThan(0);
  });

  it('lichen fades from deep soil', () => {
    const s = createState(2), lichen = SPECIES_INDEX.lichen;
    const i = s.occ.findIndex((o) => o === lichen);
    s.soil[i] = 2;
    expect(fit(s, stats(s, lichen), lichen, i)).toBe(0);
  });
});
