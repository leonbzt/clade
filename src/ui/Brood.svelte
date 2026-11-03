<script lang="ts">
  // The brood: 3 seeds (spores for moss), each a season predicted with no picks. Pick the heir.
  import { GENES } from '../data/genes';
  import { chooseSeed, runScore, type Run } from '../sim/run/run';
  import { drawThumb } from '../view/side';
  let { r, onpick }: { r: Run; onpick: () => void } = $props();
  const cvs: HTMLCanvasElement[] = [];
  $effect(() => { r.seeds?.forEach((s, i) => cvs[i] && drawThumb(cvs[i], s.body)); });
  const last = $derived(r.history[r.history.length - 1]);
  const diff = (g: number[], i: number) => g[i] - last.genes[i];
</script>

<div class="panel">
  <h2>Brood: pick the heir ({r.form === 'moss' ? 'spores' : 'seeds'})</h2>
  <div class="cards">
    {#each r.seeds ?? [] as s, i}
      {@const sc = runScore(r, s.stats.raw)}
      <div class="card click" role="button" tabindex="0" onclick={() => { chooseSeed(r, i); onpick(); }} onkeydown={(e) => e.key === 'Enter' && (chooseSeed(r, i), onpick())}>
        <div class="row"><b>Spot {s.spot + 1}</b><span>predicted <b class={sc >= last.score ? 'up' : 'down'}>{sc}</b> <span class="muted">(now {last.score})</span></span></div>
        <canvas bind:this={cvs[i]} width="250" height="120"></canvas>
        <div class="muted">{s.changed.map((k) => `${GENES[k].name} ${diff(s.genes, k) > 0 ? '+' : '−'}${Math.abs(diff(s.genes, k))}`).join(', ') || 'no change'}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .cards { display: flex; gap: 10px; flex-wrap: wrap; }
  .card { width: 270px; }
  canvas { margin: 6px 0; width: 250px; }
</style>
