// Toy A (slice 04): the board drawn as flat palette cells (Teal palette, the shade kept).
import { col, hash } from '../src/view/flat';
import { COLS, ROWS, SKY, type PartId } from './turns-data';
import { around, idx, isSky, lightMap, signs, whyNot, xy, type Game } from './turns-sim';

export const C = 12, SCALE = 3; // low-res pixels per cell, and the upscale
type G2 = CanvasRenderingContext2D;
const r = (g: G2, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

function sky(g: G2, x0: number, y0: number, light: number) {
  r(g, x0, y0, C, C, col('sky', 1 + light));
}

function soil(gm: Game, g: G2, i: number, x0: number, y0: number) {
  const [x, y] = xy(i), s = gm.soil[i], seen = gm.seen[i];
  r(g, x0, y0, C, C, col('earth', seen ? 2 : 1));
  for (let k = 0; k < 6; k++) { // grain
    const px = Math.floor(hash(x, y * 7 + k, 3) * C), py = Math.floor(hash(x * 5 + k, y, 4) * C);
    r(g, x0 + px, y0 + py, 1, 1, col('earth', seen ? 3 : 0));
  }
  if (!seen) return;
  if (s === 'stone') { r(g, x0 + 1, y0 + 2, C - 2, C - 3, col('stone', 0)); r(g, x0 + 2, y0 + 2, C - 5, 2, col('stone', 1)); }
  if (s === 'damp' && gm.amt[i] > 0) {
    const k = gm.amt[i] >= 5 ? 1 : 3;
    r(g, x0 + k, y0 + k, C - 2 * k, C - 2 * k, col('water', 0));
    r(g, x0 + k + 1, y0 + k + 1, 2, 1, col('water', 1));
  }
  if (s === 'rich' && gm.amt[i] > 0) {
    const k = gm.amt[i] >= 3 ? 1 : 3;
    r(g, x0 + k, y0 + k, C - 2 * k, C - 2 * k, col('earth', 4));
    for (let m = 0; m < 4; m++) r(g, x0 + 2 + Math.floor(hash(x, y, m) * (C - 5)), y0 + 2 + Math.floor(hash(y, x, m) * (C - 5)), 2, 2, col('warm', 1));
  }
  if ((s === 'damp' || s === 'rich') && gm.amt[i] <= 0) r(g, x0 + 3, y0 + 6, 6, 1, col('earth', 0)); // a dry crack
  if (s === 'loam') { // signs: specks for hidden pockets one cell out
    const sg = signs(gm, i);
    for (let m = 0; m < sg.damp; m++) r(g, x0 + 1 + m * 3, y0 + 1, 2, 2, col('water', 1));
    for (let m = 0; m < sg.rich; m++) r(g, x0 + C - 3 - m * 3, y0 + C - 3, 2, 2, col('warm', 1));
  }
}

/** A line of pixels from the cell's centre toward a neighbour, `w` wide. */
function arm(g: G2, x0: number, y0: number, dx: number, dy: number, w: number, c: string) {
  const m = C / 2 - Math.floor(w / 2);
  if (dx > 0) r(g, x0 + m, y0 + m, C - m, w, c);
  if (dx < 0) r(g, x0, y0 + m, m + w, w, c);
  if (dy > 0) r(g, x0 + m, y0 + m, w, C - m, c);
  if (dy < 0) r(g, x0 + m, y0, w, m + w, c);
}

function native(gm: Game, g: G2, i: number, x0: number, y0: number) {
  const [x, y] = xy(i);
  if (isSky(i)) {
    r(g, x0, y0, C, C, col('leaf', 1));
    for (let py = 0; py < C; py += 2) for (let px = (py / 2) % 2; px < C; px += 2) if (hash(x * C + px, y * C + py, 9) < 0.45) r(g, x0 + px, y0 + py, 1, 1, col('leaf', 0));
    if (y + 1 < SKY && gm.native[idx(x, y + 1)] === gm.native[i]) r(g, x0 + 5, y0 + 8, 2, 4, col('earth', 3)); // the trunk
  } else if (gm.seen[i]) {
    for (const j of around(i)) if (gm.native[j] === gm.native[i]) { const [jx, jy] = xy(j); arm(g, x0, y0, jx - x, jy - y, 1, col('stone', 2)); }
    r(g, x0 + 5, y0 + 5, 2, 2, col('stone', 2));
  }
}

function part(gm: Game, g: G2, i: number, p: PartId, light: number, x0: number, y0: number) {
  const [x, y] = xy(i), near = around(i).filter((j) => gm.part[j]);
  const toStem = near.find((j) => gm.part[j] === 'stem');
  const dir = (j: number) => { const [jx, jy] = xy(j); return [jx - x, jy - y]; };
  if (p === 'stem') {
    for (const j of near) if (isSky(j) || gm.part[j] === 'root') { const [dx, dy] = dir(j); arm(g, x0, y0, dx, dy, 2, col('leaf', 1)); }
    r(g, x0 + 5, y0 + 5, 2, 2, col('leaf', 2));
  } else if (p === 'leaf') {
    if (toStem !== undefined) { const [dx, dy] = dir(toStem); arm(g, x0, y0, dx, dy, 1, col('leaf', 1)); }
    const c = col('leaf', 1 + light);
    r(g, x0 + 2, y0 + 4, 8, 4, c); r(g, x0 + 3, y0 + 3, 6, 6, c); r(g, x0 + 4, y0 + 2, 4, 8, c);
    r(g, x0 + 4, y0 + 4, 2, 1, col('leaf', 2 + light));
  } else if (p === 'flower') {
    if (toStem !== undefined) { const [dx, dy] = dir(toStem); arm(g, x0, y0, dx, dy, 1, col('leaf', 1)); }
    r(g, x0 + 3, y0 + 4, 6, 4, col('rare', 0)); r(g, x0 + 4, y0 + 3, 4, 6, col('rare', 0));
    r(g, x0 + 5, y0 + 5, 2, 2, col('warm', 2));
  } else { // root
    let n = 0;
    for (const j of near) if (gm.part[j] === 'root' || gm.part[j] === 'stem') { const [dx, dy] = dir(j); arm(g, x0, y0, dx, dy, 2, col('earth', 4)); n++; }
    r(g, x0 + 5, y0 + 5, 2, 2, col(n <= 1 ? 'stone' : 'earth', n <= 1 ? 2 : 4));
  }
}

export function draw(g: G2, gm: Game, hover: number, tool: PartId) {
  const light = lightMap(gm);
  for (let i = 0; i < COLS * ROWS; i++) {
    const [x, y] = xy(i), x0 = x * C, y0 = y * C;
    if (isSky(i)) sky(g, x0, y0, light[i]); else soil(gm, g, i, x0, y0);
    if (gm.native[i] >= 0) native(gm, g, i, x0, y0);
    const p = gm.part[i];
    if (p) part(gm, g, i, p, light[i], x0, y0);
  }
  r(g, 0, SKY * C, COLS * C, 1, col('earth', 3)); // the ground line
  // the sun, on its side
  const sx = gm.plot.sun > 0.5 ? 2 : gm.plot.sun < -0.2 ? COLS * C - 9 : Math.round(COLS * C * 0.5 - gm.plot.sun * 40);
  r(g, sx, 1, 7, 5, col('warm', 2)); r(g, sx + 1, 0, 5, 7, col('warm', 2));
  if (hover >= 0) {
    const id: PartId = isSky(hover) ? tool : 'root', bad = whyNot(gm, id, hover);
    const [x, y] = xy(hover), c = col('warm', bad ? 0 : 2);
    g.strokeStyle = c; g.lineWidth = 1; g.strokeRect(x * C + 0.5, y * C + 0.5, C - 1, C - 1);
  }
}
