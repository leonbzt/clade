<script lang="ts">
  import { KIT, SLOT_NAMES, STAT_DOES, WORM_KIT, type KitNode } from '../../data/kit';
  import { PARTS } from '../../data/parts';
  import { planOk } from '../../sim/kit';
  import type { PartId, Place } from '../../sim/records';
  import { addsText, firstRung, planLimit } from './kit-progress';

  let { level, plan, change }: { level: number; plan: PartId[]; change: (plan: PartId[]) => void } = $props();
  let full = $state(false);
  const places = (Object.keys(SLOT_NAMES) as Place[])
    .filter((place) => WORM_KIT.some((node) => node.kind === 'part' && PARTS[node.id].place === place));

  function toggle(node: KitNode) {
    if (node.kind !== 'part' || node.rare || node.level > level) return;
    full = false;
    const next = plan.includes(node.id) ? plan.filter((id) => id !== node.id)
      : [...plan.filter((id) => PARTS[id].place !== PARTS[node.id].place), node.id];
    if (planOk(level, next)) change(next);
    else full = true;
  }
</script>

{#snippet row(node: KitNode)}
  <button class="kit-row" class:planned={node.kind === 'part' && plan.includes(node.id)}
    data-kit={node.id} aria-pressed={node.kind === 'part' && plan.includes(node.id)}
    disabled={node.kind === 'trait' || node.rare || node.level > level} onclick={() => toggle(node)}>
    <span>{firstRung(node).name}</span>
    <small>{addsText(firstRung(node))}</small>
    {#if node.level > level}<small>level {node.level}</small>{/if}
    {#if node.rare}<small>rare · offered only</small>{/if}
    {#if node.kind === 'trait'}<small>offered in the Life</small>{/if}
  </button>
{/snippet}

<section class="kit-body">
  <h2>Body</h2>
  {#each places as place (place)}
    <section class="kit-place">
      <h3>{SLOT_NAMES[place]}</h3>
      {#each WORM_KIT as node (node.id)}
        {#if node.kind === 'part' && PARTS[node.id].place === place}{@render row(node)}{/if}
      {/each}
    </section>
  {/each}
  <section class="kit-place">
    <h3>Traits</h3>
    {#each WORM_KIT as node (node.id)}
      {#if node.kind === 'trait'}{@render row(node)}{/if}
    {/each}
  </section>
  {#if full}<p role="status">{planLimit(level)} planned parts at this level</p>{/if}
  <dl>
    {#each Object.entries(KIT.base) as [stat, value] (stat)}
      <dt>{stat} {value}</dt>
      <dd>{STAT_DOES[stat as keyof typeof STAT_DOES]}</dd>
    {/each}
  </dl>
</section>

<style>
  .kit-body { min-width: 0; }
  h2, h3 { font-size: 16px; margin: 0 0 8px; }
  .kit-place { border: 2px solid var(--line); padding: 8px; margin-bottom: 8px; }
  .kit-row { display: block; width: 100%; text-align: left; margin-top: 6px; white-space: normal; overflow-wrap: anywhere; }
  .kit-row.planned { border-color: var(--dim); background: var(--ink); }
  .kit-row:disabled { opacity: 1; color: var(--dim); cursor: default; }
  small { display: block; font: inherit; color: var(--dim); margin-top: 2px; }
  dl { margin-bottom: 0; }
  dt { margin-top: 8px; }
  dd { margin: 2px 0 0; color: var(--dim); }
</style>
