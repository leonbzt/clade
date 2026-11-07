<!-- The Menu (slice 15): a friend's species code, your own codes, and the save as text (copy, paste, a new sea). -->
<script lang="ts">
  import { HABITATS } from '../data/habitats';
  import { tierName } from '../sim/garden';
  import { bump, ctx, ui } from './meta.svelte';

  let text = $state(''), msg = $state(''), sure = $state(false);
  const lines = $derived.by(() => {
    void ui.tick;
    const sea = ctx.save.sea;
    return sea.species.flatMap((sp, k) => {
      if (!sp.line) return [];
      const p = [...sea.patches].sort((a, b) => b.fit[k] - a.fit[k] || a.id - b.id)[0];
      return p.fit[k] > 0 ? [{ patch: p.id, species: sp.id, name: sp.name, hab: p.ground, tier: tierName(p.ground, p.fit[k]) }] : [];
    });
  });
  const copy = (s: string, what: string) => { text = s; msg = `${what} is in the box: copy it from there.`; navigator.clipboard?.writeText(s).then(() => (msg = `${what} copied.`), () => (msg = `${what} is in the box: copy it from there.`)); };
</script>

{#if ui.menu}
<div class="metaWrap">
  <div class="panel habCard">
    <div class="metaTop"><h2>Menu</h2><button class="small" onclick={() => (ui.menu = false)}>Close</button></div>
    <h3>Species codes</h3>
    <p class="pitch">Share a starting creature design: body, a carried form and verbs. Pasted designs still need an eligible patch and a Life; their scores add no eggs or animals.</p>
    {#each lines as l}
      <button class="liveBtn" onclick={() => copy(ctx.code(l.patch, l.species), 'The code')}>Copy: {l.name}, {HABITATS[l.hab].name.toLowerCase()} {l.tier}</button>
    {:else}<p class="note">No lines yet: live a Life first.</p>{/each}
    <textarea bind:value={text} rows="3" placeholder="Paste a code or a save here"></textarea>
    <div class="row2"><button onclick={() => { msg = ctx.paste(text); }}>Load design</button><button onclick={() => { msg = ctx.importSave(text); }}>Load save</button></div>
    <h3>Save</h3>
    <div class="row2"><button onclick={() => copy(ctx.exportSave(), 'Your save')}>Copy save</button><button onclick={() => { const b = ctx.backup(); if (b) copy(b, 'The backup'); else msg = 'No backup kept.'; }}>Copy backup</button></div>
    <button class={sure ? 'go' : ''} onclick={() => { if (!sure) { sure = true; msg = 'Tap again to start a new sea. Copy your save first if you want to keep it.'; return; } if (!ctx.reset()) { msg = ui.saveError; return; } sure = false; ui.menu = false; ui.hab = null; bump(); }}>New sea</button>
    {#if msg}<p class="note">{msg}</p>{/if}
  </div>
</div>
{/if}
