<script lang="ts">
  import { store } from './game.svelte';
  import { gardenIncome } from '../core/garden';
  import { TEXT } from '../data/text';
  import { fmt } from './format';

  const s = $derived(store.s);
</script>

<div class="card">
  <h3>{TEXT.garden.slotTitle}</h3>
  {#each s.garden.species as sp, i (i)}
    <div class="row"><b>{sp.name}</b> <span class="muted">{fmt(sp.biomassPerSec * sp.fill)}/s</span></div>
  {/each}
  <div class="muted small">{TEXT.garden.tapHint}</div>
  <button class="wide" disabled>{TEXT.garden.nextSpecies}</button>
  <div class="muted small total">{fmt(gardenIncome(s.garden))}/s</div>
</div>

<style>
  .row {
    display: flex;
    justify-content: space-between;
  }
  .small {
    font-size: 12px;
    margin-top: 4px;
  }
  .total {
    text-align: right;
  }
</style>
