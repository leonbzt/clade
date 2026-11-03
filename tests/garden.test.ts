// Model tests: the island, habitats, the garden over hours, saves and offline, all under budget.
import { describe, expect, it } from 'vitest';
import { FOUNDER_GENES } from '../src/data/genes';
import { LAVA, WET } from '../src/data/island';
import { gameStep, newGame, release, startRun, tierList } from '../src/sim/game';
import { catchUp, fromSave, toSave, yourArea } from '../src/sim/save';

const moss = [8, 300, 10, 1.1, 2.5, 1.5]; // raw stats of a fair moss

function released(seed = 7) {
  const g = newGame(seed);
  expect(startRun(g, g.sprouts[0].id, g.sprouts[0].patch)).toBeNull();
  release(g, moss, FOUNDER_GENES, null);
  return g;
}

describe('island and habitats', () => {
  it('makes lava, wet ground and patches of at most 60 tiles', () => {
    const g = newGame(7), kinds = new Set(g.hab.patches.map((p) => p.kind));
    expect(kinds.has(LAVA) && kinds.has(WET)).toBe(true);
    expect(g.hab.patches.length).toBeGreaterThan(40);
    expect(Math.max(...g.hab.patches.map((p) => p.tiles.length))).toBeLessThanOrEqual(60);
    expect(g.hab.patches.every((p) => p.nb.length > 0)).toBe(true);
  });
  it('is the same island from the same seed', () => {
    expect(toSave(newGame(3), 0)).toBe(toSave(newGame(3), 0));
  });
});

describe('garden', () => {
  it('a release takes area and pays biomass; 10 h stays finite and runs fast', () => {
    const g = released(), b0 = g.biomass;
    const t0 = performance.now();
    for (let k = 0; k < 36_000; k++) gameStep(g);
    const ms = performance.now() - t0;
    expect(yourArea(g)).toBeGreaterThan(5);
    expect(g.biomass).toBeGreaterThan(b0);
    expect(Number.isFinite(g.biomass)).toBe(true);
    expect(ms / 36_000).toBeLessThan(0.1); // garden step < 0.1 ms
    expect(tierList(g).filter((r) => r.open).length).toBeGreaterThanOrEqual(2);
  });
  it('8 h offline catches up in under 0.5 s', () => {
    const g = released();
    for (let k = 0; k < 600; k++) gameStep(g);
    const t0 = performance.now(), away = catchUp(g, 8 * 3600);
    expect(performance.now() - t0).toBeLessThan(500);
    expect(away.seconds).toBe(8 * 3600);
  });
  it('a save comes back the same', () => {
    const g = released();
    for (let k = 0; k < 300; k++) gameStep(g);
    const s = toSave(g, 1), back = fromSave(s)!.game;
    expect(toSave(back, 1)).toBe(s);
    gameStep(g); gameStep(back);
    expect(Math.round(back.biomass)).toBe(Math.round(g.biomass));
  });
});
