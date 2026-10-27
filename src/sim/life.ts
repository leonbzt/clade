// Life in every slot: growth, death (age, or faster when stressed), yield and spread. Open slots go to whichever
// seed arrives and fits, so fast spreaders win gaps and strong holders keep their tiles.
import { STRATA } from '../data/fields';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { rand } from './rng';
import { EV, SEA, type State } from './state';
import { fit, limitOf, type Profile } from './fit';

const L = NUM.life;

export function record(s: State, slot: number, code: number, sp: number, limit = -1) {
  s.lastTick[slot] = s.tick; s.lastCode[slot] = code; s.lastSp[slot] = sp; s.lastLimit[slot] = limit;
}

/** Empties a slot; the dead plant becomes litter. */
export function kill(s: State, slot: number, code: number, limit = -1) {
  const n = s.w * s.h, i = slot % n, sp = s.occ[slot];
  const lit = s.layers.litter;
  lit[i] = Math.min(1, lit[i] + s.cover[slot] * SPECIES[sp].litter);
  record(s, slot, code, sp, limit);
  s.occ[slot] = -1; s.cover[slot] = 0;
}

export function settle(s: State, slot: number, sp: number, cover: number, code: number) {
  s.occ[slot] = sp; s.cover[slot] = cover;
  record(s, slot, code, sp);
}

/** Your species' last few tiles don't die and can't be taken. */
const protectedSp = (s: State, sp: number) => s.foundings[SPECIES[sp].id] > 0 && s.count[sp] <= L.floor;

/** A plant's strength on a tile: fit × hold. Young plants hold on less well. */
export function strength(s: State, p: Profile, i: number, cover = 1): number {
  return fit(s, p, i) * p.stats.hold * (0.5 + 0.5 * cover);
}

/** Can species `sp` take this slot from its occupant (or settle it, if empty)? */
export function canTake(s: State, P: Profile[], sp: number, slot: number): boolean {
  const n = s.w * s.h, i = slot % n, occ = s.occ[slot];
  if (occ < 0) return true;
  return !protectedSp(s, occ) && strength(s, P[sp], i) > strength(s, P[occ], i, s.cover[slot]) * (1 + L.incumbentEdge);
}

export function lifeStep(s: State, P: Profile[], dt: number) {
  const n = s.w * s.h, counts = new Int32Array(SPECIES.length);
  let gain = 0;
  for (let k = 0; k < STRATA.length; k++) {
    // Start at a random tile each tick so no direction is favoured.
    const start = Math.floor(rand(s) * n);
    for (let q = 0; q < n; q++) {
      const i = (start + q) % n, slot = k * n + i, sp = s.occ[slot];
      if (sp < 0) continue;
      const p = P[sp], f = fit(s, p, i), limit = limitOf();
      const c = (s.cover[slot] += dt * p.stats.grow * f * (1 - s.cover[slot]));
      const strain = L.stress * (1 - f);
      const death = f <= 0 ? dt / L.starve : (dt / p.stats.life) * (1 + strain);
      if (!protectedSp(s, sp) && rand(s) < death) {
        const stressed = f <= 0 || rand(s) < strain / (1 + strain);
        kill(s, slot, stressed ? EV.stress : EV.age, stressed ? limit : -1);
        continue;
      }
      counts[sp]++;
      gain += p.stats.yield * c * f * dt;
      if (rand(s) < dt * p.stats.seeds * c * f) spread(s, P, sp, k, i); // stressed plants make fewer spores
    }
  }
  s.count.set(counts);
  return gain;
}

function spread(s: State, P: Profile[], sp: number, k: number, from: number) {
  const n = s.w * s.h, x = from % s.w, y = (from / s.w) | 0;
  const dx = Math.floor(rand(s) * 3) - 1, dy = Math.floor(rand(s) * 3) - 1;
  const nx = x + dx, ny = y + dy;
  if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= s.w || ny >= s.h) return;
  const j = ny * s.w + nx, slot = k * n + j, occ = s.occ[slot];
  if (occ === sp || s.terrain[j] === SEA) return;
  const f = fit(s, P[sp], j);
  if (f <= 0) return;
  if (occ < 0) { if (rand(s) < f * f) settle(s, slot, sp, L.settleCover, EV.settled); return; } // seedlings rarely take on poor tiles
  if (canTake(s, P, sp, slot) && rand(s) < L.takeover) {
    kill(s, slot, EV.taken);
    settle(s, slot, sp, L.settleCover, EV.settled);
  }
}

/** Spore rain: every species you've placed seeds fitting open slots anywhere, at a low rate. */
export function sporeRain(s: State, P: Profile[], dt: number) {
  const n = s.w * s.h;
  for (let sp = 0; sp < SPECIES.length; sp++) {
    if (!s.foundings[SPECIES[sp].id] || rand(s) >= dt * L.rain) continue;
    const i = Math.floor(rand(s) * n), slot = P[sp].stratum * n + i;
    if (s.terrain[i] === SEA || s.occ[slot] >= 0) continue;
    if (fit(s, P[sp], i) >= L.rainMinFit) settle(s, slot, sp, L.settleCover, EV.rain);
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
    for (let k = 0; k < STRATA.length; k++) {
      const slot = k * n + i, sp = s.occ[slot];
      if (sp < 0 || protectedSp(s, sp)) continue;
      kill(s, slot, EV.flare); s.count[sp]--; cleared++;
    }
  }
  s.log.push({ tick: s.tick, kind: 'flare', x: vx, y: vy, n: cleared });
}
