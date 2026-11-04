// Toy: a Life, v2, the page. Fixed maps, no sim: pick a habitat from the strip, and the eggs add up. toys/garden.html is the living version.
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import { PARTS, PLANS, RULE, type PlanId } from './life2-data';
import { HABITATS, HAB_ORDER, type HabitatId } from './life2-habitats';
import { finish, foraging, habRec, newLife, newLineage, tierOf, type Lineage } from './life2-sim';
import { mountLife } from './life2-ui';
import { GARDEN_H, GARDEN_W, drawGarden, gardenAt, icon } from './life2-view';

const $ = (id: string) => document.getElementById(id)!;
const gardenCv = $('garden') as HTMLCanvasElement, gg = gardenCv.getContext('2d')!;
gardenCv.width = GARDEN_W; gardenCv.height = GARDEN_H;

const KEY = 'clade-life-toy-2';
function load(): Lineage {
  try { return { ...newLineage(), ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return newLineage(); }
}
function save(v: Lineage) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* the toy still plays */ } }

let lineage = load(), habId: HabitatId = 'reef', gardenHover = -1;
const life = mountLife($('lifeView'), {
  board: () => HABITATS[habId],
  lineage: () => lineage,
  over: (l) => { lineage = finish(l); save(lineage); },
  leave: () => toGarden(),
});
const enter = (id: HabitatId) => { habId = id; $('gardenView').hidden = true; $('toGarden').hidden = false; life.open(); };
function toGarden() { life.close(); $('gardenView').hidden = false; $('toGarden').hidden = true; renderGarden(); }
const boards = () => HAB_ORDER.map((id) => newLife(1, 'worm', lineage, HABITATS[id]));

function renderGarden() {
  drawGarden(gg, boards(), gardenHover);
  const habs = $('habs');
  habs.innerHTML = '';
  HAB_ORDER.forEach((id, k) => {
    const h = HABITATS[id], rec = habRec(lineage, id), f = document.createElement('div');
    f.className = 'frame hab';
    f.innerHTML = `<div><div><h2 class="sh1">${h.name}</h2><div class="muted">${h.blurb}</div>
      <div class="muted threats">${h.predator} from turn ${h.predatorAt}${h.event.name ? ` · ${h.event.name}: turns ${h.event.from}–${h.event.to}` : ''}</div>
      <div>Population: <b class="e">${rec.pop}</b> <span class="muted">eggs from ${rec.lives} Lives</span></div>
      <div class="list"></div><div class="muted found"></div><button class="big">Live here</button></div></div>`;
    const list = f.querySelector('.list')!;
    (Object.keys(PLANS) as PlanId[]).forEach((p) => {
      const best = rec.best[p], row = document.createElement('div'), tier = best ? tierOf(h, best.eggs) : '–';
      row.className = 'rec';
      row.innerHTML = `<span class="mini" data-t="${tier}">${tier}</span><span>${PLANS[p].name}${best ? ` <span class="muted">${best.eggs} eggs</span>` : ''}</span>`;
      if (best) {
        const icons = document.createElement('span'); icons.className = 'icons';
        best.parts.forEach((part) => { const c = document.createElement('canvas'); icon(c, part, 18); c.title = PARTS[part].name; icons.append(c); });
        row.append(icons);
      }
      list.append(row);
    });
    const rares = [...new Set([...h.rares.arthropod, ...h.rares.worm])];
    f.querySelector('.found')!.innerHTML = `Rare here: ${rares.map((part) => (lineage.rare.includes(part) ? `<span class="passed">${PARTS[part].name}</span>` : '???')).join(' · ')}`;
    f.querySelector('button')!.onclick = () => enter(id);
    f.onmouseenter = () => { if (gardenHover !== k) { gardenHover = k; drawGarden(gg, boards(), k); } };
    habs.append(f);
  });
  const fl = foraging(lineage.xp);
  $('lineage').innerHTML = `Foraging ${fl}${fl < 2 ? ` (${lineage.xp}/${RULE.foragingAt} food eaten; level 2 opens sponge gardens)` : ''} · ${lineage.lives} Lives<br>`
    + `Passed on: ${lineage.rare.length ? lineage.rare.map((part) => `<span class="passed">${PARTS[part].name}</span>`).join(', ') : 'nothing yet'}`;
}

const pos = (e: MouseEvent) => { const b = gardenCv.getBoundingClientRect(); return Math.floor(((e.clientX - b.left) / b.width) * GARDEN_W); };
gardenCv.onmousemove = (e) => { const k = gardenAt(pos(e)); if (k !== gardenHover) { gardenHover = k; drawGarden(gg, boards(), k); } };
gardenCv.onclick = (e) => enter(HAB_ORDER[gardenAt(pos(e))]);
$('toGarden').onclick = toGarden;
$('reset').onclick = () => { lineage = newLineage(); save(lineage); renderGarden(); };
toGarden();
