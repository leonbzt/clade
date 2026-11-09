// The saved terminal result moves through placement, hatching, then XP. Keep this flow out of main.
import { gainText } from '../sim/lineage';
import { placePending, settlePending } from '../sim/sea-life';
import type { SeaPending } from '../sim/sea-save';
import { bump, ctx, ui } from './meta.svelte';

export function afterLife(persist: () => boolean) {
  function settle(p: SeaPending, card = -1) {
    const gain = settlePending(ctx.save, p, card);
    if (!gain) return;
    persist();
    ui.feedback = { patch: p.place ?? p.patch, species: p.species, eggs: p.eggs, gain: gainText(gain) };
    ui.gain = gain; ui.clutch = null; ui.placing = false; ui.open = true;
    ui.hab = null; ui.patch = null; ui.niche = null; bump();
  }

  function hatch(p: SeaPending) {
    ui.placing = false; ui.patch = null;
    if (!p.cards.length) { settle(p); return; }
    ui.clutch = p; bump();
    ctx.keep = (k) => settle(p, k);
  }

  return (p: SeaPending) => {
    ui.open = true; ui.hab = null; ui.niche = null; ui.feedback = null;
    if (p.eggs > 0 && p.place === undefined) {
      ui.placing = true; ui.patch = p.patch; bump();
      ctx.place = (patch) => {
        if (!placePending(ctx.save, p, patch)) return;
        persist(); hatch(p);
      };
    } else hatch(p);
  };
}
