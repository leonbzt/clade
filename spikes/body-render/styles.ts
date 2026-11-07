// A spike: seven looks on the one general body, side by side and moving, and what each costs. Throwaway.
import { Application, Container, Graphics, RenderTexture, Sprite, Text, UPDATE_PRIORITY } from 'pixi.js';
import { LIGHT, PAL } from '../../game/src/view/shade';
import { Body } from '../../toys/creature-body';
import type { LineageId, PartId } from '../../toys/creature-data';
import { newBuild } from '../../toys/creature-model';
import { StylePen, cozy, cuteId, fineBody, mixC, outlineFilter, softBody, washOf } from './looks';

type Pipe = { kind: 'direct' } | { kind: 'chunky' } | { kind: 'pixel' };
interface Look { name: string; sub: string; bg: number; fps: number; pipe: Pipe; prep?: (b: Body) => void; draw: (b: Body, g: StylePen, sh: Graphics, big: number) => void; speckle?: number; shade?: number }

const q = new URLSearchParams(location.search), tile = q.get('px') === '24' ? 24 : 16, ART = tile / 24;
const PAPER = 0xe9dfc6, wash = washOf(PAPER), SOFT = 0xcdbb8a;
const LOOKS: Look[] = [
  { name: 'A. Today', sub: 'facets, chunky screen, every frame', bg: PAL.sand[1], fps: 0, pipe: { kind: 'chunky' }, draw: (b, g, sh) => { g.map = null; g.engrave = 0; b.draw(g, sh); } },
  { name: 'B. Fine low poly', sub: 'a finer skin, smooth light, sharp', bg: 0x8d9a86, fps: 0, pipe: { kind: 'direct' }, draw: (b, g, sh) => fineBody(b, g, sh) },
  { name: 'C. Pixels, facets', sub: `today's body at ${tile} px a tile, 10 fps`, bg: 0xc9b27c, fps: 10, pipe: { kind: 'pixel' }, speckle: 0xbda570, prep: (b) => { b.ramp = cozy(b.ramp); }, draw: (b, g, sh) => { const was = LIGHT.k; LIGHT.k = 3; g.map = (c) => (c === PAL.ink ? mixC(b.ramp[0], 0x2b1d3f, 0.5) : c); b.draw(g, sh); LIGHT.k = was; g.map = null; } },
  { name: 'D. Pixels, soft', sub: `one smooth shape at ${tile} px a tile, 10 fps`, bg: 0xc9b27c, fps: 10, pipe: { kind: 'pixel' }, speckle: 0xbda570, prep: (b) => { b.ramp = cozy(b.ramp); }, draw: (b, g, sh, big) => softBody(b, g, sh, { line: 0, big, pixel: ART, sheen: false }) },
  { name: 'E. Soft shapes', sub: 'smooth outline, flat tones, big eyes', bg: SOFT, fps: 0, pipe: { kind: 'direct' }, prep: (b) => { b.ramp = cozy(b.ramp); }, draw: (b, g, sh, big) => softBody(b, g, sh, { line: 1, big, sheen: true }) },
  { name: 'F. Paper cut-out', sub: 'white edge, drop shadow, 8 fps', bg: 0x6f9a98, fps: 8, pipe: { kind: 'direct' }, draw: (b, g, sh, big) => softBody(b, g, sh, { line: 1.8, edge: 0xfbf6e6, big, sheen: false }) },
  { name: 'G. Field-guide plate', sub: 'ink line, thin wash, on paper', bg: PAPER, fps: 12, pipe: { kind: 'direct' }, shade: 0, draw: (b, g, sh) => { const was = LIGHT.k; LIGHT.k = 3; g.map = wash; g.engrave = 0.22; b.draw(g, sh); LIGHT.k = was; g.map = null; g.engrave = 0; } },
];
interface Animal { label: string; latin: string; lineage: LineageId; parts: Record<string, PartId>; size: number }
const ANIMALS: Animal[] = [
  { label: 'Worm', latin: 'Annelida', lineage: 'worm', parts: { side0: 'gill', side2: 'bristles' }, size: 3 },
  { label: 'Lobopod', latin: 'Lobopodia', lineage: 'lobopod', parts: {}, size: 3 },
  { label: 'Arthropod', latin: 'Arthropoda', lineage: 'arthropod', parts: { front0: 'claw', side4: 'gill' }, size: 3 },
  { label: 'Trilobite', latin: 'Trilobita', lineage: 'trilobite', parts: {}, size: 3 },
  { label: 'Crusher', latin: 'Brachyura?', lineage: 'crusher', parts: {}, size: 3 },
  { label: 'Anomalocaris', latin: 'Radiodonta', lineage: 'anomalocaris', parts: {}, size: 3 },
];

const CW = 182, CH = 142, HEAD = 40, W = CW * LOOKS.length, H = HEAD + CH * ANIMALS.length;
const app = new Application();
await app.init({ antialias: true, background: 0x14110d, resolution: Math.min(2, devicePixelRatio || 1), autoDensity: true, width: W, height: H, preference: 'webgl' });
document.getElementById('stage')!.append(app.canvas);

interface Cell { b: Body; g: StylePen; sh: Graphics; look: Look; big: number; phase: number; held: number; rt?: RenderTexture; root?: Container; filter?: boolean }
const sheet = new Container(); app.stage.addChild(sheet);
let cells: Cell[] = [], cute = q.has('cute'), smooth = false;

const TURN = -0.3;
function makeBody(a: Animal, look: Look) {
  const id = cute ? cuteId(a.lineage) : a.lineage, nb = newBuild(id, a.size, a.parts);
  delete nb.parts.back0; delete nb.parts.back2; // the lobopod's starting spines hide its shape on a small sheet
  const b = new Body(nb, null, 0);
  look.prep?.(b); b.place(Math.cos(TURN) * b.L * 0.45, Math.sin(TURN) * b.L * 0.45, TURN); b.treadmill = 16; return b;
}
const filter = outlineFilter();
function makeCell(a: Animal, look: Look, x: number, y: number, zoom: number, phase: number, parent: Container) {
  const b = makeBody(a, look), g = new StylePen(), sh = new Graphics(), big = cute ? 1.5 : 1;
  sh.alpha = look.shade ?? 0.28;
  const c: Cell = { b, g, sh, look, big, phase, held: Math.random() };
  if (look.pipe.kind === 'direct') {
    const host = new Container(); host.position.set(x, y); host.scale.set(zoom); host.addChild(sh, g); parent.addChild(host);
  } else {
    const art = look.pipe.kind === 'pixel' ? ART : zoom * 0.5, show = look.pipe.kind === 'pixel' ? Math.round(zoom / ART) : 2, side = Math.ceil(170 / show);
    c.rt = RenderTexture.create({ width: side, height: side, resolution: 1, scaleMode: 'nearest', antialias: false });
    c.root = new Container(); c.root.position.set(Math.round(side / 2), Math.round(side / 2)); c.root.scale.set(art); c.root.addChild(sh, g);
    if (look.pipe.kind === 'pixel') { g.filters = [filter]; }
    const s = new Sprite(c.rt); s.anchor.set(0.5); s.position.set(Math.round(x), Math.round(y)); s.scale.set(show); s.roundPixels = true; parent.addChild(s);
  }
  cells.push(c);
}
const label = (text: string, x: number, y: number, size: number, fill: number, opts: object = {}) => { const t = new Text({ resolution: 2, text, style: { fontSize: size * 2, fill, wordWrap: true, wordWrapWidth: (CW - 8) * 2, ...opts } }); t.scale.set(0.5); t.position.set(x, y); return t; };

function buildSheet() {
  for (const k of cells) k.rt?.destroy(true);
  sheet.removeChildren().forEach((c) => c.destroy({ children: true }));
  cells = [];
  LOOKS.forEach((look, cx) => {
    const col = new Container(), bg = new Graphics().rect(0, 0, CW, H).fill(look.bg); col.x = cx * CW; col.addChild(bg); sheet.addChild(col);
    if (look.speckle) for (let k = 0; k < 110; k++) bg.rect(Math.floor((((k * 7919) % 997) / 997) * CW / 4) * 4, HEAD + Math.floor((((k * 104729) % 991) / 991) * (H - HEAD) / 4) * 4, 4, 4).fill(look.speckle);
    bg.rect(0, 0, 1, H).fill(0x14110d);
    col.addChild(label(look.name, 5, 3, 12.5, 0x14110d, { fontWeight: 'bold' }), label(look.sub, 5, 18, 10, 0x14110d));
    ANIMALS.forEach((a, ry) => {
      const y = HEAD + ry * CH + CH * 0.5, phase = ry * 1.3;
      makeCell(a, look, CW * 0.34, y, 2.5, phase, col);
      makeCell(a, look, CW * 0.8, y, 1.875, phase, col);
      if (cx === 0) col.addChild(label(a.label, 5, HEAD + ry * CH + 2, 10, 0x14110d));
      if (look.name.startsWith('G')) col.addChild(label(`Fig. ${ry + 1}. ${a.latin}`, 5, HEAD + ry * CH + CH - 15, 10, 0x2c2014, { fontFamily: 'Georgia, serif', fontStyle: 'italic' }));
    });
  });
}
buildSheet();

function drawCell(c: Cell) {
  c.g.clear(); c.sh.clear();
  c.look.draw(c.b, c.g, c.sh, c.big);
  if (c.rt) app.renderer.render({ container: c.root!, target: c.rt, clear: true });
}
let on = true;
app.ticker.add(() => {
  if (!on) return;
  const dt = Math.min(0.05, app.ticker.deltaMS / 1000);
  for (const c of cells) {
    c.b.moving.v = 0.7; c.b.update(dt);
    c.held += dt;
    const fps = smooth ? 0 : c.look.fps;
    if (!fps || c.held >= 1 / fps) { c.held = fps ? c.held % (1 / fps) : 0; drawCell(c); }
  }
});

const bar = (id: string, fn: (el: HTMLElement) => void) => { const el = document.getElementById(id)!; el.addEventListener('click', () => fn(el)); return el; };
const setCute = (v: boolean) => { cute = v; document.getElementById('cute')!.textContent = `Proportions: ${cute ? 'cute' : 'as built'}`; buildSheet(); };
bar('cute', () => setCute(!cute)); setCute(cute);
bar('smooth', (el) => { smooth = !smooth; el.textContent = `Movement: ${smooth ? 'all every frame' : "each look's own"}`; });

/** Fifty animals in one look: redraws at the look's own rate, on one layer. Whole frame on the main thread. */
async function cost() {
  on = false; sheet.visible = false;
  const out: Record<string, { own: number; every: number }> = {}, f = 70, skip = 20;
  const measure = async (look: Look, every: boolean) => {
    const root = new Container(); app.stage.addChild(root);
    const shown = new Container(), W2 = W, H2 = H, pixel = look.pipe.kind === 'pixel', chunky = look.pipe.kind === 'chunky';
    const list = Array.from({ length: 50 }, (_, k) => {
      const a = ANIMALS[k % ANIMALS.length], b = makeBody(a, look), g = new StylePen(), sh = new Graphics(), host = new Container();
      host.position.set(((k % 10) + 0.5) * W2 / 10, (Math.floor(k / 10) + 0.5) * H2 / 5); host.scale.set(pixel ? 2 : 1.875);
      sh.alpha = look.shade ?? 0.28; host.addChild(sh, g); shown.addChild(host);
      return { a, b, g, sh, phase: k * 0.7 };
    });
    let rt: RenderTexture | null = null;
    if (pixel || chunky) {
      const r = pixel ? 1 / 3 : 0.5;
      rt = RenderTexture.create({ width: Math.ceil(W2 * r), height: Math.ceil(H2 * r), resolution: 1, scaleMode: 'nearest', antialias: false });
      shown.scale.set(r); if (pixel) shown.filters = [filter];
      const s = new Sprite(rt); s.scale.set(1 / r); root.addChild(s);
    } else root.addChild(shown);
    const per = every || !look.fps ? 1 : Math.max(1, Math.round(60 / look.fps));
    let n = 0, tot = 0, t0 = 0, tick = 0;
    const before = () => {
      t0 = performance.now(); tick++;
      list.forEach((o, k) => {
        o.b.moving.v = 0.7; o.b.update(1 / 60);
        if ((k + tick) % per === 0) { o.g.clear(); o.sh.clear(); look.draw(o.b, o.g, o.sh, cute ? 1.5 : 1); }
      });
      if (rt) app.renderer.render({ container: shown, target: rt, clear: true });
    };
    const after = () => { if (tick > skip) { tot += performance.now() - t0; n++; } };
    app.ticker.add(before, null, UPDATE_PRIORITY.HIGH); app.ticker.add(after, null, UPDATE_PRIORITY.UTILITY);
    while (n < f - skip) await new Promise((r) => requestAnimationFrame(r));
    app.ticker.remove(before); app.ticker.remove(after);
    shown.filters = []; app.stage.removeChild(root); root.destroy({ children: true }); shown.destroy({ children: true }); rt?.destroy(true);
    return tot / n;
  };
  for (const look of LOOKS) { await measure(look, true); out[look.name] = { every: await measure(look, true), own: await measure(look, false) }; }
  sheet.visible = true; on = true;
  document.getElementById('out')!.innerHTML = `<table><tr><th>Look</th><th>50 animals, each drawn every frame, ms</th><th>At the look's own rate, ms</th></tr>${LOOKS.map((l) => `<tr><td>${l.name}</td><td>${out[l.name].every.toFixed(1)}</td><td>${out[l.name].own.toFixed(1)}</td></tr>`).join('')}</table>`;
  return out;
}
bar('run', () => { void cost(); });
Object.assign(window, { __toy: { app, cost, setCute, setSmooth: (v: boolean) => { smooth = v; } } });
