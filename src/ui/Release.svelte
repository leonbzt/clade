<script lang="ts">
  // The release: the final body's scores in every niche of its layer, a name, and into the garden.
  import { FORMS, tierOf } from '../data/genes';
  import { NICHES } from '../data/niches';
  import { previewScores } from '../sim/game';
  import { endRun } from '../sim/play';
  import { finalBody, type Run } from '../sim/run/run';
  import { S, bump, ui } from './state.svelte';
  let { r }: { r: Run } = $props();
  let name = $state('');
  const scores = $derived(previewScores(r.form, finalBody(r).raw));
  const best = $derived.by(() => {
    const out = new Map<number, number>();
    for (const s of S.game.species) if (!s.native) s.scores.forEach((v, n) => { if (v > (out.get(n) ?? -1)) out.set(n, v); });
    return out;
  });
  function go() {
    endRun(S.game, r, name || null);
    S.run = null; ui.screen = 'island'; bump();
  }
</script>

<div class="panel">
  <h2>Release your {FORMS[r.form].name.toLowerCase()}</h2>
  <table>
    <thead><tr><th>Niche</th><th>Score</th><th>Your best so far</th></tr></thead>
    <tbody>
      {#each NICHES.filter((n) => scores[n.id] >= 0) as n}
        <tr class:here={n.id === r.niche}>
          <td>{n.name}{n.id === r.niche ? ' (here)' : ''}</td>
          <td><b class="gold">{tierOf(scores[n.id])}</b> {scores[n.id]}</td>
          <td class="muted">{best.has(n.id) ? `${tierOf(best.get(n.id)!)} ${best.get(n.id)}` : '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="row"><input placeholder="a name (or leave it to the form and its best stat)" bind:value={name} maxlength="28" style="flex:1" />
    <button class="primary" onclick={go}>Release</button></p>
</div>

<style>
  tr.here td { background: #2a3324; }
</style>
