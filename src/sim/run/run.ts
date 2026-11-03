// A run: a sprout grown in side view on a garden patch, pulse by pulse, season by season. Herb and moss pick an
// heir from a brood of 3 each season; the tree keeps one body (winter: cuts only). The final body is released.
// A state machine the UI drives: pick → grow (animated) → pick … → brood / winter → … → end. No DOM.
import { FORMS, type FormId, type Genes } from '../../data/genes';
import { NICHES } from '../../data/niches';
import { NEIGHBOUR_LOOK, PLOT, PULSE, SPOTS, T, type Neighbour } from '../../data/run';
import { BARE, FOREST, WET } from '../../data/island';
import { seeded, type Rng } from '../rng';
import { nicheScore, scaled } from '../species';
import { measure, newPlant, tick, type Plant } from './plant';
import { makePlot, plotTick, rain, type Plot } from './plot';
import { applyOffer, makeOffers, type Offer } from './pulse';
import { brood, cut, spring, winter, type Seed } from './verbs';

export type Phase = 'pick' | 'grow' | 'winter' | 'brood' | 'end';
export interface SeasonRow { season: number; raw: number[]; score: number; genes: Genes; changed: number[] }
export interface Run {
  form: FormId; niche: number; plot: Plot; plant: Plant; rng: Rng;
  season: number; pulse: number; t: number; ticksLeft: number; phase: Phase;
  offers: Offer[]; picked: number; seeds: Seed[] | null; history: SeasonRow[]; changed: number[];
}

/** What the garden patch puts beside you: its holders per layer, sized by their cover. */
export interface Beside { layer: number; name: string; cover: number }

export function neighboursFor(kind: number, beside: Beside[], rng: Rng): Neighbour[] {
  const xs = [110, 500, 850, 330, 680].sort(() => rng() - 0.5);
  return beside.filter((b) => b.cover > 0.05).slice(0, 3).map((b, k) => {
    const L = NEIGHBOUR_LOOK[b.layer], c = 0.5 + 0.5 * Math.min(1, b.cover);
    const kindLook = b.layer === 1 ? (kind === WET ? 'sedge' : kind === FOREST ? 'fern' : kind === BARE ? 'grass' : 'shrub') : L.kind;
    return { ...L, kind: kindLook, name: b.name, x: xs[k], h: L.h * c, w: L.w * c, density: L.density * c, roots: L.roots * c, depth: L.depth * c };
  });
}

export const pulseTicks = (form: FormId) => FORMS[form].seasonTicks / PULSE.perSeason;
export const runScore = (r: Run, raw: number[]) => nicheScore(scaled(r.form, raw), NICHES[r.niche]);

/** The open spot nearest the middle: where a line starts. */
function startSpot(plot: Plot): number {
  const open = [2, 1, 3, 0, 4].filter((s) => !plot.neighbours.some((nb) => Math.abs(SPOTS[s] - nb.x) < nb.w / 2));
  return open.length ? open[0] : 2;
}

export function newRun(form: FormId, genes: Genes, kind: number, niche: number, moisture: number, beside: Beside[], seed: number): Run {
  const rng = seeded(seed), plot = makePlot(kind, PLOT[kind], moisture, neighboursFor(kind, beside, rng), seed);
  const plant = newPlant([...genes], startSpot(plot), plot, rng, form);
  const r: Run = { form, niche, plot, plant, rng, season: 1, pulse: 0, t: 0, ticksLeft: 0, phase: 'pick', offers: [], picked: -1, seeds: null, history: [], changed: [] };
  startPulse(r);
  return r;
}

function startPulse(r: Run) {
  if (r.form === 'moss') {
    const i = [2, 3, 4, 5].indexOf(r.plot.kind);
    r.plot.dry = r.pulse > 0 && r.rng() < T.moss.dryChance[Math.max(0, i)];
  }
  r.offers = makeOffers(r.plant, r.plot, pulseTicks(r.form), (r.season * 100 + r.pulse) * 7919 + r.plot.seed);
  r.picked = -1;
  r.phase = 'pick';
}

/** Pick an offer (or -1: let the genes decide). Returns false if it can't be paid. */
export function pick(r: Run, i: number): boolean {
  if (r.phase !== 'pick') return false;
  if (i >= 0) {
    const o = r.offers[i];
    if (!o.ok || !applyOffer(r.plant, r.plot, o)) return false;
  } else r.plant.focus = -1;
  r.picked = i;
  r.ticksLeft = pulseTicks(r.form);
  r.phase = 'grow';
  return true;
}

/** The best offer by its previewed score (auto). */
export function autoPick(r: Run): number {
  let best = -1, bs = -1;
  r.offers.forEach((o, i) => { if (o.ok && o.after) { const s = runScore(r, o.after); if (s > bs) { bs = s; best = i; } } });
  return best;
}

/** Advance up to n ticks of the current pulse. */
export function advance(r: Run, n: number) {
  const st = FORMS[r.form].seasonTicks;
  for (let k = 0; k < n && r.phase === 'grow'; k++) {
    plotTick(r.plot, ++r.t, st);
    tick(r.plant, r.plot, r.t);
    if (--r.ticksLeft <= 0) afterPulse(r);
  }
}

function afterPulse(r: Run) {
  r.plant.focus = -1;
  r.pulse++;
  if (r.pulse >= PULSE.perSeason) endSeason(r); else startPulse(r);
}

function endSeason(r: Run) {
  const b = measure(r.plant, r.plot);
  r.history.push({ season: r.season, raw: b.raw, score: runScore(r, b.raw), genes: [...r.plant.genes], changed: r.changed });
  r.changed = [];
  r.plot.dry = false;
  if (r.season >= FORMS[r.form].seasons) { r.phase = 'end'; return; }
  rain(r.plot);
  if (r.form === 'tree') { winter(r.plant); r.phase = 'winter'; return; }
  r.seeds = brood(r.plant, r.plot, r.rng, 3);
  r.phase = 'brood';
}

/** Herb and moss: the heir grows the next season. */
export function chooseSeed(r: Run, i: number) {
  const s = r.seeds![i];
  r.plant = newPlant(s.genes, s.spot, r.plot, r.rng, r.form);
  r.changed = s.changed;
  nextSeason(r);
}

/** Tree: spring after winter. */
export function springRun(r: Run) {
  spring(r.plant);
  nextSeason(r);
}

function nextSeason(r: Run) {
  r.season++; r.plant.season = r.season; r.t = 0; r.pulse = 0; r.seeds = null;
  startPulse(r);
}

/** Cutting is free between pulses (and in winter). */
export function cutAt(r: Run, node: number): boolean {
  if (r.phase !== 'pick' && r.phase !== 'winter') return false;
  cut(r.plant, node);
  if (r.phase === 'pick') r.offers = makeOffers(r.plant, r.plot, pulseTicks(r.form), (r.season * 100 + r.pulse) * 7919 + r.plot.seed + node);
  return true;
}

/** The final body: the last season's stats and the genes. */
export const finalBody = (r: Run) => ({ raw: r.history[r.history.length - 1].raw, genes: r.plant.genes });
