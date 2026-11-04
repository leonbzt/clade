// The bodies in the 2D low-poly look: the patch's natives (crowns as faceted fans, lit by the sun and by the light
// grid) and the saplings (stems as two-facet quads, leaves as two facets coloured by their light, roots).
import { shape } from '../data/genes';
import { GROUND, type Neighbour } from '../data/run';
import { lightAt, type Light } from '../sim/run/light';
import type { Node, Plant } from '../sim/run/plant';
import { P, col, hash, lit, poly, rect, sunV, type Cam, type Out, type P2, type V3 } from './flat';
import type { RampId } from '../data/palette';

/** A segment a → b (world) as a quad w0 → w1 wide (low-res px), split lengthwise into a lit and a shaded facet. */
export function seg(g: Out, c: Cam, ax: number, ay: number, bx: number, by: number, w0: number, w1: number, hi: string, lo: string, sun: number) {
  const A = P(c, ax, ay), B = P(c, bx, by), dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l, h0 = Math.max(0.6, w0 / 2), h1 = Math.max(0.6, w1 / 2);
  if (w0 < 2.2 && w1 < 2.2) {
    poly(g, [[A[0] + nx * h0, A[1] + ny * h0], [B[0] + nx * h1, B[1] + ny * h1], [B[0] - nx * h1, B[1] - ny * h1], [A[0] - nx * h0, A[1] - ny * h0]], hi);
    return;
  }
  const lightSide = nx * Math.sin(sun) - ny * Math.cos(sun) > 0; // the +n half faces the sun
  poly(g, [A, B, [B[0] + nx * h1, B[1] + ny * h1], [A[0] + nx * h0, A[1] + ny * h0]], lightSide ? hi : lo);
  poly(g, [A, B, [B[0] - nx * h1, B[1] - ny * h1], [A[0] - nx * h0, A[1] - ny * h0]], lightSide ? lo : hi);
}

/** A faceted fan: a ring of points around a raised centre, each facet lit by the sun and by the grid's light there. */
function fan(g: Out, c: Cam, L: Light, cx: number, cy: number, rx: number, ry: number, n: number, seed: number, ramp: RampId, top: number, flat = false) {
  const S = sunV(L.sun), z = Math.min(rx, ry) * 0.9;
  const ring: V3[] = [];
  for (let q = 0; q < n; q++) {
    const a = (q / n) * Math.PI * 2 + hash(seed, q, 1) * 0.5, j = 0.8 + 0.35 * hash(seed, q, 2);
    const y = cy + Math.sin(a) * ry * j;
    ring.push([cx + Math.cos(a) * rx * j, flat ? Math.min(y, GROUND) : y, 0]);
  }
  const ap: V3 = [cx, cy, z];
  for (let q = 0; q < n; q++) {
    const a = ring[q], b = ring[(q + 1) % n];
    const f = lit([ap[0], -ap[1], ap[2]], [a[0], -a[1], 0], [b[0], -b[1], 0], S);
    const mx = (ap[0] + a[0] + b[0]) / 3, my = (ap[1] + a[1] + b[1]) / 3, b2 = f * lightAt(L, mx, my);
    const lv = b2 > 0.62 ? top : b2 > 0.4 ? top - 1 : b2 > 0.2 ? top - 2 : top - 3;
    poly(g, [P(c, ap[0], ap[1]), P(c, a[0], a[1]), P(c, b[0], b[1])], col(ramp, lv), true);
  }
}

export function drawNative(g: Out, c: Cam, nb: Neighbour, grow: number, L: Light) {
  const h = nb.h * grow, x = nb.x, s = Math.round(x);
  if (nb.kind === 'tree') {
    seg(g, c, x, GROUND, x + (hash(s, 0, 7) - 0.5) * 10, GROUND - h * 0.62, nb.w * 0.08, nb.w * 0.05, col('earth', 3), col('earth', 2), L.sun);
    const ry = h * 0.26, cy = GROUND - h + ry;
    for (let q = 0; q < 6; q++) {
      const a = hash(s, q, 3) * Math.PI * 2, d = q ? 0.55 : 0;
      fan(g, c, L, x + Math.cos(a) * nb.w * 0.28 * d, cy + Math.sin(a) * ry * 0.7 * d + (q ? ry * 0.15 : 0), nb.w * 0.3, ry * 0.8, 8, s + q, 'leaf', 3);
    }
  } else if (nb.kind === 'shrub' || nb.kind === 'fern') {
    for (let q = 0; q < 4; q++) {
      const t = (q + 0.5) / 4 - 0.5, hh = h * (0.75 + 0.25 * (1 - Math.abs(t) * 2));
      fan(g, c, L, x + t * nb.w * 0.7, GROUND - hh * 0.55, nb.w * 0.22, hh * 0.5, 7, s + q, 'leaf', nb.kind === 'fern' ? 3 : 2, true);
    }
  } else if (nb.kind === 'sedge' || nb.kind === 'grass') {
    const [hi, lo] = nb.kind === 'grass' ? [col('earth', 4), col('earth', 3)] : [col('leaf', 3), col('leaf', 2)];
    for (let q = -8; q <= 8; q++) {
      const bx = x + (q * nb.w) / 18, bh = h * (0.7 + 0.3 * hash(s, q + 9, 4)), lean = q * 1.6 + (hash(s, q, 5) - 0.5) * 8;
      const B = P(c, bx, GROUND), T = P(c, bx + lean, GROUND - bh), w = Math.max(0.8, 2.4 * c.k);
      poly(g, [[B[0] - w, B[1]], [B[0] + w, B[1]], T], q % 2 ? hi : lo);
    }
  } else {
    fan(g, c, L, x, GROUND, nb.w / 2, h + 2, 9, s, nb.kind === 'lichen' ? 'stone' : 'leaf', 2, true);
  }
}

/** The colours of a sapling's leaves: by their light; a wilting sapling's go pale. */
function leafCols(n: Node, wilt: boolean): [string, string] {
  if (wilt) return [col('leaf', 4), col('earth', 4)];
  const lv = 1 + Math.round(3 * n.light);
  return [col('leaf', lv), col('leaf', lv - 1)];
}

/** A sapling: roots (in `root`), stems, leaves, tips and buds; or only its roots, or only its shoots. */
export function drawPlant(g: Out, c: Cam, p: Plant, sun: number, root: string, part: 'all' | 'roots' | 'shoots' = 'all') {
  const breadth = shape(p.genes, 'breadth'), red = shape(p.genes, 'tint') > 0.55, wilt = p.flow.wilting, k = c.k;
  const stem: [string, string] = red ? [col('earth', 4), col('earth', 3)] : [col('leaf', 2), col('leaf', 1)];
  const wood: [string, string] = [col('earth', 3), col('earth', 2)];
  for (const n of p.nodes) {
    if (n.dead || n.parent < 0 || n.len === 0) continue;
    const q = p.nodes[n.parent];
    if (n.kind === 'root') {
      if (part === 'shoots') continue;
      const w = Math.max(1, n.thick * 0.9 * k);
      seg(g, c, q.x, q.y, n.x, n.y, w, w, root, root, sun);
    } else if (part !== 'roots') {
      const w = Math.max(1, n.thick * 1.3 * k), cs = n.wood > 0.3 ? wood : stem;
      seg(g, c, q.x, q.y, n.x, n.y, w, w, cs[0], cs[1], sun);
    }
  }
  for (const n of p.nodes) {
    if (part === 'roots' || n.dead || n.kind !== 'shoot' || !n.leaf || !n.len) continue;
    const a = n.heading + (n.side || 1) * 0.9, len = Math.max(2.6, (3 + n.leaf * 2.2) * k * 1.2), wd = len * 0.42 * breadth;
    const B = P(c, n.x, n.y), dx = Math.cos(a), dy = Math.sin(a), T: P2 = [B[0] + dx * len, B[1] + dy * len];
    const M1: P2 = [B[0] + dx * len * 0.4 - dy * wd, B[1] + dy * len * 0.4 + dx * wd], M2: P2 = [B[0] + dx * len * 0.4 + dy * wd, B[1] + dy * len * 0.4 - dx * wd];
    const [hi, lo] = leafCols(n, wilt), up = M1[1] < M2[1]; // the upper facet catches the sun
    poly(g, [B, M1, T], up ? hi : lo);
    poly(g, [B, T, M2], up ? lo : hi);
  }
  const d = Math.max(1, Math.round(k * 2));
  for (const n of p.nodes) {
    if (n.dead || (part === 'roots' && n.kind !== 'root') || (part === 'shoots' && n.kind === 'root')) continue;
    const [x, y] = P(c, n.x, n.y);
    if (n.state === 'tip') rect(g, Math.round(x), Math.round(y), d, d, n.kind === 'shoot' ? col('leaf', 4) : col('stone', 2));
    else if (n.state === 'bud' && n.kind === 'shoot' && p.form !== 'moss') rect(g, Math.round(x), Math.round(y), d, d, col('leaf', 4));
  }
}
