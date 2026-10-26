<script lang="ts">
  import { store, act } from './game.svelte';
  import { release } from '../core/actions';
  import { releaseGain, type ReleaseGain } from '../core/release';
  import { HOME } from '../data/niches';
  import { TEXT } from '../data/text';
  import { NODES, TARGET_NODE } from '../data/tree';
  import { fmt } from './format';
  import Modal from './Modal.svelte';

  let { onClose }: { onClose: () => void } = $props();
  const s = $derived(store.s);
  const now = $derived(releaseGain(s));
  const plus = $derived(store.plusOne);
  const node = NODES.find((n) => n.id === TARGET_NODE)!;
  const lava = (g: ReleaseGain) => Math.round(g.share[HOME.niche] * 100);

  function go() {
    act(release);
    onClose();
  }
</script>

<Modal {onClose}>
  <div class="card">
    <h3>{TEXT.release.title}</h3>
    <div class="cols">
      <div>
        <div class="muted small">{TEXT.release.keep}</div>
        <ul>
          {#each TEXT.release.keepItems(s.skill.level, node.name, s.traitsFound.length) as k (k)}<li>{k}</li>{/each}
        </ul>
      </div>
      <div>
        <div class="muted small">{TEXT.release.reset}</div>
        <ul>
          {#each TEXT.release.resetItems as k (k)}<li>{k}</li>{/each}
        </ul>
      </div>
    </div>
    <div class="muted small">{TEXT.release.gain}: {TEXT.release.gainItem}</div>
    <div class="compare">
      <div class="opt now">
        <div class="muted small">{TEXT.release.now}</div>
        <div class="big">{fmt(now.biomassPerSec)}/s</div>
        <div class="small">{lava(now)}% · {now.fit.lava}</div>
      </div>
      <div class="opt">
        <div class="muted small">{TEXT.release.plusOne}</div>
        {#if plus}
          <div class="big">{fmt(plus.biomassPerSec)}/s</div>
          <div class="small">
            {lava(plus)}% · {plus.fit.lava}
            {#if now.biomassPerSec > 0}<span class="up">+{Math.round((plus.biomassPerSec / now.biomassPerSec - 1) * 100)}%</span>{/if}
          </div>
        {:else}
          <div class="big muted">…</div>
        {/if}
      </div>
    </div>
    <div class="buttons">
      <button onclick={onClose}>{TEXT.release.wait}</button>
      <button class="primary" onclick={go}>{TEXT.release.releaseNow}</button>
    </div>
  </div>
</Modal>

<style>
  .cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  ul {
    margin: 4px 0 10px;
    padding-left: 18px;
  }
  .small {
    font-size: 12px;
  }
  .compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 10px 0;
  }
  .opt {
    background: var(--panel-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 8px 10px;
  }
  .opt.now {
    border-color: var(--accent);
  }
  .big {
    font-size: 22px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .up {
    color: var(--accent-2);
    margin-left: 4px;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
