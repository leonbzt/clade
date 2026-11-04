// The garden: life per patch, one fixed step of 1 s. Three stocks (water, light, nutrient); one slot per layer
// (mat, herb, canopy) where the patch's kind has that niche. Inside a slot, species share the capacity by
// (score × fit)³ and grams move toward their share at a steady rate. Spread flows along borders. No DOM.
import { GARDEN } from '../data/garden';
import { FOUNDER_LEVEL, RULES, attr, level } from '../data/genes';
import { NATIVES, NICHES, NICHE_AT, PRESSURES } from '../data/niches';
import type { Habitats, Patch } from './habitats';
import { ramp, type Species } from './species';

export interface Entry { sp: number; g: number; w: number } // w: the cached weight, (effective score / 100)³
export interface Life {
  slots: (Entry[] | null)[]; // per layer; null where the kind has no such niche
  cap: number[]; // grams the slot holds at most, per layer
  light: number[]; water: number; nutrient: number;
}
export interface Garden {
  t: number; life: Life[];
  seedy: number; // your grams × Spread, for the sprout clock
  fx?: Float64Array; // per species: Pace's speed, Health's hold, Spread's sprout weight (a cache, not saved)
}

/** The per-species factors the step reads, rebuilt when a species is added. */
function factors(g: Garden, species: Species[]): Float64Array {
  if (g.fx && g.fx.length === species.length * 3) return g.fx;
  const fx = new Float64Array(species.length * 3);
  species.forEach((sp, i) => {
    fx[i * 3] = 1 + RULES.pace.garden * attr(sp.genes, 'pace');
    fx[i * 3 + 1] = 1 / (1 + RULES.health.garden * attr(sp.genes, 'health'));
    fx[i * 3 + 2] = 1 + RULES.spread.sprouts * attr(sp.genes, 'spread');
  });
  return (g.fx = fx);
}

export const NATIVE_OF: number[] = []; // niche → native species id
NATIVES.forEach((nv, id) => (NATIVE_OF[nv.niche] = id));

/** Water × (1 ± swing) over the half-year; > 1 is the wet half. */
export const halfYear = (t: number) => 1 + GARDEN.halfYear.swing * Math.sin((2 * Math.PI * t) / GARDEN.halfYear.period);

/** How well a species does on this patch's stocks (1 = all stocks full). Low upkeep and Shade bear shade; roots
 * find water; each pip above the founder's level costs on poor stocks (a big genome starves there). */
export function fitParts(sp: Species, light: number, water: number, nutrient: number): [number, number, number, number] {
  const sn = sp.sn, g = sp.genes, bear = Math.min(1, 0.7 * (1 - sn[5]) + RULES.shade.lift * attr(g, 'shade'));
  const poor = Math.max(0, Math.min(1, 1 - (Math.min(1, water) + Math.min(1, nutrient)) / 2));
  return [
    light + (1 - light) * bear,
    0.5 + 0.5 * Math.min(1, water * (0.6 + 0.8 * sn[2])),
    0.6 + 0.4 * Math.min(1, nutrient + 0.5 * sn[2]),
    Math.max(0.3, 1 - RULES.upkeep.garden * Math.max(0, level(g) - FOUNDER_LEVEL) * poor),
  ];
}
export function fit(sp: Species, light: number, water: number, nutrient: number): number {
  const [a, b, c, d] = fitParts(sp, light, water, nutrient);
  return a * b * c * d;
}

/** Why a species scores less here: the pressure ("heat −40%") or the stock that costs it most ("shaded −20%"). */
export function why(sp: Species, life: Life, layer: number, niche = -1): string {
  const f = fitParts(sp, life.light[layer], life.water, life.nutrient), k = f.indexOf(Math.min(...f));
  const n = niche >= 0 && !sp.native ? NICHES[niche] : null, r = n ? ramp(sp.genes, n) : 1;
  if (n && r < 0.93 && r <= f[k]) return `${PRESSURES[n.pressure].icon} ${n.pressure} −${Math.round((1 - r) * 100)}%`;
  return f[k] > 0.93 ? '' : `${['shaded', 'dry', 'poor soil', 'costly genome'][k]} −${Math.round((1 - f[k]) * 100)}%`;
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
  const g: Garden = { t: 0, life: hab.patches.map(emptyLife), seedy: 0 };
  seedNatives(g, hab, species);
  return g;
}

/** One second of garden. Returns the grams your lines hold (for biomass and sprouts). */
export function gardenStep(g: Garden, hab: Habitats, species: Species[]): number {
  g.t++;
  if (g.t % GARDEN.stockEvery === 0) refreshStocks(g, hab, species);
  if (g.t % GARDEN.spreadEvery === 0) spread(g, hab, species);
  const { rate, maxGrow, seedGrow, dieBelow } = GARDEN;
  const fx = factors(g, species);
  let yours = 0, seedy = 0;
  for (let pi = 0; pi < g.life.length; pi++) {
    const life = g.life[pi];
    for (let l = 0; l < 3; l++) {
      const slot = life.slots[l];
      if (!slot || !slot.length) continue;
      let sw = 0, sg = 0;
      for (let k = 0; k < slot.length; k++) { sw += slot[k].w; sg += slot[k].g; }
      const per = sw > 0 ? life.cap[l] / sw : 0;
      // Losers give way only as the slot fills: a small newcomer doesn't empty a patch, it crowds it.
      const crowd = Math.min(1, Math.max(0, (sg / (life.cap[l] || 1) - GARDEN.crowd) / (1 - GARDEN.crowd)));
      for (let k = slot.length - 1; k >= 0; k--) {
        const e = slot[k], sp = species[e.sp], pace = fx[e.sp * 3]; // Pace: faster both ways; Health: loses slower
        let dg = rate * pace * (e.w * per - e.g);
        if (dg > 0) { const most = (e.g * maxGrow + seedGrow) * pace; if (dg > most) dg = most; }
        else dg *= crowd * fx[e.sp * 3 + 1];
        e.g += dg;
        if (sp.native) { if (e.g < dieBelow) e.g = dieBelow; }
        else if (e.g < dieBelow) { slot.splice(k, 1); continue; }
        else { yours += e.g; seedy += e.g * fx[e.sp * 3 + 2]; }
      }
    }
  }
  g.seedy = seedy;
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
        const out = e.g * k * (0.3 + sp.sn[1]) * (1 + RULES.spread.garden * attr(sp.genes, 'spread'));
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
