<script lang="ts">
  import { ctx, ui } from './meta.svelte';
  import { replayLines } from './replay';

  const spread = $derived(ui.replay!);
  const frame = $derived(spread.frames[ui.replayFrame]);
  const lines = $derived(replayLines(ctx.save.sea, spread, ui.replayFrame));
  $effect(() => {
    const index = ui.replayFrame;
    const timer = setTimeout(() => {
      if (index + 1 < spread.frames.length) ui.replayFrame = index + 1;
      else ctx.skipReplay();
    }, 1500);
    return () => clearTimeout(timer);
  });
</script>

<section class="spread" aria-label="Your line spreading" aria-live="polite" data-generation={frame.gen}>
  <h3>Watch your line · generation {frame.gen}</h3>
  <p class="mapKey">Your line’s colour: growth · red: a fall. Tap the map to skip.</p>
  <ul class="news">{#each lines as line}<li>{line}</li>{/each}</ul>
  <button class="small" onclick={() => ctx.skipReplay()}>Skip replay</button>
</section>

<style>
  .spread { display: grid; gap: 8px; }
</style>
