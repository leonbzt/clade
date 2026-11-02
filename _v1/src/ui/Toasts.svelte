<script lang="ts">
  import { ui } from './game.svelte';
</script>

<div class="toasts">
  {#each ui.toasts as t (t.id)}
    <div class="panel toast {t.kind}">{t.text}</div>
  {/each}
</div>

<style>
  .toasts { position: fixed; left: 12px; bottom: 12px; display: flex; flex-direction: column; gap: 6px; max-width: 460px; z-index: 10; }
  .toast { padding: 8px 12px; }
  .bad { color: var(--bad); }
  .fact { border-color: var(--gold); }
  .fact::before { content: 'Codex · '; color: var(--gold); }
</style>
