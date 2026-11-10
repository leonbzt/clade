<!-- A habitat's card: its name, area, kind and neighbours (tap one to go there). -->
<script lang="ts">
  import type { Habitat } from '../sim/habitats';

  let { hab, all, select }: { hab: Habitat; all: Habitat[]; select: (id: number) => void } = $props();
</script>

<aside class="card">
  <button class="close" onclick={() => select(-1)}>×</button>
  <h2>{hab.name}</h2>
  <p>{hab.kind.depth} · {hab.kind.substrate} · {hab.kind.exposure}</p>
  <p>{hab.area.toLocaleString('en')} tiles</p>
  <h3>Neighbours</h3>
  <ul>
    {#each hab.neighbours as id, k (id)}
      <li><button onclick={() => select(id)}>{all[id].name}</button> <span>{hab.borders[k]}</span></li>
    {/each}
  </ul>
</aside>

<style>
  .card { position: absolute; left: 8px; bottom: 8px; max-width: min(360px, calc(100% - 16px)); max-height: calc(100% - 16px);
    overflow: auto; background: var(--panel); border: 2px solid var(--line); padding: 8px 12px; box-sizing: border-box; }
  h2, h3 { font-size: 16px; margin: 0 32px 4px 0; }
  h2 { font-weight: 700; }
  h3 { margin-top: 8px; color: var(--dim); font-weight: 400; }
  p { margin: 0 0 2px; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { display: flex; justify-content: space-between; gap: 12px; margin: 2px 0; }
  li button { background: none; border: 0; padding: 0; text-align: left; text-decoration: underline; }
  li span { color: var(--dim); }
  .close { position: absolute; top: 4px; right: 4px; padding: 0 8px; }
</style>
