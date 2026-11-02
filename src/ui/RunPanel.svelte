<script lang="ts">
  // On a run: the season, the brood (pick a card, then a spot within reach), the heirs, XP so far and the news.
  import { RUN, THEMES } from '../data/islands';
  import { TIERS } from '../data/genes';
  import { lineCount, canBringHome } from '../sim/run';
  import { doBringHome, game, pickHeir, ui } from './game.svelte';

  const KIND = { steady: 'Steady', cross: 'Cross', wild: 'Wild' } as const;

  const run = $derived.by(() => {
    ui.v; ui.gen;
    const R = game.run!;
    return { R, theme: THEMES[game.theme].name, tiles: lineCount(game), home: canBringHome(game), brood: [...R.brood], heirs: [...R.heirs].reverse(),
      settled: (v: number) => game.variants[v]?.alive && game.variants[v].tiles > 0, news: R.news.slice(-5).reverse(), line: game.species[R.line[R.line.length - 1]].name };
  });
</script>

<div class="run">
  <h2>{run.line} <span class="dim small">on the {run.theme.toLowerCase()}</span></h2>
  {#if !run.R.landed}
    <p class="gold">Land the founder, {run.R.founder.name}: click a spot on the map.</p>
    <p class="small dim">Outlined tiles can take it; gold marks the best spots. Seasons start when it lands, with a wet one.</p>
  {:else}
    <p class="small">{run.tiles} tiles · {Math.round(run.R.xp)} XP so far · best fit {Math.round(run.R.best * 100)}% of the land</p>

    <h3>Brood, season {Math.min(run.R.season + 1, RUN.seasons)}</h3>
    {#each run.brood as c, k (k)}
      <div class="card" class:on={ui.placing === `heir:${k}`}>
        <div class="head"><span class="kind">{KIND[c.kind]}</span> <b style:color={TIERS[c.tier].color}>{c.name}</b>
          <span class="tier" style:background={TIERS[c.tier].color}>{TIERS[c.tier].name}</span></div>
        <p class="small">{c.words.join(' · ')}</p>
        <button onclick={() => pickHeir(k)} class:on={ui.placing === `heir:${k}`}>{ui.placing === `heir:${k}` ? 'Pick a spot on the map' : 'Pick'}</button>
      </div>
    {:else}
      <p class="small dim">{run.R.end ? 'The run is over.' : 'The heir is down. The next brood comes with the next season.'}</p>
    {/each}
    {#if ui.placing?.startsWith('heir:')}<p class="small dim">Within {RUN.reach} tiles of the line; right-click to cancel.</p>{/if}

    {#if run.heirs.length}
      <h3>Heirs</h3>
      {#each run.heirs as h (h.season)}
        <p class="small">Season {h.season + 1}: {h.name} · {h.paid ? (run.settled(h.v) ? 'settled' : 'gone') : run.settled(h.v) ? 'holding' : 'gone'}</p>
      {/each}
    {/if}

    <button class="home" disabled={!run.home} onclick={doBringHome} title={run.home ? '' : `After ${RUN.homeAfter} seasons`}>Bring it home</button>
    {#if !run.home}<span class="dim small">after {RUN.homeAfter} seasons</span>{/if}

    {#if run.news.length}
      <h3>News</h3>
      {#each run.news as n, k (k)}<p class="small dim">{n}</p>{/each}
    {/if}
  {/if}
</div>

<style>
  .run h2 { margin-top: 0; }
  .small { font-size: 14px; }
  p { margin: 4px 0; }
  .card { border: 2px solid var(--ink); background: var(--panel-dark); padding: 6px 8px; margin: 6px 0; }
  .card.on { border-color: var(--gold); }
  .head { display: flex; gap: 8px; align-items: baseline; }
  .kind { color: var(--dim); min-width: 48px; }
  .tier { font-size: 12px; margin-left: auto; }
  .home { margin-top: 10px; color: var(--gold); }
</style>
