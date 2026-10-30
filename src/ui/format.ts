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

/** Real mass, two significant digits: "0.40 mg", "40 g", "1.2 kg", "3.5 t". */
export function grams(g: number): string {
  const [v, unit] = g >= 1e6 ? [g / 1e6, 't'] : g >= 1e3 ? [g / 1e3, 'kg'] : g >= 1 ? [g, 'g'] : [g * 1e3, 'mg'];
  return `${v >= 100 ? Math.round(v / 10) * 10 : v >= 10 ? Math.round(v) : v >= 1 ? v.toFixed(1) : v.toPrecision(2)} ${unit}`;
}
