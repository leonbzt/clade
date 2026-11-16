// Toy: the wide toy (W1 part E). A thin page over clade/src/model: the board rules decide, this draws and taps.
// One question: is a derived web of real species a board I want to climb and look through?
import { adopt, live, newBoard, nextGoal, nextLine, rivalOf, setMain, step, type Board } from '../clade/src/model/board';
import type { Build, JobId } from '../clade/src/model/types';
import { CLADE, CLADES } from '../clade/src/data/roster/clades';
import { NAMED, SPECIES } from '../clade/src/data/roster/species';
import { START, TOY } from '../clade/src/data/roster/toy';
import { boardHtml, cellCard } from './wide-board';
import { rosterHtml, speciesCard, type RealmFilter } from './wide-roster';
import { esc } from './wide-say';

const $ = (id: string) => document.getElementById(id)!;
let seed = 7, board: Board = newBoard(seed), lives = 0, tab: 'board' | 'roster' = 'board', realm: RealmFilter = 'all';
let card: { place: number; job: JobId } | { sp: string } | null = null;
let firstLine = START.clade;

/** A new board for a clade you main: the spec's start for the first line, else the clade's first named species. */
function startFor(clade: string): Build {
  if (clade === START.clade) return START;
  const named = SPECIES.find((n) => n.build.clade === clade);
  if (named) return named.build;
  return { clade, dials: Object.fromEntries(CLADE[clade].dials.map((d) => [d.id, d.min])), mutations: [] };
}
function reset(clade = firstLine) { firstLine = clade; board = newBoard(seed, startFor(clade)); lives = 0; card = null; devHtml(); render(); }

function doGoal() {
  const g = nextGoal(board);
  if (g.kind === 'line') setMain(board, g.line!);
  // Hold's sentence names the tap the model chose; the page does not choose a defence itself.
  else if (g.kind === 'adopt' || (g.kind === 'hold' && g.text.includes('; adopt the variant'))) adopt(board, g.place!, g.job!);
  else if (g.kind === 'wait') for (let i = 0; i < TOY.lifeGens; i++) step(board);
  else if (live(board, g.place!, g.job!)) lives++;
  render();
}

function render() {
  const g = nextGoal(board), next = nextLine(board);
  $('goal').textContent = g.text;
  $('lines').innerHTML = board.lines.map((id) => `<button data-main="${esc(id)}" class="${id === board.main ? 'on' : ''}" aria-pressed="${id === board.main}">${esc(CLADE[id].name)}</button>`).join('');
  $('nextLine').textContent = next ? `${CLADE[next.clade].name} at ${next.cards} cards` : 'All toy lines open';
  $('cards').innerHTML = board.cards.map((id) => `<button data-sp="${esc(id)}" class="gold">✓ ${esc(NAMED[id].common)}</button>`).join('') || '<span class="dim">No cards yet</span>';
  $('gen').textContent = `Generation ${board.gen} · Lives ${lives}`;
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-tab]')) b.className = b.dataset.tab === tab ? 'on' : '';
  $('main').innerHTML = tab === 'board' ? boardHtml(board) : rosterHtml(realm);
  $('newsBox').hidden = tab !== 'board';
  $('news').innerHTML = board.news.slice(-8).reverse().map((l) => `<div class="line">${esc(l)}</div>`).join('') || '<div class="dim">Nothing yet.</div>';
  const body = !card ? '' : 'sp' in card ? speciesCard(card.sp) : cellCard(board, card.place, card.job);
  $('card').hidden = !body;
  $('cardBody').innerHTML = body;
}

/** Dev controls change the starting board or advance the model's existing bars. */
function devHtml() {
  ($('main-clade') as HTMLSelectElement).innerHTML = CLADES.filter((x) => x.life).map((x) => `<option value="${x.id}"${x.id === firstLine ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
  ($('seed') as HTMLInputElement).value = String(seed);
  ($('nextDoor') as HTMLInputElement).checked = TOY.barsNextDoor;
}

function skip(n: number) { for (let i = 0; i < n; i++) step(board); render(); }
function forceVariant() {
  for (const p of board.places) for (const c of p.cells) if (c.holder?.mine) c.variantBar = TOY.variantBar - 1;
  skip(1);
}
function forceRivals() {
  for (const p of board.places) for (const c of p.cells) {
    const who = rivalOf(board, p.id, c.job);
    if (who) c.rival = { id: who.named.id, bar: TOY.rivalBar - 1 };
  }
  render();
}

document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('button, [data-cell]');
  if (!t) return;
  const ds = t.dataset, at = (s: string) => { const [p, j] = s.split(':'); return [+p, j as JobId] as const; };
  if (ds.cell) { const [place, job] = at(ds.cell); card = { place, job }; }
  else if (ds.live) { if (live(board, ...at(ds.live))) lives++; }
  else if (ds.adopt) adopt(board, ...at(ds.adopt));
  else if (ds.main) setMain(board, ds.main);
  else if (ds.sp) card = { sp: ds.sp };
  else if (ds.realm) realm = ds.realm as RealmFilter;
  else if (ds.tab) { tab = ds.tab as typeof tab; card = null; }
  else if (t.id === 'goal') return doGoal();
  else if (t.id === 'close') card = null;
  else if (t.id === 'skip12') return skip(12);
  else if (t.id === 'skip120') return skip(120);
  else if (t.id === 'force') return forceVariant();
  else if (t.id === 'force-rivals') return forceRivals();
  else if (t.id === 'reset') return reset();
  else return;
  render();
});
$('main-clade').addEventListener('change', (e) => reset((e.target as HTMLSelectElement).value));
$('seed').addEventListener('change', (e) => { seed = Math.max(0, Math.floor(+(e.target as HTMLInputElement).value) || 0); reset(); });
$('nextDoor').addEventListener('change', (e) => { TOY.barsNextDoor = (e.target as HTMLInputElement).checked; render(); });

devHtml();
render();
// For `npm run look`: read the board from an eval step.
(window as unknown as { __wide: unknown }).__wide = { get board() { return board; }, get lives() { return lives; } };
