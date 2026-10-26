<script lang="ts">
  import { store } from './game.svelte';
  import { canRelease, releaseGain } from '../core/release';
  import { HOME } from '../data/niches';
  import { TEXT } from '../data/text';
  import { fmt } from './format';

  let { onOpen }: { onOpen: () => void } = $props();
  const s = $derived(store.s);
  const gain = $derived(releaseGain(s));
  const ready = $derived(canRelease(s));
  const lavaPct = $derived(Math.round(gain.share[HOME.niche] * 100));
</script>

<div class="card" class:grey={!ready}>
  <h3>{TEXT.release.title}</h3>
  <div>{TEXT.release.previewLine(fmt(gain.biomassPerSec), lavaPct)}</div>
  {#if ready}
    <button class="primary wide" onclick={onOpen}>{TEXT.release.open}</button>
  {:else}
    <div class="muted small">{TEXT.release.locked}</div>
  {/if}
</div>

<style>
  .grey {
    opacity: 0.55;
    filter: grayscale(1);
  }
  .small {
    font-size: 12px;
    margin-top: 4px;
  }
</style>
