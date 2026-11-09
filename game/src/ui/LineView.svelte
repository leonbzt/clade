<!-- Slice 21B: the line's close-up. The level track with its unlocks and end point, the XP bar, a species drawn with
     its six slots (tap one: the line's parts that fit there, their ranks, and points to spend on them), the species
     list, and the recipes this line can meet. It replaces 21A's plain list. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { PLACE_NAMES, type PlaceId, type Rows } from '../data/body';
  import { LINEAGES, UPGRADES } from '../data/lineages';
  import { PARTS, VERBS, type PartId, type PlanId } from '../data/life';
  import * as B from '../sim/body';
  import { upgradesFor } from '../sim/lineage';
  import { places } from './equip';
  import { asLarva, childrenOf, partsAt, placeCount, rankText, recipeText, slotUpkeep, track } from './line';
  import { ctx, ui } from './meta.svelte';
  import Creature from './Creature.svelte';
  import PartIcon from './PartIcon.svelte';
  import Slots from './Slots.svelte';
  import XpBar from './XpBar.svelte';

  let { plan }: { plan: PlanId } = $props();
  const line = $derived((ui.tick, { ...ctx.save.lines[plan]! })); // a fresh object per tick: the rules mutate the saved one
  let pick = $state(0), sel: PlaceId = $state('front');
  const shownRows = $derived<Rows>(line.species[pick]?.rows ?? B.defaultBuild(plan).rows);
  const build = $derived(asLarva(plan, shownRows, line.ranks));
  const views = $derived(places(plan, build));
  const here = $derived(partsAt(plan, line, sel));
  const offers = $derived((ui.tick, upgradesFor(plan, line)));
  $effect(() => { void plan; untrack(() => { sel = (views.find((v) => v.state !== 'unsupported' && partsAt(plan, line, v.place).length)?.place ?? 'front'); }); });

  const pips = (p: PartId) => {
    const rs = line.ranks[p] ?? [], ups = UPGRADES.filter((u) => u.part === p);
    const max = (ups.some((u) => u.rank !== 'signature') ? 1 : 0) + (ups.some((u) => u.rank === 'signature') ? 1 : 0);
    return { has: Math.min(max, (rs.some((r) => r !== 'signature') ? 1 : 0) + (rs.includes('signature') ? 1 : 0)), max };
  };
  const upkeepNow = (p: PartId) => B.partUpkeep(build, p);
  const later = (p: PartId) => track(plan, line).find((t) => t.part === p && !t.reached)?.n;
  const locked = $derived(track(plan, line).filter((t) => t.part && !t.reached && B.homesOf(plan, t.part).includes(sel)));
</script>

<div class="metaWrap lineWrap"><div class="panel habCard lineView">
  <div class="metaTop"><h2>{LINEAGES[plan].name} line</h2><button class="small" onclick={() => (ui.line = null)}>{ui.tree ? 'Tree of life' : 'Map'}</button></div>
  <XpBar to={line.xp} />
  <ol class="levels" aria-label="Level track">
    {#each track(plan, line) as t}
      <li class:reached={t.reached} title={t.end ? `Level ${t.n}: ${t.end}` : t.part ? `Level ${t.n}: unlocks ${PARTS[t.part].name}` : `Level ${t.n}: +1 point`}>
        <small>{t.n}</small>
        {#if t.part}<PartIcon id={t.part} size={18} />{:else if t.end}<span class="star">★</span>{:else}<span class="dot"></span>{/if}
      </li>
    {/each}
  </ol>
  <p class="note">Level 10 makes this line {LINEAGES[plan].endPoint}. Each level gives a point. <b class="pts">{line.points} point{line.points === 1 ? '' : 's'} to spend.</b></p>
  <div class="grid">
    <Creature {build} mark={sel} height={300}>
      <Slots rows={build.rows} buds={build.buds} {views} {sel} upkeep={slotUpkeep(build)} onpick={(p) => (sel = p)} />
    </Creature>
    <div class="side">
      <h3>{PLACE_NAMES[sel]} <span class="hint">· {here.length ? `${here.length} part${here.length > 1 ? 's' : ''} your line can grow here` : 'nothing your line can grow here yet'}</span></h3>
      <div class="pickList">
        {#each here as p}
          {@const pp = pips(p)}
          <div class="verbCard partCard rankCard">
            <span class="ic"><PartIcon id={p} size={24} /></span>
            <b>{PARTS[p].name} <span class="pips">{#each Array(pp.max) as _, k}<i class:on={k < pp.has}></i>{/each}</span></b>
            <em>{PARTS[p].does}{PARTS[p].verb ? ` Verb: ${VERBS[PARTS[p].verb!].name}.` : ''} Upkeep {upkeepNow(p)}.</em>
            {#each rankText(p, line.ranks) as r}<em class="rank">{r}</em>{/each}
            <span class="buys">
              {#each offers.filter((o) => o.u.part === p) as { u, why }}
                <button class="small" disabled={!!why} title={why ?? ''} onclick={() => ctx.buy(plan, u.id)}>{u.rank[0].toUpperCase() + u.rank.slice(1)} · {u.cost} pt{u.cost > 1 ? 's' : ''}<small>{u.does.replace(`${PARTS[p].name}: `, '')}</small></button>
              {/each}
            </span>
          </div>
        {/each}
        {#each locked as t}<p class="note">Level {t.n}: {PARTS[t.part!].name}</p>{/each}
      </div>
    </div>
  </div>
  <h3>Species</h3>
  <div class="chips">
    {#each line.species as sp, k}<button class="chip" class:on={pick === k} onclick={() => (pick = k)}>{sp.name} <small>· {placeCount(plan, sp.rows)} · tier {sp.tier}</small></button>
    {:else}<p class="note">None yet: a Life that lays eggs saves its plan, plus the gene you keep. Its next larva regrows that plan from buds.</p>{/each}
  </div>
  {#each childrenOf(plan) as id}
    <p class="note">{ctx.save.lines[id] ? `Opened: ${LINEAGES[id].name}.` : `Locked: ${LINEAGES[id].name}. ${recipeText(id)}`}{!ctx.save.lines[id] && LINEAGES[id].recipe!.parts.some((x) => !line.parts.includes(x)) ? ` Still to unlock: ${LINEAGES[id].recipe!.parts.filter((x) => !line.parts.includes(x)).map((x) => `${PARTS[x].name}${later(x) ? ` (level ${later(x)})` : ''}`).join(', ')}.` : ''}</p>
  {/each}
</div></div>

<style>
  .lineView .metaTop { flex-wrap: wrap; }
  .lineWrap { position: fixed; inset: 0; z-index: 30; overflow: auto; place-items: start center; }
  .lineView { max-width: 900px; width: min(900px, 96vw); box-sizing: border-box; }
  .levels { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 3px; }
  .levels li { display: grid; justify-items: center; gap: 2px; padding: 3px 0; background: #241c12; border: 2px solid var(--ink); opacity: 0.55; }
  .levels li.reached { opacity: 1; background: #4a3d2c; border-color: var(--brass); }
  .levels small { font-size: 16px; color: var(--dim); }
  .levels .dot { width: 6px; height: 6px; margin: 6px; background: var(--edge); }
  .levels .star { color: var(--gold); line-height: 18px; }
  .pts { color: var(--gold); }
  .grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
  .side { display: grid; gap: 8px; min-width: 0; }
  .side h3 .hint { color: var(--dim); font-weight: 400; }
  .rankCard em.rank { color: var(--good); }
  .pips { display: inline-flex; gap: 3px; margin-left: 6px; vertical-align: middle; }
  .pips i { width: 10px; height: 10px; background: var(--ink); border: 2px solid var(--edge); }
  .pips i.on { background: var(--gold); }
  .buys { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .buys button { display: grid; text-align: left; }
  .buys button small { color: var(--dim); font-size: 16px; font-weight: 400; text-shadow: none; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
</style>
