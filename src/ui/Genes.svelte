<script lang="ts">
  import { GENES, PIPS, type FormId, type Genes } from '../data/genes';
  let { genes, changed = [], form }: { genes: Genes; changed?: number[]; form: FormId } = $props();
</script>

{#each GENES as d, i}
  <div class="gene" class:ch={changed.includes(i)} title={form === 'moss' && d.moss ? d.moss : d.help}>
    <span>{d.name}</span>
    <span class="pips">{#each Array(PIPS) as _, k}<i class:f={k < genes[i]}></i>{/each}</span>
  </div>
{/each}

<style>
  .gene { display: flex; align-items: center; gap: 6px; font-size: 11.5px; }
  .gene > span:first-child { width: 72px; }
  .gene.ch > span:first-child { color: var(--gold); }
  .pips { display: inline-flex; gap: 2px; }
  .pips i { width: 7px; height: 8px; background: #333a42; border-radius: 1px; }
  .pips i.f { background: var(--accent); }
  .gene.ch .pips i.f { background: var(--gold); }
</style>
