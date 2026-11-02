// The slot board: every window (NUM.slots.window seconds) the counters (tally.ts) become smoothed rates, and each
// place × role becomes a slot with a size, the share taken, a holder, a trend and what feeds it. Places are the
// habitats (habitats.ts): majors, patches and the scrap buckets, all of which count for the island's best. Sizes:
// leads count the tiles where a plant of the stratum on the island could live; grazers the grams the plants made
// (their production); litter roles the grams of litter that fell; hunters the young born. Each size is also in grams
// (masses.ts). Holders change only for
// a clearly bigger share. Each habitat shows six of its slots as a loadout (GEAR). Read-only: nothing here changes
// the sim.
import { STRATA, type StratumId } from '../data/fields';
import { GEAR } from '../data/habitats';
import { MASS } from '../data/masses';
import { NUM } from '../data/numbers';
import { bestName, canHold, GROUPS, LITTER, ROLES, type Role } from '../data/roles';
import { SPECIES } from '../data/species';
import { fit, type Profile } from './fit';
import { SEA, type State } from './state';
import { classify, MAJOR, placeName, remap, updateHabitats } from './habitats';
import { chatter, headline } from './news';
import { at, bucketOf, groupOf, PER_BUCKET, type Best, type Slot } from './tally';
import { poolOf } from './variants';

const S = NUM.slots;
/** The sim stays deterministic: the UI and the runner plug in a real clock to time the update. */
export const timer = { now: () => 0 };
const R = ROLES.length;
const LEADS = STRATA.map((_, k) => ROLES.findIndex((r) => r.kind === 'lead' && r.stratum === k));
/** The roles under each animal loadout slot. */
const UNDER = GEAR.map((g) => ROLES.flatMap((r, k) => (g.kinds?.includes(r.kind) ? [k] : [])));
/** Grams per unit of each food made: an animal member; plants and litter are counted in grams. And a plant's grams at
 * full cover on a tile, for the leads. */
const GRAMS = [...SPECIES.map((d) => (d.animal ? (MASS[d.id] ?? 0) * d.animal.stands * NUM.mass.tile : 1)), 1];
const FULL = SPECIES.map((d) => (MASS[d.id] ?? 0) * NUM.mass.tile);

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

/** How fast a place's rates follow: its first window jumps to the value. */
const follow = (s: State, p: number) => (s.board.age[p] ? S.window / S.smooth : 1);

/** Smooths this window's counters into per-minute rates and clears them. */
function smooth(s: State) {
  const B = s.board, perMin = 60 / S.window;
  for (let p = 0; p < s.habitats.length; p++) {
    if (!s.habitats[p].alive) continue;
    const a = follow(s, p);
    for (let k = p * PER_BUCKET; k < (p + 1) * PER_BUCKET; k++) { const x = B.cnt[k] * perMin; B.last[k] = x; B.rate[k] += (x - B.rate[k]) * a; }
    for (let k = p * GROUPS; k < (p + 1) * GROUPS; k++) B.dropRate[k] += (B.drops[k] * perMin - B.dropRate[k]) * a;
    B.age[p]++;
  }
  B.cnt.fill(0); B.drops.fill(0);
}

type Census = { cover: Float32Array; could: Float32Array; held: Float32Array; V: number };

/** One pass over the map: cover per group, tiles a plant of each stratum could live on, and plants
 * and animals per variant (for the holder's leading species and variant). */
function census(s: State, P: Profile[]): Census {
  const n = s.w * s.h, places = s.habitats.length, V = s.variants.length, B = s.board;
  const cover = new Float32Array(places * GROUPS);
  const could = new Float32Array(places * STRATA.length), held = new Float32Array(places * V);
  // Who could live in each stratum: the leading variant of each plant species on the island.
  const live = STRATA.map((_, k) => s.species.flatMap((x, sp) => {
    const v = poolOf(s, sp)[0];
    return v !== undefined && !SPECIES[x.base].animal && P[v].stratum === k ? [P[v]] : [];
  }));
  for (let i = 0; i < n; i++) {
    const b = bucketOf(s, i);
    if (b < 0 || s.terrain[i] === SEA) continue;
    for (let k = 0; k < STRATA.length; k++) {
      const slot = k * n + i, v = s.occ[slot];
      if (v < 0) { if (live[k].some((p) => fit(s, p, i) > 0)) could[b * STRATA.length + k]++; continue; }
      const p = P[v], g = groupOf(s, p.sp), c = s.cover[slot];
      could[b * STRATA.length + k]++;
      cover[b * GROUPS + g] += c;
      held[b * V + v]++;
    }
  }
  for (const ag of s.agents) {
    const b = bucketOf(s, (ag.y | 0) * s.w + (ag.x | 0));
    if (b >= 0) held[b * V + ag.v] += ag.n;
  }
  B.cover.set(cover);
  return { cover, could, held, V };
}

/** Size and takes of every slot in one place. */
function measure(s: State, C: Census, p: number) {
  const B = s.board;
  for (let r = 0; r < R; r++) {
    const role = ROLES[r], sl = B.slots[p * R + r];
    if (role.kind === 'lead') {
      sl.size = C.could[p * STRATA.length + role.stratum];
      sl.grams = 0;
      for (let g = 0; g < GROUPS; g++) {
        sl.takes[g] = canHold(role, g) ? C.cover[p * GROUPS + g] : 0;
        sl.grams += sl.takes[g] * FULL[g];
      }
    } else {
      sl.size = B.rate[at(p, role.food, 0)];
      sl.grams = sl.size * GRAMS[role.food];
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

/** The loadout: per habitat, the role in each of the six slots. A plant slot is its stratum's lead; an animal slot the
 * role under it with the most food made here in grams (it switches only for one `sticky` × bigger). -1: locked, as
 * nothing of that kind exists here. */
function pickGear(s: State, p: number) {
  const B = s.board, sl = (r: number) => B.slots[p * R + r];
  GEAR.forEach((gear, k) => {
    const at = p * GEAR.length + k;
    if (gear.plant) { const r = LEADS[STRATA.indexOf(gear.stratum as StratumId)]; B.gear[at] = r >= 0 && sl(r).exists ? r : -1; return; }
    let best = -1;
    for (const r of UNDER[k]) if (sl(r).exists && (best < 0 || sl(r).grams > sl(best).grams)) best = r;
    const prev = B.gear[at];
    B.gear[at] = prev >= 0 && best >= 0 && sl(prev).exists && sl(best).grams < sl(prev).grams * S.sticky ? prev : best;
  });
}

type Before = { holder: number; exists: boolean; big: boolean };

/** The news from one habitat's loadout: holders changing and slots opening are chatter; a big one opening is a headline. */
function gearNews(s: State, p: number, before: Before[], old: Int16Array) {
  const B = s.board;
  GEAR.forEach((gear, k) => {
    const r = B.gear[p * GEAR.length + k];
    if (r < 0 || old[p * GEAR.length + k] !== r) return;
    const sl = B.slots[p * R + r], was = before[p * R + r], name = ROLES[r].name;
    if (sl.holder >= 0 && was.holder >= 0 && sl.holder !== was.holder) {
      B.changes++;
      chatter(s, `${groupName(sl.holder)} took over ${gear.plant ? 'the' : 'as'} ${name.toLowerCase()} in ${placeName(s, p)}`);
    } else if (sl.big && (was.holder >= 0 || !was.exists)) headline(s, `Big and open: ${name.toLowerCase()} in ${placeName(s, p)}`);
    else if (sl.open && was.holder >= 0) chatter(s, `${name} opened in ${placeName(s, p)}`);
  });
}

/** A species gone from the whole island is a headline. */
function dieOut(s: State, news: boolean) {
  const A = s.board.alive;
  s.species.forEach((x, sp) => {
    const now = s.count[sp] > 0;
    if (A[sp] && !now && news) headline(s, `${x.name} died out on the island`);
    A[sp] = now ? 1 : 0;
  });
}

/** Once a window: habitat kinds, rates, sizes, holders, the loadouts, the island's best and news. */
export function updateSlots(s: State, P: Profile[]) {
  const t0 = timer.now(), B = s.board, news = B.windows >= S.warmup;
  classify(s);
  smooth(s); // the window's counters belong to the old pieces
  const gone = remap(s), places = s.habitats.length, live = (p: number) => s.habitats[p].alive;
  const C = census(s, P);
  for (let p = 0; p < places; p++) if (live(p)) measure(s, C, p);
  // A slot exists where its food is made, at least `exists` of its role's largest; big ones are among the largest.
  const totals = ROLES.map(() => 0), tops: number[][] = ROLES.map(() => []);
  for (const sl of B.slots) { totals[sl.role] += sl.size; tops[sl.role].push(sl.size); }
  tops.forEach((t) => t.sort((a, b) => b - a));
  const before: Before[] = B.slots.map((sl) => ({ holder: sl.holder, exists: sl.exists, big: sl.big })), old = B.gear.slice();
  for (const sl of B.slots) {
    if (!live(sl.place)) continue;
    const role = ROLES[sl.role], max = tops[sl.role][0];
    // A lead exists wherever a plant of its stratum could live; a food link once its food is made in some amount.
    sl.exists = sl.size > 0 && (role.kind === 'lead' || sl.size >= S.exists * max);
    [sl.holder, sl.share] = sl.exists ? pickHolder(role, sl.takes, sl.size, sl.holder) : [-1, 0];
    sl.open = sl.exists && sl.holder < 0;
    sl.big = sl.open && sl.size >= S.bigShare * max && sl.size >= (tops[sl.role][S.bigTop - 1] ?? 0);
    const who = sl.holder >= 0 ? leader(s, C, sl.place, sl.holder) : { sp: -1, v: -1 };
    sl.sp = who.sp; sl.v = who.v; sl.tier = who.v >= 0 ? s.variants[who.v].tier : 0;
    sl.yours = who.sp >= 0 && s.species[who.sp].parent >= 0;
  }
  for (const sl of B.slots) if (live(sl.place)) feed(s, sl.place, sl);
  for (let p = 0; p < places; p++) if (live(p)) pickGear(s, p);
  updateHabitats(s, news, gone);
  for (let p = 0; p < places; p++) if (news && live(p) && s.habitats[p].was === MAJOR && s.habitats[p].shown) gearNews(s, p, before, old);
  bestOf(s, totals, news);
  dieOut(s, news);
  B.windows++;
  B.ms = timer.now() - t0;
}

/** Each role's best holder on the whole island: the biggest share of all its food. */
function bestOf(s: State, totals: number[], news: boolean) {
  const B = s.board, places = s.habitats.length, takes = new Array(GROUPS), T = NUM.ticksPerSec, H = NUM.habitats;
  let last = B.bestAt.reduce((a, t) => Math.max(a, t), -Infinity); // the last island's-best headline, any role
  ROLES.forEach((role, r) => {
    takes.fill(0);
    for (let p = 0; p < places; p++) { const sl = B.slots[p * R + r]; for (let g = 0; g < GROUPS; g++) takes[g] += sl.takes[g]; }
    const b: Best = B.best[r], was = b.holder, existed = b.exists;
    b.size = totals[r]; b.exists = totals[r] > 0;
    [b.holder, b.share] = pickHolder(role, takes, totals[r], was);
    if (!news || !b.exists) return;
    const say = s.tick - (B.bestAt[r] ?? -Infinity) >= H.bestEvery * T && s.tick - last >= H.bestGap * T ? headline : chatter;
    if (b.holder >= 0 && b.holder !== was && say === headline) last = B.bestAt[r] = s.tick;
    if (b.holder >= 0 && b.holder !== was) say(s, role.kind === 'lead' ? `${groupName(b.holder)} now lead the island's ${bestName(role)}` : `${groupName(b.holder)} are the island's best ${bestName(role)}`);
    else if (b.holder < 0 && (was >= 0 || !existed) && role.kind !== 'lead') chatter(s, `${role.name}: open across the island`);
  });
}
