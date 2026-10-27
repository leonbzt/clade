// The ground layer: sea, beach and lava drawn once per pixel; then soil and ground cover dithered in.
// Coastlines come from a smoothed tile mask plus noise, so they read organic instead of blocky.
// Soil and cover grow in organic blotches because each pixel has a fixed threshold from noise.
// Ground cover is how a ground species "dyes" the tile it holds, so zones read as areas, not sprite fields.
import { NUM } from '../data/numbers';
import { GROUND, PAL } from '../data/palette';
import { SPECIES } from '../data/species';
import { COVER_STRENGTH } from '../data/view';
import { BEACH, SEA, VENT, CRACK, type State } from '../sim/state';
import { hash2, makeCanvas, noise, rgba32 } from './pixels';

const T = NUM.map.tile;
const SOIL = [PAL.soil0, PAL.soil1, PAL.soil2, PAL.soil3].map((c) => rgba32(c));
const SOIL_DARK = [PAL.soil0, PAL.soil0, PAL.soil1, PAL.soil2].map((c) => rgba32(c));
const COVER = SPECIES.map((s) => rgba32(GROUND[s.id]));
const COVER_LIGHT = SPECIES.map((s) => rgba32(shift(GROUND[s.id], 1.25)));
const STRENGTH = SPECIES.map((s) => COVER_STRENGTH[s.id] ?? 1);

function shift(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16), c = (v: number) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, '0');
  return `#${c(n >> 16)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

export class TerrainLayer {
  readonly canvas: HTMLCanvasElement;
  private img: ImageData;
  private px: Uint32Array;
  private base: Uint32Array; // the ground without soil or cover
  private soilAt: Float32Array; // soil shows on a pixel once the tile's soil passes this
  private coverAt: Float32Array; // cover shows on a pixel once the local cover passes this
  private shade: Uint8Array; // which soil and cover shade a pixel uses
  private sig: Int32Array; // per tile: what was drawn last time
  private ws = new Float32Array(SPECIES.length); // scratch for coverHere

  constructor(private s: State) {
    const W = s.w * T, H = s.h * T;
    this.canvas = makeCanvas(W, H);
    this.img = new ImageData(W, H);
    this.px = new Uint32Array(this.img.data.buffer);
    this.base = new Uint32Array(W * H);
    this.soilAt = new Float32Array(W * H).fill(9);
    this.coverAt = new Float32Array(W * H).fill(9);
    this.shade = new Uint8Array(W * H);
    this.sig = new Int32Array(s.w * s.h).fill(-1);
    this.paintBase();
  }

  /** Bilinear sample of a 0/1 tile mask at a pixel, measured between tile centres. */
  private field(x: number, y: number, on: (t: number) => boolean): number {
    const s = this.s, u = x / T - 0.5, v = y / T - 0.5, x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
    const at = (tx: number, ty: number) => {
      tx = Math.max(0, Math.min(s.w - 1, tx)); ty = Math.max(0, Math.min(s.h - 1, ty));
      return on(s.terrain[ty * s.w + tx]) ? 1 : 0;
    };
    const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  }

  private paintBase() {
    const s = this.s, W = s.w * T, H = s.h * T;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x, tx = (x / T) | 0, ty = (y / T) | 0, t = s.terrain[ty * s.w + tx];
      const wob = (noise(x, y, 5, 21) - 0.5) * 0.45, fine = hash2(x, y, 1);
      const land = this.field(x, y, (k) => k !== SEA) + wob;
      const rock = this.field(x, y, (k) => k !== SEA && k !== BEACH) + wob;
      let c: string, ground = true;
      if (land < 0.5) {
        ground = false;
        c = land > 0.4 ? PAL.foam : land > 0.22 ? PAL.seaLight : noise(x, y, 22, 4) > 0.74 ? PAL.sea : PAL.seaDeep;
      } else if (rock < 0.5) {
        c = land < 0.58 ? PAL.sandDark : noise(x, y, 7, 5) > 0.6 ? PAL.sandLight : PAL.sand;
        if (fine > 0.985) c = PAL.sandDark;
      } else {
        const n = noise(x, y, 10, 6);
        c = n > 0.62 ? PAL.lava2 : n > 0.32 ? PAL.lava1 : PAL.lava0;
        if (fine > 0.988) c = PAL.lava3;
        if (Math.abs(noise(x, y, t === CRACK ? 6 : 12, 7) - 0.5) < (t === CRACK ? 0.04 : 0.012)) c = PAL.crack;
        if (t === VENT) {
          const d = Math.hypot(x - (tx + 0.5) * T, y - (ty + 0.5) * T) + fine;
          if (d < 3.5) { c = PAL.crack; ground = false; } else if (d < 6) c = PAL.vent;
        }
      }
      this.base[p] = rgba32(c);
      if (ground) {
        this.soilAt[p] = 0.15 + 0.7 * noise(x, y, 3, 11) + 0.15 * fine;
        this.coverAt[p] = 0.2 + 0.55 * noise(x, y, 2.5, 17) + 0.25 * hash2(x, y, 2);
        this.shade[p] = noise(x, y, 4, 13) > 0.5 ? 1 : 0;
      }
    }
  }

  private signature(i: number): number {
    const s = this.s, g = s.w * s.h + i; // the ground stratum's slot
    return (s.occ[g] + 1) * 10000 + Math.floor(s.cover[g] * 4) * 100 + Math.min(99, Math.floor(s.layers.soil[i] * 36));
  }

  /** Repaints the tiles whose ground occupant, cover or soil band changed, plus their neighbours (cover edges blend). */
  update(force = false) {
    const s = this.s, n = s.w * s.h, dirty = new Uint8Array(n);
    let any = false;
    for (let i = 0; i < n; i++) {
      const sig = this.signature(i);
      if (!force && sig === this.sig[i]) continue;
      this.sig[i] = sig; any = true;
      const x = i % s.w, y = (i / s.w) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < s.w && ny < s.h) dirty[ny * s.w + nx] = 1;
      }
    }
    if (!any) return;
    for (let i = 0; i < n; i++) if (dirty[i]) this.paintTile(i);
    this.canvas.getContext('2d')!.putImageData(this.img, 0, 0);
  }

  private paintTile(i: number) {
    const s = this.s, W = s.w * T, x0 = (i % s.w) * T, y0 = ((i / s.w) | 0) * T;
    const f = s.layers.soil[i], deep = Math.min(3, Math.floor(f * 4));
    for (let y = y0; y < y0 + T; y++) for (let x = x0; x < x0 + T; x++) {
      const p = y * W + x;
      let c = f * 1.25 > this.soilAt[p] ? (this.shade[p] ? SOIL[deep] : SOIL_DARK[deep]) : this.base[p];
      if (this.coverAt[p] < 2) {
        const [sp, w] = this.coverHere(x, y);
        if (sp >= 0 && w > this.coverAt[p]) c = this.shade[p] && hash2(x, y, 3) > 0.6 ? COVER_LIGHT[sp] : COVER[sp];
      }
      this.px[p] = c;
    }
  }

  /** Which species covers this pixel, and how strongly: a bilinear blend of the four nearest tile centres. */
  private coverHere(x: number, y: number): [number, number] {
    const s = this.s, u = x / T - 0.5, v = y / T - 0.5, x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
    let best = -1, bestW = 0;
    const ws = this.ws;
    ws.fill(0);
    const add = (tx: number, ty: number, k: number) => {
      if (tx < 0 || ty < 0 || tx >= s.w || ty >= s.h) return;
      const j = s.w * s.h + ty * s.w + tx, sp = s.occ[j]; // ground stratum
      if (sp < 0) return;
      ws[sp] += k * Math.min(1, 0.45 + s.cover[j]) * STRENGTH[sp];
      if (ws[sp] > bestW) { bestW = ws[sp]; best = sp; }
    };
    add(x0, y0, (1 - fx) * (1 - fy)); add(x0 + 1, y0, fx * (1 - fy));
    add(x0, y0 + 1, (1 - fx) * fy); add(x0 + 1, y0 + 1, fx * fy);
    return [best, bestW];
  }
}
