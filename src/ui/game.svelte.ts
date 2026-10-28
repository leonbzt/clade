// Holds the live game, runs the fixed-tick loop, and turns UI actions into sim commands.
// Panels re-read the game when `ui.v` bumps (twice a second, so numbers stay readable); the map redraws every frame.
import { NUM } from '../data/numbers';
import * as cmd from '../sim/commands';
import { createState, type State } from '../sim/state';
import { step } from '../sim/tick';
import { botTick } from '../sim/bot';
import { VIEWS, type View } from '../view/render';

export let game: State = createState(1);

type Toast = { id: number; text: string; kind: 'info' | 'bad' | 'fact' };

class UI {
  v = $state(0);
  gen = $state(0); // bumps when the game object is replaced
  speed = $state(1);
  placing = $state<string | null>(null); // a species id, or `v:<variant>` while founding a new species
  foundName = $state(''); // the name for that new species
  focus = $state('thallus');
  tab = $state<'species' | 'tile'>('species');
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

function frame(now: number) {
  acc += Math.min(1000, now - (last || now)) * ui.speed;
  last = now;
  let n = 0;
  while (acc >= TICK_MS && n < 5000) { step(game); acc -= TICK_MS; n++; }
  if (n >= 5000) acc = 0;
  if (now - lastBump > 500) { ui.v++; lastBump = now; }
  requestAnimationFrame(frame);
}

export function start() {
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
  if (q.get('tab') === 'species' || q.get('tab') === 'tile') ui.tab = q.get('tab') as 'species' | 'tile';
  if (q.get('tab') === 'tree') ui.tree = true;
  if (q.get('tile')) ui.selected = Number(q.get('tile'));
  if (VIEWS.includes(q.get('view') as View)) ui.view = q.get('view') as View;
  if (q.get('place')) startPlacing(q.get('place')!);
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
  for (let k = 0; k < seconds * NUM.ticksPerSec; k++) step(game);
  ui.v++;
}

/** The greedy bot plays for a while: a quick way to see later stages. */
export function autoplay(seconds: number) {
  for (let k = 0; k < seconds * NUM.ticksPerSec; k++) botTick(game);
  ui.v++;
}

export function selectTile(i: number) {
  ui.selected = i; ui.tab = 'tile';
}

export function unlockAll() {
  cmd.unlockAll(game); ui.v++;
}

export function addBiomass(n: number) {
  game.biomass += n; ui.v++;
}

export function reset() {
  game = createState(Math.floor(Math.random() * 1e9));
  ui.placing = null; ui.focus = 'thallus'; ui.tab = 'species'; ui.tree = false; ui.selected = -1;
  ui.gen++; ui.v++;
}
