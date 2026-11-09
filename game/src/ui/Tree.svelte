<!-- Recipe ancestry is laid out with nested Svelte lists and CSS; portraits reuse the existing creature view. -->
<script lang="ts">
  import { LINEAGES } from '../data/lineages';
  import type { PlanId } from '../data/life';
  import { defaultBuild } from '../sim/body';
  import { levelOf } from '../sim/lineage';
  import { asBuild, childrenOf, recipeText } from './line';
  import { ctx, ui } from './meta.svelte';
  import Creature from './Creature.svelte';

  const lines = $derived((ui.tick, { ...ctx.save.lines }));
</script>

{#snippet branch(plan: PlanId)}
  {@const line = lines[plan]}
  {@const recipe = LINEAGES[plan].recipe}
  {@const children = childrenOf(plan)}
  <li class="branch" data-lineage={plan}>
    <article class="node" class:locked={!line}>
      {#if recipe}<p class="from">From {LINEAGES[recipe.from].name}</p>{/if}
      <button class="nodeButton" disabled={!line} onclick={() => (ui.line = plan)} aria-label={`${LINEAGES[plan].name} line${line ? `, level ${levelOf(line.xp)}; open close-up` : ', locked'}`}>
        <div class="portrait" class:silhouette={!line}>
          <Creature build={line?.species[0] ? asBuild(plan, line.species[0].rows, line.ranks) : defaultBuild(plan)} height={130} compact />
        </div>
        <b>{LINEAGES[plan].name}</b>
        <small>{line ? `Level ${levelOf(line.xp)}` : 'Locked'}</small>
      </button>
      {#if line}
        <ul class="species" aria-label={`${LINEAGES[plan].name} species`}>
          {#each line.species.slice(0, 3) as sp}<li>{sp.name}</li>{:else}<li class="empty">No species yet</li>{/each}
        </ul>
        {#if line.species.length > 3}<p class="more">+{line.species.length - 3} species</p>{/if}
      {:else}
        <p class="recipe">{recipeText(plan)}</p>
      {/if}
    </article>
    {#if children.length}
      <ul class="children" style:--count={children.length}>
        {#each children as child}{@render branch(child)}{/each}
      </ul>
    {/if}
  </li>
{/snippet}

<div class="metaWrap treeWrap"><div class="panel habCard tree">
  <div class="metaTop"><h2>Tree of life</h2><button class="small" onclick={() => (ui.tree = false)}>Map</button></div>
  <p class="pitch">Every line begins with the worm. Follow its recipes; tap an open line to grow it.</p>
  <ul class="root">{@render branch('worm')}</ul>
</div></div>

<style>
  .treeWrap { position: fixed; inset: 0; z-index: 25; overflow: auto; place-items: start center; }
  .tree { width: min(900px, 96vw); max-width: 100%; min-width: 0; }
  .tree .metaTop { flex-wrap: wrap; }
  .root, .children { list-style: none; margin: 0; padding: 0; }
  .branch { position: relative; min-width: 0; }
  .node { width: min(100%, 270px); margin: 0 auto; padding: 7px; border: 2px solid var(--brass); background: #241c12; overflow-wrap: anywhere; }
  .node.locked { border-color: var(--edge); }
  .nodeButton { display: grid; gap: 4px; width: 100%; min-width: 0; padding: 4px; text-align: center; }
  .nodeButton small { font-weight: 400; font-size: 16px; color: var(--text); }
  .portrait { min-width: 0; pointer-events: none; }
  .silhouette :global(canvas) { filter: brightness(0.12); }
  .from { margin: 0 0 6px; text-align: center; color: var(--dim); }
  .recipe, .more { margin: 6px 0 0; }
  .recipe { color: var(--dim); }
  .species { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 4px; }
  .species li { padding-left: 6px; border-left: 2px solid var(--edge); }
  .empty { color: var(--dim); }
  .more { color: var(--gold); }
  .children { display: grid; grid-template-columns: repeat(var(--count), minmax(0, 1fr)); padding-top: 24px; }
  .children > .branch { padding: 16px 4px 0; }
  .children > .branch::before { content: ''; position: absolute; top: 0; left: 50%; height: 16px; border-left: 2px solid var(--brass); }
  .children > .branch::after { content: ''; position: absolute; top: 0; left: 0; right: 0; border-top: 2px solid var(--brass); }
  .children > .branch:first-child::after { left: 50%; }
  .children > .branch:last-child::after { right: 50%; }
  .children::before { content: ''; position: absolute; left: 50%; height: 24px; margin-top: -24px; border-left: 2px solid var(--brass); }
</style>
