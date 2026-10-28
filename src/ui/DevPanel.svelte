<script lang="ts">
  import { profiles } from '../sim/fit';
  import { expected } from '../sim/metrics';
  import { defOf } from '../sim/variants';
  import { addBiomass, autoplay, game, perf, reset, skip, ui, unlockAll } from './game.svelte';

  const speeds = [0, 1, 10, 100];
  // Per living animal species: members, groups as a share of the cap, and what the curve model expects.
  const stats = $derived.by(() => {
    ui.v;
    const P = profiles(game), slow = game.agents.filter((a) => a.slow).length;
    const rows = game.species.flatMap((x, sp) => {
      const b = defOf(game, sp).animal;
      if (!b || !game.count[sp]) return [];
      return [{ name: x.name, members: game.members[sp], groups: game.count[sp], cap: Math.round((100 * game.count[sp]) / b.cap), exp: expected(game, P, sp) }];
    });
    return { rows, agents: game.agents.length, slow: Math.round((100 * slow) / (game.agents.length || 1)), ms: perf.ms.toFixed(2) };
  });
</script>

<div class="panel dev">
  <h3>Dev panel</h3>
  <div>Speed {#each speeds as s (s)}<button class:on={ui.speed === s} onclick={() => (ui.speed = s)}>{s ? `×${s}` : 'Pause'}</button>{/each}</div>
  <div>Skip <button onclick={() => skip(60)}>1 min</button><button onclick={() => skip(600)}>10 min</button></div>
  <div>Bot plays <button onclick={() => autoplay(300)}>5 min</button><button onclick={() => autoplay(900)}>15 min</button></div>
  <div><button onclick={() => addBiomass(1000)}>+1k biomass</button><button onclick={() => addBiomass(10000)}>+10k</button><button onclick={unlockAll}>Unlock all</button></div>
  <div><button onclick={reset}>New island</button><button onclick={() => console.log(game)}>Log state</button></div>
  {#if stats.rows.length}
    <table class="small">
      <tbody>
        <tr class="dim"><td></td><td>members</td><td>groups</td><td>cap</td><td>expected</td></tr>
        {#each stats.rows as r (r.name)}<tr><td>{r.name}</td><td>{r.members}</td><td>{r.groups}</td><td>{r.cap}%</td><td>{r.exp ?? '–'}</td></tr>{/each}
      </tbody>
    </table>
  {/if}
  <p class="dim">{stats.agents} agents · {stats.slow}% settled · {stats.ms} ms/tick · window.dev.dump()</p>
</div>

<style>
  .dev { position: fixed; right: 12px; bottom: 12px; display: flex; flex-direction: column; gap: 6px; z-index: 10; }
  h3 { margin: 0; }
  p { margin: 0; font-size: 13px; }
  table { border-collapse: collapse; }
  td { padding: 0 6px 0 0; text-align: right; }
  td:first-child { text-align: left; }
</style>
