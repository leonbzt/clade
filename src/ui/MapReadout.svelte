<script lang="ts">
  import { TIER_COLORS, ZONE } from '../data/palette';
  import { SPECIES, SPECIES_INDEX } from '../data/species';
  import { foundingCost, unlockedSpecies } from '../sim/commands';
  import { TERRAIN_NAMES, SEA } from '../sim/state';
  import { allStats, fit, moistureAt, tierOf } from '../sim/stats';
  import { game, ui } from './game.svelte';

  const readout = $derived.by(() => {
    ui.v;
    const i = ui.hover;
    if (i < 0 || game.terrain[i] === SEA) return null;
    const st = allStats(game), occ = game.occ[i];
    const fits = unlockedSpecies(game).map((id) => {
      const sp = SPECIES_INDEX[id];
      return { name: SPECIES[sp].name, tier: tierOf(fit(game, st[sp], sp, i)) };
    });
    return {
      terrain: TERRAIN_NAMES[game.terrain[i]],
      moisture: moistureAt(game, i).toFixed(2),
      soil: game.soil[i].toFixed(1),
      occupant: occ >= 0 ? `${SPECIES[occ].name} (${Math.round(game.growth[i] * 100)}%)` : 'bare',
      fits,
    };
  });

  const placingInfo = $derived.by(() => {
    ui.v;
    if (!ui.placing) return null;
    return { name: SPECIES[SPECIES_INDEX[ui.placing]].name, cost: foundingCost(game, ui.placing) };
  });

  const zones = $derived.by(() => {
    ui.v;
    return unlockedSpecies(game).map((id) => ({ id, name: SPECIES[SPECIES_INDEX[id]].name }));
  });
</script>

<span class="readout">
  {#if placingInfo}
    <span class="gold">Founding {placingInfo.name}</span>
    <span>{placingInfo.cost ? `${placingInfo.cost} biomass` : 'free'}</span>
    {#each Object.entries(TIER_COLORS) as [t, c] (t)}<span class="tier" style:background={c}>{t}</span>{/each}
    <span class="dim">faded = held by a stronger species · Esc cancels</span>
  {:else if ui.overlay === 'zones' && !readout}
    {#each zones as z (z.id)}<span><span class="swatch" style:background={ZONE[z.id]}></span>{z.name}</span>{/each}
  {:else if readout}
    <span>{readout.terrain}</span>
    <span class="dim">moisture {readout.moisture} · soil {readout.soil}</span>
    <span>{readout.occupant}</span>
    {#each readout.fits as f (f.name)}
      <span class="dim">{f.name} {#if f.tier}<span class="tier" style:background={TIER_COLORS[f.tier]}>{f.tier}</span>{:else}–{/if}</span>
    {/each}
  {:else}
    <span class="dim">Hover a tile to inspect it. Wheel to zoom, drag to move.</span>
  {/if}
</span>

<style>
  .readout { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; font-size: 16px; }
  .swatch { display: inline-block; width: 12px; height: 12px; margin-right: 4px; border: 1px solid var(--ink); }
</style>
