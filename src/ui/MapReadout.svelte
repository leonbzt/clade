<script lang="ts">
  import { FIELDS, LAYER_IDS, LIMIT_COUNT, STATUS_IDS, STATUSES, STRATA, limitColor, limitName, type LayerId } from '../data/fields';
  import { TIER_COLORS } from '../data/palette';
  import { placement, unlockedSpecies } from '../sim/commands';
  import { fitInfo, limitText, placeInfo } from '../sim/explain';
  import { profiles } from '../sim/fit';
  import { HABITAT_KINDS } from '../data/habitats';
  import { HABITAT_TINT } from '../data/palette';
  import { MAJOR, PATCH } from '../sim/habitats';
  import { loadout } from './board';
  import { bucketOf } from '../sim/tally';
  import { SEA } from '../sim/state';
  import { speciesIndex, stratumOf, variantName } from '../sim/variants';
  import { variantColors, zoneColor } from '../view/overlays';
  import { game, ui } from './game.svelte';

  /** Hover: the tile in one line. While placing: how well the species fits here and what holds it back. */
  const hover = $derived.by(() => {
    ui.v;
    const i = ui.hover;
    if (i < 0 || game.terrain[i] === SEA) return null;
    const P = profiles(game), n = game.w * game.h;
    const who = STRATA.map((_, k) => game.occ[k * n + i]).filter((v) => v >= 0).map((v) => game.species[game.variants[v].sp].name);
    const vals = LAYER_IDS.filter((l) => !FIELDS[l].hidden).map((l) => `${FIELDS[l].name.toLowerCase()} ${game.layers[l][i].toFixed(2)}`)
      .concat(STATUS_IDS.filter((id) => game.statuses[id][i] > 0).map((id) => `${STATUSES[id].name.toLowerCase()} ${game.statuses[id][i].toFixed(2)}`));
    let place: { tier: string | null; text: string } | null = null;
    const pl = ui.placing ? placement(game, ui.placing, P) : null;
    if (pl) {
      const p = pl.p, info = fitInfo(game, p, i), occ = game.occ[stratumOf(game, p.sp) * n + i];
      const held = info.fit > 0 && !pl.ok(i), mine = occ >= 0 && game.variants[occ].sp === p.sp;
      place = {
        tier: info.tier,
        text: info.fit <= 0 ? `can't live here: ${limitText(p, info)}`
          : held ? (mine && !ui.placing!.startsWith('v:') ? 'already yours' : `${game.species[game.variants[occ].sp].name} hold it too well`)
          : `Fit ${info.tier} · ${limitText(p, info)}`,
      };
    }
    const where = placeInfo(game, i), h = game.habitats[bucketOf(game, i)];
    if (ui.view === 'habitats' && !pl) {
      // A major or a patch: its kind, size and top holders (one per filled slot); a scrap: just its kind.
      const kind = HABITAT_KINDS[h.kind].name, held = h.tier >= PATCH ? loadout(game, h.id).filter((c) => !c.locked && c.holder >= 0).map((c) => `${c.slot}: ${c.who}`) : [];
      const head = h.tier === MAJOR ? `${h.name} · ${kind.toLowerCase()} · ${h.tiles} tiles` : h.tier === PATCH ? `A patch of ${kind.toLowerCase()} · ${h.tiles} tiles` : `${kind} (a scrap)`;
      return { line: [head, ...held].join(' · '), terrain: '', who: '', vals: '', place };
    }
    return { line: '', terrain: where.landmark ? `${where.landmark} (${where.terrain.toLowerCase()})` : where.terrain, who: who.join(' + ') || 'bare', vals: vals.join(' · '), place };
  });

  const placingInfo = $derived.by(() => {
    ui.v;
    const pl = ui.placing ? placement(game, ui.placing) : null;
    if (!pl) return null;
    return { name: ui.placing!.startsWith('v:') ? `${ui.foundName} (new species from ${pl.name})` : pl.name, cost: pl.cost };
  });

  const zones = $derived.by(() => {
    ui.v;
    return unlockedSpecies(game).map((id) => ({ id, name: game.species[speciesIndex(game, id)].name, color: zoneColor(game, speciesIndex(game, id)) }));
  });

  const variants = $derived.by(() => {
    ui.v;
    const sp = speciesIndex(game, ui.focus);
    if (ui.view !== 'variants' || sp < 0) return null;
    return { name: game.species[sp].name, list: [...variantColors(game, sp)].filter(([v]) => game.variants[v].shown)
      .map(([v, color]) => ({ v, color, name: variantName(game, v), tiles: game.variants[v].tiles })) };
  });

  const layer = $derived(ui.view in FIELDS ? FIELDS[ui.view as LayerId] : null);
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
  {:else if hover?.line}
    <span>{hover.line}</span>
  {:else if hover}
    <span>{hover.terrain}: {hover.who}</span>
    <span class="dim">{hover.vals}</span>
    <span class="dim small">click for the full tile</span>
  {:else if ui.view === 'zones'}
    {#each zones as z (z.id)}<span><span class="swatch" style:background={z.color}></span>{z.name}</span>{/each}
    <span class="dim small">fill = ground · inner square = herbs · corners = fungi</span>
  {:else if variants}
    <span>{variants.name}:</span>
    {#each variants.list as x (x.v)}<span><span class="swatch" style:background={x.color}></span>{x.name} <span class="dim">{x.tiles}</span></span>{/each}
    <span class="dim small">grey = not shown yet · pick the species in the Species tab</span>
  {:else if ui.view === 'habitats'}
    {#each HABITAT_KINDS as k (k.id)}<span><span class="swatch" style:background={HABITAT_TINT[k.id]}></span>{k.name}</span>{/each}
    <span class="dim small">click a named habitat or its card for its loadout · hover a patch for who holds it</span>
  {:else if layer}
    <span><span class="swatch" style:background={layer.color}></span>{layer.name}</span>
    <span class="dim">faint = {layer.words[0]} · strong = {layer.words[1]}{layer.viewMax ? ` (${layer.viewMax}+)` : ''} · litter and salt are on the tile card</span>
  {:else}
    <span class="dim">Hover a tile to inspect it, click for details. Wheel to zoom (landmark names show when zoomed in), drag to move. Keys 1–9 switch views.</span>
  {/if}
</span>

<style>
  .readout { display: flex; gap: 4px 12px; align-items: center; flex-wrap: wrap; font-size: 16px; }
  .swatch { display: inline-block; width: 12px; height: 12px; margin-right: 4px; border: 1px solid var(--ink); }
  .small { font-size: 14px; }
</style>
