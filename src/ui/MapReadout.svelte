<script lang="ts">
  import { FIELDS, LAYER_IDS, LIMIT_COUNT, STATUS_IDS, STATUSES, STRATA, limitColor, limitName, type LayerId } from '../data/fields';
  import { TIER_COLORS, ZONE } from '../data/palette';
  import { SPECIES, SPECIES_INDEX } from '../data/species';
  import { canFoundAt, foundingCost, unlockedSpecies } from '../sim/commands';
  import { fitInfo, limitText, placeInfo } from '../sim/explain';
  import { profiles } from '../sim/fit';
  import { SEA } from '../sim/state';
  import { game, ui } from './game.svelte';

  /** Hover: the tile in one line. While placing: how well the species fits here and what holds it back. */
  const hover = $derived.by(() => {
    ui.v;
    const i = ui.hover;
    if (i < 0 || game.terrain[i] === SEA) return null;
    const P = profiles(game), n = game.w * game.h;
    const who = STRATA.map((_, k) => game.occ[k * n + i]).filter((sp) => sp >= 0).map((sp) => SPECIES[sp].name);
    const vals = LAYER_IDS.filter((l) => !FIELDS[l].hidden).map((l) => `${FIELDS[l].name.toLowerCase()} ${game.layers[l][i].toFixed(2)}`)
      .concat(STATUS_IDS.filter((id) => game.statuses[id][i] > 0).map((id) => `${STATUSES[id].name.toLowerCase()} ${game.statuses[id][i].toFixed(2)}`));
    let place: { tier: string | null; text: string } | null = null;
    if (ui.placing) {
      const sp = SPECIES_INDEX[ui.placing], p = P[sp], info = fitInfo(game, p, i);
      const slot = STRATA.indexOf(SPECIES[sp].stratum) * n + i, occ = game.occ[slot];
      const held = info.fit > 0 && !canFoundAt(game, ui.placing, i, P);
      place = {
        tier: info.tier,
        text: info.fit <= 0 ? `can't live here: ${limitText(p, info)}`
          : held ? (occ === sp ? 'already yours' : `${SPECIES[occ].name} hold it too well`)
          : `Fit ${info.tier} · ${limitText(p, info)}`,
      };
    }
    const where = placeInfo(game, i);
    return { terrain: where.landmark ? `${where.landmark} (${where.terrain.toLowerCase()})` : where.terrain, who: who.join(' + ') || 'bare', vals: vals.join(' · '), place };
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

  const layer = $derived(ui.view !== 'none' && ui.view !== 'zones' ? FIELDS[ui.view as LayerId] : null);
</script>

<span class="readout">
  {#if placingInfo}
    <span class="gold">Founding {placingInfo.name}</span>
    <span>{placingInfo.cost ? `${placingInfo.cost} biomass` : 'free'}</span>
    {#if hover?.place}
      <span>{#if hover.place.tier}<span class="tier" style:background={TIER_COLORS[hover.place.tier]}>{hover.place.tier}</span>{/if} {hover.place.text}</span>
    {:else}
      {#each Object.entries(TIER_COLORS) as [t, c] (t)}<span class="tier" style:background={c}>{t}</span>{/each}
      <span class="dim">outlined = you can place · gold = best spots · corner mark = what holds it back:</span>
      {#each Array.from({ length: LIMIT_COUNT }, (_, k) => k) as k (k)}<span class="small"><span class="swatch" style:background={limitColor(k)}></span>{limitName(k)}</span>{/each}
      <span class="dim">· Esc cancels</span>
    {/if}
  {:else if hover}
    <span>{hover.terrain}: {hover.who}</span>
    <span class="dim">{hover.vals}</span>
    <span class="dim small">click for the full tile</span>
  {:else if ui.view === 'zones'}
    {#each zones as z (z.id)}<span><span class="swatch" style:background={ZONE[z.id]}></span>{z.name}</span>{/each}
    <span class="dim small">fill = ground · inner square = herbs · corners = fungi</span>
  {:else if layer}
    <span><span class="swatch" style:background={layer.color}></span>{layer.name}</span>
    <span class="dim">faint = {layer.words[0]} · strong = {layer.words[1]}{layer.viewMax ? ` (${layer.viewMax}+)` : ''} · litter and salt are on the tile card</span>
  {:else}
    <span class="dim">Hover a tile to inspect it, click for details. Wheel to zoom (names show when zoomed in), drag to move. Keys 1–6 switch views.</span>
  {/if}
</span>

<style>
  .readout { display: flex; gap: 4px 12px; align-items: center; flex-wrap: wrap; font-size: 16px; }
  .swatch { display: inline-block; width: 12px; height: 12px; margin-right: 4px; border: 1px solid var(--ink); }
  .small { font-size: 14px; }
</style>
