<script lang="ts">
  // The last few things the island did on its own, with their causes.
  import { FIELDS, LAYER_IDS } from '../data/fields';
  import { NUM } from '../data/numbers';
  import { SPECIES } from '../data/species';
  import type { LogLine } from '../sim/state';
  import { clock } from './format';
  import { game, ui } from './game.svelte';

  function text(l: LogLine): string {
    if (l.kind === 'flare') return `A steam vent flared: ${l.n} plants cleared. Pioneers will move back in.`;
    const name = SPECIES[l.sp].name, lim = l.limit >= 0 ? `, mostly held back by ${FIELDS[LAYER_IDS[l.limit]].name.toLowerCase()}` : '';
    return l.delta > 0 ? `${name} spread: +${l.delta} tiles in a minute.` : `${name} retreat: ${l.delta} tiles in a minute${lim}.`;
  }

  const lines = $derived.by(() => {
    ui.v;
    return game.log.slice(-4).reverse().map((l) => ({ key: `${l.tick}${l.kind}${'sp' in l ? l.sp : ''}`, time: clock(l.tick, NUM.ticksPerSec), text: text(l) }));
  });
</script>

{#if lines.length}
  <div class="panel feed">
    {#each lines as l (l.key)}<div><span class="dim">{l.time}</span> {l.text}</div>{/each}
  </div>
{/if}

<style>
  .feed { width: 100%; padding: 4px 10px; font-size: 15px; display: flex; flex-direction: column; gap: 1px; }
</style>
