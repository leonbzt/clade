<script lang="ts">
  // The clades: reached ones with your species as leaves (nested by who they came from; extinct ones as fossils),
  // open ones with their requirements. A door shows its recipe, the closest variant and the candidates, and once the
  // key has appeared, a button to split that variant off.
  import { KEYS } from '../data/genes';
  import { SPECIES, SPECIES_INDEX } from '../data/species';
  import { keyProgress } from '../sim/keys';
  import { zoneColor } from '../view/overlays';
  import { speciesLook } from '../view/look';
  import { TREE, doorKey } from '../data/tree';
  import { canEvolve, canFoundSpecies, reqStatus, splitCost, suggestName } from '../sim/commands';
  import Specimen from './Specimen.svelte';
  import { doEvolve, game, startFounding, startPlacing, ui } from './game.svelte';
  import { fmt } from './format';

  const depth = (id: string | null): number => {
    const n = TREE.find((t) => t.id === id);
    return n?.parent ? 1 + depth(n.parent) : 0;
  };

  /** The species of this base, each after the one it was founded from, with its depth. A clade's first species
   * (split off from another clade) is a root here. */
  function leaves(base: number) {
    const mine = game.species.map((x, sp) => ({ x, sp })).filter((o) => o.x.base === base);
    const out: { sp: number; name: string; depth: number; tiles: number; dead: boolean; color: string; id: string }[] = [];
    const isRoot = (parent: number) => (m: (typeof mine)[number]) =>
      parent < 0 ? m.x.parent < 0 || game.species[m.x.parent].base !== base : m.x.parent === parent;
    const walk = (parent: number, depth: number) => {
      for (const o of mine.filter(isRoot(parent))) {
        out.push({ sp: o.sp, id: o.x.id, name: o.x.name, depth, tiles: game.count[o.sp], dead: o.x.at >= 0 && !game.count[o.sp], color: zoneColor(game, o.sp) });
        walk(o.sp, depth + 1);
      }
    };
    walk(-1, 0);
    return out;
  }

  const nodes = $derived.by(() => {
    ui.v;
    return TREE.map((n) => {
      const reached = game.reached.includes(n.id);
      const open = !n.parent || game.reached.includes(n.parent), gene = doorKey(n), key = gene ? KEYS.find((k) => k.id === gene)! : null;
      const door = key && open && !reached ? keyProgress(game, key) : null;
      return {
        ...n, depth: depth(n.id), reached, open,
        can: canEvolve(game, n.id).ok,
        // Requirements stay met once reached.
        reqs: n.reqs.filter((r) => r.kind !== 'key').map((r) => {
          const st = reqStatus(game, r);
          return { ...st, met: st.met || game.ready.includes(n.id) };
        }),
        key, door, split: door && door.carrier >= 0 ? { v: door.carrier, can: canFoundSpecies(game, door.carrier), cost: splitCost(game, door.carrier) } : null,
        leaves: n.species && reached ? leaves(SPECIES_INDEX[n.species]) : [],
        speciesName: n.species ? SPECIES[SPECIES_INDEX[n.species]].name : null,
        short: n.species ? SPECIES[SPECIES_INDEX[n.species]].short.toLowerCase() : null,
        placed: n.species ? game.foundings[n.species] > 0 : false,
      };
    });
  });
</script>

<div class="tree">
  {#each nodes as n (n.id)}
    <div class="node" class:reached={n.reached} class:locked={!n.open} style:margin-left="{n.depth * 18}px">
      <div class="head">
        {#if n.species && n.reached}<Specimen look={speciesLook(game, SPECIES_INDEX[n.species])} scale={1} size={32} />{/if}
        <b>{n.reached ? '✔ ' : ''}{n.name}</b>
      </div>
      {#if n.reached}
        <p class="dim fact">{n.fact}</p>
        {#if n.species && !n.placed && !n.key}
          <button class="go" onclick={() => { startPlacing(n.species!); ui.tab = 'species'; ui.tree = false; }}>Found {n.speciesName} on the island</button>
        {/if}
        {#each n.leaves.filter((l) => l.tiles || l.dead) as l (l.sp)}
          <button class="leaf" class:dead={l.dead} style:margin-left="{l.depth * 14}px"
            onclick={() => { ui.focus = l.id; ui.tab = 'species'; ui.tree = false; }}>
            <span class="dot" style:background={l.dead ? 'transparent' : l.color}></span>{l.depth ? '└ ' : ''}{l.dead ? '† ' : ''}{l.name}
            <span class="dim">{l.dead ? 'extinct' : `${l.tiles} tiles`}</span>
          </button>
        {/each}
      {:else if !n.open}
        <p class="dim">Reach its parent first.</p>
      {:else}
        {#each n.reqs as r (r.text)}
          <div class="req" class:met={r.met}>
            <span>{r.met ? '✔' : '○'} {r.text}</span><span>{Math.min(r.have, r.need)} / {r.need}</span>
          </div>
        {/each}
        {#if n.key && n.door}
          <div class="pre">What makes {n.name.toLowerCase()}: a variant that carries
            {#each n.door.items as p (p.text)}<div class:met={p.met}>{p.met ? '✔' : '○'} {p.text}</div>{/each}
            <div class:met={n.door.carrier >= 0}>{n.door.carrier >= 0 ? '✔' : '○'} then the {n.key.name.toLowerCase()} <span class="dim">(only candidates roll it)</span></div>
            {#if n.door.carrierName}<div class="gold">{n.door.carrierName} has it!</div>
            {:else if n.door.candidates.length}<div class="gold">Candidates: {n.door.candidates.join(', ')}</div>
            {:else}<div class="dim">Closest now: {n.door.best ?? 'none shown yet'}</div>{/if}
          </div>
          {#if n.split}
            <button class="go" disabled={!n.split.can.ok} title={n.split.can.ok ? '' : n.split.can.reason}
              onclick={() => { startFounding(n.split!.v, suggestName(game, n.split!.v)); ui.tab = 'species'; ui.tree = false; }}>
              Split it off as the first {n.short} · {fmt(n.split.cost)} biomass
            </button>
          {/if}
        {:else}
          <button class="go" disabled={!n.can} onclick={() => doEvolve(n.id)}>
            Evolve{n.cost ? ` · ${fmt(n.cost)} biomass` : ''}
          </button>
        {/if}
      {/if}
    </div>
  {/each}
</div>

<style>
  .tree { display: flex; flex-direction: column; gap: 6px; }
  .node { padding: 6px 8px; background: var(--panel-dark); border: 2px solid var(--ink); border-left: 4px solid var(--edge); }
  .node.reached { border-left-color: var(--good); }
  .node.locked { opacity: 0.5; }
  .head { display: flex; gap: 8px; align-items: center; }
  .fact { margin: 4px 0; font-size: 14px; }
  .req { display: flex; justify-content: space-between; font-size: 15px; }
  .req.met { color: var(--good); }
  .go { margin-top: 6px; width: 100%; }
  .leaf { display: flex; gap: 6px; align-items: center; width: calc(100% - 4px); margin: 2px 0; padding: 2px 6px; font-size: 14px;
    background: var(--panel); text-align: left; }
  .leaf .dim { margin-left: auto; }
  .leaf.dead { opacity: 0.6; }
  .dot { width: 9px; height: 9px; border: 1px solid var(--dim); flex: none; }
  .pre { font-size: 13px; margin: 2px 0 4px 14px; }
  .pre .met { color: var(--good); }
  p { margin: 4px 0; }
</style>
