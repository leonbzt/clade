// Succession: life builds soil; soil turns Lava → Bare ground → Forest floor. When a tile changes kind the habitats
// are found again and the grams move with their tiles (by area) into the new patches' slots of the same layer.
import { GARDEN } from '../data/garden';
import { KIND_NAMES, SUCCESSION } from '../data/island';
import { NICHE_AT } from '../data/niches';
import { emptyLife, refreshStocks, seedNatives, type Garden } from './garden';
import { findHabitats, refreshSoil, type Habitats } from './habitats';
import { kindOf, type Island } from './island';
import type { Species } from './species';

export interface KindChange { tiles: number; from: string; to: string }

/** Every SUCCESSION.every seconds. Returns the new habitats if any tile changed kind (else null), and what changed. */
export function succession(isl: Island, hab: Habitats, g: Garden, species: Species[]): { hab: Habitats; changes: KindChange[] } | null {
  const dt = SUCCESSION.every, changed: number[] = [], flip = g.t % SUCCESSION.flipEvery === 0;
  for (const p of hab.patches) {
    const life = g.life[p.id];
    let rate = 0;
    for (let l = 0; l < 3; l++) {
      if (p.soil >= SUCCESSION.cap[l]) continue;
      const slot = life.slots[l];
      if (!slot) continue;
      let gr = 0;
      for (const e of slot) gr += species[e.sp].native ? e.g * SUCCESSION.native : e.g;
      rate += Math.min(1, gr / (p.tiles.length * GARDEN.perTile[l])) * SUCCESSION.rate[l];
    }
    if (rate <= 0) continue;
    for (const t of p.tiles) if (!isl.hot[t]) isl.soil[t] = Math.min(SUCCESSION.max, isl.soil[t] + rate * dt);
  }
  refreshSoil(isl, hab);
  if (!flip) return null;
  for (const p of hab.patches) {
    for (const t of p.tiles) {
      if (kindOf(isl, t) !== isl.kind[t]) changed.push(t);
    }
  }
  if (!changed.length) return null;
  const count = new Map<string, KindChange>();
  for (const t of changed) {
    const from = KIND_NAMES[isl.kind[t]], to = KIND_NAMES[kindOf(isl, t)], key = from + to;
    count.set(key, { from, to, tiles: (count.get(key)?.tiles ?? 0) + 1 });
    isl.kind[t] = kindOf(isl, t);
  }
  return { hab: remap(isl, hab, g, species), changes: [...count.values()] };
}

/** New habitats for the island's tiles; the garden's grams follow their tiles. Mutates `g.life`. */
export function remap(isl: Island, old: Habitats, g: Garden, species: Species[]): Habitats {
  const hab = findHabitats(isl), life = hab.patches.map(emptyLife);
  for (const p of old.patches) {
    const before = g.life[p.id];
    for (let l = 0; l < 3; l++) {
      const slot = before.slots[l];
      if (!slot) continue;
      for (const e of slot) {
        const per = e.g / p.tiles.length;
        for (const t of p.tiles) {
          const q = hab.of[t];
          if (q < 0) continue;
          const nslot = life[q].slots[l], niche = NICHE_AT[hab.patches[q].kind][l];
          if (!nslot || species[e.sp].scores[niche] < 0) continue;
          const f = nslot.find((x) => x.sp === e.sp);
          if (f) f.g += per; else nslot.push({ sp: e.sp, g: per, w: 0 });
        }
      }
    }
  }
  for (const L of life) for (const slot of L.slots) if (slot) for (let k = slot.length - 1; k >= 0; k--) if (slot[k].g < GARDEN.dieBelow && !species[slot[k].sp].native) slot.splice(k, 1);
  g.life = life;
  seedNatives(g, hab, species);
  refreshStocks(g, hab, species);
  return hab;
}
