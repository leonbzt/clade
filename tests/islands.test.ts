// The island generator: home builds the same island as before (a hash), and run islands follow their theme.
import { describe, expect, it } from 'vitest';
import { LAYER_IDS, STATUS_IDS } from '../src/data/fields';
import { createState, SEA, type State } from '../src/sim/state';

/** Everything island making writes: terrain, landmarks, base values, statuses, wind, soil caps, habitats, layers. */
export function islandHash(s: State): number {
  let h = 2166136261;
  const feed = (v: number) => { h = Math.imul(h ^ (v | 0), 16777619); };
  for (const a of [s.terrain, s.mark, s.hab, s.place]) for (const v of a) feed(v);
  for (const a of [s.base.water, s.soilCap, s.windward, ...STATUS_IDS.map((id) => s.statuses[id]), ...LAYER_IDS.map((id) => s.layers[id])]) for (const v of a) feed(v * 1e6);
  for (const m of s.landmarks) for (const c of m.name + m.kind + m.at) feed(c.charCodeAt(0));
  feed(s.windFrom * 1e6); feed(s.rng); feed(s.w); feed(s.h);
  return h >>> 0;
}

// Taken before the generator took a size and a theme (1 Nov): home must keep building exactly this island.
const HOME = [2682228459, 1656571458, 714321827, 1226660449, 1561266810];
const springs = (s: State) => s.landmarks.filter((m) => m.kind === 'spring').length;

describe('islands', () => {
  it('home is unchanged', () => {
    expect([1, 2, 3, 4, 5].map((seed) => islandHash(createState(seed)))).toEqual(HOME);
  });

  it('run islands take their size and theme: dry has at most one spring, wet three or four, and dry lava is drier', () => {
    for (const seed of [1, 2, 3, 4]) {
      const dry = createState(seed, { size: 'small', theme: 'dry' }), wet = createState(seed, { size: 'medium', theme: 'wet' });
      expect([dry.w, dry.h, wet.w, wet.h]).toEqual([48, 28, 64, 36]);
      expect(springs(dry)).toBeLessThanOrEqual(1);
      expect(springs(wet)).toBeGreaterThanOrEqual(3);
      expect(springs(wet)).toBeLessThanOrEqual(4);
      const lava = (s: State) => { const v = [...s.base.water].filter((_, i) => s.terrain[i] !== SEA && s.mark[i] < 0).sort((a, b) => a - b); return v[v.length >> 1]; };
      expect(lava(dry)).toBeLessThan(lava(wet));
      expect(dry.lineage).toBeNull();
    }
  });
});
