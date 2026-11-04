// Toy: a Life, the drawing. The seafloor board with its creature, and the body panel (head, segments, side slots, tail).
import { col, hash } from '../src/view/flat';
import { COLS, PARTS, PREDATOR_AT, ROWS, type NodeId, type PartId } from './life-data';
import { DX, DY, at, dests, fits, isLow, known, lockOf, xy, type Life } from './life-sim';

export const C = 16, SCALE = 3;
export const BODY_W = 116, BODY_H = 46, BODY_SCALE = 3;
type G = CanvasRenderingContext2D;
const r = (g: G, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// ---- the part icons, 6×6 ----
const INK: Record<string, string> = {
  r: col('warm', 0), o: col('warm', 1), y: col('warm', 2), g: col('leaf', 3), b: col('water', 1), s: col('stone', 2),
  e: col('earth', 4), p: col('rare', 0), w: '#eef2ee', k: col('ink', 0),
};
const ICON: Record<PartId, string> = {
  claw: 'r..r..|rr.rr.|.rrr..|..r...|..r...|......',
  shield: '.ssss.|ssssss|ssssss|.ssss.|..ss..|......',
  eye: '.wwww.|wwkkww|wwkkww|.wwww.|......|......',
  compound: 'p.p.p.|.p.p.p|p.p.p.|.p.p.p|p.p.p.|......',
  spine: '..s...|..s...|.sss..|.sss..|sssss.|......',
  sclerite: 'ss.ss.|ss.ss.|......|ss.ss.|ss.ss.|......',
  leg: '..ee..|.ee...|ee....|.ee...|..ee..|...e..',
  digger: 'ee....|.ee...|..ee..|.eeee.|.eeee.|..ee..',
  chaetae: 's.s.s.|s.s.s.|.s.s.s|.s.s.s|s.s.s.|......',
  gill: 'b.b.b.|bbbbb.|b.b.b.|bbbbb.|b.b.b.|......',
  gut: '.oooo.|oooooo|oooooo|oooooo|.oooo.|......',
  pouch: 'yy.yy.|yy.yy.|......|.yy...|.yy...|......',
  proboscis: '....o.|...oo.|..oo..|.oo...|oo....|......',
  hook: 'p...p.|.o.o..|..o...|.o....|o.....|......',
  enrol: '.pppp.|p....p|p.pp.p|p....p|.pppp.|......',
  deep: '..p...|..p...|..p...|ppppp.|.ppp..|..p...',
};
function iconAt(g: G, id: PartId, x: number, y: number) {
  ICON[id].split('|').forEach((row, j) => [...row].forEach((c, k) => { if (c !== '.') r(g, x + k, y + j, 1, 1, INK[c]); }));
}
export function icon(cv: HTMLCanvasElement, id: PartId) {
  cv.width = 6; cv.height = 6; cv.style.width = '24px'; cv.style.height = '24px';
  iconAt(cv.getContext('2d')!, id, 0, 0);
}
const PART_INK: Record<PartId, string> = {
  claw: INK.r, shield: INK.s, eye: INK.w, compound: INK.p, spine: INK.s, sclerite: INK.s, leg: INK.e, digger: INK.e,
  chaetae: INK.s, gill: INK.b, gut: INK.o, pouch: INK.y, proboscis: INK.o, hook: INK.p, enrol: INK.p, deep: INK.p,
};

// ---- the board ----
function terrain(g: G, l: Life, i: number) {
  const [x, y] = xy(i), x0 = x * C, y0 = y * C, t = l.tiles[i];
  const speck = (n: number, c: string) => { for (let k = 0; k < n; k++) r(g, x0 + Math.floor(hash(x, y * 7 + k, 3) * C), y0 + Math.floor(hash(x * 5 + k, y, 4) * C), 1, 1, c); };
  if (t.t === 'sand') { r(g, x0, y0, C, C, col('sky', 2)); speck(6, col('sky', 3)); speck(3, col('sky', 1)); }
  if (t.t === 'mud') { r(g, x0, y0, C, C, col('earth', t.seen ? 3 : 2)); speck(7, col('earth', t.seen ? 4 : 3)); }
  if (t.t === 'dead') { r(g, x0, y0, C, C, col('sky', 0)); speck(5, col('earth', 2)); speck(2, col('rare', 0)); }
  if (t.t === 'rock') {
    r(g, x0, y0, C, C, col('sky', 1));
    r(g, x0 + 2, y0 + 3, 12, 11, col('stone', 0)); r(g, x0 + 3, y0 + 2, 10, 10, col('stone', 1)); r(g, x0 + 4, y0 + 3, 5, 3, col('stone', 2));
  }
  r(g, x0 + C - 1, y0, 1, C, 'rgba(5,9,11,0.18)'); r(g, x0, y0 + C - 1, C, 1, 'rgba(5,9,11,0.18)');
}

function nodeArt(g: G, id: NodeId, x: number, y: number) {
  if (id === 'mat') { r(g, x + 3, y + 5, 10, 7, col('leaf', 2)); r(g, x + 5, y + 4, 6, 9, col('leaf', 2)); r(g, x + 5, y + 6, 3, 2, col('leaf', 3)); r(g, x + 9, y + 9, 2, 2, col('leaf', 3)); }
  if (id === 'buried') { r(g, x + 3, y + 8, 10, 5, col('earth', 4)); r(g, x + 5, y + 6, 6, 3, col('earth', 4)); r(g, x + 6, y + 8, 2, 2, col('warm', 1)); r(g, x + 10, y + 10, 1, 1, col('warm', 1)); }
  if (id === 'shell') for (const [a, b] of [[3, 4], [8, 7], [3, 10]]) { r(g, x + a, y + b, 5, 3, col('stone', 2)); r(g, x + a + 1, y + b - 1, 3, 1, col('stone', 2)); r(g, x + a + 2, y + b, 1, 3, col('stone', 1)); }
  if (id === 'carcass') { r(g, x + 2, y + 6, 12, 5, col('warm', 0)); r(g, x + 3, y + 5, 3, 7, col('rare', 0)); for (let k = 7; k < 13; k += 2) r(g, x + k, y + 5, 1, 7, col('stone', 2)); }
  if (id === 'sponge') for (const [a, h] of [[3, 7], [7, 10], [11, 6]]) { r(g, x + a, y + 13 - h, 3, h, col('warm', 2)); r(g, x + a, y + 13 - h, 3, 1, col('warm', 1)); r(g, x + a + 1, y + 14 - h, 1, 2, col('earth', 3)); }
  if (id === 'bloom') { r(g, x + 3, y + 4, 10, 9, col('leaf', 4)); r(g, x + 5, y + 6, 2, 2, col('warm', 2)); r(g, x + 9, y + 9, 2, 2, col('warm', 2)); r(g, x + 10, y + 5, 1, 1, col('rare', 0)); }
}

function nodes(g: G, l: Life) {
  l.tiles.forEach((t, i) => {
    if (!t.node || !known(t)) return;
    const [x, y] = xy(i), lock = lockOf(l, t.node);
    g.globalAlpha = lock ? 0.5 : 1;
    nodeArt(g, t.node, x * C, y * C);
    g.globalAlpha = 1;
    if (lock) { r(g, x * C + 10, y * C + 1, 5, 5, col('ink', 0)); r(g, x * C + 11, y * C + 2, 3, 3, col('warm', 0)); }
  });
}

/** Pixels in the creature's frame: `a` along its facing, `b` to its right. */
function frame(g: G, cx: number, cy: number, f: number) {
  const fx = DX[f], fy = DY[f], rx = DX[(f + 1) % 4], ry = DY[(f + 1) % 4];
  return (a: number, b: number, c: string) => r(g, cx + fx * a + rx * b, cy + fy * a + ry * b, 1, 1, c);
}

function creature(g: G, l: Life) {
  const px = frame(g, l.x * C + 8, l.y * C + 8, l.facing), worm = l.plan === 'worm';
  const half = worm ? 1 : 3, hi = l.soft ? col('stone', 2) : worm ? col('rare', 0) : col('warm', 2), lo = l.soft ? col('stone', 1) : worm ? col('warm', 1) : col('warm', 1);
  const len = l.segments * 2 + 3, nose = Math.floor(len / 2);
  for (let a = 0; a < 3; a++) for (let b = -half + 1 + (2 - a > 0 ? 0 : 1); b <= half - 1 - (2 - a > 0 ? 0 : 1); b++) px(nose - a, b, hi);
  for (let k = 0; k < l.segments; k++) for (let d = 0; d < 2; d++) for (let b = -half; b <= half; b++) px(nose - 3 - k * 2 - d, b, k % 2 ? hi : lo);
  for (const s of l.slots) {
    if (!s.part) continue;
    const ink = PART_INK[s.part];
    if (s.kind === 'head') { px(nose + 1, s === l.slots[0] ? -1 : 1, ink); px(nose + 2, s === l.slots[0] ? -1 : 1, ink); }
    else if (s.kind === 'tail') { px(nose - len, 0, ink); px(nose - len - 1, 0, ink); }
    else {
      const sign = s.side === 'left' ? -1 : 1;
      px(nose - 3 - s.seg * 2, sign * (half + 1), ink); px(nose - 3 - s.seg * 2, sign * (half + 2), ink);
    }
  }
}

function rival(g: G, l: Life) {
  const x = l.rival.x * C, y = l.rival.y * C;
  r(g, x + 5, y + 4, 6, 9, col('stone', 1)); r(g, x + 4, y + 6, 8, 5, col('stone', 1)); r(g, x + 7, y + 4, 2, 9, col('stone', 2)); r(g, x + 5, y + 4, 6, 2, col('stone', 2));
}

function predator(g: G, l: Life) {
  const p = l.pred;
  if (!p) return;
  const px = frame(g, p.x * C + 8, p.y * C + 8, (p.dir + 2) % 4), dark = col('warm', 0), ink = col('ink', 0);
  for (let a = -7; a <= 3; a++) { const w = a > 0 ? 3 : a < -4 ? 2 : 4; for (let b = -w; b <= w; b++) px(a, b, dark); }
  for (const s of [-1, 1]) { for (let a = 3; a <= 7; a++) px(a, s * 3, col('warm', 1)); px(7, s * 2, col('warm', 1)); px(2, s * 4, ink); px(2, s * 3, col('warm', 2)); }
  for (let a = -6; a <= 0; a += 2) { px(a, -5, col('warm', 1)); px(a, 5, col('warm', 1)); }
  if (p.state === 'rest') for (const [a, b] of [[-2, -1], [-2, 1]]) px(a, b, col('stone', 2));
}

function arrow(g: G, x: number, y: number, dir: number, c: string) {
  const px = frame(g, x, y, dir);
  for (let a = -4; a <= 4; a++) px(a, 0, c);
  for (let k = 1; k <= 3; k++) { px(4 - k, -k, c); px(4 - k, k, c); }
}

export function draw(g: G, l: Life, hover: number) {
  for (let i = 0; i < COLS * ROWS; i++) terrain(g, l, i);
  if (isLow(l.turn) && l.phase !== 'over') r(g, 0, 0, COLS * C, ROWS * C, 'rgba(13,40,48,0.45)');
  nodes(g, l);
  if (!l.pred && l.phase !== 'over' && l.turn < PREDATOR_AT) {
    const [ex, ey] = l.entry;
    g.strokeStyle = col('warm', 0); g.lineWidth = 1; g.setLineDash([2, 2]);
    g.strokeRect(ex * C + 1.5, ey * C + 1.5, C - 3, C - 3); g.setLineDash([]);
  }
  const ds = dests(l);
  for (const d of ds.values()) {
    const [x, y] = xy(d.i), x0 = x * C, y0 = y * C, c = col('warm', 2);
    for (const [cx, cy, w, h] of [[1, 1, 3, 1], [1, 1, 1, 3], [C - 4, 1, 3, 1], [C - 2, 1, 1, 3], [1, C - 2, 3, 1], [1, C - 4, 1, 3], [C - 4, C - 2, 3, 1], [C - 2, C - 4, 1, 3]]) r(g, x0 + cx, y0 + cy, w, h, c);
  }
  const hd = ds.get(hover);
  if (hd) {
    for (const i of hd.path) { const [x, y] = xy(i); r(g, x * C + 7, y * C + 7, 2, 2, col('warm', 2)); }
    const [x, y] = xy(hover);
    r(g, x * C, y * C, C, C, 'rgba(255,225,74,0.22)');
  }
  rival(g, l);
  const p = l.pred;
  if (p) for (const i of p.marks) {
    const [x, y] = xy(i), x0 = x * C, y0 = y * C;
    r(g, x0, y0, C, C, 'rgba(204,49,31,0.34)');
    for (let k = 0; k < C; k += 4) for (let m = 0; m < C; m++) if ((m + k) % 8 === 0) r(g, x0 + m, y0 + k, 1, 1, col('warm', 0));
  }
  creature(g, l);
  predator(g, l);
  if (p && p.marks.length) arrow(g, p.x * C + 8 - DX[p.dir] * 8, p.y * C + 8 - DY[p.dir] * 8, (p.dir + 2) % 4, col('warm', 2));
  if (l.cause === 'died') r(g, 0, 0, COLS * C, ROWS * C, 'rgba(5,9,11,0.45)');
}
export const tileAt = (x: number, y: number) => (x >= 0 && x < COLS && y >= 0 && y < ROWS ? at(x, y) : -1);

// ---- the body panel: the head points right, so its left side is on top ----
const HEAD_X = BODY_W - 16, TOP = 2, BOTTOM = BODY_H - 10;

export function slotRects(l: Life): [number, number][] {
  let head = 0;
  return l.slots.map((s) => {
    if (s.kind === 'head') return [HEAD_X + 4, head++ === 0 ? TOP : BOTTOM];
    if (s.kind === 'tail') return [HEAD_X - 10 * l.segments - 18, (BODY_H >> 1) - 4];
    return [HEAD_X - 10 * (s.seg + 1), s.side === 'left' ? TOP : BOTTOM];
  });
}
export function slotAt(l: Life, x: number, y: number) {
  return slotRects(l).findIndex(([sx, sy]) => x >= sx - 1 && x < sx + 9 && y >= sy - 1 && y < sy + 9);
}

export function drawBody(g: G, l: Life, hover: number) {
  r(g, 0, 0, BODY_W, BODY_H, '#10242b');
  const worm = l.plan === 'worm', mid = BODY_H >> 1, tall = worm ? 4 : 7;
  const hi = worm ? col('rare', 0) : col('warm', 2), lo = col('warm', 1), rects = slotRects(l);
  r(g, HEAD_X - 10 * l.segments - 8, mid - 1, 10 * l.segments + 8, 2, lo);
  l.slots.forEach((s, k) => {
    if (s.kind !== 'side') return;
    const x = rects[k][0] + 4;
    r(g, x, s.side === 'left' ? TOP + 8 : mid + tall, 1, s.side === 'left' ? mid - tall - TOP - 8 : BOTTOM - mid - tall, col('stone', 1));
  });
  for (let k = 0; k < l.segments; k++) { const x = HEAD_X - 10 * (k + 1); r(g, x, mid - tall, 9, tall * 2, k % 2 ? hi : lo); r(g, x + 1, mid - tall + 1, 7, 1, col('warm', 2)); }
  for (let k = 0; k < 13; k++) { const w = Math.round(tall * (1 - k / 13)); r(g, HEAD_X + k, mid - w, 1, Math.max(1, w * 2), hi); }
  r(g, HEAD_X + 6, mid - 1, 2, 2, col('ink', 0));
  const tx = HEAD_X - 10 * l.segments - 8;
  r(g, tx, mid - 3, 8, 6, lo); r(g, tx + 1, mid - 4, 6, 8, lo);
  l.slots.forEach((s, k) => {
    const [x, y] = rects[k], rare = s.part && PARTS[s.part].rare;
    const target = l.held && fits(l, l.held, k);
    r(g, x, y, 8, 8, col('ink', 0));
    r(g, x + 1, y + 1, 6, 6, target ? '#3a3a14' : '#1b2a30');
    if (s.part) iconAt(g, s.part, x + 1, y + 1);
    const edge = k === hover ? '#ffffff' : target ? col('warm', 2) : rare ? col('rare', 0) : null;
    if (edge) { g.strokeStyle = edge; g.lineWidth = 1; g.strokeRect(x - 0.5, y - 0.5, 9, 9); }
  });
}
