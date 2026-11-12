<!-- The notes (N4 G): what the sea did while you lived, yours first. Tap a line to look at its habitat. -->
<script lang="ts">
  import type { Headline } from '../sim/news';

  let { news, look, close }: { news: Headline[]; look: (habitat: number) => void; close: () => void } = $props();
</script>

<aside class="card notes">
  <button class="close" onclick={close} aria-label="Close">×</button>
  <h2>While you lived</h2>
  {#each news as line, i (i)}
    <button class="line" class:yours={line.yours} onclick={() => look(line.habitats[0])}>{line.text}</button>
  {:else}
    <p class="quiet">A quiet sea: nothing changed much.</p>
  {/each}
</aside>

<style>
  .card { position: absolute; left: 8px; bottom: 8px; width: 360px; max-width: calc(100% - 16px); max-height: calc(100% - 16px);
    overflow: auto; background: var(--panel); border: 2px solid var(--line); padding: 8px 12px; box-sizing: border-box; }
  h2 { font-size: 16px; font-weight: 700; margin: 0 32px 6px 0; }
  .line { display: block; width: 100%; text-align: left; background: none; border: 0; border-top: 2px solid var(--line); padding: 6px 0; }
  .line.yours { color: var(--gold); }
  .quiet { color: var(--dim); margin: 0; }
  .close { position: absolute; top: 4px; right: 4px; padding: 0 8px; }
</style>
