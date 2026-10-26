// Holds the one live game, runs the frame loop, and hands the UI a fresh snapshot each frame.
// The UI reads `store.s` and changes the game only through `act`.
import { createGame } from '../core/state';
import { advance } from '../core/step';
import { releaseGain, releaseGainPlusOne, type ReleaseGain } from '../core/release';
import { addGenes, jumpToMosses } from '../core/dev';
import type { GameState } from '../core/types';
import { VIEW } from '../data/view';

let game: GameState = createGame();

class Store {
  s = $state.raw<GameState>(structuredClone(game));
  speed = $state(1);
  plusOne = $state.raw<ReleaseGain | null>(null);
}

export const store = new Store();

function refresh(): void {
  store.s = structuredClone(game);
}

export function act<T>(fn: (g: GameState) => T): T {
  const out = fn(game);
  refresh();
  return out;
}

export function setSpeed(x: number): void {
  store.speed = x;
}

export function skip(seconds: number): void {
  act((g) => advance(g, seconds));
}

export function reset(): void {
  game = createGame();
  store.plusOne = null;
  refresh();
}

let last = 0;
let sincePreview = Infinity;

function frame(now: number): void {
  const real = last ? Math.min(VIEW.maxFrameSeconds, (now - last) / 1000) : 0;
  last = now;
  if (real > 0) advance(game, real * store.speed);
  sincePreview += real;
  if (sincePreview >= VIEW.previewRefresh) {
    sincePreview = 0;
    store.plusOne = game.phase === 'colony' && game.reveal.releasePreview ? releaseGainPlusOne(game) : null;
  }
  refresh();
  requestAnimationFrame(frame);
}

export function start(): void {
  requestAnimationFrame(frame);
  // Text-first debugging: window.dev.dump() in the console.
  (window as unknown as { dev: unknown }).dev = {
    dump: () => JSON.stringify(game, null, 1),
    state: () => game,
    gain: () => releaseGain(game),
    skip,
    speed: setSpeed,
    genes: (n = 100) => act((g) => addGenes(g, n)),
    mosses: () => act((g) => jumpToMosses(g)),
    reset,
  };
}
