// W1 contract: what the rows and the rules must be (direction §4, the budgets). Active from the start.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CLADE, CLADES } from '../../src/data/roster/clades';
import { KIND, KINDS } from '../../src/data/roster/kinds';
import { FOOD_IDS, LAWS } from '../../src/data/roster/laws';
import { LINKS } from '../../src/data/roster/links';
import { MUTATION, MUTATIONS } from '../../src/data/roster/mutations';
import { NAMED, SPECIES } from '../../src/data/roster/species';
import { HOME, PLACES, START } from '../../src/data/roster/toy';
import { fitness, stats } from '../../src/model/laws';
import type { Build } from '../../src/model/types';

const MODEL = new URL('../../src/model/', import.meta.url);
const files = readdirSync(MODEL).filter((f) => f.endsWith('.ts')).map((f) => ({ f, text: readFileSync(new URL(f, MODEL), 'utf8') }));
const inRange = (b: Build) => CLADE[b.clade].dials.every((d) => (b.dials[d.id] ?? 0) >= d.min - 1e-9 && (b.dials[d.id] ?? 0) <= d.max + 1e-9)
  && Object.keys(b.dials).every((id) => CLADE[b.clade].dials.some((d) => d.id === id));

describe('the rules name no one', () => {
  it('no clade, species or mutation id is written in clade/src/model', () => {
    const ids = [...CLADES, ...SPECIES, ...MUTATIONS].map((r) => r.id);
    const hits = files.flatMap(({ f, text }) => ids.filter((id) => new RegExp(`['"\`]${id}['"\`]`).test(text)).map((id) => `${f}: ${id}`));
    expect(hits).toEqual([]);
  });
  it('the model imports only itself and data/roster: never sim, view or ui', () => {
    const bad = files.flatMap(({ f, text }) => [...text.matchAll(/from '([^']+)'/g)].map((m) => m[1])
      .filter((path) => !/^\.\/[\w-]+$/.test(path) && !/^\.\.\/data\/roster\/[\w-]+$/.test(path)).map((path) => `${f}: ${path}`));
    expect(bad).toEqual([]);
  });
  it('no dice and no clock in the model', () => {
    expect(files.filter(({ text }) => /Math\.random|Date\.now|new Date/.test(text)).map(({ f }) => f)).toEqual([]);
  });
  it('files stay under 400 lines', () => {
    expect(files.filter(({ text }) => text.split('\n').length > 400).map(({ f }) => f)).toEqual([]);
  });
});

describe('the rows', () => {
  it('ids are unique; a species, a link and a place point at rows that exist', () => {
    for (const rows of [CLADES, SPECIES, MUTATIONS, KINDS]) expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
    for (const n of SPECIES) expect(CLADE[n.build.clade], n.id).toBeDefined();
    for (const [a, b] of LINKS) { expect(NAMED[a], a).toBeDefined(); expect(NAMED[b], b).toBeDefined(); }
    for (const p of PLACES) { expect(KIND[p.kind], p.name).toBeDefined(); for (const n of p.next) expect(PLACES[n].next, `${p.name} and ${PLACES[n].name}`).toContain(p.id); }
    expect(PLACES.map((p) => p.id)).toEqual(PLACES.map((_, i) => i));
    expect(KIND[PLACES[HOME].kind].edge, 'home is on the tide line').toBe(true);
  });
  it('budgets: three dials a clade, size first; six mutations a clade; stats 0 to 4 before dials', () => {
    for (const c of CLADES) {
      expect(c.dials.length, c.id).toBeLessThanOrEqual(3);
      expect(c.dials[0].id, c.id).toBe('size');
      expect(new Set(c.dials.map((d) => d.id)).size, c.id).toBe(c.dials.length);
      for (const d of c.dials) { expect(d.max, c.id).toBeGreaterThanOrEqual(d.min); expect(d.word.length, c.id).toBeGreaterThan(0); }
      expect(c.mutations.length, c.id).toBeLessThanOrEqual(6);
      for (const m of c.mutations) expect(MUTATION[m], `${c.id}: ${m}`).toBeDefined();
      for (const v of Object.values(c.base)) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(4); }
      if (c.guard === 'fleeing') expect(c.dials.some((d) => d.id === 'guard'), `${c.id}: a fleeing guard is its speed`).toBe(false);
      if (!c.guard) expect(c.dials.some((d) => d.id === 'guard'), `${c.id}: no guard to dial`).toBe(false);
      expect(!!c.makes, `${c.id}: a producer eats light and nothing else`).toBe(c.diet.includes('light'));
    }
  });
  it('budget: six stats', () => {
    expect(Object.keys(stats(START))).toEqual(['bite', 'thrift', 'defence', 'speed', 'senses', 'brood']);
  });
  it('budget: four stocks a habitat at most, whichever producer grows there', () => {
    for (const k of KINDS) for (const p of [null, ...CLADES.filter((c) => c.makes)]) {
      if (p && fitness({ clade: p.id, dials: {}, mutations: [] }, 'light', { kind: k, area: 1, pops: [] }).value === 0) continue;
      const n = FOOD_IDS.filter((f) => (k.base[f] ?? 0) + (p?.makes?.[f] ?? 0) * k.light >= LAWS.stockFloor).length;
      expect(n, `${k.id} with ${p?.id ?? 'no producer'}`).toBeLessThanOrEqual(4);
    }
  });
  it('a species is a point inside its clade: its dials are the clade\'s, in range; its mutations are the clade\'s', () => {
    for (const n of SPECIES) {
      expect(inRange(n.build), n.id).toBe(true);
      for (const m of n.build.mutations) expect(CLADE[n.build.clade].mutations, n.id).toContain(m);
    }
    expect(inRange(START)).toBe(true);
  });
  it('every species carries a grade for every trait; nothing claims more than it has', () => {
    for (const n of SPECIES) {
      expect(Object.keys(n.src).sort(), n.id).toEqual(['dials', 'diet', 'guard', 'mass', 'realm']);
      if (n.ott === 0) expect(Object.values(n.src).every((g) => g === 'drafted' || g === 'hand'), `${n.id}: no source id, so nothing is researched`).toBe(true);
    }
  });
  it('a mutation does one thing: a look has no rule, a push moves one dial at a cost, a key grants one adaptation', () => {
    for (const m of MUTATIONS) {
      if (m.kind === 'look') expect([m.dial, m.by, m.cost, m.grants], m.id).toEqual([undefined, undefined, undefined, undefined]);
      if (m.kind === 'push') { expect(m.dial, m.id).toBeDefined(); expect(m.by, m.id).toBeGreaterThan(0); expect(m.cost, m.id).toBeGreaterThan(0); expect(m.grants, m.id).toBeUndefined(); }
      if (m.kind === 'key') { expect(m.grants, m.id).toBeDefined(); expect(m.dial, m.id).toBeUndefined(); }
    }
  });
});
