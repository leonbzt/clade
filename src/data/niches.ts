// The 8 niches (a habitat kind × a layer), their weights on the stats, and the natives that hold them at the start.
// Weights: a positive weight rewards the stat, a negative one rewards its absence (score = Σ w·s, or |w|·(1 − s)),
// so the |weights| sum to 1 and a perfect fit scores 100.
import { BARE, FOREST, LAVA, WET } from './island';
import type { AttrId, Layer, StatId } from './genes';

// ---- pressures: one per niche; an attribute is the armour (slice 01, decided 3 Nov) ----
export type PressureId = 'heat' | 'drought' | 'shade' | 'wind' | 'flooding';
export const PRESSURES: Record<PressureId, { name: string; icon: string; armour: AttrId }> = {
  heat: { name: 'heat', icon: '🔥', armour: 'endurance' },
  drought: { name: 'drought', icon: '🏜️', armour: 'endurance' },
  shade: { name: 'shade', icon: '🌑', armour: 'shade' },
  wind: { name: 'wind', icon: '🌬️', armour: 'defence' },
  flooding: { name: 'flooding', icon: '🌊', armour: 'endurance' },
};
/** The score × a smooth ramp: `floor` with no armour, 1 at the niche's need. In the run, an unarmoured pressure
 * takes `runShare` of the energy income (Health's reserve first). */
export const PRESSURE = { floor: 0.4, runShare: 0.3 };

export type Niche = {
  id: number; key: string; name: string; kind: number; layer: Layer; w: Partial<Record<StatId, number>>; hint: string;
  pressure: PressureId; need: number; // armour pips for the full score
};

// Rows want opposite things: lean and tough vs lush and tall, low and wide vs tall, deep roots vs shallow.
export const NICHES: Niche[] = [
  { id: 0, key: 'lavaMat', name: 'Lava mat', kind: LAVA, layer: 0, w: { toughness: 0.35, roots: 0.25, growth: -0.2, cover: -0.2 }, hint: 'tough, gripping, slow, tight', pressure: 'heat', need: 5 },
  { id: 1, key: 'bareMat', name: 'Bare mat', kind: BARE, layer: 0, w: { cover: 0.45, reach: -0.3, roots: -0.25 }, hint: 'flat, wide, shallow', pressure: 'drought', need: 3 },
  { id: 2, key: 'wetMat', name: 'Wet mat', kind: WET, layer: 0, w: { reach: 0.45, growth: 0.3, toughness: -0.25 }, hint: 'soft cushions, fast', pressure: 'shade', need: 4 },
  { id: 3, key: 'bareHerb', name: 'Bare herb', kind: BARE, layer: 1, w: { roots: 0.4, toughness: 0.3, growth: -0.3 }, hint: 'deep roots, sturdy, slow', pressure: 'wind', need: 5 },
  { id: 4, key: 'wetHerb', name: 'Wet herb', kind: WET, layer: 1, w: { reach: 0.4, growth: 0.35, roots: -0.25 }, hint: 'tall and fast, shallow roots', pressure: 'flooding', need: 5 },
  { id: 5, key: 'forestHerb', name: 'Forest herb', kind: FOREST, layer: 1, w: { cover: 0.35, reach: -0.35, toughness: -0.3 }, hint: 'low, wide, soft: lives in shade', pressure: 'shade', need: 6 },
  { id: 6, key: 'forestCanopy', name: 'Forest canopy', kind: FOREST, layer: 2, w: { toughness: 0.5, growth: -0.3, reach: 0.2 }, hint: 'hardwood: tough and slow', pressure: 'wind', need: 7 },
  { id: 7, key: 'wetCanopy', name: 'Wet canopy', kind: WET, layer: 2, w: { growth: 0.4, toughness: -0.4, reach: 0.2 }, hint: 'softwood: fast and soft', pressure: 'flooding', need: 6 },
];

/** NICHE_AT[kind][layer]: the niche id, or -1 where a kind has no such layer. */
export const NICHE_AT: number[][] = [];
for (let k = 0; k < 6; k++) NICHE_AT.push([-1, -1, -1]);
for (const n of NICHES) NICHE_AT[n.kind][n.layer] = n.id;

/** Natives: fixed incumbents, one per niche, with a fixed score; a newcomer has to beat them. */
export const NATIVES: { niche: number; name: string; score: number; color: string }[] = [
  { niche: 0, name: 'Crust lichen', score: 30, color: '#a9a77a' },
  { niche: 1, name: 'Ash moss', score: 34, color: '#8a9a5a' },
  { niche: 2, name: 'Liverwort', score: 40, color: '#4f8a52' },
  { niche: 3, name: 'Wiry grass', score: 40, color: '#b0a860' },
  { niche: 4, name: 'Sedges', score: 45, color: '#5d8a3a' },
  { niche: 5, name: 'Ferns', score: 48, color: '#3f7a40' },
  { niche: 6, name: 'Pioneer trees', score: 50, color: '#2f5a32' },
  { niche: 7, name: 'Swamp trees', score: 45, color: '#355e45' },
];
