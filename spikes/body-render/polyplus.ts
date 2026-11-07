// A spike: low-res low poly done fresh. Fewer, larger, coherent facets; warmer ramps; the outline is one exact pixel from a
// single pass, so the shapes stop paying for polygons of ink; the floor is one baked picture. Throwaway.
import { Container, Graphics, RenderTexture, type Application } from 'pixi.js';
import { COLS, ROWS } from '../../game/src/data/life';
import { known, type Life } from '../../game/src/sim/life';
import { C, LIGHT, PAL, SHADOW, dome, flat, hash, ring, tri, type P3, type Ramp } from '../../game/src/view/shade';
import type { Body } from '../../toys/creature-body';
import { spanAt } from '../../toys/creature-model';
import { DRAW, drawnOver } from '../../toys/creature-parts';
import { StylePen, cozy, outlineFilter } from './looks';
import { groundTypes } from './pixel-floor';

export function polyBody(b: Body, g: StylePen, sh: Graphics) {
  b.segs();
  const r = b.ramp, lin = b.lin, any = b as any, L = b.L, was = LIGHT.k;
  LIGHT.k = 3.3; g.map = (c) => (c === PAL.ink ? r[1] : c);
  any.shadow(sh);
  const parts = (over: boolean) => { for (const a of b.anchors) if (drawnOver(a) === over) DRAW[a.part](b, g, a, r); };
  parts(false);
  if (lin.head?.antennae) any.antennae(g, r);
  if (lin.skin === 'bead') {
    const J = b.segs(), n = J.length;
    for (let k = n - 1; k >= 0; k--) { const j = J[k], q = j.r * b.swell(k / (n - 1)); dome(g, ring(j.x, j.y, q * 1.06, q, 6, j.a), j.x - q * 0.15, j.y - q * 0.2, q * 0.8, r, k % 2 ? -0.25 : 0.15); }
    const j = J[0], m = j.r * 0.62; flat(g, ring(j.x + Math.cos(j.a) * m, j.y + Math.sin(j.a) * m, j.r * 0.28, j.r * 0.28, 5, j.a), r[0]);
  } else {
    const n = Math.max(3, spanAt(lin.plates, b.size, 5)), z = lin.ridge ?? 3 + b.R * 0.35;
    // one row per plate, with a shoulder between the ridge and the edge: long clean facets that read as a volume
    const row = (i: number): P3[] => { const f = i / n, w = b.w(f) * b.swell(f); return [b.P(f * L, -w, 0.5), b.P(f * L, -w * 0.55, z * 0.8), b.P(f * L, 0, z), b.P(f * L, w * 0.55, z * 0.8), b.P(f * L, w, 0.5)]; };
    const first = row(0), last = row(n), nose = b.P(-b.w(0) * 0.7, 0, z * 0.45), tip = b.P(L + b.w(1) * 0.7, 0, z * 0.45);
    for (let k = 0; k < 4; k++) { tri(g, nose, first[k], first[k + 1], r, 0.1); tri(g, tip, last[k + 1], last[k], r, -0.1); }
    for (let i = 0; i < n; i++) {
      const p = row(i), q = row(i + 1), bias = i % 2 ? -0.2 : 0.2;
      for (let k = 0; k < 4; k++) { tri(g, p[k], q[k], q[k + 1], r, bias); tri(g, p[k], q[k + 1], p[k + 1], r, bias); }
    }
    if (lin.lobes) for (const s of [-1, 1]) { const a = b.P(0.3 * L, s * b.R * 0.34), e = b.P(0.94 * L, s * b.R * 0.2); g.moveTo(a[0], a[1]).lineTo(e[0], e[1]).stroke({ width: 0.8, color: r[1] }); }
  }
  if (lin.head) any.shield(g, r);
  parts(true);
  LIGHT.k = was; g.map = null;
}

/** The floor, drawn once into a texture the size of the board. Bigger facets, no noise textures, tiles that read. */
export function bakePolyFloor(app: Application, life: Life, art: number) {
  const sand = cozy(life.hab.ground === 'basalt' ? PAL.ash : PAL.sand), rockR = cozy(life.hab.ground === 'basalt' ? PAL.basalt : PAL.rock), mudSeen = cozy(PAL.mudSeen), mudDark = cozy(PAL.mudDark), vent = cozy(PAL.vent);
  const H = C / 2, NX = COLS * 2 + 1, NY = ROWS * 2 + 1, base = { sand: 0, mud: -1.5, rock: -0.4, dead: -1.2 } as const, was = LIGHT.k, G = groundTypes(life);
  const tile = (i: number, j: number) => { const n = Math.min(ROWS - 1, Math.max(0, Math.floor(j / 2))) * COLS + Math.min(COLS - 1, Math.max(0, Math.floor(i / 2))); return { t: G[n], seen: life.tiles[n].seen }; };
  const V: P3[] = [];
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const inner = i > 0 && j > 0 && i < NX - 1 && j < NY - 1, corner = i % 2 === 0 && j % 2 === 0, jit = corner || !inner ? 0 : 2.4;
    let z = 0, n = 0;
    for (const [di, dj] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) { if (i % 2 && di) continue; if (j % 2 && dj) continue; z += base[tile(i + di, j + dj).t]; n++; }
    z = z / n + (hash(i, j, 3) - 0.5) * 1.5 - (i % 2 && j % 2 && tile(i, j).t === 'mud' ? 0.8 : 0);
    V.push([i * H + (hash(i, j, 1) - 0.5) * 2 * jit, j * H + (hash(i, j, 2) - 0.5) * 2 * jit, z]);
  }
  LIGHT.k = 3.6;
  const ground = new Graphics(), top = new StylePen();
  for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
    const t = tile(i, j), ramp: Ramp = t.t === 'mud' ? (t.seen ? mudSeen : mudDark) : t.t === 'dead' ? vent : sand, check = (Math.floor(i / 2) + Math.floor(j / 2)) % 2 ? 0.16 : -0.1;
    const a = V[j * NX + i], b = V[j * NX + i + 1], c = V[(j + 1) * NX + i + 1], d = V[(j + 1) * NX + i];
    if (hash(i, j, 4) < 0.5) { tri(ground, a, b, c, ramp, check); tri(ground, a, c, d, ramp, check); } else { tri(ground, a, b, d, ramp, check); tri(ground, b, c, d, ramp, check); }
  }
  LIGHT.k = 3.3;
  const shade = new Graphics(); shade.alpha = 0.3;
  life.tiles.forEach((t, i) => {
    const x = i % COLS, y = Math.floor(i / COLS), cx = x * C + H, cy = y * C + H;
    if (t.t === 'rock') {
      const tall = 8, ring0 = ring(cx, cy, C * 0.44, C * 0.4, 7, hash(x, y, 6) * 6, i, 0.22), mid = ring(cx - 1, cy - 1.5, C * 0.25, C * 0.22, 5, hash(x, y, 7) * 6, i + 50, 0.2);
      flat(shade, ring0.map(([a, b]) => [a + tall * SHADOW.x, b + tall * SHADOW.y]), PAL.ink);
      for (let k = 0; k < ring0.length; k++) { const a = ring0[k], b = ring0[(k + 1) % ring0.length], m = mid[Math.floor((k / ring0.length) * mid.length)], m2 = mid[Math.floor(((k + 1) / ring0.length) * mid.length) % mid.length]; tri(top, [a[0], a[1], 1], [b[0], b[1], 1], [m[0], m[1], tall], rockR, 0.3); if (m !== m2) tri(top, [b[0], b[1], 1], [m2[0], m2[1], tall], [m[0], m[1], tall], rockR, 0.3); }
      dome(top, mid, cx - 2, cy - 2.5, 3.5, rockR, 0.5, 1, tall);
    }
    if (!t.node || !known(t)) return;
    if (t.node === 'mat' || t.node === 'bloom') { const ramp = cozy(t.node === 'mat' ? PAL.leaf : PAL.bloom); for (let k = 0; k < 4; k++) { const ox = (hash(i, k, 11) - 0.5) * 11, oy = (hash(i, k, 12) - 0.5) * 11, r = 4 + hash(i, k, 13) * 3; flat(shade, ring(cx + ox + 1.5, cy + oy + 2, r, r * 0.85, 5, k), PAL.ink); dome(top, ring(cx + ox, cy + oy, r, r * 0.85, 5, k, i * 9 + k, 0.3), cx + ox - 0.5, cy + oy - 0.5, 2.2, ramp, 0.2); } }
    else if (t.node === 'buried') for (let k = 0; k < 3; k++) { const ox = (k - 1) * 4.5, oy = (hash(i, k, 17) - 0.5) * 4; flat(shade, ring(cx + ox + 1, cy + oy + 1.5, 2.6, 2.2, 5, k), PAL.ink); dome(top, ring(cx + ox, cy + oy, 2.8, 2.4, 5, k, i + k), cx + ox - 0.6, cy + oy - 0.8, 2, cozy(PAL.amber), 0.4); }
    else if (t.node === 'shell') for (let k = 0; k < 3; k++) { const ox = [-4, 4, -1][k], oy = [-3, -1, 5][k]; flat(shade, ring(cx + ox + 1, cy + oy + 1.5, 4.4, 3.4, 6, k), PAL.ink); dome(top, ring(cx + ox, cy + oy, 4.6, 3.6, 6, hash(i, k, 18) * 2, i + k * 3, 0.08), cx + ox - 0.8, cy + oy - 1, 2.6, cozy(PAL.shell), 0.2); }
    else if (t.node === 'carcass') { flat(shade, ring(cx + 2, cy + 2.5, 9, 5.5, 8, 0.4), PAL.ink); dome(top, ring(cx, cy, 9, 5.5, 8, 0.4, i, 0.1), cx - 1, cy - 1, 3.5, cozy(PAL.flesh), 0); }
  });
  LIGHT.k = was;
  const scene = new Container(), filter = outlineFilter();
  top.filters = [filter]; scene.addChild(ground, shade, top); scene.scale.set(art);
  const rt = RenderTexture.create({ width: Math.round(COLS * C * art), height: Math.round(ROWS * C * art), resolution: 1, scaleMode: 'nearest', antialias: false });
  app.renderer.render({ container: scene, target: rt, clear: true });
  scene.destroy({ children: true });
  return rt;
}
