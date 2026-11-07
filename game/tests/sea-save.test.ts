import { describe, expect, it } from 'vitest';
import { HAB_ORDER } from '../src/data/habitats';
import { SEA, lineId } from '../src/data/sea';
import { advance, parseSave, type Save } from '../src/sim/save';
import { release } from '../src/sim/sea';
import { legacyPatchMap } from '../src/sim/sea-migration';
import { advanceSeaSave, freshSeaSave, parseSeaSave, serializeSeaSave } from '../src/sim/sea-save';

function legacy(): Save {
  const habitat = (): Save['garden']['habs']['sand'] => ({ mats: 60, rot: 30, oxygen: 70, entries: [], flags: {}, leaders: {} });
  const habs = { sand: habitat(), mud: habitat(), rock: habitat() };
  const normal = Object.fromEntries(HAB_ORDER.map((hab) => [hab, { mats: 70, rot: 40, oxygen: 80, pops: { grazer: 20, burrower: 10, predator: 3 } }])) as Save['garden']['normal'];
  habs.sand.entries = [
    { sp: 'wiwaxia', name: 'Wiwaxia', role: 'grazer', pop: 15, score: 20, proven: true },
    { sp: 'line:arthropod', name: 'Your arthropods', line: 'arthropod', role: 'grazer', pop: 8, score: 28, proven: true },
    { sp: 'line:trilobite', name: 'Your trilobites', line: 'trilobite', role: 'grazer', pop: 6, score: 18, proven: true },
    { sp: 'visitor:Kim:swimmer:predator', name: 'Kim', role: 'predator', pop: 4, score: 25, proven: true },
  ];
  habs.mud.entries = [{ sp: 'line:worm', name: 'Your worms', line: 'worm', role: 'burrower', pop: 12, score: 30, proven: true }];
  habs.rock.entries = [{ sp: 'line:worm', name: 'Your worms', line: 'worm', role: 'predator', pop: 3, score: 20, proven: true }];
  return { v: 2, seed: 5, at: 1_000_000, lives: 9, best: { 'mud:burrower': 'A' }, forms: { 'mud:burrower': 'deep' }, unlocks: { trilobite: true },
    garden: { gen: 12, r: -123456, habs, normal, news: [] } };
}

const wire = (s: ReturnType<typeof freshSeaSave>) => JSON.parse(serializeSeaSave(s));

describe('sea saves', () => {
  it('round-trips typed arrays, pending results, continuation and simulation memory deterministically', () => {
    const s = freshSeaSave(3, 1000);
    release(s.sea, 0, 'worm', 'burrower', 40);
    advanceSeaSave(s, 1000 + 80 * SEA.genMs);
    s.pending = { hab: s.sea.patches[0].ground, patch: 0, plan: 'worm', role: 'burrower', species: lineId('worm', 'burrower'), eggs: 9,
      tier: 'D', cards: [{ part: 'deep', rarity: 'rare', passed: true }] };
    s.continuation = { patch: 1, species: lineId('trilobite', 'grazer'), plan: 'trilobite', role: 'grazer', eggs: 25 };
    const loaded = parseSeaSave(serializeSeaSave(s));
    expect(loaded.problem).toBeNull();
    const r = loaded.save!;
    expect(wire(r)).toEqual(wire(s));
    expect(r.sea.isl).toEqual(s.sea.isl); expect(r.sea.of).toEqual(s.sea.of);
    expect(r.sea.of).toBeInstanceOf(Int32Array);
    expect(r.sea.isl.kind).toBeInstanceOf(Uint8Array);
    expect(r.sea.isl.water).toBeInstanceOf(Float32Array);
    expect(r.sea.moved).toBeInstanceOf(Float64Array);
    for (const p of r.sea.patches) {
      for (const key of ['pop', 'fit', 'peak', 'low', 'lost'] as const) expect(p[key]).toBeInstanceOf(Float64Array);
      expect(p.hist).toBeInstanceOf(Float32Array); expect(p.came).toBeInstanceOf(Int32Array);
      expect(p.fromNb).toBeInstanceOf(Int32Array); expect(p.falling).toBeInstanceOf(Uint8Array);
    }
    const now = s.at + 20 * SEA.genMs;
    expect(advanceSeaSave(r, now)).toEqual(advanceSeaSave(s, now));
    expect(wire(r)).toEqual(wire(s));
  });

  it('remaps all species columns by saved IDs, including news, when content is reordered', () => {
    const s = freshSeaSave(1, 0);
    release(s.sea, 0, 'arthropod', 'grazer', 23); release(s.sea, 0, 'trilobite', 'grazer', 45);
    advanceSeaSave(s, 30 * SEA.genMs);
    const raw = wire(s);
    raw.sea.species.reverse();
    for (const p of raw.sea.patches) {
      for (const key of ['pop', 'fit', 'peak', 'low', 'came', 'fromNb', 'falling']) p[key].reverse();
      p.lost = Array.from({ length: raw.sea.species.length }, (_, k) => p.lost.slice(k * 4, k * 4 + 4)).reverse().flat();
    }
    const r = parseSeaSave(JSON.stringify(raw)).save!;
    expect(wire(r)).toEqual(wire(s));
    advanceSeaSave(s, 40 * SEA.genMs); advanceSeaSave(r, 40 * SEA.genMs);
    expect(wire(r)).toEqual(wire(s));
  });

  it('rejects malformed/newer data without changing the active state', () => {
    const active = freshSeaSave(1, 0), original = serializeSeaSave(active);
    const invalid = [null, [], {}, { v: 3 }, { v: 2.5 }, { v: 2, garden: { habs: {} } }];
    for (const value of invalid) expect(parseSeaSave(JSON.stringify(value)).problem).toBe('broken');
    const changes: ((s: ReturnType<typeof wire>) => void)[] = [
      (s) => { s.at = -1; }, (s) => { s.best.x = 'Z'; }, (s) => { s.forms.x = 'nope'; },
      (s) => { s.sea.r = 0.5; }, (s) => { s.sea.species[1].id = s.sea.species[0].id; },
      (s) => { s.sea.patches[0].pop[0] = null; }, (s) => { s.sea.patches[0].pop.pop(); },
      (s) => { s.sea.patches[0].pop = { 0: 4 }; }, (s) => { s.sea.patches[0].oxygen = 101; },
      (s) => { s.sea.patches[0].came[0] = 0.5; }, (s) => { s.sea.patches[0].falling[0] = 2; },
      (s) => { s.sea.patches[0].hist[0] = -1; }, (s) => { s.sea.patches[0].nb[0] = 9999; },
      (s) => { s.sea.patches[0].tiles.push(s.sea.patches[0].tiles[0]); },
      (s) => { s.sea.patches[0].tiles[0] = -1; }, (s) => { s.sea.patchCrashes = [1]; },
      (s) => { s.continuation = { patch: 9999, species: lineId('worm', 'burrower'), plan: 'worm', role: 'burrower', eggs: 2 }; },
      (s) => { s.continuation = { patch: 0, species: lineId('worm', 'burrower'), plan: 'swimmer', role: 'burrower', eggs: 2 }; },
      (s) => { s.pending = { patch: 0, species: lineId('worm', 'burrower'), plan: 'worm', role: 'burrower', hab: 'mud', eggs: 4, tier: 'D', cards: [{}] }; },
      (s) => { s.news = [{ kind: 'boom', sp: 'missing', gen: 0, from: 1, to: 5, patches: [0], cause: 'food' }]; },
    ];
    for (const change of changes) { const raw = JSON.parse(original); change(raw); expect(parseSeaSave(JSON.stringify(raw)).problem).toBe('broken'); }
    expect(parseSeaSave('{oops').problem).toBe('broken'); expect(parseSeaSave(null).problem).toBe('none');
    expect(parseSeaSave('{"v":4}').problem).toBe('newer');
    expect(serializeSeaSave(active)).toBe(original);
  });
});

describe('legacy migration', () => {
  it.each([1, 2])('migrates v%s progress, all populations and pending eggs without releasing them', (v) => {
    const old = legacy(); old.v = v;
    old.pending = { hab: 'rock', plan: 'worm', role: 'predator', eggs: 7, tier: 'D', cards: [{ part: 'deep', rarity: 'rare', passed: true }] };
    const raw = JSON.parse(JSON.stringify(old));
    if (v === 1) { delete raw.forms; delete raw.unlocks; }
    const input = JSON.stringify(raw), parsed = parseSeaSave(input);
    expect(parsed.problem).toBeNull();
    const s = parsed.save!, map = legacyPatchMap(s.sea);
    expect(s.legacy?.json).toBe(input);
    expect([s.v, s.seed, s.at, s.lives, s.best, s.sea.gen, s.sea.r]).toEqual([3, old.seed, old.at, old.lives, old.best, old.garden.gen, old.garden.r]);
    expect(s.forms).toEqual(v === 1 ? {} : old.forms); expect(s.unlocks).toEqual(v === 1 ? {} : old.unlocks);
    expect(s.pending).toEqual({ ...old.pending, patch: map.rock, species: lineId('worm', 'predator') });
    expect(s.continuation).toEqual({ patch: map.rock, species: lineId('worm', 'predator'), plan: 'worm', role: 'predator', eggs: 7 });
    for (const hab of HAB_ORDER) {
      expect(s.sea.patches[map[hab]].ground).toBe(hab);
      expect(map[hab]).toBe(s.sea.patches.find((p) => p.ground === hab)!.id);
      for (const e of old.garden.habs[hab].entries) {
        const id = e.line ? lineId(e.line, e.role) : `legacy:${e.sp}:${e.role}`, k = s.sea.species.findIndex((sp) => sp.id === id);
        expect(s.sea.patches[map[hab]].pop[k]).toBe(e.pop);
        expect(s.sea.patches[map[hab]].fit[k]).toBe(e.score);
        expect(s.sea.patches.reduce((n, p) => n + p.pop[k], 0)).toBe(e.pop);
      }
    }
    expect(s.sea.species.find((sp) => sp.name === 'Kim')?.plan).toBe('swimmer');
    expect(wire(parseSeaSave(serializeSeaSave(s)).save!)).toEqual(wire(s));
    expect(JSON.parse(input)).toEqual(raw);
  });

  it('uses successful entries or progress after extinction, and leaves an unplayed legacy save eligible for founding', () => {
    const old = legacy();
    old.pending = { hab: 'sand', plan: 'worm', role: 'grazer', eggs: 0, tier: 'F', cards: [] };
    let s = parseSeaSave(JSON.stringify(old)).save!;
    expect(s.continuation?.species).toBe(lineId('worm', 'burrower'));
    for (const h of HAB_ORDER) old.garden.habs[h].entries = [];
    s = parseSeaSave(JSON.stringify(old)).save!;
    expect(s.continuation?.eggs).toBe(28);
    expect(s.continuation?.species).toBe(lineId('worm', 'burrower'));
    old.best = {};
    expect(parseSeaSave(JSON.stringify(old)).save!.continuation).toBeUndefined();
  });

  it('rejects structurally invalid legacy saves in both readers', () => {
    const old = legacy();
    const raw = JSON.parse(JSON.stringify(old)); raw.garden.habs.sand.entries[0].pop = -5;
    for (const read of [parseSave, parseSeaSave]) {
      expect(read(JSON.stringify(raw)).problem).toBe('broken');
      expect(read('{"v":2,"garden":{"habs":{}}}').problem).toBe('broken');
    }
  });
});

describe('elapsed time in both save models', () => {
  for (const model of ['garden', 'sea'] as const) {
    it(`${model}: keeps ordinary remainders; caps once below, at and above eight hours; ignores rollback`, () => {
      const cap = SEA.genMs * SEA.awayCap;
      for (const elapsed of [cap - 1000, cap, cap + 1000, 12 * 3600_000]) {
        const old = legacy(); old.at = 0;
        const sea = freshSeaSave(1, 0);
        const run = (at: number) => model === 'garden' ? advance(old, at) : advanceSeaSave(sea, at);
        const current = () => model === 'garden' ? old.at : sea.at;
        const gens = Math.min(SEA.awayCap, Math.floor(elapsed / SEA.genMs));
        expect(run(elapsed).gens).toBe(gens);
        expect(current()).toBe(elapsed > cap ? elapsed : gens * SEA.genMs);
        expect(run(elapsed).gens).toBe(0);
        const at = current();
        expect(run(at - 1000).gens).toBe(0); expect(current()).toBe(at);
        expect(run(at + SEA.genMs - 1).gens).toBe(0);
        expect(run(at + SEA.genMs).gens).toBe(1);
      }
    });
  }

  it('meets the roadmap catch-up budget with the larger migrated species registry', () => {
    const s = parseSeaSave(JSON.stringify(legacy())).save!;
    // Populate every patch to exercise meals, hunting, migration and headlines during catch-up.
    for (const p of s.sea.patches) for (let k = 0; k < s.sea.species.length; k++) { p.pop[k] = 10; p.fit[k] = 20; }
    const start = performance.now();
    expect(advanceSeaSave(s, s.at + SEA.awayCap * SEA.genMs).gens).toBe(160);
    expect(performance.now() - start).toBeLessThan(5000);
  });
});
