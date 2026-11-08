// Read-only living sea map, ported from the sea toy. Decorative motion never uses the sea RNG.
import { feedsAs } from '../sim/feeding';
import { drawIsland } from './islandmap';
import { speciesColour, markerCounts, patchAtPoint } from './sea-map-data';
import { holder, huntersOf, preyOf, type Sea, type SeaPatch } from '../sim/sea';

export type View = 'holder' | 'mats' | 'oxygen' | 'hunters';
export const SCALE = 10;
const CELL = SCALE / 2, FADE = 0.06;
type RGB = [number, number, number];
interface Sprite { x: number; y: number; tx: number; ty: number; wait: number }
interface Shown { c: RGB; fill: number; pulse: number; pulseC: RGB }

const cellHash = (x: number, y: number) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177); h ^= h >>> 13; return ((Math.imul(h, 1103515245) >>> 8) & 255) / 255; };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** What a patch should look like now: a colour and how full it is, 0–1. */
function target(sea: Sea, p: SeaPatch, view: View): { c: RGB; fill: number } {
  if (view === 'mats') return { c: [70, 200, 90], fill: Math.min(1, p.mats / 70) };
  if (view === 'oxygen') { const t = Math.min(1, p.oxygen / 80); return { c: [mix(235, 70, t), mix(70, 190, t), mix(90, 240, t)], fill: 0.35 + 0.65 * Math.abs(t - 0.4) / 0.6 }; }
  if (view === 'hunters') return { c: [240, 70, 55], fill: Math.min(1, huntersOf(sea, p) / 28) };
  const h = holder(sea, p);
  return h < 0 ? { c: [20, 34, 44], fill: 0.1 } : { c: speciesColour(sea.species[h]), fill: Math.min(1, preyOf(sea, p) / Math.max(30, p.normal.prey * 1.5)) };
}

export function makeMap(cv: HTMLCanvasElement) {
  const g = cv.getContext('2d')!, back = document.createElement('canvas');
  let sea: Sea, shown: Shown[] = [], herds = new Map<string, Sprite[]>(), edges: [number, number, number, number, number][] = [];
  let view: View = 'holder';
  let selected: number | null = null, clutch: number | null = null;
  const marked = new Set<number>(), occupied = new Set<number>();

  function setSea(next: Sea) {
    sea = next; herds = new Map();
    drawIsland(back, sea.isl, {} as never, { scale: SCALE });
    cv.width = back.width; cv.height = back.height;
    shown = sea.patches.map((p) => { const t = target(sea, p, view); return { c: [...t.c] as RGB, fill: t.fill, pulse: 0, pulseC: [255, 255, 255] }; });
    edges = [];
    const { w, h } = sea.isl;
    sea.patches.forEach((p) => {
      for (const t of p.tiles) {
        const x = t % w, y = (t / w) | 0, right = x < w - 1 ? sea.of[t + 1] : -1, down = y < h - 1 ? sea.of[t + w] : -1;
        if (right !== p.id && (right >= 0 || right < p.id)) edges.push([(x + 1) * SCALE - 1, y * SCALE, 1, SCALE, p.id]);
        if (down !== p.id && (down >= 0 || down < p.id)) edges.push([x * SCALE, (y + 1) * SCALE - 1, SCALE, 1, p.id]);
      }
    });
    updateHerds();
  }

  function randomTile(p: SeaPatch): [number, number] {
    const t = p.tiles[Math.floor(Math.random() * p.tiles.length)], { w } = sea.isl;
    return [(t % w) + Math.random(), ((t / w) | 0) + Math.random()];
  }
  /** Keep the sprites in line with the populations. */
  function updateHerds() {
    const live = new Set<string>();
    for (const entry of markerCounts(sea)) {
      const { patch, species: k, count: want } = entry, p = sea.patches[patch];
      const key = `${p.id}:${k}`, herd = herds.get(key) ?? [];
      live.add(key);
      while (herd.length > want) herd.pop();
      while (herd.length < want) { const [x, y] = randomTile(p); herd.push({ x, y, tx: x, ty: y, wait: Math.random() * 60 }); }
      herds.set(key, herd);
    }
    for (const key of herds.keys()) if (!live.has(key)) herds.delete(key);
  }

  function drawPatch(p: SeaPatch, s: Shown) {
    const { w } = sea.isl, [r, gg, b] = s.c, bright = 0.3 + 0.7 * s.fill;
    const full = `rgb(${r * bright | 0},${gg * bright | 0},${b * bright | 0})`, dim = `rgb(${r * bright * 0.62 | 0},${gg * bright * 0.62 | 0},${b * bright * 0.62 | 0})`;
    for (const t of p.tiles) {
      const x = t % w, y = (t / w) | 0;
      for (let cy = 0; cy < 2; cy++) for (let cx = 0; cx < 2; cx++) {
        const v = cellHash(x * 2 + cx, y * 2 + cy);
        if (v > 0.25 + s.fill * 0.75) continue; // an empty patch shows the water through
        g.fillStyle = v > 0.6 ? dim : full;
        g.fillRect(x * SCALE + cx * CELL, y * SCALE + cy * CELL, CELL, CELL);
      }
    }
    if (s.pulse > 0.02) {
      g.fillStyle = `rgba(${s.pulseC[0]},${s.pulseC[1]},${s.pulseC[2]},${s.pulse * 0.6})`;
      for (const t of p.tiles) g.fillRect((t % w) * SCALE, ((t / w) | 0) * SCALE, SCALE, SCALE);
    }
  }

  function drawCreatures() {
    for (const p of sea.patches) p.pop.forEach((n, k) => {
      if (n < 1) return;
      const herd = herds.get(`${p.id}:${k}`), sp = sea.species[k];
      if (!herd) return;
      const hunter = !!feedsAs(sp).hunt, speed = hunter ? 0.035 : 0.012, c = `rgb(${speciesColour(sp).join(',')})`;
      for (const s of herd) {
        if (s.wait > 0) s.wait--;
        else {
          const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy);
          if (d < 0.05) { [s.tx, s.ty] = randomTile(p); s.wait = 15 + Math.random() * 70; }
          else { s.x += (dx / d) * speed; s.y += (dy / d) * speed; }
        }
        const px = Math.round(s.x * SCALE), py = Math.round(s.y * SCALE), W = sp.plan === 'worm' ? 8 : sp.plan === 'trilobite' ? 6 : 5, H = sp.plan === 'worm' ? 2 : hunter ? 4 : 3;
        g.fillStyle = '#0a0d10'; g.fillRect(px - 1, py - 1, W + 2, H + 2);
        g.fillStyle = c; g.fillRect(px, py, W, H);
        if (hunter) { g.fillStyle = '#fff'; g.fillRect(px + W, py, 2, 2); }
      }
    });
  }

  function draw() {
    if (!sea) return;
    g.drawImage(back, 0, 0);
    sea.patches.forEach((p, i) => {
      const t = target(sea, p, view), s = shown[i];
      for (let c = 0; c < 3; c++) s.c[c] = mix(s.c[c], t.c[c], FADE);
      s.fill = mix(s.fill, t.fill, FADE); s.pulse *= 0.96;
      drawPatch(p, s);
    });
    g.fillStyle = 'rgba(6,14,20,0.45)';
    for (const [x, y, w, h] of edges) g.fillRect(x, y, w, h);
    drawCreatures();
    for (const [x, y, w, h, id] of edges) {
      g.fillStyle = selected === id ? '#ffffff' : clutch === id ? '#ffe033' : marked.has(id) ? '#68e8bd' : 'transparent';
      g.fillRect(x - 1, y - 1, w + 1, h + 1);
    }
    for (const p of sea.patches) {
      if (!occupied.has(p.id) && clutch !== p.id && selected !== p.id) continue;
      const t = p.tiles[Math.floor(p.tiles.length / 2)], x = (t % sea.isl.w + 0.5) * SCALE, y = (Math.floor(t / sea.isl.w) + 0.5) * SCALE;
      g.fillStyle = '#08141c'; g.fillRect(x - 13, y - 9, 26, 18);
      g.fillStyle = clutch === p.id ? '#ffe033' : '#ffffff'; g.font = 'bold 14px sans-serif'; g.textAlign = 'center';
      g.fillText(`${occupied.has(p.id) ? '•' : ''}${p.id + 1}`, x, y + 5);
    }
  }

  return {
    setSea, draw, updateHerds,
    setView: (v: View) => { view = v; },
    mark: (ids: number[], chosen: number | null, last: number | null, line: number[]) => {
      marked.clear(); ids.forEach((id) => marked.add(id)); selected = chosen; clutch = last;
      occupied.clear(); line.forEach((id) => occupied.add(id));
    },
    pulse: (id: number, c: RGB) => { if (shown[id]) { shown[id].pulse = 1; shown[id].pulseC = c; } },
    patchAt: (px: number, py: number) => {
      // CSS borders are outside the rendered island; tiny coastal patches need the content box.
      const r = cv.getBoundingClientRect(), css = getComputedStyle(cv);
      const left = parseFloat(css.borderLeftWidth) || 0, right = parseFloat(css.borderRightWidth) || 0;
      const top = parseFloat(css.borderTopWidth) || 0, bottom = parseFloat(css.borderBottomWidth) || 0;
      return patchAtPoint(sea, { left: r.left + left, top: r.top + top, width: r.width - left - right, height: r.height - top - bottom }, px, py);
    },
  };
}
