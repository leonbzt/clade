// Toy C (slice 04): the body builder, the page. Pick an offer, hover the body to place it, R rotates.
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import { STATS, STAT_NAMES } from '../src/data/genes';
import { BH, BW, ENCOUNTERS, GROUND, PICKS, PIECES, type Flow } from './body-data';
import { BUILD_NICHES, measure, newBody, place, preview, reroll, rotate, skip, undo, whyNot, type Body, type Measure } from './body-sim';
import { C, SCALE, draw, mini } from './body-view';

const $ = (id: string) => document.getElementById(id)!;
const cv = $('board') as HTMLCanvasElement, g2 = cv.getContext('2d')!;
cv.width = BW * C; cv.height = BH * C;
cv.style.width = `${BW * C * SCALE}px`;

let niche = BUILD_NICHES[0].key, b: Body = newBody(niche, Date.now() % 1e9), hover: [number, number] | null = null;
const start = (seed: number) => { b = newBody(niche, seed); hover = null; render(); };

BUILD_NICHES.forEach((n) => {
  const el = document.createElement('button');
  el.textContent = n.name; el.dataset.k = n.key;
  el.onclick = () => { niche = n.key; start(Date.now() % 1e9); };
  $('niches').append(el);
});
$('again').onclick = () => start(b.seed);
$('fresh').onclick = () => start(Date.now() % 1e9);
$('skip').onclick = () => { skip(b); render(); };
$('reroll').onclick = () => { reroll(b); render(); };
$('undo').onclick = () => { undo(b); render(); };

const flowText = (f: Flow) => [f.e && `${f.e > 0 ? '+' : ''}${f.e} energy`, f.w && `${f.w > 0 ? '+' : ''}${f.w} water`, f.n && `${f.n > 0 ? '+' : ''}${f.n} nutrient`].filter(Boolean).join(', ') || 'free';

function offers() {
  const box = $('offers');
  box.innerHTML = '';
  b.offers.forEach((o, k) => {
    const card = document.createElement('div'), mc = document.createElement('canvas');
    card.className = 'offer' + (k === b.held ? ' on' : '');
    card.innerHTML = `<b class="sh1">${PIECES[o.id].name} <kbd>${k + 1}</kbd></b><small>${flowText(PIECES[o.id].flow)}${o.shape.length > 1 ? ' per cell' : ''}</small>`;
    card.title = PIECES[o.id].help;
    mini(mc, o);
    card.append(mc);
    card.onclick = () => { b.held = k; render(); };
    box.append(card);
  });
  ($('skip') as HTMLButtonElement).disabled = b.over;
  ($('reroll') as HTMLButtonElement).disabled = b.over || b.rerolls <= 0;
  $('reroll').textContent = `Reroll (${b.rerolls})`;
  ($('undo') as HTMLButtonElement).disabled = !b.history.length;
  $('draftbox').style.display = b.over ? 'none' : '';
}

function readout(m: Measure, p: Measure | null) {
  const v = (a: number, nb: number | undefined) => (nb === undefined || nb === a ? `${a}` : `${a} → ${nb}`);
  const cls = (a: number) => (a < 0 ? 'down' : 'up');
  const f = m.flow, q = p?.flow;
  $('flows').innerHTML = (['e', 'w', 'n'] as const).map((k) => {
    const name = { e: 'Energy', w: 'Water', n: 'Nutrient' }[k];
    return `<span class="${k} sh1">${name}</span><b class="${cls(q ? q[k] : f[k])} sh1">${v(f[k], q?.[k])}</b><span class="muted">a season</span>`;
  }).join('');
  const sh = (p ?? m).short;
  $('short').textContent = sh ? `Short by ${sh}: the body wilts, score ×${Math.round((p ?? m).wilt * 100) / 100}.` : '';
  $('stats').innerHTML = STATS.map((s, k) => {
    const w = b.niche.w[s] ?? 0, a = m.sn[k], nb = p?.sn[k];
    const wt = w ? `${w > 0 ? '+' : '−'}${Math.abs(w).toFixed(2)}` : '';
    return `<span>${STAT_NAMES[s]}</span><div class="bar${w < 0 ? ' neg' : ''}"><i style="width:${Math.round((nb ?? a) * 100)}%"></i></div><span class="wt">${wt}</span>`;
  }).join('');
}

function result(m: Measure) {
  let html: string, tier = m.tier;
  if (b.over) {
    const after = measure(b.cells, b.niche, b.encounter), enc = ENCOUNTERS[b.encounter];
    tier = after.tier;
    const lost = after.eaten.size ? ` ${after.eaten.size} ${after.eaten.size > 1 ? 'leaves' : 'leaf'} eaten.` : '';
    html = `<div class="label sh1">Released</div>Before ${enc.name.toLowerCase()}: ${m.score} (${m.tier})<br>` +
      `<b class="sh1" style="font-size: 20px">After: ${after.score}</b> <span class="muted">fit ${after.fit} × wilt ${Math.round(after.wilt * 100) / 100}.${lost}</span>` +
      (after.seeds ? '' : '<div class="down">No flower: no seeds.</div>');
    $('enctext').textContent = enc.text;
    draw(g2, b, after, null);
  } else {
    html = `<div class="label sh1">If released now</div><b class="sh1" style="font-size: 20px">${m.score}</b> <span class="muted">fit ${m.fit} × wilt ${Math.round(m.wilt * 100) / 100}</span>` +
      (m.seeds ? '' : '<div class="down">No flower yet: no seeds (tier F).</div>');
  }
  $('result').innerHTML = html;
  const t = $('tier'); t.textContent = tier; t.dataset.t = tier;
  $('scorebox').classList.toggle('gold', b.over);
}

function render() {
  const m = measure(b.cells, b.niche), cells = hover && preview(b, hover[0], hover[1]), p = cells ? measure(cells, b.niche) : null;
  draw(g2, b, m, hover);
  document.querySelectorAll<HTMLButtonElement>('#niches button').forEach((el) => el.classList.toggle('on', el.dataset.k === niche));
  $('pick').textContent = b.over ? 'All picks done' : `Pick ${b.picks + 1} of ${PICKS}`;
  $('nichename').textContent = b.niche.hint;
  $('ground').textContent = GROUND[b.niche.key].note;
  $('encname').textContent = `At the end: ${ENCOUNTERS[b.encounter].name.toLowerCase()}.`;
  $('enctext').textContent = ENCOUNTERS[b.encounter].text;
  offers(); readout(m, p); result(m);
  const o = b.offers[b.held];
  $('hover').textContent = b.over ? 'Released. New board (N) for another.'
    : !o ? 'Pick an offer (1–3), then hover the body to place it.'
    : hover ? (whyNot(b, o, hover[0], hover[1]) ?? (p ? `Placing it: score ${m.score} → ${p.score} (${p.tier}).` : '')) : `${PIECES[o.id].name}: ${PIECES[o.id].help}.`;
}

const cellAt = (e: MouseEvent): [number, number] | null => {
  const r = cv.getBoundingClientRect(), x = Math.floor(((e.clientX - r.left) / r.width) * BW), y = Math.floor(((e.clientY - r.top) / r.height) * BH);
  return x >= 0 && x < BW && y >= 0 && y < BH ? [x, y] : null;
};
const turn = () => { const o = b.offers[b.held]; if (o) { o.shape = rotate(o.shape); render(); } };
cv.onmousemove = (e) => { const h = cellAt(e); if (h?.[0] !== hover?.[0] || h?.[1] !== hover?.[1]) { hover = h; render(); } };
cv.onmouseleave = () => { hover = null; render(); };
cv.onclick = (e) => { const h = cellAt(e); if (h && place(b, h[0], h[1])) render(); };
cv.oncontextmenu = (e) => { e.preventDefault(); turn(); };
window.onkeydown = (e) => {
  if (e.key === 'r' || e.key === 'R') turn();
  else if (['1', '2', '3'].includes(e.key) && b.offers[+e.key - 1]) { b.held = +e.key - 1; render(); }
  else if (e.key === 'z' || e.key === 'Z') { undo(b); render(); }
  else if (e.key === 'n' || e.key === 'N') start(Date.now() % 1e9);
};
render();
