// Toy A (slice 04): grow by turns, the page. Click a sky cell to place the chosen part, soil for a root.
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import { COLS, PARTS, PLOTS, ROWS, SKY, SKY_PARTS, TURNS, type PartId } from './turns-data';
import { endTurn, forecast, isSky, leafGain, lightAt, newGame, place, score, signs, undo, whyNot, xy, type Game } from './turns-sim';
import { C, SCALE, draw } from './turns-view';

const $ = (id: string) => document.getElementById(id)!;
const cv = $('board') as HTMLCanvasElement, g2 = cv.getContext('2d')!;
cv.width = COLS * C; cv.height = ROWS * C;
cv.style.width = `${COLS * C * SCALE}px`;

let plot = 0, gm: Game = newGame(PLOTS[plot], Date.now() % 1e9), tool: PartId = 'leaf', hover = -1;

function start(seed: number) { gm = newGame(PLOTS[plot], seed); render(); }

// ---- header: the plots ----
PLOTS.forEach((p, k) => {
  const b = document.createElement('button');
  b.textContent = p.name;
  b.onclick = () => { plot = k; start(Date.now() % 1e9); };
  $('plots').append(b);
});
$('again').onclick = () => start(gm.seed);
$('fresh').onclick = () => start(Date.now() % 1e9);
$('undo').onclick = () => { undo(gm); render(); };
$('end').onclick = () => { endTurn(gm); render(); };

// ---- the tools ----
const tools = [...SKY_PARTS, 'root' as PartId].map((id) => {
  const b = document.createElement('button'), c = PARTS[id].cost;
  const cost = [c.e && `${c.e} energy`, c.n && `${c.n} nutrient`].filter(Boolean).join(', ');
  b.innerHTML = `<span>${PARTS[id].name} <kbd>${PARTS[id].key}</kbd></span><small>${cost}</small>`;
  b.title = PARTS[id].help;
  b.onclick = () => { if (id !== 'root') tool = id; render(); };
  $('tools').append(b);
  return { id, b };
});

function stocks() {
  const f = forecast(gm), sign = (v: number) => (v > 0 ? `+${v}` : `${v}`), cls = (v: number) => (v > 0 ? 'up' : v < 0 ? 'down' : 'muted');
  const water = f.rain + f.rootsW - f.drink;
  $('stocks').innerHTML = gm.over ? '' : `
    <span class="e sh1">Energy</span><b class="e sh1">${gm.e}</b><span class="${cls(f.energy)}">${sign(f.energy)} from leaves</span>
    <span class="w sh1">Water</span><b class="w sh1">${gm.w}</b><span class="${cls(water)}">+${f.rain} rain +${f.rootsW} roots −${f.drink} leaves</span>
    <span class="n sh1">Nutrient</span><b class="n sh1">${gm.n}</b><span class="${cls(f.nutrient)}">${sign(f.nutrient)} from roots</span>`;
  $('wilt').textContent = !gm.over && f.wilt ? `At the end of this turn ${f.wilt} ${f.wilt > 1 ? 'leaves' : 'leaf'} will wilt (water short).` : '';
}

function track() {
  $('turn').textContent = gm.over ? 'The round is over' : `Turn ${gm.turn} of ${TURNS}`;
  $('plotname').textContent = gm.plot.name;
  $('track').innerHTML = Array.from({ length: TURNS }, (_, k) => {
    const t = k + 1, cls = [t < gm.turn || gm.over ? 'done' : t === gm.turn ? 'now' : '', t === gm.drought ? 'dry' : ''].join(' ');
    return `<i class="${cls}">${t === gm.drought ? '!' : ''}</i>`;
  }).join('');
  const left = gm.drought - gm.turn;
  $('drought').innerHTML = gm.over ? gm.plot.blurb
    : left > 0 ? `<span class="n">Drought on turn ${gm.drought}</span> (in ${left}): no rain, roots draw 1, leaves drink 2.`
    : left === 0 ? `<span class="down">Drought this turn:</span> no rain, roots draw 1, leaves drink 2.` : gm.plot.blurb;
}

function scoreBox() {
  const s = score(gm);
  $('scorehead').textContent = gm.over ? 'Final score' : 'Score so far';
  $('score').innerHTML = `<b class="sh1" style="font-size: 22px">${s.total}</b> <span class="muted">= ${s.flowers} flower${s.flowers === 1 ? '' : 's'} × 10 + ${s.grams} g · ${s.pct}% of ${gm.plot.target}</span>` +
    (gm.over ? `<div class="muted">${gm.wilted} leaves wilted this round.</div>` : '');
  const t = $('tier'); t.textContent = s.tier; t.dataset.t = s.tier;
  $('scorebox').classList.toggle('gold', gm.over);
}

function hoverText() {
  if (hover < 0) { $('hover').textContent = ''; return; }
  const [x, y] = xy(hover), out: string[] = [];
  if (isSky(hover)) {
    out.push(`Light ${lightAt(gm, hover)} of 2 (height ${SKY - y}).`);
    if (gm.native[hover] >= 0) out.push('A native.');
    else if (!gm.part[hover]) {
      const bad = whyNot(gm, tool, hover);
      if (tool === 'leaf' && !bad) { const d = leafGain(gm, hover); out.push(`A leaf here: ${d >= 0 ? '+' : ''}${d} energy a turn, all shade counted.`); }
      else out.push(bad ? `${PARTS[tool].name}: ${bad}.` : `${PARTS[tool].name} here.`);
    }
  } else if (!gm.seen[hover]) out.push('Hidden soil.');
  else {
    const s = gm.soil[hover];
    if (s === 'damp') out.push(`Damp pocket: ${gm.amt[hover]} water left.`);
    else if (s === 'rich') out.push(`Rich pocket: ${gm.amt[hover]} nutrient left.`);
    else if (s === 'stone') out.push('Stone.');
    else { const sg = signs(gm, hover); out.push(`Loam. Hidden around it: ${sg.damp} damp, ${sg.rich} rich.`); }
    if (gm.native[hover] >= 0) out.push('A native root drinks here.');
    else if (!gm.part[hover]) { const bad = whyNot(gm, 'root', hover); out.push(bad ? `Root: ${bad}.` : 'Root here (1 energy).'); }
  }
  $('hover').textContent = `(${x}, ${y}) ` + out.join(' ');
}

function render() {
  draw(g2, gm, hover, tool);
  for (const t of tools) { t.b.classList.toggle('on', t.id === tool); t.b.disabled = gm.over; }
  ($('end') as HTMLButtonElement).disabled = gm.over;
  ($('undo') as HTMLButtonElement).disabled = gm.over || !gm.undo.length;
  ($('end') as HTMLButtonElement).innerHTML = gm.turn === TURNS ? 'End the round <kbd>Space</kbd>' : 'End turn <kbd>Space</kbd>';
  document.querySelectorAll<HTMLButtonElement>('#plots button').forEach((b, k) => b.classList.toggle('on', k === plot));
  stocks(); track(); scoreBox(); hoverText();
  $('log').textContent = gm.log.join(' ');
}

// ---- input ----
const cellAt = (e: MouseEvent) => {
  const b = cv.getBoundingClientRect(), x = Math.floor(((e.clientX - b.left) / b.width) * COLS), y = Math.floor(((e.clientY - b.top) / b.height) * ROWS);
  return x >= 0 && x < COLS && y >= 0 && y < ROWS ? y * COLS + x : -1;
};
cv.onmousemove = (e) => { const h = cellAt(e); if (h !== hover) { hover = h; render(); } };
cv.onmouseleave = () => { hover = -1; render(); };
cv.onclick = (e) => {
  const i = cellAt(e);
  if (i < 0) return;
  place(gm, isSky(i) ? tool : 'root', i);
  render();
};
window.onkeydown = (e) => {
  const t = SKY_PARTS.find((id) => PARTS[id].key === e.key);
  if (t) tool = t;
  else if (e.key === 'z' || e.key === 'Z') undo(gm);
  else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); endTurn(gm); }
  else if (e.key === 'n' || e.key === 'N') { start(Date.now() % 1e9); return; }
  else return;
  render();
};
render();
