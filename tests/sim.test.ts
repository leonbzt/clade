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
  evolve(s, 'cyanobacteria');
  found(s, 'cyano', ventTile(s));
  advance(s, 1500);
  buyTrait(s, 'cyano', 'sheath');
  advance(s, 1500);
  return s;
}

describe('sim', () => {
  it('is deterministic: same seed and commands give the same state', () => {
    expect(hash(play(7))).toBe(hash(play(7)));
    expect(hash(play(7))).not.toBe(hash(play(8)));
  });

  it('starts bare', () => {
    const s = createState(1);
    expect(s.occ.every((o) => o < 0)).toBe(true);
  });

  it('needs the node before founding, and the first founding is free', () => {
    const s = createState(1);
    expect(found(s, 'cyano', ventTile(s)).ok).toBe(false);
    evolve(s, 'cyanobacteria');
    expect(foundingCost(s, 'cyano')).toBe(0);
    expect(found(s, 'cyano', ventTile(s)).ok).toBe(true);
    expect(coverCount(s, 'cyano')).toBeGreaterThan(1);
    expect(foundingCost(s, 'cyano')).toBeGreaterThan(0);
  });

  it('refuses tiles a species cannot live on', () => {
    const s = createState(1);
    evolve(s, 'cyanobacteria');
    expect(found(s, 'cyano', 0).ok).toBe(false); // the corner is always sea
  });

  it('a crust spreads, builds soil and earns biomass', () => {
    const s = play(3);
    expect(coverCount(s, 'cyano')).toBeGreaterThan(20);
    expect(Math.max(...s.soil)).toBeGreaterThan(0.3);
    expect(s.biomass).toBeGreaterThan(0);
  });

  it('lichens fade from deep soil', () => {
    const s = createState(2), lichen = SPECIES_INDEX.lichen;
    const i = s.terrain.findIndex((t) => t === VENT);
    s.soil[i] = 2;
    expect(fit(s, stats(s, lichen), lichen, i)).toBe(0);
  });
});
