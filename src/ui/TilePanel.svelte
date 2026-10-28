<script lang="ts">
  // The full tile card: the ground and its landmark, who lives here in each stratum, how healthy they are and what
  // holds them back, what last happened, and every layer with its parts (hidden layers too). Rows keep their
  // place while numbers change, so the card doesn't jump.
  import { STRATA } from '../data/fields';
  import { layerInfo, limitText, placeInfo, slotInfo } from '../sim/explain';
  import { profiles } from '../sim/fit';
  import { SEA } from '../sim/state';
  import { agentsOn } from '../sim/agents';
  import { TIER_COLORS } from '../data/palette';
  import { TIER, TIERS } from '../data/genes';
  import { game, seeVariants, ui } from './game.svelte';

  const card = $derived.by(() => {
    ui.v;
    const i = ui.selected;
    if (i < 0 || game.terrain[i] === SEA) return null;
    const P = profiles(game), n = game.w * game.h;
    const slots = STRATA.map((_, k) => {
      const info = slotInfo(game, P, k, i), v = game.occ[k * n + i];
      return { ...info, why: info.fit && v >= 0 ? limitText(P[v], info.fit) : '' };
    }).reverse();
    // Animals here, per species: groups and members.
    const herd = new Map<string, { groups: number; members: number }>();
    for (const a of agentsOn(game, i)) {
      const h = herd.get(game.species[a.sp].name) ?? { groups: 0, members: 0 };
      h.groups++; h.members += a.n; herd.set(game.species[a.sp].name, h);
    }
    return { x: i % game.w, y: (i / game.w) | 0, place: placeInfo(game, i), slots, layers: layerInfo(game, P, i), animals: [...herd] };
  });

  // Looking at a tile counts as looking at its variants: a rare one stops glinting.
  $effect(() => { if (card) seeVariants(card.slots.filter((sl) => sl.variant?.shown).map((sl) => sl.variant!.v)); });

  const num = (v: number) => (Math.abs(v) < 5e-6 ? '0' : (v > 0 ? '+' : '') + String(+v.toPrecision(2)));
  const pct = (v: number) => `${Math.round(v * 100)}%`;
</script>

{#if !card}
  <p class="dim">Click a tile on the map to see what lives there and why.</p>
{:else}
  <h2>{card.place.landmark ?? card.place.terrain} <span class="dim small">{card.place.landmark ? card.place.terrain.toLowerCase() + ' · ' : ''}({card.x}, {card.y})</span></h2>
  {#if card.place.blurb}<p class="small dim blurb">{card.place.blurb}</p>{/if}
  {#if card.place.statuses.length}
    <p class="small">{#each card.place.statuses as st (st.name)}<span class="status">{st.name} {st.value.toFixed(2)}</span>{/each}</p>
  {/if}
  {#each card.slots as sl (sl.stratum)}
    <div class="slot">
      <div class="head"><span class="dim">{sl.stratum}</span>
        {#if sl.species}<b>{sl.species}</b>
          {#if sl.fit?.tier}<span class="tier" style:background={TIER_COLORS[sl.fit.tier]}>{sl.fit.tier}</span>{/if}
          <span class="dim num">cover {pct(sl.cover)} · health {pct(sl.health)}</span>
          {#if sl.dying}<span class="bad">dying</span>{/if}
        {:else}<span class="dim">empty</span>{/if}
      </div>
      {#if sl.variant}
        {@const t = TIERS[sl.variant.tier]}
        <div class="small">
          {#if sl.variant.shown || sl.variant.tier === TIER.base}<b style:color={t.color}>{sl.variant.name}</b>
            <span class="dim">({sl.variant.tier === TIER.base ? 'base form' : `${t.name}: ${sl.variant.genes}`})</span>
          {:else}<span class="dim">a new form, too few plants to name yet</span>{/if}
        </div>
      {/if}
      <div class="small">{sl.why || ' '}</div>
      {#if sl.fit}
        <div class="needs">
          {#each sl.fit.needs as nd (nd.name)}
            <span class="small num" class:bad={nd.limiting} title="need score {nd.score.toFixed(2)}">{nd.name} {nd.value.toFixed(2)}</span>
          {/each}
        </div>
      {/if}
      <div class="small dim">Last: {sl.last ?? '—'}</div>
    </div>
  {/each}
  {#if card.animals.length}
    <p class="small">Animals: {#each card.animals as [name, h], k (name)}{k ? ' · ' : ''}<b>{name}</b> {h.members}{h.groups > 1 ? ` in ${h.groups} groups` : ''}{/each}</p>
  {/if}
  <h3>Layers <span class="dim small">(stocks change per second)</span></h3>
  {#each card.layers as l (l.id)}
    <div class="layer">
      <div class="row"><span>{l.name}{#if l.hidden} <span class="dim small">(no map view)</span>{/if}</span><b class="num">{l.value.toFixed(2)}</b></div>
      {#each l.parts as p (p.label)}
        <div class="row part small"><span class="dim">{p.label}</span><span class="num">{l.perSec ? `${num(p.value)}/s` : num(p.value)}</span></div>
      {/each}
    </div>
  {/each}
{/if}

<style>
  h2 { margin: 0 0 4px; }
  .blurb { margin: 0 0 6px; }
  .status { margin-right: 10px; }
  .slot { padding: 6px; margin-bottom: 4px; background: var(--panel-dark); border: 2px solid var(--ink); }
  .head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .needs { display: flex; gap: 8px; flex-wrap: wrap; }
  .layer { padding: 2px 0; border-bottom: 1px solid var(--panel-dark); }
  .row { display: flex; justify-content: space-between; }
  .part { padding-left: 10px; }
  .small { font-size: 14px; }
  .num { font-variant-numeric: tabular-nums; }
  .bad { color: var(--bad); }
  p { margin: 0 0 6px; }
</style>
