// A run: the line on a young island of its own, alone (no locals, no arrivals). Seasons are its clock: each sets the
// island's moisture (wet, mild, dry, mild) and brings a brood. XP comes from heirs that settle, new shown variants,
// keys and the best fit. It ends by the clock, by bringing the line home after a few seasons, or when the line dies.
import { GENES, KEYS } from '../data/genes';
import { RUN, SEASONS } from '../data/islands';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { TREE } from '../data/tree';
import { cardProfile, heirCheck, makeBrood, plantForm } from './brood';
import { moveTiles, plant, splitInto, suggestName } from './commands';
import { buildProfile, fit, type Profile } from './fit';
import { doorNode, keyCarrier } from './keys';
import { levelOf, runCost, type Founder, type Offer, type RunEnd } from './lineage';
import { headline } from './news';
import { othersMet } from './reqs';
import { createState, type State } from './state';
import { copyGenome, genomeKey, poolOf, variantFor, variantName } from './variants';

const PER = RUN.season * NUM.ticksPerSec; // ticks per season
const EASE = 0.3 / (RUN.ease * NUM.ticksPerSec); // the swing's change per tick: the biggest one settles in `ease` s

/** A run island for this offer, with the line on it as its own species (the founder's genome its base). Home pays
 * the price (unless `free`); its reached nodes and met requirements carry over, so a door checks home's needs. */
export function startRun(home: State, offer: Offer, founder: Founder, free = false): State {
  if (!free) home.biomass -= runCost(home);
  const s = createState(offer.seed, { size: offer.size, theme: offer.theme });
  const name = home.lineage?.name ?? 'The line';
  s.species.push({ id: 'line', name, base: founder.base, genome: copyGenome(founder.genome), hue: 0, parent: -1, at: -1, form: founder.name });
  s.count.push(0); s.members.push(0); s.prevCount.push(0);
  s.foundings.line = 0;
  s.reached = [...home.reached];
  s.ready = [...home.ready, ...TREE.filter((n) => !home.ready.includes(n.id) && n.reqs.some((r) => r.kind === 'key') && othersMet(home, n)).map((n) => n.id)];
  s.run = { offer, founder, level: home.lineage ? levelOf(home.lineage.xp).level : 1, landed: false, t0: 0, season: 0, line: [s.species.length - 1],
    brood: [], heirs: [], counted: [], keys: [], xp: 0, best: 0, end: null, news: [] };
  return s;
}

const say = (s: State, text: string) => { s.run!.news.push(text); headline(s, text); };

/** The founder lands on tile i: its patch goes down, the landing season (wet) starts and brings the first brood. */
export function land(s: State, P: Profile[], i: number): boolean {
  const R = s.run!;
  if (R.landed || fit(s, buildFounder(s), i) <= 0) return false;
  const v = plantForm(s, P, R.founder.genome, i);
  if (v < 0) return false;
  R.counted.push(`${s.variants[v].sp}|${genomeKey(s.variants[v].genome)}`);
  R.landed = true; R.t0 = s.tick; R.season = 0;
  s.wet = SEASONS[0].wet;
  R.brood = makeBrood(s);
  R.news.push(`Landed: ${R.founder.name}.`);
  return true;
}

/** The founder's profile, for landing. */
export const buildFounder = (s: State) => buildProfile(s, s.run!.line[0], s.run!.founder.genome);

/** Pick card k and put the heir on tile i. */
export function placeHeir(s: State, P: Profile[], k: number, i: number): number {
  const R = s.run!, c = R.brood[k];
  if (!c || R.end || heirCheck(s, cardProfile(s, c.genome), i)) return -1;
  const v = plantForm(s, P, c.genome, i);
  if (v < 0) return -1;
  R.heirs.push({ v, season: R.season, name: c.name, paid: false });
  R.counted.push(`${s.variants[v].sp}|${genomeKey(s.variants[v].genome)}`);
  R.brood = [];
  R.news.push(`Season ${R.season + 1}: the heir ${c.name} (${c.kind}).`);
  return v;
}

export const lineCount = (s: State) => s.run!.line.reduce((a, sp) => a + s.count[sp], 0);
export const seasonOf = (s: State) => SEASONS[s.run!.season % SEASONS.length];
/** Seconds into the season, 0..RUN.season. */
export const seasonTime = (s: State) => (s.run!.landed ? ((s.tick - s.run!.t0) % PER) / NUM.ticksPerSec : 0);
export const canBringHome = (s: State) => !!s.run && s.run.landed && !s.run.end && s.run.season >= RUN.homeAfter;

export function bringHome(s: State): boolean {
  if (!canBringHome(s)) return false;
  end(s, 'home');
  return true;
}

function end(s: State, how: RunEnd) {
  const R = s.run!;
  R.end = how;
  for (const h of R.heirs) payHeir(s, h, true);
  R.news.push(how === 'died' ? 'The line died out.' : how === 'home' ? 'You brought the line home.' : 'The run is over: the clock ran out.');
}

/** An heir settled if its variant still holds tiles a season after it was placed (at the end: holds any). */
function payHeir(s: State, h: { v: number; season: number; paid: boolean; name: string }, last = false) {
  if (h.paid || (!last && s.run!.season < h.season + 1)) return;
  const x = s.variants[h.v];
  h.paid = true;
  if (x.alive && x.tiles > 0 && s.run!.line.includes(x.sp)) { s.run!.xp += RUN.xp.heir; s.run!.news.push(`${h.name} settled (+${RUN.xp.heir} XP).`); }
}

/** A key fired in the line: the carrier splits off on the spot as the line's new species (no cost, no choice). Start
 * fresh: a founder patch on the carrier's best tile for it, and the carrier stays with its parent; else its tiles move. */
function splitKeys(s: State, P: Profile[]) {
  const R = s.run!;
  for (const key of KEYS) {
    const c = keyCarrier(s, key);
    if (c < 0 || !R.line.includes(s.variants[c].sp)) continue;
    const x = s.variants[c], into = splitInto(s, c), nm = suggestName(s, c), def = SPECIES[into.base];
    if (into.door) s.reached.push(into.key!.node);
    const kin = s.species.filter((o) => o.base === into.base).length, sp = s.species.length;
    s.species.push({ id: `${def.id}-${kin + 1}`, name: nm, base: into.base, genome: into.genome, hue: 0, parent: x.sp, at: s.tick, form: variantName(s, c) });
    s.count.push(0); s.members.push(0); s.prevCount.push(0);
    s.foundings[s.species[sp].id] = 1;
    const nv = variantFor(s, sp, into.genome, P);
    if (nv < 0) continue;
    s.variants[nv].shown = s.variants[nv].seen = true;
    if (GENES.fresh) { x.split = true; plant(s, P, nv, bestTile(s, P, c, nv), x.sp); } else moveTiles(s, P, c, nv);
    R.line.push(sp); R.keys.push(key.id); R.xp += RUN.xp.key;
    R.counted.push(`${sp}|${genomeKey(into.genome)}`);
    say(s, `${key.name} in the line: ${GENES.fresh ? `${nm} starts where it arose` : `it is now ${nm}`}, of the ${doorNode(key).name.toLowerCase()} (+${RUN.xp.key} XP).`);
  }
}

/** Of variant c's tiles, the one where variant nv fits best. */
function bestTile(s: State, P: Profile[], c: number, nv: number): number {
  const n = s.w * s.h;
  let best = -1, at = 0;
  for (let slot = 0; slot < s.occ.length; slot++) if (s.occ[slot] === c && fit(s, P[nv], slot % n) > best) { best = fit(s, P[nv], slot % n); at = slot % n; }
  return at;
}

/** The share of the island's land the line holds at good fit. */
function goodShare(s: State, P: Profile[]): number {
  const n = s.w * s.h, R = s.run!;
  let land = 0, good = 0;
  for (let i = 0; i < n; i++) if (s.terrain[i] !== 0) land++;
  for (let slot = 0; slot < s.occ.length; slot++) {
    const v = s.occ[slot];
    if (v >= 0 && R.line.includes(s.variants[v].sp) && fit(s, P[v], slot % n) >= RUN.good) good++;
  }
  return land ? good / land : 0;
}

/** Each tick of a landed run: the season clock and its swing, broods, heirs, XP, keys and the endings. */
export function runTick(s: State, P: Profile[]) {
  const R = s.run!;
  if (!R.landed || R.end) return;
  const season = Math.floor((s.tick - R.t0) / PER);
  if (season > R.season) {
    R.season = season;
    for (const h of R.heirs) payHeir(s, h);
    if (season >= RUN.seasons) { end(s, 'clock'); return; }
    R.brood = makeBrood(s);
  }
  const target = SEASONS[R.season % SEASONS.length].wet;
  s.wet += Math.max(-EASE, Math.min(EASE, target - s.wet));
  if (s.tick % NUM.fieldsEvery === 0) splitKeys(s, P);
  if (s.tick % 100 === 0) {
    for (const sp of R.line) for (const v of poolOf(s, sp)) {
      const x = s.variants[v], id = `${sp}|${genomeKey(x.genome)}`;
      if (x.shown && !R.counted.includes(id)) { R.counted.push(id); R.xp += RUN.xp.shown; }
    }
    const share = goodShare(s, P);
    if (share > R.best) { R.xp += (share - R.best) * RUN.xp.fit; R.best = share; }
  }
  if (lineCount(s) === 0) end(s, 'died');
}

