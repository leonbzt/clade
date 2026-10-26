<script lang="ts">
  import { store, act, setSpeed, skip, reset } from './game.svelte';
  import { coveredCount, energyPerSec, waterCap } from '../core/colony';
  import { addGenes, jumpToMosses } from '../core/dev';
  import { gardenIncome } from '../core/garden';
  import { generationTime } from '../core/genepool';
  import { modifiers } from '../core/modifiers';
  import { releaseGain } from '../core/release';

  // Dev only: toggle with the ` key.
  let open = $state(false);
  const s = $derived(store.s);
  const c = $derived(s.colony);
  const m = $derived(modifiers(s));
  const r = (n: number, d = 1) => n.toFixed(d);

  function onKey(e: KeyboardEvent) {
    if (e.key === '`') open = !open;
  }
</script>

<svelte:window onkeydown={onKey} />

<button class="toggle" onclick={() => (open = !open)}>dev</button>
{#if open}
  <div class="dev">
    <div class="row">
      {#each [1, 10, 100] as x (x)}
        <button class:on={store.speed === x} onclick={() => setSpeed(x)}>×{x}</button>
      {/each}
    </div>
    <div class="row">
      <button onclick={() => skip(60)}>+1 min</button>
      <button onclick={() => skip(600)}>+10 min</button>
      <button onclick={() => act((g) => addGenes(g, 100))}>+100 genes</button>
    </div>
    <div class="row">
      <button onclick={() => act((g) => jumpToMosses(g))}>Mosses reached</button>
      <button onclick={reset}>reset</button>
      <button onclick={() => console.log((window as any).dev.dump())}>dump</button>
    </div>
    <pre>t        {r(s.t / 60, 2)} min ({s.phase})
genes    {r(s.genes)}
{#if c}tiles    {coveredCount(c)}  brown {c.tiles.filter((t) => t.brown).length}
energy/s {r(energyPerSec(c, m), 2)}
water    {r(c.water)} / {r(waterCap(c, m))}
weather  {c.weather.state} stress {r(c.weather.stress, 2)}
{/if}gen      {s.genePool.generation}  timer {r(s.genePool.timer)}/{generationTime(s)}  offers {s.genePool.offers.length}
photo    L{s.skill.level}  xp {r(s.skill.xp, 0)}
release  {r(releaseGain(s).biomassPerSec, 2)}/s
garden   {r(gardenIncome(s.garden), 2)}/s  biomass {r(s.garden.biomass, 0)}
freq     {Object.entries(s.genePool.freq).map(([k, v]) => `${k.slice(0, 6)} ${r(v * 100, 0)}`).join('  ')}</pre>
  </div>
{/if}

<style>
  .toggle {
    position: fixed;
    right: 8px;
    bottom: 8px;
    z-index: 41;
    font-size: 11px;
    padding: 2px 8px;
    opacity: 0.6;
  }
  .dev {
    position: fixed;
    right: 8px;
    bottom: 36px;
    z-index: 40;
    width: 320px;
    background: rgba(12, 14, 16, 0.95);
    border: 1px solid #555;
    border-radius: 8px;
    padding: 8px;
    font-size: 12px;
  }
  .row {
    display: flex;
    gap: 4px;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }
  .row button {
    padding: 2px 8px;
    font-size: 12px;
  }
  .on {
    border-color: var(--warn);
  }
  pre {
    margin: 4px 0 0;
    font-size: 11px;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
