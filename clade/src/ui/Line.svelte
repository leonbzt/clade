<!-- N3 H: the line view, from the map bar. Name, level, XP, points and job; the line's species as a family tree
     (where each lives, its letter there); the parts the line carries, with their rank and +1 rank while a point is left. -->
<script lang="ts">
  import { LINE_JOBS } from '../data/lines';
  import { barOf, pointsOf } from '../sim/line';
  import type { CladeId, Lineage, PartId, World } from '../sim/records';
  import { carriedParts, familyOf, type FamilyNode } from '../view/line';
  import XpBar from './XpBar.svelte';

  let { world, line, spend, back }: { world: World; line: Lineage; spend: (part: PartId) => void; back: () => void } = $props();
  const family = $derived(familyOf(world, line));
  const parts = $derived(carriedParts(world, line));
  const points = $derived(pointsOf(line));
  const bar = $derived(barOf(line.xp));
  const ORDER = 'SABCDF';
  function where(homes: FamilyNode['homes']) {
    if (!homes.length) return 'gone';
    if (homes.length <= 2) return homes.map((h) => `${h.name} ${h.letter}`).join(' · ');
    const best = homes.reduce((a, b) => (ORDER.indexOf(b.letter) < ORDER.indexOf(a.letter) ? b : a));
    return `${homes.length} habitats · best ${best.letter} in ${best.name}`;
  }
</script>

{#snippet node(n: FamilyNode)}
  <li>
    <b>{n.species.name}</b>
    <span class="dim">{where(n.homes)}</span>
    {#if n.children.length}<ul>{#each n.children as c (c.species.id)}{@render node(c)}{/each}</ul>{/if}
  </li>
{/snippet}

<div class="shade">
  <div class="line" role="dialog" aria-modal="true" aria-labelledby="line-title" tabindex="-1">
    <h2 id="line-title">{line.clade[0].toUpperCase() + line.clade.slice(1)} line · level {bar.level}</h2>
    <p class="dim">Its job: {LINE_JOBS[line.job as CladeId] ?? line.job}.</p>
    <XpBar from={line.xp} to={line.xp} />
    <p>{#if points > 0}<b class="gold">{points} point{points === 1 ? '' : 's'} to spend</b>{:else}No points left · a level gives one{/if}</p>
    <h3>Species</h3>
    <ul class="tree">{#each family as n (n.species.id)}{@render node(n)}{/each}</ul>
    <h3>Parts carried</h3>
    {#each parts as p (p.id)}
      <div class="part">
        <span><b>{p.name}</b> · rank {p.rank}/{p.cap}<small class="dim">upkeep {p.upkeep}{p.upkeep < p.base ? ` (was ${p.base})` : ''}{p.rank ? ` · +${p.rank} Enforce cap` : ''}</small></span>
        <button disabled={points <= 0 || p.rank >= p.cap} onclick={() => spend(p.id)}>+1 rank</button>
      </div>
    {:else}<p class="dim">No parts yet: hatch a child with one.</p>{/each}
    <div class="actions"><button onclick={back}>Back to the map</button></div>
  </div>
</div>

<style>
  .shade { position: absolute; inset: 0; display: grid; place-items: start center; grid-template-columns: minmax(0, 1fr); padding: 12px; box-sizing: border-box; background: var(--line); overflow: auto; z-index: 5; }
  .line { background: var(--panel); border: 2px solid var(--paper); padding: 16px; width: 100%; max-width: 440px; min-width: 0; box-sizing: border-box; display: grid; gap: 8px; }
  h2, h3 { font-size: 16px; margin: 0; }
  h3 { margin-top: 8px; color: var(--dim); font-weight: 400; }
  p { margin: 0; }
  .dim { color: var(--dim); }
  .gold { color: var(--gold); }
  ul { list-style: none; margin: 0; padding-left: 16px; }
  .tree { padding-left: 0; }
  li { margin: 4px 0; }
  li > span { display: block; }
  li ul { border-left: 2px solid var(--line); }
  .part { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .part small { display: block; font: inherit; }
  .part button:disabled { opacity: 0.5; cursor: default; }
  .actions { margin-top: 8px; }
</style>
