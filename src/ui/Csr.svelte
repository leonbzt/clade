<script lang="ts">
  // The CSR dot: a small triangle (C top, R bottom left, S bottom right) with the species' point.
  import { level, type Genes } from '../data/genes';
  import { csr } from '../sim/species';
  let { genes, size = 16 }: { genes: Genes; size?: number } = $props();
  const v = $derived(genes.length ? csr(genes) : null);
  const pt = $derived(v ? { x: 8 * v[0] + 1 * v[2] + 15 * v[1], y: 1.5 * v[0] + 14 * v[2] + 14 * v[1] } : null);
  const tip = $derived(v ? `C ${Math.round(v[0] * 100)}% · S ${Math.round(v[1] * 100)}% · R ${Math.round(v[2] * 100)}% · level ${level(genes)}` : '');
</script>

{#if pt}
  <svg width={size} height={size} viewBox="0 0 16 16" aria-label={tip}><title>{tip}</title>
    <polygon points="8,1.5 1,14 15,14" fill="none" stroke="#6b737d" stroke-width="1" />
    <circle cx={pt.x} cy={pt.y} r="2.2" fill="var(--gold)" />
  </svg>
{/if}

<style>
  svg { flex: none; vertical-align: middle; }
</style>
