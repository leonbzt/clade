// Holds the live game, runs the fixed-tick loop, and turns UI actions into sim commands.
// Panels re-read the game when `ui.v` bumps (5 times a second); the map redraws every frame.
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import * as cmd from '../sim/commands';
import { createState, type State } from '../sim/state';
import { step } from '../sim/tick';
import { botTick } from '../sim/bot';
import type { Overlay } from '../view/render';

export let game: State = createState(1);

type Toast = { id: number; text: string; kind: 'info' | 'bad' | 'fact' };

class UI {
  v = $state(0);
  gen = $state(0); // bumps when the game object is replaced
  speed = $state(1);
  placing = $state<string | null>(null);
  focus = $state('moss');
  tab = $state<'species' | 'tree'>('tree');
  overlay = $state<Overlay>('none');
  hover = $state(-1);
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
  if (now - lastBump > 200) { ui.v++; lastBump = now; }
  requestAnimationFrame(frame);
}

export function start() {
  requestAnimationFrame(frame);
  (window as unknown as { dev: unknown }).dev = {
    dump: () => ({ tick: game.tick, biomass: game.biomass, reached: game.reached, traits: game.traits,
      cover: Object.fromEntries(SPECIES.map((s) => [s.id, cmd.coverCount(game, s.id)])) }),
    state: () => game,
    skip, addBiomass, reset, autoplay,
  };
  // Dev URL options for screenshots and previews: ?bot=600 (the bot plays 600 s), ?tab=species, ?place=moss,
  // ?view=zones, ?zoom=3 (read in MapView).
  const q = new URLSearchParams(location.search), bot = Number(q.get('bot'));
  if (bot > 0) autoplay(bot);
  if (q.get('tab') === 'species') ui.tab = 'species';
  if (q.get('view') === 'zones' || q.get('view') === 'soil') ui.overlay = q.get('view') as Overlay;
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

export function doFound(i: number) {
  if (!ui.placing) return;
  const name = SPECIES.find((s) => s.id === ui.placing)!.name;
  if (report(cmd.found(game, ui.placing, i), `${name} founded.`)) ui.placing = null;
}

export function doBuy(speciesId: string, traitId: string) {
  report(cmd.buyTrait(game, speciesId, traitId));
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

export function addBiomass(n: number) {
  game.biomass += n; ui.v++;
}

export function reset() {
  game = createState(Math.floor(Math.random() * 1e9));
  ui.placing = null; ui.focus = 'moss'; ui.tab = 'tree';
  ui.gen++; ui.v++;
}
