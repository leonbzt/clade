<script lang="ts">
  import { SPECIES, SPECIES_INDEX, type StatKey } from '../data/species';
  import { coverCount, foundingCost, unlockedSpecies } from '../sim/commands';
  import { statLines } from '../sim/stats';
  import Specimen from './Specimen.svelte';
  import { doBuy, game, startPlacing, ui } from './game.svelte';
  import { fmt } from './format';

  const STAT_LABELS: [StatKey, string, (v: number) => string][] = [
    ['spread', 'Spread', (v) => `${(v * 100).toFixed(1)}%/tick`],
    ['vigor', 'Holds ground', (v) => v.toFixed(2)],
    ['yield', 'Yield', (v) => v.toFixed(2)],
    ['soilBuild', 'Builds soil', (v) => (v * 1000).toFixed(2)],
    ['moistMin', 'Needs moisture', (v) => `≥ ${v.toFixed(2)}`],
    ['soilMin', 'Needs soil', (v) => `≥ ${v.toFixed(1)}`],
  ];

  const list = $derived.by(() => {
    ui.v;
    const open = unlockedSpecies(game);
    return SPECIES.filter((s) => s.wild || open.includes(s.id)).map((s) => ({
      id: s.id, name: s.name, wild: !!s.wild, tiles: coverCount(game, s.id),
      cost: s.wild ? 0 : foundingCost(game, s.id), traits: [...game.traits[s.id]],
    }));
  });

  const card = $derived.by(() => {
    ui.v;
    const def = SPECIES[SPECIES_INDEX[ui.focus]];
    if (!list.some((s) => s.id === def.id)) return null;
    const lines = statLines(game, SPECIES_INDEX[def.id]);
    return {
      def, owned: [...game.traits[def.id]], biomass: game.biomass,
      stats: STAT_LABELS.map(([k, label, show]) => ({ label, value: show(lines[k].value), why: lines[k].parts.join('\n') })),
    };
  });
</script>

<div class="list">
  {#each list as s (s.id)}
    <div class="row" class:on={ui.focus === s.id} onclick={() => (ui.focus = s.id)} role="button" tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && (ui.focus = s.id)}>
      <Specimen species={s.id} traits={s.traits} scale={1} size={40} />
      <div class="name">
        <b>{s.name}</b>
        <span class="dim">{s.wild ? 'wild · ' : ''}{s.tiles} tiles</span>
      </div>
      {#if !s.wild}
        <button class:on={ui.placing === s.id} onclick={(e) => { e.stopPropagation(); startPlacing(s.id); }}>
          Found {s.cost ? fmt(s.cost) : 'free'}
        </button>
      {/if}
    </div>
  {/each}
</div>

{#if card}
  <div class="card">
    <h2>{card.def.name}</h2>
    <div class="top">
      <Specimen species={card.def.id} traits={card.owned} scale={3} />
      <p class="dim">{card.def.blurb}</p>
    </div>
    <h3>Stats <span class="dim small">(hover for why)</span></h3>
    {#each card.stats as st (st.label)}
      <div class="stat" title={st.why}><span>{st.label}</span><span>{st.value}</span></div>
    {/each}
    {#if card.def.traits.length}
      <h3>Traits</h3>
      {#each card.def.traits as t (t.id)}
        {@const owned = card.owned.includes(t.id)}
        <div class="trait" class:owned>
          <div><b>{t.name}</b><br /><span class="good">+ {t.up}</span><br /><span class="bad">− {t.down}</span></div>
          {#if owned}<span class="gold">Common</span>
          {:else}<button disabled={card.biomass < t.cost} onclick={() => doBuy(card.def.id, t.id)}>{fmt(t.cost)}</button>{/if}
        </div>
      {/each}
    {/if}
  </div>
{/if}

<style>
  .list { display: flex; flex-direction: column; gap: 4px; }
  .row { display: flex; gap: 10px; align-items: center; padding: 4px; border: 2px solid transparent; cursor: pointer; }
  .row.on { border-color: var(--edge); background: var(--panel-dark); }
  .name { flex: 1; display: flex; flex-direction: column; }
  .card { margin-top: 12px; border-top: 2px solid var(--ink); padding-top: 8px; }
  .top { display: flex; gap: 10px; align-items: flex-start; }
  .top p { margin: 0; }
  .stat { display: flex; justify-content: space-between; padding: 1px 0; cursor: help; }
  .trait { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px; margin: 4px 0;
    background: var(--panel-dark); border: 2px solid var(--ink); }
  .trait.owned { border-color: var(--gold); }
  .small { font-size: 13px; }
</style>
