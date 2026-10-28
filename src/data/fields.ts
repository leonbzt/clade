// The layers, the statuses and the strata. Every layer is 0–1 per tile, with plain words for 0 and 1. Species read
// layers (needs) and write them (makes); they never name each other. A new layer is one entry here, plus the
// species that care about it. Rates are per second.

export const STRATA = ['under', 'ground', 'herb'] as const;
export type StratumId = (typeof STRATA)[number];
export const STRATUM_NAMES: Record<StratumId, string> = { under: 'Under ground', ground: 'Ground', herb: 'Herbs' };

export const LAYER_IDS = ['water', 'soil', 'nitrogen', 'shade', 'litter'] as const;
export type LayerId = (typeof LAYER_IDS)[number];

// hidden: no map view, tile card only. viewMax: the value shown at full colour.
type Common = { name: string; words: [string, string]; color: string; hidden?: boolean; viewMax?: number };
/** Recomputed from the current state; no memory. */
export type LevelDef = Common & {
  kind: 'level';
  from?: Partial<Record<LayerId, number>>; // the island's base value (terrain, landmarks) plus these layers × weight
  bleed?: number; // share mixed in from the neighbours, for soft edges
  readBelow?: StratumId; // only strata below this one feel it (shade falls on what's under the herbs)
};
/** Has memory: makes flow in, decay pulls it back to `rest`. Small rates make big, slow stores. */
export type StockDef = Common & {
  kind: 'stock';
  rest: number;
  decay: number; // per second, toward rest
  protect?: number; // plant cover slows the decay by up to this share (soil erodes when bare)
  diffuse?: number; // per second, toward the neighbours' mean
  capped?: boolean; // can't pass the tile's cap (thin soil on dry ground and sand)
  fall?: boolean; // dead plants drop into it: half on their tile, half on the neighbours
  into?: Partial<Record<LayerId, number>>; // what decays releases this share into other stocks on its tile
};
export type FieldDef = LevelDef | StockDef;

export const FIELDS: Record<LayerId, FieldDef> = {
  shade: { kind: 'level', name: 'Shade', words: ['open sky', 'deep shade'], color: '#8a5ad8', bleed: 0.2, readBelow: 'herb' },
  water: { kind: 'level', name: 'Water', words: ['dry', 'soaked'], color: '#3a8ae0', from: { soil: 0.3, shade: 0.15 } },
  soil: { kind: 'stock', name: 'Soil', words: ['bare rock', 'deep soil'], color: '#a8703c', rest: 0, decay: 0.002, protect: 0.85, capped: true },
  nitrogen: { kind: 'stock', name: 'Nitrogen', words: ['none', 'rich'], color: '#5cc040', rest: 0.01, decay: 0.002, diffuse: 0.005, viewMax: 0.3 },
  litter: { kind: 'stock', name: 'Litter', words: ['clean', 'thick litter'], color: '#e0b030', rest: 0, decay: 0.0015, fall: true, hidden: true,
    into: { nitrogen: 0.03 } }, // litter carries nitrogen; animals that eat it release the same share
};

/** Levels are computed in this order (water needs shade). */
export const LEVEL_ORDER: LayerId[] = ['shade', 'water'];
export const STOCK_ORDER: LayerId[] = ['soil', 'nitrogen', 'litter'];

/** Statuses: fixed tags on a tile (0–1 strength), set by landmarks. Species tolerate them more or less. */
export const STATUS_IDS = ['salty'] as const;
export type StatusId = (typeof STATUS_IDS)[number];
export const STATUSES: Record<StatusId, { name: string; color: string }> = {
  salty: { name: 'Salt', color: '#e8eef4' },
};

/** Anything that can hold a plant back: the layers by index, then the statuses. */
export const LIMIT_COUNT = LAYER_IDS.length + STATUS_IDS.length;
export const limitName = (k: number) => (k < LAYER_IDS.length ? FIELDS[LAYER_IDS[k]].name : STATUSES[STATUS_IDS[k - LAYER_IDS.length]].name);
export const limitColor = (k: number) => (k < LAYER_IDS.length ? FIELDS[LAYER_IDS[k]].color : STATUSES[STATUS_IDS[k - LAYER_IDS.length]].color);
