// Number formatting for the UI.
export function fmt(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e4) return `${(n / 1e3).toFixed(1)}k`;
  if (n >= 100) return Math.floor(n).toString();
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}
