<!-- The Life's patch and neighbours are the only release points. Selection is a preview; Release here saves it. -->
<script lang="ts">
  import { HABITATS } from '../data/habitats';
  import { holder, huntersOf } from '../sim/sea';
  import { ctx, ui } from './meta.svelte';

  const p = $derived(ctx.save.pending!);
  const sea = $derived((ui.tick, ctx.save.sea));
  const choices = $derived([p.patch, ...sea.patches[p.patch].nb]);
  const selected = $derived(sea.patches[ui.patch ?? p.patch]);
  const holds = $derived((ui.tick, holder(sea, selected)));
</script>

<section class="placement" aria-labelledby="placeTitle">
  <h3 id="placeTitle">Place your {p.eggs} eggs</h3>
  <p class="pitch">Choose the Life’s patch or a lit neighbour.</p>
  <div class="choices">
    {#each choices as id}
      <button class="small" class:on={selected.id === id} aria-pressed={selected.id === id} onclick={() => (ui.patch = id)}>Patch {id + 1}{id === p.patch ? ' · Life' : ''}</button>
    {/each}
  </div>
  <p class="placeInfo" aria-live="polite">Patch {selected.id + 1} · {HABITATS[selected.ground].name} · {holds < 0 ? 'no holder' : `${sea.species[holds].name} holds it`} · {Math.round(huntersOf(sea, selected))} hunters · {selected.ground === p.hab ? 'proven ground' : 'new ground: half strength'}.</p>
  <button class="go" onclick={() => ctx.place(selected.id)}>Release here</button>
</section>

<style>
  .placement { display: grid; gap: 8px; }
  .choices { display: flex; flex-wrap: wrap; gap: 4px; }
  .choices .on { outline: 2px solid var(--gold); outline-offset: -4px; }
  .placeInfo { margin: 0; overflow-wrap: anywhere; }
</style>
