// Real units for display only: the sim keeps its layers near 0–1 and its masses in grams, and these turn them into
// cm, %, g/m², hectares, real counts and years. Every conversion lives here, so a unit changes in one edit. Rough
// round numbers on purpose; estimates are marked.
import type { LayerId } from './fields';
import { LITTER_MASS, NITROGEN_MASS } from './masses';
import { NUM } from './numbers';

/** Game seconds in a year: a year ≈ 8 min (your call, 1 Nov; a display conversion until the clock). */
export const YEAR_S = 480;
/** Soil depth at soil 1 ("deep soil"), in cm. Estimate: young volcanic soils are a few cm to a few tens deep. */
export const SOIL_CM = 30;
/** Moisture at water 1 ("soaked"), in % of the soil's volume. Estimate: a soaked soil holds about half its volume. */
export const SOAKED_PCT = 50;

export const soilCm = (v: number) => v * SOIL_CM;
export const moisturePct = (water: number) => water * SOAKED_PCT;
/** Light reaching the ground, in % of open sky (estimate: shade 1 lets nothing through). */
export const lightPct = (shade: number) => (1 - shade) * 100;
/** Nitrogen and litter layers, in g/m². */
export const nitrogenG = (v: number) => v * NITROGEN_MASS;
export const litterG = (v: number) => v * LITTER_MASS;
/** How many years of fall a litter stock holds: stock ÷ (fall per second × a year). Same units for both. */
export const yearsOfFall = (stock: number, fallPerSec: number) => (fallPerSec > 0 ? stock / (fallPerSec * YEAR_S) : Infinity);

/** A tile's side, in m (a tile is NUM.mass.tile m²). */
export const TILE_M = Math.sqrt(NUM.mass.tile);
/** Tiles to m² and hectares. */
export const areaM2 = (tiles: number) => tiles * NUM.mass.tile;
export const hectares = (tiles: number) => `${sig(areaM2(tiles) / 1e4)} ha`;

/** Two significant digits, as a plain number: 0.042, 4.2, 420, 4200. */
export const sig = (v: number) => (v ? String(+v.toPrecision(2)) : '0');

/** Real mass, two significant digits: "0.40 mg", "40 g", "1.2 kg", "3.5 t". */
export function grams(g: number): string {
  if (g < 0) return `−${grams(-g)}`;
  if (!g) return '0 g';
  const [v, unit] = g >= 1e6 ? [g / 1e6, 't'] : g >= 1e3 ? [g / 1e3, 'kg'] : g >= 1 ? [g, 'g'] : [g * 1e3, 'mg'];
  return `${v >= 100 ? Math.round(v / 10) * 10 : v >= 10 ? Math.round(v) : v >= 1 ? v.toFixed(1) : v.toPrecision(2)} ${unit}`;
}

/** A real count, two significant digits: "7", "2 400", "40 000", "1.2 million". */
export function count(n: number): string {
  if (n >= 1e12) return `${sig(n / 1e12)} trillion`;
  if (n >= 1e9) return `${sig(n / 1e9)} billion`;
  if (n >= 1e6) return `${sig(n / 1e6)} million`;
  if (n < 10) return sig(n);
  return Math.round(+n.toPrecision(2)).toLocaleString('en').replace(/,/g, '\u00a0');
}

/** "+4.2 g/m²", "−30%": a sign, then the size. */
const signed = (d: number, abs: (a: number) => string) => `${d > 0 ? '+' : d < 0 ? '−' : ''}${abs(Math.abs(d))}`;

/** Each layer in real units: the name it shows under, its value, and a part of it (a level's term, or a stock's
 * change per second). Shade shows as light (`inverse`), so its parts take light away. */
type Unit = { name: string; value: (v: number) => string; part: (d: number) => string; inverse?: boolean };
export const LAYER_UNITS: Record<LayerId, Unit> = {
  shade: { name: 'Light', inverse: true, value: (v) => `${Math.round(lightPct(v))}%`, part: (d) => signed(-d, (a) => `${sig(a * 100)}%`) },
  water: { name: 'Moisture', value: (v) => `${Math.round(moisturePct(v))}%`, part: (d) => signed(d, (a) => `${sig(moisturePct(a))}%`) },
  soil: { name: 'Soil', value: (v) => `${sig(soilCm(v))} cm`, part: (d) => signed(d, (a) => `${sig(soilCm(a))} cm`) },
  nitrogen: { name: 'Nitrogen', value: (v) => `${grams(nitrogenG(v))}/m²`, part: (d) => signed(d, (a) => `${grams(nitrogenG(a))}/m²`) },
  litter: { name: 'Litter', value: (v) => `${grams(litterG(v))}/m²`, part: (d) => signed(d, (a) => `${grams(litterG(a))}/m²`) },
};

/** A need's value in real units: "light 70%", "moisture 22%", "soil 8 cm". */
export const needText = (id: LayerId, v: number) => `${LAYER_UNITS[id].name.toLowerCase()} ${LAYER_UNITS[id].value(v)}`;
