// The plain pick screen (slice 09, until the island exists in slice 13): a board and a body, then Start. Each board
// card shows a small map and your best tier there this visit, per body.
import { PLANS, type PlanId } from '../data/life';
import { CELL, HABITATS, HAB_ORDER, type HabitatId } from '../data/habitats';

const $ = (id: string) => document.getElementById(id)!;
const INK: Record<string, string> = { sand: '#c9b884', mud: '#524233', rock: '#3f434a', dead: '#7a5e36', mat: '#6f8f37', buried: '#d9861f', shell: '#ede4cb', carcass: '#d99a82', bloom: '#ded38e' };
const ASH = '#4c483d';

function thumb(id: HabitatId) {
  const h = HABITATS[id], k = 6, cv = document.createElement('canvas');
  cv.width = h.map[0].length * k; cv.height = h.map.length * k; cv.className = 'thumb';
  const g = cv.getContext('2d')!;
  h.map.forEach((row, y) => [...row].forEach((c, x) => {
    const [t, node] = CELL[c];
    g.fillStyle = t === 'sand' && h.ground === 'basalt' ? ASH : INK[t]; g.fillRect(x * k, y * k, k, k);
    if (node) { g.fillStyle = INK[node]; g.fillRect(x * k + 1, y * k + 1, k - 2, k - 2); }
  }));
  return cv;
}

export class Pick {
  hab: HabitatId = 'mud';
  plan: PlanId = 'worm';
  best = new Map<string, string>(); // `${hab}:${plan}` → tier, this visit
  private onStart: (hab: HabitatId, plan: PlanId) => void = () => {};

  constructor() { $('pickGo').onclick = () => { this.hide(); this.onStart(this.hab, this.plan); }; }

  get open() { return !$('pick').hidden; }
  hide() { $('pick').hidden = true; }

  show(onStart: (hab: HabitatId, plan: PlanId) => void) {
    this.onStart = onStart;
    this.render();
    $('pick').hidden = false;
  }

  record(hab: HabitatId, plan: PlanId, tier: string) {
    const order = HABITATS[hab].tiers.map(([t]) => t), key = `${hab}:${plan}`, old = this.best.get(key);
    if (!old || order.indexOf(tier) < order.indexOf(old)) this.best.set(key, tier);
  }

  private render() {
    const habs = $('pickHabs'), plans = $('pickPlans');
    habs.innerHTML = ''; plans.innerHTML = '';
    for (const id of HAB_ORDER) {
      const h = HABITATS[id], b = document.createElement('button');
      b.className = 'pickCard' + (id === this.hab ? ' on' : '');
      const best = (['worm', 'arthropod'] as PlanId[]).map((p) => `${PLANS[p].name} ${this.best.get(`${id}:${p}`) ?? '–'}`).join(' · ');
      b.innerHTML = `<span class="txt"><b>${h.name}</b><small>${h.blurb}</small><em>Best: ${best}</em></span>`;
      b.prepend(thumb(id));
      b.onclick = () => { this.hab = id; this.render(); };
      habs.appendChild(b);
    }
    for (const id of ['worm', 'arthropod'] as PlanId[]) {
      const p = PLANS[id], b = document.createElement('button');
      b.className = 'pickCard plan' + (id === this.plan ? ' on' : '');
      b.innerHTML = `<span class="txt"><b>${p.name}</b><small>${p.blurb}</small></span>`;
      b.onclick = () => { this.plan = id; this.render(); };
      plans.appendChild(b);
    }
  }
}
