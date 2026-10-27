// The layers and the strata. Every layer is 0–1 per tile, with plain words for 0 and 1. Species read layers
// (needs) and write them (makes); they never name each other. A new layer is one entry here, plus the species
// that care about it. Rates are per second.

export const STRATA = ['under', 'ground', 'herb'] as const;
export type StratumId = (typeof STRATA)[number];
export const STRATUM_NAMES: Record<StratumId, string> = { under: 'Under ground', ground: 'Ground', herb: 'Herbs' };

export const LAYER_IDS = ['water', 'soil', 'nitrogen', 'shade', 'litter', 'salt'] as const;
export type LayerId = (typeof LAYER_IDS)[number];

type Common = { name: string; words: [string, string]; color: string; viewMax?: number }; // viewMax: the value shown at full colour
/** Recomputed from the current state; no memory. */
export type LevelDef = Common & {
  kind: 'level';
  wet?: boolean; // starts from the island's base wetness
  from?: Partial<Record<LayerId, number>>; // plus these layers × weight
  bleed?: number; // share mixed in from the neighbours, for soft edges
  readBelow?: StratumId; // only strata below this one feel it (shade falls on what's under the herbs)
};
/** Has memory: makes flow in, decay pulls it back to `rest`. */
export type StockDef = Common & {
  kind: 'stock';
  rest: number;
  decay: number; // per second, toward rest
  protect?: number; // plant cover slows the decay by up to this share (soil erodes when bare)
  diffuse?: number; // per second, toward the neighbours' mean
  capped?: boolean; // can't pass the tile's cap (thin soil on dry ground and sand)
};
export type BaseDef = Common & { kind: 'base' };
export type FieldDef = LevelDef | StockDef | BaseDef;

export const FIELDS: Record<LayerId, FieldDef> = {
  shade: { kind: 'level', name: 'Shade', words: ['open sky', 'deep shade'], color: '#8a5ad8', bleed: 0.2, readBelow: 'herb' },
  water: { kind: 'level', name: 'Water', words: ['dry', 'soaked'], color: '#3a8ae0', wet: true, from: { soil: 0.3, shade: 0.15 } },
  soil: { kind: 'stock', name: 'Soil', words: ['bare rock', 'deep soil'], color: '#a8703c', rest: 0, decay: 0.003, protect: 0.85, capped: true },
  nitrogen: { kind: 'stock', name: 'Nitrogen', words: ['none', 'rich'], color: '#5cc040', viewMax: 0.3, rest: 0.04, decay: 0.01, diffuse: 0.04 },
  litter: { kind: 'stock', name: 'Litter', words: ['clean', 'thick litter'], color: '#e0b030', viewMax: 0.3, rest: 0, decay: 0.003 },
  salt: { kind: 'base', name: 'Salt', words: ['fresh', 'salty'], color: '#e8eef4' },
};

/** Levels are computed in this order (water needs shade). */
export const LEVEL_ORDER: LayerId[] = ['shade', 'water'];
export const STOCK_ORDER: LayerId[] = ['soil', 'nitrogen', 'litter'];
