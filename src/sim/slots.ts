// The slot board: every window (NUM.slots.window seconds) the counters (tally.ts) become smoothed rates, and each
// place × role becomes a slot with a size, the share taken, a holder, a trend and what feeds it. Places are the
// regions (part C adds habitats). Sizes: leads count the tiles where a plant of the stratum on the island could live;
// grazers the cover the plants could regrow (the curve model in metrics.ts: a quarter of their growth rate); litter
// roles the litter that fell; hunters the young born. Holders change only for a clearly bigger share, and the feed
// tells when a slot on the board opens or changes hands. Read-only: nothing here changes the sim.
import { STRATA } from '../data/fields';
import { NUM } from '../data/numbers';
import { bestName, canHold, GROUPS, LITTER, ROLES, type Role } from '../data/roles';
import { SPECIES } from '../data/species';
import { fit, type Profile } from './fit';
import { SEA, type State } from './state';
import { at, groupOf, type Best, type Slot } from './tally';
import { poolOf } from './variants';

const S = NUM.slots;
/** The sim stays deterministic: the UI and the runner plug in a real clock to time the update. */
export const timer = { now: () => 0 };
const R = ROLES.length;
const LEADS = STRATA.map((_, k) => ROLES.findIndex((r) => r.kind === 'lead' && r.stratum === k));

/** "the Lee lava, south", "Echo Tube mouth". */
export const placeName = (s: State, p: number) => (s.regions[p].kind === 'lava' ? 'the ' : '') + s.regions[p].name;
export const groupName = (g: number) => SPECIES[g].name;
export const slotAt = (s: State, place: number, role: number) => s.board.slots[place * R + role];

/** A holder by share, kept unless a challenger takes `hyst` more; -1 when nobody takes enough (open). */
export function pickHolder(r: Role, takes: number[], size: number, prev: number): [number, number] {
  if (size <= 0) return [-1, 0];
  let best = -1;
  for (let g = 0; g < GROUPS; g++) if (canHold(r, g) && takes[g] > 0 && (best < 0 || takes[g] > takes[best])) best = g;
  if (best < 0) return [-1, 0];
  if (prev >= 0 && prev !== best && takes[prev] / size >= S.keep && takes[best] <= takes[prev] * (1 + S.hyst)) best = prev;
  const share = takes[best] / size;
  return share >= (best === prev ? S.keep : S.open) ? [best, share] : [-1, 0];
}

/** Smooths this window's counters into per-minute rates and clears them. */
function smooth(s: State) {
  const B = s.board, a = B.windows ? S.window / S.smooth : 1, perMin = 60 / S.window;
  for (let k = 0; k < B.cnt.length; k++) { const x = B.cnt[k] * perMin; B.last[k] = x; B.rate[k] += (x - B.rate[k]) * a; }
  for (let k = 0; k < B.drops.length; k++) B.dropRate[k] += (B.drops[k] * perMin - B.dropRate[k]) * a;
  B.cnt.fill(0); B.drops.fill(0);
}

type Census = { cover: Float32Array; could: Float32Array; held: Float32Array; V: number };

/** One pass over the map: cover per group, regrowth capacity, tiles a plant of each stratum could live on, and plants
 * and animals per variant (for the holder's leading species and variant). */
function census(s: State, P: Profile[]): Census {
  const n = s.w * s.h, places = s.regions.length, V = s.variants.length, B = s.board, a = B.windows ? S.window / S.smooth : 1;
  const cover = new Float32Array(places * GROUPS), cap = new Float32Array(places * GROUPS);
  const could = new Float32Array(places * STRATA.length), held = new Float32Array(places * V);
  // Who could live in each stratum: the leading variant of each plant species on the island.
  const live = STRATA.map((_, k) => s.species.flatMap((x, sp) => {
    const v = poolOf(s, sp)[0];
    return v !== undefined && !SPECIES[x.base].animal && P[v].stratum === k ? [P[v]] : [];
  }));
  for (let i = 0; i < n; i++) {
    const b = s.region[i];
    if (b < 0 || s.terrain[i] === SEA) continue;
    for (let k = 0; k < STRATA.length; k++) {
      const slot = k * n + i, v = s.occ[slot];
      if (v < 0) { if (live[k].some((p) => fit(s, p, i) > 0)) could[b * STRATA.length + k]++; continue; }
      const p = P[v], g = groupOf(s, p.sp), c = s.cover[slot];
      could[b * STRATA.length + k]++;
      cover[b * GROUPS + g] += c;
      cap[b * GROUPS + g] += c * p.stats.palatable * p.stats.grow * S.regrow * 60;
      held[b * V + v]++;
    }
  }
  for (const ag of s.agents) {
    const b = s.region[(ag.y | 0) * s.w + (ag.x | 0)];
    if (b >= 0) held[b * V + ag.v] += ag.n;
  }
  for (let k = 0; k < cap.length; k++) B.cap[k] += (cap[k] - B.cap[k]) * a;
  return { cover, could, held, V };
}

/** Size and takes of every slot in one place. */
function measure(s: State, C: Census, p: number) {
  const B = s.board;
  for (let r = 0; r < R; r++) {
    const role = ROLES[r], sl = B.slots[p * R + r];
    if (role.kind === 'lead') {
      sl.size = C.could[p * STRATA.length + role.stratum];
      for (let g = 0; g < GROUPS; g++) sl.takes[g] = canHold(role, g) ? C.cover[p * GROUPS + g] : 0;
    } else {
      sl.size = role.kind === 'graze' ? B.cap[p * GROUPS + role.food] : B.rate[at(p, role.food, 0)];
      for (let g = 0; g < GROUPS; g++) sl.takes[g] = canHold(role, g) ? B.rate[at(p, role.food, 1 + g)] : 0;
    }
    sl.use = sl.size > 0 ? sl.takes.reduce((x, y) => x + y, 0) / sl.size : 0;
    sl.hist.push(sl.size);
    if (sl.hist.length > S.trendWindows + 1) sl.hist.shift();
    const old = sl.hist[0], d = old > 0 ? sl.size / old - 1 : 0;
    sl.trend = sl.hist.length > S.trendWindows && Math.abs(d) > S.trend ? (d > 0 ? 1 : -1) : 0;
  }
}

/** The holder's leading species in a place, and that species' leading variant there. */
function leader(s: State, C: Census, p: number, g: number): { sp: number; v: number } {
  const per = new Map<number, number>();
  for (let v = 0; v < C.V; v++) {
    const x = C.held[p * C.V + v];
    if (x && s.variants[v].alive && groupOf(s, s.variants[v].sp) === g) per.set(s.variants[v].sp, (per.get(s.variants[v].sp) ?? 0) + x);
  }
  const sp = [...per].sort((a, b) => b[1] - a[1])[0]?.[0] ?? -1;
  let v = -1;
  for (let u = 0; u < C.V; u++) if (s.variants[u].sp === sp && C.held[p * C.V + u] > (v < 0 ? 0 : C.held[p * C.V + v])) v = u;
  return { sp, v };
}

/** The slot in a place that a group feeds from: the one it holds with the biggest take. */
function heldBy(s: State, p: number, g: number): number {
  let best = -1, top = 0;
  for (let r = 0; r < R; r++) {
    const sl = s.board.slots[p * R + r];
    if (ROLES[r].kind !== 'lead' && sl.holder === g && sl.takes[g] > top) { top = sl.takes[g]; best = r; }
  }
  return best;
}

/** What feeds a slot: the plants' lead, the group that drops most litter, or the slot the prey eats in. */
function feed(s: State, p: number, sl: Slot) {
  const role = ROLES[sl.role], lead = (g: number) => LEADS[STRATA.indexOf(SPECIES[g].stratum)];
  sl.feeder = -1; sl.fedBy = -1;
  if (role.kind === 'lead') return;
  if (role.food === LITTER) {
    let top = 0;
    for (let g = 0; g < GROUPS; g++) if (s.board.dropRate[p * GROUPS + g] > top) { top = s.board.dropRate[p * GROUPS + g]; sl.feeder = g; }
  } else sl.feeder = role.food;
  if (sl.feeder >= 0) sl.fedBy = SPECIES[sl.feeder].animal ? heldBy(s, p, sl.feeder) : lead(sl.feeder);
}

/** A place's three board rows. A big open slot wins its row; otherwise the lead with the most cover, and the eating
 * and hunting links with the biggest share of their role's food on the island. A row changes only for a clearly
 * better slot. */
function pickRows(s: State, p: number, totals: number[]) {
  const B = s.board, rows = B.rows[p];
  (['lead', 'eat', 'hunt'] as const).forEach((row, k) => {
    const score = (r: number) => {
      const sl = B.slots[p * R + r];
      if (!sl.exists) return -1;
      const base = row === 'lead' ? sl.takes.reduce((x, y) => x + y, 0) / Math.max(1, sl.size) : sl.size / (totals[r] || 1);
      return (sl.big ? 10 : 0) + base;
    };
    let best = -1;
    for (let r = 0; r < R; r++) if (ROLES[r].row === row && score(r) >= 0 && (best < 0 || score(r) > score(best))) best = r;
    const prev = rows[k];
    rows[k] = prev >= 0 && best >= 0 && score(prev) >= 0 && score(best) < score(prev) * S.sticky ? prev : best;
  });
}

function say(s: State, text: string) {
  s.log.push({ tick: s.tick, kind: 'slot', text });
  s.board.lines++;
}

/** Once a window: rates, sizes, holders, the island's best, rows and news. */
export function updateSlots(s: State, P: Profile[]) {
  const t0 = timer.now(), B = s.board, places = s.regions.length, news = B.windows >= S.warmup;
  smooth(s);
  const C = census(s, P);
  for (let p = 0; p < places; p++) measure(s, C, p);
  // A slot exists where its food is made, at least `exists` of its role's largest; big ones are among the largest.
  const totals = ROLES.map(() => 0), tops: number[][] = ROLES.map(() => []);
  for (const sl of B.slots) { totals[sl.role] += sl.size; tops[sl.role].push(sl.size); }
  tops.forEach((t) => t.sort((a, b) => b - a));
  const before = B.slots.map((sl) => ({ holder: sl.holder, exists: sl.exists }));
  for (const sl of B.slots) {
    const role = ROLES[sl.role], max = tops[sl.role][0];
    sl.exists = sl.size > 0 && sl.size >= S.exists * max;
    [sl.holder, sl.share] = sl.exists ? pickHolder(role, sl.takes, sl.size, sl.holder) : [-1, 0];
    sl.open = sl.exists && sl.holder < 0;
    sl.big = sl.open && sl.size >= S.bigShare * max && sl.size >= (tops[sl.role][S.bigTop - 1] ?? 0);
    const who = sl.holder >= 0 ? leader(s, C, sl.place, sl.holder) : { sp: -1, v: -1 };
    sl.sp = who.sp; sl.v = who.v; sl.tier = who.v >= 0 ? s.variants[who.v].tier : 0;
    sl.yours = who.sp >= 0 && s.species[who.sp].parent >= 0;
  }
  for (const sl of B.slots) feed(s, sl.place, sl);
  for (let p = 0; p < places; p++) {
    pickRows(s, p, totals);
    for (const r of B.rows[p]) {
      if (r < 0) continue;
      const sl = B.slots[p * R + r], was = before[p * R + r], name = ROLES[r].name;
      if (sl.holder >= 0 && was.holder >= 0 && sl.holder !== was.holder) {
        B.changes++;
        if (news) say(s, `${groupName(sl.holder)} took over ${ROLES[r].kind === 'lead' ? 'the' : 'as'} ${name.toLowerCase()} on ${placeName(s, p)}`);
      } else if (sl.open && (was.holder >= 0 || (!was.exists && sl.big)) && news) say(s, `${name} opened on ${placeName(s, p)}`);
    }
  }
  bestOf(s, totals, news);
  B.windows++;
  B.ms = timer.now() - t0;
}

/** Each role's best holder on the whole island: the biggest share of all its food. */
function bestOf(s: State, totals: number[], news: boolean) {
  const B = s.board, places = s.regions.length, takes = new Array(GROUPS);
  ROLES.forEach((role, r) => {
    takes.fill(0);
    for (let p = 0; p < places; p++) { const sl = B.slots[p * R + r]; for (let g = 0; g < GROUPS; g++) takes[g] += sl.takes[g]; }
    const b: Best = B.best[r], was = b.holder, existed = b.exists;
    b.size = totals[r]; b.exists = totals[r] > 0;
    [b.holder, b.share] = pickHolder(role, takes, totals[r], was);
    if (!news || !b.exists) return;
    if (b.holder >= 0 && b.holder !== was) say(s, role.kind === 'lead' ? `${groupName(b.holder)} now lead the island's ${bestName(role)}` : `${groupName(b.holder)} are the island's best ${bestName(role)}`);
    else if (b.holder < 0 && (was >= 0 || !existed) && role.kind !== 'lead') say(s, `${role.name}: open across the island`);
  });
}
