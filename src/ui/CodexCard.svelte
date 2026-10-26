<script lang="ts">
  import { act } from './game.svelte';
  import { closeCodex } from '../core/actions';
  import { CODEX } from '../data/codex';
  import { TEXT } from '../data/text';
  import type { NodeId } from '../data/tree';
  import Modal from './Modal.svelte';

  let { node }: { node: NodeId } = $props();
  const card = $derived(CODEX.find((c) => c.node === node));
  const close = () => act(closeCodex);
</script>

{#if card}
  <Modal onClose={close}>
    <div class="card codex">
      <h3>{TEXT.codex.title}</h3>
      <div class="title">{card.title}</div>
      {#each card.lines as line (line.text)}
        <p>
          {line.text}
          {#if line.unverified}<span class="unv">{TEXT.codex.unverified}</span>{/if}
        </p>
        {#if line.sources.length > 0}
          <div class="sources muted">
            {TEXT.codex.sources}:
            {#each line.sources as src (src)}<a href={src} target="_blank" rel="noreferrer">{new URL(src).hostname}</a>{' '}{/each}
          </div>
        {/if}
      {/each}
      <button class="primary wide" onclick={close}>{TEXT.codex.close}</button>
    </div>
  </Modal>
{/if}

<style>
  .codex {
    border-color: var(--gold);
  }
  .title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  p {
    margin: 10px 0 2px;
  }
  .unv {
    color: var(--warn);
    font-size: 11px;
    margin-left: 4px;
  }
  .sources {
    font-size: 11px;
  }
  a {
    color: var(--accent-2);
  }
</style>
