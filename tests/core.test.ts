import { describe, expect, it } from 'vitest';
import * as A from '../src/core/actions';
import { coveredCount } from '../src/core/colony';
import { jumpToMosses } from '../src/core/dev';
import { gardenIncome } from '../src/core/garden';
import { favourCost, makeOffer } from '../src/core/genepool';
import { isCommon } from '../src/core/modifiers';
import { release, releaseGain, releaseGainPlusOne } from '../src/core/release';
import { createGame } from '../src/core/state';
import { advance } from '../src/core/step';
import type { GameState } from '../src/core/types';
import { NUMBERS } from '../src/data/numbers';
import { TRAIT_BY_ID } from '../src/data/traits';

function startColony(): GameState {
  const s = createGame();
  advance(s, NUMBERS.intro.foundButtonAt + 1);
  A.found(s);
  A.letItGrow(s);
  if (!s.colony) throw new Error('colony did not start');
  return s;
}

/** Advances a second at a time until cond holds; fails instead of hanging. */
function until(s: GameState, cond: () => boolean, maxSeconds = 1200): void {
  for (let t = 0; !cond(); t++) {
    if (t > maxSeconds) throw new Error('condition never met');
    advance(s, 1);
  }
}

describe('release', () => {
  it('pays exactly what the preview promised', () => {
    const s = startColony();
    jumpToMosses(s);
    const preview = releaseGain(s).biomassPerSec;
    expect(preview).toBeGreaterThan(0);
    expect(release(s)).toBe(true);
    advance(s, NUMBERS.release.dispersalTime + NUMBERS.release.fillTime * 3);
    expect(gardenIncome(s.garden)).toBeCloseTo(preview, 9);
  });

  it('the +1 generation preview leaves the real state untouched', () => {
    const s = startColony();
    jumpToMosses(s);
    const before = JSON.stringify(s);
    const plus = releaseGainPlusOne(s);
    expect(JSON.stringify(s)).toBe(before);
    expect(plus.biomassPerSec).toBeGreaterThanOrEqual(releaseGain(s).biomassPerSec);
  });

  it('keeps the skill, the node and the traits found; resets genes and the colony', () => {
    const s = startColony();
    jumpToMosses(s);
    s.genes = 50;
    const level = s.skill.level;
    const found = [...s.traitsFound];
    release(s);
    expect(s.skill.level).toBe(level);
    expect(s.reached).toContain('mosses');
    expect(s.traitsFound).toEqual(found);
    expect(s.genes).toBe(0);
    expect(s.colony).toBeNull();
  });

  it('is locked before Mosses', () => {
    const s = startColony();
    expect(release(s)).toBe(false);
  });
});

describe('dry spells', () => {
  it('brown tiles but never remove them', () => {
    const s = startColony();
    A.setSplit(s, { spread: 1, cushion: 0, spores: 0 }); // no water: as harsh as it gets
    let covered = coveredCount(s.colony!);
    let sawBrown = false;
    const spells = 4;
    const d = NUMBERS.drySpell;
    const end = d.firstAt + d.period * (spells - 1) + d.duration + d.rain + 1; // just after the last rain
    for (let t = 0; t < end; t += NUMBERS.sim.tickDt) {
      advance(s, NUMBERS.sim.tickDt);
      const now = coveredCount(s.colony!);
      expect(now).toBeGreaterThanOrEqual(covered);
      covered = now;
      if (s.colony!.tiles.some((x) => x.brown)) sawBrown = true;
      for (const tile of s.colony!.tiles) if (tile.brown) expect(tile.covered).toBe(true);
    }
    expect(sawBrown).toBe(true);
    expect(s.colony!.weather.spells).toBe(spells);
  });

  it('are warned ahead', () => {
    const s = startColony();
    const d = NUMBERS.drySpell;
    advance(s, d.firstAt - d.warning + 0.5);
    expect(s.colony!.weather.state).toBe('warning');
    advance(s, d.warning);
    expect(s.colony!.weather.state).toBe('dry');
  });
});

describe('gene pool', () => {
  it('opens at the cover goal with an offer of three variants', () => {
    const s = startColony();
    until(s, () => coveredCount(s.colony!) >= NUMBERS.goal.coverTiles);
    expect(s.genePool.open).toBe(true);
    expect(s.genePool.offers[0].variants).toHaveLength(NUMBERS.generation.variantsPerGeneration);
  });

  it('favouring costs genes and raises the trait', () => {
    const s = startColony();
    until(s, () => s.genePool.open);
    const offer = s.genePool.offers[0];
    const trait = offer.variants[0];
    const before = s.genePool.freq[trait];
    s.genes = 100;
    const cost = favourCost(s);
    expect(A.favour(s, offer.id, trait)).toBe(true);
    expect(s.genes).toBe(100 - cost);
    expect(s.genePool.freq[trait]).toBeCloseTo(before + NUMBERS.generation.favourGain);
  });

  it('cannot favour without enough genes', () => {
    const s = startColony();
    until(s, () => s.genePool.open);
    s.genes = 0;
    const offer = s.genePool.offers[0];
    expect(A.favour(s, offer.id, offer.variants[0])).toBe(false);
  });

  it('only offers the leafy shoot once all three precursors are common', () => {
    const s = startColony();
    until(s, () => s.genePool.open);
    for (let i = 0; i < 50; i++) expect(makeOffer(s)!.variants).not.toContain('leafyShoot');
    for (const id of ['rhizoids', 'dryingOut', 'capsule'] as const) s.genePool.freq[id] = 0.6;
    for (let i = 0; i < 10; i++) expect(makeOffer(s)!.variants).toContain('leafyShoot');
  });

  it('reaches Mosses when the leafy shoot is common', () => {
    const s = startColony();
    jumpToMosses(s);
    expect(isCommon(s.genePool.freq.leafyShoot)).toBe(true);
    expect(s.reached).toContain('mosses');
    expect(s.codexOpen).toBe('mosses');
  });

  it('home nudges drought traits each generation', () => {
    const s = startColony();
    until(s, () => s.genePool.open);
    const drought = Object.values(TRAIT_BY_ID).filter((t) => t.drought).map((t) => t.id);
    const before = drought.map((id) => s.genePool.freq[id]);
    A.pass(s, s.genePool.offers[0].id);
    until(s, () => s.genePool.offers.length > 0);
    drought.forEach((id, i) => expect(s.genePool.freq[id]).toBeGreaterThan(before[i]));
  });
});

describe('runs replay', () => {
  it('the same seed and inputs give the same state', () => {
    const a = startColony();
    const b = startColony();
    advance(a, 300);
    advance(b, 300);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
