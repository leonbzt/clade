// The run in side view, in the 2D low-poly look (slice 02's look toy, `toys/look-flat.ts`): a low-res canvas in the
// Teal palette, upscaled without smoothing. Three layers composed per pixel: the world behind (sky, sun, hills, the
// ground and the faceted soil with its gems and signs) darkened by the light grid's shade, the bodies in front, and
// the selected sapling's shoots on top with a solid outline. The scene is composed when it changes (a new `stamp`, at
// most every LOOK.composeMs); the overlays (glints, target paths, the pointer's aim) are drawn on it every frame.
import { BARE, FOREST, LAVA } from '../data/island';
import { LOOK, type RampId } from '../data/palette';
import { CELL, COLS, GROUND, H, LIGHT, ROWS, SKY_ROWS, W } from '../data/run';
import { isPocket, type Plot } from '../sim/run/plot';
import type { Run } from '../sim/run/run';
import { subtree } from '../sim/run/verbs';
import { drawNative, drawPlant, seg } from './bodies';
import { EMPTY, F, P, Pix, UNDER, X, Y, col, ctx, dither, hash, key, lit, lutOf, mk, pi, poly, type Cam, type Ctx, type V3 } from './flat';

export const LW = W * LOOK.k, LH = H * LOOK.k;

/** Herb and tree see the whole plot; moss is zoomed around the stand. */
export function camFor(r: Run): Cam {
  if (r.form !== 'moss') return { k: LOOK.k, ox: 0, oy: 0 };
  const s = LOOK.mossZoom, vw = W / s, mid = r.stand.reduce((a, x) => a + x.plant.x, 0) / r.stand.length;
  return { k: LOOK.k * s, ox: Math.max(0, Math.min(W - vw, mid - vw / 2)), oy: GROUND - (H / s) * 0.55 };
}
/** A point on the canvas (0–1 across and down) → the world. */
export const toWorld = (c: Cam, u: number, v: number) => ({ x: (u * LW) / c.k + c.ox, y: (v * LH) / c.k + c.oy });
/** A world point → the canvas (0–1), for labels over it. */
export const toCanvas = (c: Cam, x: number, y: number) => ({ u: X(c, x) / LW, v: Y(c, y) / LH });

/** What the pointer would do: a path from a node to a target (ok: affordable), and the parts it touches. */
export interface Aim { sap: number; path: [number, number, number, number] | null; ok: boolean; part: number }

/** The canvases; the world behind is redrawn only when its key changes (what is seen, how full the pockets are). */
export interface View {
  out: HTMLCanvasElement; g: Ctx; a: Ctx; c: Pix; m: Pix;
  key: string; back: Uint8Array | null; // the world behind as palette indices, as last drawn
  stamp: number; at: number; img: ImageData | null; // the composed scene, as last composed
}
export function newView(out: HTMLCanvasElement): View {
  out.width = LW; out.height = LH;
  return { out, g: ctx(out), a: ctx(mk(LW, LH)), c: new Pix(LW, LH), m: new Pix(LW, LH), key: '', back: null, stamp: -1, at: -1e9, img: null };
}
/** A canvas → palette indices, each pixel snapped to the nearest colour. */
function indices(g: Ctx) {
  const d = g.getImageData(0, 0, LW, LH).data, lut = lutOf(), out = new Uint8Array(LW * LH);
  for (let i = 0; i < out.length; i++) out[i] = lut[key(d, i * 4)];
  return out;
}
function backKey(c: Cam, plot: Plot) {
  let seen = 0, full = 0;
  plot.cells.forEach((cell, i) => { if (cell.seen) { seen += i; if (cell.max) full += Math.round((cell.amount / cell.max) * 8); } });
  return `${c.ox},${c.k},${seen},${full}`;
}

/** Draw a frame; `stamp` changes whenever the run does (a tick, a verb, the selection). */
export function drawRun(v: View, r: Run, aim: Aim | null, time: number, stamp: number) {
  const cam = camFor(r), now = time * 1000;
  if (!v.img || (stamp !== v.stamp && now - v.at >= LOOK.composeMs)) {
    const plot = r.plot, sun = plot.light.sun, sel = r.stand[r.sel]?.plant, bk = backKey(cam, plot);
    if (bk !== v.key || !v.back) { drawBack(v.a, cam, plot); v.back = indices(v.a); v.key = bk; }
    v.c.clear(); v.m.clear();
    for (const nb of plot.neighbours) drawNative(v.c, cam, nb, plot.grow, plot.light);
    r.stand.forEach((s, k) => k !== r.sel && drawPlant(v.c, cam, s.plant, sun, col('earth', 3)));
    if (sel) { drawPlant(v.c, cam, sel, sun, col('earth', 4), 'roots'); drawPlant(v.m, cam, sel, sun, '', 'shoots'); }
    v.img = compose(v, cam, plot); v.stamp = stamp; v.at = now;
  }
  v.g.putImageData(v.img, 0, 0);
  overlay(v.g, cam, r, aim, time);
}

// ---- the world behind ----
const STRIP: Record<number, [RampId, number]> = { [LAVA]: ['stone', 1], [BARE]: ['earth', 4], [FOREST]: ['leaf', 2] }; // else wet: leaf 3

/** The soil's jittered vertex grid (fixed per plot): x, y (world, y down) and a height for the facet light. */
const vtx = (seed: number, c: number, r: number): V3 => {
  const ex = c === 0 || c === COLS, ey = r === 0 || r === ROWS;
  return [c * CELL + (ex ? 0 : (hash(c, r, seed) - 0.5) * CELL * 0.4), GROUND + r * CELL + (ey ? 0 : (hash(c, r, seed + 1) - 0.5) * CELL * 0.4), hash(c, r, seed + 2) * CELL * 0.65];
};
const up = (v: V3): V3 => [v[0], -v[1], v[2]];

/** A faceted gem in a cell: five facets around a raised apex, lit from above-left. */
function gem(g: Ctx, c: Cam, i: number, ramp: RampId, lo: number, hi: number, h: number, rad: number) {
  const cc = i % COLS, rr = Math.floor(i / COLS), cx = cc * CELL + CELL / 2, cy = GROUND + rr * CELL + CELL / 2, R = (rad * CELL) / 2;
  const ring: V3[] = [0, 1, 2, 3, 4].map((q) => {
    const a = (q / 5) * Math.PI * 2 + hash(cc, rr, 4) * 6, k = R * (0.8 + 0.3 * hash(cc + q, rr, 5));
    return [cx + Math.cos(a) * k, cy + Math.sin(a) * k * 0.9, 0];
  });
  const ap: V3 = [cx - R * 0.12, cy - R * 0.12, (h * CELL) / 2];
  for (let q = 0; q < 5; q++) {
    const a = ring[q], b = ring[(q + 1) % 5], L = lit(up(ap), up(a), up(b), UNDER);
    poly(g, [P(c, ap[0], ap[1]), P(c, a[0], a[1]), P(c, b[0], b[1])], col(ramp, L > 0.85 ? hi : L > 0.62 ? (lo + hi) / 2 : lo));
  }
}

function drawBack(g: Ctx, c: Cam, plot: Plot) {
  const sun = plot.light.sun, seed = plot.seed % 9973, [b1, b2] = LOOK.skyBands;
  const band = (y0: number, y1: number, i: number) => { g.fillStyle = col('sky', i); g.fillRect(0, Math.floor(Y(c, y0)), LW, Math.ceil(Y(c, y1) - Y(c, y0)) + 1); };
  band(c.oy - 10, b1, 1); band(b1, b2, 2); band(b2, GROUND, 3);
  // the sun: an octagon, placed by its angle
  const t = sun / LIGHT.sun, sx = LW / 2 + t * LW * 0.4, sy = 20 + Math.abs(t) * 14;
  const oct = (rad: number) => [0, 1, 2, 3, 4, 5, 6, 7].map((q): [number, number] => [sx + Math.cos(q * 0.785 + 0.39) * rad, sy + Math.sin(q * 0.785 + 0.39) * rad]);
  poly(g, oct(9), col('warm', 1)); poly(g, oct(6.5), col('warm', 2));
  // far hills, the sun's side lighter
  for (let q = 0; q < 4; q++) {
    const hx = ((q + hash(q, 1, seed)) / 4) * W, hh = 30 + 60 * hash(q, 2, seed), hw = 70 + 90 * hash(q, 3, seed), left = sun < 0;
    poly(g, [P(c, hx - hw, GROUND), P(c, hx - hw * 0.4, GROUND - hh * 0.55), P(c, hx, GROUND - hh), P(c, hx, GROUND)], col('sky', left ? 2 : 1));
    poly(g, [P(c, hx, GROUND - hh), P(c, hx + hw * 0.5, GROUND - hh * 0.5), P(c, hx + hw, GROUND), P(c, hx, GROUND)], col('sky', left ? 1 : 2));
  }
  // the soil: two facets per cell, seen cells lighter; gems in the seen pockets and stones
  const top = Y(c, GROUND);
  g.fillStyle = col('earth', 0); g.fillRect(0, Math.floor(top), LW, LH - top + 1);
  const c0 = Math.max(0, Math.floor(c.ox / CELL) - 1), c1 = Math.min(COLS, Math.ceil((c.ox + LW / c.k) / CELL) + 1);
  for (let r = 0; r < ROWS; r++) for (let cc = c0; cc < c1; cc++) {
    const i = r * COLS + cc, cell = plot.cells[i];
    const a = vtx(seed, cc, r), b = vtx(seed, cc + 1, r), d = vtx(seed, cc, r + 1), e = vtx(seed, cc + 1, r + 1);
    for (const tri of (cc + r) % 2 ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]]) {
      const L = lit(up(tri[0]), up(tri[1]), up(tri[2]), UNDER) > 0.8 ? 1 : 0;
      const lv = !cell.seen ? L : cell.kind === 'hard' ? 1 + L : 2 + L;
      poly(g, tri.map((p) => P(c, p[0], p[1])), col('earth', lv), true);
    }
    if (!cell.seen) continue;
    const full = cell.max ? cell.amount / cell.max : 0;
    if (cell.kind === 'stone') gem(g, c, i, 'stone', 0, 2, 0.9, 0.85);
    else if (i === plot.rich && full > 0.05) { gem(g, c, i, 'rare', 0, 0, 1.2, 0.8); gem(g, c, i, 'warm', 2, 2, 1.2, 0.25); }
    else if (cell.kind === 'water') gem(g, c, i, 'water', 0, full > 0.35 ? 1 : 0, 0.35, 0.35 + 0.5 * full);
    else if (cell.kind === 'nutrient') gem(g, c, i, 'warm', 0, full > 0.35 ? 1 : 0, 0.9, 0.3 + 0.45 * full);
    else if (cell.kind === 'hard') {
      const x = cc * CELL + CELL / 2, y = GROUND + r * CELL + CELL / 2;
      seg(g, c, x - 7, y - 4, x, y + 1, 1, 1, col('earth', 0), col('earth', 0), 0);
      seg(g, c, x, y + 1, x + 5, y - 5, 1, 1, col('earth', 0), col('earth', 0), 0);
    }
  }
  // the natives' roots
  for (const line of plot.roots) for (let k = 1; k < line.length; k++) seg(g, c, line[k - 1].x, line[k - 1].y, line[k].x, line[k].y, 1, 1, col('earth', 2), col('earth', 2), 0);
  // the ground strip, with tufts
  const [ramp, lo] = STRIP[plot.kind] ?? ['leaf', 3];
  for (let x = 0; x < W; x += CELL) {
    const d0 = 4 + hash(x, 0, 9) * 4, d1 = 4 + hash(x + CELL, 0, 9) * 4, i = (x / CELL) % 2 ? lo : lo - 1;
    poly(g, [P(c, x, GROUND - 1), P(c, x + CELL, GROUND - 1), P(c, x + CELL, GROUND + d1), P(c, x, GROUND + d0)], col(ramp, i), true);
    if (plot.kind !== LAVA && hash(x, 1, 9) > 0.5) poly(g, [P(c, x + 6, GROUND), P(c, x + 14, GROUND), P(c, x + 10, GROUND - 5 - 6 * hash(x, 2, 9))], col(ramp, lo));
  }
  // the signs over shallow pockets: a damp patch, a greener tuft, a stone poking out, a faint flower
  for (const s of plot.signs) {
    const f = 1 - s.depth;
    if (s.kind === 'damp') poly(g, [P(c, s.x - 6 - 5 * f, GROUND), P(c, s.x + 6 + 5 * f, GROUND), P(c, s.x + 4 + 3 * f, GROUND + 4), P(c, s.x - 4 - 3 * f, GROUND + 4)], col(f > 0.5 ? 'water' : 'sky', 0));
    else if (s.kind === 'tuft') for (const dx of [-5, 0, 5]) poly(g, [P(c, s.x + dx - 2, GROUND), P(c, s.x + dx + 2, GROUND), P(c, s.x + dx * 1.6, GROUND - 6 - 8 * f)], col('leaf', f > 0.5 ? 4 : 3));
    else if (s.kind === 'stone') {
      const w = 8 + 4 * f, h = 3 + 4 * f;
      poly(g, [P(c, s.x - w, GROUND + 1), P(c, s.x - w * 0.3, GROUND - h), P(c, s.x, GROUND + 1)], col('stone', 2));
      poly(g, [P(c, s.x - w * 0.3, GROUND - h), P(c, s.x + w * 0.7, GROUND - h * 0.6), P(c, s.x + w, GROUND + 1), P(c, s.x, GROUND + 1)], col('stone', 1));
    } else {
      seg(g, c, s.x, GROUND, s.x + 1, GROUND - 9, 1, 1, col('leaf', 2), col('leaf', 2), 0);
      const [fx, fy] = P(c, s.x + 1, GROUND - 10);
      g.fillStyle = col('rare', 0); g.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 2, 2);
    }
  }
}

// ---- compose: the selected sapling's shoots, their outline, the other bodies, else the world darker in the shade ----
/** One pass of a square grow (or shrink) of radius r along rows or columns, inside a box; outside it doesn't count. */
type Box = [number, number, number, number];
function pass(src: Uint8Array, r: number, grow: boolean, rows: boolean, [x0, y0, x1, y1]: Box) {
  const out = new Uint8Array(src.length), want = grow ? 1 : 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    let v = 1 - want;
    if (rows) { for (let d = Math.max(x0, x - r), e = Math.min(x1, x + r); d <= e; d++) if (src[y * LW + d] === want) { v = want; break; } }
    else for (let d = Math.max(y0, y - r), e = Math.min(y1, y + r); d <= e; d++) if (src[d * LW + x] === want) { v = want; break; }
    out[y * LW + x] = v;
  }
  return out;
}
/** The mask with its gaps narrower than 2r closed (grow, then shrink), in a box r + 1 around it: the outline then
 * traces only the silhouette. */
function shut(M: Uint8Array, r: number, [x0, y0, x1, y1]: Box) {
  if (x1 < x0) return M;
  const b: Box = [Math.max(0, x0 - r - 1), Math.max(0, y0 - r - 1), Math.min(LW - 1, x1 + r + 1), Math.min(LH - 1, y1 + r + 1)];
  return pass(pass(pass(pass(M, r, true, true, b), r, true, false, b), r, false, true, b), r, false, false, b);
}

const RGBA = new Uint32Array(new Uint8Array(F.rgb.flatMap(([r, g, b]) => [r, g, b, 255])).buffer); // index → a pixel

function compose(v: View, c: Cam, plot: Plot): ImageData {
  const dk = F.dk, a = v.back!, b = v.c.d, m = v.m.d, mark = pi('warm', 2);
  const img = v.img ?? v.g.createImageData(LW, LH), o = new Uint32Array(img.data.buffer);
  const D = plot.light.depth.map((d) => Math.exp(-d)), [s2, s1] = LOOK.shade, ground = Math.ceil(Y(c, GROUND + 4));
  const M = new Uint8Array(LW * LH), box: Box = [LW, LH, -1, -1];
  for (let i = 0; i < M.length; i++) if (m[i] !== EMPTY) {
    const x = i % LW, y = (i - x) / LW;
    M[i] = 1; box[0] = Math.min(box[0], x); box[1] = Math.min(box[1], y); box[2] = Math.max(box[2], x); box[3] = Math.max(box[3], y);
  }
  const S = shut(M, 2, box), edge = (i: number, x: number, y: number) => !S[i] && ((x > 0 && S[i - 1]) || (x < LW - 1 && S[i + 1]) || (y > 0 && S[i - LW]) || (y < LH - 1 && S[i + LW]));
  for (let y = 0, i = 0; y < LH; y++) {
    const wy = y / c.k + c.oy, fr = (GROUND - wy) / CELL - 0.5, r0 = Math.floor(fr), ty = fr - r0;
    const ra = Math.max(0, Math.min(SKY_ROWS - 1, r0)) * COLS, rb = Math.max(0, Math.min(SKY_ROWS - 1, r0 + 1)) * COLS;
    for (let x = 0; x < LW; x++, i++) {
      let j: number;
      if (M[i]) j = m[i];
      else if (edge(i, x, y)) j = mark;
      else if (b[i] !== EMPTY) j = b[i];
      else {
        j = a[i];
        if (y < ground) {
          const fc = (x / c.k + c.ox) / CELL - 0.5, c0 = Math.floor(fc), tx = fc - c0;
          const ca = Math.max(0, Math.min(COLS - 1, c0)), cb = Math.max(0, Math.min(COLS - 1, c0 + 1));
          const d = (D[ra + ca] * (1 - tx) + D[ra + cb] * tx) * (1 - ty) + (D[rb + ca] * (1 - tx) + D[rb + cb] * tx) * ty;
          const l = d + (dither(x, y) - 0.5) * 0.16;
          if (l < s2) j = dk[dk[j]];
          else if (l < s1) j = dk[j];
        }
      }
      o[i] = RGBA[j];
    }
  }
  return img;
}

// ---- overlays: glints, target paths, the aim, fed tips ----
function dots(g: Ctx, x0: number, y0: number, x1: number, y1: number, colour: string, phase: number) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
  g.fillStyle = colour;
  for (let s = 0; s <= n; s++) if ((s + phase) % 3 < 1.5) g.fillRect(Math.round(x0 + ((x1 - x0) * s) / n), Math.round(y0 + ((y1 - y0) * s) / n), 1, 1);
}
function spark(g: Ctx, x: number, y: number, colour: string, arm: number) {
  g.fillStyle = colour;
  g.fillRect(Math.round(x) - arm, Math.round(y), arm * 2 + 1, 1); g.fillRect(Math.round(x), Math.round(y) - arm, 1, arm * 2 + 1);
}

function overlay(g: Ctx, c: Cam, r: Run, aim: Aim | null, time: number) {
  const cells = r.plot.cells, phase = Math.floor(time * 8);
  // glints: hidden pockets just beyond what the roots revealed
  cells.forEach((cell, i) => {
    if (cell.seen || !isPocket(cell)) return;
    const cc = i % COLS, near = (cc > 0 && cells[i - 1].seen) || (cc < COLS - 1 && cells[i + 1].seen) || cells[i - COLS]?.seen || cells[i + COLS]?.seen;
    if (!near || hash(i, Math.floor(time * 2.5), 77) < 0.6) return;
    const [x, y] = P(c, cc * CELL + CELL / 2, GROUND + Math.floor(i / COLS) * CELL + CELL / 2);
    spark(g, x, y, col('warm', 2), 1);
  });
  // where each sapling's tips are heading
  r.stand.forEach((s, k) => s.plant.nodes.forEach((n) => {
    if (n.dead || !n.target) return;
    const [x0, y0] = P(c, n.x, n.y), [x1, y1] = P(c, n.target.x, n.target.y);
    dots(g, x0, y0, x1, y1, k === r.sel ? col('warm', 2) : col('stone', 1), phase);
  }));
  // fed tips sparkle
  for (const s of r.stand) {
    const p = s.plant;
    if (!p.feed || Math.floor(time * 6) % 2) continue;
    for (const i of subtree(p, p.feed.node)) if (p.nodes[i].state === 'tip') { const [x, y] = P(c, p.nodes[i].x, p.nodes[i].y); spark(g, x, y, col('warm', 2), 1); }
  }
  if (!aim) return;
  const p = r.stand[aim.sap]?.plant;
  if (p && aim.part > 0) for (const i of subtree(p, aim.part)) {
    const n = p.nodes[i];
    if (n.len) { g.fillStyle = col('warm', aim.ok ? 2 : 0); const [x, y] = P(c, n.x, n.y); g.fillRect(Math.round(x), Math.round(y), 1, 1); }
  }
  if (aim.path) {
    const [ax, ay, bx, by] = aim.path, [x0, y0] = P(c, ax, ay), [x1, y1] = P(c, bx, by), colour = aim.ok ? col('leaf', 4) : col('warm', 0);
    dots(g, x0, y0, x1, y1, colour, phase);
    const h = Math.round((CELL * c.k) / 2);
    g.fillStyle = colour;
    g.fillRect(Math.round(x1) - h, Math.round(y1) - h, h * 2, 1); g.fillRect(Math.round(x1) - h, Math.round(y1) + h - 1, h * 2, 1);
    g.fillRect(Math.round(x1) - h, Math.round(y1) - h, 1, h * 2); g.fillRect(Math.round(x1) + h - 1, Math.round(y1) - h, 1, h * 2);
  }
}
