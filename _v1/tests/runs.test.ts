// Runs (slice 12a): the season clock and swing, the brood, the heir, the endings, and the lineage they feed.
import { beforeAll, describe, expect, it } from 'vitest';
import { RUN, SEASONS } from '../src/data/islands';
import { NUM } from '../src/data/numbers';
import { createState, type State } from '../src/sim/state';
import { runBotTick } from '../src/sim/bot';
import { canFoundSpecies, found } from '../src/sim/commands';
import { buildProfile, fit, profiles } from '../src/sim/fit';
import { canRun, finish, founders, levelOf, offers, runCost } from '../src/sim/lineage';
import { bringHome, canBringHome, lineCount, placeHeir, startRun } from '../src/sim/run';
import { inReach, leadSp, leadVariant, makeBrood } from '../src/sim/brood';
import { genomeKey } from '../src/sim/variants';

const PER = RUN.season * NUM.ticksPerSec;
const newRun = (home: State, k = 0) => startRun(home, offers(home)[k], founders(home)[0], true);
const play = (r: State, ticks: number) => { for (let k = 0; k < ticks && !r.run!.end; k++) runBotTick(r); };

describe('runs', () => {
  let home: State, full: State;
  beforeAll(() => {
    home = createState(1);
    full = newRun(home);
    play(full, (RUN.seasons + 1) * PER);
  }, 120_000);

  it('a whole bot run ends by the clock, and its form, XP and line go to the lineage; home stays put', () => {
    const R = full.run!;
    expect(R.end).toBe('clock');
    expect(R.season).toBe(RUN.seasons);
    expect(R.heirs.length).toBeGreaterThanOrEqual(RUN.seasons - 1);
    const line = finish(home, full);
    expect(line).toMatchObject({ seasons: RUN.seasons, end: 'clock' });
    expect(line.xp).toBeGreaterThan(0);
    expect(levelOf(home.lineage!.xp).level).toBeGreaterThanOrEqual(2); // level 2 by the end of the first full run
    expect(home.lineage!.runs).toHaveLength(1);
    expect(home.tick).toBe(0);
    expect(home.occ.every((o) => o < 0)).toBe(true);
    expect(founders(home)[0].name).toBe(home.lineage!.form.name);
  });

  it('the line is alone and no one founds or splits on a run', () => {
    const sps = new Set(full.variants.filter((x) => x.alive).map((x) => x.sp));
    for (const sp of sps) expect(full.run!.line).toContain(sp);
    expect(found(full, 'cyano', full.terrain.findIndex((t) => t !== 0)).ok).toBe(false);
    expect(canFoundSpecies(full, leadVariant(full)).ok).toBe(false);
  });

  it('seasons swing the moisture: wet at landing, dry in the third season', () => {
    const r = newRun(createState(2));
    play(r, 1);
    expect(r.run!.landed).toBe(true);
    play(r, 30 * NUM.ticksPerSec);
    expect(r.wet).toBeCloseTo(SEASONS[0].wet, 5);
    play(r, 2 * PER - r.tick + 30 * NUM.ticksPerSec);
    expect(r.run!.season).toBe(2);
    expect(r.wet).toBeCloseTo(SEASONS[2].wet, 5);
  }, 60_000);

  it('a brood: distinct cards, Steady never lowers the line’s fit, a 4th card from level 2; heirs go within reach', () => {
    const r = newRun(createState(3));
    play(r, PER / 2);
    const cards = makeBrood(r);
    expect(cards).toHaveLength(3);
    expect(new Set(cards.map((c) => genomeKey(c.genome))).size).toBe(3);
    expect(new Set(cards.map((c) => c.name)).size).toBe(3);
    const sp = leadSp(r), v0 = leadVariant(r), held = [...r.terrain.keys()].filter((i) => r.occ.some((_, k) => k % (r.w * r.h) === i && r.occ[k] >= 0 && r.variants[r.occ[k]].sp === sp));
    const sum = (g: typeof cards[0]['genome']) => { const p = buildProfile(r, sp, g); return held.reduce((a, i) => a + fit(r, p, i), 0); };
    const steady = cards.find((c) => c.kind === 'steady')!;
    expect(sum(steady.genome)).toBeGreaterThanOrEqual(sum(r.variants[v0].genome) - 1e-6);
    r.run!.level = 2;
    expect(makeBrood(r)).toHaveLength(4);
    r.run!.brood = cards;
    const far = [...r.terrain.keys()].find((i) => r.terrain[i] !== 0 && !inReach(r, i) && fit(r, buildProfile(r, sp, cards[0].genome), i) > 0);
    if (far !== undefined) expect(placeHeir(r, profiles(r), 0, far)).toBe(-1);
    const near = [...r.terrain.keys()].find((i) => inReach(r, i) && fit(r, buildProfile(r, sp, cards[0].genome), i) > 0.3)!;
    const v = placeHeir(r, profiles(r), 0, near);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(r.variants[v].shown).toBe(true);
    expect(r.run!.brood).toEqual([]);
  }, 60_000);

  it('bringing it home waits for 4 seasons; a line with no tiles dies', () => {
    const r = newRun(createState(4));
    play(r, PER);
    expect(canBringHome(r)).toBe(false);
    play(r, RUN.homeAfter * PER - r.tick + 10);
    expect(bringHome(r)).toBe(true);
    expect(r.run!.end).toBe('home');
    const d = newRun(createState(5));
    play(d, PER + 10);
    d.occ.fill(-1);
    play(d, 2);
    expect(lineCount(d)).toBe(0);
    expect(d.run!.end).toBe('died');
    const h = createState(5), was = h.lineage!.form.name;
    finish(h, d);
    expect(h.lineage!.form.name).toBe(was);
  }, 60_000);

  it('the price: a run needs Land plants and the biomass, and gets dearer', () => {
    const h = createState(1);
    expect(canRun(h).ok).toBe(false);
    h.reached.push('land');
    h.biomass = runCost(h);
    expect(canRun(h).ok).toBe(true);
    const first = runCost(h);
    h.lineage!.runs.push({ theme: 'dry', size: 'small', seasons: 8, end: 'clock', form: '', xp: 0 });
    expect(runCost(h)).toBeGreaterThan(first);
    expect(offers(h).map((o) => o.theme)).toEqual(['dry', 'wet']);
  });
});
