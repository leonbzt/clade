<script lang="ts">
  import { NUM } from '../data/numbers';
  import { game, ui } from './game.svelte';
  import { clock, fmt } from './format';

  const info = $derived.by(() => {
    ui.v;
    return { biomass: game.biomass, rate: game.rate, time: clock(game.tick, NUM.ticksPerSec) };
  });
</script>

<header class="panel bar">
  <span class="title">Clade</span>
  <span class="stat"><span class="dim">Biomass</span> <b class="gold">{fmt(info.biomass)}</b>
    <span class="dim">+{fmt(info.rate)}/s</span></span>
  <span class="stat dim">{info.time}{ui.speed === 0 ? ' · paused' : ui.speed !== 1 ? ` · ×${ui.speed}` : ''}</span>
  <button class="dev" class:on={ui.dev} onclick={() => (ui.dev = !ui.dev)} title="Also: the key left of 1, or F2">Dev</button>
</header>

<style>
  .bar { display: flex; gap: 24px; align-items: baseline; padding: 6px 12px; }
  .title { font-size: 22px; color: var(--gold); letter-spacing: 1px; }
  .stat { font-size: 18px; }
  .dev { margin-left: auto; }
</style>
