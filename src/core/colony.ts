// The founder colony on its hex patch: energy, the three-way split, water and dry spells.
// Dry spells only brown tiles; nothing here ever uncovers one.
import { NUMBERS } from '../data/numbers';
import { HEX_DIRS, hexKey } from './hex';
import { modifiers, type Modifiers } from './modifiers';
import { random } from './rng';
import type { Colony, GameState, Split, Tile } from './types';

export function coveredCount(c: Colony): number {
  return c.tiles.filter((t) => t.covered).length;
}

export function greenTiles(c: Colony): Tile[] {
  return c.tiles.filter((t) => t.covered && !t.brown);
}

export function tileEnergy(t: Tile, m: Modifiers): number {
  const e = NUMBERS.energy;
  return e.perTile * (1 + e.dampBonus * t.dampness) * m.energy * t.recovery;
}

export function energyPerSec(c: Colony, m: Modifiers): number {
  return greenTiles(c).reduce((sum, t) => sum + tileEnergy(t, m), 0);
}

export function spreadCost(c: Colony, m: Modifiers): number {
  const s = NUMBERS.spread;
  return s.baseCost * Math.pow(s.costGrowth, coveredCount(c) - 1) * m.spreadCost;
}

export function waterCap(c: Colony, m: Modifiers): number {
  return NUMBERS.water.capPerTile * coveredCount(c) * m.water;
}

export function waterFraction(c: Colony, m: Modifiers): number {
  const cap = waterCap(c, m);
  return cap > 0 ? Math.min(1, c.water / cap) : 0;
}

export function resilience(t: Tile, c: Colony, m: Modifiers): number {
  const r = NUMBERS.resilience;
  return r.damp * t.dampness + r.water * waterFraction(c, m) + m.dryResist;
}

/** Normalises a split so its parts sum to 1. */
export function normaliseSplit(split: Split): Split {
  const sum = split.spread + split.cushion + split.spores;
  if (sum <= 0) return { spread: 1 / 3, cushion: 1 / 3, spores: 1 / 3 };
  return { spread: split.spread / sum, cushion: split.cushion / sum, spores: split.spores / sum };
}

/** Uncovered tiles next to the colony, dampest first. */
export function frontier(c: Colony): Tile[] {
  const covered = new Set(c.tiles.filter((t) => t.covered).map(hexKey));
  return c.tiles
    .filter((t) => !t.covered && HEX_DIRS.some((d) => covered.has(hexKey({ q: t.q + d.q, r: t.r + d.r }))))
    .sort((a, b) => b.dampness - a.dampness);
}

function spreadOne(s: GameState, c: Colony): boolean {
  const options = frontier(c);
  if (options.length === 0) return false;
  const best = options.filter((t) => t.dampness === options[0].dampness);
  const pick = best[Math.floor(random(s) * best.length)];
  pick.covered = true;
  return true;
}

function revive(t: Tile): void {
  t.brown = false;
  t.recovery = 0;
}

function stepRecovery(c: Colony, dt: number): void {
  const rate = dt / NUMBERS.drySpell.recoveryTime;
  for (const t of c.tiles) if (!t.brown && t.recovery < 1) t.recovery = Math.min(1, t.recovery + rate);
}

function stepWeather(c: Colony): void {
  const d = NUMBERS.drySpell;
  const w = c.weather;
  const age = c.age;
  if (w.state === 'calm' && age >= w.nextSpellAt - d.warning) w.state = 'warning';
  if (w.state === 'warning' && age >= w.nextSpellAt) {
    w.state = 'dry';
    w.spellStart = w.nextSpellAt;
    w.nextSpellAt += d.period;
    w.spells++;
  }
  if (w.state === 'dry') {
    const into = age - w.spellStart;
    w.stress = d.peakStress * Math.min(1, into / d.rampTime);
    if (into >= d.duration) {
      w.state = 'rain';
      w.stress = 0;
    }
  }
  if (w.state === 'rain') {
    // brown tiles revive from the vent outward
    const into = age - w.spellStart - d.duration;
    const reach = (into / d.rain) * (NUMBERS.patch.radius + 1);
    for (const t of c.tiles) if (t.brown && t.ring <= reach) revive(t);
    if (into >= d.rain) {
      for (const t of c.tiles) if (t.brown) revive(t);
      w.state = age >= w.nextSpellAt - d.warning ? 'warning' : 'calm';
    }
  }
}

function stepDrying(c: Colony, m: Modifiers, dt: number): void {
  const w = c.weather;
  if (w.state !== 'dry') {
    c.water *= 1 - NUMBERS.water.evaporation * dt;
    return;
  }
  const green = greenTiles(c);
  for (const t of green) if (w.stress > resilience(t, c, m)) t.brown = true;
  const stressShare = w.stress / NUMBERS.drySpell.peakStress;
  c.water = Math.max(0, c.water - NUMBERS.water.drainPerTile * stressShare * greenTiles(c).length * dt);
}

/** Advances the colony; returns the energy produced this step (for XP). */
export function stepColony(s: GameState, c: Colony, dt: number): number {
  const m = modifiers(s);
  c.age += dt;
  stepWeather(c);
  stepDrying(c, m, dt);
  stepRecovery(c, dt);

  const energy = energyPerSec(c, m) * dt;
  c.energy += energy;
  const split = normaliseSplit(c.split);

  // Spread
  c.spreadStore += energy * split.spread * m.spreadEnergy;
  let cost = spreadCost(c, m);
  while (c.spreadStore >= cost) {
    if (!spreadOne(s, c)) {
      c.spreadStore = cost; // patch full: the energy waits
      break;
    }
    c.spreadStore -= cost;
    cost = spreadCost(c, m);
  }

  // Cushion
  c.water = Math.min(waterCap(c, m), c.water + energy * split.cushion * NUMBERS.water.perEnergy * m.water);

  // Spores
  s.genes += energy * split.spores * NUMBERS.genes.perEnergy * m.genes;

  return energy;
}
