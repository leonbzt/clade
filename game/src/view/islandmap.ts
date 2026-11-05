// The island as a pixel-art world map on a plain 2D canvas: shallows by sea distance, foam, lit from the upper left.
import { BARE, BEACH, FOREST, F_CRACK, F_SPRING, F_STREAM, F_VENT, LAVA, SEA, WET } from '../data/island';
import type { Island, Spot, SpotId } from '../sim/island';

type RGB = [number, number, number];
const hash = (x: number, y: number) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177); h ^= h >>> 13; return ((Math.imul(h, 1103515245) >>> 8) & 255) / 255; };
const css = (c: RGB, k = 0) => `rgb(${Math.max(0, Math.min(255, c[0] + k)) | 0},${Math.max(0, Math.min(255, c[1] + k)) | 0},${Math.max(0, Math.min(255, c[2] + k)) | 0})`;
const LAND: Record<number, RGB> = { [BEACH]: [226, 200, 140], [LAVA]: [44, 38, 42], [BARE]: [124, 108, 88], [FOREST]: [38, 96, 50], [WET]: [26, 72, 54] };
const DISC: Record<SpotId, string> = { sand: 'rgba(214,226,170,0.38)', mud: 'rgba(120,90,60,0.5)', rock: 'rgba(60,70,92,0.6)' };

export function drawIsland(cv: HTMLCanvasElement, isl: Island, spots: Record<SpotId, Spot>,
  opts: { scale: number; selected?: SpotId | null; labels?: Partial<Record<SpotId, string>>; t?: number }): void {
  const { w, h } = isl, S = opts.scale, t = opts.t ?? 0;
  cv.width = w * S; cv.height = h * S;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // Sea distance (tiles to land, 8 neighbours), for the shallows.
  const land = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && isl.kind[y * w + x] !== SEA;
  const near = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let d = 9;
    for (let r = 1; r <= 8 && d === 9; r++) for (let dy = -r; dy <= r && d === 9; dy++) for (let dx = -r; dx <= r; dx++)
      if (Math.max(Math.abs(dx), Math.abs(dy)) === r && land(x + dx, y + dy)) { d = r; break; }
    near[y * w + x] = d;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, k = isl.kind[i], n = (hash(x, y) - 0.5) * 14;
    let col: string;
    if (k === SEA) {
      const d = near[i], m = Math.max(0, 1 - (d - 1) / 7); // 1 at the coast, 0 in the deep
      const base: RGB = [14 + 50 * m * m, 40 + 130 * m * m, 66 + 110 * m * m];
      col = css(base, n * 0.6);
      const foam = d === 1 && hash(x + ((t * 1.5) | 0), y) > 0.35;
      g.fillStyle = col; g.fillRect(x * S, y * S, S, S);
      if (foam) { g.fillStyle = 'rgba(235,248,244,0.75)'; g.fillRect(x * S, y * S, S, S); }
      continue;
    }
    const f = isl.feature[i];
    let c: RGB = LAND[k] ?? LAND[BARE];
    if (f === F_STREAM || f === F_SPRING) c = [64, 140, 200];
    else if (f === F_CRACK && k === LAVA) c = [30, 24, 28];
    let lit = n;
    if (!land(x - 1, y - 1) || isl.kind[(y - 1) * w + x - 1] === SEA) lit += 0;
    else if (k !== BEACH && (isl.kind[(y - 1) * w + x] !== k || isl.kind[y * w + x - 1] !== k)) lit += 12;
    if (!land(x - 1, y) || !land(x, y - 1)) lit += 14; // north-west edge catches the light
    g.fillStyle = css(c, lit); g.fillRect(x * S, y * S, S, S);
    if (f === F_VENT || (isl.hot[i] && k === LAVA)) {
      const vd = f === F_VENT ? 1 : 0.18 + 0.12 * hash(x, y);
      g.fillStyle = `rgba(255,${f === F_VENT ? 120 : 70},30,${vd * (0.85 + 0.15 * Math.sin(t * 3 + x))})`; g.fillRect(x * S, y * S, S, S);
    }
  }
  // Habitat spots.
  g.font = "bold 12px 'Pixelify Sans', sans-serif"; g.textAlign = 'center'; g.textBaseline = 'top'; g.lineJoin = 'round';
  for (const id of Object.keys(spots) as SpotId[]) {
    const s = spots[id], cx = (s.x + 0.5) * S, cy = (s.y + 0.5) * S, R = s.r * S, sel = opts.selected === id;
    g.fillStyle = DISC[id]; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.fill();
    g.lineWidth = 2; g.strokeStyle = sel ? '#ffd23a' : 'rgba(240,248,250,0.8)';
    if (!sel) g.setLineDash([6, 4]); else g.setLineDash([]);
    g.lineDashOffset = -t * 6;
    g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.stroke(); g.setLineDash([]);
    const label = opts.labels?.[id];
    if (label) {
      g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText(label, cx, cy + R + 3);
      g.fillStyle = '#ffe033'; g.fillText(label, cx, cy + R + 3);
    }
  }
}

/** The spot whose disc holds this tile (2-tile margin), or null. */
export function spotAt(spots: Record<SpotId, Spot>, tx: number, ty: number): SpotId | null {
  let best: SpotId | null = null, bd = Infinity;
  for (const id of Object.keys(spots) as SpotId[]) {
    const s = spots[id], d = Math.hypot(tx - s.x, ty - s.y);
    if (d <= s.r + 2 && d < bd) { bd = d; best = id; }
  }
  return best;
}
