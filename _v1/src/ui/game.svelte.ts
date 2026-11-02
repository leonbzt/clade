// Holds the live game, runs the fixed-tick loop, and turns UI actions into sim commands.
// Panels re-read the game when `ui.v` bumps (twice a second, so numbers stay readable); the map redraws every frame.
import { NUM } from '../data/numbers';
import * as cmd from '../sim/commands';
import { createState, type State } from '../sim/state';
import { step } from '../sim/tick';
import { botTick, runBotTick } from '../sim/bot';
import { canRun, finish, founders, offers, runCost, type RunLine } from '../sim/lineage';
import { bringHome, land, placeHeir, startRun } from '../sim/run';
import { profiles } from '../sim/fit';
import { timer } from '../sim/slots';
import { VIEWS, type View } from '../view/render';

/** Home, and the island on screen: home, or the run island while you're away (home waits, paused). */
export let home: State = createState(1);
export let game: State = home;

type Toast = { id: number; text: string; kind: 'info' | 'bad' | 'fact' };

class UI {
  v = $state(0);
  gen = $state(0); // bumps when the game object is replaced
  speed = $state(1);
  placing = $state<string | null>(null); // a species id, or `v:<variant>` while founding a new species
  foundName = $state(''); // the name for that new species
  focus = $state('thallus');
  tab = $state<'species' | 'tile' | 'animal' | 'habitats' | 'lineage'>('species');
  runSetup = $state(false); // the run's offers and founders are open
  lastRun = $state<RunLine | null>(null); // the run that just ended, for its card back home
  place = $state(-1); // the habitat shown in the Habitats tab (its bucket)
  gear = $state(-1); // the loadout card unfolded there
  banner = $state<{ id: number; text: string } | null>(null); // the headline over the map
  lit = $state<{ place: number; group: number } | null>(null); // a holder lit up on the map
  follow = $state(-1); // the id of the animal whose card is open; the camera follows it
  tree = $state(false); // the tree of life screen is open
  hoverVariant = $state(-1); // a variant whose tiles light up on the map
  view = $state<View>('none');
  hover = $state(-1);
  selected = $state(-1); // the tile shown in the Tile tab
  dev = $state(false);
  toasts = $state<Toast[]>([]);
}
export const ui = new UI();

const TICK_MS = 1000 / NUM.ticksPerSec;
let acc = 0, last = 0, lastBump = 0, toastId = 0;
export const perf = { ms: 0 }; // smoothed cost of one sim tick, for the dev panel

function frame(now: number) {
  acc += Math.min(1000, now - (last || now)) * ui.speed;
  last = now;
  let n = 0;
  const t0 = performance.now();
  // A run waits for its landing, and stops at its end (the end card is up).
  const still = !!game.run && (!game.run.landed || !!game.run.end);
  if (still) acc = 0;
  while (acc >= TICK_MS && n < 5000 && !(game.run?.end)) { step(game); acc -= TICK_MS; n++; }
  if (n) perf.ms += ((performance.now() - t0) / n - perf.ms) * 0.05;
  if (n >= 5000) acc = 0;
  if (game.run && !game.run.landed && !ui.placing) ui.placing = 'land';
  if (now - lastBump > 500) { ui.v++; lastBump = now; banners(now); }
  requestAnimationFrame(frame);
}

export function start() {
  timer.now = () => performance.now();
  requestAnimationFrame(frame);
  (window as unknown as { dev: unknown }).dev = {
    dump: () => ({ tick: game.tick, biomass: game.biomass, reached: game.reached, combos: game.combos,
      cover: Object.fromEntries(game.species.map((s) => [s.id, cmd.coverCount(game, s.id)])),
      variants: game.variants.filter((x) => x.alive && x.shown).length }),
    state: () => game,
    skip, addBiomass, reset, autoplay, unlockAll,
  };
  // Dev URL options for screenshots and previews: ?bot=600 (the bot plays 600 s), ?tab=species|tile, ?tile=412,
  // ?place=moss, ?view=zones|water|soil|nitrogen|shade, ?zoom=3 (read in MapView).
  const q = new URLSearchParams(location.search), bot = Number(q.get('bot'));
  if (bot > 0) autoplay(bot);
  if (q.get('tab') === 'species' || q.get('tab') === 'tile' || q.get('tab') === 'habitats') ui.tab = q.get('tab') as 'species' | 'tile' | 'habitats';
  if (q.get('tab') === 'tree') ui.tree = true;
  if (q.get('tile')) ui.selected = Number(q.get('tile'));
  if (VIEWS.includes(q.get('view') as View)) ui.view = q.get('view') as View;
  if (q.get('place')) startPlacing(q.get('place')!);
  // ?run=0|1 starts a run on that offer (the price paid by the dev), ?runbot=300 lets the run bot play 300 s of it.
  if (q.get('run')) { home.biomass += runCost(home); if (!home.reached.includes('land')) home.reached.push('land'); beginRun(Number(q.get('run')), 0); }
  if (game.run && Number(q.get('runbot')) > 0) autoplay(Number(q.get('runbot')));
}

// Headlines show one at a time over the map, queued (a few at most, so a skip doesn't bury the map).
let queue: string[] = [], seenHead = 0, bannerUntil = 0, bannerId = 0;
function banners(now: number) {
  const fresh = game.heads.filter((h) => h.tick > seenHead);
  if (fresh.length) { seenHead = fresh[fresh.length - 1].tick; queue = [...queue, ...fresh.map((h) => h.text)].slice(-3); }
  if (ui.banner && now < bannerUntil) return;
  const next = queue.shift();
  ui.banner = next ? { id: ++bannerId, text: next } : null;
  bannerUntil = now + 4000;
}

export function toast(text: string, kind: Toast['kind'] = 'info') {
  const id = ++toastId;
  ui.toasts = [...ui.toasts, { id, text, kind }].slice(-4);
  setTimeout(() => { ui.toasts = ui.toasts.filter((t) => t.id !== id); }, kind === 'fact' ? 9000 : 4000);
}

function report(r: cmd.Result, okText?: string) {
  if (!r.ok) toast(r.reason, 'bad');
  else if (r.msg) toast(r.msg, 'fact');
  else if (okText) toast(okText);
  ui.v++;
  return r.ok;
}

export function startPlacing(speciesId: string) {
  ui.placing = speciesId; ui.focus = speciesId;
}

/** Pick a spot for a new species founded from variant `v`, named `name`. */
export function startFounding(v: number, name: string) {
  ui.placing = `v:${v}`; ui.foundName = name;
}

export function doFound(i: number) {
  if (!ui.placing) return;
  if (game.run) {
    if (ui.placing === 'land') { if (land(game, profiles(game), i)) ui.placing = null; else toast('The founder can\u2019t live here.', 'bad'); }
    else if (ui.placing.startsWith('heir:')) {
      if (placeHeir(game, profiles(game), Number(ui.placing.slice(5)), i) >= 0) { ui.placing = null; toast('The heir is down.'); }
      else toast('Not there: within reach of the line, where it can live.', 'bad');
    }
    ui.v++;
    return;
  }
  if (ui.placing.startsWith('v:')) {
    if (report(cmd.foundSpecies(game, Number(ui.placing.slice(2)), i, ui.foundName))) {
      ui.placing = null; ui.focus = game.species[game.species.length - 1].id;
    }
    return;
  }
  const name = cmd.placement(game, ui.placing)?.name ?? ui.placing;
  if (report(cmd.found(game, ui.placing, i), `${name} founded.`)) ui.placing = null;
}

/** You looked at these variants (tile card or panel): their glint stops. */
export function seeVariants(vs: number[]) {
  for (const v of vs) cmd.markSeen(game, v);
}

export function doEvolve(nodeId: string) {
  report(cmd.evolve(game, nodeId));
}

export function skip(seconds: number) {
  if (game.run && !game.run.landed) return;
  for (let k = 0; k < seconds * NUM.ticksPerSec && !game.run?.end; k++) step(game);
  ui.v++;
}

/** The greedy bot plays for a while: a quick way to see later stages (on a run, the run bot). */
export function autoplay(seconds: number) {
  for (let k = 0; k < seconds * NUM.ticksPerSec && !game.run?.end; k++) (game.run ? runBotTick : botTick)(game);
  if (game.run?.landed) ui.placing = null;
  ui.v++;
}

/** Start a run: offer k, founder f. Home pays and waits; the run island goes on screen, waiting for the landing. */
export function beginRun(k: number, f: number) {
  const can = canRun(home);
  if (!can.ok) { toast(can.reason, 'bad'); return; }
  game = startRun(home, offers(home)[k], founders(home)[f]);
  ui.runSetup = false; ui.placing = 'land'; ui.tab = 'lineage'; ui.focus = 'line'; ui.tree = false; ui.selected = -1; ui.follow = -1; ui.place = -1;
  ui.view = 'none'; ui.lit = null; ui.lastRun = null;
  queue = []; seenHead = 0; ui.banner = null;
  ui.gen++; ui.v++;
}

export function pickHeir(k: number) {
  ui.placing = `heir:${k}`;
}

export function doBringHome() {
  if (bringHome(game)) ui.v++;
}

/** Back home: the run's form, finds and XP go to the lineage; home carries on where it stopped. */
export function endRun() {
  if (!game.run) return;
  ui.lastRun = finish(home, game);
  game = home;
  ui.placing = null; ui.tab = 'lineage'; ui.focus = 'thallus'; ui.selected = -1; ui.view = 'none';
  queue = []; seenHead = home.heads.length ? home.heads[home.heads.length - 1].tick : 0; ui.banner = null;
  ui.gen++; ui.v++;
}

/** Opens an animal's card and follows it. */
export function followAnimal(id: number) {
  ui.follow = id; ui.tab = 'animal';
}

export function selectTile(i: number) {
  ui.selected = i; ui.tab = 'tile';
}

/** Shows a habitat's loadout (the Habitats tab). */
export function selectPlace(p: number) {
  if (ui.place !== p) { ui.lit = null; ui.gear = -1; }
  ui.place = p; ui.tab = 'habitats';
}

export function unlockAll() {
  cmd.unlockAll(game); ui.v++;
}

export function addBiomass(n: number) {
  game.biomass += n; ui.v++;
}

export function reset() {
  game = home = createState(Math.floor(Math.random() * 1e9));
  ui.runSetup = false; ui.lastRun = null;
  ui.placing = null; ui.focus = 'thallus'; ui.tab = 'species'; ui.tree = false; ui.selected = -1; ui.follow = -1; ui.place = -1; ui.lit = null; ui.gear = -1;
  queue = []; seenHead = 0; ui.banner = null;
  ui.gen++; ui.v++;
}
