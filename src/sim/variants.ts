// Species and their variants in play. A slot holds a variant; the variant belongs to a species; the species to a
// base species in the data. Variants mutate when a plant settles a new tile, win or lose by fit like species do,
// and die out when they hold no tiles. Rarity is the distance to the species' base genome. Animals use the same
// variants: an animal's variant is its genome, and a variant's "tiles" count its animals (a swarm counts once).
import { STRATA } from '../data/fields';
import { AXES, axesOf, COMBOS, GENES, KEYS, TIER, TIERS, type Axis, type Combo } from '../data/genes';
import { SPECIES, type SpeciesDef, type Trait } from '../data/species';
import { rand } from './rng';
import { idx, type State } from './state';
import { type Profile, profile } from './fit';

export type Genome = { axes: number[]; traits: string[] }; // axes in AXES order, traits sorted
export type Species = {
  id: string;
  name: string;
  base: number; // index into SPECIES: stratum, needs, stats, makes and trait genes come from there
  genome: Genome; // its base genome: rarity is measured from here
  hue: number; // colour shift in turns, for species you made
  parent: number; // the species it was founded from, or -1
  at: number; // tick of its first founding, or -1
  form: string; // the variant it grew from ("Dry Moss"), for the tree; empty for base species
};
export type Variant = {
  sp: number;
  genome: Genome;
  key: string;
  alive: boolean;
  tiles: number;
  shown: boolean; // held `GENES.showAt` tiles once (Legendary ones show at once)
  seen: boolean; // you looked at it (tile card or panel): its glint stops
  tier: number; // index into TIERS
  combo: string | null;
  born: number;
};

export const ZERO: Genome = { axes: [0, 0, 0, 0], traits: [] };
export const copyGenome = (g: Genome): Genome => ({ axes: [...g.axes], traits: [...g.traits] });
export const genomeKey = (g: Genome) => `${g.axes.join(',')}|${g.traits.join(',')}`;
const copy = copyGenome;

export const defOf = (s: State, sp: number): SpeciesDef => SPECIES[s.species[sp].base];
export const spOf = (s: State, v: number) => s.variants[v].sp;
export const speciesIndex = (s: State, id: string) => s.species.findIndex((x) => x.id === id);

/** A trait gene by id: one of the species' own, or a key gene (KEYS). */
export const traitOf = (s: State, sp: number, id: string): Trait | undefined =>
  defOf(s, sp).traits.find((t) => t.id === id) ?? KEYS.find((k) => k.id === id);

/** The key gene this genome carries that its species' base doesn't, if any. */
export const newKey = (g: Genome, base: Genome) => KEYS.find((k) => g.traits.includes(k.id) && !base.traits.includes(k.id));

export function baseSpecies(): Species[] {
  return SPECIES.map((d, i) => ({ id: d.id, name: d.name, base: i, genome: copy(ZERO), hue: 0, parent: -1, at: -1, form: '' }));
}

/** The first combo the genome carries (each of its steps reached, on the right side). */
export function comboOf(g: Genome): Combo | null {
  return COMBOS.find((c) => Object.entries(c.needs).every(([a, need]) => {
    const v = g.axes[AXES.findIndex((x) => x.id === a)];
    return need! > 0 ? v >= need! : v <= need!;
  })) ?? null;
}

export function distance(g: Genome, base: Genome): number {
  let d = 0;
  for (let a = 0; a < AXES.length; a++) d += Math.abs(g.axes[a] - base.axes[a]);
  for (const t of g.traits) if (!base.traits.includes(t)) d += GENES.traitWeight;
  for (const t of base.traits) if (!g.traits.includes(t)) d += GENES.traitWeight;
  return d;
}

/** Common (1), Uncommon (2), Rare (3–4 or a combo), Epic (5+, or a combo plus a trait gene), Legendary (a key gene);
 * one tier up if a gene sits beyond ±`reach.free` from the clade's original genes. */
export function rarity(s: State, sp: number, g: Genome): number {
  const base = s.species[sp].genome;
  if (newKey(g, base)) return TIER.legendary;
  const plant = !defOf(s, sp).animal, d = distance(g, base), combo = plant && comboOf(g) && !comboOf(base), gene = g.traits.some((t) => !base.traits.includes(t));
  const t = d >= 5 || (combo && gene) ? TIER.epic : d >= 3 || combo ? TIER.rare : Math.min(d, TIER.uncommon);
  return d && g.axes.some((a) => Math.abs(a) > GENES.reach.free) ? Math.min(TIER.epic, t + 1) : t;
}

export const glints = (x: Variant) => x.alive && x.shown && !x.seen && x.tier >= TIER.rare;

/** The variants of one species, alive, biggest first. */
export function poolOf(s: State, sp: number): number[] {
  const out: number[] = [];
  s.variants.forEach((x, v) => { if (x.alive && x.sp === sp) out.push(v); });
  return out.sort((a, b) => s.variants[b].tiles - s.variants[a].tiles || a - b);
}

/** The variant with this genome, made if needed. New mutants are hidden; when a species has `GENES.hidden` of
 * them, the smallest (oldest first) is swamped by the species' largest variant (its tiles join it). */
export function variantFor(s: State, sp: number, g: Genome, P?: Profile[]): number {
  const key = genomeKey(g), found = s.vkey[`${sp}|${key}`];
  if (found !== undefined) return found;
  const pool = poolOf(s, sp), hidden = pool.filter((v) => !s.variants[v].shown);
  if (hidden.length >= GENES.hidden && !swampSmallest(s, pool, hidden)) return -1;
  let v = s.variants.findIndex((x) => !x.alive);
  if (v < 0) v = s.variants.length;
  const tier = rarity(s, sp, g);
  s.variants[v] = { sp, genome: copy(g), key, alive: true, tiles: 0, shown: false, seen: false, tier,
    combo: defOf(s, sp).animal ? null : comboOf(g)?.id ?? null, born: s.tick };
  s.vkey[`${sp}|${key}`] = v;
  if (P) P[v] = profile(s, v);
  return v;
}

/** The smallest of `from` (oldest first; never a glinting one, a door candidate, a key carrier or the largest) joins
 * the largest of `pool`. */
function swampSmallest(s: State, pool: number[], from: number[]): boolean {
  const V = s.variants, small = from.filter((v) => v !== pool[0] && !glints(V[v]) && !s.cands.includes(v) && V[v].tier !== TIER.legendary)
    .sort((a, b) => V[a].tiles - V[b].tiles || V[a].born - V[b].born)[0];
  if (small === undefined) return false;
  for (let slot = 0; slot < s.occ.length; slot++) if (s.occ[slot] === small) s.occ[slot] = pool[0];
  for (const a of s.agents) if (a.v === small) a.v = pool[0];
  V[pool[0]].tiles += V[small].tiles;
  free(s, small);
  return true;
}

function free(s: State, v: number) {
  const x = s.variants[v];
  x.alive = false; x.tiles = 0;
  delete s.vkey[`${x.sp}|${x.key}`];
}

/** One random step on one axis, or (more rarely) one trait gene flips. Key genes never flip by chance. A step out
 * past `reach.free` from the species' base, or from the clade's original genes, often fails to take (null). */
export function mutation(s: State, sp: number, g: Genome): Genome | null {
  const out = copy(g), def = defOf(s, sp), genes = def.traits, axes = axesOf(def);
  if (genes.length && rand(s) < GENES.traitShare) {
    const t = genes[Math.floor(rand(s) * genes.length)].id, at = out.traits.indexOf(t);
    if (at >= 0) out.traits.splice(at, 1); else out.traits = [...out.traits, t].sort();
    return out;
  }
  const a = Math.floor(rand(s) * axes.length), dir = rand(s) < 0.5 ? -1 : 1, m = GENES.maxStep;
  const was = out.axes[a], now = Math.abs(was + dir) > m ? was - dir : was + dir, R = GENES.reach;
  const home = s.species[sp].genome.axes[a], over = (x: number) => Math.max(0, x - R.free);
  if (Math.abs(now - home) > Math.abs(was - home) && rand(s) >= R.out ** over(Math.abs(now - home))) return null;
  if (Math.abs(now) > Math.abs(was) && rand(s) >= R.extreme ** over(Math.abs(now))) return null;
  out.axes[a] = now;
  return out;
}

/** A child that just settled this slot may be a mutant, if its parent is a shown variant: each step has to take
 * hold (and be shown) before the next one can build on it. */
export function maybeMutate(s: State, P: Profile[], slot: number) {
  const v = s.occ[slot];
  if (!s.variants[v].shown || rand(s) >= GENES.mutate) return;
  const sp = s.variants[v].sp, g = mutation(s, sp, s.variants[v].genome), m = g ? variantFor(s, sp, g, P) : -1;
  if (m >= 0) { s.occ[slot] = m; s.variants[m].tiles++; }
}

/** Spore rain: one of the species' variants, weighted by tiles. */
export function pickVariant(s: State, sp: number): number {
  const pool = poolOf(s, sp), total = pool.reduce((a, v) => a + s.variants[v].tiles, 0);
  let r = rand(s) * total;
  for (const v of pool) if ((r -= s.variants[v].tiles) < 0) return v;
  return pool[0] ?? -1;
}

/** Tiles per variant and species. Variants with no tiles die out; one that reaches `showAt` tiles is shown. */
export function recount(s: State) {
  for (const x of s.variants) x.tiles = 0;
  s.count.fill(0);
  s.members.fill(0);
  for (let slot = 0; slot < s.occ.length; slot++) {
    const v = s.occ[slot];
    if (v >= 0) s.variants[v].tiles++;
  }
  // Animals: a variant's groups count as its tiles; it's shown once it has `showAt` members.
  const members = new Map<number, number>();
  for (const a of s.agents) { s.variants[a.v].tiles++; s.members[a.sp] += a.n; members.set(a.v, (members.get(a.v) ?? 0) + a.n); }
  s.variants.forEach((x, v) => {
    if (!x.alive) return;
    if (!x.tiles) { free(s, v); return; }
    s.count[x.sp] += x.tiles;
    if (!x.shown && (members.get(v) ?? x.tiles) >= GENES.showAt && roomToShow(s, x.sp, v)) show(s, v);
  });
}

/** Up to `GENES.cap` shown variants per species: a full one makes room by swamping its smallest shown variant (one
 * with fewer tiles, unless `force`: a key or a nudge always gets shown). */
export function roomToShow(s: State, sp: number, v: number, force = false): boolean {
  const pool = poolOf(s, sp), shown = pool.filter((u) => s.variants[u].shown);
  return shown.length < GENES.cap || swampSmallest(s, pool, shown.filter((u) => force || s.variants[u].tiles < s.variants[v].tiles));
}

export function show(s: State, v: number) {
  const x = s.variants[v];
  x.shown = true;
  if (x.combo && !s.combos.includes(x.combo)) s.combos.push(x.combo);
  if (x.tier === TIER.base) return;
  let at = -1;
  for (let slot = 0; slot < s.occ.length && at < 0; slot++) if (s.occ[slot] === v) at = slot % (s.w * s.h);
  const one = at < 0 ? s.agents.find((a) => a.v === v) : undefined;
  if (one) at = idx(s, one.x | 0, one.y | 0);
  const key = x.tier === TIER.legendary ? newKey(x.genome, s.species[x.sp].genome) : null;
  const genes = key ? key.name : geneText(s, v);
  s.log.push({ tick: s.tick, kind: 'variant', sp: x.sp, tier: x.tier, name: variantName(s, v), genes, place: placeName(s, at) });
}

/** "Dry Shade Moss", "Very Dry Moss" (two steps), "Dry Gemma Liverwort" (a trait gene), or the combo's name:
 * "Crust Moss". The base form is "Wild Moss". */
export function variantName(s: State, v: number): string {
  const x = s.variants[v], def = defOf(s, x.sp), base = s.species[x.sp].genome, axes = axesOf(def);
  if (x.combo) return `${x.combo[0].toUpperCase()}${x.combo.slice(1)} ${def.short}`;
  const key = newKey(x.genome, base);
  if (key) return `${[key.word, ...axisWords(x.genome, base, axes)].slice(0, 3).join(' ')} ${def.short}`;
  const words = axisWords(x.genome, base, axes);
  const gene = x.genome.traits.find((t) => !base.traits.includes(t));
  if (words.length < 2 && gene) words.push(traitOf(s, x.sp, gene)!.name.split(' ')[0]);
  return `${words.length ? words.join(' ') : x.tier === TIER.base ? 'Wild' : 'Plain'} ${def.short}`;
}

/** Up to two words for how a genome differs from a base: "Dry Wind", "Very Dry". */
export function axisWords(g: Genome, base: Genome, axes: Axis[]): string[] {
  return axes.map((a, k) => ({ d: g.axes[k] - base.axes[k], a }))
    .filter((w) => w.d).sort((p, q) => Math.abs(q.d) - Math.abs(p.d)).slice(0, 2)
    .map((w, _, all) => (all.length === 1 && Math.abs(w.d) > 1 ? 'Very ' : '') + (w.d > 0 ? w.a.plus : w.a.minus));
}

/** "dry +1, spread −1, Gemma cups": the differences from the species' base genome. */
export function geneText(s: State, v: number): string {
  const x = s.variants[v], base = s.species[x.sp].genome;
  const parts = axesOf(defOf(s, x.sp)).map((a, k) => ({ a, d: x.genome.axes[k] - base.axes[k] })).filter((p) => p.d)
    .map((p) => `${p.a.id} ${p.d > 0 ? '+' : '−'}${Math.abs(p.d)}`);
  for (const t of x.genome.traits) if (!base.traits.includes(t)) parts.push(traitOf(s, x.sp, t)!.name);
  for (const t of base.traits) if (!x.genome.traits.includes(t)) parts.push(`no ${traitOf(s, x.sp, t)!.name.toLowerCase()}`);
  return parts.join(', ') || 'base form';
}

export const tierName = (t: number) => TIERS[t].name;

/** "at the North Vent", or a compass word when no landmark is near. */
export function placeName(s: State, i: number): string {
  if (i < 0) return 'somewhere';
  const x = i % s.w, y = (i / s.w) | 0;
  let best = '', bd = 12 * 12;
  for (const m of s.landmarks) {
    const d = (m.at % s.w - x) ** 2 + (((m.at / s.w) | 0) - y) ** 2;
    if (d < bd) { bd = d; best = m.name; }
  }
  if (best) return `near ${best}`;
  const ns = y < s.h / 3 ? 'north' : y > (2 * s.h) / 3 ? 'south' : '', ew = x < s.w / 3 ? 'west' : x > (2 * s.w) / 3 ? 'east' : '';
  return `in the ${ns + ew || 'middle'}`;
}

export const stratumOf = (s: State, sp: number) => STRATA.indexOf(defOf(s, sp).stratum);
