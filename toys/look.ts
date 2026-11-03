// The look toy (slice 02): one scene in two looks, the toggles, and the UI panel in the references' style.
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import {
  ATTRS, CORNER, PALETTES, PLANTS, SPECIES, around, buildPlant, flatten, isPocket, isleSize, makeIsland, makeSoil, pi,
  skeleton, sunDir, type Frame, type Look, type Part, type Pop,
} from './look-data';
import { makeFlat, portrait } from './look-flat';
import { makeLook3D } from './look-3d';

const GROW_S = 180, DAY_S = 50; // full growth and one day, in seconds at 1×
const flats = PALETTES.map(flatten), skels = PLANTS.map((g, o) => skeleton(g, o));
const soil = makeSoil(7), island = makeIsland(3);
const looks: (Look | null)[] = [makeFlat(), null, makeFlat(true)]; // the 3D look starts WebGL on first use
const S = { look: 0, width: 480, pal: 1, shadows: true, sunF: 0.3, loop: true, speed: 1, t: 0, sel: 0, ui: 1 };
let pops: Pop[] = [], frame: Frame | null = null;
const found = new Set<number>();
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const look = () => (looks[S.look] ??= makeLook3D());

function makeFrame(dt: number): Frame {
  const G = Math.min(1, S.t / GROW_S), parts: Part[] = [], N = soil.cells.length, revealed = new Uint8Array(N);
  for (const sk of skels) buildPlant(sk, G, parts);
  for (const i of soil.seen0) revealed[i] = 1;
  const progress = soil.roots.map((r) => Math.max(0, Math.min(r.path.length, (G - r.start) * r.rate)));
  soil.roots.forEach((r, k) => {
    if (r.native) return; // the native's roots don't reveal your soil
    for (let j = 0; j < Math.min(r.path.length, Math.floor(progress[k] + 0.5)); j++) {
      const i = r.path[j], pk = soil.pocket[i];
      for (const n of around(i)) revealed[n] = 1;
      if (pk >= 0 && !found.has(pk)) found.add(pk), pops.push({ cell: i, kind: soil.cells[i], age: 0 });
    }
  });
  pops.forEach((p) => (p.age += dt));
  pops = pops.filter((p) => p.age < 0.9);
  const hints = new Int8Array(N);
  for (let i = 0; i < N; i++) {
    const c = soil.cells[i];
    if (revealed[i] && !isPocket(c) && c !== 'stone') hints[i] = around(i).filter((j) => isPocket(soil.cells[j]) && !revealed[j]).length;
  }
  const sunF = 0.04 + 0.92 * S.sunF;
  return {
    parts, soil, revealed, found, progress, hints, pops, sun: sunDir(sunF), sunF, flat: flats[S.pal], shadows: S.shadows,
    selected: S.sel, time: performance.now() / 1000, island, growth: G,
  };
}

// ---- the panel ----
const favourWord = (v: number) => (v >= 0.85 ? 'Extremely favourable' : v >= 0.6 ? 'Favourable' : v >= 0.4 ? 'Even matchup' : v >= 0.2 ? 'Unfavourable' : 'Hopeless');
function card() {
  const sp = SPECIES[S.sel], f = sp.favour >= 0.6 ? 'good' : sp.favour >= 0.4 ? 'even' : 'bad';
  $('sub').textContent = sp.line;
  Object.assign($('head'), { textContent: sp.name.toUpperCase() }).dataset.f = f;
  $('cname').textContent = sp.name;
  $('cline').textContent = `${sp.form} · ${sp.niche}`;
  Object.assign($('tier'), { textContent: sp.tier }).dataset.t = sp.tier;
  $('attrs').innerHTML = ATTRS.map((a, i) => `<div class="attr"><span class="ol1">${a}</span><span class="pips ${CORNER[i]}">${Array.from({ length: 10 }, (_, k) => `<i class="${k < sp.pips[i] ? 'on' : ''}"></i>`).join('')}</span></div>`).join('');
  $('vsl').textContent = sp.name;
  $('vsr').textContent = sp.pressure;
  $('fav').style.width = `${Math.round(sp.favour * 100)}%`;
  Object.assign($('favtxt'), { textContent: favourWord(sp.favour) }).dataset.f = f;
}
function legend() {
  const F = flats[S.pal], c = (r: Parameters<typeof pi>[1], i: number) => F.hex[pi(F, r, i)];
  const items: [string, string][] = [['Lava', c('warm', 1)], ['Bare', c('stone', 2)], ['Forest', c('leaf', 2)], ['Wet', c('leaf', 0)],
    ['Beach', c('earth', 4)], ['Sea', c('water', 0)], ['Your area', c('leaf', 4)], ['Rare variant', c('rare', 0)]];
  $('legend').innerHTML = items.map(([n, h]) => `<span><i style="background:${h}"></i>${n}</span>`).join('');
}
function sync() {
  document.querySelectorAll<HTMLButtonElement>('button[data-k]').forEach((b) => {
    const k = b.dataset.k as keyof typeof S, v = Number(b.dataset.v);
    b.classList.toggle('on', typeof S[k] === 'boolean' ? !!S[k] : S[k] === v);
  });
}
function layout() {
  const lk = look(), w = S.width, h = Math.round(w * 0.75), [iw, ih] = isleSize(w);
  lk.resize(w);
  const sc = Math.max(1, Math.floor(Math.min(1000, innerWidth - 480) / w)), isc = Math.max(1, Math.floor(386 / iw));
  Object.assign(lk.side.style, { width: `${w * sc}px`, height: `${h * sc}px` });
  Object.assign(lk.isle.style, { width: `${iw * isc}px`, height: `${ih * isc}px` });
  $('stage').replaceChildren(lk.side);
  $('isle').replaceChildren(lk.isle);
}

document.querySelectorAll<HTMLButtonElement>('button[data-k]').forEach((b) => {
  b.onclick = () => {
    const v = Number(b.dataset.v);
    switch (b.dataset.k) {
      case 'look': S.look = v; layout(); break;
      case 'width': S.width = v; layout(); break;
      case 'pal': S.pal = v; legend(); break;
      case 'shadows': S.shadows = !S.shadows; break;
      case 'loop': S.loop = !S.loop; break;
      case 'speed': S.speed = v; break;
      case 'ui': S.ui = v; document.body.dataset.ui = v ? 'calm' : ''; break;
      case 'restart': S.t = 0; found.clear(); pops = []; break;
    }
    sync();
  };
});
const slider = $<HTMLInputElement>('sun');
slider.oninput = () => ((S.sunF = Number(slider.value) / 1000), (S.loop = false), sync());
$('stage').addEventListener('click', (e) => {
  if (!frame) return;
  const r = look().side.getBoundingClientRect(), o = look().pick(e.clientX - r.left, e.clientY - r.top, frame);
  if (o >= 0 && o !== S.sel) (S.sel = o), card();
});
addEventListener('resize', layout);

let last = performance.now(), n = 0;
function tick(now: number) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  S.t = Math.min(GROW_S, S.t + dt * S.speed);
  if (S.loop) (S.sunF = (S.sunF + dt / DAY_S) % 1), (slider.value = String(Math.round(S.sunF * 1000)));
  frame = makeFrame(dt);
  look().draw(frame);
  if (n++ % 3 === 0) {
    portrait($<HTMLCanvasElement>('portrait'), frame);
    const hour = 6 + 12 * (0.04 + 0.92 * S.sunF);
    $('status').textContent = `Click a plant for its card${S.look === 1 ? ' · drag to tilt' : ''} · growth ${Math.round(frame.growth * 100)}% · ${String(Math.floor(hour)).padStart(2, '0')}:${String(Math.floor((hour % 1) * 60)).padStart(2, '0')} · pockets found ${found.size}`;
  }
  requestAnimationFrame(tick);
}
slider.value = String(S.sunF * 1000);
document.body.dataset.ui = S.ui ? 'calm' : '';
card(), legend(), sync(), layout();
requestAnimationFrame(tick);
