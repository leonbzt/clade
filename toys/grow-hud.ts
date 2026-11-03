// Grow toy (slices 00, 00b): the side panel. Its markup, the gene pips (with each gene's plus and minus) and the
// live readout. The run and the input: grow.ts.

import { GENES, HABITATS, PIPS, T, TARGETS, formOf, tierOf, type FormId, type Genes } from './grow-data';
import { score, stats, type Plant } from './grow-sim';
import { trunkRoom } from './grow-tree';
import { geneText, spotLabel } from './grow-verbs';
import type { World } from './grow-world';

const $ = (id: string) => document.getElementById(id)!;
const fmt = (v: number, d = 1) => (v >= 0 ? '+' : '') + v.toFixed(d);

export const HUD_HTML = `
  <h1>Toy: Grow a line</h1>
  <div class="muted" id="where"></div>
  <h2>Season <span id="season"></span></h2>
  <div class="bar"><div id="time"></div></div>
  <div class="target"><div><b id="tname"></b><div class="muted" id="tblurb"></div></div><div class="tier" id="tier"></div></div>
  <div class="row"><span>Score</span><b id="score"></b></div>
  <h2>Stocks <span class="muted">per s</span></h2>
  <div class="row"><span>Energy <span class="muted">leaves</span></span><span><b id="energy"></b> <span id="denergy"></span></span></div>
  <div class="row"><span>Water <span class="muted">roots</span></span><span><b id="water"></b> <span id="dwater"></span></span></div>
  <div class="row"><span>Nutrient <span class="muted">pays the verbs</span></span><span><b id="nutrient"></b> <span id="dnutrient"></span></span></div>
  <div id="wilt" class="warn"></div>
  <h2>Stats</h2>
  <div class="row" title="the top tip's height above ground"><span>Reach</span><span id="reach"></span></div>
  <div class="row" title="the crown's width"><span>Spread</span><span id="spread"></span></div>
  <div class="row" title="pockets a root sits in"><span>Roots</span><span id="roots"></span></div>
  <div class="row" title="mean stem thickness (Thickness gene, thickens with the leaves it carries; a tree adds wood)"><span>Toughness</span><span id="tough"></span></div>
  <div class="row" title="energy from leaves minus upkeep, per s"><span>Growth</span><span id="growth"></span></div>
  <div class="row" title="energy upkeep + water the leaves use, per s"><span>Upkeep</span><span id="upkeep"></span></div>
  <div class="row muted"><span>Biomass</span><span id="biomass"></span></div>
  <div class="row muted" id="roomrow" title="tree: thickness caps height; wood builds each winter"><span>Trunk carries</span><span id="room"></span></div>
  <h2>Verbs</h2>
  <label><input type="checkbox" id="verbs" checked> Verbs on <span class="muted">(off: the genes alone)</span></label>
  <div id="tools"><button data-tool="wake" class="on">Wake a bud [W]</button><button data-tool="cut">Cut [C]</button>
  <p class="muted">Wake: ${T.wakeCost} nutrient. Cut: some nutrient back, the buds below wake. Soil: click a seen
  cell near a root to dig there (hard soil costs double, stone can't be dug). Each preview shows its score change.</p></div>
  <h2>Speed</h2>
  <button data-speed="0">Pause</button><button data-speed="1" class="on">×1</button><button data-speed="4">×4</button><button data-speed="10">×10</button>
  <h2>Genes <span class="muted">more pips:</span></h2><div id="genes"></div>`;

/** Pips for a genome; ▲/▼ on the genes that changed from `from`; `pm` adds each gene's plus and minus. */
export function pips(g: Genes, changed: number[] = [], from?: Genes, pm = false) {
  return GENES.map((d, i) => {
    const cells = Array.from({ length: PIPS }, (_, k) => `<i class="${k < g[i] ? 'f' : ''}"></i>`).join('');
    const ch = changed.includes(i) && from ? `<b class="${g[i] > from[i] ? 'up' : 'down'}">${g[i] > from[i] ? '▲' : '▼'}</b>` : '';
    const line = pm ? `<div class="pm"><span class="up">+ ${d.plus}</span> <span class="down">− ${d.minus}</span></div>` : '';
    return `<div class="gene${ch ? ' ch' : ''}" title="${d.help} (${geneText(g, i)})"><span>${d.name}</span><span class="pips">${cells}</span>${ch}</div>${line}`;
  }).join('');
}

export interface View { plant: Plant; world: World; habitat: string; target: string; form: FormId; island: number; season: number; t: number; state: string }

export function updateHud(v: View) {
  const { plant, world } = v, s = stats(plant, world), f = plant.flow, tg = TARGETS.find((x) => x.id === v.target)!, sc = score(s, v.target);
  const F = formOf(v.form), hab = HABITATS.find((h) => h.id === v.habitat)!;
  $('where').textContent = `${F.name} · ${hab.name} · island ${v.island} · spot ${plant.spot + 1}, ${spotLabel(world, plant.spot)}`;
  const phase = { start: ' (pick below)', brood: v.form === 'tree' ? ', pick a seed' : ', pick the heir', end: ', done', winter: ', winter', grow: '' }[v.state] ?? '';
  $('season').textContent = v.state === 'start' ? '(pick below)' : `${v.season} / ${F.seasons}${phase}`;
  $('time').style.width = `${(100 * v.t) / F.seasonTicks}%`;
  $('tname').textContent = tg.name; $('tblurb').textContent = tg.blurb;
  $('tier').textContent = tierOf(sc); $('score').textContent = String(sc);
  $('energy').textContent = plant.energy.toFixed(1);
  $('denergy').textContent = fmt((f.energyIn - f.energyUp) * 10, 2);
  $('water').textContent = plant.water.toFixed(1);
  $('dwater').textContent = fmt((f.waterIn - f.waterUse) * 10, 2);
  $('nutrient').textContent = plant.nutrient.toFixed(1);
  $('dnutrient').textContent = fmt(f.nutrientIn * 10, 2);
  $('wilt').textContent = f.wilting ? 'Wilting: out of water, leaves work at a quarter. Find a water pocket.' : '';
  $('reach').textContent = `${Math.round(s.reach)} cm`;
  $('spread').textContent = `${Math.round(s.spread)} cm`;
  $('roots').textContent = `${s.roots} pockets · ${Math.round(s.depth)} cm deep`;
  $('tough').textContent = s.toughness.toFixed(2);
  $('growth').textContent = `${s.growth.toFixed(2)}/s`;
  $('upkeep').textContent = `${s.upkeep.toFixed(2)}/s`;
  $('biomass').textContent = `${s.biomass.toFixed(0)} g · ${s.leaves} leaves`;
  $('roomrow').style.display = v.form === 'tree' ? '' : 'none';
  if (v.form === 'tree') $('room').textContent = `${Math.round(trunkRoom(plant))} cm more`;
}
