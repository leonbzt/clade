<script lang="ts">
  // The last few things the island did on its own, with their causes. New variant forms show in their tier colour.
  import { limitName } from '../data/fields';
  import { TIER, TIERS } from '../data/genes';
  import { NUM } from '../data/numbers';
  import type { LogLine } from '../sim/state';
  import { clock } from './format';
  import { game, ui } from './game.svelte';

  function text(l: LogLine): string {
    if (l.kind === 'flare') return `${l.name} flared: ${l.n} plants cleared. Pioneers will move back in.`;
    if (l.kind === 'arrival') return l.text;
    const name = game.species[l.sp].name;
    if (l.kind === 'variant') {
      return l.tier === TIER.legendary ? ` ${l.place}: ${l.genes} in ${name}. A new clade can evolve.` : ` form ${l.place}: ${name}, ${l.genes}.`;
    }
    const lim = l.limit >= 0 ? `, mostly held back by ${limitName(l.limit).toLowerCase()}` : '';
    return l.delta > 0 ? `${name} spread: +${l.delta} tiles in a minute.` : `${name} retreat: ${l.delta} tiles in a minute${lim}.`;
  }

  const lines = $derived.by(() => {
    ui.v;
    return game.log.slice(-4).reverse().map((l) => ({
      key: `${l.tick}${l.kind}${'sp' in l ? l.sp : ''}${'name' in l ? l.name : ''}`, time: clock(l.tick, NUM.ticksPerSec), text: text(l),
      tier: l.kind === 'variant' ? TIERS[l.tier] : null,
    }));
  });
</script>

<!-- Always four lines tall, so new lines never push anything around. -->
<div class="panel feed">
  {#each lines as l (l.key)}
    <div class="line"><span class="dim">{l.time}</span> {#if l.tier}<b style:color={l.tier.color}>{l.tier.name}</b>{/if}{l.text}</div>
  {/each}
</div>

<style>
  .feed { width: 100%; height: 92px; padding: 4px 10px; font-size: 15px; display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
  .line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
