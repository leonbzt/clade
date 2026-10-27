<script lang="ts">
  import { FIELDS, LAYER_IDS, STRATUM_NAMES, type LayerId } from '../data/fields';
  import { SPECIES, SPECIES_INDEX, type Scalar } from '../data/species';
  import { coverCount, foundingCost, unlockedSpecies } from '../sim/commands';
  import { profile } from '../sim/fit';
  import { limitShare } from '../sim/metrics';
  import Specimen from './Specimen.svelte';
  import { doBuy, game, startPlacing, ui } from './game.svelte';
  import { fmt } from './format';

  const STATS: [Scalar, string, (v: number) => string][] = [
    ['seeds', 'Spreads', (v) => `${v.toFixed(2)}/s`],
    ['hold', 'Holds ground', (v) => v.toFixed(2)],
    ['yield', 'Yield', (v) => `${v.toFixed(2)}/s`],
    ['life', 'Lifespan', (v) => `${Math.round(v)} s`],
  ];

  const list = $derived.by(() => {
    ui.v;
    const open = unlockedSpecies(game);
    return SPECIES.filter((s) => open.includes(s.id)).map((s) => ({
      id: s.id, name: s.name, tiles: coverCount(game, s.id), cost: foundingCost(game, s.id), traits: [...game.traits[s.id]],
    }));
  });

  /** A band on a 0–1 axis: the survivable range light, the ideal range solid (in % of the bar). */
  const clip = (v: number) => Math.max(0, Math.min(1, v)) * 100;

  const card = $derived.by(() => {
    ui.v;
    const def = SPECIES[SPECIES_INDEX[ui.focus]];
    if (!list.some((s) => s.id === def.id)) return null;
    const p = profile(game, SPECIES_INDEX[def.id]);
    const share = limitShare(game, p), total = share.reduce((a, b) => a + b, 0);
    const limits = share.map((c, j) => ({ name: j < LAYER_IDS.length ? FIELDS[LAYER_IDS[j]].name.toLowerCase() : 'nothing', pct: total ? Math.round((100 * c) / total) : 0 }))
      .filter((x) => x.pct > 0).sort((a, b) => b.pct - a.pct);
    return {
      def, owned: [...game.traits[def.id]], biomass: game.biomass, stratum: STRATUM_NAMES[def.stratum], limits,
      needs: p.needs.map((n) => {
        const id = LAYER_IDS[n.layer], b = n.band;
        return { id, name: FIELDS[id].name, color: FIELDS[id].color, lo: clip(b[0]), a: clip(b[1]), z: clip(b[2]), hi: clip(b[3]),
          text: `ideal ${b[1] < 0 ? 0 : b[1]}–${b[2] > 1 ? 1 : b[2]}`, why: p.parts[`need:${id}`].join('\n') || 'base' };
      }),
      makes: (Object.entries(p.makes) as [LayerId, number][]).map(([id, r]) => ({
        text: FIELDS[id].kind === 'level' ? `${FIELDS[id].name.toLowerCase()} +${r}` : r > 0 ? `${FIELDS[id].name.toLowerCase()} +${r}/s` : `uses ${FIELDS[id].name.toLowerCase()} ${-r}/s`,
        color: FIELDS[id].color, why: p.parts[`make:${id}`].join('\n'),
      })),
      stats: STATS.map(([k, label, show]) => ({ label, value: show(p.stats[k]), why: p.parts[k].join('\n') })),
    };
  });
</script>

<div class="list">
  {#each list as s (s.id)}
    <div class="row" class:on={ui.focus === s.id} onclick={() => (ui.focus = s.id)} role="button" tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && (ui.focus = s.id)}>
      <Specimen species={s.id} traits={s.traits} scale={1} size={40} />
      <div class="name"><b>{s.name}</b><span class="dim">{s.tiles} tiles</span></div>
      <button class:on={ui.placing === s.id} onclick={(e) => { e.stopPropagation(); startPlacing(s.id); }}>
        Found {s.cost ? fmt(s.cost) : 'free'}
      </button>
    </div>
  {/each}
</div>

{#if card}
  <div class="card">
    <h2>{card.def.name} <span class="dim small">{card.stratum}</span></h2>
    <div class="top">
      <Specimen species={card.def.id} traits={card.owned} scale={3} />
      <p class="dim">{card.def.blurb}</p>
    </div>
    <h3>Needs <span class="dim small">(solid = ideal, light = can live)</span></h3>
    {#each card.needs as n (n.id)}
      <div class="need" title={n.why}>
        <span class="label">{n.name}</span>
        <span class="bar">
          <span class="band" style:left="{n.lo}%" style:width="{n.hi - n.lo}%" style:background={n.color}></span>
          <span class="ideal" style:left="{n.a}%" style:width="{Math.max(1, n.z - n.a)}%" style:background={n.color}></span>
        </span>
        <span class="dim small">{n.text}</span>
      </div>
    {/each}
    <h3>Makes</h3>
    <div class="makes">
      {#each card.makes as m (m.text)}<span title={m.why}><span class="swatch" style:background={m.color}></span>{m.text}</span>{/each}
    </div>
    {#if card.limits.length}
      <h3>Its tiles are held back by</h3>
      <div class="makes">{#each card.limits as l (l.name)}<span>{l.name} {l.pct}%</span>{/each}</div>
    {/if}
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
  .need { display: grid; grid-template-columns: 70px 1fr 90px; gap: 6px; align-items: center; cursor: help; }
  .bar { position: relative; height: 10px; background: var(--ink); border: 1px solid var(--edge); }
  .band { position: absolute; top: 0; bottom: 0; opacity: 0.35; }
  .ideal { position: absolute; top: 0; bottom: 0; }
  .makes { display: flex; gap: 10px; flex-wrap: wrap; font-size: 15px; }
  .makes span { cursor: help; }
  .swatch { display: inline-block; width: 10px; height: 10px; margin-right: 4px; border: 1px solid var(--ink); }
  .stat { display: flex; justify-content: space-between; padding: 1px 0; cursor: help; }
  .trait { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px; margin: 4px 0;
    background: var(--panel-dark); border: 2px solid var(--ink); }
  .trait.owned { border-color: var(--gold); }
  .small { font-size: 13px; }
</style>
