<script lang="ts">
  import { store } from './game.svelte';
  import { currentGoal } from '../core/actions';
  import { coveredCount, waterFraction } from '../core/colony';
  import { gardenIncome } from '../core/garden';
  import { modifiers } from '../core/modifiers';
  import { TEXT } from '../data/text';
  import { fmt } from './format';

  const s = $derived(store.s);
  const c = $derived(s.colony);
  const goal = $derived(currentGoal(s));
  const water = $derived(c ? Math.round(waterFraction(c, modifiers(s)) * 100) : 0);
  const income = $derived(gardenIncome(s.garden));
  const warnIn = $derived(c && c.weather.state === 'warning' ? Math.ceil(c.weather.nextSpellAt - c.age) : 0);
  const weather = $derived(c?.weather.state ?? 'calm');
</script>

<header class="bar">
  <div class="goal">
    {#if goal}<span class="muted">{TEXT.bar.goal}</span> {goal.text}{/if}
  </div>
  <div class="stats">
    {#if c}
      <span title={TEXT.bar.cover}>⬡ {coveredCount(c)}</span>
      <span title={TEXT.bar.water}>💧 {water}%</span>
    {/if}
    {#if c || s.genes > 0}
      <span title={TEXT.bar.genes}>🧬 {Math.floor(s.genes)}</span>
    {/if}
    {#if s.garden.species.length > 0}
      <span class="biomass" title={TEXT.bar.biomass}>
        🌿 {fmt(s.garden.biomass)} <span class="muted">+{fmt(income)}{TEXT.bar.perSec}</span>
      </span>
    {/if}
  </div>
  {#if weather === 'warning'}
    <div class="weather warning">{TEXT.weather.warning(warnIn)}</div>
  {:else if weather === 'dry'}
    <div class="weather dry">{TEXT.weather.dry}</div>
  {:else if weather === 'rain'}
    <div class="weather rain">{TEXT.weather.rain}</div>
  {/if}
</header>

<style>
  .bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--line);
    background: var(--panel);
    flex-wrap: wrap;
    min-height: 44px;
  }
  .goal {
    flex: 1;
    font-weight: 600;
    min-width: 180px;
  }
  .stats {
    display: flex;
    gap: 14px;
    font-variant-numeric: tabular-nums;
  }
  .biomass {
    color: var(--accent-2);
  }
  .weather {
    padding: 2px 10px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 13px;
  }
  .warning {
    background: #4a3a17;
    color: var(--warn);
    animation: pulse 1s ease-in-out infinite;
  }
  .dry {
    background: #4a3317;
    color: #e0a050;
  }
  .rain {
    background: #1f3346;
    color: #9cc2e2;
  }
  @keyframes pulse {
    50% {
      opacity: 0.6;
    }
  }
</style>
