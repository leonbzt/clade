// Grow toy (slices 00, 00b): the run and the input. Herb: a heir each season. Tree: one body for the run.
// Rules: grow-sim.ts, grow-tree.ts, grow-verbs.ts, grow-world.ts; trade-offs: grow-explain.ts; side panel: grow-hud.ts.

import { FORMS, GENES, GROUND, H, HABITATS, SPOTS, T, TARGETS, W, formOf, tierOf, type FormId, type Genes } from './grow-data';
import { changeLine, seedReason, whatIfCut, whatIfDig, whatIfWake } from './grow-explain';
import { HUD_HTML, pips, updateHud } from './grow-hud';
import { score, stats, tick, type Plant, type Stats } from './grow-sim';
import { newTree, spring, treeCut, treeCutPreview, winter } from './grow-tree';
import {
  brood, cut, dig, digPreview, ghost, makeHerb, nearest, spotLabel, startSpot, subtree, wake, type Brood, type Seed,
} from './grow-verbs';
import { drawGhost, drawLabel, drawPlant, drawThumb, drawWorld } from './grow-view';
import { makeWorld, rain, worldTick, type World } from './grow-world';

type Row = { season: number; spot: number; score: number; stats: Stats; genes: Genes; changed: number[] };
type Tool = 'wake' | 'cut';

let habitat = HABITATS[0].id, target = TARGETS[0].id, form: FormId = 'herb', islandSeed = newSeed();
let world: World, plant: Plant, br: Brood | null = null, history: Row[] = [];
let state: 'start' | 'grow' | 'winter' | 'brood' | 'end' = 'start';
let season = 1, t = 0, speed = 1, verbs = true, tool: Tool = 'wake', hoverSeed = -1;
let mouse: { x: number; y: number } | null = null, lastChanged: number[] = [];

const canvas = document.getElementById('view') as HTMLCanvasElement;
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d')!;
const hud = document.getElementById('hud')!, panel = document.getElementById('panel')!;
const $ = (id: string) => document.getElementById(id)!;
const LETTERS = 'ABCD';
const make = () => (form === 'tree' ? newTree : makeHerb);
const BASE = () => GENES.map(() => 5);
function newSeed() { return Math.floor(Math.random() * 90000) + 10000; }

// ---- HUD controls ----

hud.innerHTML = HUD_HTML;
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
const showGenes = (g: Genes, changed: number[] = [], from?: Genes) => ($('genes').innerHTML = pips(g, changed, from, true));

// ---- the run ----

function renderStart() {
  state = 'start';
  const cards = (list: { id: string; name: string; blurb: string }[], sel: string, attr: string) =>
    list.map((x) => `<div class="card pick${x.id === sel ? ' on' : ''}" data-${attr}="${x.id}"><b>${x.name}</b><div class="muted">${x.blurb}</div></div>`).join('');
  panel.innerHTML = `<h2>A new run: pick a form, a habitat and a target</h2>
    <div class="cards">${cards(FORMS, form, 'form')}</div>
    <div class="cards">${cards(HABITATS, habitat, 'hab')}</div>
    <div class="cards">${cards(TARGETS, target, 'tgt')}</div>
    <p>Island seed <b>${islandSeed}</b> <button id="reroll">New island</button> <button id="go" class="on">Start (${formOf(form).seasons} seasons)</button></p>
    <p class="muted">Your line starts in the open spot nearest the middle. Your tier comes from the last season's score.</p>`;
  panel.querySelectorAll<HTMLElement>('[data-form]').forEach((el) => el.addEventListener('click', () => { form = el.dataset.form as FormId; preview(); }));
  panel.querySelectorAll<HTMLElement>('[data-hab]').forEach((el) => el.addEventListener('click', () => { habitat = el.dataset.hab!; preview(); }));
  panel.querySelectorAll<HTMLElement>('[data-tgt]').forEach((el) => el.addEventListener('click', () => { target = el.dataset.tgt!; renderStart(); }));
  $('reroll').addEventListener('click', () => { islandSeed = newSeed(); preview(); });
  $('go').addEventListener('click', startRun);
  if (!world || world.habitat.id !== habitat || world.seed !== islandSeed) preview();
}
function preview() { world = makeWorld(habitat, islandSeed); plant = make()(BASE(), startSpot(world), world, Math.random); renderStart(); }

function startRun() {
  world = makeWorld(habitat, islandSeed);
  plant = make()(BASE(), startSpot(world), world, Math.random);
  season = 1; t = 0; history = []; br = null; lastChanged = []; state = 'grow';
  panel.innerHTML = '';
  showGenes(plant.genes);
}

function endSeason() {
  const s = stats(plant, world), sc = score(s, target), prev = history[history.length - 1];
  history.push({ season, spot: plant.spot, score: sc, stats: s, genes: plant.genes, changed: lastChanged });
  lastChanged = [];
  const last = season >= formOf(form).seasons;
  if (form === 'tree' && !last) { winter(plant); rain(world); state = 'winter'; renderWinter(s); return; }
  if (form === 'herb' && last) { renderEnd(null); return; }
  rain(world);
  br = brood(plant, world, target, Math.random, form === 'herb' ? 4 : 3, make());
  const fourth = form === 'herb' && sc > (prev ? prev.score : br.base.score); // season 1: beat your genes alone
  if (form === 'herb' && !fourth) br.seeds.splice(Math.floor(Math.random() * 4), 1);
  state = 'brood';
  renderBrood(fourth, prev);
}

function renderWinter(before: Stats) {
  const r = history[history.length - 1], after = stats(plant, world);
  panel.innerHTML = `<h2>Winter after season ${season}: score ${r.score} (${tierOf(r.score)})</h2>
    <p>The leaves fell; the wood thickened (Toughness ${before.toughness.toFixed(2)} → ${after.toughness.toFixed(2)}). Rain refilled the
    water pockets. The frame, its buds and its roots stay. In spring the leaves come back on the crown's outer twigs.</p>
    <p class="muted">You can cut now, on the bare frame: dead weight (old wood with no leaves) only costs upkeep.</p>
    <p><button id="spring" class="on">Spring: season ${season + 1}</button></p>`;
  $('spring').addEventListener('click', () => {
    spring(plant);
    season++; t = 0; state = 'grow'; panel.innerHTML = '';
  });
}

function pick(i: number) {
  const s = br!.seeds[i], from = plant.genes;
  if (form === 'tree') { renderEnd(s); return; }
  lastChanged = s.changed;
  plant = makeHerb(s.genes, s.spot, world, Math.random);
  season++; t = 0; state = 'grow'; br = null; hoverSeed = -1;
  panel.innerHTML = '';
  showGenes(plant.genes, s.changed, from);
}

function renderBrood(fourth: boolean, prev?: Row) {
  const r = history[history.length - 1], b = br!;
  const head = form === 'tree'
    ? `The run is over: the tree's last season scored ${r.score} (${tierOf(r.score)}). Pick a seed for the line's next tree.`
    : `Season ${season} is over: score ${r.score} (${tierOf(r.score)}). The parent dies; pick the heir.`;
  const bar = prev ? `last season's ${prev.score}` : `your genes alone (${b.base.score})`;
  const bonus = form !== 'herb' ? '' : fourth ? `A good season: you beat ${bar}, a 4th seed.` : `Beat ${bar} for a 4th seed.`;
  panel.innerHTML = `<h2>${head}</h2>
    <p class="muted">Each seed shows one season${form === 'tree' ? ' as a young tree' : ''}, grown without verbs on the soil you've seen
    (hidden cells count as loam). It's compared with your parent's genes on spot ${plant.spot + 1}, also without verbs: score
    <b>${b.base.score}</b>. ${bonus}</p>
    <div class="cards">${b.seeds.map((s, i) => {
      const why = seedReason(s.stats, b.base.stats, target);
      return `<div class="card seed" data-i="${i}">
      <div class="row"><b>Seed ${LETTERS[i]} · spot ${s.spot + 1}</b><span class="tier small">${tierOf(s.score)}</span></div>
      <div class="muted">${spotLabel(world, s.spot)}</div>
      <canvas width="260" height="160"></canvas>
      <div class="row"><span>Predicted score</span><b>${s.score} <span class="muted">(${s.score >= b.base.score ? '+' : '−'}${Math.abs(s.score - b.base.score)})</span></b></div>
      <div class="why">${why.top}</div>
      <div class="muted small">${why.lines}</div>
      ${pips(s.genes, s.changed, plant.genes)}</div>`;
    }).join('')}</div>`;
  panel.querySelectorAll<HTMLElement>('.seed').forEach((el) => {
    const i = Number(el.dataset.i);
    drawThumb(el.querySelector('canvas')!, b.seeds[i].body);
    el.addEventListener('click', () => pick(i));
    el.addEventListener('mouseenter', () => (hoverSeed = i));
    el.addEventListener('mouseleave', () => (hoverSeed = -1));
  });
}

function renderEnd(heir: Seed | null) {
  state = 'end'; br = null; hoverSeed = -1;
  const last = history[history.length - 1], tg = TARGETS.find((x) => x.id === target)!;
  panel.innerHTML = `<div class="card end"><div><h2>${formOf(form).name}, ${tg.name}, on the ${HABITATS.find((h) => h.id === habitat)!.name}, island ${islandSeed}</h2>
    <p>The line comes home with a score of <b>${last.score}</b>.</p></div><div class="tier big">${tierOf(last.score)}</div></div>
    ${heir ? `<div class="card heir"><b>The line's next tree</b> <span class="muted">(spot ${heir.spot + 1}, predicted ${heir.score} as a young tree)</span>
      <canvas width="260" height="160"></canvas>${pips(heir.genes, heir.changed, plant.genes)}</div>` : ''}
    <table><tr><th>Season</th><th>Spot</th><th>Score</th><th>Reach</th><th>Spread</th><th>Roots</th><th>Tough</th><th>Upkeep</th><th>Genome</th></tr>
    ${history.map((r, k) => `<tr><td>${r.season}</td><td>${r.spot + 1}, ${spotLabel(world, r.spot)}</td><td>${r.score} ${tierOf(r.score)}</td>
      <td>${Math.round(r.stats.reach)}</td><td>${Math.round(r.stats.spread)}</td><td>${r.stats.roots}</td><td>${r.stats.toughness.toFixed(2)}</td>
      <td>${r.stats.upkeep.toFixed(2)}</td><td class="genome">${form === 'tree' && k ? '<span class="muted">same body</span>' : pips(r.genes, r.changed, history[k - 1]?.genes)}</td></tr>`).join('')}</table>
    <p><button id="again" class="on">Same island again</button> <button id="new">New run</button></p>`;
  if (heir) drawThumb(panel.querySelector('.heir canvas')!, heir.body);
  $('again').addEventListener('click', startRun);
  $('new').addEventListener('click', () => { islandSeed = newSeed(); preview(); });
}

// ---- input ----

const toWorld = (e: MouseEvent) => {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
};
const canAct = () => verbs && (state === 'grow' || state === 'winter');
canvas.addEventListener('mousemove', (e) => (mouse = toWorld(e)));
canvas.addEventListener('mouseleave', () => (mouse = null));
canvas.addEventListener('click', (e) => {
  if (!canAct()) return;
  const m = toWorld(e), a = aim(m.x, m.y);
  if (!a?.ok) return;
  if (a.kind === 'wake') wake(plant, a.i);
  else if (a.kind === 'cut') (form === 'tree' ? treeCut : cut)(plant, world, a.i);
  else dig(plant, world, m.x, m.y);
});

type Aim = { kind: 'wake' | 'cut' | 'dig'; i: number; text: string; ok: boolean };
/** What a click here would do: its cost, and its effect on the stats and the score. */
function aim(x: number, y: number): Aim | null {
  if (y > GROUND) {
    const d = digPreview(plant, world, x, y);
    if (!d) return null;
    const ok = !d.blocked && plant.nutrient >= d.cost;
    if (d.blocked) return { kind: 'dig', i: d.from, ok, text: `Dig: ${d.blocked}` };
    const w = whatIfDig(plant, world, x, y, target);
    return { kind: 'dig', i: d.from, ok, text: `Dig here: ${d.cost.toFixed(1)} nutrient · ${d.cells} cells${d.hard ? `, ${d.hard} hard` : ''}${d.fresh ? ', a new root tip' : ''}
${w.income}\nwhen it arrives ${changeLine(w)}` };
  }
  if (tool === 'wake') {
    const i = nearest(plant, x, y, (n) => n.kind === 'shoot' && n.state === 'bud');
    if (i < 0) return null;
    const w = whatIfWake(plant, world, i, target);
    return { kind: 'wake', i, ok: plant.nutrient >= T.wakeCost, text: `Wake this bud: ${T.wakeCost} nutrient\nonce the ghost has grown (~${w.cost.toFixed(0)} energy)\n${changeLine(w)}` };
  }
  const i = nearest(plant, x, y, (n) => n.kind === 'shoot' && n.len > 0);
  if (i < 0) return null;
  const c = treeCutPreview(plant, world, i), w = whatIfCut(plant, world, i, target);
  const after = form === 'tree' && c.sprout ? 'a new shoot sprouts from the stump' : `${c.wakes} bud${c.wakes === 1 ? '' : 's'} below wake`;
  return { kind: 'cut', i, ok: true, text: `Cut: ${c.segs} parts, ${c.leaves} leaves fall · +${c.back.toFixed(1)} nutrient back\n${after}\n${changeLine(w)}` };
}

// ---- drawing and the loop ----

function draw() {
  if (world) {
    drawWorld(ctx, world);
    drawPlant(ctx, plant, state === 'grow' || state === 'winter' ? 1 : 0.4);
    if (state === 'brood' && br && form === 'herb') br.seeds.forEach((s, i) => {
      const x = SPOTS[s.spot], on = hoverSeed === i;
      ctx.fillStyle = on ? '#ffe36b' : '#f5f0dc';
      ctx.beginPath(); ctx.ellipse(x, GROUND - 4, on ? 7 : 5, on ? 5 : 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 14px system-ui'; ctx.fillText(LETTERS[i], x, GROUND - 22);
      if (on) drawPlant(ctx, s.body, 0.55);
    });
    const a = canAct() && mouse ? aim(mouse.x, mouse.y) : null;
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
  if (plant && world) updateHud({ plant, world, habitat, target, form, island: islandSeed, season, t, state });
  requestAnimationFrame(draw);
}

setInterval(() => {
  const ticks = formOf(form).seasonTicks;
  for (let k = 0; k < speed && state === 'grow'; k++) {
    worldTick(world, ++t, ticks);
    tick(plant, world, t);
    if (t >= ticks) endSeason();
  }
}, T.tickMs);

renderStart();
showGenes(BASE());
requestAnimationFrame(draw);
(window as unknown as { grow: unknown }).grow = { plant: () => plant }; // for poking at it in the console

export {};
