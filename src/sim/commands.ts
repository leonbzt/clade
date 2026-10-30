// Everything the player can do. The UI only changes the game through these.
import { ANIMAL } from '../data/animals';
import { STRATA } from '../data/fields';
import { axesOf, GENES, KEYS, type Key } from '../data/genes';
import { NUM } from '../data/numbers';
import { SPECIES, SPECIES_INDEX } from '../data/species';
import { TREE, doorKey } from '../data/tree';
import { spawn } from './agents';
import { adopt } from './arrivals';
import { EV, type State } from './state';
import { buildProfile, fit, profiles, type Profile } from './fit';
import { doorNode } from './keys';
import { canTake, ceilingOf, fullOf, kill, setMass, settle } from './life';
import { othersMet, reqStatus } from './reqs';
import { axisWords, defOf, newKey, poolOf, speciesIndex, variantFor, variantName, type Genome } from './variants';

export { checkReady, reqStatus, type ReqStatus } from './reqs';

export type Result = { ok: true; msg?: string } | { ok: false; reason: string };
const fail = (reason: string): Result => ({ ok: false, reason });

/** Species ids you can found: those whose tree node you reached (a door's template only through a split), and the
 * ones you made. */
export function unlockedSpecies(s: State): string[] {
  const reached = new Set(TREE.filter((n) => n.species && !doorKey(n) && s.reached.includes(n.id)).map((n) => n.species!));
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
    settle(s, sl, v, NUM.founding.cover * ceilingOf(s, v, fit(s, p, j)), EV.founded, fit(s, p, j));
    s.variants[v].tiles++; s.count[p.sp]++;
  }
  const sp = s.species[p.sp];
  if (sp.at < 0) sp.at = s.tick;
  s.foundings[sp.id]++;
}

export function found(s: State, speciesId: string, i: number): Result {
  const sp = speciesIndex(s, speciesId), P = profiles(s);
  if (!unlockedSpecies(s).includes(speciesId)) return fail('Evolve it first.');
  if (defOf(s, sp).animal) return fail('Animals arrive by themselves, or split off from a variant.');
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
/** A new species' biomass, rising with each species already made in the same clade (on the same template). */
export const speciesCost = (s: State, base: number) =>
  Math.round(GENES.speciate.base * GENES.speciate.growth ** s.species.slice(SPECIES.length).filter((o) => o.base === base).length);

/** The door a variant would open by splitting off: the key it carries, while that node isn't reached yet. */
export function doorOf(s: State, v: number): Key | null {
  const x = s.variants[v], key = x ? newKey(x.genome, s.species[x.sp].genome) : undefined;
  return key && !s.reached.includes(key.node) ? key : null;
}

/** What a split would make: the base species (a door's template, or the parent's) and the new base genome. A clade
 * change keeps the axis genes and drops the old clade's traits and the key. */
function splitInto(s: State, v: number): { base: number; genome: Genome; key: Key | null } {
  const x = s.variants[v], key = doorOf(s, v);
  if (!key) return { base: s.species[x.sp].base, genome: { axes: [...x.genome.axes], traits: [...x.genome.traits] }, key };
  return { base: SPECIES_INDEX[doorNode(key).species!], genome: { axes: [...x.genome.axes], traits: [] }, key };
}

/** A split's biomass: the door node's cost, or the rising cost of a new species. */
export const splitCost = (s: State, v: number) => { const k = doorOf(s, v); return k ? doorNode(k).cost : speciesCost(s, s.species[s.variants[v].sp].base); };

/** A shown variant, Rare or better, can split off as a new species; one with a key opens its door. */
export function canFoundSpecies(s: State, v: number): Result {
  const x = s.variants[v], key = doorOf(s, v);
  if (!x?.alive || !x.shown) return fail('That variant is gone.');
  if (x.tier < GENES.foundFrom) return fail('Only Rare or better variants can found a species.');
  if (key) {
    const n = doorNode(key);
    if (n.parent && !s.reached.includes(n.parent)) return fail('Reach its parent first.');
    const left = n.reqs.find((r) => r.kind !== 'key' && !reqStatus(s, r).met);
    if (left && !othersMet(s, n)) return fail(`${n.name} needs: ${reqStatus(s, left).text}.`);
  }
  if (s.biomass < splitCost(s, v)) return fail(`Needs ${splitCost(s, v)} biomass.`);
  return { ok: true };
}

/** The suggested name: the variant's name ("Dry Shade Moss"); for a door, its axis words on the new clade ("Dry
 * Wind Moss"). Numbered if a species already has it. */
export function suggestName(s: State, v: number): string {
  const into = splitInto(s, v), short = SPECIES[into.base].short;
  const base = into.key ? `${axisWords(into.genome, { axes: [0, 0, 0, 0], traits: [] }, axesOf(SPECIES[into.base])).join(' ') || 'First'} ${short}` : variantName(s, v);
  const taken = (n: string) => s.species.some((o) => o.name.toLowerCase() === n.toLowerCase());
  for (const suffix of ['', ' II', ' III', ' IV', ' V']) if (!taken(base + suffix)) return base + suffix;
  return `${base} ${s.species.length}`;
}

/** Variant `v` splits off as a new species: all its tiles become the new species (moving up a stratum if the new
 * clade lives in another), its genome the new base, and a founder patch goes on tile i. A key opens its door. */
export function foundSpecies(s: State, v: number, i: number, name: string): Result {
  const can = canFoundSpecies(s, v);
  if (!can.ok) return can;
  const x = s.variants[v], parent = s.species[x.sp], into = splitInto(s, v), P = profiles(s);
  const nm = name.trim().slice(0, 32) || suggestName(s, v);
  if (s.species.some((o) => o.name.toLowerCase() === nm.toLowerCase())) return fail('That name is taken.');
  const tmp = buildProfile(s, into.base, into.genome), at = slotFor(s, into.base, i), occ = s.occ[at], animal = !!SPECIES[into.base].animal;
  if (fit(s, tmp, i) <= 0) return fail(`${nm} can't live here.`);
  if (!animal && occ >= 0 && s.variants[occ].sp !== x.sp && !canTake(s, P, tmp, at)) return fail(`${s.species[s.variants[occ].sp].name} hold this tile too well.`);
  s.biomass -= splitCost(s, v);
  if (into.key) s.reached.push(into.key.node);
  else s.made++;
  const sp = s.species.length, def = SPECIES[into.base], kin = s.species.filter((o) => o.base === into.base).length;
  const hue = into.key ? 0 : parent.hue + GENES.hueShift * (kin % 2 ? 1 : -1) * Math.ceil(kin / 2);
  s.species.push({ id: `${def.id}-${kin + 1}`, name: nm, base: into.base, genome: into.genome, hue, parent: x.sp, at: -1, form: variantName(s, v) });
  s.count.push(0); s.members.push(0); s.prevCount.push(0);
  s.foundings[s.species[sp].id] = 0;
  const nv = variantFor(s, sp, into.genome, P);
  s.variants[nv].shown = s.variants[nv].seen = true;
  if (animal) {
    for (const a of s.agents) if (a.v === v) { a.sp = sp; a.v = nv; }
    spawn(s, nv, i, Math.max(ANIMAL.founders, Math.ceil(def.animal!.group / 2)), `founded ${nm} here`);
    s.foundings[s.species[sp].id] = 1; s.species[sp].at = s.tick;
    const what = into.key ? `the first of the ${doorNode(into.key).name.toLowerCase()}` : 'a new species';
    return { ok: true, msg: `${nm} is ${what}. The variant's animals are now ${nm}, and a founder group starts here.` };
  }
  moveTiles(s, P, v, nv);
  plant(s, P, nv, i);
  const what = into.key ? `the first of the ${doorNode(into.key).name.toLowerCase()}` : 'a new species';
  return { ok: true, msg: `${nm} is ${what}. It took the variant's ${s.variants[nv].tiles} tiles and keeps its genes; its own variants start from here.` };
}

/** Every tile of variant `from` becomes variant `to`. In the same stratum it keeps its cover; otherwise the old plant
 * goes and the new one settles above it where it can live and the slot is free. */
function moveTiles(s: State, P: Profile[], from: number, to: number) {
  const n = s.w * s.h, k = STRATA.indexOf(defOf(s, s.variants[to].sp).stratum);
  for (let slot = 0; slot < s.occ.length; slot++) {
    if (s.occ[slot] !== from) continue;
    const i = slot % n, up = k * n + i;
    const cover = s.cover[slot];
    if (up === slot) { // same cover, in the new species' grams
      const m = s.mass[slot];
      s.occ[slot] = to; setMass(s, slot, cover * fullOf(s, to)); s.ledger.prod += s.mass[slot] - m; s.variants[to].tiles++;
      continue;
    }
    kill(s, slot, EV.taken);
    if (s.occ[up] < 0 && fit(s, P[to], i) > 0) { settle(s, up, to, cover * fullOf(s, to), EV.founded, fit(s, P[to], i)); s.variants[to].tiles++; }
  }
}

/** What placing mode `placing` plants: a species id (founding as now) or `v:<variant>` (a new species from it). */
export type Placement = { p: Profile; name: string; cost: number; ok: (i: number) => boolean };

export function placement(s: State, placing: string, P: Profile[] = profiles(s)): Placement | null {
  if (placing.startsWith('v:')) {
    const v = Number(placing.slice(2)), x = s.variants[v];
    if (!x?.alive) return null;
    const into = splitInto(s, v), p = buildProfile(s, into.base, into.genome);
    if (SPECIES[into.base].animal) return { p, name: variantName(s, v), cost: splitCost(s, v), ok: (i) => fit(s, p, i) > 0 };
    const ok = (i: number) => { const sl = slotFor(s, into.base, i), o = s.occ[sl]; return fit(s, p, i) > 0 && (o < 0 || s.variants[o].sp === x.sp || canTake(s, P, p, sl)); };
    return { p, name: variantName(s, v), cost: splitCost(s, v), ok };
  }
  const sp = speciesIndex(s, placing);
  if (sp < 0) return null;
  const p = founderProfile(s, placing, P);
  return { p, name: s.species[sp].name, cost: foundingCost(s, placing), ok: (i) => canPlant(s, P, p, i) };
}

/** You looked at a variant: its glint stops. */
export function markSeen(s: State, v: number) {
  if (s.variants[v]?.alive) s.variants[v].seen = true;
}

export function canEvolve(s: State, nodeId: string): Result {
  const node = TREE.find((n) => n.id === nodeId);
  if (!node) return fail('No such node.');
  if (s.reached.includes(nodeId)) return fail('Already reached.');
  if (node.parent && !s.reached.includes(node.parent)) return fail('Reach its parent first.');
  if (node.arrive && s.visitors[nodeId] === undefined) return fail('It hasn\u2019t arrived yet.');
  if (doorKey(node)) return fail(`Split off a variant that carries the ${KEYS.find((k) => k.id === doorKey(node))!.name.toLowerCase()}.`);
  if (!s.ready.includes(nodeId) && !node.reqs.every((r) => reqStatus(s, r).met)) return fail('Requirements not met.');
  if (s.biomass < node.cost) return fail(`Needs ${node.cost} biomass.`);
  return { ok: true };
}

export function evolve(s: State, nodeId: string): Result {
  const can = canEvolve(s, nodeId);
  if (!can.ok) return can;
  const node = TREE.find((n) => n.id === nodeId)!;
  if (node.arrive) { const why = adopt(s, node); if (why) return fail(why); }
  s.biomass -= node.cost;
  s.reached.push(nodeId);
  return { ok: true, msg: node.fact };
}

/** Dev: reach every node. */
export function unlockAll(s: State) {
  for (const n of TREE) if (!s.reached.includes(n.id)) s.reached.push(n.id);
}
