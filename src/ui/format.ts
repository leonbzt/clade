export function fmt(n: number): string {
  if (n < 10) return n.toFixed(1);
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(n < 1e4 ? 2 : 1) + 'k';
  return (n / 1e6).toFixed(2) + 'M';
}

export function clock(ticks: number, perSec: number): string {
  const s = Math.floor(ticks / perSec), m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
