// Who eats whom (N4 A). One function, `hunted`, gives the grams each hunter takes from each prey in a habitat: the sea
// removes exactly that and fitness reads it as survival. Pure: it reads populations and changes nothing.
import { PARTS } from '../data/parts';
import { GUARD, HUNT, SEA } from '../data/sea';
import { biteOf, buildKey, huntsWith, partsOf, sizeOf } from './build';
import type { Habitat } from './habitats';
import type { Build, DefenceKind, Id, Prey, Species, World } from './records';

export interface Newcomer { id: Id; build: Build; grams: number }
export interface Take { hunter: Id; prey: Id; grams: number }
export interface Threat { survival: number; by: Species | null }

/** What the hunt reads of a build, once. */
export interface Kit { build: Build; hunts: boolean; size: number; guards: DefenceKind[]; beats: DefenceKind[]; bite: number }
export function kitOf(build: Build, ids = partsOf(build)): Kit {
  const guards: DefenceKind[] = [], beats: DefenceKind[] = [];
  for (const p of ids) {
    const d = PARTS[p].defence;
    if (d && !guards.includes(d)) guards.push(d);
    for (const b of PARTS[p].beats ?? []) if (!beats.includes(b)) beats.push(b);
  }
  return { build, hunts: huntsWith(build, ids), size: sizeOf(build), guards, beats, bite: biteOf(build, ids) };
}
// Species builds are replaced, never edited in place (clutch heirs and the Life's builds are copies), so a kit stays
// valid while the species holds the same build object. Speed only (law 6): the sea reads every species each generation.
const kits = new WeakMap<Species, Kit>();
function speciesKit(s: Species): Kit {
  let kit = kits.get(s);
  if (!kit || kit.build !== s.build) kits.set(s, kit = kitOf(s.build));
  return kit;
}

/** The populations here a hunter could eat: alive and carrying no hunting part. */
export function preyIn(h: Habitat, world: World, extra?: Newcomer): Prey[] {
  const out: Prey[] = [];
  for (const s of world.species) {
    const grams = h.pops[s.id] ?? 0;
    if (grams <= 0) continue;
    const kit = speciesKit(s);
    if (!kit.hunts) out.push({ id: s.id, grams, size: kit.size, guards: kit.guards });
  }
  const kit = extra && extra.grams > 0 ? kitOf(extra.build) : null;
  if (extra && kit && !kit.hunts) out.push({ id: extra.id, grams: extra.grams, size: kit.size, guards: kit.guards });
  return out;
}

/** Grams of each prey per gram of this hunter per generation, before appetite and the cap; all 0 without a hunting
 *  part. Prey must be no bigger than the hunter. Type II: the total levels off as prey grows. It falls on the commonest
 *  prey most (share of grams squared), so rare prey has a refuge. Each prey defence the hunter can't beat cuts it. */
export function takeRates(hunter: Kit, prey: Prey[], area: number): Float64Array {
  const rates = new Float64Array(prey.length);
  if (!hunter.hunts) return rates;
  let grams = 0, squares = 0;
  for (const p of prey) if (p.size <= hunter.size) { grams += p.grams; squares += p.grams * p.grams; }
  if (grams <= 0) return rates;
  const density = grams / Math.max(1, area) / HUNT.referenceDensity;
  const level = HUNT.reach * hunter.bite * density / (1 + density / HUNT.saturation);
  prey.forEach((p, i) => {
    if (p.size > hunter.size) return;
    let unbeaten = 0;
    for (const g of p.guards) if (!hunter.beats.includes(g)) unbeaten++;
    rates[i] = level * p.grams * p.grams / squares * GUARD ** unbeaten;
  });
  return rates;
}

/** The grams each hunter here takes from each prey this generation. No hunt slot (prey under `slotFloor`), no take.
 *  Hunters together take at most `maxTake` of any one prey. `prey` defaults to `preyIn`; the sea passes its hunt slot's. */
export function hunted(h: Habitat, world: World, extra?: Newcomer, prey = preyIn(h, world, extra)): Take[] {
  let total = 0;
  for (const p of prey) total += p.grams;
  if (total < SEA.slotFloor) return [];
  const takes: Take[] = [], at: number[] = [], wanted = new Float64Array(prey.length);
  for (const s of world.species) {
    const pop = h.pops[s.id] ?? 0;
    if (pop <= 0) continue;
    const kit = speciesKit(s);
    if (!kit.hunts) continue;
    const rates = takeRates(kit, prey, h.area);
    for (let i = 0; i < prey.length; i++) {
      if (rates[i] <= 0) continue;
      const grams = pop * SEA.appetite * rates[i];
      takes.push({ hunter: s.id, prey: prey[i].id, grams });
      at.push(i);
      wanted[i] += grams;
    }
  }
  for (let k = 0; k < takes.length; k++) {
    const i = at[k], cap = HUNT.maxTake * prey[i].grams;
    if (wanted[i] > cap) takes[k].grams *= cap / wanted[i];
  }
  return takes;
}

/** Survival here: 1 − the share of this build's grams the hunters take, and the hunter taking most. A build that is
 *  not here yet is met as `probe` grams of newcomer. A hunter is never prey. */
export function threat(build: Build, h: Habitat, world: World): Threat {
  if (huntsWith(build)) return { survival: 1, by: null };
  const key = buildKey(build);
  const mine = world.species.filter((s) => (h.pops[s.id] ?? 0) > 0 && buildKey(s.build) === key).map((s) => s.id);
  const extra = mine.length ? undefined : { id: '\u0000newcomer', build, grams: HUNT.probe };
  const ids = new Set(mine.length ? mine : [extra!.id]);
  const grams = mine.length ? mine.reduce((sum, id) => sum + h.pops[id], 0) : HUNT.probe;
  const byHunter = new Map<Id, number>();
  let lost = 0;
  for (const t of hunted(h, world, extra)) {
    if (!ids.has(t.prey)) continue;
    lost += t.grams;
    byHunter.set(t.hunter, (byHunter.get(t.hunter) ?? 0) + t.grams);
  }
  let by: Species | null = null, most = 0;
  for (const [id, g] of byHunter) if (g > most) { most = g; by = world.species.find((s) => s.id === id) ?? null; }
  return { survival: Math.max(0, 1 - lost / grams), by };
}
