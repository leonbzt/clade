<!-- The island and its habitats (slice 13): the map, a card per habitat with its niche rows (open and contested first,
     news underneath), the loadout before a Life, and what happened while you were away. -->
<script lang="ts">
  import { ROLES, ROLE_IDS, type Role } from '../data/garden';
  import { HABITATS, HAB_ORDER, type HabitatId } from '../data/habitats';
  import { HUNT, MAX_VERBS, PARTS, PLANS, RULE, STYLES, STYLE_VERBS, VERBS, VERB_IDS, VERB_PART, type GrazerId, type PlanId, type StyleId, type VerbId } from '../data/life';
  import { BODY_FOR } from '../sim/door';
  import { capacity, rowOf, tierName } from '../sim/garden';
  import { newLife, partsFor, startParts } from '../sim/life';
  import { drawIsland, spotAt } from '../view/islandmap';
  import { bump, ctx, ui } from './meta.svelte';

  let cv: HTMLCanvasElement | undefined = $state();
  let verbs: VerbId[] = $state([...STYLE_VERBS.digger]);
  let note = $state('');
  let body: PlanId | null = $state(null);
  let carry = $state(true);
  const g =$derived((ui.tick, ctx.save.garden));
  const TINK: Record<string, string> = { S: '#ffe033', A: '#7fd14e', B: '#5ec4d6', C: '#f3e9cc', D: '#c9a26a', F: '#ff6a4c' };

  /** A niche row, as the card shows it: who's there, and the call to action. */
  function niche(id: HabitatId, role: Role) {
    void ui.tick;
    const h = g.habs[id], row = rowOf(h, role), cap = capacity(h)[role] || 1, mine = row.find((e) => e.line), top = row[0];
    const beat = row.find((e) => !e.line);
    const state = !mine ? 'open' : mine === top ? 'held' : 'contested';
    const call = !mine ? `None of yours.${beat ? ` Rank to beat: ${tierName(id, beat.score)}.` : ' Empty!'}`
      : mine === top ? `Yours lead at ${tierName(id, mine.score)}.${role === 'predator' ? ' They hunt your grazers and burrowers here now.' : ''}` : `Yours rank ${tierName(id, mine.score)}; ${top.name} hold ${tierName(id, top.score)}.`;
    return { role, state, call, rows: row.map((e) => ({ e, tier: tierName(id, e.score), bar: Math.min(1, e.pop / cap) })) };
  }
  const order = { open: 0, contested: 1, held: 2 };
  const niches = (id: HabitatId) => ROLE_IDS.map((r) => niche(id, r)).sort((a, b) => order[a.state as keyof typeof order] - order[b.state as keyof typeof order]);
  const openCount = (id: HabitatId) => ROLE_IDS.filter((r) => niche(id, r).state !== 'held').length;
  const best = (id: HabitatId) => { void ui.tick; const t = ROLE_IDS.map((r) => ctx.save.best[`${id}:${r}`]).filter(Boolean) as string[]; return t.sort((a, b) => 'SABCDF'.indexOf(a) - 'SABCDF'.indexOf(b))[0] ?? '–'; };
  const habNews = (id: HabitatId) => { void ui.tick; return g.news.filter((n) => n.hab === id).slice(0, 6); };

  $effect(() => {
    void ui.tick; void ui.hab;
    if (cv) drawIsland(cv, ctx.isl, ctx.spots, { scale: 4, selected: ui.hab, labels: Object.fromEntries(HAB_ORDER.map((id) => [id, `${HABITATS[id].name} ${best(id)}`])) });
  });

  function tapMap(e: MouseEvent) {
    if (!cv) return;
    const r = cv.getBoundingClientRect(), tx = Math.floor(((e.clientX - r.left) / r.width) * ctx.isl.w), ty = Math.floor(((e.clientY - r.top) / r.height) * ctx.isl.h);
    const id = spotAt(ctx.spots, tx, ty);
    if (id) openHab(id);
  }
  function openHab(id: HabitatId) { ui.hab = id; ui.niche = null; }
  const defaults = (role: Role) => [...STYLE_VERBS[role === 'grazer' ? 'sweeper' : 'digger']];
  function live(role: Role, as: PlanId | null = null) { ui.niche = role; body = as; note = ''; carry = true; verbs = roomFor(defaults(role)); }

  const plan: PlanId = $derived(body ?? (ui.niche ? BODY_FOR[ui.niche] : 'worm'));
  // the form you kept here: on the body unless you leave it behind this Life, or it doesn't fit this body
  const form = $derived.by(() => { void ui.tick; return ui.hab && ui.niche ? ctx.save.forms[`${ui.hab}:${ui.niche}`] : undefined; });
  const formFits = $derived(!!form && PARTS[form].plans.includes(plan));
  const carried = $derived(carry && formFits ? form : undefined);
  function fits(vs: VerbId[]) {
    const parts = startParts(plan, vs, carried), l = newLife(1, plan, HABITATS[ui.hab ?? 'mud'], parts);
    return l.order.length === parts.length && new Set(parts.map((p) => PARTS[p].verb).filter(Boolean)).size <= MAX_VERBS;
  }
  /** As many of these verbs as the body has room for, in order; if none fit, the first verb that does. */
  function roomFor(vs: VerbId[]) {
    const out: VerbId[] = [];
    for (const v of vs) if (fits([...out, v])) out.push(v);
    if (!out.length) { const v = VERB_IDS.find((q) => fits([q])); if (v) out.push(v); }
    return out;
  }
  function toggle(v: VerbId) {
    note = '';
    if (verbs.includes(v)) { if (verbs.length > 1) verbs = verbs.filter((q) => q !== v); else note = 'Keep at least one verb.'; return; }
    const next = [...verbs, v];
    if (next.length > MAX_VERBS) { note = 'Three verbs at most: drop one first.'; return; }
    if (!fits(next)) { note = `No room: ${PARTS[partsFor(plan, [v])[0]].name} needs a slot your form or another verb's part already takes, or you're at three verbs.`; return; }
    verbs = next;
  }
  function pickStyle(s: StyleId) {
    verbs = roomFor([...STYLE_VERBS[s]]);
    note = STYLES[s].blurb + (verbs.length < STYLE_VERBS[s].length ? ' Your form holds a slot one of its verbs needs.' : '');
  }
  function toggleCarry() { carry = !carry; note = ''; if (ui.niche) verbs = roomFor(defaults(ui.niche)); }
  const upkeep = $derived(RULE.baseUpkeep + startParts(plan, verbs, carried).reduce((n, p) => n + PARTS[p].upkeep, 0));
  function start() { if (ui.hab && ui.niche) ctx.start(ui.hab, ui.niche, verbs, plan, carried); }
</script>

{#if ui.open}
<div id="meta" class="panel">
  <div class="metaTop"><h2>Clade</h2><span class="gen">Gen {g.gen}</span><button class="small" onclick={() => { ctx.skip(); bump(); }}>Skip +10</button><button class="small" onclick={() => (ui.menu = true)}>Menu</button></div>
  <canvas bind:this={cv} class="isle" onclick={tapMap}></canvas>
  <div class="habList">
    {#each HAB_ORDER as id}
      <button class="habBtn" onclick={() => openHab(id)}>
        <b>{HABITATS[id].name}</b><span class="tierChip" style:color={TINK[best(id)] ?? '#c2b08a'}>{best(id)}</span>
        <small>{openCount(id) ? `${openCount(id)} niche${openCount(id) > 1 ? 's' : ''} to take` : 'you lead every niche'}</small>
      </button>
    {/each}
  </div>
  <h3>News</h3>
  <ul class="news">
    {#each g.news.slice(0, 8) as n}<li class:yours={n.yours}>{n.text}<small>{n.why}</small></li>{:else}<li><small>Nothing yet. Pick a habitat and live there.</small></li>{/each}
  </ul>
</div>
{/if}

{#if ui.open && ui.hab}
{@const id = ui.hab}
<div class="metaWrap">
  <div class="panel habCard">
    <div class="metaTop"><h2>{HABITATS[id].name}</h2><button class="small" onclick={() => (ui.hab = null)}>Map</button></div>
    {#if !ui.niche}
      <p class="pitch">{HABITATS[id].pitch}</p>
      {#each niches(id) as n}
        <div class="niche {n.state}">
          <div class="nHead"><b>{ROLES[n.role].call}</b><span>{n.call}</span></div>
          {#each n.rows as r}
            <div class="sp" class:mine={!!r.e.line}><i style:color={TINK[r.tier]}>{r.tier}</i><span>{r.e.name}{r.e.proven ? '' : ' (unproven)'}</span><em><u style:width={`${Math.round(r.bar * 100)}%`}></u></em></div>
          {/each}
          {#if ctx.save.forms[`${id}:${n.role}`]}<div class="form">Your form here: {PARTS[ctx.save.forms[`${id}:${n.role}`]].name}</div>{/if}
          <button class="liveBtn" onclick={() => live(n.role)}>Live it as {BODY_FOR[n.role] === "arthropod" ? "an" : "a"} {PLANS[BODY_FOR[n.role]].name.toLowerCase()}</button>
          {#if n.role === 'grazer' && ctx.save.unlocks.trilobite}<button class="liveBtn" onclick={() => live(n.role, 'trilobite')}>Live it as a trilobite</button>{/if}
        </div>
      {/each}
      <h3>News here</h3>
      <ul class="news">{#each habNews(id) as n}<li class:yours={n.yours}>{n.text}<small>{n.why}</small></li>{:else}<li><small>Quiet so far.</small></li>{/each}</ul>
    {:else}
      <p class="pitch"><b>{ROLES[ui.niche].call}</b> in the {HABITATS[id].name.toLowerCase()}: you live it as a {PLANS[plan].name.toLowerCase()}. {PLANS[plan].blurb}</p>
      {#if form}
        <div class="form">
          {#if formFits}<button class="chip" class:on={carry} onclick={toggleCarry}>{carry ? 'Carrying' : 'Leaving behind'}: {PARTS[form].name}</button> <small>{PARTS[form].does} Holds the {PARTS[form].slots.join(' or ')} slot.</small>
          {:else}Your form here, {PARTS[form].name}, doesn't fit this body.{/if}
        </div>
      {/if}
      {#if plan === 'swimmer'}
        <div class="rules"><b>The hunter's rules</b><small><b>Lurk</b> a turn: prey don't notice you, and your next swim goes {HUNT.ambush}× as far.</small><small><b>Frenzy</b>: +1 speed for each catch in a row.</small></div>
      {:else}
        <h3>Verbs <span class="hint">pick 1–3 · each grows its part</span></h3>
        <div class="chips">{#each Object.keys(STYLES) as StyleId[] as s}<button class="chip" class:on={STYLE_VERBS[s].every((v) => verbs.includes(v)) && verbs.length === 2} onclick={() => pickStyle(s)}>{STYLES[s].name}</button>{/each}</div>
        <div class="pickList two">
          {#each VERB_IDS as v}
            {@const part = PARTS[VERB_PART[plan as GrazerId][v]]}
            <button class="verbCard" class:on={verbs.includes(v)} onclick={() => toggle(v)}><b>{VERBS[v].name}</b><small>{VERBS[v].does}</small><em>{part.name} · upkeep {part.upkeep} · {VERBS[v].free ? 'free' : 'your turn'}, every {VERBS[v].recharge}</em></button>
          {/each}
        </div>
        <div class="note">{note || `${verbs.length} of ${MAX_VERBS} verbs · upkeep ${upkeep} food a turn at the start.`}</div>
      {/if}
      <div class="row2"><button onclick={() => (ui.niche = null)}>Back</button><button class="go" onclick={start}>Start the Life</button></div>
    {/if}
  </div>
</div>
{/if}

{#if ui.notice}
<div class="metaWrap">
  <div class="panel habCard">
    <h2>{ui.notice.title}</h2>
    <p class="pitch">{ui.notice.text}</p>
    <button class="go" onclick={() => (ui.notice = null)}>Back to the island</button>
  </div>
</div>
{/if}

{#if ui.away}
<div class="metaWrap">
  <div class="panel habCard">
    <h2>While you were away</h2>
    <p class="pitch">{ui.away.gens} generation{ui.away.gens === 1 ? '' : 's'} passed in the garden.</p>
    <ul class="news">{#each ui.away.news.slice(0, 10) as n}<li class:yours={n.yours}>{n.text}<small>{n.why}</small></li>{:else}<li><small>Nothing much changed.</small></li>{/each}</ul>
    <button class="go" onclick={() => (ui.away = null)}>Back to the island</button>
  </div>
</div>
{/if}
