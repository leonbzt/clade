// Toy 4 sim: organic moss growth from limited spore drops, hidden ground with hint numbers, a lichen incumbent
// you take by surrounding it, and a gene draft with combos. No DOM. Throwaway toy (slice 02).
import { W, H, T, GENES, COMBOS, SKILL, GOALS, baseMods, type Gene, type GoalId } from './colony-data';

export const N = W * H;
export const LAVA = 0, CRACK = 1, SAND = 2, ASH = 3;
export type Item = { kind: 'dew' | 'spore'; life: number };
export type Phase = 'wet' | 'warn' | 'dry';

export const S = {
  seed: 1,
  terrain: new Uint8Array(N),
  moisture: new Float32Array(N),
  revealed: new Uint8Array(N),
  lichen: new Uint8Array(N),
  covered: new Uint8Array(N),
  brown: new Uint8Array(N),
  biomass: new Float32Array(N),
  water: new Float32Array(N),
  ashFound: new Uint8Array(N),
  items: new Map<number, Item>(),
  phase: 'wet' as Phase,
  phaseTick: 0,
  tick: 0,
  drops: 0,
  genes: [] as Gene[],
  offer: [] as Gene[],
  offerVersion: 0,
  xp: 0,
  lichenTaken: 0,
  ashCount: 0,
  goals: {} as Partial<Record<GoalId, number>>, // seconds when reached
  mods: baseMods(),
};

const xy = (i: number) => [i % W, (i / W) | 0] as const;
const NB: number[][] = Array.from({ length: N }, (_, i) => {
  const [x, y] = xy(i), out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if ((dx || dy) && nx >= 0 && ny >= 0 && nx < W && ny < H) out.push(ny * W + nx);
  }
  return out;
});

function inRadius(i: number, r: number, fn: (j: number) => void) {
  const [x, y] = xy(i), R = Math.ceil(r);
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < W && ny < H && dx * dx + dy * dy <= r * r) fn(ny * W + nx);
  }
}

function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function level(): number {
  return SKILL.xp.filter((x) => S.xp >= x).length;
}

export function activeCombos() {
  const ids = new Set(S.genes.map((g) => g.id));
  return COMBOS.filter((c) => c.needs.every((n) => ids.has(n)));
}

function recalcMods() {
  const m = baseMods();
  for (const g of S.genes) g.apply(m);
  for (const c of activeCombos()) c.apply(m);
  SKILL.apply(level(), m);
  S.mods = m;
}

function reveal(i: number, r: number) {
  inRadius(i, r, (j) => { S.revealed[j] = 1; });
}

const addDrops = (n: number) => { S.drops = Math.min(T.drops.cap, S.drops + n); };

function reach(goal: GoalId) {
  if (S.goals[goal] === undefined) S.goals[goal] = Math.round(S.tick / 10);
}

function cover(i: number, biomass: number, water: number) {
  if (S.covered[i]) return;
  S.covered[i] = 1; S.brown[i] = 0; S.lichen[i] = 0;
  S.biomass[i] = biomass; S.water[i] = water;
  const before = level();
  S.xp++;
  if (level() !== before) recalcMods();
  reveal(i, S.mods.reveal);
  if (S.terrain[i] === ASH && !S.ashFound[i]) {
    // A 2×2 pocket counts once: mark the whole connected pocket.
    const stack = [i];
    while (stack.length) {
      const j = stack.pop()!;
      if (S.ashFound[j] || S.terrain[j] !== ASH) continue;
      S.ashFound[j] = 1;
      stack.push(...NB[j]);
    }
    S.ashCount++; addDrops(1);
    if (S.ashCount >= 3) reach('ash');
  }
  if (S.terrain[i] === SAND) reach('beach');
}

export function newIsland(seed: number) {
  S.seed = seed;
  const rand = mulberry(seed);
  for (const a of [S.terrain, S.revealed, S.lichen, S.covered, S.brown, S.ashFound]) a.fill(0);
  S.biomass.fill(0); S.water.fill(0);
  const vx = Math.round(W * 0.22), vy = Math.round(H * 0.5), vent = vy * W + vx;
  for (let i = 0; i < N; i++) {
    const [x, y] = xy(i);
    let m = Math.max(0, 1 - Math.hypot(x - vx, y - vy) / T.ventRadius);
    let t = LAVA;
    if (rand() < T.crackShare) { m += T.crackMoisture; t = CRACK; }
    if (x >= W - T.sandCols) { m = T.sandMoisture; t = SAND; }
    S.terrain[i] = t; S.moisture[i] = m;
  }
  for (let k = 0; k < T.ashPockets; k++) {
    const x = 4 + Math.floor(rand() * (W - T.sandCols - 6)), y = 1 + Math.floor(rand() * (H - 3));
    for (const j of [y * W + x, y * W + x + 1, (y + 1) * W + x, (y + 1) * W + x + 1]) {
      S.terrain[j] = ASH; S.moisture[j] += T.ashMoisture;
    }
  }
  for (let k = 0; k < T.lichenPatches; k++) {
    // The first patch sits near the vent so the contest starts early.
    const cx = k === 0 ? vx + 8 : W * 0.35 + rand() * (W * 0.65 - T.sandCols - 3), cy = k === 0 ? vy - 3 : rand() * H;
    const r = T.lichenRadius * (0.7 + 0.6 * rand());
    inRadius(Math.round(cy) * W + Math.round(cx), r, (j) => { if (S.terrain[j] !== SAND) S.lichen[j] = 1; });
  }
  inRadius(vent, 3, (j) => { S.lichen[j] = 0; });
  S.items.clear();
  Object.assign(S, { phase: 'wet', phaseTick: 0, tick: 0, drops: T.drops.start, genes: [], offer: [], xp: 0, lichenTaken: 0, ashCount: 0, goals: {} });
  S.offerVersion++;
  recalcMods();
  for (const j of [vent, vent - 1, vent + 1, vent - W, vent + W]) cover(j, 0.5, 0.5);
}

export function canDrop(i: number): boolean {
  if (S.drops <= 0 || !S.revealed[i] || S.covered[i] || S.lichen[i]) return false;
  let near = false;
  inRadius(i, S.mods.dropRange, (j) => { if (S.covered[j]) near = true; });
  return near;
}

export function tryDrop(i: number): boolean {
  if (!canDrop(i)) return false;
  S.drops--;
  cover(i, 0.3, 0.5);
  if (!S.mods.cloud) return true;
  // Orthogonal neighbours only: a plus of five tiles.
  for (const j of NB[i]) if ((Math.abs(j - i) === 1 || Math.abs(j - i) === W) && !S.lichen[j]) cover(j, 0.2, 0.4);
  return true;
}

export function collect(i: number) {
  const it = S.items.get(i);
  if (!it) return;
  S.items.delete(i);
  if (it.kind === 'spore') { addDrops(1); return; }
  inRadius(i, T.dewSplash, (j) => { if (S.covered[j]) S.water[j] = Math.min(S.mods.hold, S.water[j] + S.mods.dewWater); });
  if (S.mods.mist) reveal(i, 2);
}

/** Minesweeper-style hint: damp neighbours of a revealed, open tile on the edge of the unknown. */
export function hint(i: number): number | null {
  if (!S.revealed[i] || S.covered[i] || S.lichen[i] || !NB[i].some((j) => !S.revealed[j])) return null;
  return NB[i].filter((j) => S.moisture[j] >= T.dampAt).length;
}

export function sensed(i: number): boolean {
  if (S.revealed[i] || S.terrain[i] !== ASH || S.ashFound[i]) return false;
  let near = false;
  inRadius(i, S.mods.reveal + S.mods.sense, (j) => { if (S.covered[j]) near = true; });
  return near;
}

export function pickGene(k: number) {
  const g = S.offer[k];
  if (!g) return;
  S.genes.push(g); S.offer = []; S.offerVersion++;
  recalcMods();
}

export function passOffer() {
  S.offer = []; S.offerVersion++;
}

function newGeneration() {
  addDrops(S.mods.dropsPerGen);
  if (S.offer.length) return;
  const pool = GENES.filter((g) => !S.genes.includes(g)).sort(() => Math.random() - 0.5);
  S.offer = pool.slice(0, 3); S.offerVersion++;
}

function advancePhase() {
  if (++S.phaseTick < T.phases[S.phase]) return;
  S.phaseTick = 0;
  if (S.phase === 'wet') S.phase = 'warn';
  else if (S.phase === 'warn') S.phase = 'dry';
  else {
    S.phase = 'wet';
    for (let i = 0; i < N; i++) if (S.covered[i]) S.water[i] = Math.min(S.mods.hold, S.water[i] + T.rain);
  }
}

function countNb(i: number, test: (j: number) => boolean): number {
  let n = 0;
  for (const j of NB[i]) if (test(j)) n++;
  return n;
}

const green = (j: number) => S.covered[j] === 1 && S.brown[j] === 0;

export function tick() {
  S.tick++;
  advancePhase();
  const m = S.mods, dry = S.phase === 'dry';
  const evap = (dry ? T.evapDry : T.evap) * m.evap;
  const born: number[] = [];
  for (let i = 0; i < N; i++) {
    if (S.covered[i]) {
      S.water[i] += T.uptake * S.moisture[i] * (dry ? T.dryUptake : 1) - evap;
      S.water[i] = Math.min(m.hold, Math.max(0, S.water[i]));
      if (S.brown[i] && S.water[i] > T.reviveAt) S.brown[i] = 0;
      else if (!S.brown[i] && S.water[i] < T.brownAt) S.brown[i] = 1;
      if (S.brown[i]) {
        if (!m.turf && countNb(i, (j) => S.lichen[j] === 1) >= T.lichen.take && Math.random() < T.lichen.takeChance) {
          S.covered[i] = 0; S.lichen[i] = 1;
        }
        continue;
      }
      const share = S.water[i] / m.hold;
      S.biomass[i] = Math.min(1, S.biomass[i] + T.growth * m.growth * share);
      if (Math.random() < T.spreadChance * S.biomass[i] * share * m.spread) {
        const opts = NB[i].filter((j) => !S.covered[j] && !S.lichen[j]);
        if (opts.length) {
          const w = opts.map((j) => 0.1 + S.moisture[j]);
          let r = Math.random() * w.reduce((a, b) => a + b, 0), k = 0;
          while ((r -= w[k]) > 0 && k < opts.length - 1) k++;
          born.push(opts[k]); S.water[i] *= 0.7;
        }
      }
      if (!S.items.has(i)) {
        if (Math.random() < T.dewChance * m.dewMul * (S.phase === 'warn' ? T.dewWarnBoost : 1)) S.items.set(i, { kind: 'dew', life: T.itemLife });
        else if (Math.random() < T.sporeChance && NB[i].some((j) => !S.covered[j])) S.items.set(i, { kind: 'spore', life: T.itemLife });
      }
    } else if (S.lichen[i]) {
      if (countNb(i, green) >= m.surround && Math.random() < T.surroundChance) {
        born.push(i);
        S.lichenTaken++;
        if (S.lichenTaken >= 25) reach('lichen');
        if (m.overgrow && S.lichenTaken % T.overgrowEvery === 0) addDrops(1);
      } else if (Math.random() < T.lichen.spread) {
        const opts = NB[i].filter((j) => !S.covered[j] && !S.lichen[j] && S.terrain[j] !== SAND && S.moisture[j] < T.lichen.maxMoisture);
        if (opts.length) S.lichen[opts[Math.floor(Math.random() * opts.length)]] = 1;
      }
    }
  }
  for (const j of born) cover(j, 0.1, 0.3);
  for (const [i, it] of S.items) {
    if (--it.life <= 0) S.items.delete(i);
    else if (m.autoDew && it.kind === 'dew' && it.life < 20) collect(i);
  }
  if (S.tick % T.genTicks === 0) newGeneration();
}

export const goalList = () => GOALS.map((g) => ({ ...g, at: S.goals[g.id] }));
