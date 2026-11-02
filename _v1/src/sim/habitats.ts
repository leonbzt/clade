// Habitats: the places the sim makes. Every window each tile is given a kind (data/habitats.ts: the first test that
// passes, with a margin so edges don't flicker), and a habitat is a connected piece of one kind: 8 neighbours, with
// gaps of NUM.habitats.gap tiles bridged. Ids carry over by overlap, so a habitat's counters follow it while its tiles
// move: a piece takes the id it shares most tiles with; on a merge the bigger one lives on, on a split the biggest part.
// Majors (from `show` tiles, hidden below `hide`) get a name, a card and a place on the board. Patches (from `patch`,
// down to `scrap`) are a tint and a hover. Scraps count into one island-wide bucket per kind (ids 0 … K − 1). Names
// come from the kind and the plant that leads it ("Fern forest"); twins get a compass word. Growing, shrinking,
// vanishing and renames are news. Read-only: nothing here changes the sim.
import { GEAR, HABITAT_KINDS, LEAD_WORD, type Measure } from '../data/habitats';
import { NUM } from '../data/numbers';
import { ROLES } from '../data/roles';
import { SPECIES } from '../data/species';
import { chatter, headline } from './news';
import { SEA, STREAM, type State } from './state';
import { clearPlace, growBoard } from './tally';

export const SCRAP = 0, PATCH = 1, MAJOR = 2;

export type Habitat = {
  id: number; // its counter bucket; ids below K are the scrap buckets, one per kind
  kind: number; // index into HABITAT_KINDS
  tier: number; // SCRAP, PATCH or MAJOR
  was: number; // its tier at the last window
  alive: boolean; // false: a free id, waiting to be reused
  tiles: number;
  x: number; // its middle, in tiles
  y: number;
  shown: boolean; // a major: named, with a card and a place on the board
  seen: boolean; // it has been shown before (or began as part of another), so its growing is chatter
  since: number; // the tick it last became a major
  lead: number; // the plant group its name comes from, or -1
  next: number; // a new lead waiting to rename it, and for how many windows it has led
  wait: number;
  base: string; // "Fern forest"
  name: string; // the base, plus a compass word for twins
  at: number; // where its card goes: the tile of it nearest its middle, or -1
};

/** A major that ended this window, for the news: merged into another, or gone. */
export type Gone = { base: string; name: string; kind: number; since: number; merged: boolean; x: number; y: number };

const K = HABITAT_KINDS.length, H = NUM.habitats;

const COMPASS = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
const COMPASS4 = ['east', 'south', 'west', 'north'];
/** "north-west" for a direction on the map (y points south). */
export const compass = (a: number) => COMPASS[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
/** The compass word of a spot from the island's middle (4 or 8 words), or "middle" near it. */
function dirOf(s: State, x: number, y: number, eight: boolean): string {
  const dx = (x - s.w / 2) / s.w, dy = (y - s.h / 2) / s.h;
  if (Math.hypot(dx, dy) < 0.08) return 'middle';
  const a = Math.atan2(dy, dx);
  return eight ? compass(a) : COMPASS4[((Math.round(a / (Math.PI / 2)) % 4) + 4) % 4];
}

function measure(s: State, i: number, on: Measure): number {
  if (on === 'scar') return s.scar[i] >= 0 && s.tick - s.scar[i] < H.scar * NUM.ticksPerSec ? 1 : 0;
  if (on === 'salty') return s.statuses.salty[i];
  return s.layers[on][i];
}

/** A tile's kind: the first test that passes. Its current kind passes by `margin` less, the others need `margin`
 * more, so a tile at an edge stays put (cur -1: no margins). */
export function kindOf(s: State, i: number, cur: number): number {
  for (let k = 0; k < K; k++) {
    const d = HABITAT_KINDS[k], t = d.test;
    if (!t || (d.stream && s.terrain[i] === STREAM)) return k;
    const x = measure(s, i, t.on), m = cur < 0 ? 0 : k === cur ? -t.margin : t.margin;
    if ((t.min === undefined || x >= t.min + m) && (t.max === undefined || x < t.max - m)) return k;
  }
  return K - 1;
}

export function classify(s: State) {
  for (let i = 0; i < s.hab.length; i++) if (s.terrain[i] !== SEA) s.hab[i] = kindOf(s, i, s.hab[i]);
}

function blank(id: number, kind: number): Habitat {
  return { id, kind, tier: SCRAP, was: SCRAP, alive: true, tiles: 0, x: 0, y: 0, shown: false, seen: false, since: 0, lead: -1, next: -1, wait: 0,
    base: HABITAT_KINDS[kind].bare, name: '', at: -1 };
}

/** A free id for a new piece (a dead one, or a new one), with clean counters. */
function newId(s: State, kind: number, split: boolean): number {
  let id = s.habitats.findIndex((h) => !h.alive);
  if (id < 0) { id = s.habitats.length; s.habitats.push(blank(id, kind)); growBoard(s.board, s.habitats.length); }
  s.habitats[id] = { ...blank(id, kind), seen: split };
  clearPlace(s.board, id);
  s.board.born++;
  return id;
}

/** Connected pieces of one kind, gaps of `gap` tiles bridged. */
function pieces(s: State): number[][] {
  const n = s.w * s.h, G = H.gap + 1, seen = new Uint8Array(n), out: number[][] = [];
  for (let i = 0; i < n; i++) {
    if (seen[i] || s.terrain[i] === SEA) continue;
    const p = [i], k = s.hab[i];
    seen[i] = 1;
    for (let q = 0; q < p.length; q++) {
      const x = p[q] % s.w, y = (p[q] / s.w) | 0;
      for (let ny = Math.max(0, y - G); ny <= Math.min(s.h - 1, y + G); ny++) for (let nx = Math.max(0, x - G); nx <= Math.min(s.w - 1, x + G); nx++) {
        const j = ny * s.w + nx;
        if (!seen[j] && s.terrain[j] !== SEA && s.hab[j] === k) { seen[j] = 1; p.push(j); }
      }
    }
    out.push(p);
  }
  return out;
}

/** Once a window, after the kinds: the pieces, their ids and tiers, sizes, middles and card tiles. Returns the majors
 * that ended (for the news). */
export function remap(s: State): Gone[] {
  const n = s.w * s.h, all = s.habitats, old = s.place, list = pieces(s);
  for (const h of all) h.was = h.alive ? h.tier : SCRAP;
  // Each piece takes the old id (of its kind) it shares most tiles with; each id goes to one piece, biggest overlap first.
  const pairs: [number, number, number][] = [];
  list.forEach((p, q) => {
    const over = new Map<number, number>();
    for (const i of p) { const o = old[i]; if (o >= K && all[o].alive && all[o].kind === s.hab[i]) over.set(o, (over.get(o) ?? 0) + 1); }
    for (const [o, c] of over) pairs.push([q, o, c]);
  });
  pairs.sort((a, b) => b[2] - a[2] || list[b[0]].length - list[a[0]].length || a[1] - b[1]);
  const owner = new Int32Array(list.length).fill(-1), taken = new Set<number>(), split = new Uint8Array(list.length);
  for (const [q, o] of pairs) { split[q] = 1; if (owner[q] < 0 && !taken.has(o)) { owner[q] = o; taken.add(o); } }

  const place = new Int16Array(n).fill(-1), keep = new Set<number>(), sum = all.map(() => ({ x: 0, y: 0, c: 0 }));
  list.forEach((p, q) => {
    const o = owner[q], prior = o >= 0 ? all[o].tier : SCRAP, c = p.length, k = s.hab[p[0]];
    const tier = c >= (prior === MAJOR ? H.hide : H.show) ? MAJOR : c >= (prior >= PATCH ? H.scrap : H.patch) ? PATCH : SCRAP;
    let id = k;
    if (tier > SCRAP) { id = o >= 0 ? o : newId(s, k, split[q] === 1); keep.add(id); all[id].tier = tier; }
    while (sum.length < all.length) sum.push({ x: 0, y: 0, c: 0 });
    for (const i of p) { place[i] = id; sum[id].x += i % s.w; sum[id].y += (i / s.w) | 0; sum[id].c++; }
  });

  // Ids no piece kept: merged when most of their tiles are now in another habitat of their kind, else gone.
  const into = new Map<number, number>(), had = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const o = old[i];
    if (o < K || keep.has(o) || !all[o].alive) continue;
    had.set(o, (had.get(o) ?? 0) + 1);
    if (place[i] >= K && s.hab[i] === all[o].kind) into.set(o, (into.get(o) ?? 0) + 1);
  }
  const gone: Gone[] = [];
  for (const h of all) {
    if (h.id < K || !h.alive || keep.has(h.id)) continue;
    if (h.tier === MAJOR) gone.push({ base: h.base, name: h.name, kind: h.kind, since: h.since, x: h.x, y: h.y, merged: (into.get(h.id) ?? 0) * 2 > (had.get(h.id) ?? 0) });
    Object.assign(h, { alive: false, tier: SCRAP, tiles: 0, shown: false, at: -1 });
    clearPlace(s.board, h.id);
  }
  s.place = place;

  // Sizes, middles, and the card's tile: the tile nearest the middle; the old one stays unless it moved off or is 2 tiles worse.
  const near = all.map(() => ({ i: -1, d: Infinity })), dist = (i: number, b: number) => Math.hypot((i % s.w) - all[b].x, ((i / s.w) | 0) - all[b].y);
  for (const h of all) {
    if (!h.alive) continue;
    const q = sum[h.id];
    h.tiles = q.c;
    if (q.c) { h.x = q.x / q.c; h.y = q.y / q.c; }
  }
  for (let i = 0; i < n; i++) {
    const b = place[i];
    if (b >= K) { const d = dist(i, b); if (d < near[b].d) near[b] = { i, d }; }
  }
  for (const h of all) {
    if (h.id < K || !h.alive) continue;
    if (!(h.at >= 0 && place[h.at] === h.id && dist(h.at, h.id) <= near[h.id].d + 2)) h.at = near[h.id].i;
  }
  return gone;
}

/** Once, with the island: the kinds, the scrap buckets, the first pieces and names. */
export function buildHabitats(s: State) {
  for (let i = 0; i < s.hab.length; i++) if (s.terrain[i] !== SEA) s.hab[i] = kindOf(s, i, -1);
  s.habitats = HABITAT_KINDS.map((_, k) => blank(k, k));
  growBoard(s.board, K);
  remap(s);
  updateHabitats(s, false, []);
}

/** A habitat's name for the feed: "the Fern forest, west". */
export const placeName = (s: State, p: number) => `the ${s.habitats[p].name}`;
/** "in the west", from the island's middle. */
const where = (s: State, x: number, y: number) => `in the ${dirOf(s, x, y, true)}`;

/** The plant that names a habitat: the herb layer's holder, else the ground's. */
function leadOf(s: State, b: number): number {
  const R = ROLES.length;
  for (const st of ['herb', 'ground']) {
    const r = s.board.gear[b * GEAR.length + GEAR.findIndex((g) => g.stratum === st)];
    const h = r >= 0 ? s.board.slots[b * R + r]?.holder ?? -1 : -1;
    if (h >= 0) return h;
  }
  return -1;
}

/** Once a window, after the slots: shown or not, leads and names, and the news. */
export function updateHabitats(s: State, news: boolean, gone: Gone[]) {
  for (const h of s.habitats) {
    if (!h.alive) continue;
    const was = h.was === MAJOR, d = HABITAT_KINDS[h.kind];
    h.shown = h.tier === MAJOR;
    // A new lead renames it only once it has led for a while (at once while it's hidden).
    const lead = leadOf(s, h.id);
    h.wait = lead === h.next ? h.wait + 1 : 0;
    h.next = lead;
    if (lead !== h.lead && (h.wait >= H.rename || !h.shown || !was)) {
      const base = lead >= 0 ? `${LEAD_WORD[SPECIES[lead].id] ?? SPECIES[lead].short} ${d.noun}` : d.bare;
      if (news && was && h.shown) { chatter(s, `The ${h.name} is now ${lower(aOr(base))}`); s.board.renames++; }
      h.lead = lead; h.base = base;
    }
    if (news && h.shown && !was) (d.quiet || h.seen ? chatter : headline)(s, `${aOr(h.base)} grew ${where(s, h.x, h.y)}`);
    if (news && was && !h.shown) chatter(s, `The ${h.name} shrank to a patch`);
    if (h.shown && !was) { h.since = s.tick; h.seen ||= news; }
  }
  for (const g of gone) {
    if (!news || g.merged) continue;
    const stood = s.tick - g.since >= H.stood * NUM.ticksPerSec, quiet = HABITAT_KINDS[g.kind].quiet;
    (quiet || !stood ? chatter : headline)(s, `The ${g.name} ${where(s, g.x, g.y)} ${g.base.endsWith('s') ? 'are' : 'is'} gone`);
  }
  nameTwins(s);
}

/** Twins (majors with the same name) get a compass word from the island's middle; twins that share it get the
 * nearer of eight, and a number if even that is the same. */
function nameTwins(s: State) {
  const by = new Map<string, Habitat[]>();
  for (const h of s.habitats) {
    if (!h.alive) continue;
    h.name = h.base;
    if (h.shown) by.set(h.base, [...(by.get(h.base) ?? []), h]);
  }
  for (const [base, hs] of by) {
    if (hs.length < 2) continue;
    const four = hs.map((h) => dirOf(s, h.x, h.y, false)), used = new Map<string, number>();
    const words = hs.map((h, k) => (four.filter((w) => w === four[k]).length > 1 ? dirOf(s, h.x, h.y, true) : four[k]));
    hs.forEach((h, k) => {
      const c = used.get(words[k]) ?? 0;
      used.set(words[k], c + 1);
      h.name = `${base}, ${words[k]}${c ? ` ${c + 1}` : ''}`;
    });
  }
}

const lower = (t: string) => t[0].toLowerCase() + t.slice(1);
/** "a Fern forest", "an Ash scar", "Open ground". */
const aOr = (t: string) => (/^(Open|Deep|Bare)/.test(t) ? t : `${/^[AEIOU]/.test(t) ? 'An' : 'A'} ${t}`);

/** The habitats shown on the board. */
export const shownHabitats = (s: State) => s.habitats.filter((h) => h.alive && h.shown);
