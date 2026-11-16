// The wide toy's Board tab: places in bands, cells as chips, the card of a cell. It draws; board.ts decides.
import type { Board, Cell, Place } from '../clade/src/model/board';
import type { Fitness, JobId } from '../clade/src/model/types';
import { HOME } from '../clade/src/data/roster/toy';
import { MUTATION } from '../clade/src/data/roster/mutations';
import { coming, destination, founder, nameOf, options, reach, rivalOf, siteOf } from '../clade/src/model/board';
import { stepsTo } from '../clade/src/model/board-goal';
import { fitness, jobName } from '../clade/src/model/laws';
import { buildBlock, callName, esc, generations, webHere } from './wide-say';
import { variantCard } from './wide-variant';

const BANDS: [string, (p: Place) => boolean, number][] = [
  ['Land', (p) => p.kind.realm === 'land', 0],
  ['Shore', (p) => p.kind.realm === 'shore', 0],
  ['Sea, by depth', (p) => p.kind.realm === 'sea', 1],
];
const DEPTH = ['flat', 'shallows', 'slope', 'deep'];
const depthOf = (p: Place) => DEPTH.findIndex((d) => p.kind.id.startsWith(d));
const short = (reason: string) => reason.replace(/^Cannot live here: /, '').replace(/\.$/, '');

function population(b: Board, p: Place, cell: Cell): string {
  const h = cell.holder!, named = nameOf(h.build), dest = h.mine ? destination(b, p.id, cell.job) : null;
  const name = !named && dest ? `${+stepsTo(h.build, dest).toFixed(1)} steps to ${dest.common}` : callName(h.build);
  const won = named && b.cards.includes(named.id);
  return `${esc(name)}${won ? ' <span title="Card won">✓</span>' : ''}`;
}

function chip(b: Board, place: Place, cell: Cell, inReach: boolean): string {
  const h = cell.holder, site = siteOf(place), cls = ['cell', h ? (h.mine ? 'mine' : 'wild') : 'open'];
  if (!inReach) cls.push('far');
  let who: string;
  if (h) who = `${population(b, place, cell)} <b>${fitness(h.build, cell.job, site).letter}</b>`;
  else {
    const c = coming(b, place.id, cell.job);
    who = c ? `${esc(c.named.common)} in ${generations(c.gens)}` : 'open';
  }
  let note = '';
  if (place.kind.realm !== 'sea' && (!h || !h.mine)) {
    const from = founder(b, place.id, cell.job), f = fitness(from ?? b.starts[b.main], cell.job, site);
    if (f.reasons[0].startsWith('Cannot live')) note = `<em>${esc(short(f.reasons[0]))}</em>`;
  }
  const rival = rivalOf(b, place.id, cell.job);
  const challenge = rival ? `<span class="rival${h?.mine ? ' danger' : ''}">↠ ${esc(rival.named.common)} in ${generations(rival.gens)}</span>` : '';
  const v = cell.variant ? `<span class="var">✦ ${esc(cell.variant.what)}</span>` : '';
  return `<button class="${cls.join(' ')}" data-cell="${place.id}:${cell.job}"><small>${esc(jobName(cell.job))}</small><span>${who}</span>${note}${challenge}${v}</button>`;
}

export function boardHtml(b: Board): string {
  const reached = reach(b);
  return BANDS.map(([title, test, byDepth]) => {
    const places = b.places.filter(test);
    if (byDepth) places.sort((x, y) => depthOf(x) - depthOf(y) || x.id - y.id);
    return `<h3>${title}</h3>${places.map((p) => `<div class="place${reached.has(p.id) ? '' : ' farp'}">
      <div class="pname">${esc(p.name)} <small>${p.kind.name === p.name ? '' : esc(p.kind.name)}${p.id === HOME ? ' · home' : ''}</small></div>
      <div class="cells">${p.cells.map((c) => chip(b, p, c, reached.has(p.id))).join('') || '<span class="dim">no jobs</span>'}</div></div>`).join('')}`;
  }).join('');
}

/** Explain an absent option. Availability itself comes only from `options` and `founder`. */
function whyNot(b: Board, place: Place, cell: Cell, fit: Fitness): string {
  if (!reach(b).has(place.id)) return 'Out of reach: hold a cell in a place next to it first.';
  if (fit.letter === 'F') return fit.reasons.find((r) => r) ?? 'No founder of this line grows here.';
  const h = cell.holder;
  if (h?.mine && h.build.clade !== b.main) return 'Another line of yours holds it.';
  const otherHunt = cell.job === 'hunt' ? 'hunt2' : cell.job === 'hunt2' ? 'hunt' : null;
  if (otherHunt && place.cells.some((c) => c.job === otherHunt && c.holder?.build.clade === b.main)) return 'This line already hunts here.';
  if (h?.mine) {
    const from = founder(b, place.id, cell.job)!;
    const key = h.build.mutations.find((m) => MUTATION[m].kind === 'key' && !from.mutations.includes(m));
    if (key) return `Your population here keeps an adaptation the founder lacks: ${MUTATION[key].name.toLowerCase()}.`;
    return 'Your population here reads higher.';
  }
  return 'The wild population here reads higher.';
}

export function cellCard(b: Board, placeId: number, job: JobId): string {
  const place = b.places[placeId], cell = place?.cells.find((c) => c.job === job);
  if (!place || !cell) return '<div class="dim">That cell is gone.</div>';
  const site = siteOf(place);
  let out = `<div class="dim">${esc(place.name)} · ${esc(jobName(job))}</div>`;
  const rival = rivalOf(b, placeId, job);
  if (rival && cell.holder) {
    const r = fitness(rival.named.build, job, site), f = fitness(cell.holder.build, job, site);
    out += `<div class="rival${cell.holder.mine ? ' danger' : ''}">Rival: ${esc(rival.named.common)} in ${generations(rival.gens)} · <b>${r.letter}</b> (${r.value.toFixed(2)}) against ${cell.holder.mine ? 'your' : 'the holder’s'} <b>${f.letter}</b> (${f.value.toFixed(2)})</div>`;
  }
  if (cell.variant && cell.holder?.mine) out += variantCard(cell.holder.build, cell.variant, job, site, `${placeId}:${job}`);
  const h = cell.holder, c = h ? null : coming(b, placeId, job), who = h?.build ?? c?.named.build;
  if (who) {
    const f = fitness(who, job, site);
    out += `${h ? (h.mine ? `<div class="gold">Your population · ${population(b, place, cell)}</div>` : '<div class="dim">Wild holder</div>') : `<div class="dim">Coming in ${generations(c!.gens)}</div>`}
      ${buildBlock(who, h ? undefined : c!.named)}
      <div class="letter">Here: <b>${f.letter}</b> · ${esc(f.reasons.filter((r) => r).join(' '))}</div>${webHere(who, site)}`;
  } else out += '<h2>Open</h2><div class="dim">No one is coming to this cell.</div>';
  const o = options(b).find((x) => x.place === placeId && x.job === job), from = o?.from ?? founder(b, placeId, job);
  const fit = o?.fit ?? fitness(from ?? b.starts[b.main], job, site);
  const label = o ? { take: 'Take', beat: 'Beat', improve: 'Improve' }[o.act] : '';
  out += `<div class="you">Founded from here: <b>${fit.letter}</b>${from ? ` · ${esc(callName(from))}` : ' · no growing founder'} <span class="dim">${esc(fit.reasons[0])}</span></div>
    ${o ? `<button class="act" data-live="${placeId}:${job}">${label} (a Life)</button>` : `<div class="why">${esc(whyNot(b, place, cell, fit))}</div>`}`;
  return out;
}
