<!-- Your lines on the map (21A's plain list; since 21B one row per line that opens its close-up, LineView.svelte). -->
<script lang="ts">
  import { LINEAGES } from '../data/lineages';
  import { PLAN_IDS } from '../data/life';
  import { levelOf, titleOf } from '../sim/lineage';
  import { recipeText } from './line';
  import { ctx, ui } from './meta.svelte';

  const lines = $derived((ui.tick, PLAN_IDS.flatMap((plan) => (ctx.save.lines[plan] ? [{ plan, line: ctx.save.lines[plan]! }] : []))));
  const locked = $derived((ui.tick, PLAN_IDS.filter((p) => !ctx.save.lines[p] && LINEAGES[p].recipe)));
</script>

<section class="lines" aria-labelledby="linesTitle">
  <h3 id="linesTitle">Your lines · {lines.length} of {PLAN_IDS.length} lineages</h3>
  <div class="habList">
    {#each lines as { plan, line }}
      <button class="habBtn" onclick={() => (ui.line = plan)}>
        <b>{LINEAGES[plan].name} line · level {levelOf(line.xp)}{titleOf(plan, line) ? ` · ${titleOf(plan, line)}` : ''}</b>
        <small>{line.points ? `${line.points} point${line.points === 1 ? '' : 's'} to spend · ` : ''}{line.species.length} species</small>
      </button>
    {/each}
  </div>
  {#if locked.length}
    <details><summary>{locked.length} locked</summary>{#each locked as p}<p class="note">{LINEAGES[p].name}: {recipeText(p)}</p>{/each}</details>
  {/if}
</section>

<style>
  .lines { display: grid; gap: 6px; }
  .lines p { margin: 2px 0; }
</style>
