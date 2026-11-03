// The app's state: the game (plain objects, not proxied) and a version counter the views read to refresh. The garden
// ticks once a second (× the dev speed), saves every 10 s and on close, and catches up on load.
import { ECONOMY } from '../data/garden';
import { cancelRun, gameStep, newGame, type Game } from '../sim/game';
import type { Run } from '../sim/run/run';
import { catchUp, fromSave, SAVE_KEY, toSave, type Away } from '../sim/save';

export const S: { game: Game; run: Run | null } = { game: null as unknown as Game, run: null };
export const ui = $state({
  v: 0, // bumped whenever the game changes
  screen: 'island' as 'island' | 'run',
  speed: 1, away: null as Away | null, choosing: -1 as number, // a sprout id while you pick its patch
  patch: -1, dev: false, auto: false,
});
export const bump = () => { ui.v++; };

function load() {
  let raw: string | null = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch { /* private mode */ }
  const saved = raw ? fromSave(raw) : null;
  if (!saved) { S.game = newGame(Math.floor(Math.random() * 1e9)); return; }
  S.game = saved.game;
  cancelRun(S.game); // a run left mid-way: the sprout and the biomass come back
  const away = catchUp(S.game, (Date.now() - saved.at) / 1000);
  if (away.seconds >= 60) ui.away = away;
}

export function save() {
  try { localStorage.setItem(SAVE_KEY, toSave(S.game, Date.now())); } catch { /* full or blocked */ }
}

export function reset() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* */ }
  S.game = newGame(Math.floor(Math.random() * 1e9)); S.run = null;
  ui.screen = 'island'; ui.choosing = -1; ui.patch = -1; ui.away = null;
  bump();
}

/** Skip ahead (dev): the same catch-up as offline, with its summary. */
export function skip(seconds: number) {
  ui.away = catchUp(S.game, seconds);
  bump();
}

let last = 0, debt = 0, sinceSave = 0;
export function start() {
  load();
  last = performance.now();
  setInterval(() => {
    const now = performance.now(), dt = (now - last) / 1000;
    last = now;
    debt = Math.min(debt + dt * ui.speed, 3600);
    const n = Math.floor(debt);
    if (n > 0) {
      debt -= n;
      for (let k = 0; k < n; k++) gameStep(S.game);
      bump();
    }
    sinceSave += dt;
    if (sinceSave >= ECONOMY.saveEvery) { sinceSave = 0; save(); }
  }, 250);
  addEventListener('pagehide', save);
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
}
