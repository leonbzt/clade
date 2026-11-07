// A spike: the same animals in other styles, and what each way of drawing costs. Nothing here is the game. Throwaway.
import { AlphaFilter, Application, Container, Graphics, Text } from 'pixi.js';
import { LIGHT, PAL, mixRamp } from '../../game/src/view/shade';
import type { Creature } from '../../game/src/view/worm';
import { Body } from '../../toys/creature-body';
import { newBuild } from '../../toys/creature-model';
import { ROWS } from './animals';
import { run, runBench, type Result } from './bench';

const q = new URLSearchParams(location.search), res = q.has('res') ? +q.get('res')! : 0.5, aa = q.has('aa');
const app = new Application();
await app.init({ antialias: aa, background: PAL.sand[1], resolution: res, autoDensity: true, width: 1270, height: 930, preference: 'webgl' });
document.getElementById('stage')!.append(app.canvas);

class StylePen extends Graphics {
  map: ((c: number) => number | null) | null = null;
  override fill(style?: any, alpha?: number) {
    if (!this.map) return super.fill(style, alpha);
    const c = typeof style === 'number' ? style : style?.color, a = (typeof style === 'number' ? alpha : style?.alpha) ?? 1, to = this.map(c);
    return super.fill({ color: to ?? c, alpha: to === null ? 0 : a });
  }
  override stroke(style?: any) {
    if (!this.map) return super.stroke(style);
    const to = this.map(style.color);
    return super.stroke({ ...style, color: to ?? style.color, alpha: to === null ? 0 : style.alpha ?? 1 });
  }
}

interface Style { name: string; light?: number; map?: (c: number, ramp: number[]) => number | null }
const dark = (r: number[]) => mixRamp(r, PAL.ink, 0.35)[0];
const STYLES: Style[] = [
  { name: 'Today' },
  { name: 'New: black outline' },
  { name: 'Dark outline of its own colour', map: (c, r) => (c === PAL.ink ? dark(r) : c) },
  { name: 'Same, softer light', light: 3, map: (c, r) => (c === PAL.ink ? dark(r) : c) },
  { name: 'Almost no outline, softer light', light: 3, map: (c, r) => (c === PAL.ink ? r[1] : c) },
  { name: 'Flat 2D', map: (c, r) => (c === PAL.ink ? dark(r) : r.includes(c) ? r[2] : c) },
];

const sheet = new Container(), shLayer = new Container(), top = new Container();
shLayer.filters = [new AlphaFilter({ alpha: 0.3, resolution: Math.min(res, 1) })];
sheet.addChild(shLayer, top); app.stage.addChild(sheet);
const CW = 211, CH = 150, HEAD = 24;
interface Cell { c: Creature | Body; g: StylePen; sh: Graphics; s: Style; phase: number; ramp: number[] }
const cells: Cell[] = [];
function cell(c: Creature | Body, x: number, y: number, zoom: number, s: Style, phase: number) {
  const host = new Container(), shost = new Container(), g = new StylePen(), sh = new Graphics();
  for (const h of [host, shost]) { h.position.set(x, y); h.scale.set(zoom); }
  host.addChild(g); shost.addChild(sh); top.addChild(host); shLayer.addChild(shost);
  (c as Creature).place(0, 0, 0);
  cells.push({ c, g, sh, s, phase, ramp: (c as Body).ramp });
}
ROWS.concat([{ label: 'Crusher (new only)', lineage: 'crusher', own: false, parts: {}, slots: [] }]).forEach((row, ry) => {
  const phase = ry * 1.3;
  STYLES.forEach((s, cx) => {
    const x = cx * CW, y = HEAD + ry * CH / 1.17;
    const make = (): Creature | Body | null => {
      if (s.name === 'Today') { if (!row.today) return null; const t = row.today(); t.setBody(3, row.slots, false); return t; }
      return new Body(newBuild(row.lineage, 3, row.parts), row.own ? null : row.lineage === 'bristle' ? PAL.rival : PAL.you, 0);
    };
    for (const [px, py, z] of [[CW * 0.33, CH * 0.42, 3], [CW * 0.82, CH * 0.42, 1.875]] as const) { const c = make(); if (c) cell(c, x + px, y + py, z, s, phase); }
  });
});
STYLES.forEach((s, k) => { const t = new Text({ resolution: 2, text: s.name, style: { fontSize: 22, fill: 0x14110d, fontWeight: 'bold', wordWrap: true, wordWrapWidth: 400 } }); t.scale.set(0.5); t.position.set(k * CW + 4, 3); top.addChild(t); });

let on = true;
const tick = () => {
  if (!on) return;
  const dt = Math.min(0.05, app.ticker.deltaMS / 1000);
  for (const a of cells) {
    a.phase += dt * 0.42;
    a.c.head.x = Math.sin(a.phase) * 7; a.c.head.y = Math.sin(a.phase * 2) * 4;
    a.c.moving.v = 0.7; a.c.update(dt);
    const was = LIGHT.k; if (a.s.light) LIGHT.k = a.s.light;
    a.g.clear(); a.sh.clear();
    const ramp = (a.c as Body).ramp, m = a.s.map;
    a.g.map = m && ramp ? (c) => m(c, ramp) : null;
    (a.c as Creature).draw(a.g, a.sh, () => false);
    LIGHT.k = was;
  }
};
app.ticker.add(tick);

const out = document.getElementById('out')!;
const NAMES: Record<string, string> = { math: 'New body: our math only, nothing drawn', mathToday: "Today's classes: our math only", today: "Today's classes, Pixi Graphics", graphics: 'New body, Pixi Graphics, every frame', stagger2: 'Same, each animal redrawn every 2nd frame (30 fps)', stagger4: 'Same, every 4th frame (15 fps)', stagger6: 'Same, every 6th frame (10 fps)', triangles: 'New body, one triangle buffer', baked: 'New body, baked sprites' };
const table = (rows: Result[]) => { out.innerHTML = `<table><tr><th>Way of drawing</th><th>Animals</th><th>Commands, ms</th><th>Whole frame, ms</th><th>Triangles an animal</th><th>Notes</th></tr>${rows.map((r) => `<tr><td>${NAMES[r.mode]}</td><td>${r.n}</td><td>${r.commands.toFixed(2)}</td><td>${r.frame.toFixed(2)}</td><td>${r.mode === 'baked' ? '' : r.tris.toFixed(0)}</td><td style="text-align:left">${r.bake ?? ''}</td></tr>`).join('')}</table>`; };
async function bench() {
  on = false; sheet.visible = false;
  const rows = await runBench(app, table);
  (window as any).__bench = rows;
}
document.getElementById('run')!.addEventListener('click', bench);
/** Where the math goes: pure JavaScript, nothing drawn. */
async function split() {
  const { step } = await import('../../game/src/view/shade');
  const { NullPen } = await import('./tri-pen');
  const bodies = Array.from({ length: 50 }, (_, k) => { const row = ROWS[k % ROWS.length], b = new Body(newBuild(row.lineage, 1 + (k * 7) % 5, k % 2 ? row.parts : {}), PAL.you, 0); b.place(0, 0, 0); b.moving.v = 0.7; return b; });
  let facets = 0;
  class Count extends NullPen { override poly(p?: any) { if (p?.length === 6) facets++; return this; } }
  const nul = new NullPen() as never, c = new Count() as never, FR = 400, dt = 1 / 60;
  const move = () => { for (const b of bodies) { b.head.x += 0.5; b.head.y = Math.sin(b.head.x * 0.1) * 12; b.update(dt); } };
  for (let f = 0; f < 200; f++) { move(); for (const b of bodies) b.draw(nul, nul); }
  let t = performance.now(); for (let f = 0; f < FR; f++) move(); const mv = (performance.now() - t) / FR;
  t = performance.now(); for (let f = 0; f < FR; f++) { move(); for (const b of bodies) b.draw(nul, nul); } const all = (performance.now() - t) / FR;
  for (const b of bodies) b.draw(c, c);
  const P = Array.from({ length: 512 }, (_, k) => [Math.sin(k) * 9, Math.cos(k * 3) * 9, k % 5] as [number, number, number]);
  let sink = 0; t = performance.now();
  for (let f = 0; f < FR; f++) for (let k = 0; k < facets; k++) sink += step(P[k & 511], P[(k + 7) & 511], P[(k + 13) & 511]);
  const light = (performance.now() - t) / FR;
  return { moveMs: mv, shapeAndLightMs: all - mv, lightMs: light, facetsPerAnimal: facets / 50, sink };
}
Object.assign(window, { __toy: { app, bench, split, show: (mode: never) => { on = false; sheet.visible = false; app.renderer.resize(1000, 640); run(app, mode, 50, 100000); } } });
