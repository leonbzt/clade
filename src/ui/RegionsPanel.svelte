<script lang="ts">
  // The slot board: the island's best of each role, then the chosen place with its three slots (lead, biggest eating
  // link, biggest hunting link), then every place with its icons. Click a place to choose it, a row to light up the
  // holder there.
  import { ROLES } from '../data/roles';
  import { groupName, placeName } from '../sim/slots';
  import { groupColor, rowsOf } from './board';
  import SlotIcon from './SlotIcon.svelte';
  import { game, selectPlace, ui } from './game.svelte';

  const board = $derived.by(() => {
    ui.v;
    const B = game.board, places = game.regions.map((g, p) => ({ p, name: g.name, side: g.windward ? 'windward' : 'lee', tiles: g.tiles, rows: rowsOf(game, p) }));
    const best = ROLES.flatMap((r, k) => {
      const b = B.best[k];
      return b.exists ? [{ k, icon: r.icon, name: r.kind === 'lead' ? r.name : `Best ${r.name.toLowerCase()}`, who: b.holder >= 0 ? groupName(b.holder) : '', color: groupColor(b.holder), share: Math.round(Math.min(1, b.share) * 100) }] : [];
    });
    return { places, best, warm: B.windows > 0 };
  });
  const here = $derived(board.places[ui.place] ?? null);

  function light(group: number) {
    ui.lit = ui.lit?.group === group && ui.lit.place === ui.place ? null : { place: ui.place, group };
  }
</script>

{#if !board.warm}
  <p class="dim">The board fills in after the first half minute.</p>
{:else}
  {#if here}
    <h2>{here.name} <span class="dim small">{here.side} · {here.tiles} tiles</span></h2>
    {#each here.rows as sl (sl.role)}
      <button class="row" class:lit={ui.lit?.place === ui.place && ui.lit.group === sl.holder} onclick={() => sl.holder >= 0 && light(sl.holder)} title={sl.fedTitle}>
        <span class="top">
          <SlotIcon slot={sl} />
          <b>{sl.name}</b>
          <span class="trend dim">{sl.trend}</span>
          {#if sl.open}<span class:gold={sl.big} class="open">{sl.big ? 'big and open' : 'open'}</span>
          {:else}
            <span style:color={sl.color}>{sl.who}</span>
            {#if sl.tier}<span class="tier" style:background={sl.tier.color} title={sl.tier.name}>{sl.tier.name[0]}</span>{/if}
            {#if sl.yours}<span class="gold small">yours</span>{/if}
          {/if}
        </span>
        <span class="bottom small">
          <span class="bar"><span style:width="{sl.bar * 100}%"></span></span>
          <span class="dim">used {Math.round(sl.use * 100)}%</span>
          <span class="dim fed">{sl.fed}</span>
        </span>
      </button>
    {/each}
    {#if !here.rows.length}<p class="dim small">Nothing lives here yet.</p>{/if}
  {:else}
    <p class="dim">Choose a place: click it below, or a region on the map.</p>
  {/if}

  <h3>The island's best</h3>
  <div class="best small">
    {#each board.best as b (b.k)}
      <span>{b.icon} {b.name}: {#if b.who}<span style:color={b.color}>{b.who}</span> <span class="dim">{b.share}%</span>{:else}<span class="gold">open</span>{/if}</span>
    {/each}
  </div>

  <h3>Places</h3>
  {#each board.places as pl (pl.p)}
    <button class="place" class:on={pl.p === ui.place} onclick={() => selectPlace(pl.p)} title={placeName(game, pl.p)}>
      <span class="icons">{#each pl.rows as sl (sl.role)}<SlotIcon slot={sl} size={10} />{/each}</span>
      <span class="pname">{pl.name}</span>
    </button>
  {/each}
{/if}

<style>
  .row { display: flex; flex-direction: column; gap: 2px; width: 100%; text-align: left; margin: 0 0 4px; padding: 4px 8px; }
  .row.lit { background: #66513a; box-shadow: inset 0 0 0 2px var(--gold); }
  .top, .bottom { display: flex; gap: 6px; align-items: center; }
  .trend { margin-left: auto; order: 9; }
  .open { color: var(--text); }
  .bar { width: 90px; height: 8px; background: var(--panel-dark); border: 1px solid var(--ink); }
  .bar span { display: block; height: 100%; background: var(--dim); }
  .fed { margin-left: auto; }
  .best { display: flex; flex-direction: column; gap: 1px; }
  .place { display: flex; gap: 8px; align-items: center; width: 100%; text-align: left; margin: 0 0 2px; padding: 2px 8px; font-size: 15px; }
  .icons { display: flex; gap: 5px; width: 48px; }
  .small { font-size: 14px; }
</style>
