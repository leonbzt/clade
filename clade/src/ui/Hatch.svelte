<!-- N3 E: after a Life. The eggs lie face down; tap to open, tap again to pick; hatch the pick or keep the parent.
     Then the line's XP bar fills and Back to the map. Adapted from game/src/ui/Hatch.svelte. -->
<script lang="ts">
  import { ADOPT_EGGS } from '../data/economy';
  import { PARTS } from '../data/parts';
  import type { Card } from '../sim/clutch';
  import { levelOf } from '../sim/line';
  import type { World } from '../sim/records';
  import type { Colonisation } from './life/colonise';
  import type { clutchOf } from './life/hatching';
  import XpBar from './XpBar.svelte';

  let { session, world, clutch, settle, back }: {
    session: Colonisation; world: World; clutch: NonNullable<ReturnType<typeof clutchOf>>;
    settle: (card: Card | null) => void; back: () => void;
  } = $props();

  const KIND = { gain: 'Gain', swap: 'Swap', lose: 'Lose' };
  const PLACE = { front: 'front', eyes: 'eyes', limbs: 'limbs', sides: 'sides', back: 'back', tail: 'tail' };
  let open = $state(clutch.offers.map(() => false)), chosen = $state(-1);
  let level = $state(0), done = $state(false);
  const report = $derived(session.report), gain = $derived(session.gain);
  const heir = $derived(world.species.find((s) => s.id === session.heir));
  const points = $derived(gain ? Math.max(0, level - levelOf(gain.from)) : 0);
  const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

  function tap(i: number) {
    if (!open[i]) { open[i] = true; if (chosen < 0) chosen = i; return; }
    chosen = i;
  }
</script>

<div class="shade">
  <div class="hatch" role="dialog" aria-modal="true" aria-labelledby="hatch-title" tabindex="-1">
    <h2 id="hatch-title">{session.life.cause === 'season' ? 'The season ends' : `You died on turn ${session.life.turn}`}</h2>
    {#if !report}
      <p>{clutch.eggs} egg{clutch.eggs === 1 ? '' : 's'} · your Life made tier {clutch.letter} here.</p>
      <p class="dim">Open the eggs. Hatch one, or keep the parent.</p>
      <div class="eggs">
        {#each clutch.offers as o, i}
          {@const part = PARTS[o.card.part]}
          <button class="egg" class:open={open[i]} class:chosen={chosen === i} aria-pressed={chosen === i} onclick={() => tap(i)}>
            {#if !open[i]}
              <span class="shell"></span><span>Egg {i + 1} · tap to open</span>
            {:else}
              <b class="letter" aria-label="tier {o.letter} here">{o.letter}</b>
              <span class="face">
                <b>{KIND[o.card.kind]} · {PLACE[o.card.place]}: {part.name}</b>
                <span class="dim">{o.card.kind === 'lose' ? `Loses: ${part.does}` : part.does}</span>
                <span class="dim">Upkeep {signed(o.upkeep)}{o.replaces ? ` · replaces ${o.replaces}` : ''}</span>
              </span>
            {/if}
          </button>
        {/each}
      </div>
      <div class="actions">
        <button class="go" disabled={chosen < 0 || !open[chosen]} onclick={() => settle(clutch.offers[chosen].card)}>
          {chosen >= 0 ? 'Hatch this one' : 'Open one, then pick'}</button>
        <button onclick={() => settle(null)}>Keep the parent</button>
      </div>
    {:else}
      {#if session.adopt}<p class="heir">{session.adopted ? `${session.species.name} joins your line` : `${clutch.eggs} egg${clutch.eggs === 1 ? '' : 's'}: too few to adopt (${ADOPT_EGGS} needed). They hatch wild.`}</p>{/if}
      {#if heir}<p class="heir">{heir.id === session.species.id ? `${heir.name}: the parent form stays` : `${heir.name} hatches`}</p>{/if}
      <p>{report.text}</p>
      {#if report.fit}<ul>{#each report.fit.reasons as reason}<li>{reason}</li>{/each}</ul>{/if}
      {#if gain}
        <p>+{gain.to - gain.from} XP for the line{#if points} · <b class="gold">+{points} point{points === 1 ? '' : 's'}</b>{/if}</p>
        <XpBar from={gain.from} to={gain.to} bind:level bind:done />
      {/if}
      <div class="actions"><button onclick={back}>Back to the map</button></div>
    {/if}
  </div>
</div>

<style>
  .shade { position: absolute; inset: 0; display: grid; place-items: center; grid-template-columns: minmax(0, 1fr); padding: 12px; box-sizing: border-box; background: var(--line); opacity: 0.98; overflow: auto; z-index: 5; }
  .hatch { background: var(--panel); border: 2px solid var(--paper); padding: 16px; width: 100%; max-width: 440px; min-width: 0; box-sizing: border-box; display: grid; gap: 10px; }
  h2 { font-size: 16px; margin: 0; }
  p { margin: 0; }
  ul { padding-left: 20px; margin: 0; }
  li { margin-bottom: 4px; color: var(--dim); }
  .dim { color: var(--dim); }
  .gold, .heir { color: var(--gold); }
  .heir { font-weight: 700; }
  .eggs { display: grid; gap: 8px; }
  .egg { display: flex; gap: 10px; align-items: center; text-align: left; min-height: 56px; background: var(--ink); }
  .egg.open { align-items: flex-start; }
  .egg.chosen { border-color: var(--gold); }
  .shell { width: 18px; height: 24px; border-radius: 50%; background: var(--paper); flex: none; }
  .face { display: grid; gap: 2px; min-width: 0; }
  .letter { font-size: 32px; line-height: 1; min-width: 24px; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .go:disabled { opacity: 0.5; cursor: default; }
</style>
