// Your lineage (home only): a plant line you take on runs to young islands. Its form is the genome a run starts
// from; runs earn XP and levels. This file holds the lineage's types and the parts that read home: the founders you
// can take, the two offers, the price, the level curve, and what a finished run leaves on the card.
import { RUN, RUN_THEMES, SIZES, THEMES, type SizeId, type ThemeId } from '../data/islands';
import { NUM } from '../data/numbers';
import { axesOf } from '../data/genes';
import { SPECIES, SPECIES_INDEX } from '../data/species';
import { TREE } from '../data/tree';
import type { State } from './state';
import { copyGenome, genomeKey, poolOf, variantName, type Genome } from './variants';

/** A plant form: a base species from the data and a genome on it. */
export type Form = { base: number; genome: Genome; name: string; species: string };
export type Offer = { theme: ThemeId; size: SizeId; seed: number };
export type Founder = Form & { from: string }; // `from`: where it comes from ("the lineage", "a find at home")
export type Card = { kind: 'steady' | 'cross' | 'wild'; genome: Genome; name: string; tier: number; words: string[] };
export type Heir = { v: number; season: number; name: string; paid: boolean };
export type RunEnd = 'clock' | 'home' | 'died';
export type RunLine = { theme: ThemeId; size: SizeId; seasons: number; end: RunEnd; form: string; xp: number };
export type Lineage = {
  name: string;
  form: Form; // what a run starts from: the leading variant of the last run's line
  xp: number; // all XP so far; the level follows from it (levelOf)
  runs: RunLine[];
  finds: string[]; // the last run's shown variants of the line, for coming home (12b)
};
export type Run = {
  offer: Offer;
  founder: Founder;
  level: number; // the lineage's level at the start: its perks
  landed: boolean;
  t0: number; // the tick the line landed
  season: number; // seasons since landing (0 = the landing season)
  line: number[]; // the line's species, newest last: a key on the run makes a new one
  brood: Card[]; // this season's cards (empty once one is picked)
  heirs: Heir[];
  counted: string[]; // shown variants already paid ("sp|genome")
  keys: string[]; // keys fired on the run
  xp: number;
  best: number; // the best share of the island's land the line held at good fit
  end: RunEnd | null;
  news: string[]; // what happened, newest last, for the card and the end screen
};

const ROOT = 'thallus'; // the first lineage: early land plants, the pioneer at the vent

export function newLineage(): Lineage {
  const base = SPECIES_INDEX[ROOT];
  return { name: 'The pioneers', form: { base, genome: copyGenome({ axes: [0, 0, 0, 0], traits: [] }), name: `Wild ${SPECIES[base].short}`, species: SPECIES[base].name }, xp: 0, runs: [], finds: [] };
}

/** The lineage's name, once home has a vent: "the North Vent line". */
export const lineageName = (s: State) => {
  const vent = s.landmarks.find((m) => m.kind === 'vent');
  return vent ? `${vent.name} line` : 'The pioneers';
};

/** Level from XP: level L to L + 1 takes `first × growth^(L − 1)`. */
export function levelOf(xp: number): { level: number; into: number; need: number } {
  let level = 1, need = RUN.level.first;
  while (xp >= need) { xp -= need; level++; need = RUN.level.first * RUN.level.growth ** (level - 1); }
  return { level, into: xp, need };
}

/** Brood cards per season: three, a fourth (a second Wild) from level 2. */
export const broodSize = (level: number) => (level >= 2 ? 4 : 3);

export const runCost = (home: State) => Math.round(RUN.cost * NUM.cost * RUN.costGrowth ** (home.lineage?.runs.length ?? 0));

/** Can a run start? It needs the line's clade reached at home and the price. */
export function canRun(home: State): { ok: true } | { ok: false; reason: string } {
  if (!home.lineage) return { ok: false, reason: 'Runs start from home.' };
  const node = TREE.find((n) => n.species === ROOT)!;
  if (!home.reached.includes(node.id)) return { ok: false, reason: `Evolve ${node.name} first.` };
  if (home.biomass < runCost(home)) return { ok: false, reason: 'Not enough biomass yet.' };
  return { ok: true };
}

/** Home species of the line: the root's species and every species made from it (through `parent`). */
export function lineSpecies(s: State): number[] {
  const out = s.species.flatMap((x, sp) => (x.id === ROOT ? [sp] : []));
  for (let k = 0; k < out.length; k++) s.species.forEach((x, sp) => { if (x.parent === out[k] && !out.includes(sp) && !SPECIES[x.base].animal) out.push(sp); });
  return out;
}

/** Who can found the run: the lineage's form, each living species of the line at home (its leading variant) and its
 * other shown variants (finds). One entry per genome. */
export function founders(home: State): Founder[] {
  const L = home.lineage!, out: Founder[] = [{ ...L.form, genome: copyGenome(L.form.genome), from: 'the lineage' }];
  const seen = new Set([`${L.form.base}|${genomeKey(L.form.genome)}`]);
  for (const sp of lineSpecies(home)) {
    if (!home.count[sp]) continue;
    poolOf(home, sp).forEach((v, k) => {
      const x = home.variants[v], id = `${home.species[sp].base}|${genomeKey(x.genome)}`;
      if (!x.shown || seen.has(id)) return;
      seen.add(id);
      out.push({ base: home.species[sp].base, genome: copyGenome(x.genome), name: variantName(home, v), species: home.species[sp].name,
        from: k === 0 ? `${home.species[sp].name} at home` : 'a find at home' });
    });
  }
  return out;
}

const mix = (a: number, b: number) => { let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ b; h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35); return (h ^ (h >>> 16)) >>> 0; };

/** Two offers, one per theme; seeds and sizes follow from home's seed and the runs made, so they hold still. */
export function offers(home: State): Offer[] {
  const n = home.lineage?.runs.length ?? 0;
  return RUN_THEMES.map((theme, k) => {
    const seed = mix(mix(home.seed, n + 1), k + 1);
    return { theme, size: seed % 2 ? 'medium' : 'small', seed };
  });
}

export const offerText = (o: Offer) => `${THEMES[o.theme].name}, ${SIZES[o.size].name}: ${THEMES[o.theme].hint}`;

/** The run is over: the leading variant of the line (of its newest species) becomes the lineage's form (unless the line died), its shown
 * variants are listed, the XP goes to the lineage and the run gets its line on the card. */
export function finish(home: State, run: State): RunLine {
  const R = run.run!, L = home.lineage!;
  // The newest species of the line that still lives leads (a key on the run made it); its biggest variant.
  const sp = [...R.line].reverse().find((k) => run.count[k] > 0), lead = sp === undefined ? -1 : poolOf(run, sp)[0] ?? -1;
  if (lead >= 0 && R.end !== 'died') {
    const x = run.variants[lead];
    L.form = { base: run.species[x.sp].base, genome: copyGenome(x.genome), name: variantName(run, lead), species: run.species[x.sp].name };
    L.finds = run.variants.flatMap((y, v) => (y.alive && y.shown && y.sp === x.sp && v !== lead ? [variantName(run, v)] : []));
  }
  const line: RunLine = { theme: run.theme, size: R.offer.size, seasons: Math.min(R.season, RUN.seasons), end: R.end ?? 'home', form: L.form.name, xp: Math.round(R.xp) };
  L.xp += line.xp;
  L.runs.push(line);
  return line;
}

/** "Land plants": the tree node of the form's base. */
export const classOf = (f: Form) => TREE.find((n) => n.species === SPECIES[f.base].id)?.name ?? SPECIES[f.base].name;

/** The form in gene words: "dry +1, lean −1, Rhizoids", or "its base genes". */
export function formWords(f: Form): string {
  const def = SPECIES[f.base], parts = axesOf(def).flatMap((a, k) => (f.genome.axes[k] ? [`${a.id} ${f.genome.axes[k] > 0 ? '+' : '−'}${Math.abs(f.genome.axes[k])}`] : []));
  for (const t of f.genome.traits) parts.push(def.traits.find((x) => x.id === t)?.name ?? t);
  return parts.join(', ') || 'its base genes';
}
