<!-- Stocks and eaters share one grams axis. Food is solid; populations are dashed. -->
<script lang="ts">
  import { ACCENT, P, css } from '../data/palette';
  import { FOODS } from '../data/sea';
  import type { Habitat } from '../sim/habitats';
  import type { World } from '../sim/records';
  import type { Frame } from './history';

  let { hab, world, history }: { hab: Habitat; world: World; history: Frame[] } = $props();
  const popColors = [P.gold, P.blue, P.paper, P.dim];
  const series = $derived([
    ...FOODS.map((food) => ({ key: food, name: food, color: ACCENT[food === 'mats' ? 'grazer' : 'burrower'], pop: false,
      values: history.map((f) => f.habitats[hab.id]?.stocks[food] ?? 0) })),
    ...world.species.map((s, i) => ({ key: s.id, name: s.name, color: popColors[i % popColors.length], pop: true,
      values: history.map((f) => f.habitats[hab.id]?.pops[s.id] ?? 0) })).filter((s) => s.values.some((v) => v > 0)),
  ]);
  const max = $derived(Math.max(1, ...series.flatMap((s) => s.values)));
  const first = $derived(history[0]?.generation ?? world.generation);
  const points = (values: number[]) => values.map((v, i) =>
    `${Math.round(4 + (history[i].generation - first) / Math.max(1, world.generation - first) * 292)},${Math.round(92 - v / max * 88)}`).join(' ');
</script>

<figure>
  <figcaption>{Math.ceil(max).toLocaleString('en')} g · stocks and populations</figcaption>
  <svg viewBox="0 0 300 96" role="img" aria-label={`Food and population biomass in ${hab.name}, generations ${first} to ${world.generation}`}>
    <path d="M4 4V92H296" fill="none" stroke={css(P.dim)} />
    {#each series as s (s.key)}
      <polyline points={points(s.values)} fill="none" stroke={css(s.color)} stroke-width="2" stroke-dasharray={s.pop ? '4 2' : undefined} />
      {#if s.values.length === 1}<circle cx="4" cy={Math.round(92 - s.values[0] / max * 88)} r="2" fill={css(s.color)} />{/if}
    {/each}
  </svg>
  <div class="axis"><span>0 g · gen {first}</span><span>{world.generation}</span></div>
  <div class="legend">
    {#each series as s (s.key)}
      <span style:color={css(s.color)}><i class:pop={s.pop}></i>{s.name}</span>
    {/each}
  </div>
</figure>

<style>
  figure { margin: 8px 0; }
  figcaption, .axis { color: var(--dim); }
  svg { display: block; width: 100%; height: auto; }
  .axis { display: flex; justify-content: space-between; }
  .legend { display: flex; flex-wrap: wrap; gap: 2px 10px; margin-top: 4px; }
  i { display: inline-block; width: 16px; border-top: 2px solid; margin: 0 4px 4px 0; }
  i.pop { border-top-style: dashed; }
</style>
