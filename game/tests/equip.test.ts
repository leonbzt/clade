// Slice 20B: the equipment view's choices, and the painter drawing every legal part on every body at every size.
import { describe, expect, it } from 'vitest';
import { BODIES, PLACES, PRESETS, type PresetId } from '../src/data/body';
import { PARTS, PLAN_IDS, PART_IDS } from '../src/data/life';
import * as B from '../src/sim/body';
import { numbers, optionsAt, places, starterRows } from '../src/ui/equip';
import { Body } from '../src/view/body';

/** A stand-in for Pixi's Graphics: every call chains, and every number it gets must be finite. */
function fakeGraphics(bad: string[]) {
  const g: Record<string, unknown> = {};
  const check = (name: string) => (...args: unknown[]) => {
    const nums = JSON.stringify(args).match(/null/g); // NaN and Infinity serialise as null
    if (nums) bad.push(name);
    return g;
  };
  for (const m of ['poly', 'fill', 'moveTo', 'lineTo', 'stroke', 'circle', 'rect']) g[m] = check(m);
  return g as never;
}

describe('20B equipment choices', () => {
  it('starter rows hold only starter parts, defaults and the carried part', () => {
    for (const body of PLAN_IDS) for (const place of PLACES) for (const row of starterRows(body, place))
      for (const p of row) expect(B.isStarterPart(p) || BODIES[body].defaults.some(([q, r]) => q === place && r.includes(p)), `${p} at ${place} on ${body}`).toBe(true);
    expect(starterRows('worm', 'sides').flat()).not.toContain('gill');
    expect(starterRows('worm', 'sides', { part: 'gill', place: 'sides' }).flat()).toContain('gill');
  });
  it('locked places offer no Empty; unsupported places offer nothing', () => {
    const opts = optionsAt('arthropod', PRESETS.arthropod.sweeper!, 'limbs');
    expect(opts.some((o) => o.row === null)).toBe(false);
    expect(opts.find((o) => o.current)?.name).toBe('Walking/raking limbs');
    expect(optionsAt('worm', PRESETS.worm.digger!, 'limbs')).toEqual([]);
    expect(places('worm', B.defaultBuild('worm')).find((v) => v.place === 'limbs')?.state).toBe('unsupported');
  });
  it('a variant swap shows what is lost and gained', () => {
    const dig = optionsAt('arthropod', PRESETS.arthropod.sweeper!, 'limbs').find((o) => o.name === 'Walking/digging limbs')!;
    expect(dig.lost).toEqual(['graze']);
    expect(dig.gained).toEqual(['dig']);
  });
  it('the carried part shows as carried, and the numbers match the model', () => {
    const carried = { part: 'gill' as const, place: 'sides' as const }, res = B.startBuild('worm', PRESETS.worm.digger!, carried);
    expect(places('worm', res.build, carried).find((v) => v.place === 'sides')?.state).toBe('carried');
    expect(numbers(res.build).upkeep).toBe(B.upkeep(res.build));
    expect(numbers(B.startBuild('arthropod', PRESETS.arthropod.sweeper!).build).verbs).toEqual(['Dash (free)', 'Graze']);
  });
});

describe('20B painter', () => {
  it('draws every legal part and preset on every body at sizes 1–5 with finite numbers', () => {
    const bad: string[] = [], g = fakeGraphics(bad), sh = fakeGraphics(bad);
    for (const body of PLAN_IDS) {
      const builds = [B.defaultBuild(body), ...(Object.keys(PRESETS[body]) as PresetId[]).map((p) => B.startBuild(body, PRESETS[body][p]!).build)];
      for (const place of PLACES) for (const row of B.rowsAt(body, place)) builds.push({ ...B.defaultBuild(body), rows: { ...B.defaultBuild(body).rows, [place]: row } });
      builds.push({ ...B.defaultBuild(body), rows: {}, order: [], lost: ['limbs'] });
      for (const b of builds) for (let size = 1; size <= 5; size++) {
        const v = new Body({ ...b, size });
        v.place(40, 40, size * 1.3); v.moving.v = 1; v.reach.v = size / 5;
        v.update(0.1); v.draw(g, sh, () => size === 3);
      }
    }
    expect(bad).toEqual([]);
  });
  it('covers all 27 parts', () => {
    const drawn = new Set(PLAN_IDS.flatMap((body) => PLACES.flatMap((p) => B.rowsAt(body, p).flat())));
    expect(PART_IDS.filter((p) => !drawn.has(p))).toEqual([]);
    expect(Object.keys(PARTS).length).toBe(27);
  });
});
