// A stand-in for Pixi's Graphics: the same calls, but it writes plain coloured triangles into one buffer. No paths, no
// tessellation, no per-shape objects. This is what "draw it cheaper, same look" would mean. Throwaway.
import { Buffer, BufferUsage, Geometry, Mesh, Rectangle, Shader } from 'pixi.js';

const STRIDE = 6, CAP = 1_500_000;
const shader = () => Shader.from({ gl: {
  vertex: `#version 300 es
    precision highp float;
    in vec2 aPosition; in vec4 aColor; out vec4 vColor;
    uniform mat3 uProjectionMatrix; uniform mat3 uWorldTransformMatrix; uniform mat3 uTransformMatrix;
    void main() { mat3 m = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix; gl_Position = vec4((m * vec3(aPosition, 1.0)).xy, 0.0, 1.0); vColor = aColor; }`,
  fragment: `#version 300 es
    precision highp float;
    in vec4 vColor; out vec4 outColor; void main() { outColor = vec4(vColor.rgb * vColor.a, vColor.a); }`,
} });

export class TriPen {
  private v = new Float32Array(CAP);
  private n = 0;
  private cur: number[] | null = null;
  private path: number[] = [];
  private buf = new Buffer({ data: new Float32Array(STRIDE * 3), usage: BufferUsage.VERTEX | BufferUsage.COPY_DST });
  mesh: Mesh<any, any>;
  polys = 0;

  constructor() {
    const stride = STRIDE * 4;
    const geometry = new Geometry({ attributes: {
      aPosition: { buffer: this.buf, format: 'float32x2', stride, offset: 0 },
      aColor: { buffer: this.buf, format: 'float32x4', stride, offset: 8 },
    } });
    this.mesh = new Mesh({ geometry: geometry as never, shader: shader() });
    this.mesh.boundsArea = new Rectangle(-4000, -4000, 8000, 8000);
  }
  get tris() { return this.n / STRIDE / 3; }
  reset() { this.n = 0; this.polys = 0; }
  /** Send this frame's triangles to the GPU. */
  flush() { this.buf.data = this.v.subarray(0, Math.max(this.n, STRIDE * 3)); }

  private vert(x: number, y: number, r: number, g: number, b: number, a: number) {
    const v = this.v; let i = this.n;
    v[i++] = x; v[i++] = y; v[i++] = r; v[i++] = g; v[i++] = b; v[i++] = a;
    this.n = i;
  }
  poly(p: number[]) { this.cur = p; return this; }
  rect(x: number, y: number, w: number, h: number) { this.cur = [x, y, x + w, y, x + w, y + h, x, y + h]; return this; }
  circle(x: number, y: number, r: number) { const p: number[] = []; for (let k = 0; k < 10; k++) { const a = (k / 10) * 6.283; p.push(x + Math.cos(a) * r, y + Math.sin(a) * r); } this.cur = p; return this; }
  moveTo(x: number, y: number) { this.path = [x, y]; return this; }
  lineTo(x: number, y: number) { this.path.push(x, y); return this; }
  fill(style?: any, alpha?: number) {
    const p = this.cur; if (!p) return this;
    this.cur = null; this.polys++;
    const c = typeof style === 'number' ? style : style.color, A = (typeof style === 'number' ? alpha : style.alpha) ?? 1;
    const r = ((c >> 16) & 255) / 255, g = ((c >> 8) & 255) / 255, b = (c & 255) / 255, m = p.length / 2;
    if (m <= 4) { // a triangle or a quad
      for (let k = 1; k < m - 1; k++) { this.vert(p[0], p[1], r, g, b, A); this.vert(p[2 * k], p[2 * k + 1], r, g, b, A); this.vert(p[2 * k + 2], p[2 * k + 3], r, g, b, A); }
      return this;
    }
    let cx = 0, cy = 0; // anything longer: a fan from its middle
    for (let k = 0; k < m; k++) { cx += p[2 * k]; cy += p[2 * k + 1]; }
    cx /= m; cy /= m;
    for (let k = 0; k < m; k++) { const j = (k + 1) % m; this.vert(cx, cy, r, g, b, A); this.vert(p[2 * k], p[2 * k + 1], r, g, b, A); this.vert(p[2 * j], p[2 * j + 1], r, g, b, A); }
    return this;
  }
  stroke(style: any) {
    const p = this.path, c = style.color, A = style.alpha ?? 1, h = (style.width ?? 1) / 2;
    const r = ((c >> 16) & 255) / 255, g = ((c >> 8) & 255) / 255, b = (c & 255) / 255;
    this.polys++;
    for (let k = 0; k + 3 < p.length; k += 2) {
      const dx = p[k + 2] - p[k], dy = p[k + 3] - p[k + 1], d = Math.hypot(dx, dy) || 1, nx = (-dy / d) * h, ny = (dx / d) * h;
      const a0 = p[k] + nx, a1 = p[k + 1] + ny, b0 = p[k] - nx, b1 = p[k + 1] - ny, c0 = p[k + 2] + nx, c1 = p[k + 3] + ny, d0 = p[k + 2] - nx, d1 = p[k + 3] - ny;
      this.vert(a0, a1, r, g, b, A); this.vert(b0, b1, r, g, b, A); this.vert(c0, c1, r, g, b, A);
      this.vert(c0, c1, r, g, b, A); this.vert(b0, b1, r, g, b, A); this.vert(d0, d1, r, g, b, A);
    }
    this.path = [];
    return this;
  }
  setTransform() { return this; }
}

/** The math with nothing drawn: what our own code costs. */
export class NullPen {
  poly() { return this; } rect() { return this; } circle() { return this; } moveTo() { return this; } lineTo() { return this; }
  fill() { return this; } stroke() { return this; } setTransform() { return this; }
}
