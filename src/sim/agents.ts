// Animals as groups: an agent is one animal (beetles) or a group that stands for many (a snail family, a springtail
// swarm). Every `pace` ticks (its metabolism; less often while settled) it pays its upkeep for the time since its last
// update (more where it fits badly), eats what its diet finds on its tile, or walks toward the best spot it has seen.
// Fed and uncrowded, it breeds: young join the group, and a full group splits, the new half walking off to settle
// elsewhere. It dies of hunger or age. Hunters catch by tag and bite a few members off a group, then rest a while.
// All in grams (bodies.ts): it eats plant and litter grams, keeps a share and drops the rest as dung; young cost their
// body; a catch is the prey's grams; the dead go to litter. What animals eat and leave behind goes through plant cover
// and the stocks (litter, nitrogen), so the layers stay the link between species.
import { ANIMAL, type AnimalBody, type Food } from '../data/animals';
import { STRATA } from '../data/fields';
import { SPECIES } from '../data/species';
import { NUM } from '../data/numbers';
import { rand } from './rng';
import { EV, SEA, idx, type Agent, type State } from './state';
import { fit, type Profile } from './fit';
import { fullOf, kill, protectedSp, setMass } from './life';
import { defOf, mutation, variantFor } from './variants';
import { drop, groupOf, LITTER_G, made, took } from './tally';
import { LITTER } from '../data/roles';
import { bite, bodyG, burnG, gramsOf, keepOf, lose, memberG, shareOf, storeG } from './bodies';
import { nGive, nOf } from './nitrogen';
import { ofFall } from '../data/fields';

const A = ANIMAL;
const FULL = ofFall(0.03); // litter eaters feed fully from here, unless their food says otherwise
const DT = 1 / NUM.ticksPerSec;

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
  drop(s, i, groupOf(s, a.sp), Math.max(0, gramsOf(s, a)));
  a.n = 0; a.bit = 0;
  s.obits.push({ id: a.id, tick: s.tick, text: why });
  if (s.obits.length > A.obits) s.obits.shift();
}

/** Grams per second a member could keep on tile i: its appetite on each food × how much of it is there; a catch
 * × the chance to try. */
function foodAt(s: State, P: Profile[], p: Profile, b: AnimalBody, self: Agent, i: number): number {
  let f = 0;
  const burn = burnG(s, p);
  b.diet.forEach((d, k) => {
    if ('prey' in d) {
      const prey = preyOn(s, d.prey, i, self);
      if (prey) f += shareOf(d, k, p) * d.rate * keepOf(d, p) * Math.min(bodyOf(s, prey.sp).bite * memberG(s, prey), storeG(s, self.sp));
    } else f += shareOf(d, k, p) * b.appetite * burn * keepOf(d, p) * quality(s, P, d, i);
  });
  return f;
}

/** Looks at a few tiles within sight and heads for the best: food × fit, less where its own kind crowds. A hungry
 * animal looks twice as far, and moves on even when nothing it sees beats where it is. */
function lookAround(s: State, P: Profile[], a: Agent, p: Profile, b: AnimalBody, hungry: boolean) {
  const here = tileOf(s, a), x0 = a.x | 0, y0 = a.y | 0, r = hungry ? 2 * b.sight : b.sight;
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
  if (best === here && (top <= 0 || hungry)) { // nothing better in sight: wander, to somewhere it can live
    const w = hungry ? r : 2;
    for (let k = 0; k < 4 && best === here; k++) {
      const x = Math.max(0, Math.min(s.w - 1, x0 + Math.floor(rand(s) * (2 * w + 1)) - w)), y = Math.max(0, Math.min(s.h - 1, y0 + Math.floor(rand(s) * (2 * w + 1)) - w));
      const i = idx(s, x, y);
      if (s.terrain[i] !== SEA && fit(s, p, i) > 0) best = i;
    }
  }
  a.tx = (best % s.w) + 0.15 + rand(s) * 0.7;
  a.ty = ((best / s.w) | 0) + 0.15 + rand(s) * 0.7;
  a.think = A.think * (0.7 + 0.6 * rand(s));
}

/** The tiles a group feeds on: one animal eats on its tile, a group spreads over the land in the 3×3 around it. */
function range(s: State, b: AnimalBody, i: number): number[] {
  if (b.group <= 1) return [i];
  const x0 = i % s.w, y0 = (i / s.w) | 0, out: number[] = [];
  for (let y = Math.max(0, y0 - 1); y <= Math.min(s.h - 1, y0 + 1); y++)
    for (let x = Math.max(0, x0 - 1); x <= Math.min(s.w - 1, x0 + 1); x++) if (s.terrain[y * s.w + x] !== SEA) out.push(y * s.w + x);
  return out;
}

/** How well one food source feeds on tile i (0–1): little litter or thin, unpalatable cover feeds less. */
function quality(s: State, P: Profile[], d: Food, i: number): number {
  if ('prey' in d) return 0;
  if ('stock' in d) return Math.min(1, s.layers[d.stock][i] / (d.full ?? FULL));
  const slot = STRATA.indexOf(d.plants) * s.w * s.h + i, v = s.occ[slot];
  if (v < 0 || s.dying[slot] || (d.only && !d.only.includes(SPECIES[groupOf(s, P[v].sp)].id))) return 0;
  return P[v].stats.palatable * s.cover[slot];
}

/** Grazes and eats litter on its tile; a group eats the richest tiles around it first, as its members would, up to
 * its appetite and the room in its store. Returns the grams kept; dung goes to its own tile. */
function eat(s: State, P: Profile[], a: Agent, p: Profile, b: AnimalBody, here: number, dt: number): number {
  const n = s.w * s.h, tiles = range(s, b, here), most = b.appetite * burnG(s, p) * dt * a.n;
  let room = (1 - a.e) * a.n * storeG(s, a.sp), kept = 0, eaten = 0, nIn = 0, what = '';
  b.diet.forEach((d, k) => {
    const share = shareOf(d, k, p), keep = keepOf(d, p);
    if (share <= 0 || 'prey' in d || room <= 0) return;
    let want = Math.min(most * share, room / keep); // grams all members would eat where food is good
    const q = tiles.map((i) => quality(s, P, d, i)), order = tiles.map((_, j) => j).sort((x, y) => q[y] - q[x]);
    for (const j of order) {
      const i = tiles[j], f = q[j];
      if (want <= 0 || f <= 0) break;
      let g: number;
      if ('stock' in d) {
        const have = s.layers.litter[i] * LITTER_G, n = have > 0 ? (s.litN[i] * Math.min(have, want * f)) / have : 0;
        g = Math.min(have, want * f);
        s.layers.litter[i] -= g / LITTER_G; s.litN[i] -= n; nIn += n;
        took(s, i, LITTER, groupOf(s, a.sp), g); what ||= 'litter';
      } else {
        const slot = STRATA.indexOf(d.plants) * n + i, v = s.occ[slot];
        g = Math.min(s.mass[slot], want * f); nIn += g * nOf(groupOf(s, P[v].sp));
        s.health[slot] = Math.max(0, s.health[slot] - (g / fullOf(s, v)) * A.wound); // lost leaves cost reserves: regrowth slows
        setMass(s, slot, s.mass[slot] - g); s.old[slot] = 0;
        took(s, i, groupOf(s, P[v].sp), groupOf(s, a.sp), g); what ||= s.species[P[v].sp].name;
        if (s.cover[slot] < A.minGrazed && !protectedSp(s, P[v].sp)) kill(s, slot, EV.grazed);
      }
      want -= g / f; eaten += g; kept += g * keep; room -= g * keep;
    }
  });
  s.ledger.eaten += eaten;
  if (eaten > 0) kept = digest(s, a, here, eaten, kept, nIn);
  if (kept > 0 && a.doing !== 'eat') note(s, a, `started eating ${what.toLowerCase()}`);
  return kept;
}

/** Ground cover on tile i: prey hide in it. */
function groundCover(s: State, i: number): number {
  const slot = STRATA.indexOf('ground') * s.w * s.h + i;
  return s.occ[slot] >= 0 ? s.cover[slot] : 0;
}

/** Tries to catch prey on tile i, unless another hunter of its kind is here (territory). A catch is up to `bite`
 * members' grams, as much as it can eat. Returns the grams kept; after a catch it rests a while (handling time). */
function hunt(s: State, P: Profile[], a: Agent, p: Profile, b: AnimalBody, i: number, dt: number): number {
  if (!b.diet.some((d) => 'prey' in d) || crowd(s, a.sp, i) >= A.hunters) return 0;
  let kept = 0;
  const hide = 1 - A.refuge * groundCover(s, i), S = storeG(s, a.sp);
  b.diet.forEach((d, k) => {
    if (!('prey' in d) || kept) return;
    const prey = preyOn(s, d.prey, i, a);
    if (!prey) return;
    prey.woke = s.tick; prey.slow = false;
    if (rand(s) >= d.rate * shareOf(d, k, p) * dt * P[prey.v].body.escape! * hide) return;
    const keep = keepOf(d, p), pb = bodyOf(s, prey.sp), name = s.species[prey.sp].name.toLowerCase(), by = defOf(s, a.sp).short.toLowerCase();
    const g = Math.max(0, Math.min(pb.bite * memberG(s, prey), ((1 - a.e) * a.n * S) / keep, gramsOf(s, prey)));
    if (g <= 0) return;
    took(s, i, groupOf(s, prey.sp), groupOf(s, a.sp), g / bodyG(s, prey.sp));
    const lost = bite(s, prey, g);
    if (prey.n <= 0) die(s, prey, i, `was eaten by a ${by}`);
    else if (lost) note(s, prey, `lost ${lost} to a ${by}`);
    kept = g * keep;
    a.full = A.handling * Math.min(1, kept / S / 0.2);
    kept = digest(s, a, i, g, kept, g * nOf(groupOf(s, prey.sp)));
    note(s, a, lost > 1 ? `caught ${lost} ${name}` : `caught some of the ${name}`);
  });
  return kept;
}

/** A meal: the body keeps its nitrogen share of the grams it keeps, as far as the meal's nitrogen goes (poor food:
 * less kept, more dung). Dung, the rest of the grams and nitrogen, falls as litter on its tile. Returns the grams
 * kept. */
function digest(s: State, a: Agent, i: number, eaten: number, kept: number, nIn: number): number {
  const g = groupOf(s, a.sp), n = nOf(g), k = Math.min(kept, nIn / n);
  drop(s, i, g, eaten - k, Math.max(0, nIn - k * n));
  return k;
}

/** The best of a few spots 4–10 tiles away (food × fit) where the variant can live, or null. */
function farSpot(s: State, P: Profile[], p: Profile, a: Agent): [number, number] | null {
  const b = bodyOf(s, a.sp);
  let best = -1, top = -1;
  for (let k = 0; k < 8; k++) {
    const ang = rand(s) * 2 * Math.PI, d = A.disperse[0] + rand(s) * (A.disperse[1] - A.disperse[0]);
    const x = Math.floor(a.x + Math.cos(ang) * d), y = Math.floor(a.y + Math.sin(ang) * d);
    if (x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
    const i = idx(s, x, y), f = s.terrain[i] === SEA ? 0 : fit(s, p, i);
    const sc = f > 0 ? f * foodAt(s, P, p, b, a, i) : -1;
    if (f > 0 && sc > top) { top = sc; best = i; }
  }
  return best < 0 ? null : [(best % s.w) + 0.15 + rand(s) * 0.7, ((best / s.w) | 0) + 0.15 + rand(s) * 0.7];
}

/** A newborn (or the half of a group that split off) next to its parent, maybe a mutant if the parent's variant is
 * shown. It walks off to settle 4–10 tiles away. */
function child(s: State, P: Profile[], a: Agent, members: number, e: number, mutant = false) {
  let v = a.v;
  if (s.variants[v].shown && (mutant || rand(s) < A.mutate)) {
    const g = mutation(s, a.sp, s.variants[v].genome), m = g ? variantFor(s, a.sp, g, P) : -1;
    if (m >= 0) v = m;
  }
  const life = (P[v]?.body.life ?? bodyOf(s, a.sp).life) * (0.8 + 0.4 * rand(s));
  s.count[a.sp]++; // keeps the cap honest when many breed in one tick
  const to = farSpot(s, P, P[v] ?? P[a.v], a);
  s.agents.push({ id: s.nextAgent++, sp: a.sp, v, x: a.x, y: a.y, tx: to?.[0] ?? a.x, ty: to?.[1] ?? a.y, e, age: 0, life, n: members,
    doing: to ? 'walk' : 'look', think: to ? A.think : 0, mom: a.id, kids: 0, ate: 0, log: [{ tick: s.tick, text: members > 1 ? `split off from #${a.id}` : `was born, child of #${a.id}` }],
    last: s.tick - Math.floor(rand(s) * bodyOf(s, a.sp).pace), slow: false, woke: 0, go: !!to, full: 0, bit: 0 });
}

/** Young cost their body from the store: in a group they share what is left, a single animal also gives each its
 * first store. Returns the grams born. */
function breed(s: State, P: Profile[], a: Agent, p: Profile, b: AnimalBody): number {
  const M = bodyG(s, a.sp), S = storeG(s, a.sp);
  let young = Math.max(1, Math.round(p.body.young! * (0.75 + 0.5 * rand(s))));
  if (b.group <= 1) young = Math.min(young, Math.floor(((a.e - A.youngEnergy) * S) / (M + A.youngEnergy * S))); // keeps a young's store
  const e = b.group > 1 ? (a.n * a.e * S - young * M) / ((a.n + young) * S) : a.e - (young * (M + A.youngEnergy * S)) / S;
  if (young <= 0 || e <= 0) return 0;
  a.kids += young; a.e = e;
  made(s, tileOf(s, a), groupOf(s, a.sp), young);
  if (b.group > 1) {
    // Each young may carry a mutation: then the young bud off as a small group of their own (a new line).
    if (s.variants[a.v].shown && rand(s) < Math.min(A.budMax, 1 - (1 - A.mutate) ** young)) {
      child(s, P, a, young, a.e, true);
      note(s, a, `${young} young with something new budded off`);
      return young * M;
    }
    a.n += young;
    if (a.n < b.group) return young * M;
    const half = a.n >> 1;
    a.n -= half;
    child(s, P, a, half, a.e);
    note(s, a, `grew to ${a.n + half} and split in two; half walked off`);
    return young * M;
  }
  for (let k = 0; k < young; k++) child(s, P, a, 1, A.youngEnergy);
  note(s, a, `had ${young} young`);
  return young * M;
}

/** Moves toward its target; stops (and looks again) at the sea. */
function walk(s: State, a: Agent, p: Profile, dt: number) {
  const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
  if (d < 0.05) { a.think = 0; return; }
  const step = Math.min(d, p.body.speed! * dt), nx = a.x + (dx / d) * step, ny = a.y + (dy / d) * step;
  if (s.terrain[idx(s, nx | 0, ny | 0)] === SEA) { a.think = 0; return; }
  a.x = nx; a.y = ny;
}

/** Takes in a small group of the same variant on its tile, while together they stay under the merge size. */
function merge(s: State, a: Agent, b: AnimalBody, i: number) {
  for (let k = head[i]; k >= 0; k = next[k]) {
    const o = s.agents[k];
    if (o === a || o.v !== a.v || o.n <= 0 || o.go || a.n + o.n > b.group * A.merge) continue;
    a.e = (a.e * a.n + o.e * o.n) / (a.n + o.n);
    a.n += o.n; a.bit += o.bit; o.n = 0; o.bit = 0;
    s.obits.push({ id: o.id, tick: s.tick, text: `joined ${b.kin} #${a.id}` });
    if (s.obits.length > A.obits) s.obits.shift();
    note(s, a, `took in ${b.kin} #${o.id}`);
  }
}

/** One tick: every animal whose turn it is. Returns the grams of young born. */
export function agentsStep(s: State, P: Profile[]): number {
  if (!s.agents.length) return 0;
  index(s);
  let biomass = 0;
  const count = s.agents.length;
  for (let k = 0; k < count; k++) {
    const a = s.agents[k];
    if (a.n <= 0) continue;
    const b = bodyOf(s, a.sp);
    if (s.tick - a.last < b.pace * (a.slow ? A.settledSlow : 1)) continue;
    const dt = (s.tick - a.last) * DT;
    a.last = s.tick;
    const p = P[a.v], i = tileOf(s, a), f = s.terrain[i] === SEA ? 0 : fit(s, p, i), S = storeG(s, a.sp);
    a.age += dt;
    a.full = Math.max(0, a.full - dt);
    // Grams burnt per member: more where it fits badly, less at rest. The last of the store goes before it starves.
    const cost = dt * burnG(s, p) * (1 + A.stress * (1 - f)), burnt = Math.min(a.e * S, cost * (a.doing === 'rest' ? A.rest : 1));
    a.e -= burnt / S; s.ledger.burn += burnt * a.n; nGive(s, i, burnt * a.n * nOf(groupOf(s, a.sp))); // its nitrogen goes back to the soil
    if (a.e <= 1e-9) { a.e = 0; die(s, a, i, f <= 0 ? 'died where it could not live' : 'starved'); continue; }
    if (b.group > 1) { // a group renews itself: members die of age now and then, the group goes on
      const old = a.n * (dt / a.life), lost = Math.min(a.n, Math.floor(old) + (rand(s) < old % 1 ? 1 : 0));
      if (lost) drop(s, i, groupOf(s, a.sp), lose(s, a, lost));
      if (a.n <= 0) { die(s, a, i, 'died out'); continue; }
    } else if (a.age >= a.life) { die(s, a, i, 'died of old age'); continue; }
    if (a.go) { // walking off after a split: no eating or breeding on the way
      walk(s, a, p, dt); // it stops (think 0) when it gets there, or at the sea
      if (!a.think) { a.go = false; note(s, a, 'settled'); }
      a.slow = false;
      continue;
    }
    // A crowded tile (its own kind) is no place to breed: it moves on even when full.
    const crowded = crowd(s, a.sp, i) >= A.crowd, calm = s.tick - a.woke > A.calmAfter * NUM.ticksPerSec;
    if (b.group > 1) merge(s, a, b, i);
    if (a.e >= b.breedAt && a.age >= a.life * A.adultAt && !crowded && s.count[a.sp] < b.cap) biomass += breed(s, P, a, p, b);
    if (a.full > 0 || (a.e >= A.restAt && !crowded)) { a.doing = 'rest'; a.slow = calm && !crowded; continue; }
    // It stays while it eats 1.5× its burn and a fair share of its fill (big eaters move on from thin food).
    const hungry = a.e < A.restAt, need = Math.max(1.5 * cost * a.n, A.moveBelow * b.appetite * burnG(s, p) * dt * a.n * A.keep.plants);
    const caught = hungry ? hunt(s, P, a, p, b, i, dt) : 0, got = (hungry ? eat(s, P, a, p, b, i, dt) : 0) + caught;
    if (got > 0) { a.e = Math.min(1, a.e + got / (a.n * S)); a.ate += got; a.doing = caught ? 'hunt' : 'eat'; }
    a.slow = calm && !crowded && got >= need;
    // Eating too little, or crowded: keep looking.
    if (got < need || crowded) {
      a.think -= dt;
      if (a.think <= 0) lookAround(s, P, a, p, b, got < need);
      walk(s, a, p, dt);
      if (!got) a.doing = 'walk';
    }
  }
  s.agents = s.agents.filter((a) => a.n > 0);
  return biomass;
}

/** Puts `members` new animals of variant v on tile i (arrivals, founder groups), in groups of up to half a group. */
/** Puts `members` new animals of variant v on tile i (arrivals, founder groups), in groups of up to half a group.
 * Their grams come from outside the books. */
export function spawn(s: State, v: number, i: number, members: number, why: string) {
  const sp = s.variants[v].sp, b = bodyOf(s, sp), x0 = i % s.w, y0 = (i / s.w) | 0, per = Math.max(1, Math.ceil(b.group / 2));
  for (let left = members; left > 0; left -= per) {
    const x = x0 + 0.15 + rand(s) * 0.7, y = y0 + 0.15 + rand(s) * 0.7;
    const a: Agent = { id: s.nextAgent++, sp, v, x, y, tx: x, ty: y, e: 0.6, age: rand(s) * b.life * 0.2, life: b.life * (0.8 + 0.4 * rand(s)),
      n: Math.min(per, left), doing: 'look', think: 0, mom: -1, kids: 0, ate: 0, log: [{ tick: s.tick, text: why }],
      last: s.tick - Math.floor(rand(s) * b.pace), slow: false, woke: 0, go: false, full: 0, bit: 0 };
    s.agents.push(a);
    s.ledger.came += gramsOf(s, a); s.nbook.came += gramsOf(s, a) * nOf(groupOf(s, sp));
    s.variants[v].tiles++;
  }
}

/** Animals on tile i, for the tile card and clicks. */
export const agentsOn = (s: State, i: number) => s.agents.filter((a) => tileOf(s, a) === i);
