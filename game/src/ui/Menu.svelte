<!-- The Menu (slice 15): a friend's species code, your own codes, and the save as text (copy, paste, a new island). -->
<script lang="ts">
  import { ROLES, ROLE_IDS } from '../data/garden';
  import { HABITATS, HAB_ORDER } from '../data/habitats';
  import { tierName } from '../sim/garden';
  import { bump, ctx, ui } from './meta.svelte';

  let text = $state(''), msg = $state(''), sure = $state(false);
  const lines = $derived((void ui.tick, HAB_ORDER.flatMap((hab) => ROLE_IDS.flatMap((role) => {
    const e = ctx.save.garden.habs[hab].entries.find((x) => x.line && x.role === role);
    return e ? [{ hab, role, name: e.name, tier: tierName(hab, e.score) }] : [];
  }))));
  const copy = (s: string, what: string) => { text = s; navigator.clipboard?.writeText(s).then(() => (msg = `${what} copied.`), () => (msg = `${what} is in the box: copy it from there.`)); };
</script>

{#if ui.menu}
<div class="metaWrap">
  <div class="panel habCard">
    <div class="metaTop"><h2>Menu</h2><button class="small" onclick={() => (ui.menu = false)}>Close</button></div>
    <h3>Species codes</h3>
    <p class="pitch">Share a line of yours on the Discord; paste a friend's code and their species joins your garden, to beat.</p>
    {#each lines as l}
      <button class="liveBtn" onclick={() => copy(ctx.code(l.hab, l.role), 'The code')}>Copy: {l.name}, {ROLES[l.role].name}, {HABITATS[l.hab].name.toLowerCase()} {l.tier}</button>
    {:else}<p class="note">No lines yet: live a Life first.</p>{/each}
    <textarea bind:value={text} rows="3" placeholder="Paste a code or a save here"></textarea>
    <div class="row2"><button onclick={() => { msg = ctx.paste(text); }}>Add species</button><button onclick={() => { msg = ctx.importSave(text); }}>Load save</button></div>
    <h3>Save</h3>
    <div class="row2"><button onclick={() => copy(ctx.exportSave(), 'Your save')}>Copy save</button><button onclick={() => { const b = ctx.backup(); if (b) copy(b, 'The backup'); else msg = 'No backup kept.'; }}>Copy backup</button></div>
    <button class={sure ? 'go' : ''} onclick={() => { if (!sure) { sure = true; msg = 'Tap again to start a new island. Copy your save first if you want to keep it.'; return; } ctx.reset(); sure = false; ui.menu = false; ui.hab = null; bump(); }}>New island</button>
    {#if msg}<p class="note">{msg}</p>{/if}
  </div>
</div>
{/if}
