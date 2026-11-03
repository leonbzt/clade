<script lang="ts">
  // The release: the final body's scores in every niche of its layer, the gain over the parent, a name, and into
  // the garden.
  import { FORMS, level, tierOf } from '../data/genes';
  import { NICHES, PRESSURES } from '../data/niches';
  import Csr from './Csr.svelte';
  import { previewScores } from '../sim/game';
  import { endRun } from '../sim/play';
  import { finalBody, type Run } from '../sim/run/run';
  import { S, bump, ui } from './state.svelte';
  let { r }: { r: Run } = $props();
  let name = $state('');
  const body = $derived(finalBody(r));
  const scores = $derived(previewScores(r.form, body.raw, body.genes));
  const parent = $derived(S.game.run ? S.game.species[S.game.run.sprout.sp] : null);
  const from = $derived(parent && parent.form === r.form ? parent : null);
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
  <p class="row"><span>Level <b>{level(body.genes)}</b>{parent?.genes.length ? ` (from ${level(parent.genes)}, ${parent.name})` : ''}</span><Csr genes={body.genes} size={22} /></p>
  <table>
    <thead><tr><th>Niche</th><th>Score</th><th>Vs parent</th><th>Your best so far</th></tr></thead>
    <tbody>
      {#each NICHES.filter((n) => scores[n.id] >= 0) as n}
        <tr class:here={n.id === r.niche}>
          <td title={`${PRESSURES[n.pressure].name}: armour ${PRESSURES[n.pressure].armour} ${n.need}`}>{PRESSURES[n.pressure].icon} {n.name}{n.id === r.niche ? ' (here)' : ''}</td>
          <td><b class="gold">{tierOf(scores[n.id])}</b> {scores[n.id]}</td>
          <td>{#if from && from.scores[n.id] >= 0}{@const d = scores[n.id] - from.scores[n.id]}<span class={d >= 0 ? 'up' : 'down'}>{d >= 0 ? '+' : '−'}{Math.abs(d)}</span>{:else}<span class="muted">new</span>{/if}</td>
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
