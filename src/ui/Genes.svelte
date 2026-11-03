<script lang="ts">
  // The genome: 8 attribute bars of 0–10 pips, grouped by CSR corner, with the level and the CSR dot.
  import { ATTRS, MAX_PIPS, level, type Genes } from '../data/genes';
  import Csr from './Csr.svelte';
  let { genes, changed = [] }: { genes: Genes; changed?: number[] } = $props();
  const CORNER = { C: 'Compete', S: 'Endure', R: 'Spread' };
</script>

<div class="row head"><span>Level <b>{level(genes)}</b></span><Csr {genes} size={22} /></div>
{#each ATTRS as d, i}
  {#if i === 0 || ATTRS[i - 1].corner !== d.corner}<div class="corner muted">{CORNER[d.corner]}</div>{/if}
  <div class="gene" class:ch={changed.includes(i)} title={d.help}>
    <span>{d.name}</span>
    <span class="pips">{#each Array(MAX_PIPS) as _, k}<i class:f={k < genes[i]}></i>{/each}</span>
  </div>
{/each}

<style>
  .head { font-size: 12.5px; }
  .corner { font-size: 10.5px; margin-top: 4px; }
  .gene { display: flex; align-items: center; gap: 6px; font-size: 11.5px; }
  .gene > span:first-child { width: 72px; }
  .gene.ch > span:first-child { color: var(--gold); }
  .pips { display: inline-flex; gap: 2px; }
  .pips i { width: 7px; height: 8px; background: #333a42; border-radius: 1px; }
  .pips i.f { background: var(--accent); }
  .gene.ch .pips i.f { background: var(--gold); }
</style>
