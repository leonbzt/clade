import { describe, expect, it } from 'vitest';
import { COLS, ROWS, RULE, TURNS } from '../src/data/life';
import { canEnforce, canLay, enforce, enforceCost, grow, growCost, lay, payback, resultOf } from '../src/sim/economy';
import { at, foodOf, hitOn, loseAt, newLife, oxygenMax, range, sense, stay, tunnel, type Board } from '../src/sim/life';
import { activeParts } from '../src/sim/life-body';
import type { Build, Ranks } from '../src/sim/records';

const BOARD: Board = {
  substrate: 'sand', map: Array.from({ length: ROWS }, () => '.'.repeat(COLS)),
  start: [3, 1], entry: [0, 0], predatorAt: null, event: null, rivals: [],
};
const life = (parts: Build['parts'], ranks: Ranks = {}, clade: Build['clade'] = 'worm', board = BOARD) =>
  newLife(board, { clade, parts, genes: { size: 1, gut: 1 } }, ranks, 7);

describe('Grow', () => {
  it('charges the ported prices and activates a free part once per turn', () => {
    const l = life({ front: 'tentacles', sides: 'sclerite', tail: 'pouch' });
    l.food = 99;
    expect(activeParts(l)).toEqual(['tentacles']);
    for (const [i, price] of [2, 2, 3, 3].entries()) {
      const turn = l.turn, food = l.food;
      expect(growCost(l)).toBe(price);
      expect(grow(l)).toBe(true);
      expect([l.turn, l.size, l.food, l.soft]).toEqual([turn, i + 2, food - price, false]);
      expect(grow(l)).toBe(false);
      if (i === 0) {
        expect(l.events).toContainEqual({ k: 'part', part: 'sclerite', place: 'sides' });
        loseAt(l, 'front');
      }
      stay(l);
    }
    expect(activeParts(l)).toEqual(['sclerite', 'pouch']);
    expect(grow(l)).toBe(false);
  });

  it.each(['arthropod', 'trilobite'] as const)('makes a moulting %s soft until the turn ends', (clade) => {
    const l = life({ front: 'rake' }, {}, clade);
    expect(grow(l)).toBe(true);
    l.moved = true;
    expect(hitOn(l, 1, 1, l.x, l.y).damage).toBe(2);
    stay(l);
    expect(l.soft).toBe(false);
  });
});

describe('Enforce', () => {
  it('charges 3, 5, 7, 9 and 11 across parts and caps each at its line rank plus one', () => {
    const l = life({ front: 'tentacles', tail: 'pouch', sides: 'sclerite', eyes: 'eye', back: 'gut' }, { tentacles: 1 });
    expect(canEnforce(l, 'pouch')).toBe(false);
    l.size = 5; l.food = 99;
    for (const [part, price] of [['tentacles', 3], ['tentacles', 5], ['pouch', 7], ['sclerite', 9], ['eye', 11]] as const) {
      const food = l.food;
      expect(enforceCost(l)).toBe(price);
      expect(enforce(l, part)).toBe(true);
      expect(l.food).toBe(food - price);
      if (price === 5) expect(canEnforce(l, 'tentacles')).toBe(false);
      if (price === 7) expect(canEnforce(l, 'pouch')).toBe(false);
    }
    expect([l.turn, enforceCost(l), enforce(l, 'gut')]).toEqual([1, null, false]);
    expect(l.enforced).toEqual({ tentacles: 2, pouch: 1, sclerite: 1, eye: 1 });
  });

  it('rejects an unavailable effect or purchase the Life cannot afford', () => {
    const l = life({ tail: 'progenesis', front: 'tentacles' });
    l.size = 2;
    expect(canEnforce(l, 'progenesis')).toBe(false);
    l.food = 2;
    expect(enforce(l, 'tentacles')).toBe(false);
    expect(l.food).toBe(2);
  });

  it('adds the matching meal bonus only, and loses it when the part is torn', () => {
    const l = life({ front: 'tentacles', tail: 'bulb', back: 'gut' });
    l.size = 3; l.food = 99; l.turn = 9;
    expect(payback(l, 'tentacles')).toBe('pays back after 3 mats · 12 turns left');
    expect(enforce(l, 'tentacles')).toBe(true);
    expect([foodOf(l, 'mat'), foodOf(l, 'buried'), foodOf(l, 'shell')]).toEqual([8, 8, 11]);
    expect(payback(l, 'bulb')).toBe('pays back after 5 buried meals · 12 turns left');
    expect(enforce(l, 'bulb')).toBe(true);
    expect(enforce(l, 'gut')).toBe(true);
    expect([foodOf(l, 'mat'), foodOf(l, 'buried'), foodOf(l, 'shell')]).toEqual([9, 10, 12]);
    loseAt(l, 'front');
    expect(foodOf(l, 'mat')).toBe(8);
    expect(l.enforced.tentacles).toBe(1);
  });

  it('adds range, speed, tunnel, oxygen and sight for the active parts', () => {
    const a = life({ limbs: 'leg', sides: 'flap', eyes: 'eye', back: 'gill' }, {}, 'arthropod');
    a.size = 4; a.food = 99;
    expect([range(a), oxygenMax(a), sense(a)]).toEqual([3, 5, 3]);
    for (const part of ['leg', 'flap', 'gill', 'eye'] as const) expect(enforce(a, part)).toBe(true);
    expect([range(a), oxygenMax(a), sense(a)]).toEqual([5, 6, 5]);
    const worm = life({ sides: 'chaetae' });
    expect(enforce(worm, 'chaetae')).toBe(true);
    expect(tunnel(worm)).toBe(5);
  });

  it('spends one guard charge only on a strike that would otherwise land', () => {
    const l = life({ sides: 'sclerite' });
    l.food = 99;
    expect(payback(l, 'sclerite')).toBe('blocks the next hit · 20 turns left');
    enforce(l, 'sclerite');
    const strike = (dir: 1 | 2) => {
      l.pred = { x: 4, y: 1, dir, marks: [at(l.x, l.y)], state: 'strike', rest: 0, lx: l.x, ly: l.y };
      stay(l, 1);
    };
    strike(2);
    expect(l.spentGuards).toEqual({});
    expect(hitOn(l, 1, 1, l.x, l.y).enforced).toBe(true);
    expect(l.spentGuards).toEqual({});
    strike(1);
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'strike', kind: 'blocked', enforced: true }));
    expect(l.spentGuards).toEqual({ sclerite: 1 });
    strike(1);
    expect(l.health).toBe(RULE.health - 1);
  });
});

describe('Lay and results', () => {
  it('lays once per turn from size 3, applying pouch ranks and the mud clutch bonus', () => {
    const board = { ...BOARD, map: BOARD.map.map((row, y) => y === 1 ? '...~....' : row) };
    const l = life({ sides: 'pouch', tail: 'deep' }, {}, 'worm', board);
    expect(canLay(l)).toBe(false);
    l.size = 3; l.food = 99;
    enforce(l, 'pouch');
    expect(payback(l, 'pouch')).toContain('+1 egg each lay');
    const food = l.food;
    expect(lay(l)).toBe(true);
    expect([l.turn, l.food, l.eggs]).toEqual([2, food - 4, 8]);
    expect(l.events[0]).toEqual({ k: 'lay', n: 8, eggs: 8, food: food - 4 });
    expect(lay(l)).toBe(true);
    expect(l.food).toBe(food - 4 - 6); // each later clutch costs 2 more
  });

  it('progenesis allows an early lay, and the finished result is a snapshot', () => {
    const l = life({ back: 'progenesis' });
    l.rivals = [{ at: [0, 0], x: 0, y: 0, species: 'rival', name: 'Rival', eats: 'mat', build: l.build }];
    expect(resultOf(l)).toBeNull();
    expect(lay(l)).toBe(true);
    l.turn = TURNS; l.food = 10; l.ate.mat = 5;
    stay(l);
    const result = resultOf(l);
    expect(result).toEqual({ eggs: 1, cause: 'season', enforced: {}, ate: { mat: 5 }, witnessed: ['rival'] });
    l.ate.mat = 10;
    expect(result?.ate.mat).toBe(5);
    const dying = life({});
    dying.food = 0; dying.health = 1;
    stay(dying);
    expect(resultOf(dying)?.cause).toBe('died');
  });
});
