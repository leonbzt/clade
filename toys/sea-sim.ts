// Toy: the living sea, the model (slice 17). Real populations in patches, and only four rules: grazers eat mats; burrowers
// eat rot and stir oxygen; hunters take prey, the commonest most; deaths become rot, and rot uses up oxygen. Species breed
// from what they ate, with no capacity, so they overshoot and crash by themselves. Knows nothing of drawing. Costs little.
import type { HabitatId } from '../game/src/data/habitats';
import { makeIsland, type Island } from '../game/src/sim/island';
import { SEA, GROUND, SPECIES } from './sea-data';
import { makeShallows, type Patch } from './sea-patches';

export const S = SPECIES.length;
export const LOST = { starve: 0, hunted: 1, choke: 2, shock: 3 } as const;
export type Cause = keyof typeof LOST;
const LOSSES = 4;

export interface SeaPatch extends Patch {
  rich: number; mats: number; rot: number; oxygen: number; shocked: number; // rich: this patch's own bounty; shocked: this generation's shock (0 none)
  pop: Float64Array; fit: Float64Array; // per species; fit 0 = can't live here
  peak: Float64Array; low: Float64Array; lost: Float64Array; // the news's memory: since the last crash, since the last boom, what killed them
  came: Int32Array; // the patch it crossed from, -1 = the open sea, -2 = not arriving
  fromNb: Int32Array; // the neighbour most of this generation's arrivals came from, per species
  preyPeak: number; preyFalling: boolean; falling: Uint8Array;
  normal: { mats: number; rot: number; oxygen: number; prey: number; hunters: number };
  hist: Float32Array; // history rows × 4: mats, rot, prey, oxygen (ring, by generation)
}
export interface Event { kind: 'crash' | 'boom' | 'spread'; sp: number; patch: number; from: number; to: number; cause: string }
export interface Sea { gen: number; r: number; isl: Island; patches: SeaPatch[]; of: Int32Array; patchCrashes: number[]; moved: Float64Array }

const skill = (score: number) => (score / 20) ** SEA.scorePower;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rnd = (s: Sea) => {
  s.r = (s.r + 0x6d2b79f5) | 0;
  let t = Math.imul(s.r ^ (s.r >>> 15), 1 | s.r);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const isPrey = (k: number) => SPECIES[k].role !== 'predator';
export const preyOf = (p: SeaPatch) => { let n = 0; for (let k = 0; k < S; k++) if (isPrey(k)) n += p.pop[k]; return n; };
export const huntersOf = (p: SeaPatch) => { let n = 0; for (let k = 0; k < S; k++) if (!isPrey(k)) n += p.pop[k]; return n; };
/** The patch's holder: its most numerous prey species, or -1. */
export function holder(p: SeaPatch): number {
  let best = -1, most = 0;
  for (let k = 0; k < S; k++) if (isPrey(k) && p.pop[k] > most) { most = p.pop[k]; best = k; }
  return best;
}

/** One patch's meal, shocks and breath. `arrive` gathers the hungry who are crossing borders. */
function stepPatch(s: Sea, p: SeaPatch, arrive: Float64Array) {
  const g = GROUND[p.ground], pop = p.pop;
  const eaten = new Float64Array(S), hungry = new Float64Array(S);
  let deaths = 0;
  const kill = (k: number, n: number, how: number) => { const d = Math.min(pop[k], n); pop[k] -= d; deaths += d; if (how >= 0) p.lost[k * LOSSES + how] += d; };

  // Grazers eat mats, burrowers eat rot: the same saturating meal from their own stock.
  const meal = (role: 'grazer' | 'burrower', stock: number) => {
    let want = 0;
    const speed = stock / (SEA.eatHalf + stock);
    for (let k = 0; k < S; k++) if (SPECIES[k].role === role && pop[k] > 0) { eaten[k] = pop[k] * SEA.eat * skill(p.fit[k]) * speed; want += eaten[k]; }
    const f = want > stock * SEA.maxTake ? (stock * SEA.maxTake) / want : 1;
    for (let k = 0; k < S; k++) if (SPECIES[k].role === role) eaten[k] *= f;
    return want * f;
  };
  const matsEaten = meal('grazer', p.mats), rotEaten = meal('burrower', p.rot);
  let burrowers = 0;
  for (let k = 0; k < S; k++) if (SPECIES[k].role === 'burrower') burrowers += pop[k];

  // Hunters take prey, the commonest most.
  const prey = preyOf(p);
  let weight = 0, killed = 0;
  for (let k = 0; k < S; k++) if (isPrey(k)) weight += pop[k] ** SEA.commonest;
  for (let k = 0; k < S; k++) if (!isPrey(k) && pop[k] > 0) { eaten[k] = pop[k] * SEA.hunt * skill(p.fit[k]) * prey / (SEA.huntHalf + prey); killed += eaten[k]; }
  const room = prey * SEA.maxKill, huntF = killed > room ? room / killed : 1;
  for (let k = 0; k < S; k++) if (!isPrey(k)) eaten[k] *= huntF;
  killed *= huntF;

  // Breed from the meal, starve from the shortfall. Hunters' meals are counted in prey.
  for (let k = 0; k < S; k++) {
    if (pop[k] <= 0) continue;
    const hunter = !isPrey(k), full = hunter ? SEA.hunt : SEA.eat, fed = eaten[k] / (pop[k] * full), need = hunter ? SEA.huntNeed : SEA.need;
    const short = Math.max(0, 1 - fed / need);
    hungry[k] = short;
    const born = eaten[k] * (hunter ? SEA.huntBreed : SEA.breed);
    kill(k, pop[k] * (hunter ? SEA.huntDie : SEA.die), -1); // ordinary deaths: no one's fault, so a crash isn't blamed on them
    kill(k, pop[k] * short * (hunter ? SEA.huntStarve : SEA.starve), LOST.starve);
    if (!hunter && weight > 0) kill(k, (killed * pop[k] ** SEA.commonest) / weight, LOST.hunted);
    pop[k] += born;
  }

  // Oxygen too low: everyone gasps.
  if (p.oxygen < SEA.chokeAt) {
    const f = SEA.choke * (1 - p.oxygen / SEA.chokeAt);
    for (let k = 0; k < S; k++) if (pop[k] > 0) kill(k, pop[k] * f, LOST.choke);
  }

  // A shock, one patch at a time.
  p.shocked = 0;
  if (rnd(s) < SEA.shockChance) {
    p.shocked = 1;
    for (let k = 0; k < S; k++) if (pop[k] > 0) kill(k, pop[k] * SEA.shockKill, LOST.shock);
    p.oxygen = Math.max(0, p.oxygen - SEA.shockOxygen);
    if (p.ground === 'sand') p.mats *= 0.5;
  }

  // The stocks answer: mats regrow, deaths become rot, rot uses up oxygen, burrowers stir it back.
  p.mats = clamp(p.mats - matsEaten + SEA.matsRegrow * (p.mats + SEA.matsRefuge) * (1 - p.mats / (g.mats * p.rich)), 0, 100);
  p.rot = clamp(p.rot - rotEaten + g.rotIn * p.rich + SEA.deathToRot * deaths - SEA.rotDecay * p.rot, 0, 100);
  p.oxygen = clamp(p.oxygen + SEA.oxygenPull * (g.oxygen - p.oxygen) + SEA.stir * burrowers - SEA.rotBreath * p.rot, 0, 100);

  // The hungry cross borders, by shared border length, to ground they can live on.
  for (let k = 0; k < S; k++) {
    if (pop[k] <= 0 || hungry[k] <= 0) continue;
    const leaving = pop[k] * SEA.flow * hungry[k];
    let moved = 0, most = -1, top = 0;
    p.nb.forEach((q, j) => {
      if (s.patches[q].fit[k] <= 0) return;
      const a = leaving * p.nbW[j];
      arrive[q * S + k] += a; moved += a;
      if (a > top) { top = a; most = q; }
    });
    pop[k] -= moved;
    if (most >= 0) for (const q of p.nb) if (s.patches[q].fit[k] > 0 && s.patches[q].came[k] === -2 && s.patches[q].pop[k] < 1) s.patches[q].fromNb[k] = p.id;
  }
}

/** One generation everywhere. Returns what happened, for the headlines; every event carries its cause. */
export function step(s: Sea): Event[] {
  s.gen++;
  const arrive = s.moved.fill(0), out: Event[] = [], { patches } = s;
  for (const p of patches) stepPatch(s, p, arrive);
  for (const p of patches) {
    for (let k = 0; k < S; k++) {
      const add = arrive[p.id * S + k];
      const had = p.pop[k] >= 1;
      if (add > 0) p.pop[k] += add;
      if (!had && p.pop[k] >= 1 && add > 0) p.came[k] = p.fromNb[k];
      if (p.outer && p.fit[k] > 0 && p.pop[k] < 1 && !SPECIES[k].line && rnd(s) < SEA.trickleChance) { p.pop[k] += SEA.trickle; p.came[k] = -1; }
      if (p.pop[k] < 1) { p.pop[k] = 0; p.came[k] = -2; }
    }
    watch(s, p, out);
    const row = (s.gen % SEA.history) * 4, h = p.hist;
    h[row] = p.mats; h[row + 1] = p.rot; h[row + 2] = preyOf(p); h[row + 3] = p.oxygen;
  }
  return out;
}

/** Notice crashes, booms and arrivals, each with its real cause. */
function watch(s: Sea, p: SeaPatch, out: Event[]) {
  for (let k = 0; k < S; k++) {
    const n = p.pop[k], i = k * LOSSES;
    if (p.falling[k]) { // already told: the same fall isn't a second crash
      if (n > p.peak[k]) { p.falling[k] = 0; p.lost.fill(0, i, i + LOSSES); }
      p.peak[k] = n;
    } else if (n > p.peak[k]) { p.peak[k] = n; p.lost.fill(0, i, i + LOSSES); }
    else if (p.peak[k] >= SEA.minPeak && n <= p.peak[k] * SEA.crashTo) {
      out.push({ kind: 'crash', sp: k, patch: p.id, from: p.peak[k], to: n, cause: crashCause(p, k) });
      p.peak[k] = n; p.low[k] = n; p.falling[k] = 1;
    }
    if (n < p.low[k] || p.low[k] === 0) p.low[k] = n;
    if (p.low[k] >= 1 && n >= SEA.minBoom && n >= p.low[k] * SEA.boomBy) {
      out.push({ kind: 'boom', sp: k, patch: p.id, from: p.low[k], to: n, cause: boomCause(p, k) });
      p.low[k] = n;
    }
    if (p.came[k] !== -2 && n >= SEA.established) {
      out.push({ kind: 'spread', sp: k, patch: p.id, from: 0, to: n, cause: p.came[k] === -1 ? 'back from the open sea' : 'hungry neighbours crossed the border' });
      p.came[k] = -2;
    }
  }
  const prey = preyOf(p);
  if (p.preyFalling) { if (prey > p.preyPeak) p.preyFalling = false; p.preyPeak = prey; }
  else if (prey > p.preyPeak) p.preyPeak = prey;
  else if (p.preyPeak >= SEA.patchMinPeak && prey <= p.preyPeak * SEA.patchCrashTo) { s.patchCrashes.push(s.gen, p.id); p.preyPeak = prey; p.preyFalling = true; }
}

const FOOD_GONE = { grazer: 'mats ran out', burrower: 'buried food ran out', predator: 'prey ran out' };
function crashCause(p: SeaPatch, k: number): string {
  let top = 0, how = 0;
  for (let c = 0; c < LOSSES; c++) if (p.lost[k * LOSSES + c] > top) { top = p.lost[k * LOSSES + c]; how = c; }
  if (how === LOST.hunted) {
    let who = -1, most = 0;
    for (let h = 0; h < S; h++) if (SPECIES[h].role === 'predator' && p.pop[h] > most) { most = p.pop[h]; who = h; }
    return who >= 0 ? `eaten by ${SPECIES[who].name}` : 'eaten by hunters';
  }
  if (how === LOST.choke) return 'oxygen ran out';
  if (how === LOST.shock) return GROUND[p.ground].shock;
  return FOOD_GONE[SPECIES[k].role];
}
function boomCause(p: SeaPatch, k: number): string {
  const role = SPECIES[k].role;
  if (role === 'predator') return 'prey was plentiful';
  if (huntersOf(p) < 2) return 'no hunters here';
  return role === 'grazer' ? 'thick mats' : 'plenty of buried food';
}

/** Release 30 of your line here. The score counts on this ground, half of it elsewhere (unproven). */
export function release(s: Sea, patch: number, role: 'grazer' | 'burrower' | 'predator', score: number) {
  const k = SPECIES.findIndex((x) => x.line && x.role === role), home = s.patches[patch].ground;
  for (const p of s.patches) p.fit[k] = p.ground === home ? score : Math.max(p.fit[k], score * SEA.unproven);
  const p = s.patches[patch];
  p.pop[k] += SEA.released; p.peak[k] = Math.max(p.peak[k], p.pop[k]); p.low[k] = p.pop[k]; p.came[k] = -2;
  return k;
}

/** A new sea, already running for a while, every patch off on its own beat; "normal" is its own average over that time. */
export function newSea(seed: number): Sea {
  const isl = makeIsland(seed), { patches, of } = makeShallows(isl);
  const s: Sea = { gen: 0, r: seed | 0, isl, of, patchCrashes: [], moved: new Float64Array(patches.length * S), patches: [] };
  s.patches = patches.map((b) => {
    const g = GROUND[b.ground as HabitatId], p: SeaPatch = {
      ...b, rich: 1 - SEA.richness + rnd(s) * 2 * SEA.richness, mats: g.mats * (0.4 + rnd(s) * 0.6), rot: 10 + rnd(s) * 30, oxygen: g.oxygen, shocked: 0,
      pop: new Float64Array(S), fit: new Float64Array(S), peak: new Float64Array(S), low: new Float64Array(S), lost: new Float64Array(S * LOSSES),
      came: new Int32Array(S).fill(-2), fromNb: new Int32Array(S).fill(-1), preyPeak: 0, preyFalling: false, falling: new Uint8Array(S),
      normal: { mats: 0, rot: 0, oxygen: 0, prey: 0, hunters: 0 }, hist: new Float32Array(SEA.history * 4),
    };
    SPECIES.forEach((sp, k) => { const at = sp.at[b.ground]; if (at !== undefined) { p.fit[k] = at; p.pop[k] = (sp.role === 'predator' ? 1 : 4) + rnd(s) * (sp.role === 'predator' ? 5 : 22); } });
    return p;
  });
  for (let g = 0; g < SEA.burnIn; g++) {
    step(s);
    if (g < SEA.burnIn - SEA.averageOver) continue;
    for (const p of s.patches) { const n = p.normal; n.mats += p.mats; n.rot += p.rot; n.oxygen += p.oxygen; n.prey += preyOf(p); n.hunters += huntersOf(p); }
  }
  for (const p of s.patches) {
    const n = p.normal, a = SEA.averageOver;
    n.mats /= a; n.rot /= a; n.oxygen /= a; n.prey /= a; n.hunters /= a;
  }
  s.gen = 0; s.patchCrashes = [];
  return s;
}
