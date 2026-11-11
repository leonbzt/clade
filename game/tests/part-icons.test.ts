// Slice 20D: every part has its own 6×6 icon.
import { describe, expect, it } from 'vitest';
import { PART_IDS } from '../src/data/life';
import { ICONS, pixels } from '../src/data/part-icons';

describe('part icons', () => {
  it('every part has a distinct, well-formed 6×6 icon', () => {
    for (const id of PART_IDS) {
      const rows = ICONS[id]?.split('|');
      expect(rows, id).toHaveLength(6);
      for (const r of rows) expect(r, id).toHaveLength(6);
      expect(pixels(id).every(([, , c]) => !!c), id).toBe(true);
    }
    expect(new Set(PART_IDS.map((id) => ICONS[id])).size).toBe(PART_IDS.length);
  });
});
