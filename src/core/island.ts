// Builds the placeholder island map from data/island.ts. Deterministic, so it is not stored in the state.
import { ISLAND } from '../data/island';
import type { NicheId } from '../data/niches';
import { HEX_DIRS, hexDistance, hexKey, hexToPixel, hexesWithin } from './hex';
import { nextRandom } from './rng';
import type { GardenCell, Hex } from './types';

let cache: GardenCell[] | null = null;

export function islandCells(): GardenCell[] {
  if (!cache) cache = buildIsland();
  return cache;
}

export function nicheCellCount(niche: NicheId): number {
  return islandCells().filter((c) => c.niche === niche).length;
}

function buildIsland(): GardenCell[] {
  const rng = { s: ISLAND.seed };
  const rand = () => {
    const [v, s] = nextRandom(rng.s);
    rng.s = s;
    return v;
  };
  const waves = ISLAND.coastWaves.map(([n, w]) => ({ n, w, phase: rand() * Math.PI * 2 }));

  // 1. Shape: a hex disc with a wobbly coast
  const land = hexesWithin(ISLAND.radius).filter((h) => {
    const { x, y } = hexToPixel(h, 1);
    const dist = Math.hypot(x, y) / Math.sqrt(3);
    const a = Math.atan2(y, x);
    const noise = waves.reduce((sum, wv) => sum + wv.w * Math.sin(wv.n * a + wv.phase), 0.5);
    return dist <= ISLAND.radius - ISLAND.shapeWobble * noise;
  });
  const keys = new Set(land.map(hexKey));

  // 2. Depth from the coast, by breadth-first search inward
  const depth = new Map<string, number>();
  let frontier: Hex[] = land.filter((h) => HEX_DIRS.some((d) => !keys.has(hexKey({ q: h.q + d.q, r: h.r + d.r }))));
  for (const h of frontier) depth.set(hexKey(h), 0);
  let level = 0;
  while (frontier.length > 0) {
    level++;
    const next: Hex[] = [];
    for (const h of frontier) {
      for (const d of HEX_DIRS) {
        const n = { q: h.q + d.q, r: h.r + d.r };
        const k = hexKey(n);
        if (keys.has(k) && !depth.has(k)) {
          depth.set(k, level);
          next.push(n);
        }
      }
    }
    frontier = next;
  }

  // 3. Niche: beach on one coast, lava everywhere else
  const b = ISLAND.beach;
  const niche = (h: Hex): NicheId => {
    const { x, y } = hexToPixel(h, 1);
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    const off = Math.abs(((angle - b.angle + 540) % 360) - 180);
    const coastal = (depth.get(hexKey(h)) ?? 0) < b.depth;
    const isVent = h.q === ISLAND.vent.q && h.r === ISLAND.vent.r;
    return coastal && off <= b.spread && !isVent ? 'beach' : 'lava';
  };

  // 4. Fill order per niche: near the vent first, with some jitter
  const cells = land.map((h) => ({ ...h, niche: niche(h), order: 0, sortKey: hexDistance(h, ISLAND.vent) + rand() * ISLAND.fillJitter }));
  for (const id of ['lava', 'beach'] as NicheId[]) {
    cells
      .filter((c) => c.niche === id)
      .sort((a, b2) => a.sortKey - b2.sortKey)
      .forEach((c, i) => (c.order = i));
  }
  return cells.map(({ q, r, niche: n, order }) => ({ q, r, niche: n, order }));
}
