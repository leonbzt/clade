<script lang="ts">
  // The news. The last few headlines stay pinned at the top; under them the latest small line (a flare, or chatter:
  // slot changes in a habitat, renames, rare variants, trends). The chatter folds out above the feed, closed by default.
  import { limitName } from '../data/fields';
  import { TIERS } from '../data/genes';
  import { NUM } from '../data/numbers';
  import type { LogLine } from '../sim/state';
  import { clock } from './format';
  import { game, ui } from './game.svelte';

  let open = $state(false);

  function text(l: LogLine): string {
    if (l.kind === 'flare') return `${l.name} flared: ${l.n} plants cleared. Pioneers will move back in.`;
    if (l.kind === 'chat') return l.text;
    const name = game.species[l.sp].name;
    if (l.kind === 'variant') return ` form ${l.place}: ${name}, ${l.genes}.`;
    const lim = l.limit >= 0 ? `, mostly held back by ${limitName(l.limit).toLowerCase()}` : '';
    return l.delta > 0 ? `${name} spread: +${l.delta} tiles in a minute.` : `${name} retreat: ${l.delta} tiles in a minute${lim}.`;
  }

  const time = (tick: number) => clock(tick, NUM.ticksPerSec);
  const feed = $derived.by(() => {
    ui.v;
    const heads = game.heads.slice(-NUM.habitats.pinned).reverse().map((h, k) => ({ key: `${h.tick}${k}${h.text}`, time: time(h.tick), text: h.text }));
    const small = game.log.slice(-12).reverse().map((l, k) => ({ key: `${l.tick}${l.kind}${k}`, time: time(l.tick), text: text(l), tier: l.kind === 'variant' ? TIERS[l.tier] : null }));
    return { heads, small };
  });
</script>

<!-- Always four lines tall, so new lines never push anything around. -->
<div class="panel feed">
  {#each feed.heads as h (h.key)}
    <div class="line head" title={h.text}><span class="dim">{h.time}</span> {h.text}</div>
  {/each}
  {#if !feed.heads.length}<div class="line dim">Headlines show here: an island's best changing, arrivals, habitats growing or vanishing.</div>{/if}
  <button class="line chat" onclick={() => (open = !open)} title="Small news: slot changes, renames, rare variants, trends">
    <span class="fold">{open ? '▾' : '▸'}</span>
    {#if feed.small[0]}<span class="dim">{feed.small[0].time}</span> {#if feed.small[0].tier}<b style:color={feed.small[0].tier.color}>{feed.small[0].tier.name}</b>{/if}{feed.small[0].text}{/if}
  </button>
  {#if open}
    <div class="panel more">
      {#each feed.small as l (l.key)}
        <div class="line"><span class="dim">{l.time}</span> {#if l.tier}<b style:color={l.tier.color}>{l.tier.name}</b>{/if}{l.text}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .feed { position: relative; width: 100%; height: 92px; padding: 4px 10px; font-size: 15px; display: flex; flex-direction: column; gap: 1px; }
  .line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .head { color: var(--gold); }
  .chat { margin-top: auto; text-align: left; font-size: 13px; color: var(--dim); padding: 0; background: none; border: none; box-shadow: none; }
  .chat:hover { background: none; color: var(--text); }
  .fold { color: var(--gold); }
  .more { position: absolute; left: 0; right: 0; bottom: 100%; font-size: 13px; color: var(--dim); z-index: 5; display: flex; flex-direction: column; gap: 1px; }
</style>
