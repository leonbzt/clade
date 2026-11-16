// W1 contract: the tests on the data (direction §4). They replace a balance bot: the laws' directions must hold over
// the whole roster. A failing test here means a row to fix, or a number in data/roster/laws.ts; never a rule for one
// species, and never an edit of this file by a builder.
import { describe, expect, it } from 'vitest';
import { CLADE } from '../../src/data/roster/clades';
import { KIND, KINDS } from '../../src/data/roster/kinds';
import { DIAL_STEP } from '../../src/data/roster/laws';
import { LINKS, LINKS_MOST } from '../../src/data/roster/links';
import { NAMED, SPECIES } from '../../src/data/roster/species';
import { LINES, PLACES, START } from '../../src/data/roster/toy';
import { nameOf } from '../../src/model/board';
import { candidates, climax, eats, fitness, jobsAt, lives } from '../../src/model/laws';
import type { Build, DialId, JobId, Named, Site } from '../../src/model/types';

const AREA = 3000;
const webs: Site[] = KINDS.map((k) => climax(k, AREA, SPECIES));
const cells = webs.flatMap((site) => jobsAt(site).map((job) => ({ site, job })));
const isProducer = (n: Named) => !!CLADE[n.build.clade].makes;
const grows = (b: Build, job: JobId, site: Site) => fitness(b, job, site).letter !== 'F';

describe('the data tests', () => {
  it('sign change: every dial has a cell where a step more is better and one where it is worse', () => {
    for (const dial of Object.keys(DIAL_STEP) as DialId[]) {
      let better = 0, worse = 0;
      for (const n of SPECIES) {
        if (isProducer(n) || !CLADE[n.build.clade].dials.some((d) => d.id === dial)) continue;
        const more: Build = { ...n.build, dials: { ...n.build.dials, [dial]: (n.build.dials[dial] ?? 0) + DIAL_STEP[dial] } };
        for (const { site, job } of cells) {
          const a = fitness(n.build, job, site).value, b = fitness(more, job, site).value;
          if (a <= 0 || b <= 0) continue;
          if (b > a * 1.001) better++;
          if (b < a * 0.999) worse++;
        }
      }
      expect(better, `${dial}: more is better somewhere`).toBeGreaterThan(0);
      expect(worse, `${dial}: less is better somewhere`).toBeGreaterThan(0);
    }
  });

  it('no dead: every species grows in some cell', () => {
    const dead = SPECIES.filter((n) => !cells.some(({ site, job }) => grows(n.build, job, site))).map((n) => n.id);
    expect(dead).toEqual([]);
  });

  it('no best: no animal that can do three cells or more is the top candidate in all of them', () => {
    const best: string[] = [];
    for (const n of SPECIES.filter((s) => !isProducer(s))) { // producers are board pieces: nobody picks among them
      const mine = cells.filter(({ site, job }) => grows(n.build, job, site));
      if (mine.length >= 3 && mine.every(({ site, job }) => candidates(job, { ...site, pops: site.pops.filter((p) => p.job !== job) }, SPECIES)[0]?.named === n)) best.push(n.id);
    }
    expect(best).toEqual([]);
  });

  it('known links: eats() reproduces most of the documented links and non-links', () => {
    const right = LINKS.filter(([a, b, want]) => KINDS.some((k) => eats(NAMED[a].build, NAMED[b].build, k)) === want);
    expect(right.length / LINKS.length).toBeGreaterThanOrEqual(LINKS_MOST);
  });

  it('coverage: the sea and shore cells nobody can fill are the listed ones; thin cells stay few', () => {
    const empty: string[] = [];
    let thin = 0, all = 0;
    for (const { site, job } of cells) {
      if (site.kind.realm === 'land' || job === 'light' || job === 'hunt2') continue;
      const n = candidates(job, { ...site, pops: site.pops.filter((p) => p.job !== job) }, SPECIES).filter((c) => c.fit.letter !== 'F').length;
      all++;
      if (n === 0) empty.push(`${site.kind.id}:${job}`);
      if (n < 2) thin++;
    }
    expect(empty.filter((c) => !EMPTY.includes(c))).toEqual([]);
    expect(thin / all, 'cells with fewer than two candidates: the coverage table W3 fills').toBeLessThanOrEqual(THIN);
  });

  it('coverage: every lit kind but the listed ones has a producer that grows there', () => {
    const bare = webs.filter((s) => s.kind.light >= 0.5 && !s.pops.some((p) => p.job === 'light')).map((s) => s.kind.id);
    expect(bare.filter((k) => !BARE.includes(k))).toEqual([]);
  });

  it('a chain three long in the sea and on the shore: a food eater, its hunter, and the hunter of that', () => {
    for (const realm of ['sea', 'shore'] as const) {
      const found = KINDS.filter((k) => k.realm === realm).some((k) => {
        const here = SPECIES.filter((n) => lives(n.build, k));
        return here.some((a) => !CLADE[a.build.clade].diet.includes('prey') && !isProducer(a)
          && here.some((b) => eats(b.build, a.build, k) && here.some((c) => eats(c.build, b.build, k))));
      });
      expect(found, realm).toBe(true);
    }
  });
  it.todo('W4: a chain three long on the land');

  it('law 6, transfer: a hunter stands at fewer grams than the prey it eats', () => {
    for (const site of webs) for (const h of site.pops.filter((p) => p.job === 'hunt' || p.job === 'hunt2')) {
      const prey = site.pops.filter((p) => p !== h && eats(h.build, p.build, site.kind)).reduce((sum, p) => sum + p.grams, 0);
      expect(h.grams, site.kind.id).toBeLessThan(prey);
    }
  });

  // Round two (16 Nov): what the first play showed, held as numbers that may only fall.
  it('dials matter: the clade dials whose best step moves no cell by a tenth stay few (a ratchet)', () => {
    const flat: string[] = [];
    for (const c of Object.values(CLADE).filter((x) => x.life)) for (const d of c.dials) {
      const builds = [...SPECIES.filter((n) => n.build.clade === c.id).map((n) => n.build), ...[START, ...LINES.map((l) => l.start)].filter((b) => b.clade === c.id)];
      let most = 1;
      for (const b of builds) for (const dir of [1, -1]) {
        const v = (b.dials[d.id] ?? 0) + dir * DIAL_STEP[d.id];
        if (v < d.min - 1e-9 || v > d.max + 1e-9) continue;
        const moved: Build = { ...b, dials: { ...b.dials, [d.id]: v } };
        for (const { site, job } of cells) {
          const from = fitness(b, job, site), to = fitness(moved, job, site);
          if (from.letter !== 'F' && to.value > 0) most = Math.max(most, to.value / from.value);
        }
      }
      if (most < 1.1) flat.push(`${c.id}.${d.id}`);
    }
    expect(flat.length, `flat dials: ${flat.join(' ')}`).toBeLessThanOrEqual(FLAT_MOST);
  });

  it('no sister wins everywhere: the species a sister of its clade outreads in every cell are the listed ones (a ratchet)', () => {
    const under: string[] = [];
    for (const n of SPECIES.filter((s) => CLADE[s.build.clade].life)) {
      const sisters = SPECIES.filter((s) => s !== n && s.build.clade === n.build.clade);
      const mine = cells.filter(({ site, job }) => grows(n.build, job, site));
      if (sisters.some((s) => mine.length > 0 && mine.every(({ site, job }) => fitness(s.build, job, site).value > fitness(n.build, job, site).value))) under.push(n.id);
    }
    expect(under.filter((id) => !UNDER.includes(id))).toEqual([]);
  });

  it('the toy\'s lines: each opens at more cards than the last, and starts as no named species that grows in the toy\'s sea', () => {
    const sea = PLACES.filter((p) => KIND[p.kind].realm === 'sea').map((p) => climax(KIND[p.kind], p.area, SPECIES));
    let cards = 0, toWin = SPECIES.filter((n) => n.build.clade === START.clade).length;
    for (const line of LINES) {
      const c = CLADE[line.clade];
      expect(c.life, line.clade).not.toBeNull();
      expect(line.start.clade).toBe(line.clade);
      expect(nameOf(line.start), `${line.clade} starts unnamed`).toBeNull();
      for (const d of c.dials) { expect(line.start.dials[d.id]!).toBeGreaterThanOrEqual(d.min - 1e-9); expect(line.start.dials[d.id]!).toBeLessThanOrEqual(d.max + 1e-9); }
      expect(sea.some((site) => jobsAt(site).some((job) => grows(line.start, job, site))), `${line.clade} grows somewhere`).toBe(true);
      expect(line.cards).toBeGreaterThan(cards);
      expect(line.cards, `${line.clade}: the cards must be there to win before it opens`).toBeLessThanOrEqual(toWin);
      cards = line.cards;
      toWin += SPECIES.filter((n) => n.build.clade === line.clade).length;
    }
  });

  it('law 7, realm: the first line lives in the sea, reaches the shore only with air, and never the land', () => {
    const air: Build = { ...START, mutations: [...START.mutations, 'air-breathing'] };
    for (const k of KINDS) {
      if (k.realm === 'sea') expect(lives(START, k), k.id).toBe(true);
      if (k.realm === 'shore') { expect(lives(START, k), k.id).toBe(false); expect(lives(air, k), k.id).toBe(true); }
      if (k.realm === 'land') expect(lives(air, k), k.id).toBe(false);
    }
  });
});

/** Sea and shore cells no species in the roster can fill today. Ratchets: W3 shrinks them; nothing may be added. */
const EMPTY = ['shallows-rock-lee:hunt', 'shore-mud:mats', 'shore-mud:hunt'];
/** The share of sea and shore cells with fewer than two candidates (measured 16 Nov: 16 of 76). */
const THIN = 0.25;
/** Mover clade dials whose best single step changes no cell's value by a tenth (measured 16 Nov: 43 of 54). The
 *  laws are smooth between a few thresholds; the laws' second cut brings this down. Nothing may raise it. */
const FLAT_MOST = 43;
/** Named species a sister outreads in every cell: bigger wins inside a clade today. May only shrink. */
const UNDER = ['common-ragworm'];
/** Lit kinds no producer in the roster grows on: tide flats of sand and mud carry mats only. */
const BARE = ['flat-sand-lee', 'flat-sand-open', 'flat-mud-lee', 'flat-mud-open'];
