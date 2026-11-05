<!-- Open your clutch (slice 12): eggs lie face down; tap to hatch each; keep one form for your line in this niche. -->
<script lang="ts">
  import { ROLES } from '../data/garden';
  import { HABITATS } from '../data/habitats';
  import { PARTS, VERBS } from '../data/life';
  import { ctx, ui } from './meta.svelte';

  const RARITY = { common: 'Common', rare: 'Rare', epic: 'Epic' };
  let open: boolean[] = $state([]), hatching = $state(-1), chosen = $state(-1);
  $effect(() => { if (ui.clutch) { open = ui.clutch.cards.map((k) => !!k.passed); chosen = ui.clutch.cards.findIndex((k) => k.passed); hatching = -1; } });
  const c = $derived(ui.clutch);
  const current = $derived(c ? ctx.save.forms[`${c.hab}:${c.role}`] : undefined);

  function tap(k: number) {
    if (hatching >= 0) return;
    if (open[k]) { chosen = k; return; }
    hatching = k;
    setTimeout(() => { open[k] = true; hatching = -1; if (open.filter(Boolean).length === 1) chosen = k; }, 420);
  }
  function hatchAll() { open = open.map(() => true); if (chosen < 0) chosen = 0; }
</script>

{#if c}
<div class="metaWrap">
  <div class="panel habCard clutch">
    <h2>Open your clutch</h2>
    <p class="pitch">{c.eggs} eggs in the {HABITATS[c.hab].name.toLowerCase()}, tier {c.tier}. {c.cards.length} hatch where you can see them: keep one form for your {ROLES[c.role].name} line here. Later Lives in this niche can start with its part; it holds that slot on the body.</p>
    <div class="eggRow">
      {#each c.cards as card, k}
        <button class="egg {open[k] ? 'open ' + card.rarity : ''}" class:shake={hatching === k} class:chosen={chosen === k} onclick={() => tap(k)}>
          {#if !open[k]}
            <span class="shell"></span><small>Tap to hatch</small>
          {:else}
            <em>{card.passed ? 'Passed on' : RARITY[card.rarity]}</em><b>{PARTS[card.part].name}</b><small>{PARTS[card.part].does}</small>
            {#if PARTS[card.part].verb}<small class="gives">Gives {VERBS[PARTS[card.part].verb!].name}</small>{/if}
            <small class="gives">{PARTS[card.part].slots.join(' or ')} slot</small>
          {/if}
        </button>
      {/each}
    </div>
    {#if open.some((o) => !o)}<button class="small" onclick={hatchAll}>Hatch them all</button>{/if}
    {#if current && chosen >= 0}<p class="note">Replaces your form here: {PARTS[current].name}.</p>{/if}
    <button class="go" disabled={chosen < 0 || !open[chosen]} onclick={() => ctx.keep(chosen)}>{chosen >= 0 && open[chosen] ? `Keep: ${PARTS[c.cards[chosen].part].name}` : 'Hatch one, then pick'}</button>
    <button class="small" onclick={() => ctx.keep(-1)}>{current ? `Stay with ${PARTS[current].name}` : 'Keep no form'}</button>
  </div>
</div>
{/if}
