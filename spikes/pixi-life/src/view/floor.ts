// The seafloor: a low-poly mesh over the board (sand, mud basins, rock), boulders that cast shadows, the food on it,
// the mudslide's murk, and caustic light rippling over everything. Redrawn only when the Life changes (refresh).
import { Container, Graphics, Texture, TilingSprite } from 'pixi.js';
import { COLS, ROWS, type NodeId } from '../rules/data';
import { known, lockOf, xy, eventOn, type Life } from '../rules/life';
import { C, PAL, SHADOW, dome, flat, hash, ring, tri, type P3, type Ramp } from './shade';

const H = C / 2, NX = COLS * 2 + 1, NY = ROWS * 2 + 1;
export const BW = COLS * C, BH = ROWS * C;
const BASE = { sand: 0, mud: -2.5, rock: -0.5, dead: -1 } as const;

export class Floor {
  root = new Container();
  private ground = new Graphics();
  private rocks = new Graphics();
  private nodes = new Graphics();
  private murk = new Graphics();
  private caustics: TilingSprite[] = [];
  private v: P3[] = []; // lattice vertices
  private t = 0;
  ghosts = new Map<number, NodeId>(); // food still drawn until its eat plays back
  private life!: Life;

  constructor() {
    const frame = new Graphics();
    frame.rect(-10, -8, BW + 20, BH + 22).fill({ color: PAL.ink, alpha: 0.55 });
    frame.rect(-4, -4, BW + 8, BH + 8).fill(PAL.ink);
    const tex = causticTexture();
    for (const [a, s] of [[0.07, 1.5], [0.05, 2.3]]) {
      const ts = new TilingSprite({ texture: tex, width: BW, height: BH });
      ts.alpha = a; ts.blendMode = 'add'; ts.tileScale.set(s);
      this.caustics.push(ts);
    }
    const lit = new Container();
    lit.addChild(this.ground, this.rocks, this.nodes, this.murk, ...this.caustics);
    const mask = new Graphics().rect(0, 0, BW, BH).fill(0xffffff);
    lit.mask = mask;
    this.root.addChild(frame, lit, mask);
  }

  set(life: Life) {
    this.life = life;
    this.ghosts.clear();
    this.v = [];
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) this.v.push(this.vertex(i, j));
    this.drawRocks();
    this.refresh();
  }

  private tileAt(i: number, j: number) {
    const x = Math.min(COLS - 1, Math.max(0, Math.floor(i / 2))), y = Math.min(ROWS - 1, Math.max(0, Math.floor(j / 2)));
    return this.life.tiles[y * COLS + x].t;
  }

  /** A lattice point every half tile: corners stay put so the grid reads; the rest wobbles a little. */
  private vertex(i: number, j: number): P3 {
    const corner = i % 2 === 0 && j % 2 === 0, inner = i > 0 && j > 0 && i < NX - 1 && j < NY - 1;
    const jit = corner || !inner ? 0 : i % 2 && j % 2 ? 3.2 : 2.2;
    const x = i * H + (hash(i, j, 1) - 0.5) * 2 * jit, y = j * H + (hash(i, j, 2) - 0.5) * 2 * jit;
    let z = 0, n = 0;
    for (const [di, dj] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) {
      if (i % 2 && di) continue; if (j % 2 && dj) continue; // odd lattice lines lie inside one tile
      z += BASE[this.tileAt(i + di, j + dj)]; n++;
    }
    z /= n;
    const t = this.tileAt(i, j);
    if (i % 2 && j % 2 && t === 'mud') z -= 1.8; // mud tiles sag in the middle
    z += (hash(i, j, 3) - 0.5) * (t === 'sand' ? 2.2 : 1.2);
    return [x, y, z];
  }

  private rampOf(i: number): Ramp {
    const t = this.life.tiles[i];
    if (t.t === 'sand') return PAL.sand;
    if (t.t === 'rock') { // a boulder sits on whatever ground surrounds it
      const [x, y] = xy(i);
      const mud = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => this.life.tiles[(y + dy) * COLS + x + dx]?.t === 'mud' && x + dx >= 0 && x + dx < COLS).length;
      return mud >= 2 ? (t.seen ? PAL.mudSeen : PAL.mudDark) : PAL.sand;
    }
    if (t.t === 'mud') return eventOn(this.life) && this.life.hab.event.where === 'mud' && this.life.phase !== 'over' ? PAL.mudSlide : t.seen ? PAL.mudSeen : PAL.mudDark;
    return PAL.mudDark;
  }

  refresh() {
    const g = this.ground.clear(), V = this.v;
    for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
      const tileI = Math.floor(j / 2) * COLS + Math.floor(i / 2), ramp = this.rampOf(tileI);
      const a = V[j * NX + i], b = V[j * NX + i + 1], c = V[(j + 1) * NX + i + 1], d = V[(j + 1) * NX + i];
      const h = hash(i, j, 5), bias = h < 0.14 ? 0.6 : h > 0.9 ? -0.6 : 0;
      if (hash(i, j, 4) < 0.5) { tri(g, a, b, c, ramp, bias); tri(g, a, c, d, ramp, -bias); }
      else { tri(g, a, b, d, ramp, bias); tri(g, b, c, d, ramp, -bias); }
    }
    this.drawNodes();
  }

  /** Only the food changed (an eat played back). */
  redrawNodes() { this.drawNodes(); }

  private drawRocks() {
    const g = this.rocks.clear();
    this.life.tiles.forEach((t, i) => {
      if (t.t !== 'rock') return;
      const [x, y] = xy(i), cx = x * C + H + (hash(x, y, 9) - 0.5) * 3, cy = y * C + H + (hash(x, y, 8) - 0.5) * 3;
      const base = ring(cx, cy, C * 0.44, C * 0.4, 8, hash(x, y, 6) * 6, i, 0.22);
      const mid = ring(cx - 1, cy - 1.5, C * 0.28, C * 0.25, 6, hash(x, y, 7) * 6, i + 50, 0.2);
      const shade = base.map(([px, py]) => [px + 9 * SHADOW.x, py + 9 * SHADOW.y] as [number, number]);
      flat(g, shade, PAL.ink, 0.35); flat(g, base, PAL.ink, 0.35);
      flat(g, base, PAL.ink, 1, 1.2, cx, cy);
      flat(g, base, PAL.rock[1]);
      for (let k = 0; k < base.length; k++) { // the skirt from the base ring up to the middle ring
        const a = base[k], b = base[(k + 1) % base.length];
        const m = mid[Math.floor((k / base.length) * mid.length)], m2 = mid[Math.floor(((k + 1) / base.length) * mid.length) % mid.length];
        tri(g, [a[0], a[1], 1], [b[0], b[1], 1], [m[0], m[1], 8], PAL.rock, 0.4);
        if (m !== m2) tri(g, [b[0], b[1], 1], [m2[0], m2[1], 8], [m[0], m[1], 8], PAL.rock, 0.4);
      }
      dome(g, mid, cx - 2, cy - 2.5, 4, PAL.rock, 0.6, 1, 8);
    });
  }

  private drawNodes() {
    const g = this.nodes.clear(), l = this.life;
    l.tiles.forEach((t, i) => {
      const node = this.ghosts.get(i) ?? t.node;
      if (!node || !known(t)) return;
      const [x, y] = xy(i), cx = x * C + H, cy = y * C + H, locked = !!lockOf(l, node), a = locked ? 0.5 : 1;
      if (node === 'mat') {
        for (let k = 0; k < 4; k++) {
          const ox = (hash(i, k, 11) - 0.5) * 10, oy = (hash(i, k, 12) - 0.5) * 10, r = 4 + hash(i, k, 13) * 3;
          dome(g, ring(cx + ox, cy + oy, r, r * 0.85, 6, k, i * 9 + k, 0.3), cx + ox - 0.5, cy + oy - 0.5, 1.6, PAL.leaf, 0.3, a);
        }
        for (let k = 0; k < 5; k++) g.rect(cx + (hash(i, k, 14) - 0.5) * 14, cy + (hash(i, k, 15) - 0.5) * 14, 1, 1).fill({ color: PAL.leaf[4], alpha: a });
      } else if (node === 'buried') {
        flat(g, ring(cx, cy + 1, 7, 5, 7, 0, i), PAL.ink, 0.35 * a);
        for (let k = 0; k < 3; k++) {
          const ox = (k - 1) * 4 + (hash(i, k, 16) - 0.5) * 2, oy = (hash(i, k, 17) - 0.5) * 4;
          dome(g, ring(cx + ox, cy + oy, 2.6, 2.2, 5, k, i + k), cx + ox - 0.6, cy + oy - 0.8, 2, PAL.amber, 0.4, a);
        }
      } else if (node === 'shell') {
        for (let k = 0; k < 3; k++) {
          const ox = [-4, 4, -1][k], oy = [-3, -1, 5][k], rot = hash(i, k, 18) * 2 - 1;
          const pts = ring(cx + ox, cy + oy, 4.6, 3.6, 7, rot, i + k * 3, 0.08);
          flat(g, pts, PAL.ink, a, 1.1, cx + ox, cy + oy);
          dome(g, pts, cx + ox - 0.8, cy + oy - 1, 2.6, PAL.shell, 0.2, a);
        }
      } else if (node === 'carcass') {
        const pts = ring(cx, cy, 9, 5.5, 9, 0.4, i, 0.1);
        flat(g, pts, PAL.ink, a, 1.2, cx, cy);
        dome(g, pts, cx - 1, cy - 1, 3.5, PAL.flesh, 0, a);
        for (let k = -2; k <= 2; k++) g.rect(cx + k * 3 - 0.5, cy - 4 + Math.abs(k) * 0.5, 1, 8 - Math.abs(k)).fill({ color: PAL.flesh[0], alpha: 0.6 * a });
      }
      if (locked) { // a small red badge
        flat(g, ring(x * C + C - 5, y * C + 5, 3.4, 3.4, 4, Math.PI / 4), PAL.ink);
        flat(g, ring(x * C + C - 5, y * C + 5, 2.2, 2.2, 4, Math.PI / 4), PAL.red);
      }
    });
  }

  /** Per frame: caustics drift; in the mudslide, murk rolls over the mud. */
  tick(dt: number) {
    this.t += dt;
    const [a, b] = this.caustics;
    a.tilePosition.set(this.t * 6, this.t * 3.5);
    b.tilePosition.set(-this.t * 4, this.t * 5);
    const g = this.murk.clear(), l = this.life;
    if (!l || l.phase === 'over' || !eventOn(l) || l.hab.event.where !== 'mud') return;
    l.tiles.forEach((t, i) => {
      if (t.t !== 'mud') return;
      const [x, y] = xy(i);
      for (let k = 0; k < 2; k++) {
        const ph = hash(x, y, k) * 6.28, ox = Math.sin(this.t * 0.7 + ph) * 5, oy = Math.cos(this.t * 0.5 + ph) * 4;
        flat(g, ring(x * C + H + ox, y * C + H + oy, 9, 7, 6, ph, i + k), PAL.mudSlide[0], 0.32);
      }
    });
  }
}

/** A tileable caustic pattern: bright seams between cells, as light bends through ripples. */
function causticTexture() {
  const N = 96, cv = document.createElement('canvas');
  cv.width = cv.height = N;
  const cx = cv.getContext('2d')!, img = cx.createImageData(N, N), pts: [number, number][] = [];
  for (let k = 0; k < 14; k++) pts.push([hash(k, 1, 21) * N, hash(k, 2, 21) * N]);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let d1 = 1e9, d2 = 1e9;
    for (const [px, py] of pts) for (let oy = -N; oy <= N; oy += N) for (let ox = -N; ox <= N; ox += N) {
      const d = Math.hypot(x - px - ox, y - py - oy);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    const v = Math.pow(Math.max(0, 1 - (d2 - d1) / 7), 2), o = (y * N + x) * 4;
    img.data[o] = 190; img.data[o + 1] = 255; img.data[o + 2] = 235; img.data[o + 3] = Math.round(v * 255);
  }
  cx.putImageData(img, 0, 0);
  return Texture.from(cv);
}
