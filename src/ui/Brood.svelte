<script lang="ts">
  // The brood: 3 seeds (spores for moss), each the parent + 1 level (one is a sport: +2 / −1), each a season
  // predicted with no picks. Pick the heir.
  import { level } from '../data/genes';
  import { chooseSeed, runScore, type Run } from '../sim/run/run';
  import { drawThumb } from '../view/side';
  import Csr from './Csr.svelte';
  import { upText } from './text';
  let { r, onpick }: { r: Run; onpick: () => void } = $props();
  const cvs: HTMLCanvasElement[] = [];
  $effect(() => { r.seeds?.forEach((s, i) => cvs[i] && drawThumb(cvs[i], s.body)); });
  const last = $derived(r.history[r.history.length - 1]);
</script>

<div class="panel">
  <h2>Brood: pick the heir ({r.form === 'moss' ? 'spores' : 'seeds'}), level {level(last.genes)} → {level(last.genes) + 1}</h2>
  <div class="cards">
    {#each r.seeds ?? [] as s, i}
      {@const sc = runScore(r, s.stats.raw, s.genes)}
      <div class="card click" role="button" tabindex="0" onclick={() => { chooseSeed(r, i); onpick(); }} onkeydown={(e) => e.key === 'Enter' && (chooseSeed(r, i), onpick())}>
        <div class="row"><b>Spot {s.spot + 1}</b><span>predicted <b class={sc >= last.score ? 'up' : 'down'}>{sc}</b> <span class="muted">(now {last.score})</span></span></div>
        <canvas bind:this={cvs[i]} width="250" height="120"></canvas>
        <div class="row"><span class:gold={s.sport}>{upText(s, last.genes)}</span><Csr genes={s.genes} /></div>
      </div>
    {/each}
  </div>
</div>

<style>
  .cards { display: flex; gap: 10px; flex-wrap: wrap; }
  .card { width: 270px; }
  canvas { margin: 6px 0; width: 250px; }
</style>
