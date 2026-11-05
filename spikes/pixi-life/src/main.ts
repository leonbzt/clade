// The mud flats Life in PixiJS: the app, the layers, input, and playing each turn's events back with feel.
// The five feel values live in feel.ts and the dev panel (the Feel button, or the ` key).
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import 'pixi.js/unsafe-eval'; // works where the page's host forbids eval
import { AlphaFilter, Application, Container, Graphics } from 'pixi.js';
import { COLS, NODES, PARTS, PLANS, RULE, TERRAIN, type NodeId, type PartId } from './rules/data';
import * as L from './rules/life';
import { feel, onFeel } from './feel';
import { Camera } from './view/camera';
import { Floor } from './view/floor';
import { Fx } from './view/fx';
import { Hunter } from './view/hunter';
import { Marks } from './view/marks';
import { C, PAL, type Ramp } from './view/shade';
import { ease, startTweens, tween, wait } from './view/tween';
import { Worm } from './view/worm';
import { Hud } from './ui/hud';
import { devPanel } from './ui/dev';

const NODE_RAMP: Record<NodeId, Ramp> = { mat: PAL.leaf, buried: PAL.amber, shell: PAL.shell, carcass: PAL.flesh };
const PART_RAMP: Partial<Record<string, Ramp>> = { gill: PAL.gill, gut: PAL.amber, pouch: PAL.amber, sclerite: PAL.pale, chaetae: PAL.pale, eye: PAL.pale, proboscis: PAL.flesh };
const RED = '#ff6a4c', GOLD = '#ffd75e';
const centre = (i: number) => ({ x: (i % COLS) * C + C / 2, y: Math.floor(i / COLS) * C + C / 2 });
const dirAngle = (d: number) => ((d - 1) * Math.PI) / 2; // east is 0
const turnTo = (from: number, to: number) => from + ((((to - from + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

const app = new Application();
const stage = document.getElementById('stage')!;
await app.init({ antialias: false, background: PAL.deep, resolution: 1 / feel.pixel, autoDensity: true, width: stage.clientWidth || 360, height: stage.clientHeight || 480, preference: 'webgl' });
stage.appendChild(app.canvas);
startTweens(app.ticker);

const world = new Container(), floor = new Floor(), fx = new Fx(), marks = new Marks();
const shadows = new Graphics(), shadowLayer = new Container(), bodies = new Graphics(), above = new Graphics();
shadowLayer.addChild(shadows); shadowLayer.filters = [new AlphaFilter({ alpha: 0.3 })];
world.addChild(floor.root, fx.under, shadowLayer, marks.g, bodies, above, fx.over);
app.stage.addChild(world);

const you = new Worm(PAL.you), rival = new Worm(PAL.rival, true, 0.85), hunter = new Hunter();
const hud = new Hud({ wait: () => act(() => L.stay(life)), moult: () => doMoult(), lay: () => act(() => L.lay(life)) });
const cam = new Camera(world, app.canvas, (x, y) => tap(x, y), (x, y) => hover(x, y));
devPanel();

let life: L.Life, busy = false;
const inMud = (x: number, y: number) => { const tx = Math.floor(x / C), ty = Math.floor(y / C); return L.inB(tx, ty) && L.tile(life, tx, ty).t === 'mud'; };
const screen = (w: { x: number; y: number }) => cam.toScreen(w.x, w.y);

function applyFeel() {
  you.squash = feel.squash; cam.zoomSpeed = feel.zoomSpeed; cam.shakeAmt = feel.shake;
  if (Math.abs(app.renderer.resolution - 1 / feel.pixel) > 1e-6) app.renderer.resize(stage.clientWidth, stage.clientHeight, 1 / feel.pixel);
}
onFeel(applyFeel);
applyFeel();

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (w < 10 || h < 10) return;
  app.renderer.resize(w, h, 1 / feel.pixel);
  cam.resize(w, h);
}
new ResizeObserver(resize).observe(stage);
resize();

app.ticker.add((tk) => {
  const dt = Math.min(0.05, tk.deltaMS / 1000);
  you.update(dt); rival.update(dt); hunter.update(dt);
  floor.tick(dt); marks.tick(dt); fx.tick(dt); cam.tick(dt);
  shadows.clear(); bodies.clear(); above.clear();
  rival.draw(bodies, shadows, inMud);
  you.draw(bodies, shadows, inMud);
  hunter.draw(above, shadows);
});

// ---- a Life ----
function newLife() {
  life = L.newLife((Math.random() * 2 ** 31) | 0);
  floor.set(life); fx.clear();
  const s = centre(L.at(life.x, life.y));
  you.setBody(life.size, life.slots, false); you.place(s.x, s.y, dirAngle(life.facing));
  const v = life.rivals[0], r = centre(L.at(v.x, v.y));
  rival.setBody(2, [], false); rival.place(r.x, r.y, -Math.PI / 2);
  hunter.show.v = 0;
  marks.marks = [];
  sync();
  hud.refresh(life, true);
  hud.info('Tap a lit tile to move.');
  const h = life.hab;
  hud.showCard(h.name, `${h.blurb}\n\nYou are a worm. In mud you tunnel and strikes miss you. Grow to size ${RULE.adultSize} to lay eggs.\n` +
    `${h.predator} comes on turn ${h.predatorAt}. ${h.event.name} on turns ${h.event.from}–${h.event.to}: ${h.event.text}.`, [{ label: 'Start', on: () => hud.hideCard() }]);
}

function sync(instant = false) {
  floor.refresh();
  you.setBody(life.size, life.slots, life.soft);
  hunter.resting = life.pred?.state === 'rest';
  if (life.pred?.state !== 'strike') marks.marks = [];
  marks.entry = !life.pred && life.phase !== 'over' && life.turn < life.hab.predatorAt ? L.at(...life.hab.entry) : -1;
  marks.dests = busy ? new Map() : L.dests(life);
  hud.refresh(life, instant, busy);
}

async function act(f: () => void) {
  if (busy || life.phase !== 'play' || hud.cardOpen) return;
  busy = true; marks.dests = new Map(); marks.hover = -1;
  f();
  const evs = life.events.slice();
  hud.refresh(life, false, true);
  if (evs.length) await play(evs);
  busy = false;
  sync();
  hud.info(life.lines.slice(-2).join(' '));
  if ((life.phase as L.Life['phase']) === 'over') { await wait(0.5); endCard(); }
}

function doMoult() {
  if (busy || !L.canMoult(life) || hud.cardOpen) return;
  fx.husk(you.segs());
  L.moult(life);
  hud.food.set(life.food);
  bounce(0.4);
  fx.burst(you.head.x, you.head.y, PAL.pale, feel.particles, 0.7);
  hud.showCard(`Moult: size ${life.size}`, 'You shed your skin. Pick a part for your new body.', life.offers.map((id) => {
    const p = PARTS[id], k = L.freeSlotFor(life, id), old = k >= 0 ? life.slots[k].part : null;
    return { label: (p.rare ? 'Rare: ' : '') + p.name, rare: !!p.rare, note: p.does + (old ? ` Replaces your ${PARTS[old].name.toLowerCase()}.` : ''), on: () => pickPart(id) };
  }));
  sync();
}

function pickPart(id: PartId) {
  hud.hideCard();
  L.pick(life, id);
  sync();
  bounce();
  fx.burst(you.head.x, you.head.y, PART_RAMP[id] ?? PAL.you, feel.particles, 0.8);
  hud.info(`${PARTS[id].name}: ${PARTS[id].does}`);
}

function endCard() {
  const tier = L.tierOf(life.hab, life.eggs), nt = L.nextTier(life.hab, life.eggs);
  hud.showCard(life.cause === 'season' ? 'The season ends' : `You died on turn ${life.turn}`,
    `You laid ${life.eggs} eggs: tier ${tier} on the mud flats.${nt ? `\n${nt[0]} needs ${nt[1]}.` : ''}`,
    [{ label: 'Live again', on: () => { hud.hideCard(); newLife(); } }]);
}

// ---- feel: playing the events back ----
async function bounce(time = 0.3) {
  await tween(you.stretch, { v: -1 }, time * 0.35, ease.quadOut);
  await tween(you.stretch, { v: 0 }, time * 0.65, ease.backOut);
}

async function glide(path: number[]) {
  const g = feel.glideTime;
  tween(you.moving, { v: 1 }, g * 0.5);
  tween(you.stretch, { v: 1 }, g * 0.45, ease.quadOut);
  for (let k = 0; k < path.length; k++) {
    const c = centre(path[k]), one = path.length === 1, e = one ? ease.sineInOut : k === 0 ? ease.sineIn : k === path.length - 1 ? ease.sineOut : ease.linear;
    await tween(you.head, { x: c.x, y: c.y }, g, e);
    floor.redrawNodes();
  }
  tween(you.moving, { v: 0 }, g * 2);
  await tween(you.stretch, { v: -0.65 }, g * 0.35, ease.quadOut);
  tween(you.stretch, { v: 0 }, g * 0.9, ease.backOut);
  await wait(g * 0.3);
}

async function lunge(dir: number) {
  const g = feel.glideTime, home = { ...you.head }, a = dirAngle(dir);
  tween(you.reach, { v: 1 }, g * 0.5, ease.quadOut);
  await tween(you.head, { x: home.x + Math.cos(a) * 5, y: home.y + Math.sin(a) * 5 }, g * 0.5, ease.quadOut);
  tween(you.reach, { v: 0 }, g * 0.6, ease.backOut);
  await tween(you.head, home, g * 0.6, ease.backOut);
}

async function play(evs: L.Ev[]) {
  for (const e of evs) { // food eaten this turn stays drawn until its moment comes
    if (e.k === 'eat') floor.ghosts.set(e.i, e.node);
    if (e.k === 'rival' && e.ate) floor.ghosts.set(e.to, life.rivals[e.idx].eats);
  }
  floor.redrawNodes();
  const g = feel.glideTime;
  for (const e of evs) {
    switch (e.k) {
      case 'move': if (e.grab) await lunge(e.dir); else await glide(e.path); break;
      case 'eat': {
        floor.ghosts.delete(e.i); floor.redrawNodes();
        const c = centre(e.i), s = screen(c);
        fx.burst(c.x, c.y, NODE_RAMP[e.node], feel.particles);
        hud.floater(s.x, s.y, `+${e.gain}`, GOLD);
        hud.food.set(e.food);
        break;
      }
      case 'locked': { const s = screen(centre(e.i)); hud.floater(s.x, s.y, 'locked', RED); break; }
      case 'lay': {
        await bounce(g * 2);
        fx.clutch(you.head.x, you.head.y + 1, e.n);
        fx.burst(you.head.x, you.head.y, PAL.amber, feel.particles, 0.6);
        const s = screen(you.head); hud.floater(s.x, s.y, `+${e.n} eggs`, GOLD);
        hud.setEggs(e.eggs, L.tierOf(life.hab, e.eggs)); hud.food.set(e.food);
        break;
      }
      case 'stay': await bounce(g * 1.5); break;
      case 'upkeep': hud.food.set(e.food); break;
      case 'shed': {
        you.setBody(life.size, life.slots, life.soft);
        const s = screen(you.head); hud.floater(s.x, s.y, `−${PARTS[e.part].name.toLowerCase()}`, RED);
        break;
      }
      case 'hurt': hud.hp.set(e.health); you.flash.v = 1; tween(you.flash, { v: 0 }, 0.35); hud.flash(0.25); break;
      case 'oxygen': hud.oxy.set(e.oxygen); break;
      case 'rival': {
        const c = centre(e.to);
        tween(rival.moving, { v: 1 }, 0.1);
        tween(rival.head, { x: c.x, y: c.y }, g * 1.2, ease.sineInOut).then(() => {
          tween(rival.moving, { v: 0 }, 0.3);
          if (e.ate) { floor.ghosts.delete(e.to); floor.redrawNodes(); fx.burst(c.x, c.y, PAL.amber, Math.floor(feel.particles / 2)); }
        });
        break;
      }
      case 'pred_arrive': {
        const c = centre(e.at);
        hud.banner(`${life.hab.predator} arrives`, RED);
        Object.assign(hunter.pos, c); hunter.look.a = turnTo(0, Math.atan2(life.y * C - c.y, life.x * C - c.x));
        hunter.show.v = 0; hunter.lift.v = 40; marks.entry = -1;
        tween(hunter.show, { v: 1 }, 0.4);
        await tween(hunter.lift, { v: 12 }, 0.7, ease.backOut);
        break;
      }
      case 'pred_move': {
        const c = centre(e.to);
        tween(hunter.look, { a: turnTo(hunter.look.a, Math.atan2(c.y - hunter.pos.y, c.x - hunter.pos.x)) }, g * 0.5);
        tween(hunter.swim, { v: 1 }, 0.15);
        await tween(hunter.pos, { x: c.x, y: c.y }, g * 1.6, ease.sineInOut);
        tween(hunter.swim, { v: 0.4 }, 0.4);
        break;
      }
      case 'marks': {
        const d = (e.dir + 2) % 4;
        tween(hunter.look, { a: turnTo(hunter.look.a, dirAngle(d)) }, 0.2);
        marks.marks = e.marks; marks.markDir = e.dir; marks.from = { ...hunter.pos }; marks.pop.v = 0;
        tween(marks.pop, { v: 1 }, 0.22, ease.backOut);
        break;
      }
      case 'strike': await strike(e); break;
      case 'event': hud.banner(`${e.name}: ${e.text}`, '#ff8a3a'); floor.refresh(); break;
      case 'over': break;
    }
  }
  await wait(0.05);
}

async function strike(e: Extract<L.Ev, { k: 'strike' }>) {
  const g = feel.glideTime, home = { ...hunter.pos }, c = centre(e.at), goal = { x: home.x + (c.x - home.x) * 0.7, y: home.y + (c.y - home.y) * 0.7 };
  tween(hunter.grab, { v: 1 }, g * 0.6);
  await tween(hunter.pos, { x: home.x - (goal.x - home.x) * 0.15, y: home.y - (goal.y - home.y) * 0.15 }, g * 0.8, ease.quadOut);
  tween(hunter.lift, { v: 2 }, g * 0.5);
  await tween(hunter.pos, goal, g * 0.55, ease.expoIn);
  marks.marks = [];
  tween(hunter.pos, home, g * 1.4, ease.quadOut);
  tween(hunter.lift, { v: 12 }, g * 1.6, ease.quadOut);
  tween(hunter.grab, { v: 0 }, g * 1.6);
  const s = screen(you.head), h = you.head;
  if (e.kind === 'hit') {
    cam.shake(1); you.flash.v = 1; tween(you.flash, { v: 0 }, 0.4); hud.flash(0.35);
    fx.burst(h.x, h.y, PAL.hunter, feel.particles, 1.3);
    hud.hp.set(e.health);
    you.setBody(life.size, life.slots, life.soft);
    hud.floater(s.x, s.y, e.part ? `−${PARTS[e.part].name.toLowerCase()}` : `−${e.damage} health`, RED);
  } else if (e.kind === 'blocked') {
    cam.shake(0.55); fx.burst(h.x, h.y, PAL.pale, feel.particles, 1.1); hud.floater(s.x, s.y, 'blocked', '#d2dccf');
  } else if (e.kind === 'buried') {
    cam.shake(0.3); fx.burst(c.x, c.y, PAL.mudSeen, Math.ceil(feel.particles / 2), 0.8); hud.floater(s.x, s.y, 'buried', '#c9a26a');
  } else { cam.shake(0.3); hud.floater(s.x, s.y, 'miss', '#9fb2bd'); }
  await wait(g * 1.2);
}

// ---- input ----
function tileAt(x: number, y: number) { const tx = Math.floor(x / C), ty = Math.floor(y / C); return L.inB(tx, ty) ? L.at(tx, ty) : -1; }

function tap(x: number, y: number) {
  const i = tileAt(x, y);
  if (busy || i < 0 || hud.cardOpen) return;
  if (life.phase === 'play' && L.dests(life).has(i)) act(() => L.move(life, i));
  else hud.info(tileText(i));
}

function hover(x: number, y: number) { marks.hover = busy ? -1 : tileAt(x, y); }

function tileText(i: number) {
  const t = life.tiles[i], [x, y] = L.xy(i);
  if (life.pred && L.at(life.pred.x, life.pred.y) === i) return `${life.hab.predator}, the hunter. It swims over rock and strikes the tiles it marks; mud hides you.`;
  const v = life.rivals.find((r) => L.at(r.x, r.y) === i);
  if (v) return `${v.name[0].toUpperCase()}${v.name.slice(1)}. It eats ${NODES[v.eats].name.toLowerCase()}.`;
  if (life.x === x && life.y === y) return `You: ${PLANS[life.plan].name.toLowerCase()}, size ${life.size}. Wait to stay put.`;
  if (t.t === 'mud' && !t.seen) return "Mud. You can't see what's buried here yet.";
  let s: string = TERRAIN[t.t];
  if (t.node) {
    s = `${NODES[t.node].name}, ${NODES[t.node].food + L.count(life, 'gut') * RULE.gutFood} food`;
    const lock = L.lockOf(life, t.node);
    if (lock) s += `: ${lock}`;
  } else if (t.t === 'mud') s += ': you tunnel through it, and strikes miss you here';
  else if (t.t === 'rock') s += ': only the hunter crosses it';
  return life.phase === 'play' ? `${s}. Out of reach this turn.` : `${s}.`;
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.key === 'w' || e.key === ' ') { e.preventDefault(); act(() => L.stay(life)); }
  if (e.key === 'l') act(() => L.lay(life));
  if (e.key === 'm') doMoult();
  if (e.key === '0') cam.reset();
});

// A hook for the browser check: the AI drives the build with real taps and reads the state.
Object.assign(window, { __pixi: { get life() { return life; }, get busy() { return busy; }, tile: (i: number) => screen(centre(i)), get zoom() { return cam.zoom; }, fps: () => app.ticker.FPS } });

newLife();
performance.mark('first-board'); // read by the spike's load check
