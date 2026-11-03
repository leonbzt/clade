// Genes, forms, stats and tiers: shared by the run and the garden. From the grow toy (slices 00, 00b).

// ---- genes: 8, each 1–9 pips ----
export type GeneId = 'internode' | 'angle' | 'buds' | 'dominance' | 'leaf' | 'rootShare' | 'dive' | 'thickness';
export const PIPS = 9;
export const GENES: { id: GeneId; name: string; lo: number; hi: number; help: string; moss?: string }[] = [
  { id: 'internode', name: 'Internode', lo: 4, hi: 12, help: 'segment length' },
  { id: 'angle', name: 'Angle', lo: 15, hi: 80, help: 'branch angle' },
  { id: 'buds', name: 'Buds', lo: 0.15, hi: 1, help: 'buds per segment; more offers' },
  { id: 'dominance', name: 'Dominance', lo: 0, hi: 1, help: 'buds stay dormant; the main tip is offered' },
  { id: 'leaf', name: 'Leaf', lo: 1, hi: 5, help: 'leaf size' },
  { id: 'rootShare', name: 'Root share', lo: 0.15, hi: 0.7, help: 'growth sent below ground', moss: 'growth sent to rhizoids' },
  { id: 'dive', name: 'Dive', lo: 0, hi: 1, help: 'roots go sideways (low) or down (high)', moss: 'crack grip: rhizoid depth' },
  { id: 'thickness', name: 'Thickness', lo: 0.6, hi: 2, help: 'stem thickness (tree: wood)' },
];
export type Genes = number[]; // pips 1..PIPS, in GENES order
const IDX = Object.fromEntries(GENES.map((g, i) => [g.id, i])) as Record<GeneId, number>;
export const geneIndex = (id: GeneId) => IDX[id];
export const gene = (g: Genes, id: GeneId) => {
  const d = GENES[IDX[id]];
  return d.lo + ((d.hi - d.lo) * (g[IDX[id]] - 1)) / (PIPS - 1);
};
export const BASE_GENES: Genes = GENES.map(() => 5);

// ---- forms and layers ----
export type FormId = 'moss' | 'herb' | 'tree';
export type Layer = 0 | 1 | 2; // mat, herb, canopy
export const LAYER_NAMES = ['mat', 'herb', 'canopy'] as const;
export const FORMS: Record<FormId, {
  name: string; layer: Layer; seasons: number; seasonTicks: number; next: FormId | null; blurb: string;
}> = {
  moss: { name: 'Moss', layer: 0, seasons: 4, seasonTicks: 600, next: 'herb', blurb: 'A low mat: creeps and stacks cushions. Spores each season.' },
  herb: { name: 'Herb', layer: 1, seasons: 5, seasonTicks: 900, next: 'tree', blurb: 'Shoots, leaves, roots. Seeds each season.' },
  tree: { name: 'Tree', layer: 2, seasons: 8, seasonTicks: 600, next: null, blurb: 'One body: wood each winter, leaves each spring.' },
};
export const FORM_IDS: FormId[] = ['moss', 'herb', 'tree'];

// ---- stats: 6, measured from the body; each scaled to 0..1 by its form ----
export type StatId = 'reach' | 'spread' | 'roots' | 'toughness' | 'growth' | 'upkeep';
export const STATS: StatId[] = ['reach', 'spread', 'roots', 'toughness', 'growth', 'upkeep'];
export const STAT_NAMES: Record<StatId, string> = {
  reach: 'Reach', spread: 'Spread', roots: 'Roots', toughness: 'Toughness', growth: 'Growth', upkeep: 'Upkeep',
};
/** The raw value that counts as 1.0, per form (a mat's reach is a cushion's height). Tuned by feel. */
export const STAT_SCALE: Record<FormId, Record<StatId, number>> = {
  moss: { reach: 30, spread: 700, roots: 30, toughness: 1.6, growth: 4, upkeep: 4 },
  herb: { reach: 300, spread: 260, roots: 8, toughness: 2.6, growth: 10, upkeep: 12 },
  tree: { reach: 420, spread: 500, roots: 10, toughness: 5, growth: 12, upkeep: 16 },
};

// ---- tiers ----
export const TIERS: [string, number][] = [['S', 85], ['A', 70], ['B', 55], ['C', 40], ['D', 25], ['F', 0]];
export const tierOf = (score: number) => TIERS.find(([, min]) => score >= min)![0];
export const tierIndex = (score: number) => TIERS.findIndex(([, min]) => score >= min); // 0 = S … 5 = F
export const B_TIER = 55;
