// Small seeded RNG (mulberry32). The state lives in GameState so runs replay exactly.

export function nextRandom(seed: number): [value: number, seed: number] {
  const s = (seed + 0x6d2b79f5) | 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** Draws from the RNG held in `holder.rng`. */
export function random(holder: { rng: number }): number {
  const [v, s] = nextRandom(holder.rng);
  holder.rng = s;
  return v;
}
