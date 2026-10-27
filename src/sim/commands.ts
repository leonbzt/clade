// Everything the player can do. The UI only changes the game through these.
import { FIELDS, STRATA } from '../data/fields';
import { GENES } from '../data/genes';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { TREE, type Req } from '../data/tree';
import { EV, type State } from './state';
import { buildProfile, fit, profiles, type Profile } from './fit';
import { canTake, kill, settle } from './life';
import { defOf, genomeKey, poolOf, speciesIndex, variantFor, variantName, type Genome } from './variants';

export type Result = { ok: true; msg?: string } | { ok: false; reason: string };
const fail = (reason: string): Result => ({ ok: false, reason });

/** Species ids you can found: those whose tree node you reached, and the ones you made. */
export function unlockedSpecies(s: State): string[] {
  const reached = new Set(TREE.filter((n) => n.species && s.reached.includes(n.id)).map((n) => n.species!));
  return s.species.filter((x) => reached.has(x.id) || x.parent >= 0).map((x) => x.id);
}

export function coverCount(s: State, speciesId: string): number {
  return s.count[speciesIndex(s, speciesId)] ?? 0;
}

export function foundingCost(s: State, speciesId: string): number {
  const n = s.foundings[speciesId], F = NUM.founding;
  return n === 0 ? 0 : Math.round(F.base * F.growth ** (n - 1));
}

const slotFor = (s: State, sp: number, i: number) => STRATA.indexOf(defOf(s, sp).stratum) * s.w * s.h + i;

/** What founding plants: the species' biggest variant, or its base genome when it has none on the map. */
function founder(s: State, sp: number): Genome {
  const pool = poolOf(s, sp);
  return pool.length ? s.variants[pool[0]].genome : s.species[sp].genome;
}

/** The profile founding would plant, for the placement view and the checks. */
export function founderProfile(s: State, speciesId: string, P: Profile[] = profiles(s)): Profile {
  const sp = speciesIndex(s, speciesId), pool = poolOf(s, sp);
  return pool.length ? P[pool[0]] : buildProfile(s, sp, s.species[sp].genome);
}

/** Can this species be founded on this tile right now? */
export function canFoundAt(s: State, speciesId: string, i: number, P: Profile[] = profiles(s)): boolean {
  return canPlant(s, P, founderProfile(s, speciesId, P), i);
}

function canPlant(s: State, P: Profile[], p: Profile, i: number): boolean {
  const slot = slotFor(s, p.sp, i), occ = s.occ[slot];
  return !(occ >= 0 && s.variants[occ].sp === p.sp) && fit(s, p, i) > 0 && canTake(s, P, p, slot);
}

/** Why a plant with this profile can't go here, or null. */
function plantCheck(s: State, P: Profile[], p: Profile, i: number): string | null {
  const name = s.species[p.sp].name, occ = s.occ[slotFor(s, p.sp, i)];
  if (fit(s, p, i) <= 0) return `${name} can't live here.`;
  if (occ >= 0 && s.variants[occ].sp === p.sp) return `${name} is already here.`;
  if (!canTake(s, P, p, slotFor(s, p.sp, i))) return `${s.species[s.variants[occ].sp].name} hold this tile too well.`;
  return null;
}

/** Plants a patch (radius `founding.patch`) of variant `v` around tile i, wherever it can take the slot. */
function plant(s: State, P: Profile[], v: number, i: number) {
  const p = P[v], x0 = i % s.w, y0 = (i / s.w) | 0, r = NUM.founding.patch;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = x0 + dx, y = y0 + dy, j = y * s.w + x;
    if (Math.abs(dx) + Math.abs(dy) > r || x < 0 || y < 0 || x >= s.w || y >= s.h || !canPlant(s, P, p, j)) continue;
    const sl = slotFor(s, p.sp, j);
    if (s.occ[sl] >= 0) kill(s, sl, EV.taken);
    settle(s, sl, v, NUM.founding.cover, EV.founded, fit(s, p, j));
    s.variants[v].tiles++; s.count[p.sp]++;
  }
  const sp = s.species[p.sp];
  if (sp.at < 0) sp.at = s.tick;
  s.foundings[sp.id]++;
}

export function found(s: State, speciesId: string, i: number): Result {
  const sp = speciesIndex(s, speciesId), P = profiles(s);
  if (!unlockedSpecies(s).includes(speciesId)) return fail('Evolve it first.');
  const cost = foundingCost(s, speciesId);
  if (s.biomass < cost) return fail(`Needs ${cost} biomass.`);
  const why = plantCheck(s, P, founderProfile(s, speciesId, P), i);
  if (why) return fail(why);
  const v = variantFor(s, sp, founder(s, sp), P);
  if (v < 0) return fail('No room for another variant.');
  s.biomass -= cost;
  plant(s, P, v, i);
  return { ok: true };
}

/** Biomass for founding a variant as a new species; it rises with each one. */
export const speciesCost = (s: State) => Math.round(GENES.speciate.base * GENES.speciate.growth ** s.made);

/** A shown variant, Rare or better, can be founded as a new species. */
export function canFoundSpecies(s: State, v: number): Result {
  const x = s.variants[v];
  if (!x?.alive || !x.shown) return fail('That variant is gone.');
  if (x.tier < GENES.foundFrom) return fail('Only Rare or better variants can found a species.');
  if (foundedAs(s, v)) return fail('Already founded as a species.');
  if (s.biomass < speciesCost(s)) return fail(`Needs ${speciesCost(s)} biomass.`);
  return { ok: true };
}

/** The suggested name: the variant's name ("Dry Shade Moss"), numbered if a species already has it. */
export function suggestName(s: State, v: number): string {
  const base = variantName(s, v), taken = (n: string) => s.species.some((o) => o.name.toLowerCase() === n.toLowerCase());
  for (const suffix of ['', ' II', ' III', ' IV', ' V']) if (!taken(base + suffix)) return base + suffix;
  return `${base} ${s.species.length}`;
}

/** Founds variant `v` as a new species on tile i: its genome becomes the new species' base, with its own colour. */
export function foundSpecies(s: State, v: number, i: number, name: string): Result {
  const can = canFoundSpecies(s, v);
  if (!can.ok) return can;
  const x = s.variants[v], parent = s.species[x.sp], P = profiles(s);
  const nm = name.trim().slice(0, 32) || suggestName(s, v);
  if (s.species.some((o) => o.name.toLowerCase() === nm.toLowerCase())) return fail('That name is taken.');
  const sp = s.species.length, def = defOf(s, x.sp), p = buildProfile(s, x.sp, x.genome), occ = s.occ[slotFor(s, x.sp, i)];
  if (fit(s, p, i) <= 0) return fail(`${nm} can't live here.`);
  if (!canTake(s, P, p, slotFor(s, x.sp, i))) return fail(`${s.species[s.variants[occ].sp].name} hold this tile too well.`);
  s.biomass -= speciesCost(s);
  s.made++;
  const kin = s.species.filter((o) => o.base === parent.base).length;
  s.species.push({
    id: `${def.id}-${kin + 1}`, name: nm, base: parent.base, genome: { axes: [...x.genome.axes], traits: [...x.genome.traits] },
    hue: parent.hue + GENES.hueShift * (kin % 2 ? 1 : -1) * Math.ceil(kin / 2), parent: x.sp, at: -1,
  });
  s.count.push(0); s.prevCount.push(0);
  s.foundings[s.species[sp].id] = 0;
  x.seen = true;
  const nv = variantFor(s, sp, x.genome, P);
  s.variants[nv].shown = s.variants[nv].seen = true;
  plant(s, P, nv, i);
  return { ok: true, msg: `${nm} is a new species. It keeps its genes, and its own variants start from here.` };
}

/** What placing mode `placing` plants: a species id (founding as now) or `v:<variant>` (a new species from it). */
export type Placement = { p: Profile; name: string; cost: number; ok: (i: number) => boolean };

export function placement(s: State, placing: string, P: Profile[] = profiles(s)): Placement | null {
  if (placing.startsWith('v:')) {
    const v = Number(placing.slice(2)), x = s.variants[v];
    if (!x?.alive) return null;
    const p = buildProfile(s, x.sp, x.genome);
    return { p, name: variantName(s, v), cost: speciesCost(s), ok: (i) => fit(s, p, i) > 0 && canTake(s, P, p, slotFor(s, x.sp, i)) };
  }
  const sp = speciesIndex(s, placing);
  if (sp < 0) return null;
  const p = founderProfile(s, placing, P);
  return { p, name: s.species[sp].name, cost: foundingCost(s, placing), ok: (i) => canPlant(s, P, p, i) };
}

/** The species this variant was already founded as, if any. */
export function foundedAs(s: State, v: number): string | null {
  const x = s.variants[v];
  return s.species.find((o) => o.parent === x.sp && genomeKey(o.genome) === x.key)?.name ?? null;
}

/** You looked at a variant: its glint stops. */
export function markSeen(s: State, v: number) {
  if (s.variants[v]?.alive) s.variants[v].seen = true;
}

export type ReqStatus = { text: string; have: number; need: number; met: boolean };

export function reqStatus(s: State, req: Req): ReqStatus {
  let have = 0;
  if (req.kind === 'layer') {
    const v = s.layers[req.layer];
    for (let i = 0; i < v.length; i++) if (v[i] >= req.min) have++;
    return { text: `Tiles with ${FIELDS[req.layer].name.toLowerCase()} ${req.min}+`, have, need: req.tiles, met: have >= req.tiles };
  }
  const name = s.species[speciesIndex(s, req.species)].name;
  if (req.kind === 'gene') {
    const gene = SPECIES.find((d) => d.id === req.species)!.traits.find((t) => t.id === req.gene)!.name;
    have = s.innovations[req.gene] !== undefined ? 1 : 0;
    return { text: `${gene} appears in ${name}`, have, need: 1, met: have >= 1 };
  }
  have = coverCount(s, req.species);
  return { text: `${name} tiles`, have, need: req.tiles, met: have >= req.tiles };
}

/** Requirements latch: once a node's are all met, they stay met, so a storm can't take a gate away. */
export function checkReady(s: State) {
  for (const n of TREE) {
    if (s.ready.includes(n.id) || s.reached.includes(n.id)) continue;
    if (n.reqs.every((r) => reqStatus(s, r).met)) s.ready.push(n.id);
  }
}

export function canEvolve(s: State, nodeId: string): Result {
  const node = TREE.find((n) => n.id === nodeId);
  if (!node) return fail('No such node.');
  if (s.reached.includes(nodeId)) return fail('Already reached.');
  if (node.parent && !s.reached.includes(node.parent)) return fail('Reach its parent first.');
  if (!s.ready.includes(nodeId) && !node.reqs.every((r) => reqStatus(s, r).met)) return fail('Requirements not met.');
  if (s.biomass < node.cost) return fail(`Needs ${node.cost} biomass.`);
  return { ok: true };
}

export function evolve(s: State, nodeId: string): Result {
  const can = canEvolve(s, nodeId);
  if (!can.ok) return can;
  const node = TREE.find((n) => n.id === nodeId)!;
  s.biomass -= node.cost;
  s.reached.push(nodeId);
  return { ok: true, msg: node.fact };
}

/** Dev: reach every node. */
export function unlockAll(s: State) {
  for (const n of TREE) if (!s.reached.includes(n.id)) s.reached.push(n.id);
}
