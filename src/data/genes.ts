// The genome (8 attributes), the body's look, forms, stats and tiers: shared by the run and the garden.

// ---- the genome: 8 attributes, each 0–10 pips, by CSR corner (slice 01) ----
export type AttrId = 'stature' | 'roots' | 'shade' | 'endurance' | 'defence' | 'health' | 'pace' | 'spread';
export type Corner = 'C' | 'S' | 'R';
export const MAX_PIPS = 10;
export const ATTRS: { id: AttrId; name: string; corner: Corner; help: string }[] = [
  { id: 'stature', name: 'Stature', corner: 'C', help: 'longer segments, a stronger main tip' },
  { id: 'roots', name: 'Roots', corner: 'C', help: 'more growth below ground, a wider soil reveal' },
  { id: 'shade', name: 'Shade', corner: 'S', help: 'broad leaves, less light lost to shade; armour against shade' },
  { id: 'endurance', name: 'Endurance', corner: 'S', help: 'armour against heat, drought and flooding' },
  { id: 'defence', name: 'Defence', corner: 'S', help: 'thicker, darker stems; armour against wind' },
  { id: 'health', name: 'Health', corner: 'S', help: 'a reserve that takes pressure damage first; the garden loses grams more slowly' },
  { id: 'pace', name: 'Pace', corner: 'R', help: 'bigger leaves, more energy per leaf, more upkeep; faster in the garden' },
  { id: 'spread', name: 'Spread', corner: 'R', help: 'spreads faster along borders; sprouts come more often' },
];
export type Genes = number[]; // pips 0..MAX_PIPS, in ATTRS order
const IDX = Object.fromEntries(ATTRS.map((a, i) => [a.id, i])) as Record<AttrId, number>;
export const attrIndex = (id: AttrId) => IDX[id];
export const attr = (g: Genes, id: AttrId) => (IDX[id] < g.length ? g[IDX[id]] : 0); // natives have no genome
/** The level: the total number of pips. */
export const level = (g: Genes) => g.reduce((s, v) => s + v, 0);
export const FOUNDER_GENES: Genes = ATTRS.map(() => 1);
export const FOUNDER_LEVEL = level(FOUNDER_GENES);

/** What a pip does, beyond the look. Per pip unless said. Tuned by feel. */
export const RULES = {
  pace: { leafRate: 0.06, upkeep: 0.04, garden: 0.08 }, // run: leaf energy and upkeep ×(1 + k·pips); garden speed
  roots: { revealAt: [4, 8] }, // the soil reveal grows by a cell at each
  shade: { lift: 0.06 }, // the share of the light grid's shade lifted per pip
  health: { reserve: 0.6, garden: 0.1 }, // energy per pip per tenth of a year that takes pressure damage first; slower loss
  spread: { garden: 0.15, sprouts: 0.08 }, // spread along borders and the sprout clock ×(1 + k·pips)
  upkeep: { run: 0.04, garden: 0.03 }, // each pip above the founder's level: run upkeep +k; garden fit −k × poorness
};

/** The body's look from the attributes: each shape number from its attribute's pips (0 → lo, 10 → hi). */
export type ShapeId = 'internode' | 'angle' | 'buds' | 'dominance' | 'leaf' | 'breadth' | 'rootShare' | 'dive' | 'thickness' | 'tint';
export const SHAPES: Record<ShapeId, { from: AttrId | null; lo: number; hi: number }> = {
  internode: { from: 'stature', lo: 6, hi: 14 }, // segment length
  dominance: { from: 'stature', lo: 0.3, hi: 1 }, // buds stay dormant
  leaf: { from: 'pace', lo: 2.4, hi: 5.5 }, // leaf size
  buds: { from: 'pace', lo: 0.45, hi: 0.9 }, // buds per segment
  breadth: { from: 'shade', lo: 0.6, hi: 1.7 }, // leaf breadth (look only)
  rootShare: { from: 'roots', lo: 0.3, hi: 0.75 }, // growth sent below ground (moss: to rhizoids)
  dive: { from: 'roots', lo: 0.3, hi: 1 }, // roots go sideways (low) or down (high); moss: crack grip
  thickness: { from: 'defence', lo: 1, hi: 2.2 }, // stem thickness (tree: wood)
  tint: { from: 'defence', lo: 0, hi: 1 }, // stems darken toward red-brown (look only)
  angle: { from: null, lo: 45, hi: 45 }, // branch angle
};
export const shape = (g: Genes, id: ShapeId) => {
  const s = SHAPES[id], t = s.from ? Math.min(MAX_PIPS, attr(g, s.from)) / MAX_PIPS : 0.5;
  return s.lo + (s.hi - s.lo) * t;
};

// ---- forms and layers ----
export type FormId = 'moss' | 'herb' | 'tree';
export type Layer = 0 | 1 | 2; // mat, herb, canopy
export const LAYER_NAMES = ['mat', 'herb', 'canopy'] as const;
export const FORMS: Record<FormId, {
  name: string; layer: Layer; years: number; yearTicks: number; next: FormId | null; blurb: string;
}> = {
  moss: { name: 'Moss', layer: 0, years: 3, yearTicks: 600, next: 'herb', blurb: 'A low mat: creeps and stacks cushions. Spores each year.' },
  herb: { name: 'Herb', layer: 1, years: 4, yearTicks: 900, next: 'tree', blurb: 'Shoots, leaves, roots. Seeds each year.' },
  // until part 2 (the tree thins), a tree runs like the herb
  tree: { name: 'Tree', layer: 2, years: 4, yearTicks: 600, next: null, blurb: 'Wood and leaves. Seeds each year (for now).' },
};
export const FORM_IDS: FormId[] = ['moss', 'herb', 'tree'];

// ---- stats: 6, measured from the body; each scaled to 0..1 by its form ----
export type StatId = 'reach' | 'cover' | 'roots' | 'toughness' | 'growth' | 'upkeep';
export const STATS: StatId[] = ['reach', 'cover', 'roots', 'toughness', 'growth', 'upkeep'];
export const STAT_NAMES: Record<StatId, string> = {
  reach: 'Reach', cover: 'Cover', roots: 'Roots', toughness: 'Toughness', growth: 'Growth', upkeep: 'Upkeep',
};
/** The raw value that counts as 1.0, per form (a mat's reach is a cushion's height). Tuned by feel. */
export const STAT_SCALE: Record<FormId, Record<StatId, number>> = {
  moss: { reach: 30, cover: 500, roots: 120, toughness: 2, growth: 10, upkeep: 8 }, // roots: rhizoid length
  herb: { reach: 400, cover: 400, roots: 14, toughness: 3.5, growth: 16, upkeep: 14 },
  tree: { reach: 420, cover: 500, roots: 10, toughness: 5, growth: 12, upkeep: 16 },
};

// ---- tiers ----
export const TIERS: [string, number][] = [['S', 85], ['A', 70], ['B', 55], ['C', 40], ['D', 25], ['F', 0]];
export const tierOf = (score: number) => TIERS.find(([, min]) => score >= min)![0];
export const tierIndex = (score: number) => TIERS.findIndex(([, min]) => score >= min); // 0 = S … 5 = F
export const B_TIER = 55;
