// Toy C (slice 04): the body grid drawn as flat palette cells, the ghost of the held piece, the offers' minis.
import { col, hash } from '../src/view/flat';
import { ABOVE, BH, BW, DEEP_ROWS, ENCOUNTERS, GROUND, type PieceId } from './body-data';
import { at, cellsOf, whyNot, type Body, type Measure, type Offer } from './body-sim';

export const C = 14, SCALE = 4;
type G2 = CanvasRenderingContext2D;
const r = (g: G2, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const N4: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function arm(g: G2, x0: number, y0: number, dx: number, dy: number, w: number, c: string) {
  const m = C / 2 - Math.floor(w / 2);
  if (dx > 0) r(g, x0 + m, y0 + m, C - m, w, c);
  if (dx < 0) r(g, x0, y0 + m, m + w, w, c);
  if (dy > 0) r(g, x0 + m, y0 + m, w, C - m, c);
  if (dy < 0) r(g, x0 + m, y0, w, m + w, c);
}

const LINKS: Record<PieceId, PieceId[]> = {
  stem: ['stem', 'wood', 'leaf', 'thorn', 'flower', 'root'], wood: ['stem', 'wood', 'leaf', 'thorn', 'flower', 'root'],
  leaf: ['stem', 'wood'], thorn: ['stem', 'wood'], flower: ['stem', 'wood'], root: ['root', 'tuber', 'stem', 'wood'], tuber: ['root'],
};

/** One body cell; `light` −1 for a leaf drawn without its light (a mini or a ghost), `eaten` grey. */
export function cell(g: G2, id: PieceId, x0: number, y0: number, near: (dx: number, dy: number) => PieceId | null, light = 2, eaten = false) {
  const links = N4.filter(([dx, dy]) => { const n = near(dx, dy); return n && LINKS[id].includes(n); });
  const first = links[0];
  if (id === 'stem') { for (const [dx, dy] of links) arm(g, x0, y0, dx, dy, 2, col('leaf', 1)); r(g, x0 + 6, y0 + 6, 2, 2, col('leaf', 2)); }
  if (id === 'wood') { for (const [dx, dy] of links) arm(g, x0, y0, dx, dy, 4, col('earth', 3)); r(g, x0 + 5, y0 + 4, 4, 6, col('earth', 3)); r(g, x0 + 6, y0 + 5, 1, 4, col('earth', 4)); }
  if (id === 'leaf') {
    if (first) arm(g, x0, y0, first[0], first[1], 1, col('leaf', 1));
    const c = eaten ? col('stone', 1) : col('leaf', 1 + Math.max(0, light));
    r(g, x0 + 2, y0 + 5, 10, 4, c); r(g, x0 + 3, y0 + 4, 8, 6, c); r(g, x0 + 4, y0 + 3, 6, 8, c);
    if (!eaten) r(g, x0 + 4, y0 + 5, 3, 1, col('leaf', 2 + Math.max(0, light)));
  }
  if (id === 'thorn') {
    if (first) arm(g, x0, y0, first[0], first[1], 2, col('leaf', 1));
    r(g, x0 + 5, y0 + 5, 4, 4, col('leaf', 1));
    for (const [px, py] of [[3, 3], [10, 3], [3, 10], [10, 10], [6, 2], [2, 6]]) r(g, x0 + px, y0 + py, 1, 1, col('warm', 0));
    r(g, x0 + 4, y0 + 4, 1, 1, col('warm', 0)); r(g, x0 + 9, y0 + 4, 1, 1, col('warm', 0));
  }
  if (id === 'flower') {
    if (first) arm(g, x0, y0, first[0], first[1], 1, col('leaf', 1));
    r(g, x0 + 3, y0 + 5, 8, 4, col('rare', 0)); r(g, x0 + 5, y0 + 3, 4, 8, col('rare', 0));
    r(g, x0 + 6, y0 + 6, 2, 2, col('warm', 2));
  }
  if (id === 'root') { for (const [dx, dy] of links) arm(g, x0, y0, dx, dy, 2, col('earth', 4)); r(g, x0 + 6, y0 + 6, 2, 2, col(links.length <= 1 ? 'stone' : 'earth', links.length <= 1 ? 2 : 4)); }
  if (id === 'tuber') {
    if (first) arm(g, x0, y0, first[0], first[1], 2, col('earth', 4));
    r(g, x0 + 1, y0 + 3, 12, 8, col('earth', 4)); r(g, x0 + 2, y0 + 2, 10, 10, col('earth', 4));
    r(g, x0 + 3, y0 + 4, 4, 2, col('warm', 1));
  }
}

function backdrop(g: G2, b: Body) {
  const light = GROUND[b.niche.key].light;
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
    const x0 = x * C, y0 = y * C;
    if (y < ABOVE) { r(g, x0, y0, C, C, col('sky', light + 1)); continue; }
    const deep = y >= BH - DEEP_ROWS;
    r(g, x0, y0, C, C, col('earth', deep ? 1 : 2));
    for (let k = 0; k < (deep ? 3 : 7); k++) r(g, x0 + Math.floor(hash(x, y * 9 + k, 1) * C), y0 + Math.floor(hash(x * 3 + k, y, 2) * C), 1, 1, col('earth', deep ? 4 : 3));
  }
  r(g, 0, ABOVE * C, BW * C, 1, col('earth', 3));
  const h = ENCOUNTERS[b.encounter].height; // the grazer's reach or the rival's height
  if (h) for (let x = 0; x < BW * C; x += 4) r(g, x, (ABOVE - h) * C, 2, 1, col('warm', b.encounter === 'grazer' ? 0 : 2));
}

export function draw(g: G2, b: Body, m: Measure, hover: [number, number] | null) {
  backdrop(g, b);
  const get = (cells: (PieceId | null)[]) => (x: number, y: number) => (x >= 0 && x < BW && y >= 0 && y < BH ? cells[at(x, y)] : null);
  const body = get(b.cells);
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
    const id = b.cells[at(x, y)];
    if (id) cell(g, id, x * C, y * C, (dx, dy) => body(x + dx, y + dy), m.light[at(x, y)], m.eaten.has(at(x, y)));
  }
  const o = b.offers[b.held];
  if (!o || !hover) return;
  const bad = whyNot(b, o, hover[0], hover[1]), cs = cellsOf(o.shape, hover[0], hover[1]);
  const ghost = b.cells.slice();
  for (const [x, y] of cs) if (x >= 0 && x < BW && y >= 0 && y < BH) ghost[at(x, y)] = o.id;
  const gget = get(ghost);
  g.globalAlpha = bad ? 0.45 : 0.85;
  for (const [x, y] of cs) cell(g, o.id, x * C, y * C, (dx, dy) => gget(x + dx, y + dy));
  g.globalAlpha = 1;
  g.strokeStyle = col('warm', bad ? 0 : 2); g.lineWidth = 1;
  for (const [x, y] of cs) g.strokeRect(x * C + 0.5, y * C + 0.5, C - 1, C - 1);
}

/** An offer's shape on a small canvas. */
export function mini(cv: HTMLCanvasElement, o: Offer) {
  const w = Math.max(...o.shape.map((c) => c[0])) + 1, h = Math.max(...o.shape.map((c) => c[1])) + 1;
  cv.width = w * C; cv.height = h * C; cv.style.width = `${w * C * 2}px`;
  const g = cv.getContext('2d')!, has = (x: number, y: number) => o.shape.some((c) => c[0] === x && c[1] === y);
  r(g, 0, 0, cv.width, cv.height, PIECE_BG[o.id]);
  for (const [x, y] of o.shape) cell(g, o.id, x * C, y * C, (dx, dy) => (has(x + dx, y + dy) ? o.id : null));
}
const PIECE_BG: Record<PieceId, string> = {
  leaf: col('sky', 3), stem: col('sky', 3), wood: col('sky', 3), thorn: col('sky', 3), flower: col('sky', 3),
  root: col('earth', 2), tuber: col('earth', 2),
};
