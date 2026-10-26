// Toy 3, Rules: you never touch the map. Genes rewrite the colony's cellular-automaton rules, each with one
// upside and one downside. Replay the same island to compare builds. Throwaway toy for slice 02.

const W = 96, H = 64, CELL = 8;

const T = {
  tickMs: 100,
  genEvery: 150, // ticks between gene offers
  seasons: { wet: 250, dry: 180 }, // ticks
  wetBonus: 0.08,
  vents: 3,
  ventRadius: 14,
  lavaMoisture: 0.12,
  beachMoisture: 0.5,
  crackShare: 0.08,
  crackMoisture: 0.15,
  dieChance: 0.08, // per tick when a moss tile fails its survival rule
  tiers: [['S', 0.6], ['A', 0.4], ['B', 0.25], ['C', 0.1], ['D', 0]] as const,
};

type Rules = { birthNeighbours: number; radius: number; birthMoisture: number; surviveMoisture: number; cushion: number; pBirth: number; salt: number; dryPenalty: number };
const BASE: Rules = { birthNeighbours: 2, radius: 1, birthMoisture: 0.35, surviveMoisture: 0.2, cushion: 99, pBirth: 0.12, salt: 0, dryPenalty: 0.25 };

type Gene = { id: string; name: string; up: string; down: string; apply: (r: Rules) => void };
const GENES: Gene[] = [
  { id: 'rhizoids', name: 'Rhizoids', up: 'survives with 0.08 less moisture', down: 'births 20% rarer',
    apply: (r) => { r.surviveMoisture -= 0.08; r.pBirth *= 0.8; } },
  { id: 'cushion', name: 'Cushion growth', up: 'survives any drought with 5+ moss neighbours', down: 'births need 0.05 more moisture',
    apply: (r) => { r.cushion = 5; r.birthMoisture += 0.05; } },
  { id: 'wind', name: 'Wind spores', up: 'births reach 2 tiles away', down: 'births need 3 more moss nearby',
    apply: (r) => { r.radius = 2; r.birthNeighbours += 3; } },
  { id: 'dry', name: 'Survives drying out', up: 'dry season hurts half as much', down: 'births 30% rarer',
    apply: (r) => { r.dryPenalty /= 2; r.pBirth *= 0.7; } },
  { id: 'salt', name: 'Salt tolerance', up: 'beach counts as 70% damp', down: 'births need 0.05 more moisture',
    apply: (r) => { r.salt = 0.7; r.birthMoisture += 0.05; } },
  { id: 'creeping', name: 'Creeping shoots', up: 'births 60% more often', down: 'survival needs 0.06 more moisture',
    apply: (r) => { r.pBirth *= 1.6; r.surviveMoisture += 0.06; } },
  { id: 'capsule', name: 'Stalked spore capsule', up: 'births need 1 fewer moss nearby', down: 'survival needs 0.04 more moisture',
    apply: (r) => { r.birthNeighbours = Math.max(1, r.birthNeighbours - 1); r.surviveMoisture += 0.04; } },
];

const enum Z { Ocean, Beach, Lava, Vent }
const ZONES = [{ z: Z.Vent, name: 'Vents' }, { z: Z.Lava, name: 'Lava field' }, { z: Z.Beach, name: 'Beach' }];

const N = W * H;
const zone = new Uint8Array(N);
const moisture = new Float32Array(N);
let moss = new Uint8Array(N);
let seed = 1, rand = mulberry(seed);
let taken: Gene[] = [];
let offer: Gene[] = [];
let rules: Rules = { ...BASE };
let tickNo = 0, speed = 1;

function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildIsland() {
  rand = mulberry(seed);
  const wob = [rand() * 6, rand() * 6, rand() * 6];
  const vents = Array.from({ length: T.vents }, () => ({ x: W * (0.3 + rand() * 0.4), y: H * (0.3 + rand() * 0.4) }));
  for (let i = 0; i < N; i++) {
    const x = i % W, y = (i / W) | 0;
    const a = Math.atan2(y - H / 2, x - W / 2);
    const edge = 1 + 0.08 * Math.sin(3 * a + wob[0]) + 0.05 * Math.sin(5 * a + wob[1]) + 0.04 * Math.sin(9 * a + wob[2]);
    const r = Math.hypot((x - W / 2) / (W * 0.46), (y - H / 2) / (H * 0.46)) / edge;
    const vent = Math.max(...vents.map((v) => 1 - Math.hypot(x - v.x, y - v.y) / T.ventRadius));
    zone[i] = r > 1 ? Z.Ocean : r > 0.86 ? Z.Beach : vent > 0.45 ? Z.Vent : Z.Lava;
    moisture[i] = zone[i] === Z.Beach ? T.beachMoisture : Math.max(T.lavaMoisture, vent) + (rand() < T.crackShare ? T.crackMoisture : 0);
  }
  moss = new Uint8Array(N);
  const v = vents[0], c = Math.round(v.y) * W + Math.round(v.x);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) moss[c + dy * W + dx] = 1;
  tickNo = 0;
}

function rebuildRules() {
  rules = { ...BASE };
  for (const g of taken) g.apply(rules);
}

function effectiveMoisture(i: number, dry: boolean): number {
  let m = moisture[i] + (dry ? -rules.dryPenalty : T.wetBonus);
  if (zone[i] === Z.Beach) m *= rules.salt;
  return m;
}

function isDry() {
  return tickNo % (T.seasons.wet + T.seasons.dry) >= T.seasons.wet;
}

function tick() {
  tickNo++;
  const dry = isDry(), next = moss.slice(), R = rules.radius;
  for (let i = 0; i < N; i++) {
    if (zone[i] === Z.Ocean) continue;
    const x = i % W, y = (i / W) | 0;
    let n = 0;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const nx = x + dx, ny = y + dy;
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < W && ny < H) n += moss[ny * W + nx];
    }
    const m = effectiveMoisture(i, dry);
    if (moss[i]) {
      if (m < rules.surviveMoisture && n < rules.cushion && rand() < T.dieChance) next[i] = 0;
    } else if (n >= rules.birthNeighbours && m >= rules.birthMoisture && rand() < rules.pBirth) next[i] = 1;
  }
  moss = next;
  if (tickNo % T.genEvery === 0 && !offer.length) makeOffer();
}

function makeOffer() {
  const pool = GENES.filter((g) => !taken.includes(g));
  offer = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  renderOffer();
}

// ---- view ----
const canvas = document.getElementById('view') as HTMLCanvasElement;
canvas.width = W * CELL; canvas.height = H * CELL;
canvas.style.cursor = 'default';
const ctx = canvas.getContext('2d')!;
const hud = document.getElementById('hud')!;
hud.innerHTML = `
  <h1>Toy 3: Rules</h1>
  <p class="muted">You don't touch the map. Every generation, pick a gene. Each one rewrites a rule below. Replay
  the same island with your genes to compare builds.</p>
  <h2>Season</h2><p id="season"></p>
  <h2>Gene offer</h2><div id="offer"></div>
  <h2>Rules now</h2><div id="rules" class="muted"></div>
  <h2>Fit per zone</h2><div id="zones"></div>
  <h2>Genes taken</h2><p id="taken" class="muted"></p>
  <h2>Run</h2>
  <button data-speed="1" class="on">×1</button><button data-speed="4">×4</button><button data-speed="16">×16</button><br>
  <button id="replay">Replay this island</button><button id="island">New island</button><button id="clear">Clear genes</button>`;

const $ = (id: string) => document.getElementById(id)!;
hud.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach((el) =>
  el.addEventListener('click', () => {
    speed = Number(el.dataset.speed);
    hud.querySelectorAll('[data-speed]').forEach((b) => b.classList.toggle('on', b === el));
  }));
$('replay').addEventListener('click', buildIsland);
$('island').addEventListener('click', () => { seed = Math.floor(Math.random() * 1e9); buildIsland(); });
$('clear').addEventListener('click', () => { taken = []; rebuildRules(); renderRules(); buildIsland(); });

function renderOffer() {
  const el = $('offer');
  if (!offer.length) { el.innerHTML = `<p class="muted">${taken.length === GENES.length ? 'All genes taken.' : 'Next offer soon.'}</p>`; return; }
  el.innerHTML = offer.map((g, k) => `<div class="card" data-k="${k}"><b>${g.name}</b><br>
    <span class="up">+ ${g.up}</span><br><span class="down">− ${g.down}</span></div>`).join('') + '<button id="pass">Pass</button>';
  el.querySelectorAll<HTMLElement>('[data-k]').forEach((c) => c.addEventListener('click', () => {
    taken.push(offer[Number(c.dataset.k)]); offer = []; rebuildRules(); renderRules(); renderOffer();
  }));
  $('pass').addEventListener('click', () => { offer = []; renderOffer(); });
}

function renderRules() {
  const r = rules, f = (v: number) => v.toFixed(2);
  $('rules').innerHTML = `
    <p><b>Bare → moss</b>: ≥ ${r.birthNeighbours} moss within ${r.radius} tile${r.radius > 1 ? 's' : ''}, moisture ≥ ${f(r.birthMoisture)},
    chance ${(r.pBirth * 100).toFixed(0)}% per tick</p>
    <p><b>Moss stays</b>: moisture ≥ ${f(r.surviveMoisture)}${r.cushion < 99 ? ` or ≥ ${r.cushion} moss neighbours` : ''},
    else ${T.dieChance * 100}% chance to die per tick</p>
    <p><b>Seasons</b>: wet +${f(T.wetBonus)}, dry −${f(r.dryPenalty)}. Beach moisture ×${f(r.salt)} (salt)</p>`;
  $('taken').textContent = taken.map((g) => g.name).join(', ') || 'none';
}

const COLORS: Record<Z, [number, number, number]> = { [Z.Ocean]: [30, 60, 110], [Z.Beach]: [190, 170, 120], [Z.Lava]: [45, 42, 45], [Z.Vent]: [70, 70, 80] };

function draw() {
  const dry = isDry();
  const img = ctx.createImageData(W, H);
  for (let i = 0; i < N; i++) {
    let [r, g, b] = COLORS[zone[i] as Z];
    if (zone[i] === Z.Lava || zone[i] === Z.Vent) { const m = Math.min(1, moisture[i]); r += 10 * m; g += 20 * m; b += 50 * m; }
    if (moss[i]) [r, g, b] = dry ? [110, 140, 50] : [60, 170, 70];
    img.data.set([r, g, b, 255], i * 4);
  }
  // Draw at 1 px per tile, then scale up.
  const off = new OffscreenCanvas(W, H);
  off.getContext('2d')!.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, W * CELL, H * CELL);

  const cycle = T.seasons.wet + T.seasons.dry, t = tickNo % cycle;
  const left = Math.ceil(((dry ? cycle : T.seasons.wet) - t) / 10);
  $('season').innerHTML = dry ? `<span class="warn">Dry season, ${left} s left</span>` : `Wet season, ${left} s left`;
  $('zones').innerHTML = ZONES.map(({ z, name }) => {
    let land = 0, cov = 0;
    for (let i = 0; i < N; i++) if (zone[i] === z) { land++; cov += moss[i]; }
    const share = land ? cov / land : 0;
    const tier = T.tiers.find(([, min]) => share >= min)![0];
    return `<div class="row"><span>${name}</span><span><b>${tier}</b> ${(share * 100).toFixed(0)}%</span></div>`;
  }).join('');
  requestAnimationFrame(draw);
}

buildIsland();
rebuildRules();
renderRules();
renderOffer();
setInterval(() => { for (let k = 0; k < speed; k++) tick(); }, T.tickMs);
requestAnimationFrame(draw);

export {};
