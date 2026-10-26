<script lang="ts">
  import { untrack } from 'svelte';
  import { store } from './game.svelte';
  import { VIEW } from '../data/view';

  // Shows new game events for a few real seconds.
  let shown = $state<{ id: number; text: string; at: number }[]>([]);
  let seen = 0;
  let lastT = 0;
  let nextId = 0;

  $effect(() => {
    const s = store.s;
    if (s.t < lastT) seen = 0; // reset
    lastT = s.t;
    const fresh = s.events.filter((e) => e.t > seen);
    if (fresh.length > 0) {
      seen = fresh[fresh.length - 1].t;
      const now = performance.now();
      shown = [...untrack(() => shown), ...fresh.map((e) => ({ id: nextId++, text: e.text, at: now }))].slice(-4);
    }
  });

  $effect(() => {
    const timer = setInterval(() => {
      const now = performance.now();
      if (shown.some((m) => now - m.at > VIEW.toastSeconds * 1000)) {
        shown = shown.filter((m) => now - m.at <= VIEW.toastSeconds * 1000);
      }
    }, 250);
    return () => clearInterval(timer);
  });
</script>

<div class="toasts">
  {#each shown as m (m.id)}
    <div class="toast">{m.text}</div>
  {/each}
</div>

<style>
  .toasts {
    position: fixed;
    left: 16px;
    bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 30;
    pointer-events: none;
    max-width: min(420px, calc(100% - 32px));
  }
  .toast {
    background: rgba(31, 35, 40, 0.95);
    border: 1px solid var(--line);
    border-left: 3px solid var(--accent);
    border-radius: 8px;
    padding: 8px 12px;
    animation: pop 0.3s ease-out;
  }
  @keyframes pop {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
</style>
