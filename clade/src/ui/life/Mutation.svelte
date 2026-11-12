<!-- N3 F: the once-per-Life mutation offer, over the board. Three parts for empty places, or Pass. -->
<script lang="ts">
  import { PARTS } from '../../data/parts';
  import { partUpkeep } from '../../sim/fitness';
  import type { PartId, Ranks } from '../../sim/records';

  let { offer, ranks, pick }: { offer: PartId[]; ranks: Ranks; pick: (part: PartId | null) => void } = $props();
</script>

<div class="mutation" role="dialog" aria-modal="true" aria-labelledby="mutation-title">
  <h2 id="mutation-title">A mutation</h2>
  <p class="dim">Your body can grow one new part now, free, or pass.</p>
  {#each offer as id (id)}
    {@const p = PARTS[id]}
    {@const upkeep = partUpkeep(id, ranks)}
    <button class="card" data-part={id} onclick={() => pick(id)}>
      <b>{p.name} · {p.place}</b>
      <span class="dim">{p.does}</span>
      <span class="dim">{upkeep ? `Upkeep +${upkeep}` : 'No upkeep'}</span>
    </button>
  {/each}
  <button class="pass" onclick={() => pick(null)}>Pass</button>
</div>

<style>
  .mutation { position: absolute; top: 8px; left: 8px; right: 8px; max-height: calc(100% - 16px); z-index: 4; display: flex; flex-direction: column; gap: 6px; padding: 10px;
    overflow-y: auto; background: var(--panel); border: 2px solid var(--gold); box-sizing: border-box; }
  h2 { font-size: 16px; margin: 0; color: var(--gold); }
  p { margin: 0; }
  .dim { color: var(--dim); }
  .card { display: grid; gap: 2px; text-align: left; background: var(--ink); flex: none; }
  .pass { align-self: flex-start; flex: none; }
</style>
