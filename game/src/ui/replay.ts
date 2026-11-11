// Read-only projections of a saved settlement: the release, then the generations after it. Neither playback nor
// skipping calls the sim.
import type { Spread } from '../sim/sea-life';
import type { Sea } from '../sim/sea';
import { headlineText } from '../sim/sea-news';

export function changes(spread: Spread, index: number) {
  const before = index ? spread.frames[index - 1].pop : spread.before;
  return spread.frames[index].pop.flatMap((pop, patch) => Math.abs(pop - before[patch]) < 1e-6 ? []
    : [{ patch, from: before[patch], to: pop, grew: pop > before[patch] }]);
}

/** Frame 0 is the release; the rest are the generations the sea passes after a Life. */
export function replayTitle(spread: Spread, index: number): string {
  return index === 0 ? 'Your eggs settle' : `The sea moves on · ${index} of ${spread.frames.length - 1}`;
}

export function replayLines(sea: Sea, spread: Spread, index: number): string[] {
  if (index === 0) return [`${spread.eggs} eggs settle in patch ${spread.patch + 1}.`];
  const moved = changes(spread, index), news = spread.frames[index].news.map((n) => headlineText(sea, n));
  if (!moved.length) return [`Your line held patch ${spread.patch + 1}.`, ...news];
  return news.length ? news : moved.map((c) => `Patch ${c.patch + 1}: your line ${c.grew ? 'grew' : 'fell'}, ${c.from.toFixed(1)} → ${c.to.toFixed(1)}.`);
}
