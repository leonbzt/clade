<script lang="ts">
  import { FOUNDER_GENES } from '../data/genes';
  import { homePatch } from '../sim/game';
  import type { FormId } from '../data/genes';
  import { S, bump, reset, skip, ui } from './state.svelte';

  /** A sprout of your newest species (or the founder) in a form, at its home patch. */
  function sprout(form: FormId) {
    const g = S.game, sp = [...g.species].reverse().find((s) => !s.native)!;
    g.sprouts.push({ id: g.nextSprout++, sp: sp.id, genes: sp.genes.length ? [...sp.genes] : [...FOUNDER_GENES], form, patch: homePatch(g, form), note: 'dev', born: g.garden.t });
    g.sprouts = g.sprouts.slice(-3);
    bump();
  }
</script>

<div class="dev row">
  <span class="muted">speed</span>
  {#each [1, 10, 60, 600] as s}<button class:on={ui.speed === s} onclick={() => (ui.speed = s)}>×{s}</button>{/each}
  <button onclick={() => { S.game.biomass += 10000; bump(); }}>+10 k biomass</button>
  {#each ['moss', 'herb', 'tree'] as const as f}<button onclick={() => sprout(f)}>+ {f}</button>{/each}
  <button onclick={() => { S.game.forms = { moss: true, herb: true, tree: true }; bump(); }}>open all forms</button>
  <button onclick={() => skip(3600)}>skip 1 h</button>
  <button onclick={() => skip(8 * 3600)}>skip 8 h</button>
  <button onclick={() => { if (confirm('Reset the save?')) reset(); }}>reset</button>
</div>

<style>
  .dev { justify-content: flex-start; padding: 4px 16px; background: #2a2418; flex-wrap: wrap; }
</style>
