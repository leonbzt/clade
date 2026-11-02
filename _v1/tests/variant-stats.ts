// Variant measures for the sim runner, sampled once a sim second. `line()` is one row per seed; `variantSummary()`
// counts the slice 07–09 checks over all seeds.
import { AXIS_INDEX, KEYS, TIER } from '../src/data/genes';
import type { State } from '../src/sim/state';
import { stratumOf } from '../src/sim/variants';

const MIN = 600; // ticks per minute
const totals = { seeds: 0, busyOk: 0, share30: 0, sorted: 0, rare30: 0, combo: 0, keys: 0, made: 0, farMade: 0, farBase: 0 };

export type VariantStats = ReturnType<typeof variantStats>;

export function variantStats() {
  const shown = new Map<number, Set<string>>(); // species → shown variants (by birth)
  let topShare = 0, firstRare = -1, sortSum = 0, sortN = 0;
  const far = new Set<string>(); // shown variants with a gene beyond ±2: 'made|v|born' or 'base|v|born'
  return {
    sample(s: State) {
      for (const [v, x] of s.variants.entries()) {
        if (!x.alive || !x.shown || x.tier === TIER.base) continue;
        if (!shown.has(x.sp)) shown.set(x.sp, new Set());
        shown.get(x.sp)!.add(`${v}|${x.born}`);
        if (firstRare < 0 && x.tier >= TIER.rare && x.tier < TIER.legendary) firstRare = s.tick;
        if (x.genome.axes.some((a) => Math.abs(a) > 2)) far.add(`${s.species[x.sp].parent >= 0 ? 'made' : 'base'}|${v}|${x.born}`);
        if (s.count[x.sp] >= 50) topShare = Math.max(topShare, x.tiles / s.count[x.sp]);
      }
      if (s.tick % MIN === 0) { const d = drySort(s); if (d !== null) { sortSum += d; sortN++; } }
    },
    line(s: State, minutes: number): string {
      const end = s.tick, rates: string[] = [];
      let busy = 0, busyOk = 0;
      s.species.forEach((x, sp) => {
        if (x.at < 0) return;
        const life = (end - x.at) / MIN, n = shown.get(sp)?.size ?? 0, per10 = life > 0 ? (10 * n) / life : 0;
        rates.push(`${x.id.slice(0, 4)} ${per10.toFixed(1)}`);
        if (s.count[sp] >= 150 && life >= 10) { busy++; if (per10 >= 2) busyOk++; }
      });
      // Each key: the minute it arrived, and whether its door was opened by a split.
      const keys = KEYS.map((k) => {
        const at = s.innovations[k.id];
        return { word: k.word, m: at !== undefined ? at / MIN : -1, ok: s.reached.includes(k.node) };
      });
      const farMade = [...far].filter((f) => f.startsWith('made')).length, farBase = far.size - farMade;
      const made = s.species.filter((x) => x.parent >= 0), judged = made.filter((x) => end - x.at >= 10 * MIN);
      const sort = sortN ? sortSum / sortN : null;
      totals.seeds++;
      if (busy && busyOk === busy) totals.busyOk++;
      if (topShare >= 0.3) totals.share30++;
      if (sort !== null && sort <= -0.03) totals.sorted++;
      if (firstRare >= 0 && firstRare <= 30 * MIN) totals.rare30++;
      if (s.combos.length) totals.combo++;
      if (keys.filter((k) => k.word !== 'Oily').every((k) => k.ok)) totals.keys++;
      totals.farMade += farMade; totals.farBase += farBase;
      if (judged.length && judged.every((x) => s.count[s.species.indexOf(x)] > 0)) totals.made++;
      return `     shown/10m ${rates.join(' ')} | busy ok ${busyOk}/${busy} | top ${Math.round(topShare * 100)}% | ` +
        `dry sort ${sort === null ? '-' : sort.toFixed(3)} | rare ${firstRare < 0 ? '-' : (firstRare / MIN).toFixed(1) + 'm'} | ` +
        `combos ${s.combos.join(',') || '-'} | ${keys.map((k) => `${k.word} ${k.m < 0 ? '-' : k.m.toFixed(1) + 'm'}${k.ok ? '✓' : ''}`).join(' ')} | ` +
        `beyond ±2 made ${farMade} base ${farBase} | ` +
        `made ${made.length} (judged ${judged.length}) / ${minutes}m`;
    },
  };
}

/** Mean water on the biggest Dry + variant's tiles minus the rest of its species' tiles (negative = it sits drier). */
function drySort(s: State): number | null {
  const n = s.w * s.h, dry = AXIS_INDEX.dry;
  let best = -1;
  s.variants.forEach((x, v) => {
    if (x.alive && x.shown && x.tiles >= 10 && x.genome.axes[dry] > s.species[x.sp].genome.axes[dry]
      && (best < 0 || x.tiles > s.variants[best].tiles) && s.count[x.sp] - x.tiles >= 10) best = v;
  });
  if (best < 0) return null;
  const sp = s.variants[best].sp, k = stratumOf(s, sp);
  let a = 0, an = 0, b = 0, bn = 0;
  for (let i = 0; i < n; i++) {
    const v = s.occ[k * n + i];
    if (v < 0 || s.variants[v].sp !== sp) continue;
    if (v === best) { a += s.layers.water[i]; an++; }
    else if (s.variants[v].genome.axes[dry] <= s.species[sp].genome.axes[dry]) { b += s.layers.water[i]; bn++; }
  }
  return an && bn ? a / an - b / bn : null;
}

export function variantSummary(): string {
  const t = totals, n = t.seeds;
  return `variants: busy species ≥2 shown/10m ${t.busyOk}/${n} · a variant ≥30% ${t.share30}/${n} · Dry+ sorts drier ${t.sorted}/${n} · ` +
    `Rare by 30m ${t.rare30}/${n} · combo ${t.combo}/${n} · Mosses + Vascular opened ${t.keys}/${n} · new species alive 10m ${t.made}/${n} · ` +
    `forms beyond ±2: in made species ${t.farMade}, in base species ${t.farBase}`;
}
