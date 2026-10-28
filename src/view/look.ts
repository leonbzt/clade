// How a variant looks: its base species' painter, its trait genes, and a tint from its species' base genome and hue
// (by species, not by variant, so the map doesn't break into patches). Shared by the sprites, the ground cover and
// the specimen. Variant colours live in the Variants view.
import { AXIS_INDEX } from '../data/genes';
import { VARIANT_TINT } from '../data/view';
import type { State } from '../sim/state';
import { defOf, poolOf, type Genome } from '../sim/variants';
import { tintKey, type Tint } from './pixels';

export type VariantLook = { species: string; traits: string[]; tint: Tint; key: string };

export function tintOf(hue: number, g: Genome): Tint {
  const T = VARIANT_TINT, a = g.axes;
  return { hue: hue + T.dryHue * a[AXIS_INDEX.dry], light: T.shadeLight * a[AXIS_INDEX.shade], sat: T.leanSat * a[AXIS_INDEX.lean] };
}

export function genomeLook(s: State, sp: number, g: Genome): VariantLook {
  const tint = tintOf(s.species[sp].hue, s.species[sp].genome), species = defOf(s, sp).id;
  return { species, traits: g.traits, tint, key: `${species}|${g.traits.join(',')}|${tintKey(tint)}` };
}

const cache = new WeakMap<State, Map<number, { born: number; key: string; look: VariantLook }>>();

/** A variant's look, cached per variant entry (checked by birth tick and genome, since entries are reused). */
export function lookOf(s: State, v: number): VariantLook {
  let m = cache.get(s);
  if (!m) cache.set(s, (m = new Map()));
  const x = s.variants[v], hit = m.get(v);
  if (hit && hit.born === x.born && hit.key === x.key) return hit.look;
  const look = genomeLook(s, x.sp, x.genome);
  m.set(v, { born: x.born, key: x.key, look });
  return look;
}

/** A species as it looks now: its biggest variant, or its base genome when it has none on the map. */
export function speciesLook(s: State, sp: number): VariantLook {
  const pool = poolOf(s, sp);
  return pool.length ? lookOf(s, pool[0]) : genomeLook(s, sp, s.species[sp].genome);
}
