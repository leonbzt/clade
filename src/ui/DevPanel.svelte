<script lang="ts">
  import { addBiomass, autoplay, game, reset, skip, ui } from './game.svelte';

  const speeds = [1, 10, 100];
</script>

<div class="panel dev">
  <h3>Dev panel</h3>
  <div>Speed {#each speeds as s (s)}<button class:on={ui.speed === s} onclick={() => (ui.speed = s)}>×{s}</button>{/each}</div>
  <div>Skip <button onclick={() => skip(60)}>1 min</button><button onclick={() => skip(600)}>10 min</button></div>
  <div>Bot plays <button onclick={() => autoplay(300)}>5 min</button><button onclick={() => autoplay(900)}>15 min</button></div>
  <div><button onclick={() => addBiomass(1000)}>+1k biomass</button><button onclick={() => addBiomass(10000)}>+10k</button></div>
  <div><button onclick={reset}>New island</button><button onclick={() => console.log(game)}>Log state</button></div>
  <p class="dim">window.dev.dump() in the console</p>
</div>

<style>
  .dev { position: fixed; right: 12px; bottom: 12px; display: flex; flex-direction: column; gap: 6px; z-index: 10; }
  h3 { margin: 0; }
  p { margin: 0; font-size: 13px; }
</style>
