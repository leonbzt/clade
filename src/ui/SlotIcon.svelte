<script lang="ts">
  // A slot's icon: square for a lead, round for an eating link, a diamond for a hunting link. Filled in the holder's
  // colour (a small mark when it's yours), hollow when open, glowing when big and open.
  import type { SlotView } from './board';

  let { slot, size = 12 }: { slot: SlotView; size?: number } = $props();
</script>

<span class="icon {slot.row}" class:open={slot.open} class:big={slot.big} style:--c={slot.color} style:--s="{size}px"
  title="{slot.name}: {slot.open ? 'open' : slot.who}">{#if slot.yours}<i></i>{/if}</span>

<style>
  .icon { display: inline-block; position: relative; width: var(--s); height: var(--s); background: var(--c);
    border: 2px solid var(--ink); vertical-align: middle; flex: none; }
  .eat { border-radius: 50%; }
  .hunt { transform: rotate(45deg) scale(0.85); }
  .open { background: transparent; border-color: var(--text); }
  .big { animation: glow 1.4s steps(2) infinite; }
  i { position: absolute; left: 50%; top: 50%; width: 4px; height: 4px; margin: -2px; background: var(--ink); }
  @keyframes glow { 50% { border-color: var(--gold); box-shadow: 0 0 0 2px var(--gold); } }
</style>
