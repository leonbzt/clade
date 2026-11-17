// B0 round two contract, part B: the Life reads the body's stats, food takes work, and a task walks and works for
// you. Skipped until `work` is built; from then on every test here runs and passes. A builder never edits this file:
// a test that seems wrong is a question for the architect (docs/status.md). The architect could not run these.
import { describe, expect, it } from 'vitest';
import { GATES, KIT, type KitId } from '../src/data/kit';
import { COLS, NODES, ROWS, RULE, TURNS, type NodeId } from '../src/data/life';
import { canLay, layYield } from '../src/sim/economy';
import { setTask, spend, startKit, stepTask, work } from '../src/sim/kit';
import { kitStats } from '../src/sim/kit-stats';
import { at, dests, foodOf, lockOf, move, newLife, range, season, sense, stay, tunnel, upkeep, type Board, type Life,
  type Predator } from '../src/sim/life';
import { strikeOn, type Side } from '../src/sim/life-body';
import type { Build } from '../src/sim/records';
import { useVerb } from '../src/sim/verbs';

const BARE: Build = { clade: 'worm', parts: {}, genes: { size: 1, gut: 1 } };
/** Sand everywhere but the cells given as 'x,y'. You start at (3, 1), facing east. */
const board = (cells: Record<string, string> = {}, over: Partial<Board> = {}): Board => ({
  substrate: 'sand', start: [3, 1], entry: [0, 10], predatorAt: null, event: null, rivals: [],
  map: Array.from({ length: ROWS }, (_, y) => Array.from({ length: COLS }, (_, x) => cells[`${x},${y}`] ?? '.').join('')),
  ...over,
});
const worm = (b: Board = board()) => { const l = newLife(b, BARE, {}, 7); startKit(l, 4, []); l.kit!.points = 99; return l; };
const give = (l: Life, ...ids: KitId[]) => {
  for (const id of ids) { if (!l.kit!.rungs[id]) l.kit!.offer = [id]; expect(spend(l, id), id).toBe(true); }
};
const stats = (l: Life) => kitStats(l.kit!, l.lost);
const hunter = (x: number, y: number, state: Predator['state'], marks: number[] = []): Predator =>
  ({ x, y, state, rest: 0, marks, dir: 0, lx: 3, ly: 1 });
const built = (() => { try { const l = worm(); work(l); return true; } catch { return false; } })();

describe.skipIf(!built)('a Life in kit mode: stats, work and tasks (part B)', () => {
  it('works food over several actions, each adding your bite', () => {
    const l = worm(board({ '4,1': 'm' })), i = at(4, 1), actions = Math.ceil(GATES.mat.work / KIT.base.bite);
    expect(actions).toBeGreaterThan(1);
    move(l, i);
    expect([l.x, l.y]).toEqual([4, 1]);
    expect(l.tiles[i]).toMatchObject({ node: 'mat', work: KIT.base.bite });
    expect(l.events).toContainEqual({ k: 'work', i, node: 'mat', work: KIT.base.bite, of: GATES.mat.work });
    expect(l.food).toBe(RULE.startFood);
    for (let k = 1; k < actions; k++) expect(work(l)).toBe(true);
    expect(l.tiles[i].node).toBeNull();
    expect(l.tiles[i].work).toBeUndefined();
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'eat', i, node: 'mat', gain: NODES.mat.food }));
    expect(l.turn).toBe(1 + actions);
    expect(l.food).toBe(RULE.startFood + NODES.mat.food - RULE.baseUpkeep * Math.floor(actions / KIT.upkeepEvery));
    const turn = l.turn;
    expect(work(l)).toBe(false);
    expect(l.turn).toBe(turn);
  });

  it('eats at once with bite enough, and a mat grows back on the kit’s clock', () => {
    const l = worm(board({ '4,1': 'm' })), i = at(4, 1), turn = l.turn;
    give(l, 'proboscis', 'proboscis');
    expect(stats(l).bite).toBeGreaterThanOrEqual(GATES.mat.work);
    move(l, i);
    expect(l.tiles[i]).toMatchObject({ node: null, grow: { node: 'mat', at: turn + KIT.regrow } });
  });

  it('gates each food by a stat and says what it needs', () => {
    const l = worm(board({ '4,1': 's' })), i = at(4, 1);
    for (const node of Object.keys(GATES) as NodeId[]) {
      const g = GATES[node], have = KIT.base[g.stat];
      expect(lockOf(l, node), node).toBe(have >= g.min ? null : `needs ${g.stat} ${g.min}, you have ${have}`);
    }
    expect(lockOf(l, 'shell')).toBe('needs bite 3, you have 1');
    move(l, i);
    expect(l.events).toContainEqual({ k: 'locked', i, node: 'shell', why: 'needs bite 3, you have 1' });
    expect(l.tiles[i]).toMatchObject({ node: 'shell' });
    expect(l.tiles[i].work).toBeUndefined();
    give(l, 'proboscis', 'proboscis');
    for (const node of Object.keys(GATES) as NodeId[]) expect(lockOf(l, node), node).toBeNull();
  });

  it('lets Crush work with more bite, and no bonus food', () => {
    const l = worm(board({ '4,1': 's' })), i = at(4, 1);
    give(l, 'proboscis');
    const bite = stats(l).bite + KIT.crushBite;
    expect(lockOf(l, 'shell')).not.toBeNull();
    expect(lockOf(l, 'shell', true)).toBeNull();
    expect(bite).toBeLessThan(GATES.shell.work);
    expect(2 * bite).toBeGreaterThanOrEqual(GATES.shell.work);
    expect(useVerb(l, 'crush')).toBe(true);
    expect(l.tiles[i]).toMatchObject({ node: 'shell', work: bite });
    l.recharge.crush = 0;
    expect(useVerb(l, 'crush')).toBe(true);
    expect(l.tiles[i].node).toBeNull();
    expect(l.events).toContainEqual(expect.objectContaining({ k: 'eat', i, gain: NODES.shell.food }));
  });

  it('lets Graze work every mat around you once', () => {
    const l = worm(board({ '2,0': 'm', '4,2': 'm' }));
    give(l, 'tentacles');
    const bite = stats(l).bite;
    expect(bite).toBeLessThan(GATES.mat.work);
    expect(useVerb(l, 'graze')).toBe(true);
    for (const i of [at(2, 0), at(4, 2)]) expect(l.tiles[i]).toMatchObject({ node: 'mat', work: bite });
  });

  it('moves and tunnels by speed, and never grabs', () => {
    const l = worm(board({ '4,1': 'm' }));
    expect([range(l), tunnel(l), dests(l).size]).toEqual([1, RULE.tunnel, 4]);
    give(l, 'proboscis');
    expect(dests(l).get(at(4, 1))!.grab).toBe(false);
    give(l, 'chaetae');
    expect(stats(l).speed).toBe(2);
    expect([range(l), tunnel(l), dests(l).size]).toEqual([2, RULE.tunnel + 1, 7]);
    expect(dests(l).has(at(5, 1)) && dests(l).has(at(3, 3))).toBe(true);
  });

  it('sees as far as its senses', () => {
    const l = worm(board({}, { map: Array.from({ length: ROWS }, () => '~'.repeat(COLS)) }));
    expect(sense(l)).toBe(KIT.base.senses);
    expect(l.tiles[at(6, 1)].seen).toBe(false);
    give(l, 'eye');
    expect(sense(l)).toBe(stats(l).senses);
    expect(l.tiles[at(6, 1)].seen).toBe(true);
  });

  it('feeds by thrift and lays by size and brood, with no rule by a part’s name', () => {
    const l = worm();
    expect(foodOf(l, 'mat')).toBe(NODES.mat.food);
    give(l, 'tentacles', 'gut');
    expect(stats(l).thrift).not.toBe(RULE.gutFood);
    expect(foodOf(l, 'mat')).toBe(NODES.mat.food + stats(l).thrift);
    const p = worm();
    p.food = 99;
    give(p, 'progenesis');
    expect(canLay(p)).toBe(false);
    p.size = RULE.adultSize;
    expect(canLay(p)).toBe(true);
    expect(layYield(p)).toBe(RULE.adultSize + stats(p).brood);
    const m = worm();
    m.size = 3;
    expect(layYield(m)).toBe(3);
    give(m, 'pouch');
    expect(layYield(m)).toBe(3 + stats(m).brood);
  });

  it('pays a flat upkeep every few turns, whatever is grown', () => {
    const l = worm();
    give(l, 'proboscis', 'eye');
    expect(upkeep(l)).toBe(RULE.baseUpkeep);
    for (let t = 1; t <= KIT.upkeepEvery * 2; t++) {
      stay(l);
      expect(l.food, `after turn ${t}`).toBe(RULE.startFood - RULE.baseUpkeep * Math.floor(t / KIT.upkeepEvery));
    }
    expect(l.turn).toBe(KIT.upkeepEvery * 2 + 1);
  });

  it('lasts the kit’s season', () => {
    expect(season(newLife(board(), BARE, {}, 7))).toBe(TURNS);
    const l = worm();
    l.food = 999;
    expect(season(l)).toBe(KIT.season);
    for (let k = 0; k <= TURNS; k++) stay(l);
    expect(l.phase).toBe('play');
    for (let k = 0; k < KIT.season; k++) stay(l);
    expect([l.phase, l.cause, l.turn]).toEqual(['over', 'season', KIT.season]);
  });

  it('turns a strike with defence enough, and with nothing less', () => {
    const l = worm(), sides: Side[] = ['front', 'right', 'back', 'left'];
    expect(strikeOn(l, 'front')).toMatchObject({ kind: 'hit', damage: 1 });
    give(l, 'sclerite');
    expect(stats(l).defence).toBeLessThan(KIT.strike);
    for (const side of sides) expect(strikeOn(l, side).kind, side).toBe('hit');
    give(l, 'bulb');
    expect(stats(l).defence).toBeGreaterThanOrEqual(KIT.strike);
    for (const side of sides) expect(strikeOn(l, side), side).toMatchObject({ kind: 'blocked', part: null, damage: 0 });
    expect(strikeOn(worm(), 'front', { braced: true }).kind).toBe('blocked');
    expect(strikeOn(worm(), 'front', { buried: true }).kind).toBe('buried');
  });

  it('sets a task without a turn, on any tile you could stand on', () => {
    const l = worm(board({ '5,5': '#' }));
    expect(setTask(newLife(board(), BARE, {}, 7), at(5, 1))).toBe(false);
    for (const i of [-1, COLS * ROWS, at(5, 5)]) expect(setTask(l, i), `${i}`).toBe(false);
    expect(l.kit!.task).toBeNull();
    expect(setTask(l, at(5, 1))).toBe(true);
    expect(setTask(l, at(6, 6))).toBe(true);
    expect([l.kit!.task, l.turn]).toEqual([at(6, 6), 1]);
    expect(setTask(l, null)).toBe(true);
    expect(l.kit!.task).toBeNull();
    l.phase = 'over';
    expect(setTask(l, at(5, 1))).toBe(false);
  });

  it('walks to the task a step an action, works the food there and stops', () => {
    const l = worm(board({ '6,1': 'm' })), i = at(6, 1), actions = 3 + Math.ceil(GATES.mat.work / KIT.base.bite) - 1;
    setTask(l, i);
    expect(stepTask(l)).toBe(true);
    expect([l.x, l.y, l.turn, l.kit!.task]).toEqual([4, 1, 2, i]);
    for (let k = 1; k < actions; k++) expect(stepTask(l), `action ${k + 1}`).toBe(true);
    expect([l.x, l.y]).toEqual([6, 1]);
    expect(l.tiles[i].node).toBeNull();
    expect([l.kit!.task, l.turn]).toEqual([null, 1 + actions]);
    expect(stepTask(l)).toBe(false);
    expect(l.turn).toBe(1 + actions);
  });

  it('ends a plain walk on arrival, and a walk to food it cannot open', () => {
    const l = worm();
    setTask(l, at(3, 4));
    for (let k = 0; k < 3; k++) expect(stepTask(l)).toBe(true);
    expect([l.x, l.y, l.kit!.task]).toEqual([3, 4, null]);
    expect(stepTask(l)).toBe(false);
    const m = worm(board({ '5,1': 's' }));
    setTask(m, at(5, 1));
    expect(stepTask(m)).toBe(true);
    expect(stepTask(m)).toBe(true);
    expect(m.events).toContainEqual(expect.objectContaining({ k: 'locked', node: 'shell' }));
    expect([m.x, m.y, m.kit!.task]).toEqual([5, 1, null]);
    expect(stepTask(m)).toBe(false);
  });

  it('drops a task no step brings closer', () => {
    const wall = Object.fromEntries(Array.from({ length: COLS }, (_, x) => [`${x},2`, '#']));
    const l = worm(board(wall));
    setTask(l, at(3, 4));
    expect(stepTask(l)).toBe(false);
    expect([l.x, l.y, l.turn, l.kit!.task]).toEqual([3, 1, 1, null]);
  });

  it('stops for a marked strike, before the step or after it', () => {
    const l = worm();
    l.pred = hunter(3, 2, 'strike', [at(3, 1)]);
    setTask(l, at(7, 1));
    expect(stepTask(l)).toBe(false);
    expect([l.kit!.task, l.turn]).toEqual([null, 1]);
    const m = worm();
    m.pred = hunter(4, 3, 'hunt');
    setTask(m, at(7, 1));
    expect(stepTask(m)).toBe(true);
    expect(m.pred!.state).toBe('strike');
    expect(m.kit!.task).toBeNull();
  });

  it('stops when you are hurt, lose a part, or the Life ends', () => {
    const hurt = worm();
    hurt.food = 0; hurt.turn = KIT.upkeepEvery;
    setTask(hurt, at(7, 1));
    expect(stepTask(hurt)).toBe(true);
    expect([hurt.health, hurt.kit!.task]).toEqual([RULE.health - 1, null]);
    const shed = worm();
    give(shed, 'eye');
    shed.food = 0; shed.turn = KIT.upkeepEvery;
    setTask(shed, at(7, 1));
    expect(stepTask(shed)).toBe(true);
    expect([shed.lost, shed.health, shed.kit!.task]).toEqual([['eyes'], RULE.health, null]);
    const last = worm();
    last.food = 99; last.turn = KIT.season;
    setTask(last, at(7, 1));
    expect(stepTask(last)).toBe(true);
    expect([last.phase, last.kit!.task]).toEqual(['over', null]);
  });
});
