// A small seeded generator (mulberry32). Deterministic: the island comes back from its seed.
export type Rng = () => number;

export function seeded(seed: number): Rng {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const between = (rng: Rng, [a, b]: readonly [number, number]) => a + Math.floor(rng() * (b - a + 1));
