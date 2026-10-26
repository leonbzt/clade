<script lang="ts">
  import { store } from './game.svelte';
  import { keyInnovationUnlocked } from '../core/genepool';
  import { TEXT } from '../data/text';
  import { NODES, START_NODE, TARGET_NODE } from '../data/tree';
  import { TRAIT_BY_ID } from '../data/traits';

  const s = $derived(store.s);
  const start = NODES.find((n) => n.id === START_NODE)!;
  const branches = NODES.filter((n) => n.parent === START_NODE);
  // in the colony the gene pool says what's common; after release, the traits found
  const has = (id: string) => s.traitsFound.includes(id as never);
</script>

<div class="card">
  <h3>{TEXT.tree.title}</h3>
  <div class="node reached">{start.name} <span class="tag">✓ {TEXT.tree.reached}</span></div>
  <div class="branches">
    {#each branches as n (n.id)}
      {@const reached = s.reached.includes(n.id)}
      <div class="branch">
        <div class="node" class:reached class:target={n.id === TARGET_NODE && !reached} class:locked={!!n.lockedBy}>
          {n.name}
          {#if reached}<span class="tag">✓ {TEXT.tree.reached}</span>{/if}
        </div>
        {#if n.lockedBy}
          <div class="detail bad">{TEXT.tree.locked(n.lockedBy)}</div>
          <div class="detail muted">{TEXT.tree.soilNote}</div>
        {:else if n.precursors.length > 0 && !reached}
          {@const done = n.precursors.filter(has).length}
          <div class="detail muted">{TEXT.tree.precursors(done, n.precursors.length)}</div>
          {#each n.precursors as p (p)}
            <div class="detail" class:ok={has(p)}>{has(p) ? '✓' : '○'} {TRAIT_BY_ID[p].name}</div>
          {/each}
          {#if n.keyInnovation}
            <div class="detail key" class:dim={!keyInnovationUnlocked(s)}>
              ★ {TEXT.tree.innovation}: {keyInnovationUnlocked(s) ? TRAIT_BY_ID[n.keyInnovation].name : '?'}
            </div>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .node {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: var(--panel-2);
    font-weight: 600;
  }
  .node.reached {
    border-color: var(--accent);
  }
  .node.target {
    border-color: var(--gold);
  }
  .node.locked {
    opacity: 0.55;
  }
  .tag {
    font-size: 11px;
    color: var(--accent-2);
    font-weight: 400;
    margin-left: 4px;
  }
  .branches {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--line);
  }
  .detail {
    font-size: 12px;
    margin-top: 3px;
  }
  .detail.ok {
    color: var(--accent-2);
  }
  .detail.bad {
    color: #d07a6a;
  }
  .detail.key {
    color: var(--gold);
  }
  .detail.dim {
    opacity: 0.5;
  }
</style>
