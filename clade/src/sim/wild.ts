// Wild branches (N4 B): a slot with food that no population chooses may bud a wild species from a nearby parent, on
// the clutch's own machinery (one legal change, then two). Wild species are pruned once they live nowhere.
import { CLADES } from '../data/clades';
import { PARTS } from '../data/parts';
import { HUNT, WILD } from '../data/sea';
import { buildKey } from './build';
import { changes, heirBuild, type Card } from './clutch';
import { bodyOf, score, stocked, type Body } from './fitness';
import type { Habitat } from './habitats';
import { speciesKit, threat } from './hunt';
import type { Build, Letter, Slot, SlotId, Species, World } from './records';
import { seeded } from './rng';

const KEEP: Letter[] = ['B', 'C']; // a bud is never stronger than B: the strong slots stay the player's to take
const RANK: Record<Letter, number> = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };

/** The roll for one slot in one habitat this generation: the same world seed, generation and habitat give the same. */
export const budRoll = (seed: number, generation: number, habitat: number, slot: number) =>
  seeded(Math.imul(seed ^ 0x9e3779b9, 31) + Math.imul(generation, 1000003) + Math.imul(habitat, 7919) + slot * 104729)();

interface Candidate { build: Build; cards: Card[]; letter: Letter; full: number }
interface Option { build: Build; cards: Card[]; body: Body }

/** The builds one or two legal changes from the parent that eat this slot's kind of food and read C or better before
 *  any hunter (survival lowers a letter, never raises it). For a food slot this depends only on the parent, the slot
 *  and the habitat's kind, so it is memoised; the answer is the same either way. */
const memo = new Map<string, Option[]>();
function options(parent: Build, slot: Slot, h: Habitat, steps: 1 | 2): Option[] {
  const key = slot.prey ? '' : `${buildKey(parent)}|${h.kind.depth}|${h.kind.substrate}|${slot.id}|${steps}`;
  const known = key && memo.get(key);
  if (known) return known;
  const seen = new Set<string>([buildKey(parent)]), out: Option[] = [];
  const visit = (build: Build, cards: Card[], left: number) => {
    for (const card of changes(build)) {
      const next = heirBuild(build, card), path = [...cards, card];
      if (left > 1) { visit(next, path, left - 1); continue; } // only the last step's builds are candidates
      const id = buildKey(next);
      if (seen.has(id)) continue;
      seen.add(id);
      const body = bodyOf(next, {});
      if (!slot.prey !== !body.hunts) continue; // the diet rule: it must eat this slot's food
      if (RANK[score(next, {}, slot, h, 1, body).letter] >= RANK.C) out.push({ build: next, cards: path, body });
    }
  };
  visit(parent, [], steps);
  if (key) {
    if (memo.size > 4000) memo.clear();
    memo.set(key, out);
  }
  return out;
}

/** A newcomer's survival depends only on its size and guards, so one habitat's buds share it (`cache`). */
function candidates(parent: Build, slot: Slot, h: Habitat, world: World, steps: 1 | 2, cache: Map<string, number>): Candidate[] {
  const out: Candidate[] = [];
  for (const { build, cards, body } of options(parent, slot, h, steps)) {
    const here = world.species.some((s) => (h.pops[s.id] ?? 0) > 0 && speciesKit(s).key === body.kit.key);
    const kind = `${body.kit.size}|${body.kit.guards.join()}`;
    let survival = here ? undefined : cache.get(kind);
    if (survival === undefined) {
      survival = threat(build, h, world).survival;
      if (!here) cache.set(kind, survival);
    }
    const fit = score(build, {}, slot, h, survival, body);
    if (KEEP.includes(fit.letter)) out.push({ build, cards, letter: fit.letter, full: fit.full });
  }
  return out;
}

function wildName(world: World, build: Build, cards: Card[]): string {
  const gained = [...cards].reverse().find((c) => c.kind !== 'lose');
  const clade = CLADES[build.clade].name.toLowerCase();
  const base = gained ? `Wild ${PARTS[gained.part].name.toLowerCase()} ${clade}` : `Wild plain ${clade}`;
  let name = base, n = 2;
  while (world.species.some((s) => s.name === name)) name = `${base} ${n++}`;
  return name;
}

export interface Bud { species: Species; habitat: number; parent: Species; slot: SlotId; letter: Letter }

/** Buds for this generation. `held` lists, per habitat, the slots some population chose. Adds founders in place. */
export function bud(world: World, available: Slot[][], held: Set<SlotId>[]): Bud[] {
  const buds: Bud[] = [];
  world.habitats.forEach((h, hi) => {
    const cache = new Map<string, number>();
    available[hi].forEach((slot, si) => {
      if (held[hi].has(slot.id) || !stocked(slot, h) || (slot.prey && slot.capacity < HUNT.from)) return;
      if (budRoll(world.seed, world.generation, h.id, si) >= WILD.chance) return;
      const near = [h, ...h.neighbours.map((id) => world.habitats.find((n) => n.id === id)).filter((n): n is Habitat => !!n)];
      const parents = world.species.map((s) => ({ s, grams: Math.max(...near.map((n) => n.pops[s.id] ?? 0)) }))
        .filter((p) => p.grams > 0).sort((a, b) => b.grams - a.grams || a.s.id.localeCompare(b.s.id));
      const tried = new Set<string>();
      for (const { s: parent } of parents) {
        const key0 = buildKey(parent.build);
        if (tried.has(key0)) continue; // the same body gives the same candidates
        tried.add(key0);
        const found = candidates(parent.build, slot, h, world, 1, cache);
        const pool = found.length ? found : candidates(parent.build, slot, h, world, 2, cache);
        if (!pool.length) continue;
        const best = pool.reduce((a, b) => RANK[b.letter] > RANK[a.letter] || (b.letter === a.letter && b.full > a.full) ? b : a);
        const key = buildKey(best.build);
        let species = world.species.find((s) => s.lineage === null && buildKey(s.build) === key);
        if (!species) {
          species = { id: `wild-${world.generation}-${h.id}-${si}`, lineage: null, parent: parent.id, build: best.build,
            name: wildName(world, best.build, best.cards), born: world.generation };
          world.species.push(species);
        }
        h.pops[species.id] = (h.pops[species.id] ?? 0) + WILD.founders;
        held[hi].add(slot.id);
        buds.push({ species, habitat: h.id, parent, slot: slot.id, letter: best.letter });
        break;
      }
    });
  });
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
