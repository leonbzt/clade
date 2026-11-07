// One-time habitat → patch migration. See the slice 19 Part A mapping before changing it.
import { ROLE_IDS, type Role } from '../data/garden';
import { HAB_ORDER, TIERS, type HabitatId } from '../data/habitats';
import { PLAN_IDS, type PlanId } from '../data/life';
import { LEGACY_COLOUR, PLAYER_SPECIES, SEA, lineId, type Species } from '../data/sea';
import type { Entry } from './garden';
import type { Save } from './save';
import { newSea, preyOf, type Sea } from './sea';
import type { Continuation, SeaSave } from './sea-save';

const idOf = (e: Entry) => e.line ? lineId(e.line, e.role) : `legacy:${e.sp}:${e.role}`;
const defaultBody: Record<Role, PlanId> = { grazer: 'arthropod', burrower: 'worm', predator: 'swimmer' };

export function legacyPatchMap(s: Sea): Record<HabitatId, number> {
  return Object.fromEntries(HAB_ORDER.map((hab) => [hab, s.patches.find((p) => p.ground === hab)?.id ?? 0])) as Record<HabitatId, number>;
}

export function migrateLegacySea(old: Save, original: string): SeaSave {
  const species: Species[] = PLAYER_SPECIES.map((sp) => ({ ...sp })), seen = new Set(species.map((sp) => sp.id));
  for (const hab of HAB_ORDER) for (const e of old.garden.habs[hab].entries) {
    const id = idOf(e);
    if (seen.has(id)) continue;
    seen.add(id);
    // Visitor IDs retained the body even though the legacy Entry omitted it; natives have no player body.
    const plan = e.sp.startsWith('visitor:') ? PLAN_IDS.find((p) => e.sp.endsWith(`:${p}:${e.role}`)) : undefined;
    species.push({ id, name: e.name, role: e.role, plan, line: false, colour: LEGACY_COLOUR[e.sp] ?? [160, 180, 160] });
  }
  if (species.length > 256) throw new Error('Too many legacy species');
  const sea = newSea(old.seed, species), map = legacyPatchMap(sea), candidates: Continuation[] = [];
  sea.gen = old.garden.gen; sea.r = old.garden.r;
  for (const hab of HAB_ORDER) {
    const h = old.garden.habs[hab], n = old.garden.normal[hab], home = sea.patches[map[hab]];
    const grounds = sea.patches.filter((p) => p.ground === hab);
    if (!grounds.length) grounds.push(home);
    for (const p of grounds) {
      p.mats = h.mats; p.rot = h.rot; p.oxygen = h.oxygen;
      p.normal = { mats: n.mats, rot: n.rot, oxygen: n.oxygen, prey: 0, hunters: 0 };
    }
    home.normal.prey += n.pops.grazer + n.pops.burrower; home.normal.hunters += n.pops.predator;
    // Keep totals: a habitat's residents go into exactly one patch, with their existing scores.
    for (const e of h.entries) {
      const id = idOf(e), k = sea.species.findIndex((sp) => sp.id === id);
      home.pop[k] += e.pop;
      for (const p of grounds) p.fit[k] = Math.max(p.fit[k], e.score);
      if (e.line && e.score > 0 && e.proven) candidates.push({ patch: home.id, species: id, plan: e.line, role: e.role, eggs: Math.max(1, Math.round(e.score)) });
    }
  }
  for (const p of sea.patches) {
    p.peak.set(p.pop); p.low.set(p.pop); p.preyPeak = preyOf(sea, p);
    p.hist.fill(0); p.hist.set([p.mats, p.rot, p.preyPeak, p.oxygen], (sea.gen % SEA.history) * 4);
  }
  // Legacy saves lack chronology. Stable ties preserve habitat order, then species ID.
  candidates.sort((a, b) => b.eggs - a.eggs || HAB_ORDER.indexOf(sea.patches[a.patch].ground) - HAB_ORDER.indexOf(sea.patches[b.patch].ground)
    || (a.species < b.species ? -1 : a.species > b.species ? 1 : 0));
  let continuation = candidates[0];
  if (!continuation) {
    const progress: Continuation[] = [];
    for (const hab of HAB_ORDER) for (const role of ROLE_IDS) {
      const eggs = TIERS.find(([tier]) => tier === old.best[`${hab}:${role}`])?.[1] ?? 0, plan = defaultBody[role];
      if (eggs > 0) progress.push({ patch: map[hab], species: lineId(plan, role), plan, role, eggs });
    }
    progress.sort((a, b) => b.eggs - a.eggs);
    continuation = progress[0];
  }
  const pending = old.pending ? { ...old.pending, cards: old.pending.cards.map((c) => ({ ...c })),
    patch: map[old.pending.hab], species: lineId(old.pending.plan, old.pending.role) } : undefined;
  if (pending && pending.eggs > 0) continuation = { patch: pending.patch, species: pending.species,
    plan: pending.plan, role: pending.role, eggs: pending.eggs };
  return { v: 3, seed: old.seed, at: old.at, sea, news: [], lives: old.lives, best: { ...old.best },
    forms: { ...old.forms }, unlocks: { ...old.unlocks }, pending, continuation, legacy: { json: original } };
}
