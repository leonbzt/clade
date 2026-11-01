<script lang="ts">
  // The chosen habitat as a loadout: six cards (plant layers on top, animals below), each filled, open or locked. Click
  // a card to unfold the roles under it and light up its holder on the map. Then the island's best (folded) and every
  // habitat with its six mini icons.
  import { HABITAT_KINDS } from '../data/habitats';
  import { hectares } from '../data/units';
  import { ROLES } from '../data/roles';
  import { groupName } from '../sim/slots';
  import { groupColor, loadout } from './board';
  import SlotIcon from './SlotIcon.svelte';
  import Specimen from './Specimen.svelte';
  import { game, selectPlace, ui } from './game.svelte';

  const board = $derived.by(() => {
    ui.v;
    const B = game.board, places = game.habitats.filter((h) => h.alive && h.shown).map((h) => ({ p: h.id, name: h.name, cards: loadout(game, h.id) }));
    const best = ROLES.flatMap((r, k) => {
      const b = B.best[k];
      return b.exists ? [{ k, icon: r.icon, name: r.kind === 'lead' ? r.name : `Best ${r.name.toLowerCase()}`, who: b.holder >= 0 ? groupName(b.holder) : '', color: groupColor(b.holder), share: Math.round(Math.min(1, b.share) * 100) }] : [];
    });
    const h = game.habitats[ui.place];
    const here = h?.alive ? { name: h.name, kind: HABITAT_KINDS[h.kind].name, tiles: h.tiles, shown: h.shown, cards: loadout(game, h.id) } : null;
    return { places, best, here, warm: B.windows > 0 };
  });
  const open = $derived(board.here?.cards[ui.gear] ?? null);

  function pick(k: number, holder: number) {
    ui.gear = ui.gear === k ? -1 : k;
    ui.lit = ui.gear === k && holder >= 0 ? { place: ui.place, group: holder } : null;
  }
</script>

{#if !board.warm}
  <p class="dim">The habitats fill in after the first half minute.</p>
{:else}
  {#if board.here}
    {@const here = board.here}
    <h2>{here.name}</h2>
    <p class="dim small sub">{here.kind} · {hectares(here.tiles)}{here.shown ? '' : ' · shrank to a patch'}</p>
    <div class="grid">
      {#each here.cards as c (c.k)}
        <button class="card" class:locked={c.locked} class:big={c.big} class:on={ui.gear === c.k} disabled={c.locked}
          onclick={() => pick(c.k, c.holder)} title={c.locked ? `${c.slot}: nothing of this kind lives or is made here` : `${c.name} · ${c.rank}${c.fed ? ` · ${c.fed}` : ''}`}>
          <span class="slot small">{c.glyph} {c.slot}</span>
          {#if c.look}
            <Specimen look={c.look} scale={2} size={32} />
          {:else}
            <span class="frame" class:big={c.big}>{c.glyph}</span>
          {/if}
          {#if c.locked}<span class="dim small">locked</span>
          {:else if c.open}<span class="small" class:gold={c.big}>{c.big ? 'big and open' : 'open'}</span>
          {:else}
            <span class="who small" style:color={c.color}>{c.who}{#if c.tier} <span class="tier" style:background={c.tier.color} title={c.tier.name}>{c.tier.name[0]}</span>{/if}</span>
          {/if}
          {#if !c.locked}
            <span class="bar"><span style:width="{c.hold * 100}%" style:background={c.color}></span><span class="other" style:width="{c.other * 100}%"></span></span>
            <span class="dim tiny">{c.size} {c.trend}</span>
            {#if c.yours}<span class="gold tiny">yours</span>{/if}
          {/if}
        </button>
      {/each}
    </div>
    {#if open && !open.locked}
      <div class="unfold small">
        <p><b>{open.name}</b> <span class="dim">· {open.rank}{open.fed ? ` · ${open.fed}` : ''}</span></p>
        {#each open.roles as r (r.role)}
          <p class="role"><span>{r.name}</span> <span class="dim">{r.size}</span>
            {#if r.open}<span class:gold={r.big}>{r.big ? 'big and open' : 'open'}</span>{:else}<span style:color={r.color}>{r.who}</span>{/if}
            {#if r.fed}<span class="dim">· {r.fed}</span>{/if}</p>
        {/each}
      </div>
    {/if}
  {:else}
    <p class="dim">Choose a habitat: click it below, or on the map (key 9).</p>
  {/if}

  <details>
    <summary><h3>The island's best</h3></summary>
    <div class="best small">
      {#each board.best as b (b.k)}
        <span>{b.icon} {b.name}: {#if b.who}<span style:color={b.color}>{b.who}</span> <span class="dim">{b.share}%</span>{:else}<span class="gold">open</span>{/if}</span>
      {/each}
    </div>
  </details>

  <h3>Habitats</h3>
  {#each board.places as pl (pl.p)}
    <button class="place" class:on={pl.p === ui.place} onclick={() => selectPlace(pl.p)}>
      <span class="icons">{#each pl.cards as c (c.k)}<SlotIcon slot={c} size={9} />{/each}</span>
      <span class="pname">{pl.name}</span>
    </button>
  {/each}
{/if}

<style>
  h2 { margin-bottom: 0; }
  .sub { margin: 0 0 6px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
  .card { display: flex; flex-direction: column; align-items: center; gap: 2px; margin: 0; padding: 4px 2px; min-width: 0; }
  .card.on { background: #66513a; box-shadow: inset 0 0 0 2px var(--gold); }
  .card.locked { opacity: 0.4; }
  .card:disabled { cursor: default; }
  .slot { color: var(--dim); }
  .frame { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; font-size: 26px; color: var(--dim);
    border: 2px dashed var(--edge); background: var(--panel-dark); }
  .frame.big { border-color: var(--gold); color: var(--gold); animation: glow 1.4s steps(2) infinite; }
  .who { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar { display: flex; width: 90%; height: 8px; background: var(--panel-dark); border: 1px solid var(--ink); }
  .bar span { display: block; height: 100%; }
  .bar .other { background: var(--dim); opacity: 0.6; }
  .unfold { margin: 6px 0; padding: 4px 8px; background: var(--panel-dark); border: 2px solid var(--ink); }
  .unfold p { margin: 2px 0; }
  .role { display: flex; gap: 6px; flex-wrap: wrap; }
  summary { cursor: pointer; list-style: none; }
  summary h3 { display: inline; }
  summary::before { content: '▸ '; color: var(--gold); }
  details[open] summary::before { content: '▾ '; }
  .best { display: flex; flex-direction: column; gap: 1px; }
  .place { display: flex; gap: 8px; align-items: center; width: 100%; text-align: left; margin: 0 0 2px; padding: 2px 8px; font-size: 15px; }
  .icons { display: grid; grid-template-columns: repeat(6, auto); gap: 3px; flex: none; }
  .small { font-size: 14px; }
  .tiny { font-size: 12px; }
  @keyframes glow { 50% { box-shadow: 0 0 0 2px var(--gold); } }
</style>
