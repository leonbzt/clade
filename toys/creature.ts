// Toy 18: the body toy. "Is the creature I built the one I see, and does it still feel like mine when it becomes a new lineage?"
// A big drawing with its slots, the same creature walking real tiles, and at map size; recipes, the Become stage, the family card.
import { Application, Container, UPDATE_PRIORITY } from 'pixi.js';
import { Floor } from '../game/src/view/floor';
import { C, PAL } from '../game/src/view/shade';
import { newLife } from '../game/src/sim/life';
import { MUD_FLATS } from '../game/src/data/habitats';
import { LINEAGES, RECIPES, type LineageId, type Recipe } from './creature-data';
import { become, cloneBuild, newBuild, setPart, signatureOf, slotsOf, type Became, type Build, type Mode, type Slot } from './creature-model';
import { Body } from './creature-body';
import { drawMapForm } from './creature-parts';
import { Compare, Crowd, Region } from './creature-views';
import { buildPanel, cardHtml, pickerHtml, type Ui } from './creature-ui';

const app = new Application();
const stageEl = document.getElementById('stage')!, cells = document.getElementById('cells')!;
await app.init({ antialias: false, background: PAL.deep, resolution: 0.5, autoDensity: true, width: 400, height: 400, preference: 'webgl' }); // the game's pixel size
stageEl.prepend(app.canvas);
const layer = new Container();
app.stage.addChild(layer);

// ---- the cells ----
const buildBox = document.createElement('div'), compareBox = document.createElement('div'), crowdBox = document.createElement('div');
buildBox.style.display = 'grid'; buildBox.style.gap = '6px'; compareBox.style.display = 'grid'; compareBox.style.gap = '6px';
buildBox.innerHTML = `
  <div class="cell" id="vBig"><span class="cap" id="bigCap"></span><span class="cap r" id="bigSize"></span></div>
  <div id="picker"></div>
  <div class="row2">
    <div class="cell" id="vStrip"><span class="cap">Board size: tap a tile to walk there</span></div>
    <div class="cell" id="vMap"><span class="cap">Map size</span></div>
  </div>
  <div id="cardBox" hidden>
    <div id="vCard"><div class="cell" id="vParent"></div><div class="arrow">→</div><div class="cell" id="vChild"></div></div>
    <div id="cardText"></div>
  </div>`;
crowdBox.innerHTML = '<div class="cell" id="vCrowd"></div>';
cells.append(buildBox, compareBox, crowdBox);
const $ = (id: string) => document.getElementById(id)!;

const big = new Region(layer, $('vBig'), PAL.sand[1]), strip = new Region(layer, $('vStrip'), PAL.deep), map = new Region(layer, $('vMap'), 0x1a5a68);
const parentCell = new Region(layer, $('vParent'), PAL.sand[1]), childCell = new Region(layer, $('vChild'), PAL.sand[1]);
const compare = new Compare(layer, compareBox), crowd = new Crowd(layer, $('vCrowd'));
const floor = new Floor(), life = newLife(1, 'worm', MUD_FLATS);
life.tiles.forEach((t) => { t.seen = true; });
floor.set(life);
strip.world.addChildAt(floor.root, 0);
const WINDOW = { x0: 0, y0: 0, w: 8, h: 4 };

// ---- the state ----
export interface State {
  view: 'build' | 'compare' | 'crowd'; build: Build; slot: string | null; mono: boolean; native: boolean; walk: boolean; mode: Mode;
  from: { build: Build; recipe: Recipe } | null; became: Became | null; keepExtras: boolean;
}
const S: State = { view: 'build', build: newBuild('arthropod', 3), slot: null, mono: false, native: false, walk: true, mode: 'mix', from: null, became: null, keepExtras: false };

interface Walker { body: Body; path: [number, number][]; auto: boolean; build: Build; rest: number }
const colour = () => (S.native ? null : PAL.you);
const bigBody = new Body(S.build, colour()), me: Walker = { body: new Body(S.build, colour()), path: [], auto: false, build: S.build, rest: 0 };
let pinned: Walker[] = [], parentBody: Body | null = null, childBody: Body | null = null;
const tileMid = (x: number, y: number): [number, number] => [(x + 0.5) * C, (y + 0.5) * C];
me.body.place(...tileMid(1, 1), 0);

/** Creatures at map size: they share the body's numbers, not its drawing. */
const roamers = Array.from({ length: 6 }, (_, k) => ({ x: (k - 3) * 20, y: Math.sin(k * 2.1) * 24, tx: 0, ty: 0, a: k, who: k }));

function refreshBodies() {
  bigBody.setBuild(S.build); me.body.setBuild(S.build); me.build = S.build;
  placeBig();
  ui.refresh(); drawPicker();
}
function placeBig() { bigBody.place(bigBody.L / 2, 0, 0); }
function recolour() {
  const all = [bigBody, me.body, ...pinned.map((p) => p.body), ...(parentBody ? [parentBody] : []), ...(childBody ? [childBody] : [])];
  for (const b of all) { b.colour = colour(); b.setBuild(b.build); }
}

// ---- becoming ----
let stage = -1; // seconds into the staged change; -1: none
let pendingChild: Became | null = null;

function startBecome(r: Recipe) {
  if (stage >= 0) return;
  S.from = { build: cloneBuild(S.build), recipe: r };
  pendingChild = become(S.build, r, S.mode, S.keepExtras);
  stage = 0;
}
function landChild(b: Became) {
  S.became = b; S.build = b.build; S.slot = null;
  refreshBodies(); placeBig();
  parentBody = new Body(S.from!.build, colour()); parentBody.place(parentBody.L / 2, 0, 0);
  childBody = new Body(S.build, colour()); childBody.place(childBody.L / 2, 0, 0);
  $('cardBox').hidden = false;
  $('cardText').innerHTML = cardHtml(S);
  layout();
}
/** A switch was moved after becoming: the same parent, the new way in, at once. */
function remake() {
  if (S.from) landChild(become(S.from.build, S.from.recipe, S.mode, S.keepExtras));
  ui.refresh();
}
function goBack() {
  if (!S.from) return;
  S.build = S.from.build; S.from = null; S.became = null; S.slot = null;
  $('cardBox').hidden = true;
  layout(); refreshBodies();
}

// ---- input ----
const ui: Ui = buildPanel(S, {
  lineage(id: LineageId) { S.build = newBuild(id, S.build.size); S.from = null; S.became = null; S.slot = null; $('cardBox').hidden = true; layout(); refreshBodies(); },
  size(n) { S.build.size = n; if (S.from) { S.from.build.size = n; parentBody?.setBuild(S.from.build); childBody?.setBuild(S.build); } bigBody.setBuild(S.build); me.body.setBuild(S.build); placeBig(); compare.size = n; compare.apply(); ui.sized(); },
  view(v) { S.view = v; layout(); ui.refresh(); },
  mono(on) { S.mono = on; ui.refresh(); },
  native(on) { S.native = on; recolour(); ui.refresh(); },
  walk(on) { S.walk = on; ui.refresh(); },
  mode(m) { S.mode = m; remake(); },
  extras(on) { S.keepExtras = on; remake(); },
  become: startBecome,
  back: goBack,
  pin() { if (pinned.length >= 3) pinned.shift(); const copy = cloneBuild(S.build), body = new Body(copy, colour()); const t = tileMid(5, 2); body.place(t[0], t[1], Math.PI); pinned.push({ body, path: [], auto: true, build: copy, rest: 0.4 }); ui.refresh(); },
  clearPins() { pinned = []; ui.refresh(); },
  withParts(on) { compare.withParts = on; compare.apply(); ui.refresh(); },
  withPartsOn: () => compare.withParts,
  crowdMode(m) { crowd.mode = m; crowd.ms = crowd.frame = 0; crowd.fill(); ui.refresh(); },
  pinCount: () => pinned.length,
  crowdRead: () => ({ ms: crowd.ms, frame: crowd.frame, mode: crowd.mode }),
});

function pickSlot(s: Slot | null) { S.slot = s ? s.id : null; drawPicker(); }
function drawPicker() {
  const el = $('picker');
  const slot = slotsOf(S.build).find((q) => q.id === S.slot) ?? null;
  el.innerHTML = pickerHtml(S.build, slot);
  el.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.addEventListener('click', () => {
    if (!slot) return;
    setPart(S.build, slot.id, (b.dataset.part || null) as never);
    bigBody.setBuild(S.build); me.body.setBuild(S.build); childBody?.setBuild(S.build);
    ui.refresh(); drawPicker();
    if (S.became) $('cardText').innerHTML = cardHtml(S);
  }));
}

$('vBig').addEventListener('pointerdown', (e) => {
  const r = $('vBig').getBoundingClientRect(), { x, y } = big.toWorld(e.clientX - r.left, e.clientY - r.top);
  let best: Slot | null = null, d = (22 / big.zoom) ** 2;
  for (const s of slotsOf(S.build)) for (const flip of s.kind === 'side' ? [false, true] : [false]) {
    const [sx, sy] = bigBody.slotAt(s, flip), q = (sx - x) ** 2 + (sy - y) ** 2;
    if (q < d) { d = q; best = s; }
  }
  pickSlot(best);
});

$('vStrip').addEventListener('pointerdown', (e) => {
  const r = $('vStrip').getBoundingClientRect(), { x, y } = strip.toWorld(e.clientX - r.left, e.clientY - r.top);
  const tx = Math.floor(x / C), ty = Math.floor(y / C);
  if (tx < WINDOW.x0 || ty < WINDOW.y0 || tx >= WINDOW.x0 + WINDOW.w || ty >= WINDOW.y0 + WINDOW.h) return;
  const fx = Math.floor(me.body.head.x / C), fy = Math.floor(me.body.head.y / C);
  me.path = [tileMid(tx, fy), tileMid(tx, ty)];
  if (fx === tx) me.path.shift();
});

// ---- layout ----
function layout() {
  buildBox.style.display = S.view === 'build' ? 'grid' : 'none';
  compareBox.style.display = S.view === 'compare' ? 'grid' : 'none';
  crowdBox.style.display = S.view === 'crowd' ? 'block' : 'none';
  const w = stageEl.clientWidth, h = cells.scrollHeight;
  if (app.renderer.width !== w || app.renderer.height !== h) app.renderer.resize(w, h, 0.5);
  const box = stageEl.getBoundingClientRect();
  const shown = S.view === 'build';
  for (const q of [big, strip, map]) { q.show(shown); if (shown) q.fit(box); }
  const card = shown && !$('cardBox').hidden;
  for (const q of [parentCell, childCell]) { q.show(card); if (card) q.fit(box); }
  for (const q of compare.regions) { q.show(S.view === 'compare'); if (S.view === 'compare') q.fit(box); }
  crowd.region.show(S.view === 'crowd');
  if (S.view === 'crowd') { const was = crowd.region.w; crowd.region.fit(box); if (crowd.region.w !== was) crowd.fill(); }
  floorFit();
}
const floorFit = () => {
  const z = Math.min(strip.w / (WINDOW.w * C), 2.4);
  strip.look(z, (WINDOW.w * C) / 2, (WINDOW.h * C) / 2);
};
new ResizeObserver(() => layout()).observe(document.body);

// ---- the frame ----
const SPEED = 56; // world units per second, about 2.3 tiles
function move(w: Walker, dt: number) {
  const b = w.body;
  if (!w.path.length && w.auto) { // pinned builds wander by themselves
    w.rest -= dt;
    if (w.rest <= 0) {
      const tx = Math.floor(Math.random() * WINDOW.w), ty = Math.floor(Math.random() * WINDOW.h), fy = Math.floor(b.head.y / C);
      w.path = [tileMid(tx, fy), tileMid(tx, ty)]; w.rest = 0.5 + Math.random() * 1.2;
    }
  }
  const going = w.path.length > 0;
  if (going) {
    const [tx, ty] = w.path[0], dx = tx - b.head.x, dy = ty - b.head.y, d = Math.hypot(dx, dy), s = SPEED * dt;
    if (d <= s) { b.head.x = tx; b.head.y = ty; w.path.shift(); } else { b.head.x += (dx / d) * s; b.head.y += (dy / d) * s; }
  }
  const to = going ? 1 : 0, k = Math.min(1, dt * 7);
  b.moving.v += (to - b.moving.v) * k; b.stretch.v += ((going ? 0.45 : 0) - b.stretch.v) * k;
  b.update(dt);
}

function tickBuild(dt: number) {
  // the big drawing
  let pop = 1;
  if (stage >= 0) {
    const was = stage; stage += dt;
    const T1 = 0.5, T2 = 1.35;
    if (stage < T1) { bigBody.flash.v = me.body.flash.v = stage / T1; bigBody.stretch.v = -stage / T1; }
    if (was < T1 && stage >= T1 && pendingChild) { landChild(pendingChild); pendingChild = null; }
    if (stage >= T1) { const q = (stage - T1) / (T2 - T1); bigBody.flash.v = me.body.flash.v = Math.max(0, 1 - q * 1.5); bigBody.stretch.v = 0; pop = 1 + 0.16 * Math.sin(Math.min(1, q) * Math.PI); }
    if (stage >= T2) { stage = -1; bigBody.flash.v = me.body.flash.v = 0; }
  }
  bigBody.treadmill = S.walk ? 7 : 0; bigBody.moving.v = S.walk ? 0.5 : 0.05;
  bigBody.reach.v = S.walk ? Math.max(0, Math.sin(bigBody.time() * 0.9) ** 5) : 0;
  bigBody.update(dt);
  const z = bigZoom();
  big.look(z, 0, 0, pop);
  big.setMono(S.mono); big.clear(); big.paintBg(S.mono ? PAL.sand[3] : PAL.sand[1]);
  bigBody.draw(big.g, big.sh);
  if (!S.mono && stage < 0) markers(big, bigBody);
  if (stage >= 0.5) burst(big, stage - 0.5, bigBody);
  $('bigCap').textContent = S.build.name ? `${S.build.name}, a ${LINEAGES[S.build.lineage].name}` : LINEAGES[S.build.lineage].name;
  $('bigSize').textContent = `size ${S.build.size}`;

  // board size, on real tiles
  floor.tick(dt);
  floorFit();
  strip.setMono(S.mono); strip.clear();
  move(me, dt);
  for (const p of pinned) { move(p, dt); p.body.draw(strip.g, strip.sh); }
  me.body.draw(strip.g, strip.sh);

  // map size
  map.look(2, 0, 0); map.setMono(S.mono); map.clear();
  const all = [me, ...pinned], W = map.w / 4 - 8, H = map.h / 4 - 8;
  for (const q of roamers) {
    if (Math.hypot(q.tx - q.x, q.ty - q.y) < 2) { q.tx = (Math.random() - 0.5) * 2 * W; q.ty = (Math.random() - 0.5) * 2 * H; }
    const a = Math.atan2(q.ty - q.y, q.tx - q.x);
    q.a = a; q.x += Math.cos(a) * dt * 7; q.y += Math.sin(a) * dt * 7;
    const w = all[q.who % all.length];
    drawMapForm(map.g, w.body, signatureOf(w.build), q.x, q.y, a);
  }

  // the family card
  if (!$('cardBox').hidden && parentBody && childBody) {
    for (const [r, b] of [[parentCell, parentBody], [childCell, childBody]] as const) {
      b.moving.v = 0.2; b.treadmill = 3; b.update(dt);
      r.look(Math.min(r.w / 60, 3.6)); r.setMono(S.mono); r.clear();
      b.draw(r.g, r.sh);
    }
  }
}

function bigZoom() {
  const L5 = C * (bigBody.lin.len[0] + bigBody.lin.len[1] * 5), R5 = C * (bigBody.lin.R[0] + bigBody.lin.R[1] * 5);
  return Math.min(big.w / (L5 * 1.65 + 26), big.h / (R5 * 2 + 30));
}

const KIND_COL: Record<string, number> = { front: 0xffb45e, crown: 0xffe033, side: 0x8fe0ef, back: 0xc7e89a, tail: 0xf59be0 };
function markers(r: Region, b: Body) {
  const g = r.above, rad = 5.5 / r.zoom, w = 1.6 / r.zoom;
  for (const s of slotsOf(S.build)) for (const flip of s.kind === 'side' ? [false, true] : [false]) {
    const [x, y] = b.slotAt(s, flip), on = S.slot === s.id, has = !!S.build.parts[s.id];
    g.circle(x, y, rad + w).fill({ color: 0x000000, alpha: 0.55 });
    g.circle(x, y, rad).fill({ color: KIND_COL[s.kind], alpha: has ? 0.95 : 0.25 });
    g.circle(x, y, rad).stroke({ width: on ? w * 1.7 : w, color: on ? 0xffffff : KIND_COL[s.kind] });
  }
}

function burst(r: Region, t: number, b: Body) {
  const g = r.above, q = Math.min(1, t / 0.8), R = (b.L * 0.5 + 8) + q * 24, a = 1 - q;
  g.circle(0, 0, R).stroke({ width: 2.4 * (1 - q) + 0.3, color: PAL.gold, alpha: a });
  for (let k = 0; k < 10; k++) { const ang = (k / 10) * Math.PI * 2 + 0.3, l0 = R + 2, l1 = R + 6 + q * 5; g.moveTo(Math.cos(ang) * l0, Math.sin(ang) * l0).lineTo(Math.cos(ang) * l1, Math.sin(ang) * l1).stroke({ width: 1.2, color: PAL.gold, alpha: a }); }
}

let frameStart = 0;
app.ticker.add(() => {
  frameStart = performance.now();
  const dt = Math.min(0.05, app.ticker.deltaMS / 1000);
  if (S.view === 'build') tickBuild(dt);
  else if (S.view === 'compare') compare.tick(dt, S.mono);
  else { crowd.tick(dt, S.mono); ui.readCost(); }
});
app.ticker.add(() => { if (S.view === 'crowd') crowd.frame += (performance.now() - frameStart - crowd.frame) * 0.05; }, null, UPDATE_PRIORITY.UTILITY); // after the render: Pixi builds Graphics geometry there

placeBig();
layout();
drawPicker();
ui.refresh();
Object.assign(window, { __toy: { app, S, ui, slotsOf, setPart, bigBody, me, compare, crowd, layout, drawPicker, refreshBodies, bigZoomNow: () => big.zoom } }); // for the look script
