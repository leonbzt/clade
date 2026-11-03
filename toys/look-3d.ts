// The look toy, look (b): the same scene as flat-shaded meshes (three), side-on with a tilt you can drag, real
// shadows from the sun, rendered low-res and snapped to the palette.
import * as THREE from 'three';
import {
  GLYPH, ISLAND, PLANTS, SOIL, cellXY, hash, isleSize, pi, prism, sunPos,
  type Flat, type Frame, type Look, type RampId, type V3,
} from './look-data';

const ZF = 1.2; // the soil's cut face (plants stand at z ≈ 0)
const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const QUANT = `uniform sampler2D tex; uniform vec3 pal[32]; uniform int n; varying vec2 vUv;
vec3 srgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }
void main() {
  vec3 c = srgb(texture2D(tex, vUv).rgb), best = pal[0]; float bd = 1e9;
  for (int i = 0; i < 32; i++) { if (i >= n) break; vec3 d = c - pal[i]; float e = dot(d * d, vec3(2.0, 4.0, 3.0)); if (e < bd) { bd = e; best = pal[i]; } }
  gl_FragColor = vec4(best, 1.0);
}`;

/** Draws a scene into a low-res target, then snaps it to the palette on the way to the canvas. */
class Pipe {
  r: THREE.WebGLRenderer;
  rt = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  post = new THREE.Scene();
  cam = new THREE.Camera();
  mat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null }, pal: { value: Array.from({ length: 32 }, () => new THREE.Vector3()) }, n: { value: 0 } },
    vertexShader: VERT, fragmentShader: QUANT, depthTest: false, depthWrite: false,
  });
  constructor(canvas: HTMLCanvasElement) {
    this.r = new THREE.WebGLRenderer({ canvas, antialias: false });
    this.r.setPixelRatio(1);
    this.r.shadowMap.enabled = true;
    this.r.shadowMap.type = THREE.BasicShadowMap;
    this.mat.uniforms.tex.value = this.rt.texture;
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
    quad.frustumCulled = false;
    this.post.add(quad);
  }
  size(w: number, h: number) {
    this.r.setSize(w, h, false);
    this.rt.setSize(w, h);
  }
  palette(f: Flat) {
    f.rgb.forEach((c, i) => this.mat.uniforms.pal.value[i].set(c[0] / 255, c[1] / 255, c[2] / 255));
    this.mat.uniforms.n.value = f.rgb.length;
  }
  render(s: THREE.Scene, c: THREE.Camera) {
    this.r.setRenderTarget(this.rt);
    this.r.render(s, c);
    this.r.setRenderTarget(null);
    this.r.render(this.post, this.cam);
  }
}

/** Coloured triangles merged into one geometry. */
class Buf {
  p: number[] = [];
  c: number[] = [];
  tri(a: V3, b: V3, c: V3, k: THREE.Color) {
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    for (let i = 0; i < 3; i++) this.c.push(k.r, k.g, k.b);
  }
  quad(a: V3, b: V3, c: V3, d: V3, k: THREE.Color) {
    this.tri(a, b, c, k);
    this.tri(a, c, d, k);
  }
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, k: THREE.Color) {
    const q = (a: V3, b: V3, c: V3, d: V3) => this.quad(a, b, c, d, k);
    q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]);
    q([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]);
    q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]);
    q([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]);
    q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);
  }
  /** A pyramid: a ring of `n` points around (x, y, z) in the plane facing `axis`, and an apex `h` out along it. */
  cone(x: number, y: number, z: number, r: number, h: number, n: number, k: THREE.Color, axis: 'y' | 'z', seed: number) {
    const ring: V3[] = [];
    for (let q = 0; q < n; q++) {
      const a = (q / n) * Math.PI * 2 + seed, rr = r * (0.8 + 0.35 * hash(q, seed, 50));
      ring.push(axis === 'y' ? [x + Math.cos(a) * rr, y, z + Math.sin(a) * rr] : [x + Math.cos(a) * rr, y + Math.sin(a) * rr, z]);
    }
    const ap: V3 = axis === 'y' ? [x, y + h, z] : [x - 0.1, y + 0.1, z + h];
    for (let q = 0; q < n; q++) this.tri(ap, ring[q], ring[(q + 1) % n], k);
  }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.computeVertexNormals();
    return g;
  }
}
const setGeo = (m: THREE.Mesh, b: Buf) => (m.geometry.dispose(), (m.geometry = b.geo()));

const colours = new WeakMap<Flat, THREE.Color[]>();
function col(f: Flat, r: RampId, i: number) {
  let cs = colours.get(f);
  if (!cs) colours.set(f, (cs = f.hex.map((h) => new THREE.Color(h))));
  return cs[pi(f, r, i)];
}
function digitTex(n: number) {
  const c = Object.assign(document.createElement('canvas'), { width: 4, height: 6 }), g = c.getContext('2d')!;
  for (const [o, fill] of [[1, '#000'], [0, '#fff']] as [number, string][]) {
    g.fillStyle = fill;
    for (let b = 0; b < 15; b++) if (GLYPH[n][b] === '1') g.fillRect((b % 3) + o, ((b / 3) | 0) + o, 1, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function makeLook3D(): Look {
  const side = document.createElement('canvas'), isle = document.createElement('canvas');
  const A = new Pipe(side), B = new Pipe(isle);
  const matV = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
  const glowV = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });

  // ---- the side scene ----
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 4 / 3, 1, 900);
  const sun = new THREE.DirectionalLight(0xffffff, 3.0);
  sun.shadow.mapSize.set(512, 512);
  Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 260 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.003;
  sun.target.position.set(32, 0, -4);
  scene.add(sun, sun.target, new THREE.AmbientLight(0xffffff, 1.15));
  const mesh = (s: THREE.Scene, m: THREE.Material = matV, cast = false) => {
    const x = new THREE.Mesh(new THREE.BufferGeometry(), m);
    x.castShadow = cast;
    x.receiveShadow = m === matV;
    s.add(x);
    return x;
  };
  const skyGeo = new THREE.SphereGeometry(400, 12, 10);
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false }));
  sky.position.set(32, 0, 0);
  scene.add(sky);
  const sunDisc = new THREE.Mesh(new THREE.IcosahedronGeometry(3.4, 0), new THREE.MeshBasicMaterial());
  scene.add(sunDisc);
  const ground = mesh(scene), hills = mesh(scene, matV, true), lava = mesh(scene, glowV), cells = mesh(scene), roots = mesh(scene, matV, true);
  const plants = PLANTS.map((_, o) => Object.assign(mesh(scene, matV, true), { userData: { owner: o } }));
  const marker = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 4), new THREE.MeshBasicMaterial());
  marker.rotation.x = Math.PI;
  scene.add(marker);
  const texs = GLYPH.map((_, n) => (n ? digitTex(n) : null));
  const digitMats = texs.map((t) => new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5 }));
  const digitGeo = new THREE.PlaneGeometry(1.3, 1.95);
  const digits = Array.from({ length: 64 }, () => {
    const m = new THREE.Mesh(digitGeo, digitMats[1]);
    scene.add(m);
    return m;
  });
  const sparkGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
  const sparks = Array.from({ length: 48 }, () => {
    const m = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial());
    scene.add(m);
    return m;
  });

  // ---- the island scene ----
  const iscene = new THREE.Scene(), icam = new THREE.PerspectiveCamera(30, 1.5, 1, 300);
  const isun = new THREE.DirectionalLight(0xffffff, 3.0);
  isun.shadow.mapSize.set(512, 512);
  Object.assign(isun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 160 });
  isun.shadow.camera.updateProjectionMatrix();
  isun.shadow.bias = -0.006;
  isun.shadow.normalBias = 0.06;
  iscene.add(isun, isun.target, new THREE.AmbientLight(0xffffff, 1.1));
  const land = mesh(iscene, matV, true), iglow = mesh(iscene, glowV);
  const glint = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshBasicMaterial());
  iscene.add(glint);
  icam.position.set(0, 47, 37);
  icam.lookAt(0, 0, 0.5);

  function buildStatic(F: Flat) {
    const pos = skyGeo.attributes.position, cs: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 400, k = col(F, 'sky', y > 0.3 ? 1 : y > 0.1 ? 2 : y > -0.05 ? 3 : 0);
      cs.push(k.r, k.g, k.b);
    }
    skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
    (sunDisc.material as THREE.MeshBasicMaterial).color.copy(col(F, 'warm', 2));
    (marker.material as THREE.MeshBasicMaterial).color.copy(col(F, 'warm', 2));
    digitMats.forEach((m, n) => m.color.copy(col(F, n === 1 ? 'water' : n === 2 ? 'leaf' : n === 3 ? 'warm' : 'rare', n === 2 ? 4 : 1)));
    // ground top and the slab under it
    const g = new Buf(), zs = [-13, -11, -9, -7, -5, -3, -1, ZF];
    const hy = (x: number, j: number) => (x === 0 || x === 64 || j === zs.length - 1 ? 0 : (hash(x, j, 60) - 0.5) * 0.3);
    for (let x = 0; x < 64; x += 2)
      for (let j = 0; j < zs.length - 1; j++) {
        const a: V3 = [x, hy(x, j), zs[j]], b: V3 = [x + 2, hy(x + 2, j), zs[j]], c: V3 = [x + 2, hy(x + 2, j + 1), zs[j + 1]], d: V3 = [x, hy(x, j + 1), zs[j + 1]];
        g.tri(a, b, c, col(F, 'leaf', hash(x, j, 61) > 0.5 ? 3 : 2)), g.tri(a, c, d, col(F, 'leaf', hash(x, j, 62) > 0.5 ? 3 : 2));
      }
    g.box(0, -24, -13, 64, -0.4, ZF - 0.4, col(F, 'earth', 0));
    setGeo(ground, g);
    const h = new Buf(), l = new Buf();
    h.cone(50, 0, -9.5, 6.5, 9, 7, col(F, 'stone', 1), 'y', 1);
    h.cone(12, 0, -10, 5.5, 4.5, 6, col(F, 'leaf', 1), 'y', 2);
    h.cone(29, 0, -11, 4.5, 3.2, 6, col(F, 'leaf', 2), 'y', 3);
    l.cone(50, 8.2, -9.5, 1.3, 0.6, 6, col(F, 'warm', 1), 'y', 4);
    setGeo(hills, h), setGeo(lava, l);
  }

  function buildIsland(f: Frame) {
    const F = f.flat, I = f.island, { w, h } = ISLAND, b = new Buf(), gl = new Buf();
    const P = (x: number, y: number): V3 => [x - w / 2, I.corner[y * (w + 1) + x] * 0.9, y - h / 2];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const ti = y * w + x, t = I.tiles[ti], a = P(x, y), bb = P(x + 1, y), c = P(x, y + 1), d = P(x + 1, y + 1);
        [[a, bb, d], [a, d, c]].forEach((tr, q) => {
          const hh = hash(x, y, 30 + q);
          if (t === 'lava' && hh > 0.78) return gl.tri(tr[0], tr[1], tr[2], col(F, 'warm', hh > 0.9 ? 1 : 0));
          const k = t === 'sea' ? col(F, 'water', hh > 0.94 ? 1 : 0) : t === 'beach' ? col(F, 'earth', 4) : t === 'bare' ? col(F, 'stone', 2)
            : t === 'forest' ? col(F, 'leaf', 3) : t === 'wet' ? (hh > 0.65 ? col(F, 'water', 0) : col(F, 'leaf', 1)) : col(F, 'earth', 1);
          b.tri(tr[0], tr[1], tr[2], k);
        });
        if (I.area[ti] || (t === 'forest' && hash(x, y, 33) > 0.35)) {
          const ht = (a[1] + d[1]) / 2;
          b.cone(x - w / 2 + 0.5, ht, y - h / 2 + 0.55, 0.38, I.area[ti] ? 0.9 : 1.2, 4, col(F, 'leaf', I.area[ti] ? 4 : 1), 'y', ti);
        }
      }
    setGeo(land, b), setGeo(iglow, gl);
    (glint.material as THREE.MeshBasicMaterial).color.copy(col(F, 'rare', 0));
    iscene.background = col(F, 'water', 0).clone();
  }

  function buildCells(f: Frame) {
    const F = f.flat, b = new Buf(), g = 0.06;
    for (let i = 0; i < f.soil.cells.length; i++) {
      const c = i % SOIL.cols, r = (i / SOIL.cols) | 0, x0 = c * 2, y1 = -r * 2, x1 = x0 + 2, y0 = y1 - 2, cx = x0 + 1, cy = y0 + 1;
      const cell = f.soil.cells[i], fd = f.found.has(f.soil.pocket[i]) ? 1 : 0;
      if (!f.revealed[i]) {
        b.box(x0 + g, y0 + g, ZF - 0.4, x1 - g, y1 - g, ZF + 0.25 + hash(c, r, 5) * 0.2, col(F, 'earth', hash(c, r, 6) > 0.5 ? 1 : 0));
        continue;
      }
      const base = col(F, 'earth', cell === 'hard' ? 1 + (hash(c, r, 6) > 0.6 ? 1 : 0) : 2 + (hash(c, r, 6) > 0.5 ? 1 : 0));
      b.box(x0 + g, y0 + g, ZF - 0.4, x1 - g, y1 - g, cell === 'water' ? ZF - 0.3 : ZF, base);
      if (cell === 'stone') b.cone(cx, cy, ZF, 0.9, 0.9, 5, col(F, 'stone', 1), 'z', i);
      if (cell === 'water') b.box(cx - 0.65, cy - 0.65, ZF - 0.35, cx + 0.65, cy + 0.65, ZF - 0.12, col(F, 'water', fd));
      if (cell === 'food') b.cone(cx, cy, ZF, 0.75, 0.8 + fd * 0.4, 5, col(F, 'warm', fd + 0.5), 'z', i);
      if (cell === 'rare') b.cone(cx, cy, ZF, 0.85, 1.3, 4, col(F, 'rare', 0), 'z', i);
    }
    setGeo(cells, b);
  }

  function buildRoots(f: Frame) {
    const F = f.flat, b = new Buf(), z = ZF + 0.12;
    f.soil.roots.forEach((rt, q) => {
      const p = f.progress[q];
      if (p <= 0) return;
      const nodes = (rt.from ? [[rt.from[0], -0.3] as [number, number]] : []).concat(rt.path.map((i) => cellXY(i)));
      const segs = nodes.length - 1, tip = (p / rt.path.length) * segs, k = col(F, 'earth', rt.native ? 3 : 4);
      for (let i = 0; i < segs && i < tip; i++) {
        const u = Math.min(1, tip - i), a = nodes[i], e = nodes[i + 1];
        const end: V3 = [a[0] + (e[0] - a[0]) * u, a[1] + (e[1] - a[1]) * u, z];
        for (const t of prism([a[0], a[1], z], end, 0.3 - (0.18 * i) / segs, 0.3 - (0.18 * (i + u)) / segs)) b.tri(t[0], t[1], t[2], k);
        if (i + 1 >= tip && p < rt.path.length && !rt.native) b.box(end[0] - 0.25, end[1] - 0.25, z - 0.2, end[0] + 0.25, end[1] + 0.25, z + 0.3, col(F, 'warm', 2));
      }
    });
    setGeo(roots, b);
  }

  function buildPlants(f: Frame) {
    const bs = PLANTS.map(() => new Buf());
    for (const p of f.parts) {
      const k = col(f.flat, p.ramp, f.flat.n[p.ramp] - 2 + p.bias);
      for (const t of p.tris) bs[p.owner].tri(t[0], t[1], t[2], k);
    }
    bs.forEach((b, o) => setGeo(plants[o], b));
  }

  let yaw = -0.14, pitch = 0.17, drag: { x: number; y: number; moved: boolean } | null = null, dragged = false;
  side.style.touchAction = 'none';
  side.addEventListener('pointerdown', (e) => ((drag = { x: e.clientX, y: e.clientY, moved: false }), side.setPointerCapture(e.pointerId)));
  side.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    yaw = Math.max(-0.75, Math.min(0.75, yaw - dx * 0.005));
    pitch = Math.max(-0.1, Math.min(0.75, pitch + dy * 0.004));
    (drag.x = e.clientX), (drag.y = e.clientY);
  });
  side.addEventListener('pointerup', () => ((dragged = !!drag?.moved), (drag = null)));

  let flat: Flat | null = null, cellKey = '', rootKey = '', plantKey = '', lastIsle = -1;
  const ray = new THREE.Raycaster();
  return {
    side, isle,
    resize(w: number) {
      const h = Math.round(w * 0.75), [iw, ih] = isleSize(w);
      A.size(w, h), B.size(iw, ih);
      cam.aspect = w / h, icam.aspect = iw / ih;
      cam.updateProjectionMatrix(), icam.updateProjectionMatrix();
      lastIsle = -1;
    },
    draw(f: Frame) {
      const F = f.flat, s = f.sun;
      if (F !== flat) (flat = F), A.palette(F), B.palette(F), buildStatic(F), buildIsland(f), (cellKey = rootKey = plantKey = '');
      const ck = `${f.revealed.reduce((a, b) => a + b, 0)}/${f.found.size}`;
      if (ck !== cellKey) (cellKey = ck), buildCells(f);
      const rk = f.progress.map((p) => p.toFixed(2)).join();
      if (rk !== rootKey) (rootKey = rk), buildRoots(f);
      const pk = f.growth.toFixed(3);
      if (pk !== plantKey) (plantKey = pk), buildPlants(f);
      sun.position.set(32 + s[0] * 120, s[1] * 120, s[2] * 120 - 4);
      sun.castShadow = isun.castShadow = f.shadows;
      const [sx, sy] = sunPos(f.sunF);
      sunDisc.position.set(32 + (sx - 32) * 1.6, sy * 1.6, -60);
      sunDisc.rotation.set(f.time * 0.2, f.time * 0.3, 0);
      // hint digits
      let d = 0;
      f.hints.forEach((n, i) => {
        if (n <= 0 || d >= digits.length) return;
        const m = digits[d++];
        m.material = digitMats[Math.min(8, n)];
        m.position.set((i % SOIL.cols) * 2 + 1, -(((i / SOIL.cols) | 0) * 2 + 1), ZF + 0.03);
        m.visible = true;
      });
      for (; d < digits.length; d++) digits[d].visible = false;
      // pops: sparks flying out of the cut face
      let q = 0;
      for (const p of f.pops) {
        const [cx, cy] = cellXY(p.cell), k = col(F, p.kind === 'water' ? 'water' : p.kind === 'rare' ? 'rare' : 'warm', p.kind === 'water' ? 1 : 2);
        for (let j = 0; j < 8 && q < sparks.length; j++, q++) {
          const an = j * 0.785 + hash(p.cell, j, 3), dist = p.age * (2.5 + hash(j, p.cell, 4) * 2), m = sparks[q];
          m.position.set(cx + Math.cos(an) * dist, cy + Math.sin(an) * dist, ZF + 0.5 + p.age * 3);
          (m.material as THREE.MeshBasicMaterial).color.copy(k);
          m.scale.setScalar(p.age < 0.6 ? 1 : 0.6);
          m.visible = true;
        }
      }
      for (; q < sparks.length; q++) sparks[q].visible = false;
      // the marker above the selected plant
      let top = 1;
      for (const p of f.parts) if (p.owner === f.selected) for (const t of p.tris) for (const v of t) top = Math.max(top, v[1]);
      marker.position.set(PLANTS[f.selected].x, top + 2 + Math.sin(f.time * 4) * 0.3, PLANTS[f.selected].z);
      marker.rotation.y = f.time;
      cam.position.set(32 + 100 * Math.sin(yaw) * Math.cos(pitch), 100 * Math.sin(pitch), 100 * Math.cos(yaw) * Math.cos(pitch));
      cam.lookAt(32, 0, 0);
      A.render(scene, cam);
      if (f.time - lastIsle > 0.05 || f.time < lastIsle) {
        lastIsle = f.time;
        isun.position.set(s[0] * 60, s[1] * 60, s[2] * 60);
        const gx = f.island.glint % ISLAND.w, gy = (f.island.glint / ISLAND.w) | 0;
        glint.position.set(gx - ISLAND.w / 2 + 0.5, f.island.corner[gy * (ISLAND.w + 1) + gx] * 0.9 + 1.4 + Math.sin(f.time * 3) * 0.25, gy - ISLAND.h / 2 + 0.5);
        glint.rotation.y = f.time * 2;
        glint.visible = f.time % 1.6 < 1.1;
        B.render(iscene, icam);
      }
    },
    pick(x: number, y: number) {
      if (dragged) return (dragged = false), -1;
      ray.setFromCamera(new THREE.Vector2((x / side.clientWidth) * 2 - 1, -(y / side.clientHeight) * 2 + 1), cam);
      const hit = ray.intersectObjects(plants, false)[0];
      if (hit) return hit.object.userData.owner as number;
      const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), p) || p.y < -10) return -1;
      let best = -1, bd = 3;
      PLANTS.forEach((g, o) => Math.abs(p.x - g.x) < bd && ((bd = Math.abs(p.x - g.x)), (best = o)));
      return best;
    },
  };
}
