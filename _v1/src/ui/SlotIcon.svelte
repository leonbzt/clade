<script lang="ts">
  // A loadout slot's mini icon: a square for a plant layer, round for grazer and recycler, a diamond for the hunter.
  // Filled in the holder's colour (a small mark when it's yours), hollow when open, glowing when big and open, a faint
  // dot when locked.
  import type { GearView } from './board';

  let { slot, size = 12 }: { slot: GearView; size?: number } = $props();
</script>

<span class="icon {slot.shape}" class:open={slot.open} class:big={slot.big} class:locked={slot.locked} style:--c={slot.color} style:--s="{size}px"
  title="{slot.slot}: {slot.locked ? 'nothing here' : slot.open ? 'open' : slot.who}">{#if slot.yours}<i></i>{/if}</span>

<style>
  .icon { display: inline-block; position: relative; width: var(--s); height: var(--s); background: var(--c);
    border: 2px solid var(--ink); vertical-align: middle; flex: none; }
  .eat { border-radius: 50%; }
  .hunt { transform: rotate(45deg) scale(0.85); }
  .open { background: transparent; border-color: var(--text); }
  .locked { background: transparent; border-color: transparent; opacity: 0.5; }
  .locked::after { content: ''; position: absolute; left: 50%; top: 50%; width: 2px; height: 2px; margin: -1px; background: var(--dim); }
  .big { animation: glow 1.4s steps(2) infinite; }
  i { position: absolute; left: 50%; top: 50%; width: 4px; height: 4px; margin: -2px; background: var(--ink); }
  @keyframes glow { 50% { border-color: var(--gold); box-shadow: 0 0 0 2px var(--gold); } }
</style>
