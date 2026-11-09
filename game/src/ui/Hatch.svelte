<!-- Slice 21B: after a Life. Hatching (it replaces the 12 clutch screen): the eggs open into found genes; the one you
     keep shows on the new species' slots as old → new, and names it. Then the line's XP bar fills, level by level,
     with its unlocks, and any recipe met draws the new form. -->
<script lang="ts">
  import { HABITATS } from '../data/habitats';
  import { LINEAGES } from '../data/lineages';
  import { PARTS, PLANS, VERBS } from '../data/life';
  import { PLACE_NAMES } from '../data/body';
  import { defaultBuild, homesOf } from '../sim/body';
  import { nextSpeciesName, speciesOf } from '../sim/lineage';
  import { places } from './equip';
  import { aAn, afterLines, asBuild, levelLines, slotUpkeep } from './line';
  import { ctx, ui } from './meta.svelte';
  import Creature from './Creature.svelte';
  import Slots from './Slots.svelte';
  import XpBar from './XpBar.svelte';

  const RARITY = { common: 'Common', rare: 'Rare', epic: 'Epic' };
  let open: boolean[] = $state([]), hatching = $state(-1), chosen = $state(-1);
  $effect(() => { if (ui.clutch) { open = ui.clutch.cards.map((k) => !!k.passed); chosen = ui.clutch.cards.findIndex((k) => k.passed); hatching = -1; } });
  const c = $derived(ui.clutch);
  const line = $derived(c ? ctx.save.lines[c.plan] : undefined);
  const known = $derived(line?.parts ?? []);
  const kept = $derived(c && chosen >= 0 && open[chosen] ? c.cards[chosen].part : null);
  const before = $derived(c?.build && line ? speciesOf(line, c.build, null, c.growth) : null);
  const after = $derived(c?.build && line && kept ? speciesOf(line, c.build, kept, c.growth) : null);
  const shown = $derived(c && before ? asBuild(c.plan, before.rows, line?.ranks) : null);
  const change = $derived(after?.place ? { place: after.place, row: after.rows[after.place]! } : null);
  const name = $derived(c && line ? nextSpeciesName(c.plan, line, kept) : '');

  function tap(k: number) {
    if (hatching >= 0) return;
    if (open[k]) { chosen = k; return; }
    hatching = k;
    setTimeout(() => { open[k] = true; hatching = -1; if (open.filter(Boolean).length === 1) chosen = k; }, 420);
  }
  function hatchAll() { open = open.map(() => true); if (chosen < 0) chosen = 0; }

  // ---- the gain ----
  const g = $derived(ui.gain);
  let level = $state(0), done = $state(false);
  const levels = $derived(g ? levelLines(g).filter((l) => l.at <= level) : []);
</script>

{#if c}
<div class="metaWrap afterWrap"><div class="panel habCard after">
  <h2>Hatching</h2>
  <p class="pitch">{c.eggs} eggs settle in the {HABITATS[ctx.save.sea.patches[c.place ?? c.patch].ground].name.toLowerCase()}, patch {(c.place ?? c.patch) + 1}. Your Life reached tier {c.tier}. {c.cards.length} hatch where you can see them. Keep one gene: it joins your line's parts and makes a new species of the body you started as.</p>
  <div class="grid">
    {#if shown && before}
      <Creature build={after ? asBuild(c.plan, after.rows, line?.ranks) : shown} mark={after?.place ?? null} height={300}>
        <Slots rows={before.rows} views={places(c.plan, shown)} {change} upkeep={slotUpkeep(shown)} />
      </Creature>
    {/if}
    <div class="side">
      <p class="species"><b>{name}</b>{#if kept && after && !after.place}<small> · {PARTS[kept].name} has no free place on the starting body: it joins the parts, not the species</small>{/if}</p>
      <div class="eggRow">
        {#each c.cards as card, k}
          {@const isNew = !known.includes(card.part)}
          <button class="egg {open[k] ? 'open ' + card.rarity : ''}" class:shake={hatching === k} class:chosen={chosen === k} class:fresh={open[k] && isNew} onclick={() => tap(k)}>
            {#if !open[k]}
              <span class="shell"></span><small>Tap to hatch</small>
            {:else}
              {#if isNew}<span class="newTag">New</span>{/if}
              <em>{card.passed ? 'Passed on' : RARITY[card.rarity]}</em><b>{PARTS[card.part].name}</b><small>{PARTS[card.part].does}</small>
              {#if PARTS[card.part].verb}<small class="gives">Gives {VERBS[PARTS[card.part].verb!].name}</small>{/if}
              <small class="gives">{homesOf(c.plan, card.part).map((p) => PLACE_NAMES[p]).join(' or ')}</small>
            {/if}
          </button>
        {/each}
      </div>
      {#if open.some((o) => !o)}<button class="small" onclick={hatchAll}>Hatch them all</button>{/if}
      <button class="go" disabled={!kept} onclick={() => ctx.keep(chosen)}>{kept ? `Keep ${PARTS[kept].name}` : 'Hatch one, then pick'}</button>
      <button class="small" onclick={() => ctx.keep(-1)}>Keep none</button>
    </div>
  </div>
</div></div>
{:else if g}
<div class="metaWrap afterWrap"><div class="panel habCard after gain">
  <h2>{LINEAGES[g.plan].name} line</h2>
  <p class="pitch">+{g.xp} XP from this Life.</p>
  <XpBar from={g.xpFrom} to={g.xpFrom + g.xp} bind:level bind:done />
  <ul class="news">
    {#each levels as l (l.at)}<li class="yours">{l.text}</li>{/each}
    {#if done}{#each afterLines(g) as t}<li>{t}</li>{/each}{/if}
  </ul>
  {#if done}
    {#each g.opened as id}
      <h3 class="formed">Your form became {aAn(PLANS[id].name)} {PLANS[id].name.toLowerCase()}!</h3>
      <Creature build={defaultBuild(id)} height={220} />
      <p class="note">A new lineage: {LINEAGES[id].name}, ending in {LINEAGES[id].endPoint}. Live as it from any eligible patch.</p>
    {/each}
  {/if}
  <button class="go" onclick={() => ctx.continueGain()}>To the sea</button>
</div></div>
{/if}

<style>
  .afterWrap { position: fixed; inset: 0; z-index: 30; overflow: auto; place-items: start center; }
  .after { max-width: 860px; width: min(860px, 96vw); box-sizing: border-box; }
  .gain { max-width: 560px; }
  .grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
  .side { display: grid; gap: 8px; min-width: 0; }
  .species { margin: 0; } .species b { color: var(--gold); text-shadow: var(--outline); }
  .species small { color: var(--dim); font-size: 16px; }
  .egg { position: relative; }
  .egg.fresh { outline: 3px solid var(--good); outline-offset: -6px; }
  .newTag { position: absolute; top: 4px; right: 6px; color: var(--good); font-weight: 700; text-shadow: var(--outline); }
  .formed { color: var(--gold) !important; font-size: 16px; }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
</style>
