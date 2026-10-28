// Animals as individuals. Each tick an animal pays its upkeep (more where it fits badly), eats what its diet finds on
// its tile, or walks toward the best spot it has seen. It breeds when well fed and its tile isn't crowded, and dies
// of hunger or age. Hunters catch animals by tag; a swarm loses a few members per catch. What animals eat and leave
// behind goes through plant cover and the stocks (litter, nitrogen), so the layers stay the link between species.
import { ANIMAL, type AnimalBody } from '../data/animals';
import { STRATA } from '../data/fields';
import { rand } from './rng';
import { EV, SEA, idx, type Agent, type State } from './state';
import { fit, type Profile } from './fit';
import { kill, protectedSp } from './life';
import { defOf, mutation, variantFor } from './variants';

const A = ANIMAL;

export const tileOf = (s: State, a: Agent) => idx(s, a.x | 0, a.y | 0);
export const bodyOf = (s: State, sp: number): AnimalBody => defOf(s, sp).animal!;
export const isAnimal = (s: State, sp: number) => !!defOf(s, sp).animal;

// The animals on each tile at the start of the tick, as linked lists: head per tile, next per index in s.agents.
let head = new Int32Array(0), next = new Int32Array(0);

function index(s: State) {
  const n = s.w * s.h;
  if (head.length !== n) head = new Int32Array(n);
  head.fill(-1);
  if (next.length < s.agents.length) next = new Int32Array(s.agents.length * 2);
  s.agents.forEach((a, k) => { const i = tileOf(s, a); next[k] = head[i]; head[i] = k; });
}

/** Animals of species `sp` on tile i (from the tick's index). */
function crowd(s: State, sp: number, i: number): number {
  let c = 0;
  for (let k = head[i]; k >= 0; k = next[k]) if (s.agents[k].sp === sp && s.agents[k].n > 0) c++;
  return c;
}

/** The first living animal with this tag on tile i, or null. */
function preyOn(s: State, tag: string, i: number, self: Agent): Agent | null {
  for (let k = head[i]; k >= 0; k = next[k]) {
    const b = s.agents[k];
    if (b !== self && b.n > 0 && bodyOf(s, b.sp).tag === tag) return b;
  }
  return null;
}

export function note(s: State, a: Agent, text: string) {
  a.log.push({ tick: s.tick, text });
  if (a.log.length > A.log) a.log.shift();
}

function die(s: State, a: Agent, i: number, why: string) {
  s.fall[i] += bodyOf(s, a.sp).corpse * a.n;
  a.n = 0;
  s.obits.push({ id: a.id, tick: s.tick, text: why });
  if (s.obits.length > A.obits) s.obits.shift();
}

/** Energy per second the diet could get on tile i: each food's rate × gain × how much of it is there. */
function foodAt(s: State, P: Profile[], p: Profile, b: AnimalBody, self: Agent, i: number): number {
  const n = s.w * s.h;
  let f = 0;
  b.diet.forEach((d, k) => {
    const share = k ? Math.min(1, p.body.range!) : 1;
    let have = 0;
    if ('stock' in d) have = Math.min(1, s.layers[d.stock][i] / 0.1);
    else if ('plants' in d) {
      const slot = STRATA.indexOf(d.plants) * n + i, v = s.occ[slot];
      if (v >= 0 && !s.dying[slot]) have = s.cover[slot] * P[v].stats.palatable;
    } else have = preyOn(s, d.prey, i, self) ? 1 : 0;
    f += share * d.rate * d.gain * have;
  });
  return f;
}

/** Looks at a few tiles within sight and heads for the best: food × fit, less where its own kind crowds. */
function lookAround(s: State, P: Profile[], a: Agent, p: Profile, b: AnimalBody) {
  const here = tileOf(s, a), x0 = a.x | 0, y0 = a.y | 0, r = b.sight;
  const score = (i: number) => (foodAt(s, P, p, b, a, i) * fit(s, p, i)) / (1 + 0.3 * crowd(s, a.sp, i));
  let best = here, top = score(here) * 1.1;
  for (let k = 0; k < A.look; k++) {
    const x = x0 + Math.floor(rand(s) * (2 * r + 1)) - r, y = y0 + Math.floor(rand(s) * (2 * r + 1)) - r;
    if (x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
    const i = idx(s, x, y);
    if (s.terrain[i] === SEA) continue;
    const sc = score(i);
    if (sc > top) { top = sc; best = i; }
  }
  if (best === here && top <= 0) { // nothing to eat in sight: wander
    const x = Math.max(0, Math.min(s.w - 1, x0 + Math.floor(rand(s) * 5) - 2)), y = Math.max(0, Math.min(s.h - 1, y0 + Math.floor(rand(s) * 5) - 2));
    if (s.terrain[idx(s, x, y)] !== SEA) best = idx(s, x, y);
  }
  a.tx = (best % s.w) + 0.15 + rand(s) * 0.7;
  a.ty = ((best / s.w) | 0) + 0.15 + rand(s) * 0.7;
  a.think = A.think * (0.7 + 0.6 * rand(s));
}

/** Grazes and eats stocks on tile i. Returns the energy gained; dung goes into the stocks. */
function eat(s: State, P: Profile[], a: Agent, p: Profile, b: AnimalBody, i: number, dt: number): number {
  const n = s.w * s.h;
  let got = 0, eaten = 0, what = '';
  b.diet.forEach((d, k) => {
    const share = k ? Math.min(1, p.body.range!) : 1, want = d.rate * share * dt * a.n;
    if (share <= 0 || 'prey' in d) return;
    if ('stock' in d) {
      const have = s.layers[d.stock][i], take = Math.min(have, want * Math.min(1, have / 0.1)); // less where there's little
      if (take <= 0) return;
      s.layers[d.stock][i] -= take;
      got += (take / a.n) * d.gain; eaten += take; what ||= 'litter';
      return;
    }
    const slot = STRATA.indexOf(d.plants) * n + i, v = s.occ[slot];
    if (v < 0 || s.dying[slot]) return;
    const take = Math.min(s.cover[slot], want * P[v].stats.palatable * s.cover[slot]); // thin cover feeds less
    if (take <= 0) return;
    s.cover[slot] -= take;
    s.health[slot] = Math.max(0, s.health[slot] - take * A.wound); // lost leaves cost reserves: regrowth slows
    got += (take / a.n) * d.gain; eaten += take; what ||= s.species[P[v].sp].name;
    if (s.cover[slot] < A.minGrazed && !protectedSp(s, P[v].sp)) kill(s, slot, EV.grazed);
  });
  if (eaten > 0) dung(s, b, i, eaten);
  if (got > 0 && a.doing !== 'eat') note(s, a, `started eating ${what.toLowerCase()}`);
  return got * p.body.gain!;
}

/** Tries to catch prey on tile i. Returns the energy gained. */
function hunt(s: State, P: Profile[], a: Agent, p: Profile, b: AnimalBody, i: number, dt: number): number {
  let got = 0;
  b.diet.forEach((d, k) => {
    if (!('prey' in d) || got) return;
    const share = k ? Math.min(1, p.body.range!) : 1, prey = preyOn(s, d.prey, i, a);
    if (!prey || rand(s) >= d.rate * share * dt * P[prey.v].body.escape!) return;
    const taken = Math.min(prey.n, bodyOf(s, prey.sp).bite), name = s.species[prey.sp].name.toLowerCase();
    prey.n -= taken;
    if (prey.n <= 0) { prey.n = 0; die(s, prey, i, `was eaten by a ${defOf(s, a.sp).short.toLowerCase()}`); }
    else note(s, prey, `lost ${taken} to a ${defOf(s, a.sp).short.toLowerCase()}`);
    got = taken * d.gain;
    dung(s, b, i, got);
    note(s, a, taken > 1 ? `caught ${taken} ${name}` : `caught one of the ${name}`);
  });
  return got * p.body.gain!;
}

function dung(s: State, b: AnimalBody, i: number, eaten: number) {
  for (const [layer, r] of Object.entries(b.makes)) {
    if (layer === 'litter') s.fall[i] += eaten * r!;
    else { const v = s.layers[layer as 'nitrogen']; v[i] = Math.min(1, v[i] + eaten * r!); }
  }
}

/** A newborn (or a swarm that split off) next to its parent, maybe a mutant if the parent's variant is shown. */
function child(s: State, P: Profile[], a: Agent, members: number, e: number) {
  let v = a.v;
  if (s.variants[v].shown && rand(s) < A.mutate) {
    const g = mutation(s, a.sp, s.variants[v].genome), m = g ? variantFor(s, a.sp, g, P) : -1;
    if (m >= 0) v = m;
  }
  const life = (P[v]?.body.life ?? bodyOf(s, a.sp).life) * (0.8 + 0.4 * rand(s));
  s.count[a.sp]++; // keeps the cap honest when many breed in one tick
  s.agents.push({ id: s.nextAgent++, sp: a.sp, v, x: a.x, y: a.y, tx: a.x, ty: a.y, e, age: 0, life, n: members,
    doing: 'look', think: 0, mom: a.id, kids: 0, ate: 0, log: [{ tick: s.tick, text: `was born, child of #${a.id}` }] });
}

function breed(s: State, P: Profile[], a: Agent, p: Profile, b: AnimalBody) {
  const young = Math.max(1, Math.round(p.body.young! * (0.75 + 0.5 * rand(s))));
  a.kids += young;
  if (b.group > 1) {
    a.n += young; a.e -= A.breedCost;
    if (a.n < b.group) return;
    const half = a.n >> 1;
    a.n -= half;
    child(s, P, a, half, a.e);
    note(s, a, `grew to ${a.n + half} and split in two`);
    return;
  }
  a.e -= A.breedCost * young;
  for (let k = 0; k < young; k++) child(s, P, a, 1, A.youngEnergy);
  note(s, a, `had ${young} young`);
}

/** Moves toward its target; stops (and looks again) at the sea. */
function walk(s: State, a: Agent, p: Profile, dt: number) {
  const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
  if (d < 0.05) { a.think = 0; return; }
  const step = Math.min(d, p.body.speed! * dt), nx = a.x + (dx / d) * step, ny = a.y + (dy / d) * step;
  if (s.terrain[idx(s, nx | 0, ny | 0)] === SEA) { a.think = 0; return; }
  a.x = nx; a.y = ny;
}

/** One tick for every animal. Returns the biomass they made. */
export function agentsStep(s: State, P: Profile[], dt: number): number {
  if (!s.agents.length) return 0;
  index(s);
  let biomass = 0;
  const count = s.agents.length;
  for (let k = 0; k < count; k++) {
    const a = s.agents[k];
    if (a.n <= 0) continue;
    const p = P[a.v], b = bodyOf(s, a.sp), i = tileOf(s, a), f = s.terrain[i] === SEA ? 0 : fit(s, p, i);
    a.age += dt;
    a.e -= dt * p.body.upkeep! * (1 + A.stress * (1 - f)) * (a.doing === 'rest' ? A.rest : 1);
    if (a.e <= 0) { die(s, a, i, f <= 0 ? 'died where it could not live' : 'starved'); continue; }
    if (a.age >= a.life) { die(s, a, i, 'died of old age'); continue; }
    // A crowded tile (its own kind) is no place to breed: it moves on even when full.
    const crowded = crowd(s, a.sp, i) >= A.crowd;
    if (a.e >= b.breedAt && a.age >= a.life * A.adultAt && !crowded && s.count[a.sp] < b.cap) breed(s, P, a, p, b);
    if (a.e >= A.restAt && !crowded) { a.doing = 'rest'; continue; }
    const caught = a.e < A.restAt ? hunt(s, P, a, p, b, i, dt) : 0, got = (a.e < A.restAt ? eat(s, P, a, p, b, i, dt) : 0) + caught;
    if (got > 0) { a.e = Math.min(1, a.e + got); a.ate += got; biomass += got * b.yield; a.doing = caught ? 'hunt' : 'eat'; }
    // Eating too little to live on, or crowded: keep looking.
    if (got < dt * p.body.upkeep! * 1.5 || crowded) {
      a.think -= dt;
      if (a.think <= 0) lookAround(s, P, a, p, b);
      walk(s, a, p, dt);
      if (!got) a.doing = 'walk';
    }
  }
  s.agents = s.agents.filter((a) => a.n > 0);
  return biomass;
}

/** Puts `count` new animals of variant v on tile i (arrivals, founder groups). */
export function spawn(s: State, v: number, i: number, count: number, why: string) {
  const sp = s.variants[v].sp, b = bodyOf(s, sp), x0 = i % s.w, y0 = (i / s.w) | 0;
  for (let k = 0; k < count; k++) {
    const x = x0 + 0.15 + rand(s) * 0.7, y = y0 + 0.15 + rand(s) * 0.7;
    s.agents.push({ id: s.nextAgent++, sp, v, x, y, tx: x, ty: y, e: 0.6, age: rand(s) * b.life * 0.2, life: b.life * (0.8 + 0.4 * rand(s)),
      n: b.group > 1 ? Math.ceil(b.group / 2) : 1, doing: 'look', think: 0, mom: -1, kids: 0, ate: 0, log: [{ tick: s.tick, text: why }] });
  }
  s.variants[v].tiles += count;
}

/** Animals on tile i, for the tile card and clicks. */
export const agentsOn = (s: State, i: number) => s.agents.filter((a) => tileOf(s, a) === i);
