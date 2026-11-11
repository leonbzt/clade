import { describe, expect, it } from 'vitest';
import { PRESETS, type PlaceId, type Rows } from '../src/data/body';
import { RULE, TURNS, type PartId } from '../src/data/life';
import * as B from '../src/sim/body';
import * as L from '../src/sim/life';
import { newLine, saveSpecies, speciesPreview } from '../src/sim/lineage';
import * as P from '../src/sim/plan';
import { completeLife, settlePending, startSeaLife } from '../src/sim/sea-life';
import { freshSeaSave, parseSeaSave, serializeSeaSave, type SeaSave } from '../src/sim/sea-save';

function grow(l: L.Life, part: PartId, place?: PlaceId) {
  l.moulted = false;
  L.moult(l);
  if (!l.offers.includes(part) && P.changesFor(l.build, l.growth, part).length) l.offers.push(part);
  const c = L.offerChanges(l, part).find((c) => !place || c.place === place);
  expect(c, `${part} is offered`).toBeTruthy();
  L.pick(l, part, place);
  expect(l.phase).toBe('play');
}
function finish(s: SeaSave, l: L.Life, card = -1) {
  l.build.size = Math.max(3, l.build.size); l.food = 100;
  l.turn = TURNS; L.lay(l);
  const pending = completeLife(s, l, 3);
  return settlePending(s, pending, card)!;
}
const BASE: Rows = { tail: ['bulb'] };

describe('22A: the inherited plan', () => {
  it('two Lives keep all four picks as buds, regrowing the body for less food by the last moult', () => {
    const s = freshSeaSave(2, 0); s.lines.worm!.parts.push('gill');
    const first = startSeaLife(s, 3, 0, 'worm', BASE); first.food = 100;
    let opening = 0;
    for (const p of ['tentacles', 'eye', 'gill', 'gut'] as PartId[]) {
      opening += L.fullMoultCost(first); grow(first, p, p === 'gut' ? 'back' : undefined);
    }
    expect(100 - first.food).toBe(opening);
    finish(s, first);
    const sp = s.lines.worm!.species[0], second = startSeaLife(s, 4, s.continuation!.patch, 'worm', sp.rows);
    expect(second.build.rows).toEqual(BASE);
    expect(second.build.buds).toEqual({ front: ['tentacles'], eyes: ['eye'], sides: ['gill'], back: ['gut'] });
    expect([L.upkeep(second), L.verbs(second), L.oxygenMax(second)]).toEqual([1, ['dig'], RULE.oxygen]);
    second.food = 100;
    for (const p of ['tentacles', 'eye', 'gill', 'gut'] as PartId[]) grow(second, p);
    expect(second.build.size).toBe(5);
    expect(second.build.rows).toEqual(sp.rows);
    expect(second.build.buds).toEqual({});
    expect(100 - second.food).toBeLessThan(opening);
    expect(finish(s, second).grew).toBe(true);
    expect(s.lines.worm!.species).toHaveLength(1);
  });

  it('a fill keeps the species, best tier and last Life; a swap branches even if reversed', () => {
    const s = freshSeaSave(4, 0), l = startSeaLife(s, 1, 0, 'worm', BASE);
    finish(s, l); const sp = s.lines.worm!.species[0]; sp.tier = 'A';
    const fill = startSeaLife(s, 2, 0, 'worm', sp.rows); fill.food = 100; grow(fill, 'gut', 'back');
    expect(finish(s, fill)).toMatchObject({ species: sp.name, grew: true });
    expect(s.lines.worm!.species[0]).toMatchObject({ tier: 'A', life: 2, rows: { ...BASE, back: ['gut'] } });
    const swap = startSeaLife(s, 3, 0, 'worm', s.lines.worm!.species[0].rows);
    swap.food = 100; s.lines.worm!.parts.push('pouch'); swap.pool!.push('pouch');
    // Deterministically exercise the legal model rather than the shuffled three common offers.
    for (const p of ['pouch', 'bulb'] as PartId[]) {
      swap.moulted = false; L.moult(swap); swap.offers.push(p); L.pick(swap, p, 'tail');
    }
    expect(swap.growth.branched).toBe(true);
    expect(finish(s, swap).grew).toBe(false);
    expect(s.lines.worm!.species).toHaveLength(2);
  });

  it('a tear leaves the plan alone, and only the plan at the last lay is inherited', () => {
    const s = freshSeaSave(6, 0), l = startSeaLife(s, 1, 0, 'worm', PRESETS.worm.digger!);
    l.food = 100; grow(l, 'eye'); l.build.size = 3; L.lay(l);
    const frozen = structuredClone(l.laidPlan);
    L.loseAt(l, 'eyes'); expect(l.growth.rows.eyes).toEqual(['eye']);
    grow(l, 'gut', 'back');
    expect(l.laidPlan).toEqual(frozen);
    l.phase = 'over'; const pending = completeLife(s, l, 3);
    expect(pending.growth).toEqual(frozen);
    const loaded = parseSeaSave(serializeSeaSave(s)).save!;
    settlePending(loaded, loaded.pending!);
    expect(loaded.lines.worm!.species[0].rows).toEqual(frozen!.rows);
    expect(loaded.lines.worm!.species[0].rows.back).toBeUndefined();
  });

  it('Signature parts start grown; the default keeps working under a variant bud', () => {
    const line = newLine('worm'); line.ranks.eye = ['signature'];
    const l = L.newLife(1, 'worm', undefined, B.startBuild('worm', PRESETS.worm.digger!, line).build);
    expect(l.build.rows.eyes).toEqual(['eye']); expect(l.build.buds?.eyes).toBeUndefined();
    expect(L.ready(l, 'sense')).toBe(true);
    const a = L.newLife(1, 'arthropod', undefined, B.startBuild('arthropod', PRESETS.arthropod.digger!).build);
    expect(a.build.rows.limbs).toEqual(['leg']); expect(a.build.buds?.limbs).toEqual(['leg', 'digger']);
    expect(L.verbs(a)).toEqual(['dash']); expect(B.range(a.build)).toBe(3);
  });

  it('a kept card fills a free place first; a full plan swaps and branches; laid rares join the pool', () => {
    const line = newLine('worm'), b = B.defaultBuild('worm');
    const sp = saveSpecies(line, b, null, 1, 'C');
    const growth: P.Plan = { rows: { ...BASE, sides: ['gill'] }, origin: sp.name, branched: false };
    expect(speciesPreview(line, b, 'gut', growth)).toMatchObject({ place: 'back', grows: true });
    const full: P.Plan = { ...growth, rows: { front: ['tentacles'], eyes: ['eye'], sides: ['gill'], back: ['gut'], tail: ['bulb'] } };
    expect(speciesPreview(line, b, 'symbiont', full)).toMatchObject({ place: 'sides', grows: false }); // replacing even a freshly filled row is a swap
    const grown = saveSpecies(line, b, null, 2, 'B', full);
    expect(speciesPreview(line, b, 'symbiont', { ...full, origin: grown.name })).toMatchObject({ place: 'sides', grows: false });
    saveSpecies(line, b, 'symbiont', 3, 'B', full);
    expect(line.parts).toContain('symbiont');
  });

  it('bud verbs count before growth, so every offered change preserves the full plan ceiling', () => {
    const line = newLine('worm'); line.parts.push('sclerite');
    const full = B.startBuild('worm', { ...BASE, front: ['tentacles'], eyes: ['eye'] }, line).build;
    const { build, growth } = P.larva(full);
    expect(B.countedVerbs(build)).toEqual(['dig']);
    expect(P.changesFor(build, growth, 'chaetae')).toEqual([]);
    for (const p of line.parts) for (const c of P.changesFor(build, growth, p))
      expect(B.countedVerbs(P.planBuild(build, c.planned)).length).toBeLessThanOrEqual(3);
  });

  it('size only and buds cost half rounded up; unaffordable new parts leave the offer open', () => {
    const l = L.newLife(1); l.food = L.moultCost(l);
    L.moult(l); const p = l.offers.find((p) => L.offerChanges(l, p).some((c) => !c.bud))!;
    L.pick(l, p); expect([l.food, l.phase]).toEqual([0, 'offer']);
    L.pick(l, null); expect([l.food, l.phase, L.size(l)]).toEqual([0, 'play', 2]);
  });

  it('v5 migrates its lines, species and pending launch rows into v6 plans', () => {
    const s = freshSeaSave(7, 0), l = startSeaLife(s, 1, 0, 'worm', BASE);
    finish(s, l);
    const next = startSeaLife(s, 2, 0, 'worm', BASE); next.food = 100; next.build.size = 3; next.turn = TURNS; L.lay(next); completeLife(s, next, 3);
    const raw = JSON.parse(serializeSeaSave(s)); raw.v = 5; raw.pending.launch = BASE; delete raw.pending.growth;
    const result = parseSeaSave(JSON.stringify(raw));
    expect(result.problem).toBeNull(); expect(result.save!.v).toBe(6);
    expect(result.save!.lines).toEqual(s.lines);
    expect(result.save!.pending!.growth).toEqual({ rows: BASE, branched: false });
  });

  it('hatching previews reactive row objects without trying to structuredClone a proxy', () => {
    const rows = new Proxy<Rows>({ ...BASE, eyes: ['eye'] }, {}), line = newLine('worm');
    const growth = { rows, branched: false };
    const result = speciesPreview(line, B.defaultBuild('worm'), 'gill', growth);
    expect(result.rows).toEqual({ ...rows, sides: ['gill'] });
    const full = P.planBuild(B.defaultBuild('worm'), new Proxy(result.rows, {}));
    expect(P.larva(full).build.buds).toEqual({ eyes: ['eye'], sides: ['gill'] });
    result.rows.eyes!.push('gut');
    expect(rows.eyes).toEqual(['eye']);
  });
});
