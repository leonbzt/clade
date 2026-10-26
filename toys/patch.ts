// Toy 1, Patch: fixed rules, spatial verbs. Steer the spread, tap dew and spores, ride out dry spells.
// Throwaway toy for slice 02. Tuning constants sit at the top on purpose.

const W = 48, H = 32, CELL = 16;

const T = {
  tickMs: 100,
  ventRadius: 16, // moisture reaches 0 this many tiles from the vent
  crackShare: 0.1, // share of tiles that are sheltered cracks
  crackMoisture: 0.3,
  uptake: 0.03, // water per tick at moisture 1
  evap: 0.012,
  evapDry: 0.02,
  dryUptake: 0.5, // uptake factor during a dry spell
  rain: 0.4, // water added to every tile when a dry spell ends
  brownAt: 0.08,
  reviveAt: 0.3,
  growth: 0.01, // biomass per tick at full water
  spreadChance: 0.03, // per green tile per tick, × biomass × water share
  steerBias: 4,
  phases: { wet: 400, warn: 100, dry: 200 }, // ticks
  dewChance: 0.0002, // per covered tile per tick
  dewWarnBoost: 4,
  sporeChance: 0.0003, // per edge tile per tick
  itemLife: 150,
  dewSplash: 3,
  dewWater: 0.6,
};

const TRAITS = {
  creeping: { label: 'Creeping shoots', note: 'spread ×2, evaporation ×1.5', spread: 2, evap: 1.5, hold: 1 },
  tufts: { label: 'Dense tufts', note: 'holds ×1.6 water, spread ×0.5', spread: 0.5, evap: 1, hold: 1.6 },
};
type TraitId = keyof typeof TRAITS;
type Phase = 'wet' | 'warn' | 'dry';
type Item = { kind: 'dew' | 'spore'; life: number };

const N = W * H;
const moisture = new Float32Array(N);
const covered = new Uint8Array(N);
const brown = new Uint8Array(N);
const biomass = new Float32Array(N);
const water = new Float32Array(N);
const items = new Map<number, Item>();
const traits = new Set<TraitId>();
let flag = -1;
let phase: Phase = 'wet';
let phaseTick = 0;
let genes = 0;
let speed = 1;

const idx = (x: number, y: number) => y * W + x;
const NB = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

function neighbours(i: number): number[] {
  const x = i % W, y = (i / W) | 0, out: number[] = [];
  for (const [dx, dy] of NB) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < W && ny < H) out.push(idx(nx, ny));
  }
  return out;
}

function mod(key: 'spread' | 'evap' | 'hold'): number {
  let m = 1;
  for (const t of traits) m *= TRAITS[t][key];
  return m;
}

function reset() {
  const vx = W / 2, vy = H / 2;
  for (let i = 0; i < N; i++) {
    const d = Math.hypot((i % W) - vx, ((i / W) | 0) - vy);
    moisture[i] = Math.max(0, 1 - d / T.ventRadius) + (Math.random() < T.crackShare ? T.crackMoisture : 0);
    covered[i] = brown[i] = 0;
    biomass[i] = water[i] = 0;
  }
  const c = idx(vx, vy);
  covered[c] = 1; biomass[c] = 0.5; water[c] = 0.5;
  items.clear(); flag = -1; phase = 'wet'; phaseTick = 0; genes = 0;
}

function advancePhase() {
  phaseTick++;
  if (phaseTick < T.phases[phase]) return;
  phaseTick = 0;
  if (phase === 'wet') phase = 'warn';
  else if (phase === 'warn') phase = 'dry';
  else {
    phase = 'wet';
    for (let i = 0; i < N; i++) if (covered[i]) water[i] = Math.min(mod('hold'), water[i] + T.rain);
  }
}

function pickSpreadTarget(i: number): number {
  const x = i % W, y = (i / W) | 0;
  const opts = neighbours(i).filter((n) => !covered[n]);
  if (!opts.length) return -1;
  const weights = opts.map((n) => {
    let w = 0.1 + moisture[n];
    if (flag >= 0) {
      const fx = (flag % W) - x, fy = ((flag / W) | 0) - y, fl = Math.hypot(fx, fy) || 1;
      const nx = (n % W) - x, ny = ((n / W) | 0) - y, nl = Math.hypot(nx, ny);
      w += T.steerBias * Math.max(0, (fx * nx + fy * ny) / (fl * nl)) ** 2;
    }
    return w;
  });
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let k = 0; k < opts.length; k++) if ((r -= weights[k]) <= 0) return opts[k];
  return opts[opts.length - 1];
}

function tick() {
  advancePhase();
  const dry = phase === 'dry';
  const hold = mod('hold'), evap = (dry ? T.evapDry : T.evap) * mod('evap'), spread = mod('spread');
  const born: number[] = [];
  for (let i = 0; i < N; i++) {
    if (!covered[i]) continue;
    water[i] += T.uptake * moisture[i] * (dry ? T.dryUptake : 1) - evap;
    water[i] = Math.min(hold, Math.max(0, water[i]));
    if (brown[i] && water[i] > T.reviveAt) brown[i] = 0;
    else if (!brown[i] && water[i] < T.brownAt) brown[i] = 1;
    if (brown[i]) continue;
    const share = water[i] / hold;
    biomass[i] = Math.min(1, biomass[i] + T.growth * share);
    if (Math.random() < T.spreadChance * biomass[i] * share * spread) {
      const n = pickSpreadTarget(i);
      if (n >= 0) { born.push(n); water[i] *= 0.7; }
    }
    if (!items.has(i)) {
      const edge = neighbours(i).some((n) => !covered[n]);
      if (Math.random() < T.dewChance * (phase === 'warn' ? T.dewWarnBoost : 1)) items.set(i, { kind: 'dew', life: T.itemLife });
      else if (edge && Math.random() < T.sporeChance) items.set(i, { kind: 'spore', life: T.itemLife });
    }
  }
  for (const n of born) { covered[n] = 1; biomass[n] = 0.1; water[n] = 0.3; }
  for (const [i, it] of items) if (--it.life <= 0) items.delete(i);
}

function collect(i: number) {
  const it = items.get(i)!;
  items.delete(i);
  if (it.kind === 'spore') { genes++; return; }
  const x = i % W, y = (i / W) | 0;
  for (let j = 0; j < N; j++) {
    if (covered[j] && Math.hypot((j % W) - x, ((j / W) | 0) - y) <= T.dewSplash) {
      water[j] = Math.min(mod('hold'), water[j] + T.dewWater);
    }
  }
}

// ---- view ----
const canvas = document.getElementById('view') as HTMLCanvasElement;
canvas.width = W * CELL; canvas.height = H * CELL;
const ctx = canvas.getContext('2d')!;
const hud = document.getElementById('hud')!;

hud.innerHTML = `
  <h1>Toy 1: Patch</h1>
  <p class="muted">Click empty ground to plant a flag the spread leans toward (click it again to clear). Tap blue dew
  to water nearby moss. Tap yellow spores for genes. Brown moss is dormant, not dead.</p>
  <h2>Weather</h2><p id="phase"></p>
  <h2>Colony</h2>
  <div class="row"><span>Cover</span><span id="cover"></span></div>
  <div class="row"><span>Biomass</span><span id="bio"></span></div>
  <div class="row"><span>Brown</span><span id="brown"></span></div>
  <div class="row"><span>Genes</span><span id="genes"></span></div>
  <h2>Traits (bets)</h2>
  ${Object.entries(TRAITS).map(([id, t]) => `<label><input type="checkbox" data-trait="${id}"> ${t.label} <span class="muted">${t.note}</span></label>`).join('')}
  <h2>Speed</h2>
  <button data-speed="1" class="on">×1</button><button data-speed="4">×4</button><button data-speed="16">×16</button>
  <button id="reset">Reset</button>`;

const $ = (id: string) => document.getElementById(id)!;
hud.querySelectorAll<HTMLInputElement>('[data-trait]').forEach((el) =>
  el.addEventListener('change', () => (el.checked ? traits.add(el.dataset.trait as TraitId) : traits.delete(el.dataset.trait as TraitId))));
hud.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach((el) =>
  el.addEventListener('click', () => {
    speed = Number(el.dataset.speed);
    hud.querySelectorAll('[data-speed]').forEach((b) => b.classList.toggle('on', b === el));
  }));
$('reset').addEventListener('click', reset);

canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = Math.floor(((e.clientX - r.left) / r.width) * W), y = Math.floor(((e.clientY - r.top) / r.height) * H);
  const i = idx(x, y);
  const near = [i, ...neighbours(i)].find((j) => items.has(j));
  if (near !== undefined) collect(near);
  else flag = flag === i ? -1 : i;
});

function draw() {
  for (let i = 0; i < N; i++) {
    const x = (i % W) * CELL, y = ((i / W) | 0) * CELL, m = Math.min(1, moisture[i]);
    if (covered[i]) {
      const b = 0.4 + 0.6 * biomass[i];
      ctx.fillStyle = brown[i] ? `rgb(${120 * b},${85 * b},${45 * b})` : `rgb(${50 * b},${150 * b},${60 * b})`;
    } else ctx.fillStyle = `rgb(${40 + 10 * m},${40 + 20 * m},${45 + 45 * m})`;
    ctx.fillRect(x, y, CELL - 1, CELL - 1);
  }
  for (const [i, it] of items) {
    ctx.fillStyle = it.kind === 'dew' ? '#7fd4ff' : '#ffe066';
    ctx.globalAlpha = Math.min(1, it.life / 40);
    ctx.beginPath();
    ctx.arc((i % W) * CELL + CELL / 2, ((i / W) | 0) * CELL + CELL / 2, it.kind === 'dew' ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (flag >= 0) {
    const x = (flag % W) * CELL, y = ((flag / W) | 0) * CELL;
    ctx.fillStyle = '#ff5a4f';
    ctx.beginPath(); ctx.moveTo(x + 3, y + 2); ctx.lineTo(x + 14, y + 6); ctx.lineTo(x + 3, y + 10); ctx.fill();
    ctx.fillRect(x + 2, y + 2, 2, 13);
  }
  let cov = 0, bio = 0, br = 0;
  for (let i = 0; i < N; i++) if (covered[i]) { cov++; bio += biomass[i]; br += brown[i]; }
  const left = Math.ceil((T.phases[phase] - phaseTick) / 10);
  $('phase').innerHTML = phase === 'wet' ? `Damp. Dry spell warning in ${left} s`
    : phase === 'warn' ? `<span class="warn">Dry spell in ${left} s: dew is out!</span>` : `<span class="warn">Dry spell, ${left} s left</span>`;
  $('cover').textContent = `${cov} tiles (${((100 * cov) / N).toFixed(0)}%)`;
  $('bio').textContent = bio.toFixed(1);
  $('brown').textContent = String(br);
  $('genes').textContent = String(genes);
  requestAnimationFrame(draw);
}

reset();
setInterval(() => { for (let k = 0; k < speed; k++) tick(); }, T.tickMs);
requestAnimationFrame(draw);

export {};
