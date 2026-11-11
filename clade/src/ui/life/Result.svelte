<script lang="ts">
  import type { Colonisation } from './colonise';
  let { session, back }: { session: Colonisation; back: () => void } = $props();
</script>

<div class="result-shade">
  <div class="life-result" role="dialog" aria-modal="true" aria-labelledby="result-title" tabindex="-1">
    <h2 id="result-title">{session.life.cause === 'season' ? 'The season ends' : `You died on turn ${session.life.turn}`}</h2>
    <p>{session.report?.text}</p>
    {#if session.report?.fit}
      <ul>{#each session.report.fit.reasons as reason}<li>{reason}</li>{/each}</ul>
    {/if}
    <button onclick={back}>Back to the map</button>
  </div>
</div>

<style>
  .result-shade { position: absolute; inset: 0; display: grid; place-items: center; grid-template-columns: minmax(0, 1fr); padding: 12px; box-sizing: border-box; background: var(--line); opacity: 0.98; }
  .life-result { background: var(--panel); border: 2px solid var(--paper); padding: 16px; width: 100%; max-width: 440px; min-width: 0; box-sizing: border-box; }
  h2 { font-size: 16px; margin: 0 0 12px; }
  p { margin: 0 0 12px; }
  ul { padding-left: 20px; margin: 0 0 16px; }
  li { margin-bottom: 6px; color: var(--dim); }
</style>
