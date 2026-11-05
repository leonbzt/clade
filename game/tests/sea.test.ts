// Slice 17's model test: does the sea boom and crash, patch by patch, without the whole map pulsing or one species taking everything?
import { describe, expect, it } from 'vitest';
import { SPECIES } from '../../toys/sea-data';
import { awayLines, headlineText, tell, type Headline } from '../../toys/sea-news';
import { holder, huntersOf, newSea, preyOf, release, step } from '../../toys/sea-sim';

const GENS = 160, SEEDS = [1, 2, 3];
const roleAlive = (s: ReturnType<typeof newSea>, role: string) => s.patches.some((p) => p.pop.some((n, k) => n >= 1 && SPECIES[k].role === role));

function measure(seed: number) {
  const s = newSea(seed), n = s.patches.length, hold = new Map<number, number>(), goneFor = new Map<string, number>();
  let worstAtOnce = 0, worstHold = 0, worstGone = 0;
  for (let g = 0; g < GENS; g++) {
    const was = s.patchCrashes.length;
    step(s);
    worstAtOnce = Math.max(worstAtOnce, (s.patchCrashes.length - was) / 2);
    const counts = new Map<number, number>();
    for (const p of s.patches) { const h = holder(p); if (h >= 0) counts.set(h, (counts.get(h) ?? 0) + 1); }
    for (let k = 0; k < SPECIES.length; k++) {
      const over = (counts.get(k) ?? 0) > n / 2;
      hold.set(k, over ? (hold.get(k) ?? 0) + 1 : 0);
      worstHold = Math.max(worstHold, hold.get(k)!);
    }
    for (const role of ['grazer', 'burrower', 'predator']) {
      goneFor.set(role, roleAlive(s, role) ? 0 : (goneFor.get(role) ?? 0) + 1);
      worstGone = Math.max(worstGone, goneFor.get(role)!);
    }
  }
  const last = new Map<number, number>(), gaps: number[] = [];
  for (let k = 0; k < s.patchCrashes.length; k += 2) {
    const gen = s.patchCrashes[k], id = s.patchCrashes[k + 1];
    if (last.has(id)) gaps.push(gen - last.get(id)!);
    last.set(id, gen);
  }
  gaps.sort((a, b) => a - b);
  return { n, crashes: s.patchCrashes.length / 2, gaps, median: gaps[gaps.length >> 1], worstAtOnce, worstHold, worstGone, prey: preyOf(s.patches[0]), hunters: huntersOf(s.patches[0]) };
}

describe('the living sea', () => {
  const runs = SEEDS.map(measure);
  it('has about 70 patches', () => {
    for (const r of runs) { expect(r.n).toBeGreaterThanOrEqual(50); expect(r.n).toBeLessThanOrEqual(95); }
  });
  it('crashes locally, a patch every 5–50 generations', () => {
    for (const r of runs) {
      expect(r.crashes).toBeGreaterThanOrEqual(20);
      expect(r.median).toBeGreaterThanOrEqual(5);
      expect(r.median).toBeLessThanOrEqual(50);
    }
  });
  it('never crashes a third of the map at once', () => {
    for (const r of runs) expect(r.worstAtOnce).toBeLessThan(r.n / 3);
  });
  it('no species holds over half the patches for 40 generations', () => {
    for (const r of runs) expect(r.worstHold).toBeLessThan(40);
  });
  it('no role is gone from the whole map for more than 20 generations', () => {
    for (const r of runs) expect(r.worstGone).toBeLessThanOrEqual(20);
  });
  it('your line can take a patch and lose it', () => {
    for (const seed of SEEDS) {
      const s = newSea(seed), at = s.patches.findIndex((p) => p.ground === 'mud') , k = release(s, at, 'grazer', 40);
      let took = false, lost = false;
      for (let g = 0; g < GENS; g++) {
        step(s);
        const mine = s.patches.filter((p) => holder(p) === k).length;
        if (mine > 0) took = true;
        if (took && holder(s.patches[at]) !== k) lost = true;
      }
      expect(took).toBe(true);
      expect(lost).toBe(true);
    }
  });
  it('tells every story with a cause, one line per story, and five lines at most after a long skip', () => {
    const s = newSea(2), lines: Headline[] = [], crashes: { cause: string }[] = [];
    let told = 0;
    for (let g = 0; g < GENS; g++) { const ev = step(s); told += ev.length; crashes.push(...ev.filter((e) => e.kind === 'crash')); tell(s, lines, ev); }
    expect(told).toBeGreaterThan(100);
    for (const e of crashes) expect(e.cause.length).toBeGreaterThan(3);
    expect(lines.length).toBeGreaterThan(5);
    expect(lines.some((h) => h.patches.length > 1)).toBe(true);
    for (const h of lines.slice(0, 10)) expect(headlineText(s, h)).toMatch(/(crashed|boomed|spread) .*: .+\.$/);
    const away = awayLines(lines);
    expect(away.length).toBeLessThanOrEqual(5);
    expect(new Set(away.map((h) => h.kind)).size).toBeGreaterThan(1);
  });
  it('a generation costs well under 30 ms', () => {
    const s = newSea(1), t = performance.now();
    for (let g = 0; g < GENS; g++) step(s);
    expect((performance.now() - t) / GENS).toBeLessThan(5);
  });
});
