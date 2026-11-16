// Toy: the wide toy (W1 part B). A thin page over clade/src/model: the board rules decide, this draws and taps.
// One question: is a derived web of real species a board I want to climb and look through?
import { adopt, live, newBoard, nextGoal, step, type Board } from '../clade/src/model/board';
import type { Build, DialId, JobId } from '../clade/src/model/types';
import { CLADE, CLADES } from '../clade/src/data/roster/clades';
import { DIAL_STEP } from '../clade/src/data/roster/laws';
import { SPECIES } from '../clade/src/data/roster/species';
import { START, TOY } from '../clade/src/data/roster/toy';
import { boardHtml, cellCard } from './wide-board';
import { rosterHtml, speciesCard, type RealmFilter } from './wide-roster';
import { callName, dialWords, esc, grams, mutationWords } from './wide-say';

const $ = (id: string) => document.getElementById(id)!;
let seed = 7, board: Board = newBoard(seed), lives = 0, tab: 'board' | 'roster' = 'board', realm: RealmFilter = 'all';
let card: { place: number; job: JobId } | { sp: string } | null = null;

/** A new board for a clade you main: the spec's start for the first line, else the clade's first named species. */
function heirFor(clade: string): Build {
  if (clade === START.clade) return START;
  const named = SPECIES.find((n) => n.build.clade === clade);
  if (named) return named.build;
  return { clade, dials: Object.fromEntries(CLADE[clade].dials.map((d) => [d.id, d.min])), mutations: [] };
}
function reset(clade = board.main) { board = newBoard(seed, heirFor(clade)); lives = 0; card = null; devHtml(); render(); }

function doGoal() {
  const g = nextGoal(board);
  if (g.kind === 'adopt') adopt(board, g.place!, g.job!);
  else if (g.kind === 'wait') for (let i = 0; i < TOY.lifeGens; i++) step(board);
  else if (live(board, g.place!, g.job!)) lives++;
  render();
}

function render() {
  const heir = board.heir, g = nextGoal(board);
  $('goal').textContent = g.text;
  $('heir').innerHTML = `<b class="gold">${esc(callName(heir))}</b> · ${dialWords(heir).map(esc).join(' · ')}${heir.mutations.length ? ` · ${esc(mutationWords(heir))}` : ''}`;
  $('gen').textContent = `Generation ${board.gen} · Lives ${lives}`;
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-tab]')) b.className = b.dataset.tab === tab ? 'on' : '';
  $('main').innerHTML = tab === 'board' ? boardHtml(board) : rosterHtml(realm);
  $('newsBox').hidden = tab !== 'board';
  $('news').innerHTML = board.news.slice(-8).reverse().map((l) => `<div class="line">${esc(l)}</div>`).join('') || '<div class="dim">Nothing yet.</div>';
  const body = !card ? '' : 'sp' in card ? speciesCard(card.sp) : cellCard(board, card.place, card.job);
  $('card').hidden = !body;
  $('cardBody').innerHTML = body;
  for (const d of CLADE[board.main].dials) {
    const s = document.getElementById(`dial-${d.id}`) as HTMLInputElement | null;
    if (s) { s.value = String(heir.dials[d.id] ?? 0); $(`dialv-${d.id}`).textContent = d.id === 'size' ? grams(10 ** +s.value) : s.value; }
  }
}

/** The dev panel: dials of the heir, the line you main, skips, a forced variant, the bars switch, the seed. */
function devHtml() {
  const c = CLADE[board.main];
  $('dials').innerHTML = c.dials.map((d) => `<label>${esc(d.word)} <input type="range" id="dial-${d.id}" data-dial="${d.id}" min="${d.min}" max="${d.max}" step="${DIAL_STEP[d.id]}"> <span id="dialv-${d.id}"></span></label>`).join('');
  ($('main-clade') as HTMLSelectElement).innerHTML = CLADES.filter((x) => x.life).map((x) => `<option value="${x.id}"${x.id === board.main ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
  ($('seed') as HTMLInputElement).value = String(seed);
  ($('nextDoor') as HTMLInputElement).checked = TOY.barsNextDoor;
}

function skip(n: number) { for (let i = 0; i < n; i++) step(board); render(); }
function forceVariant() {
  for (const p of board.places) for (const c of p.cells) if (c.holder?.mine) c.variantBar = TOY.variantBar - 1;
  skip(1);
}

document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('button, [data-cell]');
  if (!t) return;
  const ds = t.dataset, at = (s: string) => { const [p, j] = s.split(':'); return [+p, j as JobId] as const; };
  if (ds.cell) { const [place, job] = at(ds.cell); card = { place, job }; }
  else if (ds.live) { if (live(board, ...at(ds.live))) lives++; }
  else if (ds.adopt) adopt(board, ...at(ds.adopt));
  else if (ds.sp) card = { sp: ds.sp };
  else if (ds.realm) realm = ds.realm as RealmFilter;
  else if (ds.tab) { tab = ds.tab as typeof tab; card = null; }
  else if (t.id === 'goal') return doGoal();
  else if (t.id === 'close') card = null;
  else if (t.id === 'skip12') return skip(12);
  else if (t.id === 'skip120') return skip(120);
  else if (t.id === 'force') return forceVariant();
  else if (t.id === 'reset') return reset();
  else return;
  render();
});
document.addEventListener('input', (e) => {
  const t = e.target as HTMLInputElement, id = t.dataset.dial as DialId | undefined;
  if (!id) return;
  board.heir = { ...board.heir, dials: { ...board.heir.dials, [id]: +t.value } };
  render();
});
$('main-clade').addEventListener('change', (e) => reset((e.target as HTMLSelectElement).value));
$('seed').addEventListener('change', (e) => { seed = Math.max(0, Math.floor(+(e.target as HTMLInputElement).value) || 0); reset(); });
$('nextDoor').addEventListener('change', (e) => { TOY.barsNextDoor = (e.target as HTMLInputElement).checked; render(); });

devHtml();
render();
// For `npm run look`: read the board from an eval step.
(window as unknown as { __wide: unknown }).__wide = { get board() { return board; }, get lives() { return lives; } };
