<script lang="ts">
  import { halfYear } from '../sim/garden';
  import { yourArea } from '../sim/save';
  import { S, ui } from './state.svelte';
  import Island from './Island.svelte';
  import Run from './Run.svelte';
  import Away from './Away.svelte';
  import Dev from './Dev.svelte';

  const top = $derived.by(() => {
    ui.v;
    const g = S.game, wet = halfYear(g.garden.t);
    return {
      biomass: g.biomass, rate: g.yours / 1000, area: yourArea(g), wet: wet >= 1 ? 'wet' : 'dry',
      day: Math.floor(g.garden.t / 60), forms: Object.entries(g.forms).filter(([, on]) => on).map(([f]) => f).join(' · '),
    };
  });
  const fmt = (x: number) => (x >= 1e6 ? (x / 1e6).toFixed(2) + ' M' : x >= 1e4 ? (x / 1e3).toFixed(1) + ' k' : Math.floor(x).toString());
</script>

<header class="row">
  <h1>Clade</h1>
  <span><b>{fmt(top.biomass)}</b> biomass <span class="muted">+{top.rate.toFixed(1)}/s</span></span>
  <span><b>{top.area.toFixed(1)}</b> tiles held</span>
  <span class="muted">{top.wet} half-year · {top.day} min · forms: {top.forms}</span>
  <button class:on={ui.dev} onclick={() => (ui.dev = !ui.dev)}>dev</button>
</header>
{#if ui.dev}<Dev />{/if}
{#if ui.screen === 'run' && S.run}<Run />{:else}<Island />{/if}
{#if ui.away}<Away />{/if}

<style>
  header { padding: 8px 16px; background: #1c1f24; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
</style>
