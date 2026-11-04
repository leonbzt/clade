// Toy: the living garden, the drawing. The boards you walk on, off the volcanic island's shore, with small creatures roaming: a capped
// readout of the populations, not simulated one by one. Only draws; it changes nothing in the garden.
import { hash, col } from '../src/view/flat';
import type { Role } from './garden-data';
import type { Entry, Garden } from './garden-sim';
import { COLS } from './life2-data';
import { HAB_ORDER } from './life2-habitats';
import { xy, type Life } from './life2-sim';
import { C, GAP, GARDEN_H, GARDEN_W, drawGarden, gardenAt } from './life2-view';

export const ISLAND_W = 44, STRIP_W = ISLAND_W + GARDEN_W, STRIP_H = GARDEN_H;
export const stripAt = (px: number) => (px < ISLAND_W ? -1 : gardenAt(px - ISLAND_W));
const PER_SPRITE = 10, MOST = 6;
type G = CanvasRenderingContext2D;
const r = (g: G, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

/** The shore of the volcanic island: dark rock, a vent, a strip of beach. */
function island(g: G) {
  for (let y = 0; y < STRIP_H; y += 4) for (let x = 0; x < ISLAND_W; x += 4) {
    const edge = 24 + hash(1, y, 9) * 8, c = x < edge - 6 ? col('stone', hash(x, y, 3) > 0.7 ? 1 : 0) : x < edge ? col('earth', 4) : col('sky', hash(x, y, 5) > 0.5 ? 3 : 2);
    r(g, x, y, 4, 4, c);
  }
  r(g, 8, 52, 8, 8, col('warm', 0)); r(g, 10, 54, 4, 4, col('warm', 2));
  for (let k = 0; k < 5; k++) r(g, 11 + (k % 2), 50 - k * 6, 2, 3, col('stone', 2));
}

interface Sprite { x: number; y: number; tx: number; ty: number; wait: number }
const allowed = (l: Life, role: Role, i: number) => {
  const t = l.tiles[i];
  if (t.t === 'rock') return false;
  if (role === 'burrower') return t.t === 'mud';
  if (role === 'predator') return t.t !== 'dead';
  return true;
};
const look = (e: Entry, x: number) => (e.line ? [col('rare', 0), col('warm', 2)] : e.role === 'predator' ? [col('warm', 0), col('warm', 1)] : e.role === 'burrower' ? [col('earth', 4), col('stone', 2)] : x % 2 ? [col('stone', 2), col('leaf', 3)] : [col('stone', 1), col('stone', 2)]);

export function makeStrip(cv: HTMLCanvasElement) {
  const g = cv.getContext('2d')!, back = document.createElement('canvas'), bg = back.getContext('2d')!, herds = new Map<string, Sprite[]>();
  cv.width = back.width = STRIP_W; cv.height = back.height = STRIP_H;
  let boards: Life[] = [], garden: Garden | null = null, hover = -1;

  const pickTile = (l: Life, role: Role) => {
    for (let k = 0; k < 12; k++) { const i = Math.floor(Math.random() * l.tiles.length); if (allowed(l, role, i)) return xy(i); }
    return null;
  };
  function paint() {
    island(bg);
    bg.save(); bg.translate(ISLAND_W, 0); drawGarden(bg, boards, hover); bg.restore();
  }
  /** New boards and populations: repaint the ground and adjust the herds. */
  function update(next: Garden, nextBoards: Life[], nextHover = hover) {
    garden = next; boards = nextBoards; hover = nextHover;
    paint();
    const live = new Set<string>();
    HAB_ORDER.forEach((id, k) => {
      for (const e of next.habs[id].entries) {
        if (e.role === 'filter') continue; // filter feeders sit still: they're the shell beds and sponges on the ground
        const key = `${id}:${e.sp}:${e.role}`, want = Math.min(MOST, Math.max(1, Math.ceil(e.pop / PER_SPRITE))), herd = herds.get(key) ?? [];
        live.add(key);
        while (herd.length > want) herd.pop();
        while (herd.length < want) { const p = pickTile(boards[k], e.role); if (!p) break; herd.push({ x: p[0], y: p[1], tx: p[0], ty: p[1], wait: Math.random() * 40 }); }
        herds.set(key, herd);
      }
    });
    for (const key of herds.keys()) if (!live.has(key)) herds.delete(key);
  }
  function draw() {
    if (!garden) return;
    g.drawImage(back, 0, 0);
    HAB_ORDER.forEach((id, k) => {
      const x0 = ISLAND_W + k * (COLS * C + GAP);
      for (const e of garden!.habs[id].entries) {
        const herd = herds.get(`${id}:${e.sp}:${e.role}`);
        if (!herd) continue;
        const speed = e.role === 'predator' ? 0.05 : 0.018, [lo, hi] = look(e, e.sp.length);
        for (const s of herd) {
          if (s.wait > 0) s.wait--;
          else {
            const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy);
            if (d < 0.05) { const p = pickTile(boards[k], e.role); if (p) { s.tx = p[0]; s.ty = p[1]; } s.wait = 10 + Math.random() * 50; } else { s.x += (dx / d) * speed; s.y += (dy / d) * speed; }
          }
          const px = Math.round(x0 + s.x * C + 8), py = Math.round(s.y * C + 8);
          if (e.role === 'predator') { r(g, px - 5, py - 2, 11, 5, lo); r(g, px - 3, py - 3, 6, 7, lo); r(g, px + 3, py - 1, 2, 2, hi); }
          else if (e.role === 'burrower') { r(g, px - 2, py, 5, 2, lo); r(g, px - 1, py - 1, 3, 1, hi); }
          else { r(g, px - 3, py - 1, 6, 3, lo); r(g, px - 2, py - 2, 4, 1, hi); }
        }
      }
    });
  }
  return { update, draw };
}
