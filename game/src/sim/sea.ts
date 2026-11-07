// The living sea, ported from the slice 17 model (slice 19). Real populations in patches, and only four rules: grazers eat mats; burrowers
// eat rot and stir oxygen; hunters take prey, the commonest most; deaths become rot, and rot uses up oxygen. Species breed
// from what they ate, with no capacity, so they overshoot and crash by themselves. Knows nothing of drawing. Costs little.
import type { PartId, PlanId } from '../data/life';
import type { Role } from '../data/garden';
import { makeIsland, type Island } from './island';
import { SEA, GROUND, PLAYER_SPECIES, lineId, type Diet, type Species } from '../data/sea';
import { feedsAs } from './feeding';
import { makeShallows, type Patch } from './sea-patches';

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
export interface Sea { species: Species[]; gen: number; r: number; isl: Island; patches: SeaPatch[]; of: Int32Array; patchCrashes: number[]; moved: Float64Array }

const skill = (score: number) => (score / 20) ** SEA.scorePower;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rnd = (s: Sea) => {
  s.r = (s.r + 0x6d2b79f5) | 0;
  let t = Math.imul(s.r ^ (s.r >>> 15), 1 | s.r);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const isPrey = (s: Sea, k: number) => !feedsAs(s.species[k]).hunt;
export const preyOf = (s: Sea, p: SeaPatch) => { const S = s.species.length; let n = 0; for (let k = 0; k < S; k++) if (isPrey(s, k)) n += p.pop[k]; return n; };
export const huntersOf = (s: Sea, p: SeaPatch) => { const S = s.species.length; let n = 0; for (let k = 0; k < S; k++) if (!isPrey(s, k)) n += p.pop[k]; return n; };
/** The patch's holder: its most numerous prey species, or -1. */
export function holder(s: Sea, p: SeaPatch): number {
  const S = s.species.length;
  let best = -1, most = 0;
  for (let k = 0; k < S; k++) if (isPrey(s, k) && p.pop[k] > most) { most = p.pop[k]; best = k; }
  return best;
}

/** One patch's meal, shocks and breath. `arrive` gathers the hungry who are crossing borders. */
function stepPatch(s: Sea, p: SeaPatch, arrive: Float64Array, feeds: ReturnType<typeof feedsAs>[]) {
  const S = s.species.length, g = GROUND[p.ground], pop = p.pop;
  const eaten = new Float64Array(S), hungry = new Float64Array(S);
  let deaths = 0;
  const kill = (k: number, n: number, how: number) => { const d = Math.min(pop[k], n); pop[k] -= d; deaths += d; if (how >= 0) p.lost[k * LOSSES + how] += d; };

  // Grazers eat mats, burrowers eat rot: the same saturating meal from their own stock.
  const meal = (source: 'mats' | 'rot', stock: number) => {
    let want = 0;
    const speed = stock / (SEA.eatHalf + stock);
    const amounts = new Float64Array(S);
    for (let k = 0; k < S; k++) if (feeds[k][source] && pop[k] > 0) { amounts[k] = pop[k] * SEA.eat * skill(p.fit[k]) * speed * feeds[k][source]; want += amounts[k]; }
    const f = want > stock * SEA.maxTake ? (stock * SEA.maxTake) / want : 1;
    for (let k = 0; k < S; k++) eaten[k] += amounts[k] * f;
    return want * f;
  };
  const matsEaten = meal('mats', p.mats), rotEaten = meal('rot', p.rot);
  let burrowers = 0;
  for (let k = 0; k < S; k++) if (feeds[k].dig) burrowers += pop[k];

  // Hunters take prey, the commonest most.
  const prey = pop.reduce((n, v, k) => n + (feeds[k].hunt ? 0 : v), 0);
  let weight = 0, killed = 0;
  for (let k = 0; k < S; k++) if (!feeds[k].hunt) weight += pop[k] ** SEA.commonest;
  for (let k = 0; k < S; k++) if (!!feeds[k].hunt && pop[k] > 0) { eaten[k] = pop[k] * SEA.hunt * skill(p.fit[k]) * prey / (SEA.huntHalf + prey); killed += eaten[k]; }
  const room = prey * SEA.maxKill, huntF = killed > room ? room / killed : 1;
  for (let k = 0; k < S; k++) if (!!feeds[k].hunt) eaten[k] *= huntF;
  killed *= huntF;

  // Breed from the meal, starve from the shortfall. Hunters' meals are counted in prey.
  for (let k = 0; k < S; k++) {
    if (pop[k] <= 0) continue;
    const hunter = !!feeds[k].hunt, full = hunter ? SEA.hunt : SEA.eat, fed = eaten[k] / (pop[k] * full), need = hunter ? SEA.huntNeed : SEA.need;
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
  const S = s.species.length;
  s.gen++;
  const arrive = s.moved.fill(0), out: Event[] = [], { patches } = s, feeds = s.species.map(feedsAs);
  for (const p of patches) stepPatch(s, p, arrive, feeds);
  for (const p of patches) {
    for (let k = 0; k < S; k++) {
      const add = arrive[p.id * S + k];
      const had = p.pop[k] >= 1;
      if (add > 0) p.pop[k] += add;
      if (!had && p.pop[k] >= 1 && add > 0) p.came[k] = p.fromNb[k];
      if (p.pop[k] < 1) { p.pop[k] = 0; p.came[k] = -2; }
    }
    watch(s, p, out);
    const row = (s.gen % SEA.history) * 4, h = p.hist;
    h[row] = p.mats; h[row + 1] = p.rot; h[row + 2] = preyOf(s, p); h[row + 3] = p.oxygen;
  }
  return out;
}

/** Notice crashes, booms and arrivals, each with its real cause. */
function watch(s: Sea, p: SeaPatch, out: Event[]) {
  const S = s.species.length;
  for (let k = 0; k < S; k++) {
    const n = p.pop[k], i = k * LOSSES;
    if (p.falling[k]) { // already told: the same fall isn't a second crash
      if (n > p.peak[k]) { p.falling[k] = 0; p.lost.fill(0, i, i + LOSSES); }
      p.peak[k] = n;
    } else if (n > p.peak[k]) { p.peak[k] = n; p.lost.fill(0, i, i + LOSSES); }
    else if (p.peak[k] >= SEA.minPeak && n <= p.peak[k] * SEA.crashTo) {
      out.push({ kind: 'crash', sp: k, patch: p.id, from: p.peak[k], to: n, cause: crashCause(s, p, k) });
      p.peak[k] = n; p.low[k] = n; p.falling[k] = 1;
    }
    if (n < p.low[k] || p.low[k] === 0) p.low[k] = n;
    if (p.low[k] >= 1 && n >= SEA.minBoom && n >= p.low[k] * SEA.boomBy) {
      out.push({ kind: 'boom', sp: k, patch: p.id, from: p.low[k], to: n, cause: boomCause(s, p, k) });
      p.low[k] = n;
    }
    if (p.came[k] !== -2 && n >= SEA.established) {
      out.push({ kind: 'spread', sp: k, patch: p.id, from: 0, to: n, cause: p.came[k] === -1 ? 'back from the open sea' : 'hungry neighbours crossed the border' });
      p.came[k] = -2;
    }
  }
  const prey = preyOf(s, p);
  if (p.preyFalling) { if (prey > p.preyPeak) p.preyFalling = false; p.preyPeak = prey; }
  else if (prey > p.preyPeak) p.preyPeak = prey;
  else if (p.preyPeak >= SEA.patchMinPeak && prey <= p.preyPeak * SEA.patchCrashTo) { s.patchCrashes.push(s.gen, p.id); p.preyPeak = prey; p.preyFalling = true; }
}

const foodGone = (sp: Species) => {
  const f = feedsAs(sp);
  return f.hunt ? 'prey ran out' : f.mats && f.rot ? 'mats and detritus ran short' : f.rot ? 'detritus ran out' : 'mats ran out';
};
function crashCause(s: Sea, p: SeaPatch, k: number): string {
  const S = s.species.length;
  let top = 0, how = 0;
  for (let c = 0; c < LOSSES; c++) if (p.lost[k * LOSSES + c] > top) { top = p.lost[k * LOSSES + c]; how = c; }
  if (how === LOST.hunted) {
    let who = -1, most = 0;
    for (let h = 0; h < S; h++) if (!isPrey(s, h) && p.pop[h] > most) { most = p.pop[h]; who = h; }
    return who >= 0 ? `eaten by ${s.species[who].name}` : 'eaten by hunters';
  }
  if (how === LOST.choke) return 'oxygen ran out';
  if (how === LOST.shock) return GROUND[p.ground].shock;
  return foodGone(s.species[k]);
}
function boomCause(s: Sea, p: SeaPatch, k: number): string {
  const f = feedsAs(s.species[k]);
  if (f.hunt) return 'prey was plentiful';
  if (huntersOf(s, p) < 2) return 'no hunters here';
  return f.mats ? 'thick mats' : 'plenty of detritus';
}

/** Actual eggs only. A weaker clutch never lowers fitness, on this ground or elsewhere. */
export function release(s: Sea, patch: number, plan: PlanId, role: Role, eggs: number, parts?: PartId[], diet?: Diet): string {
  const id = lineId(plan, role), k = s.species.findIndex((x) => x.id === id), p = s.patches[patch];
  if (!p || k < 0 || !Number.isSafeInteger(eggs) || eggs < 0) throw new Error('Invalid sea release');
  if (eggs === 0) return id;
  if (parts && eggs >= Math.max(...s.patches.map((q) => q.fit[k]))) {
    s.species[k].parts = [...parts]; s.species[k].diet = diet ? { ...diet } : undefined;
  }
  for (const q of s.patches) q.fit[k] = Math.max(q.fit[k], q.ground === p.ground ? eggs : eggs * SEA.unproven);
  p.pop[k] += eggs; p.peak[k] = Math.max(p.peak[k], p.pop[k]); p.low[k] = p.pop[k]; p.came[k] = -2;
  return id;
}

/** A new sea has environmental stocks, but no animals, burn-in or open-sea immigration. */
export function newSea(seed: number, species: Species[] = PLAYER_SPECIES): Sea {
  const isl = makeIsland(seed), { patches, of } = makeShallows(isl), S = species.length;
  const registry = species.map((sp) => ({ ...sp, colour: [...sp.colour] as Species['colour'] }))
    .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const s: Sea = { species: registry, gen: 0, r: seed | 0, isl, of,
    patchCrashes: [], moved: new Float64Array(patches.length * S), patches: [] };
  s.patches = patches.map((b) => {
    const g = GROUND[b.ground], p: SeaPatch = {
      ...b, rich: 1 - SEA.richness + rnd(s) * 2 * SEA.richness, mats: g.mats * (0.4 + rnd(s) * 0.6), rot: 10 + rnd(s) * 30, oxygen: g.oxygen, shocked: 0,
      pop: new Float64Array(S), fit: new Float64Array(S), peak: new Float64Array(S), low: new Float64Array(S), lost: new Float64Array(S * LOSSES),
      came: new Int32Array(S).fill(-2), fromNb: new Int32Array(S).fill(-1), preyPeak: 0, preyFalling: false, falling: new Uint8Array(S),
      normal: { mats: 0, rot: 0, oxygen: 0, prey: 0, hunters: 0 }, hist: new Float32Array(SEA.history * 4),
    };
    p.normal = { mats: p.mats, rot: p.rot, oxygen: p.oxygen, prey: 0, hunters: 0 };
    p.hist.set([p.mats, p.rot, 0, p.oxygen]);
    return p;
  });
  return s;
}
