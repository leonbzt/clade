// The wide toy's Roster tab: every species as a row, its full card over the whole roster, and the coverage table.
// W3's tool: it reads the rows and the laws, never the board.
import type { JobId, Named, Realm } from '../clade/src/model/types';
import { CLADE } from '../clade/src/data/roster/clades';
import { KINDS } from '../clade/src/data/roster/kinds';
import { FOOD_IDS } from '../clade/src/data/roster/laws';
import { NAMED, SPECIES } from '../clade/src/data/roster/species';
import { candidates, climax, eats, jobsAt, lives, massOf } from '../clade/src/model/laws';
import { beatsWords, buildBlock, dialWords, esc, grams, guardWords } from './wide-say';

export type RealmFilter = Realm | 'all';
const realmsOf = (n: Named) => new Set(KINDS.filter((k) => lives(n.build, k)).map((k) => k.realm));
const grades = (n: Named) => {
  const g = Object.values(n.src);
  return g.every((x) => x === g[0]) ? `all ${g[0]}` : Object.entries(n.src).map(([t, x]) => `${t} ${x}`).join(', ');
};

export function rosterHtml(filter: RealmFilter): string {
  const rows = SPECIES.filter((n) => filter === 'all' || realmsOf(n).has(filter));
  const head = (['all', 'sea', 'shore', 'land'] as RealmFilter[]).map((r) => `<button class="${r === filter ? 'on' : ''}" data-realm="${r}">${r}</button>`).join('');
  return `<div class="grp">${head}</div><div class="dim">${rows.length} species</div>
    ${rows.map((n) => `<button class="row" data-sp="${n.id}"><b>${esc(n.common)}</b> <small>${esc(CLADE[n.build.clade].name)} · ${grams(massOf(n.build))}</small>
      <small>${dialWords(n.build).slice(1).map(esc).join(' · ') || 'no dials'} · ${esc(guardWords(n.build))} · beats ${esc(beatsWords(n.build))} · ${grades(n)}</small></button>`).join('')}
    <h3>Coverage</h3>${coverageHtml()}`;
}

export function speciesCard(id: string): string {
  const n = NAMED[id];
  if (!n) return '';
  const prey = SPECIES.filter((o) => o !== n && KINDS.some((k) => eats(n.build, o.build, k))).map((o) => o.common);
  const by = SPECIES.filter((o) => o !== n && KINDS.some((k) => eats(o.build, n.build, k))).map((o) => o.common);
  const where = KINDS.filter((k) => lives(n.build, k)).map((k) => k.name);
  return `${buildBlock(n.build, n)}
    <div><b>Eats:</b> ${esc(prey.join(', ') || 'no one in the roster')}</div>
    <div><b>Eaten by:</b> ${esc(by.join(', ') || 'no one in the roster')}</div>
    <div class="dim">Can live in ${where.length} of ${KINDS.length} kinds: ${esc(where.join(', '))}</div>
    <div class="dim">Grades: ${esc(grades(n))}</div>`;
}

const JOBS: [JobId, string][] = [['light', 'Lt'], ...FOOD_IDS.map((f): [JobId, string] => [f, f.slice(0, 2).replace(/^./, (c) => c.toUpperCase())]), ['hunt', 'H'], ['hunt2', 'H2']];
const AREA = 3000; // as tests/model/data.test.ts reads the climax webs
let table = '';

/** Habitat kinds down, jobs across: how many species grow in each cell of the kind's climax web. */
function coverageHtml(): string {
  if (table) return table;
  const rows = KINDS.map((k) => {
    const site = climax(k, AREA, SPECIES), jobs = jobsAt(site);
    const cells = JOBS.map(([job]) => {
      if (!jobs.includes(job)) return '<td class="dim">·</td>';
      const n = candidates(job, { ...site, pops: site.pops.filter((p) => p.job !== job) }, SPECIES).filter((c) => c.fit.letter !== 'F').length;
      return `<td class="${n === 0 ? 'empty' : n === 1 ? 'thin' : ''}">${n}</td>`;
    }).join('');
    return `<tr><th>${esc(k.name)}</th>${cells}</tr>`;
  }).join('');
  table = `<div class="dim">Candidates that grow (letter D or better) in each kind's climax web. Red: empty; amber: one. Lt light · Ma mats · Pl plankton · De detritus · Gr greens · Se seeds · Li litter · H hunt · H2 hunt the hunter.</div>
    <div class="scroll"><table class="cov"><tr><th></th>${JOBS.map(([, s]) => `<th>${s}</th>`).join('')}</tr>${rows}</table></div>`;
  return table;
}
