// Toy: the living garden, the page. It only wires things together: the model (garden-sim), the door (garden-board), the Life screen (life2-ui).
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import { boardChange, boardFacts, boardFor, resultOf } from './garden-board';
import { MODEL, NATIVES, ROLES, ROLE_IDS, STOCKS } from './garden-data';
import { newGarden, release, rowOf, step, type Garden, type Variant } from './garden-sim';
import { STRIP_W, makeStrip, stripAt } from './garden-view';
import { PARTS, PLANS, RULE } from './life2-data';
import { HABITATS, HAB_ORDER, type Habitat, type HabitatId } from './life2-habitats';
import { finish, foraging, newLife, newLineage, tierOf, type Lineage } from './life2-sim';
import { mountLife } from './life2-ui';

const $ = (id: string) => document.getElementById(id)!;
const KEY = 'clade-garden-toy';
interface Save { g: Garden; lineage: Lineage; lastSeen: number; seen: Partial<Record<HabitatId, Habitat>> }
function load(): Save {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (s?.g?.normal) return s;
  } catch { /* a fresh garden */ }
  return { g: newGarden(Date.now() % 1e9), lineage: newLineage(), lastSeen: Date.now(), seen: {} };
}
let s = load(), habId: HabitatId = 'reef', hover = -1, away = 0;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* the toy still plays */ } };

const strip = makeStrip($('strip') as HTMLCanvasElement);
const stripBoards = () => HAB_ORDER.map((id) => newLife(1, 'worm', s.lineage, boardFor(s.g, id)));

const life = mountLife($('lifeView'), {
  board: () => boardFor(s.g, habId),
  lineage: () => s.lineage,
  over: (l) => {
    s.lineage = finish(l);
    release(s.g, resultOf(l));
    for (let k = 0; k < MODEL.afterLife; k++) step(s.g, s.lineage.rare);
    save();
  },
  leave: () => show(),
});

function enter(id: HabitatId, v?: Variant) {
  habId = id;
  s.seen[id] = boardFor(s.g, id);
  if (v) s.g.variants = s.g.variants.filter((x) => x !== v);
  save();
  $('gardenView').hidden = true; $('toGarden').hidden = false;
  life.open(v ? { plan: v.plan, gift: v.part } : {});
}
function show() { life.close(); $('gardenView').hidden = false; $('toGarden').hidden = true; catchUp(); render(); }

/** Generations pass by the clock, also while you're away, up to a cap. */
function catchUp() {
  const due = Math.floor((Date.now() - s.lastSeen) / MODEL.genMs);
  if (due <= 0) return false;
  const n = Math.min(due, MODEL.awayCap);
  for (let k = 0; k < n; k++) step(s.g, s.lineage.rare);
  s.lastSeen = due > MODEL.awayCap ? Date.now() : s.lastSeen + due * MODEL.genMs;
  if (n > 1) away = n;
  save();
  return true;
}
function skip(n: number) { for (let k = 0; k < n; k++) step(s.g, s.lineage.rare); s.lastSeen = Date.now(); away = 0; save(); render(); }

function bar(name: string, value: number, normal: number, cls: string) {
  return `<span>${name}</span><div class="bar"><i class="${cls}" style="width: ${Math.round(value)}%"></i><span class="norm" style="left: ${Math.round(normal)}%" title="normal here"></span></div>`;
}
function render() {
  const g = s.g;
  strip.update(g, stripBoards(), hover);
  $('gen').textContent = String(g.gen);
  const fl = foraging(s.lineage.xp);
  $('line').innerHTML = `Foraging ${fl}${fl < 2 ? ` (${s.lineage.xp}/${RULE.foragingAt})` : ''} · ${s.lineage.lives} Lives · Passed on: ${s.lineage.rare.length ? s.lineage.rare.map((p) => `<span class="passed">${PARTS[p].name}</span>`).join(', ') : 'nothing yet'}`;
  const habs = $('habs');
  habs.innerHTML = '';
  HAB_ORDER.forEach((id, k) => {
    const base = HABITATS[id], h = g.habs[id], n = g.normal[id], board = boardFor(g, id), f = boardFacts(board), last = s.seen[id];
    const el = document.createElement('div');
    el.className = 'frame hab';
    const roles = ROLE_IDS.map((role) => {
      const row = rowOf(h, role);
      if (!row.length) return `<div class="role"><span class="name">${ROLES[role].plural}</span><span class="muted">open slot</span></div>`;
      return `<div class="role"><span class="name">${ROLES[role].plural}</span>${row.map((e) => {
        const t = tierOf(base, e.score), real = NATIVES.find((x) => x.id === e.sp)?.real ?? 'Your descendants.';
        return `<span class="res${e.line ? ' mine' : ''}" title="${real} Score ${Math.round(e.score)} eggs."><span class="mini" data-t="${t}">${t}</span>${e.name.replace('Your ', 'your ')} ${Math.round(e.pop)}${e.proven ? '' : ' (unproven)'}</span>`;
      }).join('')}</div>`;
    }).join('');
    const many = (n: number, one: string, more: string) => (n ? `${n} ${n === 1 ? one : more}` : '');
    const next = [many(f.mats, 'mat', 'mats'), f.buried ? `${f.buried} buried` : '', many(f.shells, 'shell bed', 'shell beds'), many(f.sponges, 'sponge', 'sponges'), many(f.carcasses, 'carcass', 'carcasses'), f.predator ? `${f.predator.name} on turn ${f.predator.turn}` : 'no predator', f.rivals ? `rivals: ${[...new Set(board.rivals.map((v) => v.name))].join(', ')}` : ''].filter(Boolean).join(' · ');
    const change = last ? boardChange(last, board) : '';
    const inner = `<div><div><h2 class="sh1">${base.name}</h2>
      <div class="bars">${STOCKS.map((st) => bar(st[0].toUpperCase() + st.slice(1), h[st], n[st], '')).join('')}</div>
      ${roles}
      <div class="next"><span class="muted">Next board:</span> ${next}</div>
      <div class="changed">${last ? (change ? `Since you last lived here: ${change}` : 'Much the same as when you last lived here.') : '<span class="muted">You haven\'t lived here yet.</span>'}</div>
      <div class="variants"></div>
      <button class="big live">Live here</button></div></div>`;
    el.innerHTML = inner;
    const vs = el.querySelector('.variants')!;
    g.variants.filter((v) => v.hab === id).forEach((v) => {
      const b = document.createElement('button');
      b.className = 'variant';
      b.textContent = `Go live it: ${PLANS[v.plan].name} with ${PARTS[v.part].name}`;
      b.title = PARTS[v.part].does;
      b.onclick = () => enter(id, v);
      vs.append(b);
    });
    (el.querySelector('.live') as HTMLButtonElement).onclick = () => enter(id);
    el.onmouseenter = () => { if (hover !== k) { hover = k; strip.update(g, stripBoards(), k); } };
    habs.append(el);
  });
  $('newsTitle').textContent = away ? `While you were away: ${away} generations` : 'News';
  $('news').innerHTML = g.news.slice(0, 14).map((m) => `<div class="${m.yours ? 'mine' : ''}"><span class="gen">g${m.gen}</span>${m.text}: <span class="why">${m.why}.</span></div>`).join('') || '<span class="muted">Nothing yet. Pick a habitat and live there, or skip a generation.</span>';
}

function tickClock() {
  const left = Math.max(0, MODEL.genMs - (Date.now() - s.lastSeen)), sec = Math.ceil(left / 1000);
  $('clock').textContent = `next in ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

const stripCv = $('strip') as HTMLCanvasElement;
const pos = (e: MouseEvent) => { const b = stripCv.getBoundingClientRect(); return ((e.clientX - b.left) / b.width) * STRIP_W; };
stripCv.onmousemove = (e) => { const k = stripAt(pos(e)); if (k !== hover) { hover = k; strip.update(s.g, stripBoards(), k); } };
stripCv.onclick = (e) => { const k = stripAt(pos(e)); if (k >= 0) enter(HAB_ORDER[k]); };
$('toGarden').onclick = show;
$('skip1').onclick = () => skip(1);
$('skip5').onclick = () => skip(5);
$('reset').onclick = () => { s = { g: newGarden(Date.now() % 1e9), lineage: newLineage(), lastSeen: Date.now(), seen: {} }; away = 0; save(); render(); };

show();
save(); // from the first look on: come back later and it's the same garden, further along
setInterval(() => { if ($('gardenView').hidden) return; if (catchUp()) render(); tickClock(); }, 1000);
tickClock();
let lastFrame = 0;
const frame = (t: number) => { if (t - lastFrame > 66 && !$('gardenView').hidden) { lastFrame = t; strip.draw(); } requestAnimationFrame(frame); };
requestAnimationFrame(frame);
