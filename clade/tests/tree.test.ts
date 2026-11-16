// B0 contract: the build toy's rules. The data tests run now; the rest is skipped until `startTree` is built, and
// from then on every test here runs and passes. A builder never edits this file: a test that seems wrong is a
// question for the architect (docs/status.md). The architect could not run the skipped tests (no bodies yet).
import { describe, expect, it } from 'vitest';
import { ENFORCE_EFFECT, ENFORCE_HEADROOM } from '../src/data/economy';
import { CELL, COLS, NODES, ROWS, RULE } from '../src/data/life';
import { PARTS } from '../src/data/parts';
import { TOY_BOARDS } from '../src/data/toy-boards';
import { TREE, WORM_TREE } from '../src/data/tree';
import { canEnforce, enforce, enforceCost, grow } from '../src/sim/economy';
import { foodOf, loseAt, newLife, verbs, type Board } from '../src/sim/life';
import { activeParts, activePlaces, newest } from '../src/sim/life-body';
import type { Build, PartId } from '../src/sim/records';
import { branchOf, buyPoint, canBuyPoint, canSpend, nodeState, pointCost, spend, startTree, treeOf } from '../src/sim/tree';

const BOARD: Board = {
  substrate: 'sand', map: Array.from({ length: ROWS }, () => '.'.repeat(COLS)),
  start: [3, 1], entry: [0, 0], predatorAt: null, event: null, rivals: [],
};
const fresh = (parts: Build['parts'] = {}) => newLife(BOARD, { clade: 'worm', parts, genes: { size: 1, gut: 1 } }, {}, 7);
/** A bare worm in tree mode with `points` to spend. */
const worm = (points = TREE.birthPoints) => { const l = fresh(); startTree(l); l.tree!.points = points; return l; };
const built = (() => { try { return startTree(fresh()); } catch { return false; } })();
const parts = WORM_TREE.map((n) => n.part);

describe('the worm tree and the toy boards (data)', () => {
  it('is a tree of worm parts inside the budget', () => {
    expect(WORM_TREE.length).toBeLessThanOrEqual(TREE.maxNodes);
    expect(new Set(parts).size).toBe(parts.length);
    expect(new Set(WORM_TREE.map((n) => n.branch)).size).toBeLessThanOrEqual(3);
    for (const n of WORM_TREE) {
      expect(PARTS[n.part].plans, n.part).toContain('worm');
      expect(PARTS[n.part].rare, n.part).toBeFalsy();
      expect(ENFORCE_EFFECT[n.part], `${n.part} can take a rank`).toBeDefined();
      for (const need of n.needs ?? []) {
        expect(parts, `${n.part} needs ${need}`).toContain(need);
        expect(PARTS[need].place, `${n.part} needs a node on its own place`).not.toBe(PARTS[n.part].place);
      }
    }
    expect(WORM_TREE.some((n) => !n.needs)).toBe(true);
  });

  it('has three boards a bare worm can start on', () => {
    expect(TOY_BOARDS.map((b) => b.id)).toEqual(['mats', 'mud', 'hunted']);
    for (const { id, board } of TOY_BOARDS) {
      expect(board.map.length, id).toBe(ROWS);
      for (const row of board.map) { expect(row.length, id).toBe(COLS); for (const c of row) expect(CELL[c], `${id} ${c}`).toBeDefined(); }
      expect(board.map[board.start[1]][board.start[0]], `${id} start`).toBe('.');
      expect(board.map.join(''), `${id}: a bare worm eats mats`).toContain('m');
      expect(() => newLife(board, { clade: 'worm', parts: {}, genes: { size: 1, gut: 1 } }, {}, 1)).not.toThrow();
    }
    expect(TOY_BOARDS.filter((b) => b.board.predatorAt !== null).map((b) => b.id)).toEqual(['hunted']);
  });
});

describe.skipIf(!built)('a Life in tree mode (B0 part A)', () => {
  it('starts bare with the birth points, and only from a bare build', () => {
    const l = fresh();
    expect(l.tree).toBeUndefined();
    expect(startTree(l)).toBe(true);
    expect(l.tree).toEqual({ points: TREE.birthPoints, bought: 0, grown: [] });
    expect(activeParts(l)).toEqual([]);
    expect(verbs(l)).toEqual([]);
    expect(treeOf(l)).toBe(WORM_TREE);
    const dressed = fresh({ front: 'tentacles' });
    expect(startTree(dressed)).toBe(false);
    expect(dressed.tree).toBeUndefined();
  });

  it('leaves a Life outside tree mode alone', () => {
    const l = fresh({ front: 'tentacles' });
    l.food = 99;
    expect([canSpend(l, 'tentacles'), spend(l, 'tentacles'), canBuyPoint(l), buyPoint(l)]).toEqual([false, false, false, false]);
    expect(pointCost(l)).toBeNull();
    expect(branchOf(l)).toBeNull();
    expect(l.food).toBe(99);
  });

  it('a point grows a root node at once: the part, its verb, an event, no food and no turn', () => {
    const l = worm();
    const { turn, food } = l;
    expect(nodeState(l, 'tentacles')).toEqual({ k: 'open' });
    expect(spend(l, 'tentacles')).toBe(true);
    expect(l.tree).toEqual({ points: 0, bought: 0, grown: ['front'] });
    expect(l.build.parts).toEqual({ front: 'tentacles' });
    expect(activeParts(l)).toEqual(['tentacles']);
    expect(verbs(l)).toEqual(['graze']);
    expect(l.events).toContainEqual({ k: 'part', place: 'front', part: 'tentacles' });
    expect([l.turn, l.food]).toEqual([turn, food]);
    expect(spend(l, 'eye')).toBe(false); // no point left
    expect(l.build.parts).toEqual({ front: 'tentacles' });
  });

  it('refuses a part that is not in the tree', () => {
    const l = worm(3);
    for (const part of ['hook', 'claw', 'deep'] as PartId[]) {
      expect(nodeState(l, part).k, part).toBe('shut');
      expect(spend(l, part), part).toBe(false);
    }
    expect(l.tree!.points).toBe(3);
  });

  it('two nodes on one place are an either/or', () => {
    const l = worm(3);
    spend(l, 'tentacles');
    const state = nodeState(l, 'proboscis');
    expect(state.k).toBe('shut');
    expect(state.k === 'shut' && state.why).toBeTruthy();
    expect(canSpend(l, 'proboscis')).toBe(false);
    expect(spend(l, 'proboscis')).toBe(false);
    expect(l.tree!.points).toBe(2);
  });

  it('a node with needs opens once any one of them is grown', () => {
    for (const first of ['tentacles', 'proboscis'] as PartId[]) {
      const l = worm(3);
      expect(nodeState(l, 'gut').k).toBe('shut');
      expect(spend(l, 'gut')).toBe(false);
      spend(l, first);
      expect(nodeState(l, 'gut')).toEqual({ k: 'open' });
      expect(spend(l, 'gut')).toBe(true);
      expect(activeParts(l)).toEqual([first, 'gut']);
    }
    const l = worm(3);
    expect(nodeState(l, 'gill').k).toBe('shut');
    spend(l, 'bulb');
    expect(spend(l, 'gill')).toBe(true);
  });

  it('a moult gives a point and switches nothing on by itself; no mutation is offered', () => {
    const l = worm();
    spend(l, 'tentacles');
    l.food = 99;
    for (let size = 2; size <= RULE.maxSize; size++) {
      expect(grow(l)).toBe(true);
      expect(l.size).toBe(size);
      expect(l.tree!.points).toBe((size - 1) * TREE.moultPoints);
      expect(activeParts(l)).toEqual(['tentacles']);
      expect(l.events.some((e) => e.k === 'part')).toBe(false);
      expect(l.mutationOffer ?? []).toEqual([]);
      l.grew = false;
    }
    expect(l.mutation).toBeNull();
  });

  it('food buys points at rising prices, without a turn, until the list ends', () => {
    const l = worm(0);
    l.food = 2;
    expect(pointCost(l)).toBe(TREE.pointCosts[0]);
    expect([canBuyPoint(l), buyPoint(l)]).toEqual([false, false]);
    l.food = 99;
    const turn = l.turn;
    for (const [i, price] of TREE.pointCosts.entries()) {
      const food = l.food;
      expect(pointCost(l)).toBe(price);
      expect(buyPoint(l)).toBe(true);
      expect([l.food, l.tree!.points, l.tree!.bought, l.turn]).toEqual([food - price, i + 1, i + 1, turn]);
    }
    expect(pointCost(l)).toBeNull();
    expect([canBuyPoint(l), buyPoint(l)]).toEqual([false, false]);
  });

  it('a point on a grown node adds a rank, up to the old Enforce cap', () => {
    const l = worm(4);
    spend(l, 'tentacles');
    expect(nodeState(l, 'tentacles')).toEqual({ k: 'grown', rank: 0, cap: ENFORCE_HEADROOM });
    expect(foodOf(l, 'mat')).toBe(NODES.mat.food);
    expect(spend(l, 'tentacles')).toBe(true);
    expect(l.enforced.tentacles).toBe(1);
    expect(l.events).toContainEqual({ k: 'enforce', part: 'tentacles', rank: 1, food: l.food });
    expect(foodOf(l, 'mat')).toBe(NODES.mat.food + 1);
    expect(nodeState(l, 'tentacles')).toEqual({ k: 'grown', rank: 1, cap: ENFORCE_HEADROOM });
    expect(canSpend(l, 'tentacles')).toBe(false);
    expect(spend(l, 'tentacles')).toBe(false);
    expect(l.tree!.points).toBe(2);
  });

  it('food cannot Enforce in tree mode: ranks cost points', () => {
    const l = worm();
    spend(l, 'tentacles');
    l.food = 99;
    expect(enforceCost(l)).toBeNull();
    expect([canEnforce(l, 'tentacles'), enforce(l, 'tentacles')]).toEqual([false, false]);
    expect(l.food).toBe(99);
  });

  it('keeps the order grown, and a lost place stays lost', () => {
    const l = worm(4);
    spend(l, 'bulb'); spend(l, 'tentacles');
    expect(activePlaces(l)).toEqual(['tail', 'front']);
    expect(newest(l)).toBe('front');
    loseAt(l, 'front');
    expect(activeParts(l)).toEqual(['bulb']);
    expect(nodeState(l, 'tentacles').k).toBe('shut');
    expect(nodeState(l, 'proboscis').k).toBe('shut');
    expect([spend(l, 'tentacles'), spend(l, 'proboscis')]).toEqual([false, false]);
    expect(nodeState(l, 'gut')).toEqual({ k: 'open' }); // its need was grown, lost or not
    expect(l.tree!.points).toBe(2);
  });

  it('names the branch you spent most in; a tie goes to the branch grown first', () => {
    const none = worm(5);
    expect(branchOf(none)).toBeNull();
    const feeder = worm(5);
    for (const p of ['bulb', 'tentacles', 'gut'] as PartId[]) spend(feeder, p);
    expect(branchOf(feeder)).toBe('feed');
    const tie = worm(5);
    for (const p of ['bulb', 'tentacles'] as PartId[]) spend(tie, p);
    expect(branchOf(tie)).toBe('burrow');
    spend(tie, 'tentacles'); // a rank counts as a point
    expect(branchOf(tie)).toBe('feed');
    const spawner = worm(5);
    for (const p of ['eye', 'pouch', 'pouch'] as PartId[]) spend(spawner, p);
    expect(branchOf(spawner)).toBe('spawn');
  });
});
