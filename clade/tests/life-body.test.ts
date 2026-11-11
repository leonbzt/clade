import { describe, expect, it } from 'vitest';
import { partUpkeep, reach } from '../src/sim/fitness';
import {
  activeParts, clutch, foodOf, growthOrder, lockOf, newest, oxygenMax, range, sense, strikeOn, tunnel, upkeep, verbs,
  type LifeBody, type LifePlan,
} from '../src/sim/life-body';
import type { Build } from '../src/sim/records';

function body(clade: LifePlan, parts: Build['parts'], size = 1): LifeBody {
  return { build: { clade, parts, genes: { size: 5, gut: 1 } }, size, lost: [], ranks: {}, enforced: {}, spentGuards: {} };
}

describe('the Life body', () => {
  it('activates families in order, breaks ties by place, and activates all six places at size 5', () => {
    const b = body('arthropod', { tail: 'pouch', sides: 'rake', back: 'shield', limbs: 'leg', eyes: 'eye', front: 'claw' });
    expect(growthOrder(b.build)).toEqual(['front', 'sides', 'limbs', 'eyes', 'back', 'tail']);
    expect(activeParts(b)).toEqual(['claw']);
    b.size = 4;
    expect(verbs(b)).toEqual(['crush', 'graze', 'dash', 'sense']);
    b.size = 5;
    expect(activeParts(b)).toEqual(['claw', 'rake', 'leg', 'eye', 'shield', 'pouch']);
    b.size = 4;
    b.lost.push('limbs');
    expect(activeParts(b)).toEqual(['claw', 'rake', 'eye']);
    expect(newest(b)).toBe('eyes');
    b.size = 5;
    expect(activeParts(b)).toEqual(['claw', 'rake', 'eye', 'shield', 'pouch']);
    expect(clutch(b)).toBe(10);
  });

  it('turns on the grazer worm in feeding, guard, brood order', () => {
    const b = body('worm', { tail: 'pouch', sides: 'sclerite', front: 'tentacles' });
    expect(verbs(b)).toEqual(['graze']);
    expect(strikeOn(b, 'left').kind).toBe('hit');
    b.size = 2;
    expect(verbs(b)).toEqual(['graze', 'brace']);
    expect(strikeOn(b, 'right')).toMatchObject({ kind: 'blocked', part: 'sclerite', damage: 0 });
    expect(strikeOn(b, 'front', { soft: true })).toMatchObject({ kind: 'hit', tear: 'front', damage: 2 });
    expect(clutch(b)).toBe(2);
    b.size = 3;
    expect(clutch(b)).toBe(6);
  });

  it('derives food, movement, sense, oxygen and upkeep from the parts that are on', () => {
    const b = body('arthropod', { front: 'rake', back: 'gut', limbs: 'leg', eyes: 'eye', sides: 'gill' });
    b.ranks = { rake: 2, gut: -1 };
    expect(upkeep(b)).toBe(1 + partUpkeep('rake', b.ranks));
    expect(foodOf(b, 'mat')).toBe(5);
    expect([range(b), sense(b), oxygenMax(b)]).toEqual([2, 1, 3]);
    b.size = 5;
    expect([range(b), sense(b), oxygenMax(b)]).toEqual([3, 3, 5]);
    expect(foodOf(b, 'mat')).toBe(7);
    expect(upkeep(b)).toBe(4);
    b.lost.push('back', 'sides');
    expect([foodOf(b, 'mat'), oxygenMax(b), upkeep(b)]).toEqual([5, 3, 3]);
    expect(tunnel(body('worm', { sides: 'chaetae' }))).toBe(4);
  });

  it('locks sea foods exactly when reach is zero for the active build', () => {
    const worm = body('worm', { front: 'tentacles', tail: 'bulb' });
    const arthropod = body('arthropod', { front: 'rake', limbs: 'digger' }, 5);
    const cases: [LifeBody, Build['parts']][] = [
      [worm, { front: 'tentacles' }],
      [{ ...worm, size: 2 }, worm.build.parts],
      [{ ...worm, size: 2, lost: ['tail'] }, { front: 'tentacles' }],
      [arthropod, arthropod.build.parts],
    ];
    for (const [b, parts] of cases) {
      const activeBuild = { ...b.build, parts };
      for (const substrate of ['mud', 'sand', 'rock'] as const) {
        for (const [node, food] of [['mat', 'mats'], ['buried', 'detritus']] as const)
          expect(lockOf(b, node, substrate) !== null)
            .toBe(reach(activeBuild, b.ranks, food, { kind: { substrate } }) === 0);
      }
    }
  });
});
