// Slice 21A: the line's progression as a model. Lives into XP, levels, points, ranks, species and recipes.
import { describe, expect, it } from 'vitest';
import { PLACES, type Rows } from '../src/data/body';
import { LINEAGES, LINE_RULE } from '../src/data/lineages';
import { PARTS, TURNS, type PlanId } from '../src/data/life';
import * as B from '../src/sim/body';
import * as L from '../src/sim/life';
import { buy, builtIns, gainText, levelOf, newLine, recipesMet, saveSpecies, speciesOf, upgradesFor, xpFor } from '../src/sim/lineage';
import { completeLife, launchBodies, settlePending, startSeaLife } from '../src/sim/sea-life';
import { freshSeaSave, parseSeaSave, serializeSeaSave, type SeaSave } from '../src/sim/sea-save';

const bld = (body: PlanId, rows: Rows, size = 3): B.Build => ({ body, size, rows, order: PLACES.filter((p) => rows[p]) });
/** One Life: launch, lay at size 3, then settle as `eggs` at `tier` keeping card `card`. */
function live(s: SeaSave, rows: Rows, eggs: number, tier: string, card = 0, plan: PlanId = 'worm') {
  const patch = s.continuation?.patch ?? 0, l = startSeaLife(s, 7, patch, plan, rows);
  l.turn = TURNS; l.food = 100; l.build.size = 3; L.lay(l);
  const p = completeLife(s, l, 11);
  p.eggs = eggs; p.tier = tier;
  return { life: l, gain: settlePending(s, p, Math.min(card, p.cards.length - 1))! };
}
const DIG: Rows = { eyes: ['eye'], tail: ['bulb'] };

describe('21A the climb: the model', () => {
  it('XP headlines: level 2 after one good Life, 5 after about six, a cap of 10', () => {
    expect(levelOf(xpFor(18, 'B'))).toBe(2);
    expect(levelOf(6 * xpFor(14, 'C'))).toBe(4);
    expect(levelOf(6 * xpFor(14, 'B'))).toBe(5);
    expect(levelOf(1e6)).toBe(LINE_RULE.cap);
    expect(xpFor(0, 'S')).toBe(0);
  });

  it('the launcher and the moults offer only the line pool', () => {
    const s = freshSeaSave(1, 0);
    expect(Object.keys(s.lines)).toEqual(['worm']);
    expect(() => startSeaLife(s, 1, 0, 'worm', { front: ['proboscis'], tail: ['bulb'] })).toThrow(/not unlocked/);
    const l = startSeaLife(s, 1, 0, 'worm', DIG);
    for (let k = 0; k < 4; k++) { l.food = 100; l.moulted = false; L.moult(l); expect(l.offers.every((p) => PARTS[p].rare || s.lines.worm!.parts.includes(p))).toBe(true); L.pick(l, null); }
  });

  it('Lives move the line: XP, levels, points and unlocks; a kept card unlocks its part and names a species', () => {
    const s = freshSeaSave(2, 0), { gain } = live(s, DIG, 18, 'B');
    const w = s.lines.worm!;
    expect([gain.xp, gain.from, gain.level, w.points]).toEqual([72, 1, 2, 1]);
    expect(gain.unlocked).toContain('gill');
    expect(w.parts).toContain('gill');
    expect(gain.species).toMatch(/^Worm 1/);
    expect(w.species[0].mutation === null || w.parts.includes(w.species[0].mutation)).toBe(true);
    expect(gainText(gain)).toMatch(/^\+72 XP · Worm line level 2 \(up\) · unlocked Gill/);
    expect(B.startBuild('worm', w.species[0].rows, w).problems).toEqual([]); // a species is a legal launch
    const none = live(s, DIG, 0, 'F').gain; // no eggs: no XP, no species
    expect([none.xp, none.species, w.species.length]).toEqual([0, null, 1]);
  });

  it('points buy ranks, which reach the next Life', () => {
    const s = freshSeaSave(3, 0); live(s, DIG, 18, 'B');
    const w = s.lines.worm!;
    expect(upgradesFor('worm', w).find((o) => o.u.id === 'eye.signature')?.why).toMatch(/needs/);
    expect(buy('worm', w, 'eye.lean')).toBe(true);
    expect([w.points, w.ranks.eye]).toEqual([0, ['lean']]);
    expect(buy('worm', w, 'gut.lean')).toBe(false); // no points left
    expect(upgradesFor('worm', w).find((o) => o.u.id === 'eye.enhanced')?.why).toMatch(/has lean/);
    const l = startSeaLife(s, 1, s.continuation!.patch, 'worm', DIG);
    expect([l.build.ranks, L.upkeep(l)]).toEqual([{ eye: ['lean'] }, 1]);
    w.points = 2;
    expect(buy('worm', w, 'eye.signature')).toBe(true);
    expect(w.ranks.eye).toEqual(['lean', 'signature']);
  });

  it('a species list keeps the newest six; a mutation goes where it fits', () => {
    const line = newLine('worm');
    line.parts.push('gill');
    for (let k = 0; k < 8; k++) saveSpecies(line, bld('worm', DIG), 'gill', k + 1, 'C');
    expect(line.species.length).toBe(LINE_RULE.species);
    expect(line.species[0].name).toBe('Worm 8 (gill)');
    expect(line.species[0].rows.sides).toEqual(['gill']);
  });

  it('21B: a species is the launch body plus the kept card, not the parts the Life grew', () => {
    const line = newLine('worm'), grown = bld('worm', { ...DIG, front: ['tentacles'] });
    const sp = saveSpecies(line, grown, 'gill', 1, 'C', DIG);
    expect(sp.rows).toEqual({ ...DIG, sides: ['gill'] });
    expect(speciesOf(line, grown, null, DIG)).toEqual({ rows: DIG, place: null });
  });

  it('a recipe at tier B opens a lineage with its built-ins; a weaker Life does not', () => {
    const s = freshSeaSave(4, 0), w = s.lines.worm!;
    w.xp = LINE_RULE.xpAt[4]; w.parts.push('proboscis', 'sclerite'); // level 4: both recipe parts in the pool
    const tank: Rows = { front: ['proboscis'], sides: ['sclerite'], tail: ['bulb'] };
    expect(live(s, tank, 12, 'C').gain.opened).toEqual([]);
    const { gain } = live(s, tank, 20, 'B');
    expect(gain.opened).toEqual(['arthropod']);
    expect(gainText(gain)).toMatch(/your form became an arthropod/);
    expect(launchBodies(s)).toEqual(['worm', 'arthropod']);
    expect(s.lines.arthropod!.parts).toEqual(LINEAGES.arthropod.start);
    const a = live(s, { limbs: ['leg', 'digger'] }, 10, 'D', 0, 'arthropod').gain;
    expect([a.plan, a.xp]).toEqual(['arthropod', 20]);
    expect(parseSeaSave(serializeSeaSave(s)).save!.lines).toEqual(s.lines);
  });

  it('the swimmer and trilobite recipes; recipe parts the body can hold become Signature', () => {
    const lines = { worm: newLine('worm'), arthropod: newLine('arthropod') };
    expect(B.homesOf('arthropod', 'flap')).toEqual(['sides']);
    const opab = bld('arthropod', { eyes: ['compound'], limbs: ['leg'], sides: ['flap'] });
    expect(B.buildProblems(opab)).toEqual([]);
    expect(recipesMet(lines, opab, 'A')).toEqual(['swimmer']);
    expect(recipesMet(lines, opab, 'C')).toEqual([]);
    expect(recipesMet(lines, bld('arthropod', { limbs: ['leg', 'digger'], back: ['shield'] }), 'B')).toEqual(['trilobite']);
    expect([builtIns('arthropod'), builtIns('trilobite'), builtIns('swimmer')]).toEqual([[], ['shield', 'digger'], ['flap']]);
    expect(newLine('swimmer').ranks.flap).toEqual(['signature']);
    expect(B.upkeep(B.startBuild('swimmer', { front: ['arms'], limbs: ['flap'] }, newLine('swimmer')).build)).toBe(1);
  });
});
