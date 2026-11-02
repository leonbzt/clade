// The counters behind the slot board: what each place makes and who takes it, per bucket (a habitat's id; the board
// grows as new ids are made, and a freed id's counters are cleared). The sim calls these where plants grow, animals eat and breed, hunters
// catch and litter falls; slots.ts reads them once a window. Food is a group (a base species: its plants' grams, or
// its young) or LITTER (grams); takers are groups.
import { GEAR } from '../data/habitats';
import { LITTER_MASS } from '../data/masses';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { GROUPS, LITTER, ROLES } from '../data/roles';
import { type Profile } from './fit';
import type { State } from './state';
import { nOf } from './nitrogen';

/** Per bucket and food: what was made, then what each group took. */
export const COLS = GROUPS + 1;
export const PER_BUCKET = (GROUPS + 1) * COLS;

export type Slot = {
  role: number; // index into ROLES
  place: number;
  size: number; // food made per minute: plants and litter in grams, young in members (leads: tiles where a plant of the stratum could live)
  grams: number; // the size in real grams (leads: standing mass, g; the rest g/min); masses.ts
  use: number; // the share of the size taken, all groups together (leads: cover)
  takes: number[]; // per group, per minute (leads: cover)
  holder: number; // the group with the biggest share, or -1: open
  share: number; // the holder's share of the size
  sp: number; // the holder's leading species here, its leading variant there and that variant's tier
  v: number;
  tier: number;
  yours: boolean; // a species you made
  trend: -1 | 0 | 1; // the size over the last few minutes
  feeder: number; // the group that supplies most of the food, or -1
  fedBy: number; // the role of the slot in this place it comes from, or -1
  exists: boolean; // its food is made here
  open: boolean;
  big: boolean; // open, and among the largest of its role on the island
  hist: number[]; // sizes of the last few windows, for the trend
};

export type Best = { holder: number; share: number; size: number; exists: boolean };

export type Board = {
  cnt: Float32Array; // this window: [bucket][food][made, taken by group...]
  drops: Float32Array; // this window: litter dropped, [bucket][group]
  rate: Float32Array; // smoothed, per minute
  dropRate: Float32Array;
  last: Float32Array; // the last window, per minute, unsmoothed (dev panel)
  cover: Float32Array; // cover now, [bucket][group]
  gear: Int16Array; // per bucket × GEAR: the role in that loadout slot, or -1: locked
  age: Uint32Array; // per bucket: windows smoothed since its id was made (0: its first window jumps to the value)
  windows: number;
  slots: Slot[]; // place × ROLES.length + role
  best: Best[]; // per role, over the whole island
  changes: number; // holder changes in shown loadout slots so far
  lines: number; // chatter lines so far
  heads: number; // headlines so far
  renames: number; // habitats renamed so far
  born: number; // habitat ids made so far (new pieces)
  alive: number[]; // per species: 1 if it lived on the island at the last window
  bestAt: number[]; // per role: the tick of its last island's-best headline
  ms: number; // what the last window update took
};

export function newBoard(places: number): Board {
  const B: Board = {
    cnt: new Float32Array(0), drops: new Float32Array(0), rate: new Float32Array(0), dropRate: new Float32Array(0), last: new Float32Array(0),
    cover: new Float32Array(0), gear: new Int16Array(0), age: new Uint32Array(0), windows: 0, slots: [],
    best: ROLES.map(() => ({ holder: -1, share: 0, size: 0, exists: false })),
    changes: 0, lines: 0, heads: 0, renames: 0, born: 0, alive: [], bestAt: [], ms: 0,
  };
  growBoard(B, places);
  return B;
}

const blankSlot = (k: number): Slot => ({
  role: k % ROLES.length, place: Math.floor(k / ROLES.length), size: 0, grams: 0, use: 0, takes: new Array(GROUPS).fill(0),
  holder: -1, share: 0, sp: -1, v: -1, tier: 0, yours: false, trend: 0, feeder: -1, fedBy: -1, exists: false, open: false, big: false, hist: [],
});

function more<T extends Float32Array | Int16Array | Uint32Array>(a: T, len: number, fill = 0): T {
  const b = new (a.constructor as new (n: number) => T)(len);
  b.fill(fill);
  b.set(a);
  return b;
}

/** Room for `places` buckets. */
export function growBoard(B: Board, places: number) {
  const have = B.age.length;
  if (places <= have) return;
  const m = places * PER_BUCKET, d = places * GROUPS;
  B.cnt = more(B.cnt, m); B.rate = more(B.rate, m); B.last = more(B.last, m);
  B.drops = more(B.drops, d); B.dropRate = more(B.dropRate, d); B.cover = more(B.cover, d);
  B.gear = more(B.gear, places * GEAR.length, -1); B.age = more(B.age, places);
  for (let k = have * ROLES.length; k < places * ROLES.length; k++) B.slots.push(blankSlot(k));
}

/** A bucket made new: its counters, rates and slots cleared. */
export function clearPlace(B: Board, p: number) {
  for (const a of [B.cnt, B.rate, B.last]) a.fill(0, p * PER_BUCKET, (p + 1) * PER_BUCKET);
  for (const a of [B.drops, B.dropRate, B.cover]) a.fill(0, p * GROUPS, (p + 1) * GROUPS);
  B.gear.fill(-1, p * GEAR.length, (p + 1) * GEAR.length);
  B.age[p] = 0;
  for (let k = p * ROLES.length; k < (p + 1) * ROLES.length; k++) B.slots[k] = blankSlot(k);
}

/** The bucket a tile counts into (its habitat's id), or -1 at sea. */
export const bucketOf = (s: State, i: number) => s.place[i];
export const groupOf = (s: State, sp: number) => s.species[sp].base;
export const at = (b: number, food: number, col: number) => b * PER_BUCKET + food * COLS + col;

/** Grams of litter per unit of the litter layer on a tile. */
export const LITTER_G = LITTER_MASS * NUM.mass.tile;

/** Food made on tile i: grams a plant made, or young born. */
export function made(s: State, i: number, food: number, amount: number) {
  const b = bucketOf(s, i);
  if (b >= 0) s.board.cnt[at(b, food, 0)] += amount;
}

/** Food taken on tile i by a group. */
export function took(s: State, i: number, food: number, by: number, amount: number) {
  const b = bucketOf(s, i);
  if (b >= 0) s.board.cnt[at(b, food, 1 + by)] += amount;
}

/** Grams of litter fall on tile i (turnover, dead plants, bodies, dung), from a group, with their nitrogen (by
 * default the group's share; dung brings its own). */
export function drop(s: State, i: number, from: number, amount: number, n = amount * nOf(from)) {
  s.fall[i] += amount / LITTER_G;
  s.fallN[i] += n;
  s.ledger.fell += amount;
  if (SPECIES[from].animal) s.ledger.dropped += amount;
  const b = bucketOf(s, i);
  if (b < 0) return;
  s.board.cnt[at(b, LITTER, 0)] += amount;
  s.board.drops[b * GROUPS + from] += amount;
}

/** Litter the plants on tile i make or break down this second (their `makes`, in layer units), split by how much
 * each makes or uses; counted in grams. */
export function litterFlow(s: State, P: Profile[], i: number, made: number, used: number) {
  const n = s.w * s.h;
  made *= LITTER_G; used *= LITTER_G;
  let plus = 0, minus = 0;
  for (let slot = i; slot < s.occ.length; slot += n) {
    const v = s.occ[slot], r = v >= 0 ? (P[v].makes.litter ?? 0) * s.cover[slot] * s.health[slot] : 0;
    if (r > 0) plus += r; else minus -= r;
  }
  const b = bucketOf(s, i);
  if (b < 0) return;
  for (let slot = i; slot < s.occ.length; slot += n) {
    const v = s.occ[slot], r = v >= 0 ? (P[v].makes.litter ?? 0) * s.cover[slot] * s.health[slot] : 0, g = v >= 0 ? groupOf(s, P[v].sp) : -1;
    if (r > 0 && made > 0) { s.board.cnt[at(b, LITTER, 0)] += (made * r) / plus; s.board.drops[b * GROUPS + g] += (made * r) / plus; }
    if (r < 0 && used > 0) s.board.cnt[at(b, LITTER, 1 + g)] += (used * -r) / minus;
  }
}
