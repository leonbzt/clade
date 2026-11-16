// Habitat kinds: the sea's 18 (depth × ground, and lee or open on the flats and shallows), three shores, three lands.
// Law 7: a kind names the adaptations it needs, one of each group. Base stocks are grams per tile with no producer;
// the sea's mats and detritus are N1's yields (data/sea.ts). All numbers are starting values, tuned by feel.
import type { AdaptationId, FoodId, Ground, HabitatKind } from '../../model/types';

const GROUNDS: Ground[] = ['sand', 'mud', 'rock'];
const SEA: AdaptationId[][] = [['water', 'diving']];
const FLAT: AdaptationId[][] = [['water', 'diving', 'walking'], ['tide', 'air']]; // the tide leaves it bare twice a day
const SHORE: AdaptationId[][] = [['walking', 'clinging', 'rooted'], ['air'], ['water', 'tide', 'salt']];
const LAND: AdaptationId[][] = [['walking', 'rooted'], ['air'], ['dry']];

type Per = Record<Ground, number>;
interface Band { id: string; name: string; light: number; water: number; deaths: [lee: number, open: number]; split: boolean; mats: Per; detritus: Per; plankton: [lee: number, open: number] }
const BANDS: Band[] = [
  { id: 'flat', name: 'flats', light: 1, water: 0.3, deaths: [0.2, 0.35], split: true, mats: { sand: 40, mud: 30, rock: 20 }, detritus: { sand: 5, mud: 20, rock: 2.5 }, plankton: [20, 30] },
  { id: 'shallows', name: 'shallows', light: 0.8, water: 0.7, deaths: [0.12, 0.25], split: true, mats: { sand: 30, mud: 20, rock: 15 }, detritus: { sand: 10, mud: 30, rock: 5 }, plankton: [26, 38] },
  { id: 'slope', name: 'slope', light: 0.2, water: 1, deaths: [0.08, 0.08], split: false, mats: { sand: 0, mud: 0, rock: 0 }, detritus: { sand: 15, mud: 40, rock: 10 }, plankton: [28, 28] },
  { id: 'deep', name: 'deeps', light: 0, water: 1, deaths: [0.05, 0.05], split: false, mats: { sand: 0, mud: 0, rock: 0 }, detritus: { sand: 20, mud: 50, rock: 15 }, plankton: [16, 16] },
];

const stocks = (pairs: [FoodId, number][]) => Object.fromEntries(pairs.filter(([, g]) => g > 0)) as Partial<Record<FoodId, number>>;

const sea: HabitatKind[] = BANDS.flatMap((b) => GROUNDS.flatMap((ground) => (b.split ? [0, 1] : [1]).map((open): HabitatKind => ({
  id: `${b.id}-${ground}${b.split ? (open ? '-open' : '-lee') : ''}`,
  name: `${b.split ? (open ? 'Open ' : 'Lee ') : ''}${ground} ${b.name}`.replace(/^./, (c) => c.toUpperCase()),
  realm: 'sea', ground, light: b.light, water: b.water, deaths: b.deaths[open], edge: b.id === 'flat', needs: b.id === 'flat' ? FLAT : SEA,
  base: stocks([['mats', b.mats[ground]], ['detritus', b.detritus[ground]], ['plankton', b.plankton[open]]]),
}))));

const dry = (id: string, name: string, realm: 'shore' | 'land', ground: Ground, deaths: number, base: [FoodId, number][]): HabitatKind =>
  ({ id, name, realm, ground, light: 1, water: 0, deaths, edge: false, needs: realm === 'shore' ? SHORE : LAND, base: stocks(base) });

export const KINDS: HabitatKind[] = [
  ...sea,
  dry('shore-rock', 'Rocky shore', 'shore', 'rock', 0.4, [['mats', 20]]),
  dry('shore-sand', 'Beach', 'shore', 'sand', 0.35, [['detritus', 18]]), // wrack on the tide line
  dry('shore-mud', 'Salt flat', 'shore', 'mud', 0.3, [['detritus', 22], ['mats', 16]]),
  dry('land-rock', 'Lava field', 'land', 'rock', 0.3, []), // bare: every stock on land comes from a producer
  dry('land-sand', 'Strand', 'land', 'sand', 0.25, []),
  dry('land-mud', 'Old flow', 'land', 'mud', 0.2, []), // weathered to soil
];
export const KIND: Record<string, HabitatKind> = Object.fromEntries(KINDS.map((k) => [k.id, k]));
