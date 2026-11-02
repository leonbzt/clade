<script lang="ts">
  // The two run screens over the map: the start (two offers and who founds the run) and the end (how it went, what
  // comes home, the XP), which takes you back home.
  import { RUN, SIZES, THEMES } from '../data/islands';
  import { founders, levelOf, offers, runCost } from '../sim/lineage';
  import { beginRun, endRun, game, home, ui } from './game.svelte';
  import { grams } from './format';
  import { leadVariant } from '../sim/brood';
  import { variantName } from '../sim/variants';

  let offer = $state(0), founder = $state(0);

  const setup = $derived.by(() => {
    ui.v; ui.gen;
    return ui.runSetup ? { offers: offers(home), founders: founders(home), cost: runCost(home) } : null;
  });

  const done = $derived.by(() => {
    ui.v; ui.gen;
    const R = game.run;
    if (!R?.end) return null;
    const v = leadVariant(game), xp = Math.round(R.xp), before = levelOf(home.lineage!.xp).level, after = levelOf(home.lineage!.xp + xp).level;
    const form = R.end === 'died' || v < 0 ? home.lineage!.form.name : variantName(game, v);
    const title = R.end === 'died' ? 'The line died out' : R.end === 'home' ? 'You bring the line home' : 'The run is over';
    return { R, xp, before, after, form, title, settled: R.heirs.filter((h) => game.variants[h.v]?.alive && game.variants[h.v].tiles > 0).length };
  });
</script>

{#if setup}
  <div class="screen" role="presentation" onclick={(e) => e.target === e.currentTarget && (ui.runSetup = false)}>
    <div class="panel box">
      <header><h2>A run</h2><button onclick={() => (ui.runSetup = false)}>×</button></header>
      <p class="small dim">Eight seasons on a young island, alone; home waits while you're away. Each season brings a brood: pick an heir and
        place it. Wet seasons are the time to spread, dry ones thin the edges.</p>
      <h3>Where</h3>
      <div class="offers">
        {#each setup.offers as o, k (k)}
          <button class:on={offer === k} onclick={() => (offer = k)}>
            <b>{THEMES[o.theme].name}</b> · {SIZES[o.size].name}<br /><span class="small dim">{THEMES[o.theme].hint}</span>
          </button>
        {/each}
      </div>
      <h3>Who founds it</h3>
      {#each setup.founders as f, k (k)}
        <label class="small"><input type="radio" name="founder" checked={founder === k} onchange={() => (founder = k)} /> <b>{f.name}</b>
          <span class="dim">· {f.species} · {f.from}</span></label>
      {/each}
      <p><button class="go" onclick={() => beginRun(offer, Math.min(founder, setup.founders.length - 1))}>Set out · {grams(setup.cost)}</button></p>
    </div>
  </div>
{/if}

{#if done}
  <div class="screen">
    <div class="panel box">
      <h2>{done.title}</h2>
      <p>{done.R.season >= RUN.seasons ? RUN.seasons : done.R.season} seasons on the {THEMES[game.theme].name.toLowerCase()}.
        {done.R.heirs.length} heirs, {done.settled} still holding. Best fit: {Math.round(done.R.best * 100)}% of the land.</p>
      {#if done.R.keys.length}<p class="gold">A key fired on the run: the line is a new species.</p>{/if}
      <p>The lineage's form: <b class="gold">{done.form}</b>{done.R.end === 'died' ? ' (kept from before)' : ''}</p>
      <p><b>+{done.xp} XP</b>{done.after > done.before ? ` · level ${done.after}!` : ''}</p>
      <button class="go" onclick={endRun}>Back home</button>
    </div>
  </div>
{/if}

<style>
  .screen { position: fixed; inset: 0; background: rgba(14, 11, 8, 0.7); display: flex; justify-content: center; align-items: flex-start;
    padding: 48px 16px; z-index: 20; overflow-y: auto; }
  .box { width: min(560px, 100%); }
  header { display: flex; gap: 12px; align-items: baseline; }
  header h2 { margin: 0; flex: 1; }
  .small { font-size: 14px; }
  .offers { display: flex; gap: 8px; }
  .offers button { flex: 1; text-align: left; }
  label { display: block; margin: 4px 0; }
  .go { color: var(--gold); margin-top: 10px; }
</style>
