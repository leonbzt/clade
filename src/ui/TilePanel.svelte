<script lang="ts">
  // The full tile card: who lives here in each stratum, how well they fit and what holds them back, what last
  // happened, and every layer with its parts.
  import { STRATA } from '../data/fields';
  import { layerInfo, limitText, slotInfo } from '../sim/explain';
  import { profiles } from '../sim/fit';
  import { SEA, TERRAIN_NAMES } from '../sim/state';
  import { TIER_COLORS } from '../data/palette';
  import { game, ui } from './game.svelte';

  const card = $derived.by(() => {
    ui.v;
    const i = ui.selected;
    if (i < 0 || game.terrain[i] === SEA) return null;
    const P = profiles(game), n = game.w * game.h;
    const slots = STRATA.map((_, k) => {
      const info = slotInfo(game, P, k, i), sp = game.occ[k * n + i];
      return { ...info, why: info.fit && sp >= 0 ? limitText(P[sp], info.fit) : '' };
    }).reverse();
    return { x: i % game.w, y: (i / game.w) | 0, terrain: TERRAIN_NAMES[game.terrain[i]], slots, layers: layerInfo(game, P, i) };
  });

  const num = (v: number) => (v > 0 ? '+' : '') + String(+v.toPrecision(2));
</script>

{#if !card}
  <p class="dim">Click a tile on the map to see what lives there and why.</p>
{:else}
  <h2>{card.terrain} <span class="dim small">({card.x}, {card.y})</span></h2>
  {#each card.slots as sl (sl.stratum)}
    <div class="slot">
      <div class="head"><span class="dim">{sl.stratum}</span>
        {#if sl.species}<b>{sl.species}</b><span class="dim">{Math.round(sl.cover * 100)}%</span>
          {#if sl.fit?.tier}<span class="tier" style:background={TIER_COLORS[sl.fit.tier]}>{sl.fit.tier}</span>{/if}
        {:else}<span class="dim">empty</span>{/if}
      </div>
      {#if sl.why}<div class="small">{sl.why}</div>{/if}
      {#if sl.fit}
        <div class="needs">
          {#each sl.fit.needs as nd (nd.layer)}
            <span class="small" class:bad={nd.limiting} title="need score {nd.score.toFixed(2)}">{nd.layer} {nd.value.toFixed(2)}</span>
          {/each}
        </div>
      {/if}
      {#if sl.last}<div class="small dim">Last: {sl.last}</div>{/if}
    </div>
  {/each}
  <h3>Layers <span class="dim small">(stocks change per second)</span></h3>
  {#each card.layers as l (l.id)}
    <div class="layer">
      <div class="row"><span>{l.name}</span><b>{l.value.toFixed(2)}</b></div>
      {#each l.parts.filter((p) => Math.abs(p.value) > 1e-6 || p.label.startsWith('plants that')) as p (p.label)}
        <div class="row part small"><span class="dim">{p.label}</span><span>{p.value ? num(p.value) : ''}{l.perSec && p.value ? '/s' : ''}</span></div>
      {/each}
    </div>
  {/each}
{/if}

<style>
  h2 { margin: 0 0 6px; }
  .slot { padding: 6px; margin-bottom: 4px; background: var(--panel-dark); border: 2px solid var(--ink); }
  .head { display: flex; gap: 8px; align-items: center; }
  .needs { display: flex; gap: 8px; flex-wrap: wrap; }
  .layer { padding: 2px 0; border-bottom: 1px solid var(--panel-dark); }
  .row { display: flex; justify-content: space-between; }
  .part { padding-left: 10px; }
  .small { font-size: 14px; }
  .bad { color: var(--bad); }
</style>
