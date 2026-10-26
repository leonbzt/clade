// Toy 4, Colony: view and input. Tap to drop a spore; hold and slide to collect dew and spores.
// Throwaway toy for slice 02.
import { W, H, CELL, T, GENES, COMBOS, SKILL } from './colony-data';
import { S, N, SAND, ASH, CRACK, tick, newIsland, canDrop, tryDrop, collect, hint, sensed, pickGene, passOffer, level, activeCombos, goalList } from './colony-sim';

let speed = 1;
let hover = -1;

const canvas = document.getElementById('view') as HTMLCanvasElement;
canvas.width = W * CELL; canvas.height = H * CELL;
canvas.style.touchAction = 'none';
const ctx = canvas.getContext('2d')!;
const hud = document.getElementById('hud')!;
hud.innerHTML = `
  <h1>Toy 4: Colony</h1>
  <p class="muted">Tap a lit tile near your moss to drop a spore (outlined when you can). Hold and slide over blue
  dew and yellow spores to collect them. Numbers show how many damp tiles touch that tile, including hidden ones.
  Surround lichen (orange) to take it. Amber glints are hidden ash.</p>
  <h2>Weather</h2><p id="phase"></p>
  <h2>Generation</h2><p id="gen"></p>
  <h2>Gene offer</h2><div id="offer"></div>
  <h2>Skill</h2><p id="skill"></p>
  <h2>Goals</h2><div id="goals"></div>
  <h2>Colony</h2><div id="stats"></div>
  <h2>Genes</h2><p id="genes" class="muted"></p>
  <h2>Run</h2>
  <button data-speed="1" class="on">×1</button><button data-speed="4">×4</button><button data-speed="16">×16</button><br>
  <button id="replay">Replay island</button><button id="island">New island</button>`;

const $ = (id: string) => document.getElementById(id)!;
hud.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach((el) =>
  el.addEventListener('click', () => {
    speed = Number(el.dataset.speed);
    hud.querySelectorAll('[data-speed]').forEach((b) => b.classList.toggle('on', b === el));
  }));
$('replay').addEventListener('click', () => newIsland(S.seed));
$('island').addEventListener('click', () => newIsland(Math.floor(Math.random() * 1e9)));

// ---- input: a short tap drops, a drag collects ----
let down = false, moved = 0, collectedThisPress = false;
let last: { x: number; y: number } | null = null;
let trail: { x: number; y: number; t: number }[] = [];

function toPx(e: PointerEvent) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * canvas.width, y: ((e.clientY - r.top) / r.height) * canvas.height };
}
const tileAt = (p: { x: number; y: number }) => {
  const x = Math.floor(p.x / CELL), y = Math.floor(p.y / CELL);
  return x >= 0 && y >= 0 && x < W && y < H ? y * W + x : -1;
};

function collectNear(p: { x: number; y: number }) {
  for (const i of [...S.items.keys()]) {
    const cx = (i % W) * CELL + CELL / 2, cy = ((i / W) | 0) * CELL + CELL / 2;
    if (Math.hypot(cx - p.x, cy - p.y) <= T.collectRadius * CELL) { collect(i); collectedThisPress = true; }
  }
}

canvas.addEventListener('pointerdown', (e) => {
  down = true; moved = 0; collectedThisPress = false;
  last = toPx(e);
  canvas.setPointerCapture(e.pointerId);
  collectNear(last);
});
canvas.addEventListener('pointermove', (e) => {
  const p = toPx(e);
  hover = tileAt(p);
  if (!down || !last) return;
  const d = Math.hypot(p.x - last.x, p.y - last.y), steps = Math.max(1, Math.ceil(d / (CELL / 2)));
  for (let k = 1; k <= steps; k++) collectNear({ x: last.x + ((p.x - last.x) * k) / steps, y: last.y + ((p.y - last.y) * k) / steps });
  moved += d; last = p;
  trail.push({ ...p, t: performance.now() });
});
canvas.addEventListener('pointerup', (e) => {
  if (down && moved < 8 && !collectedThisPress) {
    const i = tileAt(toPx(e));
    if (i >= 0) tryDrop(i);
  }
  down = false; last = null;
});
canvas.addEventListener('pointerleave', () => { hover = -1; });

// ---- drawing ----
const HINT_COLORS = ['', '#9fd8ff', '#6fbaff', '#4a90ff', '#7a6bff', '#b06bff', '#ff6bd0', '#ff6b6b', '#ff3b3b'];

function tileColor(i: number): string {
  if (!S.revealed[i]) return '#141619';
  if (S.covered[i]) {
    const b = 0.45 + 0.55 * S.biomass[i];
    return S.brown[i] ? `rgb(${120 * b},${85 * b},${45 * b})` : `rgb(${50 * b},${150 * b},${60 * b})`;
  }
  if (S.lichen[i]) {
    const v = ((i * 2654435761) >>> 28) / 16;
    return `rgb(${170 + 30 * v},${130 + 20 * v},${80 + 10 * v})`;
  }
  if (S.terrain[i] === SAND) return '#c2ad7a';
  if (S.terrain[i] === ASH) return '#5a3a30';
  const m = Math.min(1, S.moisture[i]), crack = S.terrain[i] === CRACK ? 12 : 0;
  return `rgb(${42 + 10 * m + crack},${42 + 20 * m + crack},${48 + 50 * m + crack})`;
}

function draw(now: number) {
  ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < N; i++) {
    const x = (i % W) * CELL, y = ((i / W) | 0) * CELL;
    ctx.fillStyle = tileColor(i);
    ctx.fillRect(x, y, CELL - 1, CELL - 1);
    if (S.ashFound[i] && S.covered[i]) { ctx.fillStyle = '#ff9f5a'; ctx.fillRect(x + 5, y + 5, 3, 3); }
    if (sensed(i)) {
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now / 250 + i);
      ctx.fillStyle = '#ffb347'; ctx.fillRect(x + 5, y + 5, 3, 3);
      ctx.globalAlpha = 1;
    }
    const h = hint(i);
    if (h) { ctx.fillStyle = HINT_COLORS[h]; ctx.fillText(String(h), x + CELL / 2, y + CELL / 2 + 1); }
  }
  for (const [i, it] of S.items) {
    ctx.fillStyle = it.kind === 'dew' ? '#7fd4ff' : '#ffe066';
    ctx.globalAlpha = Math.min(1, it.life / 40);
    ctx.beginPath();
    ctx.arc((i % W) * CELL + CELL / 2, ((i / W) | 0) * CELL + CELL / 2, it.kind === 'dew' ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (hover >= 0 && !down && canDrop(hover)) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.strokeRect((hover % W) * CELL + 1, ((hover / W) | 0) * CELL + 1, CELL - 3, CELL - 3);
  }
  trail = trail.filter((p) => now - p.t < 250);
  if (trail.length > 1) {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.beginPath();
    trail.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  }
  updateHud();
  requestAnimationFrame(draw);
}

let shownOffer = -1;
function renderOffer() {
  const el = $('offer');
  if (!S.offer.length) { el.innerHTML = `<p class="muted">${S.genes.length === GENES.length ? 'All genes taken.' : 'Next offer with the next generation.'}</p>`; return; }
  const have = new Set(S.genes.map((g) => g.id));
  el.innerHTML = S.offer.map((g, k) => {
    const combo = COMBOS.find((c) => c.needs.includes(g.id))!;
    const partner = GENES.find((p) => p.id === combo.needs.find((n) => n !== g.id))!;
    const done = have.has(partner.id);
    return `<div class="card" data-k="${k}"><b>${g.name}</b><br><span class="up">+ ${g.up}</span><br>
      <span class="down">− ${g.down}</span><br><span class="${done ? 'warn' : 'muted'}">${done ? 'Completes' : 'Combo with ' + partner.name + ':'}
      ${combo.name} (${combo.text})</span></div>`;
  }).join('') + '<button id="pass">Pass</button>';
  el.querySelectorAll<HTMLElement>('[data-k]').forEach((c) => c.addEventListener('click', () => pickGene(Number(c.dataset.k))));
  $('pass').addEventListener('click', passOffer);
}

function updateHud() {
  if (shownOffer !== S.offerVersion) { shownOffer = S.offerVersion; renderOffer(); }
  const left = Math.ceil((T.phases[S.phase] - S.phaseTick) / 10);
  $('phase').innerHTML = S.phase === 'wet' ? `Damp. Dry spell warning in ${left} s`
    : S.phase === 'warn' ? `<span class="warn">Dry spell in ${left} s: dew is out!</span>` : `<span class="warn">Dry spell, ${left} s left</span>`;
  const genLeft = Math.ceil((T.genTicks - (S.tick % T.genTicks)) / 10);
  $('gen').innerHTML = `Spore drops: <b>${S.drops}</b> / ${T.drops.cap}. +${S.mods.dropsPerGen} in ${genLeft} s. Range ${S.mods.dropRange} tiles.`;
  const lv = level(), next = SKILL.xp[lv];
  $('skill').innerHTML = `${SKILL.name} level <b>${lv}</b> (${S.xp}${next ? ' / ' + next : ''} tiles)` +
    (next ? `<br><span class="muted">Next: ${SKILL.perks[lv]}</span>` : '');
  $('goals').innerHTML = goalList().map((g) => `<div class="row"><span>${g.at !== undefined ? '✔' : '○'} ${g.text}</span>
    <span class="muted">${g.at !== undefined ? g.at + ' s' : ''}</span></div>`).join('');
  let cov = 0, br = 0;
  for (let i = 0; i < N; i++) if (S.covered[i]) { cov++; br += S.brown[i]; }
  $('stats').innerHTML = `<div class="row"><span>Cover</span><span>${cov} tiles</span></div>
    <div class="row"><span>Brown</span><span>${br}</span></div>
    <div class="row"><span>Lichen taken</span><span>${S.lichenTaken}</span></div>
    <div class="row"><span>Ash pockets</span><span>${S.ashCount}</span></div>`;
  const combos = activeCombos().map((c) => c.name);
  $('genes').innerHTML = (S.genes.map((g) => g.name).join(', ') || 'none') + (combos.length ? `<br><span class="warn">Combos: ${combos.join(', ')}</span>` : '');
}

newIsland(1);
setInterval(() => { for (let k = 0; k < speed; k++) tick(); }, T.tickMs);
requestAnimationFrame(draw);
