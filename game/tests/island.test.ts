// The island generator and its three habitat spots.
import { describe, expect, it } from 'vitest';
import { SEA } from '../src/data/island';
import { habitatSpots, makeIsland, type SpotId } from '../src/sim/island';
import { spotAt } from '../src/view/islandmap';

const IDS: SpotId[] = ['sand', 'mud', 'rock'];

describe('island', () => {
  it('comes back the same from the same seed', () => {
    const a = makeIsland(7), b = makeIsland(7), c = makeIsland(8);
    expect(Array.from(a.kind)).toEqual(Array.from(b.kind));
    expect(Array.from(a.water)).toEqual(Array.from(b.water));
    expect(a.vents).toEqual(b.vents);
    expect(Array.from(a.kind)).not.toEqual(Array.from(c.kind));
    expect(habitatSpots(a)).toEqual(habitatSpots(b));
  });

  it('puts three spots on sea tiles near land, well apart (seeds 1..20)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const isl = makeIsland(seed), spots = habitatSpots(isl);
      for (const id of IDS) {
        const s = spots[id];
        expect(s.id).toBe(id);
        expect(isl.kind[s.y * isl.w + s.x]).toBe(SEA);
        let d = 99;
        for (let y = 0; y < isl.h; y++) for (let x = 0; x < isl.w; x++)
          if (isl.kind[y * isl.w + x] !== SEA) d = Math.min(d, Math.hypot(x - s.x, y - s.y));
        expect(d).toBeLessThanOrEqual(8);
      }
      for (const [a, b] of [['sand', 'mud'], ['sand', 'rock'], ['mud', 'rock']] as const)
        expect(Math.hypot(spots[a].x - spots[b].x, spots[a].y - spots[b].y), `seed ${seed} ${a}-${b}`).toBeGreaterThanOrEqual(18);
    }
  });

  it('spotAt finds each spot at its centre', () => {
    const spots = habitatSpots(makeIsland(3));
    for (const id of IDS) expect(spotAt(spots, spots[id].x, spots[id].y)).toBe(id);
    expect(spotAt(spots, -50, -50)).toBeNull();
  });
});
