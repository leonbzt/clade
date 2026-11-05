// Clade: the app, the layers, the flow of a Life (pick, start, moult, end) and the input. The turn's events play
// back in playback.ts; the shared pieces live in scene.ts. Feel values: ui/feel.ts and the dev panel (Feel, or `).
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import 'pixi.js/unsafe-eval'; // works where the page's host forbids eval
import { AlphaFilter, Application, Container, Graphics } from 'pixi.js';
import { mount } from 'svelte';
import { NODES, PARTS, PLANS, RULE, TERRAIN, VERBS, type PartId, type PlanId, type VerbId } from './data/life';
import { HABITATS, type HabitatId } from './data/habitats';
import { MODEL, ROLES, type Role } from './data/garden';
import { PREY } from './data/prey';
import * as L from './sim/life';
import { predict } from './sim/hunt';
import { useVerb } from './sim/verbs';
import { BODY_FOR, boardFor, resultOf } from './sim/door';
import { release, step, tierName } from './sim/garden';
import { habitatSpots, makeIsland } from './sim/island';
import { SAVE_KEY, advance, freshSave, parseSave } from './sim/save';
import Meta from './ui/Meta.svelte';
import Clutch from './ui/Clutch.svelte';
import { rollClutch } from './sim/clutch';
import { bump, ctx, ui } from './ui/meta.svelte';
import { S, centre, dirAngle, screen } from './scene';
import { bounce, play } from './playback';
import { feel, onFeel } from './ui/feel';
import { Camera } from './view/camera';
import { Floor } from './view/floor';
import { Fx } from './view/fx';
import { Hunter } from './view/hunter';
import { Marks } from './view/marks';
import { C, PAL, type Ramp } from './view/shade';
import { startTweens, wait } from './view/tween';
import { Worm, type Creature } from './view/worm';
import { Arthropod } from './view/arthropod';
import { Swimmer } from './view/swimmer';
import { preyBody } from './view/preyview';
import { Hud } from './ui/hud';
import { devPanel } from './ui/dev';
import { skin } from './ui/skin';

const PART_RAMP: Partial<Record<string, Ramp>> = { gill: PAL.gill, gut: PAL.amber, pouch: PAL.amber, sclerite: PAL.pale, chaetae: PAL.pale, eye: PAL.pale, proboscis: PAL.flesh };

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

const BODIES: Record<PlanId, Creature> = { worm: new Worm(PAL.you), arthropod: new Arthropod(PAL.you, 1.2), swimmer: new Swimmer(PAL.you) };
const hud = new Hud({ wait: () => act(() => L.stay(S.life)), moult: () => doMoult(), lay: () => act(() => L.lay(S.life)), verb: (v) => doVerb(v) });
const cam = new Camera(world, app.canvas, (x, y) => tap(x, y), (x, y) => hover(x, y));
Object.assign(S, { app, floor, fx, marks, cam, hud, hunter: new Hunter(), you: BODIES.worm, rival: new Worm(PAL.rival, true, 0.85), prey: [], busy: false });
devPanel();
skin();

let habId: HabitatId = 'mud', plan: PlanId = 'worm', niche: Role = 'burrower', verbs: VerbId[] = [];
const inMud = (x: number, y: number) => { const tx = Math.floor(x / C), ty = Math.floor(y / C); return L.inB(tx, ty) && L.tile(S.life, tx, ty).t === 'mud'; };

function applyFeel() {
  for (const b of Object.values(BODIES)) b.squash = feel.squash;
  cam.zoomSpeed = feel.zoomSpeed; cam.shakeAmt = feel.shake;
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
  const dt = Math.min(0.05, tk.deltaMS / 1000), { you, rival, hunter, life } = S;
  you.update(dt); rival.update(dt); hunter.update(dt);
  for (const p of S.prey) p.body.update(dt);
  floor.tick(dt); marks.tick(dt); fx.tick(dt); cam.tick(dt);
  shadows.clear(); bodies.clear(); above.clear();
  if (life?.rivals.length) rival.draw(bodies, shadows, inMud);
  for (const p of S.prey) if (p.visible) p.body.draw(bodies, shadows, inMud);
  you.draw(life?.plan === 'swimmer' ? above : bodies, shadows, inMud);
  hunter.draw(above, shadows);
});

// ---- the garden and the island (slice 13) ----
const save = ctx.save = parseSave(localStorage.getItem(SAVE_KEY)) ?? freshSave((Math.random() * 2 ** 31) | 0, Date.now());
ctx.isl = makeIsland(save.seed); ctx.spots = habitatSpots(ctx.isl);
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* private mode: this visit only */ } };
{ const away = advance(save, Date.now()); if (away.gens >= 2) ui.away = away; persist(); }
ctx.start = (hab, role, vs) => { habId = hab; niche = role; plan = BODY_FOR[role]; verbs = vs; ui.open = false; newLife(); };
ctx.skip = () => { for (let k = 0; k < MODEL.skip; k++) step(save.garden); persist(); };
setInterval(() => { if (ui.open && advance(save, Date.now()).gens) { bump(); persist(); } }, 5000);
mount(Meta, { target: document.getElementById('metaRoot')! });
mount(Clutch, { target: document.getElementById('metaRoot')! });

function choose() { ui.open = true; bump(); }

/** After a Life: open the clutch (if you laid), keep a form, and the eggs go to the garden in the niche you lived. */
function finishLife() {
  const r = resultOf(S.life), tier = tierName(r.hab, r.eggs);
  if (r.eggs <= 0) { settle(r, tier); return; }
  ui.clutch = { cards: rollClutch((Math.random() * 2 ** 31) | 0, r.plan, r.hab, r.eggs, tier), hab: r.hab, role: r.role, plan: r.plan, eggs: r.eggs, tier };
  ui.open = true; ui.hab = null; bump();
  ctx.keep = (k) => { save.forms[`${r.hab}:${r.role}`] = ui.clutch!.cards[k].part; ui.clutch = null; settle(r, tier); };
}

function settle(r: ReturnType<typeof resultOf>, tier: string) {
  const key = `${r.hab}:${r.role}`;
  if (r.eggs > 0) release(save.garden, r);
  for (let k = 0; k < MODEL.afterLife; k++) step(save.garden);
  if (!save.best[key] || 'SABCDF'.indexOf(tier) < 'SABCDF'.indexOf(save.best[key])) save.best[key] = tier;
  save.lives++; persist();
  ui.open = true; ui.hab = r.hab; ui.niche = null; bump();
}

function newLife() {
  const form = save.forms[`${habId}:${niche}`], parts = L.partsFor(plan, verbs);
  const life = S.life = L.newLife((Math.random() * 2 ** 31) | 0, plan, boardFor(save.garden, habId), form && PARTS[form].plans.includes(plan) ? [...parts, form] : parts);
  S.you = BODIES[plan];
  floor.set(life); fx.clear();
  const s = centre(L.at(life.x, life.y));
  S.you.setBody(life.size, life.slots, false); S.you.place(s.x, s.y, dirAngle(life.facing));
  if (life.rivals.length) { const v = life.rivals[0], r = centre(L.at(v.x, v.y)); S.rival.setBody(2, [], false); S.rival.place(r.x, r.y, -Math.PI / 2); }
  S.prey = life.prey.map((p) => { const body = preyBody(p.kind), c = centre(L.at(p.x, p.y)); body.place(c.x, c.y, Math.PI / 2); return { kind: p.kind, body, visible: true }; });
  S.hunter.show.v = 0;
  marks.marks = []; marks.burrows.clear(); marks.aim = -1; marks.preview = [];
  sync();
  hud.refresh(life, true);
  hud.info('Tap a lit tile to move.');
  const h = life.hab, P = PLANS[plan];
  const role = `You came to fill the ${ROLES[niche].name} niche.${form ? ` Your line here carries ${PARTS[form].name.toLowerCase()}.` : ''} `;
  const who = role + (plan === 'swimmer'
    ? `You are the hunter here. ${P.blurb}\nLurk a turn and prey won't notice you; your next swim goes twice as far. Each catch in a row adds speed.`
    : `You are a${plan === 'arthropod' ? 'n' : ''} ${P.name.toLowerCase()}. ${P.blurb} Grow to size ${RULE.adultSize} to lay eggs.\n${h.predatorAt > 20 ? 'No hunter here this time.' : `${h.predator} comes on turn ${h.predatorAt}.`}`);
  hud.showCard(h.name, `${h.blurb}\n\n${who} ${h.event.name} on turns ${h.event.from}–${h.event.to}: ${h.event.text}.`, [{ label: 'Start', on: () => hud.hideCard() }]);
}

function sync(instant = false) {
  const life = S.life;
  floor.refresh();
  S.you.setBody(life.size, life.slots, life.soft);
  S.hunter.resting = life.pred?.state === 'rest';
  if (life.pred?.state !== 'strike') marks.marks = [];
  marks.entry = !life.pred && life.plan !== 'swimmer' && life.phase !== 'over' && life.turn < life.hab.predatorAt ? L.at(...life.hab.entry) : -1;
  marks.dests = S.busy ? new Map() : L.dests(life);
  hud.refresh(life, instant, S.busy);
}

async function act(f: () => void) {
  const life = S.life;
  if (S.busy || life.phase !== 'play' || hud.cardOpen || ui.open) return;
  S.busy = true; marks.dests = new Map(); marks.hover = -1; marks.aim = -1; marks.preview = [];
  f();
  const evs = life.events.slice();
  hud.refresh(life, false, true);
  if (evs.length) await play(evs);
  S.busy = false;
  sync();
  hud.info(life.lines.slice(-2).join(' '));
  if ((life.phase as L.Life['phase']) === 'over') { await wait(0.5); endCard(); }
}

function doVerb(v: VerbId) {
  const life = S.life;
  if (S.busy || hud.cardOpen || ui.open || !L.ready(life, v)) return;
  if (VERBS[v].free) { // no world turn: play its look, stay ready to move
    if (!useVerb(life, v)) { hud.info(life.lines.at(-1) ?? ''); return; }
    const evs = life.events.slice();
    sync(); play(evs);
    hud.info(life.lines.at(-1) ?? '');
    return;
  }
  act(() => { if (!useVerb(life, v)) life.events = []; });
}

function doMoult() {
  const life = S.life;
  if (S.busy || !L.canMoult(life) || hud.cardOpen) return;
  fx.husk(S.you.segs());
  L.moult(life);
  hud.food.set(life.food);
  bounce(0.4);
  fx.burst(S.you.head.x, S.you.head.y, PAL.pale, feel.particles, 0.7);
  hud.showCard(`Moult: size ${life.size}`, 'You shed your skin. Pick a part for your new body.', life.offers.map((id) => {
    const p = PARTS[id], k = L.freeSlotFor(life, id), old = k >= 0 ? life.slots[k].part : null;
    const verb = p.verb && !L.verbs(life).includes(p.verb) ? ` Gives ${VERBS[p.verb].name}.` : '';
    return { label: (p.rare ? 'Rare: ' : '') + p.name, rare: !!p.rare, note: p.does + verb + (old ? ` Replaces your ${PARTS[old].name.toLowerCase()}.` : ''), on: () => pickPart(id) };
  }));
  sync();
}

function pickPart(id: PartId) {
  hud.hideCard();
  L.pick(S.life, id);
  sync();
  bounce();
  fx.burst(S.you.head.x, S.you.head.y, PART_RAMP[id] ?? PAL.you, feel.particles, 0.8);
  hud.info(`${PARTS[id].name}: ${PARTS[id].does}`);
}

function endCard() {
  const life = S.life, r = resultOf(life), tier = L.tierOf(life.hab, life.eggs), nt = L.nextTier(life.hab, life.eggs);
  const lived = r.role === niche ? `You lived as a ${ROLES[r.role].name}.` : `You came as a ${ROLES[niche].name} but ate like a ${ROLES[r.role].name}: the eggs count there.`;
  hud.showCard(life.cause === 'season' ? 'The season ends' : `You died on turn ${life.turn}`,
    `You laid ${life.eggs} eggs: tier ${tier} in the ${life.hab.name.toLowerCase()}. ${lived}${nt ? `\n${nt[0]} needs ${nt[1]}.` : ''}`,
    [{ label: life.eggs ? 'Release your eggs' : 'Back to the island', note: life.eggs ? `They join the ${ROLES[r.role].plural.toLowerCase()} of the ${life.hab.name.toLowerCase()}.` : undefined, on: () => { hud.hideCard(); finishLife(); } }]);
}

// ---- input ----
function tileAt(x: number, y: number) { const tx = Math.floor(x / C), ty = Math.floor(y / C); return L.inB(tx, ty) ? L.at(tx, ty) : -1; }
const eyes = () => S.life.plan === 'swimmer' && L.has(S.life, 'lenses');

function tap(x: number, y: number) {
  const i = tileAt(x, y), life = S.life;
  if (S.busy || i < 0 || hud.cardOpen || ui.open) return;
  if (life.phase === 'play' && L.dests(life).has(i)) {
    if (eyes() && marks.aim !== i) { marks.aim = i; marks.preview = predict(life, i); hud.info('Your eyes show where the prey will go. Tap again to swim there.'); return; }
    act(() => L.move(life, i));
  } else hud.info(tileText(i));
}

function hover(x: number, y: number) {
  marks.hover = S.busy ? -1 : tileAt(x, y);
  if (eyes() && marks.aim < 0) marks.preview = marks.dests.has(marks.hover) ? predict(S.life, marks.hover) : [];
}

function tileText(i: number) {
  const life = S.life, t = life.tiles[i], [x, y] = L.xy(i);
  if (life.pred && L.at(life.pred.x, life.pred.y) === i) return `${life.hab.predator}, the hunter. It swims over rock and strikes the tiles it marks; mud hides a worm, and it won't enter vent water.`;
  const v = life.rivals.find((r) => L.at(r.x, r.y) === i);
  if (v) return `${v.name[0].toUpperCase()}${v.name.slice(1)}. It eats ${NODES[v.eats].name.toLowerCase()}.`;
  const p = life.prey.find((q) => q.alive && !q.hidden && L.at(q.x, q.y) === i);
  if (p) { const P = PREY[p.kind]; return `${P.name}, ${P.food} food. ${P.flees}`; }
  if (life.x === x && life.y === y) return `You: ${PLANS[life.plan].name.toLowerCase()}, size ${life.size}. ${life.plan === 'swimmer' ? 'Lurk to ambush.' : 'Wait to stay put.'}`;
  if (t.t === 'mud' && !t.seen) return "Mud. You can't see what's buried here yet.";
  let s: string = TERRAIN[t.t];
  if (t.node) {
    s = `${NODES[t.node].name}, ${L.foodOf(life, t.node)} food`;
    const lock = L.lockOf(life, t.node);
    if (lock) s += `: ${lock}`;
  } else if (t.t === 'mud') s += life.plan === 'worm' ? ': you tunnel through it, and strikes miss you here' : life.plan === 'swimmer' ? ': worms hide in it' : ': it stops you';
  else if (t.t === 'rock') s += life.plan === 'swimmer' ? ': you swim over it' : ': only the hunter crosses it';
  return life.phase === 'play' ? `${s}. Out of reach this turn.` : `${s}.`;
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.key === 'w' || e.key === ' ') { e.preventDefault(); act(() => L.stay(S.life)); }
  if (e.key === 'l') act(() => L.lay(S.life));
  if (e.key === 'm') doMoult();
  if (e.key === '0') cam.reset();
  const n = '123'.indexOf(e.key);
  if (n >= 0 && S.life) { const v = L.verbs(S.life)[n]; if (v) doVerb(v); }
});

// A hook for the browser check (scripts/look.mjs): drive the game with real taps and read the state.
Object.assign(window, { __game: { get life() { return S.life; }, get busy() { return S.busy; }, tile: (i: number) => screen(centre(i)), get zoom() { return cam.zoom; }, fps: () => app.ticker.FPS } });

S.life = L.newLife(1, plan, HABITATS[habId]); floor.set(S.life); sync(true);

choose();
performance.mark('first-board'); // read by the spike's load check
