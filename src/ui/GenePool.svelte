<script lang="ts">
  import { store, act } from './game.svelte';
  import { favour, pass } from '../core/actions';
  import { autoGenerations, favourCost, generationTime, keyInnovationUnlocked } from '../core/genepool';
  import { isCommon } from '../core/modifiers';
  import { NUMBERS } from '../data/numbers';
  import { TEXT } from '../data/text';
  import { TRAITS, TRAIT_BY_ID } from '../data/traits';

  const s = $derived(store.s);
  const pool = $derived(s.genePool);
  const offer = $derived(pool.offers[0] ?? null);
  const cost = $derived(favourCost(s));
  const auto = $derived(autoGenerations(s));
  const left = $derived(Math.ceil(generationTime(s) - pool.timer));
  const waiting = $derived(!auto && pool.offers.length > 0);
  const full = $derived(auto && pool.offers.length >= NUMBERS.generation.queueMax);
  const visible = $derived(TRAITS.filter((t) => !t.keyInnovation || keyInnovationUnlocked(s) || pool.freq[t.id] >= NUMBERS.generation.commonAt));
  const gain = NUMBERS.generation.favourGain;
  const pct = (f: number) => Math.round(f * 100);
</script>

<div class="card">
  <h3>{TEXT.genePool.title} · {TEXT.genePool.generation(pool.generation)}</h3>
  <div class="timer muted">
    {#if waiting}{TEXT.genePool.waiting}
    {:else if full}{TEXT.genePool.queueFull}
    {:else}{TEXT.genePool.next(left)}{/if}
    {#if pool.offers.length > 1}<span class="queued">{TEXT.genePool.queued(pool.offers.length)}</span>{/if}
  </div>

  {#if offer}
    {#key offer.id}
      <div class="offer">
        {#each offer.variants as id (id)}
          {@const t = TRAIT_BY_ID[id]}
          {@const f = pool.freq[id]}
          <div class="variant" class:key={t.keyInnovation}>
            <div class="vname">{TEXT.genePool.variant(t.variant)}</div>
            <div class="muted small">{t.name}: {pct(f)}% → {pct(Math.min(1, f + gain))}%{isCommon(f + gain) && !isCommon(f) ? ` (${TEXT.genePool.common})` : ''}</div>
            <div class="small effect">{t.effect}</div>
            <button class="primary" disabled={s.genes < cost} onclick={() => act((g) => favour(g, offer.id, id))}>
              {TEXT.genePool.favour(cost)}
            </button>
          </div>
        {/each}
      </div>
      <button class="pass" onclick={() => act((g) => pass(g, offer.id))}>{TEXT.genePool.pass}</button>
    {/key}
  {/if}

  <div class="freqs">
    {#each visible as t (t.id)}
      {@const f = pool.freq[t.id]}
      <div class="freq" class:common={isCommon(f)}>
        <span class="tname">{t.name}{t.precursor ? ' ◆' : ''}</span>
        <div class="track">
          <div class="mark" style="left: {NUMBERS.generation.commonAt * 100}%"></div>
          <div class="fill" style="width: {f * 100}%"></div>
        </div>
        <span class="num">{pct(f)}%</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .timer {
    font-size: 12px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }
  .queued {
    color: var(--warn);
  }
  .offer {
    display: grid;
    gap: 8px;
    animation: slide 0.35s ease-out;
  }
  .variant {
    background: var(--panel-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 8px 10px;
  }
  .variant.key {
    border-color: var(--gold);
    box-shadow: 0 0 12px rgba(224, 184, 74, 0.25);
  }
  .vname {
    font-weight: 600;
  }
  .small {
    font-size: 12px;
  }
  .effect {
    margin: 2px 0 6px;
  }
  .pass {
    margin-top: 6px;
    font-size: 12px;
    padding: 3px 10px;
  }
  .freqs {
    margin-top: 12px;
    display: grid;
    gap: 4px;
  }
  .freq {
    display: grid;
    grid-template-columns: 140px 1fr 36px;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }
  .freq.common .tname {
    color: var(--accent-2);
  }
  .track {
    position: relative;
    height: 6px;
    background: var(--panel-2);
    border-radius: 3px;
  }
  .fill {
    height: 100%;
    border-radius: 3px;
    background: #7f8a76;
    transition: width 0.6s ease-out;
  }
  .common .fill {
    background: var(--accent);
  }
  .mark {
    position: absolute;
    top: -2px;
    bottom: -2px;
    width: 1px;
    background: var(--muted);
  }
  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  @keyframes slide {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }
</style>
