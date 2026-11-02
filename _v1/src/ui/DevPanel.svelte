<script lang="ts">
  import { NUM } from '../data/numbers';
  import { GROUPS, ROLES } from '../data/roles';
  import { fit, profiles } from '../sim/fit';
  import { expected } from '../sim/metrics';
  import { slotAt } from '../sim/slots';
  import { at, bucketOf } from '../sim/tally';
  import { grams } from './format';
  import { defOf } from '../sim/variants';
  import { addBiomass, autoplay, game, perf, reset, skip, ui, unlockAll } from './game.svelte';

  const speeds = [0, 1, 10, 100];
  // Per living animal species: members, groups as a share of the cap, and what the curve model expects.
  const stats = $derived.by(() => {
    ui.v;
    const P = profiles(game), slow = game.agents.filter((a) => a.slow).length;
    const rows = game.species.flatMap((x, sp) => {
      const b = defOf(game, sp).animal;
      if (!b || !game.count[sp]) return [];
      return [{ name: x.name, members: game.members[sp], groups: game.count[sp], cap: Math.round((100 * game.count[sp]) / b.cap), exp: expected(game, P, sp) }];
    });
    return { rows, agents: game.agents.length, slow: Math.round((100 * slow) / (game.agents.length || 1)), ms: perf.ms.toFixed(2) };
  });

  // The chosen place's slots: raw size and use per minute, the last window (made, taken), and a worth preview to test
  // a gains formula: size (against the role's largest) × the holder's share × its mean fit over the place, × 100.
  const slots = $derived.by(() => {
    ui.v;
    const p = ui.place, B = game.board;
    if (p < 0 || p >= game.habitats.length) return null;
    const P = profiles(game), tiles: number[] = [];
    for (let i = 0; i < game.place.length; i++) if (bucketOf(game, i) === p) tiles.push(i);
    const rows = ROLES.flatMap((r, k) => {
      const sl = slotAt(game, p, k);
      if (!sl.exists) return [];
      let max = 0;
      for (let q = 0; q < game.habitats.length; q++) max = Math.max(max, slotAt(game, q, k).size);
      const f = sl.v >= 0 ? tiles.reduce((a, i) => a + fit(game, P[sl.v], i), 0) / tiles.length : 0;
      let took = 0;
      if (r.food >= 0) for (let g = 0; g < GROUPS; g++) took += B.last[at(p, r.food, 1 + g)];
      return [{ name: r.name, g: sl.grams, size: sl.size, use: sl.use, made: r.food >= 0 ? B.last[at(p, r.food, 0)] : NaN, took: r.food >= 0 ? took : NaN,
        worth: Math.round(100 * (sl.size / (max || 1)) * Math.min(1, sl.share) * f) }];
    });
    return { name: game.habitats[p].name, rows, perTick: (B.ms / (NUM.slots.window * NUM.ticksPerSec)).toFixed(4), ms: B.ms.toFixed(2) };
  });
  // The books in grams over the last minute (ledger.ts): plants, litter and animals, what flowed in and out, and the gap.
  const books = $derived.by(() => {
    ui.v;
    const L = game.ledger.last;
    return { ...L, off: L.stock ? `${((100 * L.gap) / L.stock).toFixed(3)}%` : '–' };
  });
  const num = (v: number) => (Number.isNaN(v) ? '–' : v >= 100 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toPrecision(2));
</script>

<div class="panel dev">
  <h3>Dev panel</h3>
  <div>Speed {#each speeds as s (s)}<button class:on={ui.speed === s} onclick={() => (ui.speed = s)}>{s ? `×${s}` : 'Pause'}</button>{/each}</div>
  <div>Skip <button onclick={() => skip(60)}>1 min</button><button onclick={() => skip(600)}>10 min</button></div>
  <div>Bot plays <button onclick={() => autoplay(300)}>5 min</button><button onclick={() => autoplay(900)}>15 min</button></div>
  <div><button onclick={() => addBiomass(1000 * NUM.cost)}>+{grams(1000 * NUM.cost)} biomass</button><button onclick={() => addBiomass(10000 * NUM.cost)}>+{grams(10000 * NUM.cost)}</button><button onclick={unlockAll}>Unlock all</button></div>
  <div><button onclick={reset}>New island</button><button onclick={() => console.log(game)}>Log state</button></div>
  {#if stats.rows.length}
    <table class="small">
      <tbody>
        <tr class="dim"><td></td><td>members</td><td>groups</td><td>cap</td><td>expected</td></tr>
        {#each stats.rows as r (r.name)}<tr><td>{r.name}</td><td>{r.members}</td><td>{r.groups}</td><td>{r.cap}%</td><td>{r.exp ?? '–'}</td></tr>{/each}
      </tbody>
    </table>
  {/if}
  {#if slots}
    <table class="small">
      <tbody>
        <tr class="dim"><td>{slots.name}</td><td>grams</td><td>size/min</td><td>use</td><td>made</td><td>taken</td><td>worth</td></tr>
        {#each slots.rows as r (r.name)}<tr><td>{r.name}</td><td>{grams(r.g)}</td><td>{num(r.size)}</td><td>{Math.round(r.use * 100)}%</td><td>{num(r.made)}</td><td>{num(r.took)}</td><td>{r.worth}</td></tr>{/each}
      </tbody>
    </table>
    <p class="dim">slot update {slots.ms} ms a window · {slots.perTick} ms/tick</p>
  {/if}
  <p class="dim">ledger/min: made {grams(books.prod)} · came {grams(books.came)} · burnt {grams(books.burn)} · decay {grams(books.decay)} (inside: eaten {grams(books.eaten)}, dropped {grams(books.dropped)}) · gap {books.off} of {grams(books.stock)}, animals {grams(books.animals)}</p>
  <p class="dim">{game.habitats.filter((h) => h.alive && h.shown).length} habitats, {game.habitats.filter((h) => h.alive && h.tier === 1).length} patches · {game.board.heads} headlines · {game.board.lines} chatter · {game.board.renames} renames</p>
  <p class="dim">{stats.agents} agents · {stats.slow}% settled · {stats.ms} ms/tick · window.dev.dump()</p>
</div>

<style>
  .dev { position: fixed; right: 12px; bottom: 12px; display: flex; flex-direction: column; gap: 6px; z-index: 10; }
  h3 { margin: 0; }
  p { margin: 0; font-size: 13px; }
  table { border-collapse: collapse; }
  td { padding: 0 6px 0 0; text-align: right; }
  td:first-child { text-align: left; }
</style>
