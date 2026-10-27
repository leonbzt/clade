import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { LAYER_IDS } from '../src/data/fields';
import { SPECIES_INDEX } from '../src/data/species';
import { createState, VENT, type State } from '../src/sim/state';
import { advance } from '../src/sim/tick';
import { botTick } from '../src/sim/bot';
import { buyTrait, coverCount, evolve, found, foundingCost } from '../src/sim/commands';
import { fit, profile } from '../src/sim/fit';
import { changed, snapshot } from '../src/sim/metrics';

function hash(s: State): number {
  let h = 2166136261;
  const feed = (v: number) => { h = Math.imul(h ^ (v | 0), 16777619); };
  for (const a of [s.occ, s.terrain]) for (const v of a) feed(v);
  for (const id of LAYER_IDS) for (const v of s.layers[id]) feed(v * 1e6);
  feed(s.biomass * 1e3);
  return h >>> 0;
}

const ventTile = (s: State) => s.terrain.findIndex((t) => t === VENT);

function play(seed: number): State {
  const s = createState(seed);
  evolve(s, 'cyanobacteria');
  found(s, 'cyano', ventTile(s) + 2);
  advance(s, 600);
  buyTrait(s, 'cyano', 'sheath');
  advance(s, 600);
  return s;
}

function bot(seed: number, minutes: number): { s: State; turn: number } {
  const s = createState(seed);
  for (let k = 0; k < (minutes - 2) * 600; k++) botTick(s);
  const before = snapshot(s);
  for (let k = 0; k < 2 * 600; k++) botTick(s);
  return { s, turn: changed(s, before, s.occ) };
}

describe('sim', () => {
  it('is deterministic: same seed and commands give the same state', () => {
    expect(hash(play(7))).toBe(hash(play(7)));
    expect(hash(play(7))).not.toBe(hash(play(8)));
  }, 60_000);

  it('makes every kind of landmark, and salt only near beaches', () => {
    const s = createState(4), kinds = new Set(s.landmarks.map((m) => m.kind));
    expect([...kinds].sort()).toEqual(['beach', 'cave', 'spring', 'vent']);
    const beach = new Set(s.landmarks.filter((m) => m.kind === 'beach').flatMap((m) => m.tiles));
    s.statuses.salty.forEach((v, i) => { if (v >= 1) expect(beach.has(i)).toBe(true); });
  });

  it('starts bare', () => {
    expect(createState(1).occ.every((o) => o < 0)).toBe(true);
  });

  it('needs the node before founding, and the first founding is free', () => {
    const s = createState(1), i = ventTile(s) + 2;
    expect(found(s, 'cyano', i).ok).toBe(false);
    evolve(s, 'cyanobacteria');
    expect(foundingCost(s, 'cyano')).toBe(0);
    expect(found(s, 'cyano', i).ok).toBe(true);
    expect(coverCount(s, 'cyano')).toBeGreaterThan(1);
    expect(foundingCost(s, 'cyano')).toBeGreaterThan(0);
  });

  it('refuses tiles a species cannot live on', () => {
    const s = createState(1);
    evolve(s, 'cyanobacteria');
    expect(found(s, 'cyano', 0).ok).toBe(false); // the corner is always sea
  });

  it('lichens fade from deep soil; ferns need it', () => {
    const s = createState(2), i = ventTile(s);
    s.layers.soil[i] = 0.9;
    expect(fit(s, profile(s, SPECIES_INDEX.lichen), i)).toBe(0);
    s.layers.soil[i] = 0;
    expect(fit(s, profile(s, SPECIES_INDEX.fern), i)).toBe(0);
  });

  it('after 10 bot minutes: layers stay in 0–1, several species live, and tiles keep changing', () => {
    const { s, turn } = bot(3, 10);
    for (const id of LAYER_IDS) for (const v of s.layers[id]) expect(v >= 0 && v <= 1).toBe(true);
    for (const c of s.cover) expect(Number.isFinite(c)).toBe(true);
    expect(Array.from(s.count).filter((c) => c > 0).length).toBeGreaterThanOrEqual(3);
    expect(turn).toBeGreaterThan(0);
    expect(Number.isFinite(s.biomass)).toBe(true);
  }, 120_000);

  it('the sim has no clock or unseeded randomness', () => {
    for (const f of readdirSync('src/sim')) {
      const code = readFileSync(`src/sim/${f}`, 'utf8');
      expect(code, f).not.toMatch(/Math\.random|Date\.now|performance\.now/);
    }
  });
});
