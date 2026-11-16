// The laws (direction §4): pure functions over rows. Nothing here may name a clade, a species or a mutation
// (tests/model/rules.test.ts). A species that reads wrong is a row to fix; many wrong the same way is a number in
// data/roster/laws.ts; a rule for one species is never added.
import { CLADE } from '../data/roster/clades';
import { FOOD_IDS, FOODS, JOB_NAMES, LADDER, LAWS } from '../data/roster/laws';
import { MUTATION } from '../data/roster/mutations';
import type { AdaptationId, Build, DialId, Fitness, FoodId, HabitatKind, JobId, Letter, Named, Pop, Site, StatId, Stats } from './types';

const H = LAWS.hunt;
export const isFood = (job: JobId): job is FoodId => job in FOODS;
export const jobName = (job: JobId) => (isFood(job) ? FOODS[job].verb : JOB_NAMES[job]);

/** A dial's value: the genome's number plus its push mutations. */
export function dialOf(b: Build, id: DialId): number {
  let v = b.dials[id] ?? 0;
  for (const m of b.mutations) if (MUTATION[m].kind === 'push' && MUTATION[m].dial === id) v += MUTATION[m].by ?? 0;
  return v;
}
export const massOf = (b: Build) => 10 ** dialOf(b, 'size');
const points = (b: Build, stat: StatId) => CLADE[b.clade].base[stat] + (stat === 'senses' ? 0 : dialOf(b, stat));
const STATS: StatId[] = ['bite', 'guard', 'speed', 'senses', 'brood'];

/** The six stats. Defence is the guard's points; a fleeing guard is its speed, so it shows no defence. */
export function stats(b: Build): Stats {
  const guard = CLADE[b.clade].guard;
  return {
    bite: points(b, 'bite'), thrift: massOf(b) ** LAWS.thrift, defence: guard && guard !== 'fleeing' ? points(b, 'guard') : 0,
    speed: points(b, 'speed'), senses: points(b, 'senses'), brood: points(b, 'brood'),
  };
}

/** Law 1: upkeep per gram falls with mass; every stat point and every costly mutation adds to it. */
export function upkeepOf(b: Build): number {
  let u = LAWS.upkeep * massOf(b) ** -LAWS.thrift;
  for (const s of STATS) u += LAWS.cost[s] * points(b, s);
  for (const m of b.mutations) u += MUTATION[m].cost ?? 0;
  return u;
}

export const has = (b: Build, a: AdaptationId) => CLADE[b.clade].adaptations.includes(a) || b.mutations.some((m) => MUTATION[m].grants === a);
/** Law 7: a build lives where it has one adaptation of each group the kind needs. */
export const lives = (b: Build, kind: HabitatKind) => kind.needs.every((group) => group.some((a) => has(b, a)));
function groundFit(b: Build, kind: HabitatKind): number {
  const range = CLADE[b.clade].ground;
  return range.includes(kind.ground) ? 1 : range.includes('water') ? kind.water : LAWS.offGround;
}

/** Law 4: the share of a hunter's take a prey's guard leaves. A counter leaves all of it; fleeing is beaten by speed. */
export function guardLeft(hunter: Build, prey: Build): number {
  const kind = CLADE[prey.clade].guard;
  if (!kind) return 1;
  if (kind === 'fleeing') {
    const gap = points(prey, 'speed') - points(hunter, 'speed');
    return gap < 0 ? 1 : H.guard ** (gap + 1);
  }
  return CLADE[hunter.clade].beats.includes(kind) ? 1 : H.guard ** points(prey, 'guard');
}
/** Law 3: prey inside the size window below the hunter's mass; each bite point doubles the top of it. */
function inWindow(hunter: Build, prey: Build): boolean {
  const top = massOf(hunter) * H.window * 2 ** points(hunter, 'bite'), m = massOf(prey);
  return m <= top && m >= top / H.span;
}
/** Who eats whom: derived, never authored. Producers are eaten as their stocks, not as prey. */
export function eats(a: Build, b: Build, kind: HabitatKind): boolean {
  return CLADE[a.clade].diet.includes('prey') && !CLADE[b.clade].diet.includes('light') && lives(a, kind) && lives(b, kind)
    && inWindow(a, b) && guardLeft(a, b) >= H.eatsFloor;
}

/** Law 5: a food's ceiling in grams per tile, the kind's base plus what the producer here makes. */
export function stockOf(site: Site, food: FoodId): number {
  const p = site.pops.find((q) => q.job === 'light');
  const made = p ? (CLADE[p.build.clade].makes?.[food] ?? 0) * site.kind.light : 0;
  return (site.kind.base[food] ?? 0) + made;
}
const preyPops = (site: Site, job: JobId) => site.pops.filter((p) => p.grams > 0 && (isFood(p.job) || (job === 'hunt2' && p.job === 'hunt')));
/** The share of the prey here above the refuge. */
function openShare(site: Site, prey: Pop[]): number {
  const total = prey.reduce((sum, p) => sum + p.grams, 0);
  return total > 0 ? Math.max(0, 1 - H.refuge[site.kind.ground] * site.area / total) : 0;
}
/** Grams of prey above the refuge: what a hunt job needs `from` of to exist. */
export function spareOf(site: Site): number {
  const prey = preyPops(site, 'hunt');
  return openShare(site, prey) * prey.reduce((sum, p) => sum + p.grams, 0);
}
/** The jobs that exist here now, in board order. */
export function jobsAt(site: Site): JobId[] {
  const out: JobId[] = site.kind.light > 0 ? ['light'] : [];
  for (const f of FOOD_IDS) if (stockOf(site, f) >= LAWS.stockFloor) out.push(f);
  if (spareOf(site) >= H.from) out.push('hunt');
  if (site.pops.some((p) => p.job === 'hunt' && p.grams > 0)) out.push('hunt2');
  return out;
}

const letterOf = (value: number): Letter => LADDER.find(([, floor]) => value >= floor)![0];

/** The one curve. value = intake ÷ (upkeep + losses); a build grows where appetite × value > 1 (letter D or better). */
export function fitness(build: Build, job: JobId, site: Site): Fitness {
  const kind = site.kind, c = CLADE[build.clade], upkeep = upkeepOf(build), mass = massOf(build);
  const fail = (why: string): Fitness => ({ intake: 0, upkeep, survival: 0, value: 0, letter: 'F', grams: 0, heads: 0, by: [], reasons: [why, '', ''] });
  if (!lives(build, kind)) {
    const missing = kind.needs.filter((g) => !g.some((a) => has(build, a))).map((g) => g.join(' or '));
    return fail(`Cannot live here: needs ${missing.join(', and ')}.`);
  }
  const ground = groundFit(build, kind), off = ground < 1 ? `, poor on ${kind.ground}` : '';
  if (job === 'light') {
    if (!c.makes) return fail('Not a producer.');
    if (ground < 1) return fail(`Does not grow on ${kind.ground}.`);
    const made = Object.values(c.makes).reduce((sum, g) => sum + g, 0) * kind.light;
    const intake = made / LAWS.referenceDensity, total = LAWS.upkeep + kind.deaths, value = intake / total, survival = LAWS.upkeep / total;
    return { intake, upkeep: LAWS.upkeep, survival, value, letter: letterOf(value), grams: made * site.area * survival, heads: 0, by: [],
      reasons: [`Light ${Math.round(kind.light * 100)}%${off}.`, 'A producer pays no upkeep for stats.', `Loses ${Math.round(kind.deaths * 100)}% a generation here.`] };
  }
  let intake = 0, grams = 0, why = '';
  if (isFood(job)) {
    if (!c.diet.includes(job)) return fail(`Does not eat ${FOODS[job].name.toLowerCase()}.`);
    const food = FOODS[job], stock = stockOf(site, job), s = stats(build);
    const biteFit = Math.min(1, (s.bite + 1) / (food.tough + 1));
    const gutFit = food.gut ? Math.min(1, Math.max(LAWS.gutFloor, (mass / food.gut) ** 0.25)) : 1;
    const reach = ground * biteFit * gutFit;
    intake = reach * stock / LAWS.referenceDensity;
    grams = LAWS.standing * stock * site.area * Math.min(1, reach);
    why = `${food.verb}: ${Math.round(stock)} g a tile${off}${biteFit < 1 ? ', bite too weak' : ''}${gutFit < 1 ? ', gut too small' : ''}.`;
  } else {
    if (!c.diet.includes('prey')) return fail('Not a hunter.');
    const all = preyPops(site, job), open = openShare(site, all), prey = all.filter((p) => eats(build, p.build, kind));
    if (job === 'hunt2' && !prey.some((p) => p.job === 'hunt')) return fail('Does not eat the hunter here.');
    const reachable = prey.reduce((sum, p) => sum + p.grams * open * guardLeft(build, p.build), 0);
    const x = reachable / site.area / H.referenceDensity;
    intake = ground * H.reach * x / (1 + x / H.saturation);
    grams = H.transfer * reachable * ground;
    why = `Eats ${prey.length} of ${all.length} here, ${Math.round(reachable)} g in reach${off}.`;
  }
  // Losses: the kind's own deaths and each hunter here that eats this build, weighed by how slowly it breeds.
  const above: JobId[] = job === 'hunt2' ? [] : job === 'hunt' ? ['hunt2'] : ['hunt', 'hunt2'];
  const by = site.pops.filter((p) => p.grams > 0 && above.includes(p.job) && eats(p.build, build, kind)).map((p) => p.build)
    .sort((a, b) => guardLeft(b, build) - guardLeft(a, build));
  const hunted = by.reduce((sum, h) => sum + H.pressure * guardLeft(h, build), 0);
  const losses = (kind.deaths + hunted) * mass ** LAWS.slow / (1 + LAWS.brood * points(build, 'brood'));
  const survival = upkeep / (upkeep + losses), value = intake / (upkeep + losses);
  grams *= survival;
  return { intake, upkeep, survival, value, letter: letterOf(value), grams, heads: grams / mass, by, reasons: [
    why,
    `Upkeep ${upkeep.toFixed(2)} a gram: ${mass >= 1000 ? 'a big, thrifty body' : mass < 1 ? 'a small, costly body' : 'a middling body'}.`,
    by.length ? `Hunted here by ${by.length}; keeps ${Math.round(survival * 100)}%.` : `Nothing hunts it here; keeps ${Math.round(survival * 100)}%.`,
  ] };
}

export interface Candidate { named: Named; fit: Fitness }
const ABLE = new WeakMap<Named[], WeakMap<HabitatKind, Map<JobId, Named[]>>>();
/** The pool's species that could ever do this job in this kind (the diet and law 7), kept per pool and kind: rows
 *  do not change while the game runs. It only spares `candidates` the species that would read 0 (16 Nov: 2.4× a step). */
function able(job: JobId, kind: HabitatKind, pool: Named[]): Named[] {
  let kinds = ABLE.get(pool);
  if (!kinds) ABLE.set(pool, kinds = new WeakMap());
  let jobs = kinds.get(kind);
  if (!jobs) kinds.set(kind, jobs = new Map());
  let out = jobs.get(job);
  if (!out) {
    const diet = job === 'light' ? 'light' : isFood(job) ? job : 'prey';
    jobs.set(job, out = pool.filter((n) => CLADE[n.build.clade].diet.includes(diet) && lives(n.build, kind)));
  }
  return out;
}
/** The pool's species that could do this job here, best first. One species holds one job in a site. */
export function candidates(job: JobId, site: Site, pool: Named[]): Candidate[] {
  const here = new Set(site.pops.filter((p) => p.job !== job).map((p) => p.build));
  return able(job, site.kind, pool).filter((n) => !here.has(n.build)).map((named) => ({ named, fit: fitness(named.build, job, site) }))
    .filter((c) => c.fit.value > 0).sort((a, b) => b.fit.value - a.fit.value || (a.named.id < b.named.id ? -1 : 1));
}

/** A kind filled from the pool until nothing changes: the producer, then each food job, then the hunts. The best
 *  candidate that grows takes each job; food jobs are picked again once the hunters are in. The reference web. */
export function climax(kind: HabitatKind, area: number, pool: Named[]): Site {
  const site: Site = { kind, area, pops: [] };
  const fill = (job: JobId) => {
    site.pops = site.pops.filter((p) => p.job !== job);
    const best = candidates(job, site, pool)[0];
    if (best && best.fit.letter !== 'F') site.pops.push({ build: best.named.build, job, grams: best.fit.grams });
  };
  if (kind.light > 0) fill('light');
  for (let pass = 0; pass < 2; pass++) {
    for (const f of FOOD_IDS) if (jobsAt(site).includes(f)) fill(f);
    for (const j of ['hunt', 'hunt2'] as const) if (jobsAt(site).includes(j)) fill(j); else site.pops = site.pops.filter((p) => p.job !== j);
  }
  return site;
}
