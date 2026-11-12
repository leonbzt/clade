import { describe, expect, it } from 'vitest';
import { COLS, ROWS } from '../src/data/life';
import { PARTS } from '../src/data/parts';
import { grow, lay, layYield, resultOf } from '../src/sim/economy';
import { foodOf, loseAt, newLife, stay, upkeep, type Board } from '../src/sim/life';
import { activeParts, newest, verbs } from '../src/sim/life-body';
import { mutationWeight, offerMutation, pickMutation } from '../src/sim/mutation';
import type { Build } from '../src/sim/records';

const BOARD: Board = {
  substrate: 'sand', map: Array.from({ length: ROWS }, () => '.'.repeat(COLS)),
  start: [3, 1], entry: [0, 0], predatorAt: null, event: null, rivals: [],
};
function life(parts: Build['parts'] = {}, seed = 7, clade: Build['clade'] = 'worm', board = BOARD) {
  const l = newLife(board, { clade, parts, genes: { size: 1, gut: 1 } }, {}, seed);
  l.food = 99;
  return l;
}
function adult(l: ReturnType<typeof life>) {
  grow(l); stay(l); grow(l);
  return l;
}

describe('the mutation offer', () => {
  it('appears on the first Grow to size 3, never on a failed Grow or a later size', () => {
    const l = life();
    expect(l.mutationOffer).toBeNull();
    expect(offerMutation(l)).toBe(false);
    grow(l);
    expect(l.mutationOffer).toBeNull();
    expect(grow(l)).toBe(false);
    stay(l); grow(l);
    expect(l.size).toBe(3);
    const offer = [...l.mutationOffer!];
    expect(offer).toHaveLength(3);
    expect(offerMutation(l)).toBe(false);
    stay(l); grow(l);
    expect(l.size).toBe(4);
    expect(l.mutationOffer).toEqual(offer);
    expect(offerMutation(l)).toBe(false);
  });

  it.each(['worm', 'arthropod', 'trilobite'] as const)('draws distinct common %s parts only for unoccupied primary places', (clade) => {
    const parts: Build['parts'] = { front: clade === 'worm' ? 'tentacles' : 'rake', sides: 'gill' };
    for (const seed of [7, 17, 42]) {
      const l = life(parts, seed, clade);
      l.lost.push('front'); // a lost or not-yet-grown species part still occupies its place
      adult(l);
      expect(l.mutationOffer).toHaveLength(3);
      expect(new Set(l.mutationOffer).size).toBe(3);
      for (const id of l.mutationOffer!) {
        expect(PARTS[id].plans).toContain(clade);
        expect(PARTS[id].rare).not.toBe(true);
        expect(parts[PARTS[id].place]).toBeUndefined();
      }
    }
  });

  it('repeats the same three for the same seed and inputs, while different seeds change the draw', () => {
    const draws = [7, 17, 42].map((seed) => {
      const a = adult(life({}, seed)), b = adult(life({}, seed));
      expect(a.mutationOffer).toEqual(b.mutationOffer);
      return a.mutationOffer!.join(',');
    });
    expect(new Set(draws).size).toBeGreaterThan(1);
  });

  it('handles fewer than three eligible parts and an entirely occupied body without rerolling', () => {
    const parts: Build['parts'] = { front: 'tentacles', eyes: 'eye', sides: 'sclerite', back: 'gut' };
    const l = adult(life(parts));
    expect(l.mutationOffer!.sort()).toEqual(['bulb', 'pouch']);
    const full = adult(life({ ...parts, tail: 'pouch', limbs: 'chaetae' }));
    expect(full.mutationOffer).toEqual([]);
    delete full.build.parts.tail;
    expect(offerMutation(full)).toBe(false);
    expect(pickMutation(full, 'bulb')).toBe(false);
  });

  it('weights the board foods and shadow, then doubles an enforced family once regardless of rank', () => {
    const board = { ...BOARD, map: BOARD.map.map((row, y) => y === 0 ? 'bbmmm...' : row), predatorAt: 10 };
    const l = life({}, 7, 'worm', board);
    expect(['bulb', 'tentacles', 'sclerite', 'proboscis'].map((part) => mutationWeight(l, part as keyof typeof PARTS)))
      .toEqual([3, 4, 2, 1]);
    l.enforced = { tentacles: 2, bulb: 1, sclerite: 0 };
    expect(['bulb', 'tentacles', 'sclerite', 'proboscis'].map((part) => mutationWeight(l, part as keyof typeof PARTS)))
      .toEqual([6, 8, 2, 2]);
    l.enforced.sclerite = 1;
    expect(mutationWeight(l, 'gill')).toBe(4); // another guard in the same family
    expect(mutationWeight(l, 'eye')).toBe(1);
  });

  it('passes once for free and rejects invalid picks, repeat picks and picks after the Life ends', () => {
    const l = life();
    expect(pickMutation(l, null)).toBe(false);
    adult(l);
    const before = structuredClone(l);
    expect(pickMutation(l, 'hook')).toBe(false);
    expect(l).toEqual(before);
    expect(pickMutation(l, null)).toBe(true);
    expect([l.turn, l.food, l.eggs, l.mutation, l.eggsAfter]).toEqual([before.turn, before.food, 0, null, 0]);
    expect(pickMutation(l, before.mutationOffer![0])).toBe(false);
    stay(l); grow(l);
    expect(l.mutationOffer).toEqual([]);
    const over = adult(life());
    over.phase = 'over'; over.cause = 'season';
    expect(pickMutation(over, over.mutationOffer![0])).toBe(false);
    expect(over.mutation).toBeNull();
  });
});

describe('taking a mutation', () => {
  it('adds a feeding part immediately without displacing growth, charges its upkeep and leaves the parent intact', () => {
    const parts: Build['parts'] = { front: 'rake', limbs: 'leg', eyes: 'eye', sides: 'spine', tail: 'pouch' };
    const l = adult(life(parts, 7, 'arthropod'));
    const before = { turn: l.turn, food: l.food, upkeep: upkeep(l) };
    expect(activeParts(l)).toEqual(['rake', 'leg', 'eye']);
    expect(pickMutation(l, 'gut')).toBe(true);
    expect(l.mutation).toEqual({ part: 'gut', place: 'back' });
    expect(activeParts(l)).toEqual(['rake', 'leg', 'eye', 'gut']);
    expect(newest(l)).toBe('back');
    expect([l.turn, l.food, upkeep(l), foodOf(l, 'mat')]).toEqual([before.turn, before.food, before.upkeep + 1, 7]);
    expect(parts.back).toBeUndefined();
    expect(l.events).toEqual([{ k: 'part', place: 'back', part: 'gut' }]);
    expect(pickMutation(l, 'shield')).toBe(false);
    stay(l);
    expect(l.food).toBe(before.food - before.upkeep - 1);
    grow(l);
    expect(activeParts(l)).toEqual(['rake', 'leg', 'eye', 'gut', 'spine']);
    expect(newest(l)).toBe('sides');
    expect(l.events).toContainEqual({ k: 'part', place: 'sides', part: 'spine' });
    loseAt(l, 'back');
    expect(activeParts(l)).toEqual(['rake', 'leg', 'eye', 'spine']);
    expect(upkeep(l)).toBe(before.upkeep + 1); // the newly grown spine still costs one
    stay(l); grow(l);
    expect(activeParts(l)).toEqual(['rake', 'leg', 'eye', 'spine', 'pouch']);
  });

  it('activates a brood mutation even when its family would fall beyond the current size', () => {
    const l = adult(life({ front: 'tentacles', back: 'gut', eyes: 'eye', sides: 'sclerite' }));
    expect(pickMutation(l, 'pouch')).toBe(true);
    expect(activeParts(l)).toEqual(['tentacles', 'gut', 'eye', 'pouch']);
    expect(layYield(l)).toBe(6);
    loseAt(l, 'tail');
    expect(layYield(l)).toBe(3);
    expect(verbs(l)).toContain('graze');
  });

  it('counts only eggs laid after the pick, including after a shed, and snapshots the result', () => {
    const l = life({ back: 'progenesis' });
    lay(l);
    expect([l.eggs, l.eggsAfter]).toEqual([1, 0]);
    adult(l);
    pickMutation(l, l.mutationOffer![0]);
    const n = layYield(l);
    lay(l);
    expect([l.eggs, l.eggsAfter]).toEqual([1 + n, n]);
    loseAt(l, l.mutation!.place);
    const next = layYield(l);
    lay(l);
    expect(l.eggsAfter).toBe(n + next);
    expect(resultOf(l)).toBeNull();
    l.phase = 'over'; l.cause = 'season';
    const result = resultOf(l)!;
    expect(result.mutation).toEqual(l.mutation);
    expect(result.eggsAfter).toBe(n + next);
    l.mutation!.part = 'hook'; l.eggsAfter = 0;
    expect(result.mutation!.part).not.toBe('hook');
    expect(result.eggsAfter).toBe(n + next);
  });
});
