<script lang="ts">
  // The spindle diagram: time left to right, each species a band as thick as its tiles (sampled each minute).
  // A species branches off the one it came from (founded from its variant, or a key gene that grew in it), with
  // that variant's name at the branch. Extinct species stay as grey fossils.
  import { stemOf } from '../sim/keys';
  import { zoneColor } from '../view/overlays';
  import { game, ui } from './game.svelte';

  const W = 620, ROW = 30, TOP = 22, LEFT = 8, HALF = 12, MIN = 600;

  const d = $derived.by(() => {
    ui.v;
    const s = game, samples = [...s.history, { tick: s.tick, counts: [...s.count] }];
    const end = Math.max(s.tick, 10 * MIN), x = (t: number) => LEFT + ((W - LEFT - 175) * t) / end;
    // Rows in lineage order: a species, then (recursively) the ones that branched off it.
    const live = s.species.map((_, k) => k).filter((k) => s.species[k].at >= 0);
    const stem = new Map(live.map((k) => [k, stemOf(s, k)]));
    const kids = (p: number | null) => live.filter((k) => (stem.get(k)?.sp ?? null) === p && (p === null || stem.get(k)!.sp !== k));
    const order: number[] = [];
    const walk = (p: number | null) => { for (const k of kids(p)) if (!order.includes(k)) { order.push(k); walk(k); } };
    walk(null);
    for (const k of live) if (!order.includes(k)) order.push(k); // a stem that was never founded
    const max = Math.max(1, ...samples.flatMap((h) => h.counts));
    const rowOf = new Map(order.map((k, r) => [k, TOP + ROW * r + ROW / 2]));
    const bands = order.map((k) => {
      const sp = s.species[k], cy = rowOf.get(k)!, from = sp.at;
      const pts = samples.filter((h) => h.tick >= from).map((h) => ({ x: x(h.tick), h: HALF * Math.sqrt((h.counts[k] ?? 0) / max) }));
      if (pts.length && pts[0].x > x(from)) pts.unshift({ x: x(from), h: 0.5 });
      const path = pts.length ? `M${pts.map((p) => `${p.x},${cy - p.h}`).join('L')}L${[...pts].reverse().map((p) => `${p.x},${cy + p.h}`).join('L')}Z` : '';
      const st = stem.get(k), alive = s.count[k] > 0;
      const branch = st && rowOf.has(st.sp) ? { x: x(from), y1: rowOf.get(st.sp)!, y2: cy, form: st.form } : null;
      return { k, cy, path, name: sp.name, alive, color: alive ? zoneColor(s, k) : '#6b5d4c', end: x(s.tick), branch, focus: ui.focus === sp.id };
    });
    const ticks: number[] = [];
    const every = end > 60 * MIN ? 20 : end > 25 * MIN ? 10 : 5;
    for (let m = 0; m * MIN <= end; m += every) ticks.push(m);
    return { bands, ticks: ticks.map((m) => ({ m, x: x(m * MIN) })), h: TOP + ROW * Math.max(1, order.length) + 6 };
  });
</script>

<svg viewBox="0 0 {W} {d.h}" class="spindle">
  {#each d.ticks as t (t.m)}
    <line x1={t.x} x2={t.x} y1={TOP - 6} y2={d.h} class="grid" />
    <text x={t.x} y={TOP - 10} class="tick">{t.m}m</text>
  {/each}
  {#each d.bands as b (b.k)}
    {#if b.branch}
      <line x1={b.branch.x} x2={b.branch.x} y1={b.branch.y1} y2={b.branch.y2} class="branch" />
      <text x={b.branch.x + 3} y={b.cy - HALF - 1} class="form">← {b.branch.form}</text>
    {/if}
  {/each}
  {#each d.bands as b (b.k)}
    <path d={b.path} fill={b.color} class:fossil={!b.alive} class:focus={b.focus} />
    <text x={b.end + 6} y={b.cy + 4} class="name" class:dead={!b.alive}>{b.alive ? '' : '† '}{b.name}</text>
  {/each}
</svg>

<style>
  .spindle { width: 100%; height: auto; display: block; font-family: inherit; }
  .grid { stroke: var(--panel-light); stroke-width: 1; opacity: 0.4; }
  .tick { fill: var(--dim); font-size: 11px; text-anchor: middle; }
  .branch { stroke: var(--dim); stroke-width: 1.5; stroke-dasharray: 3 2; }
  .form { fill: var(--gold); font-size: 10px; }
  path { stroke: var(--ink); stroke-width: 1; }
  path.fossil { opacity: 0.6; }
  path.focus { stroke: var(--gold); stroke-width: 1.5; }
  .name { fill: var(--text); font-size: 13px; }
  .name.dead { fill: var(--dim); }
</style>
