import { KIT, SLOT_NAMES, STAT_NAMES, type KitId, type KitNode, type Rung, type StatId } from '../../data/kit';
import { PARTS } from '../../data/parts';
import * as K from '../../sim/kit';
import { kitStats } from '../../sim/kit-stats';
import type { Life } from '../../sim/life';
import type { Place } from '../../sim/records';

const adds = (rung: Rung) => Object.entries(rung.adds).map(([stat, n]) => `+${n} ${stat}`).join(' · ');

export function kitHud(life: Life, play: boolean, on: { spend: (id: KitId) => void; point: () => void }) {
  const kit = life.kit!, list = document.getElementById('enforce')!;
  document.getElementById('enforceHeading')!.textContent = `Build · ${kit.points} points`;
  list.replaceChildren();
  const stats = kitStats(kit, life.lost), line = document.createElement('p');
  line.textContent = (Object.keys(STAT_NAMES) as StatId[]).map((stat) => `${STAT_NAMES[stat]} ${stats[stat]}`).join(' · ');
  list.appendChild(line);
  const cost = K.pointCost(life), point = document.createElement('button');
  point.textContent = cost === null ? 'Point · all bought' : `Point · ${cost} food`;
  point.disabled = !play || !K.canBuyPoint(life); point.onclick = on.point; list.appendChild(point);

  function row(node: KitNode) {
    const state = K.kitState(life, node.id), rung = kit.rungs[node.id] ?? 0;
    const b = document.createElement('button'), note = document.createElement('small');
    b.textContent = node.rungs[Math.max(0, rung - 1)].name;
    switch (state.k) {
      case 'open':
        note.textContent = `${state.by === 'plan' ? 'planned' : node.rare ? 'rare offer' : 'offered'} · ${adds(node.rungs[0])}`;
        break;
      case 'grown':
        note.textContent = state.rung < state.cap
          ? `next: ${node.rungs[state.rung].name} ${adds(node.rungs[state.rung])}`
          : state.rung < node.rungs.length
            ? `deeper at level ${KIT.rungCap.findIndex((cap) => cap > state.rung) + 1}` : 'full';
        break;
      case 'wait': note.textContent = 'not offered'; break;
      case 'locked': note.textContent = `level ${state.level}`; break;
      case 'shut': note.textContent = state.why; break;
    }
    b.classList.toggle('grown', state.k === 'grown');
    b.classList.toggle('offer', kit.offer.includes(node.id));
    b.classList.toggle('rare', !!node.rare);
    b.dataset.kit = node.id;
    b.disabled = !play || !K.canSpend(life, node.id); b.onclick = () => on.spend(node.id);
    b.appendChild(note); list.appendChild(b);
  }
  const nodes = K.kitOf(life);
  for (const place of Object.keys(SLOT_NAMES) as Place[]) {
    const parts = nodes.filter((node) => node.kind === 'part' && PARTS[node.id].place === place);
    if (!parts.length) continue;
    const h = document.createElement('h3'); h.textContent = SLOT_NAMES[place]; list.appendChild(h);
    parts.forEach(row);
  }
  const h = document.createElement('h3'); h.textContent = 'Traits'; list.appendChild(h);
  nodes.filter((node) => node.kind === 'trait').forEach(row);
}
