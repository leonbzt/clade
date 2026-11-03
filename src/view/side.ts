// The run in side view: sky, the neighbours, the hidden soil, the plant, the offers. Plain lines and blobs, from the
// grow toy's view. A camera zooms in on small bodies (moss).
import { CELL, COLS, GROUND, H, SPOTS, W, type Neighbour } from '../data/run';
import { shape } from '../data/genes';
import type { Node, Plant } from '../sim/run/plant';
import type { Plot } from '../sim/run/plot';
import type { Offer } from '../sim/run/pulse';

type Ctx = CanvasRenderingContext2D;
export interface Cam { s: number; ox: number; oy: number }

/** Moss is zoomed ×2.5 around the plant; the herb and the tree see the whole plot. */
export function camFor(p: Plant): Cam {
  if (p.form !== 'moss') return { s: 1, ox: 0, oy: 0 };
  const s = 3, vw = W / s;
  return { s, ox: Math.max(0, Math.min(W - vw, p.x - vw / 2)), oy: GROUND - (H / s) * 0.55 };
}
export const toWorld = (cam: Cam, x: number, y: number) => ({ x: x / cam.s + cam.ox, y: y / cam.s + cam.oy });

export function drawPlot(c: Ctx, w: Plot) {
  const look = w.look;
  const sky = c.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, w.dry ? '#d8c8a0' : look.sky[0]); sky.addColorStop(1, look.sky[1]);
  c.fillStyle = sky; c.fillRect(0, 0, W, GROUND);
  c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(W - 50, 40, 20, 0, Math.PI * 2); c.fill();
  c.fillStyle = look.loam; c.fillRect(0, GROUND, W, H - GROUND);
  c.font = 'bold 11px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
  w.cells.forEach((cell, i) => {
    const x = (i % COLS) * CELL, y = GROUND + Math.floor(i / COLS) * CELL;
    if (!cell.seen) { c.fillStyle = (i * 7919) % 5 < 2 ? '#241a13' : '#2a1f16'; c.fillRect(x, y, CELL, CELL); return; }
    if (cell.kind === 'hard') {
      c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x, y, CELL, CELL);
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 4, y + 5, 2, 2); c.fillRect(x + 13, y + 12, 2, 2);
    } else if (cell.kind === 'stone') {
      c.fillStyle = '#8d8c88'; c.beginPath(); c.roundRect(x + 1, y + 1, CELL - 2, CELL - 2, 5); c.fill();
      c.fillStyle = '#6f6e6a'; c.fillRect(x + 5, y + 7, 8, 3);
    } else if (cell.kind === 'water' || cell.kind === 'nutrient') {
      const k = cell.max ? cell.amount / cell.max : 0;
      c.fillStyle = cell.kind === 'water' ? `rgba(90,170,255,${0.25 + 0.75 * k})` : `rgba(235,180,60,${0.25 + 0.75 * k})`;
      c.beginPath(); c.arc(x + CELL / 2, y + CELL / 2, 2.5 + 6 * k, 0, Math.PI * 2); c.fill();
    }
    if ((cell.kind === 'loam' || cell.kind === 'hard') && cell.hint) {
      c.fillStyle = ['', '#d8c890', '#f0c050', '#ffa040', '#ff7a4a', '#ff5a5a'][Math.min(cell.hint, 5)];
      c.fillText(String(cell.hint), x + CELL / 2, y + CELL / 2 + 1);
    }
  });
  c.strokeStyle = 'rgba(20,12,8,0.45)'; c.lineWidth = 1.5;
  for (const line of w.roots) { c.beginPath(); line.forEach((p, k) => (k ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke(); }
  for (const nb of w.neighbours) drawNeighbour(c, nb, w.grow);
  c.fillStyle = '#5c8a3a'; c.fillRect(0, GROUND - 2, W, 3);
  c.font = '10px system-ui';
  SPOTS.forEach((x, s) => { c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x - 1, GROUND + 1, 2, 5); c.fillText(String(s + 1), x, GROUND + 12); });
}

function drawNeighbour(c: Ctx, nb: Neighbour, grow: number) {
  const h = nb.h * grow, x = nb.x, g = GROUND, half = nb.w / 2, a = nb.density * 0.3;
  const sh = c.createLinearGradient(x - half, 0, x + half, 0);
  sh.addColorStop(0, 'rgba(15,30,25,0)'); sh.addColorStop(0.12, `rgba(15,30,25,${a})`);
  sh.addColorStop(0.88, `rgba(15,30,25,${a})`); sh.addColorStop(1, 'rgba(15,30,25,0)');
  c.fillStyle = sh; c.fillRect(x - half, g - h, nb.w, h);
  c.fillStyle = nb.kind === 'lichen' || nb.kind === 'moss' ? '#9aa86a' : '#2f4f2a';
  if (nb.kind === 'tree') {
    c.fillStyle = '#3c2e22'; c.fillRect(x - 8, g - h * 0.75, 16, h * 0.75);
    c.fillStyle = '#2f4a2a';
    for (const [dx, dy, r] of [[-0.25, 0.85, 0.3], [0.2, 0.9, 0.28], [0, 0.97, 0.25], [-0.4, 0.7, 0.2], [0.38, 0.72, 0.22]]) {
      c.beginPath(); c.arc(x + dx * nb.w, g - dy * h, r * nb.w * 0.7, 0, Math.PI * 2); c.fill();
    }
  } else if (nb.kind === 'shrub' || nb.kind === 'fern') {
    c.fillStyle = nb.kind === 'fern' ? '#3d6a34' : '#2f4f2a';
    for (let k = -3; k <= 3; k++) { c.beginPath(); c.ellipse(x + (k * half) / 4, g - h * (0.55 + 0.4 * (1 - Math.abs(k) / 4)), half / 3, h / 3.2, k * 0.2, 0, Math.PI * 2); c.fill(); }
  } else if (nb.kind === 'sedge' || nb.kind === 'grass') {
    c.strokeStyle = nb.kind === 'grass' ? '#9a9a50' : '#4f7a3a'; c.lineWidth = 2;
    for (let k = -8; k <= 8; k++) {
      const bx = x + (k * half) / 9;
      c.beginPath(); c.moveTo(bx, g); c.quadraticCurveTo(bx + k * 2, g - h * 0.6, bx + k * 4, g - h * (0.75 + 0.25 * Math.cos(k))); c.stroke();
    }
  } else { c.beginPath(); c.ellipse(x, g - h / 2, half, h / 2 + 2, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.75)'; c.font = '10px system-ui'; c.fillText(nb.name, x, g - h - 8);
}

/** Mix two #rrggbb colours (t: 0 → a, 1 → b). */
const mix = (a: string, b: string, t: number) => '#' + [1, 3, 5].map((k) => Math.round(parseInt(a.slice(k, k + 2), 16) * (1 - t) + parseInt(b.slice(k, k + 2), 16) * t).toString(16).padStart(2, '0')).join('');

export function drawPlant(c: Ctx, p: Plant, alpha = 1, base = '#3f6e2c') {
  c.globalAlpha = alpha; c.lineCap = 'round';
  const color = mix(base, '#7a3a28', 0.8 * shape(p.genes, 'tint')), breadth = shape(p.genes, 'breadth'); // Defence; Shade
  for (const n of p.nodes) {
    if (n.dead || n.parent < 0 || n.len === 0) continue;
    const q = p.nodes[n.parent];
    c.strokeStyle = n.kind === 'shoot' ? (n.wood > 0.3 ? '#6a4a30' : color) : '#e6d3a3';
    c.lineWidth = Math.max(1, n.thick * 1.1);
    c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(n.x, n.y); c.stroke();
  }
  const wilt = p.flow.wilting;
  for (const n of p.nodes) {
    if (n.dead) continue;
    if (n.leaf && n.len) {
      const g = Math.round(100 + 120 * n.light);
      c.fillStyle = wilt ? `rgb(${150 + 40 * n.light},${g},60)` : `rgb(${50 + 30 * n.light},${g},50)`;
      c.beginPath(); c.ellipse(n.x + 2, n.y, 1.5 + n.leaf * 1.1, (1 + n.leaf * 0.55) * breadth, n.x > p.x ? -0.5 : 0.5, 0, Math.PI * 2); c.fill();
    }
    if (n.state === 'tip') { c.fillStyle = n.kind === 'shoot' ? '#b5f07a' : '#fff1c4'; c.fillRect(n.x - 1, n.y - 1, 2, 2); }
    if (n.target) {
      c.strokeStyle = 'rgba(255,230,120,0.8)'; c.setLineDash([3, 3]); c.lineWidth = 1;
      c.beginPath(); c.moveTo(n.x, n.y); c.lineTo(n.target.x, n.target.y); c.stroke(); c.setLineDash([]);
    }
  }
  c.fillStyle = '#f4f7d8'; c.strokeStyle = '#2c4a1e'; c.lineWidth = 1;
  if (p.form !== 'moss') for (const n of p.nodes) if (n.state === 'bud' && !n.dead && n.kind === 'shoot') { c.fillRect(n.x - 2, n.y - 2, 4, 4); c.strokeRect(n.x - 2, n.y - 2, 4, 4); }
  c.globalAlpha = 1;
}

/** The parts a cut would remove, dashed. */
export function drawGhost(c: Ctx, nodes: Node[], keep: number[]) {
  c.strokeStyle = 'rgba(255,140,120,0.95)'; c.lineWidth = 2; c.setLineDash([3, 2]);
  for (const i of keep) {
    const n = nodes[i];
    if (n.parent < 0 || n.len === 0) continue;
    const q = nodes[n.parent];
    c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(n.x, n.y); c.stroke();
  }
  c.setLineDash([]);
}

/** The offers: numbered rings on the body (a root offer points at its pocket). */
export function drawOffers(c: Ctx, p: Plant, offers: Offer[], hover: number, s: number) {
  offers.forEach((o, i) => {
    const n = p.nodes[o.node], r = (hover === i ? 9 : 7) / s;
    if (o.kind === 'root' && n) {
      c.strokeStyle = 'rgba(255,230,120,0.9)'; c.setLineDash([4 / s, 3 / s]); c.lineWidth = 1.5 / s;
      c.beginPath(); c.moveTo(n.x, n.y); c.lineTo(o.x, o.y); c.stroke(); c.setLineDash([]);
    }
    c.fillStyle = !o.ok ? 'rgba(120,120,120,0.6)' : hover === i ? 'rgba(255,227,107,0.95)' : 'rgba(255,227,107,0.6)';
    c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.5 / s;
    c.beginPath(); c.arc(o.x, o.y, r, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#1a1a1a'; c.font = `bold ${11 / s}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(String(i + 1), o.x, o.y + 0.5 / s);
  });
}

/** The predicted body on a brood card: scaled to fit, ground line kept. */
export function drawThumb(cv: HTMLCanvasElement, p: Plant) {
  const c = cv.getContext('2d')!;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const n of p.nodes) if (!n.dead) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); }
  const s = Math.min(3, (cv.width - 16) / (x1 - x0 + 1), (cv.height - 10) / (y1 - y0 + 1));
  c.fillStyle = '#cfe6ef'; c.fillRect(0, 0, cv.width, cv.height);
  const gy = 5 + (GROUND - y0) * s;
  c.fillStyle = '#4a3726'; c.fillRect(0, gy, cv.width, cv.height - gy);
  c.save(); c.translate(cv.width / 2 - ((x0 + x1) / 2) * s, 5 - y0 * s); c.scale(s, s);
  drawPlant(c, p); c.restore();
}
