// The look toy, look (a): flat low-poly polygons on a low-res canvas, each facet shaded by its angle to the sun,
// snapped to the palette and upscaled without smoothing. With `mix` (look c), the plants come from the rasterizer
// instead, and the ground gets a grass top that takes their shadows.
import {
  GLYPH, PLANTS, SOIL, WORLD, cellXY, cross, dot, hash, isleSize, norm, pi, sub, sunPos,
  type Flat, type Frame, type Look, type Part, type RampId, type V3,
} from './look-data';
import { ctx, drawIsle, hull, mk, poly, snapAll, lutOf, key, type Ctx, type P2 } from './look-2d';
import { BAND, Raster, SX, SY } from './look-raster';

const LIGHT_UNDER: V3 = norm([-0.5, 0.8, 0.9]); // the soil's fixed light (no sun underground)

// ---- plants: triangles shaded by facet angle and by the leaves between them and the sun ----
type Info = { pts: P2[]; cx: number; cy: number; r: number };
function infoOf(p: Part): Info {
  const pts: P2[] = [];
  let cx = 0, cy = 0;
  for (const t of p.tris) for (const v of t) pts.push([v[0], v[1]]), (cx += v[0]), (cy += v[1]);
  cx /= pts.length;
  cy /= pts.length;
  let r = 0;
  for (const q of pts) r = Math.max(r, Math.hypot(q[0] - cx, q[1] - cy));
  return { pts, cx, cy, r };
}
/** Leaf layers between each part and the sun (0–2), from the parts' bounding circles. */
function occlusion(parts: Part[], inf: Info[], s: P2): number[] {
  return parts.map((_, i) => {
    let k = 0;
    for (let j = 0; j < parts.length && k < 2; j++) {
      if (j === i || parts[j].kind === 'stem') continue;
      const dx = inf[j].cx - inf[i].cx, dy = inf[j].cy - inf[i].cy, t = dx * s[0] + dy * s[1];
      if (t > 0.3 && Math.abs(dx * s[1] - dy * s[0]) < inf[j].r * 0.8) k++;
    }
    return k;
  });
}
type Tri = { pts: P2[]; z: number; col: string };
function shade(parts: Part[], f: Flat, sun: V3, occ: number[] | null, px: (v: V3) => P2, out: Tri[]) {
  parts.forEach((p, k) => {
    let c: V3 = [0, 0, 0], n0 = 0;
    for (const t of p.tris) for (const v of t) (c = [c[0] + v[0], c[1] + v[1], c[2] + v[2]]), n0++;
    c = [c[0] / n0, c[1] / n0, c[2] / n0];
    const top = f.n[p.ramp] - 1;
    for (const t of p.tris) {
      let n = norm(cross(sub(t[1], t[0]), sub(t[2], t[0])));
      if (p.kind === 'leaf') {
        if (n[2] < 0) n = [-n[0], -n[1], -n[2]];
      } else {
        const m: V3 = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, (t[0][2] + t[1][2] + t[2][2]) / 3];
        if (dot(n, sub(m, c)) < 0) n = [-n[0], -n[1], -n[2]];
        if (n[2] < -0.05) continue;
      }
      const L = Math.max(0, dot(n, sun));
      const lv = 1 + (top - 1) * (0.15 + 0.85 * L) + p.bias - (occ ? occ[k] : 0);
      out.push({ pts: [px(t[0]), px(t[1]), px(t[2])], z: (t[0][2] + t[1][2] + t[2][2]) / 3, col: f.hex[pi(f, p.ramp, lv)] });
    }
  });
}

export function makeFlat(mix = false): Look {
  const side = mk(), isle = mk(), sg = ctx(side), R = new Raster();
  const BK = mix ? -BAND.back * SY : 0; // the far edge of the grass top, where the hills stand
  const A = mk(), B = mk(), C = mk(), ag = ctx(A), bg = ctx(B), cg = ctx(C);
  let W = 320, H = 240, k = 5, tp = 4;
  const X = (x: number) => x * k, Y = (y: number) => H / 2 - y * k, px = (v: V3): P2 => [X(v[0]), Y(v[1])];
  const col = (f: Flat, r: RampId, i: number) => f.hex[pi(f, r, i)];

  // the soil's jittered vertex grid (static)
  const vtx = (c: number, r: number): V3 => {
    const ex = c === 0 || c === SOIL.cols, ey = r === 0 || r === SOIL.rows;
    return [c * 2 + (ex ? 0 : (hash(c, r, 1) - 0.5) * 0.8), -r * 2 + (ey ? 0 : (hash(c, r, 2) - 0.5) * 0.8), hash(c, r, 3) * 1.3];
  };
  const lit = (a: V3, b: V3, c: V3) => {
    let n = norm(cross(sub(b, a), sub(c, a)));
    if (n[2] < 0) n = [-n[0], -n[1], -n[2]];
    return dot(n, LIGHT_UNDER);
  };
  /** A faceted gem in a cell: five facets around a raised apex, shaded by the soil's light. */
  function gem(g: Ctx, i: number, ramp: RampId, lo: number, hi: number, f: Flat, h = 0.9, rad = 0.85) {
    const c = i % SOIL.cols, r = (i / SOIL.cols) | 0, cx = c * 2 + 1, cy = -(r * 2 + 1);
    const ring: V3[] = [0, 1, 2, 3, 4].map((q) => {
      const a = (q / 5) * Math.PI * 2 + hash(c, r, 4) * 6, rr = rad * (0.8 + 0.3 * hash(c + q, r, 5));
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9, 0];
    });
    const ap: V3 = [cx - 0.12, cy + 0.12, h];
    for (let q = 0; q < 5; q++) {
      const a = ring[q], b = ring[(q + 1) % 5], L = lit(ap, a, b);
      poly(g, [px(ap), px(a), px(b)], col(f, ramp, L > 0.85 ? hi : L > 0.62 ? (lo + hi) / 2 : lo));
    }
  }

  function drawBack(f: Frame) {
    const F = f.flat, g = ag, sun = f.sun;
    g.fillStyle = col(F, 'sky', 1), g.fillRect(0, 0, W, Math.ceil(Y(14 + BK)));
    g.fillStyle = col(F, 'sky', 2), g.fillRect(0, Math.floor(Y(14 + BK)), W, Math.ceil(Y(6 + BK) - Y(14 + BK)) + 1);
    g.fillStyle = col(F, 'sky', 3), g.fillRect(0, Math.floor(Y(6 + BK)), W, Math.ceil(Y(0) - Y(6 + BK)) + 1);
    // the sun: an octagon
    const [sx, sy] = sunPos(f.sunF);
    const oct = (r: number) => [0, 1, 2, 3, 4, 5, 6, 7].map((q): P2 => [X(sx + Math.cos(q * 0.785 + 0.39) * r), Y(sy + Math.sin(q * 0.785 + 0.39) * r)]);
    poly(g, oct(2.1), col(F, 'warm', 1)), poly(g, oct(1.6), col(F, 'warm', 2));
    // far hills and a volcano, facets lit by the sun's side
    const hills: [number, number, number][] = [[8, 5, 9], [24, 3.5, 8], [47, 8, 9], [62, 4, 7]];
    hills.forEach(([hx, hh, hw], q) => {
      const b = BK, peak: V3 = [hx, hh + b, 0], l: V3 = [hx - hw, b, 0], r: V3 = [hx + hw, b, 0], m1: V3 = [hx - hw * 0.45, hh * 0.55 + b, 0], m2: V3 = [hx + hw * 0.5, hh * 0.5 + b, 0];
      const left = sun[0] < 0;
      poly(g, [px(l), px(m1), px(peak), [X(hx), Y(b)]], col(F, 'sky', left ? 1 : 0));
      poly(g, [px(peak), px(m2), px(r), [X(hx), Y(b)]], col(F, 'sky', left ? 0 : 1));
      if (q === 2) poly(g, [px([hx - 0.9, hh - 0.6 + b, 0]), px([hx + 0.9, hh - 0.6 + b, 0]), px([hx + 0.5, hh + b, 0]), px([hx - 0.5, hh + b, 0])], col(F, 'warm', 0));
    });
    // the ground strip, lit from above
    const gl = sun[1] > 0.5 ? 3 : 2;
    if (mix) {
      // the grass top, seen from a little above (the 3D look's ground)
      const zs = [BAND.back, -11, -9, -7, -5, -3, -1, BAND.front], G = (x: number, z: number): P2 => [X(x + z * SX), Y(-z * SY)];
      for (let x = -4; x < WORLD.w + 4; x += 2)
        for (let j = 0; j < zs.length - 1; j++) {
          const a = G(x, zs[j]), b = G(x + 2, zs[j]), c = G(x + 2, zs[j + 1]), d = G(x, zs[j + 1]);
          poly(g, [a, b, c], col(F, 'leaf', hash(x, j, 61) > 0.3 ? gl : gl - 1), true);
          poly(g, [a, c, d], col(F, 'leaf', hash(x, j, 62) > 0.3 ? gl : gl - 1), true);
        }
    }
    for (let x = 0; x < WORLD.w; x += 2) {
      const d0 = -0.5 - hash(x, 0, 9) * 0.4, d1 = -0.5 - hash(x + 2, 0, 9) * 0.4;
      poly(g, [[X(x), Y(0)], [X(x + 2), Y(0)], [X(x + 2), Y(d1)], [X(x), Y(d0)]], col(F, 'leaf', x % 4 ? gl : gl - 1), true);
      if (hash(x, 1, 9) > 0.55) poly(g, [[X(x + 0.6), Y(0)], [X(x + 1.4), Y(0)], [X(x + 1), Y(0.7 + hash(x, 2, 9))]], col(F, 'leaf', gl));
    }
    // the soil: two facets per cell
    const top = Y(-0.45);
    g.save();
    g.beginPath(), g.rect(0, top, W, H - top), g.clip();
    g.fillStyle = col(F, 'earth', 0), g.fillRect(0, top, W, H - top);
    for (let r = 0; r < SOIL.rows; r++)
      for (let c = 0; c < SOIL.cols; c++) {
        const i = r * SOIL.cols + c, cell = f.soil.cells[i], seen = f.revealed[i];
        const a = vtx(c, r), b = vtx(c + 1, r), d = vtx(c, r + 1), e = vtx(c + 1, r + 1);
        const tris = (c + r) % 2 ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]];
        for (const t of tris) {
          const L = lit(t[0], t[1], t[2]) > 0.8 ? 1 : 0;
          const lv = !seen ? L : cell === 'hard' ? 1 + L : 2 + L;
          poly(g, t.map(px), col(F, 'earth', lv), true);
        }
        if (!seen) continue;
        const fd = f.found.has(f.soil.pocket[i]) ? 1 : 0;
        if (cell === 'stone') gem(g, i, 'stone', 0, 2, F);
        if (cell === 'water') gem(g, i, 'water', fd, 1, F, 0.35, 0.8);
        if (cell === 'food') gem(g, i, 'warm', fd, 1 + fd, F, 0.9, 0.7);
        if (cell === 'rare') gem(g, i, 'rare', 0, 0, F, 1.2, 0.8), gem(g, i, 'warm', 2, 2, F, 1.2, 0.25);
        if (cell === 'hard') {
          const [cx, cy] = [c * 2 + 1, -(r * 2 + 1)];
          g.strokeStyle = col(F, 'earth', 0), g.lineWidth = 1, g.beginPath();
          g.moveTo(X(cx - 0.7), Y(cy + 0.4)), g.lineTo(X(cx), Y(cy - 0.1)), g.lineTo(X(cx + 0.5), Y(cy + 0.5)), g.stroke();
        }
      }
    g.restore();
  }

  function drawShadows(f: Frame, parts: Part[], inf: Info[], s: P2) {
    const g = bg;
    g.clearRect(0, 0, W, H);
    if (!f.shadows || mix) return;
    g.save();
    g.beginPath(), g.rect(0, 0, W, Y(-0.5)), g.clip();
    g.globalCompositeOperation = 'lighter';
    const D: P2 = [-s[0] * 90, -s[1] * 90];
    parts.forEach((p, i) => {
      const pts = inf[i].pts;
      const h = hull(pts.concat(pts.map((q): P2 => [q[0] + D[0], q[1] + D[1]])));
      poly(g, h.map((q): P2 => [X(q[0]), Y(q[1])]), p.owner === f.selected ? 'rgb(80,120,0)' : 'rgb(80,0,0)');
    });
    g.restore();
  }

  function drawFront(f: Frame, parts: Part[], inf: Info[], s: P2) {
    const F = f.flat, g = cg;
    g.clearRect(0, 0, W, H);
    // roots
    f.soil.roots.forEach((rt, q) => {
      const p = f.progress[q];
      if (p <= 0) return;
      const nodes: P2[] = (rt.from ? [[rt.from[0], -0.3] as P2] : []).concat(rt.path.map((i) => cellXY(i)));
      const segs = nodes.length - 1, tip = (p / rt.path.length) * segs, colr = col(F, 'earth', rt.native ? 3 : 4);
      for (let i = 0; i < segs && i < tip; i++) {
        const a = nodes[i], b0 = nodes[i + 1], u = Math.min(1, tip - i), b: P2 = [a[0] + (b0[0] - a[0]) * u, a[1] + (b0[1] - a[1]) * u];
        const w0 = 0.34 - (0.2 * i) / segs, w1 = 0.34 - (0.2 * (i + u)) / segs;
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        poly(g, [[X(a[0] + nx * w0), Y(a[1] + ny * w0)], [X(b[0] + nx * w1), Y(b[1] + ny * w1)], [X(b[0] - nx * w1), Y(b[1] - ny * w1)], [X(a[0] - nx * w0), Y(a[1] - ny * w0)]], colr);
        if (i + 1 >= tip && p < rt.path.length && !rt.native) (g.fillStyle = col(F, 'warm', 2)), g.fillRect(Math.round(X(b[0])) - 1, Math.round(Y(b[1])) - 1, 2, 2);
      }
    });
    // hint numbers
    const ds = Math.max(1, Math.round((2 * k) / 7));
    f.hints.forEach((n, i) => {
      if (n <= 0) return;
      const c = i % SOIL.cols, r = (i / SOIL.cols) | 0, x0 = Math.round(X(c * 2 + 1) - 1.5 * ds), y0 = Math.round(Y(-(r * 2 + 1)) - 2.5 * ds);
      const dc = col(F, n === 1 ? 'water' : n === 2 ? 'leaf' : n === 3 ? 'warm' : 'rare', n === 2 ? 4 : n === 1 ? 1 : 1);
      for (const [ox, oy, cc] of [[ds, ds, col(F, 'ink', 0)], [0, 0, dc]] as [number, number, string][]) {
        g.fillStyle = cc;
        for (let b = 0; b < 15; b++) if (GLYPH[Math.min(8, n)][b] === '1') g.fillRect(x0 + ox + (b % 3) * ds, y0 + oy + ((b / 3) | 0) * ds, ds, ds);
      }
    });
    // plants, far facets first
    if (!mix) {
      const tris: Tri[] = [];
      shade(parts, F, f.sun, f.shadows ? occlusion(parts, inf, s) : null, px, tris);
      tris.sort((a, b) => a.z - b.z);
      for (const t of tris) poly(g, t.pts, t.col);
    }
    // pops: a ring and sparks
    for (const p of f.pops) {
      const [cx, cy] = cellXY(p.cell), a = p.age, pc = col(F, p.kind === 'water' ? 'water' : p.kind === 'rare' ? 'rare' : 'warm', p.kind === 'water' ? 1 : 2);
      if (a < 0.15) poly(g, [0, 1, 2, 3].map((q): P2 => [X(cx + Math.cos(q * 1.57 + 0.78) * 1.2), Y(cy + Math.sin(q * 1.57 + 0.78) * 1.2)]), col(F, 'warm', 2));
      g.strokeStyle = pc, g.lineWidth = 1, g.beginPath(), g.arc(X(cx), Y(cy), (0.4 + a * 2.6) * k, 0, Math.PI * 2), g.stroke();
      if (a < 0.6 || Math.floor(a * 20) % 2) {
        g.fillStyle = pc;
        for (let q = 0; q < 8; q++) {
          const an = q * 0.785 + hash(p.cell, q, 3), d = a * (2.5 + hash(q, p.cell, 4) * 2);
          g.fillRect(Math.round(X(cx + Math.cos(an) * d)), Math.round(Y(cy + Math.sin(an) * d)), q % 3 ? 1 : 2, q % 3 ? 1 : 2);
        }
      }
    }
    // the selected plant's marker
    let topY = 0;
    parts.forEach((p, i) => p.owner === f.selected && (topY = Math.max(topY, inf[i].cy + inf[i].r)));
    const mx = X(PLANTS[f.selected].x), my = Y(topY + 1.2) + Math.round(Math.sin(f.time * 4));
    const m = Math.max(2, Math.round(k * 0.6));
    poly(g, [[mx - m - 1, my - m - 1], [mx + m + 1, my - m - 1], [mx, my + 1]], col(F, 'ink', 0));
    poly(g, [[mx - m, my - m], [mx + m, my - m], [mx, my]], col(F, 'warm', 2));
  }

  /** One pass: the front layer where opaque, else the back layer darkened by its shadow count. */
  function compose(f: Frame) {
    const F = f.flat, lut = lutOf(F), dk = F.dk;
    const a = ag.getImageData(0, 0, W, H).data, b = bg.getImageData(0, 0, W, H).data, c = cg.getImageData(0, 0, W, H).data;
    const out = sg.createImageData(W, H), o = out.data, mark = pi(F, 'warm', 2), sel = f.selected, ri = R.idx, rd = R.dep, gs = R.gsh;
    for (let p = 0, i = 0; p < o.length; p += 4, i++) {
      let j: number;
      const x = i % W;
      if (c[p + 3] >= 128) j = lut[key(c, p)];
      else if (mix && ri[i]) {
        // a plant facet; a dark edge where a nearer facet starts next to it
        j = ri[i] - 1;
        const d = rd[i] + 1;
        if ((x > 0 && ri[i - 1] && rd[i - 1] > d) || (x < W - 1 && ri[i + 1] && rd[i + 1] > d) || (ri[i - W] && rd[i - W] > d) || (ri[i + W] && rd[i + W] > d)) j = dk[j];
      } else if (mix) {
        // the world, darker in a plant's shadow on the grass top, with a soft outline around the plants
        j = lut[key(a, p)];
        const sh = gs[i];
        if (sh >= 0) {
          j = dk[dk[j]];
          if (sh === sel && (i + ((i / W) | 0)) % 2 === 0 && ((x > 0 && gs[i - 1] !== sel) || (x < W - 1 && gs[i + 1] !== sel) || gs[i - W] !== sel || gs[i + W] !== sel)) j = mark;
        }
        if ((x > 0 && ri[i - 1]) || (x < W - 1 && ri[i + 1]) || ri[i - W] || ri[i + W]) j = dk[j];
      } else {
        j = lut[key(a, p)];
        const m = b[p];
        if (m >= 150) j = dk[dk[j]];
        else if (m >= 60) j = dk[j];
        if (b[p + 1] >= 100 && (i + ((i / W) | 0)) % 2 === 0) {
          if ((x > 0 && b[p - 3] < 100) || (x < W - 1 && b[p + 5] < 100) || (i >= W && b[p + 1 - W * 4] < 100) || (i < W * (H - 1) && b[p + 1 + W * 4] < 100)) j = mark;
        }
      }
      const cc = F.rgb[j];
      (o[p] = cc[0]), (o[p + 1] = cc[1]), (o[p + 2] = cc[2]), (o[p + 3] = 255);
    }
    // motes drift in the light and vanish in shade
    for (let q = 0; q < 18; q++) {
      const t = f.time, wx = ((hash(q, 0, 21) * 70 + Math.sin(t * 0.6 + q) * 1.5) % 64 + 64) % 64, wy = 1 + ((t * 0.5 + hash(q, 1, 21) * 20) % 16);
      const x = Math.round(X(wx)), y = Math.round(Y(wy));
      if (x < 0 || x >= W || y < 0 || y >= H || Math.sin(t * 2 + q * 3) < -0.2) continue;
      const p = (y * W + x) * 4;
      if (c[p + 3] < 128 && (mix ? !ri[y * W + x] && R.sunlit([wx, wy, -2]) : b[p] < 60)) {
        const cc = F.rgb[mark];
        (o[p] = cc[0]), (o[p + 1] = cc[1]), (o[p + 2] = cc[2]);
      }
    }
    sg.putImageData(out, 0, 0);
  }

  let lastIsle = -1;
  return {
    side, isle,
    resize(w: number) {
      W = w, H = Math.round(w * 0.75), k = W / WORLD.w;
      for (const c of [side, A, B, C]) (c.width = W), (c.height = H);
      const [iw, ih, t] = isleSize(w);
      (isle.width = iw), (isle.height = ih), (tp = t), (lastIsle = -1);
      R.resize(W, H, k);
    },
    draw(f: Frame) {
      const sun2 = norm([f.sun[0], f.sun[1], 0]), s: P2 = [sun2[0], sun2[1]], inf = f.parts.map(infoOf);
      drawBack(f);
      drawShadows(f, f.parts, inf, s);
      drawFront(f, f.parts, inf, s);
      if (mix) R.shadow(f.parts, f.sun, f.shadows), R.plants(f.parts, f.flat, f.sun), R.ground();
      compose(f);
      if (f.time - lastIsle > 0.06 || f.time < lastIsle) (lastIsle = f.time), drawIsle(isle, f, tp);
    },
    pick(x: number, y: number, f: Frame) {
      const sc = side.clientWidth / W, wx = x / sc / k, wy = (H / 2 - y / sc) / k;
      let best = -1, bd = Infinity;
      PLANTS.forEach((g, o) => {
        let x0 = g.x - 1.5, x1 = g.x + 1.5, y1 = 1;
        f.parts.forEach((p) => p.owner === o && p.tris.forEach((t) => t.forEach((v) => ((x0 = Math.min(x0, v[0])), (x1 = Math.max(x1, v[0])), (y1 = Math.max(y1, v[1]))))));
        if (wx < x0 - 0.8 || wx > x1 + 0.8 || wy > y1 + 0.8 || wy < -8) return;
        const d = Math.abs(wx - g.x);
        if (d < bd) (bd = d), (best = o);
      });
      return best;
    },
  };
}

/** The selected plant alone, framed for the species card, with motes like the reference card. */
export function portrait(cv: HTMLCanvasElement, f: Frame) {
  const g = ctx(cv), F = f.flat, W = cv.width, H = cv.height, parts = f.parts.filter((p) => p.owner === f.selected);
  g.fillStyle = F.hex[pi(F, 'ink', 0)], g.fillRect(0, 0, W, H);
  for (let q = 0; q < 10; q++) {
    if (Math.sin(f.time * 1.7 + q * 2.1) < 0) continue;
    g.fillStyle = F.hex[pi(F, q % 3 ? 'warm' : 'stone', 2)];
    g.fillRect(Math.floor(hash(q, 5, 40) * W), Math.floor(((hash(q, 6, 40) * H - f.time * 3 * (0.5 + hash(q, 7, 40))) % H + H) % H), 1, 1);
  }
  if (!parts.length) return;
  let x0 = Infinity, x1 = -Infinity, y0 = 0, y1 = -Infinity;
  for (const p of parts) for (const t of p.tris) for (const v of t) (x0 = Math.min(x0, v[0])), (x1 = Math.max(x1, v[0])), (y1 = Math.max(y1, v[1])), (y0 = Math.min(y0, v[1]));
  const s = Math.min((W - 8) / (x1 - x0 || 1), (H - 8) / (y1 - y0 || 1), 7), cx = (x0 + x1) / 2;
  const tris: Tri[] = [];
  shade(parts, F, f.sun, null, (v) => [W / 2 + (v[0] - cx) * s, H - 4 - (v[1] - y0) * s], tris);
  tris.sort((a, b) => a.z - b.z);
  for (const t of tris) poly(g, t.pts, t.col);
  g.fillStyle = F.hex[pi(F, 'earth', 2)], g.fillRect(0, Math.round(H - 4 + y0 * s), W, 4);
  snapAll(g, W, H, F);
}
