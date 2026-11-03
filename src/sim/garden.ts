// The garden: life per patch, one fixed step of 1 s. Three stocks (water, light, nutrient); one slot per layer
// (mat, herb, canopy) where the patch's kind has that niche. Inside a slot, species share the capacity by
// (score × fit)³ and grams move toward their share at a steady rate. Spread flows along borders. No DOM.
import { GARDEN } from '../data/garden';
import { NATIVES, NICHE_AT } from '../data/niches';
import type { Habitats, Patch } from './habitats';
import type { Species } from './species';

export interface Entry { sp: number; g: number; w: number } // w: the cached weight, (effective score / 100)³
export interface Life {
  slots: (Entry[] | null)[]; // per layer; null where the kind has no such niche
  cap: number[]; // grams the slot holds at most, per layer
  light: number[]; water: number; nutrient: number;
}
export interface Garden { t: number; life: Life[] }

export const NATIVE_OF: number[] = []; // niche → native species id
NATIVES.forEach((nv, id) => (NATIVE_OF[nv.niche] = id));

/** Water × (1 ± swing) over the half-year; > 1 is the wet half. */
export const halfYear = (t: number) => 1 + GARDEN.halfYear.swing * Math.sin((2 * Math.PI * t) / GARDEN.halfYear.period);

/** How well a species does on this patch's stocks (1 = all stocks full). Low upkeep bears shade; roots find water. */
export function fit(sp: Species, light: number, water: number, nutrient: number): number {
  const sn = sp.sn;
  const lightF = light + (1 - light) * 0.7 * (1 - sn[5]);
  const waterF = 0.5 + 0.5 * Math.min(1, water * (0.6 + 0.8 * sn[2]));
  const nutF = 0.6 + 0.4 * Math.min(1, nutrient + 0.5 * sn[2]);
  return lightF * waterF * nutF;
}

/** The score a species has here, after the stocks. */
export function effScore(sp: Species, p: Patch, life: Life, layer: number): number {
  const n = NICHE_AT[p.kind][layer];
  return n < 0 ? 0 : sp.scores[n] * fit(sp, life.light[layer], life.water, life.nutrient);
}

const weightOf = (sp: Species, p: Patch, life: Life, layer: number) => (effScore(sp, p, life, layer) / 100) ** 3;

export const cover = (p: Patch, life: Life, layer: number) => {
  const s = life.slots[layer];
  if (!s) return 0;
  let g = 0;
  for (const e of s) g += e.g;
  return g / (p.tiles.length * GARDEN.perTile[layer]);
};

/** Stocks, capacity and the cached weights. Every GARDEN.stockEvery seconds, and after a remap. */
export function refreshStocks(g: Garden, hab: Habitats, species: Species[]) {
  const wet = halfYear(g.t);
  for (const p of hab.patches) {
    const life = g.life[p.id], cC = Math.min(1, cover(p, life, 2)), cH = Math.min(1, cover(p, life, 1));
    life.water = p.water * wet;
    life.light[2] = 1;
    life.light[1] = 1 - GARDEN.canopyShade * cC;
    life.light[0] = life.light[1] * (1 - GARDEN.herbShade * cH);
    let litter = 0, layers = 0;
    for (let l = 0; l < 3; l++) if (life.slots[l]) { litter += Math.min(1, cover(p, life, l)); layers++; }
    life.nutrient = Math.min(1.2, 0.9 * p.soil + 0.3 * (layers ? litter / layers : 0));
    for (let l = 0; l < 3; l++) {
      const slot = life.slots[l];
      if (!slot) { life.cap[l] = 0; continue; }
      life.cap[l] = p.tiles.length * GARDEN.perTile[l] * life.light[l]
        * (0.3 + 0.7 * Math.min(1, life.water)) * (0.4 + 0.6 * Math.min(1, life.nutrient));
      for (const e of slot) e.w = weightOf(species[e.sp], p, life, l);
    }
  }
}

/** Empty life for a patch: a slot per niche its kind has, each held by its native at full capacity (once stocked). */
export function emptyLife(p: Patch): Life {
  return {
    slots: [0, 1, 2].map((l) => (NICHE_AT[p.kind][l] >= 0 ? [] : null)), cap: [0, 0, 0], light: [1, 1, 1], water: p.water, nutrient: p.soil,
  };
}

/** Fill empty slots with their native at capacity (a new island, or a niche that just appeared). */
export function seedNatives(g: Garden, hab: Habitats, species: Species[]) {
  refreshStocks(g, hab, species);
  for (const p of hab.patches) {
    const life = g.life[p.id];
    life.slots.forEach((slot, l) => {
      if (!slot) return;
      const nat = NATIVE_OF[NICHE_AT[p.kind][l]];
      if (!slot.some((e) => e.sp === nat)) slot.push({ sp: nat, g: slot.length ? GARDEN.dieBelow : life.cap[l], w: 0 });
    });
  }
  refreshStocks(g, hab, species);
}

export function newGarden(hab: Habitats, species: Species[]): Garden {
  const g: Garden = { t: 0, life: hab.patches.map(emptyLife) };
  seedNatives(g, hab, species);
  return g;
}

/** One second of garden. Returns the grams your lines hold (for biomass and sprouts). */
export function gardenStep(g: Garden, hab: Habitats, species: Species[]): number {
  g.t++;
  if (g.t % GARDEN.stockEvery === 0) refreshStocks(g, hab, species);
  if (g.t % GARDEN.spreadEvery === 0) spread(g, hab, species);
  const { rate, maxGrow, seedGrow, dieBelow } = GARDEN;
  let yours = 0;
  for (let pi = 0; pi < g.life.length; pi++) {
    const life = g.life[pi];
    for (let l = 0; l < 3; l++) {
      const slot = life.slots[l];
      if (!slot || !slot.length) continue;
      let sw = 0;
      for (let k = 0; k < slot.length; k++) sw += slot[k].w;
      const per = sw > 0 ? life.cap[l] / sw : 0;
      for (let k = slot.length - 1; k >= 0; k--) {
        const e = slot[k];
        let dg = rate * (e.w * per - e.g);
        if (dg > 0) { const most = e.g * maxGrow + seedGrow; if (dg > most) dg = most; }
        e.g += dg;
        const sp = species[e.sp];
        if (sp.native) { if (e.g < dieBelow) e.g = dieBelow; }
        else if (e.g < dieBelow) { slot.splice(k, 1); continue; }
        else yours += e.g;
      }
    }
  }
  return yours;
}

/** Your lines spread: a share of grams flows to neighbour patches that have the same layer. Natives don't move. */
function spread(g: Garden, hab: Habitats, species: Species[]) {
  const k = GARDEN.spread * GARDEN.spreadEvery;
  const moves: [number, number, number, number][] = []; // to patch, layer, species, grams
  for (const p of hab.patches) {
    const life = g.life[p.id];
    for (let l = 0; l < 3; l++) {
      const slot = life.slots[l];
      if (!slot) continue;
      for (const e of slot) {
        const sp = species[e.sp];
        if (sp.native) continue;
        const out = e.g * k * (0.3 + sp.sn[1]);
        let sent = 0;
        for (let j = 0; j < p.nb.length; j++) {
          const q = p.nb[j];
          if (!g.life[q].slots[l]) continue;
          const amt = out * p.nbW[j];
          moves.push([q, l, e.sp, amt]);
          sent += amt;
        }
        e.g -= sent;
      }
    }
  }
  for (const [q, l, s, amt] of moves) {
    const slot = g.life[q].slots[l]!, e = slot.find((x) => x.sp === s);
    if (e) e.g += amt;
    else if (amt >= GARDEN.dieBelow) slot.push({ sp: s, g: amt, w: weightOf(species[s], hab.patches[q], g.life[q], l) });
  }
}

/** Put grams of a species into a patch's slot (a release). */
export function addGrams(g: Garden, hab: Habitats, species: Species[], patch: number, layer: number, sp: number, grams: number) {
  const slot = g.life[patch].slots[layer];
  if (!slot) return false;
  const e = slot.find((x) => x.sp === sp);
  if (e) e.g += grams;
  else slot.push({ sp, g: grams, w: weightOf(species[sp], hab.patches[patch], g.life[patch], layer) });
  return true;
}

/** The species holding the most grams in a slot, or -1. */
export function holder(slot: Entry[] | null): number {
  if (!slot || !slot.length) return -1;
  let best = slot[0];
  for (const e of slot) if (e.g > best.g) best = e;
  return best.sp;
}
