// Grow toy (slice 00): the run, the HUD and the input. Rules: grow-sim.ts, grow-verbs.ts, grow-world.ts.

import { GENES, GROUND, H, HABITATS, PIPS, SPOTS, T, TARGETS, W, tierOf, type Genes } from './grow-data';
import { newPlant, score, stats, tick, type Plant, type Stats } from './grow-sim';
import {
  brood, cut, cutPreview, dig, digPreview, geneText, ghost, nearest, spotLabel, startSpot, subtree, wake, type Seed,
} from './grow-verbs';
import { drawGhost, drawLabel, drawPlant, drawThumb, drawWorld } from './grow-view';
import { makeWorld, rain, worldTick, type World } from './grow-world';

type Row = { season: number; spot: number; score: number; stats: Stats; genes: Genes; changed: number[] };
type Tool = 'wake' | 'cut';

let habitat = HABITATS[0].id, target = TARGETS[0].id, islandSeed = newSeed();
let world: World, plant: Plant, seeds: Seed[] = [], history: Row[] = [];
let state: 'start' | 'grow' | 'brood' | 'end' = 'start';
let season = 1, t = 0, speed = 1, verbs = true, tool: Tool = 'wake', hoverSeed = -1;
let mouse: { x: number; y: number } | null = null, lastChanged: number[] = [];

const canvas = document.getElementById('view') as HTMLCanvasElement;
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d')!;
const hud = document.getElementById('hud')!, panel = document.getElementById('panel')!;
const $ = (id: string) => document.getElementById(id)!;
const LETTERS = 'ABC';
const fmt = (v: number, d = 1) => (v >= 0 ? '+' : '') + v.toFixed(d);
function newSeed() { return Math.floor(Math.random() * 90000) + 10000; }

// ---- HUD ----

hud.innerHTML = `
  <h1>Toy: Grow a line</h1>
  <div class="muted" id="where"></div>
  <h2>Season <span id="season"></span></h2>
  <div class="bar"><div id="time"></div></div>
  <div class="target"><div><b id="tname"></b><div class="muted" id="tblurb"></div></div><div class="tier" id="tier"></div></div>
  <div class="row"><span>Score</span><b id="score"></b></div>
  <h2>Stocks <span class="muted">per s</span></h2>
  <div class="row"><span>Energy <span class="muted">leaves</span></span><span><b id="energy"></b> <span id="denergy"></span></span></div>
  <div class="row"><span>Water <span class="muted">roots</span></span><span><b id="water"></b> <span id="dwater"></span></span></div>
  <div class="row"><span>Nutrient <span class="muted">pays the verbs</span></span><span><b id="nutrient"></b> <span id="dnutrient"></span></span></div>
  <div id="wilt" class="warn"></div>
  <h2>Stats</h2>
  <div class="row" title="the top tip's height above ground"><span>Reach</span><span id="reach"></span></div>
  <div class="row" title="the crown's width"><span>Spread</span><span id="spread"></span></div>
  <div class="row" title="pockets a root sits in"><span>Roots</span><span id="roots"></span></div>
  <div class="row" title="mean stem thickness (Thickness gene, thickens with the leaves it carries)"><span>Toughness</span><span id="tough"></span></div>
  <div class="row" title="energy from leaves minus upkeep, per s"><span>Growth</span><span id="growth"></span></div>
  <div class="row" title="energy upkeep + water the leaves use, per s"><span>Upkeep</span><span id="upkeep"></span></div>
  <div class="row muted"><span>Biomass</span><span id="biomass"></span></div>
  <h2>Verbs</h2>
  <label><input type="checkbox" id="verbs" checked> Verbs on <span class="muted">(off: the genes alone)</span></label>
  <div id="tools"><button data-tool="wake" class="on">Wake a bud [W]</button><button data-tool="cut">Cut [C]</button>
  <p class="muted">Wake: ${T.wakeCost} nutrient. Cut: some nutrient back, the buds below wake. Soil: click a seen
  cell near a root to dig there (hard soil costs double, stone can't be dug).</p></div>
  <h2>Speed</h2>
  <button data-speed="0">Pause</button><button data-speed="1" class="on">×1</button><button data-speed="4">×4</button><button data-speed="10">×10</button>
  <h2>Genes</h2><div id="genes"></div>`;

const group = (attr: string, set: (v: string) => void) =>
  hud.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((el) =>
    el.addEventListener('click', () => {
      set(el.getAttribute(attr)!);
      hud.querySelectorAll(`[${attr}]`).forEach((b) => b.classList.toggle('on', b === el));
    }));
group('data-tool', (v) => (tool = v as Tool));
group('data-speed', (v) => (speed = Number(v)));
$('verbs').addEventListener('change', (e) => {
  verbs = (e.target as HTMLInputElement).checked;
  $('tools').style.opacity = verbs ? '1' : '0.4';
});
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'w' || k === 'c') (hud.querySelector(`[data-tool="${k === 'w' ? 'wake' : 'cut'}"]`) as HTMLButtonElement).click();
  if (k === ' ' && state === 'grow') { e.preventDefault(); (hud.querySelector(`[data-speed="${speed ? 0 : 1}"]`) as HTMLButtonElement).click(); }
});

function pips(g: Genes, changed: number[] = [], from?: Genes) {
  return GENES.map((d, i) => {
    const cells = Array.from({ length: PIPS }, (_, k) => `<i class="${k < g[i] ? 'f' : ''}"></i>`).join('');
    const ch = changed.includes(i) && from ? `<b class="${g[i] > from[i] ? 'up' : 'down'}">${g[i] > from[i] ? '▲' : '▼'}</b>` : '';
    return `<div class="gene${ch ? ' ch' : ''}" title="${d.help} (${geneText(g, i)})"><span>${d.name}</span><span class="pips">${cells}</span>${ch}</div>`;
  }).join('');
}

// ---- the run ----

function renderStart() {
  state = 'start';
  const cards = (list: { id: string; name: string; blurb: string }[], sel: string, attr: string) =>
    list.map((x) => `<div class="card pick${x.id === sel ? ' on' : ''}" data-${attr}="${x.id}"><b>${x.name}</b><div class="muted">${x.blurb}</div></div>`).join('');
  panel.innerHTML = `<h2>A new run: pick a habitat and a target</h2>
    <div class="cards">${cards(HABITATS, habitat, 'hab')}</div>
    <div class="cards">${cards(TARGETS, target, 'tgt')}</div>
    <p>Island seed <b>${islandSeed}</b> <button id="reroll">New island</button> <button id="go" class="on">Start (5 seasons)</button></p>
    <p class="muted">Your line starts in the open spot nearest the middle. Each season ends with 3 seeds that land on different spots; pick the
    heir. Your tier comes from the last season's score.</p>`;
  panel.querySelectorAll<HTMLElement>('[data-hab]').forEach((el) => el.addEventListener('click', () => { habitat = el.dataset.hab!; preview(); }));
  panel.querySelectorAll<HTMLElement>('[data-tgt]').forEach((el) => el.addEventListener('click', () => { target = el.dataset.tgt!; renderStart(); }));
  $('reroll').addEventListener('click', () => { islandSeed = newSeed(); preview(); });
  $('go').addEventListener('click', startRun);
  if (!world || world.habitat.id !== habitat || world.seed !== islandSeed) preview();
}
function preview() { world = makeWorld(habitat, islandSeed); plant = newPlant(BASE(), startSpot(world), world, Math.random); renderStart(); }
const BASE = () => GENES.map(() => 5);

function startRun() {
  world = makeWorld(habitat, islandSeed);
  plant = newPlant(BASE(), startSpot(world), world, Math.random);
  season = 1; t = 0; history = []; seeds = []; state = 'grow';
  panel.innerHTML = '';
  $('genes').innerHTML = pips(plant.genes);
}

function endSeason() {
  const s = stats(plant, world), prev = history[history.length - 1];
  history.push({ season, spot: plant.spot, score: score(s, target), stats: s, genes: plant.genes, changed: prev ? lastChanged : [] });
  if (season >= T.seasons) { renderEnd(); return; }
  rain(world);
  seeds = brood(plant, world, target, Math.random);
  state = 'brood';
  renderBrood();
}
function pick(i: number) {
  const s = seeds[i], from = plant.genes;
  lastChanged = s.changed;
  plant = newPlant(s.genes, s.spot, world, Math.random);
  season++; t = 0; state = 'grow'; seeds = []; hoverSeed = -1;
  panel.innerHTML = '';
  $('genes').innerHTML = pips(plant.genes, s.changed, from);
}

function renderBrood() {
  const r = history[history.length - 1];
  panel.innerHTML = `<h2>Season ${season} is over: score ${r.score} (${tierOf(r.score)}). The parent dies; pick the heir.</h2>
    <p class="muted">Each seed shows a season grown without verbs, on the soil you've seen (hidden cells count as loam). Rain has refilled the water pockets.</p>
    <div class="cards">${seeds.map((s, i) => `<div class="card seed" data-i="${i}">
      <div class="row"><b>Seed ${LETTERS[i]} · spot ${s.spot + 1}</b><span class="tier small">${tierOf(s.score)}</span></div>
      <div class="muted">${spotLabel(world, s.spot)}</div>
      <canvas width="260" height="160"></canvas>
      <div class="row"><span>Predicted score</span><b>${s.score}</b></div>
      <div class="row muted"><span>Reach ${Math.round(s.stats.reach)} · Spread ${Math.round(s.stats.spread)}</span><span>Roots ${s.stats.roots} · Growth ${s.stats.growth.toFixed(1)}</span></div>
      ${pips(s.genes, s.changed, plant.genes)}</div>`).join('')}</div>`;
  panel.querySelectorAll<HTMLElement>('.seed').forEach((el) => {
    const i = Number(el.dataset.i);
    drawThumb(el.querySelector('canvas')!, seeds[i].body);
    el.addEventListener('click', () => pick(i));
    el.addEventListener('mouseenter', () => (hoverSeed = i));
    el.addEventListener('mouseleave', () => (hoverSeed = -1));
  });
}

function renderEnd() {
  state = 'end';
  const last = history[history.length - 1], tg = TARGETS.find((x) => x.id === target)!;
  panel.innerHTML = `<div class="card end"><div><h2>${tg.name} on the ${HABITATS.find((h) => h.id === habitat)!.name}, island ${islandSeed}</h2>
    <p>The line comes home with a score of <b>${last.score}</b>.</p></div><div class="tier big">${tierOf(last.score)}</div></div>
    <table><tr><th>Season</th><th>Spot</th><th>Score</th><th>Reach</th><th>Spread</th><th>Roots</th><th>Tough</th><th>Genome</th></tr>
    ${history.map((r) => `<tr><td>${r.season}</td><td>${r.spot + 1}, ${spotLabel(world, r.spot)}</td><td>${r.score} ${tierOf(r.score)}</td>
      <td>${Math.round(r.stats.reach)}</td><td>${Math.round(r.stats.spread)}</td><td>${r.stats.roots}</td><td>${r.stats.toughness.toFixed(2)}</td>
      <td class="genome">${pips(r.genes, r.changed, history[r.season - 2]?.genes)}</td></tr>`).join('')}</table>
    <p><button id="again" class="on">Same island again</button> <button id="new">New run</button></p>`;
  $('again').addEventListener('click', startRun);
  $('new').addEventListener('click', () => { islandSeed = newSeed(); preview(); });
}

// ---- input ----

const toWorld = (e: MouseEvent) => {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
};
canvas.addEventListener('mousemove', (e) => (mouse = toWorld(e)));
canvas.addEventListener('mouseleave', () => (mouse = null));
canvas.addEventListener('click', (e) => {
  if (!verbs || state !== 'grow') return;
  const m = toWorld(e), a = aim(m.x, m.y);
  if (!a?.ok) return;
  if (a.kind === 'wake') wake(plant, a.i);
  else if (a.kind === 'cut') cut(plant, world, a.i);
  else dig(plant, world, m.x, m.y);
});

type Aim = { kind: 'wake' | 'cut' | 'dig'; i: number; text: string; ok: boolean };
/** What a click here would do, with its cost. */
function aim(x: number, y: number): Aim | null {
  if (y > GROUND) {
    const d = digPreview(plant, world, x, y);
    if (!d) return null;
    const ok = !d.blocked && plant.nutrient >= d.cost;
    return { kind: 'dig', i: d.from, ok, text: d.blocked ? `Dig: ${d.blocked}` :
      `Dig here: ${d.cost.toFixed(1)} nutrient\n${d.cells} cells${d.hard ? `, ${d.hard} hard` : ''}${d.fresh ? ', a new root tip' : ''}` };
  }
  if (tool === 'wake') {
    const i = nearest(plant, x, y, (n) => n.kind === 'shoot' && n.state === 'bud');
    return i < 0 ? null : { kind: 'wake', i, ok: plant.nutrient >= T.wakeCost, text: `Wake this bud: ${T.wakeCost} nutrient\nthe ghost shows what the genes grow` };
  }
  const i = nearest(plant, x, y, (n) => n.kind === 'shoot' && n.len > 0);
  if (i < 0) return null;
  const c = cutPreview(plant, world, i);
  return { kind: 'cut', i, ok: true, text: `Cut: ${c.segs} parts, ${c.leaves} leaves fall\nenergy −${c.energy.toFixed(2)}/s · upkeep −${c.upkeep.toFixed(2)}/s · water −${c.water.toFixed(2)}/s\n+${c.back.toFixed(1)} nutrient back · ${c.wakes} bud${c.wakes === 1 ? '' : 's'} below wake` };
}

// ---- drawing and the loop ----

function draw() {
  if (world) {
    drawWorld(ctx, world);
    drawPlant(ctx, plant, state === 'grow' ? 1 : 0.4);
    if (state === 'brood') seeds.forEach((s, i) => {
      const x = SPOTS[s.spot], on = hoverSeed === i;
      ctx.fillStyle = on ? '#ffe36b' : '#f5f0dc';
      ctx.beginPath(); ctx.ellipse(x, GROUND - 4, on ? 7 : 5, on ? 5 : 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 14px system-ui'; ctx.fillText(LETTERS[i], x, GROUND - 22);
      if (on) drawPlant(ctx, s.body, 0.55);
    });
    const a = state === 'grow' && verbs && mouse ? aim(mouse.x, mouse.y) : null;
    if (a && mouse) {
      const n = plant.nodes[a.i];
      if (a.kind === 'wake') drawGhost(ctx, ghost(plant, world, a.i));
      if (a.kind === 'cut') { // what falls
        ctx.strokeStyle = 'rgba(255,90,70,0.85)'; ctx.lineWidth = 2.5;
        for (const k of subtree(plant, a.i)) {
          const m = plant.nodes[k], q = plant.nodes[m.parent];
          if (m.len) { ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(m.x, m.y); ctx.stroke(); }
        }
      }
      if (a.kind === 'dig') {
        ctx.strokeStyle = a.ok ? 'rgba(255,230,120,0.8)' : 'rgba(255,120,100,0.8)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); ctx.setLineDash([]);
      }
      drawLabel(ctx, a.text, mouse.x, mouse.y, a.ok);
    }
  }
  if (plant && world) updateHud();
  requestAnimationFrame(draw);
}

function updateHud() {
  const s = stats(plant, world), f = plant.flow, tg = TARGETS.find((x) => x.id === target)!, sc = score(s, target);
  const hab = HABITATS.find((h) => h.id === habitat)!;
  $('where').textContent = `${hab.name} · island ${islandSeed} · spot ${plant.spot + 1}, ${spotLabel(world, plant.spot)}`;
  $('season').textContent = state === 'start' ? '(pick below)' : `${season} / ${T.seasons}${state === 'brood' ? ', pick the heir' : state === 'end' ? ', done' : ''}`;
  $('time').style.width = `${(100 * t) / T.seasonTicks}%`;
  $('tname').textContent = tg.name; $('tblurb').textContent = tg.blurb;
  $('tier').textContent = tierOf(sc); $('score').textContent = String(sc);
  $('energy').textContent = plant.energy.toFixed(1);
  $('denergy').textContent = fmt((f.energyIn - f.energyUp) * 10, 2);
  $('water').textContent = plant.water.toFixed(1);
  $('dwater').textContent = fmt((f.waterIn - f.waterUse) * 10, 2);
  $('nutrient').textContent = plant.nutrient.toFixed(1);
  $('dnutrient').textContent = fmt(f.nutrientIn * 10, 2);
  $('wilt').textContent = f.wilting ? 'Wilting: out of water, leaves work at a quarter. Find a water pocket.' : '';
  $('reach').textContent = `${Math.round(s.reach)} cm`;
  $('spread').textContent = `${Math.round(s.spread)} cm`;
  $('roots').textContent = `${s.roots} pockets · ${Math.round(s.depth)} cm deep`;
  $('tough').textContent = s.toughness.toFixed(2);
  $('growth').textContent = `${s.growth.toFixed(2)}/s`;
  $('upkeep').textContent = `${s.upkeep.toFixed(2)}/s`;
  $('biomass').textContent = `${s.biomass.toFixed(0)} g · ${s.leaves} leaves`;
}

setInterval(() => {
  for (let k = 0; k < speed && state === 'grow'; k++) {
    worldTick(world, ++t);
    tick(plant, world, t);
    if (t >= T.seasonTicks) endSeason();
  }
}, T.tickMs);

renderStart();
$('genes').innerHTML = pips(BASE());
requestAnimationFrame(draw);
(window as unknown as { grow: unknown }).grow = { plant: () => plant }; // for poking at it in the console

export {};
