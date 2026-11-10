import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CLADES } from '../src/data/clades';
import { PARTS } from '../src/data/parts';
import { ACCENT } from '../src/data/palette';
import { FOODS } from '../src/data/sea';
import { bodyMass, ceiling, fitness, reach, slots, stats } from '../src/sim/fitness';
import type { Habitat } from '../src/sim/habitats';
import type { Build, World } from '../src/sim/records';

const worm: Build = { clade: 'worm', parts: {}, genes: { size: 1, gut: 1 } };
const habitat = (): Habitat => ({
  id: 0, kind: { depth: 'shallows', substrate: 'sand', exposure: 'open' }, name: 'Test shallows',
  tiles: [], area: 100, centre: { x: 0, y: 0 }, neighbours: [], borders: [], perimeter: 40,
  stocks: { mats: 300, detritus: 100 }, pops: {},
});
const world: World = { seed: 1, generation: 0, habitats: [], species: [], lineages: [] };

describe('fitness contracts', () => {
  it('law 1: only fitness makes letters or reads the letter thresholds (source grep)', () => {
    const source = new URL('../src', import.meta.url);
    const files = readdirSync(source, { recursive: true }).map(String).filter((p) => /\.(ts|svelte)$/.test(p));
    for (const file of files) {
      if (file.startsWith('data/') || file === 'sim/fitness.ts') continue;
      const text = readFileSync(join(source.pathname, file), 'utf8');
      expect(text, file).not.toMatch(/LETTER_THRESHOLDS|TERM_THRESHOLDS/);
      expect(text, file).not.toMatch(/(?:return\s+|(?:letter|tier)\s*[:=]\s*)['"][SABCDF]['"]/);
    }
  });

  it('law 3: more upkeep never raises fitness; lean ranks only remove their own part cost', () => {
    const h = habitat(), slot = slots(h, world)[0];
    const plain = fitness(worm, {}, slot, h, world);
    const costly: Build = { ...worm, parts: { eyes: 'eye', sides: 'spine', back: 'gill' } };
    const paid = fitness(costly, {}, slot, h, world);
    expect(paid.upkeep).toBe(plain.upkeep + 2);
    expect(paid.value).toBeLessThan(plain.value);
    expect(fitness(costly, { eye: 1, spine: 1 }, slot, h, world).value).toBe(plain.value);
    expect(fitness(costly, { eye: 100, gill: 100, gut: 100 }, slot, h, world).upkeep).toBe(plain.upkeep + 1);
    const larger: Build = { ...worm, genes: { size: 5, gut: 1 } };
    expect(fitness(larger, {}, slot, h, world).value).toBeLessThanOrEqual(plain.value);
  });

  it('law 3: removing either food makes its eaters\' intake zero', () => {
    const h = habitat(), build: Build = { ...worm, parts: { front: 'tentacles', tail: 'bulb' } };
    for (const slot of slots(h, world)) {
      expect(fitness(build, {}, slot, h, world).intake).toBeGreaterThan(0);
      const empty = { ...h, stocks: { ...h.stocks, [slot.id]: 0 } };
      expect(fitness(build, {}, slot, empty, world).intake).toBe(0);
      expect(fitness(build, {}, slot, empty, world).value).toBe(0);
    }
  });

  it('law 4: the cell is the only root, every other clade has a parent and reaches it', () => {
    expect(Object.values(CLADES).filter((c) => c.parent === null).map((c) => c.id)).toEqual(['cell']);
    expect(CLADES.cell.playable).toBe(false);
    expect(CLADES.worm.parent).toBe('cell');
    for (const c of Object.values(CLADES)) {
      const seen = new Set();
      let node = c;
      while (node.parent !== null) {
        expect(seen.has(node.id)).toBe(false);
        seen.add(node.id);
        expect(CLADES[node.parent]).toBeDefined();
        node = CLADES[node.parent];
      }
    }
  });

  it('law 5: at most six stats, ten genes and four stocks; N1 uses six, two and two', () => {
    expect(Object.keys(stats(worm, {}))).toHaveLength(6);
    expect(Object.keys(worm.genes)).toHaveLength(2);
    expect(Object.keys(habitat().stocks)).toEqual(FOODS);
    expect(FOODS.length).toBeLessThanOrEqual(4);
  });
});

describe('food and habitat rules', () => {
  it('keeps the whole part port with families, homes and the required food openers', () => {
    expect(Object.keys(PARTS)).toHaveLength(27);
    for (const p of Object.values(PARTS)) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.does.length).toBeGreaterThan(0);
      expect(['feed', 'guard', 'brood', 'move', 'sense']).toContain(p.family);
      expect(p.stamp).toBeTruthy();
      expect(p.homes).toBeDefined();
    }
    expect(PARTS.tentacles.opens).toEqual(['mats']);
    expect(PARTS.rake.opens).toEqual(['mats']);
    expect(PARTS.bulb.opens).toEqual(['detritus']);
    expect(PARTS.digger.opens).toEqual(['detritus']);
    expect(CLADES.arthropod.gate).toEqual(['sclerite', 'proboscis']);
    expect(CLADES.trilobite.gate).toEqual(['shield', 'digger']);
    expect(CLADES.swimmer.gate).toEqual(['compound', 'flap']);
  });

  it('derives capacity from area, keeps letters independent of area, and ignores exposure', () => {
    const h = habitat(), big = { ...h, area: 200, stocks: { mats: 600, detritus: 200 } };
    const smallSlot = slots(h, world)[0], bigSlot = slots(big, world)[0];
    expect(bigSlot.capacity).toBe(smallSlot.capacity * 2);
    expect(fitness(worm, {}, smallSlot, h, world)).toEqual(fitness(worm, {}, bigSlot, big, world));
    const lee = { ...h, kind: { ...h.kind, exposure: 'sheltered' as const } };
    expect(fitness(worm, {}, smallSlot, lee, world)).toEqual(fitness(worm, {}, smallSlot, h, world));
    expect(slots(h, world).map((s) => s.accent)).toEqual([ACCENT.grazer, ACCENT.burrower]);
    expect(slots({ ...h, area: 0 }, world)).toEqual([]);
    for (const depth of ['slope', 'deep'] as const) {
      const dark = { ...h, kind: { ...h.kind, depth } };
      expect(ceiling(dark, 'mats')).toBe(0);
      expect(slots(dark, world).map((s) => s.id)).toEqual(['detritus']);
    }
  });

  it('keeps locked foods at zero reach, a weak worm mouth, and the old mud differences', () => {
    const h = habitat(), mud = { ...h, kind: { ...h.kind, substrate: 'mud' as const } };
    expect(reach(worm, {}, 'mats', h)).toBeGreaterThan(0);
    expect(reach(worm, {}, 'detritus', h)).toBe(0);
    expect(reach({ ...worm, parts: { front: 'tentacles' } }, {}, 'mats', h)).toBeGreaterThan(reach(worm, {}, 'mats', h));
    expect(reach({ ...worm, parts: { tail: 'bulb' } }, {}, 'detritus', h)).toBeGreaterThan(0);
    expect(reach(worm, {}, 'mats', mud)).toBeGreaterThan(reach(worm, {}, 'mats', h));
    expect(reach({ ...worm, clade: 'arthropod' }, {}, 'mats', mud)).toBe(0);
    expect(reach({ ...worm, clade: 'trilobite' }, {}, 'mats', mud)).toBeGreaterThan(0);
    expect(reach({ ...worm, clade: 'swimmer' }, {}, 'mats', h)).toBe(0);
    expect(bodyMass({ ...worm, genes: { size: 5, gut: 1 } })).toBeGreaterThan(bodyMass(worm));
  });

  it('returns three term letters and reasons, survival 1, and never mutates its arguments', () => {
    const h = habitat(), slot = slots(h, world)[0];
    const before = structuredClone({ worm, h, world });
    const result = fitness(worm, {}, slot, h, world);
    expect(result.survival).toBe(1);
    expect(result.value).toBe(result.intake / result.upkeep * stats(worm, {}).brood);
    expect(result.reasons).toHaveLength(3);
    expect(result.reasons[0]).toMatch(/^Intake [SABCDF]:/);
    expect(result.reasons[1]).toMatch(/^Upkeep [SABCDF]:/);
    expect(result.reasons[2]).toBe('Survival S: nothing hunts it here.');
    expect({ worm, h, world }).toEqual(before);
  });
});
