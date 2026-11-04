// A run: a stand of saplings grown live for a few years on one garden patch. Each year 3 saplings grow side by side
// among the patch's natives, steered by your verbs (verbs.ts); in winter you pick the founder of next year's 3. After
// the last year you pick the one to release. The plot (the soil, what you revealed, drained pockets) carries over.
// A state machine the UI drives: grow (live) → winter → grow … → end. No DOM.
import { FORMS, type FormId, type Genes } from '../../data/genes';
import { NICHES } from '../../data/niches';
import { LIGHT, NEIGHBOUR_LOOK, PLOT, SPOTS, STAND, T, type Neighbour } from '../../data/run';
import { BARE, FOREST, WET } from '../../data/island';
import { seeded, type Rng } from '../rng';
import { fullScore, scaled } from '../species';
import { measure, newPlant, reserveOf, tick, type Plant } from './plant';
import { makePlot, plotTick, rain, type Plot } from './plot';
import { buildLight } from './light';
import { levelUps } from './verbs';

export type Phase = 'grow' | 'winter' | 'end';
/** A sapling and what its seed changed from the founder. */
export interface Sapling { plant: Plant; changed: number[]; sport: boolean }
/** A sapling at the year's end. */
export interface Result { raw: number[]; score: number; grams: number }
export interface YearRow { year: number; results: Result[]; founder: number }
export interface Run {
  form: FormId; niche: number; plot: Plot; rng: Rng;
  year: number; t: number; phase: Phase;
  stand: Sapling[]; sel: number; // the selected sapling
  last: Result[] | null; // the year's end (winter and the end)
  history: YearRow[];
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

export const yearTicks = (form: FormId) => FORMS[form].yearTicks;
/** Ticks per second at 1×: a year takes STAND.yearSeconds. */
export const tickRate = (form: FormId) => FORMS[form].yearTicks / STAND.yearSeconds;
export const runScore = (r: Run, raw: number[], genes: Genes) => fullScore(scaled(r.form, raw), genes, NICHES[r.niche]);
export const selected = (r: Run) => r.stand[r.sel].plant;

/** The open spot nearest the middle: where a line starts. */
function startSpot(plot: Plot): number {
  const open = [2, 1, 3, 0, 4].filter((s) => !plot.neighbours.some((nb) => Math.abs(SPOTS[s] - nb.x) < nb.w / 2));
  return open.length ? open[0] : 2;
}
/** A spot and its two neighbours (sowing by default: the founder's spot and beside it). */
const around = (s: number) => { const a = Math.max(0, Math.min(SPOTS.length - STAND.saplings, s - 1)); return [a, a + 1, a + 2]; };

export function newRun(form: FormId, genes: Genes, kind: number, niche: number, moisture: number, beside: Beside[], seed: number): Run {
  const rng = seeded(seed), plot = makePlot(kind, PLOT[kind], moisture, neighboursFor(kind, beside, rng), seed);
  const spot = startSpot(plot), spots = around(spot);
  const stand = spots.map((s) => ({ plant: newPlant([...genes], s, plot, rng, form), changed: [], sport: false }));
  const r: Run = { form, niche, plot, rng, year: 1, t: 0, phase: 'grow', stand, sel: spots.indexOf(spot), last: null, history: [] };
  refresh(r);
  return r;
}

/** The light grid from the natives and the whole stand. */
function refresh(r: Run) {
  buildLight(r.plot.light, r.plot.neighbours, r.plot.grow, r.stand.map((s) => s.plant));
}

/** A tenth of the year: Health's reserve refills; a moss plot may fall into a dry spell. */
function tenth(r: Run) {
  for (const s of r.stand) s.plant.reserve = reserveOf(s.plant.genes);
  if (r.form === 'moss') r.plot.dry = r.t > 0 && r.rng() < T.moss.dryChance[Math.max(0, [2, 3, 4, 5].indexOf(r.plot.kind))];
}

/** Advance up to n ticks of the year. */
export function advance(r: Run, n: number) {
  const yt = yearTicks(r.form), every = Math.round(yt / STAND.tenths);
  for (let k = 0; k < n && r.phase === 'grow'; k++) {
    if (r.t % every === 0) tenth(r);
    plotTick(r.plot, ++r.t, yt);
    if (r.t % LIGHT.every === 0) refresh(r);
    for (const s of r.stand) tick(s.plant, r.plot, r.t);
    if (r.t >= yt) endYear(r);
  }
}

function endYear(r: Run) {
  r.plot.dry = false;
  r.last = r.stand.map((s) => {
    const b = measure(s.plant, r.plot);
    return { raw: b.raw, score: runScore(r, b.raw, s.plant.genes), grams: b.biomass };
  });
  r.sel = r.last.reduce((b, x, i, a) => (x.score > a[b].score ? i : b), 0);
  r.history.push({ year: r.year, results: r.last, founder: -1 });
  r.phase = r.year >= FORMS[r.form].years ? 'end' : 'winter';
}

/** Winter: sapling i founds next year's stand, sown on its spot and beside it (each seed the founder + one level). */
export function found(r: Run, i: number) {
  if (r.phase !== 'winter') return;
  const f = r.stand[i].plant, ups = levelUps(f.genes, r.rng, STAND.saplings), spots = around(f.spot);
  while (ups.length < STAND.saplings) ups.push({ genes: [...f.genes], changed: [], sport: false }); // all maxed
  r.history[r.history.length - 1].founder = i;
  rain(r.plot);
  r.stand = ups.map((u, k) => ({ plant: newPlant(u.genes, spots[k], r.plot, r.rng, r.form), changed: u.changed, sport: u.sport }));
  for (const s of r.stand) s.plant.season = r.year + 1;
  r.sel = spots.indexOf(f.spot);
  r.year++; r.t = 0; r.last = null; r.phase = 'grow';
  refresh(r);
}

/** The final body: the selected sapling's last-year stats and its genes. */
export const finalBody = (r: Run) => ({ raw: r.last![r.sel].raw, genes: r.stand[r.sel].plant.genes });
