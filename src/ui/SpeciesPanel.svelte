<script lang="ts">
  // Your species, each listed once with its population bar; the focused one opens its variant rows, and its card
  // below: needs, makes, limits and stats of its base form, its trait genes and the combos. Hovering a bar segment
  // or a variant row lights its tiles up on the map. The lineage and clades live on the tree screen.
  import { FIELDS, LAYER_IDS, LIMIT_COUNT, STATUS_IDS, STATUSES, STRATUM_NAMES, limitName, type LayerId } from '../data/fields';
  import { COMBOS, TIER } from '../data/genes';
  import { type Scalar } from '../data/species';
  import type { BodyStat, Food } from '../data/animals';
  import { coverCount, foundingCost, unlockedSpecies } from '../sim/commands';
  import { buildProfile, profiles } from '../sim/fit';
  import { limitShare } from '../sim/metrics';
  import { defOf, glints, poolOf, speciesIndex } from '../sim/variants';
  import { speciesLook } from '../view/look';
  import Specimen from './Specimen.svelte';
  import PopBar from './PopBar.svelte';
  import VariantRow from './VariantRow.svelte';
  import { game, seeVariants, startPlacing, ui } from './game.svelte';
  import { fmt } from './format';

  const STATS: [Scalar, string, (v: number) => string][] = [
    ['seeds', 'Spreads', (v) => `${v.toFixed(2)}/s`],
    ['hold', 'Holds ground', (v) => v.toFixed(2)],
    ['yield', 'Yield', (v) => `${v.toFixed(2)}/s`],
    ['life', 'Lifespan', (v) => `${Math.round(v)} s`],
    ['reserve', 'Reserves', (v) => `${Math.round(v)} s`],
  ];

  const BODY: [BodyStat, string, (v: number) => string][] = [
    ['speed', 'Speed', (v) => `${v.toFixed(2)} tiles/s`],
    ['upkeep', 'Upkeep', (v) => `${(v * 100).toFixed(2)}% energy/s`],
    ['young', 'Young per brood', (v) => v.toFixed(1)],
    ['life', 'Lifespan', (v) => `${Math.round(v)} s`],
    ['escape', 'Easy to catch', (v) => `×${v.toFixed(2)}`],
    ['range', 'Side foods', (v) => `${Math.round(Math.min(1, v) * 100)}%`],
  ];

  /** "grazes ground plants", "eats litter", "hunts tiny-hexapod": a diet line. */
  const foodText = (d: Food) => ('stock' in d ? `eats ${d.stock}` : 'plants' in d ? `grazes ${d.plants === 'under' ? 'fungus threads' : `${d.plants} plants`}` : `hunts ${d.prey.replace('-', ' ')}s`);

  // Variants that were glinting when you opened this tab keep a "new" mark while it stays open.
  const fresh = new Set<number>();

  const depthOf = (sp: number): number => (game.species[sp].parent >= 0 ? 1 + depthOf(game.species[sp].parent) : 0);

  const list = $derived.by(() => {
    ui.v;
    // Lineage order: each species right after the one it was founded from.
    const ids = unlockedSpecies(game), out: string[] = [];
    const walk = (parent: number) => {
      for (const id of ids) { const sp = speciesIndex(game, id); if (game.species[sp].parent === parent && !out.includes(id)) { out.push(id); walk(sp); } }
    };
    walk(-1);
    return out.map((id) => {
      const sp = speciesIndex(game, id), x = game.species[sp];
      const vs = poolOf(game, sp).filter((v) => game.variants[v].shown && game.variants[v].tier !== TIER.base);
      for (const v of vs) if (glints(game.variants[v])) fresh.add(v);
      return { id, sp, name: x.name, animal: !!defOf(game, sp).animal, tiles: coverCount(game, id), cost: foundingCost(game, id), look: speciesLook(game, sp),
        made: x.parent >= 0 ? game.species[x.parent].name : null, depth: depthOf(sp), variants: vs };
    });
  });

  // Seeing a variant in this list counts as looking at it: its glint on the map stops.
  $effect(() => { seeVariants(list.flatMap((s) => s.variants)); });

  /** A band on a 0–1 axis: the survivable range light, the ideal range solid (in % of the bar). */
  const clip = (v: number) => Math.max(0, Math.min(1, v)) * 100;

  const card = $derived.by(() => {
    ui.v;
    const sp = speciesIndex(game, ui.focus);
    if (!list.some((s) => s.sp === sp)) return null;
    const x = game.species[sp], def = defOf(game, sp), p = buildProfile(game, sp, x.genome);
    const share = limitShare(game, profiles(game), sp), total = share.reduce((a, b) => a + b, 0);
    const limits = share.map((c, j) => ({ name: j < LIMIT_COUNT ? limitName(j).toLowerCase() : 'nothing', pct: total ? Math.round((100 * c) / total) : 0 }))
      .filter((l) => l.pct > 0).sort((a, b) => b.pct - a.pct);
    const pool = poolOf(game, sp).filter((v) => game.variants[v].shown);
    const animal = def.animal;
    return {
      name: x.name, def, look: speciesLook(game, sp), stratum: animal ? 'Animal' : STRATUM_NAMES[def.stratum], limits: animal ? [] : limits, animal: !!animal,
      diet: animal ? animal.diet.map((d, k) => `${foodText(d)}${k ? ' (side food)' : ''}`) : [],
      dung: animal ? Object.keys(animal.makes).join(', ') : '',
      needs: p.needs.map((n) => {
        const id = LAYER_IDS[n.layer], b = n.band;
        return { id, name: FIELDS[id].name, color: FIELDS[id].color, lo: clip(b[0]), a: clip(b[1]), z: clip(b[2]), hi: clip(b[3]),
          text: `ideal ${b[1] < 0 ? 0 : +b[1].toFixed(2)}–${b[2] > 1 ? 1 : +b[2].toFixed(2)}`, why: p.parts[`need:${id}`].join('\n') || 'base' };
      }),
      tolerance: p.tolerance.map((t) => `${STATUSES[STATUS_IDS[t.status]].name}: keeps ${Math.round(t.tol * 100)}% of its fit`),
      makes: (Object.entries(p.makes) as [LayerId, number][]).map(([id, r]) => ({
        text: FIELDS[id].kind === 'level' ? `${FIELDS[id].name.toLowerCase()} +${+r.toFixed(4)}` : r > 0 ? `${FIELDS[id].name.toLowerCase()} +${+r.toFixed(4)}/s` : `uses ${FIELDS[id].name.toLowerCase()} ${+(-r).toFixed(4)}/s`,
        color: FIELDS[id].color, why: p.parts[`make:${id}`].join('\n'),
      })),
      stats: animal ? BODY.map(([k, label, show]) => ({ label, value: show(p.body[k]!), why: p.parts[`body:${k}`].join('\n') }))
        : STATS.map(([k, label, show]) => ({ label, value: show(p.stats[k]), why: p.parts[k].join('\n') })),
      genes: def.traits.map((t) => ({ ...t, carried: pool.filter((v) => game.variants[v].genome.traits.includes(t.id)).length, inBase: x.genome.traits.includes(t.id) })),
    };
  });
</script>

<p class="small dim">Plants mutate as they spread, animals when they're born. A new form shows once it holds 5 tiles. Combos found: {game.combos.length} / {COMBOS.length}</p>
<div class="list">
  {#each list as s (s.id)}
    <div class="row" class:on={ui.focus === s.id} style:margin-left="{s.depth * 14}px" onclick={() => (ui.focus = s.id)} role="button" tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && (ui.focus = s.id)}>
      <Specimen look={s.look} scale={1} size={40} />
      <div class="name"><b>{s.name}</b><span class="dim">{s.tiles} {s.animal ? 'animals' : 'tiles'} · {s.variants.length} form{s.variants.length === 1 ? '' : 's'}{s.made ? ` · from ${s.made}` : ''}</span>
        {#if s.tiles}<PopBar sp={s.sp} />{/if}</div>
      {#if !s.animal}<button class:on={ui.placing === s.id} onclick={(e) => { e.stopPropagation(); startPlacing(s.id); }}>
        Found {s.cost ? fmt(s.cost) : 'free'}
      </button>{/if}
    </div>
    {#if ui.focus === s.id}
      <div class="forms" role="presentation" onmouseleave={() => (ui.hoverVariant = -1)}>
        {#each s.variants as v (v)}<VariantRow {v} fresh={fresh.has(v)} />{/each}
      </div>
    {/if}
  {/each}
</div>

{#if card}
  <div class="card">
    <h2>{card.name} <span class="dim small">{card.stratum} · base form</span></h2>
    <div class="top">
      <Specimen look={card.look} scale={3} />
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
    {#if card.tolerance.length}
      <div class="makes dim">{#each card.tolerance as t (t)}<span>{t}</span>{/each}</div>
    {/if}
    {#if card.animal}
      <h3>Eats</h3>
      <div class="makes">{#each card.diet as d (d)}<span>{d}</span>{/each}</div>
      <p class="dim small">Its dung goes into the {card.dung}. Click one on the map to follow it.</p>
    {:else}
    <h3>Makes</h3>
    <div class="makes">
      {#each card.makes as m (m.text)}<span title={m.why}><span class="swatch" style:background={m.color}></span>{m.text}</span>{/each}
    </div>
    {/if}
    {#if card.limits.length}
      <h3>Its tiles are held back by</h3>
      <div class="makes">{#each card.limits as l (l.name)}<span>{l.name} {l.pct}%</span>{/each}</div>
    {/if}
    <h3>Stats <span class="dim small">(hover for why)</span></h3>
    {#each card.stats as st (st.label)}
      <div class="stat" title={st.why}><span>{st.label}</span><span>{st.value}</span></div>
    {/each}
    <h3>Trait genes <span class="dim small">(they mutate in by chance)</span></h3>
    {#each card.genes as t (t.id)}
      <div class="trait" class:owned={t.inBase || t.carried}>
        <div><b>{t.name}</b>{#if t.key} <span class="gold small">key innovation</span>{/if}<br /><span class="good">+ {t.up}</span><br /><span class="bad">− {t.down}</span></div>
        <span class="dim small">{t.inBase ? 'in the base form' : t.carried ? `in ${t.carried} form${t.carried > 1 ? 's' : ''}` : 'not seen yet'}</span>
      </div>
    {/each}
    {#if !card.animal}
    <h3>Combos <span class="dim small">(two genes together open a niche)</span></h3>
    {/if}
    {#each card.animal ? [] : COMBOS as c (c.id)}
      <div class="stat" class:gold={game.combos.includes(c.id)} title={c.text}>
        <span>{c.name}</span><span class="small">{Object.entries(c.needs).map(([a, n]) => `${a} ${n! > 0 ? '+' : ''}${n}`).join(', ')}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .list { display: flex; flex-direction: column; gap: 4px; }
  .row { display: flex; gap: 10px; align-items: center; padding: 4px; border: 2px solid transparent; cursor: pointer; }
  .row.on { border-color: var(--edge); background: var(--panel-dark); }
  .name { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .forms { border-left: 2px solid var(--edge); margin-left: 22px; }
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
  p.small { margin: 0 0 6px; }
</style>
