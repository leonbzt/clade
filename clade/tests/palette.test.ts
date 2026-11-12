// The palette's rules: colours live in one file; the ground stays muted, never red or gold.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COLORS, GROUND_RAMPS, RAMPS, RESERVED, shade } from '../src/data/palette';

const SRC = join(__dirname, '../src');
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));

/** Chroma, 0..1: how far a colour is from grey (HSL saturation overrates dark colours). */
function chroma(c: number) {
  const r = c >> 16, g = (c >> 8) & 255, b = c & 255;
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}

describe('palette', () => {
  it('keeps colour literals in the palette and the N2 port’s temporary shade palette', () => {
    const literal = /0x[0-9a-f]{6}\b|#[0-9a-f]{3,8}\b|\brgba?\(\s*\d|\bhsla?\(\s*\d/i;
    const found = files(SRC)
      .filter((f) => /\.(ts|svelte|css|html)$/.test(f) && !f.endsWith(join('data', 'palette.ts')) && !f.endsWith(join('view', 'shade.ts')))
      .filter((f) => literal.test(readFileSync(f, 'utf8')));
    expect(found).toEqual([]);
  });

  it('keeps the ground muted: no ground ramp uses red or gold, or anything as loud', () => {
    const reserved = new Set([...RESERVED.danger, ...RESERVED.yours]);
    for (const name of GROUND_RAMPS) for (const i of RAMPS[name]) {
      expect(reserved.has(i), `${name} uses a reserved colour`).toBe(false);
      expect(chroma(COLORS[i]), `${name}: ${COLORS[i].toString(16)}`).toBeLessThan(0.4);
    }
    for (const i of reserved) expect(chroma(COLORS[i])).toBeGreaterThan(0.5);
  });

  it('shades in three tones from one light', () => {
    const r = RAMPS.lava;
    expect([shade(r, 1), shade(r, 0), shade(r, -1)]).toEqual([r[2], r[1], r[0]]);
  });
});
