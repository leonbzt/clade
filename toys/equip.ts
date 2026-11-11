// 20B check page: mounts the game's equipment view outside the flow, for any body, carried part and preset.
import 'pixi.js/unsafe-eval';
import { mount } from 'svelte';
import Equip from '../game/src/ui/Equip.svelte';
import { skin } from '../game/src/ui/skin';
import type { PartId, PlanId } from '../game/src/data/life';
import type { PresetId } from '../game/src/data/body';

const q = new URLSearchParams(location.search);
skin();
mount(Equip, {
  target: document.getElementById('root')!,
  props: {
    plan: (q.get('body') ?? 'arthropod') as PlanId, carriedPart: (q.get('carry') ?? undefined) as PartId | undefined,
    preset: (q.get('preset') ?? undefined) as PresetId | undefined, size: +(q.get('size') ?? 1),
    origin: 'From your last clutch, patch 4.', context: 'Patch 4 · Mud flat (check page).', onclose: () => location.reload(),
  },
});
