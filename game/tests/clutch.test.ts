// Slice 12: the clutch.
import { describe, expect, it } from 'vitest';
import { PARTS } from '../src/data/life';
import { clutchSize, odds, rollClutch } from '../src/sim/clutch';

describe('open your clutch', () => {
  it('more eggs, more cards (2 to 5); none without eggs', () => {
    expect([clutchSize(0), clutchSize(3), clutchSize(16), clutchSize(80)]).toEqual([0, 2, 4, 5]);
  });
  it('cards fit the body plan; rares come from the habitat, epics from elsewhere', () => {
    const seen = new Set<string>();
    for (let s = 1; s < 300; s++) for (const c of rollClutch(s, 'worm', 'mud', 40, 'A')) {
      expect(PARTS[c.part].plans).toContain('worm');
      if (c.rarity === 'rare') expect(['deep', 'progenesis']).toContain(c.part);
      if (c.rarity === 'epic') expect(['hook', 'symbiont']).toContain(c.part);
      seen.add(c.rarity);
    }
    expect([...seen].sort()).toEqual(['common', 'epic', 'rare']);
  });
  it('a rare part you laid after getting is a sure card, first and only once', () => {
    for (let s = 1; s < 100; s++) {
      const cards = rollClutch(s, 'worm', 'mud', 8, 'C', 'deep');
      expect(cards[0]).toEqual({ part: 'deep', rarity: 'rare', passed: true });
      expect(cards.filter((c) => c.part === 'deep').length).toBe(1);
    }
    expect(rollClutch(1, 'worm', 'mud', 0, 'F', 'deep')).toEqual([]);
  });
  it('a higher tier gives better odds', () => {
    expect(odds('S').rare).toBeGreaterThan(odds('F').rare);
    expect(odds('S').epic).toBeGreaterThan(odds('D').epic);
  });
});
