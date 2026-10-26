// Plant sprites, painted pixel by pixel from code. Bought traits change the drawing, on the map and on the
// specimen. Map sprites are 24×28 and overhang their 16×16 tile, so the garden reads as one growth, not a grid.
import { PAL } from '../data/palette';
import { Painter, seeded } from './pixels';

export type Look = { stage: number; traits: string[]; big?: boolean };
/** The ground area plants stand in, inside the sprite. */
type Box = { x: number; y: number; w: number; h: number };
type Paint = (p: Painter, r: () => number, look: Look, box: Box) => void;

export const SPRITE = { w: 24, h: 28, ox: -4, oy: -12, variants: 8 };
const MAP_BOX: Box = { x: 4, y: 12, w: 16, h: 16 };

const has = (look: Look, id: string) => look.traits.includes(id);
const spot = (r: () => number, b: Box, m = 2) => ({ x: b.x + m + r() * (b.w - 2 * m), y: b.y + m + r() * (b.h - 2 * m) });

const cyano: Paint = (p, r, look, b) => {
  // A dark crust: a few low bumps with teal glints. Most of its look is the ground cover.
  const n = look.big ? 12 : [1, 2, 3][look.stage];
  for (let k = 0; k < n; k++) {
    const { x, y } = spot(r, b), rad = look.big ? 2 : 1;
    p.disc(x, y, rad, has(look, 'sheath') ? PAL.rhizoid : PAL.cyano1);
    p.set(x, y - rad, PAL.cyano3);
    if (has(look, 'fixing') && r() < 0.5) p.set(x + rad, y, PAL.cone);
  }
};

const liverwort: Paint = (p, r, look, b) => {
  // Flat green ribbons that fork at the tips, lying on the ground.
  const n = look.big ? 5 : [1, 2, 3][look.stage];
  for (let k = 0; k < n; k++) {
    const { x, y } = spot(r, b, 4), a = r() * Math.PI * 2, len = look.big ? 12 : 4 + look.stage * 2;
    const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len * 0.5;
    for (const off of [-1, 0, 1]) p.line(x, y + off * 0.6, ex, ey + off * 0.6, off ? PAL.liver2 : PAL.liver1);
    for (const fork of [-0.5, 0.5]) {
      const fx = ex + Math.cos(a + fork) * 2.5, fy = ey + Math.sin(a + fork) * 1.5;
      p.line(ex, ey, fx, fy, PAL.liver2);
      p.set(fx, fy, PAL.liver3);
    }
    if (has(look, 'gemmae')) { const mx = (x + ex) / 2, my = (y + ey) / 2; p.set(mx, my - 1, PAL.liver0); p.set(mx, my, PAL.liver3); }
    if (has(look, 'oil')) p.set(x + Math.cos(a) * len * 0.3, y + Math.sin(a) * len * 0.15 - 1, PAL.liver3);
  }
};

const lichen: Paint = (p, r, look, b) => {
  const tight = has(look, 'crustose');
  const n = look.big ? 9 : [1, 2, 3][look.stage];
  for (let k = 0; k < n; k++) {
    const { x, y } = spot(r, b), rad = (look.big ? 2 : 1) + (tight ? 1 : 0);
    const v = r(), c = v < 0.6 ? PAL.lichenGrey : v < 0.85 ? PAL.lichenYellow : PAL.lichenOrange;
    p.disc(x, y, rad, c);
    p.set(x, y, PAL.lichenPale);
    if (has(look, 'soredia')) { p.set(x + rad + 1, y - 1, PAL.lichenPale); p.set(x - rad, y + rad, PAL.lichenPale); }
  }
};

const moss: Paint = (p, r, look, b) => {
  const cushion = has(look, 'cushion');
  const n = (look.big ? 9 : [2, 3, 5][look.stage]) + (cushion ? 1 : 0);
  const tufts = Array.from({ length: n }, () => spot(r, b, 1)).sort((a, c) => a.y - c.y);
  for (const { x, y } of tufts) {
    // A low dome: wide and short, like a real moss cushion.
    const rw = (cushion ? 3 : 2) + (look.big ? 1 : 0), h = (cushion ? 2 : 1) + (look.big ? 2 : 0);
    if (has(look, 'rhizoids')) { p.set(x - rw - 1, y + 1, PAL.rhizoid); p.set(x + rw, y + 1, PAL.rhizoid); }
    for (let dy = 0; dy <= h; dy++) {
      const half = Math.round(rw * Math.sqrt(1 - (dy / (h + 1)) ** 2));
      for (let dx = -half; dx <= half; dx++) {
        const edge = Math.abs(dx) === half || dy === 0;
        p.set(x + dx, y - dy, edge ? PAL.moss0 : dy === h ? PAL.moss2 : PAL.moss1);
      }
    }
    p.set(x - 1, y - h, PAL.moss3);
    if (rw > 2) p.set(x + 1, y - h, PAL.moss3);
    if (has(look, 'capsule') && (look.big || look.stage > 0) && r() < 0.5) {
      const sh = 3 + Math.floor(r() * 3) + (look.big ? 4 : 0);
      p.line(x + 1, y - h, x + 1, y - h - sh, PAL.rhizoid);
      p.set(x + 1, y - h - sh - 1, PAL.capsule);
      p.set(x + 2, y - h - sh - 1, PAL.capsule);
    }
  }
};

const clubmoss: Paint = (p, r, look, b) => {
  const n = look.big ? 6 : [1, 2, 4][look.stage];
  const stems = Array.from({ length: n }, () => spot(r, b, 3)).sort((a, c) => a.y - c.y);
  const leaf = has(look, 'tough') ? PAL.club1 : PAL.club2;
  if (has(look, 'creeping') && stems.length > 1) {
    const y = Math.max(...stems.map((s) => s.y)) + 1;
    p.line(Math.min(...stems.map((s) => s.x)) - 2, y, Math.max(...stems.map((s) => s.x)) + 2, y, PAL.club0);
  }
  for (const { x, y } of stems) {
    const h = (look.big ? 16 : 5 + look.stage * 3) + Math.floor(r() * 3);
    for (let dy = 0; dy < h; dy++) {
      p.set(x, y - dy, PAL.club1);
      if (dy > 0 && dy % 2 === 0) p.set(x - 1, y - dy, leaf);
      if (dy % 2 === 1) p.set(x + 1, y - dy, leaf);
    }
    p.set(x, y - h, PAL.club3);
    if (has(look, 'strobili') && (look.big || look.stage > 0)) {
      p.set(x, y - h - 1, PAL.cone); p.set(x, y - h - 2, PAL.cone); p.set(x, y - h - 3, PAL.lichenPale);
    }
  }
};

const fern: Paint = (p, r, look, b) => {
  const bx = b.x + b.w / 2 + (r() - 0.5) * 4, by = b.y + b.h - 3;
  const n = look.big ? 7 : [3, 5, 6][look.stage];
  const len = look.big ? 20 : [7, 10, 13][look.stage];
  const leaf = has(look, 'drought') ? PAL.fern1 : PAL.fern2;
  if (has(look, 'rhizome')) { p.line(bx - 4, by + 1, bx + 4, by + 1, PAL.rhizoid); p.set(bx - 5, by + 2, PAL.rhizoid); p.set(bx + 5, by + 2, PAL.rhizoid); }
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + (k / Math.max(1, n - 1) - 0.5) * 1.9 + (r() - 0.5) * 0.3;
    const l = len * (0.75 + r() * 0.3);
    let px = bx, py = by;
    for (let step = 1; step <= l; step++) {
      const ang = a + (step / l) * 0.7 * Math.sign(Math.cos(a) || 1);
      const nx = bx + Math.cos(ang) * step, ny = by + Math.sin(ang) * step;
      p.line(px, py, nx, ny, PAL.fern0);
      px = nx; py = ny;
      if (step > 1 && step < l) {
        const reach = step < l * 0.7 ? 2 : 1;
        for (const side of [-1, 1]) for (let q = 1; q <= reach; q++) {
          const lx = nx - Math.sin(ang) * side * q, ly = ny + Math.cos(ang) * side * q;
          const sori = has(look, 'sori') && q === 1 && step % 3 === 0;
          p.set(lx, ly, sori ? PAL.sori : q === reach ? PAL.fern3 : leaf);
        }
      }
    }
  }
};

const PAINTERS: Record<string, Paint> = { cyano, liverwort, moss, lichen, clubmoss, fern };
const cache = new Map<string, HTMLCanvasElement>();

/** A map sprite for one tile. Draw it at the tile's corner plus SPRITE.ox / SPRITE.oy. */
export function sprite(species: string, variant: number, look: Look): HTMLCanvasElement {
  const key = `${species}|${variant}|${look.stage}|${look.traits.join(',')}`;
  let c = cache.get(key);
  if (!c) {
    const p = new Painter(SPRITE.w, SPRITE.h);
    PAINTERS[species](p, seeded(variant * 7919 + species.length * 31), look, MAP_BOX);
    c = p.toCanvas();
    cache.set(key, c);
  }
  return c;
}

/** The type specimen: a bigger drawing on a strip of soil. */
export function specimen(species: string, traits: string[], size = 48): HTMLCanvasElement {
  const p = new Painter(size, size);
  for (let x = 0; x < size; x++) for (let y = size - 3; y < size; y++) p.set(x, y, (x * 3 + y) % 4 ? PAL.soil1 : PAL.soil0);
  const box = { x: 4, y: Math.floor(size * 0.55), w: size - 8, h: Math.floor(size * 0.45) - 2 };
  PAINTERS[species](p, seeded(42), { stage: 2, traits, big: size >= 40 }, box);
  return p.toCanvas();
}
