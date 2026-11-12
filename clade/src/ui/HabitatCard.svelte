<!-- The tapped habitat: its slots and residents, recent ecology, ground and neighbours. -->
<script lang="ts">
  import { ADOPT_EGGS } from '../data/economy';
  import { css } from '../data/palette';
  import { colonise as purposeOf, noPrey } from '../sim/found';
  import { isLifeBuild } from '../sim/life';
  import { bodyMass } from '../sim/fitness';
  import type { Habitat } from '../sim/habitats';
  import type { Ranks, Species, World } from '../sim/records';
  import { heldSlots, predictions } from '../view/tiers';
  import { homeLabel, reasonFor, senders, yoursHere } from '../view/home';
  import type { Frame } from './history';
  import HistoryGraph from './HistoryGraph.svelte';
  import TierCard from './TierCard.svelte';

  let { hab, world, history, select, picked, ranks = {}, place, colonise, send, adopt }: {
    hab: Habitat; world: World; history: Frame[]; select: (id: number) => void;
    picked?: Species; ranks?: Ranks; place?: () => void; colonise?: () => void; send?: (s: Species) => void; adopt?: (s: Species) => void;
  } = $props();
  // Adopt: a wild species with a Life, in a habitat you can see (yours or a target).
  const seen = $derived(homeLabel(world, hab).kind !== 'fog');
  const wild = $derived(adopt && seen ? world.species.filter((s) => s.lineage === null && (hab.pops[s.id] ?? 0) > 0 && isLifeBuild(s.build)) : []);
  const mine = $derived(yoursHere(world, hab));
  const sent = $derived(picked ? [] : senders(world, hab));
  const purpose = $derived(picked && isLifeBuild(picked.build) ? purposeOf(world, hab, picked) : null);
  const held = $derived(heldSlots(hab, world));
  const preview = $derived(picked ? predictions(picked.build, ranks, hab, world) : []);
</script>

<aside class="card">
  <button class="close" onclick={() => select(-1)}>×</button>
  <h2>{hab.name}</h2>
  <p>{hab.kind.depth} · {hab.kind.substrate} · {hab.kind.exposure}</p>
  <p>{hab.area.toLocaleString('en')} tiles</p>
  {#if picked}
    <section class="placement" aria-label="Placement preview">
      <h3>Preview · {picked.name}</h3>
      {#each preview as { slot } (slot.id)}
        <h3 style:color={css(slot.accent)}>{slot.name}</h3>
        <TierCard build={picked.build} {ranks} {slot} {hab} {world} name={picked.name} />
      {:else}<p>No food slot here</p>{/each}
      <button class="place" onclick={place} disabled={(hab.pops[picked.id] ?? 0) > 0}>{(hab.pops[picked.id] ?? 0) > 0 ? 'Already here' : 'Place · 20 heads'}</button>
      {#if purpose}<button class="place" onclick={colonise} title={purpose.text}>{purpose.holder ? `Challenge ${purpose.holder.species.name} (${purpose.holder.letter})` : 'Colonise'}</button>
      {:else if noPrey(world, hab, picked)}<p class="empty">No prey here for a hunter.</p>{/if}
    </section>
    <h3>Holders</h3>
  {:else}
    {#if mine.length}
      <h3 class="gold">Yours here</h3>
      {#each mine as m (m.species.id)}<p><b class="gold">{m.letter}</b> {m.species.name} · {m.slot.toLowerCase()}</p>{/each}
    {/if}
    {#if sent.length}
      <section class="placement" aria-label="Colonise">
        <h3>Colonise from a neighbour</h3>
        {#each sent as s (s.species.id)}
          <button class="send" onclick={() => send?.(s.species)} title={s.purpose.text}>
            {#if s.purpose.holder}Challenge {s.purpose.holder.species.name} ({s.purpose.holder.letter}) · your {s.species.name} <b>{s.purpose.fit.letter}</b>
            {:else}<b>{s.purpose.fit.letter}</b> {s.species.name}{/if} from {s.from.name}<small>{s.purpose.slot.name.toLowerCase()} · {s.purpose.holder ? `${s.purpose.holder.species.name} holds it` : reasonFor(world, hab, s.species)}</small></button>
        {/each}
      </section>
    {/if}
    <h3>Holders</h3>
  {/if}
  {#each held as { slot, holders } (slot.id)}
    <h3 style:color={css(slot.accent)}>{slot.name}</h3>
    {#each holders as { species, ranks } (species.id)}
      <TierCard build={species.build} {ranks} {slot} {hab} {world} name={species.name} />
      <p class="population">{Math.round(hab.pops[species.id] / bodyMass(species.build)).toLocaleString('en')} heads · {Math.round(hab.pops[species.id]).toLocaleString('en')} g</p>
    {:else}<p class="empty">Unheld</p>{/each}
  {/each}
  {#if wild.length}
    <h3>Wild here</h3>
    {#each wild as s (s.id)}
      {#if noPrey(world, hab, s)}<p class="empty">{s.name}: no prey here for a hunter.</p>
      {:else}<button class="send" onclick={() => adopt?.(s)}>Adopt {s.name}<small>play a Life as it; lay {ADOPT_EGGS} eggs and it joins your line</small></button>{/if}
    {/each}
  {/if}
  <HistoryGraph {hab} {world} {history} />
  <h3>Neighbours</h3>
  <ul>
    {#each hab.neighbours as id, k (id)}
      <li><button onclick={() => select(id)}>{world.habitats[id].name}</button> <span>{hab.borders[k]}</span></li>
    {/each}
  </ul>
</aside>

<style>
  .card { position: absolute; left: 8px; bottom: 8px; width: 360px; max-width: calc(100% - 16px); max-height: calc(100% - 16px);
    overflow: auto; background: var(--panel); border: 2px solid var(--line); padding: 8px 12px; box-sizing: border-box; }
  h2, h3 { font-size: 16px; margin: 0 32px 4px 0; }
  h2 { font-weight: 700; }
  h3 { margin-top: 8px; color: var(--dim); font-weight: 400; }
  p { margin: 0 0 2px; }
  .population, .empty { color: var(--dim); }
  .population { margin: 2px 0 6px 10px; }
  .placement { border-bottom: 2px solid var(--line); padding-bottom: 8px; }
  .place { margin-top: 8px; }
  button:disabled { color: var(--dim); cursor: default; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { display: flex; justify-content: space-between; gap: 12px; margin: 2px 0; }
  li button { background: none; border: 0; padding: 0; text-align: left; text-decoration: underline; }
  li span { color: var(--dim); }
  .gold { color: var(--gold); }
  .send { display: block; width: 100%; text-align: left; margin-top: 6px; }
  .send small { display: block; font: inherit; color: var(--dim); }
  .close { position: absolute; top: 4px; right: 4px; padding: 0 8px; }
</style>
