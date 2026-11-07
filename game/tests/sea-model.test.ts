// Production port: empty founding, stable body identity, actual eggs, ecological determinism.
import { describe, expect, it } from 'vitest';
import { SEA, lineId } from '../src/data/sea';
import { headlineText, tell, type Headline } from '../src/sim/sea-news';
import { newSea, release, step } from '../src/sim/sea';

describe('the production sea', () => {
  it('keeps an unfounded sea empty through eight hours, with food and a valid patch graph', () => {
    for (const seed of [1, 2, 3]) {
      const sea = newSea(seed);
      expect(sea.gen).toBe(0);
      expect(sea.patches.length).toBeGreaterThan(40);
      for (const p of sea.patches) {
        expect(p.mats).toBeGreaterThan(0); expect(p.rot).toBeGreaterThan(0); expect(p.oxygen).toBeGreaterThan(0);
        for (const tile of p.tiles) expect(sea.of[tile]).toBe(p.id);
        for (const nb of p.nb) expect(sea.patches[nb].nb).toContain(p.id);
      }
      for (let g = 0; g < SEA.awayCap; g++) expect(step(sea)).toEqual([]);
      expect(sea.patches.every((p) => p.pop.every((n) => n === 0))).toBe(true);
    }
  });

  it('releases actual eggs, separates bodies and diets, and never lowers established fitness', () => {
    const sea = newSea(1), p = sea.patches[0];
    const ix = (plan: 'arthropod' | 'trilobite', role: 'grazer' | 'burrower') => sea.species.findIndex((sp) => sp.id === lineId(plan, role));
    release(sea, p.id, 'arthropod', 'grazer', 40);
    const fitness = sea.patches.map((p) => p.fit[ix('arthropod', 'grazer')]);
    release(sea, p.id, 'arthropod', 'grazer', 4);
    release(sea, p.id, 'trilobite', 'grazer', 9);
    release(sea, p.id, 'arthropod', 'burrower', 7);
    expect(p.pop[ix('arthropod', 'grazer')]).toBe(44);
    expect(p.pop[ix('trilobite', 'grazer')]).toBe(9);
    expect(p.pop[ix('arthropod', 'burrower')]).toBe(7);
    expect(sea.patches.map((p) => p.fit[ix('arthropod', 'grazer')])).toEqual(fitness);
    const before = Array.from(p.pop);
    release(sea, p.id, 'arthropod', 'grazer', 0);
    expect(Array.from(p.pop)).toEqual(before);
    expect(sea.patches.filter((q) => q.id !== p.id).every((q) => q.pop.every((n) => n === 0))).toBe(true);
    expect(() => release(sea, -1, 'worm', 'burrower', 4)).toThrow();
  });

  it('runs deterministically after founding and retains causes for ecological news', () => {
    const a = newSea(2), b = newSea(2), news: Headline[] = [];
    for (const sea of [a, b]) {
      release(sea, 0, 'worm', 'burrower', 40);
      release(sea, 0, 'trilobite', 'grazer', 30);
      release(sea, 0, 'swimmer', 'predator', 20);
    }
    for (let g = 0; g < 80; g++) {
      const events = step(a); expect(events).toEqual(step(b)); tell(a, news, events);
      for (const p of a.patches) {
        expect([p.mats, p.rot, p.oxygen].every((n) => n >= 0 && n <= 100)).toBe(true);
        expect(p.pop.every((n) => Number.isFinite(n) && n >= 0)).toBe(true);
      }
    }
    expect(a.patches).toEqual(b.patches);
    expect(news.length).toBeGreaterThan(0);
    for (const n of news) expect(headlineText(a, n)).toMatch(/(crashed|boomed|spread) .*: .+\.$/);
  });
});
