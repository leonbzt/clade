// The counters behind the slot board: what each place makes and who takes it, per bucket (a region now; part C adds
// the habitat kind, so no new hooks are needed). The sim calls these where plants grow, animals eat and breed, hunters
// catch and litter falls; slots.ts reads them once a window. Food is a group (a base species: its cover, or its
// young) or LITTER; takers are groups.
import { GROUPS, LITTER, ROLES } from '../data/roles';
import { type Profile } from './fit';
import type { State } from './state';

/** Per bucket and food: what was made, then what each group took. */
export const COLS = GROUPS + 1;
export const PER_BUCKET = (GROUPS + 1) * COLS;

export type Slot = {
  role: number; // index into ROLES
  place: number;
  size: number; // food made per minute (leads: tiles where a plant of the stratum could live)
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
  cap: Float32Array; // smoothed regrowth capacity, [bucket][group], cover per minute
  windows: number;
  slots: Slot[]; // place × ROLES.length + role
  rows: number[][]; // per place: the roles on its three board rows (lead, eat, hunt), -1 for none
  best: Best[]; // per role, over the whole island
  changes: number; // holder changes on board rows so far
  lines: number; // feed lines so far
  ms: number; // what the last window update took
};

export function newBoard(places: number): Board {
  const m = places * PER_BUCKET, d = places * GROUPS;
  return {
    cnt: new Float32Array(m), drops: new Float32Array(d), rate: new Float32Array(m), dropRate: new Float32Array(d),
    last: new Float32Array(m), cap: new Float32Array(d), windows: 0,
    slots: Array.from({ length: places * ROLES.length }, (_, k) => ({
      role: k % ROLES.length, place: Math.floor(k / ROLES.length), size: 0, use: 0, takes: new Array(GROUPS).fill(0),
      holder: -1, share: 0, sp: -1, v: -1, tier: 0, yours: false, trend: 0, feeder: -1, fedBy: -1,
      exists: false, open: false, big: false, hist: [],
    })),
    rows: Array.from({ length: places }, () => [-1, -1, -1]), best: ROLES.map(() => ({ holder: -1, share: 0, size: 0, exists: false })),
    changes: 0, lines: 0, ms: 0,
  };
}

/** The bucket a tile counts into, or -1 at sea. */
export const bucketOf = (s: State, i: number) => s.region[i];
export const groupOf = (s: State, sp: number) => s.species[sp].base;
export const at = (b: number, food: number, col: number) => b * PER_BUCKET + food * COLS + col;

/** Food made on tile i: cover grown, or young born. */
export function made(s: State, i: number, food: number, amount: number) {
  const b = bucketOf(s, i);
  if (b >= 0) s.board.cnt[at(b, food, 0)] += amount;
}

/** Food taken on tile i by a group. */
export function took(s: State, i: number, food: number, by: number, amount: number) {
  const b = bucketOf(s, i);
  if (b >= 0) s.board.cnt[at(b, food, 1 + by)] += amount;
}

/** Litter falls on tile i (dead plants, bodies, dung), from a group. */
export function drop(s: State, i: number, from: number, amount: number) {
  s.fall[i] += amount;
  const b = bucketOf(s, i);
  if (b < 0) return;
  s.board.cnt[at(b, LITTER, 0)] += amount;
  s.board.drops[b * GROUPS + from] += amount;
}

/** Litter the plants on tile i make or break down this second (their `makes`), split by how much each makes or uses. */
export function litterFlow(s: State, P: Profile[], i: number, made: number, used: number) {
  const n = s.w * s.h;
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
