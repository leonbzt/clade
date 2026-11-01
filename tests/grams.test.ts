import { describe, expect, it } from 'vitest';
import { botTick } from '../src/sim/bot';
import { fullOf, growth, setMass } from '../src/sim/life';
import { createState, SEA, VENT } from '../src/sim/state';
import { STRATA } from '../src/data/fields';
import { spawn } from '../src/sim/agents';
import { closeLedger } from '../src/sim/ledger';
import { step } from '../src/sim/tick';
import { speciesIndex, variantFor } from '../src/sim/variants';

describe('grams', () => {
  it('a grazed plant regrows to its ceiling, and a full one makes what it sheds', () => {
    const C = 150, grow = 0.08, renew = 0.0012, dt = 0.1;
    let m = 0.2 * C;
    for (let t = 0; t < 120; t += dt) { const g = growth(m, C, grow, renew); m += dt * (g.made - g.shed); }
    expect(m / C).toBeGreaterThan(0.97);
    expect(m / C).toBeLessThanOrEqual(1);
    const full = growth(C, C, grow, renew);
    expect(full.made).toBeCloseTo(renew * C);
    expect(full.made).toBeCloseTo(full.shed);
    const over = growth(1.2 * C, C, grow, renew); // health fell: it shrinks, and the loss is litter
    expect(over.shed).toBeGreaterThan(over.made);
  });

  it('the books balance to within 0.1% over a minute', () => {
    const s = createState(1);
    for (let k = 0; k < 16 * 600; k++) botTick(s); // the ledger closes every minute; the last one is 15–16 min
    const L = s.ledger.last;
    expect(L.prod).toBeGreaterThan(0);
    expect(L.decay).toBeGreaterThan(0);
    expect(Math.abs(L.gap)).toBeLessThan(0.001 * L.stock);
  }, 60_000);

  it('the books balance with animals grazing, hunting, breeding and dying', () => {
    const s = createState(1), n = s.w * s.h, v0 = s.terrain.findIndex((t) => t === VENT);
    const vOf = (id: string) => { const sp = speciesIndex(s, id); return variantFor(s, sp, s.species[sp].genome); };
    const moss = vOf('moss'), fungus = vOf('fungus');
    for (let i = 0; i < n; i++) {
      const dx = (i % s.w) - (v0 % s.w), dy = ((i / s.w) | 0) - ((v0 / s.w) | 0);
      if (s.terrain[i] === SEA || dx * dx + dy * dy > 36) continue;
      s.layers.litter[i] = 0.3;
      for (const [k, v] of [[STRATA.indexOf('ground'), moss], [STRATA.indexOf('under'), fungus]]) {
        const slot = k * n + i; s.occ[slot] = v; setMass(s, slot, fullOf(s, v)); s.health[slot] = 1;
      }
    }
    const at = v0 + 2;
    spawn(s, vOf('snail'), at, 24, 'test'); spawn(s, vOf('springtail'), at, 400, 'test'); spawn(s, vOf('beetle'), at, 3, 'test');
    closeLedger(s);
    for (let k = 0; k < 120 * 10; k++) step(s);
    const L = s.ledger.last;
    expect(L.animals).toBeGreaterThan(0);
    expect(L.burn).toBeGreaterThan(0);
    expect(L.eaten).toBeGreaterThan(0);
    expect(Math.abs(L.gap)).toBeLessThan(0.001 * L.stock);
  }, 30_000);
});
