// B0 round two contract, part A: the kit. The data tests run now; the rest is skipped until `startKit` is built, and
// from then on every test here runs and passes. A builder never edits this file: a test that seems wrong is a
// question for the architect (docs/status.md). The architect could not run the skipped tests (no bodies yet).
import { describe, expect, it } from 'vitest';
import { GATES, KIT, WORM_KIT, type KitId, type Rung, type StatId } from '../src/data/kit';
import { KIT_BOARDS } from '../src/data/kit-boards';
import { CELL, COLS, ROWS, type NodeId } from '../src/data/life';
import { PARTS } from '../src/data/parts';
import { canEnforce, enforceCost, grow } from '../src/sim/economy';
import { afterLife, branchOf, buyPoint, canBuyPoint, canSpend, kitState, levelOf, nextLevel, nodeOf, planOk, pointCost,
  rollOffer, spend, startKit } from '../src/sim/kit';
import { kitStats } from '../src/sim/kit-stats';
import { loseAt, newLife, verbs, type Board, type Life } from '../src/sim/life';
import { activeParts, activePlaces, newest } from '../src/sim/life-body';
import type { Build, PartId, Stats } from '../src/sim/records';
import { startTree } from '../src/sim/tree';

const BOARD: Board = {
  substrate: 'sand', map: Array.from({ length: ROWS }, () => '.'.repeat(COLS)),
  start: [3, 1], entry: [0, 0], predatorAt: null, event: null, rivals: [],
};
const fresh = (seed = 7, parts: Build['parts'] = {}) => newLife(BOARD, { clade: 'worm', parts, genes: { size: 1, gut: 1 } }, {}, seed);
/** A bare worm in kit mode with `points` to spend. */
const worm = (level = 4, plan: PartId[] = [], points = 9, seed = 7) => {
  const l = fresh(seed); startKit(l, level, plan); l.kit!.points = points; return l;
};
/** Grow each node, or climb it one rung, putting it on offer first as a moult's roll would. */
const give = (l: Life, ...ids: KitId[]) => {
  for (const id of ids) { if (!l.kit!.rungs[id]) l.kit!.offer = [id]; expect(spend(l, id), id).toBe(true); }
};
const sum = (rungs: readonly Rung[]): Stats => {
  const s: Stats = { ...KIT.base };
  for (const r of rungs) for (const k of Object.keys(r.adds) as StatId[]) s[k] += r.adds[k]!;
  return s;
};
const place = (id: KitId) => PARTS[id as PartId].place;
const built = (() => { try { return startKit(fresh(), 1, []); } catch { return false; } })();
const top = KIT.levelEggs.length;

describe('the worm kit and the kit boards (data)', () => {
  const parts = WORM_KIT.filter((n) => n.kind === 'part'), ids = WORM_KIT.map((n) => n.id as KitId);
  /** The most of a stat one body can hold: the best node of each place, and every trait. */
  const most = (stat: StatId) => {
    const of = (id: KitId) => nodeOf(id)!.rungs.reduce((t, r) => t + (r.adds[stat] ?? 0), 0);
    const places = [...new Set(parts.map((n) => place(n.id)))];
    return KIT.base[stat] + places.reduce((t, p) => t + Math.max(...parts.filter((n) => place(n.id) === p).map((n) => of(n.id))), 0)
      + WORM_KIT.filter((n) => n.kind === 'trait').reduce((t, n) => t + of(n.id), 0);
  };

  it('is a kit of worm nodes inside the budget', () => {
    expect(new Set(ids).size).toBe(ids.length);
    expect(parts.length).toBeLessThanOrEqual(KIT.budget.parts);
    expect(WORM_KIT.length - parts.length).toBeLessThanOrEqual(KIT.budget.traits);
    expect(new Set(parts.map((n) => place(n.id))).size).toBeLessThanOrEqual(KIT.budget.slots);
    expect(new Set(WORM_KIT.map((n) => n.branch)).size).toBeLessThanOrEqual(3);
    const names = WORM_KIT.flatMap((n) => n.rungs.map((r) => r.name));
    expect(new Set(names).size).toBe(names.length);
    for (const n of WORM_KIT) {
      if (n.kind === 'part') expect(PARTS[n.id].plans, n.id).toContain('worm');
      expect(n.rungs.length, n.id).toBeGreaterThanOrEqual(1);
      expect(n.rungs.length, n.id).toBeLessThanOrEqual(KIT.budget.rungs);
      expect(n.level >= 1 && n.level <= top, `${n.id} level`).toBe(true);
      for (const r of n.rungs) {
        expect(r.name, n.id).not.toBe('');
        expect(Object.keys(r.adds).length, `${r.name} adds a stat`).toBeGreaterThan(0);
        for (const v of Object.values(r.adds)) expect(Number.isInteger(v) && v > 0, r.name).toBe(true);
      }
      for (const need of n.needs ?? []) {
        expect(ids, `${n.id} needs ${need}`).toContain(need);
        if (n.kind === 'part' && nodeOf(need)!.kind === 'part') expect(place(need), `${n.id} needs its own place`).not.toBe(place(n.id));
      }
      if (n.needs) expect(n.needs.some((need) => nodeOf(need)!.level <= n.level), `${n.id} can be reached at its level`).toBe(true);
    }
  });

  it('opens something at every level, and every stat and gate can be reached', () => {
    expect(KIT.levelEggs[0]).toBe(0);
    for (const table of [KIT.planSlots, KIT.rungCap]) expect(table.length).toBe(top);
    for (let lv = 2; lv <= top; lv++) {
      expect(KIT.levelEggs[lv - 1]).toBeGreaterThan(KIT.levelEggs[lv - 2]);
      expect(WORM_KIT.some((n) => n.level === lv) || KIT.planSlots[lv - 1] > KIT.planSlots[lv - 2]
        || KIT.rungCap[lv - 1] > KIT.rungCap[lv - 2], `level ${lv} opens something`).toBe(true);
    }
    const first = WORM_KIT.filter((n) => n.level === 1 && !n.needs && !n.rare && n.kind === 'part');
    expect(new Set(first.map((n) => place(n.id))).size, 'places to grow on at level 1').toBeGreaterThanOrEqual(3);
    for (const stat of Object.keys(KIT.base) as StatId[]) expect(most(stat), stat).toBeGreaterThan(KIT.base[stat]);
    for (const node of Object.keys(GATES) as NodeId[]) expect(most(GATES[node].stat), node).toBeGreaterThanOrEqual(GATES[node].min);
    for (const node of ['mat', 'buried'] as const) expect(KIT.base[GATES[node].stat], `a bare worm eats ${node}`).toBeGreaterThanOrEqual(GATES[node].min);
    expect(most('defence')).toBeGreaterThanOrEqual(KIT.strike);
    expect(KIT.base.defence).toBeLessThan(KIT.strike);
  });

  it('has three quiet boards a bare worm can start on, one of them hunted', () => {
    expect(KIT_BOARDS.length).toBe(3);
    expect(new Set(KIT_BOARDS.map((b) => b.id)).size).toBe(3);
    expect(KIT_BOARDS.filter((b) => b.board.predatorAt !== null).length).toBe(1);
    for (const { id, goal, board } of KIT_BOARDS) {
      expect(goal, id).toBeGreaterThan(0);
      expect(board.map.length, id).toBe(ROWS);
      for (const row of board.map) { expect(row.length, id).toBe(COLS); for (const c of row) expect(CELL[c], `${id} cell ${c}`).toBeDefined(); }
      for (const [x, y] of [board.start, board.entry]) expect(CELL[board.map[y][x]][0], id).not.toBe('rock');
      expect(board.rivals.length + (board.event ? 1 : 0), id).toBe(0);
      expect(board.map.join('').split('').some((c) => CELL[c][1] === 'mat' || CELL[c][1] === 'buried'), id).toBe(true);
      if (board.predatorAt !== null) expect(board.predatorAt, id).toBeLessThan(KIT.season);
    }
  });
});

describe.skipIf(!built)('a Life in kit mode: the kit (part A)', () => {
  it('starts bare with a birth point, its plan and a first offer', () => {
    const l = fresh();
    expect(startKit(l, 2, ['proboscis', 'eye'])).toBe(true);
    expect(l.kit).toMatchObject({ level: 2, plan: ['proboscis', 'eye'], points: KIT.birthPoints, bought: 0,
      grown: [], order: [], rungs: {}, offers: 1, task: null });
    expect(l.kit!.offer.length).toBeGreaterThan(0);
    for (const id of l.kit!.offer) expect(kitState(l, id), id).toEqual({ k: 'open', by: 'offer' });
    expect(kitStats(l.kit!, l.lost)).toEqual(KIT.base);
    expect(startKit(l, 2, [])).toBe(false);
    expect(startKit(fresh(7, { front: 'proboscis' }), 2, [])).toBe(false);
    const tree = fresh(); startTree(tree);
    expect(startKit(tree, 2, [])).toBe(false);
  });

  it('takes only a plan the level allows', () => {
    const ok: [number, PartId[]][] = [[1, []], [1, ['proboscis']], [2, ['proboscis', 'eye']], [2, ['sclerite']], [4, ['proboscis', 'eye', 'bulb']]];
    const bad: [number, PartId[]][] = [[0, []], [top + 1, []], [1, ['proboscis', 'eye']], [2, ['proboscis', 'tentacles']], [2, ['eye', 'eye']],
      [1, ['sclerite']], [4, ['hook']], [4, ['claw']], [4, ['proboscis', 'eye', 'bulb', 'chaetae']]];
    for (const [level, plan] of ok) expect(planOk(level, plan), `${level} ${plan}`).toBe(true);
    for (const [level, plan] of bad) {
      expect(planOk(level, plan), `${level} ${plan}`).toBe(false);
      const l = fresh();
      expect(startKit(l, level, plan)).toBe(false);
      expect(l.kit).toBeUndefined();
    }
  });

  it('tells each node’s state, first match first', () => {
    expect(kitState(fresh(), 'eye').k).toBe('shut');
    const low = worm(1);
    expect(kitState(low, 'sclerite')).toEqual({ k: 'locked', level: 2 });
    expect(kitState(low, 'venom')).toEqual({ k: 'locked', level: 2 });
    const l = worm(4, ['proboscis']);
    l.kit!.offer = ['eye'];
    expect(kitState(l, 'claw')).toEqual({ k: 'shut', why: 'not in the kit' });
    expect(kitState(l, 'proboscis')).toEqual({ k: 'open', by: 'plan' });
    expect(kitState(l, 'eye')).toEqual({ k: 'open', by: 'offer' });
    expect(kitState(l, 'chaetae')).toEqual({ k: 'wait' });
    expect(kitState(l, 'gut')).toEqual({ k: 'shut', why: 'needs tentacles or proboscis' });
    expect(kitState(l, 'venom')).toEqual({ k: 'shut', why: 'needs proboscis or hooked proboscis' });
    give(l, 'proboscis');
    expect(kitState(l, 'proboscis')).toEqual({ k: 'grown', rung: 1, cap: KIT.rungCap[3] });
    expect(kitState(l, 'tentacles')).toEqual({ k: 'shut', why: 'proboscis grows there' });
    expect(kitState(l, 'gut')).toEqual({ k: 'wait' });
  });

  it('spends a point to grow a planned or an offered node, never food or a turn', () => {
    const l = worm(4, ['proboscis'], 2), before = l.build, food = l.food, turn = l.turn;
    l.kit!.offer = ['eye', 'bulb'];
    expect(canSpend(l, 'chaetae')).toBe(false);
    expect(spend(l, 'chaetae')).toBe(false);
    expect(spend(l, 'proboscis')).toBe(true);
    expect(l.build).not.toBe(before);
    expect(before.parts).toEqual({});
    expect(l.build.parts).toEqual({ front: 'proboscis' });
    expect(l.kit).toMatchObject({ points: 1, grown: ['front'], order: ['proboscis'], rungs: { proboscis: 1 } });
    expect(l.events).toEqual([{ k: 'part', place: 'front', part: 'proboscis' }, { k: 'rung', id: 'proboscis', rung: 1 }]);
    expect(l.lines.at(-1)).toBe('Grew proboscis.');
    expect(spend(l, 'eye')).toBe(true);
    expect(l.kit!.offer).toEqual(['bulb']);
    expect(l.kit!.grown).toEqual(['front', 'eyes']);
    expect(activeParts(l)).toEqual(['proboscis', 'eye']);
    expect(verbs(l)).toEqual(['crush', 'sense']);
    expect(spend(l, 'bulb')).toBe(false);
    expect([l.food, l.turn]).toEqual([food, turn]);
    l.kit!.points = 1; l.phase = 'over';
    expect(canSpend(l, 'bulb')).toBe(false);
  });

  it('climbs a grown node one rung a point, up to the level’s cap', () => {
    const l = worm(1, ['proboscis']);
    give(l, 'proboscis');
    const build = l.build;
    expect(kitState(l, 'proboscis')).toEqual({ k: 'grown', rung: 1, cap: KIT.rungCap[0] });
    expect(spend(l, 'proboscis')).toBe(true);
    expect(l.events).toEqual([{ k: 'rung', id: 'proboscis', rung: 2 }]);
    expect(l.lines.at(-1)).toBe('Grew jawed proboscis.');
    expect(l.build).toBe(build);
    expect(l.kit).toMatchObject({ grown: ['front'], order: ['proboscis'], rungs: { proboscis: 2 } });
    expect(KIT.rungCap[0]).toBe(2);
    expect(canSpend(l, 'proboscis')).toBe(false);
    const m = worm(2, ['proboscis']);
    give(m, 'proboscis', 'proboscis', 'proboscis');
    expect(kitState(m, 'proboscis')).toEqual({ k: 'grown', rung: 3, cap: 3 });
    expect(canSpend(m, 'proboscis')).toBe(false);
  });

  it('grows a trait on no place', () => {
    const l = worm(2);
    give(l, 'proboscis');
    l.kit!.offer = ['venom'];
    expect(kitState(l, 'venom')).toEqual({ k: 'open', by: 'offer' });
    expect(spend(l, 'venom')).toBe(true);
    expect(l.events).toEqual([{ k: 'rung', id: 'venom', rung: 1 }]);
    expect(l.build.parts).toEqual({ front: 'proboscis' });
    expect(l.kit).toMatchObject({ grown: ['front'], order: ['proboscis', 'venom'], offer: [] });
    expect(kitStats(l.kit!, l.lost)).toEqual(sum([nodeOf('proboscis')!.rungs[0], nodeOf('venom')!.rungs[0]]));
  });

  it('makes the body’s stats the base plus every rung climbed', () => {
    for (const n of WORM_KIT) {
      const l = worm(4, [], 9), need = n.needs?.[0];
      give(l, ...(need ? [need] : []), ...n.rungs.map(() => n.id as KitId));
      expect(kitStats(l.kit!, l.lost), n.id).toEqual(sum([...(need ? [nodeOf(need)!.rungs[0]] : []), ...n.rungs]));
    }
  });

  it('drops a lost part’s stats and keeps a trait’s', () => {
    const l = worm();
    give(l, 'proboscis', 'venom', 'eye');
    loseAt(l, 'front');
    expect(kitState(l, 'proboscis')).toEqual({ k: 'shut', why: 'lost this Life' });
    expect(kitState(l, 'tentacles')).toEqual({ k: 'shut', why: 'lost this Life' });
    expect(kitStats(l.kit!, l.lost)).toEqual(sum([nodeOf('venom')!.rungs[0], nodeOf('eye')!.rungs[0]]));
    expect(activePlaces(l)).toEqual(['eyes']);
    expect(newest(l)).toBe('eyes');
    expect(verbs(l)).toEqual(['sense']);
  });

  it('sells points for food at rising prices, without a turn', () => {
    expect(pointCost(fresh())).toBeNull();
    const l = worm(4, [], 0), cost = KIT.pointCosts[0], turn = l.turn;
    expect(pointCost(l)).toBe(cost);
    l.food = cost - 1;
    expect(canBuyPoint(l)).toBe(false);
    expect(buyPoint(l)).toBe(false);
    l.food = cost;
    expect(buyPoint(l)).toBe(true);
    expect([l.food, l.kit!.points, l.kit!.bought, l.turn]).toEqual([0, 1, 1, turn]);
    expect(pointCost(l)).toBe(KIT.pointCosts[1]);
    l.kit!.bought = KIT.pointCosts.length; l.food = 999;
    expect(pointCost(l)).toBeNull();
    expect(canBuyPoint(l)).toBe(false);
  });

  it('rolls a seeded offer of growable nodes, a rare one seldom', () => {
    const a = worm(4, ['eye'], 9, 11), b = worm(4, ['eye'], 9, 11);
    expect(a.kit!.offer).toEqual(b.kit!.offer);
    rollOffer(a); rollOffer(b);
    expect(a.kit!.offer).toEqual(b.kit!.offer);
    expect(a.kit!.offers).toBe(2);
    let rare = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const l = worm(4, ['eye'], 9, seed), o = l.kit!.offer, rares = o.filter((id) => nodeOf(id)!.rare).length;
      expect(o.length, `seed ${seed}`).toBe(KIT.offerSize);
      expect(new Set(o).size).toBe(o.length);
      expect(o).not.toContain('eye');
      for (const id of o) expect(kitState(l, id), `${seed} ${id}`).toEqual({ k: 'open', by: 'offer' });
      expect(rares).toBeLessThanOrEqual(1);
      rare += rares;
    }
    expect(rare).toBeGreaterThan(0);
    expect(rare).toBeLessThan(40);
  });

  it('offers nothing that cannot grow', () => {
    const l = worm(1, ['proboscis']);
    give(l, 'proboscis');
    for (let k = 0; k < 20; k++) {
      rollOffer(l);
      expect(l.kit!.offer.length).toBe(KIT.offerSize);
      for (const id of l.kit!.offer) expect(['eye', 'chaetae', 'bulb', 'gut']).toContain(id);
    }
    give(l, 'eye', 'chaetae', 'bulb', 'gut');
    rollOffer(l);
    expect(l.kit!.offer).toEqual([]);
  });

  it('earns a point and a fresh offer each moult, with the old Enforce and mutation off', () => {
    const l = worm(4, [], 0), offers = l.kit!.offers;
    l.food = 99; l.kit!.offer = [];
    expect(grow(l)).toBe(true);
    expect(l.kit).toMatchObject({ points: KIT.moultPoints, offers: offers + 1 });
    expect(l.kit!.offer.length).toBe(KIT.offerSize);
    l.grew = false;
    expect(grow(l)).toBe(true);
    expect(l.size).toBe(3);
    expect(l.mutationOffer).toBeNull();
    expect(enforceCost(l)).toBeNull();
    give(l, 'eye');
    expect(canEnforce(l, 'eye')).toBe(false);
  });

  it('names the branch with the most rungs, the first grown on a tie', () => {
    expect(branchOf(fresh())).toBeNull();
    const l = worm();
    expect(branchOf(l)).toBeNull();
    give(l, 'bulb');
    expect(branchOf(l)).toBe('burrow');
    give(l, 'eye');
    expect(branchOf(l)).toBe('burrow');
    give(l, 'eye');
    expect(branchOf(l)).toBe('feed');
    give(l, 'epitoky', 'epitoky', 'epitoky');
    expect(branchOf(l)).toBe('spawn');
  });

  it('turns eggs into levels and keeps the best Life a board', () => {
    const two = KIT.levelEggs[1];
    expect([levelOf(0), levelOf(two - 1), levelOf(two), levelOf(1e6)]).toEqual([1, 1, 2, top]);
    expect(nextLevel(0)).toEqual({ level: 2, at: two, opens: WORM_KIT.filter((n) => n.level === 2).map((n) => n.id) });
    expect(nextLevel(KIT.levelEggs[top - 1])).toBeNull();
    const p = { eggs: 5, best: { mats: 9 }, plan: ['eye' as PartId] }, q = afterLife(p, 'mats', 7);
    expect(q).toEqual({ eggs: 12, best: { mats: 9 }, plan: ['eye'] });
    expect(p).toEqual({ eggs: 5, best: { mats: 9 }, plan: ['eye'] });
    expect(afterLife(q, 'mud', 4).best).toEqual({ mats: 9, mud: 4 });
    expect(afterLife(q, 'mats', 11).best).toEqual({ mats: 11 });
  });
});
