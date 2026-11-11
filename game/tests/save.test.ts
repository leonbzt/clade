// Slice 15: versioned saves (the old garden model). Design codes are CLADE2- since 20C (body.test.ts).
import { describe, expect, it } from 'vitest';
import { SAVE_VERSION, freshSave, parseSave } from '../src/sim/save';

describe('saves', () => {
  it('round-trips, migrates an old save, and refuses broken or newer ones', () => {
    const s = freshSave(5, 1000);
    expect(parseSave(JSON.stringify(s)).save?.seed).toBe(5);
    const old = JSON.parse(JSON.stringify(s)); old.v = 1; delete old.forms; delete old.unlocks;
    const m = parseSave(JSON.stringify(old)).save!;
    expect([m.v, m.forms, m.unlocks]).toEqual([SAVE_VERSION, {}, {}]);
    expect(parseSave('{oops').problem).toBe('broken');
    expect(parseSave(JSON.stringify({ ...s, v: SAVE_VERSION + 1 })).problem).toBe('newer');
    expect(parseSave(null).problem).toBe('none');
  });
});

describe('the old garden save', () => {
  it('a finished Life waiting in the save survives a reload', () => {
    const s = freshSave(5, 0), cards = [{ part: 'deep' as const, rarity: 'rare' as const, passed: true }];
    s.pending = { hab: 'mud', role: 'burrower', plan: 'worm', eggs: 20, tier: 'B', cards };
    expect(parseSave(JSON.stringify(s)).save?.pending).toEqual(s.pending);
  });
});
