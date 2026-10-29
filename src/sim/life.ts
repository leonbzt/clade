// Life in every slot. Health follows fit slowly (the plant's reserves); cover follows health; growth, spores, yield
// and death follow health too, so plants switch on and off slowly. A dying plant thins out over time and drops its
// litter as it goes. Open slots go to whichever seed arrives and fits, so fast spreaders win gaps and strong holders
// keep their tiles. A slot holds a variant: variants of one species compete like species do, and a settling child
// may be a mutant.
import { STRATA } from '../data/fields';
import { NUM } from '../data/numbers';
import { rand } from './rng';
import { EV, SEA, type State } from './state';
import { fit, limitOf, type Profile } from './fit';
import { defOf, maybeMutate, pickVariant } from './variants';
import { drop, groupOf, made } from './tally';

const L = NUM.life;

export function record(s: State, slot: number, code: number, sp: number, limit = -1) {
  s.lastTick[slot] = s.tick; s.lastCode[slot] = code; s.lastSp[slot] = sp; s.lastLimit[slot] = limit;
}

function clear(s: State, slot: number) {
  s.occ[slot] = -1; s.cover[slot] = 0; s.health[slot] = 0; s.dying[slot] = 0; s.old[slot] = 0;
}

const litterOf = (s: State, v: number) => defOf(s, s.variants[v].sp).litter;

/** Empties a slot at once (taken over, or a flare); the dead plant becomes litter. */
export function kill(s: State, slot: number, code: number, limit = -1) {
  const v = s.occ[slot];
  drop(s, slot % (s.w * s.h), groupOf(s, s.variants[v].sp), s.cover[slot] * litterOf(s, v));
  record(s, slot, code, s.variants[v].sp, limit);
  clear(s, slot);
}

export function settle(s: State, slot: number, v: number, cover: number, code: number, health: number) {
  s.occ[slot] = v; s.cover[slot] = cover; s.health[slot] = health; s.dying[slot] = 0; s.old[slot] = 0;
  record(s, slot, code, s.variants[v].sp);
  made(s, slot % (s.w * s.h), groupOf(s, s.variants[v].sp), cover);
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
      if (s.dying[slot]) {
        const loss = Math.min(s.cover[slot], dt / L.dieback), litter = litterOf(s, v), g = groupOf(s, sp);
        s.cover[slot] -= loss;
        drop(s, i, g, loss * litter);
        if (s.cover[slot] < 0.03) { drop(s, i, g, s.cover[slot] * litter); clear(s, slot); }
        continue;
      }
      const f = fit(s, p, i), limit = limitOf();
      const h = (s.health[slot] += (f - s.health[slot]) * Math.min(1, dt / p.stats.reserve));
      // Cover grows toward what health allows, and shrinks slowly when health falls.
      const target = Math.sqrt(Math.max(0, h)), c0 = s.cover[slot];
      const c = (s.cover[slot] = c0 + dt * (target > c0 ? p.stats.grow * (target - c0) * 2 : L.shrink * (target - c0)));
      if (c > c0) made(s, i, groupOf(s, sp), c - c0);
      s.old[slot] = c > L.oldCover && Math.abs(f - h) < L.oldDelta && Math.abs(target - c) < L.oldDelta ? 1 : 0;
      const strain = L.stress * (1 - h);
      const death = (dt / p.stats.life) * (1 + strain) + (h < 0.05 ? dt / L.starve : 0);
      if (!protectedSp(s, sp) && rand(s) < death) {
        const stressed = h < 0.05 || rand(s) < strain / (1 + strain);
        s.dying[slot] = 1; s.old[slot] = 0;
        record(s, slot, stressed ? EV.stress : EV.age, sp, stressed ? limit : -1);
      }
      gain += p.stats.yield * c * h * dt;
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
    if (rand(s) < f * f * f) { settle(s, slot, v, L.settleCover, EV.settled, f); maybeMutate(s, P, slot); }
    return;
  }
  if (canTake(s, P, P[v], slot) && rand(s) < L.takeover) {
    kill(s, slot, EV.taken);
    settle(s, slot, v, L.settleCover, EV.settled, f);
    maybeMutate(s, P, slot);
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
    if (f >= L.rainMinFit) settle(s, slot, v, L.settleCover, EV.rain, f);
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
      const slot = k * n + i, v = s.occ[slot];
      if (v < 0 || protectedAt(s, slot)) continue;
      kill(s, slot, EV.flare); s.count[s.variants[v].sp]--; cleared++;
    }
  }
  s.log.push({ tick: s.tick, kind: 'flare', x: vx, y: vy, n: cleared, name: s.landmarks[s.mark[v]]?.name ?? 'A steam vent' });
}
