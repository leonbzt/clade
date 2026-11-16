// W1 contract: the tests on the data (direction §4). They replace a balance bot: the laws' directions must hold over
// the whole roster. A failing test here means a row to fix, or a number in data/roster/laws.ts; never a rule for one
// species, and never an edit of this file by a builder.
import { describe, expect, it } from 'vitest';
import { CLADE } from '../../src/data/roster/clades';
import { KINDS } from '../../src/data/roster/kinds';
import { DIAL_STEP } from '../../src/data/roster/laws';
import { LINKS, LINKS_MOST } from '../../src/data/roster/links';
import { NAMED, SPECIES } from '../../src/data/roster/species';
import { START } from '../../src/data/roster/toy';
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
/** Lit kinds no producer in the roster grows on: tide flats of sand and mud carry mats only. */
const BARE = ['flat-sand-lee', 'flat-sand-open', 'flat-mud-lee', 'flat-mud-open'];
