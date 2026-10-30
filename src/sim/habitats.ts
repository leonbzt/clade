// Habitats: the places the sim makes. Every window each tile is given a kind (data/habitats.ts: the first test that
// passes, with a margin so edges don't flicker), and a habitat is a region × a kind: a counter bucket, so its id stays
// while its tiles move. One shows on the board from NUM.habitats.show tiles and hides below `hide`. Its name comes from
// its kind and the plant that leads it ("Fern forest"); twins are told apart by the region. Growing, vanishing and
// renames are news. Read-only: nothing here changes the sim.
import { GEAR, HABITAT_KINDS, LEAD_WORD, type Measure } from '../data/habitats';
import { NUM } from '../data/numbers';
import { ROLES } from '../data/roles';
import { SPECIES } from '../data/species';
import { chatter, headline } from './news';
import { SEA, STREAM, type State } from './state';

export type Habitat = {
  id: number; // its bucket: region × K + kind
  region: number;
  kind: number; // index into HABITAT_KINDS
  tiles: number;
  shown: boolean;
  seen: boolean; // it has been shown before
  since: number; // the tick it was last shown from
  lead: number; // the plant group its name comes from, or -1
  next: number; // a new lead waiting to rename it, and for how many windows it has led
  wait: number;
  base: string; // "Fern forest"
  name: string; // the base, plus the region for twins
  at: number; // where its card goes: the tile of it nearest its middle, or -1
};

const K = HABITAT_KINDS.length, H = NUM.habitats;

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

/** Once, with the island: every region × kind, the tiles sorted, the first names. */
export function buildHabitats(s: State) {
  for (let i = 0; i < s.hab.length; i++) if (s.terrain[i] !== SEA) s.hab[i] = kindOf(s, i, -1);
  s.habitats = Array.from({ length: s.regions.length * K }, (_, b) => ({
    id: b, region: Math.floor(b / K), kind: b % K, tiles: 0, shown: false, seen: false, since: 0, lead: -1, next: -1, wait: 0, base: HABITAT_KINDS[b % K].bare, name: '', at: -1,
  }));
  updateHabitats(s, false);
}

/** "the Lee lava, south", "Echo Tube mouth". */
export const regionName = (s: State, r: number) => (s.regions[r].kind === 'lava' ? 'the ' : '') + s.regions[r].name;
/** A habitat's name for the feed: "the Fern forest, Echo Tube mouth". */
export const placeName = (s: State, p: number) => `the ${s.habitats[p].name}`;

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

/** Once a window, after the slots: tiles, shown or not, names, where the cards go, and the news. */
export function updateHabitats(s: State, news: boolean) {
  const n = s.w * s.h, all = s.habitats, sum = all.map(() => ({ x: 0, y: 0, c: 0 }));
  for (let i = 0; i < n; i++) {
    if (s.region[i] < 0) continue;
    const q = sum[s.region[i] * K + s.hab[i]];
    q.x += i % s.w; q.y += (i / s.w) | 0; q.c++;
  }
  for (const h of all) {
    h.tiles = sum[h.id].c;
    const was = h.shown, d = HABITAT_KINDS[h.kind];
    h.shown = h.tiles >= (was ? H.hide : H.show);
    // A new lead renames it only once it has led for a while (at once while it's hidden).
    const lead = leadOf(s, h.id);
    h.wait = lead === h.next ? h.wait + 1 : 0;
    h.next = lead;
    if (lead !== h.lead && (h.wait >= H.rename || !h.shown || !was)) {
      const base = lead >= 0 ? `${LEAD_WORD[SPECIES[lead].id] ?? SPECIES[lead].short} ${d.noun}` : d.bare;
      if (news && was && h.shown) { chatter(s, `${h.base}, ${s.regions[h.region].name} is now ${lower(aOr(base))}`); s.board.renames++; }
      h.lead = lead; h.base = base;
    }
    const base = h.base;
    const stood = s.tick - h.since >= H.stood * NUM.ticksPerSec;
    if (news && h.shown && !was) (d.quiet || h.seen ? chatter : headline)(s, `${aOr(base)} grew on ${regionName(s, h.region)}`);
    if (news && was && !h.shown) (d.quiet || !stood ? chatter : headline)(s, `The ${lower(base)} on ${regionName(s, h.region)} ${base.endsWith('s') ? 'are' : 'is'} gone`);
    if (h.shown && !was) { h.since = s.tick; h.seen ||= news; }
  }
  // Twins (the same name in two regions) get their region's name.
  const seen = new Map<string, number>();
  for (const h of all) if (h.shown) seen.set(h.base, (seen.get(h.base) ?? 0) + 1);
  for (const h of all) h.name = (seen.get(h.base) ?? 0) > 1 ? `${h.base}, ${s.regions[h.region].name}` : h.base;
  // The card's tile: the habitat's tile nearest its middle; the old one stays unless it moved off or is 2 tiles worse.
  const near = all.map(() => ({ i: -1, d: Infinity })), dist = (i: number, b: number) => {
    const q = sum[b];
    return Math.hypot((i % s.w) - q.x / q.c, ((i / s.w) | 0) - q.y / q.c);
  };
  for (let i = 0; i < n; i++) {
    if (s.region[i] < 0) continue;
    const b = s.region[i] * K + s.hab[i], d = dist(i, b);
    if (d < near[b].d) near[b] = { i, d };
  }
  for (const h of all) {
    const keep = h.at >= 0 && s.region[h.at] * K + s.hab[h.at] === h.id && dist(h.at, h.id) <= near[h.id].d + 2;
    if (!keep) h.at = near[h.id].i;
  }
}

const lower = (t: string) => t[0].toLowerCase() + t.slice(1);
/** "a Fern forest", "an Ash scar", "Open ground". */
const aOr = (t: string) => (/^(Open|Deep|Bare)/.test(t) ? t : `${/^[AEIOU]/.test(t) ? 'An' : 'A'} ${t}`);

/** The habitats shown on the board. */
export const shownHabitats = (s: State) => s.habitats.filter((h) => h.shown);
