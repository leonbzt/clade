<script lang="ts">
  import { TIERS, tierOf } from '../data/genes';
  import { NICHES } from '../data/niches';
  import { tierList } from '../sim/game';
  import { S, ui } from './state.svelte';

  const rows = $derived.by(() => { ui.v; return tierList(S.game); });
  const cols = TIERS.map(([id]) => id);
</script>

<div class="panel">
  <h2>Tier list</h2>
  <table>
    <thead><tr><th>Niche</th>{#each cols as c}<th class="c">{c}</th>{/each}<th>Holder</th><th class="r">Your area</th></tr></thead>
    <tbody>
      {#each rows as r (r.niche)}
        <tr class:locked={!r.open}>
          <td><b>{NICHES[r.niche].name}</b><div class="muted">{r.open ? NICHES[r.niche].hint : r.why}</div></td>
          {#each cols as c}
            <td class="c cell">
              {#if r.best && tierOf(r.bestScore) === c}<span class="chip mine" title="your best here"><span class="dot" style:background={r.best.color}></span>{r.best.name} {r.bestScore}</span>{/if}
              {#if tierOf(r.native.scores[r.niche]) === c}<span class="chip native" title="the native">{r.native.name} {r.native.scores[r.niche]}</span>{/if}
            </td>
          {/each}
          <td>{#if r.holder}<span class="chip"><span class="dot" style:background={r.holder.color}></span>{r.holder.name} {Math.round(r.holderShare * 100)}%</span>{/if}</td>
          <td class="r">{r.area.toFixed(1)}<span class="muted"> / {r.tiles}</span></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .c { text-align: center; min-width: 54px; }
  .r { text-align: right; white-space: nowrap; }
  .cell .chip { margin: 1px 0; }
  .native { opacity: .55; }
  .mine { background: #34402c; }
  tr.locked { opacity: .4; }
</style>
