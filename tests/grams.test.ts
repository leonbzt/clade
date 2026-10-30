import { describe, expect, it } from 'vitest';
import { botTick } from '../src/sim/bot';
import { growth } from '../src/sim/life';
import { createState } from '../src/sim/state';

describe('grams', () => {
  it('a grazed plant regrows to its ceiling, and a full one makes what it sheds', () => {
    const C = 150, grow = 0.08, dt = 0.1;
    let m = 0.2 * C;
    for (let t = 0; t < 120; t += dt) { const g = growth(m, C, grow); m += dt * (g.made - g.shed); }
    expect(m / C).toBeGreaterThan(0.97);
    expect(m / C).toBeLessThanOrEqual(1);
    const full = growth(C, C, grow);
    expect(full.made).toBeCloseTo(grow * C);
    expect(full.made).toBeCloseTo(full.shed);
  });

  it('the books balance to within 0.1% over a minute', () => {
    const s = createState(1);
    for (let k = 0; k < 16 * 600; k++) botTick(s); // the ledger closes every minute; the last one is 15–16 min
    const L = s.ledger.last;
    expect(L.prod).toBeGreaterThan(0);
    expect(L.decay).toBeGreaterThan(0);
    expect(Math.abs(L.gap)).toBeLessThan(0.001 * L.stock);
  }, 60_000);
});
