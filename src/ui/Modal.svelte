<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children, onClose }: { children: Snippet; onClose?: () => void } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={(e) => e.target === e.currentTarget && onClose?.()}>
  <div class="box">
    {@render children()}
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(8, 10, 12, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    padding: 16px;
    animation: fade 0.25s ease-out;
  }
  .box {
    width: min(420px, 100%);
    max-height: 100%;
    overflow-y: auto;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
</style>
