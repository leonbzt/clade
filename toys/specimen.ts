// Toy 2, Specimen: grow one plant. Shoots reach for light, roots for water pockets (space colonization,
// Runions 2007). The plant is an organ graph; each growth step first collects all moves, then applies them
// (the VPL rewrite style). Throwaway toy for slice 02. Tuning constants sit at the top on purpose.

const CW = 768, CH = 512, GROUND = 300;

const T = {
  tickMs: 100,
  growEvery: 3, // ticks between growth steps
  seg: 7, // segment length, px
  influence: 70, // attractor reach, px
  kill: 9, // attractor is captured within this distance
  lightPoints: 260,
  soilPockets: 7,
  soilPerPocket: 24,
  tropism: 0.35, // shoots lean up, roots lean down
  leafLight: 0.02, // energy per leaf per tick in full light
  rootWater: 0.02, // water per captured pocket point per tick
  trickle: 0.02, // base energy and water per tick
  shadeX: 230, // the neighbour shades everything left of this
  shadeLight: 0.3,
  cost: { shoot: { energy: 1, water: 1 }, root: { energy: 1, water: 0 } },
  presets: { shoots: { shoot: 2, root: 0 }, even: { shoot: 1, root: 1 }, roots: { shoot: 0, root: 2 } },
  grazerEvery: 450,
  grazerReach: 130, // grazers eat leaves lower than this above ground
  biteEvery: 12,
  bitterShootCost: 1, // extra energy per shoot with Bitter leaves
};

type Kind = 'shoot' | 'root';
type Preset = keyof typeof T.presets;
type Organ = { x: number; y: number; parent: number; kind: Kind; leaves: number; pockets: number; children: number; dead: boolean };
type Attractor = { x: number; y: number; kind: Kind; by: number }; // by = capturing organ, or -1
type Grazer = { x: number; state: 'walk' | 'eat' | 'leave'; bite: number };
type Pt = { x: number; y: number };

const SEED = { x: CW * 0.55, y: GROUND };
let organs: Organ[] = [];
let attractors: Attractor[] = [];
let energy = 0, water = 0, tickNo = 0, speed = 1;
let preset: Preset = 'even';
let focus: Record<Kind, Pt | null> = { shoot: null, root: null };
let grazer: Grazer | null = null;
let bitter = false;

const light = (x: number) => (x < T.shadeX ? T.shadeLight : 1);
const alive = () => organs.filter((o) => !o.dead);

function reset() {
  organs = [
    { x: SEED.x, y: GROUND - T.seg, parent: -1, kind: 'shoot', leaves: 0, pockets: 0, children: 0, dead: false },
    { x: SEED.x, y: GROUND + T.seg, parent: -1, kind: 'root', leaves: 0, pockets: 0, children: 0, dead: false },
  ];
  attractors = [];
  for (let i = 0; i < T.lightPoints; i++) {
    attractors.push({ x: Math.random() * CW, y: 15 + Math.random() * (GROUND - 25), kind: 'shoot', by: -1 });
  }
  for (let p = 0; p < T.soilPockets; p++) {
    // The first pocket sits under the seed so the roots always have somewhere to start.
    const cx = p === 0 ? SEED.x - 20 + Math.random() * 40 : 40 + Math.random() * (CW - 80);
    const cy = p === 0 ? GROUND + 45 : GROUND + 30 + Math.random() * (CH - GROUND - 50);
    for (let i = 0; i < T.soilPerPocket; i++) {
      attractors.push({ x: cx + (Math.random() - 0.5) * 50, y: cy + (Math.random() - 0.5) * 30, kind: 'root', by: -1 });
    }
  }
  energy = 10; water = 10; tickNo = 0; grazer = null; focus = { shoot: null, root: null };
}

/** Collect: every free attractor pulls on its nearest organ of the same kind. */
function collectMoves(): Map<number, Pt> {
  const pull = new Map<number, Pt>();
  const live = organs.map((o, i) => [o, i] as const).filter(([o]) => !o.dead);
  for (const a of attractors) {
    if (a.by >= 0) continue;
    let best = -1, bd = T.influence ** 2;
    for (const [o, i] of live) {
      if (o.kind !== a.kind) continue;
      const d = (o.x - a.x) ** 2 + (o.y - a.y) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    if (best < 0) continue;
    const o = organs[best], l = Math.sqrt(bd) || 1, p = pull.get(best) ?? { x: 0, y: 0 };
    p.x += (a.x - o.x) / l; p.y += (a.y - o.y) / l;
    pull.set(best, p);
  }
  return pull;
}

/** Apply: grow the chosen organs, cheapest-to-focus first, within the preset's quota and the budget. */
function growStep() {
  const pull = collectMoves();
  for (const kind of ['shoot', 'root'] as Kind[]) {
    const f = focus[kind];
    const cands = [...pull.keys()].filter((i) => organs[i].kind === kind).sort((a, b) => {
      if (!f) return Math.random() - 0.5;
      return Math.hypot(organs[a].x - f.x, organs[a].y - f.y) - Math.hypot(organs[b].x - f.x, organs[b].y - f.y);
    });
    const cost = T.cost[kind], extra = kind === 'shoot' && bitter ? T.bitterShootCost : 0;
    let quota = T.presets[preset][kind];
    for (const i of cands) {
      if (quota <= 0 || energy < cost.energy + extra || water < cost.water) break;
      const o = organs[i], p = pull.get(i)!;
      p.y += kind === 'shoot' ? -T.tropism : T.tropism;
      const l = Math.hypot(p.x, p.y) || 1;
      const nx = o.x + (p.x / l) * T.seg, ny = o.y + (p.y / l) * T.seg;
      if (kind === 'shoot' ? ny > GROUND - 2 : ny < GROUND + 2) continue;
      if (organs.some((q) => !q.dead && Math.hypot(q.x - nx, q.y - ny) < T.seg * 0.4)) continue;
      energy -= cost.energy + extra; water -= cost.water; quota--;
      organs.push({ x: nx, y: ny, parent: i, kind, leaves: 0, pockets: 0, children: 0, dead: false });
      o.children++;
      capture(organs.length - 1);
    }
  }
}

function capture(oi: number) {
  const o = organs[oi];
  for (const a of attractors) {
    if (a.by >= 0 || a.kind !== o.kind || Math.hypot(a.x - o.x, a.y - o.y) > T.kill) continue;
    a.by = oi;
    if (o.kind === 'shoot') o.leaves++; else o.pockets++;
  }
}

function graze() {
  if (!grazer) {
    if (tickNo % T.grazerEvery === 0) grazer = { x: CW + 20, state: 'walk', bite: 0 };
    return;
  }
  const g = grazer;
  if (g.state === 'leave') { g.x += 5; if (g.x > CW + 40) grazer = null; return; }
  if (g.state === 'walk') {
    g.x -= 1.5;
    if (bitter && g.x < SEED.x + 120) g.state = 'leave';
    else if (g.x < SEED.x + 40) g.state = 'eat';
    return;
  }
  if (++g.bite % T.biteEvery) return;
  const food = organs
    .map((o, i) => [o, i] as const)
    .filter(([o]) => !o.dead && o.kind === 'shoot' && o.children === 0 && o.leaves > 0 && GROUND - o.y < T.grazerReach);
  if (!food.length) { g.state = 'leave'; return; }
  const [o, i] = food[Math.floor(Math.random() * food.length)];
  o.dead = true;
  if (o.parent >= 0) organs[o.parent].children--;
  for (const a of attractors) if (a.by === i) a.by = -1;
}

function tick() {
  tickNo++;
  for (const o of alive()) {
    if (o.kind === 'shoot') energy += o.leaves * T.leafLight * light(o.x);
    else water += o.pockets * T.rootWater;
  }
  energy += T.trickle; water += T.trickle;
  if (tickNo % T.growEvery === 0) growStep();
  graze();
}

// ---- view ----
const canvas = document.getElementById('view') as HTMLCanvasElement;
canvas.width = CW; canvas.height = CH;
const ctx = canvas.getContext('2d')!;
const hud = document.getElementById('hud')!;
hud.innerHTML = `
  <h1>Toy 2: Specimen</h1>
  <p class="muted">Click the sky to set where shoots grow, or the soil for roots (click the marker again to clear).
  Leaves make energy and roots bring water. Every shoot costs both. Click a grazer to shoo it.</p>
  <h2>Stores</h2>
  <div class="row"><span>Energy</span><span id="energy"></span></div>
  <div class="row"><span>Water</span><span id="water"></span></div>
  <h2>Plant</h2>
  <div class="row"><span>Height</span><span id="height"></span></div>
  <div class="row"><span>Leaves (in shade)</span><span id="leaves"></span></div>
  <div class="row"><span>Root pockets</span><span id="pockets"></span></div>
  <h2>Grow</h2>
  <button data-preset="shoots">Shoots</button><button data-preset="even" class="on">Even</button><button data-preset="roots">Roots</button>
  <label><input type="checkbox" id="bitter"> Bitter leaves <span class="muted">grazers turn away, shoots cost +1 energy</span></label>
  <h2>Speed</h2>
  <button data-speed="1" class="on">×1</button><button data-speed="4">×4</button><button data-speed="16">×16</button>
  <button id="reset">New plant</button>`;

const $ = (id: string) => document.getElementById(id)!;
const group = (attr: string, set: (v: string) => void) =>
  hud.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((el) =>
    el.addEventListener('click', () => {
      set(el.getAttribute(attr)!);
      hud.querySelectorAll(`[${attr}]`).forEach((b) => b.classList.toggle('on', b === el));
    }));
group('data-preset', (v) => (preset = v as Preset));
group('data-speed', (v) => (speed = Number(v)));
$('bitter').addEventListener('change', (e) => (bitter = (e.target as HTMLInputElement).checked));
$('reset').addEventListener('click', reset);

canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * CW, y = ((e.clientY - r.top) / r.height) * CH;
  if (grazer && Math.abs(x - grazer.x) < 30 && Math.abs(y - (GROUND - 18)) < 25) { grazer.state = 'leave'; return; }
  const kind: Kind = y < GROUND ? 'shoot' : 'root';
  const f = focus[kind];
  focus[kind] = f && Math.hypot(f.x - x, f.y - y) < 15 ? null : { x, y };
});

function draw() {
  ctx.fillStyle = '#9fd0f0'; ctx.fillRect(0, 0, CW, GROUND);
  ctx.fillStyle = 'rgba(30,50,40,0.45)'; ctx.fillRect(0, 0, T.shadeX, GROUND);
  ctx.fillStyle = '#5b4632'; ctx.fillRect(0, GROUND, CW, CH - GROUND);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '12px system-ui'; ctx.fillText("neighbour's shade", 10, 20);
  for (const a of attractors) {
    if (a.by >= 0) continue;
    ctx.fillStyle = a.kind === 'shoot' ? 'rgba(255,240,150,0.8)' : 'rgba(120,190,255,0.7)';
    ctx.fillRect(a.x - 1, a.y - 1, 2, 2);
  }
  ctx.lineCap = 'round';
  for (const o of organs) {
    if (o.dead) continue;
    const p = o.parent >= 0 ? organs[o.parent] : SEED;
    ctx.strokeStyle = o.kind === 'shoot' ? '#3d6b2a' : '#d8c08a';
    ctx.lineWidth = o.children > 1 ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(o.x, o.y); ctx.stroke();
    if (o.leaves) {
      ctx.fillStyle = light(o.x) < 1 ? '#5d8a4a' : '#4fbf3a';
      ctx.beginPath(); ctx.ellipse(o.x, o.y, 3 + o.leaves, 2 + o.leaves / 2, -0.5, 0, Math.PI * 2); ctx.fill();
    }
    if (o.pockets) { ctx.strokeStyle = '#7cc4ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(o.x, o.y, 2 + o.pockets / 2, 0, Math.PI * 2); ctx.stroke(); }
  }
  for (const kind of ['shoot', 'root'] as Kind[]) {
    const f = focus[kind];
    if (!f) continue;
    ctx.strokeStyle = kind === 'shoot' ? '#ff5a4f' : '#ffd24f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(f.x, f.y, 8, 0, Math.PI * 2); ctx.moveTo(f.x - 12, f.y); ctx.lineTo(f.x + 12, f.y);
    ctx.moveTo(f.x, f.y - 12); ctx.lineTo(f.x, f.y + 12); ctx.stroke();
  }
  if (grazer) {
    const x = grazer.x, y = GROUND - 18;
    ctx.fillStyle = '#7a5a3a';
    ctx.beginPath(); ctx.ellipse(x, y, 22, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x - 22, y - 8, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 15, y + 6, 3, 12); ctx.fillRect(x + 12, y + 6, 3, 12);
  }
  const live = alive();
  const shoots = live.filter((o) => o.kind === 'shoot');
  const top = Math.min(GROUND, ...shoots.map((o) => o.y));
  const leaves = shoots.reduce((s, o) => s + o.leaves, 0), shaded = shoots.filter((o) => light(o.x) < 1).reduce((s, o) => s + o.leaves, 0);
  $('energy').textContent = energy.toFixed(1);
  $('water').textContent = water.toFixed(1);
  $('height').textContent = `${Math.round(GROUND - top)} px`;
  $('leaves').textContent = `${leaves} (${shaded})`;
  $('pockets').textContent = String(live.reduce((s, o) => s + o.pockets, 0));
  requestAnimationFrame(draw);
}

reset();
setInterval(() => { for (let k = 0; k < speed; k++) tick(); }, T.tickMs);
requestAnimationFrame(draw);

export {};
