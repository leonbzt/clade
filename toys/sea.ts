// Toy: the living sea (slice 17). Watch and poke; one question: does the map feel alive? Nothing here goes into the game yet.
import { TIERS } from '../game/src/data/habitats';
import { SEA, SPECIES } from './sea-data';
import { awayLines, headlineText, tell, type Headline } from './sea-news';
import { holder, huntersOf, newSea, preyOf, release, step, type Event, type Sea, type SeaPatch } from './sea-sim';
import { makeMap, type View } from './sea-view';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const map = makeMap($<HTMLCanvasElement>('map'));
const SPEEDS: { id: string; label: string; ms: number }[] = [
  { id: 'pause', label: 'Pause', ms: 0 }, { id: 'real', label: 'Real (3 min)', ms: SEA.genMs }, { id: 'one', label: '1 a second', ms: 1000 }, { id: 'four', label: '4 a second', ms: 250 },
];
const VIEWS: [View, string][] = [['holder', 'Holder'], ['mats', 'Surface'], ['oxygen', 'Oxygen'], ['hunters', 'Hunters']];
const ROLES = [['grazer', 'Grazer'], ['burrower', 'Burrower'], ['predator', 'Hunter']] as const;
const GROUND_NAME = { sand: 'Sand', mud: 'Mud', rock: 'Rock' };
const pulseColour = { crash: [20, 8, 8], boom: [255, 255, 220], spread: [255, 224, 51] } as const;

let seed = 1, sea: Sea, lines: Headline[] = [], picked = -1, speed = 'one', last = 0, cost = 0, away: { lines: string[]; ms: number } | null = null;
let role: (typeof ROLES)[number][0] = 'grazer', tier = 'A', viewNow: View = 'holder';

function buttons(host: HTMLElement, items: { id: string; label: string }[], on: () => string, pick: (id: string) => void) {
  host.replaceChildren(...items.map(({ id, label }) => {
    const b = document.createElement('button');
    b.textContent = label; b.className = on() === id ? 'on' : '';
    b.onclick = () => { pick(id); buttons(host, items, on, pick); };
    return b;
  }));
}

function advance(): Event[] {
  const t = performance.now(), events = step(sea);
  cost = cost ? cost * 0.9 + (performance.now() - t) * 0.1 : performance.now() - t;
  return events;
}
function oneGeneration() {
  const events = advance();
  tell(sea, lines, events);
  for (const e of events) if (e.kind !== 'boom' || e.to >= SEA.tellBoom) map.pulse(e.patch, [...pulseColour[e.kind]]);
  map.updateHerds();
  render();
}
function skip() {
  const t = performance.now(), found: Headline[] = [];
  for (let g = 0; g < SEA.skip; g++) tell(sea, found, advance());
  lines = [...found, ...lines].slice(0, SEA.keepLines);
  away = { lines: awayLines(found).map((h) => headlineText(sea, h)), ms: performance.now() - t };
  map.updateHerds();
  render();
}

function barRow(name: string, food: string, value: number, normal: number, colour: string) {
  return `<span>${name}</span><div class="bar"><i style="background:${colour};width:${Math.round(Math.min(1, value) * 100)}%"></i><u style="left:${Math.round(Math.min(1, normal) * 100)}%"></u></div><small>${food}</small>`;
}
function renderCard() {
  const host = $('card');
  if (picked < 0) { host.innerHTML = '<p class="dim">Tap a patch to see its bars and release your line.</p>'; return; }
  const p = sea.patches[picked], prey = preyOf(p), scale = 2 * p.normal.prey || 1;
  const eaten = SPECIES.map((s, k) => ({ s, n: p.pop[k] })).filter((x) => x.s.role !== 'predator' && x.n >= 1).sort((a, b) => b.n - a.n).slice(0, 2).map((x) => x.s.name).join(', ') || 'nothing now';
  const rows = SPECIES.map((s, k) => ({ s, n: p.pop[k], fit: p.fit[k] })).filter((x) => x.n >= 1).sort((a, b) => b.n - a.n)
    .map((x) => `<div class="sp"><i style="background:rgb(${x.s.colour.join(',')})"></i><span>${x.s.name}</span><em>${Math.round(x.n)}</em></div>`).join('');
  host.innerHTML = `<h2>${GROUND_NAME[p.ground]} patch ${p.id}</h2>
    <div class="bars">${barRow('Surface', 'grazers eat mats', p.mats / 100, p.normal.mats / 100, '#7fd14e')}${barRow('Buried', 'burrowers eat buried food', p.rot / 100, p.normal.rot / 100, '#c9a26a')}${barRow('Prey', `hunters eat ${eaten}`, prey / scale, p.normal.prey / scale, '#f3e9cc')}${barRow('Oxygen', 'everyone breathes it', p.oxygen / 100, p.normal.oxygen / 100, '#5ec4d6')}</div>
    <canvas id="hist" width="300" height="72"></canvas>
    <div class="legend"><span style="color:#7fd14e">surface</span> <span style="color:#c9a26a">buried</span> <span style="color:#fff">prey</span> <span style="color:#5ec4d6">oxygen</span></div>
    ${rows || '<p class="dim">Nothing lives here now.</p>'}
    <div class="poke"><b>Release ${SEA.released} of your line</b><div class="grp" id="roles"></div><div class="grp" id="tiers"></div><button id="drop">Release here</button></div>`;
  buttons($('roles'), ROLES.map(([id, label]) => ({ id, label })), () => role, (id) => { role = id as typeof role; });
  buttons($('tiers'), TIERS.slice(0, 5).map(([id]) => ({ id, label: id })), () => tier, (id) => { tier = id; });
  $('drop').onclick = () => {
    const score = TIERS.find(([id]) => id === tier)![1] + 2;
    release(sea, picked, role, score);
    map.pulse(picked, [255, 90, 220]);
    map.updateHerds();
    render();
  };
  drawHistory(p);
}
function drawHistory(p: SeaPatch) {
  const cv = $<HTMLCanvasElement>('hist'), g = cv.getContext('2d')!, n = SEA.history, H = cv.height, W = cv.width;
  g.fillStyle = '#0a0d10'; g.fillRect(0, 0, W, H);
  const COLS = ['#7fd14e', '#c9a26a', '#ffffff', '#5ec4d6'], scale = [100, 100, Math.max(40, p.normal.prey * 2.5), 100];
  for (let c = 0; c < 4; c++) {
    g.strokeStyle = COLS[c]; g.lineWidth = 1; g.beginPath();
    for (let k = 0; k < Math.min(n, sea.gen + 1); k++) {
      const row = ((sea.gen - k) % n) * 4, v = p.hist[row + c], x = W - 1 - (k / (n - 1)) * (W - 2), y = H - 2 - Math.min(1, v / scale[c]) * (H - 4);
      if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
}
function renderNews() {
  $('news').replaceChildren(...lines.slice(0, 24).map((h) => {
    const d = document.createElement('div');
    d.className = `line ${h.kind}${SPECIES[h.sp].line ? ' mine' : ''}`;
    d.innerHTML = `<small>${h.gen}</small> ${headlineText(sea, h)}`;
    d.onclick = () => map.mark(h.patches);
    return d;
  }));
}
function renderKey() {
  const held = new Map<number, number>();
  for (const p of sea.patches) { const h = holder(p); if (h >= 0) held.set(h, (held.get(h) ?? 0) + 1); }
  let hunters = 0;
  for (const p of sea.patches) hunters += huntersOf(p);
  $('key').innerHTML = SPECIES.map((s, k) => ({ s, n: held.get(k) ?? 0 })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n)
    .map((x) => `<span><i style="background:rgb(${x.s.colour.join(',')})"></i>${x.s.name} ${x.n}</span>`).join('') + `<span class="dim">hunters ${Math.round(hunters)}</span>`;
}
function render() {
  $('gen').textContent = String(sea.gen);
  $('cost').textContent = `a generation costs ${cost.toFixed(2)} ms`;
  const a = $('away');
  a.hidden = !away;
  if (away) a.innerHTML = `<b>While you were away</b> <small>${SEA.skip} generations in ${Math.round(away.ms)} ms</small>${away.lines.map((l) => `<div>${l}</div>`).join('')}`;
  renderKey(); renderCard(); renderNews();
}
function newWorld() {
  sea = newSea(seed); lines = []; picked = -1; away = null; cost = 0; map.mark([]);
  map.setSea(sea); $('seed').textContent = String(seed);
  render();
}

$('map').addEventListener('click', (e) => {
  picked = map.patchAt(e.clientX, e.clientY);
  map.mark(picked >= 0 ? [picked] : []);
  render();
});
buttons($('speed'), SPEEDS, () => speed, (id) => { speed = id; last = performance.now(); });
buttons($('views'), VIEWS.map(([id, label]) => ({ id, label })), () => viewNow, (id) => { viewNow = id as View; map.setView(viewNow); });
$('skip').onclick = skip;
$('newSea').onclick = () => { seed++; newWorld(); };
function frame(now: number) {
  const s = SPEEDS.find((x) => x.id === speed)!;
  if (s.ms && now - last >= s.ms) { last = now; oneGeneration(); }
  map.draw();
  requestAnimationFrame(frame);
}
newWorld();
requestAnimationFrame(frame);
