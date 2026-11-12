import { describe, expect, it } from 'vitest';
import { DEV_LINEAGES, DEV_SPECIES } from '../src/data/builds';
import { CLADES } from '../src/data/clades';
import { COLS, ROWS } from '../src/data/life';
import { LINE_JOBS, LINE_RULE, RANK_CAP } from '../src/data/lines';
import { canEnforce, enforce } from '../src/sim/economy';
import { fitness, partUpkeep, slots } from '../src/sim/fitness';
import { newLife, upkeep, type Board } from '../src/sim/life';
import { addXp, levelOf, pointsOf, spend, toNext, xpFor } from '../src/sim/line';
import type { Letter } from '../src/sim/records';
import { makeWorld } from '../src/sim/sea';

function fixture(xp = 0) {
  const world = makeWorld(1), line = structuredClone(DEV_LINEAGES[0]);
  line.xp = xp;
  world.lineages.push(line);
  world.species = structuredClone(DEV_SPECIES.filter((s) => s.lineage === line.id));
  return { world, line };
}

describe('line XP and points', () => {
  it('keeps the ported XP weights and awards nothing for no eggs', () => {
    for (const [letter, weight] of [['F', 1], ['D', 2], ['C', 3], ['B', 4], ['A', 5], ['S', 6]] as [Letter, number][]) {
      expect(xpFor(18, letter)).toBe(18 * weight);
      expect(xpFor(0, letter)).toBe(0);
    }
    const { line } = fixture();
    addXp(line, xpFor(18, 'B'));
    expect([line.xp, levelOf(line.xp), pointsOf(line), toNext(line.xp)]).toEqual([72, 2, 1, 58]);
    addXp(line, xpFor(0, 'S'));
    expect(line.xp).toBe(72);
  });

  it('crosses each original level threshold exactly, handles multiple levels and caps at 10', () => {
    const thresholds = [0, 0, 60, 130, 210, 300, 420, 570, 750, 970, 1250];
    expect([levelOf(0), toNext(0)]).toEqual([1, 60]);
    for (let level = 2; level <= 10; level++) {
      expect([levelOf(thresholds[level] - 1), toNext(thresholds[level] - 1)]).toEqual([level - 1, 1]);
      expect(levelOf(thresholds[level])).toBe(level);
    }
    const { line } = fixture();
    addXp(line, 300);
    expect([levelOf(line.xp), pointsOf(line)]).toEqual([5, 4]);
    addXp(line, 10000);
    expect([line.xp, levelOf(line.xp), pointsOf(line), toNext(line.xp)]).toEqual([10300, 10, 9, null]);
    line.ranks = { tentacles: 2, pouch: 1 };
    expect(pointsOf(line)).toBe(6);
  });

  it('spends one point per rank, stops at zero points and at rank 3, and leaves rejected buys unchanged', () => {
    const { world, line } = fixture(LINE_RULE.xpAt[2]);
    expect(spend(line, 'tentacles', world.species)).toBe(true);
    expect([line.ranks, pointsOf(line)]).toEqual([{ tentacles: 1 }, 0]);
    const before = structuredClone(world);
    expect(spend(line, 'bulb', world.species)).toBe(false);
    expect(world).toEqual(before);
    addXp(line, 1250);
    expect(spend(line, 'tentacles', world.species)).toBe(true);
    expect(spend(line, 'tentacles', world.species)).toBe(true);
    expect([line.ranks.tentacles, pointsOf(line)]).toEqual([3, 6]);
    const capped = structuredClone(world);
    expect(RANK_CAP).toBe(3);
    expect(spend(line, 'tentacles', world.species)).toBe(false);
    expect(world).toEqual(capped);
    expect(spend(line, 'bulb', world.species)).toBe(true); // zero-upkeep parts still gain Enforce headroom
  });

  it('requires a carrier in this line, including species with no living population', () => {
    const { world, line } = fixture(1250);
    const foreign = structuredClone(DEV_SPECIES.find((s) => s.id === 'digger-worm')!);
    foreign.lineage = 'another-worm-line';
    const wild = structuredClone(DEV_SPECIES.find((s) => s.id === 'tentacle-worm')!);
    wild.lineage = null;
    const before = structuredClone(line);
    expect(spend(line, 'eye', [foreign])).toBe(false);
    expect(spend(line, 'tentacles', [wild])).toBe(false);
    expect(spend(line, 'tentacles', [])).toBe(false);
    expect(spend(line, 'claw', world.species)).toBe(false);
    expect(line).toEqual(before);
    expect(world.habitats.every((h) => Object.keys(h.pops).length === 0)).toBe(true);
    expect(spend(line, 'eye', world.species)).toBe(true);
  });

  it('bought ranks lower only their part upkeep and raise the next Life\'s Enforce cap', () => {
    const { world, line } = fixture(1250);
    const species = world.species.find((s) => s.id === 'grazer-worm')!;
    const hab = world.habitats.find((h) => h.kind.depth === 'shallows')!;
    const slot = slots(hab, world).find((s) => s.id === 'mats')!;
    const fit = () => fitness(species.build, line.ranks, slot, hab, world);
    const before = fit();
    expect(spend(line, 'tentacles', world.species)).toBe(true);
    const lean = fit();
    expect(lean.upkeep).toBe(before.upkeep - 1);
    expect(lean.value).toBeGreaterThan(before.value);
    for (let i = 0; i < 2; i++) expect(spend(line, 'tentacles', world.species)).toBe(true);
    expect(fit()).toEqual(lean); // extra ranks cannot lower base upkeep or the pouch's cost
    expect(partUpkeep('tentacles', line.ranks)).toBe(0);
    expect(spend(line, 'sclerite', world.species)).toBe(true);
    expect(partUpkeep('sclerite', line.ranks)).toBe(0);
    const board: Board = {
      substrate: 'sand', map: Array.from({ length: ROWS }, () => '.'.repeat(COLS)),
      start: [3, 1], entry: [0, 0], predatorAt: null, event: null, rivals: [],
    };
    const life = newLife(board, structuredClone(species.build), { ...line.ranks }, 7);
    life.size = 5; life.food = 99;
    expect(upkeep(life)).toBe(2); // base + pouch; the tentacles and sclerites cost zero
    for (let i = 0; i < 4; i++) expect(enforce(life, 'tentacles')).toBe(true);
    expect([life.enforced.tentacles, canEnforce(life, 'tentacles')]).toEqual([4, false]);
    expect(canEnforce(life, 'sclerite')).toBe(true); // one purchase remains globally
    expect(line.ranks).toEqual({ tentacles: 3, sclerite: 1 });
  });

  it('law 2: earning XP and buying ranks store no level, points, letter or slot in World', () => {
    const { world, line } = fixture();
    addXp(line, xpFor(20, 'B'));
    spend(line, 'tentacles', world.species);
    expect(pointsOf(line)).toBe(0);
    expect(Object.keys(line).sort()).toEqual(['clade', 'id', 'job', 'ranks', 'xp']);
    const stored = JSON.stringify(world);
    expect(stored).not.toMatch(/"(?:points?|level|letters?|tiers?|slots?)":/);
    expect(Object.keys(world).sort()).toEqual(['generation', 'habitats', 'lineages', 'seed', 'species']);
  });

  it('has job text for every clade and registers each dev line with its job ID', () => {
    expect(Object.keys(LINE_JOBS).sort()).toEqual(Object.keys(CLADES).sort());
    expect(LINE_JOBS.worm).toBe('stirs and grazes the floor');
    for (const clade of Object.values(CLADES)) expect(LINE_JOBS[clade.id].length).toBeGreaterThan(0);
    for (const line of DEV_LINEAGES) expect(line.job).toBe(line.clade);
  });
});
