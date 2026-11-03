<script lang="ts">
  import { BASE_GENES } from '../data/genes';
  import { gardenSprout } from '../sim/game';
  import { S, bump, reset, skip, ui } from './state.svelte';

  function sprout() {
    const g = S.game;
    if (g.species.some((s) => !s.native && s.id !== g.founder)) gardenSprout(g);
    else g.sprouts.push({ id: g.nextSprout++, sp: g.founder, genes: [...BASE_GENES], form: 'moss', patch: g.sprouts[0]?.patch ?? 0, note: 'dev', born: g.garden.t });
    bump();
  }
</script>

<div class="dev row">
  <span class="muted">speed</span>
  {#each [1, 10, 60, 600] as s}<button class:on={ui.speed === s} onclick={() => (ui.speed = s)}>×{s}</button>{/each}
  <button onclick={() => { S.game.biomass += 10000; bump(); }}>+10 k biomass</button>
  <button onclick={sprout}>+ sprout</button>
  <button onclick={() => { S.game.forms = { moss: true, herb: true, tree: true }; bump(); }}>open all forms</button>
  <button onclick={() => skip(3600)}>skip 1 h</button>
  <button onclick={() => skip(8 * 3600)}>skip 8 h</button>
  <button onclick={() => { if (confirm('Reset the save?')) reset(); }}>reset</button>
</div>

<style>
  .dev { justify-content: flex-start; padding: 4px 16px; background: #2a2418; flex-wrap: wrap; }
</style>
