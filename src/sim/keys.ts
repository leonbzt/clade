// Doors: a tree node opens when one of your variants meets its recipe. A shown variant of a species in one of the
// door's `from` clades that carries every precursor is a candidate; the key gene arrives in the biggest one within
// a few minutes. With the door open and no candidate for a while, the closest variant gains a missing precursor
// (the nudge), so progress never stalls. The variant with the key then splits off as the clade's first species.
import { AXIS_INDEX, KEY, KEYS, type Key, type Precursor } from '../data/genes';
import { TREE } from '../data/tree';
import { rand } from './rng';
import { othersMet } from './reqs';
import { EV, type State } from './state';
import { type Profile } from './fit';
import { copyGenome, defOf, newKey, roomToShow, show, stratumOf, variantFor, variantName, type Genome } from './variants';

export const hasPrecursor = (g: Genome, p: Precursor) => {
  if (p.trait) return g.traits.includes(p.trait);
  const a = g.axes[AXIS_INDEX[p.axis!]];
  return p.step! > 0 ? a >= p.step! : a <= p.step!;
};

export const doorNode = (key: Key) => TREE.find((n) => n.id === key.node)!;

/** The clade (tree node) a species belongs to: the node whose species or template its base is. */
export const cladeOf = (s: State, sp: number) => TREE.find((n) => n.species === defOf(s, sp).id)?.id ?? null;

/** Your species that can meet this door's recipe: living ones in its `from` clades. */
export const fromSpecies = (s: State, key: Key) =>
  s.species.flatMap((_, sp) => (s.count[sp] > 0 && key.from.includes(cladeOf(s, sp) ?? '') ? [sp] : []));

const carried = (g: Genome, key: Key) => key.precursors.filter((p) => hasPrecursor(g, p)).length;

/** Shown variants of the door's species, with how many precursors each carries (key carriers left out). */
function pool(s: State, key: Key) {
  const sps = fromSpecies(s, key);
  return s.variants.flatMap((x, v) => (x.alive && x.shown && sps.includes(x.sp) && !newKey(x.genome, s.species[x.sp].genome)
    ? [{ v, k: carried(x.genome, key), tiles: x.tiles }] : []));
}

/** The door is open: its parent is reached, it isn't, and its other requirements are met. */
export const doorOpen = (s: State, key: Key) => {
  const n = doorNode(key);
  return !s.reached.includes(n.id) && (!n.parent || s.reached.includes(n.parent)) && othersMet(s, n);
};

/** A living variant that carries this key and can split off, or -1. */
export const keyCarrier = (s: State, key: Key) =>
  s.variants.findIndex((x) => x.alive && x.genome.traits.includes(key.id) && !s.species[x.sp].genome.traits.includes(key.id));

/** For the tree screen and the variant rows: the recipe, the closest variant, the candidates and the carrier. */
export function keyProgress(s: State, key: Key) {
  const all = pool(s, key).sort((a, b) => b.k - a.k || b.tiles - a.tiles), best = all[0], carrier = keyCarrier(s, key);
  const g = best ? s.variants[best.v].genome : null;
  return {
    best: best ? variantName(s, best.v) : null,
    items: key.precursors.map((p) => ({ text: p.text, met: !!g && hasPrecursor(g, p) })),
    candidates: all.filter((c) => c.k === key.precursors.length).map((c) => variantName(s, c.v)),
    carrier, carrierName: carrier >= 0 ? variantName(s, carrier) : null,
  };
}

/** The recipe a variant is working toward: open doors its species can meet where it carries a precursor. */
export function recipesOf(s: State, v: number) {
  const x = s.variants[v];
  return KEYS.filter((k) => !s.reached.includes(k.node) && k.from.includes(cladeOf(s, x.sp) ?? '') && carried(x.genome, k) > 0)
    .map((k) => ({ key: k, items: k.precursors.map((p) => ({ text: p.text, met: hasPrecursor(x.genome, p) })) }));
}

/** Each check: candidates roll the key; with none, the nudge clock runs. `s.cands` lists every candidate. */
export function keyInnovations(s: State, P: Profile[], dt: number) {
  s.cands = [];
  for (const key of KEYS) {
    if (!doorOpen(s, key) || keyCarrier(s, key) >= 0 || !fromSpecies(s, key).length) continue;
    const all = pool(s, key), cands = all.filter((c) => c.k === key.precursors.length).sort((a, b) => b.tiles - a.tiles);
    const step = dt / 60;
    if (cands.length) {
      s.cands.push(...cands.map((c) => c.v));
      s.keyClock[key.id] = 0;
      const t = s.keyRoll[key.id] ?? 0, [w0, w1] = KEY.window;
      s.keyRoll[key.id] = t + step;
      if (t < w0 || (t + step < w1 && rand(s) >= KEY.rate * (t - w0) * step)) continue; // the last check before w1 forces it
      const g = copyGenome(s.variants[cands[0].v].genome);
      g.traits = [...g.traits, key.id].sort();
      const v = patchInto(s, P, cands[0].v, g);
      if (v < 0) continue;
      s.innovations[key.id] = s.tick;
      s.keyFrom[key.id] = { sp: s.variants[v].sp, form: variantName(s, v) };
      s.keyRoll[key.id] = 0;
      continue;
    }
    s.keyRoll[key.id] = 0;
    s.keyClock[key.id] = (s.keyClock[key.id] ?? 0) + step;
    if (s.keyClock[key.id] < KEY.nudge || !all.length) continue;
    s.keyClock[key.id] = 0;
    nudge(s, P, key, all.sort((a, b) => b.k - a.k || b.tiles - a.tiles));
  }
}

/** The closest variant gains its first missing precursor (one its species can carry) on a small patch. */
function nudge(s: State, P: Profile[], key: Key, ranked: { v: number }[]) {
  for (const { v } of ranked) {
    const x = s.variants[v], p = key.precursors.find((q) => !hasPrecursor(x.genome, q)
      && (!q.trait || defOf(s, x.sp).traits.some((t) => t.id === q.trait)));
    if (!p) continue;
    const g = copyGenome(x.genome);
    if (p.trait) g.traits = [...g.traits, p.trait].sort();
    else g.axes[AXIS_INDEX[p.axis!]] = p.step!;
    if (patchInto(s, P, v, g, KEY.nudgePatch) >= 0) return;
  }
}

/** A patch (radius r) of variant `from`'s tiles around one of them takes genome g. Returns the new variant. */
function patchInto(s: State, P: Profile[], from: number, g: Genome, r = KEY.patch): number {
  if (defOf(s, s.variants[from].sp).animal) return groupInto(s, P, from, g, r);
  const sp = s.variants[from].sp, n = s.w * s.h, k = stratumOf(s, sp), mine: number[] = [];
  for (let i = 0; i < n; i++) if (s.occ[k * n + i] === from && !s.dying[k * n + i]) mine.push(i);
  if (!mine.length) return -1;
  const v = variantFor(s, sp, g, P);
  if (v < 0) return -1;
  const i0 = mine[Math.floor(rand(s) * mine.length)], x0 = i0 % s.w, y0 = (i0 / s.w) | 0;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const xx = x0 + dx, y = y0 + dy, slot = k * n + y * s.w + xx;
    if (xx < 0 || y < 0 || xx >= s.w || y >= s.h) continue;
    if (s.occ[slot] >= 0 && s.variants[s.occ[slot]].sp === sp) {
      s.occ[slot] = v; s.lastCode[slot] = EV.mutated; s.lastTick[slot] = s.tick; s.variants[v].tiles++;
    }
  }
  if (!s.variants[v].shown && roomToShow(s, sp, v, true)) show(s, v);
  return v;
}

/** Animals: the variant's animals within r tiles of one of them take genome g. */
function groupInto(s: State, P: Profile[], from: number, g: Genome, r: number): number {
  const mine = s.agents.filter((a) => a.v === from);
  if (!mine.length) return -1;
  const sp = s.variants[from].sp, v = variantFor(s, sp, g, P);
  if (v < 0) return -1;
  const one = mine[Math.floor(rand(s) * mine.length)];
  for (const a of mine) if (Math.abs(a.x - one.x) <= r + 0.5 && Math.abs(a.y - one.y) <= r + 0.5) {
    a.v = v; s.variants[v].tiles++;
    a.log.push({ tick: s.tick, text: 'gained a gene on the spot' });
  }
  if (!s.variants[v].shown && roomToShow(s, sp, v, true)) show(s, v);
  return v;
}

/** Where a species branched off, for the tree: the species it split from and the variant it was. */
export function stemOf(s: State, sp: number): { sp: number; form: string } | null {
  const x = s.species[sp];
  return x.parent >= 0 ? { sp: x.parent, form: x.form } : null;
}
