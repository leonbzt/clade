export { grams } from '../data/units';

export function clock(ticks: number, perSec: number): string {
  const s = Math.floor(ticks / perSec), m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
