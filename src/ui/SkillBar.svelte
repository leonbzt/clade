<script lang="ts">
  import { store } from './game.svelte';
  import { nextLevelXp } from '../core/progress';
  import { TEXT } from '../data/text';

  const skill = $derived(store.s.skill);
  const next = $derived(nextLevelXp(skill.level));
  const prev = $derived(skill.level > 1 ? (nextLevelXp(skill.level - 1) ?? 0) : 0);
  const pct = $derived(next === null ? 100 : ((skill.xp - prev) / (next - prev)) * 100);
</script>

<div class="card skill">
  <div class="head">
    <b>{TEXT.skill.name}</b>
    <span class="muted">{TEXT.skill.level(skill.level)}{next === null ? ` (${TEXT.skill.max})` : ''}</span>
  </div>
  <div class="track"><div class="fill" style="width: {pct}%"></div></div>
</div>

<style>
  .skill {
    padding: 10px 12px;
  }
  .head {
    display: flex;
    justify-content: space-between;
  }
  .track {
    height: 6px;
    background: var(--panel-2);
    border-radius: 3px;
    margin-top: 6px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: #d9c45a;
    transition: width 0.2s linear;
  }
</style>
