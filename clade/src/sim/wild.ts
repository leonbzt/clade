// Wild cousins (N4 fix E): an open cell in a habitat you live in fills a bar, one generation at a time. When it is
// full, a cousin of a species living there takes the cell: no dice, so the sea changes on a clock you can read.
// The leash is the clutch's own machinery (two legal changes). Wild species are pruned once they live nowhere.
import { CLADES } from '../data/clades';
import { PARTS } from '../data/parts';
import { HUNT, WILD } from '../data/sea';
import { buildKey, isYours } from './build';
import { changes, heirBuild, type Card } from './clutch';
import { bodyOf, cellKey, grows, score, slots, stocked, valueIn, type Body } from './fitness';
import type { Habitat } from './habitats';
import { speciesKit, threat } from './hunt';
import type { Build, Letter, Slot, SlotId, Species, World } from './records';

const RANK: Record<Letter, number> = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };
const CAP = RANK.B; // a cousin is never stronger than B: the strong cells stay yours to take

interface Option { build: Build; cards: Card[]; body: Body }
/** Every build one or two legal changes from the parent, the nearer path first. It depends only on the parent. */
const memo = new Map<string, Option[]>();
function options(parent: Build): Option[] {
  const key = buildKey(parent), known = memo.get(key);
  if (known) return known;
  const one = changes(parent).map((card) => ({ build: heirBuild(parent, card), cards: [card] }));
  const two = one.flatMap((o) => changes(o.build).map((card) => ({ build: heirBuild(o.build, card), cards: [...o.cards, card] })));
  const seen = new Set([key]), out: Option[] = [];
  for (const o of [...one, ...two]) {
    const id = buildKey(o.build);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ ...o, body: bodyOf(o.build, {}) });
  }
  if (memo.size > 200) memo.clear();
  memo.set(key, out);
  return out;
}

export interface Cousin { build: Build; cards: Card[]; parent: Species; letter: Letter; value: number }
/** The leash: the best build within two legal changes of a species living here that eats this cell's food, would take
 *  this cell, grows there today and reads B at most. Parents are tried heaviest first; no such build, no cousin. */
export function cousinFor(world: World, h: Habitat, slot: Slot, available = slots(h, world)): Cousin | null {
  const parents = world.species.map((s) => ({ s, grams: h.pops[s.id] ?? 0 })).filter((p) => p.grams > 0)
    .sort((a, b) => b.grams - a.grams || a.s.id.localeCompare(b.s.id));
  const others = available.filter((s) => s !== slot && !s.prey && stocked(s, h));
  const tried = new Set<string>(), cache = new Map<string, number>(); // survival depends only on size and guards
  let best: Cousin | null = null;
  for (const { s: parent } of parents) {
    const key = buildKey(parent.build);
    if (tried.has(key)) continue; // the same body gives the same candidates
    tried.add(key);
    for (const { build, cards, body } of options(parent.build)) {
      if (!slot.prey !== !body.hunts) continue; // the diet rule: it must eat this cell's food
      const here = world.species.some((s) => (h.pops[s.id] ?? 0) > 0 && speciesKit(s).key === body.kit.key);
      const kind = `${body.kit.size}|${body.kit.guards.join()}`;
      let survival = here ? undefined : cache.get(kind);
      if (survival === undefined) {
        survival = threat(build, h, world).survival;
        if (!here) cache.set(kind, survival);
      }
      const fit = score(build, {}, slot, h, survival, body);
      if (RANK[fit.letter] > CAP || !grows(fit.value) || (best && fit.value <= best.value)) continue;
      if (!slot.prey && others.some((other) => valueIn(body, other, h, survival!) > fit.value)) continue; // it would eat elsewhere
      best = { build, cards, parent, letter: fit.letter, value: fit.value };
    }
  }
  return best;
}

function wildName(world: World, build: Build, cards: Card[]): string {
  const gained = [...cards].reverse().find((c) => c.kind !== 'lose');
  const clade = CLADES[build.clade].name.toLowerCase();
  const base = gained ? `Wild ${PARTS[gained.part].name.toLowerCase()} ${clade}` : `Wild plain ${clade}`;
  let name = base, n = 2;
  while (world.species.some((s) => s.name === name)) name = `${base} ${n++}`;
  return name;
}

/** A cell waits for a cousin while it has food to offer: any for a food cell, `HUNT.from` grams of prey above the
 *  refuge for the hunt cell. */
const waits = (slot: Slot, h: Habitat) => stocked(slot, h) && (!slot.prey || slot.capacity >= HUNT.from);
/** Generations until a cousin takes this cell, or null when its bar is not running. */
export function cousinIn(world: World, habitat: number, slot: SlotId): number | null {
  const bar = world.bars[cellKey(habitat, slot)];
  return bar === undefined ? null : Math.max(1, WILD.bar - bar);
}

export interface Bud { species: Species; habitat: number; parent: Species; slot: SlotId; letter: Letter }

/** One generation of bars. `held` lists, per habitat, the slots some population chose. A bar runs on a cell that
 *  waits, that nobody holds, in a habitat where a species of yours lives; every other bar starts again from 0. A full
 *  bar brings a cousin (its founders are added in place) and restarts, cousin or not. */
export function bud(world: World, available: Slot[][], held: Set<SlotId>[]): Bud[] {
  const buds: Bud[] = [], bars: World['bars'] = {};
  world.habitats.forEach((h, hi) => {
    if (!world.species.some((s) => isYours(s) && (h.pops[s.id] ?? 0) > 0)) return;
    available[hi].forEach((slot, si) => {
      if (held[hi].has(slot.id) || !waits(slot, h)) return;
      const key = cellKey(h.id, slot.id), bar = (world.bars[key] ?? 0) + 1;
      if (bar < WILD.bar) { bars[key] = bar; return; }
      const cousin = cousinFor(world, h, slot, available[hi]);
      if (!cousin) return;
      const id = buildKey(cousin.build);
      let species = world.species.find((s) => s.lineage === null && buildKey(s.build) === id);
      if (!species) {
        species = { id: `wild-${world.generation}-${h.id}-${si}`, lineage: null, parent: cousin.parent.id, build: cousin.build,
          name: wildName(world, cousin.build, cousin.cards), born: world.generation };
        world.species.push(species);
      }
      h.pops[species.id] = (h.pops[species.id] ?? 0) + WILD.founders;
      buds.push({ species, habitat: h.id, parent: cousin.parent, slot: slot.id, letter: cousin.letter });
    });
  });
  world.bars = bars;
  return buds;
}

/** Wild species that live nowhere leave the world, unless another species names them as its parent (law 4). Yours
 *  always stay. Returns the removed. */
export function prune(world: World): Species[] {
  const lives = (id: string) => world.habitats.some((h) => (h.pops[id] ?? 0) > 0);
  const gone = world.species.filter((s) => s.lineage === null && !lives(s.id) && !world.species.some((c) => c.parent === s.id));
  if (gone.length) world.species = world.species.filter((s) => !gone.includes(s));
  return gone;
}
