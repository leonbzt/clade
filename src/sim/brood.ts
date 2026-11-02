// The brood: each season on a run, three cards (four from level 2) from the line's leading variant, in words with a
// tier. Steady is one axis step that raises fit where the line lives and never lowers it; Cross takes one gene from
// another shown variant of the line; Wild is two of today's mutation rolls. The heir you pick goes on a tile within
// reach of the line and founds a patch there, free.
import { axesOf, KEYS } from '../data/genes';
import { FIELDS, LAYER_IDS, STATUSES, STATUS_IDS, type LayerId } from '../data/fields';
import { RUN } from '../data/islands';
import { NUM } from '../data/numbers';
import { plant } from './commands';
import { buildProfile, feltValue, fit, limitOf, type Profile } from './fit';
import { broodSize, type Card } from './lineage';
import { type State } from './state';
import { axisWords, comboOf, copyGenome, defOf, genomeKey, mutation, newKey, poolOf, rarity, roomToShow, show, stratumOf, traitOf, variantFor, type Genome } from './variants';

/** The line's species that leads now: its newest one that still holds tiles. */
export function leadSp(s: State): number {
  const line = s.run!.line;
  for (let k = line.length - 1; k >= 0; k--) if (s.count[line[k]] > 0) return line[k];
  return line[line.length - 1];
}

/** The line's leading variant (most tiles), or -1. */
export const leadVariant = (s: State) => poolOf(s, leadSp(s))[0] ?? -1;

/** Tiles the line holds (ground stratum of its leading species), and those plus a ring around them. */
function lineTiles(s: State, sp: number): { held: number[]; near: number[] } {
  const n = s.w * s.h, k = stratumOf(s, sp), held: number[] = [], mark = new Uint8Array(n), r = RUN.ring;
  for (let i = 0; i < n; i++) if (s.occ[k * n + i] >= 0 && s.run!.line.includes(s.variants[s.occ[k * n + i]].sp)) held.push(i);
  for (const i of held) {
    const x0 = i % s.w, y0 = (i / s.w) | 0;
    for (let y = Math.max(0, y0 - r); y <= Math.min(s.h - 1, y0 + r); y++) for (let x = Math.max(0, x0 - r); x <= Math.min(s.w - 1, x0 + r); x++) mark[y * s.w + x] = 1;
  }
  return { held, near: [...mark.keys()].filter((i) => mark[i]) };
}

const sumFit = (s: State, p: Profile, tiles: number[]) => tiles.reduce((a, i) => a + fit(s, p, i), 0);

/** A variant-style name for a genome that may not exist yet: "Dry Thallus", "Crust Moss", "Plain Thallus". */
export function genomeName(s: State, sp: number, g: Genome): string {
  const def = defOf(s, sp), base = s.species[sp].genome, combo = comboOf(g);
  if (combo && !comboOf(base)) return `${combo.id[0].toUpperCase()}${combo.id.slice(1)} ${def.short}`;
  const key = newKey(g, base), words = axisWords(g, base, axesOf(def));
  if (key) return `${[key.word, ...words].slice(0, 3).join(' ')} ${def.short}`;
  const gene = g.traits.find((t) => !base.traits.includes(t));
  if (words.length < 2 && gene) words.push(traitOf(s, sp, gene)!.name.split(' ')[0]);
  return `${words.length ? words.join(' ') : genomeKey(g) === genomeKey(base) ? 'Wild' : 'Plain'} ${def.short}`;
}

const NEED_WORDS: Partial<Record<LayerId, [string, string]>> = {
  water: ['lives drier', 'lives wetter'], shade: ['wants more light', 'takes more shade'],
  soil: ['makes do with thinner soil', 'wants deeper soil'], nitrogen: ['needs less nitrogen', 'needs more nitrogen'],
};
const STAT_WORDS: [string, string, string][] = [['grow', 'grows', 'faster|slower'], ['seeds', 'spreads', 'more|less'], ['hold', 'holds on', 'better|worse'], ['life', 'lives', 'longer|shorter']];

/** What a card changes, in words: the needs that move, the stats that change by 2% or more. */
function words(a: Profile, b: Profile): string[] {
  const out: string[] = [];
  for (const nb of b.needs) {
    const na = a.needs.find((x) => x.layer === nb.layer), id = LAYER_IDS[nb.layer];
    if (!na) continue;
    const d = (nb.band[1] + nb.band[2] - na.band[1] - na.band[2]) / 2, w = NEED_WORDS[id];
    if (Math.abs(d) > 0.004) out.push(w ? w[d > 0 ? 1 : 0] : `${d > 0 ? 'more' : 'less'} ${FIELDS[id].name.toLowerCase()}`);
  }
  for (const tb of b.tolerance) {
    const ta = a.tolerance.find((x) => x.status === tb.status);
    if (ta && Math.abs(tb.tol - ta.tol) > 0.01) out.push(`${tb.tol > ta.tol ? 'takes' : 'minds'} ${STATUSES[STATUS_IDS[tb.status]].name.toLowerCase()} ${tb.tol > ta.tol ? 'better' : 'more'}`);
  }
  for (const [k, verb, dirs] of STAT_WORDS) {
    const r = b.stats[k as 'grow'] / (a.stats[k as 'grow'] || 1);
    if (Math.abs(r - 1) >= 0.02) out.push(`${verb} ${Math.round(Math.abs(r - 1) * 100)}% ${dirs.split('|')[r > 1 ? 0 : 1]}`);
  }
  return out.slice(0, 3);
}

/** A season's brood from the line's leading variant. Empty when the line has no variant left. */
export function makeBrood(s: State): Card[] {
  const sp = leadSp(s), v0 = poolOf(s, sp)[0];
  if (v0 === undefined) return [];
  const g0 = s.variants[v0].genome, p0 = buildProfile(s, sp, g0), { held, near } = lineTiles(s, sp);
  const f0 = sumFit(s, p0, held), keys = new Set([genomeKey(g0)]), names = new Set<string>(), out: Card[] = [];
  const card = (kind: Card['kind'], g: Genome): Card => {
    const p = buildProfile(s, sp, g), d = held.length ? (sumFit(s, p, held) - f0) / held.length : 0;
    const w = words(p0, p);
    if (Math.abs(d) >= 0.005) w.push(`fit ${d > 0 ? '+' : '−'}${Math.round(Math.abs(d) * 100)}% where the line lives`);
    keys.add(genomeKey(g)); names.add(genomeName(s, sp, g));
    return { kind, genome: g, name: genomeName(s, sp, g), tier: rarity(s, sp, g), words: w.length ? w : ['little change'] };
  };
  // Steady: each one-step move, scored on the line and its ring; the line's own fit must not fall.
  const axes = axesOf(defOf(s, sp)), steps: { g: Genome; on: number; all: number }[] = [];
  axes.forEach((_, a) => {
    for (const dir of [-1, 1]) {
      const g = copyGenome(g0);
      g.axes[a] += dir;
      if (Math.abs(g.axes[a]) > 4) continue;
      const p = buildProfile(s, sp, g);
      steps.push({ g, on: sumFit(s, p, held) - f0, all: sumFit(s, p, near) });
    }
  });
  const steady = steps.filter((x) => x.on >= -1e-6).sort((a, b) => b.all - a.all);
  const pickSteady = () => (steady.find((x) => !keys.has(genomeKey(x.g))) ?? [...steps].sort((a, b) => b.on - a.on).find((x) => !keys.has(genomeKey(x.g))))?.g;
  const st = pickSteady();
  if (st) out.push(card('steady', st));
  // Cross: one gene from another shown variant of the line, the one that helps most.
  let cross: { g: Genome; all: number } | null = null;
  for (const u of poolOf(s, sp)) {
    const x = s.variants[u];
    if (u === v0 || !x.shown) continue;
    const trials: Genome[] = [];
    x.genome.axes.forEach((val, a) => { if (val !== g0.axes[a]) { const g = copyGenome(g0); g.axes[a] = val; trials.push(g); } });
    for (const t of x.genome.traits) if (!g0.traits.includes(t) && !KEYS.some((k) => k.id === t)) trials.push({ axes: [...g0.axes], traits: [...g0.traits, t].sort() });
    for (const g of trials) {
      if (keys.has(genomeKey(g))) continue;
      const all = sumFit(s, buildProfile(s, sp, g), near);
      if (!cross || all > cross.all) cross = { g, all };
    }
  }
  const cr = cross?.g ?? pickSteady();
  if (cr) out.push(card(cross ? 'cross' : 'steady', cr));
  // Wild: two mutation rolls (a roll that doesn't take is tried again), distinct from the other cards.
  for (let w = 0; w < broodSize(s.run!.level) - 2; w++) {
    for (let t = 0; t < RUN.wildTries; t++) {
      const a = mutation(s, sp, g0), b = a && mutation(s, sp, a);
      if (b && !keys.has(genomeKey(b)) && !names.has(genomeName(s, sp, b)) && !newKey(b, s.species[sp].genome)) { out.push(card('wild', b)); break; }
    }
  }
  return out;
}

/** Per tile: 1 within `RUN.reach` tiles of the line (a square), for the placement view. */
export function reachMask(s: State): Uint8Array {
  const n = s.w * s.h, line = s.run!.line, held = new Uint8Array(n), out = new Uint8Array(n), r = RUN.reach;
  for (let slot = 0; slot < s.occ.length; slot++) { const o = s.occ[slot]; if (o >= 0 && line.includes(s.variants[o].sp)) held[slot % n] = 1; }
  for (let i = 0; i < n; i++) {
    if (!held[i]) continue;
    const x0 = i % s.w, y0 = (i / s.w) | 0;
    for (let y = Math.max(0, y0 - r); y <= Math.min(s.h - 1, y0 + r); y++) out.fill(1, y * s.w + Math.max(0, x0 - r), y * s.w + Math.min(s.w - 1, x0 + r) + 1);
  }
  return out;
}

/** Is tile i within `RUN.reach` tiles of the line? */
export function inReach(s: State, i: number): boolean {
  const n = s.w * s.h, x0 = i % s.w, y0 = (i / s.w) | 0, r = RUN.reach, line = s.run!.line;
  for (let y = Math.max(0, y0 - r); y <= Math.min(s.h - 1, y0 + r); y++) for (let x = Math.max(0, x0 - r); x <= Math.min(s.w - 1, x0 + r); x++) {
    const j = y * s.w + x;
    for (let k = 0; k * n < s.occ.length; k++) { const o = s.occ[k * n + j]; if (o >= 0 && line.includes(s.variants[o].sp)) return true; }
  }
  return false;
}

/** Fit as a word, and what holds it back: "poor: drier than it likes". */
export function fitWord(s: State, p: Profile, i: number): { f: number; word: 'good' | 'okay' | 'poor'; reason: string } {
  const f = fit(s, p, i), lim = limitOf();
  const word = f >= RUN.good ? 'good' : f >= RUN.okay ? 'okay' : 'poor';
  if (f <= 0 && s.terrain[i] === 0) return { f, word, reason: 'the sea' };
  if (lim < 0 || f >= 0.999) return { f, word, reason: 'all it needs' };
  if (lim >= LAYER_IDS.length) return { f, word, reason: `${STATUSES[STATUS_IDS[lim - LAYER_IDS.length]].name.toLowerCase()} hurts it` };
  const id = LAYER_IDS[lim], need = p.needs.find((x) => x.layer === lim)!, v = feltValue(s, lim, p.stratum, i), low = v < need.band[1];
  const w = id === 'water' ? (low ? 'drier' : 'wetter') : id === 'shade' ? (low ? 'more open' : 'shadier') : id === 'soil' ? (low ? 'thinner soil' : 'deeper soil')
    : `${low ? 'less' : 'more'} ${FIELDS[id].name.toLowerCase()}`;
  return { f, word, reason: `${w} than it likes` };
}

/** The profile a card (or the landing founder) would plant. */
export const cardProfile = (s: State, g: Genome) => buildProfile(s, leadSp(s), g);

/** Can the heir (or the founder) go on tile i? null if yes, else why not. */
export function heirCheck(s: State, p: Profile, i: number, landing = false): string | null {
  if (fit(s, p, i) <= 0) return 'It can’t live here.';
  if (!landing && !inReach(s, i)) return `Too far: within ${RUN.reach} tiles of the line.`;
  return null;
}

/** Plants genome g of the leading species as a founding patch on tile i (line tiles in the patch turn into it).
 * Returns the variant, shown, or -1. */
export function plantForm(s: State, P: Profile[], g: Genome, i: number): number {
  const sp = leadSp(s), v = variantFor(s, sp, g, P);
  if (v < 0) return -1;
  const n = s.w * s.h, k = stratumOf(s, sp), x0 = i % s.w, y0 = (i / s.w) | 0, r = NUM.founding.patch;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = x0 + dx, y = y0 + dy, slot = k * n + y * s.w + x;
    if (Math.abs(dx) + Math.abs(dy) > r || x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
    const o = s.occ[slot];
    if (o >= 0 && o !== v && s.variants[o].sp === sp && !s.dying[slot]) { s.occ[slot] = v; s.variants[o].tiles--; s.variants[v].tiles++; }
  }
  plant(s, P, v, i);
  if (!s.variants[v].shown && roomToShow(s, sp, v, true)) show(s, v);
  s.variants[v].seen = true;
  return v;
}

