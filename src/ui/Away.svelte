<script lang="ts">
  import { ui } from './state.svelte';
  const a = $derived(ui.away!);
  const time = (s: number) => (s >= 3600 ? `${(s / 3600).toFixed(1)} h` : `${Math.round(s / 60)} min`);
</script>

<div class="modal">
  <div class="panel">
    <h1>While you were away ({time(a.seconds)})</h1>
    <p>+{Math.floor(a.biomass)} biomass</p>
    <p>Your lines held {a.areaBefore.toFixed(1)} → <b class={a.areaAfter >= a.areaBefore ? 'up' : 'down'}>{a.areaAfter.toFixed(1)}</b> tiles</p>
    {#if a.sprouts}<p>{a.sprouts} sprout{a.sprouts > 1 ? 's' : ''} came up</p>{/if}
    {#if a.lost.length}<p class="down">Died out: {a.lost.join(', ')}</p>{/if}
    {#each a.news.slice(0, 8) as n}<p class="muted">{n.text}</p>{/each}
    <button class="primary" onclick={() => (ui.away = null)}>Back to the island</button>
  </div>
</div>
