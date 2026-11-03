// Slice 01, part A: the pressure ramp, upkeep by level, and no founder-level genome is an all-rounder.
import { describe, expect, it } from 'vitest';
import { FOUNDER_GENES, attrIndex, type Genes } from '../src/data/genes';
import { NICHES, PRESSURE } from '../src/data/niches';
import { fit } from '../src/sim/garden';
import { upkeepMult } from '../src/sim/run/plant';
import { fullScore, ramp, type Species } from '../src/sim/species';

const E = attrIndex('endurance'), SH = attrIndex('shade'), D = attrIndex('defence');
const lava = NICHES[0];
const withPips = (pips: Partial<Record<number, number>>): Genes => FOUNDER_GENES.map((v, i) => pips[i] ?? v);

describe('builds', () => {
  it('the ramp: ×floor with no armour, smooth and rising, ×1 at the need', () => {
    const at = (e: number) => ramp(withPips({ [E]: e }), lava);
    expect(at(0)).toBeCloseTo(PRESSURE.floor);
    expect(at(lava.need)).toBe(1);
    expect(at(lava.need + 3)).toBe(1);
    for (let e = 1; e <= lava.need; e++) expect(at(e)).toBeGreaterThan(at(e - 1));
  });

  it('upkeep grows with the level: in the run, and in the garden on poor stocks only', () => {
    const big = FOUNDER_GENES.map(() => 4);
    expect(upkeepMult(big)).toBeGreaterThan(upkeepMult(FOUNDER_GENES) * 1.8);
    const sp = (genes: Genes) => ({ genes, sn: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], native: false }) as Species;
    expect(fit(sp(big), 1, 0.3, 0.3)).toBeLessThan(fit(sp(FOUNDER_GENES), 1, 0.3, 0.3) * 0.7);
    expect(fit(sp(big), 1, 1, 1)).toBeGreaterThan(fit(sp(FOUNDER_GENES), 1, 1, 1) * 0.95);
  });

  it('no founder-level genome reaches B in every row of a layer, with any body', () => {
    const vals = [0, 0.5, 1], bodies: number[][] = [];
    for (let k = 0; k < 3 ** 6; k++) bodies.push([0, 1, 2, 3, 4, 5].map((j) => vals[Math.floor(k / 3 ** j) % 3]));
    for (let e = 0; e <= 8; e++) for (let s = 0; s + e <= 8; s++) for (let d = 0; d + s + e <= 8; d++) {
      const genes = FOUNDER_GENES.map(() => 0); genes[E] = e; genes[SH] = s; genes[D] = d;
      for (const layer of [0, 1, 2]) {
        const rows = NICHES.filter((n) => n.layer === layer);
        expect(bodies.some((sn) => rows.every((n) => fullScore(sn, genes, n) >= 55)), `level 8: E${e} S${s} D${d}, layer ${layer}`).toBe(false);
      }
    }
  });
});
