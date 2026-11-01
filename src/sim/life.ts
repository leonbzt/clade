// Life in every slot. Health follows fit slowly (the plant's reserves); a slot's state is its mass in grams, and its
// ceiling is what health allows. Growth (`grow`) fills the slot toward the ceiling; turnover (`renew`) sheds a small
// share of the mass as litter and makes it anew, so a mature plant makes food slowly all the time and a grazed one
// regrows fast by itself. Cover is mass ÷ the full mass. Spores,
// yield and death follow health too, so plants switch on and off slowly. A dying plant thins out over time and drops
// its grams as litter as it goes. Open slots go to whichever seed arrives and fits, so fast spreaders win gaps and strong holders
// keep their tiles. A slot holds a variant: variants of one species compete like species do, and a settling child
// may be a mutant.
import { STRATA } from '../data/fields';
import { MASS } from '../data/masses';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { rand } from './rng';
import { EV, SEA, type State } from './state';
import { fit, limitOf, type Profile } from './fit';
import { defOf, maybeMutate, pickVariant } from './variants';
import { drop, groupOf, made } from './tally';
import { N_UNIT, nGive, nOf, nTake } from './nitrogen';

const L = NUM.life;

export function record(s: State, slot: number, code: number, sp: number, limit = -1) {
  s.lastTick[slot] = s.tick; s.lastCode[slot] = code; s.lastSp[slot] = sp; s.lastLimit[slot] = limit;
}

function clear(s: State, slot: number) {
  s.occ[slot] = -1; s.mass[slot] = 0; s.cover[slot] = 0; s.health[slot] = 0; s.dying[slot] = 0; s.old[slot] = 0;
}

/** Grams in a slot at full cover, per base species. */
const FULL = SPECIES.map((d) => (MASS[d.id] ?? 0) * NUM.mass.tile);
/** Biomass counts the grams a plant makes, × its yield genes (a variant that yields 20% less counts 80%). */
const YIELD = SPECIES.map((d) => d.yield);
export const fullOf = (s: State, v: number) => FULL[s.species[s.variants[v].sp].base];
/** What health allows in a slot, in grams. */
export const ceilingOf = (s: State, v: number, health: number) => fullOf(s, v) * Math.sqrt(Math.max(0, health));

/** Sets a slot's mass, and its cover with it. */
export function setMass(s: State, slot: number, g: number) {
  const f = fullOf(s, s.occ[slot]);
  s.mass[slot] = g; s.cover[slot] = f > 0 ? g / f : 0;
}

/** A plant's grams per second, with x = mass ÷ ceiling: net growth grow × ceiling × (x − x²) up to the ceiling, and
 * above it (health fell) a loss of grow × the excess; turnover renew × mass. Production is the regrowth plus the mass
 * made anew; the turnover is shed as litter, and so is the loss. */
export function growth(mass: number, ceiling: number, grow: number, renew: number): { made: number; shed: number } {
  const x = ceiling > 0 ? mass / ceiling : 2, net = x <= 1 ? grow * ceiling * (x - x * x) : -grow * (mass - Math.max(0, ceiling));
  return { made: renew * mass + Math.max(0, net), shed: renew * mass + Math.max(0, -net) };
}

/** Empties a slot at once (taken over, or a flare); the dead plant's grams become litter. */
export function kill(s: State, slot: number, code: number, limit = -1) {
  const v = s.occ[slot];
  drop(s, slot % (s.w * s.h), groupOf(s, s.variants[v].sp), s.mass[slot]);
  record(s, slot, code, s.variants[v].sp, limit);
  clear(s, slot);
}

/** A plant settles with `grams`, as far as the nitrogen on its tile goes (a fixer fixes its own); they count as made.
 * Where there's almost none, it doesn't take (false). */
export function settle(s: State, slot: number, v: number, grams: number, code: number, health: number): boolean {
  const i = slot % (s.w * s.h), g = groupOf(s, s.variants[v].sp), n = nOf(g);
  if (!SPECIES[g].fix && s.layers.nitrogen[i] * N_UNIT < 0.01 * grams * n) return false;
  if (SPECIES[g].fix) s.nbook.fixed += grams * n;
  else grams = nTake(s, i, grams * n) / n;
  s.occ[slot] = v; s.health[slot] = health; s.dying[slot] = 0; s.old[slot] = 0;
  setMass(s, slot, grams);
  record(s, slot, code, s.variants[v].sp);
  made(s, i, g, grams);
  s.ledger.prod += grams;
  return true;
}

/** The grams a plant can make out of `want` with the nitrogen on its tile: production × its share. A fixer fixes
 * its own and adds `fix` per gram it makes. */
function feed(s: State, i: number, p: Profile, g: number, want: number): number {
  const n = nOf(g);
  if (p.stats.fix > 0) { const add = want * p.stats.fix; nGive(s, i, add); s.nbook.fixed += want * n + add; return want; }
  return nTake(s, i, want * n) / n;
}

/** Your species' last few tiles don't die and can't be taken. */
export const protectedSp = (s: State, sp: number) => s.foundings[s.species[sp].id] > 0 && s.count[sp] <= L.floor;
const protectedAt = (s: State, slot: number) => protectedSp(s, s.variants[s.occ[slot]].sp);

/** The occupant's strength: its health × hold; young and dying plants hold on less well. */
function holding(s: State, p: Profile, slot: number): number {
  return s.health[slot] * p.stats.hold * (0.5 + 0.5 * s.cover[slot]) * (s.dying[slot] ? L.dyingHold : 1);
}

/** Can a plant with profile `p` take this slot from its occupant (or settle it, if empty)? */
export function canTake(s: State, P: Profile[], p: Profile, slot: number): boolean {
  const i = slot % (s.w * s.h), occ = s.occ[slot];
  if (occ < 0) return true;
  return !protectedAt(s, slot) && fit(s, p, i) * p.stats.hold > holding(s, P[occ], slot) * (1 + L.incumbentEdge);
}

export function lifeStep(s: State, P: Profile[], tickDt: number) {
  const n = s.w * s.h;
  let gain = 0;
  for (let k = 0; k < STRATA.length; k++) {
    // Start at a random tile each tick so no direction is favoured.
    const start = Math.floor(rand(s) * n);
    for (let q = 0; q < n; q++) {
      const i = (start + q) % n, slot = k * n + i, v = s.occ[slot];
      if (v < 0) continue;
      // Old growth (steady health, nearly full cover) updates every few ticks, with that much time at once.
      if (s.old[slot] && (s.tick + slot) % L.oldEvery) continue;
      const p = P[v], sp = p.sp, dt = s.old[slot] ? tickDt * L.oldEvery : tickDt;
      const g = groupOf(s, sp);
      if (s.dying[slot]) {
        const loss = Math.min(s.mass[slot], (fullOf(s, v) * dt) / L.dieback);
        setMass(s, slot, s.mass[slot] - loss);
        drop(s, i, g, loss);
        if (s.cover[slot] < 0.03) { drop(s, i, g, s.mass[slot]); clear(s, slot); }
        continue;
      }
      const f = fit(s, p, i), limit = limitOf();
      const h = (s.health[slot] += (f - s.health[slot]) * Math.min(1, dt / p.stats.reserve));
      // Grams: production toward what health allows (as far as the nitrogen goes), turnover to litter.
      const grown = growth(s.mass[slot], ceilingOf(s, v, h), p.stats.grow, p.stats.renew);
      const mk = grown.made > 0 ? feed(s, i, p, g, grown.made * dt) : 0;
      setMass(s, slot, Math.max(0, s.mass[slot] + mk - dt * grown.shed));
      if (mk > 0) { made(s, i, g, mk); s.ledger.prod += mk; gain += mk * (YIELD[g] ? p.stats.yield / YIELD[g] : 1); }
      if (grown.shed > 0) drop(s, i, g, grown.shed * dt);
      const c = s.cover[slot], target = Math.sqrt(Math.max(0, h));
      s.old[slot] = c > L.oldCover && Math.abs(f - h) < L.oldDelta && Math.abs(target - c) < L.oldDelta ? 1 : 0;
      const strain = L.stress * (1 - h);
      const death = (dt / p.stats.life) * (1 + strain) + (h < 0.05 ? dt / L.starve : 0);
      if (!protectedSp(s, sp) && rand(s) < death) {
        const stressed = h < 0.05 || rand(s) < strain / (1 + strain);
        s.dying[slot] = 1; s.old[slot] = 0;
        record(s, slot, stressed ? EV.stress : EV.age, sp, stressed ? limit : -1);
      }
      if (rand(s) < dt * p.stats.seeds * c * h) spread(s, P, v, k, i); // weak plants make fewer spores
    }
  }
  return gain;
}

function spread(s: State, P: Profile[], v: number, k: number, from: number) {
  const n = s.w * s.h, x = from % s.w, y = (from / s.w) | 0, R = L.reach;
  const dx = Math.floor(rand(s) * (2 * R + 1)) - R, dy = Math.floor(rand(s) * (2 * R + 1)) - R;
  const nx = x + dx, ny = y + dy;
  if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= s.w || ny >= s.h) return;
  const j = ny * s.w + nx, slot = k * n + j, occ = s.occ[slot];
  if (occ === v || s.terrain[j] === SEA) return;
  const f = fit(s, P[v], j);
  if (f <= 0) return;
  if (occ < 0) { // seedlings rarely take on poor tiles
    if (rand(s) < f * f * f && settle(s, slot, v, L.settleCover * ceilingOf(s, v, f), EV.settled, f)) maybeMutate(s, P, slot);
    return;
  }
  if (canTake(s, P, P[v], slot) && rand(s) < L.takeover) {
    kill(s, slot, EV.taken);
    if (settle(s, slot, v, L.settleCover * ceilingOf(s, v, f), EV.settled, f)) maybeMutate(s, P, slot);
  }
}

/** Spore rain: every species you've placed seeds fitting open slots anywhere, at a low rate, as one of its
 * variants (weighted by tiles). */
export function sporeRain(s: State, P: Profile[], dt: number) {
  const n = s.w * s.h;
  for (let sp = 0; sp < s.species.length; sp++) {
    if (!s.foundings[s.species[sp].id] || !s.count[sp] || defOf(s, sp).animal || rand(s) >= dt * L.rain) continue;
    const v = pickVariant(s, sp), i = Math.floor(rand(s) * n), slot = P[v].stratum * n + i;
    if (s.terrain[i] === SEA || s.occ[slot] >= 0) continue;
    const f = fit(s, P[v], i);
    if (f >= L.rainMinFit) settle(s, slot, v, L.settleCover * ceilingOf(s, v, f), EV.rain, f);
  }
}

/** Now and then a steam vent flares: plants near it die, soil is lost, and the patch starts over. */
export function flares(s: State, dt: number) {
  const F = NUM.flare;
  if (!s.vents.length || rand(s) >= dt / F.every) return;
  const v = s.vents[Math.floor(rand(s) * s.vents.length)], n = s.w * s.h, vx = v % s.w, vy = (v / s.w) | 0;
  let cleared = 0;
  for (let dy = -F.radius; dy <= F.radius; dy++) for (let dx = -F.radius; dx <= F.radius; dx++) {
    const x = vx + dx, y = vy + dy;
    if (dx * dx + dy * dy > F.radius * F.radius + 1 || x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
    const i = y * s.w + x;
    if (s.terrain[i] === SEA) continue;
    s.layers.soil[i] *= 1 - F.soilLoss;
    s.scar[i] = s.tick;
    for (let k = 0; k < STRATA.length; k++) {
      const slot = k * n + i, v = s.occ[slot];
      if (v < 0 || protectedAt(s, slot)) continue;
      kill(s, slot, EV.flare); s.count[s.variants[v].sp]--; cleared++;
    }
  }
  s.log.push({ tick: s.tick, kind: 'flare', x: vx, y: vy, n: cleared, name: s.landmarks[s.mark[v]]?.name ?? 'A steam vent' });
}
