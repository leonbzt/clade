// Slice 15: versioned saves and the copy-species code.
import { describe, expect, it } from 'vitest';
import { SAVE_VERSION, freshSave, parseSave } from '../src/sim/save';
import { addVisitor, decode, encode } from '../src/sim/share';

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

describe('the copy-species code', () => {
  it('encodes and decodes; a typo fails the checksum', () => {
    const sp = { plan: 'worm' as const, role: 'burrower' as const, hab: 'mud' as const, eggs: 31, form: 'deep' as const, verbs: ['dig' as const, 'sense' as const], name: "Lea's worms" };
    const code = encode(sp);
    expect(code.startsWith('CLADE-')).toBe(true);
    expect(decode(code)).toEqual(sp);
    expect(decode(code.slice(0, -1) + (code.endsWith('a') ? 'b' : 'a'))).toBeNull();
    expect(decode('hello')).toBeNull();
  });
  it('a visitor joins the niche in your garden', () => {
    const s = freshSave(6, 0), sp = decode(encode({ plan: 'swimmer', role: 'predator', hab: 'sand', eggs: 25, verbs: [], name: 'Kim' }))!;
    addVisitor(s.garden, sp);
    expect(s.garden.habs.sand.entries.some((e) => e.name === 'Kim' && e.role === 'predator' && !e.line)).toBe(true);
  });
});
