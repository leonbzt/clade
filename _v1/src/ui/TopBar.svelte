<script lang="ts">
  import { NUM } from '../data/numbers';
  import { RUN, SEASONS, THEMES } from '../data/islands';
  import { canBringHome, seasonTime } from '../sim/run';
  import { doBringHome, game, ui } from './game.svelte';
  import { clock, grams } from './format';

  const info = $derived.by(() => {
    ui.v;
    return { biomass: game.biomass, rate: game.rate, time: clock(game.tick, NUM.ticksPerSec) };
  });

  // On a run: the season bar, one cell per season (coloured by its season), the current one filling up.
  const COLOR = { wet: '#3a8ae0', mild: '#7aa850', dry: '#c89a4a' } as const;
  const run = $derived.by(() => {
    ui.v; ui.gen;
    const R = game.run;
    if (!R) return null;
    const at = Math.min(R.season, RUN.seasons - 1), now = SEASONS[at % SEASONS.length];
    return { R, at, now, part: seasonTime(game) / RUN.season, theme: THEMES[game.theme].name, home: canBringHome(game),
      cells: Array.from({ length: RUN.seasons }, (_, k) => COLOR[SEASONS[k % SEASONS.length].short]) };
  });
</script>

<header class="panel bar">
  <span class="title">Clade</span>
  {#if run}
    <span class="stat"><span class="dim">{run.theme} ·</span> <b class="gold">{run.R.landed ? `${run.now.name}, ${run.at + 1} of ${RUN.seasons}` : 'Landing'}</b></span>
    <span class="seasons" title="Wet, mild, dry, mild: a year is four seasons">
      {#each run.cells as c, k (k)}
        <span class="cell" style:border-color={c}><span class="fill" style:background={c}
          style:width="{k < run.at || run.R.end ? 100 : k === run.at && run.R.landed ? run.part * 100 : 0}%"></span></span>
      {/each}
    </span>
    <span class="stat dim">{Math.round(run.R.xp)} XP</span>
    {#if run.home}<button onclick={doBringHome}>Bring it home</button>{/if}
  {:else}
    <span class="stat"><span class="dim">Biomass</span> <b class="gold">{grams(info.biomass)}</b>
      <span class="dim">+{grams(info.rate)}/s</span></span>
  {/if}
  <span class="stat dim">{info.time}{ui.speed === 0 ? ' · paused' : ui.speed !== 1 ? ` · ×${ui.speed}` : ''}</span>
  <button class="dev" class:on={ui.dev} onclick={() => (ui.dev = !ui.dev)} title="Also: the key left of 1, or F2">Dev</button>
</header>

<style>
  .bar { display: flex; gap: 24px; align-items: baseline; padding: 6px 12px; }
  .title { font-size: 22px; color: var(--gold); letter-spacing: 1px; }
  .stat { font-size: 18px; }
  .dev { margin-left: auto; }
  .seasons { display: flex; gap: 3px; align-self: center; }
  .cell { width: 34px; height: 12px; border: 2px solid; background: var(--ink); }
  .fill { display: block; height: 100%; }
</style>
