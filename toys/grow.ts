// Grow toy (slice 00): the view and the controls. Rules live in grow-sim.ts, numbers in grow-data.ts.

import { CELL, COLS, GENES, GROUND, H, LEVELS, ROWS, SPOTS, T, W, type Genes } from './grow-data';
import {
  BUD_COST, brood, bud, firstPlant, makePlot, nearestNode, newPlant, preview, prune, prunePreview, rootPreview,
  sendRoot, skyLight, stats, tick, type Plant, type Plot, type Seed,
} from './grow-sim';

type Tool = 'bud' | 'prune';
type Row = { season: number; spot: number; gathered: number; reach: number; spread: number; depth: number; leaves: number; changed: string };

let plot: Plot, plant: Plant, seeds: Seed[] = [], parentBody: Plant | null = null;
let season = 1, t = 0, speed = 1, state: 'grow' | 'brood' | 'done' = 'grow';
let verbs = true, tool: Tool = 'bud', hoverSeed = -1;
let history: Row[] = [], lastChanged = '';
let mouse: { x: number; y: number } | null = null;

const canvas = document.getElementById('view') as HTMLCanvasElement;
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d')!;
const hud = document.getElementById('hud')!;
const broodEl = document.getElementById('brood')!;
const $ = (id: string) => document.getElementById(id)!;
const SPOT_NAMES = ['deep shade', 'half shade', 'open', 'sun, stony', 'full sun, stone'];
const LETTERS = 'ABC';

hud.innerHTML = `
  <h1>Toy: Grow a line</h1>
  <p class="muted">The genes grow the plant by themselves. Nutrient is the only currency: roots draw it, leaves
  power the draw. Soil is hidden until roots come near; numbers count the pockets next to a cell.</p>
  <h2>Season <span id="season"></span></h2>
  <div class="bar"><div id="time"></div></div>
  <div class="row"><span>Nutrient</span><b id="store"></b></div>
  <div class="row"><span>Net per s</span><span id="net"></span></div>
  <div class="row"><span>Limited by</span><span id="limit" class="warn"></span></div>
  <h2>Stats</h2>
  <div class="row"><span>Reach</span><span id="reach"></span></div>
  <div class="row"><span>Spread</span><span id="spread"></span></div>
  <div class="row"><span>Depth</span><span id="depth"></span></div>
  <div class="row"><span>Light (leaves)</span><span id="light"></span></div>
  <div class="row"><span>Uptake (roots)</span><span id="uptake"></span></div>
  <div class="row"><span>Upkeep</span><span id="upkeep"></span></div>
  <h2>Verbs</h2>
  <label><input type="checkbox" id="verbs" checked> Verbs on <span class="muted">(off: the genes alone)</span></label>
  <div id="tools"><button data-tool="bud" class="on">Bud [B]</button><button data-tool="prune">Prune [P]</button>
  <p class="muted">Above ground: bud or prune a node. Soil: click to send the nearest root there. Growth keeps
  ${T.reserve} nutrient back for you.</p></div>
  <h2>Speed</h2>
  <button data-speed="0">Pause</button><button data-speed="1" class="on">×1</button><button data-speed="3">×3</button><button data-speed="10">×10</button>
  <h2>Genes</h2><div id="genes"></div>
  <h2>The line</h2><div id="line" class="muted">Season 1 at the open spot.</div>
  <button id="restart">New line</button>`;

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
  plant.reserve = verbs ? T.reserve : 0;
  $('tools').style.opacity = verbs ? '1' : '0.4';
});
$('restart').addEventListener('click', start);
window.addEventListener('keydown', (e) => {
  if (e.key === 'b' || e.key === 'p') (hud.querySelector(`[data-tool="${e.key === 'b' ? 'bud' : 'prune'}"]`) as HTMLButtonElement).click();
});

function genesHtml(g: Genes, changed: number[] = [], from?: Genes) {
  return GENES.map((d, i) => {
    const pips = Array.from({ length: LEVELS + 1 }, (_, k) => `<i class="${k <= g[i] ? 'f' : ''}"></i>`).join('');
    const ch = changed.includes(i) && from ? `<b class="${g[i] > from[i] ? 'up' : 'down'}">${g[i] > from[i] ? '▲' : '▼'}</b>` : '';
    return `<div class="gene${ch ? ' ch' : ''}" title="${d.help}"><span>${d.name}</span><span class="pips">${pips}</span>${ch}</div>`;
  }).join('');
}

function start() {
  plot = makePlot();
  plant = firstPlant(plot);
  plant.reserve = verbs ? T.reserve : 0;
  season = 1; t = 0; state = 'grow'; history = []; seeds = []; lastChanged = '—';
  broodEl.innerHTML = '';
  $('genes').innerHTML = genesHtml(plant.genes);
  $('line').textContent = 'Season 1 at the open spot.';
}

function endSeason() {
  const s = stats(plant);
  history.push({ season, spot: plant.spot, gathered: plant.gathered, ...s, changed: lastChanged });
  $('line').innerHTML = history.map((r) => `S${r.season} · ${SPOT_NAMES[r.spot]} · gathered ${r.gathered.toFixed(0)}`).join('<br>');
  if (season >= T.seasons) { state = 'done'; renderSummary(); return; }
  state = 'brood';
  seeds = brood(plant);
  parentBody = preview(plant.genes);
  renderBrood();
}

function pick(i: number) {
  const s = seeds[i], carry = plant.store * T.carry, from = plant.genes;
  lastChanged = s.changed.map((k) => `${GENES[k].name} ${s.genes[k] > plant.genes[k] ? '+' : '−'}`).join(', ');
  plant = newPlant(s.genes, s.spot, T.startStore + carry, plot);
  plant.reserve = verbs ? T.reserve : 0;
  season++; t = 0; state = 'grow'; seeds = []; hoverSeed = -1;
  broodEl.innerHTML = '';
  $('genes').innerHTML = genesHtml(plant.genes, s.changed, from);
}

function spotInfo(spot: number) {
  const c0 = Math.floor(SPOTS[spot] / CELL);
  let pockets = 0, stone = 0, hidden = 0;
  for (let r = 0; r < ROWS; r++) for (let c = c0 - 3; c <= c0 + 3; c++) {
    if (c < 0 || c >= COLS) continue;
    const cell = plot.cells[r * COLS + c];
    if (!cell.seen) hidden++;
    else if (cell.kind === 'stone') stone++;
    else if (cell.kind === 'pocket' && cell.amount > 5) pockets++;
  }
  return `light ${Math.round(skyLight(SPOTS[spot]) * 100)}% · seen: ${pockets} pockets, ${stone} stone · ${hidden} cells hidden`;
}

const delta = (a: number, b: number) => {
  const d = Math.round(a - b);
  return d === 0 ? '' : ` <span class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d}</span>`;
};

function renderBrood() {
  const ps = stats(parentBody!), carry = plant.store * T.carry;
  broodEl.innerHTML = `<h2>Season ${season} is over: gathered ${plant.gathered.toFixed(0)} nutrient. Pick the heir
    <span class="muted">(each seed carries ${(T.startStore + carry).toFixed(0)}; bodies grown in open ground, ± vs the parent's)</span></h2>
    <div class="cards">${seeds.map((s, i) => {
      const st = stats(s.body);
      return `<div class="card seed" data-i="${i}">
        <b>Seed ${LETTERS[i]}</b> · spot ${s.spot + 1}, ${SPOT_NAMES[s.spot]}
        <canvas width="220" height="170"></canvas>
        <div class="muted">${spotInfo(s.spot)}</div>
        <div class="row"><span>Reach ${Math.round(st.reach)}${delta(st.reach, ps.reach)}</span><span>Spread ${Math.round(st.spread)}${delta(st.spread, ps.spread)}</span></div>
        <div class="row"><span>Depth ${Math.round(st.depth)}${delta(st.depth, ps.depth)}</span><span>Leaves ${st.leaves}${delta(st.leaves, ps.leaves)}</span></div>
        ${genesHtml(s.genes, s.changed, plant.genes)}</div>`;
    }).join('')}</div>`;
  broodEl.querySelectorAll<HTMLElement>('.seed').forEach((el) => {
    const i = Number(el.dataset.i);
    drawThumb(el.querySelector('canvas')!, seeds[i].body);
    el.addEventListener('click', () => pick(i));
    el.addEventListener('mouseenter', () => (hoverSeed = i));
    el.addEventListener('mouseleave', () => (hoverSeed = -1));
  });
}

function renderSummary() {
  const first = history[0];
  broodEl.innerHTML = `<h2>The line after ${T.seasons} seasons</h2>
    <table><tr><th>Season</th><th>Spot</th><th>Gathered</th><th>Reach</th><th>Spread</th><th>Depth</th><th>Leaves</th><th>Mutations taken</th></tr>
    ${history.map((r) => `<tr><td>${r.season}</td><td>${SPOT_NAMES[r.spot]}</td><td>${r.gathered.toFixed(0)}${r === first ? '' : delta(r.gathered, first.gathered)}</td>
      <td>${Math.round(r.reach)}</td><td>${Math.round(r.spread)}</td><td>${Math.round(r.depth)}</td><td>${r.leaves}</td><td class="muted">${r.changed}</td></tr>`).join('')}
    </table><p class="muted">Genes now (right panel). "New line" starts over on a fresh plot.</p>`;
}

// ---- input ----

function toWorld(e: MouseEvent) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}
canvas.addEventListener('mousemove', (e) => (mouse = toWorld(e)));
canvas.addEventListener('mouseleave', () => (mouse = null));
canvas.addEventListener('click', (e) => {
  if (!verbs || state !== 'grow') return;
  const m = toWorld(e);
  if (m.y > GROUND) { sendRoot(plant, m.x, m.y); return; }
  const i = nearestNode(plant, m.x, m.y, 'shoot');
  if (i < 0) return;
  if (tool === 'bud') bud(plant, i, m.x); else prune(plant, i);
});

/** What a click would do here, with its cost. */
function hoverText(): { text: string; ok: boolean; node?: number; line?: [number, number] } | null {
  if (!mouse || !verbs || state !== 'grow') return null;
  const { x, y } = mouse;
  if (y > GROUND) {
    const pr = rootPreview(plant, x, y);
    if (pr.from < 0) return null;
    const n = plant.nodes[pr.from];
    return { text: `Send a root: ~${pr.steps} steps, ≈${pr.cost.toFixed(1)} nutrient${pr.fresh ? ` (incl. a ${BUD_COST} bud now)` : ''}`,
      ok: !pr.fresh || plant.store >= BUD_COST, line: [n.x, n.y] };
  }
  const i = nearestNode(plant, x, y, 'shoot');
  if (i < 0) return null;
  if (tool === 'bud') return { text: `Bud: ${BUD_COST} nutrient, a new branch`, ok: plant.store >= BUD_COST, node: i };
  const p = prunePreview(plant, i);
  return { text: `Prune ${p.parts} parts: +${p.refund.toFixed(1)} back, upkeep −${(p.upkeep * 10).toFixed(2)}/s, a bud wakes below`, ok: true, node: i };
}

// ---- drawing ----

function drawWorld() {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, '#7fbfe8'); sky.addColorStop(1, '#cde8f5');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GROUND);
  ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(W - 60, 45, 22, 0, Math.PI * 2); ctx.fill();
  // the neighbour: a tree whose crown shades the left
  ctx.fillStyle = '#3c2e22'; ctx.fillRect(40, 60, 18, GROUND - 60);
  ctx.fillStyle = '#2f4a2a';
  for (const [cx, cy, r] of [[50, 50, 60], [120, 40, 55], [180, 70, 45], [20, 90, 40]]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
  const shade = ctx.createLinearGradient(T.shadeFrom, 0, T.shadeTo, 0);
  shade.addColorStop(0, 'rgba(20,35,30,0.4)'); shade.addColorStop(1, 'rgba(20,35,30,0)');
  ctx.fillStyle = shade; ctx.fillRect(0, 0, T.shadeTo, GROUND);
  // soil
  ctx.fillStyle = '#4a3726'; ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < plot.cells.length; i++) {
    const cell = plot.cells[i], x = (i % COLS) * CELL, y = GROUND + Math.floor(i / COLS) * CELL;
    if (!cell.seen) {
      ctx.fillStyle = (i * 7919) % 5 < 2 ? '#2e2219' : '#33261b'; ctx.fillRect(x, y, CELL, CELL);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
      continue;
    }
    ctx.fillStyle = '#6b5038'; ctx.fillRect(x, y, CELL, CELL);
    if (cell.kind === 'stone') {
      ctx.fillStyle = '#8d8c88'; ctx.beginPath(); ctx.roundRect(x + 2, y + 2, CELL - 4, CELL - 4, 5); ctx.fill();
      ctx.fillStyle = '#6f6e6a'; ctx.fillRect(x + 6, y + 8, 8, 3);
    } else if (cell.kind === 'pocket') {
      const k = cell.amount / cell.max;
      ctx.fillStyle = `rgba(232,180,60,${0.25 + 0.75 * k})`;
      ctx.beginPath(); ctx.arc(x + CELL / 2, y + CELL / 2, 3 + 7 * k, 0, Math.PI * 2); ctx.fill();
    } else if (cell.hint) {
      ctx.fillStyle = ['', '#d8c890', '#f0b84a', '#ff8a4a', '#ff5a5a'][Math.min(cell.hint, 4)];
      ctx.fillText(String(cell.hint), x + CELL / 2, y + CELL / 2 + 1);
    }
  }
  ctx.fillStyle = '#5c8a3a'; ctx.fillRect(0, GROUND - 3, W, 4);
  SPOTS.forEach((x, s) => {
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - 1, GROUND - 8, 2, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px system-ui'; ctx.fillText(String(s + 1), x, GROUND - 14);
  });
}

function drawPlant(c: CanvasRenderingContext2D, p: Plant, alpha = 1) {
  c.globalAlpha = alpha; c.lineCap = 'round';
  for (const n of p.nodes) {
    if (n.dead || n.parent < 0) continue;
    const q = p.nodes[n.parent];
    c.strokeStyle = n.kind === 'shoot' ? '#3d6b2a' : '#e2cc96';
    c.lineWidth = n.order === 0 ? 2.5 : 1.5;
    c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(n.x, n.y); c.stroke();
  }
  for (const n of p.nodes) {
    if (n.dead) continue;
    if (n.leaf) {
      const g = Math.round(110 + 110 * n.light);
      c.fillStyle = `rgb(${60 + 20 * n.light},${g},50)`;
      c.beginPath(); c.ellipse(n.x + 2, n.y, 2 + n.leaf * 1.2, 1.2 + n.leaf * 0.6, -0.5, 0, Math.PI * 2); c.fill();
    }
    if (n.tip) { c.fillStyle = n.kind === 'shoot' ? '#b5f07a' : '#fff1c4'; c.fillRect(n.x - 1, n.y - 1, 2, 2); }
    if (n.target) {
      c.strokeStyle = 'rgba(255,230,120,0.7)'; c.setLineDash([3, 3]); c.lineWidth = 1;
      c.beginPath(); c.moveTo(n.x, n.y); c.lineTo(n.target.x, n.target.y); c.stroke(); c.setLineDash([]);
    }
  }
  c.globalAlpha = 1;
}

function drawThumb(cv: HTMLCanvasElement, p: Plant) {
  const c = cv.getContext('2d')!;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const n of p.nodes) if (!n.dead) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); }
  const s = Math.min(1, (cv.width - 20) / (x1 - x0 + 1), (cv.height - 10) / (y1 - y0 + 1));
  c.fillStyle = '#cde8f5'; c.fillRect(0, 0, cv.width, cv.height);
  const gy = 5 + (GROUND - y0) * s;
  c.fillStyle = '#4a3726'; c.fillRect(0, gy, cv.width, cv.height - gy);
  c.save(); c.translate(cv.width / 2 - p.x * s, 5 - y0 * s); c.scale(s, s);
  drawPlant(c, p); c.restore();
}

function draw() {
  drawWorld();
  drawPlant(ctx, plant, state === 'grow' ? 1 : 0.45);
  if (state === 'brood') {
    seeds.forEach((s, i) => {
      const x = SPOTS[s.spot], on = hoverSeed === i;
      ctx.fillStyle = on ? '#ffe36b' : '#f5f0dc'; ctx.beginPath(); ctx.ellipse(x, GROUND - 4, on ? 7 : 5, on ? 5 : 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 14px system-ui'; ctx.fillText(LETTERS[i], x, GROUND - 26);
      if (on) { ctx.strokeStyle = '#ffe36b'; ctx.strokeRect(x - 3.5 * CELL, GROUND, 7 * CELL, H - GROUND); }
    });
  }
  const h = hoverText();
  if (h && mouse) {
    if (h.node !== undefined) {
      const n = plant.nodes[h.node];
      ctx.strokeStyle = tool === 'prune' ? '#ff6a5a' : '#ffe36b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(n.x, n.y, 6, 0, Math.PI * 2); ctx.stroke();
    }
    if (h.line) {
      ctx.strokeStyle = 'rgba(255,230,120,0.5)'; ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(h.line[0], h.line[1]); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.font = '12px system-ui'; ctx.textAlign = 'left';
    const w = ctx.measureText(h.text).width + 12, bx = Math.min(mouse.x + 12, W - w - 4), by = Math.max(mouse.y - 26, 4);
    ctx.fillStyle = 'rgba(20,22,26,0.88)'; ctx.fillRect(bx, by, w, 20);
    ctx.fillStyle = h.ok ? '#e6e6e6' : '#ff8a7a'; ctx.fillText(h.text, bx + 6, by + 11);
    ctx.textAlign = 'center';
  }
  const s = stats(plant), f = plant.flow;
  $('season').textContent = `${season} / ${T.seasons}${state === 'grow' ? '' : state === 'brood' ? ', pick the heir' : ', done'}`;
  $('time').style.width = `${(100 * t) / T.seasonTicks}%`;
  $('store').textContent = plant.store.toFixed(1);
  const net = (f.income - f.upkeep) * 10;
  $('net').innerHTML = `<span class="${net >= 0 ? 'up' : 'down'}">${net >= 0 ? '+' : ''}${net.toFixed(2)}</span>`;
  $('limit').textContent = f.limit === 'light' ? 'light: more or higher leaves' : 'roots: find pockets';
  $('reach').textContent = `${Math.round(s.reach)} cm`;
  $('spread').textContent = `${Math.round(s.spread)} cm`;
  $('depth').textContent = `${Math.round(s.depth)} cm`;
  $('light').textContent = `${(f.light * 10).toFixed(2)}/s · ${s.leaves} leaves`;
  $('uptake').textContent = `${(f.uptake * 10).toFixed(2)}/s`;
  $('upkeep').textContent = `${(f.upkeep * 10).toFixed(2)}/s`;
  requestAnimationFrame(draw);
}

start();
setInterval(() => {
  for (let k = 0; k < speed && state === 'grow'; k++) {
    tick(plant, plot, ++t);
    if (t >= T.seasonTicks) endSeason();
  }
}, T.tickMs);
requestAnimationFrame(draw);

export {};
