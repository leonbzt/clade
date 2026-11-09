<!-- Slice 20D: a part's 6×6 pixel icon at any size. A two-part row shows its added (last) part, the base as a small
     corner icon. No row and no id: an empty box. -->
<script lang="ts">
  import type { Row } from '../data/body';
  import type { PartId } from '../data/life';
  import { pixels } from '../data/part-icons';

  let { id, row, size = 30 }: { id?: PartId | 'lock'; row?: Row | null; size?: number } = $props();
  const main = $derived(id ?? (row?.length ? row[row.length - 1] : undefined));
  const base = $derived(!id && row && row.length > 1 ? row[0] : undefined);
</script>

<span class="pi" style="width:{size}px;height:{size}px">
  {#if main}<svg viewBox="0 0 6 6" width={size} height={size} shape-rendering="crispEdges" aria-hidden="true">{#each pixels(main) as [x, y, c]}<rect {x} {y} width="1" height="1" fill={c} />{/each}</svg>{/if}
  {#if base}<span class="base"><svg viewBox="0 0 6 6" width={Math.round(size * 0.4)} height={Math.round(size * 0.4)} shape-rendering="crispEdges" aria-hidden="true">{#each pixels(base) as [x, y, c]}<rect {x} {y} width="1" height="1" fill={c} />{/each}</svg></span>{/if}
</span>

<style>
  .pi { position: relative; display: inline-block; flex: none; }
  .pi svg { display: block; }
  .base { position: absolute; left: -4px; bottom: -4px; padding: 1px; background: var(--ink); line-height: 0; }
</style>
