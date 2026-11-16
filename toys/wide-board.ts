// The wide toy's Board tab: places in bands, cells as chips, the card of a cell. It draws; board.ts decides.
import type { Board, Cell, Place } from '../clade/src/model/board';
import type { Build, JobId } from '../clade/src/model/types';
import { HOME } from '../clade/src/data/roster/toy';
import { coming, options, siteOf } from '../clade/src/model/board';
import { fitness, jobName } from '../clade/src/model/laws';
import { buildBlock, callName, dialWords, esc, mutationWords, webHere } from './wide-say';

/** Rule 3 mirrored for drawing only (home, held places, next to them): board.ts does not export it. */
export function reachOf(b: Board): Set<number> {
  const out = new Set<number>([HOME]);
  for (const p of b.places) if (p.cells.some((c) => c.holder?.mine)) { out.add(p.id); for (const n of p.next) out.add(n); }
  return out;
}

const BANDS: [string, (p: Place) => boolean, number][] = [
  ['Land', (p) => p.kind.realm === 'land', 0],
  ['Shore', (p) => p.kind.realm === 'shore', 0],
  ['Sea, by depth', (p) => p.kind.realm === 'sea', 1],
];
const DEPTH = ['flat', 'shallows', 'slope', 'deep'];
const depthOf = (p: Place) => DEPTH.findIndex((d) => p.kind.id.startsWith(d));
const short = (reason: string) => reason.replace(/^Cannot live here: /, '').replace(/\.$/, '');

function chip(b: Board, place: Place, cell: Cell, inReach: boolean): string {
  const h = cell.holder, site = siteOf(place), cls = ['cell', h ? (h.mine ? 'mine' : 'wild') : 'open'];
  if (!inReach) cls.push('far');
  let who: string;
  if (h) who = `${esc(callName(h.build))} <b>${fitness(h.build, cell.job, site).letter}</b>`;
  else {
    const c = coming(b, place.id, cell.job);
    who = c ? `${esc(c.named.common)} in ${c.gens}` : 'open';
  }
  let note = '';
  if (place.kind.realm !== 'sea' && (!h || !h.mine)) {
    const f = fitness(b.heir, cell.job, site);
    if (f.reasons[0].startsWith('Cannot live')) note = `<em>${esc(short(f.reasons[0]))}</em>`;
  }
  const v = cell.variant ? `<span class="var">✦ ${esc(cell.variant.what)}</span>` : '';
  return `<button class="${cls.join(' ')}" data-cell="${place.id}:${cell.job}"><small>${esc(jobName(cell.job))}</small><span>${who}</span>${note}${v}</button>`;
}

export function boardHtml(b: Board): string {
  const reach = reachOf(b);
  return BANDS.map(([title, test, byDepth]) => {
    const places = b.places.filter(test);
    if (byDepth) places.sort((x, y) => depthOf(x) - depthOf(y) || x.id - y.id);
    return `<h3>${title}</h3>${places.map((p) => `<div class="place${reach.has(p.id) ? '' : ' farp'}">
      <div class="pname">${esc(p.name)} <small>${p.kind.name === p.name ? '' : esc(p.kind.name)}${p.id === HOME ? ' · home' : ''}</small></div>
      <div class="cells">${p.cells.map((c) => chip(b, p, c, reach.has(p.id))).join('') || '<span class="dim">no jobs</span>'}</div></div>`).join('')}`;
  }).join('');
}

/** Why the heir cannot live a Life in this cell, if it cannot. */
function whyNot(b: Board, place: Place, cell: Cell): string {
  if (!reachOf(b).has(place.id)) return 'Out of reach: hold a cell in a place next to it first.';
  const site = siteOf(place), fit = fitness(b.heir, cell.job, site);
  if (fit.letter === 'F') return fit.reasons.find((r) => r) ?? 'Your heir reads F here.';
  const own = place.cells.find((c) => c.holder?.mine);
  if (own && own !== cell) return `You already hold ${jobName(own.job).toLowerCase()} here: one cell of yours a place.`;
  const h = cell.holder;
  if (h?.mine && JSON.stringify(h.build) === JSON.stringify(b.heir)) return 'Your heir holds it.';
  if (h) return `Its ${fitness(h.build, cell.job, site).letter} holds against your heir's ${fit.letter}.`;
  return 'Not open to your heir.';
}

function side(title: string, build: Build, letter: string, diff: Set<string>): string {
  const words = dialWords(build).map((w) => (diff.has(w) ? `<b class="gold">${esc(w)}</b>` : esc(w)));
  return `<div><h3>${title}</h3><div>${esc(callName(build))} <b>${letter}</b></div><div>${words.join(' · ')}</div><div class="dim">mutations ${esc(mutationWords(build))}</div></div>`;
}

export function cellCard(b: Board, placeId: number, job: JobId): string {
  const place = b.places[placeId], cell = place?.cells.find((c) => c.job === job);
  if (!place || !cell) return '<div class="dim">That cell is gone.</div>';
  const site = siteOf(place), head = `<div class="dim">${esc(place.name)} · ${esc(jobName(job))}</div>`;
  let out = head;
  const v = cell.variant;
  if (v && cell.holder?.mine) {
    const hb = cell.holder.build, a = dialWords(hb), bw = dialWords(v.build);
    const diff = new Set([...a.filter((w) => !bw.includes(w)), ...bw.filter((w) => !a.includes(w))]);
    out += `<div class="variant"><h2>A variant: ${esc(v.what)}</h2><div class="dim">${v.left} generations left beside your line</div>
      <div class="twin">${side('Your holder', hb, fitness(hb, job, site).letter, diff)}${side('The variant', v.build, fitness(v.build, job, site).letter, diff)}</div>
      <button class="act" data-adopt="${placeId}:${job}">Adopt</button></div>`;
  }
  const h = cell.holder, c = h ? null : coming(b, placeId, job), who = h?.build ?? c?.named.build;
  if (who) {
    const f = fitness(who, job, site);
    out += `${h ? (h.mine ? '<div class="gold">Your line holds it</div>' : '<div class="dim">Wild holder</div>') : `<div class="dim">Coming in ${c!.gens} generations</div>`}
      ${buildBlock(who, h ? undefined : c!.named)}
      <div class="letter">Here: <b>${f.letter}</b> · ${esc(f.reasons.filter((r) => r).join(' '))}</div>${webHere(who, site)}`;
  } else out += `<h2>Open</h2><div class="dim">${place.kind.realm === 'sea' ? 'No one is coming: bars run only in sea places you live in or next to.' : 'No one comes here in this toy.'}</div>`;
  const heir = fitness(b.heir, job, site), o = options(b).find((x) => x.place === placeId && x.job === job);
  const label = o ? { take: 'Take', beat: 'Beat', improve: 'Improve' }[o.act] : '';
  out += `<div class="you">Your heir here: <b>${heir.letter}</b> <span class="dim">${esc(heir.reasons[0])}</span></div>
    ${o ? `<button class="act" data-live="${placeId}:${job}">${label} (a Life)</button>` : `<div class="why">${esc(whyNot(b, place, cell))}</div>`}`;
  return out;
}
