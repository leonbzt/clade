<!-- Slice 20B: the equipment view. The creature large with its six places, the choices at the chosen place as
     trade-off cards, the same build at board size. A preview: the Life still starts from the verb picker until 20C. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { BODY_RULE, PLACES, PLACE_NAMES, type PlaceId, type PresetId, type Rows } from '../data/body';
  import { PARTS, PLANS, STYLES, type PartId, type PlanId } from '../data/life';
  import * as B from '../sim/body';
  import { makeEquipStage, type EquipStage } from '../view/equip-stage';
  import { homes, numbers, optionsAt, places, presetsOf, startDesign, verbName, type Option } from './equip';
  import { feel } from './feel';

  let { plan, carriedPart, origin, context, preset, size = 1, onclose }: {
    plan: PlanId; carriedPart?: PartId; origin: string; context: string; preset?: PresetId; size?: number; onclose: () => void;
  } = $props();

  let design: Rows = $state(startDesign(plan, preset));
  let carriedAt: PlaceId | null = $state(carriedPart ? homes(plan, carriedPart)[0] ?? null : null);
  let sel: PlaceId = $state('front'), hover: PartId | null = $state(null), presetOn: PresetId | null = $state(preset ?? null);
  let host: HTMLDivElement | undefined = $state();
  let grown = $state(untrack(() => size));
  let stage = $state.raw<EquipStage | null>(null);
  let pts = $state<Record<PlaceId, [number, number]> | null>(null);

  const carried = $derived(carriedPart && carriedAt ? { part: carriedPart, place: carriedAt } : undefined);
  const res = $derived(B.startBuild(plan, design, carried));
  const build = $derived(res.build);
  const shown = $derived({ ...build, size: grown });
  const view = $derived(places(plan, build, carried));
  const opts = $derived(optionsAt(plan, design, sel, carried));
  const nums = $derived(numbers(build));
  const legal = $derived(hover ? homes(plan, hover) : []);

  $effect(() => {
    if (!host) return;
    let alive = true, made: EquipStage | null = null;
    const el = host;
    makeEquipStage(el, untrack(() => shown), feel.pixel).then((s) => { if (alive) { made = s; stage = s; } else s.destroy(); });
    const ro = new ResizeObserver(() => { if (made) pts = made.points(); });
    ro.observe(el);
    return () => { alive = false; ro.disconnect(); made?.destroy(); stage = null; };
  });
  $effect(() => { if (stage) { stage.setBuild(shown); pts = stage.points(); } });
  $effect(() => { stage?.mark(sel, legal); });

  function choose(o: Option) {
    const next: Rows = { ...design };
    if (o.row) next[sel] = [...o.row]; else delete next[sel];
    design = next; presetOn = null;
  }
  function usePreset(p: PresetId) { design = startDesign(plan, p); presetOn = p; }
  /** Label spots in % of the stage; left-column labels hang from the left edge, right-column ones from the right. */
  const LABEL: Record<PlaceId, [number, number]> = { front: [50, 5], eyes: [2, 17], back: [98, 24], limbs: [2, 58], sides: [98, 58], tail: [42, 93] };
  const tagStyle = (p: PlaceId) => (LABEL[p][0] < 10 ? `left:${LABEL[p][0]}%;top:${LABEL[p][1]}%;transform:translateY(-50%)` : LABEL[p][0] > 90 ? `right:${100 - LABEL[p][0]}%;top:${LABEL[p][1]}%;transform:translateY(-50%)` : `left:${LABEL[p][0]}%;top:${LABEL[p][1]}%`);
  const presetName = (p: PresetId) => (p === 'hunter' ? 'Hunter' : STYLES[p].name);
  const trade = (o: Option) => [
    o.gained.length ? `gains ${o.gained.map(verbName).join(', ')}` : '', o.lost.length ? `loses ${o.lost.map(verbName).join(', ')}` : '',
    `upkeep ${nums.upkeep} → ${o.upkeepAfter}`,
  ].filter(Boolean).join(' · ');
  const was = $derived(build.rows[sel]?.length ? B.describeRow(build.rows[sel]!) : null);
</script>

<div class="metaWrap equipWrap"><div class="panel habCard equip">
  <div class="metaTop"><h2>{PLANS[plan].name} · equipment</h2><button class="small" onclick={onclose}>Back</button></div>
  <p class="note">{context}</p>
  <div class="equipGrid">
    <div class="stageBox" bind:this={host}>
      {#if pts}<svg class="leaders" aria-hidden="true">{#each PLACES as p}<line x1={`${LABEL[p][0] < 10 ? 12 : LABEL[p][0] > 90 ? 88 : LABEL[p][0]}%`} y1={`${LABEL[p][1]}%`} x2={pts[p][0]} y2={pts[p][1]} class:on={p === sel} />{/each}</svg>{/if}
      {#each view as v}
        <button class="placeTag {v.state}" class:on={v.place === sel} class:legal={legal.includes(v.place)} style={tagStyle(v.place)}
          aria-pressed={v.place === sel} onclick={() => (sel = v.place)}><b>{v.name}</b><small>{v.state === 'carried' ? `${v.holds} (carried)` : v.holds}</small></button>
      {/each}
      <span class="boardTag">board size</span>
    </div>
    <div class="sizes" role="group" aria-label="Preview size"><span class="hint">Size (a Life starts at 1)</span>{#each [1, 2, 3, 4, 5] as n}<button class="small" class:on={grown === n} aria-pressed={grown === n} onclick={() => (grown = n)}>{n}</button>{/each}</div>
    <div class="equipSide">
      <div class="chips">{#each presetsOf(plan) as p}<button class="chip" class:on={presetOn === p} onclick={() => usePreset(p)}>{presetName(p)}</button>{/each}</div>
      {#if carriedPart}
        <p class="note"><b>Carried: {PARTS[carriedPart].name}.</b> {origin} {PARTS[carriedPart].does}</p>
        {#if homes(plan, carriedPart).length > 1}
          <div class="chips">{#each homes(plan, carriedPart) as h}<button class="chip" class:on={carriedAt === h} onclick={() => (carriedAt = h)}>Put it in {PLACE_NAMES[h]}</button>{/each}</div>
        {/if}
      {/if}
      <h3>{PLACE_NAMES[sel]} <span class="hint">{view.find((v) => v.place === sel)?.lock ? `locked: ${view.find((v) => v.place === sel)?.lock}` : was ? `now: ${was}` : 'empty'}</span></h3>
      {#if view.find((v) => v.place === sel)?.state === 'unsupported'}
        <p class="note">This body has no part for this place yet.</p>
      {:else}
        <div class="pickList">
          {#each opts as o}
            <button class="verbCard" class:on={o.current} aria-current={o.current} onclick={() => { if (!o.current) choose(o); }}
              onpointerenter={() => (hover = o.row?.[o.row.length - 1] ?? null)} onpointerleave={() => (hover = null)} onfocus={() => (hover = o.row?.[o.row.length - 1] ?? null)} onblur={() => (hover = null)}>
              <b>{o.name}{o.current ? ' · now' : ''}</b>
              <small>{o.does}</small>
              <em>{o.verb ? `${o.verb} · ` : ''}upkeep {o.upkeep}{was && !o.current ? ` · replaces ${was}` : ''}</em>
              {#if !o.current}<em>{trade(o)}</em>{/if}
              {#each o.problems as p}<em class="bad">{p}</em>{/each}
            </button>
          {/each}
        </div>
      {/if}
      <div class="sum">
        <p><b>Verbs:</b> {nums.verbs.join(', ') || 'none'} <small>({nums.ceiling})</small></p>
        <p><b>Upkeep {nums.upkeep}</b> food a turn <small>= {nums.upkeepSum}</small></p>
        <p><small>{nums.move} · sense {nums.sense} · oxygen {nums.oxygen} · clutch {nums.clutch} at size 3</small></p>
        {#each res.problems as p}<p class="bad">{p}</p>{/each}
      </div>
      <p class="note">Preview of the new body. Until the cutover the Life still starts from the verb picker; at most {BODY_RULE.maxVerbs} verbs, Dash from walking legs is free.</p>
    </div>
  </div>
</div></div>

<style>
  .equipWrap { position: fixed; inset: 0; z-index: 30; overflow: auto; place-items: start center; }
  .equip { max-width: 980px; width: min(980px, 96vw); box-sizing: border-box; }
  .equipGrid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); grid-template-areas: 'stage side' 'sizes side'; gap: 8px 12px; align-items: start; }
  .stageBox { grid-area: stage; } .equipSide { grid-area: side; }
  .sizes { grid-area: sizes; display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
  .sizes .on { outline: 3px solid var(--gold); }
  .stageBox { position: relative; height: min(70vh, 560px); min-height: 360px; background: #0b2730; border: 3px solid var(--ink); overflow: hidden; }
  .stageBox :global(canvas) { position: absolute; inset: 0; }
  .leaders { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .leaders line { stroke: var(--brass); stroke-width: 1; opacity: 0.55; }
  .leaders line.on { stroke: var(--gold); opacity: 1; stroke-width: 2; }
  .placeTag { position: absolute; transform: translate(-50%, -50%); margin: 0; min-height: 34px; padding: 2px 8px; display: grid; text-align: center; line-height: 1.1; max-width: 40%; z-index: 1; }
  .placeTag small { color: var(--text); font-weight: 400; text-shadow: none; overflow-wrap: anywhere; }
  .placeTag.empty small, .placeTag.locked small, .placeTag.unsupported small { color: var(--dim); font-style: italic; }
  .placeTag.unsupported { opacity: 0.6; }
  .placeTag.on { outline: 3px solid var(--gold); }
  .placeTag.legal { outline: 3px solid var(--good); }
  .placeTag.carried small { color: var(--good); }
  .boardTag { position: absolute; right: 6px; bottom: 4px; color: var(--dim); text-shadow: var(--outline); pointer-events: none; }
  .equipSide { display: grid; gap: 8px; min-width: 0; }
  .equipSide h3 { margin: 4px 0 0; }
  .sum p { margin: 2px 0; }
  .bad { color: var(--red); }
  @media (max-width: 720px) {
    .equipGrid { grid-template-columns: 1fr; grid-template-areas: 'stage' 'sizes' 'side'; }
    .stageBox { height: 58vh; min-height: 320px; }
  }
</style>
