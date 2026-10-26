<script lang="ts">
  import { act } from './game.svelte';
  import { rename } from '../core/actions';
  import { NICHES, type NicheId, type Tier } from '../data/niches';
  import { HOME } from '../data/niches';
  import { TEXT } from '../data/text';
  import { TRAIT_BY_ID, type TraitId } from '../data/traits';
  import Specimen from './Specimen.svelte';

  let {
    name,
    traits,
    fit,
    editable,
  }: { name: string; traits: TraitId[]; fit: Record<NicheId, Tier> | null; editable: boolean } = $props();
</script>

<div class="card species">
  <h3>{TEXT.card.title}</h3>
  {#if editable}
    <input
      class="name"
      value={name}
      title={TEXT.card.renameHint}
      onchange={(e) => act((g) => rename(g, e.currentTarget.value))}
    />
  {:else}
    <div class="name">{name}</div>
  {/if}
  <div class="row">
    <div class="specimen">
      <Specimen {traits} />
      <div class="label muted">{TEXT.card.specimen}</div>
    </div>
    <div class="info">
      <div class="muted small">{TEXT.card.home}</div>
      <div><b>{HOME.name}</b>: {HOME.description}</div>
      {#if traits.length > 0}
        <ul class="traits">
          {#each traits as t (t)}<li>{TRAIT_BY_ID[t].name}</li>{/each}
        </ul>
      {/if}
    </div>
  </div>
  {#if fit}
    <div class="fit">
      <div class="muted small">{TEXT.card.fit}</div>
      {#each NICHES as n (n.id)}
        <div class="fitrow">
          <span>{n.name}</span>
          <span class="tier {fit[n.id]}">{fit[n.id]}</span>
        </div>
        <div class="muted small note">{n.note}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .name {
    font-size: 20px;
    font-weight: 600;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--text);
    padding: 2px 4px;
    margin: 0 0 6px -5px;
    width: 100%;
  }
  input.name:hover,
  input.name:focus {
    border-color: var(--line);
    outline: none;
  }
  .row {
    display: flex;
    gap: 12px;
  }
  .specimen {
    width: 132px;
    flex: none;
    background: #191c1f;
    border-radius: 8px;
    padding: 4px;
  }
  .specimen :global(svg) {
    height: 116px;
  }
  .label {
    font-size: 11px;
    text-align: center;
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .small {
    font-size: 12px;
  }
  .traits {
    margin: 8px 0 0;
    padding-left: 16px;
    font-size: 13px;
  }
  .fit {
    margin-top: 10px;
    border-top: 1px solid var(--line);
    padding-top: 8px;
  }
  .fitrow {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
  }
  .note {
    margin-top: -2px;
  }
  .tier {
    text-transform: capitalize;
    font-weight: 600;
    padding: 0 8px;
    border-radius: 10px;
    font-size: 12px;
    color: #111;
  }
  .tier.bronze {
    background: var(--bronze);
  }
  .tier.silver {
    background: var(--silver);
  }
  .tier.gold {
    background: var(--gold);
  }
</style>
